import type { VercelRequest, VercelResponse } from "@vercel/node";
import { loadConfig } from "../src/config.js";
import { FEED_SOURCES } from "../src/feeds.js";
import { fetchAllFeeds } from "../src/fetcher.js";
import { filterRecentArticles } from "../src/filter.js";
import { generateBriefing } from "../src/llm.js";
import { sendBriefing } from "../src/telegram.js";

/**
 * Main serverless endpoint — triggered daily by Vercel Cron.
 *
 * Pipeline: Fetch RSS → Filter 24h → LLM Briefing → Telegram Delivery
 */
export default async function handler(
    req: VercelRequest,
    res: VercelResponse
): Promise<void> {
    const startTime = Date.now();

    try {
        // ── Guard: Only allow GET requests ────────────────────────────
        if (req.method !== "GET") {
            res.status(405).json({ error: "Method not allowed" });
            return;
        }

        const config = loadConfig();

        // ── Guard: Authenticate the request ───────────────────────────
        // Accepts EITHER:
        //   1. Vercel Cron's built-in header (automatic on Vercel)
        //   2. Authorization: Bearer <CRON_SECRET> (for manual/curl testing)
        const isVercelCron =
            req.headers["x-vercel-signature"] !== undefined;
        const bearerToken = req.headers["authorization"]?.replace(
            "Bearer ",
            ""
        );
        const isValidBearer =
            config.cronSecret && bearerToken === config.cronSecret;

        if (!isVercelCron && !isValidBearer) {
            console.warn(
                `🚫 Unauthorized request from ${req.headers["x-forwarded-for"] || "unknown"}`
            );
            res.status(401).json({ error: "Unauthorized" });
            return;
        }

        console.log("🚀 RayAI — Starting daily AI briefing pipeline...");
        console.log(`📋 Processing ${FEED_SOURCES.length} feed sources`);

        // ── Step 1: Fetch all RSS feeds ──────────────────────────────
        const { items, feedsFailed } = await fetchAllFeeds(FEED_SOURCES);

        if (items.length === 0) {
            console.warn("⚠️  No items fetched from any feed. Sending fallback.");
            await sendBriefing(
                "☀️ *RayAI — Your AI Morning Read*\n\n" +
                "Quiet day in AI news! All feeds returned empty or were unreachable. " +
                "Check back tomorrow for your briefing. 🌙",
                config
            );
            res.status(200).json({
                status: "ok",
                message: "No items found, fallback sent",
                duration: `${Date.now() - startTime}ms`,
            });
            return;
        }

        // ── Step 2: Filter to last 24 hours & deduplicate ────────────
        const recentArticles = filterRecentArticles(items, 24);

        if (recentArticles.length === 0) {
            console.warn("⚠️  No recent articles found. Sending fallback.");
            await sendBriefing(
                "☀️ *RayAI — Your AI Morning Read*\n\n" +
                `Fetched from ${FEED_SOURCES.length - feedsFailed} feeds but found no new articles in the last 24 hours. ` +
                "The AI world is taking a breather. 😴",
                config
            );
            res.status(200).json({
                status: "ok",
                message: "No recent articles, fallback sent",
                duration: `${Date.now() - startTime}ms`,
            });
            return;
        }

        // ── Step 3: Generate briefing via LLM ────────────────────────
        console.log(
            `🧠 Sending ${recentArticles.length} articles to ${config.llmProvider}...`
        );
        const briefingText = await generateBriefing(recentArticles, config);

        // ── Step 4: Deliver via Telegram ─────────────────────────────
        await sendBriefing(briefingText, config);

        // ── Done ─────────────────────────────────────────────────────
        const duration = Date.now() - startTime;
        console.log(`🎉 Pipeline complete in ${(duration / 1000).toFixed(1)}s`);

        res.status(200).json({
            status: "ok",
            articlesProcessed: recentArticles.length,
            feedsProcessed: FEED_SOURCES.length - feedsFailed,
            feedsFailed,
            llmProvider: config.llmProvider,
            briefingLength: briefingText.length,
            duration: `${duration}ms`,
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error(`❌ Pipeline failed: ${message}`);

        res.status(500).json({
            status: "error",
            error: message,
            duration: `${Date.now() - startTime}ms`,
        });
    }
}
