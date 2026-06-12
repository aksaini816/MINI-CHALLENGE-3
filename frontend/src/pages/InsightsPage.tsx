import React, { useEffect, useState } from 'react';
import { Lightbulb, TrendingDown, ArrowRight, Info } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button, Skeleton } from '@/components/ui';
import api from '@/lib/api';
import { Link } from 'react-router-dom';

interface Insight {
  id: string;
  category: string;
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  potentialReduction: number;
  actionable: boolean;
}

const priorityConfig = {
  high: { label: 'High Impact', color: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300' },
  medium: { label: 'Medium Impact', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300' },
  low: { label: 'Low Impact', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300' },
};

const categoryIcons: Record<string, string> = {
  transport: '🚗',
  energy: '⚡',
  food: '🥗',
  waste: '♻️',
  general: '🌍',
};

const InsightCard: React.FC<{ insight: Insight; index: number }> = ({ insight, index }) => {
  const p = priorityConfig[insight.priority];
  return (
    <article
      className="bg-card border border-border rounded-xl p-5 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 animate-fade-in"
      style={{ animationDelay: `${index * 50}ms` }}
      aria-label={`Insight: ${insight.title}`}
    >
      <div className="flex items-start gap-4">
        <div
          className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-xl flex-shrink-0"
          aria-hidden="true"
        >
          {categoryIcons[insight.category] ?? '💡'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${p.color}`}>
              {p.label}
            </span>
            {insight.actionable && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300">
                Actionable
              </span>
            )}
          </div>
          <h3 className="font-semibold text-sm text-foreground mb-1.5">{insight.title}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{insight.description}</p>

          {insight.potentialReduction > 0 && (
            <div className="flex items-center gap-1.5 mt-3 text-sm">
              <TrendingDown className="h-4 w-4 text-green-500" aria-hidden="true" />
              <span className="font-medium text-green-600 dark:text-green-400">
                Save up to {insight.potentialReduction.toFixed(0)} kg CO₂/year
              </span>
            </div>
          )}
        </div>
      </div>
    </article>
  );
};

export function InsightsPage(): React.JSX.Element {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [hasData, setHasData] = useState(true);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    const fetch = async (): Promise<void> => {
      try {
        const res = await api.get('/carbon/insights');
        setInsights(res.data.data.insights ?? []);
        setHasData(res.data.data.hasData);
      } catch {
        setHasData(false);
      } finally {
        setLoading(false);
      }
    };
    void fetch();
  }, []);

  const filtered = filter === 'all' ? insights : insights.filter((i) => i.priority === filter);
  const totalPotential = insights.reduce((sum, i) => sum + i.potentialReduction, 0);

  return (
    <Layout title="AI Insights">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Lightbulb className="w-6 h-6 text-primary" aria-hidden="true" />
              AI Sustainability Insights
            </h2>
            <p className="text-muted-foreground text-sm mt-1">
              Personalized recommendations based on your carbon footprint data
            </p>
          </div>
          {insights.length > 0 && (
            <div className="flex items-center gap-2 text-sm bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl px-4 py-2.5">
              <TrendingDown className="h-4 w-4 text-green-500" aria-hidden="true" />
              <span className="text-green-700 dark:text-green-300 font-medium">
                Total potential: {totalPotential.toFixed(0)} kg CO₂/year
              </span>
            </div>
          )}
        </div>

        {/* Architecture note */}
        <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg text-xs text-blue-700 dark:text-blue-300">
          <Info className="h-4 w-4 flex-shrink-0 mt-0.5" aria-hidden="true" />
          <span>
            These insights are generated by our rule-based AI engine using scientifically validated emission factors.
            The architecture supports future LLM integration for even more personalized recommendations.
          </span>
        </div>

        {loading ? (
          <div className="space-y-4" aria-busy="true" aria-label="Loading insights">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-xl" />
            ))}
          </div>
        ) : !hasData ? (
          <div className="text-center py-16 bg-card border border-border rounded-xl">
            <Lightbulb className="w-12 h-12 text-muted-foreground mx-auto mb-4" aria-hidden="true" />
            <h3 className="text-lg font-semibold mb-2">No data yet</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Calculate your carbon footprint first to get personalized insights.
            </p>
            <Button asChild>
              <Link to="/calculator">
                Start Calculating
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
          </div>
        ) : (
          <>
            {/* Filter tabs */}
            <div
              role="tablist"
              aria-label="Filter insights by priority"
              className="flex items-center gap-2 flex-wrap"
            >
              {[
                { key: 'all', label: `All (${insights.length})` },
                { key: 'high', label: `High (${insights.filter(i => i.priority === 'high').length})` },
                { key: 'medium', label: `Medium (${insights.filter(i => i.priority === 'medium').length})` },
                { key: 'low', label: `Low (${insights.filter(i => i.priority === 'low').length})` },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  role="tab"
                  aria-selected={filter === key}
                  onClick={() => setFilter(key)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
                    ${filter === key
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground'}`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Insight cards */}
            {filtered.length > 0 ? (
              <div
                className="space-y-4"
                role="tabpanel"
                aria-label={`${filter} priority insights`}
              >
                {filtered.map((insight, i) => (
                  <InsightCard key={insight.id} insight={insight} index={i} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <p>No insights match this filter.</p>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}
