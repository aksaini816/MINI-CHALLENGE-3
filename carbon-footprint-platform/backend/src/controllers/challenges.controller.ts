import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/authenticate';
import { challengesService } from '../services/challenges.service';

export const getChallenges = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const challenges = await challengesService.getAllChallenges();
    res.json({ success: true, data: { challenges } });
  } catch (err) { next(err); }
};

export const getUserChallenges = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const challenges = await challengesService.getUserChallenges(req.user!.id);
    res.json({ success: true, data: { challenges } });
  } catch (err) { next(err); }
};

export const joinChallenge = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await challengesService.joinChallenge(req.user!.id, req.params.id);
    res.status(201).json({ success: true, message: 'Challenge joined!', data: result });
  } catch (err) { next(err); }
};

export const completeChallenge = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await challengesService.completeChallenge(req.user!.id, req.params.id);
    res.json({ success: true, message: 'Challenge completed! Points awarded.', data: result });
  } catch (err) { next(err); }
};

export const getUserStats = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const stats = await challengesService.getUserStats(req.user!.id);
    res.json({ success: true, data: stats });
  } catch (err) { next(err); }
};
