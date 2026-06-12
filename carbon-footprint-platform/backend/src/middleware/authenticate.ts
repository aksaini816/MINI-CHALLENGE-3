import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';
import { AppError } from '../utils/AppError';
import { prisma } from '../prisma/client';
import { Role } from '@prisma/client';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: Role;
    name: string;
  };
}

interface JwtPayload {
  userId: string;
  email: string;
  role: Role;
  name: string;
  iat?: number;
  exp?: number;
}

/**
 * Middleware to verify JWT access token and attach user to request.
 */
export const authenticate = async (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      throw AppError.unauthorized('No token provided');
    }

    const token = authHeader.slice(7);
    const payload = jwt.verify(token, config.JWT_ACCESS_SECRET) as JwtPayload;

    // Verify user still exists and is active
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, email: true, role: true, name: true, isActive: true },
    });

    if (!user || !user.isActive) {
      throw AppError.unauthorized('User not found or deactivated');
    }

    req.user = { id: user.id, email: user.email, role: user.role, name: user.name };
    next();
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      next(AppError.unauthorized('Token expired'));
    } else if (err instanceof jwt.JsonWebTokenError) {
      next(AppError.unauthorized('Invalid token'));
    } else {
      next(err);
    }
  }
};

/**
 * Middleware factory to require specific roles.
 */
export const requireRole = (...roles: Role[]) => {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(AppError.unauthorized());
      return;
    }
    if (!roles.includes(req.user.role)) {
      next(AppError.forbidden('Insufficient permissions'));
      return;
    }
    next();
  };
};
