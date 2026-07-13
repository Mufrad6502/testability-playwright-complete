import type { Page } from '@playwright/test';

export class HeaderComponent {
  public constructor(private readonly page: Page) {}

  async openHome(): Promise<void> {
    await this.page.getByRole('link', { name: /^home$/i }).click();
  }

  async openNewArticle(): Promise<void> {
    await this.page.getByRole('link', { name: /new article/i }).click();
  }

  async openSettings(): Promise<void> {
    await this.page.getByRole('link', { name: /settings/i }).click();
  }
}
