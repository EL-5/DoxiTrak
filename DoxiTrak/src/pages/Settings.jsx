import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Download, Trash2, User, DollarSign, Bell, Database, CheckCircle, Save, Sun, Moon } from 'lucide-react'
import { useApp } from '../store/AppContext'
import { exportToCSV } from '../utils/finance'
import Modal from '../components/Modal'

const CURRENCIES = [
  { code: 'GHS', label: 'GHS – Ghanaian Cedi (₵)' },
  { code: 'USD', label: 'USD – US Dollar ($)'       },
  { code: 'EUR', label: 'EUR – Euro (€)'             },
  { code: 'GBP', label: 'GBP – British Pound (£)'   },
  { code: 'NGN', label: 'NGN – Nigerian Naira (₦)'  },
  { code: 'JPY', label: 'JPY – Japanese Yen (¥)'    },
  { code: 'CAD', label: 'CAD – Canadian Dollar (C$)'},
  { code: 'AUD', label: 'AUD – Australian Dollar (A$)'},
  { code: 'CHF', label: 'CHF – Swiss Franc (Fr)'    },
  { code: 'INR', label: 'INR – Indian Rupee (₹)'    },
]

function SettingRow({ icon: Icon, label, description, children }) {
  return (
    <div
      className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between py-4 last:border-0"
      style={{ borderBottom: '1px solid var(--border)' }}
    >
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'var(--bg-hover)', border: '1px solid var(--border)' }}>
          <Icon size={14} style={{ color: 'var(--text-sub)' }} />
        </div>
        <div>
          <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>{label}</p>
          {description && <p className="text-xs mt-0.5" style={{ color: 'var(--text-sub)' }}>{description}</p>}
        </div>
      </div>
      <div className="shrink-0 w-full sm:w-auto flex justify-start sm:justify-end">{children}</div>
    </div>
  )
}

