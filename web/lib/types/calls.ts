/**
 * Market Calls Types
 * Core types for the conviction tracking system.
 */

export type CallDirection = 'YES' | 'NO' | 'LONG' | 'SHORT';
export type CallStatus = 'PENDING' | 'WON' | 'LOST' | 'PUSH' | 'EXPIRED';
export type CallSource = 'polymarket' | 'kalshi' | 'custom';
export type RankTier = 'NOVICE' | 'ANALYST' | 'STRATEGIST' | 'ORACLE' | 'PROPHET';

export interface MarketCall {
    id: string;
    userId: string;
    username?: string;

    // Market
    marketId: string;
    marketTitle: string;
    marketSlug?: string;
    marketSource: CallSource;

    // The Call
    direction: CallDirection;
    confidence: number;  // 1-100
    entryPrice?: number; // 0-1 for prediction markets
    stakePoints?: number;
    thesis?: string;

    // Resolution
    status: CallStatus;
    exitPrice?: number;
    resolvedAt?: string;
    resolutionNote?: string;
    pointsEarned?: number;

    // Metadata
    isPublic: boolean;
    isFeatured: boolean;
    sourcePlatform: 'web' | 'roku' | 'api';
    createdAt: string;
    updatedAt: string;
}

export interface CallSubmission {
    marketId: string;
    marketTitle: string;
    marketSlug?: string;
    marketSource?: CallSource;
    direction: CallDirection;
    confidence: number;
    entryPrice?: number;
    thesis?: string;
    stakePoints?: number;
    isPublic?: boolean;
}

export interface CallResolution {
    callId: string;
    status: 'WON' | 'LOST' | 'PUSH' | 'EXPIRED';
    exitPrice?: number;
    resolutionNote?: string;
}

export interface UserCallStats {
    userId: string;
    username?: string;

    // Volume
    totalCalls: number;
    pendingCalls: number;
    resolvedCalls: number;

    // Accuracy
    winningCalls: number;
    losingCalls: number;
    pushCalls: number;
    accuracyRate: number;  // 0-1

    // Streaks
    currentStreak: number;
    bestStreak: number;
    streakType: 'win' | 'lose' | 'none';

    // Points
    totalPointsEarned: number;
    totalPointsLost: number;
    netPoints: number;

    // Ranking
    rankTier: RankTier;
    globalRank?: number;

    firstCallAt?: string;
    lastCallAt?: string;
}

export interface LeaderboardEntry {
    rank: number;
    userId: string;
    username: string;
    accuracyRate: number;
    totalCalls: number;
    winningCalls: number;
    currentStreak: number;
    rankTier: RankTier;
    netPoints: number;
}

export interface CallFeedItem extends MarketCall {
    reactions?: {
        agree: number;
        disagree: number;
        fire: number;
    };
    userReaction?: string;
}

// API Response types
export interface CallsApiResponse {
    calls: MarketCall[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        hasMore: boolean;
    };
}

export interface LeaderboardApiResponse {
    leaderboard: LeaderboardEntry[];
    period: 'week' | 'month' | 'all';
    generatedAt: number;
    currentUserRank?: number;
}
