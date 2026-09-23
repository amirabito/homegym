import type { Settings, WorkoutSession } from '../types'

const SESSIONS_KEY = 'homegym.sessions.v1'
const SETTINGS_KEY = 'homegym.settings.v1'

export const DEFAULT_SETTINGS: Settings = {
  weightUnit: 'lb',
  weightIncrement: 5,
  voiceCountdown: true,
}

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback
  try {
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export function loadSessions(): WorkoutSession[] {
  return safeParse<WorkoutSession[]>(localStorage.getItem(SESSIONS_KEY), [])
}

export function saveSessions(sessions: WorkoutSession[]): void {
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions))
}

export function loadSettings(): Settings {
  return { ...DEFAULT_SETTINGS, ...safeParse<Partial<Settings>>(localStorage.getItem(SETTINGS_KEY), {}) }
}

export function saveSettings(settings: Settings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
}
