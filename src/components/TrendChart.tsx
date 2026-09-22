import { useState } from 'react'
import type { ExercisePoint } from '../lib/exerciseHistory'
import { VIZ_GRIDLINE, VIZ_MUTED, VIZ_SERIES } from '../lib/vizColors'

interface Props {
  points: ExercisePoint[]
  valueLabel: string
}

const WIDTH = 320
const HEIGHT = 130
const PAD_X = 8
const PAD_TOP = 26
const PAD_BOTTOM = 20

function formatShortDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

export function TrendChart({ points, valueLabel }: Props) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  const values = points.map((p) => p.value ?? 0)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1
  const plotW = WIDTH - PAD_X * 2
  const plotH = HEIGHT - PAD_TOP - PAD_BOTTOM

  const coords = points.map((p, i) => {
    const x = points.length === 1 ? WIDTH / 2 : PAD_X + (i / (points.length - 1)) * plotW
    const v = p.value ?? min
    const y = PAD_TOP + plotH - ((v - min) / range) * plotH
    return { x, y, point: p }
  })

  function nearestIndexAt(clientX: number, currentTarget: SVGSVGElement): number {
    const rect = currentTarget.getBoundingClientRect()
    const relX = ((clientX - rect.left) / rect.width) * WIDTH
    let nearest = 0
    let bestDist = Infinity
    coords.forEach((c, i) => {
      const d = Math.abs(c.x - relX)
      if (d < bestDist) {
        bestDist = d
        nearest = i
      }
    })
    return nearest
  }

  const linePath = coords.map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x.toFixed(1)} ${c.y.toFixed(1)}`).join(' ')
  const active = activeIndex !== null ? coords[activeIndex] : null
  const last = coords[coords.length - 1]

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="w-full touch-none"
        role="img"
        aria-label={`Trend of ${points.length} logged sessions, from ${points[0].value ?? '–'} to ${last.point.value ?? '–'} ${valueLabel}. Tap a point for session details.`}
        onPointerMove={(e) => {
          // Desktop mouse: follow continuously. Touch has no real "hover", so it's
          // handled as a discrete tap on pointer-up below instead.
          if (e.pointerType !== 'mouse') return
          setActiveIndex(nearestIndexAt(e.clientX, e.currentTarget))
        }}
        onPointerLeave={(e) => {
          if (e.pointerType !== 'mouse') return
          setActiveIndex(null)
        }}
        onPointerUp={(e) => {
          if (e.pointerType === 'mouse') return
          const nearest = nearestIndexAt(e.clientX, e.currentTarget)
          setActiveIndex((current) => (current === nearest ? null : nearest))
        }}
      >
        <line x1={PAD_X} y1={HEIGHT - PAD_BOTTOM} x2={WIDTH - PAD_X} y2={HEIGHT - PAD_BOTTOM} stroke={VIZ_GRIDLINE} strokeWidth={1} />

        {active && (
          <line x1={active.x} y1={PAD_TOP} x2={active.x} y2={HEIGHT - PAD_BOTTOM} stroke={VIZ_GRIDLINE} strokeWidth={1} />
        )}

        <path d={linePath} fill="none" stroke={VIZ_SERIES} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />

        {coords.map((c, i) => (
          <circle
            key={i}
            cx={c.x}
            cy={c.y}
            r={i === activeIndex || i === coords.length - 1 ? 4 : 3}
            fill={VIZ_SERIES}
            stroke="#0f172a"
            strokeWidth={2}
          />
        ))}

        {/* generous, focusable hit targets for keyboard nav; tap/click is handled by the svg above */}
        {coords.map((c, i) => (
          <circle
            key={`hit-${i}`}
            cx={c.x}
            cy={c.y}
            r={14}
            fill="transparent"
            tabIndex={0}
            role="button"
            aria-label={`${formatShortDate(c.point.date)}: ${c.point.value ?? '–'} ${valueLabel}`}
            onFocus={() => setActiveIndex(i)}
          />
        ))}

        <text
          x={last.x}
          y={last.y - 12}
          textAnchor="end"
          fontSize="11"
          fill={VIZ_MUTED}
          stroke="#0f172a"
          strokeWidth={3}
          paintOrder="stroke"
        >
          {last.point.value ?? '–'} {valueLabel}
        </text>
      </svg>

      {active && (
        <div
          className="pointer-events-none absolute top-0 rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-xs shadow-lg"
          style={{
            left: `${Math.min(85, Math.max(0, (active.x / WIDTH) * 100))}%`,
            transform: active.x / WIDTH > 0.7 ? 'translateX(-100%)' : undefined,
          }}
        >
          <p className="text-slate-400">{formatShortDate(active.point.date)}</p>
          <p className="font-semibold text-white">
            {active.point.value ?? '–'} {valueLabel}
          </p>
          {active.point.setsSummary && <p className="text-slate-500">{active.point.setsSummary}</p>}
        </div>
      )}
    </div>
  )
}
