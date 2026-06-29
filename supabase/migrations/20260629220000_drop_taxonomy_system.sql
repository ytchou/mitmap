-- =============================================================================
-- Drop the taxonomy tag system (brand_taxonomy, taxonomy_tags, tag_slugs)
-- Keeps: brands.product_tags (free-form AI tags), brands.category
-- Removes: brand_taxonomy join table, taxonomy_tags table, tag_slugs column,
--          value_tags column on brand_ai_results, all related triggers/functions
--
-- IMPORTANT: Deploy the code changes FIRST, then run this migration.
-- The code no longer references any of these objects.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. Rewrite search_brands() RPC — remove tag_slugs filter + ranking
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION search_brands(
  search_query text,
  result_limit int DEFAULT NULL,
  prefix_mode boolean DEFAULT false,
  filter_categories text[] DEFAULT NULL,
  filter_tags text[] DEFAULT NULL,
  filter_verification text DEFAULT NULL,
  filter_status text DEFAULT 'approved',
  include_test_brands boolean DEFAULT false
)
RETURNS TABLE(
  id uuid,
  name text,
  slug text,
  hero_image_url text,
  primary_category_name text,
  rank_score real,
  search_source text
)
AS $$
DECLARE
  tsq tsquery;
BEGIN
  IF prefix_mode THEN
    tsq := to_tsquery('english', regexp_replace(search_query, '\s+', ':* & ', 'g') || ':*');
  ELSE
    tsq := websearch_to_tsquery('english', search_query);
  END IF;

  RETURN QUERY
  WITH fts_results AS (
    SELECT
      b.id,
      b.name,
      b.slug,
      b.hero_image_url,
      b.product_type AS primary_category_name,
      ts_rank(b.search_vector, tsq)::real AS rank_score,
      'fts'::text AS search_source
    FROM brands b
    LEFT JOIN brand_owners bo ON bo.brand_id = b.id
    WHERE b.search_vector @@ tsq
      AND b.status = filter_status
      AND (include_test_brands OR b.is_demo IS NOT TRUE)
      AND (filter_categories IS NULL OR b.product_type = ANY(filter_categories))
      AND (
        filter_verification IS NULL
        OR (filter_verification = 'verified' AND b.mit_status = 'verified')
        OR (filter_verification = 'owned' AND bo.brand_id IS NOT NULL)
      )
    ORDER BY ts_rank(b.search_vector, tsq)::real DESC
    LIMIT result_limit
  ),
  trgm_results AS (
    SELECT
      b.id,
      b.name,
      b.slug,
      b.hero_image_url,
      b.product_type AS primary_category_name,
      scores.rank_score,
      'trgm'::text AS search_source
    FROM brands b
    LEFT JOIN brand_owners bo ON bo.brand_id = b.id
    CROSS JOIN LATERAL (
      SELECT GREATEST(
        word_similarity(search_query, b.name) * 1.0,
        word_similarity(search_query, COALESCE(b.product_type, '')) * 0.8,
        word_similarity(search_query, COALESCE(array_to_string(b.product_tags, ' '), '')) * 0.6,
        word_similarity(search_query, COALESCE(b.description, '')) * 0.5
      )::real AS rank_score
    ) scores
    WHERE NOT EXISTS (SELECT 1 FROM fts_results)
      AND scores.rank_score >= 0.25
      AND b.status = filter_status
      AND (include_test_brands OR b.is_demo IS NOT TRUE)
      AND (filter_categories IS NULL OR b.product_type = ANY(filter_categories))
      AND (
        filter_verification IS NULL
        OR (filter_verification = 'verified' AND b.mit_status = 'verified')
        OR (filter_verification = 'owned' AND bo.brand_id IS NOT NULL)
      )
    ORDER BY scores.rank_score DESC
    LIMIT result_limit
  )
  SELECT * FROM fts_results
  UNION ALL
  SELECT * FROM trgm_results;
