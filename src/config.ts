/**
 * Centralized configuration — reads and validates environment variables.
 */

export interface Config {
    telegramBotToken: string;
    telegramChatId: string;
    llmProvider: "gemini" | "openai" | "openrouter";
    geminiApiKey?: string;
    openaiApiKey?: string;
    openrouterApiKey?: string;
    openrouterModel?: string;
    cronSecret: string;
}

export function loadConfig(): Config {
    const telegramBotToken = requireEnv("TELEGRAM_BOT_TOKEN");
    const telegramChatId = requireEnv("TELEGRAM_CHAT_ID");

    const llmProvider = (process.env.LLM_PROVIDER || "openrouter") as
        | "gemini"
        | "openai"
        | "openrouter";

    if (llmProvider !== "gemini" && llmProvider !== "openai" && llmProvider !== "openrouter") {
        throw new Error(
            `Invalid LLM_PROVIDER: "${llmProvider}". Must be "gemini", "openai", or "openrouter".`
        );
    }

    const geminiApiKey = process.env.GEMINI_API_KEY;
    const openaiApiKey = process.env.OPENAI_API_KEY;
    const openrouterApiKey = process.env.OPENROUTER_API_KEY;
    const openrouterModel = process.env.OPENROUTER_MODEL;

    if (llmProvider === "gemini" && !geminiApiKey) {
        throw new Error(
            'GEMINI_API_KEY is required when LLM_PROVIDER is "gemini".'
        );
    }
    if (llmProvider === "openai" && !openaiApiKey) {
        throw new Error(
            'OPENAI_API_KEY is required when LLM_PROVIDER is "openai".'
        );
    }
    if (llmProvider === "openrouter" && !openrouterApiKey) {
        throw new Error(
            'OPENROUTER_API_KEY is required when LLM_PROVIDER is "openrouter".'
        );
    }

    return {
        telegramBotToken,
        telegramChatId,
        llmProvider,
        geminiApiKey,
        openaiApiKey,
        openrouterApiKey,
        openrouterModel,
        cronSecret: requireEnv("CRON_SECRET"),
    };
}

function requireEnv(name: string): string {
    const value = process.env[name];
    if (!value) {
        throw new Error(`Missing required environment variable: ${name}`);
    }
    return value;
}
