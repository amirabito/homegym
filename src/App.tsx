import { useEffect, useState } from 'react'
import { RestTimerProvider } from './lib/RestTimerContext'
import { RestTimerBar } from './components/RestTimerBar'
import { Home } from './components/Home'
import { SessionView } from './components/SessionView'
import { History } from './components/History'
import { ProgressView } from './components/ProgressView'
import { SettingsView } from './components/SettingsView'
import { getDay } from './data/workouts'
import { loadSessions, saveSessions, loadSettings, saveSettings } from './lib/storage'
import type { Settings, WorkoutSession } from './types'

type View =
  | { name: 'home' }
  | { name: 'session'; dayId: string }
  | { name: 'history' }
  | { name: 'progress' }
  | { name: 'settings' }

export default function App() {
  const [sessions, setSessions] = useState<WorkoutSession[]>(() => loadSessions())
  const [settings, setSettings] = useState<Settings>(() => loadSettings())
  const [view, setView] = useState<View>({ name: 'home' })

  useEffect(() => {
    saveSessions(sessions)
  }, [sessions])

  useEffect(() => {
    saveSettings(settings)
  }, [settings])

  function handleFinishSession(session: WorkoutSession) {
    setSessions((prev) => [...prev, session])
    setView({ name: 'home' })
  }

  function handleDeleteSession(sessionId: string) {
    setSessions((prev) => prev.filter((s) => s.id !== sessionId))
  }

  function handleUpdateSession(updated: WorkoutSession) {
    setSessions((prev) => prev.map((s) => (s.id === updated.id ? updated : s)))
  }

  function handleRestoreBackup(restoredSessions: WorkoutSession[], restoredSettings: Settings) {
    setSessions(restoredSessions)
    setSettings(restoredSettings)
  }

  return (
    <RestTimerProvider>
      {view.name === 'home' && (
        <Home
          sessions={sessions}
          onStartDay={(dayId) => setView({ name: 'session', dayId })}
          onViewHistory={() => setView({ name: 'history' })}
          onViewProgress={() => setView({ name: 'progress' })}
          onViewSettings={() => setView({ name: 'settings' })}
        />
      )}

      {view.name === 'session' &&
        (() => {
          const day = getDay(view.dayId)
          if (!day) return null
          return (
            <SessionView
              day={day}
              sessions={sessions}
              settings={settings}
              onFinish={handleFinishSession}
              onCancel={() => setView({ name: 'home' })}
            />
          )
        })()}

      {view.name === 'history' && (
        <History
          sessions={sessions}
          settings={settings}
          onBack={() => setView({ name: 'home' })}
          onDelete={handleDeleteSession}
          onUpdate={handleUpdateSession}
        />
      )}

      {view.name === 'progress' && (
        <ProgressView sessions={sessions} settings={settings} onBack={() => setView({ name: 'home' })} />
      )}

      {view.name === 'settings' && (
        <SettingsView
          sessions={sessions}
          settings={settings}
          onBack={() => setView({ name: 'home' })}
          onUpdateSettings={setSettings}
          onRestoreBackup={handleRestoreBackup}
        />
      )}

      <RestTimerBar />
    </RestTimerProvider>
  )
}
