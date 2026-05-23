import { test, expect } from '../fixtures/auth';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySupabaseClient = SupabaseClient<any, any, any>;

test.describe('Admin smoke', () => {
  let testSubmissionId: string;
  let testBrandName: string;
  let supabaseAdmin: AnySupabaseClient;

  test.beforeAll(async () => {
    supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    testBrandName = `[E2E-TEST] Admin Smoke ${Date.now()}`;
    const { data, error } = await supabaseAdmin
      .from('brand_submissions')
      .insert({
        brand_name: testBrandName,
        website_url: 'https://e2e-test.example.com',
        status: 'pending',
        submitter_email: process.env.E2E_USER_EMAIL,
      })
      .select('id')
      .single();
    if (error) throw new Error(`Failed to create test submission: ${error.message}`);
    testSubmissionId = data?.id;
  });

  test.afterAll(async () => {
    if (testSubmissionId && supabaseAdmin) {
      await supabaseAdmin.from('brand_submissions').delete().eq('id', testSubmissionId);
    }
  });

  test('admin dashboard loads', async ({ adminPage }) => {
    await adminPage.goto('/admin');
    // Use level-only selector to avoid translated text mismatch
    await expect(adminPage.getByRole('heading', { level: 1 })).toBeVisible({ timeout: 10_000 });
    // Stats should be visible
    await expect(adminPage.locator('.font-heading.text-4xl').first()).toBeVisible();
  });

  test('submissions review queue shows pending items', async ({ adminPage }) => {
    if (!testSubmissionId) test.skip();
    await adminPage.goto('/admin/submissions');
    await expect(adminPage.getByRole('heading', { name: /submission/i })).toBeVisible();
    await expect(adminPage.getByText(testBrandName)).toBeVisible({ timeout: 10_000 });
  });

  test('admin can approve a submission', async ({ adminPage }) => {
    if (!testSubmissionId) test.skip();
    await adminPage.goto('/admin/submissions');
    const row = adminPage.locator('tr, [role="row"]').filter({ hasText: testBrandName });
    const approveBtn = row.getByRole('button', { name: /approve|核准/i });
    await approveBtn.click();
    // Confirm dialog or toast (bilingual)
    const confirmBtn = adminPage.getByRole('button', { name: /confirm|yes|approve|確認|是|核准/i }).last();
    if (await confirmBtn.isVisible({ timeout: 2_000 }).catch(() => false)) {
      await confirmBtn.click();
    }
    // Success feedback (bilingual)
    await expect(adminPage.getByText(/approved|success|已核准|成功/i)).toBeVisible({ timeout: 10_000 });
  });
});
