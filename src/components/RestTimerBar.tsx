import { useRestTimer } from '../lib/RestTimerContext'

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function RestTimerBar() {
  const { secondsLeft, totalSeconds, isRunning, label, pause, resume, addTime, skip, dismiss } = useRestTimer()

  if (totalSeconds <= 0) return null

  const done = secondsLeft === 0
  const progress = totalSeconds > 0 ? ((totalSeconds - secondsLeft) / totalSeconds) * 100 : 0

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-800 bg-slate-900/95 backdrop-blur pb-[env(safe-area-inset-bottom,0px)]"
      role="status"
      aria-live="polite"
    >
      <div className="h-1 w-full bg-slate-800">
        <div
          className={`h-full transition-all duration-1000 ease-linear ${done ? 'bg-emerald-500' : 'bg-brand-500'}`}
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="mx-auto flex max-w-lg items-center gap-3 px-4 py-3">
        <div className="flex-1">
          <p className="text-xs uppercase tracking-wide text-slate-400">{done ? 'Rest complete' : label}</p>
          <p className={`text-2xl font-bold tabular-nums ${done ? 'text-emerald-400' : 'text-white'}`}>
            {done ? "Let's go!" : formatTime(secondsLeft)}
          </p>
        </div>
        {!done && (
          <>
            <button
              type="button"
              onClick={() => addTime(-15)}
              className="rounded-lg bg-slate-800 px-3 py-2 text-sm font-medium text-slate-200 active:bg-slate-700"
            >
              -15s
            </button>
            <button
              type="button"
              onClick={() => addTime(15)}
              className="rounded-lg bg-slate-800 px-3 py-2 text-sm font-medium text-slate-200 active:bg-slate-700"
            >
              +15s
            </button>
            <button
              type="button"
              onClick={() => (isRunning ? pause() : resume())}
              className="rounded-lg bg-slate-800 px-3 py-2 text-sm font-medium text-slate-200 active:bg-slate-700"
            >
              {isRunning ? 'Pause' : 'Resume'}
            </button>
            <button
              type="button"
              onClick={skip}
              className="rounded-lg bg-brand-600 px-3 py-2 text-sm font-semibold text-white active:bg-brand-700"
            >
              Skip
            </button>
          </>
        )}
        {done && (
          <button
            type="button"
            onClick={dismiss}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white active:bg-emerald-700"
          >
            Dismiss
          </button>
        )}
      </div>
    </div>
  )
}
