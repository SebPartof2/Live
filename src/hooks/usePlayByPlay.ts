import { useState, useEffect, useCallback, useMemo } from 'react';
import { fetchPlayByPlay, fetchGameSummary } from '../services/espnApi';
import type { League } from '../services/espnApi';
import type { GameSummary } from '../types/espn';
import type {
  PlayByPlayResponse,
  PlayByPlayItem,
  NormalizedPlay,
  ResolvedAthlete,
} from '../types/plays';

export interface UsePlayByPlayResult {
  plays: NormalizedPlay[];
  gameSummary: GameSummary | null;
  homeTeam: TeamInfo | null;
  awayTeam: TeamInfo | null;
  loading: boolean;
  error: Error | null;
  isLive: boolean;
  refresh: () => void;
}

interface TeamInfo {
  id: string;
  displayName: string;
  abbreviation: string;
  color: string;
  alternateColor: string;
  logo: string;
}

// Convert ESPN $ref URL to use our proxy (to avoid CORS)
function toProxyUrl(refUrl: string): string {
  // In production, use Vercel rewrite proxy
  // In development, try direct fetch (may fail due to CORS)
  if (import.meta.env.PROD) {
    // https://sports.core.api.espn.com/v2/... -> /api/espn/v2/...
    return refUrl.replace('https://sports.core.api.espn.com', '/api/espn');
  }
  return refUrl;
}

// Fetch athlete data from ESPN API $ref URL
async function fetchAthlete(refUrl: string): Promise<ResolvedAthlete | null> {
  try {
    const response = await fetch(toProxyUrl(refUrl));
    if (!response.ok) return null;
    return response.json();
  } catch {
    return null;
  }
}

// Fetch position data from ESPN API $ref URL
async function fetchPosition(refUrl: string): Promise<{ abbreviation: string } | null> {
  try {
    const response = await fetch(toProxyUrl(refUrl));
    if (!response.ok) return null;
    return response.json();
  } catch {
    return null;
  }
}

function normalizePlay(
  play: PlayByPlayItem,
  _homeTeamId: string,
  awayTeamId: string,
  scorerData?: { name: string; position?: string; headshot?: string }
): NormalizedPlay {
  // Determine which team has possession based on start position
  const possessingTeamId = play.start?.team?.id || play.team?.id || '';

  // Convert yard lines to absolute position (0-100 from home end zone)
  // The API gives yardLine from the perspective of the possessing team
  let startYardLine = play.start?.yardLine ?? 0;
  let endYardLine = play.end?.yardLine ?? startYardLine;

  // Normalize to absolute field position
  // If away team possesses, flip the coordinates
  if (possessingTeamId === awayTeamId) {
    startYardLine = 100 - startYardLine;
    endYardLine = 100 - endYardLine;
  }

  // Calculate yards gained
  const yardsGained = play.statYardage ?? (endYardLine - startYardLine);

  return {
    id: play.id,
    sequenceNumber: play.sequenceNumber,
    type: play.type?.text || 'Unknown',
    typeId: play.type?.id || '0',
    description: play.text || '',
    shortDescription: play.shortText || play.text || '',
    quarter: play.period?.number || 1,
    clock: play.clock?.displayValue || '',
    awayScore: play.awayScore,
    homeScore: play.homeScore,
    isScoring: play.scoringPlay,
    scoreValue: play.scoreValue,
    teamId: play.team?.id,
    teamAbbreviation: play.team?.abbreviation,
    startYardLine,
    endYardLine,
    yardsGained,
    startDown: play.start?.down || 0,
    startDistance: play.start?.distance || 0,
    endDown: play.end?.down || 0,
    endDistance: play.end?.distance || 0,
    startTerritory: play.start?.team?.id,
    endTerritory: play.end?.team?.id,
    participants: play.participants || [],
    scorer: scorerData,
  };
}

