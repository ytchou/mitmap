import { describe, it, expect } from 'vitest'
import {
  isAllowedImageHost,
  safeImageSrc,
  ALLOWED_IMAGE_HOSTS,
} from '@/lib/images/allowed-image-hosts'

describe('isAllowedImageHost', () => {
  it('matches exact hosts', () => {
    expect(isAllowedImageHost('cdn01.pinkoi.com')).toBe(true)
    expect(isAllowedImageHost('img.shoplineapp.com')).toBe(true)
  })

  it('matches wildcard hosts at any subdomain depth', () => {
    expect(isAllowedImageHost('abc.supabase.co')).toBe(true)
    expect(isAllowedImageHost('project.storage.supabase.co')).toBe(true)
  })

  it('rejects non-allowlisted hosts', () => {
    expect(isAllowedImageHost('www.facebook.com')).toBe(false)
    expect(isAllowedImageHost('static.wixstatic.com')).toBe(false)
    expect(isAllowedImageHost('supabase.co.evil.com')).toBe(false)
  })

  it('keeps next.config remotePatterns in sync (no host added/dropped silently)', () => {
    expect(ALLOWED_IMAGE_HOSTS).toContain('cdn01.pinkoi.com')
    expect(ALLOWED_IMAGE_HOSTS).not.toContain('www.facebook.com')
  })
})

describe('safeImageSrc', () => {
  it('upgrades http to https for allowed hosts (next/image is https-only)', () => {
    expect(safeImageSrc('http://cdn01.pinkoi.com/store/x/logo/original.jpg')).toBe(
      'https://cdn01.pinkoi.com/store/x/logo/original.jpg',
    )
  })

  it('returns https URLs on allowed hosts unchanged', () => {
    expect(safeImageSrc('https://img.shoplineapp.com/a/b.png')).toBe(
      'https://img.shoplineapp.com/a/b.png',
    )
  })

  it('returns null for non-allowlisted hosts (e.g. tracking pixels)', () => {
    expect(
      safeImageSrc('https://www.facebook.com/tr?id=123&ev=PageView&noscript=1'),
    ).toBeNull()
    expect(safeImageSrc('https://tr.line.me/tag.gif?x=1')).toBeNull()
  })

  it('returns null for invalid, empty, or non-http(s) URLs', () => {
    expect(safeImageSrc(null)).toBeNull()
    expect(safeImageSrc(undefined)).toBeNull()
    expect(safeImageSrc('')).toBeNull()
    expect(safeImageSrc('not a url')).toBeNull()
    expect(safeImageSrc('data:image/png;base64,iVBOR')).toBeNull()
  })
})
