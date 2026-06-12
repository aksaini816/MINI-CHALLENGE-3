import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config/env';
import { AppError } from '../utils/AppError';
import { UserRepository } from '../repositories/user.repository';
import { RegisterInput, LoginInput, RefreshTokenInput } from '../schemas/auth.schema';
import { User } from '@prisma/client';

interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

interface AuthResponse {
  user: Omit<User, 'passwordHash'>;
  tokens: TokenPair;
}

/**
 * Authentication service — handles registration, login, token management.
 */
export class AuthService {
  constructor(private readonly userRepo: UserRepository) {}

  /**
   * Register a new user account.
   */
  async register(input: RegisterInput): Promise<AuthResponse> {
    // Check for existing email
    const existing = await this.userRepo.findByEmail(input.email);
    if (existing) {
      throw AppError.conflict('An account with this email already exists');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(input.password, config.BCRYPT_ROUNDS);

    // Create user
    const user = await this.userRepo.create({
      email: input.email,
      name: input.name,
      passwordHash,
    });

    // Generate tokens
    const tokens = await this.generateTokenPair(user.id, user.email, user.role, user.name);
    return { user, tokens };
  }

  /**
   * Authenticate user with email and password.
   */
  async login(input: LoginInput): Promise<AuthResponse> {
    const user = await this.userRepo.findByEmail(input.email);
    if (!user) {
      throw AppError.unauthorized('Invalid email or password');
    }

    if (!user.isActive) {
      throw AppError.unauthorized('Account has been deactivated');
    }

    const isPasswordValid = await bcrypt.compare(input.password, user.passwordHash);
    if (!isPasswordValid) {
      throw AppError.unauthorized('Invalid email or password');
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, ...userWithoutPassword } = user;
    const tokens = await this.generateTokenPair(user.id, user.email, user.role, user.name);
    return { user: userWithoutPassword, tokens };
  }

  /**
   * Refresh access token using a valid refresh token.
   */
  async refreshToken(input: RefreshTokenInput): Promise<TokenPair> {
    const stored = await this.userRepo.findRefreshToken(input.refreshToken);
    if (!stored) {
      throw AppError.unauthorized('Invalid or expired refresh token');
    }

    if (stored.expiresAt < new Date()) {
      await this.userRepo.deleteRefreshToken(input.refreshToken);
      throw AppError.unauthorized('Refresh token has expired');
    }

    if (!stored.user.isActive) {
      throw AppError.unauthorized('Account has been deactivated');
    }

    // Rotate refresh token
    await this.userRepo.deleteRefreshToken(input.refreshToken);
    return this.generateTokenPair(
      stored.user.id,
      stored.user.email,
      stored.user.role,
      stored.user.name,
    );
  }

  /**
   * Logout — invalidate refresh token.
   */
  async logout(refreshToken: string): Promise<void> {
    await this.userRepo.deleteRefreshToken(refreshToken).catch(() => undefined);
  }

  /**
   * Generate an access + refresh token pair.
   */
  private async generateTokenPair(
    userId: string,
    email: string,
    role: string,
    name: string,
  ): Promise<TokenPair> {
    const accessToken = jwt.sign(
      { userId, email, role, name },
      config.JWT_ACCESS_SECRET,
      { expiresIn: config.JWT_ACCESS_EXPIRES_IN } as jwt.SignOptions,
    );

    const refreshToken = uuidv4();
    const refreshExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    await this.userRepo.saveRefreshToken(userId, refreshToken, refreshExpiresAt);

    return { accessToken, refreshToken };
  }
}
