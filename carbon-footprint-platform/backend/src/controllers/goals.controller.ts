import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/authenticate';
import { goalsService } from '../services/goals.service';

export const getGoals = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const goals = await goalsService.getUserGoals(req.user!.id);
    res.json({ success: true, data: { goals } });
  } catch (err) { next(err); }
};

export const createGoal = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const goal = await goalsService.createGoal(req.user!.id, req.body);
    res.status(201).json({ success: true, message: 'Goal created', data: { goal } });
  } catch (err) { next(err); }
};

export const updateGoal = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const goal = await goalsService.updateGoal(req.user!.id, req.params.id, req.body);
    res.json({ success: true, message: 'Goal updated', data: { goal } });
  } catch (err) { next(err); }
};

export const deleteGoal = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    await goalsService.deleteGoal(req.user!.id, req.params.id);
    res.json({ success: true, message: 'Goal deleted' });
  } catch (err) { next(err); }
};
