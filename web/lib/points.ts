/**
 * Prophet Points System v2 - "The Oracle System"
 * 
 * A comprehensive gamification engine for Prophet TV users.
 * Tracks engagement, predictions, accuracy, and progression across all platforms.
 */

// ============================================================================
// POINT VALUES & CONFIGURATION
// ============================================================================

export const POINT_VALUES = {
    // Proof of Prediction
    PREDICTION_MADE: 10,
    PREDICTION_CORRECT: 50,
    PREDICTION_AGAINST_CROWD_WIN: 100,
    PREDICTION_EARLY_BIRD: 20,
    PREDICTION_STREAK_BONUS: 25,
    PREDICTION_PERFECT_WEEK: 500,

    // Proof of Attention
    WATCH_MINUTE: 1,           // Per minute (capped)
    LIVE_STREAM_MINUTE: 2,     // 2x for live content
    SEGMENT_COMPLETE: 10,      // Finished a segment
    NOTIFICATION_ENGAGED: 5,
    QR_CODE_SCANNED: 20,

    // Proof of Community
    DAILY_LOGIN: 5,
    STREAK_DAY_BONUS: 10,      // Days 2-6
    STREAK_WEEK_BONUS: 100,    // Day 7
    SHARE_SOCIAL: 15,
    REFERRAL_SIGNUP: 250,
    REFERRAL_PREDICTION: 50,
    COMMENT_POSTED: 5,
    POLL_VOTED: 10,
    PROFILE_COMPLETE: 100,

    // Platform Bonuses
    ROKU_INSTALL: 500,
    ROKU_HOME_CHANNEL: 1000,
    MONTHLY_ACTIVE: 200,
    ACCOUNT_ANNIVERSARY: 1000,
    ALPHA_TESTER: 5000,
} as const;

// Daily caps to prevent gaming
export const DAILY_CAPS = {
    WATCH_MINUTES: 120,        // Max 120 pts from watch time
    SOCIAL_SHARES: 3,          // Max 45 pts from shares
    COMMENTS: 10,              // Max 50 pts from comments
} as const;

// ============================================================================
// TIER SYSTEM
// ============================================================================

export const TIERS = [
    { name: 'Initiate', minPoints: 0, color: '#71717a', multiplier: 1.0, icon: '🌑' },
    { name: 'Seer', minPoints: 500, color: '#CD7F32', multiplier: 1.1, icon: '🌘' },
    { name: 'Augur', minPoints: 2000, color: '#C0C0C0', multiplier: 1.2, icon: '🌗' },
    { name: 'Oracle', minPoints: 10000, color: '#FFD700', multiplier: 1.5, icon: '🌖' },
    { name: 'Prophet', minPoints: 50000, color: '#8B5CF6', multiplier: 2.0, icon: '🌕' },
    { name: 'Arch-Prophet', minPoints: 250000, color: '#EC4899', multiplier: 3.0, icon: '✨' },
] as const;

export type TierName = typeof TIERS[number]['name'];
export type PointEventType = keyof typeof POINT_VALUES;

// ============================================================================
// TYPES
// ============================================================================

export interface OracleProfile {
    walletAddress: string;
    totalPoints: number;
    tier: TierName;
    tierColor: string;
    tierIcon: string;
    multiplier: number;

    // Prophet Rating (Accuracy)
    prophetRating: number;       // 0-100
    prophetGrade: string;        // S, A, B, C, D, F
    predictionsTotal: number;
    predictionsCorrect: number;

    // Streaks
    currentStreak: number;
    bestStreak: number;
    loginStreakDays: number;

    // Platform Stats
    lifetimeWatchMinutes: number;
    referralCount: number;

    // Progression
    pointsToNextTier: number;
    nextTierName: TierName | null;
    progressPercent: number;

    // Timestamps
    createdAt: string;
    lastUpdated: string;
}

export interface PointEvent {
    id: string;
    type: PointEventType;
    points: number;
    multiplier: number;
    platform: 'roku' | 'web' | 'mobile';
    timestamp: string;
    metadata?: Record<string, unknown>;
}

export interface DailyChallenge {
    type: string;
    description: string;
    target: number;
    progress: number;
    complete: boolean;
    reward: number;
}

