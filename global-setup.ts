import { chromium, request, type FullConfig } from '@playwright/test';
import dotenv from 'dotenv';
import fs from 'node:fs/promises';
import path from 'node:path';

dotenv.config();

interface UserAuthResponse {
  user?: {
    token?: string;
    username?: string;
    email?: string;
  };
}

export default async function globalSetup(config: FullConfig): Promise<void> {
  const email = process.env.TEST_USER_EMAIL;
  const password = process.env.TEST_USER_PASSWORD;
  const baseURL = config.projects[0]?.use.baseURL;
  const apiUrl = process.env.API_URL ?? `${baseURL}/api`;
  const normalizedApiUrl = apiUrl.endsWith('/') ? apiUrl : `${apiUrl}/`;

  if (typeof baseURL !== 'string') throw new Error('BASE_URL is not configured.');
  if (typeof apiUrl !== 'string') throw new Error('API_URL is not configured.');

  const authFile = path.resolve('playwright/.auth/user.json');
  await fs.mkdir(path.dirname(authFile), { recursive: true });

  const requestContext = await request.newContext({ baseURL: normalizedApiUrl });
  let token: string | undefined;

  if (email && password) {
    const loginResponse = await requestContext.post('users/login', {
      data: { user: { email, password } },
    });
    if (loginResponse.ok()) {
      const data = (await loginResponse.json()) as UserAuthResponse;
      token = data.user?.token;
    } else {
      console.warn(
        `Global setup login failed: ${loginResponse.status()} ${await loginResponse.text()}`,
      );
    }
  }

  if (!token) {
    const generatedEmail = `qa-${Date.now()}@example.com`;
    const generatedPassword = `Qa${Math.floor(Math.random() * 900000) + 100000}!`;
    const randomSuffix = Math.random().toString(36).slice(2, 8);
    const generatedUsername = `qa${randomSuffix}`.slice(0, 20);

    const registerResponse = await requestContext.post('users', {
      data: { user: { username: generatedUsername, email: generatedEmail, password: generatedPassword } },
    });

    if (!registerResponse.ok()) {
      throw new Error(
        `Register failed: ${registerResponse.status()} ${await registerResponse.text()}`,
      );
    }

    const data = (await registerResponse.json()) as UserAuthResponse;
    token = data.user?.token;
  }

  if (!token) {
    throw new Error('Unable to get an authentication token during global setup.');
  }

  const browser = await chromium.launch();
  const context = await browser.newContext({
    storageState: {
      cookies: [],
      origins: [
        {
          origin: baseURL,
          localStorage: [
            { name: 'jwtToken', value: token },
            { name: 'token', value: token },
            { name: 'authToken', value: token },
          ],
        },
      ],
    },
  });

  await context.storageState({ path: authFile });
  await browser.close();
}
