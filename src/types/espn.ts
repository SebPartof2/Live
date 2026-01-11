export interface ESPNScoreboard {
  leagues: League[];
  season: Season;
  week: Week;
  events: Event[];
}

export interface League {
  id: string;
  uid: string;
  name: string;
  abbreviation: string;
  slug: string;
  season: Season;
  logos: Logo[];
  calendarType: string;
  calendarIsWhitelist: boolean;
  calendarStartDate: string;
  calendarEndDate: string;
  calendar: CalendarItem[];
}

export interface Season {
  year: number;
  type: number;
  name: string;
  displayName: string;
  slug: string;
  startDate: string;
  endDate: string;
}

export interface Week {
  number: number;
  teamsOnBye?: Team[];
}

export interface CalendarItem {
  label: string;
  value: string;
  startDate: string;
  endDate: string;
  entries?: CalendarEntry[];
}

export interface CalendarEntry {
  label: string;
  alternateLabel: string;
  detail: string;
  value: string;
  startDate: string;
  endDate: string;
}

export interface Event {
  id: string;
  uid: string;
  date: string;
  name: string;
  shortName: string;
  season: EventSeason;
  week: EventWeek;
  competitions: Competition[];
  links: Link[];
  weather?: Weather;
  status: EventStatus;
}

export interface EventSeason {
  year: number;
  type: number;
  slug: string;
}

export interface EventWeek {
  number: number;
}

export interface Competition {
  id: string;
  uid: string;
  date: string;
  attendance?: number;
  type: CompetitionType;
  timeValid: boolean;
  neutralSite: boolean;
  conferenceCompetition: boolean;
  playByPlayAvailable: boolean;
  recent: boolean;
  venue?: Venue;
  competitors: Competitor[];
  notes: Note[];
  status: GameStatus;
  broadcasts: Broadcast[];
  leaders?: Leader[];
  format: Format;
  startDate: string;
  geoBroadcasts: GeoBroadcast[];
  headlines?: Headline[];
  situation?: Situation;
  odds?: Odds[];
}

export interface CompetitionType {
  id: string;
  abbreviation: string;
}

export interface Venue {
  id: string;
  fullName: string;
  address: Address;
  capacity?: number;
  indoor: boolean;
}

export interface Address {
  city: string;
  state: string;
}

export interface Competitor {
  id: string;
  uid: string;
  type: string;
  order: number;
  homeAway: 'home' | 'away';
  winner?: boolean;
  team: Team;
  score: string;
  linescores?: LineScore[];
  statistics?: Statistic[];
  records?: Record[];
}

export interface Team {
  id: string;
  uid: string;
  location: string;
  name: string;
  abbreviation: string;
  displayName: string;
  shortDisplayName: string;
  color?: string;
  alternateColor?: string;
  isActive: boolean;
  venue?: { id: string };
  links: Link[];
  logo: string;
}

export interface LineScore {
  displayValue: string;
}

export interface Statistic {
  name: string;
  abbreviation: string;
  displayValue: string;
}

export interface Record {
  name: string;
  abbreviation: string;
  type: string;
  summary: string;
}

export interface Note {
  type: string;
  headline: string;
}

export interface GameStatus {
  clock: number;
  displayClock: string;
  period: number;
  type: StatusType;
}

export interface StatusType {
  id: string;
  name: string;
  state: 'pre' | 'in' | 'post';
  completed: boolean;
  description: string;
  detail: string;
  shortDetail: string;
}

export interface EventStatus {
  clock: number;
  displayClock: string;
  period: number;
  type: StatusType;
}

export interface Broadcast {
  market: string;
  names: string[];
}

export interface Leader {
  name: string;
  displayName: string;
  shortDisplayName: string;
  abbreviation: string;
  leaders: LeaderEntry[];
}

export interface LeaderEntry {
  displayValue: string;
  value: number;
  athlete: Athlete;
  team: { id: string };
}

export interface Athlete {
  id: string;
  fullName: string;
  displayName: string;
  shortName: string;
  links: Link[];
  headshot: string | { href: string; alt: string };
  jersey: string;
  position: Position;
  team: { id: string };
  active: boolean;
}

export interface Position {
  abbreviation: string;
}

