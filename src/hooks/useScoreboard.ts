import { useState, useEffect, useCallback } from 'react';
import type { ESPNScoreboard } from '../types/espn';
import { fetchScoreboard, type League } from '../services/espnApi';

interface UseScoreboardResult {
  data: ESPNScoreboard | null;
  loading: boolean;
  error: Error | null;
  lastUpdated: Date | null;
  refresh: () => Promise<void>;
}

export function useScoreboard(league: League, refreshInterval = 30000): UseScoreboardResult {
  const [data, setData] = useState<ESPNScoreboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const refresh = useCallback(async () => {
    try {
      setError(null);
      const scoreboard = await fetchScoreboard(league);
      setData(scoreboard);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch data'));
    } finally {
      setLoading(false);
    }
  }, [league]);

  useEffect(() => {
    // Reset state when league changes
    setLoading(true);
    setData(null);
    refresh();

    // Set up auto-refresh for live updates
    const interval = setInterval(refresh, refreshInterval);

    return () => clearInterval(interval);
  }, [refresh, refreshInterval, league]);

  return { data, loading, error, lastUpdated, refresh };
}
