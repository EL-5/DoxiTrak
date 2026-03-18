import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Pencil, Trash2, Target, PlusCircle } from 'lucide-react'
import { useApp } from '../store/AppContext'
import { formatCurrency, formatDate } from '../utils/finance'
import Modal from '../components/Modal'

const GOAL_COLORS = ['#00FF9F', '#818cf8', '#f59e0b', '#f87171', '#60a5fa', '#e879f9', '#34d399', '#fb923c']
const GOAL_ICONS  = ['🎯', '💻', '✈️', '🏠', '🚗', '📱', '💍', '🛡️', '📚', '💰', '🏋️', '🎓']

function GoalForm({ initial, onSubmit, onCancel }) {
  const [form, setForm] = useState(initial || { name: '', target: '', saved: '', icon: '🎯', color: '#00FF9F', deadline: '' })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.name || !form.target || Number(form.target) <= 0) return
    onSubmit({ ...form, target: Number(form.target), saved: Number(form.saved) || 0 })
  }
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-xs text-gray-400 mb-1.5 block">Goal Name</label>
        <input className="input-field" placeholder="e.g. Buy a Laptop" value={form.name} onChange={e => set('name', e.target.value)} required />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-gray-400 mb-1.5 block">Target Amount</label>
          <div className="relative"><span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
            <input className="input-field pl-8" type="number" min="1" placeholder="0" value={form.target} onChange={e => set('target', e.target.value)} required /></div>
        </div>
        <div>
          <label className="text-xs text-gray-400 mb-1.5 block">Saved So Far</label>
          <div className="relative"><span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
            <input className="input-field pl-8" type="number" min="0" placeholder="0" value={form.saved} onChange={e => set('saved', e.target.value)} /></div>
        </div>
      </div>
      <div>
        <label className="text-xs text-gray-400 mb-1.5 block">Deadline <span className="text-gray-600">(optional)</span></label>
        <input className="input-field" type="date" value={form.deadline} onChange={e => set('deadline', e.target.value)} />
      </div>
      <div>
        <label className="text-xs text-gray-400 mb-2 block">Icon</label>
        <div className="flex flex-wrap gap-2">
          {GOAL_ICONS.map(ic => (
            <button key={ic} type="button" onClick={() => set('icon', ic)}
              className={`w-9 h-9 rounded-xl text-lg transition-all ${form.icon === ic ? 'bg-[#00FF9F]/20 border-2 border-[#00FF9F] scale-110' : 'bg-[#1A1A1A] border border-[#2A2A2A] hover:bg-[#2A2A2A]'}`}>
              {ic}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="text-xs text-gray-400 mb-2 block">Color</label>
        <div className="flex gap-2 flex-wrap">
          {GOAL_COLORS.map(c => (
            <button key={c} type="button" onClick={() => set('color', c)}
              className={`w-7 h-7 rounded-full transition-all ${form.color === c ? 'scale-125 ring-2 ring-white/40' : 'hover:scale-110'}`}
              style={{ background: c }} />
          ))}
        </div>
      </div>
      <div className="flex gap-3 pt-1">
        <button type="button" onClick={onCancel} className="neon-outline-btn flex-1 justify-center">Cancel</button>
        <button type="submit" className="neon-btn flex-1 justify-center">{initial ? 'Update' : 'Create'} Goal</button>
      </div>
    </form>
  )
}

function AddFundsModal({ goal, onSubmit, onCancel }) {
  const [amount, setAmount] = useState('')
  const handleSubmit = (e) => {
    e.preventDefault()
    const n = Number(amount)
    if (!n || n <= 0) return
    onSubmit(n)
  }
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-sm text-gray-400">Add funds to <span className="text-white font-medium">{goal?.name}</span></p>
      <div>
        <label className="text-xs text-gray-400 mb-1.5 block">Amount to Add</label>
        <div className="relative"><span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
          <input className="input-field pl-8" type="number" min="0.01" step="0.01" placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)} required /></div>
      </div>
      <div className="flex gap-3">
        <button type="button" onClick={onCancel} className="neon-outline-btn flex-1 justify-center">Cancel</button>
        <button type="submit" className="neon-btn flex-1 justify-center">Add Funds</button>
      </div>
    </form>
  )
}

