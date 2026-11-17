'use client'

import { X, Save, GraduationCap } from 'lucide-react'

interface EditBasicInfoModalProps {
  isOpen: boolean
  onClose: () => void
  name: string
  setName: (v: string) => void
  phone: string
  setPhone: (v: string) => void
  dob: string
  setDob: (v: string) => void
  onSave: () => void
  saving: boolean
  onViewAcademicProfile?: () => void
}

export function EditBasicInfoModal({
  isOpen,
  onClose,
  name,
  setName,
  phone,
  setPhone,
  dob,
  setDob,
  onSave,
  saving,
  onViewAcademicProfile,
}: EditBasicInfoModalProps) {
  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="glass-card p-8 w-full max-w-md animate-scale-in relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Background Accent */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -mr-16 -mt-16" />

        <div className="flex items-center justify-between mb-6 relative">
          <div>
            <h2 className="font-black text-gray-900 text-xl">Basic Information</h2>
            <p className="text-xs text-gray-500 font-medium">Keep your contact details up to date.</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          >
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        <div className="space-y-5 relative">
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-glass py-3 focus:border-primary/50 transition-colors"
              placeholder="e.g. Rahul Sharma"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">
              Phone Number
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="input-glass py-3 focus:border-primary/50 transition-colors"
              placeholder="+91 98765 43210"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">
              Date of Birth
            </label>
            <input
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              className="input-glass py-3 focus:border-primary/50 transition-colors"
            />
          </div>

          {onViewAcademicProfile && (
            <button
              onClick={onViewAcademicProfile}
              className="w-full py-4 px-4 rounded-xl border border-dashed border-primary/40 text-primary text-sm font-black bg-primary/[0.02] hover:bg-gray-100 hover:text-gray-900 hover:scale-[1.02] hover:border-gray-400 hover:shadow-md transition-all duration-300 flex items-center justify-center gap-3 active:scale-95 group"
            >
              <GraduationCap size={18} className="group-hover:rotate-12 transition-transform" />
              Edit / View Academic Profile
            </button>
          )}
        </div>

        <div className="flex gap-3 mt-8 relative">
          <button
            onClick={onClose}
            className="btn-ghost flex-1 justify-center py-3 font-bold hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            disabled={saving}
            className="btn-primary flex-1 justify-center py-3 font-black shadow-lg shadow-primary/20"
          >
            {saving ? 'Saving...' : <><Save size={18} /> Save Info</>}
          </button>
        </div>
      </div>
    </div>
  )
}
