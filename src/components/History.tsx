import { useState } from 'react'
import type { ExerciseLog, Settings, WorkoutSession } from '../types'
import { hitTopOfRange } from '../lib/progress'

interface Props {
  sessions: WorkoutSession[]
  settings: Settings
  onBack: () => void
  onDelete: (sessionId: string) => void
  onUpdate: (session: WorkoutSession) => void
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })
}

function formatDuration(start: string, end: string): string {
  const mins = Math.round((new Date(end).getTime() - new Date(start).getTime()) / 60000)
  return `${mins} min`
}

export function History({ sessions, settings, onBack, onDelete, onUpdate }: Props) {
  const [openId, setOpenId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draft, setDraft] = useState<WorkoutSession | null>(null)

  const finished = [...sessions]
    .filter((s) => s.finishedAt)
    .sort((a, b) => new Date(b.finishedAt!).getTime() - new Date(a.finishedAt!).getTime())

  function startEditing(session: WorkoutSession) {
    setDraft(structuredClone(session))
    setEditingId(session.id)
    setOpenId(session.id)
  }

  function cancelEditing() {
    setDraft(null)
    setEditingId(null)
  }

  function saveEditing() {
    if (draft) onUpdate(draft)
    setDraft(null)
    setEditingId(null)
  }

  function updateDraftExercise(exerciseId: string, patch: Partial<ExerciseLog>) {
    setDraft((prev) =>
      prev
        ? { ...prev, exercises: prev.exercises.map((e) => (e.exerciseId === exerciseId ? { ...e, ...patch } : e)) }
        : prev,
    )
  }

  function updateDraftSet(exerciseId: string, setIndex: number, patch: { weight?: number | null; reps?: number | null }) {
    setDraft((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        exercises: prev.exercises.map((e) =>
          e.exerciseId === exerciseId
            ? { ...e, sets: e.sets.map((s, i) => (i === setIndex ? { ...s, ...patch } : s)) }
            : e,
        ),
      }
    })
  }

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
          const isEditing = editingId === session.id
          const displaySession = isEditing && draft ? draft : session
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
                  {displaySession.exercises
                    .filter((e) => e.sets.some((s) => s.completed))
                    .map((e) => (
                      <div key={e.exerciseId} className="text-sm">
                        <div className="flex items-center justify-between gap-2">
                          {isEditing ? (
                            <input
                              type="text"
                              aria-label="Exercise name"
                              value={e.exerciseName}
                              onChange={(ev) => updateDraftExercise(e.exerciseId, { exerciseName: ev.target.value })}
                              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-2 py-1 text-sm font-medium text-white"
                            />
                          ) : (
                            <>
                              <span className="font-medium text-slate-200">{e.exerciseName}</span>
                              {hitTopOfRange(e) && <span className="shrink-0 text-xs text-amber-400">🔥 top of range</span>}
                            </>
                          )}
                        </div>

                        {isEditing ? (
                          <div className="mt-2 space-y-1.5">
                            {e.sets.map((set, i) =>
                              set.completed ? (
                                <div key={i} className="flex items-center gap-2">
                                  <span className="w-10 shrink-0 text-xs text-slate-500">#{i + 1}</span>
                                  {e.unit !== 'seconds' && (
                                    <input
                                      type="number"
                                      inputMode="decimal"
                                      aria-label={`Set ${i + 1} weight`}
                                      value={set.weight ?? ''}
                                      onChange={(ev) =>
                                        updateDraftSet(e.exerciseId, i, {
                                          weight: ev.target.value === '' ? null : Number(ev.target.value),
                                        })
                                      }
                                      className="w-16 rounded-lg border border-slate-700 bg-slate-950 px-2 py-1 text-center text-xs text-white"
                                    />
                                  )}
                                  <input
                                    type="number"
                                    inputMode="numeric"
                                    aria-label={`Set ${i + 1} ${e.unit === 'seconds' ? 'seconds' : 'reps'}`}
                                    value={set.reps ?? ''}
                                    onChange={(ev) =>
                                      updateDraftSet(e.exerciseId, i, {
                                        reps: ev.target.value === '' ? null : Number(ev.target.value),
                                      })
                                    }
                                    className="w-16 rounded-lg border border-slate-700 bg-slate-950 px-2 py-1 text-center text-xs text-white"
                                  />
                                  <span className="text-xs text-slate-500">{e.unit === 'seconds' ? 'sec' : 'reps'}</span>
                                </div>
                              ) : null,
                            )}
                          </div>
                        ) : (
                          <p className="text-xs text-slate-500">
                            {e.sets
                              .filter((s) => s.completed)
                              .map(
                                (s, i) =>
                                  `Set ${i + 1}: ${s.weight ?? '-'}${e.unit === 'seconds' ? '' : settings.weightUnit} × ${s.reps ?? '-'}${e.unit === 'seconds' ? 's' : ''}`,
                              )
                              .join(' · ')}
                          </p>
                        )}
                      </div>
                    ))}

                  {isEditing ? (
                    <div>
                      <label className="mb-1 block text-xs uppercase tracking-wide text-slate-500">Notes</label>
                      <textarea
                        value={displaySession.notes}
                        onChange={(ev) => setDraft((prev) => (prev ? { ...prev, notes: ev.target.value } : prev))}
                        rows={2}
                        className="w-full rounded-lg border border-slate-700 bg-slate-950 p-2 text-xs text-white"
                      />
                    </div>
                  ) : (
                    session.notes && <p className="text-xs italic text-slate-500">"{session.notes}"</p>
                  )}

                  <div className="flex items-center gap-4 pt-1">
                    {isEditing ? (
                      <>
                        <button type="button" onClick={saveEditing} className="text-xs font-medium text-emerald-400">
                          Save changes
                        </button>
                        <button type="button" onClick={cancelEditing} className="text-xs text-slate-400">
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button type="button" onClick={() => startEditing(session)} className="text-xs text-brand-400">
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm('Delete this workout log? This cannot be undone.')) onDelete(session.id)
                          }}
                          className="text-xs text-red-400"
                        >
                          Delete this log
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
