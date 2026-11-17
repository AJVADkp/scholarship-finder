'use client'

import { useState, useEffect } from 'react'
import { Search, Eye, Trash2, X } from 'lucide-react'
import toast from 'react-hot-toast'
import type { UserProfile } from '@/lib/types'
import { format } from 'date-fns'

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const [viewUser, setViewUser] = useState<UserProfile | null>(null)

  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const refreshUsers = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/users')
      const data = await res.json()
      setUsers(data.users || [])
    } catch (err) {
      console.error('[AdminUsers] Load failed:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let ignore = false
    const fetchUsers = async () => {
      try {
        const res = await fetch('/api/admin/users')
        const data = await res.json()
        if (!ignore) {
          setUsers(data.users || [])
        }
      } catch (err) {
        console.error('[AdminUsers] Load failed:', err)
      } finally {
        if (!ignore) setLoading(false)
      }
    }
    fetchUsers()
    return () => {
      ignore = true
    }
  }, [])

  const filtered = users.filter((u) => {
    if (!search) return true
    return (
      (u.full_name || '').toLowerCase().includes(search.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(search.toLowerCase()) ||
      (u.academic_level || '').toLowerCase().includes(search.toLowerCase())
    )
  })


  const handleDelete = async (id: string) => {
    setDeleting(true)
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      toast.success('User deleted')
      setDeleteId(null)
      await refreshUsers()
    } catch {
      toast.error('Failed to delete user')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <>
      <div className="p-6 lg:p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-extrabold text-gray-900">Students</h1>
          <p className="text-sm text-gray-500">{users.length} registered students</p>
        </div>

        {/* Search */}
        <div className="glass-card p-4 flex gap-3 mb-5">
          <div className="flex items-center gap-2 bg-white/60 rounded-xl px-3 py-2 flex-1">
            <Search size={15} className="text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, or academic level..."
              className="bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400 w-full"
            />
          </div>
        </div>

        {/* Table */}
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50/60 border-b border-gray-100">
                <tr>
                  {['User', 'Academic Level', 'Stream', 'Income', 'Location', 'Actions'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left font-bold text-gray-600 text-xs uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  <tr><td colSpan={6} className="text-center py-12 text-gray-400">Loading...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-12 text-gray-400">No students found</td></tr>
                ) : filtered.map((u) => (
                  <tr key={u.id} className="hover:bg-white/40 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {u.avatar_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={u.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-blue-400 flex items-center justify-center text-white text-xs font-bold">
                            {(u.full_name || u.email || 'U')[0].toUpperCase()}
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-gray-900 max-w-36 truncate">{u.full_name || 'N/A'}</p>
                          <p className="text-[10px] text-gray-400 truncate max-w-36">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-700 font-medium whitespace-nowrap">{u.academic_level || '—'}</td>
                    <td className="px-4 py-3 text-gray-500 max-w-36 truncate">{u.stream || '—'}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {u.annual_income ? (
                        <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-100">
                          {u.annual_income}
                        </span>
                      ) : <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{u.state || '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => setViewUser(u)} className="p-1.5 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-all">
                          <Eye size={14} />
                        </button>
                        <button onClick={() => setDeleteId(u.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all">
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

      {/* View User Modal */}
      {viewUser && (
        <div className="modal-overlay" onClick={() => setViewUser(null)}>
          <div className="glass-card p-0 w-full max-w-2xl max-h-[90vh] overflow-hidden animate-scale-in flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
              <div className="flex items-center gap-4">
                {viewUser.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={viewUser.avatar_url} alt="" className="w-14 h-14 rounded-2xl object-cover border-2 border-white shadow-sm" />
                ) : (
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-400 to-blue-400 flex items-center justify-center text-white text-xl font-bold border-2 border-white shadow-sm">
                    {(viewUser.full_name || 'U')[0]}
                  </div>
                )}
                <div>
                  <h2 className="font-extrabold text-gray-900 text-lg leading-tight">{viewUser.full_name || 'Anonymous Student'}</h2>
                  <p className="text-xs text-gray-400">{viewUser.email}</p>
                </div>
              </div>
              <button onClick={() => setViewUser(null)} className="p-2 hover:bg-white rounded-full text-gray-400 transition-colors"><X size={20} /></button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-8">
              {/* Basic Info Section */}
              <div>
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Basic Information</h3>
                <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-sm">
                  {[
                    ['Phone Number', viewUser.phone || '—'],
                    ['Date of Birth', viewUser.dob ? format(new Date(viewUser.dob), 'dd MMM yyyy') : '—'],
                    ['Gender', viewUser.gender || '—'],
                    ['Location (State)', viewUser.state || '—'],
                    ['Religion', viewUser.religion || '—'],
                    ['Caste Category', viewUser.caste_category || '—'],
                  ].map(([label, value]) => (
                    <div key={label} className="border-b border-gray-50 pb-2">
                      <p className="text-gray-400 text-[10px] font-bold mb-0.5">{label}</p>
                      <p className="text-gray-900 font-semibold">{value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Academic Info Section */}
              <div>
                <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-4">Academic Background</h3>
                <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-sm">
                  {[
                    ['Academic Level', viewUser.academic_level || '—'],
                    ['Stream', viewUser.stream || '—'],
                    ['Specialization', viewUser.course_specialization || '—'],
                    ['Current Year', viewUser.year_of_study || '—'],
                    ['Institution Type', viewUser.institution_type || '—'],
                    ['Study Mode', viewUser.study_mode || '—'],
                    ['Entrance Exam', viewUser.entrance_exam || '—'],
                  ].map(([label, value]) => (
                    <div key={label} className="border-b border-gray-50 pb-2">
                      <p className="text-gray-400 text-[10px] font-bold mb-0.5">{label}</p>
                      <p className="text-gray-900 font-semibold">{value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Performance Section */}
              <div>
                <h3 className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] mb-4">Academic Performance</h3>
                <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-sm">
                  {[
                    ['Class 10th', viewUser.class_10_percentage ? `${viewUser.class_10_percentage}%` : '—'],
                    ['Class 12th', viewUser.class_12_percentage ? `${viewUser.class_12_percentage}%` : '—'],
                    ['College Marks', viewUser.college_marks_value ? `${viewUser.college_marks_value} (${viewUser.college_marks_type || 'CGPA'})` : '—'],
                  ].map(([label, value]) => (
                    <div key={label} className="border-b border-gray-50 pb-2">
                      <p className="text-gray-400 text-[10px] font-bold mb-0.5">{label}</p>
                      <p className="text-gray-900 font-semibold">{value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Background Section */}
              <div>
                <h3 className="text-[10px] font-black text-amber-500 uppercase tracking-[0.2em] mb-4">Financial & Background</h3>
                <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-sm">
                  {[
                    ['Annual Income', viewUser.annual_income || '—'],
                    ['Disability Status', viewUser.disability_status || '—'],
                    ['Special Background', viewUser.special_background || '—'],
                  ].map(([label, value]) => (
                    <div key={label} className="border-b border-gray-50 pb-2">
                      <p className="text-gray-400 text-[10px] font-bold mb-0.5">{label}</p>
                      <p className="text-gray-900 font-semibold">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-gray-50 border-t border-gray-100 text-center">
              <p className="text-[10px] text-gray-400 font-medium">Student Joined: {viewUser.created_at ? format(new Date(viewUser.created_at), 'dd MMMM yyyy, HH:mm') : '—'}</p>
            </div>
          </div>
        </div>
      )}


      {/* Delete confirm */}
      {deleteId && (
        <div className="modal-overlay" style={{ zIndex: 100 }}>
          <div className="glass-card p-8 w-full max-w-sm animate-scale-in text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 rounded-bl-full -mr-12 -mt-12" />
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Trash2 size={32} />
            </div>
            <h3 className="text-xl font-extrabold text-gray-900 mb-2">Delete Student?</h3>
            <p className="text-sm text-gray-500 font-medium mb-8">This will permanently remove the student account. This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="btn-ghost flex-1 justify-center py-3 font-bold">Cancel</button>
              <button onClick={() => handleDelete(deleteId)} disabled={deleting} className="bg-red-500 hover:bg-red-600 text-white rounded-xl flex-1 py-3 font-black transition-all shadow-lg shadow-red-500/20 active:scale-95 flex items-center justify-center">
                {deleting ? 'Deleting...' : 'Delete Now'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
