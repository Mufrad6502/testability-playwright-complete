import { test, expect } from '@fixtures/test.fixture';
import { buildArticle } from '@data/test-data';

test.describe('Delete Article', () => {
  test('positive: API-created article can be deleted through UI', async ({
    articleApi,
    articlePage,
    page,
  }) => {
    test.info().annotations.push({
      type: 'Requirement',
      description: '3. Delete Article; API precondition',
    });
    const created = await articleApi.create(buildArticle());
    const slug = created.article.slug;

    await articlePage.goto(slug);
    await articlePage.delete();
    await expect(page).toHaveURL(/\/$|\/home/);
    await expect
      .poll(() => articleApi.status(slug), { message: 'Deleted article should return 404' })
      .toBe(404);
  });

  test('negative: repeated deletion returns a controlled 4xx response', async ({ articleApi }) => {
    const created = await articleApi.create(buildArticle());
    const slug = created.article.slug;
    await articleApi.delete(slug);
    expect(await articleApi.tryDelete(slug)).toBeGreaterThanOrEqual(400);
    expect(await articleApi.tryDelete(slug)).toBeLessThan(500);
  });
});
