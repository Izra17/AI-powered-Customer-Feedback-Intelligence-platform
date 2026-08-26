import React from 'react'
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react'

export default function KPICard({ label, value, change, changeLabel, icon: Icon, accent = 'brand', invertChangeColor = false }) {
  const hasChange = change !== undefined && change !== null
  const isUp = hasChange && change > 0
  const isDown = hasChange && change < 0

  // For metrics where "up" is bad (e.g. return rate, critical issues),
  // invertChangeColor flips the green/red semantics.
  const positiveIsGood = !invertChangeColor
  const changeColor = isUp
    ? (positiveIsGood ? 'text-brand-600' : 'text-rose-600')
    : isDown
    ? (positiveIsGood ? 'text-rose-600' : 'text-brand-600')
    : 'text-ink-400'

  const accentBg = {
    brand: 'bg-brand-50 text-brand-600',
    rose: 'bg-rose-50 text-rose-600',
    amber: 'bg-amber-50 text-amber-600',
    sky: 'bg-sky-50 text-sky-600',
  }[accent]

  return (
    <div className="card p-5 flex flex-col gap-3 min-w-0">
      <div className="flex items-start justify-between">
        <span className="text-[13px] font-medium text-ink-400">{label}</span>
        {Icon && (
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${accentBg}`}>
            <Icon size={16} strokeWidth={2} />
          </div>
        )}
      </div>
      <div className="flex items-end justify-between gap-2">
        <span className="text-2xl font-semibold text-ink-900 tracking-tight truncate">{value}</span>
        {hasChange && (
          <span className={`flex items-center gap-0.5 text-xs font-medium ${changeColor} shrink-0 mb-0.5`}>
            {isUp && <ArrowUpRight size={13} />}
            {isDown && <ArrowDownRight size={13} />}
            {!isUp && !isDown && <Minus size={13} />}
            {Math.abs(change).toFixed(1)}% {changeLabel || ''}
          </span>
        )}
      </div>
    </div>
  )
}
