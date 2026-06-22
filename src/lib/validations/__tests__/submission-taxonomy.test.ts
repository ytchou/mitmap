import { describe, it, expect } from 'vitest'
import { createSubmissionSchema, getBrandInfoSchema } from '../submission'

const t = (key: string) => key

describe('submission schema — taxonomy fields', () => {
  it('accepts valid region slug', () => {
    const schema = getBrandInfoSchema(t)
    const result = schema.safeParse({
      name: 'Test Brand',
      website: 'https://example.com',
      region: 'taipei',
    })
    expect(result.success).toBe(true)
  })

  it('rejects missing region (required)', () => {
    const schema = getBrandInfoSchema(t)
    const result = schema.safeParse({
      name: 'Test Brand',
      website: 'https://example.com',
    })
    expect(result.success).toBe(false)
  })

  it('createSubmissionSchema includes region, not tags', () => {
    const schema = createSubmissionSchema(true, t)
    const shape = schema.shape
    expect(shape).toHaveProperty('region')
    expect(shape).not.toHaveProperty('tags')
    expect(shape).not.toHaveProperty('valueTags')
  })
})
