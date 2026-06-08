-- Rollback for scripts/backfill-legacy-category-tags.sql
-- Deletes ONLY the product_type tags inserted by that backfill: rows where the
-- brand's legacy category maps to the assigned tag AND source='auto'. Precise —
-- does not touch human ('manual') tags or any other product_type associations.

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
delete from brand_taxonomy bt
using brands b, resolved r
where bt.brand_id = b.id
  and bt.tag_id = r.tag_id
  and b.category = r.legacy
  and bt.source = 'auto';
