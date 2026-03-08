import type { FeedSource } from "./types.js";

/**
 * Curated list of AI-focused RSS feeds.
 * Organized by category for easy maintenance.
 */
export const FEED_SOURCES: FeedSource[] = [
    // ── Labs & Research ──────────────────────────────────────────────
    {
        name: "OpenAI Blog",
        url: "https://openai.com/blog/rss.xml",
        category: "Labs & Research",
    },
    {
        name: "Google AI Blog",
        url: "https://blog.google/technology/ai/rss/",
        category: "Labs & Research",
    },
    {
        name: "DeepMind Blog",
        url: "https://deepmind.google/blog/rss.xml",
        category: "Labs & Research",
    },
    {
        name: "Anthropic",
        url: "https://www.anthropic.com/feed.xml",
        category: "Labs & Research",
    },
    {
        name: "Meta AI Blog",
        url: "https://about.fb.com/news/category/ai/feed/",
        category: "Labs & Research",
    },
    {
        name: "Microsoft AI Blog",
        url: "https://blogs.microsoft.com/ai/feed/",
        category: "Labs & Research",
    },

    // ── Open Source & Community ──────────────────────────────────────
    {
        name: "Hugging Face Blog",
        url: "https://huggingface.co/blog/feed.xml",
        category: "Open Source",
    },
    {
        name: "LangChain Blog",
        url: "https://blog.langchain.dev/rss/",
        category: "Open Source",
    },
    {
        name: "Ollama Blog",
        url: "https://ollama.com/blog/feed",
        category: "Open Source",
    },

    // ── Academic (arXiv) ─────────────────────────────────────────────
    {
        name: "arXiv cs.AI",
        url: "https://rss.arxiv.org/rss/cs.AI",
        category: "Academic",
    },
    {
        name: "arXiv cs.CL",
        url: "https://rss.arxiv.org/rss/cs.CL",
        category: "Academic",
    },
    {
        name: "arXiv cs.LG",
        url: "https://rss.arxiv.org/rss/cs.LG",
        category: "Academic",
    },

    // ── Industry News ────────────────────────────────────────────────
    {
        name: "TechCrunch AI",
        url: "https://techcrunch.com/category/artificial-intelligence/feed/",
        category: "Industry",
    },
    {
        name: "The Verge AI",
        url: "https://www.theverge.com/rss/ai-artificial-intelligence/index.xml",
        category: "Industry",
    },
    {
        name: "Ars Technica AI",
        url: "https://feeds.arstechnica.com/arstechnica/features",
        category: "Industry",
    },
    {
        name: "VentureBeat AI",
        url: "https://venturebeat.com/category/ai/feed/",
        category: "Industry",
    },
    {
        name: "Wired AI",
        url: "https://www.wired.com/feed/tag/ai/latest/rss",
        category: "Industry",
    },
    {
        name: "Axios AI",
        url: "https://www.axios.com/technology/artificial-intelligence/feed",
        category: "Industry",
    },

    // ── Newsletters & Aggregators ────────────────────────────────────
    {
        name: "MIT Tech Review AI",
        url: "https://www.technologyreview.com/topic/artificial-intelligence/feed",
        category: "Newsletters",
    },
    {
        name: "The Batch (deeplearning.ai)",
        url: "https://www.deeplearning.ai/blog/feed/",
        category: "Newsletters",
    },
    {
        name: "Import AI",
        url: "https://importai.substack.com/feed",
        category: "Newsletters",
    },
    {
        name: "Last Week in AI",
        url: "https://lastweekin.ai/feed",
        category: "Newsletters",
    },
    {
        name: "AI News (Sebastian Raschka)",
        url: "https://magazine.sebastianraschka.com/feed",
        category: "Newsletters",
    },
];
