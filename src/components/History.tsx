import { useState } from 'react'
import type { Settings, WorkoutSession } from '../types'
import { hitTopOfRange } from '../lib/progress'

interface Props {
  sessions: WorkoutSession[]
  settings: Settings
  onBack: () => void
  onDelete: (sessionId: string) => void
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })
}

function formatDuration(start: string, end: string): string {
  const mins = Math.round((new Date(end).getTime() - new Date(start).getTime()) / 60000)
  return `${mins} min`
}

export function History({ sessions, settings, onBack, onDelete }: Props) {
  const [openId, setOpenId] = useState<string | null>(null)
  const finished = [...sessions]
    .filter((s) => s.finishedAt)
    .sort((a, b) => new Date(b.finishedAt!).getTime() - new Date(a.finishedAt!).getTime())

  return (
    <div className="mx-auto max-w-lg px-4 pb-16 pt-6">
      <button type="button" onClick={onBack} className="mb-4 text-sm text-slate-400">
        &larr; Back
      </button>
      <h1 className="text-xl font-bold text-white">History</h1>

      {finished.length === 0 && <p className="mt-6 text-sm text-slate-500">No workouts logged yet.</p>}

      <div className="mt-4 space-y-3">
        {finished.map((session) => {
          const isOpen = openId === session.id
          const setsLogged = session.exercises.reduce((sum, e) => sum + e.sets.filter((s) => s.completed).length, 0)
          return (
            <div key={session.id} className="rounded-xl border border-slate-800 bg-slate-900">
              <button
                type="button"
                onClick={() => setOpenId(isOpen ? null : session.id)}
                className="flex w-full items-center justify-between px-4 py-3 text-left"
              >
                <div>
                  <p className="font-medium text-white">{session.dayName}</p>
                  <p className="text-xs text-slate-500">
                    {formatDate(session.finishedAt!)} &middot; {formatDuration(session.startedAt, session.finishedAt!)}{' '}
                    &middot; {setsLogged} sets
                  </p>
                </div>
                <span className="text-slate-500">{isOpen ? '▲' : '▼'}</span>
              </button>

              {isOpen && (
                <div className="space-y-3 border-t border-slate-800 px-4 py-3">
                  {session.exercises
                    .filter((e) => e.sets.some((s) => s.completed))
                    .map((e) => (
                      <div key={e.exerciseId} className="text-sm">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-slate-200">{e.exerciseName}</span>
                          {hitTopOfRange(e) && <span className="text-xs text-amber-400">🔥 top of range</span>}
                        </div>
                        <p className="text-xs text-slate-500">
                          {e.sets
                            .filter((s) => s.completed)
                            .map(
                              (s, i) =>
                                `Set ${i + 1}: ${s.weight ?? '-'}${e.unit === 'seconds' ? '' : settings.weightUnit} × ${s.reps ?? '-'}${e.unit === 'seconds' ? 's' : ''}`,
                            )
                            .join(' · ')}
                        </p>
                      </div>
                    ))}
                  {session.notes && <p className="text-xs italic text-slate-500">"{session.notes}"</p>}
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm('Delete this workout log? This cannot be undone.')) onDelete(session.id)
                    }}
                    className="mt-2 text-xs text-red-400"
                  >
                    Delete this log
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
