import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock must be at top-level for vitest hoisting
const mockFrom = vi.fn()
vi.mock('@/lib/supabase/server', () => ({
  createServiceClient: vi.fn(() => ({
    from: mockFrom,
  })),
}))

import {
  setBrandTags,
  addTagToBrand,
  removeTagFromBrand,
  getUntaggedBrands,
  getValueTagsWithCoverage,
} from '../taxonomy'

// Build a chainable thenable proxy. Every property access returns a fn that returns another proxy.
// When awaited, the proxy resolves to resolveValue.
function makeChain(resolveValue: { data: unknown; error: unknown }) {
  function buildProxy(): object {
    return new Proxy(
      {},
      {
        get(_target, prop) {
          if (prop === 'then') {
            return (resolve: (v: unknown) => void) => resolve(resolveValue)
          }
          if (prop === Symbol.toPrimitive || prop === Symbol.iterator) return undefined
          return vi.fn(() => buildProxy())
        },
      }
    )
  }
  return buildProxy()
}

describe('setBrandTags', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('deletes existing brand_taxonomy rows then inserts new ones', async () => {
    mockFrom.mockReturnValue(makeChain({ data: null, error: null }))

    await setBrandTags('brand-1', ['tag-1', 'tag-2'])

    expect(mockFrom).toHaveBeenCalledWith('brand_taxonomy')
    // select (preflight) + delete + insert = 3 calls
    expect(mockFrom).toHaveBeenCalledTimes(3)
  })

  it('skips insert when tagIds is empty (untagging)', async () => {
    mockFrom.mockReturnValue(makeChain({ data: null, error: null }))

    await setBrandTags('brand-1', [])

    // select (preflight) + delete = 2 calls; insert is skipped
    expect(mockFrom).toHaveBeenCalledTimes(2)
  })

  it('inserts brand and tag ids only', async () => {
    const insertedRows: unknown[] = []

    // Calls: 1=select (preflight), 2=delete, 3=insert
    let callCount = 0
    mockFrom.mockImplementation(() => {
      callCount++
      if (callCount <= 2) return makeChain({ data: null, error: null })
      // Third call: intercept insert
      const insertMock = vi.fn((rows: unknown[]) => {
        insertedRows.push(...rows)
        return makeChain({ data: null, error: null })
      })
      return { insert: insertMock }
    })

    await setBrandTags('brand-1', ['tag-a'])

    expect(insertedRows).toEqual([{ brand_id: 'brand-1', tag_id: 'tag-a' }])
  })
})

describe('addTagToBrand', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('upserts brand_taxonomy with correct fields', async () => {
    const upsertMock = vi.fn(() => makeChain({ data: null, error: null }))
    mockFrom.mockReturnValue({ upsert: upsertMock })

    await addTagToBrand('brand-1', 'tag-1')

    expect(mockFrom).toHaveBeenCalledWith('brand_taxonomy')
    expect(upsertMock).toHaveBeenCalledWith(
      { brand_id: 'brand-1', tag_id: 'tag-1' },
      { onConflict: 'brand_id,tag_id' }
    )
  })
})

describe('removeTagFromBrand', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('deletes from brand_taxonomy matching brand_id and tag_id', async () => {
    // Track the delete call
    const deleteMock = vi.fn(() => makeChain({ data: null, error: null }))
    mockFrom.mockReturnValue({ delete: deleteMock })

    await removeTagFromBrand('brand-1', 'tag-1')

    expect(mockFrom).toHaveBeenCalledWith('brand_taxonomy')
    expect(deleteMock).toHaveBeenCalled()
  })
})

describe('getUntaggedBrands', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns an array of brands filtered from brand_taxonomy left join', async () => {
    // The implementation uses a left join and filters client-side for empty brand_taxonomy arrays
    const dbRows = [
      { id: 'b1', name: 'Brand One', slug: 'brand-one', category: 'Fashion', brand_taxonomy: [] },
      {
        id: 'b2',
        name: 'Brand Two',
        slug: 'brand-two',
        category: 'Food',
        brand_taxonomy: [{ brand_id: 'b2' }],
      }, // tagged — should be filtered out
    ]
    mockFrom.mockReturnValue(makeChain({ data: dbRows, error: null }))

    const result = await getUntaggedBrands()

    expect(Array.isArray(result)).toBe(true)
    expect(result.length).toBe(1)
    expect(result[0]).toMatchObject({ id: 'b1', name: 'Brand One', slug: 'brand-one' })
  })

  it('returns empty array when no untagged brands', async () => {
    mockFrom.mockReturnValue(makeChain({ data: [], error: null }))

    const result = await getUntaggedBrands()

    expect(result).toEqual([])
  })

  it('queries brands table', async () => {
    mockFrom.mockReturnValue(makeChain({ data: [], error: null }))

    await getUntaggedBrands()

    expect(mockFrom).toHaveBeenCalledWith('brands')
  })
})

describe('getValueTagsWithCoverage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // Helper to make a flat tag row (one row per join result)
  function makeValueTagRow(overrides: Partial<{ id: string; slug: string; name: string; name_zh: string }>) {
    return {
      id: overrides.id ?? 'tag-uuid',
      name: overrides.name ?? 'Test Tag',
      name_zh: overrides.name_zh ?? null,
      slug: overrides.slug ?? 'test-tag',
      category: 'value',
      is_active: true,
      suggested_by: null,
      created_at: '2026-01-01T00:00:00Z',
    }
  }

  it('returns value tags that have at least minBrands approved brands', async () => {
    // sustainability appears 3x (3 approved brands), handmade 2x, organic 1x
    const rows = [
      makeValueTagRow({ id: 'sust-id', slug: 'sustainability', name: 'Sustainability', name_zh: '永續' }),
      makeValueTagRow({ id: 'sust-id', slug: 'sustainability', name: 'Sustainability', name_zh: '永續' }),
      makeValueTagRow({ id: 'sust-id', slug: 'sustainability', name: 'Sustainability', name_zh: '永續' }),
      makeValueTagRow({ id: 'hand-id', slug: 'handmade', name: 'Handmade', name_zh: '手作' }),
      makeValueTagRow({ id: 'hand-id', slug: 'handmade', name: 'Handmade', name_zh: '手作' }),
      makeValueTagRow({ id: 'org-id', slug: 'organic', name: 'Organic', name_zh: '有機' }),
    ]
    mockFrom.mockReturnValue(makeChain({ data: rows, error: null }))

    const result = await getValueTagsWithCoverage(2)

    expect(result).toHaveLength(2)
    const slugs = result.map((t) => t.slug)
    expect(slugs).toContain('sustainability')
    expect(slugs).toContain('handmade')
    expect(slugs).not.toContain('organic') // only 1 brand — below minBrands=2
  })

  it('returns all tags with ≥1 brand when minBrands defaults to 1', async () => {
    const rows = [
      makeValueTagRow({ id: 'sust-id', slug: 'sustainability' }),
      makeValueTagRow({ id: 'org-id', slug: 'organic' }),
    ]
    mockFrom.mockReturnValue(makeChain({ data: rows, error: null }))

    const result = await getValueTagsWithCoverage()

    expect(result).toHaveLength(2)
  })

  it('returns empty array when no tags have approved brands', async () => {
    mockFrom.mockReturnValue(makeChain({ data: [], error: null }))

    const result = await getValueTagsWithCoverage()

    expect(result).toHaveLength(0)
  })

  it('throws when supabase returns an error', async () => {
    mockFrom.mockReturnValue(makeChain({ data: null, error: new Error('DB error') }))

    await expect(getValueTagsWithCoverage()).rejects.toThrow('DB error')
  })
})
