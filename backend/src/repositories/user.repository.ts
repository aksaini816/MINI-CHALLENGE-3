import { prisma } from '../prisma/client';
import { Prisma, User } from '@prisma/client';

type UserCreateData = Prisma.UserCreateInput;
type SafeUser = Omit<User, 'passwordHash'>;

/**
 * Repository layer — handles all database operations for User model.
 */
export class UserRepository {
  async findById(id: string): Promise<SafeUser | null> {
    return prisma.user.findUnique({
      where: { id },
      omit: { passwordHash: true },
    });
  }

  async findByIdWithHash(id: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { id } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { email } });
  }

  async create(data: UserCreateData): Promise<SafeUser> {
    const user = await prisma.user.create({
      data,
      omit: { passwordHash: true },
    });
    return user;
  }

  async update(id: string, data: Prisma.UserUpdateInput): Promise<SafeUser> {
    return prisma.user.update({
      where: { id },
      data,
      omit: { passwordHash: true },
    });
  }

  async findMany(params: {
    skip?: number;
    take?: number;
    search?: string;
  }): Promise<{ users: SafeUser[]; total: number }> {
    const { skip = 0, take = 20, search } = params;
    const where: Prisma.UserWhereInput = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {};

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        omit: { passwordHash: true },
      }),
      prisma.user.count({ where }),
    ]);

    return { users, total };
  }

  async saveRefreshToken(userId: string, token: string, expiresAt: Date): Promise<void> {
    await prisma.refreshToken.create({ data: { token, userId, expiresAt } });
  }

  async findRefreshToken(token: string) {
    return prisma.refreshToken.findUnique({ where: { token }, include: { user: true } });
  }

  async deleteRefreshToken(token: string): Promise<void> {
    await prisma.refreshToken.delete({ where: { token } });
  }

  async deleteAllUserRefreshTokens(userId: string): Promise<void> {
    await prisma.refreshToken.deleteMany({ where: { userId } });
  }
}