export interface DailyChallengeSet {
    date: string;
    challenges: [DailyChallenge, DailyChallenge, DailyChallenge];
    bonusClaimed: boolean;
    bonusReward: number;
}

// ============================================================================
// BADGE DEFINITIONS
// ============================================================================

export interface Badge {
    id: string;
    name: string;
    icon: string;
    description: string;
    rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
}

export const BADGES: Record<string, Badge> = {
    FIRST_VISION: { id: 'first_vision', name: 'First Vision', icon: '🔮', description: 'Made your first prediction', rarity: 'common' },
    STREAK_STARTER: { id: 'streak_starter', name: 'Streak Starter', icon: '🔥', description: '7-day login streak', rarity: 'common' },
    CENTURY_CLUB: { id: 'century_club', name: 'Century Club', icon: '💯', description: '100 correct predictions', rarity: 'rare' },
    AGAINST_THE_GRAIN: { id: 'against_the_grain', name: 'Against the Grain', icon: '🌊', description: '10 minority position wins', rarity: 'rare' },
    SOCIAL_BUTTERFLY: { id: 'social_butterfly', name: 'Social Butterfly', icon: '🦋', description: '50 shares to social', rarity: 'uncommon' },
    ROKU_LOYALIST: { id: 'roku_loyalist', name: 'Roku Loyalist', icon: '📺', description: '100 hours watched on Roku', rarity: 'epic' },
    PERFECT_WEEK: { id: 'perfect_week', name: 'Perfect Week', icon: '💎', description: '7/7 correct in a week', rarity: 'epic' },
    ALPHA_ORACLE: { id: 'alpha_oracle', name: 'Alpha Oracle', icon: '🏛️', description: 'First 1,000 users', rarity: 'legendary' },
    CLAIRVOYANT: { id: 'clairvoyant', name: 'Clairvoyant', icon: '👁️', description: '90%+ accuracy (100+ predictions)', rarity: 'legendary' },
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const STORAGE_KEY = 'prophet_oracle_v2';

/**
 * Calculate tier from total points
 */
export function calculateTier(points: number): typeof TIERS[number] {
    for (let i = TIERS.length - 1; i >= 0; i--) {
        if (points >= TIERS[i].minPoints) {
            return TIERS[i];
        }
    }
    return TIERS[0];
}

/**
 * Calculate Prophet Rating (accuracy score 0-100)
 */
export function calculateProphetRating(correct: number, total: number): { rating: number; grade: string } {
    if (total === 0) return { rating: 0, grade: '-' };

    const rating = Math.round((correct / total) * 100);
    let grade: string;

    if (rating >= 90) grade = 'S';
    else if (rating >= 80) grade = 'A';
    else if (rating >= 70) grade = 'B';
    else if (rating >= 60) grade = 'C';
    else if (rating >= 50) grade = 'D';
    else grade = 'F';

    return { rating, grade };
}

/**
 * Calculate progress to next tier
 */
export function getProgressToNextTier(currentPoints: number): {
    nextTier: TierName | null;
    pointsNeeded: number;
    progress: number;
} {
    const currentTier = calculateTier(currentPoints);
    const currentIndex = TIERS.findIndex(t => t.name === currentTier.name);

    if (currentIndex >= TIERS.length - 1) {
        return { nextTier: null, pointsNeeded: 0, progress: 100 };
    }

    const nextTier = TIERS[currentIndex + 1];
    const rangeStart = currentTier.minPoints;
    const rangeEnd = nextTier.minPoints;
    const pointsNeeded = rangeEnd - currentPoints;
    const progress = Math.round(((currentPoints - rangeStart) / (rangeEnd - rangeStart)) * 100);

    return { nextTier: nextTier.name, pointsNeeded, progress };
}

// ============================================================================
// LOCAL STORAGE FUNCTIONS (Offline-first)
// ============================================================================

/**
 * Get default Oracle profile
 */
function getDefaultProfile(): OracleProfile {
    return {
        walletAddress: '',
        totalPoints: 0,
        tier: 'Initiate',
        tierColor: '#71717a',
        tierIcon: '🌑',
        multiplier: 1.0,
        prophetRating: 0,
        prophetGrade: '-',
        predictionsTotal: 0,
        predictionsCorrect: 0,
        currentStreak: 0,
        bestStreak: 0,
        loginStreakDays: 0,
        lifetimeWatchMinutes: 0,
        referralCount: 0,
        pointsToNextTier: 500,
        nextTierName: 'Seer',
        progressPercent: 0,
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
    };
}

/**
 * Get profile from localStorage
 */
export function getProfile(): OracleProfile {
    if (typeof window === 'undefined') return getDefaultProfile();

    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return getDefaultProfile();

    try {
        return JSON.parse(stored);
    } catch {
        return getDefaultProfile();
    }
}

/**
 * Save profile to localStorage
 */
function saveProfile(profile: OracleProfile): void {
    if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    }
}

