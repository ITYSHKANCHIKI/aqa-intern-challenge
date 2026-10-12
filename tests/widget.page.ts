import { Page } from "@playwright/test";

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

    async waitForWidgetButton() {
        const openButton = this.getOpenButton();

        try {
            await openButton.waitFor({ state: 'visible', timeout: 25000 });
        } catch {
            await this.page.reload({ waitUntil: 'domcontentloaded', timeout: 30000 });
            await openButton.waitFor({ state: 'visible', timeout: 25000 });
        }
    }

    async openWidget() {
        await this.waitForWidgetButton();
        await this.getOpenButton().click();
        await this.getWidgetBody().waitFor({ state: 'visible', timeout: 10000 });
    }

    async closeWidget() {
        const closeButton = this.page.locator(WidgetPage.selector.BUTTON_CLOSE).first();
        await closeButton.waitFor({ state: 'visible', timeout: 10000 });
        await closeButton.click();
    }

    async clickWriteToUs() {
        const button = this.wrapper().locator(WidgetPage.selector.BUTTON_WRITE_TO_US);
        await button.waitFor({ state: 'visible', timeout: 10000 });
        await button.click();
    }

    async getTitle() {
        return this.wrapper().locator(WidgetPage.selector.HEADER_TEXT).textContent();
    }
}
