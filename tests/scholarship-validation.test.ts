import { describe, it, expect } from 'vitest'
import {
  scholarshipCreateSchema,
  scholarshipUpdateSchema,
  ScholarshipCreateInput,
} from '@/lib/validations/scholarship'

describe('Scholarship Validation Schemas', () => {
  const completeScholarshipPayload: ScholarshipCreateInput = {
    title: 'National Merit STEM Fellowship 2026',
    provider: 'Department of Science and Technology',
    category: 'Merit',
    country: 'India',
    state: 'Karnataka',
    min_marks_percentage: 85,
    amount: 100000,
    currency: 'INR',
    deadline: '2026-12-31',
    description: 'Comprehensive financial support for high-achieving STEM scholars.',
    eligibility_criteria: 'Minimum 85% marks in Class 12 or equivalent, family income under 6 LPA.',
    application_link: 'https://scholarships.gov.in/example',
    tags: ['stem', 'merit', 'engineering'],
    is_active: true,
    academic_levels: ['Undergraduate', 'Postgraduate'],
    streams: ['Engineering', 'Science'],
    gender_eligibility: 'All',
    income_range: 'Below 6 Lakhs',
    scholarship_type: 'Government',
    caste_categories: ['General', 'OBC', 'SC', 'ST'],
    religion: 'Any',
    disability_required: false,
    girls_only: false,
    special_backgrounds: ['First Graduate in Family'],
    min_academic_performance: '80% and above',
    award_amount_range: '50,000 - 1,00,000',
    application_status: 'Open',
    portal_source: ['NSP', 'State Portal'],
    course_specializations: ['Computer Science', 'Electronics'],
    study_mode: 'Full-time',
    geographic_focus: 'National',
    institution_types: ['Government', 'IIT/NIT'],
    year_of_study: '1st Year',
    min_college_performance: '8.0 CGPA and above',
    application_type: 'Fresh',
  }

  it('successfully validates and retains all real database fields on creation', () => {
    const result = scholarshipCreateSchema.safeParse(completeScholarshipPayload)
    expect(result.success).toBe(true)
    if (!result.success) return

    expect(result.data.title).toBe(completeScholarshipPayload.title)
    expect(result.data.eligibility_criteria).toBe(completeScholarshipPayload.eligibility_criteria)
    expect(result.data.academic_levels).toEqual(['Undergraduate', 'Postgraduate'])
    expect(result.data.streams).toEqual(['Engineering', 'Science'])
    expect(result.data.caste_categories).toEqual(['General', 'OBC', 'SC', 'ST'])
    expect(result.data.portal_source).toEqual(['NSP', 'State Portal'])
    expect(result.data.application_link).toBe(completeScholarshipPayload.application_link)
  })

  it('rejects creation when required title is missing or blank', () => {
    const invalid = { ...completeScholarshipPayload, title: '' }
    const result = scholarshipCreateSchema.safeParse(invalid)
    expect(result.success).toBe(false)
  })

  it('validates partial updates without requiring title', () => {
    const partialUpdate = {
      amount: 150000,
      is_active: false,
      academic_levels: ['PhD'],
      streams: ['Research'],
    }

    const result = scholarshipUpdateSchema.safeParse(partialUpdate)
    expect(result.success).toBe(true)
    if (!result.success) return

    expect(result.data.amount).toBe(150000)
    expect(result.data.is_active).toBe(false)
    expect(result.data.academic_levels).toEqual(['PhD'])
    expect(result.data.title).toBeUndefined()
  })

  it('validates category enum values strictly', () => {
    const invalidCategory = { ...completeScholarshipPayload, category: 'NotARealCategory' }
    const result = scholarshipCreateSchema.safeParse(invalidCategory)
    expect(result.success).toBe(false)
  })

  it('coerces numeric string amounts into valid numbers', () => {
    const stringAmountPayload = {
      ...completeScholarshipPayload,
      amount: '75000' as unknown as number,
      min_marks_percentage: '88.5' as unknown as number,
    }
    const result = scholarshipCreateSchema.safeParse(stringAmountPayload)
    expect(result.success).toBe(true)
    if (!result.success) return

    expect(result.data.amount).toBe(75000)
    expect(result.data.min_marks_percentage).toBe(88.5)
  })
})
