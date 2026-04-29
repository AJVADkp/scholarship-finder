'use client'

import { useState } from 'react'
import { Save, Lock, User, Eye, EyeOff, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { Toaster } from 'react-hot-toast'

export default function AdminSettingsPage() {
  const [username, setUsername] = useState('')
  const [savingUsername, setSavingUsername] = useState(false)

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [savingPassword, setSavingPassword] = useState(false)
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)

  const handleSaveUsername = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username.trim()) { toast.error('Username cannot be empty'); return }
    setSavingUsername(true)
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'username', username }),
      })
      if (!res.ok) { const d = await res.json(); throw new Error(d.error) }
      toast.success('Username updated successfully!')
      setUsername('')
    } catch (err: any) {
      toast.error(err.message || 'Failed to update username')
    } finally {
      setSavingUsername(false)
    }
  }

  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) { toast.error('New passwords do not match'); return }
    if (newPassword.length < 6) { toast.error('Password must be at least 6 characters'); return }
    setSavingPassword(true)
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'password', current_password: currentPassword, new_password: newPassword }),
      })
      if (!res.ok) { const d = await res.json(); throw new Error(d.error) }
      toast.success('Password updated successfully!')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err: any) {
      toast.error(err.message || 'Failed to update password')
    } finally {
      setSavingPassword(false)
    }
  }

  return (
    <>
      <Toaster position="top-right" />
      <div className="p-6 lg:p-8 max-w-2xl">
        <div className="mb-8">
          <h1 className="text-2xl font-extrabold text-gray-900">Admin Settings</h1>
          <p className="text-sm text-gray-500">Manage your admin credentials</p>
        </div>

        {/* Change Username */}
        <div className="glass-card p-6 mb-6">
          <h2 className="font-bold text-gray-900 text-lg mb-1 flex items-center gap-2">
            <User size={18} className="text-primary" /> Change Username
          </h2>
          <p className="text-sm text-gray-400 mb-5">Update the admin login username</p>

          <form onSubmit={handleSaveUsername} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">New Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="input-glass"
                placeholder="Enter new username"
                id="new-username"
              />
            </div>
            <button type="submit" disabled={savingUsername || !username} className="btn-primary gap-2 px-6 py-2.5">
              {savingUsername ? 'Saving...' : <><Save size={15} /> Update Username</>}
            </button>
          </form>
        </div>

        {/* Change Password */}
        <div className="glass-card p-6">
          <h2 className="font-bold text-gray-900 text-lg mb-1 flex items-center gap-2">
            <Lock size={18} className="text-primary" /> Change Password
          </h2>
          <p className="text-sm text-gray-400 mb-5">Update the admin login password</p>

          <form onSubmit={handleSavePassword} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Current Password</label>
              <div className="relative">
                <input
                  type={showCurrent ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="input-glass pr-10"
                  placeholder="••••••••"
                  id="current-password"
                  required
                />
                <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showCurrent ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">New Password</label>
              <div className="relative">
                <input
                  type={showNew ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="input-glass pr-10"
                  placeholder="Minimum 6 characters"
                  id="new-password"
                  required
                />
                <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Confirm New Password</label>
              <div className="relative">
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="input-glass pr-10"
                  placeholder="Repeat new password"
                  id="confirm-password"
                  required
                />
                {confirmPassword && newPassword === confirmPassword && (
                  <CheckCircle size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500" />
                )}
              </div>
            </div>
            <button
              type="submit"
              disabled={savingPassword || !currentPassword || !newPassword || !confirmPassword}
              className="btn-primary gap-2 px-6 py-2.5"
            >
              {savingPassword ? 'Updating...' : <><Save size={15} /> Update Password</>}
            </button>
          </form>
        </div>
      </div>
    </>
  )
}
