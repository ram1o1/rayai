import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";
import type { FeedItem } from "./types.js";
import type { Config } from "./config.js";

const SYSTEM_PROMPT = `You are an expert tech journalist writing a daily AI morning briefing called "☀️ RayAI — Your AI Morning Read".

I will provide you with a list of AI news headlines and short descriptions from the last 24 hours. Your job is to synthesize this into a single, cohesive morning briefing that can be read in about 5 minutes.

Rules:
1. Group related stories together under thematic sections (e.g., "🔬 Research Breakthroughs", "🚀 Product Launches", "💼 Industry Moves", "🛠️ Open Source & Tools", "📊 Policy & Ethics").
2. Highlight the most impactful advancements first.
3. Write in an engaging, conversational tone — like a smart friend catching you up over coffee.
4. For each story, include a one-line summary and note the source.
5. Ignore minor bug fixes, routine updates, or irrelevant noise.
6. ONLY use information from the provided headlines and descriptions. Do NOT hallucinate or add information not present in the input.
7. Format with Markdown: use bold for emphasis, bullet points for items, and section headers with emoji.
8. End with a short "🔮 Why It Matters" section with 2-3 sentences on the day's key takeaway.
9. Keep the total output under 3,800 characters to fit delivery constraints.
10. If very few articles are provided, be concise. If none, write a short "quiet day in AI" message.`;

/**
 * Build the user prompt from filtered articles.
 */
function buildUserPrompt(articles: FeedItem[]): string {
    if (articles.length === 0) {
        return "No AI news articles were found in the last 24 hours.";
    }

    const lines = articles.map((a, i) => {
        const desc = a.description ? `\n   Description: ${a.description}` : "";
        return `${i + 1}. [${a.sourceName}] ${a.title}${desc}`;
    });

    return `Here are ${articles.length} AI news items from the last 24 hours:\n\n${lines.join("\n\n")}`;
}

/**
 * Generate morning briefing using the configured LLM provider.
 */
export async function generateBriefing(
    articles: FeedItem[],
    config: Config
): Promise<string> {
    const userPrompt = buildUserPrompt(articles);
    const startTime = Date.now();

    console.log(
        `🧠 Generating briefing with ${config.llmProvider} (${articles.length} articles)...`
    );

    let result: string;

    if (config.llmProvider === "gemini") {
        result = await generateWithGemini(userPrompt, config.geminiApiKey!);
    } else if (config.llmProvider === "openrouter") {
        result = await generateWithOpenRouter(
            userPrompt,
            config.openrouterApiKey!,
            config.openrouterModel
        );
    } else {
        result = await generateWithOpenAI(userPrompt, config.openaiApiKey!);
    }

    const elapsed = Date.now() - startTime;
    console.log(
        `✅ Briefing generated in ${(elapsed / 1000).toFixed(1)}s (${result.length} chars)`
    );

    return result;
}

/**
 * Generate using Google Gemini.
 */
async function generateWithGemini(
    userPrompt: string,
    apiKey: string
): Promise<string> {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
        systemInstruction: SYSTEM_PROMPT,
    });

    const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: userPrompt }] }],
        generationConfig: {
            maxOutputTokens: 2048,
            temperature: 0.7,
        },
    });

    const response = result.response;
    const text = response.text();

    if (!text) {
        throw new Error("Gemini returned an empty response.");
    }

    return text;
}

/**
 * Generate using OpenAI.
 */
async function generateWithOpenAI(
    userPrompt: string,
    apiKey: string
): Promise<string> {
    const openai = new OpenAI({ apiKey });

    const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: userPrompt },
        ],
        max_tokens: 2048,
        temperature: 0.7,
    });

    const text = response.choices[0]?.message?.content;

    if (!text) {
        throw new Error("OpenAI returned an empty response.");
    }

    return text;
}

/**
 * Generate using OpenRouter (OpenAI-compatible API).
 * Includes retry with exponential backoff for rate limits (429).
 */
async function generateWithOpenRouter(
    userPrompt: string,
    apiKey: string,
    model?: string
): Promise<string> {
    const openrouter = new OpenAI({
        apiKey,
        baseURL: "https://openrouter.ai/api/v1",
        defaultHeaders: {
            "HTTP-Referer": "https://github.com/rayai",
            "X-Title": "RayAI News Aggregator",
        },
    });

    const maxRetries = 5;
    const targetModel = model || "google/gemini-2.5-flash:free";

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const response = await openrouter.chat.completions.create({
                model: targetModel,
                messages: [
                    { role: "system", content: SYSTEM_PROMPT },
                    { role: "user", content: userPrompt },
                ],
                max_tokens: 2048,
                temperature: 0.7,
            });

            const text = response.choices[0]?.message?.content;

            if (!text) {
                throw new Error("OpenRouter returned an empty response.");
            }

            return text;
        } catch (error) {
            const is429 =
                error instanceof Error && error.message.includes("429");
            if (is429 && attempt < maxRetries) {
                const delay = Math.pow(2, attempt) * 3000; // 6s, 12s, 24s, 48s
                console.warn(
                    `⚠️  Rate limited (429). Retrying in ${delay / 1000}s (attempt ${attempt}/${maxRetries})...`
                );
                await new Promise((r) => setTimeout(r, delay));
                continue;
            }
            throw error;
        }
    }

    throw new Error("OpenRouter: max retries exceeded.");
}
