import { WORKOUT_DAYS } from '../data/workouts'
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

/** All exercises the plan defines, in the order they first appear, deduped by name (same lift can appear on multiple days). */
function orderedExerciseNames(): { name: string; unit: ExerciseUnit }[] {
  const seen = new Set<string>()
  const result: { name: string; unit: ExerciseUnit }[] = []
  for (const day of WORKOUT_DAYS) {
    for (const ex of day.exercises) {
      if (seen.has(ex.name)) continue
      seen.add(ex.name)
      result.push({ name: ex.name, unit: ex.unit })
    }
  }
  return result
}

export function buildExerciseSeries(sessions: WorkoutSession[], weightUnit: string): ExerciseSeries[] {
  const finished = sessions
    .filter((s) => s.finishedAt)
    .sort((a, b) => new Date(a.finishedAt!).getTime() - new Date(b.finishedAt!).getTime())

  const series: ExerciseSeries[] = orderedExerciseNames().map(({ name, unit }) => ({
    name,
    unit,
    valueLabel: unit === 'seconds' ? 'sec' : weightUnit,
    points: [],
  }))
  const byName = new Map(series.map((s) => [s.name, s]))

  for (const session of finished) {
    for (const log of session.exercises) {
      if (!log.sets.some((s) => s.completed)) continue
      const s = byName.get(log.exerciseName)
      if (!s) continue
      s.points.push({
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

  return series.filter((s) => s.points.length > 0)
}
