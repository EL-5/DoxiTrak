import { useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, Tooltip, XAxis, YAxis,
  CartesianGrid, ResponsiveContainer, Legend
} from 'recharts'
import { useApp } from '../store/AppContext'
import { getLast6MonthsData, getSpendingByCategory, getCurrentMonth, getMonthlyTotals, formatCurrency, getCurrencySymbol } from '../utils/finance'
import CustomTooltip from '../components/CustomTooltip'

const RADIAN = Math.PI / 180
const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  if (percent < 0.05) return null
  const radius = innerRadius + (outerRadius - innerRadius) * 0.6
  const x = cx + radius * Math.cos(-midAngle * RADIAN)
  const y = cy + radius * Math.sin(-midAngle * RADIAN)
  return <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight="600">{`${(percent*100).toFixed(0)}%`}</text>
}

export default function Analytics() {
  const { state } = useApp()
  const { year, month } = getCurrentMonth()
  const chartData   = useMemo(() => getLast6MonthsData(state.transactions), [state.transactions])
  const pieData     = useMemo(() => getSpendingByCategory(state.transactions, year, month), [state.transactions, year, month])
  const { income, expense, savings } = useMemo(() => getMonthlyTotals(state.transactions, year, month), [state.transactions, year, month])

  const savingsRate = income > 0 ? Math.round((savings / income) * 100) : 0

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-xl font-semibold text-white">Analytics</h1>
        <p className="text-xs text-gray-600 mt-0.5">Financial insights and trends</p>
      </motion.div>

      {/* KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Income',        value: formatCurrency(income, state.settings?.currency),   color: 'text-green-400',  bg: 'border-green-500/15'    },
          { label: 'Expenses',      value: formatCurrency(expense, state.settings?.currency),  color: 'text-red-400',    bg: 'border-red-500/15'      },
          { label: 'Net Savings',   value: formatCurrency(savings, state.settings?.currency),  color: savings >= 0 ? 'text-[#00FF9F]' : 'text-red-400', bg: 'border-[#00FF9F]/15' },
          { label: 'Savings Rate',  value: `${savingsRate}%`,        color: 'text-purple-400', bg: 'border-purple-500/15' },
        ].map((kpi, i) => (
          <motion.div key={i}
            initial={{ opacity: 0, y: 12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: i * 0.07, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ y: -2, transition: { duration: 0.15 } }}
            className={`glass-card p-4 border ${kpi.bg}`}>
            <p className="text-xs text-gray-600 mb-1.5 font-medium">{kpi.label}</p>
            <p className={`text-xl font-bold font-mono num-glow ${kpi.color}`}>{kpi.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Bar + Pie */}
      <div className="grid xl:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass-card p-5">
          <h2 className="font-semibold text-white mb-1 font-mono text-sm">income_vs_expenses.bar()</h2>
          <p className="text-xs text-gray-500 mb-4">Monthly comparison over 6 months</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E1E1E" />
              <XAxis dataKey="name" tick={{ fill: '#555', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#555', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `${getCurrencySymbol(state.settings.currency)}${(v/1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip currency={state.settings.currency} />} />
              <Bar dataKey="income"  name="Income"   fill="#4ade80" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expense" name="Expenses" fill="#f87171" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-5">
          <h2 className="font-semibold text-white mb-0.5 font-mono text-sm">spending.by_category()</h2>
          <p className="text-[11px] text-gray-600 mb-4 font-mono">// current month · donut_chart</p>
          {pieData.length === 0 ? (
            <div className="flex items-center justify-center h-[220px] text-gray-600 text-sm">No expenses this month</div>
          ) : (
            <div className="flex items-center gap-4">
              <ResponsiveContainer width="55%" height={220}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} dataKey="value" labelLine={false} label={renderCustomLabel}>
                    {pieData.map((entry, index) => <Cell key={index} fill={entry.color} stroke="transparent" />)}
                  </Pie>
                  <Tooltip formatter={(v) => formatCurrency(v, state.settings.currency)} contentStyle={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: 10, color: '#fff', fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-2 min-w-0">
                {pieData.slice(0, 6).map((d, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ background: d.color }} />
                    <span className="text-gray-400 truncate flex-1">{d.name}</span>
                    <span className="text-white font-mono font-medium">{formatCurrency(d.value, state.settings.currency)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Line chart - Monthly savings trend */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="glass-card p-5">
        <h2 className="font-semibold text-white mb-0.5 font-mono text-sm">savings_trend.line()</h2>
        <p className="text-[11px] text-gray-600 mb-4 font-mono">// net savings · last 6 months</p>
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1E1E1E" />
            <XAxis dataKey="name" tick={{ fill: '#555', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#555', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `${getCurrencySymbol(state.settings.currency)}${v}`} />
            <Tooltip content={<CustomTooltip currency={state.settings.currency} />} />
            <Line type="monotone" dataKey="savings" stroke="#00FF9F" strokeWidth={2.5} dot={{ fill: '#00FF9F', r: 4 }} activeDot={{ r: 6, stroke: '#00FF9F', strokeWidth: 2, fill: '#0D0D0D' }} name="Savings" />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Category table */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card p-5">
        <h2 className="font-semibold text-white mb-4">Category Breakdown</h2>
        <div className="space-y-3">
          {pieData.map((d, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="w-2 h-2 rounded-full shrink-0" style={{ background: d.color }} />
              <span className="text-sm text-gray-300 w-28 shrink-0">{d.name}</span>
              <div className="flex-1 h-1.5 rounded-full bg-[#1E1E1E] overflow-hidden">
                <div className="h-full rounded-full transition-all duration-700" style={{ width: `${(d.value / pieData[0].value) * 100}%`, background: d.color, boxShadow: `0 0 6px ${d.color}60` }} />
              </div>
              <span className="text-sm font-mono font-medium text-white w-20 text-right">{formatCurrency(d.value, state.settings.currency)}</span>
            </div>
          ))}
          {pieData.length === 0 && <p className="text-center text-gray-600 py-6">No data available for this month</p>}
        </div>
      </motion.div>
    </div>
  )
}
