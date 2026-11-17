-- ==============================================================================
-- SCHOLARSEARCH — PHASE 2 MIGRATION: GIN & TRIGRAM INDEXES + SAMPLE DATA FLAG
-- Migration: 20240103000000_phase2_indexes_and_sample_flag.sql
-- ==============================================================================

-- 1. Enable Trigram Extension for Fuzzy & Substring Text Search
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- 2. GIN Trigram Indexes for Title and Provider Search
-- Justification: Accelerates case-insensitive substring searches (`ILIKE '%...%'` and trigram similarity)
-- executed when users search keywords in the primary search bar (src/app/scholarships/page.tsx).
CREATE INDEX IF NOT EXISTS idx_scholarships_title_trgm
  ON scholarships USING gin (title gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_scholarships_provider_trgm
  ON scholarships USING gin (provider gin_trgm_ops);

-- 3. GIN Indexes on Array Filter Columns
-- Justification: Directly accelerates PostgreSQL array overlap operators (`&&`) and containment (`@>`)
-- utilized extensively in multi-select faceted search filtering.

-- Query: scholarships.filter('academic_levels', 'ov', selectedLevels)
CREATE INDEX IF NOT EXISTS idx_scholarships_academic_levels_gin
  ON scholarships USING gin (academic_levels);

-- Query: scholarships.filter('streams', 'ov', selectedStreams)
CREATE INDEX IF NOT EXISTS idx_scholarships_streams_gin
  ON scholarships USING gin (streams);

-- Query: scholarships.filter('caste_categories', 'ov', selectedCastes)
CREATE INDEX IF NOT EXISTS idx_scholarships_caste_categories_gin
  ON scholarships USING gin (caste_categories);

-- Query: scholarships.filter('special_backgrounds', 'ov', selectedBackgrounds)
CREATE INDEX IF NOT EXISTS idx_scholarships_special_backgrounds_gin
  ON scholarships USING gin (special_backgrounds);

-- Query: scholarships.filter('tags', 'ov', selectedTags)
CREATE INDEX IF NOT EXISTS idx_scholarships_tags_gin
  ON scholarships USING gin (tags);

-- Query: scholarships.filter('portal_source', 'ov', selectedSources)
CREATE INDEX IF NOT EXISTS idx_scholarships_portal_source_gin
  ON scholarships USING gin (portal_source);

-- Query: scholarships.filter('course_specializations', 'ov', selectedSpecializations)
CREATE INDEX IF NOT EXISTS idx_scholarships_course_specializations_gin
  ON scholarships USING gin (course_specializations);

-- Query: scholarships.filter('institution_types', 'ov', selectedInstitutionTypes)
CREATE INDEX IF NOT EXISTS idx_scholarships_institution_types_gin
  ON scholarships USING gin (institution_types);

-- 4. Sample Data Identification Column
-- Justification: Distinguishes deterministically generated test datasets from verified, production financial aid listings.
ALTER TABLE scholarships
  ADD COLUMN IF NOT EXISTS is_sample BOOLEAN DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_scholarships_is_sample
  ON scholarships (is_sample);
