# Architecture Research

**Domain:** Vehicle Lease Tracking and Financial Comparison
**Researched:** 2026-01-28
**Confidence:** HIGH

## Standard Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                   Presentation Layer                         │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │ Lease    │  │ Timeline │  │ Compare  │  │ Settings │    │
│  │ Entry    │  │ Visual.  │  │ View     │  │ Auth     │    │
│  │ (Forms)  │  │ (Charts) │  │ (Table)  │  │          │    │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘    │
│       │             │             │             │           │
├───────┴─────────────┴─────────────┴─────────────┴───────────┤
│                   Business Logic Layer                       │
├─────────────────────────────────────────────────────────────┤
│  ┌────────────────┐  ┌────────────────┐  ┌──────────────┐  │
│  │  Calculation   │  │  Comparison    │  │  Valuation   │  │
│  │  Engine        │  │  Engine        │  │  Service     │  │
│  │  (Pure Fns)    │  │  (Scenarios)   │  │  (API Proxy) │  │
│  └────────┬───────┘  └────────┬───────┘  └──────┬───────┘  │
│           │                   │                  │           │
├───────────┴───────────────────┴──────────────────┴───────────┤
│                   State Management Layer                     │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Lease Store  │  │ User Store   │  │ Cache Store  │      │
│  │ (Zustand)    │  │ (Context)    │  │ (Query)      │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                 │                  │               │
├─────────┴─────────────────┴──────────────────┴───────────────┤
│                   Data Persistence Layer                     │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  IndexedDB   │  │  External    │  │  localStorage│      │
│  │  (Leases,    │  │  APIs        │  │  (Config,    │      │
│  │  Calcs)      │  │  (KBB,       │  │  Prefs)      │      │
│  │              │  │  Edmunds)    │  │              │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| **Lease Entry Forms** | Guided lease data capture with field validation and explanatory tooltips | React components with React Hook Form or Formik for validation |
| **Timeline Visualization** | Month-by-month chart showing cost evolution across different exit scenarios | React Timeline component (Material UI Timeline or custom with D3.js/Recharts) |
| **Comparison Engine** | Evaluate multiple exit paths (return, sell, buyout, early termination, keep paying) in parallel | Pure TypeScript functions that operate on immutable lease data structures |
| **Calculation Engine** | Core financial calculations (depreciation, rent charge, residual value, total cost) | Standalone library with pure functions, isolated from UI framework |
| **Valuation Service** | Interface to vehicle valuation APIs (KBB, Edmunds) with caching and manual override | Service layer with HTTP client, cache-first strategy using TanStack Query |
| **State Management** | Global state for leases, user preferences, cached valuations | Zustand for lease data, React Context for auth/user, TanStack Query for server state |
| **Data Persistence** | Store lease records, calculation history, user preferences locally | IndexedDB for structured data (leases, calculations), localStorage for config |
| **Authentication** | Lightweight user identity for personal use with future sharing capability | Token-based auth with JWT, passkey support for modern UX |

## Recommended Project Structure

