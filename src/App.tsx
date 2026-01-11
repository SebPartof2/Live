import { Routes, Route } from 'react-router-dom';
import { useScoreboard } from './hooks/useScoreboard';
import { Scorebug } from './components/Scorebug';
import { Header } from './components/Header';
import { ByeWeekTeams } from './components/ByeWeekTeams';
import { GameDetail } from './pages/GameDetail';
import { GamePlays } from './pages/GamePlays';
import { Teams } from './pages/Teams';
import { TeamDetail } from './pages/TeamDetail';
import { News } from './pages/News';
import { LeagueProvider, useLeague } from './contexts/LeagueContext';
import type { Event, CalendarItem } from './types/espn';

function getCurrentWeekLabel(
  calendar: CalendarItem[] | undefined,
  seasonType: number | undefined,
  weekNumber: number | undefined
): string {
  // Default fallback
  const fallback = weekNumber !== undefined ? `Week ${weekNumber}` : 'Current Week';

  if (!calendar || seasonType === undefined || weekNumber === undefined) {
    return fallback;
  }

  // Find the calendar section matching the season type (1=preseason, 2=regular, 3=postseason, 4=offseason)
  const seasonCalendar = calendar.find((c) => c.value === String(seasonType));
  if (!seasonCalendar?.entries) {
    return seasonCalendar?.label || fallback;
  }

  // Find the week entry
  const weekEntry = seasonCalendar.entries.find((e) => e.value === String(weekNumber));
  if (weekEntry) {
    return weekEntry.label;
  }

  return seasonCalendar.label || fallback;
}

function groupEventsByDate(events: Event[]): Map<string, Event[]> {
  const grouped = new Map<string, { date: Date; events: Event[]; allCompleted: boolean }>();

  events.forEach((event) => {
    const date = new Date(event.date);
    const dateKey = date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });

    if (!grouped.has(dateKey)) {
      grouped.set(dateKey, { date, events: [], allCompleted: true });
    }
    const group = grouped.get(dateKey)!;
    group.events.push(event);
    // If any game is not completed, mark the day as not all completed
    if (event.status.type.state !== 'post') {
      group.allCompleted = false;
    }
  });

  // Sort: upcoming days (soonest first), then completed days (most recent first)
  const sortedEntries = Array.from(grouped.entries()).sort((a, b) => {
    const aCompleted = a[1].allCompleted;
    const bCompleted = b[1].allCompleted;

    // Upcoming days come before completed days
    if (!aCompleted && bCompleted) return -1;
    if (aCompleted && !bCompleted) return 1;

    // Both upcoming: soonest first (ascending)
    if (!aCompleted && !bCompleted) {
      return a[1].date.getTime() - b[1].date.getTime();
    }

    // Both completed: most recent first (descending)
    return b[1].date.getTime() - a[1].date.getTime();
  });

  // Return as Map with just date key -> events
  const result = new Map<string, Event[]>();
  sortedEntries.forEach(([key, value]) => {
    result.set(key, value.events);
  });
  return result;
}

function LoadingState({ leagueName }: { leagueName: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-400 text-sm">Loading {leagueName} scores...</p>
      </div>
    </div>
  );
}

function ErrorState({ error, onRetry }: { error: Error; onRetry: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-4 max-w-md text-center">
        <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center">
          <span className="text-3xl">⚠️</span>
        </div>
        <h2 className="text-white text-xl font-bold">Failed to Load Scores</h2>
        <p className="text-gray-400 text-sm">{error.message}</p>
        <button
          onClick={onRetry}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white text-sm font-medium transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}

function NoGamesState() {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mb-4">
        <span className="text-4xl">🏈</span>
      </div>
      <h2 className="text-white text-xl font-bold mb-2">No Games Scheduled</h2>
      <p className="text-gray-400 text-sm">Check back later for upcoming games.</p>
    </div>
  );
}

function Scoreboard() {
  const { league, leagueName } = useLeague();
  const { data, loading, error, lastUpdated, refresh } = useScoreboard(league, 30000);

  if (loading && !data) {
    return <LoadingState leagueName={leagueName} />;
  }

  if (error && !data) {
    return <ErrorState error={error} onRetry={refresh} />;
  }

  const events = data?.events || [];
  const groupedEvents = groupEventsByDate(events);
  const byeTeams = data?.week?.teamsOnBye || [];
  const leagueData = data?.leagues?.[0];

  // Get the current week label from the calendar
  // Use data.season.type (root level) as it reflects the actual current season type (postseason, etc.)
  const weekLabel = getCurrentWeekLabel(
    leagueData?.calendar,
    data?.season?.type,
    data?.week?.number
  );

  // Count live games
  const liveGamesCount = events.filter(
    (e) => e.status.type.state === 'in'
  ).length;

  return (
    <div className="min-h-screen">
      <Header
        weekLabel={weekLabel}
        seasonName={leagueData?.season?.displayName}
        lastUpdated={lastUpdated}
        onRefresh={refresh}
        isLoading={loading}
      />

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Live Games Alert */}
        {liveGamesCount > 0 && (
          <div className="mb-6 bg-gradient-to-r from-red-900/30 to-red-800/10 border border-red-800/50 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
              <span className="text-white font-semibold">
                {liveGamesCount} Game{liveGamesCount > 1 ? 's' : ''} In Progress
              </span>
              <span className="text-gray-400 text-sm">• Auto-refreshing every 30 seconds</span>
            </div>
          </div>
        )}

        {/* Bye Week Teams (NFL only) */}
        {league === 'nfl' && byeTeams.length > 0 && (
          <div className="mb-6">
            <ByeWeekTeams teams={byeTeams} />
          </div>
        )}

        {/* Games Grid */}
        {events.length === 0 ? (
          <NoGamesState />
        ) : (
          <div className="space-y-8">
            {Array.from(groupedEvents.entries()).map(([dateKey, dateEvents]) => (
              <section key={dateKey}>
                <h2 className="text-gray-400 text-sm font-semibold uppercase tracking-wider mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full" />
                  {dateKey}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {dateEvents.map((event) => (
                    <Scorebug
                      key={event.id}
                      gameId={event.id}
                      competition={event.competitions[0]}
                      eventDate={event.date}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}

        {/* Footer */}
        <footer className="mt-12 pt-6 border-t border-slate-800">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-gray-500 text-xs">
            <p>Data provided by ESPN. Refreshes automatically every 30 seconds during live games.</p>
            <p>
              © {new Date().getFullYear()} {leagueData?.name}
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
}

function App() {
  return (
    <LeagueProvider>
      <Routes>
        <Route path="/" element={<Scoreboard />} />
        <Route path="/game/:gameId" element={<GameDetail />} />
        <Route path="/game/:gameId/plays" element={<GamePlays />} />
        <Route path="/teams" element={<Teams />} />
        <Route path="/team/:teamId" element={<TeamDetail />} />
        <Route path="/news" element={<News />} />
      </Routes>
    </LeagueProvider>
  );
}

export default App;
