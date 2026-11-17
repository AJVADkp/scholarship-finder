'use client'

import Link from 'next/link'
import { formatAmount, formatDeadline } from '@/lib/utils'
import { type Scholarship, CATEGORY_CONFIG } from '@/lib/types'
import { DeadlineBadge } from '@/components/ui/DeadlineBadge'
import { CategoryBadge } from '@/components/ui/CategoryBadge'
import { Heart, MapPin, ExternalLink, GraduationCap } from 'lucide-react'
import { useState } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { createClient } from '@/lib/supabase/client'

interface ScholarshipCardProps {
  scholarship: Scholarship
  isSaved?: boolean
  showSaveButton?: boolean
  userId?: string | null
  onSaveToggle?: (id: string, saved: boolean) => void
  qualifyBadge?: boolean
}

export function ScholarshipCard({
  scholarship,
  isSaved = false,
  showSaveButton = false,
  userId,
  onSaveToggle,
  qualifyBadge = false,
}: ScholarshipCardProps) {
  const [saved, setSaved] = useState(isSaved)
  const [savingLoading, setSavingLoading] = useState(false)

  const categoryConfig = scholarship.category
    ? CATEGORY_CONFIG[scholarship.category as keyof typeof CATEGORY_CONFIG]
    : null

  const borderColor = categoryConfig?.color || '#4F8EF7'

  const handleSaveToggle = async (e: React.MouseEvent) => {
    e.preventDefault()
    if (!userId) {
      toast.error('Please sign in to save scholarships')
      return
    }
    setSavingLoading(true)
    const supabase = createClient()

    try {
      if (saved) {
        await supabase
          .from('saved_scholarships')
          .delete()
          .eq('user_id', userId)
          .eq('scholarship_id', scholarship.id)
        setSaved(false)
        toast.success('Removed from saved')
        onSaveToggle?.(scholarship.id, false)
      } else {
        await supabase
          .from('saved_scholarships')
          .insert({ user_id: userId, scholarship_id: scholarship.id })
        setSaved(true)
        toast.success('Scholarship saved!')
        onSaveToggle?.(scholarship.id, true)
      }
    } catch {
      toast.error('Something went wrong')
    } finally {
      setSavingLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="scholarship-card"
      style={{ borderLeft: `4px solid ${borderColor}` }}
    >
      {/* Header */}
      <div className="p-5 pb-3">
        <div className="flex justify-between items-start gap-2 mb-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            <CategoryBadge category={scholarship.category} />
            {scholarship.is_sample && (
              <span className="inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                Sample
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {qualifyBadge && (
              <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">
                ✓ You qualify
              </span>
            )}
            <DeadlineBadge deadline={scholarship.deadline} />
          </div>
        </div>

        <h3 className="font-bold text-gray-900 text-base leading-snug mb-1 line-clamp-2">
          {scholarship.title}
        </h3>

        <p className="text-sm text-gray-500 font-medium mb-3">
          {scholarship.provider || 'Unknown provider'}
        </p>

        {/* Amount */}
        <div className="text-2xl font-extrabold mb-1 flex items-baseline gap-1.5" style={{ color: borderColor }}>
          <span>{formatAmount(scholarship.amount, scholarship.currency)}</span>
          {scholarship.amount !== null && (
            <span className="text-sm font-medium text-gray-500">
              {(() => {
                const t = (scholarship.title || '').toLowerCase()
                const r = (scholarship.award_amount_range || '').toLowerCase()
                if (r.includes('month') || t.includes('month')) return '/ month'
                if (r.includes('year') || r.includes('annual') || t.includes('year')) return '/ year'
                if (t.includes('jrf') || t.includes('fellowship') || t.includes('phd')) {
                  if (scholarship.amount >= 10000 && scholarship.amount <= 80000) return '/ month'
                }
                if (scholarship.amount > 200000) return ' (Total)'
                return '/ year'
              })()}
            </span>
          )}
        </div>

        {/* Location */}
        {scholarship.country && (
          <div className="flex items-center gap-1 text-xs text-gray-400 mb-3">
            <MapPin size={11} />
            {scholarship.state ? `${scholarship.state}, ` : ''}{scholarship.country}
          </div>
        )}

        {/* Description */}
        <p className="text-sm text-gray-500 line-clamp-2 mb-4">
          {scholarship.description}
        </p>

        {/* Marks required */}
        {scholarship.min_marks_percentage !== null && (
          <div className="flex items-center gap-1.5 mb-3">
            <GraduationCap size={14} className="text-gray-400" />
            <span className="text-xs text-gray-500">
              Min. <strong className="text-gray-700">{scholarship.min_marks_percentage}%</strong> marks required
            </span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-5 pb-5 flex items-center justify-between gap-3">
        <div className="text-xs text-gray-400">
          Deadline: <span className="text-gray-600 font-medium">{formatDeadline(scholarship.deadline)}</span>
        </div>

        <div className="flex items-center gap-2">
          {showSaveButton && (
            <button
              onClick={handleSaveToggle}
              disabled={savingLoading}
              className={`p-2 rounded-full transition-all duration-200 ${
                saved
                  ? 'bg-red-50 text-red-500 hover:bg-red-100'
                  : 'bg-gray-50 text-gray-300 hover:bg-red-50 hover:text-red-400'
              }`}
              aria-label={saved ? 'Unsave scholarship' : 'Save scholarship'}
            >
              <Heart size={16} fill={saved ? 'currentColor' : 'none'} />
            </button>
          )}

          <Link
            href={`/scholarships/${scholarship.id}`}
            className="btn-primary text-sm px-4 py-2 gap-1.5"
          >
            View Details <ExternalLink size={13} />
          </Link>
        </div>
      </div>
    </motion.div>
  )
}
