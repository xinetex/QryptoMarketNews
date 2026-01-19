# Task 005: Prophet Ads Wallet Targeting Integration

**Status:** 🔴 Not Started  
**Agent:** Unassigned  
**Priority:** HIGH  
**Estimated Effort:** 4-6 hours  

---

## Objective

Integrate wallet-based targeting into our existing ad network (`/Users/letstaco/Documents/ad-network`) to enable the world's first wallet-targeted CTV advertising platform.

---

## Context

### Strategic Importance
- We **own the ad stack** — no Verdoni partnership needed
- First-to-market with wallet-aware CTV ads
- 100% revenue retention vs revenue share with a partner
- Premium CPMs for crypto advertisers (5-10x standard)

### Existing Assets
- **Ad Network:** `/Users/letstaco/Documents/ad-network`
  - VAST 3.0 API (`/api/vast`)
  - Decision Engine (`/api/decision`)
  - Campaign Management
  - Venue Targeting
  - Analytics/Reporting
  
- **Prophet TV Roku:** `/Users/letstaco/Documents/QCrypto Channel/roku`
  - Already has second-screen QR pairing
  - Ready for VAST integration

### Target State
- Users can link wallet to Prophet TV profile
- Ads can target based on on-chain holdings
- Crypto advertisers can create wallet-targeted campaigns

---

## Requirements

### Functional Requirements

1. **Wallet Connection**
   - Add WalletConnect or similar to user profile flow
   - Store wallet address (hashed) in ad network DB
   - Link to viewing session via device ID

2. **On-Chain Data Integration**
   - Fetch ETH/SOL holdings via Alchemy or Moralis
   - Cache holdings with reasonable TTL (1 hour)
   - Create targeting segments:
     - ETH Holder (>0.1 ETH)
     - SOL Holder (>1 SOL)
     - DeFi User (interacted with Uniswap, Aave, etc.)
     - NFT Collector
     - Whale (>$100k holdings)

3. **Ad Decision Engine Enhancement**
   - Modify `/api/decision` to accept wallet segment data
   - Match campaigns to user segments
   - Priority: wallet-targeted > venue-targeted > general

4. **Campaign Creation Enhancement**
   - Add wallet targeting options to campaign UI
   - Allow advertisers to select target segments
   - Set premium pricing for wallet-targeted

5. **Prophet TV Integration**
   - Modify Roku app to request ads via VAST with device ID
   - Pass segment hints in ad request
   - Display served creative

---

## Technical Specification

### Files to Modify/Create

**Ad Network:**
```
ad-network/
├── app/
│   └── api/
│       ├── decision/route.ts     # Add wallet segment matching
│       └── wallet/
│           ├── connect/route.ts  # Wallet connection endpoint
│           └── segments/route.ts # Get user segments
├── lib/
│   └── onchain.ts               # Alchemy/Moralis integration
└── components/
    └── campaigns/
        └── WalletTargeting.tsx  # Campaign UI component
```

**Prophet Roku:**
```
roku/
└── components/
    └── AdService.brs           # VAST ad request integration
```

### Database Schema Addition

```sql
-- Add to ad network schema
CREATE TABLE wallet_segments (
  id UUID PRIMARY KEY,
  device_id TEXT NOT NULL,
  wallet_address_hash TEXT NOT NULL,
  segments TEXT[], -- ['eth_holder', 'defi_user', 'whale']
  holdings_usd NUMERIC,
  last_updated TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE wallet_campaigns (
  campaign_id UUID REFERENCES campaigns(id),
  target_segments TEXT[],
  premium_multiplier NUMERIC DEFAULT 2.0
);
```

### API Endpoints

```
POST /api/wallet/connect
  Body: { deviceId, walletAddress }
  Returns: { success, segments[] }

GET /api/wallet/segments/:deviceId
  Returns: { segments[], holdingsUsd, lastUpdated }

POST /api/decision (enhanced)
  Body: { deviceId, venueId?, segments? }
  Returns: { vastUrl, creative, targeting }
```

---

## Milestones

### M1: Wallet Connection (1 hour)
- [ ] Create `/api/wallet/connect` endpoint
- [ ] Hash and store wallet address
- [ ] Link to device ID
- **Output:** Can connect wallet to device

### M2: On-Chain Integration (1.5 hours)
- [ ] Add Alchemy/Moralis SDK
- [ ] Create `lib/onchain.ts`
- [ ] Fetch and cache holdings
- [ ] Generate segment tags
- **Output:** Segments derived from wallet

### M3: Decision Engine Enhancement (1 hour)
- [ ] Modify decision route to accept segments
- [ ] Add segment matching logic
- [ ] Prioritize wallet-targeted campaigns
- **Output:** Can serve wallet-targeted ads

### M4: Campaign UI (1 hour)
- [ ] Add WalletTargeting component
- [ ] Integrate into campaign creation
- [ ] Add premium pricing display
- **Output:** Advertisers can create wallet campaigns

### M5: Prophet TV Integration (1 hour)
- [ ] Create AdService.brs component
- [ ] Request VAST with device context
- [ ] Display served ads
- **Output:** End-to-end wallet-targeted ads

---

## Success Criteria

- [ ] Can connect wallet via second-screen
- [ ] Segments correctly derived from holdings
- [ ] Wallet-targeted campaigns served correctly
- [ ] Premium CPMs applied
- [ ] Analytics track wallet-targeted impressions
- [ ] Works end-to-end on Roku

---

## Dependencies

- Alchemy or Moralis API key
- Ad network database access
- Prophet Roku app deployment capability

---

## Notes for Agent

- Prioritize security — hash wallet addresses, no PII storage
- Use caching to avoid excessive API calls
- Test with mock data first before live wallets
- This is the "killer app" for crypto advertisers
