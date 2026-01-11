import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { fetchAllTeams } from '../services/espnApi';
import { useLeague } from '../contexts/LeagueContext';
import type { TeamInfo } from '../types/espn';

export function Teams() {
  const { league, leagueName } = useLeague();
  const [teams, setTeams] = useState<TeamInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function loadTeams() {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchAllTeams(league);
        const allTeams = data.sports[0]?.leagues[0]?.teams.map(t => t.team) || [];
        // Sort alphabetically by display name
        allTeams.sort((a, b) => (a.displayName || '').localeCompare(b.displayName || ''));
        setTeams(allTeams);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load teams');
      } finally {
        setLoading(false);
      }
    }
    loadTeams();
  }, [league]);

  const filteredTeams = useMemo(() => {
    if (!searchQuery.trim()) return teams;
    const query = searchQuery.toLowerCase();
    return teams.filter(team =>
      team.displayName?.toLowerCase().includes(query) ||
      team.abbreviation?.toLowerCase().includes(query) ||
      team.location?.toLowerCase().includes(query) ||
      team.name?.toLowerCase().includes(query)
    );
  }, [teams, searchQuery]);

  // Group teams by division (NFL only)
  const teamsByDivision = useMemo(() => {
    if (league !== 'nfl') return null;

    const divisions: Record<string, TeamInfo[]> = {
      'AFC East': [],
      'AFC North': [],
      'AFC South': [],
      'AFC West': [],
      'NFC East': [],
      'NFC North': [],
      'NFC South': [],
      'NFC West': [],
    };

    // Team ID to division mapping (ESPN team IDs)
    const divisionMap: Record<string, string> = {
      // AFC East
      '2': 'AFC East', // Bills
      '15': 'AFC East', // Dolphins
      '17': 'AFC East', // Patriots
      '20': 'AFC East', // Jets
      // AFC North
      '33': 'AFC North', // Ravens
      '4': 'AFC North', // Bengals
      '5': 'AFC North', // Browns
      '23': 'AFC North', // Steelers
      // AFC South
      '34': 'AFC South', // Texans
      '11': 'AFC South', // Colts
      '30': 'AFC South', // Jaguars
      '10': 'AFC South', // Titans
      // AFC West
      '7': 'AFC West', // Broncos
      '12': 'AFC West', // Chiefs
      '13': 'AFC West', // Raiders
      '24': 'AFC West', // Chargers
      // NFC East
      '6': 'NFC East', // Cowboys
      '21': 'NFC East', // Giants
      '8': 'NFC East', // Eagles
      '28': 'NFC East', // Commanders
      // NFC North
      '3': 'NFC North', // Bears
      '19': 'NFC North', // Lions
      '9': 'NFC North', // Packers
      '16': 'NFC North', // Vikings
      // NFC South
      '1': 'NFC South', // Falcons
      '29': 'NFC South', // Panthers
      '18': 'NFC South', // Saints
      '27': 'NFC South', // Buccaneers
      // NFC West
      '22': 'NFC West', // Cardinals
      '14': 'NFC West', // Rams
      '25': 'NFC West', // 49ers
      '26': 'NFC West', // Seahawks
    };

    filteredTeams.forEach(team => {
      const division = divisionMap[team.id];
      if (division && divisions[division]) {
        divisions[division].push(team);
      }
    });

    return divisions;
  }, [filteredTeams, league]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 text-sm">Loading teams...</p>
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
          <div className="flex items-center justify-between">
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
              <h1 className="text-white text-xl font-bold">{leagueName} Teams</h1>
              <span className="text-gray-500 text-sm">({teams.length} teams)</span>
            </div>

            {/* Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search teams..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64 px-4 py-2 pl-10 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {searchQuery && filteredTeams.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No teams found matching "{searchQuery}"</p>
          </div>
        ) : searchQuery || league === 'college-football' ? (
          /* Search results or CFB - flat grid */
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {filteredTeams.map(team => (
              <TeamCard key={team.id} team={team} />
            ))}
          </div>
        ) : teamsByDivision ? (
          /* NFL Division view */
          <div className="space-y-8">
            {['AFC', 'NFC'].map(conference => (
              <div key={conference}>
                <h2 className="text-white text-2xl font-bold mb-4">{conference}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {['East', 'North', 'South', 'West'].map(division => {
                    const divisionName = `${conference} ${division}`;
                    const divisionTeams = teamsByDivision[divisionName] || [];
                    return (
                      <div key={divisionName} className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                        <h3 className="text-gray-400 text-sm font-semibold uppercase tracking-wider mb-3">
                          {division}
                        </h3>
                        <div className="space-y-2">
                          {divisionTeams.map(team => (
                            <TeamListItem key={team.id} team={team} />
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </main>
    </div>
  );
}

function TeamCard({ team }: { team: TeamInfo }) {
  return (
    <Link
      to={`/team/${team.id}`}
      className="bg-slate-800/50 rounded-xl p-4 border border-slate-700 hover:border-slate-500 transition-all flex flex-col items-center text-center group"
    >
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center mb-3 transition-transform group-hover:scale-110"
        style={{ backgroundColor: `#${team.color || '3b82f6'}20` }}
      >
        <img
          src={team.logos?.[0]?.href}
          alt={team.displayName}
          className="w-12 h-12 object-contain"
          crossOrigin="anonymous"
        />
      </div>
      <span className="text-white font-semibold text-sm">{team.displayName}</span>
      <span className="text-gray-400 text-xs">{team.abbreviation}</span>
    </Link>
  );
}

function TeamListItem({ team }: { team: TeamInfo }) {
  return (
    <Link
      to={`/team/${team.id}`}
      className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-700/50 transition-colors group"
    >
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center"
        style={{ backgroundColor: `#${team.color || '3b82f6'}20` }}
      >
        <img
          src={team.logos?.[0]?.href}
          alt={team.displayName}
          className="w-7 h-7 object-contain"
          crossOrigin="anonymous"
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-white font-medium text-sm truncate group-hover:text-blue-400 transition-colors">
          {team.location} {team.name}
        </div>
        {team.standingSummary && (
          <div className="text-gray-500 text-xs truncate">{team.standingSummary}</div>
        )}
      </div>
    </Link>
  );
}
