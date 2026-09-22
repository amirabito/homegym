export type ExerciseUnit = 'reps' | 'seconds'

export interface ExerciseTarget {
  id: string
  name: string
  sets: number
  repsMin: number
  repsMax: number
  restSeconds: number
  unit: ExerciseUnit
  perSide: boolean
}

export interface WorkoutDay {
  id: string
  name: string
  subtitle: string
  goal: string
  duration: string
  warmup: string
  exercises: ExerciseTarget[]
}

export interface SetLog {
  weight: number | null
  reps: number | null
  completed: boolean
}

export interface ExerciseLog {
  exerciseId: string
  exerciseName: string
  unit: ExerciseUnit
  repsMax: number
  sets: SetLog[]
}

export interface WorkoutSession {
  id: string
  dayId: string
  dayName: string
  startedAt: string
  finishedAt: string | null
  exercises: ExerciseLog[]
  notes: string
}

export interface Settings {
  weightUnit: 'lb' | 'kg'
  weightIncrement: number
}
