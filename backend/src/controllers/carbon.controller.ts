import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/authenticate';
import { carbonService } from '../services/carbon.service';

/**
 * POST /api/carbon/calculate
 * Calculate and save carbon footprint entry.
 */
export const calculateCarbon = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result = await carbonService.calculate(req.user!.id, req.body);
    res.status(201).json({
      success: true,
      message: 'Carbon footprint calculated and saved',
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/carbon/history
 * Get paginated emission history.
 */
export const getCarbonHistory = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 10, 50);
    const result = await carbonService.getHistory(req.user!.id, page, limit);
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/carbon/summary
 * Get dashboard summary with trends.
 */
export const getCarbonSummary = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const summary = await carbonService.getSummary(req.user!.id);
    res.status(200).json({ success: true, data: summary });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/carbon/insights
 * Get AI-powered sustainability insights.
 */
export const getCarbonInsights = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const insights = await carbonService.getInsights(req.user!.id);
    res.status(200).json({ success: true, data: insights });
  } catch (err) {
    next(err);
  }
};
