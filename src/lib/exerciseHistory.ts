import type { ExerciseLog, ExerciseUnit, WorkoutSession } from '../types'
import { hitTopOfRange, topWeight } from './progress'

export interface ExercisePoint {
  sessionId: string
  date: string
  value: number | null
  hitTopOfRange: boolean
  setsSummary: string
}

export interface ExerciseSeries {
  name: string
  unit: ExerciseUnit
  valueLabel: string
  points: ExercisePoint[]
}

/** Best single-set value logged for an exercise: top weight for weighted lifts, longest hold for timed ones. */
function seriesValue(log: ExerciseLog): number | null {
  if (log.unit === 'seconds') {
    const durations = log.sets.filter((s) => s.completed && s.reps !== null).map((s) => s.reps as number)
    return durations.length ? Math.max(...durations) : null
  }
  return topWeight(log)
}

/**
 * Builds a trend series per exercise *name* actually logged, so a name edited mid-workout
 * (swapping in a different exercise for that slot) gets its own series rather than being
 * dropped or folded into the original plan exercise. Ordered by when each name was first logged.
 */
export function buildExerciseSeries(sessions: WorkoutSession[], weightUnit: string): ExerciseSeries[] {
  const finished = sessions
    .filter((s) => s.finishedAt)
    .sort((a, b) => new Date(a.finishedAt!).getTime() - new Date(b.finishedAt!).getTime())

  const byName = new Map<string, ExerciseSeries>()

  for (const session of finished) {
    for (const log of session.exercises) {
      if (!log.sets.some((s) => s.completed)) continue

      let series = byName.get(log.exerciseName)
      if (!series) {
        series = { name: log.exerciseName, unit: log.unit, valueLabel: log.unit === 'seconds' ? 'sec' : weightUnit, points: [] }
        byName.set(log.exerciseName, series)
      }

      series.points.push({
        sessionId: session.id,
        date: session.finishedAt!,
        value: seriesValue(log),
        hitTopOfRange: hitTopOfRange(log),
        setsSummary: log.sets
          .filter((set) => set.completed)
          .map((set) => (log.unit === 'seconds' ? `${set.reps}s` : `${set.weight ?? '-'}${weightUnit}×${set.reps}`))
          .join(', '),
      })
    }
  }

  return [...byName.values()]
}
