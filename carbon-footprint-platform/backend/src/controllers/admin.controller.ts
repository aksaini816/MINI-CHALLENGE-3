import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/authenticate';
import { UserRepository } from '../repositories/user.repository';
import { prisma } from '../prisma/client';
import { z } from 'zod';

const userRepo = new UserRepository();

const createArticleSchema = z.object({
  title: z.string().min(3).max(200),
  slug: z.string().min(3).max(200).regex(/^[a-z0-9-]+$/),
  excerpt: z.string().min(10).max(500),
  content: z.string().min(50),
  category: z.enum([
    'CLIMATE_CHANGE', 'CARBON_FOOTPRINT', 'SUSTAINABLE_LIVING',
    'RENEWABLE_ENERGY', 'FOOD_AND_DIET', 'TRANSPORTATION',
  ]),
  tags: z.array(z.string()).default([]),
  author: z.string().min(2),
  readTime: z.number().min(1).default(5),
  published: z.boolean().default(false),
});

// GET /api/admin/users
export const adminGetUsers = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const search = req.query.search as string | undefined;
    const { users, total } = await userRepo.findMany({
      skip: (page - 1) * limit,
      take: limit,
      search,
    });
    res.json({ success: true, data: { users, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } } });
  } catch (err) { next(err); }
};

// PUT /api/admin/users/:id
export const adminUpdateUser = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { isActive, role } = req.body as { isActive?: boolean; role?: string };
    const user = await userRepo.update(req.params.id, { isActive, role: role as 'USER' | 'ADMIN' | undefined });
    res.json({ success: true, data: { user } });
  } catch (err) { next(err); }
};

// POST /api/admin/articles
export const adminCreateArticle = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = createArticleSchema.parse(req.body);
    const article = await prisma.article.create({
      data: {
        ...data,
        publishedAt: data.published ? new Date() : undefined,
      },
    });
    res.status(201).json({ success: true, data: { article } });
  } catch (err) { next(err); }
};

// PUT /api/admin/articles/:id
export const adminUpdateArticle = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const article = await prisma.article.update({
      where: { id: req.params.id },
      data: {
        ...req.body,
        publishedAt: req.body.published ? new Date() : undefined,
      },
    });
    res.json({ success: true, data: { article } });
  } catch (err) { next(err); }
};

// DELETE /api/admin/articles/:id
export const adminDeleteArticle = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    await prisma.article.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Article deleted' });
  } catch (err) { next(err); }
};

// GET /api/admin/analytics
export const adminAnalytics = async (_req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const [
      totalUsers,
      activeUsers,
      totalEntries,
      totalGoals,
      totalChallengesCompleted,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { isActive: true } }),
      prisma.carbonEntry.count(),
      prisma.goal.count(),
      prisma.userChallenge.count({ where: { status: 'COMPLETED' } }),
    ]);

    const avgEmissions = await prisma.carbonEntry.aggregate({ _avg: { totalMonthly: true } });
    const avgScore = await prisma.carbonEntry.aggregate({ _avg: { sustainabilityScore: true } });

    res.json({
      success: true,
      data: {
        totalUsers,
        activeUsers,
        totalEntries,
        totalGoals,
        totalChallengesCompleted,
        avgMonthlyEmissions: Math.round((avgEmissions._avg.totalMonthly ?? 0) * 100) / 100,
        avgSustainabilityScore: Math.round((avgScore._avg.sustainabilityScore ?? 0) * 10) / 10,
      },
    });
  } catch (err) { next(err); }
};

// GET /api/admin/challenges
export const adminGetChallenges = async (_req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const challenges = await prisma.challenge.findMany({ orderBy: { createdAt: 'desc' } });
    res.json({ success: true, data: { challenges } });
  } catch (err) { next(err); }
};

// POST /api/admin/challenges
export const adminCreateChallenge = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const challenge = await prisma.challenge.create({ data: req.body });
    res.status(201).json({ success: true, data: { challenge } });
  } catch (err) { next(err); }
};

// GET /api/admin/articles
export const adminGetArticles = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const articles = await prisma.article.findMany({ orderBy: { createdAt: 'desc' } });
    res.json({ success: true, data: { articles } });
  } catch (err) { next(err); }
};
