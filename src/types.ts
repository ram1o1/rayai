/**
 * Shared TypeScript interfaces for RayAI
 */

export interface FeedSource {
    name: string;
    url: string;
    category: string;
}

export interface FeedItem {
    title: string;
    description: string;
    link: string;
    pubDate: Date;
    sourceName: string;
    category: string;
}

export interface BriefingResult {
    text: string;
    articleCount: number;
    feedsProcessed: number;
    feedsFailed: number;
    generationTimeMs: number;
}
