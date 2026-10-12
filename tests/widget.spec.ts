import { test, expect } from '@playwright/test';
import { WidgetPage } from "./widget.page";

test.describe('Uchi.ru widget', () => {
  let widgetPage: WidgetPage;

  test.beforeEach(async ({ page }) => {
    widgetPage = new WidgetPage(page);

    // open uchi.ru main page
    await page.goto('/');

    // close cookies popup
    await page.click('._UCHI_COOKIE__button');
  });

  test('opens', async () => {
    await widgetPage.openWidget();

    await expect(widgetPage.getWidgetBody()).toBeVisible();
  });

  test('has correct title', async () => {
    await widgetPage.openWidget();

    const articles = widgetPage.getPopularArticles();

    await expect(articles).not.toHaveCount(0);

    await articles.first().click();

    await widgetPage.clickWriteToUs();

    await expect.poll(async () => widgetPage.getTitle()).toBe('Связь с поддержкой');
  });

  test('closes widget', async () => {
    await widgetPage.openWidget();

    await expect(widgetPage.getWidgetBody()).toBeVisible();

    await widgetPage.closeWidget();

    await expect(widgetPage.getWidgetBody()).toBeHidden();
    await expect(widgetPage.getOpenButton()).toBeVisible();
  });
});
