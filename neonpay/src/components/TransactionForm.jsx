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
      <div className="flex gap-2 p-1 bg-[#141414] rounded-xl">
        {['expense', 'income'].map(t => (
          <button
            key={t}
            type="button"
            onClick={() => set('type', t)}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold capitalize transition-all duration-200 ${
              form.type === t
                ? t === 'income'
                  ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                  : 'bg-red-500/20 text-red-400 border border-red-500/30'
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Amount */}
      <div>
        <label className="block text-xs font-medium text-gray-400 mb-1.5">Amount</label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">$</span>
          <input
            className="input-field pl-8"
            type="number"
            placeholder="0.00"
            step="0.01"
            min="0.01"
            value={form.amount}
            onChange={e => set('amount', e.target.value)}
            required
          />
        </div>
      </div>

      {/* Category */}
      <div>
        <label className="block text-xs font-medium text-gray-400 mb-1.5">Category</label>
        <select className="input-field" value={form.category} onChange={e => set('category', e.target.value)}>
          {cats.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Date */}
      <div>
        <label className="block text-xs font-medium text-gray-400 mb-1.5">Date</label>
        <input className="input-field" type="date" value={form.date} onChange={e => set('date', e.target.value)} required />
      </div>

      {/* Note */}
      <div>
        <label className="block text-xs font-medium text-gray-400 mb-1.5">Note <span className="text-gray-600">(optional)</span></label>
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
