import { test, expect } from '@playwright/test';
import { WidgetPage } from "./widget.page";

test.describe('Uchi.ru widget', () => {
  let widgetPage: WidgetPage;

  test.beforeEach(async ({ page }) => {
    widgetPage = new WidgetPage(page);

    await page.goto('/', {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    });

    const cookieButton = page.locator('._UCHI_COOKIE__button');

    try {
      await cookieButton.waitFor({ state: 'visible', timeout: 5000 });
      await cookieButton.click();
    } catch {
      // Cookie banner may already be accepted or may not be shown.
    }
  });

  test('opens', async () => {
    await widgetPage.openWidget();

    await expect(widgetPage.getWidgetBody()).toBeVisible();
  });

  test('has correct title', async () => {
    await widgetPage.openWidget();

    const articles = widgetPage.getPopularArticles();

    await expect(articles.first()).toBeVisible({ timeout: 10000 });
    await articles.first().click();

    await widgetPage.clickWriteToUs();

    await expect.poll(
      async () => widgetPage.getTitle(),
      { timeout: 10000 }
    ).toBe('Связь с поддержкой');
  });

  test('closes widget', async () => {
    await widgetPage.openWidget();

    await expect(widgetPage.getWidgetBody()).toBeVisible();

    await widgetPage.closeWidget();

    await expect(widgetPage.getWidgetBody()).toBeHidden({ timeout: 10000 });
    await expect(widgetPage.getOpenButton()).toBeVisible({ timeout: 10000 });
  });
});
