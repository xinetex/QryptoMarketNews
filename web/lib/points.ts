/**
 * Prophet Points System
 * 
 * A loyalty/reputation system for Prophet TV users.
 * Points are earned through engagement, predictions, and accuracy.
 */

// Point values for different actions
export const POINT_VALUES = {
    PREDICTION_MADE: 10,
    PREDICTION_CORRECT: 50,
    DAILY_LOGIN: 5,
    SHARE_SOCIAL: 15,
    STREAK_BONUS: 10, // per day, max 7
} as const;

// Levels based on total points
export const LEVELS = [
    { name: 'Bronze', minPoints: 0, color: '#CD7F32' },
    { name: 'Silver', minPoints: 500, color: '#C0C0C0' },
    { name: 'Gold', minPoints: 2000, color: '#FFD700' },
    { name: 'Prophet', minPoints: 10000, color: '#8B5CF6' },
] as const;

export type PointEventType = keyof typeof POINT_VALUES;
export type LevelName = typeof LEVELS[number]['name'];

export interface PointEvent {
    id: string;
    type: PointEventType;
    points: number;
    timestamp: string;
    metadata?: Record<string, unknown>;
}

export interface UserPoints {
    totalPoints: number;
    level: LevelName;
    levelColor: string;
    predictions: {
        total: number;
        correct: number;
        accuracy: number;
    };
    streak: {
        current: number;
        lastActive: string;
    };
    history: PointEvent[];
}

const STORAGE_KEY = 'prophet_points';

/**
 * Get user points from localStorage
 */
export function getPoints(): UserPoints {
    if (typeof window === 'undefined') {
        return getDefaultPoints();
    }

    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
        return getDefaultPoints();
    }

    try {
        return JSON.parse(stored);
    } catch {
        return getDefaultPoints();
    }
}

/**
 * Get default points structure
 */
function getDefaultPoints(): UserPoints {
    return {
        totalPoints: 0,
        level: 'Bronze',
        levelColor: '#CD7F32',
        predictions: {
            total: 0,
            correct: 0,
            accuracy: 0,
        },
        streak: {
            current: 0,
            lastActive: new Date().toISOString(),
        },
        history: [],
    };
}

/**
 * Calculate level from points
 */
function calculateLevel(points: number): { name: LevelName; color: string } {
    for (let i = LEVELS.length - 1; i >= 0; i--) {
        if (points >= LEVELS[i].minPoints) {
            return { name: LEVELS[i].name, color: LEVELS[i].color };
        }
    }
    return { name: 'Bronze', color: '#CD7F32' };
}

/**
 * Award points for an action
 */
export function earnPoints(
    eventType: PointEventType,
    metadata?: Record<string, unknown>
): { newTotal: number; pointsAwarded: number; level: LevelName } {
    const current = getPoints();
    const pointsAwarded = POINT_VALUES[eventType];

    const event: PointEvent = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: eventType,
        points: pointsAwarded,
        timestamp: new Date().toISOString(),
        metadata,
    };

    const newTotal = current.totalPoints + pointsAwarded;
    const { name: level, color } = calculateLevel(newTotal);

    // Update predictions stats if relevant
    const predictions = { ...current.predictions };
    if (eventType === 'PREDICTION_MADE') {
        predictions.total += 1;
    } else if (eventType === 'PREDICTION_CORRECT') {
        predictions.correct += 1;
        predictions.accuracy = Math.round((predictions.correct / predictions.total) * 100);
    }

    // Update streak
    const streak = { ...current.streak };
    const today = new Date().toDateString();
    const lastActive = new Date(streak.lastActive).toDateString();

    if (today !== lastActive) {
        const dayDiff = Math.floor(
            (new Date(today).getTime() - new Date(lastActive).getTime()) / (1000 * 60 * 60 * 24)
        );
        if (dayDiff === 1) {
            streak.current = Math.min(streak.current + 1, 7);
        } else {
            streak.current = 1;
        }
        streak.lastActive = new Date().toISOString();
    }

    const updated: UserPoints = {
        totalPoints: newTotal,
        level,
        levelColor: color,
        predictions,
        streak,
        history: [event, ...current.history].slice(0, 100), // Keep last 100 events
    };

    if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    }

    return { newTotal, pointsAwarded, level };
}

