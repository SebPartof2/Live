import { Link } from 'react-router-dom';
import { useLeague } from '../contexts/LeagueContext';
import type { League } from '../services/espnApi';

interface HeaderProps {
  weekLabel?: string;
  seasonName?: string;
  lastUpdated: Date | null;
  onRefresh: () => void;
  isLoading: boolean;
}

export function Header({
  weekLabel,
  seasonName,
  lastUpdated,
  onRefresh,
  isLoading,
}: HeaderProps) {
  const { league, setLeague, leagueName } = useLeague();

  const leagues: { id: League; label: string }[] = [
    { id: 'nfl', label: 'NFL' },
    { id: 'college-football', label: 'CFB' },
  ];

  return (
    <header className="bg-slate-900/80 backdrop-blur-sm border-b border-slate-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">🏈</span>
              </div>
              <div>
                <h1 className="text-white font-bold text-xl tracking-tight">
                  {leagueName} Scoreboard
                </h1>
                <p className="text-gray-400 text-sm">
                  {seasonName || weekLabel
                    ? [seasonName, weekLabel].filter(Boolean).join(' • ')
                    : 'Live Scores'}
                </p>
              </div>
            </div>

            {/* League Selector */}
            <div className="flex items-center bg-slate-800 rounded-lg p-1 border border-slate-700">
              {leagues.map((l) => (
                <button
                  key={l.id}
                  onClick={() => setLeague(l.id)}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${
                    league === l.id
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>

            {/* Navigation */}
            <nav className="hidden sm:flex items-center gap-1">
              <Link
                to="/"
                className="px-3 py-1.5 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-slate-800 transition-colors"
              >
                Scores
              </Link>
              <Link
                to="/teams"
                className="px-3 py-1.5 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-slate-800 transition-colors"
              >
                Teams
              </Link>
              <Link
                to="/news"
                className="px-3 py-1.5 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-slate-800 transition-colors"
              >
                News
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            {lastUpdated && (
              <span className="text-gray-500 text-xs hidden sm:block">
                Updated {lastUpdated.toLocaleTimeString()}
              </span>
            )}
            <button
              onClick={onRefresh}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 rounded-lg text-white text-sm font-medium transition-all border border-slate-700"
            >
              <svg
                className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Refresh
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