export interface Format {
  regulation: Regulation;
}

export interface Regulation {
  periods: number;
}

export interface GeoBroadcast {
  type: { id: string; shortName: string };
  market: { id: string; type: string };
  media: { shortName: string };
  lang: string;
  region: string;
}

export interface Headline {
  description: string;
  type: string;
  shortLinkText: string;
}

export interface Situation {
  $ref?: string;
  lastPlay?: LastPlay;
  down: number;
  yardLine: number;
  distance: number;
  downDistanceText?: string;
  shortDownDistanceText?: string;
  possessionText?: string;
  isRedZone: boolean;
  homeTimeouts: number;
  awayTimeouts: number;
  possession?: string;
}

export interface LastPlay {
  id: string;
  type: { id: string; text: string };
  text: string;
  scoreValue: number;
  team?: { id: string };
  probability: { tiePercentage: number; homeWinPercentage: number; awayWinPercentage: number };
  drive?: { description: string };
  start?: { yardLine: number; team: { id: string } };
  end?: { yardLine: number; team: { id: string } };
  statYardage?: number;
  athletesInvolved?: Athlete[];
}

export interface Odds {
  provider: { id: string; name: string; priority: number };
  details: string;
  overUnder: number;
  spread: number;
  awayTeamOdds: TeamOdds;
  homeTeamOdds: TeamOdds;
}

export interface TeamOdds {
  favorite: boolean;
  underdog: boolean;
  moneyLine?: number;
  spreadOdds?: number;
  team?: { id: string };
}

export interface Logo {
  href: string;
  width: number;
  height: number;
  alt: string;
  rel: string[];
  lastUpdated: string;
}

export interface Link {
  language?: string;
  rel: string[];
  href: string;
  text?: string;
  shortText?: string;
  isExternal?: boolean;
  isPremium?: boolean;
}

export interface Weather {
  displayValue: string;
  temperature: number;
  highTemperature?: number;
  conditionId: string;
  link?: Link;
}

// Game Summary Types (for detail page)
export interface GameSummary {
  boxscore: Boxscore;
  gameInfo: GameInfo;
  drives?: Drive[];
  leaders?: Leader[];
  scoringPlays?: ScoringPlay[];
  winprobability?: WinProbability[];
  header: GameHeader;
  plays?: Play[];
  pickcenter?: Odds[];
  predictor?: Predictor;
}

export interface Predictor {
  header: string;
  homeTeam: PredictorTeam;
  awayTeam: PredictorTeam;
}

export interface PredictorTeam {
  id: string;
  gameProjection: number;
  teamChanceLoss: number;
  teamChanceTie: number;
}

export interface Boxscore {
  teams: BoxscoreTeam[];
  players: BoxscorePlayer[];
}

export interface BoxscoreTeam {
  team: Team;
  statistics: TeamStatistic[];
}

export interface TeamStatistic {
  name: string;
  displayValue: string;
  label: string;
}

export interface BoxscorePlayer {
  team: Team;
  statistics: PlayerStatCategory[];
}

export interface PlayerStatCategory {
  name: string;
  keys: string[];
  labels: string[];
  descriptions: string[];
  athletes: AthleteStats[];
}

export interface AthleteStats {
  athlete: Athlete;
  stats: string[];
}

export interface GameInfo {
  venue: Venue;
  attendance?: number;
  weather?: Weather;
  officials?: Official[];
}

export interface Official {
  fullName: string;
  displayName: string;
  position: { name: string };
}

export interface Drive {
  id: string;
  description: string;
  team: Team;
  start: DrivePosition;
  end: DrivePosition;
  timeElapsed: { displayValue: string };
  yards: number;
  isScore: boolean;
  offensivePlays: number;
  result: string;
  shortDisplayResult: string;
  displayResult: string;
  plays: Play[];
}

export interface DrivePosition {
  period: { number: number };
  clock: { displayValue: string };
  yardLine: number;
  text: string;
}

export interface Play {
  id: string;
  type: { id: string; text: string };
  text: string;
  awayScore: number;
  homeScore: number;
  period: { number: number };
  clock: { displayValue: string };
  scoringPlay: boolean;
  scoreValue: number;
  team?: { id: string };
  start?: { yardLine: number };
  end?: { yardLine: number };
  statYardage?: number;
}

