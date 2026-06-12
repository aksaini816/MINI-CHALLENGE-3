import { CalculationResult, CalculationInput, EMISSION_FACTORS } from '../utils/carbonCalculator';

export interface Insight {
  id: string;
  category: 'transport' | 'energy' | 'food' | 'waste' | 'general';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  potentialReduction: number; // kg CO2/year
  actionable: boolean;
}

/**
 * Rule-based AI Insights Engine.
 *
 * Architecture designed for future LLM integration:
 * - Each rule is a pure function returning an Insight or null
 * - Can be swapped with LLM-generated insights by replacing generateInsights()
 * - Insights are ranked by potentialReduction
 */
export class InsightsEngine {
  private readonly rules: Array<(input: CalculationInput, result: CalculationResult) => Insight | null>;

  constructor() {
    this.rules = [
      this.carSwitchRule,
      this.electricityRule,
      this.dietRule,
      this.flightRule,
      this.recyclingRule,
      this.publicTransportRule,
      this.gasRule,
      this.plasticRule,
    ];
  }

  /**
   * Generate sorted, personalized sustainability insights.
   */
  generateInsights(input: CalculationInput, result: CalculationResult): Insight[] {
    const insights = this.rules
      .map((rule) => rule.call(this, input, result))
      .filter((insight): insight is Insight => insight !== null)
      .sort((a, b) => b.potentialReduction - a.potentialReduction);

    return insights.slice(0, 8); // Return top 8 insights
  }

  private carSwitchRule(input: CalculationInput, _result: CalculationResult): Insight | null {
    if (input.carKm < 10) return null;
    const weeklyKm = input.carKm;
    const switchableKm = weeklyKm * 0.3; // assume 30% can be switched
    const reduction =
      switchableKm * EMISSION_FACTORS.transport.car * 4.33 * 12 -
      switchableKm * EMISSION_FACTORS.transport.publicTransport * 4.33 * 12;

    return {
      id: 'car-to-public',
      category: 'transport',
      priority: weeklyKm > 50 ? 'high' : 'medium',
      title: 'Switch some car trips to public transport',
      description: `Replacing ${switchableKm.toFixed(0)} km/week of car travel with public transport could reduce your annual emissions by approximately ${reduction.toFixed(0)} kg CO₂.`,
      potentialReduction: Math.max(0, reduction),
      actionable: true,
    };
  }

  private publicTransportRule(input: CalculationInput, _result: CalculationResult): Insight | null {
    if (input.carKm < 20) return null;
    const weeklyKm = input.carKm;
    const cycleableKm = Math.min(weeklyKm * 0.2, 10);
    const reduction = cycleableKm * EMISSION_FACTORS.transport.car * 4.33 * 12;

    return {
      id: 'car-to-bike',
      category: 'transport',
      priority: 'medium',
      title: 'Replace short car trips with cycling',
      description: `Cycling ${cycleableKm.toFixed(0)} km/week instead of driving could eliminate ${reduction.toFixed(0)} kg CO₂/year while improving your health.`,
      potentialReduction: Math.max(0, reduction),
      actionable: true,
    };
  }

  private electricityRule(input: CalculationInput, _result: CalculationResult): Insight | null {
    if (input.electricityKwh < 100) return null;
    const savings = input.electricityKwh * 0.2 * EMISSION_FACTORS.energy.electricity * 12;
    return {
      id: 'electricity-reduce',
      category: 'energy',
      priority: input.electricityKwh > 400 ? 'high' : 'medium',
      title: 'Reduce electricity consumption by 20%',
      description: `Switch to LED lighting, unplug standby devices, and use energy-efficient appliances. A 20% reduction could save ${savings.toFixed(0)} kg CO₂/year.`,
      potentialReduction: savings,
      actionable: true,
    };
  }

