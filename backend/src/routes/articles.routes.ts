import { Router } from 'express';
import { getArticles, getArticle } from '../controllers/articles.controller';
import { asyncHandler } from '../utils/asyncHandler';

export const articlesRouter = Router();
articlesRouter.get('/', asyncHandler(getArticles));
articlesRouter.get('/:slug', asyncHandler(getArticle));
