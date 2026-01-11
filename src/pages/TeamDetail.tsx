import { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchTeamInfo, fetchTeamRoster } from '../services/espnApi';
import { useLeague } from '../contexts/LeagueContext';
import type { TeamInfo, TeamRoster, RosterPlayer } from '../types/espn';
import teamChants from '../data/teamChants.json';

export function TeamDetail() {
  const { teamId } = useParams<{ teamId: string }>();
  const { league } = useLeague();
  const [teamInfo, setTeamInfo] = useState<TeamInfo | null>(null);
  const [roster, setRoster] = useState<TeamRoster | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPosition, setSelectedPosition] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function loadData() {
      if (!teamId) return;
      setLoading(true);
      setError(null);

      try {
        const [info, rosterData] = await Promise.all([
          fetchTeamInfo(league, teamId),
          fetchTeamRoster(league, teamId),
        ]);
        setTeamInfo(info);
        setRoster(rosterData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load team data');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [teamId, league]);

  // Flatten all players from roster
  const allPlayers = useMemo(() => {
    if (!roster?.athletes) return [];
    return roster.athletes.flatMap(group => group.items || []);
  }, [roster]);

  // Get unique positions from actual player data
  const positions = useMemo(() => {
    const posMap = new Map<string, string>();
    allPlayers.forEach(player => {
      if (player.position?.abbreviation) {
        posMap.set(player.position.abbreviation, player.position.displayName || player.position.name);
      }
    });
    // Sort positions in a logical order
    const positionOrder = ['QB', 'RB', 'FB', 'WR', 'TE', 'OT', 'OG', 'C', 'OL', 'DE', 'DT', 'NT', 'DL', 'LB', 'OLB', 'ILB', 'MLB', 'CB', 'S', 'FS', 'SS', 'DB', 'K', 'P', 'LS'];
    return Array.from(posMap.entries()).sort((a, b) => {
      const aIdx = positionOrder.indexOf(a[0]);
      const bIdx = positionOrder.indexOf(b[0]);
      if (aIdx === -1 && bIdx === -1) return a[0].localeCompare(b[0]);
      if (aIdx === -1) return 1;
      if (bIdx === -1) return -1;
      return aIdx - bIdx;
    });
  }, [allPlayers]);

  // Filter players
  const filteredPlayers = useMemo(() => {
    let players = allPlayers;

    if (selectedPosition !== 'all') {
      players = players.filter(player => player.position?.abbreviation === selectedPosition);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      players = players.filter(player =>
        player.fullName.toLowerCase().includes(query) ||
        player.displayName.toLowerCase().includes(query) ||
        player.jersey?.includes(query) ||
        player.position?.abbreviation.toLowerCase().includes(query)
      );
    }

    return players;
  }, [allPlayers, selectedPosition, searchQuery]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 text-sm">Loading team...</p>
        </div>
      </div>
    );
  }

  if (error || !teamInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 text-lg mb-4">{error || 'Team not found'}</p>
          <Link
            to="/teams"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white"
          >
            Back to Teams
          </Link>
        </div>
      </div>
    );
  }

  const teamColor = teamInfo.color || '1a1a2e';
  const altColor = teamInfo.alternateColor || teamColor;
  // NFL teams use chants, college football uses mascot/nickname
  const teamChant = league === 'nfl'
    ? (teamChants as Record<string, string>)[teamInfo.abbreviation]
    : teamInfo.name; // e.g., "Crimson Tide", "Tigers"

  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{
        background: `linear-gradient(135deg, #${teamColor}20 0%, transparent 50%),
                     radial-gradient(ellipse at top left, #${teamColor}30 0%, transparent 50%),
                     linear-gradient(to bottom, #0f172a, #1e293b)`
      }}
    >
      {/* Background Decorations */}
      {teamInfo.logos?.[0]?.href && (
        <img
          src={teamInfo.logos[0].href}
          alt=""
          aria-hidden="true"
          className="fixed top-20 -right-20 w-96 h-96 object-contain opacity-[0.05] pointer-events-none select-none blur-sm"
          crossOrigin="anonymous"
        />
      )}
      {teamChant && (
        <div
          aria-hidden="true"
          className="fixed bottom-16 left-4 pointer-events-none select-none opacity-[0.12] tracking-[0.25em] uppercase"
          style={{
            writingMode: 'vertical-rl',
            textOrientation: 'mixed',
            transform: 'rotate(180deg)',
            color: `#${altColor}`,
            fontFamily: '"Orbitron", sans-serif',
            fontWeight: 700,
            fontSize: '5rem',
          }}
        >
          {teamChant}
        </div>
      )}

      {/* Header */}
      <header className="bg-slate-900/80 backdrop-blur-sm border-b border-slate-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link
              to="/teams"
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="text-sm font-medium">Teams</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Team Header */}
        <div className="bg-slate-900 rounded-xl overflow-hidden border border-slate-700">
          <div
            className="h-2"
            style={{ backgroundColor: `#${teamColor}` }}
          />
          <div className="p-6">
            <div className="flex items-center gap-6">
              <div
                className="w-24 h-24 rounded-full flex items-center justify-center"
                style={{ backgroundColor: `#${teamColor}20` }}
              >
                <img
                  src={teamInfo.logos?.[0]?.href}
                  alt={teamInfo.displayName}
                  className="w-16 h-16 object-contain"
                  crossOrigin="anonymous"
                />
              </div>
              <div>
                <h1 className="text-white text-3xl font-bold">{teamInfo.displayName}</h1>
                <div className="flex items-center gap-4 mt-2">
                  {teamInfo.record?.items?.[0] && (
                    <span className="text-gray-400">
                      {teamInfo.record.items[0].summary}
                    </span>
                  )}
                  {teamInfo.standingSummary && (
                    <span className="text-gray-500">{teamInfo.standingSummary}</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Roster Section */}
        <div className="bg-slate-900 rounded-xl overflow-hidden border border-slate-700">
          <div className="px-4 py-3 bg-slate-800/50 border-b border-slate-700">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h2 className="text-white font-semibold text-lg">Roster</h2>
              <div className="flex items-center gap-3">
                {/* Search */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search players..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-48 px-3 py-1.5 pl-8 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <svg
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>

                {/* Position Filter */}
                <select
                  value={selectedPosition}
                  onChange={(e) => setSelectedPosition(e.target.value)}
                  className="px-3 py-1.5 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Positions</option>
                  {positions.map(([abbr, name]) => (
                    <option key={abbr} value={abbr}>{abbr} - {name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Roster Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-500 border-b border-slate-700 bg-slate-800/30">
                  <th className="text-left py-3 px-4 font-medium">#</th>
                  <th className="text-left py-3 px-4 font-medium">Player</th>
                  <th className="text-left py-3 px-4 font-medium">Pos</th>
                  <th className="text-left py-3 px-4 font-medium hidden sm:table-cell">Age</th>
                  <th className="text-left py-3 px-4 font-medium hidden md:table-cell">Ht</th>
                  <th className="text-left py-3 px-4 font-medium hidden md:table-cell">Wt</th>
                  <th className="text-left py-3 px-4 font-medium hidden lg:table-cell">Exp</th>
                  <th className="text-left py-3 px-4 font-medium hidden lg:table-cell">College</th>
                </tr>
              </thead>
              <tbody>
                {filteredPlayers.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-gray-500">
                      {searchQuery ? `No players found matching "${searchQuery}"` : 'No players available'}
                    </td>
                  </tr>
                ) : (
                  filteredPlayers.map((player) => (
                    <PlayerRow key={player.id} player={player} teamColor={teamColor} />
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="px-4 py-3 bg-slate-800/30 border-t border-slate-700 text-gray-500 text-sm">
            {filteredPlayers.length} player{filteredPlayers.length !== 1 ? 's' : ''}
            {selectedPosition !== 'all' && ` in ${selectedPosition}`}
          </div>
        </div>

        {/* Coaching Staff */}
        {roster?.coach && roster.coach.length > 0 && (
          <div className="bg-slate-900 rounded-xl overflow-hidden border border-slate-700">
            <div className="px-4 py-3 bg-slate-800/50 border-b border-slate-700">
              <h2 className="text-white font-semibold">Coaching Staff</h2>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {roster.coach.map((coach) => (
                  <div key={coach.id} className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg">
                    <div className="w-12 h-12 bg-slate-700 rounded-full flex items-center justify-center">
                      <span className="text-gray-400 text-lg font-bold">
                        {coach.firstName[0]}{coach.lastName[0]}
                      </span>
                    </div>
                    <div>
                      <div className="text-white font-medium">{coach.firstName} {coach.lastName}</div>
                      <div className="text-gray-500 text-sm">Head Coach</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function PlayerRow({ player, teamColor }: { player: RosterPlayer; teamColor: string }) {
  const statusColor = player.status?.type === 'injured' ? 'text-red-400' :
                      player.status?.type === 'active' ? 'text-green-400' : 'text-gray-400';

  return (
    <tr className="text-gray-300 border-t border-slate-700/50 hover:bg-slate-800/30 transition-colors">
      <td className="py-3 px-4">
        <span
          className="inline-flex items-center justify-center w-8 h-8 rounded-full text-white font-bold text-sm"
          style={{ backgroundColor: `#${teamColor}40` }}
        >
          {player.jersey || '-'}
        </span>
      </td>
      <td className="py-3 px-4">
        <div className="flex items-center gap-3">
          {player.headshot?.href ? (
            <img
              src={player.headshot.href}
              alt={player.displayName}
              className="w-10 h-10 rounded-full object-cover bg-slate-700"
              crossOrigin="anonymous"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center">
              <span className="text-gray-400 text-xs font-bold">
                {player.firstName?.[0]}{player.lastName?.[0]}
              </span>
            </div>
          )}
          <div>
            <div className="text-white font-medium">{player.fullName}</div>
            {player.status?.abbreviation && player.status.abbreviation !== 'Active' && (
              <span className={`text-xs ${statusColor}`}>
                {player.status.abbreviation}
              </span>
            )}
          </div>
        </div>
      </td>
      <td className="py-3 px-4">
        <span className="px-2 py-1 bg-slate-700 rounded text-xs font-medium">
          {player.position?.abbreviation || '-'}
        </span>
      </td>
      <td className="py-3 px-4 hidden sm:table-cell">{player.age || '-'}</td>
      <td className="py-3 px-4 hidden md:table-cell">{player.displayHeight || '-'}</td>
      <td className="py-3 px-4 hidden md:table-cell">{player.displayWeight || '-'}</td>
      <td className="py-3 px-4 hidden lg:table-cell">
        {player.experience?.years !== undefined ?
          (player.experience.years === 0 ? 'R' : `${player.experience.years}`) : '-'}
      </td>
      <td className="py-3 px-4 hidden lg:table-cell text-gray-400">
        {player.college?.shortName || player.college?.name || '-'}
      </td>
    </tr>
  );
}
