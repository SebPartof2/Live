import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { fetchGameSummary } from '../services/espnApi';
import { useLeague } from '../contexts/LeagueContext';
import type { GameSummary, Competitor, ScoringPlay, Note, Odds, WinProbability, Predictor } from '../types/espn';
import teamChants from '../data/teamChants.json';

function LoadingState() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-400 text-sm">Loading game details...</p>
      </div>
    </div>
  );
}

function ErrorState({ error, onRetry }: { error: string; onRetry: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-4 max-w-md text-center">
        <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center">
          <span className="text-3xl">⚠️</span>
        </div>
        <h2 className="text-white text-xl font-bold">Failed to Load Game</h2>
        <p className="text-gray-400 text-sm">{error}</p>
        <div className="flex gap-3">
          <Link
            to="/"
            className="px-6 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white text-sm font-medium transition-colors"
          >
            Back to Scoreboard
          </Link>
          <button
            onClick={onRetry}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white text-sm font-medium transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
}

function getQuarterLabel(period: number): string {
  if (period === 1) return '1st';
  if (period === 2) return '2nd';
  if (period === 3) return '3rd';
  if (period === 4) return '4th';
  if (period > 4) return 'OT';
  return '';
}

function GameScoreHeader({ awayTeam, homeTeam, status, teamLogos, notes }: {
  awayTeam: Competitor;
  homeTeam: Competitor;
  status: { type: { state: string; shortDetail: string }; displayClock: string; period: number };
  teamLogos: Record<string, string>;
  notes: Note[];
}) {
  const isLive = status.type.state === 'in';
  const isComplete = status.type.state === 'post';
  const eventNote = notes.find(n => n.type === 'event');

  return (
    <div className="bg-slate-900 rounded-xl overflow-hidden border border-slate-700">
      {/* Event Note (e.g., "NFC Wild Card Playoffs") */}
      {eventNote && (
        <div className="px-4 py-2 bg-gradient-to-r from-yellow-500/20 via-yellow-500/10 to-yellow-500/20 border-b border-yellow-500/30 flex items-center justify-center">
          <span className="text-yellow-500 text-xs font-bold uppercase tracking-wider">
            {eventNote.headline}
          </span>
        </div>
      )}

      {/* Status Bar */}
      <div className="px-4 py-2 bg-slate-800/50 border-b border-slate-700 flex items-center justify-center">
        {isLive && (
          <span className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
            <span className="text-red-500 text-sm font-bold">LIVE</span>
            <span className="text-white text-sm font-medium ml-2">
              {getQuarterLabel(status.period)} - {status.displayClock}
            </span>
          </span>
        )}
        {isComplete && (
          <span className="text-gray-400 text-sm font-semibold">FINAL</span>
        )}
        {!isLive && !isComplete && (
          <span className="text-gray-400 text-sm">{status.type.shortDetail}</span>
        )}
      </div>

      {/* Score Display */}
      <div className="p-6">
        <div className="flex items-center justify-between">
          {/* Away Team */}
          <div className="flex-1 flex items-center justify-center">
            <div className="flex flex-col items-center">
              <img
                src={teamLogos[awayTeam.team.id] || awayTeam.team.logo}
                alt={awayTeam.team.displayName}
                className="w-20 h-20 object-contain mb-2"
                crossOrigin="anonymous"
              />
              <span className="text-white font-bold text-lg">{awayTeam.team.displayName}</span>
              <span className="text-gray-400 text-sm">{awayTeam.records?.[0]?.summary}</span>
            </div>
          </div>

          {/* Score */}
          <div className="flex items-center gap-4 px-8">
            <span className={`text-5xl font-bold ${awayTeam.winner ? 'text-white' : 'text-gray-400'}`}>
              {awayTeam.score}
            </span>
            <span className="text-gray-600 text-3xl">-</span>
            <span className={`text-5xl font-bold ${homeTeam.winner ? 'text-white' : 'text-gray-400'}`}>
              {homeTeam.score}
            </span>
          </div>

          {/* Home Team */}
          <div className="flex-1 flex items-center justify-center">
            <div className="flex flex-col items-center">
              <img
                src={teamLogos[homeTeam.team.id] || homeTeam.team.logo}
                alt={homeTeam.team.displayName}
                className="w-20 h-20 object-contain mb-2"
                crossOrigin="anonymous"
              />
              <span className="text-white font-bold text-lg">{homeTeam.team.displayName}</span>
              <span className="text-gray-400 text-sm">{homeTeam.records?.[0]?.summary}</span>
            </div>
          </div>
        </div>

        {/* Quarter Scores */}
        {(awayTeam.linescores || homeTeam.linescores) && (
          <div className="mt-6 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-500">
                  <th className="text-left py-2 px-3">Team</th>
                  {awayTeam.linescores?.map((_, i) => (
                    <th key={i} className="text-center py-2 px-3 w-12">
                      {i < 4 ? i + 1 : 'OT'}
                    </th>
                  ))}
                  <th className="text-center py-2 px-3 w-12 font-bold">T</th>
                </tr>
              </thead>
              <tbody>
                <tr className="text-gray-300 border-t border-slate-700">
                  <td className="py-2 px-3 font-medium">{awayTeam.team.abbreviation}</td>
                  {awayTeam.linescores?.map((ls, i) => (
                    <td key={i} className="text-center py-2 px-3">{ls.displayValue}</td>
                  ))}
                  <td className="text-center py-2 px-3 font-bold text-white">{awayTeam.score}</td>
                </tr>
                <tr className="text-gray-300 border-t border-slate-700">
                  <td className="py-2 px-3 font-medium">{homeTeam.team.abbreviation}</td>
                  {homeTeam.linescores?.map((ls, i) => (
                    <td key={i} className="text-center py-2 px-3">{ls.displayValue}</td>
                  ))}
                  <td className="text-center py-2 px-3 font-bold text-white">{homeTeam.score}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function ScoringPlays({ plays, awayTeamId }: { plays: ScoringPlay[]; awayTeamId: string }) {
  if (!plays || plays.length === 0) return null;

  return (
    <div className="bg-slate-900 rounded-xl overflow-hidden border border-slate-700">
      <div className="px-4 py-3 bg-slate-800/50 border-b border-slate-700">
        <h2 className="text-white font-semibold">Scoring Plays</h2>
      </div>
      <div className="divide-y divide-slate-700">
        {plays.map((play) => (
          <div key={play.id} className="p-4 flex items-start gap-4">
            <div className="flex items-center gap-2 flex-shrink-0">
              {play.team?.logo && (
                <img
                  src={play.team.logo}
                  alt={play.team?.displayName || ''}
                  className="w-8 h-8 object-contain"
                  crossOrigin="anonymous"
                />
              )}
              <span className="text-white font-semibold text-sm">{play.team?.abbreviation || ''}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-yellow-500 text-xs font-semibold">
                  {play.scoringType?.abbreviation || 'SCORE'}
                </span>
                <span className="text-gray-500 text-xs">
                  {getQuarterLabel(play.period?.number || 0)} {play.clock?.displayValue || ''}
                </span>
              </div>
              <p className="text-gray-300 text-sm">{play.text}</p>
            </div>
            <div className="text-right flex-shrink-0">
              <span className={`text-lg font-bold ${play.team?.id === awayTeamId ? 'text-white' : 'text-gray-500'}`}>
                {play.awayScore}
              </span>
              <span className="text-gray-600 mx-1">-</span>
              <span className={`text-lg font-bold ${play.team?.id !== awayTeamId ? 'text-white' : 'text-gray-500'}`}>
                {play.homeScore}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const categoryDisplayNames: Record<string, string> = {
  passing: 'Passing',
  rushing: 'Rushing',
  receiving: 'Receiving',
  fumbles: 'Fumbles',
  defensive: 'Defense',
  interceptions: 'Interceptions',
  kickReturns: 'Kick Returns',
  puntReturns: 'Punt Returns',
  kicking: 'Kicking',
  punting: 'Punting',
};

function StatsPanel({ boxscore, awayColor, homeColor }: { boxscore: GameSummary['boxscore']; awayColor: string; homeColor: string }) {
  const [viewMode, setViewMode] = useState<'team' | 'player'>('team');
  const [selectedTeamIndex, setSelectedTeamIndex] = useState(0);
  const [selectedCategoryIndex, setSelectedCategoryIndex] = useState(0);

  if (!boxscore?.teams || boxscore.teams.length < 2) return null;

  const awayTeam = boxscore.teams[0];
  const homeTeam = boxscore.teams[1];
  const players = boxscore.players || [];

  // Get all unique category names from player stats
  const categories: string[] = [];
  players.forEach((p) => {
    p.statistics?.forEach((s) => {
      if (!categories.includes(s.name)) {
        categories.push(s.name);
      }
    });
  });

  const selectedPlayer = players[selectedTeamIndex];
  const selectedCategory = selectedPlayer?.statistics?.[selectedCategoryIndex];

  return (
    <div className="bg-slate-900 rounded-xl overflow-hidden border border-slate-700">
      {/* Header with Toggle */}
      <div className="px-4 py-3 bg-slate-800/50 border-b border-slate-700">
        <div className="flex items-center justify-between">
          <h2 className="text-white font-semibold">Statistics</h2>
          <div className="relative flex bg-slate-700 rounded-lg p-0.5">
            <div
              className="absolute top-0.5 bottom-0.5 w-[calc(50%-2px)] bg-blue-600 rounded-md transition-all duration-300 ease-out"
              style={{ left: viewMode === 'team' ? '2px' : 'calc(50% + 0px)' }}
            />
            <button
              onClick={() => setViewMode('team')}
              className={`relative z-10 px-3 py-1 text-xs font-medium rounded-md transition-colors duration-200 ${
                viewMode === 'team'
                  ? 'text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Team
            </button>
            <button
              onClick={() => setViewMode('player')}
              className={`relative z-10 px-3 py-1 text-xs font-medium rounded-md transition-colors duration-200 ${
                viewMode === 'player'
                  ? 'text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Player
            </button>
          </div>
        </div>
      </div>

      {/* Team Stats View */}
      {viewMode === 'team' && (
        <div className="p-4">
          <div className="flex items-center justify-between mb-4 px-2">
            <div className="flex items-center gap-2">
              <img src={awayTeam.team.logo} alt={awayTeam.team.abbreviation} className="w-6 h-6" crossOrigin="anonymous" />
              <span className="text-white font-medium text-sm">{awayTeam.team.abbreviation}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-white font-medium text-sm">{homeTeam.team.abbreviation}</span>
              <img src={homeTeam.team.logo} alt={homeTeam.team.abbreviation} className="w-6 h-6" crossOrigin="anonymous" />
            </div>
          </div>
          <div className="space-y-3">
            {awayTeam.statistics?.map((stat, i) => {
              const homeStat = homeTeam.statistics?.[i];
              const awayVal = parseFloat(stat.displayValue) || 0;
              const homeVal = parseFloat(homeStat?.displayValue || '0') || 0;
              const total = awayVal + homeVal || 1;
              const awayPercent = (awayVal / total) * 100;

              return (
                <div key={`${stat.name}-${i}`} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-300">{stat.displayValue}</span>
                    <span className="text-gray-500">{stat.label}</span>
                    <span className="text-gray-300">{homeStat?.displayValue}</span>
                  </div>
                  <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden flex">
                    <div
                      className="h-full transition-all"
                      style={{ width: `${awayPercent}%`, backgroundColor: `#${awayColor}` }}
                    />
                    <div
                      className="h-full transition-all"
                      style={{ width: `${100 - awayPercent}%`, backgroundColor: `#${homeColor}` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Player Stats View */}
      {viewMode === 'player' && players.length > 0 && (
        <div>
          {/* Team & Category Selectors */}
          <div className="p-3 border-b border-slate-700 flex flex-wrap gap-2">
            {/* Team Toggle */}
            <div className="flex bg-slate-700 rounded-lg p-0.5">
              {players.map((p, i) => (
                <button
                  key={p.team.id}
                  onClick={() => {
                    setSelectedTeamIndex(i);
                    setSelectedCategoryIndex(0);
                  }}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200 flex items-center gap-1.5 ${
                    selectedTeamIndex === i
                      ? 'bg-slate-600 text-white shadow-lg scale-105'
                      : 'text-gray-400 hover:text-white hover:bg-slate-600/50'
                  }`}
                >
                  <img src={p.team.logo} alt={p.team.abbreviation} className="w-4 h-4" crossOrigin="anonymous" />
                  {p.team.abbreviation}
                </button>
              ))}
            </div>

            {/* Category Selector */}
            {selectedPlayer?.statistics && selectedPlayer.statistics.length > 0 && (
              <div className="flex bg-slate-700 rounded-lg p-0.5 flex-wrap">
                {selectedPlayer.statistics.map((cat, i) => (
                  <button
                    key={cat.name}
                    onClick={() => setSelectedCategoryIndex(i)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200 ${
                      selectedCategoryIndex === i
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25 scale-105'
                        : 'text-gray-400 hover:text-white hover:bg-slate-600/50'
                    }`}
                  >
                    {categoryDisplayNames[cat.name] || cat.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Player Stats Table */}
          {selectedCategory && selectedCategory.athletes?.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-500 border-b border-slate-700">
                    <th className="text-left py-2 px-3">Player</th>
                    {selectedCategory.labels?.map((label, i) => (
                      <th key={i} className="text-center py-2 px-3">{label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {selectedCategory.athletes.map((athlete) => (
                    <tr key={athlete.athlete.id} className="text-gray-300 border-t border-slate-700/50">
                      <td className="py-2 px-3">
                        <div className="flex items-center gap-2">
                          {athlete.athlete.headshot && (
                            <img
                              src={typeof athlete.athlete.headshot === 'string' ? athlete.athlete.headshot : athlete.athlete.headshot.href}
                              alt={athlete.athlete.displayName}
                              className="w-8 h-8 rounded-full object-cover bg-slate-700"
                              crossOrigin="anonymous"
                            />
                          )}
                          <div>
                            <div className="font-medium text-white">
                              {athlete.athlete.displayName}
                              {athlete.athlete.jersey && <span className="text-gray-400 ml-1">- {athlete.athlete.jersey}</span>}
                            </div>
                            <div className="text-xs text-gray-500">{athlete.athlete.position?.abbreviation}</div>
                          </div>
                        </div>
                      </td>
                      {athlete.stats?.map((stat, i) => (
                        <td key={i} className="text-center py-2 px-3">{stat}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500">
              No player statistics available
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function GameInfoSection({
  gameInfo,
  venue,
  odds,
  winProbability,
  predictor,
  awayTeam,
  homeTeam,
  awayColor,
  homeColor,
}: {
  gameInfo: GameSummary['gameInfo'];
  venue?: { fullName: string; address: { city: string; state: string } };
  odds?: Odds[];
  winProbability?: WinProbability[];
  predictor?: Predictor;
  awayTeam?: { abbreviation: string; displayName: string };
  homeTeam?: { abbreviation: string; displayName: string };
  awayColor?: string;
  homeColor?: string;
}) {
  const actualVenue = gameInfo?.venue || venue;
  const primaryOdds = odds?.[0];

  // Use win probability array (live/post) or predictor data (pre-game)
  const latestWinProb = winProbability?.[winProbability.length - 1];
  const awayWinPct = latestWinProb?.awayWinPercentage ?? (predictor?.awayTeam?.gameProjection ? predictor.awayTeam.gameProjection / 100 : undefined);
  const homeWinPct = latestWinProb?.homeWinPercentage ?? (predictor?.homeTeam?.gameProjection ? predictor.homeTeam.gameProjection / 100 : undefined);

  return (
    <div className="bg-slate-900 rounded-xl overflow-hidden border border-slate-700">
      <div className="px-4 py-3 bg-slate-800/50 border-b border-slate-700">
        <h2 className="text-white font-semibold">Game Information</h2>
      </div>
      <div className="p-4 space-y-3">
        {actualVenue && (
          <div className="flex justify-between">
            <span className="text-gray-500">Stadium</span>
            <span className="text-gray-300">{actualVenue.fullName}</span>
          </div>
        )}
        {actualVenue?.address && (
          <div className="flex justify-between">
            <span className="text-gray-500">Location</span>
            <span className="text-gray-300">{actualVenue.address.city}, {actualVenue.address.state}</span>
          </div>
        )}
        {gameInfo?.attendance && (
          <div className="flex justify-between">
            <span className="text-gray-500">Attendance</span>
            <span className="text-gray-300">{gameInfo.attendance.toLocaleString()}</span>
          </div>
        )}
        {gameInfo?.weather && (
          <div className="flex justify-between">
            <span className="text-gray-500">Weather</span>
            <span className="text-gray-300">{gameInfo.weather.displayValue}</span>
          </div>
        )}
      </div>

      {/* Win Probability */}
      {awayWinPct !== undefined && homeWinPct !== undefined && awayTeam && homeTeam && (
        <div className="border-t border-slate-700">
          <div className="px-4 py-3 bg-slate-800/30">
            <h3 className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-3">Win Probability</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-300 font-medium">{awayTeam.abbreviation}</span>
                <span className="text-white font-bold">{(awayWinPct * 100).toFixed(1)}%</span>
              </div>
              <div className="h-3 bg-slate-700 rounded-full overflow-hidden flex">
                <div
                  className="h-full transition-all duration-500"
                  style={{
                    width: `${awayWinPct * 100}%`,
                    backgroundColor: `#${awayColor || '3b82f6'}`
                  }}
                />
                <div
                  className="h-full transition-all duration-500"
                  style={{
                    width: `${homeWinPct * 100}%`,
                    backgroundColor: `#${homeColor || 'ef4444'}`
                  }}
                />
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-300 font-medium">{homeTeam.abbreviation}</span>
                <span className="text-white font-bold">{(homeWinPct * 100).toFixed(1)}%</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Betting Odds */}
      {primaryOdds && (
        <div className="border-t border-slate-700">
          <div className="px-4 py-3 bg-slate-800/30">
            <h3 className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-3">Betting Odds</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500">Spread</span>
                <span className="text-gray-300">{primaryOdds.details}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Over/Under</span>
                <span className="text-gray-300">{primaryOdds.overUnder}</span>
              </div>
              {primaryOdds.awayTeamOdds?.moneyLine !== undefined && awayTeam && (
                <div className="flex justify-between">
                  <span className="text-gray-500">{awayTeam.abbreviation} ML</span>
                  <span className={`font-medium ${primaryOdds.awayTeamOdds.favorite ? 'text-green-400' : 'text-gray-300'}`}>
                    {primaryOdds.awayTeamOdds.moneyLine > 0 ? '+' : ''}{primaryOdds.awayTeamOdds.moneyLine}
                  </span>
                </div>
              )}
              {primaryOdds.homeTeamOdds?.moneyLine !== undefined && homeTeam && (
                <div className="flex justify-between">
                  <span className="text-gray-500">{homeTeam.abbreviation} ML</span>
                  <span className={`font-medium ${primaryOdds.homeTeamOdds.favorite ? 'text-green-400' : 'text-gray-300'}`}>
                    {primaryOdds.homeTeamOdds.moneyLine > 0 ? '+' : ''}{primaryOdds.homeTeamOdds.moneyLine}
                  </span>
                </div>
              )}
              {primaryOdds.provider?.name && (
                <div className="pt-2 border-t border-slate-700/50">
                  <span className="text-gray-600 text-xs">via {primaryOdds.provider.name}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function GameDetail() {
  const { gameId } = useParams<{ gameId: string }>();
  const location = useLocation();
  const { league } = useLeague();
  const notes = (location.state as { notes?: Note[] })?.notes || [];
  const [data, setData] = useState<GameSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!gameId) return;

    setLoading(true);
    setError(null);

    try {
      const summary = await fetchGameSummary(league, gameId);
      setData(summary);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load game');
    } finally {
      setLoading(false);
    }
  }, [gameId, league]);

  useEffect(() => {
    fetchData();

    // Auto-refresh every 30 seconds for live games
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  if (loading && !data) {
    return <LoadingState />;
  }

  if (error && !data) {
    return <ErrorState error={error} onRetry={fetchData} />;
  }

  if (!data) {
    return <ErrorState error="No game data available" onRetry={fetchData} />;
  }

  const competition = data.header.competitions[0];
  const awayTeam = competition.competitors.find((c) => c.homeAway === 'away')!;
  const homeTeam = competition.competitors.find((c) => c.homeAway === 'home')!;

  // Build team logos and colors map from boxscore (header doesn't include logos/colors)
  const teamLogos: Record<string, string> = {};
  const teamColors: Record<string, string> = {};
  const teamAltColors: Record<string, string> = {};
  data.boxscore?.teams?.forEach((t) => {
    if (t.team.logo) {
      teamLogos[t.team.id] = t.team.logo;
    }
    if (t.team.color) {
      teamColors[t.team.id] = t.team.color;
    }
    if (t.team.alternateColor) {
      teamAltColors[t.team.id] = t.team.alternateColor;
    }
  });

  const awayColor = teamColors[awayTeam.team.id] || '1a1a2e';
  const homeColor = teamColors[homeTeam.team.id] || '1a1a2e';
  const awayAltColor = teamAltColors[awayTeam.team.id] || awayColor;
  const homeAltColor = teamAltColors[homeTeam.team.id] || homeColor;

  const awayLogo = teamLogos[awayTeam.team.id] || '';
  const homeLogo = teamLogos[homeTeam.team.id] || '';

  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{
        background: `linear-gradient(135deg, #${awayColor}15 0%, transparent 40%, transparent 60%, #${homeColor}15 100%),
                     radial-gradient(ellipse at top left, #${awayColor}20 0%, transparent 50%),
                     radial-gradient(ellipse at bottom right, #${homeColor}20 0%, transparent 50%),
                     linear-gradient(to bottom, #0f172a, #1e293b)`
      }}
    >
      {/* Background Logo & Chant Decorations */}
      {awayLogo && (
        <img
          src={awayLogo}
          alt=""
          aria-hidden="true"
          className="fixed top-20 -left-20 w-96 h-96 object-contain opacity-[0.03] pointer-events-none select-none blur-sm"
          crossOrigin="anonymous"
        />
      )}
      {/* Away team chant (NFL) or mascot (CFB) */}
      {(() => {
        const awayText = league === 'nfl'
          ? (teamChants as Record<string, string>)[awayTeam.team.abbreviation]
          : awayTeam.team.name;
        return awayText ? (
          <div
            aria-hidden="true"
            className="fixed top-16 left-4 pointer-events-none select-none opacity-[0.18] tracking-[0.25em] uppercase"
            style={{
              writingMode: 'vertical-rl',
              textOrientation: 'mixed',
              transform: 'rotate(180deg)',
              color: `#${awayAltColor}`,
              fontFamily: '"Orbitron", sans-serif',
              fontWeight: 700,
              fontSize: '7rem',
            }}
          >
            {awayText}
          </div>
        ) : null;
      })()}
      {homeLogo && (
        <img
          src={homeLogo}
          alt=""
          aria-hidden="true"
          className="fixed bottom-20 -right-20 w-96 h-96 object-contain opacity-[0.03] pointer-events-none select-none blur-sm"
          crossOrigin="anonymous"
        />
      )}
      {/* Home team chant (NFL) or mascot (CFB) */}
      {(() => {
        const homeText = league === 'nfl'
          ? (teamChants as Record<string, string>)[homeTeam.team.abbreviation]
          : homeTeam.team.name;
        return homeText ? (
          <div
            aria-hidden="true"
            className="fixed bottom-16 right-4 pointer-events-none select-none opacity-[0.18] tracking-[0.25em] uppercase"
            style={{
              writingMode: 'vertical-rl',
              textOrientation: 'mixed',
              color: `#${homeAltColor}`,
              fontFamily: '"Orbitron", sans-serif',
              fontWeight: 700,
              fontSize: '7rem',
            }}
          >
            {homeText}
          </div>
        ) : null;
      })()}

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
              <span className="text-sm font-medium">Back to Scoreboard</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Score Header */}
        <GameScoreHeader
          awayTeam={awayTeam}
          homeTeam={homeTeam}
          status={competition.status}
          teamLogos={teamLogos}
          notes={notes}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Statistics Panel */}
            {data.boxscore && (
              <StatsPanel boxscore={data.boxscore} awayColor={awayColor} homeColor={homeColor} />
            )}

            {/* Scoring Plays */}
            {data.scoringPlays && data.scoringPlays.length > 0 && (
              <ScoringPlays plays={data.scoringPlays} awayTeamId={awayTeam.team.id} />
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <GameInfoSection
              gameInfo={data.gameInfo}
              venue={competition.venue}
              odds={data.pickcenter}
              winProbability={data.winprobability}
              predictor={data.predictor}
              awayTeam={awayTeam.team}
              homeTeam={homeTeam.team}
              awayColor={awayColor}
              homeColor={homeColor}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
