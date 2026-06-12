import { z } from 'zod';

export const createGoalSchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().max(500).optional(),
  targetReduction: z.number().min(0.1).max(100000),
  baselineValue: z.number().min(0).default(0),
  unit: z.string().default('kg CO2'),
  deadline: z.string().datetime().or(z.string().pipe(z.coerce.date())),
  category: z.string().default('GENERAL'),
});

export const updateGoalSchema = createGoalSchema.partial().extend({
  status: z.enum(['ACTIVE', 'COMPLETED', 'PAUSED', 'FAILED']).optional(),
  currentValue: z.number().min(0).optional(),
});

export type CreateGoalInput = z.infer<typeof createGoalSchema>;
export type UpdateGoalInput = z.infer<typeof updateGoalSchema>;
