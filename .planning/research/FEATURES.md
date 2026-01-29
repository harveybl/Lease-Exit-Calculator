# Feature Research

**Domain:** Vehicle Lease Tracking & Lease-End Decision Tools
**Researched:** 2026-01-28
**Confidence:** MEDIUM

## Feature Landscape

### Table Stakes (Users Expect These)

Features users assume exist. Missing these = product feels incomplete.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Basic lease entry | Core requirement for any lease tool | LOW | Must capture: monthly payment, term length, mileage limit, residual value, overage fees |
| Current mileage tracking | Essential for knowing where you stand | LOW | Manual entry with date stamping |
| Mileage projection | Predict if you'll go over | LOW | Simple math: (current - start) / months elapsed * total months |
| Lease end date calculation | Know when lease expires | LOW | Auto-calculate from start date + term |
| Overage cost estimate | Critical financial data point | LOW | Excess miles × overage fee rate |
| Current market value lookup | Need to know what car is worth today | MEDIUM | Integration with KBB/Edmunds APIs or manual entry fallback |
| Buyout cost calculation | Residual + fees = total buyout | LOW | Include acquisition fees, disposition fees, sales tax |
| Equity calculation | Market value - buyout cost = equity | LOW | Critical decision point for all exit options |
| Multiple lease storage | Users may have multiple vehicles | LOW | Local storage with ability to switch between leases |
| Return option summary | Default/baseline exit option | LOW | Show disposition fees, excess mileage, wear/tear estimates |

### Differentiators (Competitive Advantage)

Features that set the product apart. Not required, but valuable.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Side-by-side option comparison | Core value: compare ALL options at once | MEDIUM | Display return, buyout, sell, early termination, extension in parallel columns |
| Month-by-month timeline view | Show when financial windows open/close | HIGH | Interactive timeline showing cost changes over remaining months |
| Smart recommendation engine | Tell user the best option RIGHT NOW | MEDIUM | Analyze all factors and highlight optimal choice with reasoning |
| Market value trend tracking | Historical data shows if values rising/falling | HIGH | Track value over time, predict future trends |
| Guided lease entry with explanations | Reduce confusion on lease terms | MEDIUM | Educational tooltips explaining residual, money factor, cap cost, etc. |
| Early termination cost modeling | Most tools ignore this option | MEDIUM | Calculate remaining depreciation + early term fee + disposition |
| Lease extension scenario | What if I keep paying month-to-month? | LOW | Show month-to-month rate, total cost over 3/6/12 months |
| Trade-in offer integration | See what dealers will give you | HIGH | Integration with dealer networks or manual entry |
| Visual cost breakdowns | Charts showing cost composition | MEDIUM | Pie/bar charts for depreciation, finance, taxes |
| Decision timeline alerts | "Check back in 3 months for better window" | MEDIUM | Predictive notifications based on market trends |
| Lease transfer/swap analysis | Include third option: find someone to take over | MEDIUM | Estimate transfer fees, compare to other exit options |
| Total cost of ownership comparison | Extend lease vs buy new vs keep current | HIGH | Multi-year projection including maintenance, depreciation |

### Anti-Features (Commonly Requested, Often Problematic)

Features that seem good but create problems.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Automatic mileage tracking via OBD-II | Sounds convenient, futuristic | Privacy concerns, hardware costs, connection issues, limited phone compatibility | Manual entry with reminders (monthly notification to update) |
| Real-time dealer inventory matching | "Find my exact buyout alternative" | Complex dealer integrations, regional variations, stale data | General market comparisons with manual dealer research step |
| Automated credit check/financing | One-stop-shop appeal | Requires financial institution partnerships, regulatory compliance, hard credit pulls | Display estimated rates, link to lenders, let user handle separately |
| Lease negotiation assistance | "Get me the best deal" | Scope creep into brokerage services, requires human intervention | Educational content on negotiation tactics, decision support only |
| Multi-user collaboration | Share lease decisions with family | Complex permissions, account management, authentication | Export/share features (PDF reports, shareable links) are simpler |
| Predictive maintenance scheduling | "Tell me when to service" | Out of scope, duplicates existing car apps | Focus on financial decisions only |
| Insurance cost comparisons | Comprehensive ownership costs | Insurance APIs are difficult, regional complexity | Note insurance as factor, don't calculate |
| Vehicle condition assessment | Estimate wear/tear charges | Requires photo uploads, subjective AI analysis, liability | Provide industry standard wear/tear guidelines, manual estimation |

