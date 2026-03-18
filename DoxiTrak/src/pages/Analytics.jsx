import { useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, Tooltip, XAxis, YAxis,
  CartesianGrid, ResponsiveContainer
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
  const sym = getCurrencySymbol(state.settings.currency)

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-xl font-semibold" style={{ color: 'var(--text)' }}>Analytics</h1>
        <p className="text-xs mt-0.5" style={{ color: 'var(--text-sub)' }}>Financial insights and trends</p>
      </motion.div>

      {/* KPI row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Income',       value: formatCurrency(income,   state.settings?.currency), color: 'text-green-600' },
          { label: 'Expenses',     value: formatCurrency(expense,  state.settings?.currency), color: 'text-red-500'   },
          { label: 'Net Savings',  value: formatCurrency(savings,  state.settings?.currency), color: savings >= 0 ? 'text-green-600' : 'text-red-500' },
          { label: 'Savings Rate', value: `${savingsRate}%`,                                   color: ''               },
        ].map((kpi, i) => (
          <motion.div key={i}
            initial={{ opacity: 0, y: 12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: i * 0.07, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ y: -2, transition: { duration: 0.15 } }}
            className="glass-card p-4">
            <p className="text-xs mb-1.5 font-medium" style={{ color: 'var(--text-sub)' }}>{kpi.label}</p>
            <p className={`text-xl font-bold font-mono num-glow ${kpi.color}`} style={!kpi.color ? { color: 'var(--text)' } : {}}>{kpi.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Bar + Pie */}
      <div className="grid xl:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass-card p-5">
          <h2 className="font-semibold mb-1 text-sm" style={{ color: 'var(--text)' }}>Income vs Expenses</h2>
          <p className="text-xs mb-4" style={{ color: 'var(--text-sub)' }}>Monthly comparison over 6 months</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `${sym}${(v/1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip currency={state.settings.currency} />} />
              <Bar dataKey="income"  name="Income"   fill="#22c55e" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expense" name="Expenses" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-5">
          <h2 className="font-semibold mb-0.5 text-sm" style={{ color: 'var(--text)' }}>Spending by Category</h2>
          <p className="text-[11px] mb-4" style={{ color: 'var(--text-sub)' }}>Current month</p>
          {pieData.length === 0 ? (
            <div className="flex items-center justify-center h-[220px] text-sm" style={{ color: 'var(--text-muted)' }}>No expenses this month</div>
          ) : (
            <div className="flex flex-col md:flex-row items-center gap-4">
              <div className="w-full md:w-1/2">
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} dataKey="value" labelLine={false} label={renderCustomLabel}>
                      {pieData.map((entry, index) => <Cell key={index} fill={entry.color} stroke="transparent" />)}
                    </Pie>
                    <Tooltip
                      formatter={(v) => formatCurrency(v, state.settings.currency)}
                      contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, color: 'var(--text)', fontSize: 12 }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="w-full md:flex-1 space-y-2 min-w-0">
                {pieData.slice(0, 6).map((d, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ background: d.color }} />
                    <span className="truncate flex-1" style={{ color: 'var(--text-sub)' }}>{d.name}</span>
                    <span className="font-mono font-medium" style={{ color: 'var(--text)' }}>{formatCurrency(d.value, state.settings.currency)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Line chart */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="glass-card p-5">
        <h2 className="font-semibold mb-0.5 text-sm" style={{ color: 'var(--text)' }}>Savings Trend</h2>
        <p className="text-[11px] mb-4" style={{ color: 'var(--text-sub)' }}>Net savings · last 6 months</p>
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `${sym}${v}`} />
            <Tooltip content={<CustomTooltip currency={state.settings.currency} />} />
            <Line type="monotone" dataKey="savings" stroke="var(--text)" strokeWidth={2} dot={{ fill: 'var(--text)', r: 3 }} activeDot={{ r: 5 }} name="Savings" />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Category table */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card p-5">
        <h2 className="font-semibold mb-4" style={{ color: 'var(--text)' }}>Category Breakdown</h2>
        <div className="space-y-3">
          {pieData.map((d, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="w-2 h-2 rounded-full shrink-0" style={{ background: d.color }} />
              <span className="text-sm w-28 shrink-0" style={{ color: 'var(--text-sub)' }}>{d.name}</span>
              <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-hover)' }}>
                <div className="h-full rounded-full transition-all duration-700" style={{ width: `${(d.value / pieData[0].value) * 100}%`, background: d.color }} />
              </div>
              <span className="text-sm font-mono font-medium w-20 text-right" style={{ color: 'var(--text)' }}>{formatCurrency(d.value, state.settings.currency)}</span>
            </div>
          ))}
          {pieData.length === 0 && <p className="text-center py-6" style={{ color: 'var(--text-muted)' }}>No data available for this month</p>}
        </div>
      </motion.div>
    </div>
  )
}
