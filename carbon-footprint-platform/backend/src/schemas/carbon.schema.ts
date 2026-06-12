import { z } from 'zod';

export const calculateCarbonSchema = z.object({
  carKm: z.number().min(0).max(10000).default(0),
  bikeKm: z.number().min(0).max(10000).default(0),
  publicTransportKm: z.number().min(0).max(10000).default(0),
  flightKmPerYear: z.number().min(0).max(200000).default(0),
  electricityKwh: z.number().min(0).max(10000).default(0),
  naturalGasM3: z.number().min(0).max(1000).default(0),
  lpgKg: z.number().min(0).max(500).default(0),
  dietType: z.enum(['VEGAN', 'VEGETARIAN', 'MIXED', 'HIGH_MEAT']).default('MIXED'),
  recyclingPercent: z.number().min(0).max(100).default(50),
  plasticKg: z.number().min(0).max(100).default(0),
  generalWasteKg: z.number().min(0).max(500).default(0),
  notes: z.string().max(500).optional(),
});

export const paginationSchema = z.object({
  page: z.string().default('1').transform(Number),
  limit: z.string().default('10').transform(Number),
});

export type CalculateCarbonInput = z.infer<typeof calculateCarbonSchema>;
