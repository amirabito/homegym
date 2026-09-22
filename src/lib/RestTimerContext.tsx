import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { playBeep } from './beep'

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

export function RestTimerProvider({ children }: { children: ReactNode }) {
  const [totalSeconds, setTotalSeconds] = useState(0)
  const [secondsLeft, setSecondsLeft] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [label, setLabel] = useState('')
  const intervalRef = useRef<number | null>(null)
  const hasFiredRef = useRef(false)

  const clear = useCallback(() => {
    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  useEffect(() => clear, [clear])

  const start = useCallback(
    (seconds: number, newLabel = 'Rest') => {
      clear()
      hasFiredRef.current = false
      setTotalSeconds(seconds)
      setSecondsLeft(seconds)
      setLabel(newLabel)
      setIsRunning(true)
    },
    [clear],
  )

  const skip = useCallback(() => {
    clear()
    setIsRunning(false)
    setSecondsLeft(0)
  }, [clear])

  const dismiss = useCallback(() => {
    clear()
    setIsRunning(false)
    setSecondsLeft(0)
    setTotalSeconds(0)
  }, [clear])

  const pause = useCallback(() => setIsRunning(false), [])
  const resume = useCallback(() => {
    if (secondsLeft > 0) setIsRunning(true)
  }, [secondsLeft])

  const addTime = useCallback((delta: number) => {
    setSecondsLeft((s) => Math.max(0, s + delta))
    setTotalSeconds((t) => Math.max(t, t + Math.max(0, delta)))
  }, [])

  useEffect(() => {
    if (!isRunning) return
    intervalRef.current = window.setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          return 0
        }
        return s - 1
      })
    }, 1000)
    return clear
  }, [isRunning, clear])

  useEffect(() => {
    if (secondsLeft === 0 && isRunning) {
      setIsRunning(false)
      clear()
      if (!hasFiredRef.current) {
        hasFiredRef.current = true
        playBeep()
      }
    }
  }, [secondsLeft, isRunning, clear])

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
