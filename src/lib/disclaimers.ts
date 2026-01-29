export const DISCLAIMERS = {
  general: `This tool provides estimates for informational purposes only. It is not financial, legal, or tax advice. Actual costs may vary based on your specific lease agreement, lender policies, and local regulations. Always consult your lease contract and contact your leasing company for exact figures.`,
  earlyTermination: `Early termination calculations use a generic actuarial method. Actual payoff amounts vary significantly by lender (Toyota Financial, GM Financial, Honda Financial, etc.) and may differ from estimates shown here. Contact your leasing company directly for your exact early termination payoff amount.`,
  tax: `Tax calculations are estimates based on state-level rules. Local municipality taxes, special district taxes, and recent rate changes may not be reflected. Consult a tax professional or your local DMV for exact tax obligations.`,
  marketValue: `Market value estimates are user-provided or derived from third-party sources. Actual sale prices depend on vehicle condition, local market demand, and negotiation. These figures should not be relied upon for financial decisions without independent verification.`,
  mileage: `Mileage projections assume a constant driving rate based on current usage. Seasonal variations, lifestyle changes, and other factors may cause actual end-of-lease mileage to differ significantly from projections.`,
} as const;

export type DisclaimerKey = keyof typeof DISCLAIMERS;
