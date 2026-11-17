-- ==============================================================================
-- SCHOLARSEARCH — COMPLETE SUPABASE DATABASE SCHEMA
-- ==============================================================================
-- Run this script in the Supabase SQL Editor to initialize all tables,
-- extensions, indexes, triggers, and Row Level Security (RLS) policies.
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 2. TABLE: scholarships
-- ==============================================================================
CREATE TABLE IF NOT EXISTS scholarships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  provider TEXT,
  category TEXT CHECK (category IN ('Merit','Need-based','Sports','Research','Government','International')),
  country TEXT DEFAULT 'India',
  state TEXT,
  min_marks_percentage NUMERIC(5,2),
  amount NUMERIC(12,2),
  currency TEXT DEFAULT 'INR',
  deadline DATE,
  description TEXT,
  eligibility_criteria TEXT,
  application_link TEXT,
  tags TEXT[],
  is_active BOOLEAN DEFAULT TRUE,
  
  -- Specialized Filter Fields
  academic_levels TEXT[],
  streams TEXT[],
  gender_eligibility TEXT DEFAULT 'All',
  income_range TEXT,
  scholarship_type TEXT,
  caste_categories TEXT[],
  religion TEXT DEFAULT 'Any',
  disability_required BOOLEAN DEFAULT FALSE,
  girls_only BOOLEAN DEFAULT FALSE,
  special_backgrounds TEXT[],
  min_academic_performance TEXT,
  award_amount_range TEXT,
  application_status TEXT DEFAULT 'Open',
  portal_source TEXT[],
  course_specializations TEXT[],
  study_mode TEXT DEFAULT 'Full-time',
  geographic_focus TEXT DEFAULT 'National',
  institution_types TEXT[],
  year_of_study TEXT DEFAULT 'Any Year',
  min_college_performance TEXT,
  application_type TEXT DEFAULT 'Fresh',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_scholarships_category ON scholarships (category);
CREATE INDEX IF NOT EXISTS idx_scholarships_is_active ON scholarships (is_active);
CREATE INDEX IF NOT EXISTS idx_scholarships_deadline ON scholarships (deadline);

-- ==============================================================================
-- 3. TABLE: users (extends auth.users)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  avatar_url TEXT,
  marks_percentage NUMERIC(5,2),
  marks_document_url TEXT,
  
  -- Student Profile & Academic Background
  academic_level TEXT,
  stream TEXT,
  course_specialization TEXT,
  year_of_study TEXT,
  institution_type TEXT,
  study_mode TEXT,
  class_10_percentage NUMERIC(5,2),
  class_12_percentage NUMERIC(5,2),
  college_marks_type TEXT,
  college_marks_value NUMERIC(5,2),
  entrance_exam TEXT,
  gender TEXT,
  state TEXT,
  religion TEXT,
  caste_category TEXT,
  disability_status TEXT,
  annual_income TEXT,
  special_background TEXT,
  dob DATE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 4. TABLE: saved_scholarships (User Bookmarks)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS saved_scholarships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  scholarship_id UUID NOT NULL REFERENCES scholarships(id) ON DELETE CASCADE,
  saved_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, scholarship_id)
);

CREATE INDEX IF NOT EXISTS idx_saved_scholarships_user ON saved_scholarships (user_id);

