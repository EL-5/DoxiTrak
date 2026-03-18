import { createContext, useContext, useReducer, useEffect, useCallback } from 'react'

const SEED_TRANSACTIONS = [
  { id: '1', amount: 4500, type: 'income',  category: 'Salary',    date: '2026-03-01', note: 'Monthly salary' },
  { id: '2', amount: 320,  type: 'expense', category: 'Food',      date: '2026-03-02', note: 'Grocery shopping' },
  { id: '3', amount: 80,   type: 'expense', category: 'Transport', date: '2026-03-03', note: 'Uber rides' },
  { id: '4', amount: 200,  type: 'expense', category: 'Bills',     date: '2026-03-05', note: 'Electricity bill' },
  { id: '5', amount: 450,  type: 'expense', category: 'Shopping',  date: '2026-03-08', note: 'New clothes' },
  { id: '6', amount: 500,  type: 'income',  category: 'Freelance', date: '2026-03-10', note: 'Web project' },
  { id: '7', amount: 150,  type: 'expense', category: 'Food',      date: '2026-03-12', note: 'Restaurants' },
  { id: '8', amount: 60,   type: 'expense', category: 'Entertainment', date: '2026-03-14', note: 'Netflix & Spotify' },
  { id: '9', amount: 180,  type: 'expense', category: 'Health',    date: '2026-03-15', note: 'Gym membership' },
  { id: '10', amount: 300, type: 'expense', category: 'Shopping',  date: '2026-03-17', note: 'Electronics' },
  // Previous month
  { id: '11', amount: 4500, type: 'income',  category: 'Salary',    date: '2026-02-01', note: 'Monthly salary' },
  { id: '12', amount: 280,  type: 'expense', category: 'Food',      date: '2026-02-03', note: 'Groceries' },
  { id: '13', amount: 100,  type: 'expense', category: 'Transport', date: '2026-02-05', note: 'Metro pass' },
  { id: '14', amount: 200,  type: 'expense', category: 'Bills',     date: '2026-02-08', note: 'Internet bill' },
  { id: '15', amount: 350,  type: 'expense', category: 'Shopping',  date: '2026-02-12', note: 'Amazon' },
  { id: '16', amount: 200,  type: 'income',  category: 'Freelance', date: '2026-02-15', note: 'Design work' },
  { id: '17', amount: 90,   type: 'expense', category: 'Entertainment', date: '2026-02-18', note: 'Games' },
  { id: '18', amount: 160,  type: 'expense', category: 'Health',    date: '2026-02-20', note: 'Doctor visit' },
]

const SEED_BUDGETS = [
  { id: 'b1', category: 'Food',        limit: 500,  period: 'monthly' },
  { id: 'b2', category: 'Transport',   limit: 150,  period: 'monthly' },
  { id: 'b3', category: 'Shopping',    limit: 400,  period: 'monthly' },
  { id: 'b4', category: 'Bills',       limit: 300,  period: 'monthly' },
  { id: 'b5', category: 'Entertainment', limit: 100, period: 'monthly' },
  { id: 'b6', category: 'Health',      limit: 200,  period: 'monthly' },
]

const SEED_GOALS = [
  { id: 'g1', name: 'Emergency Fund', target: 10000, saved: 3200, icon: '🛡️', color: '#00FF9F', deadline: '2026-12-31' },
  { id: 'g2', name: 'New Laptop',     target: 1800,  saved: 900,  icon: '💻', color: '#818cf8', deadline: '2026-06-30' },
  { id: 'g3', name: 'Vacation Fund',  target: 3000,  saved: 650,  icon: '✈️', color: '#f59e0b', deadline: '2026-09-01' },
]

function loadState() {
  try {
    const raw = localStorage.getItem('doxitrak_state')
    if (raw) return JSON.parse(raw)
  } catch {}
  return null
}

function getInitialState() {
  const saved = loadState()
  if (saved) return saved
  return {
    transactions: SEED_TRANSACTIONS,
    budgets: SEED_BUDGETS,
    goals: SEED_GOALS,
    settings: {
      currency: 'USD',
      theme: 'dark',
      monthlyBudget: 3000,
      name: 'Alex Johnson',
    },
  }
}

function reducer(state, action) {
  switch (action.type) {
    case 'ADD_TRANSACTION':
      return { ...state, transactions: [action.payload, ...state.transactions] }
    case 'UPDATE_TRANSACTION':
      return { ...state, transactions: state.transactions.map(t => t.id === action.payload.id ? action.payload : t) }
    case 'DELETE_TRANSACTION':
      return { ...state, transactions: state.transactions.filter(t => t.id !== action.payload) }

    case 'ADD_BUDGET':
      return { ...state, budgets: [...state.budgets, action.payload] }
    case 'UPDATE_BUDGET':
      return { ...state, budgets: state.budgets.map(b => b.id === action.payload.id ? action.payload : b) }
    case 'DELETE_BUDGET':
      return { ...state, budgets: state.budgets.filter(b => b.id !== action.payload) }

    case 'ADD_GOAL':
      return { ...state, goals: [...state.goals, action.payload] }
    case 'UPDATE_GOAL':
      return { ...state, goals: state.goals.map(g => g.id === action.payload.id ? action.payload : g) }
    case 'DELETE_GOAL':
      return { ...state, goals: state.goals.filter(g => g.id !== action.payload) }

    case 'UPDATE_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.payload } }

    default:
      return state
  }
}

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, null, getInitialState)

  useEffect(() => {
    localStorage.setItem('doxitrak_state', JSON.stringify(state))
  }, [state])

  const addTransaction    = useCallback(t => dispatch({ type: 'ADD_TRANSACTION', payload: { ...t, id: Date.now().toString() } }), [])
  const updateTransaction = useCallback(t => dispatch({ type: 'UPDATE_TRANSACTION', payload: t }), [])
  const deleteTransaction = useCallback(id => dispatch({ type: 'DELETE_TRANSACTION', payload: id }), [])

  const addBudget    = useCallback(b => dispatch({ type: 'ADD_BUDGET', payload: { ...b, id: Date.now().toString() } }), [])
  const updateBudget = useCallback(b => dispatch({ type: 'UPDATE_BUDGET', payload: b }), [])
  const deleteBudget = useCallback(id => dispatch({ type: 'DELETE_BUDGET', payload: id }), [])

  const addGoal    = useCallback(g => dispatch({ type: 'ADD_GOAL', payload: { ...g, id: Date.now().toString() } }), [])
  const updateGoal = useCallback(g => dispatch({ type: 'UPDATE_GOAL', payload: g }), [])
  const deleteGoal = useCallback(id => dispatch({ type: 'DELETE_GOAL', payload: id }), [])

  const updateSettings = useCallback(s => dispatch({ type: 'UPDATE_SETTINGS', payload: s }), [])

  return (
    <AppContext.Provider value={{ state, addTransaction, updateTransaction, deleteTransaction, addBudget, updateBudget, deleteBudget, addGoal, updateGoal, deleteGoal, updateSettings }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
