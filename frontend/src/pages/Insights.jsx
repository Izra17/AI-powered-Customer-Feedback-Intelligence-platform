import React, { useEffect, useState, useCallback } from 'react'
import { Sparkles } from 'lucide-react'

import Header from '../components/Header.jsx'
import FilterBar from '../components/FilterBar.jsx'
import InsightCard from '../components/InsightCard.jsx'
import { InlineLoading, ErrorState, EmptyState } from '../components/LoadingState.jsx'
import { useFilters } from '../context/FilterContext.jsx'
import api from '../services/api.js'

export default function Insights() {
  const { filters } = useFilters()
  const [insights, setInsights] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const load = useCallback(() => {
    setLoading(true)
    setError(false)
    api
      .getInsights({ product_id: filters.product_id, category: filters.category })
      .then((data) => setInsights(data.insights))
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [filters.product_id, filters.category])

  useEffect(() => {
    load()
  }, [load])

  return (
    <div>
      <Header title="AI Insights" subtitle="Automatically generated business insights from customer feedback data" />

      <div className="p-5 md:p-8 space-y-5">
        <FilterBar showTopic={false} />

        <div className="flex items-center gap-2 text-sm text-ink-500 bg-brand-50/60 border border-brand-100 rounded-xl px-4 py-3">
          <Sparkles size={15} className="text-brand-600 shrink-0" />
          Insights below are generated in real time by analyzing the underlying review and order dataset — not hardcoded.
        </div>

        {error && <ErrorState onRetry={load} />}
        {!error && loading && <InlineLoading label="Analyzing customer feedback..." />}

        {!error && !loading && (
          insights.length === 0 ? (
            <EmptyState message="No insights available" detail="Try adjusting your filters to see AI-generated insights." />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {insights.map((insight) => (
                <InsightCard key={insight.id} insight={insight} />
              ))}
            </div>
          )
        )}
      </div>
    </div>
  )
}
