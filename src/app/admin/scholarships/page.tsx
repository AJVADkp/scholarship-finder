'use client'

import { useState, useEffect, useCallback } from 'react'
import { type Scholarship, ALL_CATEGORIES, CATEGORY_CONFIG } from '@/lib/types'
import {
  ACADEMIC_LEVELS, STREAMS, GENDERS, INCOME_BRACKETS, SCHOLARSHIP_TYPES,
  CASTE_CATEGORIES, RELIGIONS, SPECIAL_BACKGROUNDS, ACADEMIC_PERFORMANCE_OPTIONS,
  AWARD_AMOUNT_RANGES, APPLICATION_STATUSES, PORTAL_SOURCES, COURSE_SPECIALIZATIONS,
  STUDY_MODES, GEOGRAPHIC_FOCUSES, INSTITUTION_TYPES, YEARS_OF_STUDY,
  COLLEGE_PERFORMANCE_OPTIONS, APPLICATION_TYPES, INDIAN_STATES_UTS,
} from '@/lib/search-constants'
import { formatAmount, formatDeadline } from '@/lib/utils'
import { Plus, Edit2, Trash2, Search, ToggleLeft, ToggleRight, X, Save, CheckSquare, Square, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'

const EMPTY_FORM: Partial<Scholarship> = {
  title: '', provider: '', category: 'Merit', country: 'India', state: '',
  min_marks_percentage: undefined, amount: undefined, currency: 'INR',
  deadline: '', description: '', eligibility_criteria: '', application_link: '',
  tags: [], is_active: true,
  academic_levels: [], streams: [], gender_eligibility: 'All', income_range: undefined,
  scholarship_type: undefined, caste_categories: [], religion: 'Any',
  disability_required: false, girls_only: false, special_backgrounds: [],
  min_academic_performance: undefined, award_amount_range: undefined,
  application_status: 'Open', portal_source: [], course_specializations: [],
  study_mode: 'Any', geographic_focus: 'Both', institution_types: [],
  year_of_study: undefined, min_college_performance: undefined, application_type: 'Both',
}

function FormSection({ title, children, defaultOpen = false }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden mb-4">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50/60 text-left"
      >
        <span className="text-sm font-bold text-gray-700">{title}</span>
        {open ? <ChevronUp size={15} className="text-gray-400" /> : <ChevronDown size={15} className="text-gray-400" />}
      </button>
      {open && <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">{children}</div>}
    </div>
  )
}

function MultiCheckbox({ label, options, selected, onChange }: {
  label: string; options: string[]; selected: string[]; onChange: (v: string[]) => void
}) {
  const toggle = (v: string) => onChange(selected.includes(v) ? selected.filter(x => x !== v) : [...selected, v])
  return (
    <div className="sm:col-span-2">
      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">{label}</label>
      <div className="flex flex-wrap gap-1.5">
        {options.map(opt => (
          <button key={opt} type="button" onClick={() => toggle(opt)}
            className={`px-2.5 py-1 rounded-full text-xs font-semibold border transition-all ${
              selected.includes(opt)
                ? 'bg-primary text-white border-primary'
                : 'bg-white text-gray-600 border-gray-200 hover:border-primary/40'
            }`}
          >{opt}</button>
        ))}
      </div>
    </div>
  )
}

function SingleDropdown({ label, options, value, onChange, placeholder = 'Select...' }: {
  label: string; options: string[]; value: string; onChange: (v: string) => void; placeholder?: string
}) {
  return (
    <div>
      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">{label}</label>
      <select value={value || ''} onChange={e => onChange(e.target.value)} className="input-glass text-sm py-2.5">
        <option value="">{placeholder}</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  )
}

function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center gap-3">
      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">{label}</label>
      <button type="button" onClick={() => onChange(!value)}
        className={`w-10 h-6 rounded-full transition-all ${value ? 'bg-emerald-400' : 'bg-gray-300'}`}
      >
        <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform mx-0.5 ${value ? 'translate-x-4' : 'translate-x-0'}`} />
      </button>
      <span className="text-xs text-gray-600">{value ? 'Yes' : 'No'}</span>
    </div>
  )
}

export default function AdminScholarshipsPage() {
  const [scholarships, setScholarships] = useState<Scholarship[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<Partial<Scholarship>>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [bulkDeleting, setBulkDeleting] = useState(false)
  const [bulkDeleteConfirmOpen, setBulkDeleteConfirmOpen] = useState(false)

  const loadScholarships = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/admin/scholarships')
    const data = await res.json()
    setScholarships(data.scholarships || [])
    setLoading(false)
  }, [])

  useEffect(() => { loadScholarships() }, [loadScholarships])

  const filtered = scholarships.filter(s => {
    const matchSearch = !searchQuery ||
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.provider || '').toLowerCase().includes(searchQuery.toLowerCase())
    const matchCat = !categoryFilter || s.category === categoryFilter
    const matchStatus = !statusFilter || (statusFilter === 'active' ? s.is_active : !s.is_active)
    return matchSearch && matchCat && matchStatus
  })

  const openAdd = () => { setEditingId(null); setForm(EMPTY_FORM); setModalOpen(true) }
  const openEdit = (s: Scholarship) => { setEditingId(s.id); setForm({ ...s, tags: s.tags || [] }); setModalOpen(true) }

  const handleSave = async () => {
    if (!form.title) { toast.error('Title is required'); return }
    setSaving(true)
    try {
      const method = editingId ? 'PUT' : 'POST'
      const url = editingId ? `/api/admin/scholarships/${editingId}` : '/api/admin/scholarships'
      const res = await fetch(url, {
        method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error()
      toast.success(editingId ? 'Scholarship updated!' : 'Scholarship added!')
      setModalOpen(false)
      loadScholarships()
    } catch { toast.error('Failed to save scholarship') }
    finally { setSaving(false) }
  }

  const handleDelete = async (id: string) => {
    setDeleting(true)
    try {
      const res = await fetch(`/api/admin/scholarships/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      toast.success('Deleted successfully')
      setDeleteId(null)
      loadScholarships()
    } catch { toast.error('Failed to delete') }
    finally { setDeleting(false) }
  }

  const handleToggleActive = async (s: Scholarship) => {
    await fetch(`/api/admin/scholarships/${s.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: !s.is_active }),
    })
    toast.success(`Scholarship ${s.is_active ? 'deactivated' : 'activated'}`)
    loadScholarships()
  }

  const handleBulkDelete = async () => {
    setBulkDeleting(true)
    try {
      await Promise.all(Array.from(selectedIds).map(id => fetch(`/api/admin/scholarships/${id}`, { method: 'DELETE' })))
      toast.success(`${selectedIds.size} scholarships deleted`)
      setSelectedIds(new Set())
      setBulkDeleteConfirmOpen(false)
      loadScholarships()
    } catch { toast.error('Bulk delete failed') }
    finally { setBulkDeleting(false) }
  }

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => { const next = new Set(prev); if (next.has(id)) next.delete(id); else next.add(id); return next })
  }
  const toggleAll = () => {
    if (selectedIds.size === filtered.length) setSelectedIds(new Set())
    else setSelectedIds(new Set(filtered.map(s => s.id)))
  }

  const setField = (key: keyof Scholarship, value: unknown) => setForm(f => ({ ...f, [key]: value }))
  const arr = (v: string[] | null | undefined) => v || []

  return (
    <>
      <Toaster position="top-right" />
      <div className="p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">Scholarships</h1>
            <p className="text-sm text-gray-500">{scholarships.length} total scholarships</p>
          </div>
          <button onClick={openAdd} className="btn-primary gap-2" id="add-scholarship-btn">
            <Plus size={16} /> Add Scholarship
          </button>
        </div>

        {/* Filters */}
        <div className="glass-card p-4 flex flex-wrap gap-3 mb-5">
          <div className="flex items-center gap-2 bg-white/60 rounded-xl px-3 py-2 flex-1 min-w-48">
            <Search size={15} className="text-gray-400" />
            <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search scholarships..." className="bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400 w-full" />
          </div>
          <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="input-glass py-2 w-36 text-sm">
            <option value="">All Categories</option>
            {ALL_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="input-glass py-2 w-32 text-sm">
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          {selectedIds.size > 0 && (
            <button onClick={() => setBulkDeleteConfirmOpen(true)} disabled={bulkDeleting} className="btn-danger gap-2 text-sm px-4">
              <Trash2 size={14} /> Delete {selectedIds.size} Selected
            </button>
          )}
        </div>

        {/* Table */}
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50/60 border-b border-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left w-10">
                    <button onClick={toggleAll} className="text-gray-400">
                      {selectedIds.size === filtered.length && filtered.length > 0 ? <CheckSquare size={16} /> : <Square size={16} />}
                    </button>
                  </th>
                  {['Title', 'Type', 'Provider', 'Amount', 'Deadline', 'Status', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left font-bold text-gray-600 text-xs uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  <tr><td colSpan={8} className="text-center py-12 text-gray-400">Loading...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={8} className="text-center py-12 text-gray-400">No scholarships found</td></tr>
                ) : filtered.map(s => (
                  <tr key={s.id} className={`hover:bg-white/40 transition-colors ${selectedIds.has(s.id) ? 'bg-blue-50/40' : ''}`}>
                    <td className="px-4 py-3">
                      <button onClick={() => toggleSelect(s.id)} className="text-gray-400">
                        {selectedIds.has(s.id) ? <CheckSquare size={16} className="text-primary" /> : <Square size={16} />}
                      </button>
                    </td>
                    <td className="px-4 py-3 max-w-48"><p className="font-semibold text-gray-900 truncate">{s.title}</p></td>
                    <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">{s.scholarship_type || s.category || '—'}</td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{s.provider || '—'}</td>
                    <td className="px-4 py-3 font-bold text-gray-800 whitespace-nowrap">{formatAmount(s.amount, s.currency)}</td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{formatDeadline(s.deadline)}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => handleToggleActive(s)}
                        className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full transition-all ${
                          s.is_active ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                        }`}
                      >
                        {s.is_active ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                        {s.is_active ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => openEdit(s)} className="p-1.5 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-all">
                          <Edit2 size={14} />
                        </button>
                        <button onClick={() => setDeleteId(s.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="glass-card p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto animate-scale-in" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-gray-900 text-lg">{editingId ? 'Edit Scholarship' : 'Add New Scholarship'}</h2>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>

            {/* SECTION 1: Basic Info */}
            <FormSection title="📋 Basic Information" defaultOpen>
              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Title *</label>
                <input value={form.title || ''} onChange={e => setField('title', e.target.value)} className="input-glass" placeholder="Scholarship title" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Provider / Organization</label>
                <input value={form.provider || ''} onChange={e => setField('provider', e.target.value)} className="input-glass" placeholder="e.g. Ministry of Education" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Old Category</label>
                <select value={form.category || 'Merit'} onChange={e => setField('category', e.target.value)} className="input-glass">
                  {ALL_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Amount (₹)</label>
                <input type="number" value={form.amount || ''} onChange={e => setField('amount', parseFloat(e.target.value))} className="input-glass" placeholder="120000" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Deadline</label>
                <input type="date" value={form.deadline || ''} onChange={e => setField('deadline', e.target.value)} className="input-glass" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Application Link</label>
                <input value={form.application_link || ''} onChange={e => setField('application_link', e.target.value)} className="input-glass" placeholder="https://..." />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Min Marks %</label>
                <input type="number" min="0" max="100" value={form.min_marks_percentage || ''} onChange={e => setField('min_marks_percentage', parseFloat(e.target.value))} className="input-glass" placeholder="60" />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Description</label>
                <textarea value={form.description || ''} onChange={e => setField('description', e.target.value)} className="input-glass resize-none" rows={3} placeholder="Scholarship description..." />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Eligibility Criteria</label>
                <textarea value={form.eligibility_criteria || ''} onChange={e => setField('eligibility_criteria', e.target.value)} className="input-glass resize-none" rows={3} placeholder="Who can apply?" />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Tags (comma-separated)</label>
                <input value={arr(form.tags).join(', ')} onChange={e => setField('tags', e.target.value.split(',').map(t => t.trim()).filter(Boolean))} className="input-glass" placeholder="NSP, merit, girls" />
              </div>
              <div className="sm:col-span-2">
                <Toggle label="Active" value={!!form.is_active} onChange={v => setField('is_active', v)} />
              </div>
            </FormSection>

            {/* SECTION 2: Student Eligibility */}
            <FormSection title="🎓 Student Eligibility Filters">
              <MultiCheckbox label="Academic Levels" options={ACADEMIC_LEVELS} selected={arr(form.academic_levels)} onChange={v => setField('academic_levels', v)} />
              <MultiCheckbox label="Course / Streams" options={STREAMS} selected={arr(form.streams)} onChange={v => setField('streams', v)} />
              <SingleDropdown label="Gender Eligibility" options={['All', ...GENDERS]} value={form.gender_eligibility || 'All'} onChange={v => setField('gender_eligibility', v)} />
              <SingleDropdown label="Annual Income Range" options={INCOME_BRACKETS} value={form.income_range || ''} onChange={v => setField('income_range', v)} placeholder="Any income" />
              <SingleDropdown label="Scholarship Type" options={SCHOLARSHIP_TYPES} value={form.scholarship_type || ''} onChange={v => setField('scholarship_type', v)} placeholder="Select type..." />
              <SingleDropdown label="State / UT (if state-specific)" options={INDIAN_STATES_UTS} value={form.state || ''} onChange={v => setField('state', v)} placeholder="Pan-India (no state)" />
            </FormSection>

            {/* SECTION 3: Advanced Criteria */}
            <FormSection title="🏷️ Advanced Eligibility Criteria">
              <MultiCheckbox label="Caste Categories Eligible" options={CASTE_CATEGORIES.map(c => c.value)} selected={arr(form.caste_categories)} onChange={v => setField('caste_categories', v)} />
              <MultiCheckbox label="Religion / Minority (leave empty for all)" options={RELIGIONS} selected={form.religion && form.religion !== 'Any' ? [form.religion] : []} onChange={v => setField('religion', v.length > 0 ? v[v.length - 1] : 'Any')} />
              <MultiCheckbox label="Special Family Background" options={SPECIAL_BACKGROUNDS} selected={arr(form.special_backgrounds)} onChange={v => setField('special_backgrounds', v)} />
              <div className="sm:col-span-2 flex flex-wrap gap-6">
                <Toggle label="Girls Only" value={!!form.girls_only} onChange={v => setField('girls_only', v)} />
                <Toggle label="Disability Required (PwD)" value={!!form.disability_required} onChange={v => setField('disability_required', v)} />
              </div>
            </FormSection>

            {/* SECTION 4: Academic Requirements */}
            <FormSection title="📊 Academic Requirements">
              <SingleDropdown label="Min. Class 12 / Last Exam Performance" options={ACADEMIC_PERFORMANCE_OPTIONS} value={form.min_academic_performance || ''} onChange={v => setField('min_academic_performance', v)} placeholder="Any percentage" />
              <SingleDropdown label="Award Amount Range" options={AWARD_AMOUNT_RANGES} value={form.award_amount_range || ''} onChange={v => setField('award_amount_range', v)} placeholder="Select range..." />
              <SingleDropdown label="Application Status" options={APPLICATION_STATUSES} value={form.application_status || 'Open'} onChange={v => setField('application_status', v)} />
              <SingleDropdown label="Application Type" options={APPLICATION_TYPES} value={form.application_type || 'Both'} onChange={v => setField('application_type', v)} />
              <SingleDropdown label="Min. College Performance (for 2nd year+)" options={COLLEGE_PERFORMANCE_OPTIONS} value={form.min_college_performance || ''} onChange={v => setField('min_college_performance', v)} placeholder="Any / Not applicable" />
              <SingleDropdown label="Year of Study (if specific)" options={YEARS_OF_STUDY} value={form.year_of_study || ''} onChange={v => setField('year_of_study', v)} placeholder="Any year" />
            </FormSection>

            {/* SECTION 5: Study Details */}
            <FormSection title="🏫 Study & Institution Details">
              <MultiCheckbox label="Portal / Source" options={PORTAL_SOURCES} selected={arr(form.portal_source)} onChange={v => setField('portal_source', v)} />
              <MultiCheckbox label="Course Specializations" options={Object.values(COURSE_SPECIALIZATIONS).flat()} selected={arr(form.course_specializations)} onChange={v => setField('course_specializations', v)} />
              <MultiCheckbox label="Institution Types" options={INSTITUTION_TYPES} selected={arr(form.institution_types)} onChange={v => setField('institution_types', v)} />
              <SingleDropdown label="Study Mode" options={STUDY_MODES.map(m => m.value)} value={form.study_mode || 'Any'} onChange={v => setField('study_mode', v)} />
              <SingleDropdown label="Geographic Focus" options={GEOGRAPHIC_FOCUSES} value={form.geographic_focus || 'Both'} onChange={v => setField('geographic_focus', v)} />
            </FormSection>

            <div className="flex gap-3 mt-2">
              <button onClick={handleSave} disabled={saving} className="btn-primary flex-1 justify-center py-2.5">
                {saving ? 'Saving...' : <><Save size={15} /> Save Scholarship</>}
              </button>
              <button onClick={() => setModalOpen(false)} className="btn-ghost px-4 py-2.5">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal (Single) */}
      {deleteId && (
        <div className="modal-overlay" style={{ zIndex: 100 }}>
          <div className="glass-card p-8 w-full max-w-sm animate-scale-in text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 rounded-bl-full -mr-12 -mt-12" />
            
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Trash2 size={32} />
            </div>
            
            <h2 className="text-xl font-extrabold text-gray-900 mb-2">Delete Scholarship?</h2>
            <p className="text-sm text-gray-500 font-medium mb-8">
              Are you sure? This action is permanent and cannot be undone.
            </p>
            
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="btn-ghost flex-1 justify-center py-3 font-bold">
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
                disabled={deleting}
                className="bg-red-500 hover:bg-red-600 text-white rounded-xl flex-1 py-3 font-black transition-all shadow-lg shadow-red-500/20 active:scale-95 flex items-center justify-center"
              >
                {deleting ? 'Deleting...' : 'Delete Now'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Delete Confirmation Modal */}
      {bulkDeleteConfirmOpen && (
        <div className="modal-overlay" style={{ zIndex: 100 }}>
          <div className="glass-card p-8 w-full max-w-sm animate-scale-in text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 rounded-bl-full -mr-12 -mt-12" />
            
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Trash2 size={32} />
            </div>
            
            <h2 className="text-xl font-extrabold text-gray-900 mb-2">Bulk Delete?</h2>
            <p className="text-sm text-gray-500 font-medium mb-8">
              You are about to delete <span className="text-red-500 font-bold">{selectedIds.size}</span> scholarships. This cannot be undone!
            </p>
            
            <div className="flex gap-3">
              <button onClick={() => setBulkDeleteConfirmOpen(false)} className="btn-ghost flex-1 justify-center py-3 font-bold">
                Cancel
              </button>
              <button
                onClick={handleBulkDelete}
                disabled={bulkDeleting}
                className="bg-red-500 hover:bg-red-600 text-white rounded-xl flex-1 py-3 font-black transition-all shadow-lg shadow-red-500/20 active:scale-95 flex items-center justify-center"
              >
                {bulkDeleting ? 'Deleting...' : 'Delete All'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
