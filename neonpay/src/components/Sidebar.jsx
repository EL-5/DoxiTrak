import { NavLink } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, ArrowLeftRight, BarChart3, Target, Wallet, Settings, Zap, X, Menu
} from 'lucide-react'
import { useState } from 'react'

const NAV = [
  { to: '/',            label: 'Dashboard',    icon: LayoutDashboard },
  { to: '/transactions',label: 'Transactions', icon: ArrowLeftRight  },
  { to: '/analytics',   label: 'Analytics',    icon: BarChart3       },
  { to: '/budget',      label: 'Budget',       icon: Wallet          },
  { to: '/goals',       label: 'Goals',        icon: Target          },
  { to: '/settings',    label: 'Settings',     icon: Settings        },
]

function SidebarContent({ onClose }) {
  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center justify-between mb-8 px-1">
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: '#00FF9F' }}
          >
            <Zap size={16} className="text-black" fill="black" />
          </div>
          <span
            className="text-[15px] font-semibold text-white tracking-tight logo-glitch"
            data-text="NeonPay"
          >
            NeonPay
          </span>
        </div>
        {onClose && (
          <button onClick={onClose} className="lg:hidden text-gray-600 hover:text-white transition-colors">
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
      <div className="mt-auto pt-4 border-t border-[#161616]">
        <div className="flex items-center gap-2.5 px-1">
          <div className="w-7 h-7 rounded-lg bg-[#00FF9F]/10 border border-[#00FF9F]/15 flex items-center justify-center text-[#00FF9F] font-semibold text-[10px] shrink-0">
            AJ
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-white truncate">Alex Johnson</p>
            <p className="text-[10px] text-gray-600 truncate">Personal account</p>
          </div>
          <div className="ml-auto shrink-0">
            <span className="flex items-center gap-1 text-[9px] text-gray-700 font-mono">
              <span className="w-1 h-1 rounded-full bg-[#00FF9F] opacity-60" />
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
      <aside className="hidden lg:flex flex-col w-56 shrink-0 border-r border-[#161616] p-5 h-screen sticky top-0 bg-[#0a0a0a]">
        <SidebarContent />
      </aside>

      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 w-9 h-9 bg-[#111] border border-[#222] rounded-xl flex items-center justify-center text-gray-500 hover:text-white transition-colors"
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
            className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Mobile drawer */}
      <motion.aside
        initial={{ x: -240 }}
        animate={{ x: mobileOpen ? 0 : -240 }}
        transition={{ type: 'spring', damping: 28, stiffness: 320 }}
        className="lg:hidden fixed top-0 left-0 h-full w-56 border-r border-[#161616] p-5 z-50 bg-[#0a0a0a]"
      >
        <SidebarContent onClose={() => setMobileOpen(false)} />
      </motion.aside>
    </>
  )
}
