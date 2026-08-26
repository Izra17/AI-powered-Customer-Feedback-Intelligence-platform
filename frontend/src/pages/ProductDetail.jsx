import React, { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, CartesianGrid,
} from 'recharts'
import { ArrowLeft, Star, Package, RotateCcw, MessageSquareText, ShieldCheck, Sparkles } from 'lucide-react'

import Header from '../components/Header.jsx'
import ReviewDetailModal from '../components/ReviewDetailModal.jsx'
import { InlineLoading, ErrorState } from '../components/LoadingState.jsx'
import api from '../services/api.js'
import { SENTIMENT_STYLES, PRIORITY_STYLES, formatNumber, formatPct, formatCurrency } from '../utils/display.js'

const SENTIMENT_COLORS = { positive: '#446540', neutral: '#d69e2e', negative: '#e53e5c' }

export default function ProductDetail() {
  const { productId } = useParams()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [selectedReviewId, setSelectedReviewId] = useState(null)

  const load = useCallback(() => {
    setLoading(true)
    setError(false)
    api
      .getProduct(productId)
      .then(setData)
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [productId])

  useEffect(() => {
    load()
  }, [load])

  const pieData = data
    ? [
        { name: 'Positive', value: data.sentiment_breakdown.positive },
        { name: 'Neutral', value: data.sentiment_breakdown.neutral },
        { name: 'Negative', value: data.sentiment_breakdown.negative },
      ]
    : []

  return (
    <div>
      <Header title="Product Intelligence" subtitle="Deep-dive product performance and AI recommendations" />

      <div className="p-5 md:p-8 space-y-5">
        <button
          onClick={() => navigate('/products')}
          className="flex items-center gap-1.5 text-sm text-ink-500 hover:text-ink-700 transition-colors"
        >
          <ArrowLeft size={15} /> Back to Products
        </button>

        {loading && <InlineLoading label="Loading product intelligence..." />}
        {error && <ErrorState onRetry={load} />}

        {!loading && !error && data && (
          <>
            {/* Overview */}
            <div className="card p-6 flex flex-wrap items-start justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-xl font-semibold text-ink-900">{data.product.product_name}</h2>
                  <span className="badge bg-ink-100 text-ink-600">{data.product.category}</span>
                </div>
                <p className="text-sm text-ink-400">{data.product.color} · {formatCurrency(data.product.price)}</p>
              </div>

              <div className="flex flex-wrap gap-6">
                <Metric icon={Star} label="Avg. Rating" value={`${data.product.average_rating} / 5`} accent="amber" />
                <Metric icon={Package} label="Total Orders" value={formatNumber(data.product.total_orders)} accent="brand" />
                <Metric icon={RotateCcw} label="Return Rate" value={formatPct(data.product.return_rate * 100)} accent="rose" />
                <Metric icon={MessageSquareText} label="Reviews" value={formatNumber(data.product.review_count)} accent="sky" />
              </div>
            </div>

            {/* Sentiment + Trend */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
              <div className="card p-5 lg:col-span-2">
                <h3 className="text-sm font-semibold text-ink-800 mb-4">Sentiment Breakdown</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={2}>
                      {pieData.map((entry) => (
                        <Cell key={entry.name} fill={SENTIMENT_COLORS[entry.name.toLowerCase()]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex justify-center gap-4 mt-2 text-xs">
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-brand-600" />Positive {data.sentiment_breakdown.positive_pct}%</span>
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500" />Neutral {data.sentiment_breakdown.neutral_pct}%</span>
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-rose-500" />Negative {data.sentiment_breakdown.negative_pct}%</span>
                </div>
              </div>

              <div className="card p-5 lg:col-span-3">
                <h3 className="text-sm font-semibold text-ink-800 mb-4">Review Trend</h3>
                {data.review_trend.length === 0 ? (
                  <p className="text-sm text-ink-400 py-10 text-center">Not enough data to show a trend.</p>
                ) : (
                  <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={data.review_trend}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e5e1" />
                      <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#767f73' }} tickLine={false} />
                      <YAxis yAxisId="left" domain={[0, 5]} tick={{ fontSize: 11, fill: '#767f73' }} tickLine={false} axisLine={false} />
                      <Tooltip />
                      <Line yAxisId="left" type="monotone" dataKey="avg_rating" name="Avg. rating" stroke="#446540" strokeWidth={2.5} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Complaints / Positive themes */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <div className="card p-5">
                <h3 className="text-sm font-semibold text-ink-800 mb-4">Top Complaints</h3>
                {data.top_complaints.length === 0 ? (
                  <p className="text-sm text-ink-400">No significant complaints detected.</p>
                ) : (
                  <div className="space-y-2.5">
                    {data.top_complaints.map((c) => (
                      <BarRow key={c.topic} label={c.topic} count={c.count} max={data.top_complaints[0].count} color="#e53e5c" />
                    ))}
                  </div>
                )}
              </div>
              <div className="card p-5">
                <h3 className="text-sm font-semibold text-ink-800 mb-4">Top Positive Themes</h3>
                {data.top_positive_themes.length === 0 ? (
                  <p className="text-sm text-ink-400">No significant positive themes detected.</p>
                ) : (
                  <div className="space-y-2.5">
                    {data.top_positive_themes.map((c) => (
                      <BarRow key={c.topic} label={c.topic} count={c.count} max={data.top_positive_themes[0].count} color="#446540" />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Recommendations */}
            <div className="card p-5">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles size={16} className="text-brand-600" />
                <h3 className="text-sm font-semibold text-ink-800">AI Recommendations for {data.product.product_name}</h3>
              </div>
              {data.recommendations.length === 0 ? (
                <p className="text-sm text-ink-400">No specific recommendations at this time — performance looks healthy.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {data.recommendations.map((r) => (
                    <div key={r.id} className="border border-ink-100 rounded-lg p-4">
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <span className="text-xs font-semibold text-ink-400 uppercase tracking-wide">{r.category}</span>
                        <span className={`badge ${PRIORITY_STYLES[r.priority]}`}>{r.priority}</span>
                      </div>
                      <h4 className="text-sm font-medium text-ink-800 mb-1">{r.title}</h4>
                      <p className="text-xs text-ink-500 leading-relaxed">{r.recommended_action}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent reviews */}
            <div className="card p-5">
              <h3 className="text-sm font-semibold text-ink-800 mb-4">Recent Reviews</h3>
              <div className="space-y-3">
                {data.recent_reviews.map((r) => (
                  <div
                    key={r.review_id}
                    onClick={() => setSelectedReviewId(r.review_id)}
                    className="border border-ink-50 rounded-lg p-3.5 hover:bg-brand-50/40 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-1.5 text-xs">
                        <span className="font-medium text-ink-700">{r.customer_id}</span>
                        {r.verified_purchase && <ShieldCheck size={12} className="text-brand-500" />}
                        <span className="text-ink-300">·</span>
                        <span className="text-ink-400">{r.review_date}</span>
                      </div>
                      <span className={`badge ${SENTIMENT_STYLES[r.sentiment]}`}>{r.sentiment}</span>
                    </div>
                    <p className="text-sm text-ink-600 line-clamp-2">{r.review_text}</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      <ReviewDetailModal reviewId={selectedReviewId} onClose={() => setSelectedReviewId(null)} />
    </div>
  )
}

function Metric({ icon: Icon, label, value, accent }) {
  const bg = { brand: 'bg-brand-50 text-brand-600', rose: 'bg-rose-50 text-rose-600', amber: 'bg-amber-50 text-amber-600', sky: 'bg-sky-50 text-sky-600' }[accent]
  return (
    <div className="flex items-center gap-3">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${bg}`}>
        <Icon size={17} />
      </div>
      <div>
        <p className="text-[11px] text-ink-400 font-medium">{label}</p>
        <p className="text-base font-semibold text-ink-800">{value}</p>
      </div>
    </div>
  )
}

function BarRow({ label, count, max, color }) {
  const width = max > 0 ? Math.max(6, (count / max) * 100) : 0
  return (
    <div>
      <div className="flex items-center justify-between text-xs mb-1">
        <span className="text-ink-600 font-medium">{label}</span>
        <span className="text-ink-400">{count}</span>
      </div>
      <div className="h-1.5 rounded-full bg-ink-50 overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${width}%`, backgroundColor: color }} />
      </div>
    </div>
  )
}
