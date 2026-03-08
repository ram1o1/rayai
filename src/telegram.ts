import type { Config } from "./config.js";

const TELEGRAM_API_BASE = "https://api.telegram.org";
const MAX_MESSAGE_LENGTH = 4000; // Telegram limit is 4096, leave buffer

/**
 * Send the briefing to Telegram, splitting into chunks if needed.
 */
export async function sendBriefing(
    text: string,
    config: Config
): Promise<void> {
    const chunks = smartChunk(text, MAX_MESSAGE_LENGTH);

    console.log(
        `📨 Sending briefing in ${chunks.length} chunk(s) to Telegram...`
    );

    for (let i = 0; i < chunks.length; i++) {
        await sendMessage(chunks[i], config);

        // Delay between chunks to prevent out-of-order delivery
        if (i < chunks.length - 1) {
            await sleep(1000);
        }
    }

    console.log(`✅ Briefing delivered to Telegram successfully.`);
}

/**
 * Smart Chunking Algorithm:
 * Splits text at paragraph boundaries (\n\n) to stay within the character limit.
 * Falls back to line breaks, then hard character split if needed.
 */
export function smartChunk(text: string, maxLength: number): string[] {
    if (!text || text.trim().length === 0) {
        return [];
    }

    if (text.length <= maxLength) {
        return [text];
    }

    const chunks: string[] = [];
    let remaining = text;

    while (remaining.length > 0) {
        if (remaining.length <= maxLength) {
            chunks.push(remaining);
            break;
        }

        // Try to split at paragraph break
        let splitIndex = remaining.lastIndexOf("\n\n", maxLength);

        // Fall back to line break
        if (splitIndex <= 0) {
            splitIndex = remaining.lastIndexOf("\n", maxLength);
        }

        // Fall back to space
        if (splitIndex <= 0) {
            splitIndex = remaining.lastIndexOf(" ", maxLength);
        }

        // Hard split as last resort
        if (splitIndex <= 0) {
            splitIndex = maxLength;
        }

        chunks.push(remaining.slice(0, splitIndex).trim());
        remaining = remaining.slice(splitIndex).trim();
    }

    return chunks.filter((c) => c.length > 0);
}

/**
 * Send a single message via the Telegram Bot API.
 */
async function sendMessage(text: string, config: Config): Promise<void> {
    const url = `${TELEGRAM_API_BASE}/bot${config.telegramBotToken}/sendMessage`;

    const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            chat_id: config.telegramChatId,
            text: text,
            parse_mode: "Markdown",
            disable_web_page_preview: true,
        }),
    });

    if (!response.ok) {
        const errorBody = await response.text();
        // If Markdown fails, retry without parse_mode
        if (
            response.status === 400 &&
            errorBody.includes("can't parse entities")
        ) {
            console.warn(
                "⚠️  Markdown parsing failed, retrying without formatting..."
            );
            const retryResponse = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    chat_id: config.telegramChatId,
                    text: text,
                    disable_web_page_preview: true,
                }),
            });
            if (!retryResponse.ok) {
                const retryError = await retryResponse.text();
                throw new Error(`Telegram API error (retry): ${retryError}`);
            }
            return;
        }
        throw new Error(`Telegram API error: ${response.status} — ${errorBody}`);
    }
}

function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
