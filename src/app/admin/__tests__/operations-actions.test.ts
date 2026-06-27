import { describe, expect, it } from 'vitest'

describe('curation server actions', () => {
  it('exports startCurationJobAction', async () => {
    const mod = await import('../operations/actions')
    expect(mod.startCurationJobAction).toBeDefined()
    expect(typeof mod.startCurationJobAction).toBe('function')
  })
})
