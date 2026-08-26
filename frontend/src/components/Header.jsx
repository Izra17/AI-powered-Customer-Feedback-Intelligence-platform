import React, { useState } from 'react'
import { Search, Bell, ChevronDown } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useFilters } from '../context/FilterContext.jsx'

export default function Header({ title, subtitle }) {
  const navigate = useNavigate()
  const { options } = useFilters()
  const [query, setQuery] = useState('')

  function handleSearchSubmit(e) {
    e.preventDefault()
    if (query.trim()) {
      navigate(`/reviews?search=${encodeURIComponent(query.trim())}`)
    }
  }

  const dateRangeLabel =
    options.date_min && options.date_max
      ? `${options.date_min} → ${options.date_max}`
      : 'Last 12 months'

  return (
    <header className="sticky top-0 z-20 bg-white/85 backdrop-blur border-b border-ink-100 px-5 md:px-8 py-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-lg md:text-xl font-semibold text-ink-900 tracking-tight">{title}</h1>
          {subtitle && <p className="text-sm text-ink-400 mt-0.5">{subtitle}</p>}
        </div>

        <div className="flex items-center gap-3 ml-auto">
          <div className="hidden lg:flex items-center gap-1.5 text-xs text-ink-400 bg-ink-50 border border-ink-100 rounded-full px-3 py-1.5">
            {dateRangeLabel}
          </div>

          <form onSubmit={handleSearchSubmit} className="relative hidden sm:block">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-300" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              type="text"
              placeholder="Search reviews..."
              className="pl-9 pr-3 py-2 text-sm rounded-lg bg-ink-50 border border-ink-100 focus:outline-none focus:ring-2 focus:ring-brand-300 focus:border-brand-300 w-48 lg:w-64 transition-all"
            />
          </form>

          <button
            type="button"
            className="relative w-9 h-9 flex items-center justify-center rounded-lg border border-ink-100 text-ink-500 hover:bg-ink-50 transition-colors"
            aria-label="Notifications"
          >
            <Bell size={16} />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-rose-500" />
          </button>

          <button
            type="button"
            className="flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-lg hover:bg-ink-50 transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-brand-600 text-white text-xs font-semibold flex items-center justify-center">
              CX
            </div>
            <span className="hidden md:block text-sm font-medium text-ink-700">CX Team</span>
            <ChevronDown size={14} className="hidden md:block text-ink-400" />
          </button>
        </div>
      </div>
    </header>
  )
}
