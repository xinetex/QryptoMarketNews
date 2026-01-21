'use client';

import { useState, useEffect, useCallback } from 'react';
import {
    getProfile,
    earnPoints,
    getProgressToNextTier,
    type OracleProfile,
    type PointEventType
} from '@/lib/points';

export function usePoints() {
    const [points, setPoints] = useState<OracleProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Load points on mount
    useEffect(() => {
        setPoints(getProfile());
        setIsLoading(false);
    }, []);

    // Award points
    const awardPoints = useCallback((
        eventType: PointEventType,
        metadata?: Record<string, unknown>
    ) => {
        earnPoints(eventType, 'web', metadata).then(() => {
            setPoints(getProfile()); // Refresh state
        });
    }, []);

    // Get progress to next level
    const nextLevelInfo = points
        ? getProgressToNextTier(points.totalPoints)
        : { nextLevel: null, pointsNeeded: 0, progress: 0 };

    return {
        points,
        isLoading,
        awardPoints,
        nextLevelInfo,
        totalPoints: points?.totalPoints ?? 0,
        level: points?.tier ?? 'Initiate',
        levelColor: points?.tierColor ?? '#71717a',
        accuracy: points?.prophetRating ?? 0,
        streak: points?.currentStreak ?? 0,
    };
}
