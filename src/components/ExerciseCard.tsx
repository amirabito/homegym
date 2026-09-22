import type { ExerciseLog, ExerciseTarget, Settings, WorkoutSession } from '../types'
import { findLastExerciseEntry, hitTopOfRange, suggestWeightForToday, suggestedNextWeight, topWeight } from '../lib/progress'

interface Props {
  target: ExerciseTarget
  log: ExerciseLog
  onChange: (log: ExerciseLog) => void
  onSetCompleted: (target: ExerciseTarget) => void
  sessions: WorkoutSession[]
  currentSessionId: string
  settings: Settings
}

function rangeLabel(target: ExerciseTarget): string {
  const unit = target.unit === 'seconds' ? 'sec' : 'reps'
  const perSide = target.perSide ? ' / side' : ''
  return `${target.sets} x ${target.repsMin}-${target.repsMax} ${unit}${perSide}`
}

function formatShortDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

export function ExerciseCard({ target, log, onChange, onSetCompleted, sessions, currentSessionId, settings }: Props) {
  const lastEntry = findLastExerciseEntry(sessions, target.id, currentSessionId)
  const lastLog = lastEntry?.log ?? null
  const isSecondsUnit = target.unit === 'seconds'
  const lastSummary = lastLog
    ? lastLog.sets
        .filter((s) => s.completed)
        .map((s) => (isSecondsUnit ? `${s.reps}s` : `${s.weight ?? '-'}${settings.weightUnit}×${s.reps ?? '-'}`))
        .join(', ')
    : null
  const suggestion = !isSecondsUnit ? suggestWeightForToday(lastLog, settings.weightIncrement) : null
  const allDone = log.sets.every((s) => s.completed)
  const recommendIncrease = allDone && hitTopOfRange(log)
  const nextWeight = recommendIncrease ? suggestedNextWeight(topWeight(log), settings.weightIncrement) : null

  function updateSet(index: number, patch: Partial<{ weight: number | null; reps: number | null }>) {
    const nextSets = log.sets.map((s, i) => (i === index ? { ...s, ...patch } : s))
    onChange({ ...log, sets: nextSets })
  }

  function completeSet(index: number) {
    const set = log.sets[index]
    if (set.reps === null) return
    const nextSets = log.sets.map((s, i) => (i === index ? { ...s, completed: true } : s))
    onChange({ ...log, sets: nextSets })
    onSetCompleted(target)
  }

  function reopenSet(index: number) {
    const nextSets = log.sets.map((s, i) => (i === index ? { ...s, completed: false } : s))
    onChange({ ...log, sets: nextSets })
  }

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-semibold text-white">{target.name}</h3>
          <p className="text-xs text-slate-400">
            {rangeLabel(target)} &middot; rest {target.restSeconds}s
          </p>
        </div>
      </div>

      {lastEntry && (
        <div className="mt-2 rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-2">
          <p className="text-xs text-slate-400">
            Last time ({formatShortDate(lastEntry.date)}): <span className="text-slate-300">{lastSummary}</span>
            {hitTopOfRange(lastEntry.log) && <span className="text-amber-400"> 🔥</span>}
          </p>
          {suggestion && (
            <p className="mt-1 text-xs font-medium text-brand-400">
              {suggestion.isIncrease
                ? `Try ${suggestion.weight}${settings.weightUnit} today — you hit the top of the range on every set.`
                : `Try ${suggestion.weight}${settings.weightUnit} again — aim for ${target.repsMax} reps on every set.`}
            </p>
          )}
        </div>
      )}

      <div className="mt-3 space-y-2">
        {log.sets.map((set, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="w-14 shrink-0 text-xs text-slate-500">Set {i + 1}</span>
            {!isSecondsUnit && (
              <input
                type="number"
                inputMode="decimal"
                placeholder={settings.weightUnit}
                aria-label={`Set ${i + 1} weight`}
                value={set.weight ?? ''}
                disabled={set.completed}
                onChange={(e) => updateSet(i, { weight: e.target.value === '' ? null : Number(e.target.value) })}
                className="w-20 rounded-lg border border-slate-700 bg-slate-950 px-2 py-2 text-center text-sm text-white disabled:opacity-60"
              />
            )}
            <input
              type="number"
              inputMode="numeric"
              placeholder={isSecondsUnit ? 'sec' : 'reps'}
              aria-label={`Set ${i + 1} ${isSecondsUnit ? 'seconds' : 'reps'}`}
              value={set.reps ?? ''}
              disabled={set.completed}
              onChange={(e) => updateSet(i, { reps: e.target.value === '' ? null : Number(e.target.value) })}
              className="w-20 rounded-lg border border-slate-700 bg-slate-950 px-2 py-2 text-center text-sm text-white disabled:opacity-60"
            />
            {set.reps !== null && set.reps >= target.repsMax && (
              <span className="text-xs text-emerald-400" title="Top of rep range">
                ★
              </span>
            )}
            <div className="ml-auto">
              {set.completed ? (
                <button
                  type="button"
                  onClick={() => reopenSet(i)}
                  className="rounded-lg bg-emerald-600/20 px-3 py-2 text-sm font-medium text-emerald-400"
                >
                  ✓ Done
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => completeSet(i)}
                  disabled={set.reps === null}
                  className="rounded-lg bg-brand-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-40"
                >
                  Log set
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {recommendIncrease && (
        <div className="mt-3 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-300">
          🔥 Hit the top of the range on every set{' '}
          {nextWeight !== null
            ? `— try ${nextWeight}${settings.weightUnit} next time.`
            : '— increase the weight next session.'}
        </div>
      )}
    </div>
  )
}
