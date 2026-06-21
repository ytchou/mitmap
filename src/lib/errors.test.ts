import { describe, it, expect } from 'vitest';
import { ServiceError, NotFoundError, ValidationError } from './errors';

describe('ServiceError cause chain', () => {
  it('preserves cause when provided', () => {
    const original = new Error('PostgREST: relation not found');
    const wrapped = new ServiceError('Service failed', 'DB_ERROR', {
      cause: original,
    });
    expect(wrapped.message).toBe('Service failed');
    expect(wrapped.code).toBe('DB_ERROR');
    expect(wrapped.cause).toBe(original);
  });

  it('works without cause (backward compatible)', () => {
    const err = new ServiceError('Service failed', 'DB_ERROR');
    expect(err.message).toBe('Service failed');
    expect(err.code).toBe('DB_ERROR');
    expect(err.cause).toBeUndefined();
  });
});

describe('NotFoundError cause chain', () => {
  it('preserves cause through to base class', () => {
    const pgError = { code: 'PGRST116', message: 'no rows', details: null, hint: null };
    const err = new NotFoundError('Brand', 'test-slug', { cause: pgError });
    expect(err.message).toContain('Brand');
    expect(err.message).toContain('test-slug');
    expect(err.code).toBe('NOT_FOUND');
    expect(err.cause).toBe(pgError);
  });

  it('works without cause (backward compatible)', () => {
    const err = new NotFoundError('Brand', 'test-slug');
    expect(err.cause).toBeUndefined();
  });
});

describe('ValidationError cause chain', () => {
  it('preserves cause through to base class', () => {
    const original = new Error('constraint violation');
    const err = new ValidationError('Invalid input', { cause: original });
    expect(err.cause).toBe(original);
  });
});
