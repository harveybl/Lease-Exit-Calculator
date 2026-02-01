# Lease Exit Calculator

Find the smartest financial move for your vehicle lease — right now, and when a better window might open up.

## What It Does

Enter your lease details and get a side-by-side comparison of every exit option:

- **Return the vehicle** — disposition fee, excess mileage charges, wear-and-tear estimates
- **Buy it out** — residual value, purchase fees, state taxes
- **Sell privately** — payoff amount vs. market value, net equity
- **Early termination** — actuarial payoff calculation with remaining liability
- **Keep paying (extend)** — month-to-month continuation costs
- **Transfer the lease** — marketplace fees, registration costs, incentive payments

Each option shows a transparent cost breakdown with every fee line item — no black-box totals. The app highlights the best move today and shows a month-by-month timeline of how your options change over the remaining lease term.

## Features

- **Comparison view** with ranked options, cost breakdowns, and a clear recommendation
- **Timeline chart** showing cost curves across remaining months with crossover detection
- **Smart recommendations** that tell you whether to act now or wait for a better window
- **Market value tracking** with staleness warnings and equity calculation
- **Guided lease entry** with educational tooltips explaining confusing terms (residual, money factor, disposition fee)
- **PDF export** of comparison results
- **Progressive Web App** — installable on phone home screens
- **Responsive design** optimized for desktop and mobile
- **Accessible** — WCAG 2.1 AA compliant, keyboard navigable, screen reader tested
- **Decimal precision** — all monetary calculations use Decimal.js (no floating-point rounding errors)
- **State-aware taxes** — supports 15 US states with upfront/monthly/no-tax distinctions

## Tech Stack

- [Next.js](https://nextjs.org/) 16 with App Router
- [TypeScript](https://www.typescriptlang.org/) (strict mode)
- [React](https://react.dev/) 19
- [Decimal.js](https://mikemcl.github.io/decimal.js/) for financial precision
- [Recharts](https://recharts.org/) for timeline visualization
- [shadcn/ui](https://ui.shadcn.com/) + [Radix UI](https://www.radix-ui.com/) for accessible components
- [Tailwind CSS](https://tailwindcss.com/) v4
- [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/) for validated forms
- [Vitest](https://vitest.dev/) with 186 tests and 100% calculation coverage
- [Serwist](https://serwist.pages.dev/) for PWA/service worker
- [@react-pdf/renderer](https://react-pdf.org/) for PDF export

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Install

```bash
git clone https://github.com/harveybl/Lease-Exit-Calculator.git
cd Lease-Exit-Calculator
npm install
```

### Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Run tests

```bash
npm test              # run all 186 tests
npm run test:watch    # watch mode
npm run test:coverage # with coverage report
```

## How It Works

The calculation engine is built as pure TypeScript functions with Decimal.js precision. Every scenario evaluator takes lease parameters and returns an itemized cost breakdown:

```
Lease data → Scenario evaluators → Ranked comparison → Timeline projection → Recommendation
```

1. **Enter your lease** — 5 essential fields to start, expand for more detail
2. **Add market value** — enter what your vehicle is worth (KBB, Edmunds, Carvana)
3. **Compare options** — see all 6 exit paths ranked with full cost breakdowns
4. **View timeline** — see how costs change month-by-month with crossover points
5. **Export or act** — download a PDF summary or follow the recommendation

## Disclaimer

This tool provides estimates for educational purposes only. Actual costs depend on your specific lease contract, lender policies, and market conditions. Always verify with your leasing company before making financial decisions. Early termination calculations use a generic actuarial method — your lender's formula may differ.

## License

[MIT](LICENSE)
