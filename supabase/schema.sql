-- ============================================================
-- SCHOLARSHIP FINDER — SUPABASE SCHEMA
-- Run this in your Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- TABLE: scholarships
-- ============================================================
CREATE TABLE IF NOT EXISTS scholarships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  provider TEXT,
  category TEXT CHECK (category IN ('Merit','Need-based','Sports','Research','Government','International')),
  country TEXT,
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
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE: users (extends auth.users)
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  avatar_url TEXT,
  marks_percentage NUMERIC(5,2),
  marks_document_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE: saved_scholarships
-- ============================================================
CREATE TABLE IF NOT EXISTS saved_scholarships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  scholarship_id UUID REFERENCES scholarships(id) ON DELETE CASCADE,
  saved_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, scholarship_id)
);

-- ============================================================
-- TABLE: admin_credentials
-- ============================================================
CREATE TABLE IF NOT EXISTS admin_credentials (
  id INTEGER PRIMARY KEY DEFAULT 1,
  username TEXT NOT NULL DEFAULT 'admin',
  password_hash TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default admin (password: 'admin' — bcrypt hash)
INSERT INTO admin_credentials (id, username, password_hash)
VALUES (
  1,
  'admin',
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewYpfQNu.k9bZL9e'
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- UPDATED_AT TRIGGER
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_scholarships_updated_at
  BEFORE UPDATE ON scholarships
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_admin_credentials_updated_at
  BEFORE UPDATE ON admin_credentials
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

-- SCHOLARSHIPS: public read, service-role write
ALTER TABLE scholarships ENABLE ROW LEVEL SECURITY;
CREATE POLICY "scholarships_select_public" ON scholarships FOR SELECT USING (true);
CREATE POLICY "scholarships_all_service" ON scholarships
  FOR ALL USING (auth.role() = 'service_role');

-- USERS: own row only
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_select_own" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "users_update_own" ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "users_insert_own" ON users FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "users_all_service" ON users
  FOR ALL USING (auth.role() = 'service_role');

-- SAVED_SCHOLARSHIPS: own rows only
ALTER TABLE saved_scholarships ENABLE ROW LEVEL SECURITY;
CREATE POLICY "saved_select_own" ON saved_scholarships FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "saved_insert_own" ON saved_scholarships FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "saved_delete_own" ON saved_scholarships FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "saved_all_service" ON saved_scholarships
  FOR ALL USING (auth.role() = 'service_role');

-- ADMIN_CREDENTIALS: service role only (no user access via client)
ALTER TABLE admin_credentials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin_creds_service" ON admin_credentials
  FOR ALL USING (auth.role() = 'service_role');

-- ============================================================
-- STORAGE BUCKETS
-- ============================================================

-- avatars bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- marks-documents bucket (private)
INSERT INTO storage.buckets (id, name, public)
VALUES ('marks-documents', 'marks-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies: marks-documents (own files)
CREATE POLICY "marks_insert_own" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'marks-documents' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "marks_select_own" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'marks-documents' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );
