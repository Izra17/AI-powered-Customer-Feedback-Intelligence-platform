import React from 'react'
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, MessageSquareText, Package, Sparkles, ClipboardList, Leaf,
} from 'lucide-react'

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/reviews', label: 'Reviews', icon: MessageSquareText },
  { to: '/products', label: 'Products', icon: Package },
  { to: '/insights', label: 'AI Insights', icon: Sparkles },
  { to: '/recommendations', label: 'Recommendations', icon: ClipboardList },
]

export default function Sidebar() {
  return (
    <aside className="hidden md:flex md:flex-col w-64 shrink-0 bg-ink-950 text-white h-screen sticky top-0">
      <div className="px-6 pt-7 pb-6 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-brand-500 flex items-center justify-center shrink-0">
            <Leaf size={18} strokeWidth={2.25} className="text-white" />
          </div>
          <div>
            <div className="font-semibold text-[15px] leading-tight tracking-tight">Neeman's</div>
            <div className="text-[11px] text-white/50 leading-tight">Feedback Intelligence</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto scrollbar-thin">
        <div className="px-3 mb-2 text-[10.5px] font-semibold tracking-wider text-white/35 uppercase">
          Analytics
        </div>
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                isActive
                  ? 'bg-white/10 text-white font-medium'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`
            }
          >
            <Icon size={17} strokeWidth={2} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="px-5 py-5 border-t border-white/10">
        <div className="text-[11px] text-white/40 leading-relaxed">
          Internal Analytics
          <br />
          <span className="inline-flex items-center gap-1.5 mt-1">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-400 inline-block" />
            Demo Environment
          </span>
        </div>
      </div>
    </aside>
  )
}
