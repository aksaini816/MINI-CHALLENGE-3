import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { AppError } from '../utils/AppError';

type ValidationTarget = 'body' | 'query' | 'params';

/**
 * Express middleware factory for Zod schema validation.
 */
export const validate =
  (schema: AnyZodObject, target: ValidationTarget = 'body') =>
  async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = await schema.parseAsync(req[target]);
      req[target] = parsed;
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        next(err);
      } else {
        next(AppError.badRequest('Validation failed'));
      }
    }
  };
