import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchNews } from '../services/espnApi';
import { useLeague } from '../contexts/LeagueContext';
import type { NewsArticle } from '../types/espn';

export function News() {
  const { league, leagueName } = useLeague();
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadNews() {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchNews(league);
        setArticles(data.articles || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load news');
      } finally {
        setLoading(false);
      }
    }
    loadNews();
  }, [league]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 text-sm">Loading news...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 text-lg mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
      {/* Header */}
      <header className="bg-slate-900/80 backdrop-blur-sm border-b border-slate-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="text-sm font-medium">Back</span>
            </Link>
            <h1 className="text-white text-xl font-bold">{leagueName} News</h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {articles.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No news available</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article, index) => (
              <ArticleCard key={index} article={article} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function ArticleCard({ article }: { article: NewsArticle }) {
  const imageUrl = article.images?.[0]?.url;
  const publishedDate = new Date(article.published);
  const timeAgo = getTimeAgo(publishedDate);

  return (
    <a
      href={article.links.web.href}
      target="_blank"
      rel="noopener noreferrer"
      className="bg-slate-900 rounded-xl overflow-hidden border border-slate-700 hover:border-slate-500 transition-all group flex flex-col"
    >
      {/* Image */}
      {imageUrl && (
        <div className="relative h-48 overflow-hidden">
          <img
            src={imageUrl}
            alt={article.images?.[0]?.alt || article.headline}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            crossOrigin="anonymous"
          />
          {article.premium && (
            <span className="absolute top-3 right-3 px-2 py-1 bg-amber-500 text-black text-xs font-bold rounded">
              ESPN+
            </span>
          )}
        </div>
      )}

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col">
        <h2 className="text-white font-semibold text-lg leading-snug group-hover:text-blue-400 transition-colors line-clamp-2">
          {article.headline}
        </h2>

        {article.description && (
          <p className="text-gray-400 text-sm mt-2 line-clamp-3">
            {article.description}
          </p>
        )}

        <div className="mt-auto pt-4 flex items-center justify-between text-xs text-gray-500">
          <span>{timeAgo}</span>
          {article.byline && (
            <span className="truncate max-w-[150px]">{article.byline}</span>
          )}
        </div>

        {/* Categories/Teams */}
        {article.categories && article.categories.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {article.categories
              .filter(cat => cat.type === 'team' || cat.type === 'athlete')
              .slice(0, 3)
              .map((cat, idx) => (
                <span
                  key={idx}
                  className="px-2 py-1 bg-slate-800 rounded text-xs text-gray-400"
                >
                  {cat.description}
                </span>
              ))}
          </div>
        )}
      </div>
    </a>
  );
}

function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) {
    return `${diffMins}m ago`;
  } else if (diffHours < 24) {
    return `${diffHours}h ago`;
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays < 7) {
    return `${diffDays}d ago`;
  } else {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
}
