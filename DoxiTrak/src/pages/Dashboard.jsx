import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Wallet, TrendingUp, TrendingDown, PiggyBank, Plus, Zap, Bell, Terminal } from 'lucide-react'
import { useApp } from '../store/AppContext'
import {
  getMonthlyTotals, getLast6MonthsData, formatCurrency, formatShortDate,
  getCurrentMonth, generateInsights, CATEGORY_ICONS, getCurrencySymbol
} from '../utils/finance'
import StatCard from '../components/StatCard'
import CustomTooltip from '../components/CustomTooltip'
import Modal from '../components/Modal'
import TransactionForm from '../components/TransactionForm'
import TechTicker from '../components/TechTicker'

const INSIGHT_STYLES = {
  success: { bg: 'bg-green-500/8',  border: 'border-green-500/15', dot: 'bg-green-500' },
  warning: { bg: 'bg-amber-500/8',  border: 'border-amber-500/15', dot: 'bg-amber-500' },
  danger:  { bg: 'bg-red-500/8',    border: 'border-red-500/15',   dot: 'bg-red-500'   },
  info:    { bg: '',                 border: '',                     dot: ''              },
}

export default function Dashboard() {
  const { state, addTransaction } = useApp()
  const [showAdd, setShowAdd] = useState(false)
  const { year, month } = getCurrentMonth()
  const { income, expense, savings } = useMemo(() => getMonthlyTotals(state.transactions, year, month), [state.transactions, year, month])
  const prevTotals = useMemo(() => getMonthlyTotals(state.transactions, year, month - 1), [state.transactions, year, month])
  const chartData = useMemo(() => getLast6MonthsData(state.transactions), [state.transactions])
  const insights = useMemo(() => generateInsights(state.transactions, state.budgets, state.settings), [state.transactions, state.budgets, state.settings])
  const recent = useMemo(() => [...state.transactions].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 8), [state.transactions])

  const balance = useMemo(() => state.transactions.reduce((s, t) => t.type === 'income' ? s + t.amount : s - t.amount, 0), [state.transactions])

  const incomeTrend  = prevTotals.income  > 0 ? Math.round(((income  - prevTotals.income)  / prevTotals.income)  * 100) : 0
  const expenseTrend = prevTotals.expense > 0 ? Math.round(((expense - prevTotals.expense) / prevTotals.expense) * 100) : 0

  const handleAdd = (t) => { addTransaction(t); setShowAdd(false) }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <p className="text-xs mb-0.5" style={{ color: 'var(--text-sub)' }}>Welcome back,</p>
          <h1 className="text-xl font-semibold" style={{ color: 'var(--text)' }}>{state.settings.name}</h1>
          <TechTicker />
        </div>
        <button onClick={() => setShowAdd(true)} className="neon-btn w-full sm:w-auto justify-center">
          <Plus size={14} /> Add Transaction
        </button>
      </motion.div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="total_balance"    value={balance}  icon={Wallet}      delay={0}    currency={state.settings.currency} />
        <StatCard label="monthly_income"   value={income}   icon={TrendingUp}   trend={incomeTrend}  trendLabel="vs last month" delay={0.05} currency={state.settings.currency} />
        <StatCard label="monthly_expenses" value={expense}  icon={TrendingDown} trend={-expenseTrend} trendLabel="vs last month" delay={0.1} currency={state.settings.currency} />
        <StatCard label="net_savings"      value={savings}  icon={PiggyBank}    delay={0.15} currency={state.settings.currency} />
      </div>

      <div className="grid xl:grid-cols-3 gap-6">
        {/* Chart */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-5 xl:col-span-2">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
            <div>
              <h2 className="font-semibold text-sm" style={{ color: 'var(--text)' }}>Spending Trends</h2>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-sub)' }}>Last 6 months</p>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs sm:justify-end" style={{ color: 'var(--text-sub)' }}>
              <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />Income</span>
              <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-red-400 inline-block" />Expenses</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `${getCurrencySymbol(state.settings.currency)}${(v/1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip currency={state.settings.currency} />} />
              <Line type="monotone" dataKey="income"  stroke="#4ade80" strokeWidth={2.5} dot={{ fill: '#4ade80', r: 3 }} activeDot={{ r: 5 }} name="Income" />
              <Line type="monotone" dataKey="expense" stroke="#f87171" strokeWidth={2.5} dot={{ fill: '#f87171', r: 3 }} activeDot={{ r: 5 }} name="Expenses" />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* AI Insights */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="glass-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: 'var(--bg-hover)', border: '1px solid var(--border)' }}>
              <Zap size={12} style={{ color: 'var(--text-sub)' }} />
            </div>
            <h2 className="font-semibold text-sm" style={{ color: 'var(--text)' }}>Smart Insights</h2>
          </div>
          <div className="space-y-2.5">
            {insights.map((ins, i) => {
              const s = INSIGHT_STYLES[ins.type] || INSIGHT_STYLES.warning
              return (
                <motion.div key={i} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.06 }}
                  className={`rounded-xl p-3 ${s.bg} ${s.border ? `border ${s.border}` : ''}`}
                  style={!s.bg ? { background: 'var(--bg-hover)', border: '1px solid var(--border)' } : {}}>
                  <div className="flex gap-2.5">
                    <div className={`w-1.5 h-1.5 rounded-full shrink-0 mt-1.5 ${s.dot}`}
                      style={!s.dot ? { background: 'var(--text-muted)' } : {}} />
                    <p className="text-xs leading-relaxed" style={{ color: 'var(--text-sub)' }}>{ins.text}</p>
                  </div>
                </motion.div>
              )
            })}
          </div>

          {/* Budget meter */}
          {state.settings.monthlyBudget > 0 && (
            <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
              <div className="flex justify-between text-xs mb-2">
                <span style={{ color: 'var(--text-sub)' }}>Monthly budget</span>
                <span style={{ color: 'var(--text-sub)' }}>{formatCurrency(expense, state.settings.currency)} / {formatCurrency(state.settings.monthlyBudget, state.settings.currency)}</span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-hover)' }}>
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${Math.min((expense / state.settings.monthlyBudget) * 100, 100)}%`,
                    background: expense > state.settings.monthlyBudget * 0.85 ? '#ef4444' : 'var(--text)',
                  }}
                />
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Recent Transactions */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="glass-card p-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-4">
          <h2 className="font-semibold text-sm" style={{ color: 'var(--text)' }}>Recent Transactions</h2>
          <a href="/transactions" className="text-xs hover:underline" style={{ color: 'var(--text-sub)' }}>View all →</a>
        </div>
        {recent.length === 0 ? (
          <div className="text-center py-10" style={{ color: 'var(--text-muted)' }}>
            <Bell size={32} className="mx-auto mb-2 opacity-30" />
            <p>No transactions yet. Add your first one!</p>
          </div>
        ) : (
          <div className="space-y-0.5">
            {recent.map((t, i) => (
              <motion.div key={t.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.04, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ x: 2, transition: { duration: 0.15 } }}
                className="flex items-center gap-3.5 p-3 rounded-xl transition-colors group"
                style={{ ':hover': { background: 'var(--bg-hover)' } }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                onMouseLeave={e => e.currentTarget.style.background = ''}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm shrink-0" style={{ background: 'var(--bg-hover)', border: '1px solid var(--border)' }}>
                  {CATEGORY_ICONS[t.category] || '📦'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: 'var(--text)' }}>{t.category}</p>
                  <p className="text-xs truncate" style={{ color: 'var(--text-sub)' }}>{t.note || formatShortDate(t.date)}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className={`text-sm font-semibold font-mono ${t.type === 'income' ? 'text-green-600' : 'text-red-500'}`}>
                    {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount, state.settings.currency)}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--text-sub)' }}>{formatShortDate(t.date)}</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add Transaction">
        <TransactionForm onSubmit={handleAdd} onCancel={() => setShowAdd(false)} />
      </Modal>
    </div>
  )
}
