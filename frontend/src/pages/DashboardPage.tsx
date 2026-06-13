import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts';
import { TrendingDown, TrendingUp, Zap, Target, Trophy, Calculator } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardHeader, CardTitle, CardContent, Button, Skeleton } from '@/components/ui';
import api from '@/lib/api';
import { formatNumber, getScoreBadgeColor } from '@/lib/utils';
import { useAuthStore } from '@/stores/authStore';

interface Summary {
  hasData: boolean;
  currentMonthly?: number;
  currentYearly?: number;
  sustainabilityScore?: number;
  reductionAchieved?: number;
  changeFromPrevious?: number;
  categoryBreakdown?: { category: string; value: number }[];
  monthlyTrend?: { month: string; total: number; transport: number; energy: number; food: number; waste: number }[];
}

const PIE_COLORS = ['#16a34a', '#22c55e', '#86efac', '#bbf7d0'];

const EmptyState: React.FC<{ title: string; description: string; actionTo: string; actionLabel: string }> = ({
  title, description, actionTo, actionLabel,
}) => (
  <div className="text-center py-16 animate-fade-in">
    <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
      <Calculator className="w-8 h-8 text-primary" aria-hidden="true" />
    </div>
    <h2 className="text-xl font-semibold text-foreground mb-2">{title}</h2>
    <p className="text-muted-foreground text-sm max-w-sm mx-auto mb-6">{description}</p>
    <Button asChild>
      <Link to={actionTo}>{actionLabel}</Link>
    </Button>
  </div>
);

