# NFL Live Scoreboard

A real-time NFL scoreboard application built with React, TypeScript, and Tailwind CSS, powered by the ESPN API.

## Project Overview

This application displays live NFL game scores, statistics, and information in a modern broadcast-style scorebug design. Click on any game to view detailed statistics, scoring plays, and player stats.

## Tech Stack

- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite 7
- **Styling**: Tailwind CSS 4
- **Routing**: React Router DOM 7
- **Data Source**: ESPN Public API (no authentication required)

## Project Structure

```
src/
├── components/
│   ├── Scorebug.tsx      # Individual game scorebug card (clickable)
│   ├── Header.tsx        # App header with week/season info and refresh
│   └── ByeWeekTeams.tsx  # Displays teams on bye week
├── pages/
│   └── GameDetail.tsx    # Game detail page with full stats
├── hooks/
│   └── useNFLScoreboard.ts  # Data fetching hook with auto-refresh
├── services/
│   └── espnApi.ts        # ESPN API integration
├── types/
│   └── espn.ts           # TypeScript type definitions
├── App.tsx               # Main application with routing
├── main.tsx              # Entry point with BrowserRouter
└── index.css             # Tailwind CSS imports and custom styles
```

## Features

### Scorebug Display (Home Page)
- Team logos, colors, and abbreviations
- Win/loss records
- Quarter-by-quarter scoring
- Live game indicators with pulsing animation
- Game clock and period display
- Winner indicator arrows
- Clickable cards linking to game details

### Game Detail Page
- Large score header with team logos
- Quarter-by-quarter breakdown table
- **Unified Statistics Panel** with:
  - Team/Player toggle switch
  - Team view: comparison stats with visual bars
  - Player view: team selector + category selector (Passing, Rushing, Receiving, etc.)
- Scoring plays timeline
- Game information (venue, attendance, weather)
- Auto-refresh for live games

### Live Game Information
- Down and distance
- Red zone indicator
- Timeout counters (home/away)
- Last play description
- Game leaders (passing, rushing, receiving yards)

### Pre-game Information
- Game time with timezone
- Betting lines (spread and over/under)
- Venue information
- TV broadcast network

### General Features
- Auto-refresh every 30 seconds during live games
- Responsive grid layout (1-3 columns)
- Bye week team display
- Dynamic week labels (Wild Card, Divisional Round, Super Bowl, etc.)
- Dynamic copyright year
- Client-side routing with React Router

## ESPN API Endpoints

- **Scoreboard**: `https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard`
- **Game Summary**: `https://site.api.espn.com/apis/site/v2/sports/football/nfl/summary?event={gameId}`
- No authentication required

## Routes

- `/` - Main scoreboard with all games
- `/game/:gameId` - Game detail page

## Commands

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

## Current Issues / TODOs

- [x] ~~Week label showing "Week 1" instead of postseason labels~~ - Fixed by using `data.season.type` (root level) instead of `league.season.type`
- [x] ~~Add game detail page~~ - Added with full statistics, scoring plays, and player stats
- [x] ~~Logos and headshots not loading~~ - Multiple fixes required (see notes below)

## Recent Changes

### 2026-01-10
- Initial project setup with Vite + React + TypeScript
- Added Tailwind CSS 4 with `@import "tailwindcss"` syntax
- Created ESPN API service and TypeScript types
- Built Scorebug component with modern broadcast design
- Added live game situation display (down/distance, timeouts, last play)
- Added game leaders display
- Implemented auto-refresh hook (30 second intervals)
- Added week label display from ESPN calendar data
- Added dynamic copyright year in footer
- Fixed week label to use root-level `data.season.type` for correct postseason labels
- Created CLAUDE.md for project documentation
- **Added Game Detail Page** with:
  - React Router for client-side navigation
  - Game summary API endpoint
  - Score header with team logos and quarter breakdown
  - Team statistics comparison with visual progress bars
  - Scoring plays timeline
  - Player statistics tables by category
  - Game information sidebar
  - Back navigation to scoreboard
  - Auto-refresh for live games
- Made Scorebug cards clickable, linking to game details
- Fixed duplicate React key warning in TeamStats (stats can have duplicate names like "interceptions")
- **Fixed image loading** - Multiple issues discovered:
  - Added `crossOrigin="anonymous"` to all img tags (required for ESPN CDN)
  - Game summary API `header.competitions[].competitors[].team` doesn't include `logo` - must get from `boxscore.teams[]`
  - Player headshots in game summary API return objects `{href, alt}` instead of strings - added handling for both formats
  - Updated TypeScript types to reflect `headshot: string | { href: string; alt: string }`
- **Unified Statistics Panel** - Collapsed team and player stats into a single panel with toggles:
  - Team/Player view toggle at top
  - Team view shows comparison bars
  - Player view has team selector and category selector (Passing, Rushing, Receiving, etc.)
