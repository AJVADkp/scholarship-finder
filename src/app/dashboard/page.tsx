'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ScholarshipCard } from '@/components/scholarship/ScholarshipCard'
import { SkeletonCard } from '@/components/ui/SkeletonCard'
import type { Scholarship, UserProfile } from '@/lib/types'
import {
  User,
  Phone,
  Mail,
  Calendar,
  CheckCircle,
  Edit2,
  GraduationCap,
  Sparkles,
  AlertCircle,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import type { User as AuthUser } from '@supabase/supabase-js'
import { ProfileForm } from '@/components/profile/ProfileForm'
import { EditBasicInfoModal } from '@/components/profile/EditBasicInfoModal'
import { rankScholarshipsForUser } from '@/lib/scoring'

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

  const loadEligibleScholarships = useCallback(
    async (u: UserProfile) => {
      setLoadingScholarships(true)
      try {
        const { data: allScholarships, error } = await supabase
          .from('scholarships')
          .select('*')
          .eq('is_active', true)

        if (error) throw error

        // Rank scholarships using dimensional scoring and hard eligibility filters
        const sorted = rankScholarshipsForUser(u, (allScholarships as Scholarship[]) || [])
        const perfectMatches = sorted.filter((s) => s._isPerfect)
        const finalSelection =
          perfectMatches.length >= 10
            ? perfectMatches
            : sorted.slice(0, Math.max(10, perfectMatches.length))

        setEligibleScholarships(finalSelection)
      } catch {
        toast.error('Unable to load recommendations')
      } finally {
        setLoadingScholarships(false)
      }
    },
    [supabase]
  )

  const init = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return
    setAuthUser(user)

    const { data: profileData } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()
    if (profileData) {
      setProfile(profileData as UserProfile)
      setEditName(profileData.full_name || '')
      setEditPhone(profileData.phone || '+91 ')
      setEditDob(profileData.dob || '')
      loadEligibleScholarships(profileData as UserProfile)
    }

    const { data: savedData } = await supabase
      .from('saved_scholarships')
      .select('scholarship_id')
      .eq('user_id', user.id)
    if (savedData)
      setSavedIds(new Set(savedData.map((d: { scholarship_id: string }) => d.scholarship_id)))
  }, [supabase, loadEligibleScholarships])

  useEffect(() => {
    init()
  }, [init])

  const saveBasicInfo = async () => {
    if (!authUser) return
    setSavingProfile(true)
    try {
      const { error } = await supabase
        .from('users')
        .update({
          full_name: editName || null,
          phone: editPhone || null,
          dob: editDob || null,
        })
        .eq('id', authUser.id)

      if (error) throw error

      toast.success('Basic info updated!')
      setProfile((p) => (p ? { ...p, full_name: editName, phone: editPhone, dob: editDob } : p))
      setEditOpen(false)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to save info')
    } finally {
      setSavingProfile(false)
    }
  }

  const joinedDate = profile?.created_at ? format(new Date(profile.created_at), 'MMMM yyyy') : 'N/A'

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header Profile Section */}
      <div className="glass-card p-6 mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="relative flex-shrink-0">
            {profile?.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
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
              <span className="flex items-center gap-1.5">
                <Mail size={14} className="text-primary/60" /> {profile?.email}
              </span>
              {profile?.phone && (
                <span className="flex items-center gap-1.5">
                  <Phone size={14} className="text-primary/60" /> {profile.phone}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <Calendar size={14} className="text-primary/60" /> Joined {joinedDate}
              </span>
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
      <EditBasicInfoModal
        isOpen={editOpen}
        onClose={() => {
          setEditName(profile?.full_name || '')
          setEditPhone(profile?.phone || '+91 ')
          setEditDob(profile?.dob || '')
          setEditOpen(false)
        }}
        name={editName}
        setName={setEditName}
        phone={editPhone}
        setPhone={setEditPhone}
        dob={editDob}
        setDob={setEditDob}
        onSave={saveBasicInfo}
        saving={savingProfile}
        onViewAcademicProfile={() => {
          setEditOpen(false)
          setActiveTab('profile')
        }}
      />

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
                Tell us about your academic background and personal details to see scholarships you
                actually qualify for.
              </p>
              <button onClick={() => setActiveTab('profile')} className="btn-primary px-8 py-3">
                Start Profile Setup
              </button>
            </div>
          ) : loadingScholarships ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : eligibleScholarships.length === 0 ? (
            <div className="glass-card p-12 text-center">
              <div className="w-16 h-16 bg-gray-50 text-gray-300 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <GraduationCap size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">No Matches Found</h3>
              <p className="text-gray-500 text-sm max-w-sm mx-auto">
                We couldn&apos;t find scholarships matching your current profile. Try broadening
                your criteria or browsing all scholarships.
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
                  qualifyBadge={(s as Scholarship & { _isPerfect?: boolean })._isPerfect}
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
              <p className="text-gray-500 text-sm font-medium">
                This information helps us find the best scholarships for you.
              </p>
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
