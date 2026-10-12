import { test, expect, BrowserContext, Page } from '@playwright/test';
import { WidgetPage } from "./widget.page";

test.describe.serial('Uchi.ru widget', () => {
  let context: BrowserContext;
  let page: Page;
  let widgetPage: WidgetPage;

  test.beforeAll(async ({ browser }) => {
    context = await browser.newContext({
      baseURL: 'https://uchi.ru',
    });

    page = await context.newPage();
    widgetPage = new WidgetPage(page);

    const cookieOverlay = page.locator('._UCHI_COOKIE__wrap_show');

    await page.addLocatorHandler(cookieOverlay, async () => {
      const cookieButton = page.locator('._UCHI_COOKIE__button');

      if (await cookieButton.isVisible()) {
        await cookieButton.click();
      }
    });

    await page.goto('/', {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    });

    await widgetPage.dismissCookieBanner();
    await widgetPage.waitForWidgetButton();
  });

  test.beforeEach(async () => {
    await widgetPage.dismissCookieBanner();
  });

  test.afterEach(async () => {
    try {
      await widgetPage.dismissCookieBanner();

      if (await widgetPage.getWidgetBody().isVisible()) {
        await widgetPage.closeWidget();
        await expect(widgetPage.getWidgetBody()).toBeHidden({ timeout: 10000 });
      }
    } catch {
      // The widget may already be closed.
    }
  });

  test.afterAll(async () => {
    await context.close();
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

    await widgetPage.dismissCookieBanner();
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
