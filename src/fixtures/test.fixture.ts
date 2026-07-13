import { test as base } from '@playwright/test';
import { ArticleApi } from '@api/article.api';
import { UserApi } from '@api/user.api';
import { ArticlePage } from '@pages/article.page';
import { EditorPage } from '@pages/editor.page';
import { HeaderComponent } from '@pages/header.component';
import { HomePage } from '@pages/home.page';
import { SettingsPage } from '@pages/settings.page';
import { getAuthToken } from '@utils/auth-token';

type AppFixtures = {
  articleApi: ArticleApi;
  userApi: UserApi;
  articlePage: ArticlePage;
  editorPage: EditorPage;
  header: HeaderComponent;
  homePage: HomePage;
  settingsPage: SettingsPage;
};

export const test = base.extend<AppFixtures>({
  articleApi: async ({ page, request }, use) => {
    await page.goto('/');
    const token = await getAuthToken(page);
    const apiUrl = process.env.API_URL ?? 'https://conduit-api.bondaracademy.com/api';
    await use(new ArticleApi(request, apiUrl, token));
  },
  userApi: async ({ page, request }, use) => {
    await page.goto('/');
    const token = await getAuthToken(page);
    const apiUrl = process.env.API_URL ?? 'https://conduit-api.bondaracademy.com/api';
    await use(new UserApi(request, apiUrl, token));
  },
  articlePage: async ({ page }, use) => use(new ArticlePage(page)),
  editorPage: async ({ page }, use) => use(new EditorPage(page)),
  header: async ({ page }, use) => use(new HeaderComponent(page)),
  homePage: async ({ page }, use) => use(new HomePage(page)),
  settingsPage: async ({ page }, use) => use(new SettingsPage(page)),
});

export { expect } from '@playwright/test';
