import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Car, Zap, Apple, Trash2, ChevronRight, ChevronLeft, CheckCircle2 } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import {
  Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter,
  Button, Input, Label, Select, Alert, AlertDescription, Progress, Badge,
} from '@/components/ui';
import api from '@/lib/api';
import { getApiErrorMessage, formatNumber } from '@/lib/utils';

const calcSchema = z.object({
  carKm: z.coerce.number({ invalid_type_error: 'Invalid number' }).min(0, 'Must be positive').max(10000),
  bikeKm: z.coerce.number({ invalid_type_error: 'Invalid number' }).min(0, 'Must be positive').max(10000),
  publicTransportKm: z.coerce.number({ invalid_type_error: 'Invalid number' }).min(0, 'Must be positive').max(10000),
  flightKmPerYear: z.coerce.number({ invalid_type_error: 'Invalid number' }).min(0, 'Must be positive').max(200000),
  electricityKwh: z.coerce.number({ invalid_type_error: 'Invalid number' }).min(0, 'Must be positive').max(10000),
  naturalGasM3: z.coerce.number({ invalid_type_error: 'Invalid number' }).min(0, 'Must be positive').max(1000),
  lpgKg: z.coerce.number({ invalid_type_error: 'Invalid number' }).min(0, 'Must be positive').max(500),
  dietType: z.enum(['VEGAN', 'VEGETARIAN', 'MIXED', 'HIGH_MEAT']),
  recyclingPercent: z.coerce.number({ invalid_type_error: 'Invalid number' }).min(0, 'Must be positive').max(100),
  plasticKg: z.coerce.number({ invalid_type_error: 'Invalid number' }).min(0, 'Must be positive').max(100),
  generalWasteKg: z.coerce.number({ invalid_type_error: 'Invalid number' }).min(0, 'Must be positive').max(500),
  notes: z.string().max(500).optional(),
});

type CalcFormData = z.infer<typeof calcSchema>;

interface StepResult {
  entry: object;
  result: {
    transportEmissions: number;
    energyEmissions: number;
    foodEmissions: number;
    wasteEmissions: number;
    totalMonthly: number;
    totalYearly: number;
    sustainabilityScore: number;
    breakdown: { category: string; value: number; percentage: number }[];
  };
}

const steps = [
  { id: 'transport', label: 'Transportation', icon: Car, description: 'How do you get around?' },
  { id: 'energy', label: 'Home Energy', icon: Zap, description: 'Your home energy usage' },
  { id: 'food', label: 'Food & Diet', icon: Apple, description: 'Your dietary habits' },
  { id: 'waste', label: 'Waste', icon: Trash2, description: 'Waste generation & recycling' },
];

const NumberField: React.FC<{
  id: string;
  label: string;
  unit?: string;
  description?: string;
  error?: string;
} & React.InputHTMLAttributes<HTMLInputElement>> = ({ id, label, unit, description, error, ...props }) => (
  <div className="space-y-1.5">
    <Label htmlFor={id}>{label}</Label>
    {description && (
      <p id={`${id}-desc`} className="text-xs text-muted-foreground">
        {description}
      </p>
    )}
    <div className="flex items-center gap-2">
      <Input
        id={id}
        type="number"
        min={0}
        step="any"
        aria-describedby={[description ? `${id}-desc` : '', error ? `${id}-error` : ''].filter(Boolean).join(' ')}
        aria-invalid={!!error}
        className="flex-1"
        {...props}
      />
      {unit && <span className="text-sm text-muted-foreground whitespace-nowrap w-20">{unit}</span>}
    </div>
    {error && (
      <p id={`${id}-error`} className="text-xs text-destructive" role="alert">
        {error}
      </p>
    )}
  </div>
);

