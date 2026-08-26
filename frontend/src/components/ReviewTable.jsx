import React from 'react'
import { Star, ShieldCheck, ChevronRight } from 'lucide-react'
import { SENTIMENT_STYLES, SEVERITY_STYLES } from '../utils/display.js'

function Stars({ rating }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={12}
          className={i < rating ? 'fill-amber-400 text-amber-400' : 'text-ink-200'}
        />
      ))}
    </div>
  )
}

export default function ReviewTable({ reviews, onSelect }) {
  return (
    <div className="overflow-x-auto -mx-1">
      <table className="w-full text-sm min-w-[900px]">
        <thead>
          <tr className="text-left text-[11px] uppercase tracking-wide text-ink-400 border-b border-ink-100">
            <th className="px-3 py-2.5 font-medium">Customer</th>
            <th className="px-3 py-2.5 font-medium">Product</th>
            <th className="px-3 py-2.5 font-medium">Rating</th>
            <th className="px-3 py-2.5 font-medium min-w-[280px]">Review</th>
            <th className="px-3 py-2.5 font-medium">Sentiment</th>
            <th className="px-3 py-2.5 font-medium">Topic</th>
            <th className="px-3 py-2.5 font-medium">Severity</th>
            <th className="px-3 py-2.5 font-medium">Date</th>
            <th className="px-3 py-2.5"></th>
          </tr>
        </thead>
        <tbody>
          {reviews.map((r) => (
            <tr
              key={r.review_id}
              onClick={() => onSelect(r.review_id)}
              className="border-b border-ink-50 hover:bg-brand-50/40 cursor-pointer transition-colors group"
            >
              <td className="px-3 py-3 align-top whitespace-nowrap">
                <div className="flex items-center gap-1.5">
                  <span className="text-ink-700 font-medium">{r.customer_id}</span>
                  {r.verified_purchase && (
                    <ShieldCheck size={13} className="text-brand-500" aria-label="Verified purchase" />
                  )}
                </div>
              </td>
              <td className="px-3 py-3 align-top text-ink-600 whitespace-nowrap">{r.product_name}</td>
              <td className="px-3 py-3 align-top"><Stars rating={r.rating} /></td>
              <td className="px-3 py-3 align-top text-ink-600 max-w-md">
                <p className="line-clamp-2">{r.review_text}</p>
              </td>
              <td className="px-3 py-3 align-top">
                <span className={`badge ${SENTIMENT_STYLES[r.sentiment] || 'bg-ink-100 text-ink-600'}`}>
                  {r.sentiment}
                </span>
              </td>
              <td className="px-3 py-3 align-top text-ink-600 whitespace-nowrap">{r.topic}</td>
              <td className="px-3 py-3 align-top">
                {r.severity ? (
                  <span className={`badge ${SEVERITY_STYLES[r.severity] || 'bg-ink-100 text-ink-600'}`}>
                    {r.severity}
                  </span>
                ) : (
                  <span className="text-ink-300 text-xs">-</span>
                )}
              </td>
              <td className="px-3 py-3 align-top text-ink-400 whitespace-nowrap">{r.review_date}</td>
              <td className="px-3 py-3 align-top">
                <ChevronRight size={15} className="text-ink-300 group-hover:text-brand-500 transition-colors" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