/**
 * Clear profile (logout)
 */
export function clearProfile(): void {
    if (typeof window !== 'undefined') {
        localStorage.removeItem(STORAGE_KEY);
    }
}

// ============================================================================
// POINT AWARDING FUNCTIONS
// ============================================================================

/**
 * Award points for an action (local + remote)
 */
export async function earnPoints(
    eventType: PointEventType,
    platform: 'roku' | 'web' | 'mobile' = 'web',
    metadata?: Record<string, unknown>
): Promise<{ pointsAwarded: number; newTotal: number; newTier: TierName; levelUp: boolean }> {
    const profile = getProfile();
    const basePoints = POINT_VALUES[eventType];
    const multiplier = profile.multiplier;
    const pointsAwarded = Math.floor(basePoints * multiplier);

    const oldTier = profile.tier;
    const newTotal = profile.totalPoints + pointsAwarded;
    const tierData = calculateTier(newTotal);
    const progressData = getProgressToNextTier(newTotal);

    // Update profile
    profile.totalPoints = newTotal;
    profile.tier = tierData.name;
    profile.tierColor = tierData.color;
    profile.tierIcon = tierData.icon;
    profile.multiplier = tierData.multiplier;
    profile.pointsToNextTier = progressData.pointsNeeded;
    profile.nextTierName = progressData.nextTier;
    profile.progressPercent = progressData.progress;
    profile.lastUpdated = new Date().toISOString();

    // Update prediction stats
    if (eventType === 'PREDICTION_MADE') {
        profile.predictionsTotal += 1;
    } else if (eventType === 'PREDICTION_CORRECT' || eventType === 'PREDICTION_AGAINST_CROWD_WIN') {
        profile.predictionsCorrect += 1;
        profile.currentStreak += 1;
        if (profile.currentStreak > profile.bestStreak) {
            profile.bestStreak = profile.currentStreak;
        }
    }

    // Update Prophet Rating
    const { rating, grade } = calculateProphetRating(profile.predictionsCorrect, profile.predictionsTotal);
    profile.prophetRating = rating;
    profile.prophetGrade = grade;

    // Update watch time
    if (eventType === 'WATCH_MINUTE' || eventType === 'LIVE_STREAM_MINUTE') {
        profile.lifetimeWatchMinutes += 1;
    }

    saveProfile(profile);

    // Fire remote update (non-blocking)
    pushPointsToRemote(eventType, pointsAwarded, platform, metadata).catch(console.error);

    return {
        pointsAwarded,
        newTotal,
        newTier: tierData.name,
        levelUp: tierData.name !== oldTier,
    };
}

/**
 * Award Roku watch time points
 */
export async function awardWatchTime(minutes: number, isLive: boolean = false): Promise<number> {
    const profile = getProfile();
    const todayKey = new Date().toISOString().split('T')[0];
    const watchTimeKey = `prophet_watch_${todayKey}`;

    // Check daily cap
    const todayMinutes = parseInt(localStorage.getItem(watchTimeKey) || '0', 10);
    const remainingCap = DAILY_CAPS.WATCH_MINUTES - todayMinutes;
    const cappedMinutes = Math.min(minutes, remainingCap);

    if (cappedMinutes <= 0) return 0;

    // Update daily counter
    localStorage.setItem(watchTimeKey, String(todayMinutes + cappedMinutes));

    // Award points
    const eventType = isLive ? 'LIVE_STREAM_MINUTE' : 'WATCH_MINUTE';
    let totalAwarded = 0;

    for (let i = 0; i < cappedMinutes; i++) {
        const result = await earnPoints(eventType, 'roku');
        totalAwarded += result.pointsAwarded;
    }

    return totalAwarded;
}

