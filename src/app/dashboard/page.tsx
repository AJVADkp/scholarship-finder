'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ScholarshipCard } from '@/components/scholarship/ScholarshipCard'
import { SkeletonCard } from '@/components/ui/SkeletonCard'
import type { Scholarship, UserProfile } from '@/lib/types'
import {
  User, Phone, Mail, Calendar, Upload, CheckCircle, Edit2, X, Save,
  GraduationCap, Sparkles, AlertCircle
} from 'lucide-react'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import type { User as AuthUser } from '@supabase/supabase-js'
import { ProfileForm } from '@/components/profile/ProfileForm'
import { checkIncomeMatch } from '@/lib/utils'

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<'recommendations' | 'profile'>('recommendations')
  const [authUser, setAuthUser] = useState<AuthUser | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [eligibleScholarships, setEligibleScholarships] = useState<Scholarship[]>([])
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set())
  const [loadingScholarships, setLoadingScholarships] = useState(false)

  // Edit basic info modal state
  const [editOpen, setEditOpen] = useState(false)
  const [editName, setEditName] = useState('')
  const [editPhone, setEditPhone] = useState('')
  const [editDob, setEditDob] = useState('')
  const [savingProfile, setSavingProfile] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    init()
  }, [])

  const init = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    setAuthUser(user)

    const { data: profileData } = await supabase.from('users').select('*').eq('id', user.id).single()
    if (profileData) {
      setProfile(profileData as UserProfile)
      setEditName(profileData.full_name || '')
      setEditPhone(profileData.phone || '+91 ')
      setEditDob(profileData.dob || '')
      loadEligibleScholarships(profileData as UserProfile, user.id)
    }

    const { data: savedData } = await supabase.from('saved_scholarships').select('scholarship_id').eq('user_id', user.id)
    if (savedData) setSavedIds(new Set(savedData.map((d: any) => d.scholarship_id)))
  }

  const loadEligibleScholarships = async (u: UserProfile, userId: string) => {
    setLoadingScholarships(true)
    try {
      const { data: allScholarships, error } = await supabase
        .from('scholarships')
        .select('*')
        .eq('is_active', true)

      if (error) throw error

      // ============================================
      // SMART SCORING ALGORITHM
      // Rules:
      // - null/empty field in scholarship = "open to all" = neutral/partial match
      // - Hard MISMATCH = 0 points for that dimension (scholarship stays but ranks low)
      // - Perfect match on a dimension = full points
      // - "Open to all" fields = partial points (still relevant, just not targeted)
      // ============================================
      const scored = (allScholarships as Scholarship[]).map(s => {
        let score = 0
        let totalPossible = 0

        // ── ACADEMIC LEVEL (weight: 25) ──
        if (u.academic_level) {
          totalPossible += 25
          if (!s.academic_levels || s.academic_levels.length === 0) {
            score += 12 // Open to all levels — partial credit
          } else if (s.academic_levels.includes(u.academic_level)) {
            score += 25 // Perfect match
          }
          // else 0 — wrong level, hard mismatch
        }

        // ── STREAM (weight: 20) ──
        if (u.stream) {
          totalPossible += 20
          if (!s.streams || s.streams.length === 0 || s.streams.includes('All')) {
            score += 10 // Open to all streams — partial credit
          } else if (s.streams.includes(u.stream)) {
            score += 20 // Perfect match
          }
          // else 0 — wrong stream
        }

        // ── MARKS (weight: 10) ──
        if (u.class_10_percentage) {
          totalPossible += 10
          if (!s.min_marks_percentage) {
            score += 7 // No marks requirement — partial credit
          } else if (u.class_10_percentage >= s.min_marks_percentage) {
            score += 10 // Meets requirement
          }
          // else 0 — doesn't meet marks requirement
        }

        // ── GENDER (weight: 15) ──
        if (u.gender) {
          totalPossible += 15
          const isGirlsOnly = s.girls_only || s.gender_eligibility === 'Female'
          const isNeutral = !s.gender_eligibility || s.gender_eligibility === 'All'

          if (u.gender === 'Male') {
            if (isGirlsOnly) {
              score += 0 // Hard exclusion — male user, female-only scholarship
            } else if (isNeutral) {
              score += 15 // Open to all — perfect for male
            } else {
              score += 15
            }
          } else if (u.gender === 'Female') {
            if (isGirlsOnly) {
              score += 15 // Targeted scholarship for female — bonus
            } else if (isNeutral) {
              score += 12 // Open to all — good
            } else {
              score += 15
            }
          }
        }

        // ── STATE (weight: 15) ──
        if (u.state) {
          totalPossible += 15
          if (!s.state || s.state === 'All India') {
            score += 8 // National scholarship — partial credit
          } else if (s.state.toLowerCase().includes(u.state.toLowerCase())) {
            score += 15 // State-specific match — perfect
          }
          // else 0 — scholarship for a different state
        }

        // ── INCOME (weight: 10) ──
        if (u.annual_income) {
          totalPossible += 10
          if (!s.income_range || s.income_range === 'Not specified') {
            score += 6 // No income restriction — partial credit
          } else if (checkIncomeMatch(u.annual_income, s.income_range)) {
            score += 10 // Income qualifies
          }
          // else 0 — income bracket mismatch
        }

        // ── CASTE (weight: 10) ──
        if (u.caste_category) {
          totalPossible += 10
          if (!s.caste_categories || s.caste_categories.length === 0) {
            score += 6 // Open to all castes — partial credit
          } else if (
            s.caste_categories.includes(u.caste_category) ||
            s.caste_categories.includes('General')
          ) {
            score += 10 // Perfect match
          }
          // else 0 — caste mismatch
        }

        // ── RELIGION (weight: 8) ──
        if (u.religion && u.religion !== 'Prefer not to say') {
          totalPossible += 8
          if (!s.religion || s.religion === 'Any') {
            score += 5 // No religion restriction — partial credit
          } else if (s.religion.includes(u.religion)) {
            score += 8 // Perfect match
          }
          // else 0 — religion mismatch
        }

        // ── DISABILITY (weight: 5) ──
        if (u.disability_status) {
          totalPossible += 5
          const isPwD = u.disability_status === 'Person with Disability (PwD) — 40%+'
          if (!s.disability_required) {
            // Non-PwD scholarship
            if (!isPwD) score += 5 // Non-PwD user, non-PwD scholarship — perfect
            else score += 3 // PwD user can still apply to general scholarships
          } else {
            // PwD-required scholarship
            if (isPwD) score += 5 // Perfect match for PwD user
            else score += 0 // Non-PwD user — should not be recommended
          }
        }

        const isPerfect = score >= totalPossible && totalPossible > 0
        return { ...s, _score: score, _totalPossible: totalPossible, _isPerfect: isPerfect }
      })

      // ── HARD EXCLUSION PASS ──
      // Remove scholarships that are definite mismatches regardless of score
      const eligible = scored.filter(s => {
        // Expired deadline: exclude if the deadline is in the past
        if (s.deadline) {
          const deadlineDate = new Date(s.deadline)
          const today = new Date()
          deadlineDate.setHours(23, 59, 59, 999) // End of the deadline day
          if (deadlineDate < today) return false
        }

        // Male users: never show female-only scholarships
        if (u.gender === 'Male' && (s.girls_only || s.gender_eligibility === 'Female')) return false
        
        // Non-PwD users: never show PwD-only scholarships
        if (u.disability_status === 'No disability' && s.disability_required) return false
        
        // Wrong state: never show state-specific scholarships for other states
        if (u.state && s.state && s.state !== 'All India' && !s.state.toLowerCase().includes(u.state.toLowerCase())) return false
        
        // Caste mismatch: if scholarship has specific castes and user's caste is not in them (and user isn't matching General if allowed)
        if (u.caste_category && s.caste_categories && s.caste_categories.length > 0) {
           if (!s.caste_categories.includes(u.caste_category) && !s.caste_categories.includes('General')) return false
        }

        // Religion mismatch: if scholarship has specific religion and user's religion doesn't match
        if (u.religion && u.religion !== 'Prefer not to say' && s.religion && s.religion !== 'Any') {
           if (!s.religion.includes(u.religion)) return false
        }

        return true
      })

      // ── SORT: by score (desc), then deadline (asc) ──
      const sorted = eligible.sort((a, b) => {
        if (b._score !== a._score) return b._score - a._score
        const dateA = a.deadline ? new Date(a.deadline).getTime() : Infinity
        const dateB = b.deadline ? new Date(b.deadline).getTime() : Infinity
        return dateA - dateB
      })

      // ── SELECTION: prefer perfect matches, guarantee minimum 10 ──
      const perfectMatches = sorted.filter(s => s._isPerfect)
      const finalSelection = perfectMatches.length >= 10
        ? perfectMatches
        : sorted.slice(0, Math.max(10, perfectMatches.length))

      setEligibleScholarships(finalSelection)
    } catch (err: any) {
      toast.error('Unable to load recommendations')
    } finally {
      setLoadingScholarships(false)
    }
  }

  const saveBasicInfo = async () => {
    if (!authUser) return
    setSavingProfile(true)
    try {
      const { error } = await supabase
        .from('users')
        .update({ 
          full_name: editName || null, 
          phone: editPhone || null,
          dob: editDob || null
        })
        .eq('id', authUser.id)

      if (error) throw error
      
      toast.success('Basic info updated!')
      setProfile((p) => p ? { ...p, full_name: editName, phone: editPhone, dob: editDob } : p)
      setEditOpen(false)
    } catch (err: any) {
      toast.error(err.message || 'Failed to save info')
    } finally {
      setSavingProfile(false)
    }
  }

  const joinedDate = profile?.created_at
    ? format(new Date(profile.created_at), 'MMMM yyyy')
    : 'N/A'

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header Profile Section */}
      <div className="glass-card p-6 mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="relative flex-shrink-0">
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt="Avatar"
                className="w-24 h-24 rounded-3xl object-cover border-4 border-white shadow-xl"
              />
            ) : (
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary to-blue-400 flex items-center justify-center text-white text-4xl font-black shadow-xl">
                {(profile?.full_name || authUser?.email || 'U')[0].toUpperCase()}
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-black text-gray-900 mb-1">
              Welcome back, {profile?.full_name?.split(' ')[0] || 'Scholar'}!
            </h1>
            <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-gray-500 font-medium">
              <span className="flex items-center gap-1.5"><Mail size={14} className="text-primary/60" /> {profile?.email}</span>
              {profile?.phone && <span className="flex items-center gap-1.5"><Phone size={14} className="text-primary/60" /> {profile.phone}</span>}
              <span className="flex items-center gap-1.5"><Calendar size={14} className="text-primary/60" /> Joined {joinedDate}</span>
            </div>
          </div>

          <div className="flex gap-3 w-full sm:w-auto">
            <button
              onClick={() => setEditOpen(true)}
              className="btn-ghost flex-1 sm:flex-initial gap-2 px-6"
            >
              <Edit2 size={16} /> Edit Profile
            </button>
          </div>
        </div>
      </div>

      {/* Edit Basic Info Modal */}
      {editOpen && (
        <div className="modal-overlay" onClick={() => setEditOpen(false)}>
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
              <button onClick={() => setEditOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
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
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
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
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
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
                  value={editDob}
                  onChange={(e) => setEditDob(e.target.value)}
                  className="input-glass py-3 focus:border-primary/50 transition-colors"
                />
              </div>

              {/* Link to Full Profile */}
              <button
                onClick={() => {
                  setEditOpen(false)
                  setActiveTab('profile')
                }}
                className="w-full py-4 px-4 rounded-xl border border-dashed border-primary/40 text-primary text-sm font-black bg-primary/[0.02] hover:bg-gray-100 hover:text-gray-900 hover:scale-[1.02] hover:border-gray-400 hover:shadow-md transition-all duration-300 flex items-center justify-center gap-3 active:scale-95 group"
              >
                <GraduationCap size={18} className="group-hover:rotate-12 transition-transform" />
                Edit / View Academic Profile
              </button>
            </div>

            <div className="flex gap-3 mt-8 relative">
              <button
                onClick={() => {
                  // Reset states to current profile data on cancel
                  setEditName(profile?.full_name || '')
                  setEditPhone(profile?.phone || '+91 ')
                  setEditDob(profile?.dob || '')
                  setEditOpen(false)
                }}
                className="btn-ghost flex-1 justify-center py-3 font-bold hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={saveBasicInfo}
                disabled={savingProfile}
                className="btn-primary flex-1 justify-center py-3 font-black shadow-lg shadow-primary/20"
              >
                {savingProfile ? 'Saving...' : <><Save size={18} /> Save Info</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-8 bg-gray-100/50 p-1.5 rounded-2xl w-fit mx-auto sm:mx-0">
        <button
          onClick={() => setActiveTab('recommendations')}
          className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
            activeTab === 'recommendations' 
              ? 'bg-white text-primary shadow-md' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Sparkles size={16} />
          Recommended
        </button>
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
            activeTab === 'profile' 
              ? 'bg-white text-primary shadow-md' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <User size={16} />
          Academic Profile
        </button>
      </div>

      {/* Content Area */}
      {activeTab === 'recommendations' ? (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-black text-gray-900 text-2xl flex items-center gap-3">
              Scholarships for You
              {eligibleScholarships.length > 0 && (
                <span className="bg-emerald-100 text-emerald-700 text-xs px-2.5 py-1 rounded-full font-black">
                  {eligibleScholarships.length} MATCHES
                </span>
              )}
            </h2>
          </div>

          {!profile?.academic_level ? (
            <div className="glass-card p-12 text-center border-dashed border-2 border-gray-200">
              <div className="w-16 h-16 bg-blue-50 text-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
                <AlertCircle size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Complete Your Profile</h3>
              <p className="text-gray-500 text-sm max-w-sm mx-auto mb-6">
                Tell us about your academic background and personal details to see scholarships you actually qualify for.
              </p>
              <button 
                onClick={() => setActiveTab('profile')}
                className="btn-primary px-8 py-3"
              >
                Start Profile Setup
              </button>
            </div>
          ) : loadingScholarships ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((i) => <SkeletonCard key={i} />)}
            </div>
          ) : eligibleScholarships.length === 0 ? (
            <div className="glass-card p-12 text-center">
              <div className="w-16 h-16 bg-gray-50 text-gray-300 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <GraduationCap size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">No Matches Found</h3>
              <p className="text-gray-500 text-sm max-w-sm mx-auto">
                We couldn&apos;t find scholarships matching your current profile. Try broadening your criteria or browsing all scholarships.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {eligibleScholarships.map((s) => (
                <ScholarshipCard
                  key={s.id}
                  scholarship={s}
                  isSaved={savedIds.has(s.id)}
                  showSaveButton
                  userId={authUser?.id || null}
                  qualifyBadge={(s as any)._isPerfect}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-black text-gray-900">Your Student Profile</h2>
              <p className="text-gray-500 text-sm font-medium">This information helps us find the best scholarships for you.</p>
            </div>
            {profile && (
              <div className="hidden sm:block">
                <div className="text-xs font-bold text-gray-400 uppercase mb-1">Status</div>
                <div className="flex items-center gap-1.5 text-emerald-600 font-bold text-sm bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                  <CheckCircle size={14} /> Active Student
                </div>
              </div>
            )}
          </div>
          
          {profile && <ProfileForm initialData={profile} userId={profile.id} />}
        </div>
      )}
    </div>
  )
}
