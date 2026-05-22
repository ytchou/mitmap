import { NextResponse } from 'next/server'
import { searchBrands } from '@/lib/services/brands'

const CACHE_CONTROL = 'public, s-maxage=60, stale-while-revalidate=300'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q')?.trim() ?? ''
  const limitParam = searchParams.get('limit')

  if (!q || q.length > 100) {
    return NextResponse.json(
      { error: "Query parameter 'q' is required and must be 1-100 characters" },
      { status: 400 },
    )
  }

  const limit = Math.min(limitParam ? parseInt(limitParam, 10) || 5 : 5, 10)

  try {
    const results = await searchBrands(q, limit)

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