```
src/
├── features/                 # Feature-based organization (2026 best practice)
│   ├── leases/
│   │   ├── components/       # Lease-specific UI components
│   │   │   ├── LeaseEntryForm.tsx
│   │   │   ├── LeaseCard.tsx
│   │   │   └── LeaseList.tsx
│   │   ├── hooks/            # Custom hooks for lease logic
│   │   │   ├── useLeaseData.ts
│   │   │   └── useLeaseValidation.ts
│   │   ├── services/         # Business logic isolated from UI
│   │   │   └── leaseApi.ts
│   │   └── store/            # Feature-specific state
│   │       └── leaseStore.ts
│   ├── calculations/
│   │   ├── engine/           # Pure calculation functions
│   │   │   ├── depreciation.ts
│   │   │   ├── rentCharge.ts
│   │   │   ├── totalCost.ts
│   │   │   └── index.ts
│   │   ├── scenarios/        # Exit scenario calculations
│   │   │   ├── returnVehicle.ts
│   │   │   ├── sellVehicle.ts
│   │   │   ├── buyout.ts
│   │   │   ├── earlyTermination.ts
│   │   │   └── keepPaying.ts
│   │   └── utils/            # Calculation helpers
│   │       └── formatters.ts
│   ├── comparison/
│   │   ├── components/       # Comparison table, charts
│   │   │   ├── ComparisonTable.tsx
│   │   │   └── TimelineChart.tsx
│   │   ├── engine/           # Comparison logic
│   │   │   └── compareScenarios.ts
│   │   └── hooks/
│   │       └── useComparison.ts
│   ├── valuation/
│   │   ├── services/         # External API integration
│   │   │   ├── kbbService.ts
│   │   │   ├── edmundsService.ts
│   │   │   └── valuationProxy.ts
│   │   ├── components/       # Valuation lookup UI
│   │   │   └── ValuationLookup.tsx
│   │   └── hooks/
│   │       └── useValuation.ts
│   └── auth/
│       ├── components/       # Login, profile
│       ├── hooks/            # useAuth, useUser
│       └── context/          # Auth context provider
├── shared/                   # Shared across features
│   ├── components/           # Reusable UI components (atomic design)
│   │   ├── atoms/            # Button, Input, Label
│   │   ├── molecules/        # FormField, Card
│   │   └── organisms/        # Modal, Navigation
│   ├── hooks/                # Generic hooks
│   │   ├── useLocalStorage.ts
│   │   └── useIndexedDB.ts
│   ├── utils/                # Helper functions
│   │   ├── dateUtils.ts
│   │   └── currencyUtils.ts
│   └── types/                # TypeScript type definitions
│       ├── lease.ts
│       ├── calculation.ts
│       └── scenario.ts
├── store/                    # Global state management
│   ├── index.ts              # Zustand store configuration
│   └── slices/               # State slices
│       ├── leasesSlice.ts
│       └── settingsSlice.ts
├── services/                 # Cross-cutting services
│   ├── storage/              # IndexedDB/localStorage abstraction
│   │   ├── db.ts
│   │   └── migrations.ts
│   └── api/                  # HTTP client setup
│       └── client.ts
├── pages/                    # Route-level components
│   ├── HomePage.tsx
│   ├── LeaseDetailPage.tsx
│   └── ComparePage.tsx
└── App.tsx                   # Root component
```

### Structure Rationale

