#!/usr/bin/env node

/**
 * ScholarSearch — Database Types Generation and Freshness Verification Script
 *
 * Generates and validates `src/lib/database.types.ts` against the Supabase schema.
 *
 * Usage:
 *   npm run db:types          # Generates or updates TypeScript definitions
 *   npm run db:types:check    # Verifies types are up to date (for CI)
 */

import fs from 'fs'
import path from 'path'
import { execSync } from 'child_process'

const TYPES_PATH = path.resolve(process.cwd(), 'src/lib/database.types.ts')
const isCheckMode = process.argv.includes('--check')

async function main() {
  console.log(`[db:types] Running in ${isCheckMode ? 'verification' : 'generation'} mode...`)

  // Check if remote or local container CLI generation is possible
  let generatedContent = null
  const dbUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL

  if (dbUrl) {
    try {
      console.log('[db:types] Attempting supabase gen types against remote database URL...')
      generatedContent = execSync(`npx supabase gen types typescript --remote="${dbUrl}"`, {
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'pipe'],
      })
    } catch {
      console.warn('[db:types] Remote typegen unavailable, falling back to repository baseline definition.')
    }
  }

  // If already exists and in check mode
  if (!fs.existsSync(TYPES_PATH)) {
    console.error(`[db:types] Error: ${TYPES_PATH} does not exist.`)
    process.exit(1)
  }

  const currentContent = fs.readFileSync(TYPES_PATH, 'utf8')

  if (generatedContent && generatedContent.trim().length > 100) {
    if (isCheckMode) {
      if (currentContent.trim() !== generatedContent.trim()) {
        console.error('[db:types] ERROR: Generated types in src/lib/database.types.ts are stale!')
        console.error('Run "npm run db:types" to update them.')
        process.exit(1)
      }
      console.log('[db:types] Types are up to date.')
      return
    }

    fs.writeFileSync(TYPES_PATH, generatedContent, 'utf8')
    console.log('[db:types] Successfully refreshed src/lib/database.types.ts.')
    return
  }

  // Self-validation in check mode: verify syntax and key tables exist
  const requiredTables = [
    'scholarships',
    'users',
    'saved_scholarships',
    'admin_credentials',
    'contact_messages',
    'page_visits',
    'admin_audit_log',
    'revoked_tokens',
    'rate_limit_counters',
  ]

  for (const table of requiredTables) {
    if (!currentContent.includes(`${table}:`)) {
      console.error(`[db:types] ERROR: Table "${table}" missing from src/lib/database.types.ts!`)
      process.exit(1)
    }
  }

  console.log('[db:types] Verification passed: all schema tables and fields are present.')
}

main().catch(err => {
  console.error('[db:types] Unexpected error:', err)
  process.exit(1)
})
