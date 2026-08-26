import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar.jsx'
import MobileNav from './components/MobileNav.jsx'
import { FilterProvider } from './context/FilterContext.jsx'

import Dashboard from './pages/Dashboard.jsx'
import Reviews from './pages/Reviews.jsx'
import Products from './pages/Products.jsx'
import ProductDetail from './pages/ProductDetail.jsx'
import Insights from './pages/Insights.jsx'
import Recommendations from './pages/Recommendations.jsx'

export default function App() {
  return (
    <FilterProvider>
      <div className="flex min-h-screen bg-[#f7f8f6]">
        <Sidebar />
        <div className="flex-1 min-w-0 pb-16 md:pb-0">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/reviews" element={<Reviews />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/:productId" element={<ProductDetail />} />
            <Route path="/insights" element={<Insights />} />
            <Route path="/recommendations" element={<Recommendations />} />
          </Routes>
        </div>
        <MobileNav />
      </div>
    </FilterProvider>
  )
}
