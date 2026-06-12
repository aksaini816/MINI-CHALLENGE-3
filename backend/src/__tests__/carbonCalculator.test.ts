import { calculateEmissions } from '../utils/carbonCalculator';

describe('carbonCalculator', () => {
  it('returns zero emissions for all-zero inputs', () => {
    const result = calculateEmissions({
      carKm: 0,
      bikeKm: 0,
      publicTransportKm: 0,
      flightKmPerYear: 0,
      electricityKwh: 0,
      naturalGasM3: 0,
      lpgKg: 0,
      dietType: 'VEGAN',
      recyclingPercent: 100,
      plasticKg: 0,
      generalWasteKg: 0,
    });

    expect(result.transportEmissions).toBe(0);
    expect(result.energyEmissions).toBe(0);
    expect(result.wasteEmissions).toBeGreaterThanOrEqual(0);
    expect(result.totalMonthly).toBeGreaterThanOrEqual(0);
    expect(result.sustainabilityScore).toBe(100);
  });

  it('calculates transport emissions correctly', () => {
    const result = calculateEmissions({
      carKm: 100,
      bikeKm: 0,
      publicTransportKm: 0,
      flightKmPerYear: 0,
      electricityKwh: 0,
      naturalGasM3: 0,
      lpgKg: 0,
      dietType: 'VEGAN',
      recyclingPercent: 50,
      plasticKg: 0,
      generalWasteKg: 0,
    });

    // 100 km/week * 0.21 kgCO2/km * 4.33 weeks = ~90.93 kg CO2
    expect(result.transportEmissions).toBeCloseTo(90.93, 0);
  });

  it('correctly applies diet type to food emissions', () => {
    const veganResult = calculateEmissions({
      carKm: 0, bikeKm: 0, publicTransportKm: 0, flightKmPerYear: 0,
      electricityKwh: 0, naturalGasM3: 0, lpgKg: 0,
      dietType: 'VEGAN',
      recyclingPercent: 50, plasticKg: 0, generalWasteKg: 0,
    });
    const highMeatResult = calculateEmissions({
      carKm: 0, bikeKm: 0, publicTransportKm: 0, flightKmPerYear: 0,
      electricityKwh: 0, naturalGasM3: 0, lpgKg: 0,
      dietType: 'HIGH_MEAT',
      recyclingPercent: 50, plasticKg: 0, generalWasteKg: 0,
    });

    expect(veganResult.foodEmissions).toBe(55);
    expect(highMeatResult.foodEmissions).toBe(230);
    expect(highMeatResult.foodEmissions).toBeGreaterThan(veganResult.foodEmissions);
  });

  it('calculates yearly emissions as 12x monthly', () => {
    const result = calculateEmissions({
      carKm: 50, bikeKm: 0, publicTransportKm: 20, flightKmPerYear: 1000,
      electricityKwh: 300, naturalGasM3: 30, lpgKg: 5,
      dietType: 'MIXED',
      recyclingPercent: 60, plasticKg: 2, generalWasteKg: 15,
    });

    expect(result.totalYearly).toBeCloseTo(result.totalMonthly * 12, 0);
  });

  it('sustainability score is between 0 and 100', () => {
    const lowEmission = calculateEmissions({
      carKm: 5, bikeKm: 20, publicTransportKm: 10, flightKmPerYear: 0,
      electricityKwh: 100, naturalGasM3: 5, lpgKg: 0,
      dietType: 'VEGAN',
      recyclingPercent: 90, plasticKg: 0, generalWasteKg: 5,
    });

    const highEmission = calculateEmissions({
      carKm: 500, bikeKm: 0, publicTransportKm: 0, flightKmPerYear: 50000,
      electricityKwh: 2000, naturalGasM3: 200, lpgKg: 50,
      dietType: 'HIGH_MEAT',
      recyclingPercent: 0, plasticKg: 20, generalWasteKg: 100,
    });

    expect(lowEmission.sustainabilityScore).toBeGreaterThanOrEqual(0);
    expect(lowEmission.sustainabilityScore).toBeLessThanOrEqual(100);
    expect(highEmission.sustainabilityScore).toBeGreaterThanOrEqual(0);
    expect(highEmission.sustainabilityScore).toBeLessThanOrEqual(100);
    expect(lowEmission.sustainabilityScore).toBeGreaterThan(highEmission.sustainabilityScore);
  });

  it('breakdown percentages sum to approximately 100', () => {
    const result = calculateEmissions({
      carKm: 80, bikeKm: 5, publicTransportKm: 30, flightKmPerYear: 2000,
      electricityKwh: 350, naturalGasM3: 50, lpgKg: 0,
      dietType: 'MIXED',
      recyclingPercent: 40, plasticKg: 3, generalWasteKg: 20,
    });

    const total = result.breakdown.reduce((sum: number, item: { percentage: number }) => sum + item.percentage, 0);
    expect(total).toBeGreaterThanOrEqual(98);
    expect(total).toBeLessThanOrEqual(102);
  });

  it('recycling reduces waste emissions', () => {
    const noRecycling = calculateEmissions({
      carKm: 0, bikeKm: 0, publicTransportKm: 0, flightKmPerYear: 0,
      electricityKwh: 0, naturalGasM3: 0, lpgKg: 0,
      dietType: 'VEGAN',
      recyclingPercent: 0, plasticKg: 5, generalWasteKg: 30,
    });

    const fullRecycling = calculateEmissions({
      carKm: 0, bikeKm: 0, publicTransportKm: 0, flightKmPerYear: 0,
      electricityKwh: 0, naturalGasM3: 0, lpgKg: 0,
      dietType: 'VEGAN',
      recyclingPercent: 100, plasticKg: 5, generalWasteKg: 30,
    });

    expect(fullRecycling.wasteEmissions).toBeLessThan(noRecycling.wasteEmissions);
  });
});
