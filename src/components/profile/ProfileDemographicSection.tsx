'use client'

import { User, Info } from 'lucide-react'
import type { UserProfile } from '@/lib/types'
import { GENDERS, INDIAN_STATES_UTS, RELIGIONS, CASTE_CATEGORIES } from '@/lib/search-constants'
import { Section } from './ProfileFormShared'

interface ProfileDemographicSectionProps {
  formData: UserProfile
  setField: <K extends keyof UserProfile>(key: K, value: UserProfile[K]) => void
}

export function ProfileDemographicSection({ formData, setField }: ProfileDemographicSectionProps) {
  return (
    <Section title="Personal Information" icon={User}>
      {/* Field 11: Gender */}
      <div>
        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">
          Gender
        </label>
        <select 
          value={formData.gender || ''}
          onChange={(e) => setField('gender', e.target.value)}
          className="input-glass text-sm py-3"
        >
          <option value="" disabled hidden>Select Gender...</option>
          {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
        </select>
      </div>

      {/* Field 12: State */}
      <div>
        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">
          State or UT of Domicile
        </label>
        <select 
          value={formData.state || ''}
          onChange={(e) => setField('state', e.target.value)}
          className="input-glass text-sm py-3"
        >
          <option value="" disabled hidden>Select State/UT...</option>
          {INDIAN_STATES_UTS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <p className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
          <Info size={10} /> Used to match state-specific scholarships.
        </p>
      </div>

      {/* Field 13: Religion */}
      <div>
        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">
          Religion or Minority Status
        </label>
        <select 
          value={formData.religion || ''}
          onChange={(e) => setField('religion', e.target.value)}
          className="input-glass text-sm py-3"
        >
          <option value="" disabled hidden>Select Religion...</option>
          {RELIGIONS.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
        <p className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
          <Info size={10} /> Your info is only used to match scholarships and is never shared.
        </p>
      </div>

      {/* Field 14: Caste */}
      <div>
        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">
          Caste or Community Category
        </label>
        <select 
          value={formData.caste_category || ''}
          onChange={(e) => setField('caste_category', e.target.value)}
          className="input-glass text-sm py-3"
        >
          <option value="" disabled hidden>Select Category...</option>
          {CASTE_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
      </div>
    </Section>
  )
}
