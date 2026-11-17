#!/usr/bin/env node
/**
 * ScholarSearch — Deterministic Database Seeding Utility
 *
 * Generates and seeds 120 curated Indian scholarships into Supabase
 * using a deterministic seeded Pseudo-Random Number Generator (PRNG).
 * All generated entries are explicitly tagged with `is_sample: true`.
 *
 * Usage:
 *   node scripts/seed-scholarships.mjs
 * Or via npm:
 *   npm run db:seed
 */

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const envLocalPath = path.resolve(__dirname, '../.env.local')

if (fs.existsSync(envLocalPath)) {
  const envContent = fs.readFileSync(envLocalPath, 'utf8')
  envContent.split('\n').forEach((line) => {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) return
    const match = trimmed.match(/^([^=]+)=(.*)$/)
    if (match) {
      const key = match[1].trim()
      const val = match[2].trim().replace(/^["']|["']$/g, '')
      if (!process.env[key]) {
        process.env[key] = val
      }
    }
  })
}

// Deterministic PRNG (Linear Congruential Generator with fixed seed)
function createPRNG(seed = 0x5c401a8) {
  let s = seed
  return function () {
    s = (s * 1664525 + 1013904223) % 4294967296
    return s / 4294967296
  }
}

const prng = createPRNG()
const sampleSubset = (arr, max = 2) => {
  const count = Math.floor(prng() * max) + 1
  const copy = [...arr]
  const picked = []
  for (let i = 0; i < count && copy.length > 0; i++) {
    const idx = Math.floor(prng() * copy.length)
    picked.push(copy.splice(idx, 1)[0])
  }
  return picked
}

const getDeterministicDeadline = (offsetDays) => {
  const d = new Date(Date.UTC(2026, 5, 30)) // Base date: June 30, 2026
  d.setUTCDate(d.getUTCDate() + (offsetDays % 180))
  return d.toISOString().split('T')[0]
}

const UG_SCHOLARSHIPS = [
  'Reliance Foundation Undergraduate Scholarships',
  'SBI Platinum Jubilee Asha Scholarship',
  "HDFC Bank Parivartan's ECSS Programme",
  'Keep India Smiling Foundational Scholarship',
  'Kotak Kanya Scholarship',
  "L'Oréal India For Young Women In Science Scholarship",
  'LIC Golden Jubilee Scholarship',
  'ONGC Foundation Scholarship',
  'Central Sector Scheme of Scholarship',
  "Prime Minister's Special Scholarship Scheme (PMSSS)",
  'Post Matric Scholarship for SC/ST/OBC (UG)',
  'Ishan Uday Special Scholarship for NER',
  'AICTE Pragati Scholarship for Girls (UG)',
  'AICTE Saksham Scholarship (UG)',
  'AICTE Swanath Scholarship (UG)',
  'Tata Trust Medical and Healthcare Scholarship',
  "Dr. Reddy's Foundation Sashakt Scholarship",
  "Santoor Women's Scholarship",
  'Vidyadhan Scholarship (UG)',
  'Fair and Lovely Foundation Scholarship',
  'Panasonic Ratti Chhatr Scholarship',
  'Legrand Scholarship (UG)',
  'Rolls-Royce Unnati Scholarship',
  'Siemens Scholarship (UG)',
  'G.P. Birla Educational Foundation Scholarship',
  'Sitaram Jindal Foundation Scholarship (UG)',
  'Nirankari Rajmata Scholarship',
  'Yashad-Sumedha Scholarship',
  'Sensodyne IDA Shining Star Scholarship',
  'Buddy4Study UG Scholarship',
  'M-Scholarship by Magma Fincorp',
  'Malabar Charitable Trust Scholarship',
  'NSDL Shiksha Sahyog Scholarship (UG)',
  'Federal Bank Harmis Memorial Foundation Scholarship',
  'South Indian Bank Scholarship Scheme',
  'Muthoot M George Higher Education Scholarship',
  'Kind Circle Scholarship for Meritorious Students',
  'Colgate Keep India Smiling Foundational Scholarship (UG)',
  'Medhavi National Scholarship Scheme (UG)',
  'NTPC Scholarship Scheme for Scheduled Castes/Tribes (UG)',
]

const PG_SCHOLARSHIPS = [
  'Tata Trusts Postgraduate Scholarship',
  'ONGC Postgraduate Scholarship for SC/ST/OBC',
  'Indira Gandhi Single Girl Child Scholarship for PG',
  'AICTE PG Scholarship for GATE/CEED Qualified',
  'ICMR Post Graduate Biomedical Fellowship',
  'UGC Post-Graduate Merit Scholarship for University Rank Holders',
  'DBT Post Graduate Biotechnology Fellowship',
  'CSIR UGC NET Junior Research Fellowship (PG)',
  'SBI Youth for India Fellowship Grant',
  'Narotam Sekhsaria PG Scholarship',
  'K.C. Mahindra Scholarships for Post-Graduate Studies',
  'J.N. Tata Endowment for Higher Education of Indians',
  'Aga Khan Foundation International Scholarship (PG)',
  'Inlaks Shivdasani Foundation Scholarship',
  'Ratan Tata Trust PG Medical Fellowship',
  'Lady Meherbai D. Tata Education Trust Scholarship',
  'Marubeni India Meritorious Scholarship (PG)',
  'Infosys Foundation STEM PG Scholarship',
  'Wipro Earthian PG Sustainability Grant',
  'Aditya Birla Group Scholarship (PG Management/Law/Engineering)',
  'Kishore Vaigyanik Protsahan Yojana (KVPY - PG)',
  'National Fellowship for OBC Students (NFOBC - PG)',
  'Maulana Azad National Fellowship for Minorities (MANF)',
  'National Overseas Scholarship for SC Candidates',
  'Fulbright-Nehru Master’s Fellowships (India-US)',
  'Commonwealth Scholarship for Master’s Studies',
  'DAAD Master Studies Scholarship for Indians',
  'Chevening India Master’s Scholarship',
  'Erasmus Mundus Joint Master Degree Scholarship',
  'Rhodes Scholarship for India (PG Oxford)',
]

const ALL_ITEMS = [...UG_SCHOLARSHIPS, ...PG_SCHOLARSHIPS]

export function generateDeterministicScholarships() {
  return ALL_ITEMS.map((title, idx) => {
    const isPg = idx >= UG_SCHOLARSHIPS.length
    const academicLevels = isPg ? ['Postgraduate'] : ['Undergraduate']
    const categories = ['Merit', 'Need-based', 'Sports', 'Research', 'Government', 'International']
    const category = categories[idx % categories.length]
    const amount = 20000 + (idx % 20) * 10000

    return {
      title,
      provider: `National Aid Provider ${(idx % 12) + 1}`,
      category,
      country: 'India',
      state: idx % 3 === 0 ? 'National' : 'Karnataka',
      min_marks_percentage: 60 + (idx % 30),
      amount,
      currency: 'INR',
      deadline: getDeterministicDeadline(idx * 7),
      description: `Comprehensive academic support program under ${title}. Verified test sample.`,
      eligibility_criteria: `Minimum 60% marks required. Family income below 8 Lakhs per annum.`,
      application_link: 'https://scholarships.gov.in',
      tags: ['sample-data', isPg ? 'postgraduate' : 'undergraduate', category.toLowerCase()],
      is_active: true,
      is_sample: true,
      academic_levels: academicLevels,
      streams: sampleSubset(['Engineering', 'Medicine', 'Science', 'Commerce', 'Arts']),
      gender_eligibility: idx % 4 === 0 ? 'Female' : 'All',
      income_range: 'Below 8 Lakhs',
      scholarship_type: idx % 2 === 0 ? 'Government' : 'Corporate CSR',
      caste_categories: ['General', 'OBC', 'SC', 'ST'],
      religion: 'Any',
      disability_required: false,
      girls_only: idx % 4 === 0,
      special_backgrounds: [],
      min_academic_performance: '60% and above',
      award_amount_range: '25,000 - 1,00,000',
      application_status: 'Open',
      portal_source: ['National Scholarship Portal'],
      course_specializations: [],
      study_mode: 'Full-time',
      geographic_focus: 'National',
      institution_types: ['Government', 'Private'],
      year_of_study: 'Any Year',
      min_college_performance: '6.0 CGPA and above',
      application_type: 'Fresh',
    }
  })
}

async function run() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    console.log(
      '[Seed] Notice: Missing live credentials, writing deterministic SQL seed file only.'
    )
    writeSqlSeed()
    return
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  console.log('[Seed] Generating deterministic sample scholarships with PRNG...')
  const sampleData = generateDeterministicScholarships()

  console.log(`[Seed] Inserting ${sampleData.length} sample scholarship records...`)
  const { error } = await supabase.from('scholarships').upsert(sampleData, { onConflict: 'title' })

  if (error) {
    console.error('[Seed] Database insert error:', error.message)
    process.exit(1)
  }

  console.log('[Seed] Successfully seeded deterministic sample data!')
  writeSqlSeed()
}

