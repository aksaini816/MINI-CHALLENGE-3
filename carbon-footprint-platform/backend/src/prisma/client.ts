import { PrismaClient, Prisma } from '@prisma/client';
import { logger } from '../utils/logger';

const createPrismaClient = () => {
  return new PrismaClient<Prisma.PrismaClientOptions, 'query' | 'error' | 'warn'>({
    log: [
      { emit: 'event', level: 'query' },
      { emit: 'event', level: 'error' },
      { emit: 'event', level: 'warn' },
    ],
  });
};

export const prisma = createPrismaClient();

prisma.$on('error', (e: Prisma.LogEvent) => {
  logger.error('Prisma error:', { message: e.message, target: e.target });
});

prisma.$on('warn', (e: Prisma.LogEvent) => {
  logger.warn('Prisma warning:', { message: e.message, target: e.target });
});
