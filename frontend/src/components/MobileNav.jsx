import React from 'react'
import { NavLink } from 'react-router-dom'
import { LayoutDashboard, MessageSquareText, Package, Sparkles, ClipboardList } from 'lucide-react'

const ITEMS = [
  { to: '/', label: 'Home', icon: LayoutDashboard, end: true },
  { to: '/reviews', label: 'Reviews', icon: MessageSquareText },
  { to: '/products', label: 'Products', icon: Package },
  { to: '/insights', label: 'Insights', icon: Sparkles },
  { to: '/recommendations', label: 'Actions', icon: ClipboardList },
]

export default function MobileNav() {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-ink-100 flex items-stretch">
      {ITEMS.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            `flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 text-[10px] font-medium ${
              isActive ? 'text-brand-600' : 'text-ink-400'
            }`
          }
        >
          <Icon size={18} />
          {label}
        </NavLink>
      ))}
    </nav>
  )
}
