// @vitest-environment jsdom
import { render, screen, fireEvent } from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'
import { expect, it, vi } from 'vitest'
import messages from '@/../messages/zh-TW.json'
import { ClaimBrandCta } from '@/components/brands/claim-brand-cta'

vi.mock('@/lib/auth/use-user', () => ({ useUser: () => ({ user: null, loading: false }) }))
vi.mock('@/i18n/navigation', () => ({
  Link: ({ href, children, ...rest }: { href: string; children: React.ReactNode; [key: string]: unknown }) => (
    <a href={href} {...rest}>{children}</a>
  ),
}))
vi.mock('@/components/upload/useImageUpload', () => ({ useImageUpload: () => ({ upload: vi.fn(), uploading: false, progress: 0 }) }))
const submitClaimAction = vi.fn(async (input: unknown) => {
  void input
  return { ok: true }
})
vi.mock('@/app/[locale]/brands/[slug]/actions', () => ({ submitClaimAction: (...a: unknown[]) => submitClaimAction(a[0]) }))

const renderCta = () => render(
  <NextIntlClientProvider locale="zh-TW" messages={messages}>
    <ClaimBrandCta brandId="b1" />
  </NextIntlClientProvider>,
)

it('disables submit until 2 proof types are selected', () => {
  renderCta()
  fireEvent.click(screen.getByText('認領這個品牌'))
  fireEvent.click(screen.getByLabelText('品牌網域信箱'))
  expect(screen.getByRole('button', { name: /送出認領申請/ })).toBeDisabled()
  fireEvent.click(screen.getByLabelText('商業登記文件'))
  expect(screen.queryByText(/需再選/)).not.toBeInTheDocument()
})

it('does not render the removed 備註 field or the MIT email line', () => {
  renderCta()
  fireEvent.click(screen.getByText('認領這個品牌'))
  expect(screen.queryByText('認領備註')).not.toBeInTheDocument()
  expect(screen.queryByText(/來信.*申請驗證/)).not.toBeInTheDocument()
})