const StatCard: React.FC<{
  title: string;
  value: string;
  unit?: string;
  change?: number;
  icon: React.ElementType;
  iconColor?: string;
  description?: string;
}> = ({ title, value, unit, change, icon: Icon, iconColor = 'text-primary', description }) => (
  <div className="stat-card group">
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">{title}</p>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold text-foreground">{value}</span>
          {unit && <span className="text-sm text-muted-foreground">{unit}</span>}
        </div>
        {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
        {change !== undefined && (
          <div className="flex items-center gap-1 mt-1.5">
            {change < 0 ? (
              <TrendingDown className="h-3.5 w-3.5 text-green-500" aria-hidden="true" />
            ) : (
              <TrendingUp className="h-3.5 w-3.5 text-red-500" aria-hidden="true" />
            )}
            <span
              className={`text-xs font-medium ${change < 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}
              aria-label={`${Math.abs(change).toFixed(1)} kg CO₂ ${change < 0 ? 'decrease' : 'increase'} from last month`}
            >
              {change < 0 ? '-' : '+'}{Math.abs(change).toFixed(1)} kg
            </span>
            <span className="text-xs text-muted-foreground">vs last</span>
          </div>
        )}
      </div>
      <div className={`w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center`}>
        <Icon className={`w-5 h-5 ${iconColor}`} aria-hidden="true" />
      </div>
    </div>
  </div>
);

export function DashboardPage(): React.JSX.Element {
  const { user } = useAuthStore();
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async (): Promise<void> => {
      try {
        const res = await api.get('/carbon/summary');
        setSummary(res.data.data);
      } catch {
        setSummary({ hasData: false });
      } finally {
        setLoading(false);
      }
    };
    void fetchSummary();
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  if (loading) {
    return (
      <Layout title="Dashboard">
        <div className="space-y-6">
          <Skeleton className="h-8 w-64" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-xl" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Skeleton className="lg:col-span-2 h-72 rounded-xl" />
            <Skeleton className="h-72 rounded-xl" />
          </div>
        </div>
      </Layout>
    );
  }

  if (!summary?.hasData) {
    return (
      <Layout title="Dashboard">
        <EmptyState
          title={`${greeting}, ${user?.name ? user.name.split(' ')[0] : 'Guest'}! 👋`}
          description="Your sustainability journey starts here. Calculate your first carbon footprint to see personalized insights and trends."
          actionTo="/calculator"
          actionLabel="Calculate my carbon footprint"
        />
      </Layout>
    );
  }

  const scoreColor = getScoreBadgeColor(summary.sustainabilityScore ?? 0);

  return (
    <Layout title="Dashboard">
      <div className="space-y-6">
        {/* Greeting */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">
              {greeting}, {user?.name ? user.name.split(' ')[0] : 'Guest'}! 🌿
            </h2>
            <p className="text-muted-foreground text-sm mt-0.5">
              Here's your sustainability overview
            </p>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link to="/calculator">New Calculation</Link>
          </Button>
        </div>

        {/* KPI Cards */}
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
          role="region"
          aria-label="Key performance indicators"
        >
          <StatCard
            title="Monthly Emissions"
            value={formatNumber(summary.currentMonthly ?? 0)}
            unit="kg CO₂"
            change={summary.changeFromPrevious}
            icon={Zap}
          />
          <StatCard
            title="Yearly Emissions"
            value={formatNumber((summary.currentYearly ?? 0) / 1000, 2)}
            unit="tonnes CO₂"
            icon={TrendingUp}
            iconColor="text-orange-500"
            description="Projected annual total"
          />
          <StatCard
            title="Reduction Achieved"
            value={formatNumber(summary.reductionAchieved ?? 0)}
            unit="kg CO₂"
            icon={TrendingDown}
            iconColor="text-green-500"
            description="vs. your first entry"
          />
          <div className="stat-card">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Sustainability Score</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-foreground">{summary.sustainabilityScore}</span>
                  <span className="text-sm text-muted-foreground">/100</span>
                </div>
                <span className={`inline-flex mt-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${scoreColor}`}>
                  {(summary.sustainabilityScore ?? 0) >= 75 ? 'Excellent' :
                   (summary.sustainabilityScore ?? 0) >= 50 ? 'Good' :
                   (summary.sustainabilityScore ?? 0) >= 25 ? 'Average' : 'Needs Work'}
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Target className="w-5 h-5 text-primary" aria-hidden="true" />
              </div>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Monthly Trend Line Chart */}
          <Card className="lg:col-span-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Monthly Emission Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <div aria-label="Monthly emissions trend line chart" role="img">
                <ResponsiveContainer width="100%" height={240}>
                  <LineChart data={summary.monthlyTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
                    <YAxis tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        fontSize: '12px',
                      }}
                      formatter={(v: number) => [`${v.toFixed(1)} kg CO₂`, undefined]}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                    <Line
                      type="monotone"
                      dataKey="total"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      name="Total"
                    />
                    <Line type="monotone" dataKey="transport" stroke="#f59e0b" strokeWidth={1.5} dot={false} name="Transport" />
                    <Line type="monotone" dataKey="energy" stroke="#3b82f6" strokeWidth={1.5} dot={false} name="Energy" />
                    <Line type="monotone" dataKey="food" stroke="#8b5cf6" strokeWidth={1.5} dot={false} name="Food" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Category Breakdown Pie Chart */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Category Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div aria-label="Carbon emissions by category pie chart" role="img">
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={summary.categoryBreakdown}
                      dataKey="value"
                      nameKey="category"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={({ category, percent }) => `${category.split(' ')[0]} ${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {summary.categoryBreakdown?.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        fontSize: '12px',
                      }}
                      formatter={(v: number) => [`${v.toFixed(1)} kg CO₂`, undefined]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <ul className="space-y-1.5 mt-2" aria-label="Category breakdown details">
                {summary.categoryBreakdown?.map((item, i) => (
                  <li key={item.category} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }}
                        aria-hidden="true"
                      />
                      <span className="text-muted-foreground">{item.category}</span>
                    </div>
                    <span className="font-medium">{formatNumber(item.value)} kg</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Monthly Bar Chart */}
        {summary.monthlyTrend && summary.monthlyTrend.length > 1 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Emissions by Category Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div aria-label="Stacked bar chart of emissions by category over months" role="img">
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={summary.monthlyTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
                    <YAxis tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        fontSize: '12px',
                      }}
                      formatter={(v: number) => [`${v.toFixed(1)} kg CO₂`, undefined]}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                    <Bar dataKey="transport" stackId="a" fill="#16a34a" name="Transport" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="energy" stackId="a" fill="#3b82f6" name="Energy" />
                    <Bar dataKey="food" stackId="a" fill="#8b5cf6" name="Food" />
                    <Bar dataKey="waste" stackId="a" fill="#f59e0b" name="Waste" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick actions */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { to: '/calculator', icon: Calculator, title: 'New Calculation', desc: 'Log your latest footprint' },
            { to: '/goals', icon: Target, title: 'Manage Goals', desc: 'Track your reduction targets' },
            { to: '/challenges', icon: Trophy, title: 'Challenges', desc: 'Earn points for eco actions' },
          ].map(({ to, icon: Icon, title, desc }) => (
            <Link
              key={to}
              to={to}
              className="flex items-center gap-3 p-4 bg-card border border-border rounded-xl hover:bg-accent transition-colors duration-150 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <Icon className="w-5 h-5 text-primary" aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{title}</p>
                <p className="text-xs text-muted-foreground">{desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </Layout>
  );
}
