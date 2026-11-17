import { useState } from 'react'
import { Info, ChevronDown, ChevronUp } from 'lucide-react'

export const CHIP_SELECTED = {
  background: 'var(--color-primary)',
  color: '#ffffff',
  borderColor: 'var(--color-primary)',
}

export const CHIP_UNSELECTED = {
  background: 'rgba(255,255,255,0.65)',
  backdropFilter: 'blur(12px)',
  color: '#4b5563',
  borderColor: '#e5e7eb',
}

export function Tooltip({ text }: { text: string }) {
  const [show, setShow] = useState(false)
  return (
    <span className="relative inline-block ml-1">
      <Info
        size={14}
        className="text-gray-400 cursor-help inline"
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
      />
      {show && (
        <span className="absolute left-6 top-0 z-50 w-64 bg-gray-900 text-white text-xs rounded-lg px-3 py-2 shadow-xl leading-relaxed">
          {text}
        </span>
      )}
    </span>
  )
}

export function Section({
  title,
  icon: Icon,
  children,
  defaultOpen = true,
}: {
  title: string
  icon: React.ElementType
  children: React.ReactNode
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="glass-card mb-6 overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-4 bg-white/40 text-left hover:bg-white/60 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary/10 text-primary rounded-lg flex items-center justify-center">
            <Icon size={18} />
          </div>
          <h3 className="font-bold text-gray-900">{title}</h3>
        </div>
        {open ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
      </button>
      {open && <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">{children}</div>}
    </div>
  )
}
