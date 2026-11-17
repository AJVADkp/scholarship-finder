'use client'

import { getDaysUntilDeadline, getDeadlineStatus } from '@/lib/utils'
import { Clock } from 'lucide-react'

interface DeadlineBadgeProps {
  deadline: string | null
  className?: string
}

export function DeadlineBadge({ deadline, className = '' }: DeadlineBadgeProps) {
  const days = getDaysUntilDeadline(deadline)
  const status = getDeadlineStatus(days)

  const statusClasses = {
    urgent: 'deadline-urgent',
    soon: 'deadline-soon',
    ok: 'deadline-ok',
    expired: 'bg-gray-100 text-gray-400 border border-gray-200',
  }

  const label = () => {
    if (days === null) return 'No deadline'
    if (days < 0) return 'Expired'
    if (days === 0) return 'Today!'
    if (days === 1) return '1 day left'
    return `${days} days left`
  }

  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full ${statusClasses[status]} ${className}`}
    >
      <Clock size={11} />
      {label()}
    </span>
  )
}
