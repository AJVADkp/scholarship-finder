import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export async function GET() {
  const startTime = Date.now()
  let dbStatus = 'healthy'
  let dbLatencyMs: number | null = null

  try {
    const supabase = createAdminClient()
    const dbStart = Date.now()
    const { error } = await supabase.from('scholarships').select('id').limit(1)
    dbLatencyMs = Date.now() - dbStart

    if (error) {
      dbStatus = 'degraded'
    }
  } catch {
    dbStatus = 'unreachable'
  }

  const overallStatus = dbStatus === 'healthy' ? 'healthy' : 'degraded'
  const statusCode = dbStatus === 'unreachable' ? 503 : 200

  return NextResponse.json(
    {
      status: overallStatus,
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
      latencyMs: Date.now() - startTime,
      services: {
        database: {
          status: dbStatus,
          latencyMs: dbLatencyMs,
        },
      },
    },
    { status: statusCode }
  )
}
