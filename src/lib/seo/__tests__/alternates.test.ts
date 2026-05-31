import { describe, it, expect } from 'vitest'
import { buildAlternates } from '../alternates'

const base = (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').replace(/\/$/, '')

describe('buildAlternates', () => {
  describe("path '/brands' locale 'en'", () => {
    const result = buildAlternates('/brands', 'en')

    it('canonical is the en self URL', () => {
      expect(result.canonical).toBe(`${base}/en/brands`)
    })

    it('languages.zh-TW is prefix-free', () => {
      expect(result.languages['zh-TW']).toBe(`${base}/brands`)
    })

    it('languages.en has /en prefix', () => {
      expect(result.languages['en']).toBe(`${base}/en/brands`)
    })

    it('x-default equals zh-TW URL', () => {
      expect(result.languages['x-default']).toBe(`${base}/brands`)
    })
  })

  describe("path '/brands' locale 'zh-TW'", () => {
    const result = buildAlternates('/brands', 'zh-TW')

    it('canonical is the zh-TW self URL (prefix-free)', () => {
      expect(result.canonical).toBe(`${base}/brands`)
    })

    it('languages.zh-TW is prefix-free', () => {
      expect(result.languages['zh-TW']).toBe(`${base}/brands`)
    })

    it('languages.en has /en prefix', () => {
      expect(result.languages['en']).toBe(`${base}/en/brands`)
    })

    it('x-default equals zh-TW URL', () => {
      expect(result.languages['x-default']).toBe(`${base}/brands`)
    })
  })

  describe('home path normalization', () => {
    it("empty string produces base URL without trailing slash for zh-TW", () => {
      const result = buildAlternates('', 'zh-TW')
      expect(result.canonical).toBe(base)
      expect(result.languages['zh-TW']).toBe(base)
      expect(result.languages['en']).toBe(`${base}/en`)
    })

    it("'/' produces base URL without trailing slash for zh-TW", () => {
      const result = buildAlternates('/', 'zh-TW')
      expect(result.canonical).toBe(base)
      expect(result.languages['zh-TW']).toBe(base)
      expect(result.languages['en']).toBe(`${base}/en`)
    })

    it("'/' for locale 'en' canonical is /en", () => {
      const result = buildAlternates('/', 'en')
      expect(result.canonical).toBe(`${base}/en`)
    })
  })

  describe('nested paths', () => {
    it('brand slug path works correctly', () => {
      const result = buildAlternates('/brands/acme', 'zh-TW')
      expect(result.canonical).toBe(`${base}/brands/acme`)
      expect(result.languages['en']).toBe(`${base}/en/brands/acme`)
    })
  })
})