export function CalculatorPage(): React.JSX.Element {
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<StepResult | null>(null);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    trigger,
  } = useForm<CalcFormData>({
    resolver: zodResolver(calcSchema),
    defaultValues: {
      carKm: 0, bikeKm: 0, publicTransportKm: 0, flightKmPerYear: 0,
      electricityKwh: 0, naturalGasM3: 0, lpgKg: 0,
      dietType: 'MIXED',
      recyclingPercent: 50, plasticKg: 0, generalWasteKg: 0,
    },
  });

  const stepFields: (keyof CalcFormData)[][] = [
    ['carKm', 'bikeKm', 'publicTransportKm', 'flightKmPerYear'],
    ['electricityKwh', 'naturalGasM3', 'lpgKg'],
    ['dietType'],
    ['recyclingPercent', 'plasticKg', 'generalWasteKg'],
  ];

  const handleNext = async (): Promise<void> => {
    const valid = await trigger(stepFields[currentStep]);
    if (valid) setCurrentStep((s) => Math.min(s + 1, steps.length - 1));
  };

  const onSubmit = async (data: CalcFormData): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post('/carbon/calculate', data);
      setResult(res.data.data);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  if (result) {
    const r = result.result;
    const scoreLabel =
      r.sustainabilityScore >= 75 ? 'Excellent' :
      r.sustainabilityScore >= 50 ? 'Good' :
      r.sustainabilityScore >= 25 ? 'Average' : 'Needs Improvement';

    return (
      <Layout title="Calculator — Results">
        <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
          <Card className="border-primary/20">
            <CardHeader className="text-center pb-4">
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="w-7 h-7 text-primary" aria-hidden="true" />
              </div>
              <CardTitle>Your Carbon Footprint</CardTitle>
              <CardDescription>Here's your personalized environmental impact breakdown</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Score */}
              <div className="bg-muted/50 rounded-xl p-4 text-center">
                <div className="text-5xl font-bold text-primary mb-1">{r.sustainabilityScore}</div>
                <div className="text-sm text-muted-foreground">Sustainability Score</div>
                <Badge variant="success" className="mt-2">{scoreLabel}</Badge>
              </div>

              {/* Totals */}
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-card border border-border rounded-xl">
                  <div className="text-2xl font-bold">{formatNumber(r.totalMonthly)}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">kg CO₂ / month</div>
                </div>
                <div className="text-center p-4 bg-card border border-border rounded-xl">
                  <div className="text-2xl font-bold">{formatNumber(r.totalYearly / 1000, 2)}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">tonnes CO₂ / year</div>
                </div>
              </div>

              {/* Breakdown bars */}
              <div className="space-y-3" aria-label="Emissions breakdown by category">
                {r.breakdown.map((b) => (
                  <div key={b.category}>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="font-medium">{b.category}</span>
                      <span className="text-muted-foreground">
                        {formatNumber(b.value)} kg CO₂ ({b.percentage}%)
                      </span>
                    </div>
                    <Progress value={b.percentage} label={`${b.category}: ${b.percentage}%`} />
                  </div>
                ))}
              </div>

              <div className="text-xs text-muted-foreground text-center border-t border-border pt-3">
                Global average: ~400 kg CO₂/month. Paris Agreement target: &lt;167 kg/month.
              </div>
            </CardContent>
            <CardFooter className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => { setResult(null); setCurrentStep(0); }}>
                Recalculate
              </Button>
              <Button className="flex-1" onClick={() => navigate('/insights')}>
                View AI Insights →
              </Button>
            </CardFooter>
          </Card>
        </div>
      </Layout>
    );
  }

  const StepIcon = steps[currentStep].icon;

  return (
    <Layout title="Carbon Calculator">
      <div className="max-w-2xl mx-auto">
        {/* Step indicator */}
        <nav aria-label="Calculator progress" className="mb-6">
          <ol className="flex items-center gap-2">
            {steps.map((step, i) => (
              <li key={step.id} className="flex items-center gap-2 flex-1">
                <button
                  type="button"
                  className={`flex items-center gap-2 text-sm font-medium rounded-lg px-2 py-1 transition-colors
                    ${i === currentStep ? 'text-primary' : i < currentStep ? 'text-primary/60' : 'text-muted-foreground'}
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring`}
                  onClick={() => i < currentStep && setCurrentStep(i)}
                  aria-current={i === currentStep ? 'step' : undefined}
                  disabled={i > currentStep}
                  aria-label={`Step ${i + 1}: ${step.label}${i < currentStep ? ' (completed)' : ''}`}
                >
                  <span
                    className={`w-6 h-6 rounded-full text-xs flex items-center justify-center font-semibold border-2
                      ${i === currentStep ? 'border-primary bg-primary text-primary-foreground' :
                        i < currentStep ? 'border-primary bg-primary/10 text-primary' :
                        'border-border text-muted-foreground'}`}
                    aria-hidden="true"
                  >
                    {i < currentStep ? '✓' : i + 1}
                  </span>
                  <span className="hidden sm:inline">{step.label}</span>
                </button>
                {i < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 rounded ${i < currentStep ? 'bg-primary/40' : 'bg-border'}`} aria-hidden="true" />
                )}
              </li>
            ))}
          </ol>
          <Progress
            value={((currentStep + 1) / steps.length) * 100}
            label="Form progress"
            className="mt-4 h-1"
          />
        </nav>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                <StepIcon className="w-5 h-5 text-primary" aria-hidden="true" />
              </div>
              <div>
                <CardTitle>{steps[currentStep].label}</CardTitle>
                <CardDescription>{steps[currentStep].description}</CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form id="calculator-form" onSubmit={(e) => void handleSubmit(onSubmit)(e)} noValidate>
              <fieldset className="space-y-4 border-0 p-0">
                <legend className="sr-only">{steps[currentStep].label} inputs</legend>

                {currentStep === 0 && (
                  <>
                    <NumberField
                      id="carKm"
                      label="Car travel distance"
                      unit="km / week"
                      description="Average kilometres driven by personal car each week"
                      error={errors.carKm?.message}
                      {...register('carKm')}
                    />
                    <NumberField
                      id="bikeKm"
                      label="Cycling distance"
                      unit="km / week"
                      description="Average kilometres cycled (produces near-zero emissions)"
                      error={errors.bikeKm?.message}
                      {...register('bikeKm')}
                    />
                    <NumberField
                      id="publicTransportKm"
                      label="Public transport distance"
                      unit="km / week"
                      description="Combined bus, train, metro distance per week"
                      error={errors.publicTransportKm?.message}
                      {...register('publicTransportKm')}
                    />
                    <NumberField
                      id="flightKmPerYear"
                      label="Flight distance"
                      unit="km / year"
                      description="Total kilometres flown per year (round trip). E.g. London→NY = 11,400 km"
                      error={errors.flightKmPerYear?.message}
                      {...register('flightKmPerYear')}
                    />
                  </>
                )}

                {currentStep === 1 && (
                  <>
                    <NumberField
                      id="electricityKwh"
                      label="Electricity consumption"
                      unit="kWh / month"
                      description="Check your electricity bill. UK average is ~250–400 kWh/month"
                      error={errors.electricityKwh?.message}
                      {...register('electricityKwh')}
                    />
                    <NumberField
                      id="naturalGasM3"
                      label="Natural gas usage"
                      unit="m³ / month"
                      description="From your gas bill. UK average is ~50–100 m³/month (heating season)"
                      error={errors.naturalGasM3?.message}
                      {...register('naturalGasM3')}
                    />
                    <NumberField
                      id="lpgKg"
                      label="LPG/Propane usage"
                      unit="kg / month"
                      description="Liquefied petroleum gas for cooking or heating (0 if not applicable)"
                      error={errors.lpgKg?.message}
                      {...register('lpgKg')}
                    />
                  </>
                )}

                {currentStep === 2 && (
                  <div className="space-y-2">
                    <Label htmlFor="dietType">Diet type</Label>
                    <p id="dietType-desc" className="text-xs text-muted-foreground">
                      Your primary dietary pattern affects your food-related emissions significantly
                    </p>
                    <Select
                      id="dietType"
                      aria-describedby="dietType-desc"
                      {...register('dietType')}
                    >
                      <option value="VEGAN">🌱 Vegan — Plant-based, no animal products (~55 kg CO₂/month)</option>
                      <option value="VEGETARIAN">🥕 Vegetarian — No meat, includes dairy/eggs (~90 kg CO₂/month)</option>
                      <option value="MIXED">🥗 Mixed — Moderate meat consumption (~150 kg CO₂/month)</option>
                      <option value="HIGH_MEAT">🥩 High Meat — Frequent red meat consumption (~230 kg CO₂/month)</option>
                    </Select>
                  </div>
                )}

                {currentStep === 3 && (
                  <>
                    <div className="space-y-1.5">
                      <Label htmlFor="recyclingPercent">Recycling rate</Label>
                      <p id="recycling-desc" className="text-xs text-muted-foreground">
                        Percentage of household waste you recycle (0–100%)
                      </p>
                      <Input
                        id="recyclingPercent"
                        type="range"
                        min={0}
                        max={100}
                        step={5}
                        aria-describedby="recycling-desc"
                        className="h-auto"
                        {...register('recyclingPercent')}
                      />
                    </div>
                    <NumberField
                      id="plasticKg"
                      label="Single-use plastic waste"
                      unit="kg / month"
                      description="Plastic packaging, bags, bottles discarded monthly"
                      error={errors.plasticKg?.message}
                      {...register('plasticKg')}
                    />
                    <NumberField
                      id="generalWasteKg"
                      label="General household waste"
                      unit="kg / month"
                      description="Total household waste before recycling (UK average: ~30 kg/month)"
                      error={errors.generalWasteKg?.message}
                      {...register('generalWasteKg')}
                    />
                  </>
                )}
              </fieldset>
            </form>
          </CardContent>

          <CardFooter className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => setCurrentStep((s) => Math.max(s - 1, 0))}
              disabled={currentStep === 0}
              aria-label="Go to previous step"
            >
              <ChevronLeft className="h-4 w-4 mr-1" aria-hidden="true" />
              Back
            </Button>

            {currentStep < steps.length - 1 ? (
              <Button onClick={() => void handleNext()} aria-label="Go to next step">
                Next
                <ChevronRight className="h-4 w-4 ml-1" aria-hidden="true" />
              </Button>
            ) : (
              <Button
                type="submit"
                form="calculator-form"
                loading={loading}
                aria-label={loading ? 'Calculating...' : 'Calculate my footprint'}
              >
                {loading ? 'Calculating...' : 'Calculate'}
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </Layout>
  );
}
