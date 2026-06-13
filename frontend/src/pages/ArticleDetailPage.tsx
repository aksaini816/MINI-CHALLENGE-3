import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { ArrowLeft, Clock, User, Calendar } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button, Skeleton, Badge } from '@/components/ui';
import api from '@/lib/api';
import { formatDate } from '@/lib/utils';

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string[];
  author: string;
  readTime: number;
  publishedAt?: string;
}

export function ArticleDetailPage(): React.JSX.Element {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticle = async (): Promise<void> => {
      try {
        const res = await api.get(`/articles/${slug}`);
        setArticle(res.data.data.article);
      } catch (err) {
        console.error(err);
        setArticle(null);
      } finally {
        setLoading(false);
      }
    };
    if (slug) {
      void fetchArticle();
    }
  }, [slug]);

  if (loading) {
    return (
      <Layout title="Loading Article...">
        <div className="max-w-3xl mx-auto space-y-6">
          <Skeleton className="h-8 w-32 mb-8" />
          <Skeleton className="h-12 w-full" />
          <div className="flex gap-4">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-6 w-24" />
          </div>
          <div className="space-y-4 mt-8">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      </Layout>
    );
  }

  if (!article) {
    return (
      <Layout title="Article Not Found">
        <div className="max-w-3xl mx-auto text-center py-20">
          <h2 className="text-2xl font-bold mb-4">Article Not Found</h2>
          <p className="text-muted-foreground mb-8">The article you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => navigate('/knowledge')}>Return to Knowledge Hub</Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={article.title}>
      <div className="max-w-3xl mx-auto">
        <Button 
          variant="ghost" 
          className="mb-6 -ml-4 text-muted-foreground hover:text-foreground"
          onClick={() => navigate('/knowledge')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Knowledge Hub
        </Button>

        <article className="animate-fade-in">
          <header className="mb-10">
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <Badge variant="outline" className="text-xs font-medium uppercase tracking-wider">
                {article.category.replace(/_/g, ' ')}
              </Badge>
              {article.tags.map(tag => (
                <span key={tag} className="text-xs text-muted-foreground">#{tag}</span>
              ))}
            </div>

            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-6 text-foreground leading-tight">
              {article.title}
            </h1>

            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              {article.excerpt}
            </p>

            <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground border-y border-border py-4">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span className="font-medium text-foreground">{article.author}</span>
              </div>
              {article.publishedAt && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <time dateTime={article.publishedAt}>{formatDate(article.publishedAt)}</time>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{article.readTime} min read</span>
              </div>
            </div>
          </header>

          <div className="prose prose-zinc dark:prose-invert prose-lg max-w-none 
            prose-headings:font-bold prose-headings:tracking-tight
            prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-6
            prose-h3:text-2xl prose-h3:mt-8 prose-h3:mb-4
            prose-p:leading-relaxed prose-p:mb-6
            prose-a:text-primary prose-a:no-underline hover:prose-a:underline
            prose-img:rounded-2xl prose-img:shadow-lg prose-img:w-full prose-img:object-cover prose-img:my-10
            prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:pl-6 prose-blockquote:italic
            prose-strong:text-foreground prose-strong:font-semibold
            prose-ul:my-6 prose-ul:list-disc prose-ul:pl-6
            prose-li:my-2
            pb-20"
          >
            <ReactMarkdown>{article.content}</ReactMarkdown>
          </div>
        </article>
      </div>
    </Layout>
  );
}
