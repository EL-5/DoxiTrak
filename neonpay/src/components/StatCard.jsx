import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { formatCurrency } from '../utils/finance'

function AnimatedValue({ value, currency, duration = 800 }) {
  const [display, setDisplay] = useState(0)
  const rafRef = useRef(null)
  const startValRef = useRef(0)

  useEffect(() => {
    const from = startValRef.current
    const to = value
    const start = performance.now()
    startValRef.current = to
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    const animate = (now) => {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(from + (to - from) * eased)
      if (progress < 1) rafRef.current = requestAnimationFrame(animate)
    }
    rafRef.current = requestAnimationFrame(animate)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [value, duration])

  return <>{formatCurrency(display, currency)}</>
}

export default function StatCard({ label, value, icon: Icon, color = '#00FF9F', trend, trendLabel, currency = 'USD', delay = 0 }) {
  const isUp = trend > 0
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -2, transition: { duration: 0.18 } }}
      className="glass-card p-5 relative overflow-hidden"
      style={{ borderColor: `${color}18` }}
    >
      {/* Very subtle ambient glow — top-right corner only */}
      <div
        className="absolute -top-10 -right-10 w-24 h-24 rounded-full pointer-events-none opacity-[0.04]"
        style={{ background: color, filter: 'blur(24px)' }}
      />

      <div className="flex items-start justify-between mb-4 relative z-10">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: `${color}10`, border: `1px solid ${color}20` }}
        >
          <Icon size={16} style={{ color, opacity: 0.9 }} />
        </div>
        {trend !== undefined && (
          <div className={`flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full ${isUp ? 'text-green-400 bg-green-500/8' : 'text-red-400 bg-red-500/8'}`}>
            {isUp ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>

      <div className="relative z-10">
        <p className="text-[10px] text-gray-600 mb-1 font-medium uppercase tracking-widest">{label}</p>
        <p className="text-2xl font-semibold text-white font-mono num-glow">
          <AnimatedValue value={value} currency={currency} />
        </p>
        {trendLabel && <p className="text-[11px] text-gray-600 mt-1">{trendLabel}</p>}
      </div>
    </motion.div>
  )
}
