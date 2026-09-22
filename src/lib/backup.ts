import { DEFAULT_SETTINGS } from './storage'
import type { Settings, WorkoutSession } from '../types'

interface BackupFile {
  app: 'homegym'
  version: 1
  exportedAt: string
  sessions: WorkoutSession[]
  settings: Settings
}

export function exportBackup(sessions: WorkoutSession[], settings: Settings): void {
  const payload: BackupFile = {
    app: 'homegym',
    version: 1,
    exportedAt: new Date().toISOString(),
    sessions,
    settings,
  }
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  const stamp = new Date().toISOString().slice(0, 10)
  a.href = url
  a.download = `homegym-backup-${stamp}.json`
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

export interface ParsedBackup {
  sessions: WorkoutSession[]
  settings: Settings
}

/** Throws with a human-readable message if the file doesn't look like a HomeGym backup. */
export function parseBackupFile(text: string): ParsedBackup {
  let data: unknown
  try {
    data = JSON.parse(text)
  } catch {
    throw new Error('That file is not valid JSON.')
  }
  if (typeof data !== 'object' || data === null || !Array.isArray((data as Partial<BackupFile>).sessions)) {
    throw new Error('That file doesn’t look like a HomeGym backup.')
  }
  const parsed = data as Partial<BackupFile>
  return {
    sessions: parsed.sessions as WorkoutSession[],
    settings: { ...DEFAULT_SETTINGS, ...(parsed.settings ?? {}) },
  }
}
