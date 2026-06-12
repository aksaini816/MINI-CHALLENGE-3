import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import { validate } from '../middleware/validate';
import { createGoalSchema, updateGoalSchema } from '../schemas/goal.schema';
import { getGoals, createGoal, updateGoal, deleteGoal } from '../controllers/goals.controller';
import { asyncHandler } from '../utils/asyncHandler';

export const goalsRouter = Router();
goalsRouter.use(authenticate);

goalsRouter.get('/', asyncHandler(getGoals));
goalsRouter.post('/', validate(createGoalSchema), asyncHandler(createGoal));
goalsRouter.put('/:id', validate(updateGoalSchema), asyncHandler(updateGoal));
goalsRouter.delete('/:id', asyncHandler(deleteGoal));
