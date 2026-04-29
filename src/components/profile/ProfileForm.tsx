'use client'

import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { UserProfile } from '@/lib/types'
import {
  ACADEMIC_LEVELS, STREAMS, GENDERS, INCOME_BRACKETS,
  CASTE_CATEGORIES, RELIGIONS, SPECIAL_BACKGROUNDS,
  INDIAN_STATES_UTS, COURSE_SPECIALIZATIONS,
  YEARS_OF_STUDY, INSTITUTION_TYPES, STUDY_MODES,
  SCHOOL_LEVELS, COLLEGE_LEVELS
} from '@/lib/search-constants'
import { 
  CheckCircle, Info, ChevronDown, ChevronUp, Save, 
  GraduationCap, User, BookOpen, IndianRupee, AlertCircle
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'

interface ProfileFormProps {
  initialData: UserProfile
  userId: string
}

const ENTRANCE_EXAMS = ['None', 'JEE qualified', 'NEET qualified', 'State merit exam qualified']

const SPECIAL_BACKGROUND_OPTIONS = [
  'None of the above',
  ...SPECIAL_BACKGROUNDS
]

// Shared selection styles for buttons
const CHIP_SELECTED = {
  background: 'var(--color-primary)',
  color: '#ffffff',
  borderColor: 'var(--color-primary)',
}
const CHIP_UNSELECTED = {
  background: 'rgba(255,255,255,0.65)',
  backdropFilter: 'blur(12px)',
  color: '#4b5563',
  borderColor: '#e5e7eb',
}

// Tooltip helper
function Tooltip({ text }: { text: string }) {
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

function Section({ title, icon: Icon, children, defaultOpen = true }: { title: string; icon: any; children: React.ReactNode; defaultOpen?: boolean }) {
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

export function ProfileForm({ initialData, userId }: ProfileFormProps) {
  const router = useRouter()
  const supabase = createClient()
  const [formData, setFormData] = useState<UserProfile>(initialData)
  const [saving, setSaving] = useState(false)

  // Completion Progress — Dynamic calculation based on currently visible fields
  const completionPercentage = useMemo(() => {
    const fields = ['academic_level', 'gender', 'state', 'religion', 'caste_category', 'disability_status', 'annual_income', 'special_background']
    
    // Conditional visibility logic duplicated from below for calculation
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
      // Count as completed if not null, not undefined, and not empty string
      // For disability and special background, user must select a value other than empty
      if (val !== null && val !== undefined && val !== '') completed++
    })
    
    return Math.round((completed / fields.length) * 100)
  }, [formData])

  const setField = (key: keyof UserProfile, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      // Basic validation
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

      // Sanitize data: Remove internal state fields that aren't in the database
      const { class_10_type, class_12_type, ...dbData } = formData

      const { error } = await supabase
        .from('users')
        .update(dbData)
        .eq('id', userId)

      if (error) throw error
      
      toast.success('Profile updated successfully! ❤️')
      router.push('/dashboard')
    } catch (err: any) {
      toast.error(err.message || 'Failed to save profile')
    } finally {
      setSaving(false)
    }
  }

  // Master Conditional Logic
  const level = formData.academic_level || ''
  const isSchoolUnder10 = ['Class 8', 'Class 9', 'Class 10'].includes(level)
  const isClass11 = level === 'Class 11'
  const isClass12 = level === 'Class 12'
  const isCollege = COLLEGE_LEVELS.includes(level)
  const is12Plus = isClass12 || isCollege

  const showStream = !isSchoolUnder10 && level !== ''
  const showSpecialization = isCollege
  const showCollegeDetails = isCollege
  const showClass12Marks = is12Plus
  const showEntranceExams = is12Plus
  const showCollegeMarks = isCollege

  const availableSpecializations = formData.stream ? COURSE_SPECIALIZATIONS[formData.stream] || [] : []

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
            ? "💡 Tip: Complete your profile to unlock 100% accurate scholarship recommendations."
            : "✨ Awesome! Your profile is fully optimized for matching."}
        </p>
      </div>

      <div className="space-y-2">
        {/* SECTION 1: ACADEMIC */}
        <Section title="Academic Information" icon={GraduationCap}>
          {/* Field 1: Academic Level */}
          <div className="md:col-span-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">
              Current Academic Level *
            </label>
            <select 
              value={formData.academic_level || ''}
              onChange={(e) => setField('academic_level', e.target.value)}
              className="input-glass text-sm py-3"
            >
              <option value="" disabled hidden>Select Level...</option>
              {ACADEMIC_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>

          {/* Field 2: Stream */}
          {showStream && (
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">
                Course or Stream
              </label>
              <select 
                value={formData.stream || ''}
                onChange={(e) => setField('stream', e.target.value)}
                className="input-glass text-sm py-3"
              >
                <option value="" disabled hidden>Select Stream...</option>
                {STREAMS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          )}

          {/* Field 3: Specialization */}
          {showSpecialization && (
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">
                Course Specialization
              </label>
              <select 
                value={formData.course_specialization || ''}
                onChange={(e) => setField('course_specialization', e.target.value)}
                disabled={!formData.stream}
                className="input-glass text-sm py-3 disabled:bg-gray-50 disabled:text-gray-400"
              >
                {!formData.stream ? (
                  <option value="">Please select a stream first</option>
                ) : (
                  <>
                    <option value="" disabled hidden>Select Specialization...</option>
                    {availableSpecializations.map(s => <option key={s} value={s}>{s}</option>)}
                  </>
                )}
              </select>
            </div>
          )}

          {/* Field 4: Year of Study */}
          {showCollegeDetails && (
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">
                Current Year of Study
              </label>
              <select 
                value={formData.year_of_study || ''}
                onChange={(e) => setField('year_of_study', e.target.value)}
                className="input-glass text-sm py-3"
              >
                <option value="" disabled hidden>Select Year...</option>
                {YEARS_OF_STUDY.filter(y => y !== 'Not applicable (school students)').map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          )}

          {/* Field 5: Institution Type */}
          {showCollegeDetails && (
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">
                Institution Type
              </label>
              <select 
                value={formData.institution_type || ''}
                onChange={(e) => setField('institution_type', e.target.value)}
                className="input-glass text-sm py-3"
              >
                <option value="" disabled hidden>Select Institution Type...</option>
                {INSTITUTION_TYPES.map(i => <option key={i} value={i}>{i}</option>)}
              </select>
            </div>
          )}

          {/* Field 6: Study Mode */}
          {showCollegeDetails && (
            <div className="md:col-span-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">
                Study Mode
              </label>
              <select 
                value={formData.study_mode || ''}
                onChange={(e) => setField('study_mode', e.target.value)}
                className="input-glass text-sm py-3"
              >
                <option value="" disabled hidden>Select Mode...</option>
                {STUDY_MODES.filter(m => m.value !== 'Any').map(m => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
              <p className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
                <Info size={10} /> Note: Most Indian scholarships are only for Regular/Full-time students.
              </p>
            </div>
          )}
        </Section>

        {/* SECTION 2: PERFORMANCE */}
        <Section title="Marks and Performance" icon={BookOpen}>
          {/* Field 7: Class 10 Marks */}
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">
              Class 10th Marks (%)
            </label>
            <input 
              type="number"
              step="0.01"
              value={formData.class_10_percentage || ''}
              onChange={(e) => setField('class_10_percentage', parseFloat(e.target.value))}
              className="input-glass text-sm py-3"
              placeholder="e.g. 85.50"
            />
          </div>

          {/* Field 8: Class 12 Marks */}
          {showClass12Marks && (
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">
                Class 12th Marks (%)
              </label>
              <input 
                type="number"
                step="0.01"
                value={formData.class_12_percentage || ''}
                onChange={(e) => setField('class_12_percentage', parseFloat(e.target.value))}
                className="input-glass text-sm py-3"
                placeholder="e.g. 92.40"
              />
            </div>
          )}

          {/* Field 9: College Marks */}
          {showCollegeMarks && (
            <div className="md:col-span-2 border-t border-gray-100 pt-4 mt-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 block">
                College CGPA or Percentage
              </label>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setField('college_marks_type', 'Percentage')}
                    style={formData.college_marks_type === 'Percentage' ? CHIP_SELECTED : CHIP_UNSELECTED}
                    className="px-4 py-2 rounded-xl text-xs font-bold border transition-all"
                  >
                    Percentage
                  </button>
                  <button
                    onClick={() => setField('college_marks_type', 'CGPA')}
                    style={formData.college_marks_type === 'CGPA' ? CHIP_SELECTED : CHIP_UNSELECTED}
                    className="px-4 py-2 rounded-xl text-xs font-bold border transition-all"
                  >
                    CGPA
                  </button>
                </div>
                <input 
                  type="number"
                  step="0.01"
                  value={formData.college_marks_value || ''}
                  onChange={(e) => setField('college_marks_value', parseFloat(e.target.value))}
                  className="input-glass text-sm py-3 w-40"
                  placeholder={formData.college_marks_type === 'CGPA' ? "0.00 - 10.00" : "0.00 - 100.00"}
                />
              </div>
            </div>
          )}

          {/* Field 10: Entrance Exam */}
          {showEntranceExams && (
            <div className="md:col-span-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">
                Entrance Exam Qualified
              </label>
              <div className="flex flex-wrap gap-2">
                {ENTRANCE_EXAMS.map(exam => (
                  <button
                    key={exam}
                    onClick={() => setField('entrance_exam', exam)}
                    style={formData.entrance_exam === exam ? CHIP_SELECTED : CHIP_UNSELECTED}
                    className="px-4 py-2 rounded-xl text-xs font-bold border transition-all hover:opacity-90"
                  >
                    {exam}
                  </button>
                ))}
              </div>
            </div>
          )}
        </Section>

        {/* SECTION 3: PERSONAL */}
        <Section title="Personal Information" icon={User}>
          {/* Field 11: Gender */}
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">
              Gender
            </label>
            <select 
              value={formData.gender || ''}
              onChange={(e) => setField('gender', e.target.value)}
              className="input-glass text-sm py-3"
            >
              <option value="" disabled hidden>Select Gender...</option>
              {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>

          {/* Field 12: State */}
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">
              State or UT of Domicile
            </label>
            <select 
              value={formData.state || ''}
              onChange={(e) => setField('state', e.target.value)}
              className="input-glass text-sm py-3"
            >
              <option value="" disabled hidden>Select State/UT...</option>
              {INDIAN_STATES_UTS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <p className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
              <Info size={10} /> Used to match state-specific scholarships.
            </p>
          </div>

          {/* Field 13: Religion */}
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">
              Religion or Minority Status
            </label>
            <select 
              value={formData.religion || ''}
              onChange={(e) => setField('religion', e.target.value)}
              className="input-glass text-sm py-3"
            >
              <option value="" disabled hidden>Select Religion...</option>
              {RELIGIONS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
            <p className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
              <Info size={10} /> Your info is only used to match scholarships and is never shared.
            </p>
          </div>

          {/* Field 14: Caste */}
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">
              Caste or Community Category
            </label>
            <select 
              value={formData.caste_category || ''}
              onChange={(e) => setField('caste_category', e.target.value)}
              className="input-glass text-sm py-3"
            >
              <option value="" disabled hidden>Select Category...</option>
              {CASTE_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
            <div className="flex flex-wrap gap-2 mt-2">
              {CASTE_CATEGORIES.filter(c => c.tooltip).map(c => (
                <span key={c.value} className="text-[10px] text-gray-400 flex items-center">
                  {c.value} <Tooltip text={c.tooltip} />
                </span>
              ))}
            </div>
            <p className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
              <Info size={10} /> Your info is only used to match scholarships and is never shared.
            </p>
          </div>

          {/* Field 15: Disability */}
          <div className="md:col-span-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">
              Disability Status
            </label>
            <select 
              value={formData.disability_status || ''}
              onChange={(e) => setField('disability_status', e.target.value)}
              className="input-glass text-sm py-3"
            >
              <option value="" disabled hidden>Choose Disability Status...</option>
              <option value="No disability">No disability</option>
              <option value="Person with Disability (PwD) — 40%+">Person with Disability (PwD) with 40% or more disability</option>
            </select>
            <p className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
              <Info size={10} /> Valid certificate (40%+) qualifies for additional scholarships.
            </p>
          </div>
        </Section>

        {/* SECTION 4: FINANCIAL */}
        <Section title="Family and Financial Background" icon={IndianRupee}>
          {/* Field 16: Income */}
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">
              Annual Family Income
            </label>
            <div className="flex flex-col gap-2">
              <select 
                value={INCOME_BRACKETS.includes(formData.annual_income || '') ? (formData.annual_income || '') : (formData.annual_income !== null && formData.annual_income !== undefined ? 'Custom' : '')}
                onChange={(e) => {
                  if (e.target.value === 'Custom') {
                    setField('annual_income', '0') // Set a default numeric string to trigger custom input
                  } else {
                    setField('annual_income', e.target.value)
                  }
                }}
                className="input-glass text-sm py-3"
              >
                <option value="" disabled hidden>Choose Income Range...</option>
                {INCOME_BRACKETS.map(i => <option key={i} value={i}>{i}</option>)}
                <option value="Custom">Other (Custom Amount)</option>
              </select>
              
              {/* Custom Income Input */}
              {formData.annual_income !== null && formData.annual_income !== undefined && !INCOME_BRACKETS.includes(formData.annual_income) && (
                <input
                  type="number"
                  value={formData.annual_income === '0' ? '' : formData.annual_income}
                  onChange={(e) => setField('annual_income', e.target.value)}
                  placeholder="Enter exact annual income (e.g., 150000)"
                  className="input-glass text-sm py-3"
                />
              )}
            </div>
            <p className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
              <Info size={10} /> Your info is only used to match scholarships and is never shared.
            </p>
          </div>

          {/* Field 17: Special Background */}
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">
              Special Family Background
            </label>
            <select 
              value={formData.special_background || ''}
              onChange={(e) => setField('special_background', e.target.value)}
              className="input-glass text-sm py-3"
            >
              <option value="" disabled hidden>Choose Category...</option>
              {SPECIAL_BACKGROUND_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
            <div className="flex gap-4 mt-2">
              <span className="text-[10px] text-gray-400 flex items-center">
                1st Gen Learner <Tooltip text="Neither of your parents has attended college/university." />
              </span>
              <span className="text-[10px] text-gray-400 flex items-center">
                Unclean Occupation <Tooltip text="Families involved in tanning, flaying, or waste collection/scavenging." />
              </span>
            </div>
            <p className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
              <Info size={10} /> Your info is only used to match scholarships and is never shared.
            </p>
          </div>
        </Section>
      </div>

      {/* SAVE BUTTON */}
      <div className="sticky bottom-6 mt-8 z-20">
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full btn-primary py-4 text-lg justify-center shadow-xl hover:shadow-2xl active:scale-95 transition-all gap-3"
        >
          {saving ? (
            'Saving Your Profile...'
          ) : (
            <>
              <Save size={20} /> 
              Save Profile
            </>
          )}
        </button>
      </div>
    </div>
  )
}
