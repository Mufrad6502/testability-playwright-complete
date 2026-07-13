import { chromium, type FullConfig } from '@playwright/test';
import dotenv from 'dotenv';
import fs from 'node:fs/promises';
import path from 'node:path';

dotenv.config();

export default async function globalSetup(config: FullConfig): Promise<void> {
  const email = process.env.TEST_USER_EMAIL;
  const password = process.env.TEST_USER_PASSWORD;
  const baseURL = config.projects[0]?.use.baseURL;

  if (!email || !password) {
    throw new Error(
      'Missing TEST_USER_EMAIL or TEST_USER_PASSWORD. Copy .env.example to .env and add a valid Conduit account.',
    );
  }
  if (typeof baseURL !== 'string') throw new Error('BASE_URL is not configured.');

  const authFile = path.resolve('playwright/.auth/user.json');
  await fs.mkdir(path.dirname(authFile), { recursive: true });

  const browser = await chromium.launch();
  const page = await browser.newPage({ baseURL });

  await page.goto('/login');
  await page.getByPlaceholder(/email/i).fill(email);
  await page.getByPlaceholder(/password/i).fill(password);
  await page.getByRole('button', { name: /sign in/i }).click();
  await page.waitForURL((url) => !url.pathname.includes('/login'));
  await page.context().storageState({ path: authFile });
  await browser.close();
}
