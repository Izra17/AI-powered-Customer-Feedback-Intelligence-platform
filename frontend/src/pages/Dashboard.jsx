import React, { useEffect, useState, useCallback } from 'react'
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  BarChart, Bar,
} from 'recharts'
import { MessageSquareText, Star, ThumbsUp, ThumbsDown, RotateCcw, ShieldAlert, ArrowUp, ArrowDown, Minus } from 'lucide-react'

import Header from '../components/Header.jsx'
import FilterBar from '../components/FilterBar.jsx'
import KPICard from '../components/KPICard.jsx'
import ChartCard from '../components/ChartCard.jsx'
import { KPISkeletonGrid, ChartSkeleton, ErrorState, EmptyState } from '../components/LoadingState.jsx'
import { useFilters } from '../context/FilterContext.jsx'
import api from '../services/api.js'
import { SEVERITY_STYLES, TOPIC_COLORS, formatNumber } from '../utils/display.js'

const SENTIMENT_COLORS = { Positive: '#446540', Neutral: '#d69e2e', Negative: '#e53e5c' }

function TrendArrow({ pct }) {
  if (pct > 2) return <ArrowUp size={12} className="text-rose-500" />
  if (pct < -2) return <ArrowDown size={12} className="text-brand-600" />
  return <Minus size={12} className="text-ink-400" />
}

