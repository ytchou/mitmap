import { describe, it, expect, vi, beforeEach } from 'vitest'
import { uploadProcessedImage } from '@/lib/services/image-upload'

const uploadMock = vi.fn()
const getPublicUrlMock = vi.fn(() => ({ data: { publicUrl: 'https://x.supabase.co/pub' } }))
vi.mock('@/lib/supabase/server', () => ({
  createServiceClient: () => ({
    storage: { from: () => ({ upload: uploadMock, getPublicUrl: getPublicUrlMock }) },
  }),
}))

describe('uploadProcessedImage', () => {
  beforeEach(() => { uploadMock.mockReset(); uploadMock.mockResolvedValue({ data: { path: 'claim-proofs/u1/b1/x.webp' }, error: null }) })

  it('returns the storage key (not a public URL) for the private claim-proofs bucket', async () => {
    const res = await uploadProcessedImage({ bucket: 'claim-proofs', path: 'u1/b1/x.webp', data: Buffer.from('x'), contentType: 'image/webp' })
    expect(res.key).toBe('claim-proofs/u1/b1/x.webp')
    expect(getPublicUrlMock).not.toHaveBeenCalled()
  })

  it('still returns a public URL for the public brand-images bucket', async () => {
    const res = await uploadProcessedImage({ bucket: 'brand-images', path: 'b/y.webp', data: Buffer.from('y'), contentType: 'image/webp' })
    expect(res.url).toContain('http')
  })
})
