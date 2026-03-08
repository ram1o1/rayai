import Parser from "rss-parser";
import type { FeedSource, FeedItem } from "./types.js";

const parser = new Parser({
    timeout: 10_000, // 10s per feed
    headers: {
        "User-Agent": "RayAI/1.0 (AI News Aggregator)",
    },
});

/**
 * Fetch and parse all RSS feeds in parallel.
 * Individual feed failures are logged and skipped gracefully.
 */
export async function fetchAllFeeds(
    sources: FeedSource[]
): Promise<{ items: FeedItem[]; feedsFailed: number }> {
    let feedsFailed = 0;

    const results = await Promise.allSettled(
        sources.map(async (source) => {
            try {
                const feed = await parser.parseURL(source.url);
                return (feed.items || []).map((item): FeedItem => {
                    return {
                        title: cleanText(item.title || "Untitled"),
                        description: cleanText(
                            item.contentSnippet || item.content || item.summary || ""
                        ).slice(0, 500), // Cap description length
                        link: item.link || "",
                        pubDate: item.pubDate ? new Date(item.pubDate) : new Date(0),
                        sourceName: source.name,
                        category: source.category,
                    };
                });
            } catch (error) {
                const message =
                    error instanceof Error ? error.message : String(error);
                console.warn(`⚠️  Failed to fetch "${source.name}": ${message}`);
                feedsFailed++;
                return [];
            }
        })
    );

    const items: FeedItem[] = [];
    for (const result of results) {
        if (result.status === "fulfilled") {
            items.push(...result.value);
        } else {
            feedsFailed++;
        }
    }

    console.log(
        `📡 Fetched ${items.length} total items from ${sources.length - feedsFailed}/${sources.length} feeds`
    );

    return { items, feedsFailed };
}

/**
 * Strip HTML tags and normalize whitespace.
 */
function cleanText(text: string): string {
    return text
        .replace(/<[^>]*>/g, "") // Remove HTML tags
        .replace(/&nbsp;/g, " ")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/\s+/g, " ") // Normalize whitespace
        .trim();
}
