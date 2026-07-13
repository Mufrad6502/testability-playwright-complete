import { test, expect } from '@fixtures/test.fixture';
import { buildArticle } from '@data/test-data';

test.describe('Create New Article', () => {
  test('positive: authenticated user creates an article and data persists', async ({
    editorPage,
    articlePage,
    articleApi,
    page,
  }) => {
    test.info().annotations.push({ type: 'Requirement', description: '1. Create New Article' });
    const article = buildArticle();
    let slug: string | undefined;

    try {
      await test.step('Create article from the editor UI', async () => {
        await editorPage.gotoNew();
        await editorPage.publishArticle(article);
        await articlePage.assertArticle(article);
      });

      await test.step('Verify redirect and API persistence', async () => {
        const match = page.url().match(/\/article\/([^/?#]+)/);
        slug = match?.[1];
        expect(slug, 'Article slug should be present in redirected URL').toBeTruthy();
        const persisted = await articleApi.get(slug!);
        expect(persisted.article).toMatchObject({
          title: article.title,
          description: article.description,
          body: article.body,
          tagList: article.tagList,
        });
        expect(persisted.article.slug).toBe(slug);
        expect(new Date(persisted.article.createdAt).getTime()).not.toBeNaN();
      });
    } finally {
      if (slug) await articleApi.delete(slug).catch(() => undefined);
    }
  });

  test('negative: article cannot be published without a required title', async ({ editorPage }) => {
    test.info().annotations.push({ type: 'Negative', description: 'Required-field validation' });
    await editorPage.gotoNew();
    await editorPage.fill(buildArticle({ title: '' }));
    await editorPage.publish();
    await editorPage.assertPublishPrevented();
  });
});