export interface ScoringPlay {
  id: string;
  type: { id: string; text: string };
  text: string;
  awayScore: number;
  homeScore: number;
  period: { number: number };
  clock: { displayValue: string };
  team: { id: string; displayName: string; abbreviation: string; logo: string };
  scoringType: { name: string; displayName: string; abbreviation: string };
}

export interface WinProbability {
  tiePercentage: number;
  homeWinPercentage: number;
  awayWinPercentage: number;
  secondsLeft: number;
  playId: string;
}

export interface GameHeader {
  id: string;
  uid: string;
  season: EventSeason;
  week: number;
  timeValid: boolean;
  competitions: Competition[];
  links: Link[];
}

// Team Info Types
export interface TeamInfo {
  id: string;
  uid: string;
  slug: string;
  location: string;
  name: string;
  nickname: string;
  abbreviation: string;
  displayName: string;
  shortDisplayName: string;
  color: string;
  alternateColor: string;
  isActive: boolean;
  logos: Logo[];
  record?: {
    items: {
      description: string;
      type: string;
      summary: string;
      stats: { name: string; value: number }[];
    }[];
  };
  standingSummary?: string;
  links: Link[];
}

// Team Roster Types
export interface TeamRoster {
  timestamp: string;
  status: string;
  season: { year: number; displayName: string; type: number; name: string };
  athletes: RosterAthlete[];
  coach: Coach[];
  team: TeamInfo;
}

export interface RosterAthlete {
  position: string;
  items: RosterPlayer[];
}

export interface RosterPlayer {
  id: string;
  uid: string;
  guid: string;
  firstName: string;
  lastName: string;
  fullName: string;
  displayName: string;
  shortName: string;
  weight: number;
  displayWeight: string;
  height: number;
  displayHeight: string;
  age: number;
  dateOfBirth: string;
  birthPlace?: { city: string; state: string; country: string };
  jersey: string;
  position: {
    id: string;
    name: string;
    displayName: string;
    abbreviation: string;
    leaf: boolean;
  };
  experience?: { years: number };
  college?: { id: string; name: string; shortName: string };
  headshot?: { href: string; alt: string };
  status: { id: string; name: string; type: string; abbreviation: string };
  injuries?: { status: string; date: string }[];
}

export interface Coach {
  id: string;
  firstName: string;
  lastName: string;
  experience: number;
}

// News Types
export interface NewsResponse {
  header: string;
  articles: NewsArticle[];
}

export interface NewsArticle {
  headline: string;
  description: string;
  published: string;
  lastModified: string;
  premium: boolean;
  type: string;
  links: {
    api: { news: { href: string } };
    web: { href: string };
    mobile?: { href: string };
  };
  images?: NewsImage[];
  categories?: NewsCategory[];
  byline?: string;
}

export interface NewsImage {
  name: string;
  width: number;
  height: number;
  url: string;
  alt?: string;
  caption?: string;
  credit?: string;
}

export interface NewsCategory {
  id: number;
  description: string;
  type: string;
  sportId?: number;
  teamId?: number;
  team?: {
    id: number;
    description: string;
    links?: Link[];
  };
  athlete?: {
    id: number;
    description: string;
    links?: Link[];
  };
}

// Rankings Types (College Football)
export interface RankingsResponse {
  rankings: Ranking[];
}

export interface Ranking {
  id: string;
  name: string;
  shortName: string;
  type: string;
  headline: string;
  shortHeadline: string;
  current: boolean;
  occurrence: {
    type: string;
    date: string;
    seasonType: number;
    weekNumber: number;
  };
  ranks: RankedTeam[];
}

export interface RankedTeam {
  current: number;
  previous: number;
  points?: number;
  firstPlaceVotes?: number;
  trend: 'up' | 'down' | 'same';
  team: {
    id: string;
    uid: string;
    location: string;
    name: string;
    nickname?: string;
    abbreviation: string;
    displayName: string;
    shortDisplayName: string;
    color?: string;
    alternateColor?: string;
    isActive: boolean;
    logos: Logo[];
  };
  recordSummary?: string;
}
