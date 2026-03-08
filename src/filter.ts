import type { FeedItem } from "./types.js";

/**
 * Filter articles to only those published within the last `hoursAgo` hours.
 * Also deduplicates by normalized title and sorts by date (newest first).
 */
export function filterRecentArticles(
    items: FeedItem[],
    hoursAgo: number = 24
): FeedItem[] {
    const cutoff = new Date(Date.now() - hoursAgo * 60 * 60 * 1000);

    // 1. Filter by recency
    const recent = items.filter((item) => item.pubDate >= cutoff);

    // 2. Deduplicate by normalized title
    const seen = new Set<string>();
    const unique: FeedItem[] = [];

    for (const item of recent) {
        const normalized = normalizeTitle(item.title);
        if (!seen.has(normalized)) {
            seen.add(normalized);
            unique.push(item);
        }
    }

    // 3. Sort by publication date descending (newest first)
    unique.sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime());

    console.log(
        `🔍 Filtered: ${items.length} → ${recent.length} recent → ${unique.length} unique`
    );

    return unique;
}

/**
 * Normalize a title for deduplication:
 * lowercase, strip punctuation, collapse whitespace.
 */
function normalizeTitle(title: string): string {
    return title
        .toLowerCase()
        .replace(/[^\w\s]/g, "") // Remove punctuation
        .replace(/\s+/g, " ") // Collapse whitespace
        .trim();
}
