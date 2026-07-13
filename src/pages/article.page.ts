import { expect, type Page } from '@playwright/test';
import type { ArticleData } from '@models/article';

export class ArticlePage {
  public constructor(private readonly page: Page) {}

  async goto(slug: string): Promise<void> {
    await this.page.goto(`/article/${slug}`);
    await expect(this.page.locator('.article-page, app-article-page').first()).toBeVisible();
  }

  async assertArticle(data: ArticleData): Promise<void> {
    await expect(this.page.getByRole('heading', { name: data.title, level: 1 })).toBeVisible();
    await expect(this.page.locator('.article-content')).toContainText(data.body);
    for (const tag of data.tagList) {
      await expect(
        this.page.locator('.tag-list').getByText(tag, { exact: true }).first(),
      ).toBeVisible();
    }
    await expect(this.page).toHaveURL(/\/article\/[\w-]+/);
    await expect(this.page.getByRole('link', { name: /edit article/i }).first()).toBeVisible();
    await expect(this.page.getByRole('button', { name: /delete article/i }).first()).toBeVisible();
  }

  async assertTitle(title: string): Promise<void> {
    await expect(this.page.getByRole('heading', { name: title, level: 1 })).toBeVisible();
  }

  async clickTag(tag: string): Promise<void> {
    await this.page.locator('.tag-list').getByText(tag, { exact: true }).first().click();
  }

  async edit(): Promise<void> {
    await this.page
      .getByRole('link', { name: /edit article/i })
      .first()
      .click();
    await expect(this.page).toHaveURL(/\/editor\//);
  }

  async currentSlug(): Promise<string> {
    const url = this.page.url();
    try {
      const parsed = new URL(url);
      const parts = parsed.pathname.split('/').filter(Boolean);
      return parts[parts.length - 1];
    } catch {
      const parts = url.split('/').filter(Boolean);
      return parts[parts.length - 1];
    }
  }

  async delete(): Promise<void> {
    await this.page
      .getByRole('button', { name: /delete article/i })
      .first()
      .click();
    await expect(this.page).not.toHaveURL(/\/article\//);
  }
}
