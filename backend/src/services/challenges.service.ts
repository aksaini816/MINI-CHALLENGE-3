import { prisma } from '../prisma/client';
import { AppError } from '../utils/AppError';
import { ChallengeStatus } from '@prisma/client';

export class ChallengesService {
  async getAllChallenges() {
    return prisma.challenge.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getUserChallenges(userId: string) {
    return prisma.userChallenge.findMany({
      where: { userId },
      include: { challenge: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async joinChallenge(userId: string, challengeId: string) {
    const challenge = await prisma.challenge.findUnique({ where: { id: challengeId } });
    if (!challenge) throw AppError.notFound('Challenge');
    if (!challenge.isActive) throw AppError.badRequest('Challenge is no longer active');

    const existing = await prisma.userChallenge.findUnique({
      where: { userId_challengeId: { userId, challengeId } },
    });
    if (existing) throw AppError.conflict('Already joined this challenge');

    return prisma.userChallenge.create({
      data: {
        userId,
        challengeId,
        status: ChallengeStatus.IN_PROGRESS,
        startedAt: new Date(),
      },
      include: { challenge: true },
    });
  }

  async completeChallenge(userId: string, challengeId: string) {
    const userChallenge = await prisma.userChallenge.findUnique({
      where: { userId_challengeId: { userId, challengeId } },
      include: { challenge: true },
    });
    if (!userChallenge) throw AppError.notFound('User challenge');
    if (userChallenge.status === ChallengeStatus.COMPLETED)
      throw AppError.badRequest('Challenge already completed');

    const updated = await prisma.userChallenge.update({
      where: { userId_challengeId: { userId, challengeId } },
      data: {
        status: ChallengeStatus.COMPLETED,
        completedAt: new Date(),
        points: userChallenge.challenge.points,
        progress: 100,
      },
      include: { challenge: true },
    });

    // Award badge if challenge has one
    if (userChallenge.challenge.badge) {
      await prisma.badge.create({
        data: {
          userId,
          type: 'CHALLENGE',
          title: userChallenge.challenge.badge,
          description: `Completed: ${userChallenge.challenge.title}`,
          icon: '🏆',
        },
      });
    }

    return updated;
  }

  async getUserStats(userId: string) {
    const [completed, inProgress, badges] = await Promise.all([
      prisma.userChallenge.count({ where: { userId, status: 'COMPLETED' } }),
      prisma.userChallenge.count({ where: { userId, status: 'IN_PROGRESS' } }),
      prisma.badge.findMany({ where: { userId }, orderBy: { earnedAt: 'desc' } }),
    ]);

    const totalPoints = await prisma.userChallenge.aggregate({
      where: { userId, status: 'COMPLETED' },
      _sum: { points: true },
    });

    return {
      totalPoints: totalPoints._sum.points ?? 0,
      completedChallenges: completed,
      activeChallenges: inProgress,
      badges,
    };
  }
}

export const challengesService = new ChallengesService();
