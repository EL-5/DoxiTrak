export const CATEGORIES = ['Food', 'Transport', 'Bills', 'Shopping', 'Salary', 'Freelance', 'Entertainment', 'Health', 'Education', 'Other']
export const INCOME_CATS = ['Salary', 'Freelance', 'Investment', 'Other']
export const EXPENSE_CATS = ['Food', 'Transport', 'Bills', 'Shopping', 'Entertainment', 'Health', 'Education', 'Other']

export const CATEGORY_COLORS = {
  Food:          '#00FF9F',
  Transport:     '#818cf8',
  Bills:         '#f59e0b',
  Shopping:      '#f87171',
  Salary:        '#34d399',
  Freelance:     '#60a5fa',
  Entertainment: '#e879f9',
  Health:        '#fb923c',
  Education:     '#38bdf8',
  Other:         '#94a3b8',
}

export const CATEGORY_ICONS = {
  Food:          '🍔',
  Transport:     '🚗',
  Bills:         '⚡',
  Shopping:      '🛍️',
  Salary:        '💼',
  Freelance:     '💻',
  Entertainment: '🎮',
  Health:        '❤️',
  Education:     '📚',
  Other:         '📦',
}

// Symbol overrides for currencies not well-supported by Intl
const CURRENCY_SYMBOLS = {
  GHS: '₵',
  NGN: '₦',
}

export function getCurrencySymbol(currency = 'USD') {
  if (CURRENCY_SYMBOLS[currency]) return CURRENCY_SYMBOLS[currency]
  try {
    return (0).toLocaleString('en-US', { style: 'currency', currency, minimumFractionDigits: 0, maximumFractionDigits: 0 }).replace(/\d/g, '').trim()
  } catch {
    return currency
  }
}

export function formatCurrency(amount, currency = 'USD') {
  if (CURRENCY_SYMBOLS[currency]) {
    const abs = Math.abs(amount)
    const sign = amount < 0 ? '-' : ''
    return `${sign}${CURRENCY_SYMBOLS[currency]}${abs.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }
  return new Intl.NumberFormat('en-US', { style: 'currency', currency, minimumFractionDigits: 2 }).format(amount)
}

export function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function formatShortDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function getCurrentMonth() {
  const now = new Date()
  return { year: now.getFullYear(), month: now.getMonth() }
}

export function isSameMonth(dateStr, year, month) {
  const d = new Date(dateStr)
  return d.getFullYear() === year && d.getMonth() === month
}

export function getMonthlyTotals(transactions, year, month) {
  const monthly = transactions.filter(t => isSameMonth(t.date, year, month))
  const income  = monthly.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const expense = monthly.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
  return { income, expense, savings: income - expense, transactions: monthly }
}

export function getLast6MonthsData(transactions) {
  const result = []
  const now = new Date()
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const year = d.getFullYear()
    const month = d.getMonth()
    const { income, expense } = getMonthlyTotals(transactions, year, month)
    result.push({
      name: d.toLocaleDateString('en-US', { month: 'short' }),
      income,
      expense,
      savings: income - expense,
    })
  }
  return result
}

export function getSpendingByCategory(transactions, year, month) {
  const monthly = transactions.filter(t => t.type === 'expense' && isSameMonth(t.date, year, month))
  const map = {}
  monthly.forEach(t => { map[t.category] = (map[t.category] || 0) + t.amount })
  return Object.entries(map).map(([name, value]) => ({
    name,
    value,
    color: CATEGORY_COLORS[name] || '#94a3b8',
  })).sort((a, b) => b.value - a.value)
}

export function generateInsights(transactions, budgets, settings) {
  const insights = []
  const now = new Date()
  const cy = now.getFullYear(), cm = now.getMonth()
  const { income, expense, savings } = getMonthlyTotals(transactions, cy, cm)
  const { income: pi, expense: pe } = getMonthlyTotals(transactions, cy, cm - 1)
  const sym = getCurrencySymbol(settings.currency)

  if (pe > 0 && expense > pe) {
    const pct = Math.round(((expense - pe) / pe) * 100)
    insights.push({ type: 'warning', icon: '📈', text: `Your expenses increased by ${pct}% compared to last month.` })
  }
  if (pe > 0 && expense < pe) {
    const pct = Math.round(((pe - expense) / pe) * 100)
    insights.push({ type: 'success', icon: '🎉', text: `Great job! You spent ${pct}% less than last month.` })
  }

  const mb = settings.monthlyBudget
  if (mb && expense > mb * 0.85) {
    insights.push({ type: 'danger', icon: '⚠️', text: `You've used ${Math.round((expense / mb) * 100)}% of your monthly budget.` })
  }

  budgets.forEach(b => {
    const spent = transactions
      .filter(t => t.type === 'expense' && t.category === b.category && isSameMonth(t.date, cy, cm))
      .reduce((s, t) => s + t.amount, 0)
    if (spent > b.limit * 0.9) {
      insights.push({ type: 'warning', icon: '🔴', text: `You're close to your ${b.category} budget limit (${sym}${spent.toFixed(0)} of ${sym}${b.limit}).` })
    }
  })

  if (savings > 0) {
    insights.push({ type: 'info', icon: '💰', text: `You've saved ${sym}${savings.toFixed(0)} this month. Keep it up!` })
  }

  // Food comparison
  const curFood = transactions.filter(t => t.type === 'expense' && t.category === 'Food' && isSameMonth(t.date, cy, cm)).reduce((s,t)=>s+t.amount,0)
  const prevFood = transactions.filter(t => t.type === 'expense' && t.category === 'Food' && isSameMonth(t.date, cy, cm-1)).reduce((s,t)=>s+t.amount,0)
  if (prevFood > 0 && curFood > prevFood * 1.1) {
    insights.push({ type: 'warning', icon: '🍔', text: `You spent more on food this month compared to last month (${sym}${curFood.toFixed(0)} vs ${sym}${prevFood.toFixed(0)}).` })
  }

  if (insights.length === 0) {
    insights.push({ type: 'info', icon: '✨', text: 'Your finances look healthy this month. Keep tracking!' })
  }

  return insights.slice(0, 4)
}

export function exportToCSV(transactions) {
  const headers = ['Date', 'Type', 'Category', 'Amount', 'Note']
  const rows = transactions.map(t => [t.date, t.type, t.category, t.amount, t.note || ''])
  const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `doxitrak-transactions-${new Date().toISOString().slice(0,10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}
