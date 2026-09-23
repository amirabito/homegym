import { useRef, useState, type ChangeEvent } from 'react'
import type { Settings, WorkoutSession } from '../types'
import { exportBackup, parseBackupFile } from '../lib/backup'

interface Props {
  sessions: WorkoutSession[]
  settings: Settings
  onBack: () => void
  onUpdateSettings: (settings: Settings) => void
  onRestoreBackup: (sessions: WorkoutSession[], settings: Settings) => void
}

export function SettingsView({ sessions, settings, onBack, onUpdateSettings, onRestoreBackup }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [importError, setImportError] = useState<string | null>(null)
  const [importSuccess, setImportSuccess] = useState<string | null>(null)

  function handleFileChosen(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = '' // allow re-selecting the same file later
    if (!file) return
    setImportError(null)
    setImportSuccess(null)

    file
      .text()
      .then((text) => {
        const parsed = parseBackupFile(text)
        const proceed = window.confirm(
          `This will replace your current data with the backup (${parsed.sessions.length} workout${parsed.sessions.length === 1 ? '' : 's'}). Continue?`,
        )
        if (!proceed) return
        onRestoreBackup(parsed.sessions, parsed.settings)
        setImportSuccess('Backup restored.')
      })
      .catch((err: unknown) => {
        setImportError(err instanceof Error ? err.message : 'Could not read that file.')
      })
  }

  return (
    <div className="mx-auto max-w-lg px-4 pb-16 pt-6">
      <button type="button" onClick={onBack} className="mb-4 text-sm text-slate-400">
        &larr; Back
      </button>
      <h1 className="text-xl font-bold text-white">Settings</h1>

      <div className="mt-4 rounded-xl border border-slate-800 bg-slate-900 p-4">
        <h2 className="text-sm font-semibold text-white">Units</h2>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-sm text-slate-300">Weight unit</span>
          <div className="flex overflow-hidden rounded-lg border border-slate-700">
            {(['lb', 'kg'] as const).map((unit) => (
              <button
                key={unit}
                type="button"
                onClick={() => onUpdateSettings({ ...settings, weightUnit: unit })}
                className={`px-4 py-1.5 text-sm font-medium ${
                  settings.weightUnit === unit ? 'bg-brand-600 text-white' : 'bg-slate-950 text-slate-400'
                }`}
              >
                {unit}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div>
            <span className="text-sm text-slate-300">Progression step</span>
            <p className="text-xs text-slate-500">Added to the suggested weight after a top-of-range session</p>
          </div>
          <input
            type="number"
            inputMode="decimal"
            min={0}
            value={settings.weightIncrement}
            onChange={(e) => {
              const value = e.target.value === '' ? 0 : Number(e.target.value)
              onUpdateSettings({ ...settings, weightIncrement: value })
            }}
            className="w-20 rounded-lg border border-slate-700 bg-slate-950 px-2 py-1.5 text-center text-sm text-white"
          />
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-slate-800 bg-slate-900 p-4">
        <h2 className="text-sm font-semibold text-white">Rest timer</h2>
        <div className="mt-3 flex items-center justify-between">
          <div>
            <span className="text-sm text-slate-300">Voice countdown</span>
            <p className="text-xs text-slate-500">Says "30 seconds", then counts down out loud from 10</p>
          </div>
          <div className="flex overflow-hidden rounded-lg border border-slate-700">
            {([true, false] as const).map((value) => (
              <button
                key={String(value)}
                type="button"
                onClick={() => onUpdateSettings({ ...settings, voiceCountdown: value })}
                className={`px-4 py-1.5 text-sm font-medium ${
                  settings.voiceCountdown === value ? 'bg-brand-600 text-white' : 'bg-slate-950 text-slate-400'
                }`}
              >
                {value ? 'On' : 'Off'}
              </button>
            ))}
          </div>
        </div>
        <p className="mt-3 text-xs text-slate-500">
          On Android and desktop, HomeGym can also show a notification when a rest period finishes even if you've
          switched apps or the screen has locked (allow notifications when prompted). iPhone Safari doesn't support
          that outside an installed app — the voice countdown and in-app sound/vibration above still work there,
          which is why they're on by default.
        </p>
      </div>

      <div className="mt-4 rounded-xl border border-slate-800 bg-slate-900 p-4">
        <h2 className="text-sm font-semibold text-white">Backup &amp; restore</h2>
        <p className="mt-1 text-xs text-slate-500">
          Your data only lives in this browser. Export it to keep a copy, or move it to another device.
        </p>

        <button
          type="button"
          onClick={() => exportBackup(sessions, settings)}
          className="mt-3 w-full rounded-lg bg-brand-600 py-2.5 text-sm font-semibold text-white active:bg-brand-700"
        >
          Export backup ({sessions.filter((s) => s.finishedAt).length} workouts)
        </button>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="mt-2 w-full rounded-lg border border-slate-700 py-2.5 text-sm font-medium text-slate-200 active:bg-slate-800"
        >
          Import backup&hellip;
        </button>
        <input ref={fileInputRef} type="file" accept="application/json" onChange={handleFileChosen} className="hidden" />

        {importError && <p className="mt-2 text-xs text-red-400">{importError}</p>}
        {importSuccess && <p className="mt-2 text-xs text-emerald-400">{importSuccess}</p>}
      </div>
    </div>
  )
}