export default function Settings() {
  const { state, updateSettings, resetAll } = useApp()

  // Local draft of settings — only applied on Save
  const [draft, setDraft] = useState({ ...state.settings })
  const [toast, setToast] = useState(null)
  const [showReset, setShowReset] = useState(false)

  const isDirty = JSON.stringify(draft) !== JSON.stringify(state.settings)

  useEffect(() => {
    setDraft({ ...state.settings })
  }, [state.settings])

  const setDraftField = (k, v) => setDraft(d => ({ ...d, [k]: v }))

  const handleSave = () => {
    updateSettings(draft)
    setToast('Settings saved successfully.')
    setTimeout(() => setToast(null), 3000)
  }

  const handleDiscard = () => {
    setDraft({ ...state.settings })
  }

  const handleExportCSV = () => {
    exportToCSV(state.transactions)
    setToast('Transactions exported.')
    setTimeout(() => setToast(null), 3000)
  }

  const handleReset = () => {
    resetAll()
    setShowReset(false)
    setToast('All data and settings have been reset.')
    setTimeout(() => setToast(null), 3000)
  }

  return (
    <div className="space-y-5">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="fixed top-5 right-5 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm shadow-2xl"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border-mid)', color: 'var(--text)' }}
          >
            <CheckCircle size={14} className="shrink-0" style={{ color: 'var(--text)' }} />
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold" style={{ color: 'var(--text)' }}>Settings</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-sub)' }}>Manage your account preferences</p>
        </div>

        {/* Save / Discard — only shown when there are unsaved changes */}
        <AnimatePresence>
          {isDirty && (
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              className="flex items-center gap-2"
            >
              <button
                onClick={handleDiscard}
                className="px-4 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white border border-[#252525] hover:border-[#333] bg-transparent transition-colors"
              >
                Discard
              </button>
              <button onClick={handleSave} className="neon-btn py-2 px-4 text-sm">
                <Save size={13} /> Save changes
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Unsaved changes banner */}
      <AnimatePresence>
        {isDirty && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500/8 border border-amber-500/20 text-xs text-amber-400 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
              You have unsaved changes — click <span className="font-semibold mx-1">Save changes</span> to apply them.
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Profile */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="glass-card p-5">
        <h2 className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>Profile</h2>
        <SettingRow icon={User} label="Display Name" description="Your name shown in the app">
          <input
            className="input-field w-48 py-2 text-sm text-right"
            value={draft.name}
            onChange={e => setDraftField('name', e.target.value)}
          />
        </SettingRow>
      </motion.div>

      {/* Preferences */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="glass-card p-5">
        <h2 className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>Preferences</h2>
        <SettingRow icon={DollarSign} label="Currency" description="Display currency for all amounts">
          <select
            className="input-field w-52 py-2 text-sm"
            value={draft.currency}
            onChange={e => setDraftField('currency', e.target.value)}
          >
            {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.label}</option>)}
          </select>
        </SettingRow>
        <SettingRow icon={Bell} label="Monthly Budget" description="Your overall spending limit per month">
          <input
            className="input-field w-36 py-2 text-sm text-right"
            type="number"
            min="0"
            value={draft.monthlyBudget}
            onChange={e => setDraftField('monthlyBudget', Number(e.target.value))}
          />
        </SettingRow>
        <SettingRow icon={draft.theme === 'dark' ? Moon : Sun} label="Appearance" description="Toggle between light and dark mode">
          <button
            onClick={() => setDraftField('theme', draft.theme === 'dark' ? 'light' : 'dark')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors"
            style={{
              background: 'var(--bg-hover)',
              border: '1px solid var(--border-mid)',
              color: 'var(--text)',
            }}
          >
            {draft.theme === 'dark'
              ? <><Moon size={13} /> Dark</>
              : <><Sun size={13} /> Light</>
            }
          </button>
        </SettingRow>
      </motion.div>

      {/* Data management */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.11 }} className="glass-card p-5">
        <h2 className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>Data</h2>
        <SettingRow icon={Download} label="Export Transactions" description="Download your full transaction history as CSV">
          <button onClick={handleExportCSV} className="neon-outline-btn py-2 px-4 text-sm">
            <Download size={13} /> Export CSV
          </button>
        </SettingRow>
        <SettingRow icon={Database} label="Local Storage" description={`${state.transactions.length} transactions · ${state.goals.length} goals · ${state.budgets.length} budgets`}>
          <span className="text-xs font-mono px-2.5 py-1 rounded-lg" style={{ color: 'var(--text-sub)', background: 'var(--bg-hover)', border: '1px solid var(--border)' }}>localStorage</span>
        </SettingRow>
        <SettingRow icon={Trash2} label="Reset All Data" description="Permanently clear all app data and settings">
          <button
            onClick={() => setShowReset(true)}
            className="py-2 px-4 rounded-lg text-sm font-medium bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/15 transition-colors"
          >
            Reset
          </button>
        </SettingRow>
      </motion.div>

      {/* About */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }} className="glass-card p-5">
        <h2 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>About</h2>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'var(--bg-hover)', border: '1px solid var(--border)' }}>
            <span className="text-base">📊</span>
          </div>
          <div>
            <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>DoxiTrak</p>
            <p className="text-xs" style={{ color: 'var(--text-sub)' }}>Personal Finance Tracker · v1.0.0</p>
          </div>
        </div>
        <p className="text-xs leading-relaxed mt-3" style={{ color: 'var(--text-sub)' }}>
          A personal finance dashboard for tracking income, expenses, budgets and savings goals. All data is stored locally on your device.
        </p>
      </motion.div>

      {/* Reset Modal */}
      <Modal open={showReset} onClose={() => setShowReset(false)} title="Reset All Data" maxWidth="max-w-sm">
        <div className="text-center">
          <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
            <Trash2 size={20} className="text-red-400" />
          </div>
          <p className="text-gray-300 text-sm mb-1 font-medium">This will permanently delete:</p>
          <ul className="text-xs text-gray-500 space-y-1 mb-5 mt-2">
            <li>{state.transactions.length} transactions</li>
            <li>{state.budgets.length} budgets</li>
            <li>{state.goals.length} goals</li>
            <li>All settings</li>
          </ul>
          <div className="flex gap-3">
            <button onClick={() => setShowReset(false)} className="neon-outline-btn flex-1 justify-center">Cancel</button>
            <button onClick={handleReset} className="flex-1 py-2.5 px-5 rounded-xl bg-red-500/15 text-red-400 border border-red-500/25 font-semibold hover:bg-red-500/20 transition-colors">Delete everything</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
