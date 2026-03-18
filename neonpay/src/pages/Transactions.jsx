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
          <h1 className="text-xl font-semibold text-white">Transactions</h1>
          <p className="text-xs text-gray-600 mt-0.5">{filtered.length} entries</p>
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
          { label: 'Net',              value: totalIncome - totalExpense, color: totalIncome - totalExpense >= 0 ? 'text-[#00FF9F]' : 'text-red-400' },
        ].map((s, i) => (
          <div key={i} className="glass-card p-3 text-center">
            <p className="text-xs text-gray-500 mb-1">{s.label}</p>
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
            {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"><X size={14} /></button>}
          </div>
          <button
            onClick={() => setShowFilters(s => !s)}
            className={`px-4 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 transition-all ${showFilters ? 'bg-[#00FF9F]/15 text-[#00FF9F] border border-[#00FF9F]/30' : 'bg-[#1A1A1A] text-gray-400 border border-[#2A2A2A] hover:text-white'}`}
          >
            <Filter size={14} /> Filters {hasFilters && <span className="w-1.5 h-1.5 rounded-full bg-[#00FF9F]" />}
          </button>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
              <div className="grid grid-cols-3 gap-3 pt-1">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Type</label>
                  <select className="input-field py-2" value={filterType} onChange={e => setFilterType(e.target.value)}>
                    {TYPES.map(t => <option key={t} value={t} className="capitalize">{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Category</label>
                  <select className="input-field py-2" value={filterCat} onChange={e => setFilterCat(e.target.value)}>
                    <option value="all">All Categories</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Month</label>
                  <select className="input-field py-2" value={filterMonth} onChange={e => setFilterMonth(e.target.value)}>
                    {months.map(m => <option key={m} value={m}>{m === 'all' ? 'All Months' : m}</option>)}
                  </select>
                </div>
              </div>
              {hasFilters && (
                <button onClick={clearFilters} className="mt-2 text-xs text-[#00FF9F] hover:underline flex items-center gap-1">
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
          <div className="text-center py-16 text-gray-600">
            <Search size={36} className="mx-auto mb-3 opacity-25" />
            <p className="font-medium">No transactions found</p>
            <p className="text-sm mt-1 opacity-60">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="divide-y divide-[#1E1E1E]">
            {filtered.map((t, i) => (
              <motion.div key={t.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.02 }}
                className="flex items-center gap-4 p-4 hover:bg-[#141414] transition-colors group"
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg bg-[#1A1A1A] group-hover:bg-[#222] shrink-0">
                  {CATEGORY_ICONS[t.category] || '📦'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-sm font-medium text-white">{t.category}</p>
                    <span className={t.type === 'income' ? 'badge badge-income' : 'badge badge-expense'}>
                      {t.type}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 truncate">{t.note || '—'} · {formatDate(t.date)}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className={`text-sm font-bold font-mono ${t.type === 'income' ? 'text-green-400' : 'text-red-400'}`}>
                    {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount, state.settings.currency)}
                  </p>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  <button onClick={() => setEditing(t)} className="w-8 h-8 rounded-lg bg-[#1E1E1E] hover:bg-[#2A2A2A] flex items-center justify-center text-gray-400 hover:text-white transition-colors">
                    <Pencil size={13} />
                  </button>
                  <button onClick={() => setToDelete(t.id)} className="w-8 h-8 rounded-lg bg-[#1E1E1E] hover:bg-red-500/20 flex items-center justify-center text-gray-400 hover:text-red-400 transition-colors">
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
        <p className="text-gray-400 text-sm mb-5">Are you sure you want to delete this transaction? This action cannot be undone.</p>
        <div className="flex gap-3">
          <button onClick={() => setToDelete(null)} className="neon-outline-btn flex-1 justify-center">Cancel</button>
          <button onClick={() => handleDelete(toDelete)} className="flex-1 py-2.5 px-5 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30 font-semibold hover:bg-red-500/30 transition-colors">Delete</button>
        </div>
      </Modal>
    </div>
  )
}
