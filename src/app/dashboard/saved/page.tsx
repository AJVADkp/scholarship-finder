'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ScholarshipCard } from '@/components/scholarship/ScholarshipCard'
import { SkeletonCard } from '@/components/ui/SkeletonCard'
import { Footer } from '@/components/layout/Footer'
import type { Scholarship } from '@/lib/types'
import { Heart, GraduationCap } from 'lucide-react'
import Link from 'next/link'

export default function SavedScholarshipsPage() {
  const [scholarships, setScholarships] = useState<Scholarship[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)

  const supabase = createClient()

  useEffect(() => {
    load()
  }, [])

  const load = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    setUserId(user.id)

    const { data } = await supabase
      .from('saved_scholarships')
      .select('scholarship_id, scholarships(*)')
      .eq('user_id', user.id)
      .order('saved_at', { ascending: false })

    const savedList = data?.map((d: any) => d.scholarships).filter(Boolean) as Scholarship[]
    setScholarships(savedList || [])
    setLoading(false)
  }

  const handleUnsave = (scholarshipId: string) => {
    setScholarships((prev) => prev.filter((s) => s.id !== scholarshipId))
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-2xl bg-red-50 flex items-center justify-center">
            <Heart size={20} className="text-red-400" fill="currentColor" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">Saved Scholarships</h1>
            <p className="text-sm text-gray-400">Scholarships you&apos;ve bookmarked</p>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {[1, 2, 3, 4].map((i) => <SkeletonCard key={i} />)}
          </div>
        ) : scholarships.length === 0 ? (
          <div className="glass-card p-16 text-center">
            <Heart size={64} className="text-gray-200 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-700 mb-2">No saved scholarships</h2>
            <p className="text-gray-400 mb-6">Browse scholarships and click the heart icon to save them here.</p>
            <Link href="/scholarships" className="btn-primary px-6 py-2.5">
              <GraduationCap size={16} /> Browse Scholarships
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {scholarships.map((s) => (
              <ScholarshipCard
                key={s.id}
                scholarship={s}
                isSaved
                showSaveButton
                userId={userId}
                onSaveToggle={(id, saved) => { if (!saved) handleUnsave(id) }}
              />
            ))}
          </div>
        )}
      </div>
    </>
  )
}
