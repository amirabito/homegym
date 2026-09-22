import { WORKOUT_DAYS, PROGRESSION_RULE } from '../data/workouts'
import type { WorkoutSession } from '../types'
import { useRestTimer } from '../lib/RestTimerContext'

interface Props {
  sessions: WorkoutSession[]
  onStartDay: (dayId: string) => void
  onViewHistory: () => void
  onViewProgress: () => void
  onViewSettings: () => void
}

const QUICK_TIMER_PRESETS = [30, 45, 60, 90, 120]

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime()
  const days = Math.floor(diffMs / 86_400_000)
  if (days <= 0) return 'today'
  if (days === 1) return 'yesterday'
  return `${days} days ago`
}

export function Home({ sessions, onStartDay, onViewHistory, onViewProgress, onViewSettings }: Props) {
  const { start } = useRestTimer()
  const finished = sessions.filter((s) => s.finishedAt)
  const lastByDay = new Map<string, WorkoutSession>()
  for (const s of finished) {
    const existing = lastByDay.get(s.dayId)
    if (!existing || new Date(s.finishedAt!) > new Date(existing.finishedAt!)) lastByDay.set(s.dayId, s)
  }

  return (
    <div className="mx-auto max-w-lg px-4 pb-16 pt-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">HomeGym</h1>
          <p className="text-sm text-slate-400">3-day muscle gain split</p>
        </div>
        <button
          type="button"
          onClick={onViewSettings}
          aria-label="Settings"
          className="rounded-lg border border-slate-800 bg-slate-900 p-2 text-slate-400 active:bg-slate-800"
        >
          ⚙
        </button>
      </div>

      <div className="mt-6 space-y-3">
        {WORKOUT_DAYS.map((day) => {
          const last = lastByDay.get(day.id)
          return (
            <button
              key={day.id}
              type="button"
              onClick={() => onStartDay(day.id)}
              className="block w-full rounded-xl border border-slate-800 bg-slate-900 p-4 text-left active:bg-slate-800"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-semibold text-white">{day.name}</h2>
                  <p className="text-sm text-slate-400">{day.subtitle}</p>
                </div>
                <span className="text-brand-400">Start &rarr;</span>
              </div>
              <p className="mt-2 text-xs text-slate-500">
                {day.duration} &middot; {day.exercises.length} exercises
                {last ? ` · last done ${timeAgo(last.finishedAt!)}` : ''}
              </p>
            </button>
          )
        })}
      </div>

      <div className="mt-6 rounded-xl border border-slate-800 bg-slate-900 p-4">
        <h2 className="text-sm font-semibold text-white">Quick rest timer</h2>
        <p className="mt-1 text-xs text-slate-500">Start a standalone rest countdown anytime.</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {QUICK_TIMER_PRESETS.map((seconds) => (
            <button
              key={seconds}
              type="button"
              onClick={() => start(seconds, 'Rest')}
              className="rounded-lg bg-slate-800 px-3 py-2 text-sm font-medium text-slate-200 active:bg-slate-700"
            >
              {seconds}s
            </button>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={onViewProgress}
        className="mt-6 w-full rounded-xl border border-slate-800 bg-slate-900 py-3 text-sm font-medium text-slate-200 active:bg-slate-800"
      >
        View progress
      </button>

      <button
        type="button"
        onClick={onViewHistory}
        className="mt-3 w-full rounded-xl border border-slate-800 bg-slate-900 py-3 text-sm font-medium text-slate-200 active:bg-slate-800"
      >
        View workout history ({finished.length})
      </button>

      <p className="mt-6 text-center text-xs text-slate-600">{PROGRESSION_RULE}</p>
    </div>
  )
}
