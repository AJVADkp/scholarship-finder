'use client'

import { ChevronDown, ChevronUp, Info } from 'lucide-react'
import { useState } from 'react'
import {
  CASTE_CATEGORIES,
  RELIGIONS,
  SPECIAL_BACKGROUNDS,
  ACADEMIC_PERFORMANCE_OPTIONS,
  AWARD_AMOUNT_RANGES,
  APPLICATION_STATUSES,
  PORTAL_SOURCES,
  COURSE_SPECIALIZATIONS,
  STUDY_MODES,
  GEOGRAPHIC_FOCUSES,
  INSTITUTION_TYPES,
  YEARS_OF_STUDY,
  COLLEGE_PERFORMANCE_OPTIONS,
  APPLICATION_TYPES,
  FIRST_YEAR_ONLY,
  SCHOOL_LEVELS,
} from '@/lib/search-constants'
import type { BasicFilterState } from './BasicFilters'

export interface AdvancedFilterState {
  casteCategory: string
  religion: string
  disabilityStatus: string
  girlsOnly: boolean
  specialBackgrounds: string[]
  minAcademicPerformance: string
  awardAmountRange: string
  applicationStatus: string
  portalSources: string[]
  courseSpecialization: string
  studyMode: string
  geographicFocus: string
  institutionType: string
  yearOfStudy: string
  minCollegePerformance: string
  applicationType: string
}

export const EMPTY_ADVANCED_FILTERS: AdvancedFilterState = {
  casteCategory: '',
  religion: '',
  disabilityStatus: '',
  girlsOnly: false,
  specialBackgrounds: [],
  minAcademicPerformance: '',
  awardAmountRange: '',
  applicationStatus: '',
  portalSources: [],
  courseSpecialization: '',
  studyMode: '',
  geographicFocus: '',
  institutionType: '',
  yearOfStudy: '',
  minCollegePerformance: '',
  applicationType: '',
}

interface AdvancedFiltersProps {
  filters: AdvancedFilterState
  basicFilters: BasicFilterState
  onChange: (f: AdvancedFilterState) => void
}

function FilterGroup({
  title,
  children,
  defaultOpen = false,
}: {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="mb-5 border-b border-gray-100 pb-5 last:border-0 last:pb-0">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full mb-3 group"
      >
        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider group-hover:text-gray-700 transition-colors">
          {title}
        </h4>
        {open ? (
          <ChevronUp size={14} className="text-gray-400" />
        ) : (
          <ChevronDown size={14} className="text-gray-400" />
        )}
      </button>
      {open && children}
    </div>
  )
}

// Shared inline styles — avoids Tailwind CSS variable resolution issues
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

function ChipMultiSelect({
  options,
  selected,
  onChange,
}: {
  options: string[]
  selected: string[]
  onChange: (v: string[]) => void
}) {
  const toggle = (v: string) =>
    onChange(selected.includes(v) ? selected.filter((s) => s !== v) : [...selected, v])
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((opt) => {
        const isSelected = selected.includes(opt)
        return (
          <button
            key={opt}
            onClick={() => toggle(opt)}
            style={isSelected ? CHIP_SELECTED : CHIP_UNSELECTED}
            className="px-2.5 py-1 rounded-full text-xs font-semibold border transition-all hover:opacity-90"
          >
            {opt}
          </button>
        )
      })}
    </div>
  )
}

function SingleSelect({
  options,
  selected,
  onChange,
}: {
  options: string[]
  selected: string
  onChange: (v: string) => void
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((opt) => {
        const isSelected = selected === opt
        return (
          <button
            key={opt}
            onClick={() => onChange(isSelected ? '' : opt)}
            style={isSelected ? CHIP_SELECTED : CHIP_UNSELECTED}
            className="px-2.5 py-1 rounded-full text-xs font-semibold border transition-all hover:opacity-90"
          >
            {opt}
          </button>
        )
      })}
    </div>
  )
}

function Tooltip({ text }: { text: string }) {
  const [show, setShow] = useState(false)
  return (
    <span className="relative inline-block ml-1">
      <Info
        size={11}
        className="text-gray-300 cursor-help inline align-middle hover:text-primary transition-colors"
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
      />
      {show && (
        <span className="absolute left-full top-0 ml-2 z-[99] w-48 bg-[#1a1a1a] text-white text-[10px] font-bold rounded-lg px-3 py-2 shadow-[0_4px_20px_rgba(0,0,0,0.4)] border border-white/10 leading-relaxed pointer-events-none">
          {text}
        </span>
      )}
    </span>
  )
}

export function AdvancedFilters({ filters, basicFilters, onChange }: AdvancedFiltersProps) {
  const set = <K extends keyof AdvancedFilterState>(key: K, value: AdvancedFilterState[K]) =>
    onChange({ ...filters, [key]: value })

  const isMale = basicFilters.gender === 'Male'
  const isSchoolOnly =
    !!basicFilters.academicLevel && SCHOOL_LEVELS.includes(basicFilters.academicLevel)
  const showCollegePerf = !isSchoolOnly && !FIRST_YEAR_ONLY.includes(filters.yearOfStudy)

  // Dynamic course specializations based on selected streams
  const availableSpecializations = basicFilters.stream
    ? COURSE_SPECIALIZATIONS[basicFilters.stream as keyof typeof COURSE_SPECIALIZATIONS] || []
    : []

  return (
    <div>
      <FilterGroup title="Caste / Community Category" defaultOpen>
        <div className="flex items-start gap-1 mb-3 text-[10px] text-gray-400">
          <Info size={11} className="mt-0.5 flex-shrink-0" />
          <span>
            Your caste info is only used for scholarship matching and is never stored or shared.
          </span>
        </div>
        <div className="space-y-1.5">
          {CASTE_CATEGORIES.map(({ value, label, tooltip }) => {
            const isSelected = filters.casteCategory === value
            return (
              <div key={value} className="flex items-center gap-2">
                <button
                  onClick={() => set('casteCategory', isSelected ? '' : value)}
                  style={isSelected ? CHIP_SELECTED : CHIP_UNSELECTED}
                  className="flex-1 text-left px-3 py-1.5 rounded-full text-xs font-semibold border transition-all hover:opacity-90 flex items-center justify-between"
                >
                  <span>{label}</span>
                </button>
                {tooltip && <Tooltip text={tooltip} />}
              </div>
            )
          })}
        </div>
      </FilterGroup>

      {/* 8. Religion / Minority */}
      <FilterGroup title="Religion / Minority Status">
        <SingleSelect
          options={RELIGIONS}
          selected={filters.religion}
          onChange={(v) => set('religion', v)}
        />
      </FilterGroup>

      {/* 9. Disability */}
      <FilterGroup title="Disability Status">
        <SingleSelect
          options={['No disability', 'Person with Disability (PwD) — 40%+']}
          selected={filters.disabilityStatus}
          onChange={(v) => set('disabilityStatus', v)}
        />
        <p className="text-xs text-gray-400 mt-1.5">
          PwD = Person with Disability with at least 40% certified disability
        </p>
      </FilterGroup>

      {/* 10. Girls-Only Toggle */}
      <FilterGroup title="Girls-Only Scholarships">
        <div
          className={`flex items-center gap-3 ${isMale ? 'opacity-40 pointer-events-none' : ''}`}
        >
          <button
            onClick={() => set('girlsOnly', !filters.girlsOnly)}
            className={`w-10 h-6 rounded-full transition-all flex-shrink-0 ${filters.girlsOnly ? 'bg-pink-400' : 'bg-gray-200'}`}
          >
            <div
              className={`w-5 h-5 bg-white rounded-full shadow transition-transform mx-0.5 ${filters.girlsOnly ? 'translate-x-4' : 'translate-x-0'}`}
            />
          </button>
          <span className="text-xs font-medium text-gray-600">
            {filters.girlsOnly ? 'Show girls-only scholarships' : 'Include all'}
          </span>
        </div>
        {isMale && (
          <p className="text-xs text-gray-400 mt-1">Not applicable — Gender is set to Male</p>
        )}
      </FilterGroup>

      {/* 11. Special Family Background */}
      <FilterGroup title="Special Family Background">
        <ChipMultiSelect
          options={SPECIAL_BACKGROUNDS}
          selected={filters.specialBackgrounds}
          onChange={(v) => set('specialBackgrounds', v)}
        />
      </FilterGroup>

      {/* 12. Minimum Academic Performance */}
      <FilterGroup title="Class 12 / Last Exam Performance">
        <SingleSelect
          options={ACADEMIC_PERFORMANCE_OPTIONS}
          selected={filters.minAcademicPerformance}
          onChange={(v) => set('minAcademicPerformance', v)}
        />
      </FilterGroup>

      {/* 13. Award Amount Range */}
      <FilterGroup title="Award Amount Range">
        <SingleSelect
          options={AWARD_AMOUNT_RANGES}
          selected={filters.awardAmountRange}
          onChange={(v) => set('awardAmountRange', v)}
        />
      </FilterGroup>

      {/* 14. Application Status */}
      <FilterGroup title="Application Status">
        <SingleSelect
          options={APPLICATION_STATUSES}
          selected={filters.applicationStatus}
          onChange={(v) => set('applicationStatus', v)}
        />
      </FilterGroup>

      {/* 15. Portal / Source */}
      <FilterGroup title="Scholarship Portal / Source">
        <ChipMultiSelect
          options={PORTAL_SOURCES}
          selected={filters.portalSources}
          onChange={(v) => set('portalSources', v)}
        />
      </FilterGroup>

      {/* 16. Course Specialization — dynamic based on stream */}
      <FilterGroup title="Course Specialization">
        {availableSpecializations.length === 0 ? (
          <p className="text-xs text-gray-400 italic">
            Please select a stream first in Basic Filters ↑
          </p>
        ) : (
          <SingleSelect
            options={availableSpecializations}
            selected={filters.courseSpecialization}
            onChange={(v) => set('courseSpecialization', v)}
          />
        )}
      </FilterGroup>

      <FilterGroup title="Study Mode">
        <div className="space-y-1.5">
          {STUDY_MODES.map((m) => {
            const isSelected = filters.studyMode === m.value
            return (
              <div key={m.value} className="flex items-center gap-2">
                <button
                  onClick={() => set('studyMode', isSelected ? '' : m.value)}
                  style={isSelected ? CHIP_SELECTED : CHIP_UNSELECTED}
                  className="flex-1 text-left px-3 py-1.5 rounded-full text-xs font-semibold border transition-all hover:opacity-90"
                >
                  {m.value}
                </button>
                {m.note && <Tooltip text={m.note} />}
              </div>
            )
          })}
        </div>
      </FilterGroup>

      {/* 18. Geographic Focus */}
      <FilterGroup title="Geographic Focus">
        <SingleSelect
          options={GEOGRAPHIC_FOCUSES}
          selected={filters.geographicFocus}
          onChange={(v) => set('geographicFocus', v)}
        />
      </FilterGroup>

      {/* 19. Institution Type */}
      <FilterGroup title="Institution Type">
        <SingleSelect
          options={INSTITUTION_TYPES}
          selected={filters.institutionType}
          onChange={(v) => set('institutionType', v)}
        />
      </FilterGroup>

      <FilterGroup title="Current Year of Study">
        <div className="space-y-1.5">
          {YEARS_OF_STUDY.map((y) => {
            const isSelected = filters.yearOfStudy === y
            const isRenewalHint = y === '2nd year'
            return (
              <div key={y} className="flex items-center gap-2">
                <button
                  onClick={() => set('yearOfStudy', isSelected ? '' : y)}
                  style={isSelected ? CHIP_SELECTED : CHIP_UNSELECTED}
                  className="flex-1 text-left px-3 py-1.5 rounded-full text-xs font-semibold border transition-all hover:opacity-90"
                >
                  {y}
                </button>
                {isRenewalHint && (
                  <Tooltip text="Most scholarships starting here are for existing students or renewals." />
                )}
              </div>
            )
          })}
        </div>
      </FilterGroup>

      {/* 21. College Academic Performance — hidden for school/1st year */}
      {showCollegePerf && (
        <FilterGroup title="College Academic Performance" defaultOpen>
          <p className="text-xs text-gray-400 mb-2">
            Based on your current college/university marks or CGPA
          </p>
          <SingleSelect
            options={COLLEGE_PERFORMANCE_OPTIONS}
            selected={filters.minCollegePerformance}
            onChange={(v) => set('minCollegePerformance', v)}
          />
        </FilterGroup>
      )}

      {/* 22. Application Type */}
      <FilterGroup title="Application Type">
        <SingleSelect
          options={APPLICATION_TYPES}
          selected={filters.applicationType}
          onChange={(v) => set('applicationType', v)}
        />
        <p className="text-xs text-gray-400 mt-1.5">
          Renewal = you are already receiving this scholarship and want to continue next year
        </p>
      </FilterGroup>
    </div>
  )
}