function writeSqlSeed() {
  const sampleData = generateDeterministicScholarships()
  const seedSqlPath = path.resolve(__dirname, '../supabase/seed.sql')

  const statements = [
    '-- ============================================================',
    '-- SCHOLARSEARCH — DETERMINISTIC SAMPLE DATASET',
    '-- Auto-generated with is_sample = true for staging and dev',
    '-- ============================================================',
    '',
  ]

  for (const s of sampleData) {
    const values = [
      `'${s.title.replace(/'/g, "''")}'`,
      `'${s.provider.replace(/'/g, "''")}'`,
      `'${s.category}'`,
      `'${s.country}'`,
      s.state ? `'${s.state}'` : 'NULL',
      s.min_marks_percentage,
      s.amount,
      `'${s.currency}'`,
      `'${s.deadline}'`,
      `'${s.description.replace(/'/g, "''")}'`,
      `'${s.eligibility_criteria.replace(/'/g, "''")}'`,
      `'${s.application_link}'`,
      `ARRAY[${s.tags.map((t) => `'${t}'`).join(',')}]`,
      s.is_active ? 'true' : 'false',
      'true', // is_sample
      `ARRAY[${s.academic_levels.map((a) => `'${a}'`).join(',')}]`,
      `ARRAY[${s.streams.map((a) => `'${a}'`).join(',')}]`,
      `'${s.gender_eligibility}'`,
      `'${s.income_range}'`,
    ].join(', ')

    statements.push(
      `INSERT INTO scholarships (title, provider, category, country, state, min_marks_percentage, amount, currency, deadline, description, eligibility_criteria, application_link, tags, is_active, is_sample, academic_levels, streams, gender_eligibility, income_range) VALUES (${values}) ON CONFLICT (id) DO NOTHING;`
    )
  }

  fs.writeFileSync(seedSqlPath, statements.join('\n'), 'utf8')
  console.log(`[Seed] Synchronized deterministic SQL seed file: supabase/seed.sql`)
}

// Execute if run directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  run().catch((err) => {
    console.error('[Seed] Unhandled error:', err)
    process.exit(1)
  })
}
