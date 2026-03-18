import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Plus, Pencil, Trash2, AlertTriangle, Wallet } from 'lucide-react'
import { useApp } from '../store/AppContext'
import { formatCurrency, getCurrencySymbol, getCurrentMonth, isSameMonth, EXPENSE_CATS } from '../utils/finance'
import Modal from '../components/Modal'

function BudgetForm({ initial, onSubmit, onCancel }) {
  const [form, setForm] = useState(initial || { category: 'Food', limit: '' })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.limit || Number(form.limit) <= 0) return
    onSubmit({ ...form, limit: Number(form.limit) })
  }
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-xs mb-1.5 block" style={{ color: 'var(--text-sub)' }}>Category</label>
        <select className="input-field" value={form.category} onChange={e => set('category', e.target.value)}>
          {EXPENSE_CATS.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <div>
        <label className="text-xs mb-1.5 block" style={{ color: 'var(--text-sub)' }}>Monthly Limit</label>
        <input className="input-field" type="number" min="1" step="1" placeholder="0" value={form.limit} onChange={e => set('limit', e.target.value)} required />
      </div>
      <div className="flex gap-3 pt-1">
        <button type="button" onClick={onCancel} className="neon-outline-btn flex-1 justify-center">Cancel</button>
        <button type="submit" className="neon-btn flex-1 justify-center">{initial ? 'Update' : 'Create'} Budget</button>
      </div>
    </form>
  )
}

