import { Scholarship, UserProfile } from './types'
import { checkIncomeMatch } from './utils'

export interface ScoredScholarship extends Scholarship {
  _score: number
  _totalPossible: number
  _isPerfect: boolean
}

/**
 * Calculates dimensional match score between a student profile and a scholarship.
 * Points are assigned based on degree of relevance, with partial credit for open-to-all criteria.
 */
export function calculateEligibilityScore(
  user: UserProfile,
  scholarship: Scholarship
): { score: number; totalPossible: number; isPerfect: boolean } {
  let score = 0
  let totalPossible = 0

  // 1. Academic Level (Weight: 25)
  if (user.academic_level) {
    totalPossible += 25
    if (!scholarship.academic_levels || scholarship.academic_levels.length === 0) {
      score += 12 // Open to all levels
    } else if (scholarship.academic_levels.includes(user.academic_level)) {
      score += 25 // Exact match
    }
  }

  // 2. Stream (Weight: 20)
  if (user.stream) {
    totalPossible += 20
    if (!scholarship.streams || scholarship.streams.length === 0 || scholarship.streams.includes('All')) {
      score += 10
    } else if (scholarship.streams.includes(user.stream)) {
      score += 20
    }
  }

  // 3. Marks (Weight: 10)
  if (user.class_10_percentage) {
    totalPossible += 10
    if (!scholarship.min_marks_percentage) {
      score += 7
    } else if (user.class_10_percentage >= scholarship.min_marks_percentage) {
      score += 10
    }
  }

  // 4. Gender (Weight: 15)
  if (user.gender) {
    totalPossible += 15
    const isGirlsOnly = scholarship.girls_only || scholarship.gender_eligibility === 'Female'
    const isNeutral = !scholarship.gender_eligibility || scholarship.gender_eligibility === 'All'

    if (user.gender === 'Male') {
      if (isGirlsOnly) {
        score += 0
      } else if (isNeutral) {
        score += 15
      } else {
        score += 15
      }
    } else if (user.gender === 'Female') {
      if (isGirlsOnly) {
        score += 15 // Targeted bonus
      } else if (isNeutral) {
        score += 12
      } else {
        score += 15
      }
    }
  }

  // 5. State (Weight: 15)
  if (user.state) {
    totalPossible += 15
    if (!scholarship.state || scholarship.state === 'All India' || scholarship.state === 'National') {
      score += 8
    } else if (scholarship.state.toLowerCase().includes(user.state.toLowerCase())) {
      score += 15
    }
  }

  // 6. Income (Weight: 10)
  if (user.annual_income) {
    totalPossible += 10
    if (!scholarship.income_range || scholarship.income_range === 'Not specified') {
      score += 6
    } else if (checkIncomeMatch(user.annual_income, scholarship.income_range)) {
      score += 10
    }
  }

  // 7. Caste Category (Weight: 10)
  if (user.caste_category) {
    totalPossible += 10
    if (!scholarship.caste_categories || scholarship.caste_categories.length === 0) {
      score += 6
    } else if (
      scholarship.caste_categories.includes(user.caste_category) ||
      scholarship.caste_categories.includes('General')
    ) {
      score += 10
    }
  }

  // 8. Religion (Weight: 8)
  if (user.religion && user.religion !== 'Prefer not to say') {
    totalPossible += 8
    if (!scholarship.religion || scholarship.religion === 'Any') {
      score += 5
    } else if (scholarship.religion.includes(user.religion)) {
      score += 8
    }
  }

  // 9. Disability Status (Weight: 5)
  if (user.disability_status) {
    totalPossible += 5
    const isPwD = user.disability_status === 'Person with Disability (PwD) — 40%+'
    if (!scholarship.disability_required) {
      score += isPwD ? 3 : 5
    } else {
      score += isPwD ? 5 : 0
    }
  }

  const isPerfect = score >= totalPossible && totalPossible > 0
  return { score, totalPossible, isPerfect }
}

/**
 * Hard exclusion filters: checks whether a scholarship is disqualifying
 * regardless of calculated score.
 */
export function isScholarshipEligible(user: UserProfile, scholarship: Scholarship): boolean {
  // Check expired deadline
  if (scholarship.deadline) {
    const deadlineDate = new Date(scholarship.deadline)
    const today = new Date()
    deadlineDate.setHours(23, 59, 59, 999)
    if (deadlineDate < today) return false
  }

  // Male users: exclude girls-only opportunities
  if (user.gender === 'Male' && (scholarship.girls_only || scholarship.gender_eligibility === 'Female')) {
    return false
  }

  // Non-PwD users: exclude PwD-exclusive opportunities
  if (user.disability_status === 'No disability' && scholarship.disability_required) {
    return false
  }

  // State constraint
  if (
    user.state &&
    scholarship.state &&
    scholarship.state !== 'All India' &&
    scholarship.state !== 'National' &&
    !scholarship.state.toLowerCase().includes(user.state.toLowerCase())
  ) {
    return false
  }

  // Caste constraint
  if (user.caste_category && scholarship.caste_categories && scholarship.caste_categories.length > 0) {
    if (
      !scholarship.caste_categories.includes(user.caste_category) &&
      !scholarship.caste_categories.includes('General')
    ) {
      return false
    }
  }

  // Religion constraint
  if (
    user.religion &&
    user.religion !== 'Prefer not to say' &&
    scholarship.religion &&
    scholarship.religion !== 'Any'
  ) {
    if (!scholarship.religion.includes(user.religion)) {
      return false
    }
  }

  return true
}

/**
 * Scores, filters, and ranks scholarships for a student profile.
 */
export function rankScholarshipsForUser(
  user: UserProfile,
  scholarships: Scholarship[]
): ScoredScholarship[] {
  const scored = scholarships.map(s => {
    const { score, totalPossible, isPerfect } = calculateEligibilityScore(user, s)
    return {
      ...s,
      _score: score,
      _totalPossible: totalPossible,
      _isPerfect: isPerfect,
    }
  })

  const eligible = scored.filter(s => isScholarshipEligible(user, s))

  return eligible.sort((a, b) => {
    if (b._score !== a._score) return b._score - a._score
    const dateA = a.deadline ? new Date(a.deadline).getTime() : Infinity
    const dateB = b.deadline ? new Date(b.deadline).getTime() : Infinity
    return dateA - dateB
  })
}