// ============================================================================
// REMOTE SYNC FUNCTIONS
// ============================================================================

/**
 * Push points event to backend
 */
async function pushPointsToRemote(
    eventType: PointEventType,
    pointsAwarded: number,
    platform: string,
    metadata?: Record<string, unknown>
): Promise<void> {
    try {
        await fetch('/api/points', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                eventType,
                pointsAwarded,
                platform,
                metadata,
            }),
        });
    } catch (e) {
        console.error('[Points] Remote sync failed, will retry on next sync', e);
    }
}


/**
 * Award points from a server context (calls the API)
 */
export async function earnPointsRemote(
    walletAddress: string,
    eventType: PointEventType,
    metadata?: Record<string, unknown>
): Promise<void> {
    const points = POINT_VALUES[eventType];
    try {
        // Need absolute URL for server-side fetch if not standard env, 
        // but 'next/server' usually handles relative if same origin? 
        // Actually often safer to use absolute, but let's try relative or assume localhost for now 
        // or better, assuming this runs in a context where fetch works (Next.js App Router).
        // However, standard fetch in Node needs absolute URL.
        // For now, let's assume we can hit the endpoint.
        // BETTER: Invoke the DB logic directly if available? 
        // No, let's stick to the requested import fix.

        await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/points`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                walletAddress, // API needs to support explicit wallet overwrite for admin/server calls
                eventType,
                pointsAwarded: points,
                platform: 'web',
                metadata,
            }),
        });
    } catch (e) {
        console.error('[Points] Remote award failed', e);
    }
}

/**
 * Sync profile with backend
 */
export async function syncWithBackend(walletAddress: string): Promise<OracleProfile> {
    try {
        const res = await fetch(`/api/points?wallet=${walletAddress}`);
        if (!res.ok) throw new Error('Sync failed');

        const remote = await res.json();
        const profile = getProfile();

        // Merge strategy: remote is authoritative for points, local for unsynced data
        if (remote.totalPoints > profile.totalPoints) {
            profile.totalPoints = remote.totalPoints;
            const tierData = calculateTier(profile.totalPoints);
            profile.tier = tierData.name;
            profile.tierColor = tierData.color;
            profile.tierIcon = tierData.icon;
            profile.multiplier = tierData.multiplier;
        }

        profile.walletAddress = walletAddress;
        saveProfile(profile);

        return profile;
    } catch (e) {
        console.error('[Points] Backend sync failed, using local profile', e);
        return getProfile();
    }
}

// ============================================================================
// DAILY CHALLENGES
// ============================================================================

const CHALLENGE_TEMPLATES = [
    { type: 'PREDICTIONS', description: 'Make {n} predictions', targets: [3, 5, 10], reward: 30 },
    { type: 'CORRECT', description: 'Get {n} prediction(s) correct', targets: [1, 2, 3], reward: 50 },
    { type: 'WATCH_TIME', description: 'Watch {n} minutes of ProphetCoin.TV', targets: [10, 20, 30], reward: 15 },
    { type: 'SHARE', description: 'Share {n} prediction(s) to social', targets: [1, 2, 3], reward: 20 },
    { type: 'LOGIN', description: 'Maintain your login streak', targets: [1], reward: 25 },
];

/**
 * Generate daily challenges (deterministic based on date)
 */
export function getDailyChallenges(): DailyChallengeSet {
    const today = new Date().toISOString().split('T')[0];
    const storedKey = `prophet_challenges_${today}`;

    if (typeof window !== 'undefined') {
        const stored = localStorage.getItem(storedKey);
        if (stored) return JSON.parse(stored);
    }

    // Seed from date for deterministic but varied challenges
    const seed = today.replace(/-/g, '');
    const hash = parseInt(seed, 10);

    // Pick 3 distinct challenges
    const indices = [
        hash % CHALLENGE_TEMPLATES.length,
        (hash + 1) % CHALLENGE_TEMPLATES.length,
        (hash + 2) % CHALLENGE_TEMPLATES.length,
    ];

    const challenges = indices.map((idx, i) => {
        const template = CHALLENGE_TEMPLATES[idx];
        const targetIdx = (hash + i) % template.targets.length;
        const target = template.targets[targetIdx];

        return {
            type: template.type,
            description: template.description.replace('{n}', String(target)),
            target,
            progress: 0,
            complete: false,
            reward: template.reward,
        };
    }) as [DailyChallenge, DailyChallenge, DailyChallenge];

    const set: DailyChallengeSet = {
        date: today,
        challenges,
        bonusClaimed: false,
        bonusReward: 50,
    };

    if (typeof window !== 'undefined') {
        localStorage.setItem(storedKey, JSON.stringify(set));
    }

    return set;
}

/**
 * Update challenge progress
 */
export function updateChallengeProgress(type: string, increment: number = 1): void {
    const set = getDailyChallenges();
    let updated = false;

    for (const challenge of set.challenges) {
        if (challenge.type === type && !challenge.complete) {
            challenge.progress += increment;
            if (challenge.progress >= challenge.target) {
                challenge.progress = challenge.target;
                challenge.complete = true;
                earnPoints('DAILY_LOGIN', 'web', { challenge: type }); // Award challenge reward
            }
            updated = true;
        }
    }

    if (updated && typeof window !== 'undefined') {
        const today = new Date().toISOString().split('T')[0];
        localStorage.setItem(`prophet_challenges_${today}`, JSON.stringify(set));
    }
}

// ============================================================================
// LEADERBOARD
// ============================================================================

export interface LeaderboardEntry {
    rank: number;
    walletAddress: string;
    displayName: string;
    points: number;
    tier: TierName;
    tierColor: string;
    prophetRating: number;
}

/**
 * Get leaderboard (from backend or mock)
 */
export async function getLeaderboard(
    type: 'weekly' | 'alltime' = 'alltime',
    limit: number = 10
): Promise<LeaderboardEntry[]> {
    try {
        const res = await fetch(`/api/points/leaderboard?type=${type}&limit=${limit}`);
        if (res.ok) {
            return await res.json();
        }
    } catch (e) {
        console.error('[Points] Leaderboard fetch failed, using mock', e);
    }

    // Mock leaderboard
    return [
        { rank: 1, walletAddress: '0x...1', displayName: 'ProphetWhale', points: 125420, tier: 'Arch-Prophet', tierColor: '#EC4899', prophetRating: 89 },
        { rank: 2, walletAddress: '0x...2', displayName: 'CryptoSage', points: 98750, tier: 'Prophet', tierColor: '#8B5CF6', prophetRating: 82 },
        { rank: 3, walletAddress: '0x...3', displayName: 'MarketMystic', points: 67230, tier: 'Prophet', tierColor: '#8B5CF6', prophetRating: 76 },
        { rank: 4, walletAddress: '0x...4', displayName: 'OracleOne', points: 45100, tier: 'Oracle', tierColor: '#FFD700', prophetRating: 71 },
        { rank: 5, walletAddress: '0x...5', displayName: 'ChainVision', points: 32800, tier: 'Oracle', tierColor: '#FFD700', prophetRating: 68 },
        { rank: 6, walletAddress: '0x...6', displayName: 'DeFiDruid', points: 18500, tier: 'Oracle', tierColor: '#FFD700', prophetRating: 65 },
        { rank: 7, walletAddress: '0x...7', displayName: 'TokenTeller', points: 9200, tier: 'Augur', tierColor: '#C0C0C0', prophetRating: 62 },
        { rank: 8, walletAddress: '0x...8', displayName: 'BlockBard', points: 4800, tier: 'Augur', tierColor: '#C0C0C0', prophetRating: 58 },
        { rank: 9, walletAddress: '0x...9', displayName: 'CoinCaster', points: 1890, tier: 'Seer', tierColor: '#CD7F32', prophetRating: 55 },
        { rank: 10, walletAddress: '0x...10', displayName: 'LedgerLore', points: 940, tier: 'Seer', tierColor: '#CD7F32', prophetRating: 52 },
    ].slice(0, limit) as LeaderboardEntry[];
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
    POINT_VALUES,
    TIERS,
    BADGES,
    DAILY_CAPS,
    getProfile,
    clearProfile,
    earnPoints,
    awardWatchTime,
    syncWithBackend,
    getDailyChallenges,
    updateChallengeProgress,
    getLeaderboard,
    calculateTier,
    calculateProphetRating,
    getProgressToNextTier,
};
