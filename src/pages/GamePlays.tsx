import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useLeague } from '../contexts/LeagueContext';
import { usePlayByPlay } from '../hooks/usePlayByPlay';
import { getPlayCategory } from '../types/plays';

// Touchdown slide animation component
function TouchdownSlides({
  teamCity,
  teamName,
  teamColor,
  teamLogo,
  playerName,
  playerPosition,
  playerHeadshot,
}: {
  teamCity: string;
  teamName: string;
  teamColor: string;
  teamLogo: string;
  playerName?: string;
  playerPosition?: string;
  playerHeadshot?: string;
}) {
  const [slide, setSlide] = useState(0);

  useEffect(() => {
    const timings = [800, 800, 1200, 2000]; // Duration for each slide
    if (slide < 3) {
      const timer = setTimeout(() => setSlide(slide + 1), timings[slide]);
      return () => clearTimeout(timer);
    }
  }, [slide]);

  return (
    <div
      className="mb-3 py-4 px-6 rounded-xl overflow-hidden relative"
      style={{ backgroundColor: `#${teamColor}` }}
    >
      {/* Animated background stripes */}
      <div className="absolute inset-0 opacity-20">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="absolute h-full w-8 bg-white/30 -skew-x-12 animate-pulse"
            style={{
              left: `${i * 25}%`,
              animationDelay: `${i * 0.1}s`,
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 flex items-center justify-center min-h-[80px]">
        {slide === 0 && (
          <span className="text-white font-black text-3xl tracking-widest uppercase animate-pulse drop-shadow-lg">
            {teamCity}
          </span>
        )}
        {slide === 1 && (
          <div className="flex items-center gap-4">
            {teamLogo && (
              <img
                src={teamLogo}
                alt={teamName}
                className="w-14 h-14 object-contain animate-bounce"
                crossOrigin="anonymous"
              />
            )}
            <span className="text-white font-black text-4xl tracking-widest uppercase drop-shadow-lg">
              {teamName}
            </span>
            {teamLogo && (
              <img
                src={teamLogo}
                alt={teamName}
                className="w-14 h-14 object-contain animate-bounce"
                crossOrigin="anonymous"
              />
            )}
          </div>
        )}
        {slide === 2 && (
          <span className="text-white font-black text-4xl tracking-[0.3em] uppercase animate-pulse drop-shadow-lg">
            TOUCHDOWN
          </span>
        )}
        {slide === 3 && playerName && (
          <div className="flex items-center gap-4">
            {playerHeadshot ? (
              <img
                src={playerHeadshot}
                alt={playerName}
                className="w-16 h-16 rounded-full object-cover border-4 border-white/50"
                crossOrigin="anonymous"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center border-4 border-white/50">
                <span className="text-white text-2xl font-bold">
                  {playerName.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
            )}
            <div className="flex flex-col">
              <span className="text-white font-black text-2xl drop-shadow-lg">
                {playerName}
              </span>
              {playerPosition && (
                <span className="text-white/80 text-sm font-bold tracking-wider">
                  {playerPosition}
                </span>
              )}
            </div>
          </div>
        )}
        {slide === 3 && !playerName && (
          <span className="text-white font-black text-3xl tracking-widest uppercase drop-shadow-lg">
            TOUCHDOWN!
          </span>
        )}
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-400 text-sm">Loading play-by-play data...</p>
      </div>
    </div>
  );
}

function ErrorState({ error, onRetry }: { error: string; onRetry: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-4 max-w-md text-center">
        <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center">
          <span className="text-3xl">!</span>
        </div>
        <h2 className="text-white text-xl font-bold">Failed to Load Plays</h2>
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

function NoPlaysState({ gameId }: { gameId: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-4 max-w-md text-center">
        <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center">
          <span className="text-3xl">?</span>
        </div>
        <h2 className="text-white text-xl font-bold">No Plays Available</h2>
        <p className="text-gray-400 text-sm">
          Play-by-play data is not available for this game yet. It may be a scheduled game that hasn't started.
        </p>
        <Link
          to={`/game/${gameId}`}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white text-sm font-medium transition-colors"
        >
          View Game Summary
        </Link>
      </div>
    </div>
  );
}

// Play type icon based on category
function PlayIcon({ type, typeId }: { type: string; typeId: string }) {
  const category = getPlayCategory(typeId, type);

  switch (category) {
    case 'rush':
      return <span className="text-lg">🏃</span>;
    case 'pass':
      return <span className="text-lg">🏈</span>;
    case 'kick':
      return <span className="text-lg">🥅</span>;
    case 'punt':
      return <span className="text-lg">👟</span>;
    case 'kickoff':
      return <span className="text-lg">⚡</span>;
    case 'penalty':
      return <span className="text-lg">🚩</span>;
    case 'timeout':
      return <span className="text-lg">⏱️</span>;
    case 'end_period':
      return <span className="text-lg">🔔</span>;
    default:
      return <span className="text-lg">📋</span>;
  }
}

// Helper to extract player name from touchdown play description
function extractScorerFromDescription(description: string, playType: string): string | undefined {
  const lowerDesc = description.toLowerCase();
  const lowerType = playType.toLowerCase();

  // For passing touchdowns, look for "to X.Name" pattern
  if (lowerType.includes('pass') || lowerDesc.includes('pass')) {
    const passMatch = description.match(/(?:pass(?:ing)?|to)\s+([A-Z]\.?\s?[A-Za-z'-]+)/i);
    if (passMatch) {
      // Get the receiver (last name mentioned before touchdown/yards)
      const toMatch = description.match(/to\s+([A-Z]\.?\s?[A-Za-z'-]+)/i);
      if (toMatch) return toMatch[1];
    }
  }

  // For rushing touchdowns, the first name is usually the rusher
  if (lowerType.includes('rush') || lowerDesc.includes('rush') || lowerDesc.includes('yard run')) {
    const rushMatch = description.match(/^([A-Z]\.?\s?[A-Za-z'-]+)/i);
    if (rushMatch) return rushMatch[1];
  }

  // For receiving touchdowns
  if (lowerType.includes('receiv')) {
    const recMatch = description.match(/([A-Z]\.?\s?[A-Za-z'-]+)\s+(?:reception|catch|receiving)/i);
    if (recMatch) return recMatch[1];
  }

  // Generic: try to find first name pattern
  const genericMatch = description.match(/^([A-Z]\.?\s?[A-Za-z'-]+)/);
  if (genericMatch) return genericMatch[1];

  return undefined;
}

// Broadcast-style scorebug (ESPN/Fox style)
interface ScorebugProps {
  homeTeam: {
    abbreviation: string;
    displayName: string;
    color: string;
    logo: string;
  };
  awayTeam: {
    abbreviation: string;
    displayName: string;
    color: string;
    logo: string;
  };
  homeScore: number;
  awayScore: number;
  quarter: number;
  clock: string;
  down?: number;
  distance?: number;
  yardLine?: number;
  possession?: 'home' | 'away';
  isLive?: boolean;
  isTouchdown?: boolean;
  scoringTeam?: 'home' | 'away';
  scoringPlayer?: {
    name: string;
    position?: string;
    headshot?: string;
  };
}

function BroadcastScorebug({
  homeTeam,
  awayTeam,
  homeScore,
  awayScore,
  quarter,
  clock,
  down,
  distance,
  yardLine,
  possession,
  isLive,
  isTouchdown,
  scoringTeam,
  scoringPlayer,
}: ScorebugProps) {
  const quarterDisplay = quarter <= 4 ? quarter : `OT`;
  const scoringTeamData = scoringTeam === 'home' ? homeTeam : awayTeam;

  // Parse team name into city and nickname (e.g., "Los Angeles Rams" -> "Los Angeles", "Rams")
  const parseTeamName = (displayName: string) => {
    const parts = displayName.split(' ');
    if (parts.length >= 2) {
      // Most teams: last word is the nickname
      const nickname = parts[parts.length - 1];
      const city = parts.slice(0, -1).join(' ');
      return { city, nickname };
    }
    return { city: displayName, nickname: displayName };
  };

  const { city: scoringCity, nickname: scoringNickname } = parseTeamName(scoringTeamData.displayName);

  return (
    <div className="w-full relative">
      {/* Touchdown slide animation */}
      {isTouchdown && (
        <TouchdownSlides
          teamCity={scoringCity}
          teamName={scoringNickname}
          teamColor={scoringTeamData.color}
          teamLogo={scoringTeamData.logo}
          playerName={scoringPlayer?.name}
          playerPosition={scoringPlayer?.position}
          playerHeadshot={scoringPlayer?.headshot}
        />
      )}

      {/* Main scorebug - full width ESPN style */}
      <div
        className="bg-black rounded-xl overflow-hidden shadow-2xl transition-all duration-300"
        style={isTouchdown ? { boxShadow: `0 0 0 4px #${scoringTeamData.color}, 0 25px 50px -12px rgba(0, 0, 0, 0.25)` } : {}}
      >
        {/* Teams and scores */}
        <div className="flex">
          {/* Away team */}
          <div className="flex-1 flex items-center">
            <div
              className="w-2 self-stretch flex-shrink-0"
              style={{ backgroundColor: `#${awayTeam.color}` }}
            />
            <div className="flex-1 bg-zinc-900 px-4 py-4 flex items-center gap-3">
              {awayTeam.logo && (
                <img
                  src={awayTeam.logo}
                  alt={awayTeam.abbreviation}
                  className="w-10 h-10 object-contain"
                  crossOrigin="anonymous"
                />
              )}
              <span className="text-white font-bold text-lg tracking-wide">
                {awayTeam.abbreviation}
              </span>
              {possession === 'away' && (
                <span className="text-yellow-400 text-sm">◀</span>
              )}
            </div>
            <div className="bg-zinc-800 px-6 py-4 min-w-[80px] text-center self-stretch flex items-center justify-center">
              <span className="text-white font-bold text-3xl tabular-nums">{awayScore}</span>
            </div>
          </div>

          {/* Game info panel - center */}
          <div className="bg-zinc-900 flex flex-col items-center justify-center px-6 border-x border-zinc-800">
            <div className="flex items-center gap-1">
              {isLive && (
                <span className="relative flex h-2 w-2 mr-1">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
              )}
              <span className="text-gray-400 text-sm font-medium">
                {quarter <= 4 ? `${quarterDisplay}${quarter === 1 ? 'ST' : quarter === 2 ? 'ND' : quarter === 3 ? 'RD' : 'TH'}` : quarterDisplay}
              </span>
            </div>
            <span className="text-white font-mono text-2xl font-bold">{clock || '0:00'}</span>
          </div>

          {/* Home team */}
          <div className="flex-1 flex items-center flex-row-reverse">
            <div
              className="w-2 self-stretch flex-shrink-0"
              style={{ backgroundColor: `#${homeTeam.color}` }}
            />
            <div className="flex-1 bg-zinc-900 px-4 py-4 flex items-center justify-end gap-3">
              {possession === 'home' && (
                <span className="text-yellow-400 text-sm">▶</span>
              )}
              <span className="text-white font-bold text-lg tracking-wide">
                {homeTeam.abbreviation}
              </span>
              {homeTeam.logo && (
                <img
                  src={homeTeam.logo}
                  alt={homeTeam.abbreviation}
                  className="w-10 h-10 object-contain"
                  crossOrigin="anonymous"
                />
              )}
            </div>
            <div className="bg-zinc-800 px-6 py-4 min-w-[80px] text-center self-stretch flex items-center justify-center">
              <span className="text-white font-bold text-3xl tabular-nums">{homeScore}</span>
            </div>
          </div>
        </div>

        {/* Down and distance bar */}
        {down && down > 0 && (
          <div className="bg-zinc-800 px-4 py-2 flex items-center justify-center gap-3 border-t border-zinc-700">
            <span className="text-white font-bold text-sm">
              {down === 1 ? '1ST' : down === 2 ? '2ND' : down === 3 ? '3RD' : '4TH'} & {distance}
            </span>
            {yardLine !== undefined && (
              <span className="text-gray-400 text-sm font-medium">
                {yardLine > 50
                  ? `${possession === 'home' ? awayTeam.abbreviation : homeTeam.abbreviation} ${100 - yardLine}`
                  : yardLine === 50
                    ? 'MIDFIELD'
                    : `${possession === 'home' ? homeTeam.abbreviation : awayTeam.abbreviation} ${yardLine}`
                }
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export function GamePlays() {
  const { gameId } = useParams<{ gameId: string }>();
  const { league } = useLeague();
  const { plays, homeTeam, awayTeam, loading, error, isLive, refresh } = usePlayByPlay(
    league,
    gameId || ''
  );

  const [currentPlayIndex, setCurrentPlayIndex] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState<1 | 2 | 4>(1);
  const [selectedQuarter, setSelectedQuarter] = useState<number | 'all'>('all');

  // Get unique quarters from plays
  const quarters = [...new Set(plays.map((p) => p.quarter))].sort((a, b) => a - b);

  // Filter plays by quarter
  const filteredPlays = selectedQuarter === 'all'
    ? plays
    : plays.filter((p) => p.quarter === selectedQuarter);

  // Current play for scorebug
  const currentPlay = currentPlayIndex !== null ? plays[currentPlayIndex] : plays[plays.length - 1];

  // Determine possession
  const getPossession = useCallback(() => {
    if (!currentPlay || !homeTeam || !awayTeam) return undefined;
    if (currentPlay.teamId === homeTeam.id || currentPlay.teamAbbreviation === homeTeam.abbreviation) {
      return 'home' as const;
    }
    if (currentPlay.teamId === awayTeam.id || currentPlay.teamAbbreviation === awayTeam.abbreviation) {
      return 'away' as const;
    }
    return undefined;
  }, [currentPlay, homeTeam, awayTeam]);

  // Auto-advance through plays
  useEffect(() => {
    if (!isPlaying || currentPlayIndex === null) return;

    const delay = 2000 / speed;
    const timer = setTimeout(() => {
      if (currentPlayIndex < plays.length - 1) {
        setCurrentPlayIndex((prev) => (prev !== null ? prev + 1 : 0));
      } else {
        setIsPlaying(false);
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [isPlaying, currentPlayIndex, plays.length, speed]);


  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        if (currentPlayIndex === null) {
          setCurrentPlayIndex(0);
          setIsPlaying(true);
        } else {
          setIsPlaying((prev) => !prev);
        }
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        setIsPlaying(false);
        setCurrentPlayIndex((prev) => {
          if (prev === null) return 0;
          return Math.min(plays.length - 1, prev + 1);
        });
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        setIsPlaying(false);
        setCurrentPlayIndex((prev) => {
          if (prev === null) return plays.length - 1;
          return Math.max(0, prev - 1);
        });
      } else if (e.code === 'Escape') {
        setIsPlaying(false);
        setCurrentPlayIndex(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [plays.length, currentPlayIndex]);

  // Get team color
  const getTeamColor = useCallback((teamId?: string, teamAbbr?: string) => {
    if (!homeTeam || !awayTeam) return '6b7280';
    if (teamId === homeTeam.id || teamAbbr === homeTeam.abbreviation) {
      return homeTeam.color;
    }
    if (teamId === awayTeam.id || teamAbbr === awayTeam.abbreviation) {
      return awayTeam.color;
    }
    return '6b7280';
  }, [homeTeam, awayTeam]);

  if (loading && plays.length === 0) {
    return <LoadingState />;
  }

  if (error && plays.length === 0) {
    return <ErrorState error={error.message} onRetry={refresh} />;
  }

  if (!homeTeam || !awayTeam) {
    return <ErrorState error="Could not load team information" onRetry={refresh} />;
  }

  if (plays.length === 0) {
    return <NoPlaysState gameId={gameId || ''} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
      {/* Header */}
      <header className="bg-slate-900/80 backdrop-blur-sm border-b border-slate-700 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link
              to={`/game/${gameId}`}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="text-sm font-medium">Back</span>
            </Link>

            <h1 className="text-white font-semibold">Play-by-Play</h1>

            <div className="text-gray-400 text-xs">
              {plays.length} plays
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Broadcast Scorebug */}
        <BroadcastScorebug
          homeTeam={homeTeam}
          awayTeam={awayTeam}
          homeScore={currentPlay?.homeScore ?? 0}
          awayScore={currentPlay?.awayScore ?? 0}
          quarter={currentPlay?.quarter ?? 1}
          clock={currentPlay?.clock ?? ''}
          down={currentPlay?.startDown}
          distance={currentPlay?.startDistance}
          yardLine={currentPlay?.startYardLine}
          possession={getPossession()}
          isLive={isLive && currentPlayIndex === null}
          isTouchdown={currentPlay?.scoreValue === 6}
          scoringTeam={getPossession()}
          scoringPlayer={currentPlay?.scoreValue === 6 ? (
            // Use scorer data from hook (fetched from API), or fallback to description extraction
            currentPlay.scorer || (() => {
              const extractedName = extractScorerFromDescription(currentPlay.description, currentPlay.type);
              return extractedName ? { name: extractedName } : undefined;
            })()
          ) : undefined}
        />

        {/* Playback Controls */}
        <div className="bg-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between gap-4">
            {/* Play controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setIsPlaying(false);
                  setCurrentPlayIndex((prev) => (prev === null ? plays.length - 1 : Math.max(0, prev - 1)));
                }}
                className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white transition-colors"
                title="Previous play (←)"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <button
                onClick={() => {
                  if (currentPlayIndex === null) {
                    setCurrentPlayIndex(0);
                    setIsPlaying(true);
                  } else {
                    setIsPlaying((prev) => !prev);
                  }
                }}
                className="p-3 rounded-full bg-blue-600 hover:bg-blue-500 text-white transition-colors"
                title="Play/Pause (Space)"
              >
                {isPlaying ? (
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                )}
              </button>

              <button
                onClick={() => {
                  setIsPlaying(false);
                  setCurrentPlayIndex((prev) => (prev === null ? 0 : Math.min(plays.length - 1, prev + 1)));
                }}
                className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white transition-colors"
                title="Next play (→)"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>

              <button
                onClick={() => {
                  setIsPlaying(false);
                  setCurrentPlayIndex(null);
                }}
                className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white transition-colors ml-2"
                title="Reset to end (Esc)"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>

            {/* Progress */}
            <div className="flex-1 mx-4">
              <div className="flex items-center gap-2">
                <span className="text-gray-400 text-xs whitespace-nowrap">
                  {currentPlayIndex !== null ? currentPlayIndex + 1 : plays.length} / {plays.length}
                </span>
                <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 transition-all duration-300"
                    style={{
                      width: `${((currentPlayIndex !== null ? currentPlayIndex + 1 : plays.length) / plays.length) * 100}%`
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Speed control */}
            <div className="flex items-center gap-1">
              {([1, 2, 4] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setSpeed(s)}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                    speed === s
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-700 text-gray-400 hover:bg-slate-600'
                  }`}
                >
                  {s}x
                </button>
              ))}
            </div>
          </div>

          <p className="text-gray-500 text-xs mt-3 text-center">
            Space: Play/Pause • ← →: Step • Esc: Reset
          </p>
        </div>

        {/* Quarter Filter */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => setSelectedQuarter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
              selectedQuarter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-800 text-gray-400 hover:bg-slate-700'
            }`}
          >
            All Plays
          </button>
          {quarters.map((q) => (
            <button
              key={q}
              onClick={() => setSelectedQuarter(q)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                selectedQuarter === q
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 text-gray-400 hover:bg-slate-700'
              }`}
            >
              {q <= 4 ? `Q${q}` : `OT${q - 4}`}
            </button>
          ))}
        </div>

        {/* Play List - shows plays in reverse order (most recent at top) */}
        <div className="space-y-2">
          {[...filteredPlays].reverse().map((play) => {
            const globalIndex = plays.indexOf(play);
            const teamColor = getTeamColor(play.teamId, play.teamAbbreviation);
            const isScoring = play.isScoring;
            const isTurnover = play.type.toLowerCase().includes('interception') ||
                              play.type.toLowerCase().includes('fumble');
            const isPenalty = play.type.toLowerCase().includes('penalty');
            const isCurrentPlay = currentPlayIndex === globalIndex;

            // Only show plays up to current point (when in playback mode)
            if (currentPlayIndex !== null && globalIndex > currentPlayIndex) {
              return null;
            }

            return (
              <div
                key={play.id}
                onClick={() => {
                  setIsPlaying(false);
                  setCurrentPlayIndex(globalIndex);
                }}
                className={`
                  p-4 rounded-xl cursor-pointer transition-all
                  ${isCurrentPlay ? 'bg-blue-900/50 ring-2 ring-blue-500' : 'bg-slate-800/50 hover:bg-slate-800'}
                  ${isScoring && !isCurrentPlay ? 'border-l-4 border-yellow-500' : ''}
                  ${isTurnover && !isCurrentPlay ? 'border-l-4 border-red-500' : ''}
                  ${isPenalty && !isCurrentPlay ? 'border-l-4 border-orange-500' : ''}
                `}
              >
                <div className="flex items-start gap-3">
                  {/* Team indicator */}
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `#${teamColor}20` }}
                  >
                    <PlayIcon type={play.type} typeId={play.typeId} />
                  </div>

                  {/* Play content */}
                  <div className="flex-1 min-w-0">
                    {/* Header row */}
                    <div className="flex items-center gap-2 mb-1">
                      {play.teamAbbreviation && (
                        <span
                          className="text-xs font-bold px-2 py-0.5 rounded"
                          style={{
                            backgroundColor: `#${teamColor}30`,
                            color: `#${teamColor}`
                          }}
                        >
                          {play.teamAbbreviation}
                        </span>
                      )}
                      <span className="text-gray-500 text-xs">
                        {play.clock} - {play.quarter <= 4 ? `Q${play.quarter}` : `OT${play.quarter - 4}`}
                      </span>
                      {play.startDown > 0 && (
                        <span className="text-gray-500 text-xs">
                          • {play.startDown}&{play.startDistance}
                        </span>
                      )}
                    </div>

                    {/* Description */}
                    <p className="text-white text-sm leading-relaxed">
                      {play.description}
                    </p>

                    {/* Yards gained badge */}
                    {play.yardsGained !== 0 && (
                      <div className="mt-2 flex items-center gap-2 flex-wrap">
                        <span
                          className={`text-xs font-bold px-2 py-0.5 rounded ${
                            play.yardsGained > 0
                              ? 'bg-green-500/20 text-green-400'
                              : 'bg-red-500/20 text-red-400'
                          }`}
                        >
                          {play.yardsGained > 0 ? '+' : ''}{play.yardsGained} YDS
                        </span>
                        {isScoring && (
                          <span className="text-xs font-bold px-2 py-0.5 rounded bg-yellow-500/20 text-yellow-400">
                            {play.scoreValue === 6 ? 'TOUCHDOWN' :
                             play.scoreValue === 3 ? 'FIELD GOAL' :
                             play.scoreValue === 2 ? 'SAFETY' :
                             play.scoreValue === 1 ? 'EXTRA POINT' : `+${play.scoreValue}`}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Score after play */}
                    {isScoring && (
                      <div className="mt-2 text-xs text-gray-400">
                        Score: {awayTeam.abbreviation} {play.awayScore} - {homeTeam.abbreviation} {play.homeScore}
                      </div>
                    )}
                  </div>

                  {/* Play number */}
                  <div className="text-gray-600 text-xs">
                    #{globalIndex + 1}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <footer className="mt-8 pt-6 border-t border-slate-800">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-gray-500 text-xs">
            <p>Play-by-play data provided by ESPN. {isLive && 'Auto-refreshes every 30 seconds.'}</p>
            <p>{plays.length} total plays</p>
          </div>
        </footer>
      </main>
    </div>
  );
}
