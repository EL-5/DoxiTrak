import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Plus, Pencil, Trash2, AlertTriangle, CheckCircle, Wallet } from 'lucide-react'
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
        <label className="text-xs text-gray-400 mb-1.5 block">Category</label>
        <select className="input-field" value={form.category} onChange={e => set('category', e.target.value)}>
          {EXPENSE_CATS.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <div>
        <label className="text-xs text-gray-400 mb-1.5 block">Monthly Limit</label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
          <input className="input-field pl-8" type="number" min="1" step="1" placeholder="0" value={form.limit} onChange={e => set('limit', e.target.value)} required />
        </div>
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

  const budgetStats = useMemo(() => state.budgets.map(b => {
    const spent = state.transactions
      .filter(t => t.type === 'expense' && t.category === b.category && isSameMonth(t.date, year, month))
      .reduce((s, t) => s + t.amount, 0)
    const pct = Math.min((spent / b.limit) * 100, 100)
    return { ...b, spent, pct, remaining: b.limit - spent, status: pct >= 100 ? 'over' : pct >= 85 ? 'warning' : 'ok' }
  }), [state.budgets, state.transactions, year, month])

  const totalSpent = budgetStats.reduce((s, b) => s + b.spent, 0)
  const totalBudget = budgetStats.reduce((s, b) => s + b.limit, 0)
  const overallPct = totalBudget > 0 ? Math.min((totalSpent / totalBudget) * 100, 100) : 0

  const getBarColor = (status) => status === 'over' ? '#f87171' : status === 'warning' ? '#fbbf24' : '#00FF9F'
  const getBarGlow  = (status) => status === 'over' ? 'rgba(248,113,113,0.4)' : status === 'warning' ? 'rgba(251,191,36,0.4)' : 'rgba(0,255,159,0.4)'

  const handleAdd    = (b) => { addBudget(b); setShowAdd(false) }
  const handleUpdate = (b) => { updateBudget(b); setEditing(null) }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white">Budget</h1>
          <p className="text-xs text-gray-600 mt-0.5">Monthly spending limits</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="neon-btn"><Plus size={14} /> Add Budget</button>
      </motion.div>

      {/* Overall budget */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="glass-card p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Wallet size={18} className="text-[#00FF9F]" />
            <h2 className="font-semibold text-white">Overall Monthly Budget</h2>
          </div>
          <button onClick={() => setEditOverall(true)} className="text-xs text-[#00FF9F] hover:underline">Edit limit</button>
        </div>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <p className="text-xs text-gray-500 mb-1">Limit</p>
            <p className="text-lg font-bold text-white font-mono">{formatCurrency(state.settings.monthlyBudget, state.settings.currency)}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500 mb-1">Spent</p>
            <p className={`text-lg font-bold font-mono ${totalSpent > state.settings.monthlyBudget ? 'text-red-400' : 'text-white'}`}>{formatCurrency(totalSpent, state.settings.currency)}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500 mb-1">Remaining</p>
            <p className={`text-lg font-bold font-mono ${state.settings.monthlyBudget - totalSpent < 0 ? 'text-red-400' : 'text-[#00FF9F]'}`}>{formatCurrency(state.settings.monthlyBudget - totalSpent, state.settings.currency)}</p>
          </div>
        </div>
        <div className="h-3 rounded-full bg-[#1E1E1E] overflow-hidden">
          <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min((totalSpent / state.settings.monthlyBudget) * 100, 100)}%` }} transition={{ duration: 0.8, ease: 'easeOut' }}
            className="h-full rounded-full"
            style={{ background: totalSpent > state.settings.monthlyBudget * 0.85 ? '#f87171' : '#00FF9F', boxShadow: totalSpent > state.settings.monthlyBudget * 0.85 ? '0 0 10px rgba(248,113,113,0.5)' : '0 0 10px rgba(0,255,159,0.4)' }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-600 mt-1">
          <span>{getCurrencySymbol(state.settings.currency)}0</span>
          <span className={totalSpent > state.settings.monthlyBudget * 0.85 ? 'text-amber-400 font-medium' : ''}>{Math.round((totalSpent / state.settings.monthlyBudget) * 100)}% used</span>
          <span>{formatCurrency(state.settings.monthlyBudget, state.settings.currency)}</span>
        </div>
        {totalSpent > state.settings.monthlyBudget * 0.85 && (
          <div className="mt-3 flex items-center gap-2 text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-xl px-3 py-2">
            <AlertTriangle size={12} /> You're approaching your monthly budget limit!
          </div>
        )}
      </motion.div>

      {/* Category budgets */}
      {budgetStats.length === 0 ? (
        <div className="glass-card p-10 text-center text-gray-600">
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
              className={`glass-card p-5 border ${b.status === 'over' ? 'border-red-500/30' : b.status === 'warning' ? 'border-amber-500/30' : 'border-[#2A2A2A]'}`}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="font-semibold text-white">{b.category}</p>
                    {b.status === 'over'    && <span className="text-[10px] px-2 py-0.5 bg-red-500/20 text-red-400 rounded-full border border-red-500/20 font-medium">Over limit</span>}
                    {b.status === 'warning' && <span className="text-[10px] px-2 py-0.5 bg-amber-500/20 text-amber-400 rounded-full border border-amber-500/20 font-medium">Near limit</span>}
                    {b.status === 'ok'      && <span className="text-[10px] px-2 py-0.5 bg-green-500/20 text-green-400 rounded-full border border-green-500/20 font-medium">On track</span>}
                  </div>
                  <p className="text-xs text-gray-500">{formatCurrency(b.spent, state.settings.currency)} of {formatCurrency(b.limit, state.settings.currency)}</p>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => setEditing(b)} className="w-7 h-7 rounded-lg bg-[#1E1E1E] hover:bg-[#2A2A2A] flex items-center justify-center text-gray-500 hover:text-white transition-colors"><Pencil size={11} /></button>
                  <button onClick={() => setToDelete(b.id)} className="w-7 h-7 rounded-lg bg-[#1E1E1E] hover:bg-red-500/20 flex items-center justify-center text-gray-500 hover:text-red-400 transition-colors"><Trash2 size={11} /></button>
                </div>
              </div>
              <div className="h-2 rounded-full bg-[#1E1E1E] overflow-hidden mb-2">
                <motion.div initial={{ width: 0 }} animate={{ width: `${b.pct}%` }} transition={{ duration: 0.7, ease: 'easeOut', delay: i * 0.05 }}
                  className="h-full rounded-full"
                  style={{ background: getBarColor(b.status), boxShadow: `0 0 6px ${getBarGlow(b.status)}` }}
                />
              </div>
              <div className="flex justify-between text-xs">
                <span className={b.remaining < 0 ? 'text-red-400' : 'text-gray-500'}>
                  {b.remaining < 0 ? `${getCurrencySymbol(state.settings.currency)}${Math.abs(b.remaining).toFixed(0)} over` : `${getCurrencySymbol(state.settings.currency)}${b.remaining.toFixed(0)} left`}
                </span>
                <span className="text-gray-500 font-mono">{b.pct.toFixed(0)}%</span>
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
        <p className="text-gray-400 text-sm mb-5">Remove this budget category?</p>
        <div className="flex gap-3">
          <button onClick={() => setToDelete(null)} className="neon-outline-btn flex-1 justify-center">Cancel</button>
          <button onClick={() => { deleteBudget(toDelete); setToDelete(null) }} className="flex-1 py-2.5 px-5 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30 font-semibold hover:bg-red-500/30 transition-colors">Delete</button>
        </div>
      </Modal>
      <Modal open={editOverall} onClose={() => setEditOverall(false)} title="Monthly Budget Limit" maxWidth="max-w-sm">
        <div className="space-y-4">
          <div>
            <label className="text-xs text-gray-400 mb-1.5 block">Monthly Budget</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
              <input className="input-field pl-8" type="number" min="1" value={overallInput} onChange={e => setOverallInput(e.target.value)} />
            </div>
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
