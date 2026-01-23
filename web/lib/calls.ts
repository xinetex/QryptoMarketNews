import { sql } from './db';
import type {
    MarketCall, CallSubmission, UserCallStats,
    LeaderboardEntry, CallResolution
} from './types/calls';

// In-memory fallback if DB is not connected
let MOCK_CALLS: MarketCall[] = [];
let MOCK_STATS: UserCallStats[] = [];

/**
 * Submit a new market call
 */
export async function submitCall(
    userId: string,
    username: string,
    data: CallSubmission
): Promise<MarketCall | null> {
    const call: MarketCall = {
        id: crypto.randomUUID(),
        userId,
        username,
        ...data,
        marketSource: data.marketSource || 'polymarket',
        status: 'PENDING',
        sourcePlatform: 'web',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isPublic: true,
        isFeatured: false,
        confidence: Math.max(1, Math.min(100, data.confidence))
    };

    if (sql) {
        try {
            await sql`
        INSERT INTO market_calls (
          id, user_id, username, market_id, market_title, market_slug, 
          market_source, direction, confidence, entry_price, stake_points, 
          thesis, status, source_platform
        ) VALUES (
          ${call.id}, ${userId}, ${username}, ${data.marketId}, ${data.marketTitle}, ${data.marketSlug || null},
          ${call.marketSource}, ${data.direction}, ${call.confidence}, ${data.entryPrice || 0}, 0,
          ${data.thesis || null}, 'PENDING', 'web'
        )
      `;
            return call;
        } catch (error) {
            console.error('[Calls DB] Submit error:', error);
        }
    }

    // Fallback
    MOCK_CALLS.unshift(call);
    return call;
}

/**
 * Get calls for a user
 */
export async function getUserCalls(userId: string): Promise<MarketCall[]> {
    if (sql) {
        try {
            const rows = await sql`
        SELECT * FROM market_calls 
        WHERE user_id = ${userId} 
        ORDER BY created_at DESC
      `;
            return mapRowsToCalls(rows);
        } catch (e) { console.error(e) }
    }
    return MOCK_CALLS.filter(c => c.userId === userId);
}

/**
 * Get active calls for a specific market
 */
export async function getMarketCalls(marketId: string): Promise<MarketCall[]> {
    if (sql) {
        try {
            const rows = await sql`
        SELECT * FROM market_calls 
        WHERE market_id = ${marketId} AND status = 'PENDING'
        ORDER BY created_at DESC
      `;
            return mapRowsToCalls(rows);
        } catch (e) { console.error(e) }
    }
    return MOCK_CALLS.filter(c => c.marketId === marketId && c.status === 'PENDING');
}

/**
 * Get user stats (accuracy, volume, rank)
 */
export async function getUserCallStats(userId: string): Promise<UserCallStats | null> {
    if (sql) {
        // This table is managed by the DB triggers defined in migration 010
        try {
            const rows = await sql`SELECT * FROM user_call_stats WHERE user_id = ${userId}`;
            if (rows.length > 0) return mapRowToStats(rows[0]);

            // If no stats yet, return zero baseline
            return {
                userId,
                totalCalls: 0,
                pendingCalls: 0,
                resolvedCalls: 0,
                winningCalls: 0,
                losingCalls: 0,
                pushCalls: 0,
                accuracyRate: 0,
                currentStreak: 0,
                bestStreak: 0,
                streakType: 'none',
                totalPointsEarned: 0,
                totalPointsLost: 0,
                netPoints: 0,
                rankTier: 'NOVICE'
            };
        } catch (e) { console.error(e) }
    }
    return MOCK_STATS.find(s => s.userId === userId) || null;
}

/**
 * Get Leaderboard
 */
export async function getLeaderboard(period: 'all' | 'month' = 'all'): Promise<LeaderboardEntry[]> {
    if (sql) {
        try {
            // Simple leaderboard logic: Score = Accuracy * log(Volume) to reward active high-performers
            const rows = await sql`
        SELECT 
          user_id, username, accuracy_rate, total_calls, 
          winning_calls, current_streak, rank_tier, net_points
        FROM user_call_stats
        WHERE total_calls >= 5
        ORDER BY accuracy_rate DESC, total_calls DESC
        LIMIT 50
      `;

            return rows.map((r, i) => ({
                rank: i + 1,
                userId: r.user_id,
                username: r.username || 'Anonymous',
                accuracyRate: parseFloat(r.accuracy_rate),
                totalCalls: r.total_calls,
                winningCalls: r.winning_calls,
                currentStreak: r.current_streak,
                rankTier: r.rank_tier,
                netPoints: r.net_points
            }));
        } catch (e) { console.error(e) }
    }
    return []; // Fallback empty
}

// Helpers
function mapRowsToCalls(rows: any[]): MarketCall[] {
    return rows.map(r => ({
        id: r.id,
        userId: r.user_id,
        username: r.username,
        marketId: r.market_id,
        marketTitle: r.market_title,
        marketSlug: r.market_slug,
        marketSource: r.market_source,
        direction: r.direction,
        confidence: r.confidence,
        entryPrice: parseFloat(r.entry_price || 0),
        status: r.status,
        pointsEarned: r.points_earned,
        isPublic: r.is_public,
        isFeatured: r.is_featured,
        sourcePlatform: r.source_platform,
        createdAt: new Date(r.created_at).toISOString(),
        updatedAt: new Date(r.updated_at).toISOString()
    }));
}

function mapRowToStats(r: any): UserCallStats {
    return {
        userId: r.user_id,
        username: r.username,
        totalCalls: r.total_calls,
        pendingCalls: r.pending_calls || 0,
        resolvedCalls: r.resolved_calls,
        winningCalls: r.winning_calls,
        losingCalls: r.losing_calls,
        pushCalls: r.push_calls,
        accuracyRate: parseFloat(r.accuracy_rate),
        currentStreak: r.current_streak,
        bestStreak: r.best_streak,
        streakType: r.streak_type,
        totalPointsEarned: r.total_points_earned,
        totalPointsLost: r.total_points_lost,
        netPoints: r.net_points,
        rankTier: r.rank_tier,
        globalRank: r.global_rank
    };
}
