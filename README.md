# HomeGym

A mobile-friendly workout tracker for the 3-day muscle-gain split (Chest + Quads / Back + Hamstrings / Shoulders + Upper Body). All data is stored locally in the browser (`localStorage`) — no backend required.

## Features

- **3-day workout plan** pre-loaded with each exercise's target sets, rep range, and rest time.
- **Set logging** — enter weight and reps per set; sets are tracked against last time's numbers for reference.
- **Rest countdown timer** that auto-starts after logging a set (using each exercise's prescribed rest time), with pause/resume, +15s/-15s, skip, and an audible + vibration alert when the rest is up. A standalone quick-timer is also available from the home screen.
- **Weight-increase recommendations** — once every set for an exercise reaches the top of its target rep range, the app flags it and suggests the next weight to try, per the plan's own progression rule.
- **History** of completed workouts, with per-exercise results and progression flags.

## Development

```sh
npm install
npm run dev      # start local dev server
npm run build    # type-check and build for production
```
