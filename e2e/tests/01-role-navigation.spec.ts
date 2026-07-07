import { test, expect } from '@playwright/test';

test.describe('SCN-01 role navigation', () => {
  test('role select page navigates to owner and guest', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Вы кто?' })).toBeVisible();

    await page.getByRole('button', { name: 'Владелец' }).click();
    await expect(page).toHaveURL(/\/owner$/);

    await page.goto('/');
    await page.getByRole('button', { name: 'Гость' }).click();
    await expect(page).toHaveURL(/\/guest$/);
  });

  test('switch-role button toggles between owner and guest', async ({ page }) => {
    await page.goto('/owner');
    await page.getByRole('link', { name: 'Сменить роль' }).click();
    await expect(page).toHaveURL(/\/guest$/);

    await page.getByRole('link', { name: 'Сменить роль' }).click();
    await expect(page).toHaveURL(/\/owner$/);
  });
});
