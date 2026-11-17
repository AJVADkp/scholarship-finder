'use client'

import { useState, useEffect, useCallback } from 'react'
import { type Scholarship, ALL_CATEGORIES } from '@/lib/types'
import { Plus, Search, Trash2, ChevronLeft, ChevronRight } from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'
import { ScholarshipFormModal, EMPTY_FORM } from '@/components/admin/ScholarshipFormModal'
import { ScholarshipTable } from '@/components/admin/ScholarshipTable'

const ADMIN_ITEMS_PER_PAGE = 50

export default function AdminScholarshipsPage() {
  const [scholarships, setScholarships] = useState<Scholarship[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<Partial<Scholarship>>(EMPTY_FORM)

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [bulkDeleting, setBulkDeleting] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [adminPage, setAdminPage] = useState(1)

  const loadScholarships = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/scholarships')
      const data = await res.json()
      if (data.scholarships) setScholarships(data.scholarships)
    } catch {
      toast.error('Failed to load scholarships')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadScholarships()
  }, [loadScholarships])

  const filtered = scholarships.filter(s => {
    const matchSearch =
      !searchQuery ||
      s.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.provider?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchCat = !categoryFilter || s.category === categoryFilter
    const matchStatus =
      !statusFilter ||
      (statusFilter === 'active' && s.is_active) ||
      (statusFilter === 'inactive' && !s.is_active)
    return matchSearch && matchCat && matchStatus
  })

  const totalAdminPages = Math.ceil(filtered.length / ADMIN_ITEMS_PER_PAGE)
  const paginatedScholarships = filtered.slice(
    (adminPage - 1) * ADMIN_ITEMS_PER_PAGE,
    adminPage * ADMIN_ITEMS_PER_PAGE
  )

  const openAdd = () => {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setModalOpen(true)
  }

  const openEdit = (s: Scholarship) => {
    setEditingId(s.id)
    setForm({ ...s, tags: s.tags || [] })
    setModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/scholarships/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      toast.success('Deleted successfully')
      setDeleteId(null)
      loadScholarships()
    } catch {
      toast.error('Failed to delete')
    }
  }

  const handleBulkDelete = async () => {
    setBulkDeleting(true)
    try {
      await Promise.all(
        Array.from(selectedIds).map(id => fetch(`/api/admin/scholarships/${id}`, { method: 'DELETE' }))
      )
      toast.success(`${selectedIds.size} scholarships deleted`)
      setSelectedIds(new Set())
      loadScholarships()
    } catch {
      toast.error('Bulk delete failed')
    } finally {
      setBulkDeleting(false)
    }
  }

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleAll = () => {
    if (selectedIds.size === paginatedScholarships.length) setSelectedIds(new Set())
    else setSelectedIds(new Set(paginatedScholarships.map(s => s.id)))
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

  return (
    <>
      <Toaster position="top-right" />
      <div className="p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">Scholarships</h1>
            <p className="text-sm text-gray-500">
              {filtered.length} scholarships found (Page {adminPage} of {totalAdminPages || 1})
            </p>
          </div>
          <button onClick={openAdd} className="btn-primary gap-2" id="add-scholarship-btn">
            <Plus size={16} /> Add Scholarship
          </button>
        </div>

        {/* Filters */}
        <div className="glass-card p-4 flex flex-wrap gap-3 mb-5">
          <div className="flex items-center gap-2 bg-white/60 rounded-xl px-3 py-2 flex-1 min-w-48">
            <Search size={15} className="text-gray-400" />
            <input
              value={searchQuery}
              onChange={e => {
                setSearchQuery(e.target.value)
                setAdminPage(1)
              }}
              placeholder="Search scholarships..."
              className="bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400 w-full"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={e => {
              setCategoryFilter(e.target.value)
              setAdminPage(1)
            }}
            className="input-glass py-2 w-36 text-sm"
          >
            <option value="">All Categories</option>
            {ALL_CATEGORIES.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={e => {
              setStatusFilter(e.target.value)
              setAdminPage(1)
            }}
            className="input-glass py-2 w-32 text-sm"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          {selectedIds.size > 0 && (
            <button
              onClick={handleBulkDelete}
              disabled={bulkDeleting}
              className="btn-danger gap-2 text-sm px-4"
            >
              <Trash2 size={14} /> Delete {selectedIds.size} Selected
            </button>
          )}
        </div>

        {/* Data Table */}
        {loading ? (
          <div className="glass-card p-12 text-center text-gray-400">Loading scholarships...</div>
        ) : (
          <>
            <ScholarshipTable
              scholarships={paginatedScholarships}
              selectedIds={selectedIds}
              toggleSelect={toggleSelect}
              toggleAll={toggleAll}
              openEdit={openEdit}
              setDeleteId={setDeleteId}
              handleToggleActive={handleToggleActive}
            />

            {/* Pagination */}
            {totalAdminPages > 1 && (
              <div className="flex items-center justify-between mt-4 px-2">
                <span className="text-xs text-gray-500">
                  Page {adminPage} of {totalAdminPages}
                </span>
                <div className="flex gap-2">
                  <button
                    disabled={adminPage === 1}
                    onClick={() => setAdminPage(p => p - 1)}
                    className="btn-ghost p-2 text-gray-600 disabled:opacity-40"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    disabled={adminPage === totalAdminPages}
                    onClick={() => setAdminPage(p => p + 1)}
                    className="btn-ghost p-2 text-gray-600 disabled:opacity-40"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Modals */}
        <ScholarshipFormModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          editingId={editingId}
          form={form}
          setForm={setForm}
          onSaveSuccess={loadScholarships}
        />

        {/* Delete Confirmation */}
        {deleteId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <div className="glass-card bg-white p-6 w-full max-w-sm text-center">
              <h3 className="font-bold text-gray-900 mb-2">Delete Scholarship?</h3>
              <p className="text-sm text-gray-500 mb-6">
                Are you sure you want to permanently delete this listing?
              </p>
              <div className="flex justify-center gap-3">
                <button onClick={() => setDeleteId(null)} className="btn-ghost text-sm px-4">
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteId)}
                  className="btn-danger text-sm px-5"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
