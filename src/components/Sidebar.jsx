import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, PlusCircle, Calendar, Wallet, Clock,
  CheckSquare, Lightbulb, X, Sparkles
} from 'lucide-react'

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/create', label: 'Create Event', icon: PlusCircle },
  { path: '/events', label: 'My Events', icon: Calendar },
  { path: '/budget', label: 'Budget Planner', icon: Wallet },
  { path: '/timeline', label: 'Timeline', icon: Clock },
  { path: '/vendors', label: 'Vendor Checklist', icon: CheckSquare },
  { path: '/ideas', label: 'AI Ideas', icon: Lightbulb },
]

export default function Sidebar({ isOpen, onClose }) {
  return (
    <aside
      className={`fixed top-0 left-0 h-full w-64 z-50 flex flex-col transition-transform duration-300
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
      style={{ background: 'linear-gradient(180deg, #4c1d95 0%, #5b21b6 60%, #6d28d9 100%)' }}
      aria-label="Main navigation"
    >
      {/* Logo */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.2)' }}>
            <Sparkles className="w-5 h-5 text-yellow-300" />
          </div>
          <div>
            <div className="text-white font-bold text-lg leading-tight">EventWise AI</div>
            <div className="text-purple-200 text-xs">Plan Smarter. Celebrate Better.</div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="lg:hidden p-1 rounded text-purple-200 hover:text-white hover:bg-white/10"
          aria-label="Close menu"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto" aria-label="Sidebar navigation">
        <ul className="space-y-1">
          {navItems.map(({ path, label, icon: Icon }) => (
            <li key={path}>
              <NavLink
                to={path}
                end={path === '/'}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-150
                  ${isActive
                    ? 'bg-white text-purple-800 shadow-lg'
                    : 'text-purple-100 hover:bg-white/10 hover:text-white'
                  }`
                }
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-white/10">
        <div className="text-xs text-purple-300">
          <div className="font-medium text-purple-200 mb-1">EventWise AI v1.0</div>
          <div>Powered by Google Gemini</div>
        </div>
      </div>
    </aside>
  )
}
