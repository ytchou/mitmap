import { test, expect } from '@playwright/test';

// The default locale is zh-TW; middleware redirects /categories/* to /zh-TW/categories/*.
// fashion is in the same ontology group as bags-accessories and jewelry.
// The RelatedCategories component renders only when the group has siblings.

test.describe('Category related categories cross-links', () => {
  test('related categories section renders on fashion page with correct links', async ({
    page,
  }) => {
    test.setTimeout(120_000);

    const response = await page.goto('/categories/fashion', {
      waitUntil: 'networkidle',
    });

    if (!response || response.status() === 503) {
      test.skip(true, 'PREVIEW_MODE returned 503 — skipping related categories test');
      return;
    }

    expect(response?.status()).toBe(200);

    // The section heading is translated to zh-TW ("相關分類") by next-intl middleware
    const heading = page.getByRole('heading', { level: 2, name: '相關分類', exact: true });
    await expect(heading).toBeVisible({ timeout: 20_000 });

    // fashion's ontology group: ["fashion", "bags-accessories", "jewelry"]
    // Both sibling links must appear inside <main>
    const bagsLink = page.locator('main a[href*="/categories/bags-accessories"]');
    const jewelryLink = page.locator('main a[href*="/categories/jewelry"]');

    await expect(bagsLink).toBeVisible({ timeout: 10_000 });
    await expect(jewelryLink).toBeVisible({ timeout: 10_000 });

    // Links display the zh-TW category name
    await expect(bagsLink).toHaveText('包袋配件');
    await expect(jewelryLink).toHaveText('飾品珠寶');

    // Clicking a related link navigates to that category page
    await bagsLink.click();
    await page.waitForURL(/\/categories\/bags-accessories/, { timeout: 15_000 });
    expect(page.url()).toMatch(/\/categories\/bags-accessories/);

    // The destination page must render its own category heading
    await expect(
      page.getByRole('heading', { level: 1, name: '包袋配件', exact: true })
    ).toBeVisible({ timeout: 20_000 });
  });
});