-- ==============================================================================
-- 5. TABLE: admin_credentials
-- ==============================================================================
CREATE TABLE IF NOT EXISTS admin_credentials (
  id INTEGER PRIMARY KEY DEFAULT 1,
  username TEXT NOT NULL DEFAULT 'admin',
  password_hash TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Note: Admin account must be seeded via scripts/create-admin.mjs
-- Default seed hash removed for production security.

-- ==============================================================================
-- 6. TABLE: contact_messages
-- ==============================================================================
CREATE TABLE IF NOT EXISTS contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  name TEXT NOT NULL CHECK (char_length(name) <= 100),
  email TEXT NOT NULL CHECK (char_length(email) <= 255),
  message TEXT NOT NULL CHECK (char_length(message) <= 2000),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_contact_messages_created ON contact_messages (created_at DESC);

-- ==============================================================================
-- 6.1 TABLE: admin_audit_log (Admin Action Audit Trail)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS admin_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_username TEXT NOT NULL,
  action TEXT NOT NULL,
  target_type TEXT,
  target_id TEXT,
  details JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_audit_log_created_at ON admin_audit_log (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_action ON admin_audit_log (action);

-- ==============================================================================
-- 6.2 TABLE: revoked_tokens (Revoked Admin JWT Sessions)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS revoked_tokens (
  jti TEXT PRIMARY KEY,
  revoked_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_revoked_tokens_expires_at ON revoked_tokens (expires_at);

-- ==============================================================================
-- 6.3 TABLE: rate_limit_counters (Postgres-backed Durable Rate Limiter)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS rate_limit_counters (
  key TEXT PRIMARY KEY,
  count INTEGER NOT NULL DEFAULT 1,
  reset_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_rate_limit_counters_reset_at ON rate_limit_counters (reset_at);

-- ==============================================================================
-- 7. TABLE: page_visits (Privacy-first First-party Analytics)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS page_visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page TEXT NOT NULL,
  referrer TEXT,
  ip_address TEXT,
  country TEXT,
  city TEXT,
  region TEXT,
  device TEXT,
  os TEXT,
  browser TEXT,
  screen_width INTEGER,
  screen_height INTEGER,
  user_agent TEXT,
  user_name TEXT,
  user_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_page_visits_created_at ON page_visits (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_page_visits_country ON page_visits (country);
CREATE INDEX IF NOT EXISTS idx_page_visits_page ON page_visits (page);

-- ==============================================================================
-- 8. AUTOMATIC UPDATED_AT TRIGGER
-- ==============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_scholarships_updated_at ON scholarships;
CREATE TRIGGER update_scholarships_updated_at
  BEFORE UPDATE ON scholarships
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_admin_credentials_updated_at ON admin_credentials;
CREATE TRIGGER update_admin_credentials_updated_at
  BEFORE UPDATE ON admin_credentials
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==============================================================================
-- 9. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- 9.1 SCHOLARSHIPS
ALTER TABLE scholarships ENABLE ROW LEVEL SECURITY;
CREATE POLICY "scholarships_select_public" ON scholarships
  FOR SELECT USING (true);
CREATE POLICY "scholarships_service_role" ON scholarships
  FOR ALL USING (auth.role() = 'service_role');

-- 9.2 USERS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_select_own" ON users
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "users_insert_own" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "users_update_own" ON users
  FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "users_service_role" ON users
  FOR ALL USING (auth.role() = 'service_role');

-- 9.3 SAVED SCHOLARSHIPS
ALTER TABLE saved_scholarships ENABLE ROW LEVEL SECURITY;
CREATE POLICY "saved_select_own" ON saved_scholarships
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "saved_insert_own" ON saved_scholarships
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "saved_delete_own" ON saved_scholarships
  FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "saved_service_role" ON saved_scholarships
  FOR ALL USING (auth.role() = 'service_role');

-- 9.4 ADMIN CREDENTIALS
ALTER TABLE admin_credentials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin_credentials_service_role" ON admin_credentials
  FOR ALL USING (auth.role() = 'service_role');

-- 9.5 CONTACT MESSAGES
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "contact_messages_insert_public" ON contact_messages
  FOR INSERT WITH CHECK (true);
CREATE POLICY "contact_messages_service_role" ON contact_messages
  FOR ALL USING (auth.role() = 'service_role');

-- 9.6 PAGE VISITS
ALTER TABLE page_visits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "page_visits_service_role" ON page_visits
  FOR ALL USING (auth.role() = 'service_role');

-- 9.7 ADMIN AUDIT LOG
ALTER TABLE admin_audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin_audit_log_service_role" ON admin_audit_log
  FOR ALL USING (auth.role() = 'service_role');

-- 9.8 REVOKED TOKENS
ALTER TABLE revoked_tokens ENABLE ROW LEVEL SECURITY;
CREATE POLICY "revoked_tokens_service_role" ON revoked_tokens
  FOR ALL USING (auth.role() = 'service_role');

-- 9.9 RATE LIMIT COUNTERS
ALTER TABLE rate_limit_counters ENABLE ROW LEVEL SECURITY;
CREATE POLICY "rate_limit_counters_service_role" ON rate_limit_counters
  FOR ALL USING (auth.role() = 'service_role');

-- ==============================================================================
-- 10. STORAGE BUCKETS & POLICIES
-- ==============================================================================

-- Avatars bucket (Publicly readable)
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Marks-documents bucket (Private, accessible by owner only)
INSERT INTO storage.buckets (id, name, public)
VALUES ('marks-documents', 'marks-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies: marks-documents (own folder only)
DROP POLICY IF EXISTS "marks_insert_own" ON storage.objects;
CREATE POLICY "marks_insert_own" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'marks-documents' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "marks_select_own" ON storage.objects;
CREATE POLICY "marks_select_own" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'marks-documents' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );
