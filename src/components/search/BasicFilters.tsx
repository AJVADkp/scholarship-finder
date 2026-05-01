'use client'

import { ChevronDown, ChevronUp, Info, Check } from 'lucide-react'
import { useState } from 'react'
import {
  ACADEMIC_LEVELS, STREAMS, GENDERS, INCOME_BRACKETS,
  SCHOLARSHIP_TYPES, INDIAN_STATES_UTS
} from '@/lib/search-constants'

export interface BasicFilterState {
  academicLevel: string
  stream: string
  gender: string
  state: string
  incomeRange: string
  scholarshipTypes: string[]
}

export const EMPTY_BASIC_FILTERS: BasicFilterState = {
  academicLevel: '',
  stream: '',
  gender: '',
  state: '',
  incomeRange: '',
  scholarshipTypes: [],
}

interface BasicFiltersProps {
  filters: BasicFilterState
  onChange: (f: BasicFilterState) => void
  matchCount: number
  loading: boolean
}

// ── Shared selected chip style using inline style to avoid Tailwind CSS-variable issues
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

function FilterGroup({ title, children, defaultOpen = true }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
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
        {open ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />}
      </button>
      {open && children}
    </div>
  )
}

function ChipMultiSelect({
  options, selected, onChange
}: { options: string[]; selected: string[]; onChange: (v: string[]) => void }) {
  const toggle = (v: string) =>
    onChange(selected.includes(v) ? selected.filter(s => s !== v) : [...selected, v])
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map(opt => {
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
  options, selected, onChange
}: { options: string[]; selected: string; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map(opt => {
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

export function BasicFilters({ filters, onChange, matchCount, loading }: BasicFiltersProps) {
  const set = <K extends keyof BasicFilterState>(key: K, value: BasicFilterState[K]) =>
    onChange({ ...filters, [key]: value })

  const [stateSearch, setStateSearch] = useState(filters.state || '')

  // When a state is selected, update the search box to show it
  const handleStateSelect = (s: string) => {
    const newState = s === filters.state ? '' : s
    set('state', newState)
    setStateSearch(newState) // Show selected state name in the input
  }

  const filteredStates = INDIAN_STATES_UTS.filter(s =>
    stateSearch === '' ||
    filters.state === stateSearch || // keep showing all if current search IS the selected state
    s.toLowerCase().includes(stateSearch.toLowerCase())
  )

  const handleStateSearchChange = (val: string) => {
    setStateSearch(val)
    // If user clears the box, also clear the selected state
    if (val === '') set('state', '')
  }

  return (
    <div>
      {/* Live count */}
      <div className={`text-center py-2 px-3 rounded-xl mb-4 text-sm font-bold transition-all ${
        loading ? 'bg-gray-50 text-gray-400' : 'bg-emerald-50 text-emerald-700'
      }`}>
        {loading ? 'Searching...' : `${matchCount} scholarship${matchCount !== 1 ? 's' : ''} match your filters`}
      </div>

      {/* 1. Academic Level */}
      <FilterGroup title="Academic Level">
        <SingleSelect
          options={ACADEMIC_LEVELS}
          selected={filters.academicLevel}
          onChange={v => set('academicLevel', v)}
        />
      </FilterGroup>

      {/* 2. Course / Stream */}
      <FilterGroup title="Course / Stream">
        <SingleSelect
          options={STREAMS}
          selected={filters.stream}
          onChange={v => set('stream', v)}
        />
      </FilterGroup>

      {/* 3. Gender */}
      <FilterGroup title="Gender">
        <SingleSelect
          options={GENDERS}
          selected={filters.gender}
          onChange={v => set('gender', v)}
        />
      </FilterGroup>

      {/* 4. State / UT */}
      <FilterGroup title="State / UT of Domicile">
        <div className="relative mb-2">
          <input
            type="text"
            placeholder="Search state or UT..."
            value={stateSearch}
            onChange={e => handleStateSearchChange(e.target.value)}
            className={`input-glass text-xs py-2 pr-8 ${filters.state ? 'font-semibold' : ''}`}
            style={filters.state ? { color: 'var(--color-primary)', borderColor: 'var(--color-primary)' } : {}}
          />
          {filters.state && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2">
              <Check size={12} style={{ color: 'var(--color-primary)' }} />
            </span>
          )}
        </div>
        <div className="max-h-36 overflow-y-auto space-y-0.5 pr-1">
          <button
            onClick={() => { set('state', ''); setStateSearch('') }}
            className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              filters.state === '' ? 'font-bold text-gray-900' : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            All States & UTs
          </button>
          {filteredStates.map(s => (
            <button
              key={s}
              onClick={() => handleStateSelect(s)}
              className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center justify-between"
              style={filters.state === s
                ? { background: 'rgba(79,142,247,0.1)', color: 'var(--color-primary)' }
                : {}
              }
            >
              <span className={filters.state !== s ? 'text-gray-600' : ''}>{s}</span>
              {filters.state === s && <Check size={11} style={{ color: 'var(--color-primary)' }} />}
            </button>
          ))}
        </div>
      </FilterGroup>

      {/* 5. Annual Family Income */}
      <FilterGroup title="Annual Family Income">
        <div className="flex items-start gap-1 mb-2 text-xs text-gray-400">
          <Info size={11} className="mt-0.5 flex-shrink-0" />
          <span>Your income info is only used for scholarship matching and is never stored or shared.</span>
        </div>
        <SingleSelect
          options={INCOME_BRACKETS}
          selected={filters.incomeRange}
          onChange={v => set('incomeRange', v)}
        />
      </FilterGroup>

      {/* 6. Scholarship Type */}
      <FilterGroup title="Scholarship Type">
        <ChipMultiSelect
          options={SCHOLARSHIP_TYPES}
          selected={filters.scholarshipTypes}
          onChange={v => set('scholarshipTypes', v)}
        />
      </FilterGroup>
    </div>
  )
}
