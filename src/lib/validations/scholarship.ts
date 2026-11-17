import { z } from 'zod'

export const SCHOLARSHIP_CATEGORIES = [
  'Merit',
  'Need-based',
  'Sports',
  'Research',
  'Government',
  'International',
] as const

export const scholarshipCreateSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(300),
  provider: z.string().trim().max(300).nullable().optional(),
  category: z.enum(SCHOLARSHIP_CATEGORIES).nullable().optional(),
  country: z.string().trim().max(100).default('India').nullable().optional(),
  state: z.string().trim().max(100).nullable().optional(),
  min_marks_percentage: z.coerce.number().min(0).max(100).nullable().optional(),
  amount: z.coerce.number().min(0).nullable().optional(),
  currency: z.string().trim().max(10).default('INR').optional(),
  deadline: z.string().nullable().optional(),
  description: z.string().trim().max(5000).nullable().optional(),
  eligibility_criteria: z.string().trim().max(5000).nullable().optional(),
  application_link: z.string().trim().nullable().optional(),
  tags: z.array(z.string().trim()).nullable().optional(),
  is_active: z.boolean().default(true).optional(),
  academic_levels: z.array(z.string().trim()).nullable().optional(),
  streams: z.array(z.string().trim()).nullable().optional(),
  gender_eligibility: z.string().trim().max(50).nullable().optional(),
  income_range: z.string().trim().max(100).nullable().optional(),
  scholarship_type: z.string().trim().max(100).nullable().optional(),
  caste_categories: z.array(z.string().trim()).nullable().optional(),
  religion: z.string().trim().max(50).nullable().optional(),
  disability_required: z.boolean().nullable().optional(),
  girls_only: z.boolean().nullable().optional(),
  special_backgrounds: z.array(z.string().trim()).nullable().optional(),
  min_academic_performance: z.string().trim().max(100).nullable().optional(),
  award_amount_range: z.string().trim().max(100).nullable().optional(),
  application_status: z.string().trim().max(50).nullable().optional(),
  portal_source: z.array(z.string().trim()).nullable().optional(),
  course_specializations: z.array(z.string().trim()).nullable().optional(),
  study_mode: z.string().trim().max(50).nullable().optional(),
  geographic_focus: z.string().trim().max(100).nullable().optional(),
  institution_types: z.array(z.string().trim()).nullable().optional(),
  year_of_study: z.string().trim().max(50).nullable().optional(),
  min_college_performance: z.string().trim().max(100).nullable().optional(),
  application_type: z.string().trim().max(50).nullable().optional(),
})

export const scholarshipUpdateSchema = scholarshipCreateSchema.partial()

export type ScholarshipCreateInput = z.infer<typeof scholarshipCreateSchema>
export type ScholarshipUpdateInput = z.infer<typeof scholarshipUpdateSchema>