## Feature Dependencies

```
[Lease Entry Form]
    └──required for──> [All Calculations]
                           ├──> [Mileage Projection]
                           ├──> [Overage Cost]
                           ├──> [Buyout Calculation]
                           └──> [Equity Calculation]

[Market Value Lookup]
    └──required for──> [Equity Calculation]
                           └──required for──> [Option Comparison]
                                                  └──required for──> [Smart Recommendation]

[Multiple Leases] ──enhances──> [Timeline View] (see all leases' critical dates)

[Timeline View] ──enhances──> [Decision Alerts] (trigger when windows open)

[Guided Entry] ──conflicts with──> [Quick Entry] (can't be both comprehensive AND fast)
```

### Dependency Notes

- **Lease Entry required for Everything:** All calculations depend on accurate lease data capture. This must be rock-solid before building comparisons.
- **Market Value gates Recommendations:** Can't recommend buy/sell without knowing current market value. Must have reliable value source or manual override.
- **Timeline View enhances Alerts:** Timeline visualization makes alerts more meaningful by showing context of decision windows.
- **Guided vs Quick Entry tension:** Must balance thoroughness with speed. Consider two modes or progressive disclosure.

## MVP Definition

### Launch With (v1)

Minimum viable product — what's needed to validate core value proposition.

- [ ] **Basic lease entry form** — All calculations depend on this data foundation
- [ ] **Current mileage tracking** — Essential for knowing lease position
- [ ] **Mileage overage projection** — High-anxiety calculation users need immediately
- [ ] **Market value lookup (manual entry)** — Can't calculate equity without it; start with manual entry, API integration later
- [ ] **Five option comparison view** — THE differentiator: Return, Buyout, Sell (private), Early Termination, Extension
- [ ] **Equity calculation** — Critical decision metric that existing tools bury
- [ ] **Cost breakdown per option** — Transparent display of all fees, not just monthly payment
- [ ] **Single lease storage** — Local storage for one lease to start
- [ ] **Guided lease entry** — Reduce confusion on terms like residual, money factor, cap cost

**Rationale:** These nine features deliver the core value proposition: "Show the smartest financial move for your lease right now." Everything else can wait for validation.

### Add After Validation (v1.x)

Features to add once core is working and users are engaged.

- [ ] **Multiple lease tracking** — Trigger: users request ability to track multiple vehicles
- [ ] **Month-by-month timeline view** — Trigger: users want to see how options change over time
- [ ] **Smart recommendation engine** — Trigger: users ask "which option is best?"
- [ ] **KBB/Edmunds API integration** — Trigger: manual value entry proves too cumbersome
- [ ] **Lease transfer/swap option** — Trigger: users mention Swapalease/LeaseTrader alternatives
- [ ] **Decision window alerts** — Trigger: users express interest in "check back later" functionality
- [ ] **Visual charts for cost breakdown** — Trigger: users want better visualization
- [ ] **Export to PDF/shareable link** — Trigger: users want to share analysis with spouse/family

### Future Consideration (v2+)

Features to defer until product-market fit is established.

