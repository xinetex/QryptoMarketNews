# Task 003: Prophet Oracle AI Engine

**Status:** 🔴 Not Started  
**Agent:** Unassigned  
**Priority:** MEDIUM  
**Estimated Effort:** 3-4 hours  

---

## Objective

Build an AI-powered prediction analysis engine ("Prophet Oracle") that synthesizes market data, news sentiment, and social signals to generate "Prophecies" — actionable insights with confidence scores.

---

## Context

### Strategic Importance
- Core differentiator from competitors
- Creates shareable content ("The Prophet predicted X...")
- Builds trust through tracked accuracy
- Powers content for Prophet TV segments

### Existing Assets
- DomeAPI integration (prediction market data)
- ProphetOracleCard component (exists but may need enhancement)
- OpenAI/LLM API access (check .env)

### Target Output
- Daily "Prophecies" on trending markets
- Confidence score 0-100%
- Reasoning explanation
- Historical accuracy tracking

---

## Requirements

### Functional Requirements

1. **Data Aggregation**
   - Fetch top markets from Dome API
   - Fetch relevant news (crypto news API)
   - Optional: Social sentiment (X/Twitter)

2. **AI Analysis**
   - LLM prompt to analyze data
   - Generate prediction with confidence
   - Provide reasoning summary

3. **Prophecy Output**
   ```typescript
   interface Prophecy {
     id: string;
     marketId: string;
     marketTitle: string;
     prediction: 'YES' | 'NO' | 'NEUTRAL';
     confidence: number; // 0-100
     reasoning: string;
     createdAt: string;
     expiresAt: string;
     outcome?: 'CORRECT' | 'INCORRECT' | 'PENDING';
   }
   ```

4. **Accuracy Tracking**
   - Store prophecies in database/storage
   - Update outcome when market resolves
   - Calculate rolling accuracy %

5. **UI Display**
   - Prophecy cards with prediction + confidence
   - Accuracy badge
   - "The Prophet's Track Record" section

---

## Technical Specification

### Files to Create

```
web/
├── lib/
│   └── oracle/
│       ├── index.ts           # Main oracle service
│       ├── aggregator.ts      # Data fetching
│       ├── analyzer.ts        # LLM analysis
│       └── tracker.ts         # Accuracy tracking
├── components/
│   ├── ProphecyCard.tsx       # Individual prophecy
│   ├── ProphecyFeed.tsx       # List of prophecies
│   └── OracleAccuracy.tsx     # Track record display
└── app/
    └── api/
        └── oracle/
            ├── route.ts       # Get prophecies
            ├── generate/route.ts  # Generate new prophecy
            └── resolve/route.ts   # Mark outcome
```

### LLM Prompt Structure

```typescript
const ORACLE_PROMPT = `
You are the Prophet Oracle, an AI that analyzes prediction markets.

Given the following market:
Title: {{title}}
Current YES price: {{yesPrice}}
Current NO price: {{noPrice}}
Recent news: {{newsSummary}}

Provide your prediction in JSON format:
{
  "prediction": "YES" | "NO" | "NEUTRAL",
  "confidence": 0-100,
  "reasoning": "Brief explanation..."
}

Be bold but justify your confidence level.
`;
```

### API Endpoints

```
GET /api/oracle
  Returns: Prophecy[] (recent prophecies)

POST /api/oracle/generate
  Body: { marketId }
  Returns: Prophecy

POST /api/oracle/resolve
  Body: { prophecyId, outcome }
  Returns: { success, updatedAccuracy }
```

---

## Milestones

### M1: Data Aggregation (45 min)
- [ ] Create aggregator service
- [ ] Fetch top markets from Dome
- [ ] Fetch news headlines
- **Output:** Working data pipeline

### M2: AI Analyzer (1 hour)
- [ ] Create analyzer with LLM integration
- [ ] Design effective prompts
- [ ] Parse LLM response
- **Output:** Can generate prophecies

### M3: Prophecy Storage (30 min)
- [ ] Store prophecies (localStorage or database)
- [ ] Retrieval functions
- **Output:** Persistent prophecies

### M4: Accuracy Tracking (30 min)
- [ ] Outcome resolution logic
- [ ] Accuracy calculation
- **Output:** Track record data

### M5: UI Components (1 hour)
- [ ] ProphecyCard component
- [ ] ProphecyFeed component
- [ ] OracleAccuracy badge
- **Output:** Visible in app

---

## Success Criteria

- [ ] Can generate a prophecy for any market
- [ ] Prophecy includes prediction, confidence, reasoning
- [ ] Prophecies persist and are visible in feed
- [ ] Accuracy % displayed (mock data ok for MVP)
- [ ] No API errors

---

## Dependencies

- Requires OpenAI API key (or alternative LLM)
- Should run after basic Dome integration is stable

## Integration Points

- ProphecyCard can be added to HotMarketsSlider
- Can generate daily content for Prophet TV

---

## Notes for Agent

- Check .env for existing OPENAI_API_KEY
- Start with a simple prompt, iterate
- Use localStorage for MVP rather than database
- The existing ProphetOracleCard component may be a starting point
- Confidence should be honest - don't always say 90%
- Rate limit API calls to avoid cost explosion
