import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import { register, login, logout, refreshToken, me } from '../controllers/auth.controller';
import { validate } from '../middleware/validate';
import { authenticate } from '../middleware/authenticate';
import { registerSchema, loginSchema, refreshTokenSchema } from '../schemas/auth.schema';
import { asyncHandler } from '../utils/asyncHandler';

export const authRouter = Router();

// Strict rate limiting for auth endpoints
const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many authentication attempts, please try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

authRouter.post('/register', authRateLimit, validate(registerSchema), asyncHandler(register));
authRouter.post('/login', authRateLimit, validate(loginSchema), asyncHandler(login));
authRouter.post('/logout', asyncHandler(logout));
authRouter.post('/refresh', validate(refreshTokenSchema), asyncHandler(refreshToken));
authRouter.get('/me', authenticate, asyncHandler(me));
