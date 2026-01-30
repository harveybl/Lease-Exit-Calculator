---
status: complete
phase: 03-comparison-view
source: [03-01-SUMMARY.md, 03-02-SUMMARY.md, 03-03-SUMMARY.md]
started: 2026-01-29T23:00:00Z
updated: 2026-01-30T00:15:00Z
---

## Current Test

[testing complete]

## Tests

### 1. Navigate to Comparison
expected: From the lease list page (/lease), clicking "Compare Options" on a lease card navigates to /lease/{id}/compare showing the comparison view with the vehicle name as heading.
result: pass

### 2. Hero Summary Card
expected: At the top of the comparison page, a highlighted hero card shows "Best Move: {option name}" with a savings description (e.g., "saves $X vs. returning") and a row of all 5 option costs as mini-totals.
result: pass

### 3. All Five Options Ranked
expected: Below the hero card, all 5 exit options (Return Vehicle, Buy Out Lease, Sell Privately, Early Termination, Keep Paying) appear as individual cards, each showing a rank badge (#1-#5) and total cost, ordered from cheapest to most expensive.
result: pass

### 4. Best Option Highlighted
expected: The #1 ranked option card has a visually distinct accent border and a filled (not outline) rank badge, making it stand out from the other cards.
result: pass

### 5. Expand Cost Breakdown
expected: Clicking "View cost breakdown" on any option card reveals a categorized breakdown with section headers like "Lease Costs", "Fees", "Taxes", and/or "Credits & Equity" depending on the scenario.
result: pass

### 6. Line Item Info Popovers
expected: Each line item in an expanded breakdown has an info (i) icon. Clicking it opens a Popover with a plain-English description of what that cost is.
result: pass

### 7. Credits Display with Green Text
expected: For the "Sell Privately" option (or any with equity), the Credits & Equity section shows credit amounts in green text with a "You receive:" prefix.
result: pass

### 8. Cost Summary in Breakdown
expected: Each expanded breakdown ends with a summary showing "Total costs", optionally "Total credits" (in green if present), and a bold "Net" amount.
result: pass

### 9. Multiple Simultaneous Expansions
expected: Two or more option cards can be expanded at the same time — expanding one does NOT collapse others (Collapsible behavior, not Accordion).
result: pass

### 10. Warning Boxes
expected: Options with warnings display amber/yellow warning boxes with cautionary text (e.g., mileage overage warning for Return, payoff difference for Sell Privately, actuarial method disclaimer for Early Termination).
result: pass

### 11. Back Navigation
expected: A "Back to Leases" link at the top of the comparison page navigates back to the lease list at /lease.
result: pass

### 12. Currency Formatting
expected: All monetary values throughout the page display in "$X,XXX.XX" format with proper comma grouping and two decimal places.
result: pass

## Summary

total: 12
passed: 12
issues: 0
pending: 0
skipped: 0

## Gaps

[none]
