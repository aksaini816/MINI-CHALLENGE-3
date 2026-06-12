import React, { useEffect, useState } from 'react';
import { TrendingDown, Calendar } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Skeleton } from '@/components/ui';
import api from '@/lib/api';
import { formatDate, formatNumber, getScoreBadgeColor } from '@/lib/utils';

interface CarbonEntry {
  id: string;
  date: string;
  totalMonthly: number;
  totalYearly: number;
  sustainabilityScore: number;
  transportEmissions: number;
  energyEmissions: number;
  foodEmissions: number;
  wasteEmissions: number;
  dietType: string;
  createdAt: string;
}

export function HistoryPage(): React.JSX.Element {
  const [entries, setEntries] = useState<CarbonEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async (): Promise<void> => {
      setLoading(true);
      try {
        const res = await api.get(`/carbon/history?page=${page}&limit=10`);
        setEntries(res.data.data.entries ?? []);
        setTotal(res.data.data.pagination?.total ?? 0);
      } catch {
        setEntries([]);
      } finally {
        setLoading(false);
      }
    };
    void fetch();
  }, [page]);

  return (
    <Layout title="Emission History">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <TrendingDown className="w-6 h-6 text-primary" aria-hidden="true" />
            Emission History
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            Review all your past carbon footprint calculations
          </p>
        </div>

        {loading ? (
          <div className="space-y-4" aria-busy="true" aria-label="Loading emission history">
            {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-16 bg-card border border-border rounded-xl">
            <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-30" aria-hidden="true" />
            <p className="text-muted-foreground">No calculations yet. Use the Calculator to get started.</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-muted-foreground" role="status" aria-live="polite">
              Showing {entries.length} of {total} entries
            </p>
            <div className="space-y-3" role="list" aria-label="Carbon emission history entries">
              {entries.map((entry) => {
                const scoreColor = getScoreBadgeColor(entry.sustainabilityScore);
                return (
                  <article
                    key={entry.id}
                    role="listitem"
                    className="bg-card border border-border rounded-xl p-4 hover:shadow-sm transition-all"
                    aria-label={`Calculation from ${formatDate(entry.createdAt)}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <time dateTime={entry.createdAt} className="text-sm font-medium">
                            {formatDate(entry.createdAt)}
                          </time>
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${scoreColor}`}>
                            Score: {entry.sustainabilityScore}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-1 mt-2">
                          {[
                            { label: 'Transport', value: entry.transportEmissions },
                            { label: 'Energy', value: entry.energyEmissions },
                            { label: 'Food', value: entry.foodEmissions },
                            { label: 'Waste', value: entry.wasteEmissions },
                          ].map(({ label, value }) => (
                            <div key={label} className="text-xs">
                              <span className="text-muted-foreground">{label}: </span>
                              <span className="font-medium">{formatNumber(value)} kg</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-lg font-bold">{formatNumber(entry.totalMonthly)}</div>
                        <div className="text-xs text-muted-foreground">kg CO₂/mo</div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            {total > 10 && (
              <div className="flex items-center justify-center gap-3" role="navigation" aria-label="History pagination">
                <button
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  disabled={page === 1}
                  className="px-4 py-2 text-sm border border-border rounded-lg disabled:opacity-50 hover:bg-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  aria-label="Previous page"
                >
                  Previous
                </button>
                <span className="text-sm text-muted-foreground" aria-live="polite">
                  Page {page} of {Math.ceil(total / 10)}
                </span>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page >= Math.ceil(total / 10)}
                  className="px-4 py-2 text-sm border border-border rounded-lg disabled:opacity-50 hover:bg-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  aria-label="Next page"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}
