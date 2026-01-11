// Play-by-Play Type Definitions

// API Response from ESPN Core API
export interface PlayByPlayResponse {
  count: number;
  pageIndex: number;
  pageSize: number;
  pageCount: number;
  items: PlayByPlayItem[];
}

// Individual play item from API
export interface PlayByPlayItem {
  $ref?: string;
  id: string;
  sequenceNumber: number;
  type: PlayType;
  text: string;
  shortText?: string;
  alternativeText?: string;
  shortAlternativeText?: string;
  awayScore: number;
  homeScore: number;
  period: {
    number: number;
    displayValue?: string;
  };
  clock: {
    displayValue: string;
    value?: number;
  };
  scoringPlay: boolean;
  scoreValue: number;
  priority: boolean;
  modified: string;
  wallclock?: string;
  start: PlayPosition;
  end: PlayPosition;
  statYardage?: number;
  team?: PlayTeam;
  participants?: PlayParticipant[];
  pointAfterAttempt?: {
    id: string;
    text: string;
    value: number;
  };
}

export interface PlayType {
  id: string;
  text: string;
  abbreviation?: string;
}

export interface PlayPosition {
  down: number;
  distance: number;
  yardLine: number;
  yardsToEndzone?: number;
  team?: {
    id: string;
  };
  downDistanceText?: string;
  shortDownDistanceText?: string;
  possessionText?: string;
}

export interface PlayTeam {
  id: string;
  uid?: string;
  displayName?: string;
  abbreviation?: string;
  logo?: string;
}

export interface PlayParticipant {
  athlete: {
    id: string;
    displayName: string;
    shortName: string;
    headshot?: string;
    jersey?: string;
    position?: {
      abbreviation: string;
    };
  };
  type: string;
  order: number;
}

// Normalized play for visualization
export interface NormalizedPlay {
  id: string;
  sequenceNumber: number;
  type: string;
  typeId: string;
  description: string;
  shortDescription: string;
  quarter: number;
  clock: string;
  awayScore: number;
  homeScore: number;
  isScoring: boolean;
  scoreValue: number;
  teamId?: string;
  teamAbbreviation?: string;
  // Field positions (0-100 from left end zone)
  startYardLine: number;
  endYardLine: number;
  yardsGained: number;
  // Down and distance
  startDown: number;
  startDistance: number;
  endDown: number;
  endDistance: number;
  // Which team's territory
  startTerritory?: string;
  endTerritory?: string;
  // Participants
  participants: PlayParticipant[];
}

// Animation state for play visualization
export interface AnimationState {
  currentPlayIndex: number;
  isPlaying: boolean;
  speed: 0.5 | 1 | 2;
  progress: number; // 0-100
}

// Field configuration
export interface FieldConfig {
  // SVG dimensions
  viewBoxWidth: number;
  viewBoxHeight: number;
  // Field measurements
  fieldLength: number; // 100 yards
  endZoneLength: number; // 10 yards each
  fieldWidth: number; // ~53.33 yards
  // Hash mark positioning (percentage from sideline)
  hashMarkOffset: number;
}

export const NFL_FIELD_CONFIG: FieldConfig = {
  viewBoxWidth: 1200,
  viewBoxHeight: 533,
  fieldLength: 100,
  endZoneLength: 10,
  fieldWidth: 53.33,
  hashMarkOffset: 23.58, // NFL hash marks are narrower
};

export const CFB_FIELD_CONFIG: FieldConfig = {
  viewBoxWidth: 1200,
  viewBoxHeight: 533,
  fieldLength: 100,
  endZoneLength: 10,
  fieldWidth: 53.33,
  hashMarkOffset: 20, // College hash marks are wider
};

// Utility function to convert yard line to SVG x coordinate
export function yardLineToX(
  yardLine: number,
  config: FieldConfig = NFL_FIELD_CONFIG
): number {
  // yardLine: 0 = left goal line, 100 = right goal line
  // Add end zone offset (10 yards = 100px at 10px/yard)
  const endZonePx = (config.endZoneLength / config.fieldLength) * (config.viewBoxWidth - 200);
  const fieldPx = config.viewBoxWidth - (2 * endZonePx);
  const pxPerYard = fieldPx / config.fieldLength;
  return endZonePx + (yardLine * pxPerYard);
}

// Convert API yard line to absolute field position
// API returns yard line from perspective of possessing team (their own territory = 0-50, opponent = 50-100)
export function toAbsoluteYardLine(
  yardLine: number,
  possessingTeamId: string,
  homeTeamId: string,
  awayTeamId: string
): number {
  // If home team has possession:
  // - Their 20 yard line = 20 (left side)
  // - Opponent's 20 yard line = 80 (right side)
  // If away team has possession:
  // - Their 20 yard line = 80 (right side)
  // - Opponent's 20 yard line = 20 (left side)

  if (possessingTeamId === homeTeamId) {
    return yardLine;
  } else {
    return 100 - yardLine;
  }
}

// Play type categories for visualization
export type PlayCategory =
  | 'rush'
  | 'pass'
  | 'kick'
  | 'punt'
  | 'kickoff'
  | 'penalty'
  | 'timeout'
  | 'end_period'
  | 'other';

export function getPlayCategory(typeId: string, typeText: string): PlayCategory {
  const text = typeText.toLowerCase();

  if (text.includes('rush') || text.includes('run')) return 'rush';
  if (text.includes('pass') || text.includes('sack') || text.includes('interception')) return 'pass';
  if (text.includes('field goal') || text.includes('extra point') || text.includes('pat')) return 'kick';
  if (text.includes('punt')) return 'punt';
  if (text.includes('kickoff') || text.includes('kick off')) return 'kickoff';
  if (text.includes('penalty')) return 'penalty';
  if (text.includes('timeout')) return 'timeout';
  if (text.includes('end') && (text.includes('quarter') || text.includes('half') || text.includes('game'))) return 'end_period';

  return 'other';
}
