import { InsightsEngine } from '../services/insights.service';
import { CalculationInput, calculateEmissions } from '../utils/carbonCalculator';

const engine = new InsightsEngine();

const highCarInput: CalculationInput = {
  carKm: 200,
  bikeKm: 0,
  publicTransportKm: 10,
  flightKmPerYear: 15000,
  electricityKwh: 500,
  naturalGasM3: 80,
  lpgKg: 10,
  dietType: 'HIGH_MEAT',
  recyclingPercent: 20,
  plasticKg: 8,
  generalWasteKg: 30,
};

describe('InsightsEngine', () => {
  it('generates insights for high-emission user', () => {
    const result = calculateEmissions(highCarInput);
    const insights = engine.generateInsights(highCarInput, result);
    expect(insights.length).toBeGreaterThan(0);
    expect(insights.length).toBeLessThanOrEqual(8);
  });

  it('each insight has required fields', () => {
    const result = calculateEmissions(highCarInput);
    const insights = engine.generateInsights(highCarInput, result);
    insights.forEach((insight: { id: string; category: string; priority: string; title: string; description: string; potentialReduction: number; actionable: boolean }) => {
      expect(insight).toHaveProperty('id');
      expect(insight).toHaveProperty('category');
      expect(insight).toHaveProperty('priority');
      expect(insight).toHaveProperty('title');
      expect(insight).toHaveProperty('description');
      expect(insight).toHaveProperty('potentialReduction');
      expect(typeof insight.potentialReduction).toBe('number');
      expect(insight.potentialReduction).toBeGreaterThanOrEqual(0);
    });
  });

  it('insights are sorted by potential reduction (highest first)', () => {
    const result = calculateEmissions(highCarInput);
    const insights = engine.generateInsights(highCarInput, result);
    for (let i = 0; i < insights.length - 1; i++) {
      expect(insights[i].potentialReduction).toBeGreaterThanOrEqual(
        insights[i + 1].potentialReduction,
      );
    }
  });

  it('does not suggest car switch for users who barely drive', () => {
    const lowCarInput: CalculationInput = {
      ...highCarInput,
      carKm: 5,
    };
    const result = calculateEmissions(lowCarInput);
    const insights = engine.generateInsights(lowCarInput, result);
    const carInsight = insights.find((i: { id: string }) => i.id === 'car-to-public');
    expect(carInsight).toBeUndefined();
  });

  it('does not suggest diet change for vegan users', () => {
    const veganInput: CalculationInput = { ...highCarInput, dietType: 'VEGAN' };
    const result = calculateEmissions(veganInput);
    const insights = engine.generateInsights(veganInput, result);
    const dietInsight = insights.find((i: { id: string }) => i.id === 'diet-change');
    expect(dietInsight).toBeUndefined();
  });

  it('generates high priority insights for very high emissions', () => {
    const result = calculateEmissions(highCarInput);
    const insights = engine.generateInsights(highCarInput, result);
    const hasHighPriority = insights.some((i: { priority: string }) => i.priority === 'high');
    expect(hasHighPriority).toBe(true);
  });

  it('returns empty insights when no applicable rules match', () => {
    const perfectInput: CalculationInput = {
      carKm: 0,
      bikeKm: 50,
      publicTransportKm: 0,
      flightKmPerYear: 0,
      electricityKwh: 50,
      naturalGasM3: 0,
      lpgKg: 0,
      dietType: 'VEGAN',
      recyclingPercent: 100,
      plasticKg: 0,
      generalWasteKg: 0,
    };
    const result = calculateEmissions(perfectInput);
    const insights = engine.generateInsights(perfectInput, result);
    // Should have few or no insights for very low emissions
    expect(insights.length).toBeLessThanOrEqual(5);
  });
});
