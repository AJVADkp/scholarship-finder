import { Database } from './database.types'

export type Category = 'Merit' | 'Need-based' | 'Sports' | 'Research' | 'Government' | 'International'

/**
 * Core scholarship entity derived directly from generated Supabase database schema.
 */
export type Scholarship = Database['public']['Tables']['scholarships']['Row']
export type ScholarshipInsert = Database['public']['Tables']['scholarships']['Insert']
export type ScholarshipUpdate = Database['public']['Tables']['scholarships']['Update']

/**
 * Student profile entity derived directly from generated Supabase database schema,
 * with optional client UI form state properties.
 */
export type UserProfile = Database['public']['Tables']['users']['Row'] & {
  class_10_type?: 'Percentage' | 'CGPA' | null
  class_12_type?: 'Percentage' | 'CGPA' | null
}
export type UserProfileInsert = Database['public']['Tables']['users']['Insert']
export type UserProfileUpdate = Database['public']['Tables']['users']['Update']

/**
 * Saved scholarship / bookmark entity.
 */
export type SavedScholarship = Database['public']['Tables']['saved_scholarships']['Row'] & {
  scholarship?: Scholarship
}

/**
 * Auxiliary database model types.
 */
export type AdminAuditLog = Database['public']['Tables']['admin_audit_log']['Row']
export type ContactMessage = Database['public']['Tables']['contact_messages']['Row']
export type PageVisit = Database['public']['Tables']['page_visits']['Row']

export const CATEGORY_CONFIG: Record<Category, { color: string; emoji: string; bgClass: string; textClass: string }> = {
  Merit: { color: '#4F8EF7', emoji: '🏆', bgClass: 'category-merit', textClass: 'text-blue-700' },
  'Need-based': { color: '#34C48B', emoji: '💚', bgClass: 'category-need-based', textClass: 'text-emerald-700' },
  Sports: { color: '#F59E0B', emoji: '⚽', bgClass: 'category-sports', textClass: 'text-amber-700' },
  Research: { color: '#8B5CF6', emoji: '🔬', bgClass: 'category-research', textClass: 'text-purple-700' },
  Government: { color: '#EF4444', emoji: '🏛️', bgClass: 'category-government', textClass: 'text-red-700' },
  International: { color: '#06B6D4', emoji: '🌍', bgClass: 'category-international', textClass: 'text-cyan-700' },
}

export const ALL_CATEGORIES: Category[] = ['Merit', 'Need-based', 'Sports', 'Research', 'Government', 'International']