EXCEPTION
  WHEN others THEN
    RETURN QUERY
    SELECT
      b.id,
      b.name,
      b.slug,
      b.hero_image_url,
      b.product_type AS primary_category_name,
      scores.rank_score,
      'trgm'::text AS search_source
    FROM brands b
    LEFT JOIN brand_owners bo ON bo.brand_id = b.id
    CROSS JOIN LATERAL (
      SELECT GREATEST(
        word_similarity(search_query, b.name) * 1.0,
        word_similarity(search_query, COALESCE(b.product_type, '')) * 0.8,
        word_similarity(search_query, COALESCE(array_to_string(b.product_tags, ' '), '')) * 0.6,
        word_similarity(search_query, COALESCE(b.description, '')) * 0.5
      )::real AS rank_score
    ) scores
    WHERE scores.rank_score >= 0.25
      AND b.status = filter_status
      AND (include_test_brands OR b.is_demo IS NOT TRUE)
      AND (filter_categories IS NULL OR b.product_type = ANY(filter_categories))
      AND (
        filter_verification IS NULL
        OR (filter_verification = 'verified' AND b.mit_status = 'verified')
        OR (filter_verification = 'owned' AND bo.brand_id IS NOT NULL)
      )
    ORDER BY scores.rank_score DESC
    LIMIT result_limit;
END;
$$ LANGUAGE plpgsql STABLE;

-- ---------------------------------------------------------------------------
-- 2. Rewrite search_vector trigger — remove tag_slugs, use product_tags
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION brands_search_vector_update() RETURNS trigger AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.name, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.product_type, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(array_to_string(NEW.product_tags, ' '), '')), 'C') ||
    setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'D');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql VOLATILE;

-- Recreate trigger to fire on product_tags instead of tag_slugs
DROP TRIGGER IF EXISTS brands_search_vector_trigger ON brands;
CREATE TRIGGER brands_search_vector_trigger
  BEFORE INSERT OR UPDATE OF name, product_type, product_tags, description
  ON brands
  FOR EACH ROW
  EXECUTE FUNCTION brands_search_vector_update();

-- Backfill search_vector for all rows (swap tag_slugs → product_tags)
UPDATE brands SET
  search_vector =
    setweight(to_tsvector('english', COALESCE(name, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(product_type, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(array_to_string(product_tags, ' '), '')), 'C') ||
    setweight(to_tsvector('english', COALESCE(description, '')), 'D');

-- ---------------------------------------------------------------------------
-- 3. Drop tag_slugs sync triggers (on brand_taxonomy / taxonomy_tags)
-- ---------------------------------------------------------------------------

DROP TRIGGER IF EXISTS brand_taxonomy_tag_slugs ON brand_taxonomy;
DROP TRIGGER IF EXISTS taxonomy_tags_slug_sync ON taxonomy_tags;

-- ---------------------------------------------------------------------------
-- 4. Drop tag_slugs sync functions
-- ---------------------------------------------------------------------------

DROP FUNCTION IF EXISTS refresh_brand_tag_slugs(uuid);
DROP FUNCTION IF EXISTS brand_taxonomy_sync_tag_slugs();
DROP FUNCTION IF EXISTS taxonomy_tags_sync_tag_slugs();

-- ---------------------------------------------------------------------------
-- 5. Drop indexes
-- ---------------------------------------------------------------------------

DROP INDEX IF EXISTS idx_brands_tag_slugs;
DROP INDEX IF EXISTS idx_brand_taxonomy_source;

-- ---------------------------------------------------------------------------
-- 6. Drop RLS policies
-- ---------------------------------------------------------------------------

DROP POLICY IF EXISTS "Public can read active tags" ON taxonomy_tags;
DROP POLICY IF EXISTS "Public can read brand taxonomy" ON brand_taxonomy;

-- ---------------------------------------------------------------------------
-- 7. Drop tables (child first, then parent)
-- ---------------------------------------------------------------------------

DROP TABLE IF EXISTS brand_taxonomy;
DROP TABLE IF EXISTS taxonomy_tags;

-- ---------------------------------------------------------------------------
-- 8. Drop columns
-- ---------------------------------------------------------------------------

ALTER TABLE brands DROP COLUMN IF EXISTS tag_slugs;
ALTER TABLE brand_ai_results DROP COLUMN IF EXISTS value_tags;