- **features/**: Feature-based organization (2026 best practice) groups all related code together (components, logic, hooks, state), making it easier to maintain, scale, and collaborate. Each feature is self-contained with clear boundaries.
- **shared/**: Atomic design principles (atoms, molecules, organisms) promote reusability and consistency across the application. Shared utilities and types prevent duplication.
- **Calculation isolation**: The calculation engine is separated into pure functions that are framework-agnostic, enabling easy testing, reuse, and potential extraction into a standalone library.
- **Service layer**: Business logic is isolated from UI components in service files (api.ts, storage services), increasing testability and allowing dependency injection for testing.
- **State separation**: Different state management strategies for different concerns: Zustand for client state (leases), TanStack Query for server state (valuations), Context for auth.

## Architectural Patterns

### Pattern 1: Calculation Engine as Pure Functions

**What:** The calculation engine consists entirely of pure functions that take lease parameters as input and return calculated results without side effects. All calculation logic is immutable and deterministic.

**When to use:** For all financial calculations (depreciation, rent charge, residual value, total cost, scenario comparisons). Essential for financial applications where calculations must be auditable, testable, and reproducible.

**Trade-offs:**
- **Pros:** Easy to test, no hidden dependencies, can run calculations in web workers if needed, results are cacheable, logic can be extracted into standalone library
- **Cons:** Requires disciplined separation from React state management, may feel verbose compared to mutating state directly

**Example:**
```typescript
// Pure calculation function - no side effects, no external dependencies
export function calculateMonthlyPayment(lease: LeaseInput): MonthlyPayment {
  const depreciation = (lease.adjustedCapCost - lease.residualValue) / lease.termMonths;
  const rentCharge = (lease.adjustedCapCost + lease.residualValue) * (lease.moneyFactor);
  const monthlyPayment = depreciation + rentCharge;

  return {
    depreciation,
    rentCharge,
    monthlyPayment,
    totalCost: monthlyPayment * lease.termMonths
  };
}

// Comparison engine evaluates all scenarios in parallel
export function compareExitOptions(lease: Lease, currentMonth: number): ScenarioComparison {
  const scenarios = [
    calculateReturnScenario(lease, currentMonth),
    calculateSellScenario(lease, currentMonth),
    calculateBuyoutScenario(lease, currentMonth),
    calculateEarlyTerminationScenario(lease, currentMonth),
    calculateKeepPayingScenario(lease, currentMonth)
  ];

  return {
    scenarios,
    recommended: scenarios.reduce((best, current) =>
      current.totalCost < best.totalCost ? current : best
    )
  };
}
```

### Pattern 2: Feature-Based Module Organization

**What:** Code is organized by feature (leases, calculations, comparison, valuation) rather than by type (components, hooks, services). Each feature folder contains all related code: components, hooks, business logic, state management.

**When to use:** For applications with multiple distinct features that have clear boundaries. Essential for team scalability and long-term maintainability.

**Trade-offs:**
- **Pros:** High cohesion within features, low coupling between features, easier to find related code, natural code splitting boundaries, teams can own features end-to-end
- **Cons:** Requires discipline to avoid cross-feature dependencies, shared code must be carefully managed

**Example:**
```typescript
// features/leases/hooks/useLeaseData.ts
export function useLeaseData(leaseId: string) {
  const store = useLeaseStore();
  const lease = store.getLeaseById(leaseId);

  return {
    lease,
    updateLease: store.updateLease,
    deleteLease: store.deleteLease
  };
}

// features/comparison/hooks/useComparison.ts
export function useComparison(leaseId: string, currentMonth: number) {
  const { lease } = useLeaseData(leaseId);
  const valuation = useValuation(lease?.vin);

  const comparison = useMemo(() => {
    if (!lease || !valuation) return null;
    return compareExitOptions(lease, currentMonth);
  }, [lease, currentMonth, valuation]);

  return comparison;
}
```

### Pattern 3: Layered State Management (Hybrid Approach)

**What:** Different state management strategies for different concerns: Zustand for client state (lease data), TanStack Query for server state (API calls with caching), React Context for cross-cutting concerns (auth, theme).

**When to use:** Modern React applications in 2026. This hybrid approach is the current best practice, handling roughly 80% of server-state patterns with TanStack Query and using lightweight stores like Zustand for shared client state.

**Trade-offs:**
- **Pros:** Each tool optimized for its use case, TanStack Query handles caching/invalidation/background refetch automatically, Zustand has minimal boilerplate, Context prevents prop drilling
- **Cons:** Multiple libraries to learn, must understand when to use which approach

**Example:**
```typescript
// Zustand for lease data (client state)
// store/slices/leasesSlice.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useLeaseStore = create(
  persist(
    (set, get) => ({
      leases: [],
      addLease: (lease) => set((state) => ({
        leases: [...state.leases, lease]
      })),
      updateLease: (id, updates) => set((state) => ({
        leases: state.leases.map(l => l.id === id ? {...l, ...updates} : l)
      })),
      getLeaseById: (id) => get().leases.find(l => l.id === id)
    }),
    {
      name: 'lease-storage',
      storage: createJSONStorage(() => indexedDBAdapter)
    }
  )
);

// TanStack Query for valuation API (server state)
// features/valuation/hooks/useValuation.ts
import { useQuery } from '@tanstack/react-query';

export function useValuation(vin: string) {
  return useQuery({
    queryKey: ['valuation', vin],
    queryFn: () => fetchValuation(vin),
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
    gcTime: 1000 * 60 * 60 * 24 * 7, // 7 days
    enabled: !!vin
  });
}

// React Context for auth (cross-cutting concern)
// features/auth/context/AuthContext.tsx
const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}
```

### Pattern 4: Offline-First Architecture with IndexedDB

**What:** The application is designed to work offline first, with IndexedDB as the primary data store. All lease data and calculation results are persisted locally. External API calls (valuations) are cached and can be manually overridden.

**When to use:** Personal tools, financial applications where data privacy is important, applications that need to work reliably without internet connectivity.

**Trade-offs:**
- **Pros:** Works offline, faster than server round-trips, user data stays on device (privacy), no backend infrastructure needed initially
- **Cons:** Syncing across devices requires additional work, data migration strategy needed for schema changes, limited by device storage

**Example:**
```typescript
// services/storage/db.ts
import { openDB } from 'idb';

export async function initDB() {
  return openDB('lease-tracker', 1, {
    upgrade(db) {
      // Leases store
      const leaseStore = db.createObjectStore('leases', {
        keyPath: 'id'
      });
      leaseStore.createIndex('createdAt', 'createdAt');

      // Calculations cache
      const calcStore = db.createObjectStore('calculations', {
        keyPath: ['leaseId', 'month']
      });

      // Valuations cache
      const valStore = db.createObjectStore('valuations', {
        keyPath: 'vin'
      });
      valStore.createIndex('fetchedAt', 'fetchedAt');
    }
  });
}

// Zustand middleware to persist to IndexedDB
const indexedDBAdapter = {
  getItem: async (name) => {
    const db = await initDB();
    return db.get('app-state', name);
  },
  setItem: async (name, value) => {
    const db = await initDB();
    return db.put('app-state', value, name);
  },
  removeItem: async (name) => {
    const db = await initDB();
    return db.delete('app-state', name);
  }
};
```

### Pattern 5: Service Layer with Dependency Injection

**What:** Business logic is separated from UI components into service files. Services accept dependencies as parameters, making them testable and framework-agnostic.

**When to use:** When you need to test business logic independently of React components, when the same logic might be called from multiple places, when you want to mock external dependencies in tests.

**Trade-offs:**
- **Pros:** Highly testable, clear separation of concerns, can swap implementations easily, business logic is framework-agnostic
- **Cons:** More files to manage, requires discipline to maintain boundaries

**Example:**
```typescript
// features/valuation/services/valuationProxy.ts
export async function fetchValuation(
  vin: string,
  dependencies = { kbb: kbbService, edmunds: edmundsService }
) {
  // Try primary source first
  try {
    const kbbValue = await dependencies.kbb.getValuation(vin);
    return { source: 'kbb', value: kbbValue, vin };
  } catch (error) {
    // Fallback to secondary source
    try {
      const edmundsValue = await dependencies.edmunds.getValuation(vin);
      return { source: 'edmunds', value: edmundsValue, vin };
    } catch (error) {
      // Both failed - return null and let UI handle manual entry
      return null;
    }
  }
}

// In tests, easily inject mocks
test('fetchValuation uses fallback when KBB fails', async () => {
  const mockDeps = {
    kbb: { getValuation: async () => { throw new Error('API down'); } },
    edmunds: { getValuation: async () => 25000 }
  };

  const result = await fetchValuation('VIN123', mockDeps);
  expect(result.source).toBe('edmunds');
  expect(result.value).toBe(25000);
});
```

## Data Flow

### Request Flow (Lease Entry to Comparison)

```
[User enters lease data]
    ↓
[LeaseEntryForm component] → validates input → [useLeaseValidation hook]
    ↓
[Submit action] → [addLease action in Zustand store]
    ↓
[Zustand middleware] → [IndexedDB persistence]
    ↓
[State update triggers re-render] → [ComparisonView component]
    ↓
[useComparison hook] → calls [Calculation Engine] → [Pure functions]
    ↓
[Results displayed] ← [Timeline visualization] ← [Calculated scenarios]
```

### Valuation Lookup Flow

```
[User enters VIN or selects vehicle]
    ↓
[ValuationLookup component] → [useValuation hook]
    ↓
[TanStack Query] → checks cache first
    ↓ (cache miss)
[valuationProxy service] → [KBB API]
    ↓ (fallback)
[Edmunds API]
    ↓
[Cache result] → [IndexedDB valuations store]
    ↓
[Display value] + [Allow manual override]
    ↓
[User override] → [Store override in lease record]
```

### Timeline Calculation Flow

```
[ComparisonView renders]
    ↓
[useComparison hook] → retrieves current lease data
    ↓
[For each month in timeline] → [Calculate all scenarios]
    ↓
[Parallel execution of scenario functions]:
- calculateReturnScenario(lease, month)
- calculateSellScenario(lease, month, valuation)
- calculateBuyoutScenario(lease, month)
- calculateEarlyTerminationScenario(lease, month)
- calculateKeepPayingScenario(lease, month)
    ↓
[Aggregate results] → [Build timeline data structure]
    ↓
[TimelineChart component] → [Render with React Timeline library]
```

### State Management Flow

```
┌─────────────────────────────────────────────────────────┐
│                    Application State                     │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  Client State (Zustand)                                  │
│  ├─ Lease records                                        │
│  ├─ User preferences                                     │
│  └─ UI state (selected lease, view mode)                │
│      ↓ (persisted)                                       │
│  IndexedDB                                               │
│                                                           │
│  Server State (TanStack Query)                           │
│  ├─ Valuation API responses (cached)                    │
│  └─ Auto-refetch on stale data                          │
│      ↓ (cache layer)                                     │
│  IndexedDB valuations store                              │
│                                                           │
│  Cross-Cutting (React Context)                           │
│  ├─ Auth user                                            │
│  └─ Theme preferences                                    │
│      ↓ (stored)                                          │
│  localStorage                                            │
└─────────────────────────────────────────────────────────┘
```

### Key Data Flows

1. **Lease CRUD Flow**: User action → React component → Zustand action → State update → IndexedDB persistence → Re-render affected components. Zustand's persistence middleware automatically syncs state to IndexedDB.

2. **Calculation Flow**: Component requests comparison → useComparison hook → Pure calculation functions operate on immutable data → Return results → useMemo caches results until dependencies change → Component renders.

3. **Valuation Flow**: Component needs valuation → useValuation hook → TanStack Query checks cache → If stale, fetch from API → Cache result in IndexedDB → Return data to component → User can override → Override stored in lease record.

4. **Authentication Flow**: User logs in → Auth service validates → Update Context → Context triggers re-render → Protected routes check Context → Token stored in localStorage for session persistence.

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| **0-1k users** | Current architecture is perfect. Single-page app with client-side calculations, IndexedDB persistence, optional backend for auth only. No server infrastructure needed for core functionality. |
| **1k-10k users** | Add backend API for lease sharing feature. Introduce data sync between IndexedDB and backend. Implement conflict resolution strategy (last-write-wins or user chooses). Consider caching layer (Redis) for valuation API responses to reduce external API costs. |
| **10k-100k users** | Move calculation-heavy operations to backend for users with many leases. Implement server-side rendering (SSR) with Next.js for better SEO and initial load time. Add CDN for static assets. Introduce rate limiting on valuation API calls. Consider WebSocket for real-time updates if sharing is heavily used. |
| **100k+ users** | Microservices architecture: separate calculation service, valuation service, user service. Use serverless functions for calculations (AWS Lambda, Cloudflare Workers). Implement proper caching strategy with TTLs. Add monitoring and observability (DataDog, Sentry). Consider edge computing for calculations to reduce latency. |

### Scaling Priorities

1. **First bottleneck: External valuation API costs**
   - **What breaks:** KBB/Edmunds APIs charge per request. As users grow, API costs become significant.
   - **How to fix:** Implement aggressive caching (24-hour TTL minimum). Build valuation cache database on backend. Allow manual entry as fallback. Consider negotiating bulk API pricing or switching to open-source alternatives.

2. **Second bottleneck: Client-side calculation performance with large datasets**
   - **What breaks:** Users with 10+ leases comparing scenarios across 36-month timelines. Calculation time becomes noticeable.
   - **How to fix:** Move calculations to Web Workers to avoid blocking UI thread. Implement progressive calculation (calculate visible months first). Add backend calculation service for heavy users. Use memoization aggressively to avoid recalculating unchanged data.

3. **Third bottleneck: IndexedDB storage limits**
   - **What breaks:** Power users with extensive historical data may hit browser storage quotas (typically 60% of free disk space, but varies by browser).
   - **How to fix:** Implement data archiving strategy (move old leases to backend). Add storage usage monitoring. Allow users to export and delete old data. Request persistent storage permission to prevent browser eviction.

## Anti-Patterns

### Anti-Pattern 1: Mixing Calculation Logic with React Components

**What people do:** Put financial calculation logic directly inside React components, mixed with state updates and side effects.

```typescript
// BAD: Calculation logic embedded in component
function ComparisonView({ lease }) {
  const [result, setResult] = useState(null);

  useEffect(() => {
    const depreciation = (lease.adjustedCapCost - lease.residualValue) / lease.termMonths;
    const rentCharge = (lease.adjustedCapCost + lease.residualValue) * lease.moneyFactor;
    const monthlyPayment = depreciation + rentCharge;
    setResult({ depreciation, rentCharge, monthlyPayment });
  }, [lease]);

  return <div>{result?.monthlyPayment}</div>;
}
```

**Why it's wrong:** Makes testing difficult (must render React component to test calculation), couples business logic to UI framework, can't reuse calculations elsewhere, calculation logic hidden inside component makes it hard to audit for financial accuracy.

**Do this instead:** Extract calculations into pure functions, import and use them in components via hooks.

```typescript
// GOOD: Calculation logic separated
// features/calculations/engine/monthlyPayment.ts
export function calculateMonthlyPayment(lease: LeaseInput): MonthlyPayment {
  const depreciation = (lease.adjustedCapCost - lease.residualValue) / lease.termMonths;
  const rentCharge = (lease.adjustedCapCost + lease.residualValue) * lease.moneyFactor;
  return {
    depreciation,
    rentCharge,
    monthlyPayment: depreciation + rentCharge
  };
}

// features/comparison/hooks/useMonthlyPayment.ts
export function useMonthlyPayment(lease: LeaseInput) {
  return useMemo(() => calculateMonthlyPayment(lease), [lease]);
}

// Component uses the hook
function ComparisonView({ lease }) {
  const result = useMonthlyPayment(lease);
  return <div>{result.monthlyPayment}</div>;
}
```

### Anti-Pattern 2: Using localStorage for Lease Data

**What people do:** Store lease records and calculation results in localStorage because it's simpler than IndexedDB.

**Why it's wrong:** localStorage has 5-10MB size limit (will fail with multiple leases), synchronous API blocks UI thread during read/write, can only store strings (must JSON.stringify/parse), no transaction support (data can corrupt), no indexing or querying capabilities.

**Do this instead:** Use IndexedDB for structured data, reserve localStorage only for small config values.

```typescript
// GOOD: IndexedDB for lease data
// services/storage/leaseStorage.ts
import { openDB } from 'idb';

export async function saveLease(lease: Lease) {
  const db = await initDB();
  await db.put('leases', lease);
}

export async function getLeaseById(id: string): Promise<Lease | undefined> {
  const db = await initDB();
  return db.get('leases', id);
}

export async function getAllLeases(): Promise<Lease[]> {
  const db = await initDB();
  return db.getAll('leases');
}
```

### Anti-Pattern 3: Tight Coupling to Specific Valuation API

**What people do:** Hardcode KBB API calls directly in components, with API key and request logic mixed throughout the codebase.

**Why it's wrong:** Can't switch to different API provider without refactoring components, can't implement fallback when primary API fails, can't mock API for testing, API rate limits affect entire app, can't implement caching strategy consistently.

**Do this instead:** Create abstraction layer (service) that can use multiple providers with fallback logic.

```typescript
// GOOD: Abstraction with fallback
// features/valuation/services/valuationProxy.ts
interface ValuationProvider {
  getValuation(vin: string): Promise<number>;
}

class KBBService implements ValuationProvider {
  async getValuation(vin: string): Promise<number> {
    // KBB-specific implementation
  }
}

class EdmundsService implements ValuationProvider {
  async getValuation(vin: string): Promise<number> {
    // Edmunds-specific implementation
  }
}

export async function fetchValuation(vin: string): Promise<Valuation> {
  const providers = [new KBBService(), new EdmundsService()];

  for (const provider of providers) {
    try {
      const value = await provider.getValuation(vin);
      return { vin, value, source: provider.constructor.name };
    } catch (error) {
      // Try next provider
      continue;
    }
  }

  // All providers failed - allow manual entry
  return null;
}
```

### Anti-Pattern 4: Recalculating on Every Render

**What people do:** Run expensive calculations in component body or useEffect without proper memoization.

**Why it's wrong:** Financial calculations (especially timeline scenarios across 36 months with 5 exit paths = 180 calculations) are expensive. Recalculating on every render wastes CPU and drains battery on mobile devices.

**Do this instead:** Use useMemo to cache calculation results, only recalculate when dependencies actually change.

```typescript
// BAD: Recalculates on every render
function TimelineChart({ lease }) {
  const timeline = generateTimeline(lease); // Runs every render!
  return <Chart data={timeline} />;
}

// GOOD: Memoized calculation
function TimelineChart({ lease }) {
  const timeline = useMemo(() => {
    return generateTimeline(lease);
  }, [lease]); // Only recalculates when lease changes

  return <Chart data={timeline} />;
}

// EVEN BETTER: Move to custom hook
function useTimeline(lease: Lease) {
  return useMemo(() => generateTimeline(lease), [lease]);
}

function TimelineChart({ lease }) {
  const timeline = useTimeline(lease);
  return <Chart data={timeline} />;
}
```

### Anti-Pattern 5: Premature Backend Introduction

**What people do:** Build a backend API from day one "because we might need it later" even though the application works entirely client-side.

**Why it's wrong:** Adds complexity, hosting costs, deployment pipeline, security concerns, CORS issues, API versioning needs. For a personal tool, this is complete overkill. The core value proposition (lease comparison) works perfectly client-side.

**Do this instead:** Start with offline-first architecture using IndexedDB. Only add backend when you actually need it (auth for sharing, cross-device sync).

```typescript
// START HERE (Phase 1): No backend needed
- Client-side React app
- IndexedDB for data persistence
- External API calls for valuation (client-side)
- localStorage for auth token (if using third-party auth like Clerk)

// ADD LATER (Phase 2+): Only when sharing feature is built
- Backend API for lease sharing
- Database for shared leases
- WebSocket or polling for real-time updates
- Sync logic between IndexedDB and backend
```

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| **KBB API (InfoDriver Web Service)** | REST API with weekly updated values, VIN decode capability | Primary source. Market-aligned values. Requires API key. Rate limited. Consider caching aggressively (24-hour TTL). |
| **Edmunds API (Vehicle API)** | REST API with True Market Value (TMV) and True Cost to Own (TCO) data | Fallback source when KBB fails. Different pricing model than KBB. More reflective of real-world transaction prices. |
| **Auth Provider (Clerk/Auth0/Supabase)** | OAuth 2.0 / JWT tokens, passkey support | For lightweight auth initially. Token stored in localStorage. Passkeys recommended for modern UX in 2026. |
| **Analytics (optional)** | Client-side tracking (Plausible, Fathom) | Privacy-focused analytics. Track feature usage, identify drop-off points. Avoid heavy tools like Google Analytics for personal tool. |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| **Presentation ↔ Business Logic** | Function calls via hooks | Components call custom hooks which call service layer functions. Components never import calculation functions directly. |
| **Business Logic ↔ State** | Zustand actions, TanStack Query mutations | Business logic triggers state updates via Zustand actions. API calls go through TanStack Query for caching. |
| **State ↔ Persistence** | Zustand middleware, IDB abstraction | Zustand persistence middleware automatically syncs to IndexedDB. TanStack Query uses IndexedDB as cache layer. |
| **Calculation Engine ↔ Everything** | Pure function imports | Calculation engine is completely isolated. Takes input, returns output. No dependencies on React, state, or persistence. |
| **Features ↔ Features** | Shared hooks and types | Features communicate through shared hooks (useLeaseData) and shared TypeScript types. Never import components across features. |

## Build Order Recommendations

Based on architectural dependencies, suggested build sequence:

### Phase 1: Foundation (Week 1-2)
1. **Project setup**: React + TypeScript + Vite, ESLint, Prettier
2. **Shared infrastructure**: Type definitions, utility functions, atomic UI components
3. **Storage layer**: IndexedDB setup, migration system, storage abstraction
4. **State management**: Zustand store configuration with IndexedDB persistence

**Why this order:** Foundation must be solid before features. Type definitions inform everything else. Storage layer needed before state persistence.

### Phase 2: Core Calculations (Week 2-3)
1. **Calculation engine**: Pure functions for depreciation, rent charge, monthly payment, total cost
2. **Unit tests**: Comprehensive test coverage for all calculation functions
3. **Scenario functions**: Return, sell, buyout, early termination, keep paying logic

**Why this order:** Calculation accuracy is critical. Build and test thoroughly before UI. Scenario functions depend on core calculations.

### Phase 3: Lease Entry (Week 3-4)
1. **Lease data model**: TypeScript types for lease input/output
2. **Entry form components**: Guided form with validation, tooltips
3. **Lease CRUD operations**: Create, read, update, delete with IndexedDB persistence
4. **Form integration with state**: Connect forms to Zustand store

**Why this order:** Need to input lease data before comparing anything. Forms depend on data model and storage being ready.

### Phase 4: Comparison View (Week 4-5)
1. **Comparison hook**: useComparison that evaluates all scenarios
2. **Comparison table**: Side-by-side display of all exit options
3. **Recommended path logic**: Identify the optimal financial decision
4. **Result caching**: Memoization to avoid recalculating on every render

**Why this order:** Core value proposition. Depends on calculations and lease data being available.

### Phase 5: Timeline Visualization (Week 5-6)
1. **Timeline data generation**: Month-by-month scenario calculations
2. **Chart library integration**: Material UI Timeline or similar
3. **Interactive features**: Hover states, month selection, scenario filtering
4. **Performance optimization**: Web Workers for heavy calculations if needed

**Why this order:** Visual enhancement after core comparison works. Timeline is computationally expensive, build performance considerations from start.

### Phase 6: Valuation Integration (Week 6-7)
1. **Valuation service abstraction**: Provider interface, proxy pattern
2. **KBB API integration**: Primary valuation source with error handling
3. **Edmunds fallback**: Secondary source when primary fails
4. **TanStack Query setup**: Caching strategy, stale time configuration
5. **Manual override UI**: Allow users to enter valuations manually

**Why this order:** Valuation enhances comparison accuracy but isn't required for MVP. External dependencies come later in build to avoid blocking core features.

### Phase 7: Authentication (Week 7-8)
1. **Auth provider integration**: Clerk, Auth0, or similar
2. **Auth context setup**: User state management via Context
3. **Protected routes**: Conditionally render based on auth state
4. **Passkey support**: Modern passwordless auth for better UX

**Why this order:** Auth needed for future sharing feature but not for personal use. Build after core value is proven.

### Phase 8: Polish & Optimization (Week 8+)
1. **Error boundaries**: Graceful error handling throughout app
2. **Loading states**: Skeleton screens, spinners
3. **Responsive design**: Mobile-friendly layouts
4. **Performance audit**: Lighthouse score, bundle size optimization
5. **Accessibility**: ARIA labels, keyboard navigation, screen reader support

**Why this order:** Polish comes after functionality works. Optimization needs baseline to measure against.

**Key Dependencies:**
- Timeline visualization **depends on** comparison engine
- Comparison engine **depends on** calculation engine + lease data
- Lease CRUD **depends on** storage layer
- Valuation **independent** (can build in parallel with other features)
- Auth **independent** (can build in parallel or defer entirely)

**Critical Path:** Storage → Calculations → Lease Entry → Comparison → Timeline

## Sources

### Financial Calculation Engine Architecture
- [Calculation engines in Financial Services](https://www.linkedin.com/pulse/calculation-engines-financial-services-key-business-joris-lochy)
- [FINTECHNA: Calculation engines in Financial Services](https://www.fintechna.com/articles/calculation-engines-in-financial-services/)
- [Best Database for Financial Data: 2026 Architecture Guide](https://www.ispirer.com/blog/best-database-for-financial-data)

### Vehicle Valuation APIs
- [KBB InfoDriver Web Service (IDWS)](https://b2b.kbb.com/industry-solutions/info-driver-web-service-idws/)
- [Edmunds Vehicle API](https://developer.edmunds.com/api-documentation/vehicle/)
- [Top 10 Best Car Valuation Sites in 2026](https://vehicledatabases.com/articles/car-valuation-sites)

### State Management Patterns (2026)
- [State Management in 2026: Redux, Context API, and Modern Patterns](https://www.nucamp.co/blog/state-management-in-2026-redux-context-api-and-modern-patterns)
- [7 Top React State Management Libraries in 2026](https://trio.dev/7-top-react-state-management-libraries/)
- [18 Best React State Management Libraries in 2026](https://fe-tool.com/awesome-react-state-management)

### Data Persistence
- [Offline-first frontend apps in 2025: IndexedDB and SQLite](https://blog.logrocket.com/offline-first-frontend-apps-2025-indexeddb-sqlite/)
- [Redux Persist Storage Options: LocalStorage to IndexedDB](https://medium.com/@eva.matova6/redux-persist-storage-options-from-localstorage-to-indexeddb-and-beyond-2d36ca3c0dc3)
- [Understanding Browser Storage: Local Storage, Session Storage, and IndexedDB](https://dev.to/im_ashish30/understanding-browser-storage-local-storage-session-storage-and-indexeddb-3nkc)

### React Architecture Patterns
- [React Architecture Patterns and Best Practices for 2026](https://www.bacancytechnology.com/blog/react-architecture-patterns-and-best-practices)
- [Path To A Clean(er) React Architecture - Business Logic Separation](https://profy.dev/article/react-architecture-business-logic-and-dependency-injection)
- [Feature-Driven Modular Architecture in React](https://medium.com/@muhmdshanoob/feature-driven-modular-architecture-in-react-focusing-on-scalability-reusability-and-atomic-76d9579ac60e)
- [How to structure a React App in 2025](https://ramonprata.medium.com/how-to-structure-a-react-app-in-2025-spa-ssr-or-native-10d8de7a245a)

### Authentication Patterns
- [5 authentication trends that will define 2026](https://www.authsignal.com/blog/articles/5-authentication-trends-that-will-define-2026-our-founders-perspective)
- [Ultimate Guide to Web App Authentication & Authorization](https://guptadeepak.com/best-practices-for-user-authentication-and-authorization-in-web-applications-a-comprehensive-security-framework/)
- [12 Open Source Auth Tools](https://www.permit.io/blog/top-12-open-source-auth-tools)

### Timeline Visualization
- [Comparing the best React timeline libraries](https://blog.logrocket.com/comparing-best-react-timeline-libraries/)
- [React Timeline component - Material UI](https://mui.com/material-ui/react-timeline/)
- [Syncfusion React Timeline Component](https://www.syncfusion.com/react-components/react-timeline)

### Modern Web Architecture
- [Modern Web Application Architecture in 2026: A Practical Guide](https://quokkalabs.com/blog/modern-web-application-architecture/)
- [Exploring Modern Web App Architectures: Trends and Best Practices for 2026](https://tech-stack.com/blog/modern-application-development/)
- [Frontend Design Patterns That Actually Work in 2026](https://www.netguru.com/blog/frontend-design-patterns)

---
*Architecture research for: Vehicle Lease Tracking and Financial Comparison*
*Researched: 2026-01-28*
*Next step: Use this architecture to inform phase structure in roadmap creation*
