'use client';

import { useState, useEffect, useCallback } from 'react';
import {
    getPoints,
    earnPoints,
    getPointsToNextLevel,
    type UserPoints,
    type PointEventType
} from '@/lib/points';

export function usePoints() {
    const [points, setPoints] = useState<UserPoints | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Load points on mount
    useEffect(() => {
        setPoints(getPoints());
        setIsLoading(false);
    }, []);

    // Award points
    const awardPoints = useCallback((
        eventType: PointEventType,
        metadata?: Record<string, unknown>
    ) => {
        const result = earnPoints(eventType, metadata);
        setPoints(getPoints()); // Refresh state
        return result;
    }, []);

    // Get progress to next level
    const nextLevelInfo = points
        ? getPointsToNextLevel(points.totalPoints)
        : { nextLevel: null, pointsNeeded: 0, progress: 0 };

    return {
        points,
        isLoading,
        awardPoints,
        nextLevelInfo,
        totalPoints: points?.totalPoints ?? 0,
        level: points?.level ?? 'Bronze',
        levelColor: points?.levelColor ?? '#CD7F32',
        accuracy: points?.predictions.accuracy ?? 0,
        streak: points?.streak.current ?? 0,
    };
}
