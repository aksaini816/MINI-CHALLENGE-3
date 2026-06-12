import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import { validate } from '../middleware/validate';
import { calculateCarbonSchema } from '../schemas/carbon.schema';
import {
  calculateCarbon,
  getCarbonHistory,
  getCarbonSummary,
  getCarbonInsights,
} from '../controllers/carbon.controller';
import { asyncHandler } from '../utils/asyncHandler';

export const carbonRouter = Router();

carbonRouter.use(authenticate);

carbonRouter.post('/calculate', validate(calculateCarbonSchema), asyncHandler(calculateCarbon));
carbonRouter.get('/history', asyncHandler(getCarbonHistory));
carbonRouter.get('/summary', asyncHandler(getCarbonSummary));
carbonRouter.get('/insights', asyncHandler(getCarbonInsights));
