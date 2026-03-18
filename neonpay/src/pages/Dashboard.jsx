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
  success: { bg: 'bg-green-500/10', border: 'border-green-500/20', dot: 'bg-green-400' },
  warning: { bg: 'bg-amber-500/10', border: 'border-amber-500/20', dot: 'bg-amber-400' },
  danger:  { bg: 'bg-red-500/10',   border: 'border-red-500/20',   dot: 'bg-red-400'   },
  info:    { bg: 'bg-[#00FF9F]/10', border: 'border-[#00FF9F]/20', dot: 'bg-[#00FF9F]' },
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
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-600 mb-0.5">Welcome back,</p>
          <h1 className="text-xl font-semibold text-white">{state.settings.name}</h1>
          <TechTicker />
        </div>
        <button onClick={() => setShowAdd(true)} className="neon-btn">
          <Plus size={14} /> Add Transaction
        </button>
      </motion.div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="total_balance" value={balance} icon={Wallet} color="#00FF9F" delay={0} currency={state.settings.currency} />
        <StatCard label="monthly_income" value={income} icon={TrendingUp} color="#4ade80" trend={incomeTrend} trendLabel="vs last month" delay={0.05} currency={state.settings.currency} />
        <StatCard label="monthly_expenses" value={expense} icon={TrendingDown} color="#f87171" trend={-expenseTrend} trendLabel="vs last month" delay={0.1} currency={state.settings.currency} />
        <StatCard label="net_savings" value={savings} icon={PiggyBank} color="#818cf8" delay={0.15} currency={state.settings.currency} />
      </div>

      <div className="grid xl:grid-cols-3 gap-6">
        {/* Chart */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-5 xl:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-semibold text-white text-sm">Spending Trends</h2>
              <p className="text-xs text-gray-600 mt-0.5">Last 6 months</p>
            </div>
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />Income</span>
              <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-red-400 inline-block" />Expenses</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E1E1E" />
              <XAxis dataKey="name" tick={{ fill: '#555', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#555', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `${getCurrencySymbol(state.settings.currency)}${(v/1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip currency={state.settings.currency} />} />
              <Line type="monotone" dataKey="income"  stroke="#4ade80" strokeWidth={2.5} dot={{ fill: '#4ade80', r: 3 }} activeDot={{ r: 5 }} name="Income" />
              <Line type="monotone" dataKey="expense" stroke="#f87171" strokeWidth={2.5} dot={{ fill: '#f87171', r: 3 }} activeDot={{ r: 5 }} name="Expenses" />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* AI Insights */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="glass-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 rounded-lg bg-[#00FF9F]/08 border border-[#00FF9F]/12 flex items-center justify-center">
              <Zap size={12} className="text-[#00FF9F]" />
            </div>
            <h2 className="font-semibold text-white text-sm">Smart Insights</h2>
          </div>
          <div className="space-y-2.5">
            {insights.map((ins, i) => {
              const s = INSIGHT_STYLES[ins.type] || INSIGHT_STYLES.info
              return (
                <motion.div key={i} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.06 }}
                  className={`${s.bg} border ${s.border} rounded-xl p-3`}>
                  <div className="flex gap-2.5">
                    <div className={`w-1.5 h-1.5 rounded-full shrink-0 mt-1.5 ${s.dot}`} />
                    <p className="text-xs text-gray-400 leading-relaxed">{ins.text}</p>
                  </div>
                </motion.div>
              )
            })}
          </div>

          {/* Budget meter */}
          {state.settings.monthlyBudget > 0 && (
            <div className="mt-4 pt-4 border-t border-[#1E1E1E]">
              <div className="flex justify-between text-xs mb-2">
                <span className="text-gray-500">Monthly budget</span>
                <span className="text-gray-400">{formatCurrency(expense, state.settings.currency)} / {formatCurrency(state.settings.monthlyBudget, state.settings.currency)}</span>
              </div>
              <div className="h-2 rounded-full bg-[#1E1E1E] overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${Math.min((expense / state.settings.monthlyBudget) * 100, 100)}%`,
                    background: expense > state.settings.monthlyBudget * 0.85 ? '#f87171' : '#00FF9F',
                    boxShadow: expense > state.settings.monthlyBudget * 0.85 ? '0 0 6px rgba(248,113,113,0.4)' : '0 0 6px rgba(0,255,159,0.4)',
                  }}
                />
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Recent Transactions */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="glass-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-white text-sm">Recent Transactions</h2>
          <a href="/transactions" className="text-xs text-[#00FF9F] hover:underline">View all →</a>
        </div>
        {recent.length === 0 ? (
          <div className="text-center py-10 text-gray-600">
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
                className="flex items-center gap-3.5 p-3 rounded-xl hover:bg-[#111] transition-colors group border border-transparent hover:border-[#1e1e1e]">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm bg-[#141414] group-hover:bg-[#1a1a1a] transition-colors shrink-0 border border-[#1e1e1e]">
                  {CATEGORY_ICONS[t.category] || '📦'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{t.category}</p>
                  <p className="text-xs text-gray-600 truncate">{t.note || formatShortDate(t.date)}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className={`text-sm font-semibold font-mono ${t.type === 'income' ? 'text-green-400' : 'text-red-400'}`}>
                    {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount, state.settings.currency)}
                  </p>
                  <p className="text-xs text-gray-600">{formatShortDate(t.date)}</p>
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
