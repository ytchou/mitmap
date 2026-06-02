import { test, expect } from '../fixtures/auth';

test.describe('Categories index', () => {
  test('renders category cards and navigates to a filtered category page', async ({
    anonPage,
  }) => {
    await anonPage.goto('/categories');

    await expect(anonPage.locator('main h1')).toHaveText(/依類別瀏覽|Browse by Category/);

    const firstCategoryLink = anonPage.locator('main a[href^="/categories/"]').first();
    await expect(firstCategoryLink).toBeVisible({ timeout: 10_000 });
    await expect(firstCategoryLink).toContainText(/尚無品牌|個品牌|No brands|\d+\s+brands?/);

    const href = await firstCategoryLink.getAttribute('href');
    expect(href).toMatch(/^\/categories\/[^/]+$/);

    const categoryName = (await firstCategoryLink.locator('span').first().textContent())?.trim();
    expect(categoryName).toBeTruthy();

    await anonPage.goto(href!);

    expect(new URL(anonPage.url()).pathname).toBe(href);
    await expect(anonPage.locator('main h1')).toHaveText(categoryName!);
    await expect(
      anonPage
        .locator('main [role="list"] [role="listitem"]')
        .first()
        .or(anonPage.getByText(/找不到品牌|no brands|no results/i))
    ).toBeVisible({ timeout: 10_000 });
  });
});
