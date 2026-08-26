import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import api from '../services/api.js'

const FilterContext = createContext(null)

const DEFAULT_FILTERS = {
  product_id: '',
  category: '',
  sentiment: '',
  topic: '',
  rating: '',
  order_status: '',
  date_from: '',
  date_to: '',
}

export function FilterProvider({ children }) {
  const [filters, setFilters] = useState(DEFAULT_FILTERS)
  const [options, setOptions] = useState({
    products: [],
    categories: [],
    topics: [],
    sentiments: [],
    ratings: [],
    order_statuses: [],
    date_min: '',
    date_max: '',
  })
  const [optionsLoading, setOptionsLoading] = useState(true)
  const [optionsError, setOptionsError] = useState(false)

  useEffect(() => {
    api
      .getFilterOptions()
      .then((data) => {
        setOptions(data)
        setOptionsError(false)
      })
      .catch(() => setOptionsError(true))
      .finally(() => setOptionsLoading(false))
  }, [])

  const updateFilter = useCallback((key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }, [])

  const resetFilters = useCallback(() => setFilters(DEFAULT_FILTERS), [])

  const activeFilterCount = Object.values(filters).filter((v) => v !== '' && v !== null).length

  return (
    <FilterContext.Provider
      value={{ filters, updateFilter, resetFilters, options, optionsLoading, optionsError, activeFilterCount }}
    >
      {children}
    </FilterContext.Provider>
  )
}

export function useFilters() {
  const ctx = useContext(FilterContext)
  if (!ctx) throw new Error('useFilters must be used within a FilterProvider')
  return ctx
}
