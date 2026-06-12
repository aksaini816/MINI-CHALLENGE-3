import { prisma } from '../prisma/client';
import { AppError } from '../utils/AppError';
import { CreateGoalInput, UpdateGoalInput } from '../schemas/goal.schema';

export class GoalsService {
  async getUserGoals(userId: string) {
    return prisma.goal.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createGoal(userId: string, input: CreateGoalInput) {
    return prisma.goal.create({
      data: {
        userId,
        title: input.title,
        description: input.description,
        targetReduction: input.targetReduction,
        baselineValue: input.baselineValue ?? 0,
        unit: input.unit,
        deadline: new Date(input.deadline),
        category: input.category,
      },
    });
  }

  async updateGoal(userId: string, goalId: string, input: UpdateGoalInput) {
    const existing = await prisma.goal.findUnique({ where: { id: goalId } });
    if (!existing) throw AppError.notFound('Goal');
    if (existing.userId !== userId) throw AppError.forbidden();

    return prisma.goal.update({
      where: { id: goalId },
      data: {
        ...input,
        deadline: input.deadline ? new Date(input.deadline) : undefined,
      },
    });
  }

  async deleteGoal(userId: string, goalId: string): Promise<void> {
    const existing = await prisma.goal.findUnique({ where: { id: goalId } });
    if (!existing) throw AppError.notFound('Goal');
    if (existing.userId !== userId) throw AppError.forbidden();
    await prisma.goal.delete({ where: { id: goalId } });
  }
}

export const goalsService = new GoalsService();
