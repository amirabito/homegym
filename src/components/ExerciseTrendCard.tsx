import { useState } from 'react'
import type { ExerciseSeries } from '../lib/exerciseHistory'
import { TrendChart } from './TrendChart'
import { VIZ_GOOD } from '../lib/vizColors'

interface Props {
  series: ExerciseSeries
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

export function ExerciseTrendCard({ series }: Props) {
  const [showTable, setShowTable] = useState(false)
  const { points, valueLabel, name } = series
  const latest = points[points.length - 1]
  const first = points[0]
  const delta = latest.value !== null && first.value !== null ? latest.value - first.value : null
  const prCount = points.filter((p) => p.hitTopOfRange).length

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-semibold text-white">{name}</h3>
          <p className="text-xs text-slate-500">
            {points.length} session{points.length === 1 ? '' : 's'} logged
          </p>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold tabular-nums text-white">
            {latest.value ?? '–'} <span className="text-xs font-normal text-slate-500">{valueLabel}</span>
          </p>
          {delta !== null && points.length > 1 && (
            <p
              className={`text-xs font-medium ${delta > 0 ? '' : 'text-slate-500'}`}
              style={delta > 0 ? { color: VIZ_GOOD } : undefined}
            >
              {delta > 0 ? '▲' : delta < 0 ? '▼' : '–'} {Math.abs(delta)} {valueLabel} since first log
            </p>
          )}
        </div>
      </div>

      {points.length > 1 ? (
        <div className="mt-3">
          <TrendChart points={points} valueLabel={valueLabel} />
        </div>
      ) : (
        <p className="mt-3 text-xs text-slate-500">Log this exercise again to start seeing a trend.</p>
      )}

      {prCount > 0 && (
        <p className="mt-2 text-xs text-amber-400">
          🔥 Hit top of rep range {prCount} time{prCount === 1 ? '' : 's'}
        </p>
      )}

      <button type="button" onClick={() => setShowTable((v) => !v)} className="mt-3 text-xs text-brand-400">
        {showTable ? 'Hide' : 'View'} session-by-session data
      </button>

      {showTable && (
        <div className="mt-2 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-slate-500">
                <th className="py-1 pr-3 font-normal">Date</th>
                <th className="py-1 font-normal">Sets</th>
              </tr>
            </thead>
            <tbody>
              {[...points]
                .reverse()
                .map((p) => (
                  <tr key={p.sessionId} className="border-t border-slate-800">
                    <td className="whitespace-nowrap py-1.5 pr-3 text-slate-300">{formatDate(p.date)}</td>
                    <td className="py-1.5 text-slate-400">{p.setsSummary || '–'}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
