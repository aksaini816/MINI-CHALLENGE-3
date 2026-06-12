import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/authenticate';
import {
  adminGetUsers, adminUpdateUser,
  adminCreateArticle, adminUpdateArticle, adminDeleteArticle, adminGetArticles,
  adminAnalytics,
  adminGetChallenges, adminCreateChallenge,
} from '../controllers/admin.controller';
import { asyncHandler } from '../utils/asyncHandler';

export const adminRouter = Router();
adminRouter.use(authenticate, requireRole('ADMIN'));

adminRouter.get('/users', asyncHandler(adminGetUsers));
adminRouter.put('/users/:id', asyncHandler(adminUpdateUser));
adminRouter.get('/articles', asyncHandler(adminGetArticles));
adminRouter.post('/articles', asyncHandler(adminCreateArticle));
adminRouter.put('/articles/:id', asyncHandler(adminUpdateArticle));
adminRouter.delete('/articles/:id', asyncHandler(adminDeleteArticle));
adminRouter.get('/challenges', asyncHandler(adminGetChallenges));
adminRouter.post('/challenges', asyncHandler(adminCreateChallenge));
adminRouter.get('/analytics', asyncHandler(adminAnalytics));
