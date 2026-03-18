import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Pencil, Trash2, Target, PlusCircle } from 'lucide-react'
import { useApp } from '../store/AppContext'
import { formatCurrency, formatDate } from '../utils/finance'
import Modal from '../components/Modal'

const GOAL_COLORS = ['#1a1a1a', '#3b3b3b', '#6b6b6b', '#ef4444', '#3b82f6', '#8b5cf6', '#f59e0b', '#10b981']
const GOAL_ICONS  = ['🎯', '💻', '✈️', '🏠', '🚗', '📱', '💍', '🛡️', '📚', '💰', '🏋️', '🎓']

function GoalForm({ initial, onSubmit, onCancel }) {
  const [form, setForm] = useState(initial || { name: '', target: '', saved: '', icon: '🎯', color: '#3b3b3b', deadline: '' })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.name || !form.target || Number(form.target) <= 0) return
    onSubmit({ ...form, target: Number(form.target), saved: Number(form.saved) || 0 })
  }
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-xs mb-1.5 block" style={{ color: 'var(--text-sub)' }}>Goal Name</label>
        <input className="input-field" placeholder="e.g. Buy a Laptop" value={form.name} onChange={e => set('name', e.target.value)} required />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs mb-1.5 block" style={{ color: 'var(--text-sub)' }}>Target Amount</label>
          <input className="input-field" type="number" min="1" placeholder="0" value={form.target} onChange={e => set('target', e.target.value)} required />
        </div>
        <div>
          <label className="text-xs mb-1.5 block" style={{ color: 'var(--text-sub)' }}>Saved So Far</label>
          <input className="input-field" type="number" min="0" placeholder="0" value={form.saved} onChange={e => set('saved', e.target.value)} />
        </div>
      </div>
      <div>
        <label className="text-xs mb-1.5 block" style={{ color: 'var(--text-sub)' }}>Deadline <span style={{ color: 'var(--text-muted)' }}>(optional)</span></label>
        <input className="input-field" type="date" value={form.deadline} onChange={e => set('deadline', e.target.value)} />
      </div>
      <div>
        <label className="text-xs mb-2 block" style={{ color: 'var(--text-sub)' }}>Icon</label>
        <div className="flex flex-wrap gap-2">
          {GOAL_ICONS.map(ic => (
            <button key={ic} type="button" onClick={() => set('icon', ic)}
              className="w-9 h-9 rounded-xl text-lg transition-all"
              style={{
                background: form.icon === ic ? 'var(--bg-hover)' : 'var(--input-bg)',
                border: `${form.icon === ic ? '2px' : '1px'} solid ${form.icon === ic ? 'var(--border-mid)' : 'var(--border)'}`,
                transform: form.icon === ic ? 'scale(1.1)' : 'scale(1)',
              }}>
              {ic}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="text-xs mb-2 block" style={{ color: 'var(--text-sub)' }}>Color</label>
        <div className="flex gap-2 flex-wrap">
          {GOAL_COLORS.map(c => (
            <button key={c} type="button" onClick={() => set('color', c)}
              className="w-7 h-7 rounded-full transition-all"
              style={{
                background: c,
                border: '2px solid transparent',
                transform: form.color === c ? 'scale(1.25)' : 'scale(1)',
                outline: form.color === c ? '2px solid var(--border-mid)' : 'none',
                outlineOffset: '2px',
              }} />
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
      <p className="text-sm" style={{ color: 'var(--text-sub)' }}>Add funds to <span className="font-medium" style={{ color: 'var(--text)' }}>{goal?.name}</span></p>
      <div>
        <label className="text-xs mb-1.5 block" style={{ color: 'var(--text-sub)' }}>Amount to Add</label>
        <input className="input-field" type="number" min="0.01" step="0.01" placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)} required />
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
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="text-xl font-semibold" style={{ color: 'var(--text)' }}>Goals</h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-sub)' }}>Savings milestones</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="neon-btn w-full sm:w-auto justify-center"><Plus size={14} /> New Goal</button>
      </motion.div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Targeted',  value: formatCurrency(totalTargeted, state.settings.currency) },
          { label: 'Total Saved',     value: formatCurrency(totalSaved, state.settings.currency)    },
          { label: 'Goals Completed', value: `${completed} / ${state.goals.length}`                },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }} className="glass-card p-4 text-center">
            <p className="text-xs mb-1" style={{ color: 'var(--text-sub)' }}>{s.label}</p>
            <p className="text-lg font-bold font-mono" style={{ color: 'var(--text)' }}>{s.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Goals grid */}
      {state.goals.length === 0 ? (
        <div className="glass-card p-14 text-center" style={{ color: 'var(--text-muted)' }}>
          <Target size={40} className="mx-auto mb-3 opacity-25" />
          <p className="font-medium text-base">No goals yet</p>
          <p className="text-sm mt-1 opacity-60">Create your first savings goal to get started</p>
          <button onClick={() => setShowAdd(true)} className="neon-btn mt-4 mx-auto">Create Goal</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {state.goals.map((g, i) => {
            const pct      = Math.min((g.saved / g.target) * 100, 100)
            const done     = g.saved >= g.target
            const daysLeft = g.deadline ? Math.ceil((new Date(g.deadline) - new Date()) / (1000*60*60*24)) : null
            return (
              <motion.div key={g.id}
                initial={{ opacity: 0, y: 16, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: i * 0.07, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="glass-card p-5 group relative">
                {done && (
                  <div className="absolute top-3 right-3 text-xs px-2 py-0.5 rounded-full font-medium text-green-600 bg-green-500/8 border border-green-500/15">✓ Complete</div>
                )}
                {/* Header */}
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl shrink-0"
                    style={{ background: 'var(--bg-hover)', border: '1px solid var(--border)' }}>
                    {g.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate" style={{ color: 'var(--text)' }}>{g.name}</p>
                    {g.deadline && (
                      <p className={`text-xs ${daysLeft !== null && daysLeft < 30 ? 'text-amber-500' : ''}`}
                        style={daysLeft === null || daysLeft >= 30 ? { color: 'var(--text-sub)' } : {}}>
                        {daysLeft !== null && daysLeft >= 0 ? `${daysLeft} days left` : 'Deadline passed'} · {formatDate(g.deadline)}
                      </p>
                    )}
                  </div>
                </div>

                {/* Progress */}
                <div className="mb-3">
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="font-mono" style={{ color: 'var(--text-sub)' }}>{formatCurrency(g.saved, state.settings.currency)}</span>
                    <span className="font-mono" style={{ color: 'var(--text-muted)' }}>{formatCurrency(g.target, state.settings.currency)}</span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg-hover)' }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.9, ease: 'easeOut', delay: i * 0.05 }}
                      className="h-full rounded-full"
                      style={{ background: done ? '#22c55e' : 'var(--text)' }}
                    />
                  </div>
                  <div className="flex justify-between text-xs mt-1">
                    <span className="font-semibold" style={{ color: 'var(--text-sub)' }}>{pct.toFixed(0)}% saved</span>
                    {!done && <span style={{ color: 'var(--text-muted)' }}>{formatCurrency(g.target - g.saved, state.settings.currency)} to go</span>}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-4 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
                  {!done && (
                    <button onClick={() => setAddFunds(g)} className="flex-1 py-1.5 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
                      style={{ background: 'var(--bg-hover)', color: 'var(--text-sub)', border: '1px solid var(--border)' }}>
                      <PlusCircle size={12} /> Add Funds
                    </button>
                  )}
                  <button onClick={() => setEditing(g)} className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors" style={{ background: 'var(--bg-hover)', color: 'var(--text-sub)' }}><Pencil size={12} /></button>
                  <button onClick={() => setToDelete(g.id)} className="w-8 h-8 rounded-lg flex items-center justify-center text-red-500 hover:bg-red-500/10 transition-colors" style={{ background: 'var(--bg-hover)' }}><Trash2 size={12} /></button>
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
        <p className="text-sm mb-5" style={{ color: 'var(--text-sub)' }}>Delete this savings goal? This cannot be undone.</p>
        <div className="flex gap-3">
          <button onClick={() => setToDelete(null)} className="neon-outline-btn flex-1 justify-center">Cancel</button>
          <button onClick={() => { deleteGoal(toDelete); setToDelete(null) }} className="flex-1 py-2.5 px-5 rounded-xl bg-red-500/10 text-red-500 border border-red-500/20 font-semibold hover:bg-red-500/15 transition-colors">Delete</button>
        </div>
      </Modal>
    </div>
  )
}