/**
 * Sync points with backend (Neon DB)
 */
export async function syncPoints(walletAddress: string): Promise<UserPoints> {
    try {
        const res = await fetch(`/api/points?wallet=${walletAddress}`);
        if (!res.ok) throw new Error('Failed to sync points');

        const data = await res.json();

        // Update local storage with remote truth
        const merged: UserPoints = {
            totalPoints: data.totalPoints,
            level: data.level,
            levelColor: calculateLevel(data.totalPoints).color,
            predictions: { // DB doesn't store this detail yet, persist local or default
                total: 0,
                correct: 0,
                accuracy: 0
            },
            streak: { // DB doesn't store streak, persist local
                current: 0,
                lastActive: new Date().toISOString()
            },
            history: data.history || []
        };

        // Preserve local streak/predictions if valid, merging logic can be improved
        // For now, remote trust is authoritative for Total Points & History
        const currentLocal = getPoints();
        merged.streak = currentLocal.streak;
        merged.predictions = currentLocal.predictions;

        if (typeof window !== 'undefined') {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
        }

        return merged;
    } catch (e) {
        console.error("Sync failed, using offline points", e);
        return getPoints();
    }
}

/**
 * Earn points and persist to backend
 */
export async function earnPointsRemote(
    walletAddress: string,
    eventType: PointEventType
): Promise<{ newTotal: number; pointsAwarded: number; level: LevelName }> {
    // 1. Optimistic local update
    const localResult = earnPoints(eventType);

    // 2. Remote update
    try {
        fetch('/api/points', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ walletAddress, eventType })
        });
    } catch (e) {
        console.error('Failed to push points to remote', e);
        // Queue for retry? For now, we rely on next sync.
    }

    return localResult;
}

/**
 * Get leaderboard (mock for MVP - would come from API)
 */
export function getLeaderboard(): Array<{
    rank: number;
    username: string;
    points: number;
    level: LevelName;
    accuracy: number;
}> {
    // Mock leaderboard data
    return [
        { rank: 1, username: 'ProphetWhale', points: 15420, level: 'Prophet', accuracy: 78 },
        { rank: 2, username: 'CryptoSage', points: 12890, level: 'Prophet', accuracy: 72 },
        { rank: 3, username: 'MarketMystic', points: 9450, level: 'Gold', accuracy: 68 },
        { rank: 4, username: 'OracleOne', points: 7820, level: 'Gold', accuracy: 71 },
        { rank: 5, username: 'ChainVision', points: 6340, level: 'Gold', accuracy: 65 },
        { rank: 6, username: 'DeFiDruid', points: 4210, level: 'Gold', accuracy: 62 },
        { rank: 7, username: 'TokenTeller', points: 3150, level: 'Gold', accuracy: 59 },
        { rank: 8, username: 'BlockBard', points: 2480, level: 'Gold', accuracy: 58 },
        { rank: 9, username: 'CoinCaster', points: 1890, level: 'Silver', accuracy: 55 },
        { rank: 10, username: 'LedgerLore', points: 1240, level: 'Silver', accuracy: 52 },
    ];
}

/**
 * Get points to next level
 */
export function getPointsToNextLevel(currentPoints: number): {
    nextLevel: LevelName | null;
    pointsNeeded: number;
    progress: number;
} {
    for (let i = 0; i < LEVELS.length - 1; i++) {
        if (currentPoints < LEVELS[i + 1].minPoints) {
            const pointsNeeded = LEVELS[i + 1].minPoints - currentPoints;
            const rangeStart = LEVELS[i].minPoints;
            const rangeEnd = LEVELS[i + 1].minPoints;
            const progress = ((currentPoints - rangeStart) / (rangeEnd - rangeStart)) * 100;

            return {
                nextLevel: LEVELS[i + 1].name,
                pointsNeeded,
                progress: Math.round(progress),
            };
        }
    }

    return { nextLevel: null, pointsNeeded: 0, progress: 100 };
}
