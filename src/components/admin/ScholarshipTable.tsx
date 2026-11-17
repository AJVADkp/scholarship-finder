'use client'

import { type Scholarship } from '@/lib/types'
import { formatAmount, formatDeadline } from '@/lib/utils'
import { Edit2, Trash2, ToggleLeft, ToggleRight, CheckSquare, Square } from 'lucide-react'

interface ScholarshipTableProps {
  scholarships: Scholarship[]
  selectedIds: Set<string>
  toggleSelect: (id: string) => void
  toggleAll: () => void
  openEdit: (s: Scholarship) => void
  setDeleteId: (id: string) => void
  handleToggleActive: (s: Scholarship) => void
}

export function ScholarshipTable({
  scholarships,
  selectedIds,
  toggleSelect,
  toggleAll,
  openEdit,
  setDeleteId,
  handleToggleActive,
}: ScholarshipTableProps) {
  return (
    <div className="glass-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50/80 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100">
            <tr>
              <th className="p-4 w-10">
                <button onClick={toggleAll} className="text-gray-400 hover:text-gray-600">
                  {selectedIds.size === scholarships.length && scholarships.length > 0 ? (
                    <CheckSquare size={16} className="text-primary" />
                  ) : (
                    <Square size={16} />
                  )}
                </button>
              </th>
              <th className="p-4">Title & Provider</th>
              <th className="p-4">Category</th>
              <th className="p-4">Amount</th>
              <th className="p-4">Deadline</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {scholarships.map((s) => (
              <tr key={s.id} className="hover:bg-gray-50/60 transition-colors">
                <td className="p-4">
                  <button onClick={() => toggleSelect(s.id)} className="text-gray-400">
                    {selectedIds.has(s.id) ? (
                      <CheckSquare size={16} className="text-primary" />
                    ) : (
                      <Square size={16} />
                    )}
                  </button>
                </td>
                <td className="p-4">
                  <p className="font-bold text-gray-900 leading-snug">{s.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{s.provider || 'No provider'}</p>
                </td>
                <td className="p-4">
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700">
                    {s.category || 'General'}
                  </span>
                </td>
                <td className="p-4 font-bold text-gray-800">
                  {formatAmount(s.amount, s.currency)}
                </td>
                <td className="p-4 text-xs text-gray-500">{formatDeadline(s.deadline)}</td>
                <td className="p-4">
                  <button
                    onClick={() => handleToggleActive(s)}
                    className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
                  >
                    {s.is_active ? (
                      <>
                        <ToggleRight size={20} className="text-emerald-500" />
                        <span className="text-emerald-700">Active</span>
                      </>
                    ) : (
                      <>
                        <ToggleLeft size={20} className="text-gray-400" />
                        <span className="text-gray-500">Inactive</span>
                      </>
                    )}
                  </button>
                </td>
                <td className="p-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => openEdit(s)}
                      className="p-1.5 text-gray-400 hover:text-primary rounded-lg hover:bg-gray-100"
                    >
                      <Edit2 size={15} />
                    </button>
                    <button
                      onClick={() => setDeleteId(s.id)}
                      className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
