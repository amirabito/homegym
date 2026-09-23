import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { playBeep } from './beep'
import { speak } from './speech'

interface RestTimerState {
  secondsLeft: number
  totalSeconds: number
  isRunning: boolean
  label: string
  start: (seconds: number, label?: string) => void
  pause: () => void
  resume: () => void
  addTime: (delta: number) => void
  skip: () => void
  dismiss: () => void
}

const RestTimerContext = createContext<RestTimerState | null>(null)

function requestNotificationPermissionIfNeeded() {
  if (typeof Notification === 'undefined') return
  if (Notification.permission === 'default') {
    // Fire-and-forget; must be called from a user-gesture call stack (start() is only ever
    // invoked from click handlers), which is what lets browsers grant this without a prompt-abuse block.
    void Notification.requestPermission()
  }
}

function notifyIfHidden(label: string) {
  if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return
  if (typeof document !== 'undefined' && !document.hidden) return
  try {
    new Notification('Rest complete', { body: `${label} — back to it!`, tag: 'homegym-rest-timer' })
  } catch {
    // Some browsers (notably iOS Safari outside an installed PWA) don't support the
    // Notification constructor at all — the in-app beep/vibration is the fallback there.
  }
}

interface ProviderProps {
  children: ReactNode
  /** Whether to speak a 30s warning and count down 10→1 aloud. Defaults to on. */
  voiceCountdownEnabled?: boolean
}

export function RestTimerProvider({ children, voiceCountdownEnabled = true }: ProviderProps) {
  const [totalSeconds, setTotalSeconds] = useState(0)
  const [secondsLeft, setSecondsLeft] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [label, setLabel] = useState('')
  const intervalRef = useRef<number | null>(null)
  const hasFiredRef = useRef(false)
  // Absolute completion time, not a countdown to decrement — this way a throttled/suspended
  // background tab still reports the correct remaining time the moment it ticks again,
  // instead of drifting behind by however long it was backgrounded.
  const endAtRef = useRef<number | null>(null)
  // Which countdown values have already been spoken this run, so a re-render or a
  // catch-up recompute never repeats (or retroactively speaks skipped-over) a number.
  const spokenRef = useRef<Set<number>>(new Set())
  const voiceEnabledRef = useRef(voiceCountdownEnabled)

  useEffect(() => {
    voiceEnabledRef.current = voiceCountdownEnabled
  }, [voiceCountdownEnabled])

  const clear = useCallback(() => {
    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  useEffect(() => clear, [clear])

  const maybeAnnounce = useCallback((remaining: number) => {
    if (!voiceEnabledRef.current) return
    if (spokenRef.current.has(remaining)) return
    if (remaining === 30) {
      spokenRef.current.add(remaining)
      speak('30 seconds')
    } else if (remaining >= 1 && remaining <= 10) {
      spokenRef.current.add(remaining)
      speak(String(remaining))
    }
  }, [])

  const fireCompletion = useCallback(() => {
    if (hasFiredRef.current) return
    hasFiredRef.current = true
    playBeep()
    notifyIfHidden(label)
  }, [label])

  const recomputeFromEndAt = useCallback(() => {
    if (endAtRef.current === null) return
    const remaining = Math.max(0, Math.ceil((endAtRef.current - Date.now()) / 1000))
    setSecondsLeft(remaining)
    maybeAnnounce(remaining)
    if (remaining === 0) {
      setIsRunning(false)
      clear()
      fireCompletion()
    }
  }, [clear, fireCompletion, maybeAnnounce])

  const start = useCallback(
    (seconds: number, newLabel = 'Rest') => {
      clear()
      hasFiredRef.current = false
      spokenRef.current = new Set()
      endAtRef.current = Date.now() + seconds * 1000
      setTotalSeconds(seconds)
      setSecondsLeft(seconds)
      setLabel(newLabel)
      setIsRunning(true)
      requestNotificationPermissionIfNeeded()
      maybeAnnounce(seconds)
    },
    [clear, maybeAnnounce],
  )

  const skip = useCallback(() => {
    clear()
    endAtRef.current = null
    setIsRunning(false)
    setSecondsLeft(0)
  }, [clear])

  const dismiss = useCallback(() => {
    clear()
    endAtRef.current = null
    setIsRunning(false)
    setSecondsLeft(0)
    setTotalSeconds(0)
  }, [clear])

  const pause = useCallback(() => {
    clear()
    endAtRef.current = null
    setIsRunning(false)
  }, [clear])

  const resume = useCallback(() => {
    setSecondsLeft((s) => {
      if (s > 0) {
        endAtRef.current = Date.now() + s * 1000
        setIsRunning(true)
      }
      return s
    })
  }, [])

  const addTime = useCallback(
    (delta: number) => {
      if (endAtRef.current !== null) endAtRef.current += delta * 1000
      setSecondsLeft((s) => {
        const next = Math.max(0, s + delta)
        maybeAnnounce(next)
        return next
      })
      setTotalSeconds((t) => Math.max(t, t + Math.max(0, delta)))
    },
    [maybeAnnounce],
  )

  useEffect(() => {
    if (!isRunning) return
    intervalRef.current = window.setInterval(recomputeFromEndAt, 1000)
    return clear
  }, [isRunning, clear, recomputeFromEndAt])

  // Catch up immediately when the tab regains focus/visibility, since background intervals
  // are throttled (or fully suspended) by the browser and may not have ticked in a while.
  useEffect(() => {
    function onVisible() {
      if (document.visibilityState === 'visible' && isRunning) recomputeFromEndAt()
    }
    document.addEventListener('visibilitychange', onVisible)
    window.addEventListener('focus', onVisible)
    return () => {
      document.removeEventListener('visibilitychange', onVisible)
      window.removeEventListener('focus', onVisible)
    }
  }, [isRunning, recomputeFromEndAt])

  return (
    <RestTimerContext.Provider
      value={{ secondsLeft, totalSeconds, isRunning, label, start, pause, resume, addTime, skip, dismiss }}
    >
      {children}
    </RestTimerContext.Provider>
  )
}

export function useRestTimer(): RestTimerState {
  const ctx = useContext(RestTimerContext)
  if (!ctx) throw new Error('useRestTimer must be used within RestTimerProvider')
  return ctx
}
