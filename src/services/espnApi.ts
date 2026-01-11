import type { ESPNScoreboard, GameSummary, TeamInfo, TeamRoster, NewsResponse, RankingsResponse } from '../types/espn';
import type { PlayByPlayResponse } from '../types/plays';

export type League = 'nfl' | 'college-football';

const BASE_URLS: Record<League, string> = {
  'nfl': 'https://site.api.espn.com/apis/site/v2/sports/football/nfl',
  'college-football': 'https://site.api.espn.com/apis/site/v2/sports/football/college-football',
};

function getBaseUrl(league: League): string {
  return BASE_URLS[league];
}

export async function fetchScoreboard(league: League): Promise<ESPNScoreboard> {
  const response = await fetch(`${getBaseUrl(league)}/scoreboard`);
  if (!response.ok) {
    throw new Error(`Failed to fetch scoreboard: ${response.statusText}`);
  }
  return response.json();
}

export async function fetchScoreboardByWeek(
  league: League,
  year: number,
  seasonType: number,
  week: number
): Promise<ESPNScoreboard> {
  const response = await fetch(
    `${getBaseUrl(league)}/scoreboard?seasontype=${seasonType}&week=${week}&dates=${year}`
  );
  if (!response.ok) {
    throw new Error(`Failed to fetch scoreboard: ${response.statusText}`);
  }
  return response.json();
}

export async function fetchGameSummary(league: League, gameId: string): Promise<GameSummary> {
  const response = await fetch(`${getBaseUrl(league)}/summary?event=${gameId}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch game summary: ${response.statusText}`);
  }
  return response.json();
}

export async function fetchAllTeams(league: League): Promise<{ sports: { leagues: { teams: { team: TeamInfo }[] }[] }[] }> {
  // College football has many more teams, need higher limit
  const limit = league === 'college-football' ? 1000 : 50;
  const response = await fetch(`${getBaseUrl(league)}/teams?limit=${limit}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch teams: ${response.statusText}`);
  }
  return response.json();
}

export async function fetchTeamInfo(league: League, teamId: string): Promise<TeamInfo> {
  const response = await fetch(`${getBaseUrl(league)}/teams/${teamId}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch team info: ${response.statusText}`);
  }
  const data = await response.json();
  return data.team;
}

export async function fetchTeamRoster(league: League, teamId: string): Promise<TeamRoster> {
  const response = await fetch(`${getBaseUrl(league)}/teams/${teamId}/roster`);
  if (!response.ok) {
    throw new Error(`Failed to fetch team roster: ${response.statusText}`);
  }
  return response.json();
}

export async function fetchNews(league: League): Promise<NewsResponse> {
  const response = await fetch(`${getBaseUrl(league)}/news`);
  if (!response.ok) {
    throw new Error(`Failed to fetch news: ${response.statusText}`);
  }
  return response.json();
}

export async function fetchRankings(league: League): Promise<RankingsResponse> {
  const response = await fetch(`${getBaseUrl(league)}/rankings`);
  if (!response.ok) {
    throw new Error(`Failed to fetch rankings: ${response.statusText}`);
  }
  return response.json();
}

export async function fetchPlayByPlay(league: League, gameId: string): Promise<PlayByPlayResponse> {
  const leagueSlug = league === 'nfl' ? 'nfl' : 'college-football';
  const response = await fetch(
    `https://sports.core.api.espn.com/v2/sports/football/leagues/${leagueSlug}/events/${gameId}/competitions/${gameId}/plays?limit=400`
  );
  if (!response.ok) {
    throw new Error(`Failed to fetch play-by-play: ${response.statusText}`);
  }
  return response.json();
}

// Legacy exports for backwards compatibility
export const fetchNFLScoreboard = () => fetchScoreboard('nfl');
export const fetchNFLScoreboardByWeek = (year: number, seasonType: number, week: number) =>
  fetchScoreboardByWeek('nfl', year, seasonType, week);
export const fetchNFLNews = () => fetchNews('nfl');
