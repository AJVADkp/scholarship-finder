'use client'

import { useState, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { UserProfile } from '@/lib/types'
import { COLLEGE_LEVELS } from '@/lib/search-constants'
import { Save } from 'lucide-react'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import { ProfileAcademicSection } from './ProfileAcademicSection'
import { ProfileDemographicSection } from './ProfileDemographicSection'
import { ProfileFinancialSection } from './ProfileFinancialSection'

interface ProfileFormProps {
  initialData: UserProfile
  userId: string
}

export function ProfileForm({ initialData, userId }: ProfileFormProps) {
  const router = useRouter()
  const supabase = createClient()
  const [formData, setFormData] = useState<UserProfile>(initialData)
  const [saving, setSaving] = useState(false)

  // Completion Progress calculation
  const completionPercentage = useMemo(() => {
    const fields = [
      'academic_level',
      'gender',
      'state',
      'religion',
      'caste_category',
      'disability_status',
      'annual_income',
      'special_background',
    ]

    const level = formData.academic_level || ''
    const isSchoolUnder10 = ['Class 8', 'Class 9', 'Class 10'].includes(level)
    const isCollege = COLLEGE_LEVELS.includes(level)
    const is12Plus = level === 'Class 12' || isCollege

    if (level !== '') {
      fields.push('class_10_percentage')
      if (!isSchoolUnder10) fields.push('stream')
      if (isCollege) {
        fields.push('course_specialization', 'year_of_study', 'institution_type', 'study_mode')
      }
      if (is12Plus) fields.push('class_12_percentage', 'entrance_exam')
      if (isCollege && !['1st year', ''].includes(formData.year_of_study || '')) {
        fields.push('college_marks_type', 'college_marks_value')
      }
    }

    let completed = 0
    fields.forEach(f => {
      const val = formData[f as keyof UserProfile]
      if (val !== null && val !== undefined && val !== '') completed++
    })

    return Math.round((completed / fields.length) * 100)
  }, [formData])

  const setField = <K extends keyof UserProfile>(key: K, value: UserProfile[K]) => {
    setFormData(prev => ({ ...prev, [key]: value }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      if (formData.class_10_percentage && (formData.class_10_percentage < 0 || formData.class_10_percentage > 100)) {
        throw new Error('Class 10 percentage must be between 0 and 100')
      }
      if (formData.class_12_percentage && (formData.class_12_percentage < 0 || formData.class_12_percentage > 100)) {
        throw new Error('Class 12 percentage must be between 0 and 100')
      }
      if (formData.college_marks_value) {
        if (formData.college_marks_type === 'CGPA' && (formData.college_marks_value < 0 || formData.college_marks_value > 10)) {
          throw new Error('CGPA must be between 0 and 10')
        }
        if (formData.college_marks_type === 'Percentage' && (formData.college_marks_value < 0 || formData.college_marks_value > 100)) {
          throw new Error('College percentage must be between 0 and 100')
        }
      }

      const dbData = { ...formData }
      delete (dbData as Record<string, unknown>).class_10_type
      delete (dbData as Record<string, unknown>).class_12_type

      const { error } = await supabase.from('users').update(dbData).eq('id', userId)

      if (error) throw error

      toast.success('Profile updated successfully!')
      router.push('/dashboard')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to save profile')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Bar */}
      <div className="glass-card p-6 mb-8 bg-gradient-to-br from-emerald-50/50 to-teal-50/30 border-emerald-100/50 shadow-sm">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Profile Completion</h2>
          <span className="text-emerald-600 font-black text-lg">{completionPercentage}%</span>
        </div>
        <div className="w-full bg-gray-200/50 rounded-full h-3.5 mb-2 overflow-hidden backdrop-blur-sm border border-gray-100">
          <div
            className="bg-gradient-to-r from-emerald-400 to-emerald-600 h-full rounded-full transition-all duration-700 ease-out shadow-[0_0_12px_rgba(16,185,129,0.3)]"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
        <p className="text-[11px] text-gray-500 font-semibold italic">
          {completionPercentage < 100
            ? '💡 Complete your profile to unlock 100% accurate scholarship recommendations.'
            : '✨ Your profile is fully optimized for matching.'}
        </p>
      </div>

      <div className="space-y-6">
        <ProfileAcademicSection formData={formData} setField={setField} />
        <ProfileDemographicSection formData={formData} setField={setField} />
        <ProfileFinancialSection formData={formData} setField={setField} />

        {/* Submit */}
        <div className="flex justify-end pt-4 pb-12">
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary gap-2 px-8 py-3.5 text-base shadow-lg shadow-primary/20"
          >
            <Save size={18} /> {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </div>
    </div>
  )
}