export default function Dashboard() {
  const { filters } = useFilters()
  const [kpis, setKpis] = useState(null)
  const [sentimentTrend, setSentimentTrend] = useState([])
  const [topicDist, setTopicDist] = useState([])
  const [ratingDist, setRatingDist] = useState([])
  const [issues, setIssues] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const loadAll = useCallback(() => {
    setLoading(true)
    setError(false)
    Promise.all([
      api.getDashboard(filters),
      api.getSentimentTrend(filters),
      api.getTopicDistribution(filters),
      api.getRatingDistribution(filters),
      api.getIssues(filters),
    ])
      .then(([dash, trend, topics, ratings, issuesRes]) => {
        setKpis(dash)
        setSentimentTrend(trend.trend)
        setTopicDist(topics.distribution)
        setRatingDist(ratings.distribution)
        setIssues(issuesRes.issues)
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [filters])

  useEffect(() => {
    loadAll()
  }, [loadAll])

  const sentimentPieData = kpis
    ? [
        { name: 'Positive', value: kpis.positive_sentiment_pct },
        { name: 'Neutral', value: kpis.neutral_sentiment_pct },
        { name: 'Negative', value: kpis.negative_sentiment_pct },
      ]
    : []

  return (
    <div>
      <Header title="Feedback Overview" subtitle="AI-powered customer feedback & order intelligence" />

      <div className="p-5 md:p-8 space-y-6">
        <FilterBar />

        {error && <ErrorState onRetry={loadAll} />}

        {!error && loading && (
          <>
            <KPISkeletonGrid />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <ChartSkeleton />
              <ChartSkeleton />
            </div>
          </>
        )}

        {!error && !loading && kpis && (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
              <KPICard
                label="Total Reviews"
                value={formatNumber(kpis.total_reviews)}
                change={kpis.total_reviews_change_pct}
                changeLabel="vs prior 30d"
                icon={MessageSquareText}
                accent="brand"
              />
              <KPICard
                label="Average Rating"
                value={`${kpis.average_rating} / 5`}
                icon={Star}
                accent="amber"
              />
              <KPICard
                label="Positive Sentiment"
                value={`${kpis.positive_sentiment_pct}%`}
                icon={ThumbsUp}
                accent="brand"
              />
              <KPICard
                label="Negative Sentiment"
                value={`${kpis.negative_sentiment_pct}%`}
                icon={ThumbsDown}
                accent="rose"
              />
              <KPICard
                label="Return Rate"
                value={`${kpis.return_rate_pct}%`}
                icon={RotateCcw}
                accent="rose"
              />
              <KPICard
                label="Critical Issues"
                value={formatNumber(kpis.critical_issues)}
                icon={ShieldAlert}
                accent="rose"
              />
            </div>

            {/* Charts row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
              <ChartCard title="Sentiment Distribution" subtitle="Share of reviews by sentiment" className="lg:col-span-2">
                {sentimentPieData.every((d) => d.value === 0) ? (
                  <EmptyState />
                ) : (
                  <ResponsiveContainer width="100%" height={260}>
                    <PieChart>
                      <Pie
                        data={sentimentPieData}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={2}
                      >
                        {sentimentPieData.map((entry) => (
                          <Cell key={entry.name} fill={SENTIMENT_COLORS[entry.name]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v) => `${v}%`} />
                      <Legend iconType="circle" iconSize={8} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </ChartCard>

              <ChartCard title="Sentiment Trend" subtitle="Weekly average sentiment score (-1 to +1)" className="lg:col-span-3">
                {sentimentTrend.length === 0 ? (
                  <EmptyState />
                ) : (
                  <ResponsiveContainer width="100%" height={260}>
                    <LineChart data={sentimentTrend}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e5e1" />
                      <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#767f73' }} tickLine={false} />
                      <YAxis domain={[-1, 1]} tick={{ fontSize: 11, fill: '#767f73' }} tickLine={false} axisLine={false} />
                      <Tooltip />
                      <Line type="monotone" dataKey="avg_sentiment_score" stroke="#446540" strokeWidth={2.5} dot={false} name="Avg. sentiment" />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </ChartCard>
            </div>

            {/* Charts row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
              <ChartCard title="Issues by Topic" subtitle="Negative mentions per topic" className="lg:col-span-3">
                {topicDist.length === 0 ? (
                  <EmptyState />
                ) : (
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={topicDist} layout="vertical" margin={{ left: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e5e1" horizontal={false} />
                      <XAxis type="number" tick={{ fontSize: 11, fill: '#767f73' }} tickLine={false} axisLine={false} />
                      <YAxis
                        type="category"
                        dataKey="topic"
                        width={110}
                        tick={{ fontSize: 11, fill: '#3a403a' }}
                        tickLine={false}
                        axisLine={false}
                      />
                      <Tooltip />
                      <Bar dataKey="negative_mentions" radius={[0, 4, 4, 0]} name="Negative mentions">
                        {topicDist.map((entry) => (
                          <Cell key={entry.topic} fill={TOPIC_COLORS[entry.topic] || '#7a9c75'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </ChartCard>

              <ChartCard title="Rating Distribution" subtitle="Review count by star rating" className="lg:col-span-2">
                {ratingDist.every((d) => d.count === 0) ? (
                  <EmptyState />
                ) : (
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={ratingDist}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e5e1" vertical={false} />
                      <XAxis dataKey="rating" tickFormatter={(v) => `${v}★`} tick={{ fontSize: 11, fill: '#767f73' }} tickLine={false} axisLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: '#767f73' }} tickLine={false} axisLine={false} />
                      <Tooltip />
                      <Bar dataKey="count" radius={[4, 4, 0, 0]} fill="#587f52" name="Reviews" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </ChartCard>
            </div>

            {/* AI Detected Issues */}
            <ChartCard
              title="AI Detected Issues"
              subtitle="Recurring negative themes identified across customer feedback"
            >
              {issues.length === 0 ? (
                <EmptyState message="No issues detected" detail="No negative feedback matches the current filters." />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {issues.map((issue) => (
                    <div key={issue.issue} className="border border-ink-100 rounded-xl p-4 flex flex-col gap-2.5">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-semibold text-ink-800 text-sm">{issue.issue}</h4>
                        <span className={`badge ${SEVERITY_STYLES[issue.severity] || 'bg-ink-100 text-ink-600'}`}>
                          {issue.severity}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-ink-500">
                        <span>{formatNumber(issue.mentions)} mentions</span>
                        <span className="text-ink-200">•</span>
                        <span>{issue.negative_pct}% negative</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs font-medium">
                        <TrendArrow pct={issue.trend_pct} />
                        <span className={issue.trend_pct > 2 ? 'text-rose-500' : issue.trend_pct < -2 ? 'text-brand-600' : 'text-ink-400'}>
                          {issue.trend_pct > 0 ? '+' : ''}{issue.trend_pct}% vs prior 30d
                        </span>
                      </div>
                      {issue.affected_products.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1.5 border-t border-ink-50 mt-1">
                          {issue.affected_products.map((p) => (
                            <span key={p} className="text-[11px] bg-ink-50 text-ink-500 px-2 py-0.5 rounded-full">
                              {p}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </ChartCard>
          </>
        )}
      </div>
    </div>
  )
}
