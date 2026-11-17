import { describe, it, expect } from 'vitest'
import {
  calculateEligibilityScore,
  isScholarshipEligible,
  rankScholarshipsForUser,
} from '@/lib/scoring'
import { Scholarship, UserProfile } from '@/lib/types'

describe('Eligibility Scoring & Ranking System', () => {
  const mockUser: UserProfile = {
    id: 'user-123',
    full_name: 'Rahul Sharma',
    email: 'rahul@example.com',
    phone: '9876543210',
    avatar_url: null,
    marks_percentage: 85,
    marks_document_url: null,
    academic_level: 'Undergraduate',
    stream: 'Engineering',
    course_specialization: 'Computer Science',
    year_of_study: '2nd Year',
    institution_type: 'Government',
    study_mode: 'Full-time',
    class_10_percentage: 88,
    class_12_percentage: 90,
    college_marks_type: 'CGPA',
    college_marks_value: 8.5,
    entrance_exam: 'JEE Main',
    gender: 'Male',
    state: 'Karnataka',
    religion: 'Hindu',
    caste_category: 'General',
    disability_status: 'No disability',
    annual_income: 'Below 6 Lakhs',
    special_background: null,
    dob: '2004-05-15',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  const baseScholarship: Scholarship = {
    id: 'schol-1',
    title: 'Karnataka State Engineering Fellowship',
    provider: 'Department of Higher Education',
    category: 'Merit',
    country: 'India',
    state: 'Karnataka',
    min_marks_percentage: 75,
    amount: 50000,
    currency: 'INR',
    deadline: '2026-12-31',
    description: 'State engineering aid',
    eligibility_criteria: 'Undergraduate engineering students in Karnataka',
    application_link: 'https://example.com',
    tags: ['engineering', 'merit'],
    is_active: true,
    is_sample: false,
    academic_levels: ['Undergraduate'],
    streams: ['Engineering'],
    gender_eligibility: 'All',
    income_range: 'Below 8 Lakhs',
    scholarship_type: 'Government',
    caste_categories: ['General', 'OBC', 'SC', 'ST'],
    religion: 'Hindu',
    disability_required: false,
    girls_only: false,
    special_backgrounds: [],
    min_academic_performance: '70% and above',
    award_amount_range: '50,000',
    application_status: 'Open',
    portal_source: ['State Portal'],
    course_specializations: [],
    study_mode: 'Full-time',
    geographic_focus: 'State',
    institution_types: ['Government', 'Private'],
    year_of_study: 'Any Year',
    min_college_performance: null,
    application_type: 'Fresh',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  it('awards full points for a perfectly matching scholarship', () => {
    const { score, totalPossible, isPerfect } = calculateEligibilityScore(mockUser, baseScholarship)
    expect(score).toBeGreaterThan(0)
    expect(totalPossible).toBeGreaterThan(0)
    expect(isPerfect).toBe(true)
  })

  it('awards partial credit when a scholarship is open to all streams or academic levels', () => {
    const openScholarship: Scholarship = {
      ...baseScholarship,
      academic_levels: [], // open to all
      streams: [], // open to all
    }
    const { score, totalPossible } = calculateEligibilityScore(mockUser, openScholarship)
    expect(score).toBeLessThan(totalPossible)
    expect(score).toBeGreaterThan(0)
  })

  describe('isScholarshipEligible hard exclusion pass', () => {
    it('allows eligible candidate through', () => {
      expect(isScholarshipEligible(mockUser, baseScholarship)).toBe(true)
    })

    it('excludes male students from girls-only scholarships', () => {
      const girlsOnlyScholarship: Scholarship = {
        ...baseScholarship,
        girls_only: true,
      }
      expect(isScholarshipEligible(mockUser, girlsOnlyScholarship)).toBe(false)
    })

    it('excludes non-PwD students from disability-required scholarships', () => {
      const pwdOnlyScholarship: Scholarship = {
        ...baseScholarship,
        disability_required: true,
      }
      expect(isScholarshipEligible(mockUser, pwdOnlyScholarship)).toBe(false)
    })

    it('excludes candidates when state is strictly different from student residence', () => {
      const maharashtraOnly: Scholarship = {
        ...baseScholarship,
        state: 'Maharashtra',
      }
      expect(isScholarshipEligible(mockUser, maharashtraOnly)).toBe(false)
    })

    it('allows candidates for All India / National scholarships regardless of state', () => {
      const nationalScholarship: Scholarship = {
        ...baseScholarship,
        state: 'National',
      }
      expect(isScholarshipEligible(mockUser, nationalScholarship)).toBe(true)
    })
  })

  describe('rankScholarshipsForUser', () => {
    it('ranks higher-scoring scholarships before lower-scoring ones', () => {
      const highMatch = { ...baseScholarship, id: 'high-match', title: 'High Match' }
      const partialMatch = {
        ...baseScholarship,
        id: 'partial-match',
        title: 'Partial Match',
        academic_levels: [],
        streams: [],
      }

      const ranked = rankScholarshipsForUser(mockUser, [partialMatch, highMatch])
      expect(ranked[0].id).toBe('high-match')
      expect(ranked[1].id).toBe('partial-match')
    })
  })
})
