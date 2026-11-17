'use client'

import { useState } from 'react'
import { type Scholarship, ALL_CATEGORIES } from '@/lib/types'
import {
  ACADEMIC_LEVELS,
  STREAMS,
  GENDERS,
  INCOME_BRACKETS,
  CASTE_CATEGORIES,
  RELIGIONS,
  SPECIAL_BACKGROUNDS,
  APPLICATION_STATUSES,
  PORTAL_SOURCES,
  COURSE_SPECIALIZATIONS,
  STUDY_MODES,
  GEOGRAPHIC_FOCUSES,
  INSTITUTION_TYPES,
  YEARS_OF_STUDY,
  COLLEGE_PERFORMANCE_OPTIONS,
  APPLICATION_TYPES,
  INDIAN_STATES_UTS,
} from '@/lib/search-constants'
import { X, Save, ChevronDown, ChevronUp } from 'lucide-react'
import toast from 'react-hot-toast'

export const EMPTY_FORM: Partial<Scholarship> = {
  title: '',
  provider: '',
  category: 'Merit',
  country: 'India',
  state: '',
  min_marks_percentage: undefined,
  amount: undefined,
  currency: 'INR',
  deadline: '',
  description: '',
  eligibility_criteria: '',
  application_link: '',
  tags: [],
  is_active: true,
  academic_levels: [],
  streams: [],
  gender_eligibility: 'All',
  income_range: undefined,
  scholarship_type: undefined,
  caste_categories: [],
  religion: 'Any',
  disability_required: false,
  girls_only: false,
  special_backgrounds: [],
  min_academic_performance: undefined,
  award_amount_range: undefined,
  application_status: 'Open',
  portal_source: [],
  course_specializations: [],
  study_mode: 'Any',
  geographic_focus: 'Both',
  institution_types: [],
  year_of_study: undefined,
  min_college_performance: undefined,
  application_type: 'Both',
}