export function usePlayByPlay(
  league: League,
  gameId: string
): UsePlayByPlayResult {
  const [gameSummary, setGameSummary] = useState<GameSummary | null>(null);
  const [playByPlayData, setPlayByPlayData] = useState<PlayByPlayResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Extract team info from game summary
  const { homeTeam, awayTeam } = useMemo(() => {
    // Use header.competitions to get teams with homeAway info
    const competition = gameSummary?.header?.competitions?.[0];
    if (!competition?.competitors) {
      return { homeTeam: null, awayTeam: null };
    }

    const homeCompetitor = competition.competitors.find((c) => c.homeAway === 'home');
    const awayCompetitor = competition.competitors.find((c) => c.homeAway === 'away');

    // Get additional info from boxscore if available
    const boxscoreTeams = gameSummary?.boxscore?.teams || [];

    const getTeamInfo = (competitor: typeof homeCompetitor, fallbackIndex: number) => {
      if (!competitor) return null;
      // Try to find matching team in boxscore for color info
      const boxscoreTeam = boxscoreTeams.find((t) => t.team.id === competitor.team.id) || boxscoreTeams[fallbackIndex];
      const team = boxscoreTeam?.team || competitor.team;
      return {
        id: competitor.team.id,
        displayName: competitor.team.displayName || '',
        abbreviation: competitor.team.abbreviation || '',
        color: team.color || '1a1a2e',
        alternateColor: team.alternateColor || team.color || '1a1a2e',
        logo: team.logo || '',
      };
    };

    return {
      homeTeam: getTeamInfo(homeCompetitor, 1),
      awayTeam: getTeamInfo(awayCompetitor, 0),
    };
  }, [gameSummary]);

  // Store scorer data separately (fetched asynchronously)
  const [scorerDataMap, setScorerDataMap] = useState<Map<string, { name: string; position?: string; headshot?: string }>>(new Map());

  // Fetch scorer data for touchdown plays
  useEffect(() => {
    if (!playByPlayData?.items) return;

    const fetchScorerData = async () => {
      const touchdownPlays = playByPlayData.items.filter(play => play.scoreValue === 6);
      const newScorerData = new Map<string, { name: string; position?: string; headshot?: string }>();

      await Promise.all(
        touchdownPlays.map(async (play) => {
          // Find the scorer participant
          const scorerParticipant = play.participants?.find(p => p.type === 'scorer');
          if (!scorerParticipant?.athlete?.$ref) return;

          // Fetch athlete data
          const athlete = await fetchAthlete(scorerParticipant.athlete.$ref);
          if (!athlete) return;

          // Fetch position data if available
          let positionAbbr: string | undefined;
          if (scorerParticipant.position?.$ref) {
            const position = await fetchPosition(scorerParticipant.position.$ref);
            positionAbbr = position?.abbreviation;
          }

          newScorerData.set(play.id, {
            name: athlete.displayName,
            position: positionAbbr || athlete.position?.abbreviation,
            headshot: athlete.headshot?.href,
          });
        })
      );

      if (newScorerData.size > 0) {
        setScorerDataMap(prev => {
          const merged = new Map(prev);
          newScorerData.forEach((value, key) => merged.set(key, value));
          return merged;
        });
      }
    };

    fetchScorerData();
  }, [playByPlayData]);

  // Normalize plays for visualization
  const plays = useMemo(() => {
    if (!playByPlayData?.items || !homeTeam || !awayTeam) {
      return [];
    }

    return playByPlayData.items
      .map((play) => normalizePlay(play, homeTeam.id, awayTeam.id, scorerDataMap.get(play.id)))
      .sort((a, b) => a.sequenceNumber - b.sequenceNumber);
  }, [playByPlayData, homeTeam, awayTeam, scorerDataMap]);

  // Determine if game is live
  const isLive = useMemo(() => {
    const status = gameSummary?.header?.competitions?.[0]?.status;
    return status?.type?.state === 'in';
  }, [gameSummary]);

  // Fetch data
  const fetchData = useCallback(async () => {
    if (!gameId) return;

    setLoading(true);
    setError(null);

    try {
      // Fetch both in parallel
      const [summary, pbp] = await Promise.all([
        fetchGameSummary(league, gameId),
        fetchPlayByPlay(league, gameId),
      ]);

      setGameSummary(summary);
      setPlayByPlayData(pbp);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load play-by-play data'));
    } finally {
      setLoading(false);
    }
  }, [league, gameId]);

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Auto-refresh for live games
  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [isLive, fetchData]);

  return {
    plays,
    gameSummary,
    homeTeam,
    awayTeam,
    loading,
    error,
    isLive,
    refresh: fetchData,
  };
}
