import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Search, Pencil, Trash2, Filter, X } from 'lucide-react'
import { useApp } from '../store/AppContext'
import { formatCurrency, formatDate, CATEGORIES, CATEGORY_ICONS } from '../utils/finance'
import Modal from '../components/Modal'
import TransactionForm from '../components/TransactionForm'

const TYPES = ['all', 'income', 'expense']

export default function Transactions() {
  const { state, addTransaction, updateTransaction, deleteTransaction } = useApp()
  const [showAdd, setShowAdd] = useState(false)
  const [editing, setEditing]   = useState(null)
  const [search, setSearch]     = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterCat, setFilterCat]   = useState('all')
  const [filterMonth, setFilterMonth] = useState('all')
  const [showFilters, setShowFilters] = useState(false)
  const [toDelete, setToDelete] = useState(null)

  const months = useMemo(() => {
    const set = new Set(state.transactions.map(t => t.date.slice(0, 7)))
    return ['all', ...[...set].sort().reverse()]
  }, [state.transactions])

  const filtered = useMemo(() => {
    return [...state.transactions]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .filter(t => {
        if (filterType !== 'all' && t.type !== filterType) return false
        if (filterCat  !== 'all' && t.category !== filterCat) return false
        if (filterMonth !== 'all' && !t.date.startsWith(filterMonth)) return false
        if (search) {
          const q = search.toLowerCase()
          if (!t.category.toLowerCase().includes(q) && !(t.note || '').toLowerCase().includes(q)) return false
        }
        return true
      })
  }, [state.transactions, filterType, filterCat, filterMonth, search])

  const totalIncome  = filtered.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const totalExpense = filtered.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)

  const handleAdd    = (t) => { addTransaction(t); setShowAdd(false) }
  const handleUpdate = (t) => { updateTransaction(t); setEditing(null) }
  const handleDelete = (id) => { deleteTransaction(id); setToDelete(null) }

  const clearFilters = () => { setFilterType('all'); setFilterCat('all'); setFilterMonth('all'); setSearch('') }
  const hasFilters = filterType !== 'all' || filterCat !== 'all' || filterMonth !== 'all' || search

  return (
    <div className="space-y-5">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold" style={{ color: 'var(--text)' }}>Transactions</h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-sub)' }}>{filtered.length} entries</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="neon-btn">
          <Plus size={14} /> Add
        </button>
      </motion.div>

      {/* Summary mini cards */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Filtered Income',  value: totalIncome,  color: 'text-green-400' },
          { label: 'Filtered Expenses',value: totalExpense, color: 'text-red-400' },
          { label: 'Net',              value: totalIncome - totalExpense, color: totalIncome - totalExpense >= 0 ? 'text-green-600' : 'text-red-500' },
        ].map((s, i) => (
          <div key={i} className="glass-card p-3 text-center">
            <p className="text-xs mb-1" style={{ color: 'var(--text-sub)' }}>{s.label}</p>
            <p className={`text-sm font-bold font-mono ${s.color}`}>{formatCurrency(s.value, state.settings.currency)}</p>
          </div>
        ))}
      </div>

      {/* Search & Filters */}
      <div className="glass-card p-4 space-y-3">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              className="input-field pl-9 py-2.5"
              placeholder="Search transactions..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors" style={{ color: 'var(--text-sub)' }}><X size={14} /></button>}
          </div>
          <button
            onClick={() => setShowFilters(s => !s)}
            className="px-4 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 transition-colors"
            style={{
              background: showFilters ? 'var(--bg-hover)' : 'var(--bg-hover)',
              border: `1px solid ${showFilters ? 'var(--border-mid)' : 'var(--border)'}`,
              color: showFilters ? 'var(--text)' : 'var(--text-sub)',
            }}
          >
            <Filter size={14} /> Filters {hasFilters && <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--text)' }} />}
          </button>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
              <div className="grid grid-cols-3 gap-3 pt-1">
                <div>
                  <label className="text-xs mb-1 block" style={{ color: 'var(--text-sub)' }}>Type</label>
                  <select className="input-field py-2" value={filterType} onChange={e => setFilterType(e.target.value)}>
                    {TYPES.map(t => <option key={t} value={t} className="capitalize">{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs mb-1 block" style={{ color: 'var(--text-sub)' }}>Category</label>
                  <select className="input-field py-2" value={filterCat} onChange={e => setFilterCat(e.target.value)}>
                    <option value="all">All Categories</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs mb-1 block" style={{ color: 'var(--text-sub)' }}>Month</label>
                  <select className="input-field py-2" value={filterMonth} onChange={e => setFilterMonth(e.target.value)}>
                    {months.map(m => <option key={m} value={m}>{m === 'all' ? 'All Months' : m}</option>)}
                  </select>
                </div>
              </div>
              {hasFilters && (
                <button onClick={clearFilters} className="mt-2 text-xs hover:underline flex items-center gap-1" style={{ color: 'var(--text-sub)' }}>
                  <X size={10} /> Clear all filters
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* List */}
      <div className="glass-card overflow-hidden">
        {filtered.length === 0 ? (
          <div className="text-center py-16" style={{ color: 'var(--text-muted)' }}>
            <Search size={36} className="mx-auto mb-3 opacity-25" />
            <p className="font-medium">No transactions found</p>
            <p className="text-sm mt-1 opacity-60">Try adjusting your filters</p>
          </div>
        ) : (
          <div style={{ borderTop: '1px solid var(--border)' }}>
            {filtered.map((t, i) => (
              <motion.div key={t.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.02 }}
                className="flex items-center gap-4 p-4 transition-colors group"
                style={{ borderBottom: '1px solid var(--border)' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                onMouseLeave={e => e.currentTarget.style.background = ''}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0" style={{ background: 'var(--bg-hover)', border: '1px solid var(--border)' }}>
                  {CATEGORY_ICONS[t.category] || '📦'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>{t.category}</p>
                    <span className={t.type === 'income' ? 'badge badge-income' : 'badge badge-expense'}>
                      {t.type}
                    </span>
                  </div>
                  <p className="text-xs truncate" style={{ color: 'var(--text-sub)' }}>{t.note || '—'} · {formatDate(t.date)}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className={`text-sm font-bold font-mono ${t.type === 'income' ? 'text-green-600' : 'text-red-500'}`}>
                    {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount, state.settings.currency)}
                  </p>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  <button onClick={() => setEditing(t)} className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors" style={{ background: 'var(--bg-hover)', color: 'var(--text-sub)' }}>
                    <Pencil size={13} />
                  </button>
                  <button onClick={() => setToDelete(t.id)} className="w-8 h-8 rounded-lg flex items-center justify-center text-red-500 hover:bg-red-500/10 transition-colors" style={{ background: 'var(--bg-hover)' }}>
                    <Trash2 size={13} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Add Modal */}
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add Transaction">
        <TransactionForm onSubmit={handleAdd} onCancel={() => setShowAdd(false)} />
      </Modal>

      {/* Edit Modal */}
      <Modal open={!!editing} onClose={() => setEditing(null)} title="Edit Transaction">
        <TransactionForm initial={editing} onSubmit={handleUpdate} onCancel={() => setEditing(null)} />
      </Modal>

      {/* Delete Confirm */}
      <Modal open={!!toDelete} onClose={() => setToDelete(null)} title="Delete Transaction" maxWidth="max-w-sm">
        <p className="text-sm mb-5" style={{ color: 'var(--text-sub)' }}>Are you sure you want to delete this transaction? This action cannot be undone.</p>
        <div className="flex gap-3">
          <button onClick={() => setToDelete(null)} className="neon-outline-btn flex-1 justify-center">Cancel</button>
          <button onClick={() => handleDelete(toDelete)} className="flex-1 py-2.5 px-5 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30 font-semibold hover:bg-red-500/30 transition-colors">Delete</button>
        </div>
      </Modal>
    </div>
  )
}
