import React from 'react'
import { TrendingUp, Package, ShieldAlert, Megaphone, Sparkles, ArrowRight } from 'lucide-react'
import { PRIORITY_STYLES } from '../utils/display.js'

const TYPE_META = {
  'Emerging Issue': { icon: TrendingUp, color: 'bg-rose-50 text-rose-600' },
  'Product Opportunity': { icon: Package, color: 'bg-sky-50 text-sky-600' },
  'Customer Experience Risk': { icon: ShieldAlert, color: 'bg-amber-50 text-amber-600' },
  'Marketing Opportunity': { icon: Megaphone, color: 'bg-brand-50 text-brand-600' },
}

export default function InsightCard({ insight }) {
  const meta = TYPE_META[insight.type] || { icon: Sparkles, color: 'bg-ink-100 text-ink-600' }
  const Icon = meta.icon

  return (
    <div className="card p-5 flex flex-col gap-3.5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${meta.color}`}>
            <Icon size={16} />
          </div>
          <span className="text-[11px] font-semibold uppercase tracking-wide text-ink-400">{insight.type}</span>
        </div>
        <span className={`badge ${PRIORITY_STYLES[insight.priority] || 'bg-ink-100 text-ink-600'}`}>
          {insight.priority} priority
        </span>
      </div>

      <h3 className="text-[15px] font-semibold text-ink-800 leading-snug">{insight.title}</h3>
      <p className="text-sm text-ink-500 leading-relaxed">{insight.explanation}</p>

      <div className="flex items-center gap-2 text-xs text-ink-400 bg-ink-50 rounded-lg px-3 py-2">
        <span className="font-medium text-ink-500">Supporting data:</span>
        {insight.supporting_metric}
      </div>

      <div className="flex items-start gap-2 pt-1 border-t border-ink-50 mt-0.5">
        <ArrowRight size={14} className="text-brand-500 shrink-0 mt-0.5" />
        <p className="text-sm text-ink-700">
          <span className="font-medium">Recommended action: </span>
          {insight.recommended_action}
        </p>
      </div>

      <div className="text-xs text-ink-400">
        Impact: <span className="font-medium text-ink-600">{insight.impact}</span>
      </div>
    </div>
  )
}