export default function Goals() {
  const { state, addGoal, updateGoal, deleteGoal } = useApp()
  const [showAdd, setShowAdd] = useState(false)
  const [editing, setEditing] = useState(null)
  const [toDelete, setToDelete] = useState(null)
  const [addFunds, setAddFunds] = useState(null)

  const handleAdd       = (g)   => { addGoal(g); setShowAdd(false) }
  const handleUpdate    = (g)   => { updateGoal(g); setEditing(null) }
  const handleAddFunds  = (amt) => { updateGoal({ ...addFunds, saved: Math.min(addFunds.saved + amt, addFunds.target) }); setAddFunds(null) }

  const totalTargeted = state.goals.reduce((s, g) => s + g.target, 0)
  const totalSaved    = state.goals.reduce((s, g) => s + g.saved, 0)
  const completed     = state.goals.filter(g => g.saved >= g.target).length

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white">Goals</h1>
          <p className="text-xs text-gray-600 mt-0.5">Savings milestones</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="neon-btn"><Plus size={14} /> New Goal</button>
      </motion.div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Targeted', value: formatCurrency(totalTargeted, state.settings.currency), color: 'text-white' },
          { label: 'Total Saved',    value: formatCurrency(totalSaved, state.settings.currency),    color: 'text-[#00FF9F]' },
          { label: 'Goals Completed', value: `${completed} / ${state.goals.length}`, color: 'text-purple-400' },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }} className="glass-card p-4 text-center">
            <p className="text-xs text-gray-500 mb-1">{s.label}</p>
            <p className={`text-lg font-bold font-mono ${s.color}`}>{s.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Goals grid */}
      {state.goals.length === 0 ? (
        <div className="glass-card p-14 text-center text-gray-600">
          <Target size={40} className="mx-auto mb-3 opacity-25" />
          <p className="font-medium text-base">No goals yet</p>
          <p className="text-sm mt-1 opacity-60">Create your first savings goal to get started</p>
          <button onClick={() => setShowAdd(true)} className="neon-btn mt-4 mx-auto">Create Goal</button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
          {state.goals.map((g, i) => {
            const pct     = Math.min((g.saved / g.target) * 100, 100)
            const done    = g.saved >= g.target
            const daysLeft = g.deadline ? Math.ceil((new Date(g.deadline) - new Date()) / (1000*60*60*24)) : null
            return (
              <motion.div key={g.id}
                initial={{ opacity: 0, y: 16, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: i * 0.07, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className={`glass-card p-5 border ${done ? 'border-[#00FF9F]/30' : 'border-[#2A2A2A]'} group relative`}>
                {done && (
                  <div className="absolute top-3 right-3 text-xs px-2 py-0.5 bg-[#00FF9F]/15 text-[#00FF9F] border border-[#00FF9F]/25 rounded-full font-medium">✓ Complete</div>
                )}
                {/* Header */}
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl shrink-0" style={{ background: `${g.color}18`, border: `1px solid ${g.color}30` }}>
                    {g.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white truncate">{g.name}</p>
                    {g.deadline && (
                      <p className={`text-xs ${daysLeft !== null && daysLeft < 30 ? 'text-amber-400' : 'text-gray-500'}`}>
                        {daysLeft !== null && daysLeft >= 0 ? `${daysLeft} days left` : 'Deadline passed'} · {formatDate(g.deadline)}
                      </p>
                    )}
                  </div>
                </div>

                {/* Progress */}
                <div className="mb-3">
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-gray-400 font-mono">{formatCurrency(g.saved, state.settings.currency)}</span>
                    <span className="text-gray-600 font-mono">{formatCurrency(g.target, state.settings.currency)}</span>
                  </div>
                  <div className="h-2.5 rounded-full bg-[#1E1E1E] overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.9, ease: 'easeOut', delay: i * 0.05 }}
                      className="h-full rounded-full"
                      style={{ background: done ? `linear-gradient(90deg, ${g.color}, #00cc7e)` : g.color, boxShadow: `0 0 8px ${g.color}60` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs mt-1">
                    <span style={{ color: g.color }} className="font-semibold">{pct.toFixed(0)}% saved</span>
                    {!done && <span className="text-gray-600">{formatCurrency(g.target - g.saved, state.settings.currency)} to go</span>}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-4 pt-3 border-t border-[#1E1E1E]">
                  {!done && (
                    <button onClick={() => setAddFunds(g)} className="flex-1 py-1.5 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-colors" style={{ background: `${g.color}18`, color: g.color, border: `1px solid ${g.color}30` }}>
                      <PlusCircle size={12} /> Add Funds
                    </button>
                  )}
                  <button onClick={() => setEditing(g)} className="w-8 h-8 rounded-lg bg-[#1A1A1A] hover:bg-[#2A2A2A] flex items-center justify-center text-gray-500 hover:text-white transition-colors"><Pencil size={12} /></button>
                  <button onClick={() => setToDelete(g.id)} className="w-8 h-8 rounded-lg bg-[#1A1A1A] hover:bg-red-500/20 flex items-center justify-center text-gray-500 hover:text-red-400 transition-colors"><Trash2 size={12} /></button>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Modals */}
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="New Savings Goal" maxWidth="max-w-md">
        <GoalForm onSubmit={handleAdd} onCancel={() => setShowAdd(false)} />
      </Modal>
      <Modal open={!!editing} onClose={() => setEditing(null)} title="Edit Goal" maxWidth="max-w-md">
        <GoalForm initial={editing} onSubmit={handleUpdate} onCancel={() => setEditing(null)} />
      </Modal>
      <Modal open={!!addFunds} onClose={() => setAddFunds(null)} title="Add Funds" maxWidth="max-w-sm">
        <AddFundsModal goal={addFunds} onSubmit={handleAddFunds} onCancel={() => setAddFunds(null)} />
      </Modal>
      <Modal open={!!toDelete} onClose={() => setToDelete(null)} title="Delete Goal" maxWidth="max-w-sm">
        <p className="text-gray-400 text-sm mb-5">Delete this savings goal? This cannot be undone.</p>
        <div className="flex gap-3">
          <button onClick={() => setToDelete(null)} className="neon-outline-btn flex-1 justify-center">Cancel</button>
          <button onClick={() => { deleteGoal(toDelete); setToDelete(null) }} className="flex-1 py-2.5 px-5 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30 font-semibold hover:bg-red-500/30 transition-colors">Delete</button>
        </div>
      </Modal>
    </div>
  )
}
