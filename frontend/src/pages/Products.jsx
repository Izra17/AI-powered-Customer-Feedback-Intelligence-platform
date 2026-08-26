import React, { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Star, ArrowUpDown } from 'lucide-react'

import Header from '../components/Header.jsx'
import { TableSkeleton, ErrorState, EmptyState } from '../components/LoadingState.jsx'
import { useFilters } from '../context/FilterContext.jsx'
import api from '../services/api.js'
import { formatNumber, formatPct, formatCurrency } from '../utils/display.js'

const SORT_OPTIONS = [
  { value: 'review_count', label: 'Review Count' },
  { value: 'average_rating', label: 'Rating' },
  { value: 'negative_pct', label: 'Negative %' },
  { value: 'return_rate', label: 'Return Rate' },
  { value: 'total_orders', label: 'Total Orders' },
]

function issueBadgeColor(issue) {
  if (issue === 'None') return 'bg-brand-50 text-brand-600'
  return 'bg-rose-50 text-rose-600'
}

export default function Products() {
  const navigate = useNavigate()
  const { filters, options } = useFilters()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [sortBy, setSortBy] = useState('review_count')
  const [sortOrder, setSortOrder] = useState('desc')
  const [category, setCategory] = useState('')

  const load = useCallback(() => {
    setLoading(true)
    setError(false)
    api
      .getProducts({ category, sort_by: sortBy, sort_order: sortOrder })
      .then((data) => setProducts(data.results))
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [category, sortBy, sortOrder])

  useEffect(() => {
    load()
  }, [load])

  function toggleSort(field) {
    if (sortBy === field) {
      setSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortBy(field)
      setSortOrder('desc')
    }
  }

  return (
    <div>
      <Header title="Product Intelligence" subtitle="Compare products across rating, sentiment, and return performance" />

      <div className="p-5 md:p-8 space-y-5">
        <div className="card p-4 flex flex-wrap items-center gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-[10.5px] font-medium text-ink-400 uppercase tracking-wide">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="text-sm px-2.5 py-1.5 rounded-lg border border-ink-100 bg-white text-ink-700 focus:outline-none focus:ring-2 focus:ring-brand-300"
            >
              <option value="">All Categories</option>
              {options.categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10.5px] font-medium text-ink-400 uppercase tracking-wide">Sort by</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-sm px-2.5 py-1.5 rounded-lg border border-ink-100 bg-white text-ink-700 focus:outline-none focus:ring-2 focus:ring-brand-300"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>

        {error && <ErrorState onRetry={load} />}
        {!error && loading && <TableSkeleton rows={8} />}

        {!error && !loading && (
          <div className="card p-5 overflow-x-auto">
            {products.length === 0 ? (
              <EmptyState />
            ) : (
              <table className="w-full text-sm min-w-[820px]">
                <thead>
                  <tr className="text-left text-[11px] uppercase tracking-wide text-ink-400 border-b border-ink-100">
                    <th className="px-3 py-2.5 font-medium">Product</th>
                    <th className="px-3 py-2.5 font-medium">Category</th>
                    <th className="px-3 py-2.5 font-medium">Price</th>
                    <th className="px-3 py-2.5 font-medium cursor-pointer select-none" onClick={() => toggleSort('average_rating')}>
                      <span className="inline-flex items-center gap-1">Rating <ArrowUpDown size={11} /></span>
                    </th>
                    <th className="px-3 py-2.5 font-medium cursor-pointer select-none" onClick={() => toggleSort('review_count')}>
                      <span className="inline-flex items-center gap-1">Reviews <ArrowUpDown size={11} /></span>
                    </th>
                    <th className="px-3 py-2.5 font-medium cursor-pointer select-none" onClick={() => toggleSort('negative_pct')}>
                      <span className="inline-flex items-center gap-1">Negative % <ArrowUpDown size={11} /></span>
                    </th>
                    <th className="px-3 py-2.5 font-medium cursor-pointer select-none" onClick={() => toggleSort('return_rate')}>
                      <span className="inline-flex items-center gap-1">Return Rate <ArrowUpDown size={11} /></span>
                    </th>
                    <th className="px-3 py-2.5 font-medium">Main Issue</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr
                      key={p.product_id}
                      onClick={() => navigate(`/products/${p.product_id}`)}
                      className="border-b border-ink-50 hover:bg-brand-50/40 cursor-pointer transition-colors"
                    >
                      <td className="px-3 py-3">
                        <div className="font-medium text-ink-800">{p.product_name}</div>
                        <div className="text-xs text-ink-400">{p.color}</div>
                      </td>
                      <td className="px-3 py-3 text-ink-600">{p.category}</td>
                      <td className="px-3 py-3 text-ink-600">{formatCurrency(p.price)}</td>
                      <td className="px-3 py-3">
                        <span className="inline-flex items-center gap-1 text-ink-700 font-medium">
                          <Star size={13} className="fill-amber-400 text-amber-400" />
                          {p.average_rating}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-ink-600">{formatNumber(p.review_count)}</td>
                      <td className="px-3 py-3">
                        <span className={p.negative_pct > 20 ? 'text-rose-600 font-medium' : 'text-ink-600'}>
                          {formatPct(p.negative_pct * 100)}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <span className={p.return_rate > 0.1 ? 'text-rose-600 font-medium' : 'text-ink-600'}>
                          {formatPct(p.return_rate * 100)}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <span className={`badge ${issueBadgeColor(p.main_issue)}`}>{p.main_issue}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
