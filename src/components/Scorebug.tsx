import { Link } from 'react-router-dom';
import type { Competition, Competitor, Situation } from '../types/espn';

interface ScorebugProps {
  gameId: string;
  competition: Competition;
  eventDate: string;
}

function formatGameTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short',
  });
}

function getQuarterDisplay(period: number): string {
  if (period === 1) return '1ST';
  if (period === 2) return '2ND';
  if (period === 3) return '3RD';
  if (period === 4) return '4TH';
  if (period > 4) return 'OT';
  return '';
}

function TeamRow({
  competitor,
  isWinner,
  showScore,
}: {
  competitor: Competitor;
  isWinner: boolean;
  showScore: boolean;
}) {
  const team = competitor.team;
  const record = competitor.records?.find((r) => r.type === 'total');

  return (
    <div
      className={`flex items-center justify-between px-3 py-2 transition-all ${
        isWinner ? 'bg-white/10' : ''
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className="w-1 h-8 rounded-full"
          style={{ background: `#${team.color || '666'}` }}
        />
        <img
          src={team.logo}
          alt={team.displayName}
          className="w-8 h-8 object-contain"
          crossOrigin="anonymous"
        />
        <div className="flex flex-col">
          <span className="text-white font-bold text-sm tracking-wide">
            {team.abbreviation}
          </span>
          {record && (
            <span className="text-gray-400 text-xs">{record.summary}</span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        {competitor.linescores && showScore && (
          <div className="hidden sm:flex gap-1 mr-3">
            {competitor.linescores.map((ls, i) => (
              <span
                key={i}
                className="text-gray-400 text-xs w-5 text-center"
              >
                {ls.displayValue}
              </span>
            ))}
          </div>
        )}
        <span
          className={`text-2xl font-bold min-w-[3rem] text-right ${
            isWinner ? 'text-white' : 'text-gray-300'
          }`}
        >
          {showScore ? competitor.score : '-'}
        </span>
        {isWinner && (
          <div className="w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-r-[8px] border-r-green-500 rotate-180" />
        )}
      </div>
    </div>
  );
}

function SituationDisplay({ situation }: { situation: Situation }) {
  return (
    <div className="bg-slate-800/50 px-3 py-2 border-t border-slate-700">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className={`font-semibold ${situation.isRedZone ? 'text-red-500' : 'text-yellow-500'}`}>
            {situation.isRedZone ? '🔴 RED ZONE' : situation.downDistanceText || situation.shortDownDistanceText}
          </span>
          {situation.possessionText && (
            <span className="text-gray-400">• {situation.possessionText}</span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1" title="Away Timeouts">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full ${
                  i < situation.awayTimeouts ? 'bg-yellow-500' : 'bg-gray-600'
                }`}
              />
            ))}
          </div>
          <span className="text-gray-500">|</span>
          <div className="flex items-center gap-1" title="Home Timeouts">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full ${
                  i < situation.homeTimeouts ? 'bg-yellow-500' : 'bg-gray-600'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
      {situation.lastPlay?.text && (
        <p className="text-gray-400 text-xs mt-1 truncate" title={situation.lastPlay.text}>
          {situation.lastPlay.text}
        </p>
      )}
    </div>
  );
}

function GameLeaders({ competition }: { competition: Competition }) {
  if (!competition.leaders || competition.leaders.length === 0) return null;

  const passingLeader = competition.leaders.find((l) => l.name === 'passingYards');
  const rushingLeader = competition.leaders.find((l) => l.name === 'rushingYards');
  const receivingLeader = competition.leaders.find((l) => l.name === 'receivingYards');

  const leaders = [passingLeader, rushingLeader, receivingLeader].filter(Boolean);
  if (leaders.length === 0) return null;

  return (
    <div className="bg-slate-800/30 px-3 py-2 border-t border-slate-700">
      <div className="flex gap-4 overflow-x-auto">
        {leaders.map((leader) => {
          const topPlayer = leader!.leaders[0];
          if (!topPlayer) return null;
          return (
            <div key={leader!.name} className="flex items-center gap-2 min-w-fit">
              {topPlayer.athlete.headshot && (
                <img
                  src={typeof topPlayer.athlete.headshot === 'string' ? topPlayer.athlete.headshot : topPlayer.athlete.headshot.href}
                  alt={topPlayer.athlete.displayName}
                  className="w-8 h-8 rounded-full object-cover bg-slate-700"
                  crossOrigin="anonymous"
                />
              )}
              <div className="flex flex-col">
                <span className="text-gray-400 text-[10px] uppercase tracking-wider">
                  {leader!.shortDisplayName}
                </span>
                <span className="text-white text-xs font-medium">
                  {topPlayer.athlete.shortName} - {topPlayer.displayValue}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function Scorebug({ gameId, competition, eventDate }: ScorebugProps) {
  const status = competition.status;
  const state = status.type.state;
  const isLive = state === 'in';
  const isComplete = state === 'post';
  const isPregame = state === 'pre';

  const awayTeam = competition.competitors.find((c) => c.homeAway === 'away')!;
  const homeTeam = competition.competitors.find((c) => c.homeAway === 'home')!;

  const broadcasts = competition.broadcasts.flatMap((b) => b.names);
  const odds = competition.odds?.[0];

  return (
    <Link
      to={`/game/${gameId}`}
      state={{ notes: competition.notes || [] }}
      className="block bg-slate-900 rounded-xl overflow-hidden shadow-2xl border border-slate-700/50 hover:border-slate-500 hover:shadow-slate-700/20 transition-all cursor-pointer"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-slate-800/50 border-b border-slate-700">
        <div className="flex items-center gap-2">
          {isLive && (
            <span className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
              <span className="text-red-500 text-xs font-bold uppercase tracking-wider">
                Live
              </span>
            </span>
          )}
          {isComplete && (
            <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider">
              Final
            </span>
          )}
          {isPregame && (
            <span className="text-gray-400 text-xs font-medium">
              {formatGameTime(eventDate)}
            </span>
          )}
          {isLive && (
            <span className="text-white text-xs font-bold ml-2">
              {getQuarterDisplay(status.period)} {status.displayClock}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {broadcasts.length > 0 && (
            <span className="text-gray-500 text-xs">
              {broadcasts.slice(0, 2).join(', ')}
            </span>
          )}
        </div>
      </div>

      {/* Teams */}
      <div className="divide-y divide-slate-700/50">
        <TeamRow
          competitor={awayTeam}
          isWinner={isComplete && awayTeam.winner === true}
          showScore={!isPregame}
        />
        <TeamRow
          competitor={homeTeam}
          isWinner={isComplete && homeTeam.winner === true}
          showScore={!isPregame}
        />
      </div>

      {/* Live Game Situation */}
      {isLive && competition.situation && (
        <SituationDisplay situation={competition.situation} />
      )}

      {/* Game Leaders (during or after game) */}
      {(isLive || isComplete) && <GameLeaders competition={competition} />}

      {/* Pre-game Info */}
      {isPregame && (
        <div className="px-3 py-2 bg-slate-800/30 border-t border-slate-700">
          <div className="flex items-center justify-between text-xs">
            {odds && (
              <div className="flex items-center gap-3">
                <span className="text-gray-400">
                  Line: <span className="text-white">{odds.details}</span>
                </span>
                <span className="text-gray-400">
                  O/U: <span className="text-white">{odds.overUnder}</span>
                </span>
              </div>
            )}
            {competition.venue && (
              <span className="text-gray-500 truncate ml-2">
                {competition.venue.fullName}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Headline */}
      {competition.headlines?.[0] && (
        <div className="px-3 py-2 bg-slate-800/20 border-t border-slate-700">
          <p className="text-gray-400 text-xs truncate">
            {competition.headlines[0].shortLinkText}
          </p>
        </div>
      )}
    </Link>
  );
}
