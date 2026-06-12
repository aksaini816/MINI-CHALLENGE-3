import { prisma } from '../prisma/client';
import { CalculationInput, calculateEmissions } from '../utils/carbonCalculator';
import { insightsEngine } from './insights.service';

/**
 * Carbon footprint service — handles calculations, history, and summary.
 */
export class CarbonService {
  /**
   * Calculate and persist a carbon entry for the user.
   */
  async calculate(userId: string, input: CalculationInput & { notes?: string }) {
    const result = calculateEmissions(input);

    const entry = await prisma.carbonEntry.create({
      data: {
        userId,
        carKm: input.carKm,
        bikeKm: input.bikeKm,
        publicTransportKm: input.publicTransportKm,
        flightKmPerYear: input.flightKmPerYear,
        electricityKwh: input.electricityKwh,
        naturalGasM3: input.naturalGasM3,
        lpgKg: input.lpgKg,
        dietType: input.dietType,
        recyclingPercent: input.recyclingPercent,
        plasticKg: input.plasticKg,
        generalWasteKg: input.generalWasteKg,
        transportEmissions: result.transportEmissions,
        energyEmissions: result.energyEmissions,
        foodEmissions: result.foodEmissions,
        wasteEmissions: result.wasteEmissions,
        totalMonthly: result.totalMonthly,
        totalYearly: result.totalYearly,
        sustainabilityScore: result.sustainabilityScore,
        notes: input.notes,
      },
    });

    const insights = insightsEngine.generateInsights(input, result);
    return { entry, result, insights };
  }

  /**
   * Get paginated carbon entry history.
   */
  async getHistory(userId: string, page: number, limit: number) {
    const skip = (page - 1) * limit;
    const [entries, total] = await Promise.all([
      prisma.carbonEntry.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.carbonEntry.count({ where: { userId } }),
    ]);

    return {
      entries,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get aggregated summary with trends.
   */
  async getSummary(userId: string) {
    const entries = await prisma.carbonEntry.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
      take: 12,
    });

    if (entries.length === 0) {
      return { hasData: false };
    }

    const latest = entries[entries.length - 1];
    const previous = entries.length > 1 ? entries[entries.length - 2] : null;

    // Monthly trend data
    const monthlyTrend = entries.map((e) => ({
      month: new Date(e.createdAt).toLocaleString('default', { month: 'short', year: '2-digit' }),
      total: e.totalMonthly,
      transport: e.transportEmissions,
      energy: e.energyEmissions,
      food: e.foodEmissions,
      waste: e.wasteEmissions,
    }));

    // Calculate reduction from first entry
    const firstEntry = entries[0];
    const reductionAchieved = firstEntry
      ? Math.max(0, firstEntry.totalMonthly - latest.totalMonthly)
      : 0;

    return {
      hasData: true,
      currentMonthly: latest.totalMonthly,
      currentYearly: latest.totalYearly,
      sustainabilityScore: latest.sustainabilityScore,
      reductionAchieved,
      changeFromPrevious: previous
        ? latest.totalMonthly - previous.totalMonthly
        : 0,
      categoryBreakdown: [
        { category: 'Transportation', value: latest.transportEmissions },
        { category: 'Home Energy', value: latest.energyEmissions },
        { category: 'Food', value: latest.foodEmissions },
        { category: 'Waste', value: latest.wasteEmissions },
      ],
      monthlyTrend,
    };
  }

  /**
   * Get AI insights for the user's latest entry.
   */
  async getInsights(userId: string) {
    const latest = await prisma.carbonEntry.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    if (!latest) {
      return { hasData: false, insights: [] };
    }

    const input: CalculationInput = {
      carKm: latest.carKm,
      bikeKm: latest.bikeKm,
      publicTransportKm: latest.publicTransportKm,
      flightKmPerYear: latest.flightKmPerYear,
      electricityKwh: latest.electricityKwh,
      naturalGasM3: latest.naturalGasM3,
      lpgKg: latest.lpgKg,
      dietType: latest.dietType as CalculationInput['dietType'],
      recyclingPercent: latest.recyclingPercent,
      plasticKg: latest.plasticKg,
      generalWasteKg: latest.generalWasteKg,
    };

    const result = calculateEmissions(input);
    const insights = insightsEngine.generateInsights(input, result);
    return { hasData: true, insights };
  }
}

export const carbonService = new CarbonService();
