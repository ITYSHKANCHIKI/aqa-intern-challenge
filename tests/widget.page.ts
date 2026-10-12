import { Locator, Page } from "@playwright/test";

enum WidgetPageSelectors {
    WRAPPER = '.sc-dino-typography-h > [class^=widget__]',
    WIDGET_BODY = '[class^=widgetWrapper] > [class^=widget__]',
    HEADER_TEXT = 'header h5',
    BUTTON_OPEN = '[data-test="openWidget"]',
    BUTTON_CLOSE = 'button[class*="closeBtn"]',
    BUTTON_WRITE_TO_US = '[data-test="button_feedback_form"]',
    ARTICLE_POPULAR_TITLE = '[class^=popularTitle__]',
    ARTICLE_POPULAR_LIST = `${ARTICLE_POPULAR_TITLE} + ul[class^=articles__]`,
    ARTICLE_POPULAR_LIST_ITEM = `${ARTICLE_POPULAR_LIST} > li`,
    COOKIE_OVERLAY = '._UCHI_COOKIE__wrap_show',
    COOKIE_BUTTON = '._UCHI_COOKIE__button',
}

export class WidgetPage {
    static selector = WidgetPageSelectors;

    constructor(protected page: Page) {}

    wrapper() {
        return this.page.locator(WidgetPage.selector.WRAPPER);
    }

    getWidgetBody() {
        return this.page.locator(WidgetPage.selector.WIDGET_BODY);
    }

    getOpenButton() {
        return this.page.locator(WidgetPage.selector.BUTTON_OPEN);
    }

    getPopularArticles() {
        return this.wrapper().locator(WidgetPage.selector.ARTICLE_POPULAR_LIST_ITEM);
    }

    private async reliableClick(locator: Locator) {
        await locator.waitFor({ state: 'visible', timeout: 10000 });

        try {
            await locator.click({ timeout: 5000 });
        } catch {
            // On uchi.ru floating overlays/animations can intercept a normal
            // Playwright click in headless mode even when the element is visible.
            await locator.click({ force: true, timeout: 5000 });
        }
    }

    async dismissCookieBanner() {
        const overlay = this.page.locator(WidgetPage.selector.COOKIE_OVERLAY);
        const button = this.page.locator(WidgetPage.selector.COOKIE_BUTTON);

        if (await overlay.isVisible().catch(() => false)) {
            if (await button.isVisible().catch(() => false)) {
                await button.click({ force: true });
            }

            await overlay.waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});
        }
    }

    async waitForWidgetButton() {
        const openButton = this.getOpenButton();

        try {
            await openButton.waitFor({ state: 'visible', timeout: 25000 });
        } catch {
            await this.page.reload({ waitUntil: 'domcontentloaded', timeout: 30000 });
            await this.dismissCookieBanner();
            await openButton.waitFor({ state: 'visible', timeout: 25000 });
        }
    }

    async openWidget() {
        await this.dismissCookieBanner();
        await this.waitForWidgetButton();
        await this.reliableClick(this.getOpenButton());
        await this.getWidgetBody().waitFor({ state: 'visible', timeout: 10000 });
    }

    async closeWidget() {
        await this.dismissCookieBanner();
        const closeButton = this.page.locator(WidgetPage.selector.BUTTON_CLOSE).first();
        await this.reliableClick(closeButton);
    }

    async clickWriteToUs() {
        await this.dismissCookieBanner();
        const button = this.wrapper().locator(WidgetPage.selector.BUTTON_WRITE_TO_US);
        await this.reliableClick(button);
    }

    async getTitle() {
        return this.wrapper().locator(WidgetPage.selector.HEADER_TEXT).textContent();
    }
}
