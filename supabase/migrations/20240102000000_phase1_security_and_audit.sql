-- ==============================================================================
-- SCHOLARSEARCH — PHASE 1 MIGRATION: SECURITY, AUDITING & RATE LIMITING
-- Migration: 20240102000000_phase1_security_and_audit.sql
-- ==============================================================================

-- 1. Contact Messages Check Constraints
ALTER TABLE contact_messages
  ADD CONSTRAINT chk_contact_name_len CHECK (char_length(name) <= 100),
  ADD CONSTRAINT chk_contact_email_len CHECK (char_length(email) <= 255),
  ADD CONSTRAINT chk_contact_message_len CHECK (char_length(message) <= 2000);

-- 2. Admin Audit Log Table
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

ALTER TABLE admin_audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin_audit_log_service_role" ON admin_audit_log
  FOR ALL USING (auth.role() = 'service_role');

-- 3. Revoked Tokens Table (Admin JWT Session Revocation)
CREATE TABLE IF NOT EXISTS revoked_tokens (
  jti TEXT PRIMARY KEY,
  revoked_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_revoked_tokens_expires_at ON revoked_tokens (expires_at);

ALTER TABLE revoked_tokens ENABLE ROW LEVEL SECURITY;
CREATE POLICY "revoked_tokens_service_role" ON revoked_tokens
  FOR ALL USING (auth.role() = 'service_role');

-- 4. Rate Limit Counters Table (PostgreSQL Durable Rate Limiter)
CREATE TABLE IF NOT EXISTS rate_limit_counters (
  key TEXT PRIMARY KEY,
  count INTEGER NOT NULL DEFAULT 1,
  reset_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_rate_limit_counters_reset_at ON rate_limit_counters (reset_at);

ALTER TABLE rate_limit_counters ENABLE ROW LEVEL SECURITY;
CREATE POLICY "rate_limit_counters_service_role" ON rate_limit_counters
  FOR ALL USING (auth.role() = 'service_role');
