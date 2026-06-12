import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import { AppError } from '../utils/AppError';
import { logger } from '../utils/logger';
import { config } from '../config/env';

/**
 * Centralized error handling middleware.
 * Handles AppError, ZodError, Prisma errors, and unknown errors uniformly.
 */
export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  // Zod validation errors
  if (err instanceof ZodError) {
    res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: err.issues.map((i) => ({
          field: i.path.join('.'),
          message: i.message,
        })),
      },
    });
    return;
  }

  // Prisma unique constraint violation
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      const fields = (err.meta?.target as string[]) ?? ['field'];
      res.status(409).json({
        success: false,
        error: {
          code: 'CONFLICT',
          message: `${fields.join(', ')} already exists`,
        },
      });
      return;
    }
    if (err.code === 'P2025') {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Resource not found' },
      });
      return;
    }
  }

  // Operational AppErrors
  if (err instanceof AppError) {
    logger.warn('Operational error:', { message: err.message, code: err.code });
    res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code ?? 'ERROR',
        message: err.message,
      },
    });
    return;
  }

  // Unknown / programming errors
  logger.error('Unexpected error:', { message: err.message, stack: err.stack });
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message:
        config.NODE_ENV === 'production'
          ? 'An unexpected error occurred'
          : err.message,
    },
  });
};
