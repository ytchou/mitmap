-- Batch pg_trgm similarity check for bulk import dedup.
-- Reuses existing GIN trigram indexes on brands.name.
CREATE OR REPLACE FUNCTION find_similar_brands(
  p_names text[],
  p_threshold float DEFAULT 0.3
)
RETURNS TABLE(input_name text, brand_name text, brand_slug text, similarity_score float)
LANGUAGE sql STABLE
AS $$
  SELECT
    n AS input_name,
    b.name AS brand_name,
    b.slug AS brand_slug,
    word_similarity(b.name, n)::float AS similarity_score
  FROM unnest(p_names) AS n
  JOIN brands b ON word_similarity(b.name, n) >= p_threshold
  WHERE b.status = 'approved'
  ORDER BY n, word_similarity(b.name, n) DESC;
$$;
