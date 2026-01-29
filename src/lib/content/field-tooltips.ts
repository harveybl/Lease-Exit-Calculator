/**
 * Educational tooltip content for lease form fields.
 * Tone: Friendly, casual, approachable - like a knowledgeable friend explaining over coffee.
 * No jargon without explanation. Specific examples where helpful.
 */

export interface FieldTooltipContent {
  title: string;
  shortHint: string; // Always-visible FormDescription text (brief)
  description: string; // Detailed popover explanation (casual, friendly)
  whereToFind?: string; // Where to find this on lease paperwork
  learnMoreUrl?: string; // External resource (Edmunds, NerdWallet, etc.)
  example?: string; // Example value for context
}

export const fieldTooltips: Record<string, FieldTooltipContent> = {
  monthlyPayment: {
    title: 'Monthly Payment',
    shortHint: 'The amount you pay each month to drive the car',
    description:
      "This is what you see leaving your bank account every month. It covers the car's depreciation during your lease term, plus interest (called the 'rent charge'). Don't include any separate sales tax if your state adds it on top.",
    whereToFind:
      "Page 1 of your lease agreement, usually near the top under 'Monthly Payment' or 'Base Monthly Payment'",
    example: '$350 per month',
  },

  termMonths: {
    title: 'Lease Term',
    shortHint: 'How many months your lease lasts',
    description:
      "The total length of your lease. Most leases run 24, 36, or 48 months. You're committed to making payments for this entire period unless you terminate early (which usually comes with penalties).",
    whereToFind: "Look for 'Lease Term' or 'Contract Length' on the first page of your agreement",
    example: '36 months (3 years)',
  },

  allowedMilesPerYear: {
    title: 'Annual Mileage Allowance',
    shortHint: 'How many miles you can drive per year before extra charges kick in',
    description:
      "Your lease agreement includes a certain number of miles per year (often 10,000, 12,000, or 15,000). If you drive more than this total over the lease term, you'll pay an overage fee for each extra mile when you return the car.",
    whereToFind:
      "Look for 'Annual Mileage Allowance', 'Mileage Limit', or 'Total Mileage' in your lease terms",
    example: '12,000 miles per year',
  },

  residualValue: {
    title: 'Residual Value',
    shortHint: "What the leasing company thinks your car will be worth at lease end",
    description:
      "Think of this as what the dealer believes your car will be worth when your lease is up. It's the price you'd pay if you decide to buy the car at the end of your lease. A higher residual means lower monthly payments (you're only paying for the difference between the car's starting value and this residual).",
    whereToFind:
      "Page 2 of your lease agreement, under 'Residual Value', 'Lease End Value', or 'Purchase Option Price'",
    learnMoreUrl: 'https://www.edmunds.com/car-leasing/calculate-your-own-lease-payment.html',
    example: '$18,500 at end of 3-year lease',
  },

  currentMileage: {
    title: 'Current Mileage',
    shortHint: 'Your current odometer reading',
    description:
      "We use this to project whether you'll be over or under your mileage limit by the end of the lease. The more accurate this number, the better we can forecast your options. You can update this anytime to get fresh projections.",
    whereToFind: 'Check your odometer (the digital or analog display on your dashboard)',
    example: '8,450 miles',
  },

  moneyFactor: {
    title: 'Money Factor',
    shortHint: 'A small decimal that represents your interest rate',
    description:
      "This is how leases express interest rates. It looks like a tiny number (like 0.00125), but you can multiply it by 2,400 to get the approximate APR. So 0.00125 × 2,400 = 3% APR. The lower the money factor, the less interest you're paying.",
    whereToFind:
      "Your dealer might not show this directly on the lease paperwork. Ask for it, or look for 'Rent Charge' and calculate backwards. Some states require it to be disclosed.",
    learnMoreUrl: 'https://www.nerdwallet.com/article/loans/auto-loans/money-factor',
    example: '0.00125 (equivalent to 3% APR)',
  },

  dispositionFee: {
    title: 'Disposition Fee',
    shortHint: "A fee charged when you return the car at lease end",
    description:
      "Think of this as a 'restocking fee' the leasing company charges to inspect, clean, and prepare your car for resale after you return it. You only pay this if you return the car - if you buy it out, this fee usually doesn't apply.",
    whereToFind:
      "Look for 'Disposition Fee', 'Turn-in Fee', or 'Vehicle Disposition Charge' in the fees section",
    example: '$395 (typical range: $300-$500)',
  },

  msrp: {
    title: 'MSRP (Manufacturer Suggested Retail Price)',
    shortHint: "The car's sticker price before any negotiation",
    description:
      "This is the manufacturer's suggested retail price - basically the 'sticker price' you see on the window at the dealership. It's the starting point before any dealer discounts, rebates, or negotiations. Your actual lease is based on a different number (the 'cap cost'), which is usually lower.",
    whereToFind:
      "Look for 'MSRP' or 'Manufacturer Suggested Retail Price' near the vehicle description on page 1",
    example: '$45,000',
  },

  netCapCost: {
    title: 'Net Capitalized Cost',
    shortHint: "The actual price you're financing (after down payment and fees)",
    description:
      "This is the negotiated price of the car, plus any fees, minus your down payment or trade-in. It's what you're actually leasing - the amount your monthly payments are based on. Think of it as the 'sale price' for a lease.",
    whereToFind:
      "Look for 'Net Capitalized Cost', 'Adjusted Cap Cost', or 'Net Cap Cost' on page 2 of your lease",
    learnMoreUrl: 'https://www.edmunds.com/car-leasing/understand-capitalized-cost.html',
    example: '$42,500 (after $2,500 down payment)',
  },

  downPayment: {
    title: 'Down Payment (Cap Cost Reduction)',
    shortHint: 'Any upfront payment you made to reduce your monthly payments',
    description:
      "Any money you paid upfront to lower your monthly lease payment. In lease terms, this is called a 'capitalized cost reduction'. The more you put down, the lower your monthly payments - but if your car is totaled or stolen, you might not get this money back.",
    whereToFind:
      "Look for 'Capitalized Cost Reduction', 'Down Payment', or 'Amount Due at Signing' on your lease paperwork",
    example: '$2,500',
  },

  purchaseFee: {
    title: 'Purchase Option Fee',
    shortHint: 'A fee charged if you decide to buy the car at lease end',
    description:
      "If you decide to buy your leased car when the lease ends, many leasing companies charge a 'purchase option fee' to cover the paperwork and title transfer. This is separate from the residual value (the actual buyout price).",
    whereToFind:
      "Look for 'Purchase Option Fee', 'Buyout Fee', or 'Lease End Purchase Fee' in the fees section",
    example: '$350 (typical range: $200-$500)',
  },

  overageFeePerMile: {
    title: 'Overage Fee Per Mile',
    shortHint: 'The per-mile charge for driving more than your allowed miles',
    description:
      "If you exceed your mileage allowance, you'll pay this amount for every extra mile when you return the car. The fee varies by vehicle type - luxury and electric vehicles often have higher rates (up to $0.30/mile), while economy cars might be $0.15-$0.20/mile.",
    whereToFind:
      "Look for 'Excess Mileage Charge', 'Mileage Penalty', or 'Excess Wear and Mileage' in your lease terms",
    example: '$0.25 per mile over allowance',
  },

  stateCode: {
    title: 'State',
    shortHint: 'Your state affects tax calculations',
    description:
      "Some states tax leases differently - some charge sales tax upfront on the entire car value, others tax just your monthly payments, and a few have no sales tax at all. We use your state to estimate tax implications for different exit options.",
    whereToFind: 'Your home state (where the car is registered)',
    example: 'CA (California)',
  },

  residualPercent: {
    title: 'Residual Percentage',
    shortHint: 'Residual value as a percentage of MSRP',
    description:
      "This shows what percentage of the car's original MSRP the leasing company expects it to retain at lease end. A higher percentage means the car holds its value better - which usually results in lower monthly payments. Luxury SUVs and trucks often have residuals of 55-65%, while sedans might be 45-55%.",
    whereToFind:
      "You might see this on your lease as 'Residual %' or you can calculate it: (Residual Value ÷ MSRP) × 100",
    example: '58% (meaning the car retains 58% of its original value)',
  },

  make: {
    title: 'Vehicle Make',
    shortHint: 'The manufacturer (brand) of your vehicle',
    description:
      "The car's manufacturer or brand. This helps us provide more accurate projections and potentially look up typical depreciation patterns for your vehicle.",
    example: 'Toyota, Honda, BMW, Tesla',
  },

  model: {
    title: 'Vehicle Model',
    shortHint: 'The specific model name of your vehicle',
    description:
      "The specific model of your car. Different models from the same manufacturer can have very different residual values and depreciation patterns.",
    example: 'Camry, Accord, 3 Series, Model 3',
  },

  year: {
    title: 'Model Year',
    shortHint: 'The model year of your vehicle',
    description:
      "The model year (not necessarily the year you bought it). This is usually printed on your lease paperwork and helps determine the car's age and expected depreciation.",
    example: '2023',
  },

  monthsElapsed: {
    title: 'Months Into Lease',
    shortHint: 'How many months have passed since your lease started',
    description:
      "How far you are into your lease term. This helps us calculate how many payments you have left and whether you're on track with your mileage allowance. If you're 12 months into a 36-month lease, you've completed 1/3 of your term.",
    example: '12 months (1 year into a 3-year lease)',
  },

  startDate: {
    title: 'Lease Start Date',
    shortHint: 'The date your lease began',
    description:
      "The date you signed your lease and took delivery of the car. This helps us calculate exactly where you are in your lease term and when it will end.",
    example: 'January 15, 2023',
  },

  endDate: {
    title: 'Lease End Date',
    shortHint: 'The date your lease is scheduled to end',
    description:
      "The date your lease contract expires. This is when you'll need to return the car, buy it out, or possibly extend the lease. Most leases give you a small grace period around this date.",
    example: 'January 15, 2026',
  },
};