- [ ] **Market value trend tracking** — Why defer: requires historical data collection over time
- [ ] **Trade-in offer aggregation** — Why defer: complex dealer integrations, may not be core value
- [ ] **Total cost of ownership projections** — Why defer: scope creep into broader financial planning
- [ ] **Mobile app (iOS/Android)** — Why defer: web-first validates concept, native apps are 3x development cost
- [ ] **Notification system (email/SMS)** — Why defer: requires backend infrastructure, user accounts
- [ ] **Custom mileage tracking reminders** — Why defer: nice-to-have after core comparison working

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Lease entry form | HIGH | LOW | P1 |
| Five option comparison | HIGH | MEDIUM | P1 |
| Mileage tracking/projection | HIGH | LOW | P1 |
| Equity calculation | HIGH | LOW | P1 |
| Market value lookup (manual) | HIGH | LOW | P1 |
| Guided entry tooltips | MEDIUM | LOW | P1 |
| Cost breakdowns | HIGH | LOW | P1 |
| Multiple lease tracking | MEDIUM | LOW | P2 |
| Month-by-month timeline | HIGH | HIGH | P2 |
| Smart recommendations | HIGH | MEDIUM | P2 |
| KBB/Edmunds API | MEDIUM | MEDIUM | P2 |
| Lease transfer option | MEDIUM | LOW | P2 |
| Visual charts | MEDIUM | MEDIUM | P2 |
| Export/share | LOW | LOW | P2 |
| Value trend tracking | MEDIUM | HIGH | P3 |
| Trade-in aggregation | LOW | HIGH | P3 |
| TCO projections | MEDIUM | HIGH | P3 |
| Mobile apps | MEDIUM | HIGH | P3 |
| Notification system | LOW | MEDIUM | P3 |

**Priority key:**
- P1: Must have for launch (validates core concept)
- P2: Should have, add when validated (improves retention)
- P3: Nice to have, future consideration (expands market)

## Competitor Feature Analysis

| Feature | Edmunds/KBB | Leasehackr | LeaseEnd AI | Our Approach |
|---------|-------------|------------|-------------|--------------|
| Lease calculator | Payment estimation only | Full deal analysis | Buyout focus only | All exit options side-by-side |
| Market value lookup | Yes (owned by them) | No | Yes (AI-powered) | Manual entry MVP, API later |
| Buyout calculation | Basic | Advanced | Yes with financing | Transparent cost breakdown |
| Mileage tracking | No | No | No | Core feature with projections |
| Option comparison | Lease vs Buy only | New lease deals | Buyout vs Return | Return/Buyout/Sell/Terminate/Extend |
| Timeline view | No | No | No | DIFFERENTIATOR |
| Lease storage | No | Deal comparison | Single lease focus | Multiple leases tracked |
| Guided entry | Basic tooltips | Advanced (for experts) | Minimal (AI chat) | Educational for regular users |
| Recommendations | No | Community-driven | AI buyout estimate | Algorithm-driven best option |
| Early termination | Not mentioned | Not covered | Not covered | Explicitly included |
| Lease transfer | Not mentioned | Forum discussions | Not mentioned | Integrated option |

**Key Insights:**
- **Edmunds/KBB:** Strong on valuation, weak on lease-end decisions (focused on new lease acquisition)
- **Leasehackr:** Expert tool for negotiating NEW leases, not lease-end decisions
- **LeaseEnd AI:** Buyout-only focus with financing, ignores other exit options
- **Gap in market:** No tool compares ALL exit options side-by-side with transparent cost breakdowns

## User Experience Patterns

### Data Entry Patterns

**From Research:**
- LeaseEnd AI uses chat interface (1-minute entry with name, address, VIN)
- Traditional calculators use multi-field forms (10+ fields)
- LeaseTrack app focuses on minimal entry (mileage updates only)

**Our Approach:**
- Progressive disclosure: start with 5 essential fields, expand for accuracy
- Educational tooltips for confusing terms (residual, money factor, disposition fee)
- Smart defaults where possible (common overage rates, typical fees)
- Manual override for all auto-populated fields

### Calculation Transparency

**Industry Standard:**
- Most tools show result only, hide calculation steps
- Lease calculators show monthly payment, not total cost
- Equity calculations often buried or not shown

**Our Approach:**
- Show formulas: "Market Value ($X) - Buyout Cost ($Y) = Equity ($Z)"
- Itemized cost breakdowns: disposition fee, overage, sales tax, etc.
- Comparison baseline: all options shown relative to "do nothing" scenario

### Decision Support Patterns

**From Research:**
- Most tools are passive calculators, don't recommend action
- LeaseEnd AI recommends buyout (biased toward their financing partners)
- Leasehackr relies on community forum advice (not scalable)

