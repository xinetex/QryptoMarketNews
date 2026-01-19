# Task 001: Prophet Points System

**Status:** 🔴 Not Started  
**Agent:** Unassigned  
**Priority:** HIGH  
**Estimated Effort:** 2-3 hours  

---

## Objective

Implement a loyalty/reputation points system for Prophet TV users. Points are earned through engagement, predictions, and accuracy. This is the foundation for the eventual Prophet Token.

---

## Context

### Strategic Importance
- Phase 1 of the token strategy (Points → Token pipeline)
- Enables gamification and retention
- Creates shareable "accuracy score" for social proof
- No regulatory complexity (non-transferable loyalty points)

### Related Assets
- Prophet TV Web: `/Users/letstaco/Documents/QCrypto Channel/web/`
- Existing user context: Check if auth system exists

---

## Requirements

### Functional Requirements

1. **Point Earning Events**
   - Prediction made: +10 points
   - Correct prediction: +50 points
   - Daily login: +5 points
   - Share to social: +15 points
   - Streak bonus: +10 points per day (max 7 days)

2. **Point Display**
   - Header component showing current points
   - Animated increment on point gain
   - Level/tier based on total points (Bronze, Silver, Gold, Prophet)

3. **Leaderboard**
   - Top 100 users by points
   - Weekly and all-time views
   - User's rank display

4. **Accuracy Tracking**
   - Total predictions made
   - Correct predictions
   - Accuracy percentage
   - Streak counter

### Non-Functional Requirements
- Points should persist (localStorage initially, database later)
- Real-time updates without page refresh
- Mobile-responsive design
- Matches Prophet TV dark theme

---

## Technical Specification

### Files to Create

```
web/
├── lib/
│   └── points.ts              # Points service (earn, get, leaderboard)
├── hooks/
│   └── usePoints.ts           # React hook for points state
├── components/
│   ├── PointsDisplay.tsx      # Header points badge
│   ├── PointsAnimation.tsx    # +50 floating animation
│   ├── Leaderboard.tsx        # Leaderboard component
│   └── AccuracyBadge.tsx      # Accuracy percentage display
└── app/
    └── api/
        └── points/
            └── route.ts       # Points API endpoint
```

### Data Model

```typescript
interface UserPoints {
  userId: string;
  totalPoints: number;
  level: 'bronze' | 'silver' | 'gold' | 'prophet';
  predictions: {
    total: number;
    correct: number;
    accuracy: number;
  };
  streak: {
    current: number;
    lastActive: string; // ISO date
  };
  history: PointEvent[];
}

interface PointEvent {
  id: string;
  type: 'PREDICTION' | 'CORRECT' | 'LOGIN' | 'SHARE' | 'STREAK';
  points: number;
  timestamp: string;
  metadata?: Record<string, any>;
}
```

### API Endpoints

```
POST /api/points/earn
  Body: { userId, eventType, metadata? }
  Returns: { newTotal, pointsAwarded, level }

GET /api/points/user/:userId
  Returns: UserPoints

GET /api/points/leaderboard
  Query: { timeframe: 'weekly' | 'alltime', limit: number }
  Returns: LeaderboardEntry[]
```

---

## Milestones

### M1: Database Schema (30 min)
- [ ] Define Prisma schema OR localStorage structure
- [ ] Create migration if using database
- **Output:** Schema file or localStorage keys defined

### M2: Points Service (45 min)
- [ ] Create `lib/points.ts` with core logic
- [ ] Implement point calculations
- [ ] Create `usePoints` hook
- **Output:** Working points service

### M3: UI Components (1 hour)
- [ ] `PointsDisplay` component
- [ ] `PointsAnimation` component
- [ ] Style to match Prophet TV theme
- **Output:** Visible points in header

### M4: Leaderboard (45 min)
- [ ] `Leaderboard` component
- [ ] Weekly/all-time toggle
- [ ] User rank highlight
- **Output:** Functional leaderboard page

### M5: Integration (30 min)
- [ ] Add PointsDisplay to main layout
- [ ] Wire up prediction events
- [ ] Test end-to-end flow
- **Output:** Points system live in app

---

## Success Criteria

- [ ] User can see their point balance in the header
- [ ] Making a prediction awards points with animation
- [ ] Leaderboard shows top users
- [ ] Accuracy percentage displays correctly
- [ ] Points persist across page refreshes
- [ ] No console errors

---

## Dependencies

- None (can run in parallel with other tasks)

## Integration Points

- After completion, orchestrator will integrate `PointsDisplay` into main layout
- Will connect to prediction events when Prophet Markets is ready

---

## Notes for Agent

- Use localStorage for MVP, can migrate to database later
- Match the existing Prophet TV design system (dark theme, zinc colors)
- Check existing components for style patterns
- Priority is speed to functional MVP over perfection
