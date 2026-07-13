import { test, expect } from '@fixtures/test.fixture';
import { buildArticle } from '@data/test-data';

test.describe('Edit Article', () => {
  test('positive: API-created article is edited through UI and persisted', async ({
    articleApi,
    articlePage,
    editorPage,
  }) => {
    test
      .info()
      .annotations.push({ type: 'Requirement', description: '2. Edit Article; API precondition' });
    const original = buildArticle();
    const created = await articleApi.create(original);
    const slug = created.article.slug;
    const update = {
      title: `${original.title} Updated`,
      description: `${original.description} Updated`,
      body: `${original.body}\nEdited through Playwright UI.`,
    };

    try {
      await test.step('Open API-created article and verify editor prefill', async () => {
        await articlePage.goto(slug);
        await articlePage.edit();
        await editorPage.assertLoadedArticle(original);
      });

      await test.step('Edit and verify UI result', async () => {
        await editorPage.update(update);
        await articlePage.assertTitle(update.title);
      });

      await test.step('Verify updated data through API', async () => {
        const currentSlug = await articlePage.currentSlug();
        const persisted = await articleApi.get(currentSlug);
        expect(persisted.article).toMatchObject({ ...original, ...update });
        expect(new Date(persisted.article.updatedAt).getTime()).toBeGreaterThanOrEqual(
          new Date(persisted.article.createdAt).getTime(),
        );
      });
    } finally {
      await articleApi.delete(slug).catch(() => undefined);
    }
  });

  test('negative: clearing title does not overwrite valid API-created article', async ({
    articleApi,
    articlePage,
    editorPage,
  }) => {
    const original = buildArticle();
    const created = await articleApi.create(original);
    const slug = created.article.slug;

    try {
      await articlePage.goto(slug);
      await articlePage.edit();
      await editorPage.clearTitle();
      await editorPage.publish();
      await editorPage.assertPublishPrevented();
      expect((await articleApi.get(slug)).article.title).toBe(original.title);
    } finally {
      await articleApi.delete(slug).catch(() => undefined);
    }
  });
});
