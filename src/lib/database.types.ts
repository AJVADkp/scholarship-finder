export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      scholarships: {
        Row: {
          id: string
          title: string
          provider: string | null
          category: 'Merit' | 'Need-based' | 'Sports' | 'Research' | 'Government' | 'International' | null
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
          is_sample: boolean
          created_at: string
          updated_at: string
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
        Insert: {
          id?: string
          title: string
          provider?: string | null
          category?: 'Merit' | 'Need-based' | 'Sports' | 'Research' | 'Government' | 'International' | null
          country?: string | null
          state?: string | null
          min_marks_percentage?: number | null
          amount?: number | null
          currency?: string
          deadline?: string | null
          description?: string | null
          eligibility_criteria?: string | null
          application_link?: string | null
          tags?: string[] | null
          is_active?: boolean
          is_sample?: boolean
          created_at?: string
          updated_at?: string
          academic_levels?: string[] | null
          streams?: string[] | null
          gender_eligibility?: string | null
          income_range?: string | null
          scholarship_type?: string | null
          caste_categories?: string[] | null
          religion?: string | null
          disability_required?: boolean | null
          girls_only?: boolean | null
          special_backgrounds?: string[] | null
          min_academic_performance?: string | null
          award_amount_range?: string | null
          application_status?: string | null
          portal_source?: string[] | null
          course_specializations?: string[] | null
          study_mode?: string | null
          geographic_focus?: string | null
          institution_types?: string[] | null
          year_of_study?: string | null
          min_college_performance?: string | null
          application_type?: string | null
        }
        Update: {
          id?: string
          title?: string
          provider?: string | null
          category?: 'Merit' | 'Need-based' | 'Sports' | 'Research' | 'Government' | 'International' | null
          country?: string | null
          state?: string | null
          min_marks_percentage?: number | null
          amount?: number | null
          currency?: string
          deadline?: string | null
          description?: string | null
          eligibility_criteria?: string | null
          application_link?: string | null
          tags?: string[] | null
          is_active?: boolean
          is_sample?: boolean
          created_at?: string
          updated_at?: string
          academic_levels?: string[] | null
          streams?: string[] | null
          gender_eligibility?: string | null
          income_range?: string | null
          scholarship_type?: string | null
          caste_categories?: string[] | null
          religion?: string | null
          disability_required?: boolean | null
          girls_only?: boolean | null
          special_backgrounds?: string[] | null
          min_academic_performance?: string | null
          award_amount_range?: string | null
          application_status?: string | null
          portal_source?: string[] | null
          course_specializations?: string[] | null
          study_mode?: string | null
          geographic_focus?: string | null
          institution_types?: string[] | null
          year_of_study?: string | null
          min_college_performance?: string | null
          application_type?: string | null
        }
      }
      users: {
        Row: {
          id: string
          full_name: string | null
          email: string | null
          phone: string | null
          avatar_url: string | null
          marks_percentage: number | null
          marks_document_url: string | null
          academic_level: string | null
          stream: string | null
          course_specialization: string | null
          year_of_study: string | null
          institution_type: string | null
          study_mode: string | null
          class_10_percentage: number | null
          class_12_percentage: number | null
          college_marks_type: string | null
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
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          email?: string | null
          phone?: string | null
          avatar_url?: string | null
          marks_percentage?: number | null
          marks_document_url?: string | null
          academic_level?: string | null
          stream?: string | null
          course_specialization?: string | null
          year_of_study?: string | null
          institution_type?: string | null
          study_mode?: string | null
          class_10_percentage?: number | null
          class_12_percentage?: number | null
          college_marks_type?: string | null
          college_marks_value?: number | null
          entrance_exam?: string | null
          gender?: string | null
          state?: string | null
          religion?: string | null
          caste_category?: string | null
          disability_status?: string | null
          annual_income?: string | null
          special_background?: string | null
          dob?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          email?: string | null
          phone?: string | null
          avatar_url?: string | null
          marks_percentage?: number | null
          marks_document_url?: string | null
          academic_level?: string | null
          stream?: string | null
          course_specialization?: string | null
          year_of_study?: string | null
          institution_type?: string | null
          study_mode?: string | null
          class_10_percentage?: number | null
          class_12_percentage?: number | null
          college_marks_type?: string | null
          college_marks_value?: number | null
          entrance_exam?: string | null
          gender?: string | null
          state?: string | null
          religion?: string | null
          caste_category?: string | null
          disability_status?: string | null
          annual_income?: string | null
          special_background?: string | null
          dob?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      saved_scholarships: {
        Row: {
          id: string
          user_id: string
          scholarship_id: string
          saved_at: string
        }
        Insert: {
          id?: string
          user_id: string
          scholarship_id: string
          saved_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          scholarship_id?: string
          saved_at?: string
        }
      }
      admin_credentials: {
        Row: {
          id: number
          username: string
          password_hash: string
          updated_at: string
        }
        Insert: {
          id?: number
          username?: string
          password_hash: string
          updated_at?: string
        }
        Update: {
          id?: number
          username?: string
          password_hash?: string
          updated_at?: string
        }
      }
      contact_messages: {
        Row: {
          id: string
          user_id: string | null
          name: string
          email: string
          message: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          name: string
          email: string
          message: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          name?: string
          email?: string
          message?: string
          created_at?: string
        }
      }
      page_visits: {
        Row: {
          id: string
          page: string
          referrer: string | null
          ip_address: string | null
          country: string | null
          city: string | null
          region: string | null
          device: string | null
          os: string | null
          browser: string | null
          screen_width: number | null
          screen_height: number | null
          user_agent: string | null
          user_name: string | null
          user_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          page: string
          referrer?: string | null
          ip_address?: string | null
          country?: string | null
          city?: string | null
          region?: string | null
          device?: string | null
          os?: string | null
          browser?: string | null
          screen_width?: number | null
          screen_height?: number | null
          user_agent?: string | null
          user_name?: string | null
          user_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          page?: string
          referrer?: string | null
          ip_address?: string | null
          country?: string | null
          city?: string | null
          region?: string | null
          device?: string | null
          os?: string | null
          browser?: string | null
          screen_width?: number | null
          screen_height?: number | null
          user_agent?: string | null
          user_name?: string | null
          user_id?: string | null
          created_at?: string
        }
      }
      admin_audit_log: {
        Row: {
          id: string
          admin_username: string
          action: string
          target_type: string | null
          target_id: string | null
          details: Json | null
          ip_address: string | null
          created_at: string
        }
        Insert: {
          id?: string
          admin_username: string
          action: string
          target_type?: string | null
          target_id?: string | null
          details?: Json | null
          ip_address?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          admin_username?: string
          action?: string
          target_type?: string | null
          target_id?: string | null
          details?: Json | null
          ip_address?: string | null
          created_at?: string
        }
      }
      revoked_tokens: {
        Row: {
          jti: string
          revoked_at: string
          expires_at: string
        }
        Insert: {
          jti: string
          revoked_at?: string
          expires_at: string
        }
        Update: {
          jti?: string
          revoked_at?: string
          expires_at?: string
        }
      }
      rate_limit_counters: {
        Row: {
          key: string
          count: number
          reset_at: string
        }
        Insert: {
          key: string
          count?: number
          reset_at: string
        }
        Update: {
          key?: string
          count?: number
          reset_at?: string
        }
      }
    }
  }
}
