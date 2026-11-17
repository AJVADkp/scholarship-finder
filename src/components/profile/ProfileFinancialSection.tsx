'use client'

import { IndianRupee, Info } from 'lucide-react'
import type { UserProfile } from '@/lib/types'
import { INCOME_BRACKETS, SPECIAL_BACKGROUNDS } from '@/lib/search-constants'
import { Section } from './ProfileFormShared'

const SPECIAL_BACKGROUND_OPTIONS = ['None of the above', ...SPECIAL_BACKGROUNDS]

interface ProfileFinancialSectionProps {
  formData: UserProfile
  setField: <K extends keyof UserProfile>(key: K, value: UserProfile[K]) => void
}

export function ProfileFinancialSection({ formData, setField }: ProfileFinancialSectionProps) {
  const isCustomIncome =
    formData.annual_income !== null &&
    formData.annual_income !== undefined &&
    formData.annual_income !== '' &&
    !INCOME_BRACKETS.includes(formData.annual_income)

  return (
    <Section title="Family and Financial Background" icon={IndianRupee}>
      {/* Annual Income */}
      <div>
        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">
          Annual Family Income
        </label>
        <div className="flex flex-col gap-2">
          <select
            value={
              INCOME_BRACKETS.includes(formData.annual_income || '')
                ? formData.annual_income || ''
                : isCustomIncome
                  ? 'Custom'
                  : ''
            }
            onChange={(e) => {
              if (e.target.value === 'Custom') {
                setField('annual_income', '0')
              } else {
                setField('annual_income', e.target.value)
              }
            }}
            className="input-glass text-sm py-3"
          >
            <option value="" disabled hidden>
              Choose Income Range...
            </option>
            {INCOME_BRACKETS.map((i) => (
              <option key={i} value={i}>
                {i}
              </option>
            ))}
            <option value="Custom">Other (Custom Amount)</option>
          </select>

          {isCustomIncome && (
            <input
              type="number"
              value={
                !formData.annual_income || formData.annual_income === '0'
                  ? ''
                  : formData.annual_income
              }
              onChange={(e) => setField('annual_income', e.target.value)}
              placeholder="Enter exact annual income in ₹ (e.g. 150000)"
              className="input-glass text-sm py-3"
            />
          )}
        </div>
        <p className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
          <Info size={10} /> Used to verify need-based and income-capped opportunities.
        </p>
      </div>

      {/* Special Background */}
      <div>
        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">
          Special Family Background
        </label>
        <select
          value={formData.special_background || ''}
          onChange={(e) => setField('special_background', e.target.value)}
          className="input-glass text-sm py-3"
        >
          <option value="" disabled hidden>
            Choose Category...
          </option>
          {SPECIAL_BACKGROUND_OPTIONS.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      </div>

      {/* Disability Status */}
      <div className="md:col-span-2">
        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">
          Disability Status
        </label>
        <select
          value={formData.disability_status || ''}
          onChange={(e) => setField('disability_status', e.target.value)}
          className="input-glass text-sm py-3"
        >
          <option value="" disabled hidden>
            Choose Disability Status...
          </option>
          <option value="No disability">No disability</option>
          <option value="Person with Disability (PwD) — 40%+">
            Person with Disability (PwD) with 40% or more disability
          </option>
        </select>
        <p className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
          <Info size={10} /> Valid certificate (40%+) qualifies for dedicated government
          fellowships.
        </p>
      </div>
    </Section>
  )
}
