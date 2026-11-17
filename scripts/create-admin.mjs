#!/usr/bin/env node

/**
 * ScholarSearch — Admin Account Provisioning Script
 *
 * Securely seeds or updates the primary administrator account credentials
 * in Supabase `admin_credentials` table with bcrypt (cost 12).
 *
 * Usage:
 *   node scripts/create-admin.mjs
 *   node scripts/create-admin.mjs --username=admin --password=YourSecurePassword123!
 */

import readline from 'readline/promises'
import { stdin as input, stdout as output } from 'process'
import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'
import fs from 'fs'
import path from 'path'

// Optional loading of local .env / .env.local if present
function loadEnvFile(fileName) {
  const envPath = path.resolve(process.cwd(), fileName)
  if (!fs.existsSync(envPath)) return
  const content = fs.readFileSync(envPath, 'utf8')
  for (const line of content.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eqIdx = trimmed.indexOf('=')
    if (eqIdx === -1) continue
    const key = trimmed.slice(0, eqIdx).trim()
    let value = trimmed.slice(eqIdx + 1).trim()
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    if (!process.env[key]) {
      process.env[key] = value
    }
  }
}

loadEnvFile('.env.local')
loadEnvFile('.env')

// Parse command line arguments if provided
function parseArgs() {
  const args = {}
  for (const arg of process.argv.slice(2)) {
    if (arg.startsWith('--username=')) {
      args.username = arg.slice('--username='.length).trim()
    } else if (arg.startsWith('--password=')) {
      args.password = arg.slice('--password='.length).trim()
    }
  }
  return args
}

async function main() {
  console.log('\n======================================================')
  console.log('ScholarSearch Admin Provisioning')
  console.log('======================================================\n')

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('Error: Missing required environment variables.')
    console.error(
      'Please configure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local'
    )
    process.exit(1)
  }

  const args = parseArgs()
  let username = args.username
  let password = args.password

  if (!username || !password) {
    const rl = readline.createInterface({ input, output })
    try {
      if (!username) {
        username = (await rl.question('Enter admin username [default: admin]: ')).trim() || 'admin'
      }
      if (!password) {
        password = (await rl.question('Enter admin password (min 8 chars): ')).trim()
      }
    } finally {
      rl.close()
    }
  }

  if (!username || username.length < 3) {
    console.error('Error: Username must be at least 3 characters.')
    process.exit(1)
  }

  if (!password || password.length < 8) {
    console.error('Error: Password must be at least 8 characters.')
    process.exit(1)
  }

  console.log(`\nHashing password for admin "${username}" using bcrypt (cost 12)...`)
  const saltRounds = 12
  const passwordHash = await bcrypt.hash(password, saltRounds)

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  console.log('Upserting admin credentials into Supabase (id: 1)...')
  const { error } = await supabase.from('admin_credentials').upsert(
    {
      id: 1,
      username,
      password_hash: passwordHash,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'id' }
  )

  if (error) {
    console.error('Database error provisioning admin:', error.message)
    process.exit(1)
  }

  console.log('Admin account successfully provisioned!')
  console.log(`Username: ${username}`)
  console.log('======================================================\n')
}

main().catch((err) => {
  console.error('Unexpected error:', err)
  process.exit(1)
})
