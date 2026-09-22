import { useState } from 'react'
import type { WorkoutDay, WorkoutSession, ExerciseLog, ExerciseTarget, Settings } from '../types'
import { ExerciseCard } from './ExerciseCard'
import { useRestTimer } from '../lib/RestTimerContext'
import { findLastExerciseLog, suggestWeightForToday } from '../lib/progress'

interface Props {
  day: WorkoutDay
  sessions: WorkoutSession[]
  settings: Settings
  onFinish: (session: WorkoutSession) => void
  onCancel: () => void
}

function buildInitialSession(day: WorkoutDay, sessions: WorkoutSession[], weightIncrement: number): WorkoutSession {
  return {
    id: crypto.randomUUID(),
    dayId: day.id,
    dayName: `${day.name} — ${day.subtitle}`,
    startedAt: new Date().toISOString(),
    finishedAt: null,
    notes: '',
    exercises: day.exercises.map((ex): ExerciseLog => {
      // Pre-fill today's weight from last time's performance so there's less to type at the gym.
      const lastLog = ex.unit === 'reps' ? findLastExerciseLog(sessions, ex.id) : null
      const suggestion = suggestWeightForToday(lastLog, weightIncrement)
      return {
        exerciseId: ex.id,
        exerciseName: ex.name,
        unit: ex.unit,
        repsMax: ex.repsMax,
        sets: Array.from({ length: ex.sets }, () => ({
          weight: suggestion?.weight ?? null,
          reps: null,
          completed: false,
        })),
      }
    }),
  }
}

export function SessionView({ day, sessions, settings, onFinish, onCancel }: Props) {
  const [session, setSession] = useState<WorkoutSession>(() => buildInitialSession(day, sessions, settings.weightIncrement))
  const { start } = useRestTimer()

  const totalSets = session.exercises.reduce((sum, e) => sum + e.sets.length, 0)
  const completedSets = session.exercises.reduce((sum, e) => sum + e.sets.filter((s) => s.completed).length, 0)

  function updateExercise(index: number, log: ExerciseLog) {
    setSession((prev) => ({
      ...prev,
      exercises: prev.exercises.map((e, i) => (i === index ? log : e)),
    }))
  }

  function handleSetCompleted(target: ExerciseTarget) {
    start(target.restSeconds, target.name)
  }

  function handleFinish() {
    onFinish({ ...session, finishedAt: new Date().toISOString() })
  }

  function handleCancel() {
    if (completedSets === 0 || window.confirm('Discard this workout? Nothing has been saved yet.')) {
      onCancel()
    }
  }

  return (
    <div className="mx-auto max-w-lg px-4 pb-28 pt-6">
      <button type="button" onClick={handleCancel} className="mb-4 text-sm text-slate-400">
        &larr; Cancel workout
      </button>

      <h1 className="text-xl font-bold text-white">{day.name}</h1>
      <p className="text-sm text-slate-400">{day.subtitle}</p>
      <p className="mt-1 text-xs text-slate-500">{day.warmup}</p>

      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
        <div
          className="h-full rounded-full bg-brand-500 transition-all"
          style={{ width: `${totalSets ? (completedSets / totalSets) * 100 : 0}%` }}
        />
      </div>
      <p className="mt-1 text-xs text-slate-500">
        {completedSets} / {totalSets} sets logged
      </p>

      <div className="mt-4 space-y-4">
        {day.exercises.map((target, i) => (
          <ExerciseCard
            key={target.id}
            target={target}
            log={session.exercises[i]}
            onChange={(log) => updateExercise(i, log)}
            onSetCompleted={handleSetCompleted}
            sessions={sessions}
            currentSessionId={session.id}
            settings={settings}
          />
        ))}
      </div>

      <div className="mt-5">
        <label className="mb-1 block text-xs uppercase tracking-wide text-slate-400">Workout notes</label>
        <textarea
          value={session.notes}
          onChange={(e) => setSession((prev) => ({ ...prev, notes: e.target.value }))}
          rows={3}
          placeholder="How did it feel? Anything to remember for next time?"
          className="w-full rounded-lg border border-slate-700 bg-slate-950 p-3 text-sm text-white placeholder:text-slate-600"
        />
      </div>

      <button
        type="button"
        onClick={handleFinish}
        disabled={completedSets === 0}
        className="mt-5 w-full rounded-xl bg-emerald-600 py-3 text-base font-semibold text-white disabled:opacity-40"
      >
        Finish workout
      </button>
    </div>
  )
}
