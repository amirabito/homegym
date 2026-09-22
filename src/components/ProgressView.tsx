import type { Settings, WorkoutSession } from '../types'
import { buildExerciseSeries } from '../lib/exerciseHistory'
import { ExerciseTrendCard } from './ExerciseTrendCard'

interface Props {
  sessions: WorkoutSession[]
  settings: Settings
  onBack: () => void
}

export function ProgressView({ sessions, settings, onBack }: Props) {
  const series = buildExerciseSeries(sessions, settings.weightUnit)

  return (
    <div className="mx-auto max-w-lg px-4 pb-16 pt-6">
      <button type="button" onClick={onBack} className="mb-4 text-sm text-slate-400">
        &larr; Back
      </button>
      <h1 className="text-xl font-bold text-white">Progress</h1>
      <p className="text-sm text-slate-400">Per-exercise trend across every logged workout.</p>

      {series.length === 0 && (
        <p className="mt-6 text-sm text-slate-500">
          Finish a workout and log a couple of sets to start seeing progress here.
        </p>
      )}

      <div className="mt-4 space-y-4">
        {series.map((s) => (
          <ExerciseTrendCard key={s.name} series={s} />
        ))}
      </div>
    </div>
  )
}
