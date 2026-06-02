import { test, expect } from '../fixtures/auth';

test.describe('Categories index', () => {
  test('renders the categories index and follows a category link when one is available', async ({
    anonPage,
  }) => {
    const response = await anonPage.goto('/categories');
    expect(response?.status()).toBe(200);

    await expect(
      anonPage.getByRole('heading', { level: 1, name: '依類別瀏覽', exact: true })
    ).toBeVisible({ timeout: 10_000 });

    const categoryLinks = anonPage.locator('main a[href^="/categories/"]');
    const categoryLinkCount = await categoryLinks.count();

    if (categoryLinkCount === 0) {
      await expect(categoryLinks).toHaveCount(0);
      return;
    }

    const firstCategoryLink = categoryLinks.first();
    await expect(firstCategoryLink).toBeVisible({ timeout: 10_000 });

    const href = await firstCategoryLink.getAttribute('href');
    expect(href).toBeTruthy();
    if (!href) {
      throw new Error('Expected category link to have an href');
    }
    expect(href).toMatch(/^\/categories\/[^/]+$/);

    const categoryName = (await firstCategoryLink.locator('span').first().textContent())?.trim();
    expect(categoryName).toBeTruthy();
    if (!categoryName) {
      throw new Error('Expected category link to include a category name');
    }

    await Promise.all([
      anonPage.waitForURL((url) => url.pathname === href, { timeout: 10_000 }),
      firstCategoryLink.click(),
    ]);

    await expect(
      anonPage.getByRole('heading', { level: 1, name: categoryName, exact: true })
    ).toBeVisible({ timeout: 10_000 });

    await expect(
      anonPage
        .locator('main [role="list"][aria-label="Brand directory"]')
        .or(anonPage.getByText('找不到品牌', { exact: true }))
    ).toBeVisible({ timeout: 10_000 });
  });
});
