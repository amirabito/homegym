import type { ExerciseLog, WorkoutSession } from '../types'

/** True once every logged set for this exercise reached the top of its target rep/second range. */
export function hitTopOfRange(log: ExerciseLog): boolean {
  const loggedSets = log.sets.filter((s) => s.completed)
  if (loggedSets.length === 0) return false
  return loggedSets.every((s) => s.reps !== null && s.reps >= log.repsMax)
}

/** Heaviest weight used across an exercise's completed sets, or null if none logged. */
export function topWeight(log: ExerciseLog): number | null {
  const weights = log.sets.filter((s) => s.completed && s.weight !== null).map((s) => s.weight as number)
  return weights.length ? Math.max(...weights) : null
}

export interface LastExerciseEntry {
  log: ExerciseLog
  date: string
}

export function findLastExerciseEntry(
  sessions: WorkoutSession[],
  exerciseId: string,
  beforeSessionId?: string,
): LastExerciseEntry | null {
  const finished = sessions
    .filter((s) => s.finishedAt && s.id !== beforeSessionId)
    .sort((a, b) => new Date(b.finishedAt!).getTime() - new Date(a.finishedAt!).getTime())

  for (const session of finished) {
    const log = session.exercises.find((e) => e.exerciseId === exerciseId)
    if (log && log.sets.some((s) => s.completed)) return { log, date: session.finishedAt! }
  }
  return null
}

export function findLastExerciseLog(
  sessions: WorkoutSession[],
  exerciseId: string,
  beforeSessionId?: string,
): ExerciseLog | null {
  return findLastExerciseEntry(sessions, exerciseId, beforeSessionId)?.log ?? null
}

export function suggestedNextWeight(previousTopWeight: number | null, increment: number): number | null {
  if (previousTopWeight === null) return null
  return previousTopWeight + increment
}

export interface WeightSuggestion {
  /** What to load today, based on last time's performance. */
  weight: number
  /** True if last time hit the top of the rep range on every set (so this is a step up, not a repeat). */
  isIncrease: boolean
}

/**
 * Suggests today's weight for a weighted (reps-unit) exercise from the last time it was logged:
 * bump it if every set hit the top of the rep range last time, otherwise repeat the same weight.
 */
export function suggestWeightForToday(lastLog: ExerciseLog | null, increment: number): WeightSuggestion | null {
  if (!lastLog) return null
  const last = topWeight(lastLog)
  if (last === null) return null
  const isIncrease = hitTopOfRange(lastLog)
  return { weight: isIncrease ? last + increment : last, isIncrease }
}
