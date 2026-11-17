'use client'

import { GraduationCap, BookOpen, Info } from 'lucide-react'
import type { UserProfile } from '@/lib/types'
import {
  ACADEMIC_LEVELS, STREAMS, YEARS_OF_STUDY,
  INSTITUTION_TYPES, STUDY_MODES, COURSE_SPECIALIZATIONS,
  COLLEGE_LEVELS,
} from '@/lib/search-constants'
import { Section } from './ProfileFormShared'

const ENTRANCE_EXAMS = ['None', 'JEE qualified', 'NEET qualified', 'State merit exam qualified']

interface ProfileAcademicSectionProps {
  formData: UserProfile
  setField: <K extends keyof UserProfile>(key: K, value: UserProfile[K]) => void
}

export function ProfileAcademicSection({ formData, setField }: ProfileAcademicSectionProps) {
  const level = formData.academic_level || ''
  const isSchoolUnder10 = ['Class 8', 'Class 9', 'Class 10'].includes(level)
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
    <>
      <Section title="Academic Information" icon={GraduationCap}>
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

      <Section title="Marks and Performance" icon={BookOpen}>
        <div>
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">
            Class 10th Marks (%)
          </label>
          <input 
            type="number"
            step="0.01"
            value={formData.class_10_percentage ?? ''}
            onChange={(e) => setField('class_10_percentage', e.target.value ? parseFloat(e.target.value) : null)}
            className="input-glass text-sm py-3"
            placeholder="e.g. 85.50"
          />
        </div>

        {showClass12Marks && (
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">
              Class 12th Marks (%)
            </label>
            <input 
              type="number"
              step="0.01"
              value={formData.class_12_percentage ?? ''}
              onChange={(e) => setField('class_12_percentage', e.target.value ? parseFloat(e.target.value) : null)}
              className="input-glass text-sm py-3"
              placeholder="e.g. 92.40"
            />
          </div>
        )}

        {showCollegeMarks && (
          <div className="md:col-span-2 border-t border-gray-100 pt-4 mt-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">
              College Marks
            </label>
            <div className="flex gap-4">
              <select
                value={formData.college_marks_type || 'CGPA'}
                onChange={(e) => setField('college_marks_type', e.target.value)}
                className="input-glass text-sm py-3 w-32"
              >
                <option value="CGPA">CGPA</option>
                <option value="Percentage">%</option>
              </select>
              <input
                type="number"
                step="0.01"
                value={formData.college_marks_value ?? ''}
                onChange={(e) => setField('college_marks_value', e.target.value ? parseFloat(e.target.value) : null)}
                className="input-glass text-sm py-3 flex-1"
                placeholder={formData.college_marks_type === 'CGPA' ? 'e.g. 8.5' : 'e.g. 85.0'}
              />
            </div>
          </div>
        )}

        {showEntranceExams && (
          <div className="md:col-span-2 border-t border-gray-100 pt-4 mt-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">
              Entrance Exam Qualification
            </label>
            <select
              value={formData.entrance_exam || 'None'}
              onChange={(e) => setField('entrance_exam', e.target.value)}
              className="input-glass text-sm py-3"
            >
              {ENTRANCE_EXAMS.map(exam => <option key={exam} value={exam}>{exam}</option>)}
            </select>
          </div>
        )}
      </Section>
    </>
  )
}
