# Task 002: QExchange Rebrand to Prophet

**Status:** 🔴 Not Started  
**Agent:** Unassigned  
**Priority:** HIGH  
**Estimated Effort:** 2-3 hours  

---

## Objective

Rebrand QExchange ("Queef Companion") to Prophet branding. Apply consistent visual identity with Prophet TV while maintaining QExchange's functionality as a distinct trading venue.

---

## Context

### Strategic Importance
- QExchange is "Model C" infrastructure (own trading rails)
- Consistent branding builds ecosystem recognition
- Keeps trading venue separate from media (regulatory clarity)
- Name: "Prophet Markets" or "Prophet Exchange"

### Current State
- QExchange located at: `/Users/letstaco/Documents/QExchange/qexchange-app/`
- Currently branded as "Queef Companion" for $SOLQUEEF
- Has prediction markets, trading, leaderboard, oracle

### Target State
- Rebranded as "Prophet Markets"
- Uses Prophet square logo (QC box)
- Consistent color scheme with Prophet TV
- Professional appearance for stakeholder demos

---

## Requirements

### Visual Identity Changes

1. **Logo & Navbar**
   - Replace "Queef Companion" with "Prophet Markets"
   - Add QC square logo (white box, black text)
   - Match Prophet TV navbar style

2. **Color Scheme**
   - Primary: Keep existing or align with Prophet TV
   - Accent: Indigo/purple gradient
   - Background: Dark (#09090b or similar)

3. **Page Titles & Meta**
   - Update all page titles to "Prophet Markets"
   - Update meta descriptions
   - Update favicon

4. **Content Updates**
   - Replace $SOLQUEEF references with generic or Prophet branding
   - Update hero section messaging
   - Professional copy throughout

---

## Technical Specification

### Files to Modify

```
qexchange-app/src/
├── app/
│   ├── layout.tsx                 # Meta, title, favicon
│   ├── page.tsx                   # Hero section
│   └── markets/page.tsx           # Markets title
├── components/
│   └── layout/
│       └── Navbar.tsx             # Main navbar (may need to create)
└── public/
    └── favicon.ico                # Update favicon
```

### Logo Component

```tsx
<Link href="/" className="flex items-center gap-2">
    <div className="w-6 h-6 bg-white text-black rounded flex items-center justify-center font-bold text-xs tracking-tighter">
        QC
    </div>
    <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
        Prophet Markets
    </span>
</Link>
```

### Metadata Updates

```tsx
export const metadata: Metadata = {
  title: "Prophet Markets - Prediction Trading",
  description: "Trade on real-world events with Prophet Markets. Crypto-native prediction market platform.",
  // ...
};
```

---

## Milestones

### M1: Navbar Update (30 min)
- [ ] Locate or create Navbar component
- [ ] Apply Prophet logo and branding
- [ ] Update navigation links text if needed
- **Output:** Prophet-branded navbar

### M2: Page Titles & Meta (20 min)
- [ ] Update layout.tsx metadata
- [ ] Update any hardcoded page titles
- [ ] Verify Open Graph tags
- **Output:** Correct titles in browser

### M3: Hero Section (30 min)
- [ ] Update home page hero content
- [ ] Remove $SOLQUEEF specific messaging
- [ ] Professional copy
- **Output:** Clean hero section

### M4: Logo Assets (20 min)
- [ ] Create/update favicon
- [ ] Update any logo images in public/
- **Output:** Consistent logo assets

### M5: Full Audit (30 min)
- [ ] Search codebase for "Queef", "SOLQUEEF"
- [ ] Replace all instances
- [ ] Visual review of all pages
- **Output:** No old branding visible

---

## Success Criteria

- [ ] Navbar shows "Prophet Markets" with QC logo
- [ ] All page titles say "Prophet Markets"
- [ ] No "Queef" or "$SOLQUEEF" visible anywhere
- [ ] Consistent professional appearance
- [ ] Site loads without errors
- [ ] Favicon updated

---

## Dependencies

- None (can run in parallel with other tasks)

## Integration Points

- After completion, Prophet TV can link to Prophet Markets
- "Trade on QExchange" buttons should update to Prophet Markets URL

---

## Notes for Agent

- The goal is professional appearance for investor/stakeholder demos
- Keep all functionality intact - only visual/branding changes
- If layout components don't exist, create minimal versions
- Search for hardcoded strings: `grep -r "queef" src/` (case insensitive)
- Deployed URL may be qppbet.vercel.app - update if possible
