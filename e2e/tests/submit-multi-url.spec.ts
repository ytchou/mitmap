import { test, expect } from '../fixtures/auth'
import { gotoSubmitWizard } from '../utils/submit-wizard'

test.describe('Submit multi-URL affordances', () => {
  test('adds URL rows up to the cap and removes a row', async ({ userPage }) => {
    test.setTimeout(120_000)

    const probe = await userPage.goto('/submit/form')
    if (probe?.status() === 503) {
      test.skip(true, 'PREVIEW_MODE active — submit route returns 503')
      return
    }

    await gotoSubmitWizard(userPage)

    // This spec intentionally stops in UrlStep; it does not submit BrandInfoStep
    // data or create/share brands.

    // In the redesigned UrlStep, type="url" inputs at initial render:
    //   #website-url (1)
    //   #url-facebook in social section (1)
    //   #purchase-website, #purchase-pinkoi, #purchase-shopee in purchase section (3)
    //   Other-links section: starts empty (0)
    // Total initial = 5
    const urlInputs = userPage.locator('input[type="url"]')
    await expect(urlInputs).toHaveCount(5, { timeout: 5_000 })

    // "新增連結" button adds rows to the other-links section (max 3)
    const addLinkButton = userPage.getByRole('button', { name: '新增連結', exact: true })
    await expect(addLinkButton).toBeVisible({ timeout: 5_000 })

    // Add first other-link row
    await addLinkButton.click()
    await expect(urlInputs).toHaveCount(6)

    // Add second
    await addLinkButton.click()
    await expect(urlInputs).toHaveCount(7)

    // Add third (cap reached at MAX_OTHER_LINKS = 3)
    await addLinkButton.click()
    await expect(urlInputs).toHaveCount(8)

    // Button must be hidden once cap is reached
    await expect(addLinkButton).toBeHidden()

    // Remove button aria-label is "移除連結"
    await userPage.getByRole('button', { name: '移除連結', exact: true }).first().click()
    await expect(urlInputs).toHaveCount(7)

    // After removal the add button reappears
    await expect(addLinkButton).toBeVisible()
  })

  test('other-link row accepts label and URL', async ({ userPage }) => {
    test.setTimeout(90_000)

    const probe = await userPage.goto('/submit/form')
    if (probe?.status() === 503) {
      test.skip(true, 'PREVIEW_MODE active — submit route returns 503')
      return
    }

    await gotoSubmitWizard(userPage)

    const addLinkButton = userPage.getByRole('button', { name: '新增連結', exact: true })
    await expect(addLinkButton).toBeVisible({ timeout: 5_000 })
    await addLinkButton.click()

    // Each added row has a label input and a url input
    const labelInput = userPage.getByRole('textbox', {
      name: /連結標籤/,
    }).first()
    await expect(labelInput).toBeVisible({ timeout: 3_000 })
    await labelInput.fill('My Store')

    const urlInput = userPage.locator('input[type="url"][aria-label]').last()
    await urlInput.fill('https://mystore.example.com')

    // Values persist after typing
    await expect(labelInput).toHaveValue('My Store')
    await expect(urlInput).toHaveValue('https://mystore.example.com')
  })
})
