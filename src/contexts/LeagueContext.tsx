import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { League } from '../services/espnApi';

interface LeagueContextType {
  league: League;
  setLeague: (league: League) => void;
  leagueName: string;
  leagueShortName: string;
}

const LeagueContext = createContext<LeagueContextType | undefined>(undefined);

const LEAGUE_INFO: Record<League, { name: string; shortName: string }> = {
  'nfl': { name: 'NFL', shortName: 'NFL' },
  'college-football': { name: 'College Football', shortName: 'CFB' },
};

export function LeagueProvider({ children }: { children: ReactNode }) {
  const [league, setLeague] = useState<League>('nfl');

  const value: LeagueContextType = {
    league,
    setLeague,
    leagueName: LEAGUE_INFO[league].name,
    leagueShortName: LEAGUE_INFO[league].shortName,
  };

  return (
    <LeagueContext.Provider value={value}>
      {children}
    </LeagueContext.Provider>
  );
}

export function useLeague(): LeagueContextType {
  const context = useContext(LeagueContext);
  if (context === undefined) {
    throw new Error('useLeague must be used within a LeagueProvider');
  }
  return context;
}
