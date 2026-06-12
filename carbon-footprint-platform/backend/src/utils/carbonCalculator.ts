/**
 * Carbon emission factors (kg CO2 per unit).
 * Sources: EPA, IPCC, UK Government GHG Conversion Factors 2023
 */
export const EMISSION_FACTORS = {
  transport: {
    car: 0.21,              // kg CO2 per km (average petrol car)
    bike: 0,                // kg CO2 per km (bicycle)
    publicTransport: 0.089, // kg CO2 per km (average bus/rail)
    flight: 0.255,          // kg CO2 per km (average economy class)
  },
  energy: {
    electricity: 0.233,     // kg CO2 per kWh (UK grid avg)
    naturalGas: 2.04,       // kg CO2 per m³
    lpg: 1.51,              // kg CO2 per kg
  },
  food: {
    VEGAN: 55,              // kg CO2 per month
    VEGETARIAN: 90,         // kg CO2 per month
    MIXED: 150,             // kg CO2 per month
    HIGH_MEAT: 230,         // kg CO2 per month
  },
  waste: {
    generalWaste: 0.587,    // kg CO2 per kg waste
    plasticWaste: 6.0,      // kg CO2 per kg plastic
    recyclingBonus: 0.5,    // reduction factor per % recycled (out of 100)
  },
} as const;

export interface CalculationInput {
  // Transport
  carKm: number;
  bikeKm: number;
  publicTransportKm: number;
  flightKmPerYear: number;
  // Energy
  electricityKwh: number;
  naturalGasM3: number;
  lpgKg: number;
  // Food
  dietType: 'VEGAN' | 'VEGETARIAN' | 'MIXED' | 'HIGH_MEAT';
  // Waste
  recyclingPercent: number;
  plasticKg: number;
  generalWasteKg: number;
}

export interface CalculationResult {
  transportEmissions: number;
  energyEmissions: number;
  foodEmissions: number;
  wasteEmissions: number;
  totalMonthly: number;
  totalYearly: number;
  sustainabilityScore: number;
  breakdown: {
    category: string;
    value: number;
    percentage: number;
    unit: string;
  }[];
}

/**
 * Calculates monthly carbon footprint from user inputs.
 * All outputs are in kg CO2/month unless otherwise noted.
 */
export const calculateEmissions = (input: CalculationInput): CalculationResult => {
  const f = EMISSION_FACTORS;

  // Transport (monthly — assume 4.33 weeks per month)
  const transportEmissions =
    input.carKm * f.transport.car * 4.33 +
    input.publicTransportKm * f.transport.publicTransport * 4.33 +
    (input.flightKmPerYear * f.transport.flight) / 12;

  // Energy
  const energyEmissions =
    input.electricityKwh * f.energy.electricity +
    input.naturalGasM3 * f.energy.naturalGas +
    input.lpgKg * f.energy.lpg;

  // Food
  const dietKey = input.dietType in f.food ? input.dietType : 'MIXED';
  const foodEmissions = f.food[dietKey as keyof typeof f.food];

  // Waste
  const recyclingReduction = (input.recyclingPercent / 100) * f.waste.recyclingBonus;
  const wasteEmissions = Math.max(
    0,
    input.generalWasteKg * f.waste.generalWaste * (1 - recyclingReduction) +
    input.plasticKg * f.waste.plasticWaste,
  );

  const totalMonthly = transportEmissions + energyEmissions + foodEmissions + wasteEmissions;
  const totalYearly = totalMonthly * 12;

  // Sustainability score: 100 if < 100 kg/month, 0 if > 1000 kg/month
  const sustainabilityScore = Math.max(
    0,
    Math.min(100, Math.round(100 - ((totalMonthly - 100) / 900) * 100)),
  );

  const breakdown = [
    {
      category: 'Transportation',
      value: Math.round(transportEmissions * 100) / 100,
      percentage: totalMonthly > 0 ? Math.round((transportEmissions / totalMonthly) * 100) : 0,
      unit: 'kg CO₂',
    },
    {
      category: 'Home Energy',
      value: Math.round(energyEmissions * 100) / 100,
      percentage: totalMonthly > 0 ? Math.round((energyEmissions / totalMonthly) * 100) : 0,
      unit: 'kg CO₂',
    },
    {
      category: 'Food',
      value: Math.round(foodEmissions * 100) / 100,
      percentage: totalMonthly > 0 ? Math.round((foodEmissions / totalMonthly) * 100) : 0,
      unit: 'kg CO₂',
    },
    {
      category: 'Waste',
      value: Math.round(wasteEmissions * 100) / 100,
      percentage: totalMonthly > 0 ? Math.round((wasteEmissions / totalMonthly) * 100) : 0,
      unit: 'kg CO₂',
    },
  ];

  return {
    transportEmissions: Math.round(transportEmissions * 100) / 100,
    energyEmissions: Math.round(energyEmissions * 100) / 100,
    foodEmissions: Math.round(foodEmissions * 100) / 100,
    wasteEmissions: Math.round(wasteEmissions * 100) / 100,
    totalMonthly: Math.round(totalMonthly * 100) / 100,
    totalYearly: Math.round(totalYearly * 100) / 100,
    sustainabilityScore,
    breakdown,
  };
};
