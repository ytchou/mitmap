import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const CACHE_CONTROL = 'public, s-maxage=60, stale-while-revalidate=300'

type SearchBrandRow = {
  id: string
  name: string
  slug: string
  primary_category_name: string | null
  rank_score: number
}

type SearchBrandsRpc = (
  fn: 'search_brands',
  args: {
    search_query: string
    result_limit: number
    prefix_mode: true
  },
) => Promise<{
  data: SearchBrandRow[] | null
  error: unknown
}>

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q')?.trim() ?? ''
  const limitParam = searchParams.get('limit')

  if (!query || query.length > 100) {
    return NextResponse.json(
      { error: "Query parameter 'q' is required and must be 1-100 characters" },
      { status: 400 },
    )
  }

  const limit = Math.min(limitParam ? parseInt(limitParam, 10) || 5 : 5, 10)

  try {
    const supabase = await createClient()
    const searchBrandsRpc = supabase.rpc as unknown as SearchBrandsRpc
    const { data, error } = await searchBrandsRpc('search_brands', {
      search_query: query,
      result_limit: limit,
      prefix_mode: true,
    })

    if (error) {
      throw error
    }

    const results = (data ?? []).map((row) => ({
      id: row.id,
      name: row.name,
      slug: row.slug,
      category: row.primary_category_name,
      similarity: row.rank_score,
    }))

    return NextResponse.json(
      { results },
      {
        headers: {
          'Cache-Control': CACHE_CONTROL,
        },
      },
    )
  } catch {
    return NextResponse.json(
      { results: [] },
      {
        headers: {
          'Cache-Control': CACHE_CONTROL,
        },
      },
    )
  }
}
