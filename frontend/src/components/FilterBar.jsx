import React from 'react'
import { SlidersHorizontal, X } from 'lucide-react'
import { useFilters } from '../context/FilterContext.jsx'

function Select({ label, value, onChange, options, allLabel }) {
  return (
    <div className="flex flex-col gap-1 min-w-[130px]">
      <label className="text-[10.5px] font-medium text-ink-400 uppercase tracking-wide">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="text-sm px-2.5 py-1.5 rounded-lg border border-ink-100 bg-white text-ink-700 focus:outline-none focus:ring-2 focus:ring-brand-300 focus:border-brand-300"
      >
        <option value="">{allLabel}</option>
        {options.map((opt) => (
          <option key={opt.value ?? opt} value={opt.value ?? opt}>
            {opt.label ?? opt}
          </option>
        ))}
      </select>
    </div>
  )
}

export default function FilterBar({ showTopic = true, showOrderStatus = false }) {
  const { filters, updateFilter, resetFilters, options, activeFilterCount } = useFilters()

  return (
    <div className="card p-4">
      <div className="flex items-center gap-2 mb-3">
        <SlidersHorizontal size={14} className="text-ink-400" />
        <span className="text-xs font-semibold text-ink-500 uppercase tracking-wide">Filters</span>
        {activeFilterCount > 0 && (
          <span className="badge bg-brand-100 text-brand-700">{activeFilterCount} active</span>
        )}
        {activeFilterCount > 0 && (
          <button
            onClick={resetFilters}
            className="ml-auto flex items-center gap-1 text-xs text-ink-400 hover:text-rose-500 transition-colors"
          >
            <X size={12} /> Clear all
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        <Select
          label="Product"
          value={filters.product_id}
          onChange={(v) => updateFilter('product_id', v)}
          options={options.products.map((p) => ({ value: p.product_id, label: p.product_name }))}
          allLabel="All Products"
        />
        <Select
          label="Category"
          value={filters.category}
          onChange={(v) => updateFilter('category', v)}
          options={options.categories}
          allLabel="All Categories"
        />
        <Select
          label="Sentiment"
          value={filters.sentiment}
          onChange={(v) => updateFilter('sentiment', v)}
          options={options.sentiments}
          allLabel="All Sentiment"
        />
        {showTopic && (
          <Select
            label="Topic"
            value={filters.topic}
            onChange={(v) => updateFilter('topic', v)}
            options={options.topics}
            allLabel="All Topics"
          />
        )}
        <Select
          label="Rating"
          value={filters.rating}
          onChange={(v) => updateFilter('rating', v)}
          options={options.ratings.map((r) => ({ value: r, label: `${r} star` }))}
          allLabel="All Ratings"
        />
        {showOrderStatus && (
          <Select
            label="Order Status"
            value={filters.order_status}
            onChange={(v) => updateFilter('order_status', v)}
            options={options.order_statuses}
            allLabel="All Statuses"
          />
        )}
        <div className="flex flex-col gap-1">
          <label className="text-[10.5px] font-medium text-ink-400 uppercase tracking-wide">From</label>
          <input
            type="date"
            value={filters.date_from}
            min={options.date_min}
            max={options.date_max}
            onChange={(e) => updateFilter('date_from', e.target.value)}
            className="text-sm px-2.5 py-1.5 rounded-lg border border-ink-100 bg-white text-ink-700 focus:outline-none focus:ring-2 focus:ring-brand-300 focus:border-brand-300"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[10.5px] font-medium text-ink-400 uppercase tracking-wide">To</label>
          <input
            type="date"
            value={filters.date_to}
            min={options.date_min}
            max={options.date_max}
            onChange={(e) => updateFilter('date_to', e.target.value)}
            className="text-sm px-2.5 py-1.5 rounded-lg border border-ink-100 bg-white text-ink-700 focus:outline-none focus:ring-2 focus:ring-brand-300 focus:border-brand-300"
          />
        </div>
      </div>
    </div>
  )
}
