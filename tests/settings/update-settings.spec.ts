import { test, expect } from '@fixtures/test.fixture';
import { buildProfileUpdate } from '@data/test-data';

test.describe('Update User Settings', () => {
  test.describe.configure({ mode: 'serial' });

  test('positive: bio and profile image update and persist after reload', async ({
    settingsPage,
    userApi,
    page,
  }) => {
    test.info().annotations.push({ type: 'Requirement', description: '5. Update User Settings' });
    const original = (await userApi.getCurrent()).user;
    const update = buildProfileUpdate();

    try {
      await settingsPage.goto();
      await settingsPage.update(update);
      await expect(page).not.toHaveURL(/\/settings$/);

      const apiUser = (await userApi.getCurrent()).user;
      expect(apiUser.bio).toBe(update.bio);
      expect(apiUser.image).toBe(update.image);

      await settingsPage.goto();
      await settingsPage.assertValues(update);
      await page.reload();
      await settingsPage.assertValues(update);
    } finally {
      await userApi.update({ bio: original.bio ?? '', image: original.image ?? '' });
    }
  });

  test('negative: malformed email is rejected and not persisted', async ({
    settingsPage,
    userApi,
    page,
  }) => {
    const original = (await userApi.getCurrent()).user;
    await settingsPage.goto();
    await settingsPage.update({ email: 'invalid-email-format' });
    await settingsPage.assertValidationError();
    await expect(page).toHaveURL(/\/settings/);
    expect((await userApi.getCurrent()).user.email).toBe(original.email);
  });
});
