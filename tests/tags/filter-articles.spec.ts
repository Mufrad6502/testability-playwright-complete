import { test, expect } from '@fixtures/test.fixture';
import { buildArticle } from '@data/test-data';

test.describe('Filter Articles by Tag', () => {
  test('positive: clicking an article tag opens a feed containing only matching articles', async ({
    articleApi,
    articlePage,
    homePage,
  }) => {
    test.info().annotations.push({ type: 'Requirement', description: '4. Filter Articles by Tag' });
    const tag = `filter-${Date.now()}`;
    const matching = await articleApi.create(buildArticle({ tagList: [tag] }));
    const nonMatching = await articleApi.create(buildArticle({ tagList: [`other-${Date.now()}`] }));

    try {
      await articlePage.goto(matching.article.slug);
      await articlePage.clickTag(tag);
      await homePage.assertFilteredByTag(tag, matching.article.title);

      const apiFeed = await articleApi.listByTag(tag);
      expect(apiFeed.articles.length).toBeGreaterThan(0);
      expect(apiFeed.articles.every((article) => article.tagList.includes(tag))).toBeTruthy();
    } finally {
      await articleApi.delete(matching.article.slug).catch(() => undefined);
      await articleApi.delete(nonMatching.article.slug).catch(() => undefined);
    }
  });

  test('negative: unknown tag produces an empty feed without breaking the page', async ({
    homePage,
    page,
  }) => {
    const unknownTag = `unknown-${Date.now()}`;
    await homePage.openTag(unknownTag);
    await expect(page).toHaveURL(new RegExp(`tag=${unknownTag}`));
    await homePage.assertEmptyFeed();
  });
});