  private dietRule(input: CalculationInput, _result: CalculationResult): Insight | null {
    if (input.dietType === 'VEGAN') return null;
    const dietMap = { VEGETARIAN: 'VEGAN', MIXED: 'VEGETARIAN', HIGH_MEAT: 'MIXED' } as const;
    const nextDiet = dietMap[input.dietType as keyof typeof dietMap];
    const currentEmissions = EMISSION_FACTORS.food[input.dietType as keyof typeof EMISSION_FACTORS.food];
    const nextEmissions = EMISSION_FACTORS.food[nextDiet as keyof typeof EMISSION_FACTORS.food];
    const reduction = (currentEmissions - nextEmissions) * 12;

    const tips: Record<string, string> = {
      VEGETARIAN: 'eliminating animal products',
      MIXED: 'reducing meat consumption by replacing 2–3 meals per week',
      HIGH_MEAT: 'adopting a more balanced diet with less red meat',
    };

    return {
      id: 'diet-change',
      category: 'food',
      priority: input.dietType === 'HIGH_MEAT' ? 'high' : 'medium',
      title: `Shift towards a ${nextDiet.toLowerCase().replace('_', '-')} diet`,
      description: `By ${tips[input.dietType]}, you could reduce food-related emissions by ${reduction.toFixed(0)} kg CO₂/year.`,
      potentialReduction: Math.max(0, reduction),
      actionable: true,
    };
  }

  private flightRule(input: CalculationInput, _result: CalculationResult): Insight | null {
    if (input.flightKmPerYear < 500) return null;
    const reduction = input.flightKmPerYear * 0.25 * EMISSION_FACTORS.transport.flight;
    return {
      id: 'reduce-flights',
      category: 'transport',
      priority: input.flightKmPerYear > 5000 ? 'high' : 'medium',
      title: 'Reduce air travel by 25%',
      description: `Flights are among the highest emission activities. Reducing air travel by 25% could save ${reduction.toFixed(0)} kg CO₂/year. Consider video conferencing or train travel for shorter distances.`,
      potentialReduction: reduction,
      actionable: true,
    };
  }

  private recyclingRule(input: CalculationInput, _result: CalculationResult): Insight | null {
    if (input.recyclingPercent >= 80) return null;
    const improvementPercent = Math.min(80, input.recyclingPercent + 30);
    const currentWaste = input.generalWasteKg * EMISSION_FACTORS.waste.generalWaste * (1 - (input.recyclingPercent / 100) * 0.5);
    const improvedWaste = input.generalWasteKg * EMISSION_FACTORS.waste.generalWaste * (1 - (improvementPercent / 100) * 0.5);
    const reduction = (currentWaste - improvedWaste) * 12;

    return {
      id: 'improve-recycling',
      category: 'waste',
      priority: 'low',
      title: 'Improve recycling rate',
      description: `Increasing recycling from ${input.recyclingPercent}% to ${improvementPercent}% could reduce waste emissions by ${reduction.toFixed(0)} kg CO₂/year. Separate paper, plastic, glass, and metals.`,
      potentialReduction: Math.max(0, reduction),
      actionable: true,
    };
  }

  private gasRule(input: CalculationInput, _result: CalculationResult): Insight | null {
    if (input.naturalGasM3 < 20) return null;
    const savings = input.naturalGasM3 * 0.15 * EMISSION_FACTORS.energy.naturalGas * 12;
    return {
      id: 'reduce-gas',
      category: 'energy',
      priority: 'medium',
      title: 'Lower heating usage',
      description: `Reducing thermostat by 1–2°C and improving home insulation can cut gas usage by 15%, saving ${savings.toFixed(0)} kg CO₂/year.`,
      potentialReduction: savings,
      actionable: true,
    };
  }

  private plasticRule(input: CalculationInput, _result: CalculationResult): Insight | null {
    if (input.plasticKg < 2) return null;
    const reduction = input.plasticKg * 0.5 * EMISSION_FACTORS.waste.plasticWaste * 12;
    return {
      id: 'reduce-plastic',
      category: 'waste',
      priority: 'low',
      title: 'Cut single-use plastic by 50%',
      description: `Using reusable bags, bottles, and containers instead of single-use plastics could save ${reduction.toFixed(0)} kg CO₂/year.`,
      potentialReduction: reduction,
      actionable: true,
    };
  }
}

export const insightsEngine = new InsightsEngine();
