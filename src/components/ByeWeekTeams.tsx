import type { Team } from '../types/espn';

interface ByeWeekTeamsProps {
  teams: Team[];
}

export function ByeWeekTeams({ teams }: ByeWeekTeamsProps) {
  if (teams.length === 0) return null;

  return (
    <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/50">
      <h3 className="text-gray-400 text-sm font-semibold uppercase tracking-wider mb-3">
        Teams on Bye
      </h3>
      <div className="flex flex-wrap gap-2">
        {teams.map((team) => (
          <div
            key={team.id}
            className="flex items-center gap-2 bg-slate-800/50 rounded-lg px-3 py-1.5"
          >
            <img
              src={team.logo}
              alt={team.displayName}
              className="w-5 h-5 object-contain"
              crossOrigin="anonymous"
            />
            <span className="text-gray-300 text-sm">{team.abbreviation}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
