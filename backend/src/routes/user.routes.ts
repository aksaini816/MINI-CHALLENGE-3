import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import { getProfile, updateProfile } from '../controllers/user.controller';
import { asyncHandler } from '../utils/asyncHandler';

export const userRouter = Router();
userRouter.use(authenticate);
userRouter.get('/profile', asyncHandler(getProfile));
userRouter.put('/profile', asyncHandler(updateProfile));