**Our Approach:**
- Algorithm highlights best option with reasoning
- Show confidence level (High/Medium/Low based on market volatility)
- Time-based recommendations: "Best option today" vs "Best option in 3 months"
- No financial bias (not tied to financing, dealerships, or lenders)

## Mobile vs Desktop Considerations

**Research Findings:**
- Lease tracking apps (LeaseTrack, Mileage Tracker) are mobile-first (quick mileage updates)
- Lease calculators (Edmunds, Leasehackr) are desktop-focused (complex data entry)
- Decision-making tends to happen on desktop (research mode)
- Quick checks happen on mobile (current mileage status)

**Our Approach (Web-First):**
- Responsive web app works on both desktop and mobile
- Desktop optimized for initial entry and side-by-side comparisons
- Mobile optimized for quick mileage updates and current status check
- Progressive Web App (PWA) for "add to home screen" without native app cost

## Complexity Budget

**Low Complexity (Quick Wins):**
- Lease data entry form
- Mileage projection math
- Equity calculation
- Local storage
- Cost itemization
- Static option comparison
- Guided tooltips

**Medium Complexity (1-2 weeks each):**
- Side-by-side comparison layout
- Market value API integration
- Smart recommendation algorithm
- Visual charts
- Export to PDF
- Multiple lease switching

**High Complexity (3-4 weeks each):**
- Month-by-month timeline view
- Market value trend tracking
- Trade-in offer aggregation
- Total cost of ownership projection
- Real-time decision alerts

**Out of Scope (v1-v2):**
- Automatic OBD-II mileage tracking
- Credit checks and financing
- Multi-user collaboration
- Predictive maintenance
- Insurance comparisons
- Vehicle condition AI assessment

## Sources

