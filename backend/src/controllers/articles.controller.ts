import { Request, Response, NextFunction } from 'express';
import { articlesService } from '../services/articles.service';
import { AppError } from '../utils/AppError';

export const getArticles = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 12, 50);
    const result = await articlesService.getArticles({
      category: req.query.category as string | undefined,
      search: req.query.search as string | undefined,
      page,
      limit,
    });
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
};

export const getArticle = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const article = await articlesService.getArticleBySlug(req.params.slug);
    if (!article) throw AppError.notFound('Article');
    res.json({ success: true, data: { article } });
  } catch (err) { next(err); }
};
