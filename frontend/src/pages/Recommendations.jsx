import React, { useEffect, useState, useCallback } from 'react'
import { Package, Megaphone, Settings, ClipboardList } from 'lucide-react'

import Header from '../components/Header.jsx'
import FilterBar from '../components/FilterBar.jsx'
import { InlineLoading, ErrorState, EmptyState } from '../components/LoadingState.jsx'
import { useFilters } from '../context/FilterContext.jsx'
import api from '../services/api.js'
import { PRIORITY_STYLES } from '../utils/display.js'

const CATEGORY_META = {
  Product: { icon: Package, color: 'bg-sky-50 text-sky-600' },
  Marketing: { icon: Megaphone, color: 'bg-brand-50 text-brand-600' },
  Operations: { icon: Settings, color: 'bg-amber-50 text-amber-600' },
}

export default function Recommendations() {
  const { filters } = useFilters()
  const [recs, setRecs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [activeCategory, setActiveCategory] = useState('All')

  const load = useCallback(() => {
    setLoading(true)
    setError(false)
    api
      .getRecommendations({ product_id: filters.product_id, category: filters.category })
      .then((data) => setRecs(data.recommendations))
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [filters.product_id, filters.category])

  useEffect(() => {
    load()
  }, [load])

  const categories = ['All', 'Product', 'Marketing', 'Operations']
  const filtered = activeCategory === 'All' ? recs : recs.filter((r) => r.category === activeCategory)

  return (
    <div>
      <Header title="AI Recommendations" subtitle="Prioritized actions across product, marketing, and operations" />

      <div className="p-5 md:p-8 space-y-5">
        <FilterBar showTopic={false} />

        <div className="flex items-center gap-2 flex-wrap">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setActiveCategory(c)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors ${
                activeCategory === c
                  ? 'bg-ink-900 text-white'
                  : 'bg-white border border-ink-100 text-ink-500 hover:bg-ink-50'
              }`}
            >
              {c !== 'All' && CATEGORY_META[c] && React.createElement(CATEGORY_META[c].icon, { size: 14 })}
              {c}
              {c !== 'All' && (
                <span className="text-xs opacity-70">({recs.filter((r) => r.category === c).length})</span>
              )}
            </button>
          ))}
        </div>

        {error && <ErrorState onRetry={load} />}
        {!error && loading && <InlineLoading label="Generating recommendations..." />}

        {!error && !loading && (
          filtered.length === 0 ? (
            <EmptyState message="No recommendations" detail="Try adjusting your filters." />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filtered.map((r) => {
                const meta = CATEGORY_META[r.category] || { icon: ClipboardList, color: 'bg-ink-100 text-ink-600' }
                const Icon = meta.icon
                return (
                  <div key={r.id} className="card p-5 flex flex-col gap-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${meta.color}`}>
                          <Icon size={16} />
                        </div>
                        <span className="text-[11px] font-semibold uppercase tracking-wide text-ink-400">{r.category}</span>
                      </div>
                      <span className={`badge ${PRIORITY_STYLES[r.priority]}`}>{r.priority} priority</span>
                    </div>

                    <h3 className="text-[15px] font-semibold text-ink-800 leading-snug">{r.title}</h3>
                    <p className="text-sm text-ink-500 leading-relaxed">{r.reason}</p>

                    <div className="text-xs text-ink-400 bg-ink-50 rounded-lg px-3 py-2">
                      <span className="font-medium text-ink-500">Metric: </span>
                      {r.supporting_metric}
                    </div>

                    <div className="pt-1 border-t border-ink-50 mt-0.5">
                      <p className="text-sm text-ink-700">
                        <span className="font-medium">Action: </span>
                        {r.recommended_action}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          )
        )}
      </div>
    </div>
  )
}
