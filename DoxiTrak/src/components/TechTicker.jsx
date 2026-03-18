import { useEffect, useRef, useState } from 'react'

const MESSAGES = [
  'system.status: ONLINE',
  'data.source: localStorage',
  'encryption: AES-256',
  'sync.mode: real-time',
  'api.version: v1.0.0',
  'uptime: 100%',
  'cache.status: ACTIVE',
]

export default function TechTicker() {
  const [idx, setIdx] = useState(0)
  const [text, setText] = useState('')
  const [typing, setTyping] = useState(true)
  const timeoutRef = useRef(null)

  useEffect(() => {
    const msg = MESSAGES[idx]
    if (typing) {
      if (text.length < msg.length) {
        timeoutRef.current = setTimeout(() => setText(msg.slice(0, text.length + 1)), 55)
      } else {
        timeoutRef.current = setTimeout(() => setTyping(false), 1800)
      }
    } else {
      if (text.length > 0) {
        timeoutRef.current = setTimeout(() => setText(text.slice(0, -1)), 28)
      } else {
        setIdx((i) => (i + 1) % MESSAGES.length)
        setTyping(true)
      }
    }
    return () => clearTimeout(timeoutRef.current)
  }, [text, typing, idx])

  return (
    <div className="flex items-center gap-2 text-[11px] font-mono text-gray-600">
      <span className="text-[#00FF9F]/40 shrink-0">&gt;_</span>
      <span className="text-[#00FF9F]/70">{text}</span>
      <span className="cursor-blink" />
    </div>
  )
}
