import { describe, it, expect } from 'vitest'
import { ServiceError, NotFoundError, ValidationError } from './errors'

describe('ServiceError', () => {
  it('stores message and code', () => {
    const err = new ServiceError('something failed', 'GENERIC')
    expect(err.message).toBe('something failed')
    expect(err.code).toBe('GENERIC')
    expect(err).toBeInstanceOf(Error)
  })
})

describe('NotFoundError', () => {
  it('formats entity and identifier into message', () => {
    const err = new NotFoundError('Brand', 'cool-brand')
    expect(err.message).toBe('Brand not found: cool-brand')
    expect(err.code).toBe('NOT_FOUND')
    expect(err).toBeInstanceOf(ServiceError)
  })
})

describe('ValidationError', () => {
  it('uses VALIDATION_ERROR code', () => {
    const err = new ValidationError('slug already exists')
    expect(err.message).toBe('slug already exists')
    expect(err.code).toBe('VALIDATION_ERROR')
    expect(err).toBeInstanceOf(ServiceError)
  })
})
