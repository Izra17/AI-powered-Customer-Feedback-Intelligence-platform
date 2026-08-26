export const SENTIMENT_STYLES = {
  Positive: 'bg-brand-100 text-brand-700',
  Neutral: 'bg-amber-100 text-amber-700',
  Negative: 'bg-rose-100 text-rose-700',
}

export const SEVERITY_STYLES = {
  Low: 'bg-slate-100 text-slate-600',
  Medium: 'bg-amber-100 text-amber-700',
  High: 'bg-orange-100 text-orange-700',
  Critical: 'bg-rose-100 text-rose-700',
}

export const PRIORITY_STYLES = {
  Low: 'bg-slate-100 text-slate-600',
  Medium: 'bg-amber-100 text-amber-700',
  High: 'bg-rose-100 text-rose-700',
}

export const TOPIC_COLORS = {
  'Size & Fit': '#c05621',
  'Comfort': '#2f6f4e',
  'Quality': '#7c5cbf',
  'Durability': '#b7791f',
  'Delivery': '#3182ce',
  'Return Experience': '#d53f8c',
  'Design': '#38a169',
  'Price & Value': '#718096',
  'Material': '#805ad5',
  'Packaging': '#dd6b20',
  'Other': '#a0aec0',
}

export function formatNumber(n) {
  if (n === undefined || n === null) return '-'
  return n.toLocaleString('en-IN')
}

export function formatPct(n, digits = 1) {
  if (n === undefined || n === null) return '-'
  return `${n.toFixed(digits)}%`
}

export function formatCurrency(n) {
  if (n === undefined || n === null) return '-'
  return `₹${n.toLocaleString('en-IN')}`
}

export function trendDirection(pct) {
  if (pct === undefined || pct === null) return 'flat'
  if (pct > 2) return 'up'
  if (pct < -2) return 'down'
  return 'flat'
}
