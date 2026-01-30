import { z } from 'zod';

export const marketValueSchema = z.object({
  value: z.coerce
    .number()
    .positive({ message: 'Market value must be a positive number' })
    .max(500000, { message: 'Market value seems unusually high. Please verify.' }),
  source: z.enum(['manual', 'kbb', 'edmunds', 'carvana']).default('manual'),
  sourceLabel: z.string()
    .max(100, { message: 'Source label must be 100 characters or less' })
    .optional(),
});

export type MarketValueFormData = z.infer<typeof marketValueSchema>;
