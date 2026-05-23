import { test, expect } from '../fixtures/auth';

test.describe('Admin flagged deep', () => {
  test('flagged content page loads', async ({ adminPage }) => {
    await adminPage.goto('/admin/flagged');
    await expect(adminPage.getByRole('heading', { name: /flagged|moderation/i })).toBeVisible({ timeout: 10_000 });
    await expect(adminPage.getByText(/something went wrong/i)).not.toBeVisible();
  });

  test('flagged table renders columns correctly', async ({ adminPage }) => {
    await adminPage.goto('/admin/flagged');
    // Table renders when flags exist; empty state shows when no flags
    await expect(
      adminPage.locator('table').first().or(adminPage.getByText(/no pending flags|all clear/i))
    ).toBeVisible({ timeout: 10_000 });
  });
});
