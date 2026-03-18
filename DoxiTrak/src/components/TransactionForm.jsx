import { useState, useEffect } from 'react'
import { EXPENSE_CATS, INCOME_CATS } from '../utils/finance'

const EMPTY = { amount: '', type: 'expense', category: 'Food', date: new Date().toISOString().slice(0, 10), note: '' }

export default function TransactionForm({ initial, onSubmit, onCancel }) {
  const [form, setForm] = useState(initial || EMPTY)

  useEffect(() => { setForm(initial || EMPTY) }, [initial])

  const cats = form.type === 'income' ? INCOME_CATS : EXPENSE_CATS

  const set = (k, v) => {
    setForm(f => {
      const next = { ...f, [k]: v }
      if (k === 'type') next.category = v === 'income' ? 'Salary' : 'Food'
      return next
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.amount || isNaN(Number(form.amount)) || Number(form.amount) <= 0) return
    onSubmit({ ...form, amount: Number(form.amount) })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Type toggle */}
      <div className="flex gap-2 p-1 rounded-xl" style={{ background: 'var(--bg-hover)' }}>
        {['expense', 'income'].map(t => (
          <button
            key={t}
            type="button"
            onClick={() => set('type', t)}
            className="flex-1 py-2 rounded-lg text-sm font-semibold capitalize transition-all duration-200"
            style={form.type === t ? {
              background: t === 'income' ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)',
              color:      t === 'income' ? '#16a34a' : '#dc2626',
              border:     `1px solid ${t === 'income' ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`,
            } : { color: 'var(--text-sub)' }}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Amount */}
      <div>
        <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-sub)' }}>Amount</label>
        <input
          className="input-field"
          type="number"
          placeholder="0.00"
          step="0.01"
          min="0.01"
          value={form.amount}
          onChange={e => set('amount', e.target.value)}
          required
        />
      </div>

      {/* Category */}
      <div>
        <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-sub)' }}>Category</label>
        <select className="input-field" value={form.category} onChange={e => set('category', e.target.value)}>
          {cats.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Date */}
      <div>
        <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-sub)' }}>Date</label>
        <input className="input-field" type="date" value={form.date} onChange={e => set('date', e.target.value)} required />
      </div>

      {/* Note */}
      <div>
        <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-sub)' }}>
          Note <span style={{ color: 'var(--text-muted)' }}>(optional)</span>
        </label>
        <input className="input-field" type="text" placeholder="Add a note..." value={form.note} onChange={e => set('note', e.target.value)} maxLength={100} />
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-1">
        <button type="button" onClick={onCancel} className="neon-outline-btn flex-1 justify-center">Cancel</button>
        <button type="submit" className="neon-btn flex-1 justify-center">
          {initial ? 'Update' : 'Add'} Transaction
        </button>
      </div>
    </form>
  )
}