export default function Budget() {
  const { state, addBudget, updateBudget, deleteBudget, updateSettings } = useApp()
  const [showAdd, setShowAdd] = useState(false)
  const [editing, setEditing] = useState(null)
  const [toDelete, setToDelete] = useState(null)
  const [editOverall, setEditOverall] = useState(false)
  const [overallInput, setOverallInput] = useState(state.settings.monthlyBudget)

  const { year, month } = getCurrentMonth()
  const sym = getCurrencySymbol(state.settings.currency)

  const budgetStats = useMemo(() => state.budgets.map(b => {
    const spent = state.transactions
      .filter(t => t.type === 'expense' && t.category === b.category && isSameMonth(t.date, year, month))
      .reduce((s, t) => s + t.amount, 0)
    const pct = Math.min((spent / b.limit) * 100, 100)
    return { ...b, spent, pct, remaining: b.limit - spent, status: pct >= 100 ? 'over' : pct >= 85 ? 'warning' : 'ok' }
  }), [state.budgets, state.transactions, year, month])

  const totalSpent  = budgetStats.reduce((s, b) => s + b.spent, 0)
  const totalBudget = budgetStats.reduce((s, b) => s + b.limit, 0)

  const getBarColor = (status) => status === 'over' ? '#ef4444' : status === 'warning' ? '#f59e0b' : 'var(--text)'

  const handleAdd    = (b) => { addBudget(b); setShowAdd(false) }
  const handleUpdate = (b) => { updateBudget(b); setEditing(null) }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold" style={{ color: 'var(--text)' }}>Budget</h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-sub)' }}>Monthly spending limits</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="neon-btn"><Plus size={14} /> Add Budget</button>
      </motion.div>

      {/* Overall budget */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="glass-card p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Wallet size={18} style={{ color: 'var(--text-sub)' }} />
            <h2 className="font-semibold" style={{ color: 'var(--text)' }}>Overall Monthly Budget</h2>
          </div>
          <button onClick={() => setEditOverall(true)} className="text-xs hover:underline" style={{ color: 'var(--text-sub)' }}>Edit limit</button>
        </div>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <p className="text-xs mb-1" style={{ color: 'var(--text-sub)' }}>Limit</p>
            <p className="text-lg font-bold font-mono" style={{ color: 'var(--text)' }}>{formatCurrency(state.settings.monthlyBudget, state.settings.currency)}</p>
          </div>
          <div className="text-center">
            <p className="text-xs mb-1" style={{ color: 'var(--text-sub)' }}>Spent</p>
            <p className={`text-lg font-bold font-mono ${totalSpent > state.settings.monthlyBudget ? 'text-red-500' : ''}`} style={totalSpent <= state.settings.monthlyBudget ? { color: 'var(--text)' } : {}}>{formatCurrency(totalSpent, state.settings.currency)}</p>
          </div>
          <div className="text-center">
            <p className="text-xs mb-1" style={{ color: 'var(--text-sub)' }}>Remaining</p>
            <p className={`text-lg font-bold font-mono ${state.settings.monthlyBudget - totalSpent < 0 ? 'text-red-500' : 'text-green-600'}`}>{formatCurrency(state.settings.monthlyBudget - totalSpent, state.settings.currency)}</p>
          </div>
        </div>
        <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg-hover)' }}>
          <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min((totalSpent / state.settings.monthlyBudget) * 100, 100)}%` }} transition={{ duration: 0.8, ease: 'easeOut' }}
            className="h-full rounded-full"
            style={{ background: totalSpent > state.settings.monthlyBudget * 0.85 ? '#ef4444' : 'var(--text)' }}
          />
        </div>
        <div className="flex justify-between text-xs mt-1" style={{ color: 'var(--text-sub)' }}>
          <span>{sym}0</span>
          <span className={totalSpent > state.settings.monthlyBudget * 0.85 ? 'text-amber-500 font-medium' : ''}>{Math.round((totalSpent / state.settings.monthlyBudget) * 100)}% used</span>
          <span>{formatCurrency(state.settings.monthlyBudget, state.settings.currency)}</span>
        </div>
        {totalSpent > state.settings.monthlyBudget * 0.85 && (
          <div className="mt-3 flex items-center gap-2 text-xs text-amber-600 bg-amber-500/8 border border-amber-500/15 rounded-xl px-3 py-2">
            <AlertTriangle size={12} /> You're approaching your monthly budget limit!
          </div>
        )}
      </motion.div>

      {/* Category budgets */}
      {budgetStats.length === 0 ? (
        <div className="glass-card p-10 text-center" style={{ color: 'var(--text-muted)' }}>
          <Wallet size={36} className="mx-auto mb-3 opacity-25" />
          <p className="font-medium">No category budgets yet</p>
          <p className="text-sm mt-1 opacity-60">Create budgets to track spending per category</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {budgetStats.map((b, i) => (
            <motion.div key={b.id}
              initial={{ opacity: 0, y: 12, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: i * 0.07, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -3, transition: { duration: 0.18 } }}
              className="glass-card p-5"
              style={{ borderColor: b.status === 'over' ? 'rgba(239,68,68,0.25)' : b.status === 'warning' ? 'rgba(245,158,11,0.25)' : 'var(--border)' }}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="font-semibold" style={{ color: 'var(--text)' }}>{b.category}</p>
                    {b.status === 'over'    && <span className="text-[10px] px-2 py-0.5 bg-red-500/10 text-red-500 rounded-full border border-red-500/15 font-medium">Over limit</span>}
                    {b.status === 'warning' && <span className="text-[10px] px-2 py-0.5 bg-amber-500/10 text-amber-500 rounded-full border border-amber-500/15 font-medium">Near limit</span>}
                    {b.status === 'ok'      && <span className="text-[10px] px-2 py-0.5 bg-green-500/10 text-green-600 rounded-full border border-green-500/15 font-medium">On track</span>}
                  </div>
                  <p className="text-xs" style={{ color: 'var(--text-sub)' }}>{formatCurrency(b.spent, state.settings.currency)} of {formatCurrency(b.limit, state.settings.currency)}</p>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => setEditing(b)} className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors" style={{ background: 'var(--bg-hover)', color: 'var(--text-sub)' }}><Pencil size={11} /></button>
                  <button onClick={() => setToDelete(b.id)} className="w-7 h-7 rounded-lg flex items-center justify-center text-red-500 hover:bg-red-500/10 transition-colors" style={{ background: 'var(--bg-hover)' }}><Trash2 size={11} /></button>
                </div>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden mb-2" style={{ background: 'var(--bg-hover)' }}>
                <motion.div initial={{ width: 0 }} animate={{ width: `${b.pct}%` }} transition={{ duration: 0.7, ease: 'easeOut', delay: i * 0.05 }}
                  className="h-full rounded-full"
                  style={{ background: getBarColor(b.status) }}
                />
              </div>
              <div className="flex justify-between text-xs" style={{ color: 'var(--text-sub)' }}>
                <span className={b.remaining < 0 ? 'text-red-500' : ''}>
                  {b.remaining < 0 ? `${sym}${Math.abs(b.remaining).toFixed(0)} over` : `${sym}${b.remaining.toFixed(0)} left`}
                </span>
                <span className="font-mono">{b.pct.toFixed(0)}%</span>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modals */}
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Create Budget">
        <BudgetForm onSubmit={handleAdd} onCancel={() => setShowAdd(false)} />
      </Modal>
      <Modal open={!!editing} onClose={() => setEditing(null)} title="Edit Budget">
        <BudgetForm initial={editing} onSubmit={handleUpdate} onCancel={() => setEditing(null)} />
      </Modal>
      <Modal open={!!toDelete} onClose={() => setToDelete(null)} title="Delete Budget" maxWidth="max-w-sm">
        <p className="text-sm mb-5" style={{ color: 'var(--text-sub)' }}>Remove this budget category?</p>
        <div className="flex gap-3">
          <button onClick={() => setToDelete(null)} className="neon-outline-btn flex-1 justify-center">Cancel</button>
          <button onClick={() => { deleteBudget(toDelete); setToDelete(null) }} className="flex-1 py-2.5 px-5 rounded-xl bg-red-500/10 text-red-500 border border-red-500/20 font-semibold hover:bg-red-500/15 transition-colors">Delete</button>
        </div>
      </Modal>
      <Modal open={editOverall} onClose={() => setEditOverall(false)} title="Monthly Budget Limit" maxWidth="max-w-sm">
        <div className="space-y-4">
          <div>
            <label className="text-xs mb-1.5 block" style={{ color: 'var(--text-sub)' }}>Monthly Budget</label>
            <input className="input-field" type="number" min="1" value={overallInput} onChange={e => setOverallInput(e.target.value)} />
          </div>
          <div className="flex gap-3">
            <button onClick={() => setEditOverall(false)} className="neon-outline-btn flex-1 justify-center">Cancel</button>
            <button onClick={() => { updateSettings({ monthlyBudget: Number(overallInput) }); setEditOverall(false) }} className="neon-btn flex-1 justify-center">Save</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
