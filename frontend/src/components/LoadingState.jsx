import React from 'react'
import { Loader2, AlertTriangle, Inbox } from 'lucide-react'

export function Skeleton({ className = '' }) {
  return <div className={`animate-pulse bg-ink-100 rounded-md ${className}`} />
}

export function KPISkeletonGrid({ count = 6 }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card p-5 space-y-3">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-7 w-16" />
        </div>
      ))}
    </div>
  )
}

export function ChartSkeleton({ height = 260 }) {
  return (
    <div className="card p-5">
      <Skeleton className="h-4 w-32 mb-4" />
      <Skeleton style={{ height }} className="w-full" />
    </div>
  )
}

export function TableSkeleton({ rows = 6 }) {
  return (
    <div className="card p-5 space-y-3">
      <Skeleton className="h-4 w-40" />
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-10 w-full" />
      ))}
    </div>
  )
}

export function InlineLoading({ label = 'Analyzing customer feedback...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-ink-400 gap-3">
      <Loader2 size={22} className="animate-spin text-brand-500" />
      <p className="text-sm">{label}</p>
    </div>
  )
}

export function ErrorState({ message = 'Unable to load feedback data.', detail = 'Please check that the backend server is running.', onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center gap-3 card">
      <div className="w-11 h-11 rounded-full bg-rose-50 flex items-center justify-center">
        <AlertTriangle size={20} className="text-rose-500" />
      </div>
      <div>
        <p className="text-sm font-medium text-ink-800">{message}</p>
        <p className="text-xs text-ink-400 mt-1">{detail}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-1 text-xs font-medium text-brand-600 hover:text-brand-700 bg-brand-50 px-3 py-1.5 rounded-lg transition-colors"
        >
          Try again
        </button>
      )}
    </div>
  )
}

export function EmptyState({ message = 'No results found', detail = 'Try adjusting your filters or search terms.' }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
      <div className="w-11 h-11 rounded-full bg-ink-50 flex items-center justify-center">
        <Inbox size={20} className="text-ink-300" />
      </div>
      <div>
        <p className="text-sm font-medium text-ink-700">{message}</p>
        <p className="text-xs text-ink-400 mt-1">{detail}</p>
      </div>
    </div>
  )
}