### Lease Tracking & Management Software
- [Best Auto Dealer Software with Lease Tracking 2026 | GetApp](https://www.getapp.com/retail-consumer-services-software/auto-dealers/f/lease-tracking/)
- [Vehicle leasing software - Wialon](https://wialon.com/en/vehicle-leasing-software)
- [Fleet Lease Management Software - Fleetio](https://www.fleetio.com/industries/vehicle-leasing-fleet-software)
- [Car leasing software - Fintech Market](https://fintech-market.com/car-lease)

### Lease-End Decision Tools
- [Lease End Introduces AI-Powered Lease Buyout Calculator](https://globalfintechseries.com/artificial-intelligence/lease-end-introduces-ai-powered-lease-buyout-calculator/)
- [Lease Payoff Calculator Resources - LeaseEnd](https://www.leaseend.com/learn/lease-buyout-calculator)
- [Calculate Your Car Lease-End Options - Credit Finance +](https://www.creditfinanceplus.com/calculators/calculate-car-lease-end-options.php)
- [Vehicle Lease Calculator 2026 — Global Tax & TCO Engine](https://calculatorat.com/vehicle-lease-calculator/)

### Major Calculator Tools
- [Car Lease Calculator - Edmunds](https://www.edmunds.com/calculators/car-lease.html)
- [Leasehackr Calculator](https://leasehackr.com/calculator)
- [Car Lease Calculator - Kelley Blue Book](https://www.kbb.com/car-lease-calculator/)
- [Lease vs Buy Calculator - Bankrate](https://www.bankrate.com/loans/auto-loans/lease-vs-buy-calculator/)

### Buyout & Return Comparison
- [Lease Return vs Buyout Calculator - VSCalculator](https://www.vscalculator.com/calculators/lease-return-vs-buyout)
- [Car Lease Buyout Calculator - MyExactCount](https://www.myexactcount.online/)
- [Lease Buyout Calculator Guide - Nowee](https://nowee.org/lease-buyout-calculator-guide/)
- [Lease vs Buy Car Calculator - Edmunds](https://www.edmunds.com/calculators/lease-vs-buy-calculator/)

### Personal Lease Tracking Apps
- [My Car Lease Tracker - App Store](https://apps.apple.com/us/app/my-car-lease-tracker/id6741158231)
- [Lease Mileage Tracker Pro - App Store](https://apps.apple.com/us/app/lease-mileage-tracker-pro/id6744463114)
- [LeaseTrack App - App Store](https://apps.apple.com/us/app/leasetrack/id1632037291)
- [Leasehackr - America's Smartest Car Shopping Hub](https://leasehackr.com)
- [Top Apps for Leasing a Car in 2025 - DriveOZ](https://driveoz.com/top-apps-for-leasing-a-car-in-2025/)

### Early Termination & Exit Options
- [Calculate Your Car Lease-End Options - Credit Finance +](https://www.creditfinanceplus.com/calculators/calculate-car-lease-end-options.php)
- [Returning a leased vehicle early - U.S. Bank](https://www.usbank.com/vehicle-loans/auto-loans/auto-leasing/returning-a-leased-vehicle-early.html)
- [Lease Kit - Early Termination Guide - LeaseGuide](https://www.leaseguide.com/endlease/)
- [Can you get out of a car lease early? - Progressive](https://www.progressive.com/answers/get-out-of-car-lease/)

### Market Value Lookup
- [Instant Used Car Value & Trade-In Value - KBB](https://www.kbb.com/whats-my-car-worth/)
- [Kelley Blue Book - New and Used Car Values](https://www.kbb.com/)
- [Instant Used Car Value - Edmunds](https://www.edmunds.com/appraisal/)

### Mileage Tracking & Overage
- [Lease Mileage Calculator - Omni Calculator](https://www.omnicalculator.com/finance/lease-mileage)
- [Lease Mileage Calculator - Good Calculators](https://goodcalculators.com/lease-mileage-calculator/)
- [Lease Mileage Calculator - LeaseGuide](https://www.leaseguide.com/lease-mileage-calculator/)
- [My Lease Info - Mileage Tracking](https://www.myleaseinfo.com/)

### Lease Transfer Services
- [Leasetrader vs. Swapalease Guide - eAutoLease](https://www.eautolease.com/leasetrader-vs-swapalease-lease-transfer-guide/)
- [Top 5 Car Lease Trade Platforms - Quit A Lease](https://blog.quitalease.com/top-5-car-lease-trade-platforms-to-simplify-your-lease-swapping/)
- [Best Lease Takeover Sites for 2025 - DriveOZ](https://driveoz.com/the-best-lease-takeover-sites-for-2025-your-guide-to-smart-car-leasing/)
- [LeaseTrader.com](https://www.leasetrader.com/)

### Payment Calculation & Breakdown
- [How to Calculate Your Own Lease Payment - Edmunds](https://www.edmunds.com/car-leasing/calculate-your-own-lease-payment.html)
- [Auto Lease Calculator - Bankrate](https://www.bankrate.com/loans/auto-loans/auto-lease-calculator/)
- [Car Lease Payment Calculator - US News](https://cars.usnews.com/cars-trucks/car-loans-and-leasing/car-lease-calculator)

### Notification & Alert Tools
- [Lease Renewal Tracking | Expiration Reminder](https://www.expirationreminder.com/solutions/lease-renewal-tracking-software)
- [Simplify Expiration Tracking with Remindax](https://www.remindax.com/)
- [Critical Date Tracking - iLeasePro](https://ileasepro.com/critical-date-tracking/index.html)
- [Best Contract Reminder Software 2024 - Contract Hound](https://contracthound.com/contract-reminder-software/)

### Common Mistakes & Best Practices
- [The 2024 Consumer Car Lease Guide - LeaseGuide](https://www.leaseguide.com/)
- [How to Lease a Car & Mistakes to Avoid - Ally](https://www.ally.com/stories/car/how-to-lease-a-car-mistakes-to-avoid/)
- [Common Car Leasing Mistakes - US News](https://cars.usnews.com/cars-trucks/advice/car-leasing-mistakes-that-cost-you)
- [Mistakes to Avoid When Leasing - eAutoLease](https://www.eautolease.com/mistakes-to-avoid-when-leasing-a-car/)

---
*Feature research for: Vehicle Lease Tracking & Lease-End Decision Tools*
*Researched: 2026-01-28*
