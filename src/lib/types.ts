export type Category = 'Merit' | 'Need-based' | 'Sports' | 'Research' | 'Government' | 'International'

export interface Scholarship {
  id: string
  title: string
  provider: string | null
  category: Category | null
  country: string | null
  state: string | null
  min_marks_percentage: number | null
  amount: number | null
  currency: string
  deadline: string | null
  description: string | null
  eligibility_criteria: string | null
  application_link: string | null
  tags: string[] | null
  is_active: boolean
  created_at: string
  updated_at: string
  // Indian filter fields
  academic_levels: string[] | null
  streams: string[] | null
  gender_eligibility: string | null
  income_range: string | null
  scholarship_type: string | null
  caste_categories: string[] | null
  religion: string | null
  disability_required: boolean | null
  girls_only: boolean | null
  special_backgrounds: string[] | null
  min_academic_performance: string | null
  award_amount_range: string | null
  application_status: string | null
  portal_source: string[] | null
  course_specializations: string[] | null
  study_mode: string | null
  geographic_focus: string | null
  institution_types: string[] | null
  year_of_study: string | null
  min_college_performance: string | null
  application_type: string | null
}

export interface UserProfile {
  id: string
  full_name: string | null
  email: string | null
  phone: string | null
  avatar_url: string | null
  marks_percentage: number | null
  marks_document_url: string | null
  created_at: string
  updated_at: string
  // New profile fields
  academic_level: string | null
  stream: string | null
  course_specialization: string | null
  year_of_study: string | null
  institution_type: string | null
  study_mode: string | null
  class_10_percentage: number | null
  class_10_type: 'Percentage' | 'CGPA' | null
  class_12_percentage: number | null
  class_12_type: 'Percentage' | 'CGPA' | null
  college_marks_type: 'CGPA' | 'Percentage' | null
  college_marks_value: number | null
  entrance_exam: string | null
  gender: string | null
  state: string | null
  religion: string | null
  caste_category: string | null
  disability_status: string | null
  annual_income: string | null
  special_background: string | null
  dob: string | null
}

export interface SavedScholarship {
  id: string
  user_id: string
  scholarship_id: string
  saved_at: string
  scholarship?: Scholarship
}

export const CATEGORY_CONFIG: Record<Category, { color: string; emoji: string; bgClass: string; textClass: string }> = {
  Merit: { color: '#4F8EF7', emoji: '🏆', bgClass: 'category-merit', textClass: 'text-blue-700' },
  'Need-based': { color: '#34C48B', emoji: '💚', bgClass: 'category-need-based', textClass: 'text-emerald-700' },
  Sports: { color: '#F59E0B', emoji: '⚽', bgClass: 'category-sports', textClass: 'text-amber-700' },
  Research: { color: '#8B5CF6', emoji: '🔬', bgClass: 'category-research', textClass: 'text-purple-700' },
  Government: { color: '#EF4444', emoji: '🏛️', bgClass: 'category-government', textClass: 'text-red-700' },
  International: { color: '#06B6D4', emoji: '🌍', bgClass: 'category-international', textClass: 'text-cyan-700' },
}

export const ALL_CATEGORIES: Category[] = ['Merit', 'Need-based', 'Sports', 'Research', 'Government', 'International']
