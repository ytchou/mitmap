import { test, expect } from '../fixtures/auth';
import { createClient } from '@supabase/supabase-js';

const TEST_PREFIX = '[E2E-TEST]' as const;

test.describe('Submit smoke', () => {
  test.afterAll(async () => {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    await supabase.from('brand_submissions').delete().like('brand_name', `${TEST_PREFIX}%`);
  });

  test('authenticated user can see submit wizard', async ({ userPage }) => {
    await userPage.goto('/submit');
    // Heading should be visible (bilingual: English or Chinese)
    await expect(userPage.getByRole('heading', { level: 1 })).toBeVisible({ timeout: 5_000 });
    // The wizard form should render with at least one input
    await expect(
      userPage.locator('input[type="url"], input[type="text"], [role="textbox"]').first()
    ).toBeVisible({ timeout: 5_000 });
  });
});
