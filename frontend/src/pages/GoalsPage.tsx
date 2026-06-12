import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Target, Plus, Pencil, Trash2, CheckCircle2, Pause, X } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import {
  Card, CardContent, Button, Input, Label, Select, Progress, Skeleton,
} from '@/components/ui';
import api from '@/lib/api';
import { formatDate, formatNumber, getApiErrorMessage } from '@/lib/utils';

interface Goal {
  id: string;
  title: string;
  description?: string;
  targetReduction: number;
  currentValue: number;
  baselineValue: number;
  unit: string;
  deadline: string;
  status: string;
  category: string;
}

const goalSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(100),
  description: z.string().max(500).optional(),
  targetReduction: z.number().min(0.1, 'Target must be greater than 0').max(100000),
  baselineValue: z.number().min(0).default(0),
  unit: z.string().default('kg CO2'),
  deadline: z.string().min(1, 'Deadline is required'),
  category: z.string().default('GENERAL'),
});

type GoalFormData = z.infer<typeof goalSchema>;

const statusConfig: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  ACTIVE: { label: 'Active', icon: Target, color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300' },
  COMPLETED: { label: 'Completed', icon: CheckCircle2, color: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300' },
  PAUSED: { label: 'Paused', icon: Pause, color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300' },
  FAILED: { label: 'Failed', icon: X, color: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300' },
};

export function GoalsPage(): React.JSX.Element {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<GoalFormData>({
    resolver: zodResolver(goalSchema),
  });

  const fetchGoals = async (): Promise<void> => {
    try {
      const res = await api.get('/goals');
      setGoals(res.data.data.goals ?? []);
    } catch {
      setGoals([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void fetchGoals(); }, []);

  const onSubmit = async (data: GoalFormData): Promise<void> => {
    setSubmitting(true);
    try {
      if (editingGoal) {
        await api.put(`/goals/${editingGoal.id}`, data);
      } else {
        await api.post('/goals', data);
      }
      await fetchGoals();
      setShowForm(false);
      setEditingGoal(null);
      reset();
    } catch (err) {
      console.error(getApiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const deleteGoal = async (id: string): Promise<void> => {
    if (!confirm('Are you sure you want to delete this goal?')) return;
    await api.delete(`/goals/${id}`);
    await fetchGoals();
  };

  const openEdit = (goal: Goal): void => {
    setEditingGoal(goal);
    reset({
      title: goal.title,
      description: goal.description,
      targetReduction: goal.targetReduction,
      baselineValue: goal.baselineValue,
      unit: goal.unit,
      deadline: new Date(goal.deadline).toISOString().split('T')[0],
      category: goal.category,
    });
    setShowForm(true);
  };

  return (
    <Layout title="My Goals">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Sustainability Goals</h2>
            <p className="text-muted-foreground text-sm mt-1">Set and track your emission reduction targets</p>
          </div>
          <Button
            onClick={() => { setEditingGoal(null); reset(); setShowForm(true); }}
            aria-label="Create new sustainability goal"
          >
            <Plus className="h-4 w-4 mr-1" aria-hidden="true" />
            New Goal
          </Button>
        </div>

        {/* Form */}
        {showForm && (
          <Card className="border-primary/20 animate-fade-in">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">{editingGoal ? 'Edit Goal' : 'Create New Goal'}</h3>
                <Button variant="ghost" size="icon" onClick={() => { setShowForm(false); setEditingGoal(null); }} aria-label="Close form">
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <form onSubmit={(e) => void handleSubmit(onSubmit)(e)} noValidate aria-label="Goal form" className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label htmlFor="goal-title">Goal title *</Label>
                    <Input id="goal-title" placeholder="e.g. Reduce monthly emissions by 20%" aria-invalid={!!errors.title} {...register('title')} />
                    {errors.title && <p className="text-xs text-destructive" role="alert">{errors.title.message}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="goal-target">Target reduction *</Label>
                    <Input id="goal-target" type="number" min={0} step="any" placeholder="100" aria-invalid={!!errors.targetReduction} {...register('targetReduction', { valueAsNumber: true })} />
                    {errors.targetReduction && <p className="text-xs text-destructive" role="alert">{errors.targetReduction.message}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="goal-unit">Unit</Label>
                    <Select id="goal-unit" {...register('unit')}>
                      <option value="kg CO2">kg CO₂</option>
                      <option value="tonnes CO2">tonnes CO₂</option>
                      <option value="%">% reduction</option>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="goal-deadline">Deadline *</Label>
                    <Input id="goal-deadline" type="date" min={new Date().toISOString().split('T')[0]} aria-invalid={!!errors.deadline} {...register('deadline')} />
                    {errors.deadline && <p className="text-xs text-destructive" role="alert">{errors.deadline.message}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="goal-category">Category</Label>
                    <Select id="goal-category" {...register('category')}>
                      <option value="GENERAL">General</option>
                      <option value="TRANSPORT">Transportation</option>
                      <option value="ENERGY">Home Energy</option>
                      <option value="FOOD">Food & Diet</option>
                      <option value="WASTE">Waste</option>
                    </Select>
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label htmlFor="goal-description">Description (optional)</Label>
                    <Input id="goal-description" placeholder="What specific actions will you take?" {...register('description')} />
                  </div>
                </div>
                <div className="flex justify-end gap-3">
                  <Button variant="outline" type="button" onClick={() => { setShowForm(false); setEditingGoal(null); }}>Cancel</Button>
                  <Button type="submit" loading={submitting}>{editingGoal ? 'Update Goal' : 'Create Goal'}</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Goals list */}
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
          </div>
        ) : goals.length === 0 ? (
          <div className="text-center py-16 bg-card border border-border rounded-xl">
            <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" aria-hidden="true" />
            <h3 className="text-lg font-semibold mb-2">No goals yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Set your first sustainability target to start tracking your progress.
            </p>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4 mr-1" />
              Create your first goal
            </Button>
          </div>
        ) : (
          <div className="space-y-4" role="list" aria-label="Your sustainability goals">
            {goals.map((goal) => {
              const progress = goal.baselineValue > 0
                ? Math.min(100, (goal.currentValue / goal.baselineValue) * 100)
                : goal.currentValue > 0 ? Math.min(100, (goal.currentValue / goal.targetReduction) * 100) : 0;
              const status = statusConfig[goal.status] ?? statusConfig.ACTIVE;
              const StatusIcon = status.icon;
              const daysLeft = Math.ceil((new Date(goal.deadline).getTime() - Date.now()) / 86400000);

              return (
                <article
                  key={goal.id}
                  className="bg-card border border-border rounded-xl p-5 hover:shadow-sm transition-all"
                  role="listitem"
                  aria-label={`Goal: ${goal.title}`}
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="font-semibold text-sm">{goal.title}</h3>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
                          <StatusIcon className="h-3 w-3" aria-hidden="true" />
                          {status.label}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{goal.description}</p>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(goal)} aria-label={`Edit goal: ${goal.title}`}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-destructive" onClick={() => void deleteGoal(goal.id)} aria-label={`Delete goal: ${goal.title}`}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>

                  <Progress value={progress} label={`${goal.title} progress: ${progress.toFixed(0)}%`} className="mb-2" />
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>
                      Target: {formatNumber(goal.targetReduction)} {goal.unit}
                    </span>
                    <span>
                      {daysLeft > 0 ? `${daysLeft} days left` : 'Deadline passed'} · {formatDate(goal.deadline)}
                    </span>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}
