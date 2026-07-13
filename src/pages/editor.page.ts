import { expect, type Page } from '@playwright/test';
import type { ArticleData } from '@models/article';

export class EditorPage {
  public constructor(private readonly page: Page) {}

  private get titleInput() {
    return this.page.getByPlaceholder(/article title/i);
  }
  private get descriptionInput() {
    return this.page.getByPlaceholder(/what's this article about/i);
  }
  private get bodyInput() {
    return this.page.getByPlaceholder(/write your article/i);
  }
  private get tagsInput() {
    return this.page.getByPlaceholder(/enter tags/i);
  }
  private get publishButton() {
    return this.page.getByRole('button', { name: /publish article/i });
  }

  async gotoNew(): Promise<void> {
    await this.page.goto('/editor');
    await expect(this.titleInput).toBeVisible();
  }

  async fill(data: ArticleData): Promise<void> {
    await this.titleInput.fill(data.title);
    await this.descriptionInput.fill(data.description);
    await this.bodyInput.fill(data.body);
    for (const tag of data.tagList) {
      await this.tagsInput.fill(tag);
      await this.tagsInput.press('Enter');
      await expect(this.page.locator('.tag-list').getByText(tag, { exact: true })).toBeVisible();
    }
  }

  async publish(): Promise<void> {
    await this.publishButton.click();
  }

  async publishArticle(data: ArticleData): Promise<void> {
    await this.fill(data);
    await this.publish();
    await expect(this.page).toHaveURL(/\/article\//);
  }

  async update(data: Partial<ArticleData>): Promise<void> {
    if (data.title !== undefined) await this.titleInput.fill(data.title);
    if (data.description !== undefined) await this.descriptionInput.fill(data.description);
    if (data.body !== undefined) await this.bodyInput.fill(data.body);
    await this.publish();
  }

  async clearTitle(): Promise<void> {
    await this.titleInput.fill('');
  }

  async assertLoadedArticle(data: ArticleData): Promise<void> {
    await expect(this.titleInput).toHaveValue(data.title);
    await expect(this.descriptionInput).toHaveValue(data.description);
    await expect(this.bodyInput).toHaveValue(data.body);
    for (const tag of data.tagList) {
      await expect(this.page.locator('.tag-list').getByText(tag, { exact: true })).toBeVisible();
    }
  }

  async assertPublishPrevented(): Promise<void> {
    await expect(this.page).toHaveURL(/\/editor/);
    await expect(this.titleInput).toBeVisible();
    const invalid = await this.titleInput.evaluate((element) =>
      element instanceof HTMLInputElement ? !element.checkValidity() : false,
    );
    const errors = this.page.locator('.error-messages, .errors');
    expect(
      invalid || (await errors.count()) > 0,
      'Expected native or application validation feedback',
    ).toBeTruthy();
  }
}
