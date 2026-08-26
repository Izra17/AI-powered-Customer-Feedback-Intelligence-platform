import React, { useEffect, useState } from 'react'
import { X, Star, ShieldCheck, Sparkles } from 'lucide-react'
import api from '../services/api.js'
import { SENTIMENT_STYLES, SEVERITY_STYLES } from '../utils/display.js'
import { InlineLoading, ErrorState } from './LoadingState.jsx'

export default function ReviewDetailModal({ reviewId, onClose }) {
  const [review, setReview] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!reviewId) return
    setLoading(true)
    setError(false)
    api
      .getReview(reviewId)
      .then(setReview)
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [reviewId])

  if (!reviewId) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-950/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white rounded-xl2 shadow-popover w-full max-w-xl max-h-[85vh] overflow-y-auto scrollbar-thin"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white flex items-center justify-between px-5 py-4 border-b border-ink-100">
          <h3 className="text-sm font-semibold text-ink-800">Review Detail & AI Analysis</h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-ink-50 text-ink-400">
            <X size={16} />
          </button>
        </div>

        <div className="p-5">
          {loading && <InlineLoading label="Analyzing customer feedback..." />}
          {error && <ErrorState />}
          {!loading && !error && review && (
            <div className="space-y-5">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-ink-800">{review.customer_id}</span>
                    {review.verified_purchase && <ShieldCheck size={14} className="text-brand-500" />}
                  </div>
                  <p className="text-xs text-ink-400 mt-0.5">{review.product_name} · {review.review_date} · Order {review.order_id}</p>
                </div>
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={15} className={i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-ink-200'} />
                  ))}
                </div>
              </div>

              <p className="text-sm text-ink-700 leading-relaxed bg-ink-50 rounded-lg p-4">
                "{review.review_text}"
              </p>

              <div className="grid grid-cols-3 gap-3">
                <div className="border border-ink-100 rounded-lg p-3">
                  <p className="text-[10.5px] uppercase text-ink-400 font-medium mb-1.5">Sentiment</p>
                  <span className={`badge ${SENTIMENT_STYLES[review.sentiment]}`}>{review.sentiment}</span>
                  <p className="text-xs text-ink-400 mt-1.5">Score: {review.sentiment_score}</p>
                </div>
                <div className="border border-ink-100 rounded-lg p-3">
                  <p className="text-[10.5px] uppercase text-ink-400 font-medium mb-1.5">Topic</p>
                  <span className="badge bg-ink-100 text-ink-700">{review.topic}</span>
                </div>
                <div className="border border-ink-100 rounded-lg p-3">
                  <p className="text-[10.5px] uppercase text-ink-400 font-medium mb-1.5">Severity</p>
                  {review.severity ? (
                    <span className={`badge ${SEVERITY_STYLES[review.severity]}`}>{review.severity}</span>
                  ) : (
                    <span className="text-xs text-ink-300">Not applicable</span>
                  )}
                </div>
              </div>

              <div className="bg-brand-50/70 border border-brand-100 rounded-lg p-4 flex gap-3">
                <Sparkles size={16} className="text-brand-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-brand-700 mb-1">AI Analysis Explanation</p>
                  <p className="text-xs text-ink-600 leading-relaxed">{review.ai_explanation}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
