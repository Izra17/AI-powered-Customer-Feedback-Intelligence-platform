import React from 'react'

export default function ChartCard({ title, subtitle, action, children, className = '' }) {
  return (
    <div className={`card p-5 flex flex-col min-w-0 ${className}`}>
      <div className="flex items-start justify-between mb-4 gap-3">
        <div>
          <h3 className="text-sm font-semibold text-ink-800">{title}</h3>
          {subtitle && <p className="text-xs text-ink-400 mt-0.5">{subtitle}</p>}
        </div>
        {action}
      </div>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  )
}