function FormSection({
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
    <div className="border border-gray-100 rounded-xl overflow-hidden mb-4">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50/60 text-left"
      >
        <span className="text-sm font-bold text-gray-700">{title}</span>
        {open ? (
          <ChevronUp size={15} className="text-gray-400" />
        ) : (
          <ChevronDown size={15} className="text-gray-400" />
        )}
      </button>
      {open && <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">{children}</div>}
    </div>
  )
}

function MultiCheckbox({
  label,
  options,
  selected,
  onChange,
}: {
  label: string
  options: string[]
  selected: string[]
  onChange: (v: string[]) => void
}) {
  const toggle = (v: string) =>
    onChange(selected.includes(v) ? selected.filter((x) => x !== v) : [...selected, v])
  return (
    <div className="sm:col-span-2">
      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">
        {label}
      </label>
      <div className="flex flex-wrap gap-1.5">
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => toggle(opt)}
            className={`px-2.5 py-1 rounded-full text-xs font-semibold border transition-all ${
              selected.includes(opt)
                ? 'bg-primary text-white border-primary'
                : 'bg-white text-gray-600 border-gray-200 hover:border-primary/40'
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  )
}

function SingleDropdown({
  label,
  options,
  value,
  onChange,
  placeholder = 'Select...',
}: {
  label: string
  options: string[]
  value: string
  onChange: (v: string) => void
  placeholder?: string
}) {
  return (
    <div>
      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">
        {label}
      </label>
      <select
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className="input-glass text-sm py-2.5"
      >
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  )
}

interface ScholarshipFormModalProps {
  isOpen: boolean
  onClose: () => void
  editingId: string | null
  form: Partial<Scholarship>
  setForm: React.Dispatch<React.SetStateAction<Partial<Scholarship>>>
  onSaveSuccess: () => void
}

export function ScholarshipFormModal({
  isOpen,
  onClose,
  editingId,
  form,
  setForm,
  onSaveSuccess,
}: ScholarshipFormModalProps) {
  const [saving, setSaving] = useState(false)

  if (!isOpen) return null

  const setField = (key: keyof Scholarship, value: unknown) =>
    setForm((f) => ({ ...f, [key]: value }))
  const arr = (v: string[] | null | undefined) => v || []

  const handleSave = async () => {
    if (!form.title) {
      toast.error('Title is required')
      return
    }
    setSaving(true)
    try {
      const method = editingId ? 'PUT' : 'POST'
      const url = editingId ? `/api/admin/scholarships/${editingId}` : '/api/admin/scholarships'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error()
      toast.success(editingId ? 'Scholarship updated!' : 'Scholarship added!')
      onClose()
      onSaveSuccess()
    } catch {
      toast.error('Failed to save scholarship')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm overflow-y-auto">
      <div className="glass-card bg-white p-6 sm:p-8 w-full max-w-3xl my-8 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-extrabold text-gray-900">
            {editingId ? 'Edit Scholarship' : 'Add Scholarship'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        {/* Section 1: Basic */}
        <FormSection title="1. Basic Information" defaultOpen={true}>
          <div className="sm:col-span-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">
              Title *
            </label>
            <input
              value={form.title || ''}
              onChange={(e) => setField('title', e.target.value)}
              placeholder="e.g. National Merit Scholarship 2026"
              className="input-glass text-sm py-2.5 w-full font-medium"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">
              Provider / Organization
            </label>
            <input
              value={form.provider || ''}
              onChange={(e) => setField('provider', e.target.value)}
              placeholder="e.g. Ministry of Education"
              className="input-glass text-sm py-2.5 w-full"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">
              Category
            </label>
            <select
              value={form.category || 'Merit'}
              onChange={(e) => setField('category', e.target.value)}
              className="input-glass text-sm py-2.5 w-full"
            >
              {ALL_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">
              Amount (INR)
            </label>
            <input
              type="number"
              value={form.amount || ''}
              onChange={(e) => setField('amount', parseFloat(e.target.value))}
              placeholder="e.g. 50000"
              className="input-glass text-sm py-2.5 w-full"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">
              Deadline
            </label>
            <input
              type="date"
              value={form.deadline ? form.deadline.split('T')[0] : ''}
              onChange={(e) => setField('deadline', e.target.value)}
              className="input-glass text-sm py-2.5 w-full"
            />
          </div>
          <div>
            <SingleDropdown
              label="State"
              options={['All India', ...INDIAN_STATES_UTS]}
              value={form.state || ''}
              onChange={(v) => setField('state', v)}
              placeholder="All India"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">
              Application Link
            </label>
            <input
              value={form.application_link || ''}
              onChange={(e) => setField('application_link', e.target.value)}
              placeholder="https://..."
              className="input-glass text-sm py-2.5 w-full"
            />
          </div>
        </FormSection>

        {/* Section 2: Academic */}
        <FormSection title="2. Academic Eligibility">
          <MultiCheckbox
            label="Academic Levels"
            options={ACADEMIC_LEVELS}
            selected={arr(form.academic_levels)}
            onChange={(v) => setField('academic_levels', v)}
          />
          <MultiCheckbox
            label="Eligible Streams"
            options={['All', ...STREAMS]}
            selected={arr(form.streams)}
            onChange={(v) => setField('streams', v)}
          />
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">
              Min Marks Percentage
            </label>
            <input
              type="number"
              value={form.min_marks_percentage || ''}
              onChange={(e) => setField('min_marks_percentage', parseFloat(e.target.value))}
              placeholder="e.g. 75"
              className="input-glass text-sm py-2.5 w-full"
            />
          </div>
          <SingleDropdown
            label="Year of Study"
            options={YEARS_OF_STUDY}
            value={form.year_of_study || ''}
            onChange={(v) => setField('year_of_study', v)}
            placeholder="Any year"
          />
        </FormSection>

        {/* Section 3: Demographic */}
        <FormSection title="3. Social & Demographic Eligibility">
          <SingleDropdown
            label="Gender"
            options={GENDERS}
            value={form.gender_eligibility || 'All'}
            onChange={(v) => setField('gender_eligibility', v)}
          />
          <SingleDropdown
            label="Family Income Limit"
            options={INCOME_BRACKETS}
            value={form.income_range || ''}
            onChange={(v) => setField('income_range', v)}
            placeholder="No limit"
          />
          <MultiCheckbox
            label="Caste Categories"
            options={CASTE_CATEGORIES.map((c) => c.value)}
            selected={arr(form.caste_categories)}
            onChange={(v) => setField('caste_categories', v)}
          />
          <SingleDropdown
            label="Religion"
            options={RELIGIONS}
            value={form.religion || 'Any'}
            onChange={(v) => setField('religion', v)}
          />
          <MultiCheckbox
            label="Special Backgrounds"
            options={SPECIAL_BACKGROUNDS}
            selected={arr(form.special_backgrounds)}
            onChange={(v) => setField('special_backgrounds', v)}
          />
        </FormSection>

        {/* Modal Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
          <button onClick={onClose} className="btn-ghost text-sm px-4">
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving} className="btn-primary gap-2 text-sm px-6">
            <Save size={15} />{' '}
            {saving ? 'Saving...' : editingId ? 'Update Scholarship' : 'Create Scholarship'}
          </button>
        </div>
      </div>
    </div>
  )
}
