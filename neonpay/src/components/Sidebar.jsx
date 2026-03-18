import { NavLink } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, ArrowLeftRight, BarChart3, Target, Wallet, Settings, X, Menu
} from 'lucide-react'
import { useState } from 'react'
import { useApp } from '../store/AppContext'

const NAV = [
  { to: '/',            label: 'Dashboard',    icon: LayoutDashboard },
  { to: '/transactions',label: 'Transactions', icon: ArrowLeftRight  },
  { to: '/analytics',   label: 'Analytics',    icon: BarChart3       },
  { to: '/budget',      label: 'Budget',       icon: Wallet          },
  { to: '/goals',       label: 'Goals',        icon: Target          },
  { to: '/settings',    label: 'Settings',     icon: Settings        },
]

function SidebarContent({ onClose }) {
  const { state } = useApp()
  const name = state.settings.name || 'User'
  const initials = name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center justify-between mb-8 px-1">
        <span className="text-[17px] font-semibold tracking-tight" style={{ color: 'var(--text)' }}>
          Doxi<span style={{ color: 'var(--text-sub)' }}>Trak</span>
        </span>
        {onClose && (
          <button onClick={onClose} className="lg:hidden transition-colors" style={{ color: 'var(--text-muted)' }}>
            <X size={17} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-0.5 flex-1">
        {NAV.map(({ to, label, icon: Icon }, i) => (
          <motion.div
            key={to}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04, duration: 0.3 }}
          >
            <NavLink
              to={to}
              end={to === '/'}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              onClick={onClose}
            >
              <Icon size={15} />
              <span>{label}</span>
            </NavLink>
          </motion.div>
        ))}
      </nav>

      {/* Footer */}
      <div className="mt-auto pt-4" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="flex items-center gap-2.5 px-1">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center font-semibold text-[10px] shrink-0"
            style={{ background: 'var(--bg-hover)', border: '1px solid var(--border)', color: 'var(--text)' }}>
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium truncate" style={{ color: 'var(--text)' }}>{name}</p>
            <p className="text-[10px] truncate" style={{ color: 'var(--text-muted)' }}>Personal account</p>
          </div>
          <div className="ml-auto shrink-0">
            <span className="flex items-center gap-1 text-[9px] font-mono" style={{ color: 'var(--text-muted)' }}>
              <span className="w-1 h-1 rounded-full" style={{ background: 'var(--text-sub)' }} />
              online
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      {/* Desktop */}
      <aside className="hidden lg:flex flex-col w-56 shrink-0 p-5 h-screen sticky top-0"
        style={{ background: 'var(--bg-card)', borderRight: '1px solid var(--border)' }}>
        <SidebarContent />
      </aside>

      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-sub)' }}
      >
        <Menu size={16} />
      </button>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 z-40 backdrop-blur-sm"
            style={{ background: 'rgba(0,0,0,0.4)' }}
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Mobile drawer */}
      <motion.aside
        initial={{ x: -240 }}
        animate={{ x: mobileOpen ? 0 : -240 }}
        transition={{ type: 'spring', damping: 28, stiffness: 320 }}
        className="lg:hidden fixed top-0 left-0 h-full w-56 p-5 z-50"
        style={{ background: 'var(--bg-card)', borderRight: '1px solid var(--border)' }}
      >
        <SidebarContent onClose={() => setMobileOpen(false)} />
      </motion.aside>
    </>
  )
}
