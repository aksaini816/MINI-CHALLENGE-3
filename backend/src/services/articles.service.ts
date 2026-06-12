import { prisma } from '../prisma/client';
import { ArticleCategory } from '@prisma/client';

export class ArticlesService {
  async getArticles(params: { category?: string; search?: string; page: number; limit: number }) {
    const { category, search, page, limit } = params;
    const skip = (page - 1) * limit;

    const where: { published: boolean; category?: ArticleCategory; OR?: object[] } = {
      published: true,
    };

    if (category && Object.values(ArticleCategory).includes(category as ArticleCategory)) {
      where.category = category as ArticleCategory;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { excerpt: { contains: search, mode: 'insensitive' } },
        { tags: { has: search } },
      ];
    }

    const [articles, total] = await Promise.all([
      prisma.article.findMany({
        where,
        skip,
        take: limit,
        orderBy: { publishedAt: 'desc' },
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          category: true,
          tags: true,
          author: true,
          readTime: true,
          publishedAt: true,
        },
      }),
      prisma.article.count({ where }),
    ]);

    return { articles, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async getArticleBySlug(slug: string) {
    return prisma.article.findUnique({ where: { slug, published: true } });
  }
}

export const articlesService = new ArticlesService();
