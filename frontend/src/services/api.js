import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

const client = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
})

// Strip out undefined/null/empty-string params so the querystring stays clean
function cleanParams(params = {}) {
  const out = {}
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') out[k] = v
  })
  return out
}

export const api = {
  getFilterOptions: () => client.get('/api/meta/filters').then((r) => r.data),

  getDashboard: (params) => client.get('/api/dashboard', { params: cleanParams(params) }).then((r) => r.data),
  getSentimentTrend: (params) => client.get('/api/sentiment-trend', { params: cleanParams(params) }).then((r) => r.data),
  getTopicDistribution: (params) => client.get('/api/topic-distribution', { params: cleanParams(params) }).then((r) => r.data),
  getRatingDistribution: (params) => client.get('/api/rating-distribution', { params: cleanParams(params) }).then((r) => r.data),
  getIssues: (params) => client.get('/api/issues', { params: cleanParams(params) }).then((r) => r.data),

  getReviews: (params) => client.get('/api/reviews', { params: cleanParams(params) }).then((r) => r.data),
  getReview: (id) => client.get(`/api/reviews/${id}`).then((r) => r.data),

  getProducts: (params) => client.get('/api/products', { params: cleanParams(params) }).then((r) => r.data),
  getProduct: (id) => client.get(`/api/products/${id}`).then((r) => r.data),

  getInsights: (params) => client.get('/api/insights', { params: cleanParams(params) }).then((r) => r.data),
  getRecommendations: (params) => client.get('/api/recommendations', { params: cleanParams(params) }).then((r) => r.data),
}

export default api
