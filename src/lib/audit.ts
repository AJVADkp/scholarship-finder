import { createAdminClient } from '@/lib/supabase/admin'

export interface AdminAuditParams {
  adminUsername: string
  action: string
  targetType?: string
  targetId?: string
  details?: Record<string, unknown>
  ipAddress?: string
}

/**
 * Persists an immutable audit log entry for administrative actions.
 * Never throws to the caller: failures are logged server-side.
 */
export async function logAdminAudit(params: AdminAuditParams): Promise<void> {
  try {
    const supabase = createAdminClient()
    const { error } = await supabase.from('admin_audit_log').insert({
      admin_username: params.adminUsername,
      action: params.action,
      target_type: params.targetType || null,
      target_id: params.targetId || null,
      details: params.details || null,
      ip_address: params.ipAddress || null,
    })

    if (error) {
      console.error('[Admin Audit] Failed to record audit log:', error.message)
    }
  } catch (err) {
    console.error('[Admin Audit] Unexpected error recording audit log:', err)
  }
}
