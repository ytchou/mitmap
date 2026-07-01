// @vitest-environment jsdom
import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { DashboardContentLayout } from '../dashboard-content-layout'

const usePathname = vi.fn()

vi.mock('next/navigation', () => ({
  usePathname: () => usePathname(),
}))

describe('DashboardContentLayout', () => {
  beforeEach(() => {
    usePathname.mockReturnValue('/dashboard')
  })

  it('shows the onboarding rail while onboarding is incomplete', () => {
    render(
      <DashboardContentLayout
        onboarding={<div>Onboarding checklist</div>}
        showOnboarding
      >
        <div>Brand information</div>
      </DashboardContentLayout>
    )

    expect(screen.getByRole('complementary')).toHaveTextContent('Onboarding checklist')
    expect(screen.getByText('Brand information')).toBeInTheDocument()
  })

  it('uses the full-width content layout after onboarding is complete', () => {
    render(
      <DashboardContentLayout
        onboarding={<div>Onboarding checklist</div>}
        showOnboarding={false}
      >
        <div>Brand information</div>
      </DashboardContentLayout>
    )

    expect(screen.queryByRole('complementary')).not.toBeInTheDocument()
  })

  it('does not repeat the rail on the full checklist page', () => {
    usePathname.mockReturnValue('/dashboard/onboarding')

    render(
      <DashboardContentLayout
        onboarding={<div>Onboarding checklist</div>}
        showOnboarding
      >
        <div>Full checklist</div>
      </DashboardContentLayout>
    )

    expect(screen.queryByRole('complementary')).not.toBeInTheDocument()
    expect(screen.getByText('Full checklist')).toBeInTheDocument()
  })
})
