import type { Page } from '@playwright/test';

export async function getAuthToken(page: Page): Promise<string> {
  const token = await page.evaluate(() => {
    const likelyKeys = ['jwtToken', 'token', 'authToken'];
    for (const key of likelyKeys) {
      const value = window.localStorage.getItem(key);
      if (value) return value;
    }
    for (let index = 0; index < window.localStorage.length; index += 1) {
      const key = window.localStorage.key(index);
      if (!key) continue;
      const value = window.localStorage.getItem(key);
      if (value && value.split('.').length === 3) return value;
    }
    return null;
  });

  if (!token) throw new Error('Authentication token was not found in localStorage.');
  return token;
}
