-- One-time backfill: give approved brands that have NO product_type taxonomy tag
-- a canonical product_type tag derived from their legacy free-text `brands.category`.
-- This makes the brand-card category chip localize (renders tag.name_zh) and makes
-- the brand filterable in the category nav. Non-destructive: only INSERTs into
-- brand_taxonomy; the legacy brands.category column is left untouched (analytics).
--
-- Rows are marked source='auto' so they can be identified/rolled back:
--   see scripts/rollback-legacy-category-tags.sql
--
-- Intentionally NOT mapped (no clean canonical tag — left untagged for manual review):
--   'Others' (7), 'Tools & Hardware' (5), 'Health & Wellness' (4)

with mapping(legacy, slug) as (
  values
    ('Baby & Kids',              'baby-kids'),
    ('Bags & Accessories',       'bags'),
    ('Beauty & Personal Care',   'beauty'),
    ('Bedding & Home Textiles',  'home'),
    ('Crafts, Stationery & Art', 'crafts'),
    ('Fashion & Apparel',        'clothing'),
    ('Food & Beverage',          'food'),
    ('Footwear',                 'footwear'),
    ('Furniture & Home Living',  'home'),
    ('Jewelry',                  'jewelry'),
    ('Pet',                      'pets'),
    ('Sports & Outdoor',         'outdoor'),
    ('生活雜貨',                  'home')
),
resolved as (
  select m.legacy, t.id as tag_id
  from mapping m
  join taxonomy_tags t on t.slug = m.slug and t.category = 'product_type'
)
insert into brand_taxonomy (brand_id, tag_id, source)
select b.id, r.tag_id, 'auto'
from brands b
join resolved r on r.legacy = b.category
where b.status = 'approved'
  and not exists (
    select 1 from brand_taxonomy bt
    join taxonomy_tags t2 on t2.id = bt.tag_id
    where bt.brand_id = b.id and t2.category = 'product_type'
  )
on conflict (brand_id, tag_id) do nothing
returning brand_id, tag_id;
