import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Search, Clock, ArrowRight } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Input, Button, Skeleton } from '@/components/ui';
import api from '@/lib/api';
import { formatDate, truncate } from '@/lib/utils';

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  tags: string[];
  author: string;
  readTime: number;
  publishedAt?: string;
}

const categories = [
  { key: 'all', label: 'All' },
  { key: 'CLIMATE_CHANGE', label: 'Climate Change' },
  { key: 'CARBON_FOOTPRINT', label: 'Carbon Footprint' },
  { key: 'SUSTAINABLE_LIVING', label: 'Sustainable Living' },
  { key: 'RENEWABLE_ENERGY', label: 'Renewable Energy' },
  { key: 'FOOD_AND_DIET', label: 'Food & Diet' },
  { key: 'TRANSPORTATION', label: 'Transportation' },
];

const categoryColors: Record<string, string> = {
  CLIMATE_CHANGE: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
  CARBON_FOOTPRINT: 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300',
  SUSTAINABLE_LIVING: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
  RENEWABLE_ENERGY: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300',
  FOOD_AND_DIET: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
  TRANSPORTATION: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
};

export function KnowledgeHubPage(): React.JSX.Element {
  const [articles, setArticles] = useState<Article[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  const fetchArticles = useCallback(async (): Promise<void> => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '9' });
      if (category !== 'all') params.set('category', category);
      if (debouncedSearch) params.set('search', debouncedSearch);
      const res = await api.get(`/articles?${params}`);
      setArticles(res.data.data.articles ?? []);
      setTotal(res.data.data.pagination?.total ?? 0);
    } catch {
      setArticles([]);
    } finally {
      setLoading(false);
    }
  }, [page, category, debouncedSearch]);

  useEffect(() => { void fetchArticles(); }, [fetchArticles]);

  // Reset page on filter change
  useEffect(() => { setPage(1); }, [category, debouncedSearch]);

  return (
    <Layout title="Knowledge Hub">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-primary" aria-hidden="true" />
            Knowledge Hub
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            Learn about climate change, sustainability, and how to reduce your impact
          </p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            type="search"
            placeholder="Search articles..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
            aria-label="Search knowledge hub articles"
          />
        </div>

        {/* Categories */}
        <div
          role="group"
          aria-label="Filter articles by category"
          className="flex flex-wrap gap-2"
        >
          {categories.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setCategory(key)}
              aria-pressed={category === key}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
                ${category === key
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-accent hover:text-foreground'}`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Results count */}
        {!loading && (
          <p className="text-sm text-muted-foreground" aria-live="polite" role="status">
            {total} article{total !== 1 ? 's' : ''} found
          </p>
        )}

        {/* Article grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5" aria-busy="true" aria-label="Loading articles">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-52 rounded-xl" />)}
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-16">
            <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-30" aria-hidden="true" />
            <p className="text-muted-foreground">No articles found. Try a different search or category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5" role="list">
            {articles.map((article) => (
              <article
                key={article.id}
                role="listitem"
                className="bg-card border border-border rounded-xl p-5 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 flex flex-col"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full ${categoryColors[article.category] ?? 'bg-muted text-muted-foreground'}`}
                    >
                      {article.category.replace(/_/g, ' ')}
                    </span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" aria-hidden="true" />
                      {article.readTime} min read
                    </span>
                  </div>
                  <h3 className="font-semibold text-sm leading-snug mb-2">{article.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {truncate(article.excerpt, 120)}
                  </p>
                  {article.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2" aria-label="Article tags">
                      {article.tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="text-xs bg-muted text-muted-foreground px-1.5 py-0.5 rounded">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
                  <div className="text-xs text-muted-foreground">
                    By {article.author}
                    {article.publishedAt && <> · {formatDate(article.publishedAt)}</>}
                  </div>
                  <Link
                    to={`/knowledge/${article.slug}`}
                    className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
                    aria-label={`Read article: ${article.title}`}
                  >
                    Read <ArrowRight className="h-3 w-3" aria-hidden="true" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Pagination */}
        {total > 9 && (
          <div className="flex items-center justify-center gap-3" role="navigation" aria-label="Article pagination">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              aria-label="Previous page"
            >
              Previous
            </Button>
            <span className="text-sm text-muted-foreground" aria-live="polite">
              Page {page} of {Math.ceil(total / 9)}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= Math.ceil(total / 9)}
              onClick={() => setPage((p) => p + 1)}
              aria-label="Next page"
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
}
