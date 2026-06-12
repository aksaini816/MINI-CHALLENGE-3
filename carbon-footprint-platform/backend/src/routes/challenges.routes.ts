import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import { getChallenges, getUserChallenges, joinChallenge, completeChallenge, getUserStats } from '../controllers/challenges.controller';
import { asyncHandler } from '../utils/asyncHandler';

export const challengesRouter = Router();
challengesRouter.use(authenticate);

challengesRouter.get('/', asyncHandler(getChallenges));
challengesRouter.get('/my', asyncHandler(getUserChallenges));
challengesRouter.get('/stats', asyncHandler(getUserStats));
challengesRouter.post('/:id/join', asyncHandler(joinChallenge));
challengesRouter.put('/:id/complete', asyncHandler(completeChallenge));
