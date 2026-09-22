import type { WorkoutDay } from '../types'

const ex = (
  id: string,
  name: string,
  sets: number,
  repsMin: number,
  repsMax: number,
  restSeconds: number,
  opts: Partial<{ unit: 'reps' | 'seconds'; perSide: boolean }> = {},
) => ({
  id,
  name,
  sets,
  repsMin,
  repsMax,
  restSeconds,
  unit: opts.unit ?? 'reps',
  perSide: opts.perSide ?? false,
})

export const WORKOUT_DAYS: WorkoutDay[] = [
  {
    id: 'day1',
    name: 'Day 1',
    subtitle: 'Chest + Quads Emphasis',
    goal: 'Muscle gain',
    duration: 'Approx. 45 minutes',
    warmup: 'Warm up 3-4 min on bike + 1-2 lighter sets before first main lift',
    exercises: [
      ex('d1-chest-press', 'Powertec Chest Press', 3, 6, 10, 90),
      ex('d1-lat-pulldown', 'Powertec Lat Pulldown', 3, 8, 12, 75),
      ex('d1-squat', 'Powertec Squat', 3, 8, 12, 90),
      ex('d1-rdl', 'DB Romanian Deadlift', 3, 8, 12, 75),
      ex('d1-lateral-raise', 'DB Lateral Raise', 2, 12, 20, 45),
      ex('d1-triceps-pushdown', 'Powertec Triceps Pushdown', 2, 10, 15, 45),
      ex('d1-crunch', 'DB Crunch', 3, 10, 15, 30),
    ],
  },
  {
    id: 'day2',
    name: 'Day 2',
    subtitle: 'Back + Hamstrings Emphasis',
    goal: 'Muscle gain',
    duration: 'Approx. 45 minutes',
    warmup: 'Warm up 3-4 min on bike + 1-2 lighter sets before first main lift',
    exercises: [
      ex('d2-row', 'Powertec Row', 3, 6, 10, 90),
      ex('d2-bulgarian-split-squat', 'DB Bulgarian Split Squat', 3, 8, 12, 75, { perSide: true }),
      ex('d2-incline-bench', 'DB Incline Bench Press', 3, 8, 12, 75),
      ex('d2-leg-curl', 'Powertec Leg Curl', 3, 10, 15, 60),
      ex('d2-lat-pulldown', 'Powertec Lat Pulldown', 2, 10, 15, 60),
      ex('d2-curl', 'DB Curl', 2, 10, 15, 45),
      ex('d2-reverse-crunch', 'Reverse Crunch / Leg Raise', 3, 10, 20, 30),
    ],
  },
  {
    id: 'day3',
    name: 'Day 3',
    subtitle: 'Shoulders + Upper Body Emphasis',
    goal: 'Muscle gain',
    duration: 'Approx. 45 minutes',
    warmup: 'Warm up 3-4 min on bike + 1-2 lighter sets before first main lift',
    exercises: [
      ex('d3-rdl', 'DB Romanian Deadlift', 3, 6, 10, 90),
      ex('d3-shoulder-press', 'DB Shoulder Press', 3, 8, 12, 75),
      ex('d3-chest-press', 'Powertec Chest Press', 3, 8, 12, 75),
      ex('d3-row', 'Powertec Row', 3, 8, 12, 75),
      ex('d3-squat', 'Powertec Squat', 2, 10, 15, 75),
      ex('d3-curl', 'DB Curl', 2, 10, 15, 40),
      ex('d3-triceps-pushdown', 'Triceps Pushdown', 2, 10, 15, 40),
      ex('d3-suitcase-carry', 'DB Suitcase Hold / Carry', 3, 30, 45, 30, {
        unit: 'seconds',
        perSide: true,
      }),
    ],
  },
]

export const PROGRESSION_RULE =
  'When you can hit the top of the rep range on all sets with clean form, increase the weight next time. Most working sets should finish with about 1-2 reps in reserve.'

export function getDay(dayId: string): WorkoutDay | undefined {
  return WORKOUT_DAYS.find((d) => d.id === dayId)
}
