import React, { useEffect, useState, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, ChevronLeft, ChevronRight, ShieldCheck } from 'lucide-react'

import Header from '../components/Header.jsx'
import FilterBar from '../components/FilterBar.jsx'
import ReviewTable from '../components/ReviewTable.jsx'
import ReviewDetailModal from '../components/ReviewDetailModal.jsx'
import { TableSkeleton, ErrorState, EmptyState } from '../components/LoadingState.jsx'
import { useFilters } from '../context/FilterContext.jsx'
import api from '../services/api.js'
import { formatNumber } from '../utils/display.js'

const PAGE_SIZE = 15

export default function Reviews() {
  const { filters } = useFilters()
  const [searchParams, setSearchParams] = useSearchParams()
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '')
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [page, setPage] = useState(1)
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [selectedReviewId, setSelectedReviewId] = useState(null)
  const [verifiedOnly, setVerifiedOnly] = useState(false)

  const load = useCallback(() => {
    setLoading(true)
    setError(false)
    api
      .getReviews({
        ...filters,
        search,
        page,
        page_size: PAGE_SIZE,
        verified_purchase: verifiedOnly ? true : undefined,
      })
      .then(setData)
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [filters, search, page, verifiedOnly])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    setPage(1)
  }, [filters, search, verifiedOnly])

  function handleSearchSubmit(e) {
    e.preventDefault()
    setSearch(searchInput.trim())
    setSearchParams(searchInput.trim() ? { search: searchInput.trim() } : {})
  }

  const totalPages = data ? Math.max(1, Math.ceil(data.total / PAGE_SIZE)) : 1

  return (
    <div>
      <Header title="Review Explorer" subtitle="Search and investigate individual customer reviews" />

      <div className="p-5 md:p-8 space-y-5">
        <FilterBar showOrderStatus={false} />

        <div className="card p-4 flex flex-wrap items-center gap-3">
          <form onSubmit={handleSearchSubmit} className="relative flex-1 min-w-[240px]">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-300" />
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              type="text"
              placeholder='Search review text, e.g. "uncomfortable"'
              className="w-full pl-9 pr-3 py-2.5 text-sm rounded-lg bg-ink-50 border border-ink-100 focus:outline-none focus:ring-2 focus:ring-brand-300 focus:border-brand-300"
            />
          </form>
          <button
            type="submit"
            onClick={handleSearchSubmit}
            className="px-4 py-2.5 text-sm font-medium rounded-lg bg-brand-600 text-white hover:bg-brand-700 transition-colors"
          >
            Search
          </button>
          <label className="flex items-center gap-2 text-sm text-ink-600 pl-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={verifiedOnly}
              onChange={(e) => setVerifiedOnly(e.target.checked)}
              className="rounded border-ink-300 text-brand-600 focus:ring-brand-400"
            />
            <ShieldCheck size={14} className="text-brand-500" />
            Verified purchases only
          </label>
          {search && (
            <span className="text-xs text-ink-400">
              Showing results for <span className="font-medium text-ink-600">"{search}"</span>
            </span>
          )}
        </div>

        {error && <ErrorState onRetry={load} />}
        {!error && loading && <TableSkeleton rows={8} />}

        {!error && !loading && data && (
          <div className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-ink-500">
                <span className="font-semibold text-ink-800">{formatNumber(data.total)}</span> reviews found
              </p>
            </div>

            {data.results.length === 0 ? (
              <EmptyState />
            ) : (
              <>
                <ReviewTable reviews={data.results} onSelect={setSelectedReviewId} />

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-ink-50">
                  <span className="text-xs text-ink-400">
                    Page {page} of {totalPages}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page <= 1}
                      className="w-8 h-8 flex items-center justify-center rounded-lg border border-ink-100 text-ink-500 disabled:opacity-40 hover:bg-ink-50 transition-colors"
                    >
                      <ChevronLeft size={15} />
                    </button>
                    <button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page >= totalPages}
                      className="w-8 h-8 flex items-center justify-center rounded-lg border border-ink-100 text-ink-500 disabled:opacity-40 hover:bg-ink-50 transition-colors"
                    >
                      <ChevronRight size={15} />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      <ReviewDetailModal reviewId={selectedReviewId} onClose={() => setSelectedReviewId(null)} />
    </div>
  )
}
