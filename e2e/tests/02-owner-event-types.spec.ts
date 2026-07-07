import { test, expect } from '@playwright/test';
import { uniqueName } from '../fixtures';

const API_BASE_URL = 'http://localhost:5163';

test.describe('SCN-02 create event type', () => {
  test('happy path shows the new type in the list', async ({ page }) => {
    const name = uniqueName('E2E Type');
    await page.goto('/owner/event-types');

    await page.getByLabel('Название').fill(name);
    await page.getByLabel('Описание').fill('e2e description');
    await page.getByLabel('Длительность (мин.)').fill('45');
    await page.getByRole('button', { name: 'Добавить тип события' }).click();

    await expect(page.getByText(`${name} · 45 мин`)).toBeVisible();
  });
});

test.describe('SCN-03 client-side validation', () => {
  test('rejects empty name and non-multiple-of-15 duration', async ({ page }) => {
    await page.goto('/owner/event-types');

    const postRequests: string[] = [];
    page.on('request', (req) => {
      if (req.method() === 'POST' && req.url().startsWith(`${API_BASE_URL}/event-types`)) {
        postRequests.push(req.url());
      }
    });

    await page.getByLabel('Длительность (мин.)').fill('30');
    await page.getByRole('button', { name: 'Добавить тип события' }).click();
    await expect(page.getByText('Укажите название типа события')).toBeVisible();

    // Note: the "duration must be > 0" client message is not reachable through the UI —
    // the NumberInput has min={15}, which rejects any value below it before React state
    // ever updates. Only the "not a multiple of 15" branch is reachable this way.
    await page.getByLabel('Название').fill(uniqueName('E2E Type'));
    await page.getByLabel('Длительность (мин.)').fill('20');
    await page.getByRole('button', { name: 'Добавить тип события' }).click();
    await expect(page.getByText('Длительность должна быть кратна 15 минутам')).toBeVisible();

    expect(postRequests).toHaveLength(0);
  });
});

test.describe('SCN-03a server-side validation (regression)', () => {
  test('POST /event-types with an empty name returns 400', async ({ request }) => {
    const response = await request.post(`${API_BASE_URL}/event-types`, {
      data: { name: '', description: '', durationMinutes: 30 },
    });
    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.error).toContain('Name is required');
  });
});
