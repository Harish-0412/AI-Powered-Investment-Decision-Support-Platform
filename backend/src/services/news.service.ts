import { env } from "../config/env";
import { cacheGet, cacheSet } from "../lib/redis";

const NEWS_API_KEY = env.NEWS_API_KEY || "984372f759f5467d8e8d6aae6c844e48";
const BASE_URL = "https://newsapi.org/v2";

export type NewsArticle = {
  source: { name: string };
  author: string | null;
  title: string;
  description: string;
  url: string;
  urlToImage: string | null;
  publishedAt: string;
  content: string | null;
};

export const getTopMarketNews = async (category = "business", country = "in"): Promise<NewsArticle[]> => {
  const cacheKey = `news:top:${category}:${country}`;
  const cached = await cacheGet(cacheKey);
  if (cached) return cached as NewsArticle[];

  const response = await fetch(
    `${BASE_URL}/top-headlines?category=${category}&country=${country}&apiKey=${NEWS_API_KEY}`
  );

  if (!response.ok) {
    const error = await response.json() as { message?: string };
    throw new Error(error.message || "Failed to fetch news from NewsAPI");
  }

  const data = await response.json() as { articles: NewsArticle[] };
  const articles = data.articles.filter(a => a.title !== "[Removed]");

  await cacheSet(cacheKey, articles, 3600); // Cache for 1 hour
  return articles;
};

export const searchStockNews = async (query: string): Promise<NewsArticle[]> => {
  const cacheKey = `news:search:${query.toLowerCase()}`;
  const cached = await cacheGet(cacheKey);
  if (cached) return cached as NewsArticle[];

  const response = await fetch(
    `${BASE_URL}/everything?q=${encodeURIComponent(query)}&sortBy=relevancy&language=en&apiKey=${NEWS_API_KEY}`
  );

  if (!response.ok) {
    const error = await response.json() as { message?: string };
    throw new Error(error.message || "Failed to fetch stock news from NewsAPI");
  }

  const data = await response.json() as { articles: NewsArticle[] };
  const articles = data.articles.filter(a => a.title !== "[Removed]").slice(0, 10);

  await cacheSet(cacheKey, articles, 3600); // Cache for 1 hour
  return articles;
};
