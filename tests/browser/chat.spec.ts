import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.beforeEach(async ({ page }) => { await page.goto('./'); });

test('keyboard sending rejects blank messages and renders markup as text', async ({ page }) => {
  const input = page.getByRole('textbox', { name: 'Message', exact: true });
  await input.fill('   ');
  await expect(page.getByRole('button', { name: 'Send message', exact: true })).toBeDisabled();
  await input.fill('<b>hello room</b>');
  await input.press('Enter');
  await expect(page.getByRole('log')).toContainText('<b>hello room</b>');
  await expect(page.getByRole('log').locator('b')).toHaveCount(0);
  await expect(input).toHaveValue('');
  await expect(page.getByRole('log')).toContainText('I like that thought. Tell me a little more.');
});

test('palette supports keyboard navigation, room drafts and isolated direct messages', async ({ page }) => {
  const input = page.getByRole('textbox', { name: 'Message', exact: true });
  await input.fill('unfinished room draft');
  await page.keyboard.press('Control+k');
  const filter = page.getByRole('textbox', { name: 'Filter commands' });
  await expect(filter).toBeFocused();
  await filter.fill('anon-b284');
  await filter.press('Tab');
  await page.keyboard.press('Enter');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('anon-b284');
  await expect(input).toHaveValue('');
  await input.fill('private audit message');
  await input.press('Enter');
  await page.getByRole('button', { name: 'Drift home' }).click();
  await expect(input).toHaveValue('unfinished room draft');
  await expect(page.getByRole('log')).not.toContainText('private audit message');
  await page.keyboard.press('Control+k');
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
});

test('room creation assigns UUID and reset removes custom state', async ({ page }) => {
  await page.getByRole('button', { name: 'Open command palette' }).click();
  await page.getByRole('button', { name: '+ new room generate a UUID' }).click();
  await page.getByRole('textbox', { name: 'Conversation topic' }).fill('Audit room');
  await page.getByRole('button', { name: 'Create room', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Audit room', exact: true })).toBeVisible();
  await expect(page.locator('.room-welcome code')).toHaveText(/\/rooms\/[\da-f]{8}-[\da-f]{4}-4[\da-f]{3}-[89ab][\da-f]{3}-[\da-f]{12}/);
  await page.getByRole('button', { name: 'Reset demo', exact: true }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Reset demo', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'The little things', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Discover rooms', exact: true }).click();
  await page.getByRole('textbox', { name: 'Search rooms by topic or UUID' }).fill('Audit room');
  await expect(page.getByRole('heading', { name: 'No rooms found.' })).toBeVisible();
});

test('reaction toggle is reversible and room directory can be searched', async ({ page }) => {
  const reaction = page.getByRole('button', { name: 'React ☕' });
  await reaction.click();
  await expect(reaction).toHaveAttribute('aria-pressed', 'true');
  await expect(reaction).toContainText('4');
  await reaction.click();
  await expect(reaction).toHaveAttribute('aria-pressed', 'false');
  await expect(reaction).toContainText('3');
  await page.getByRole('button', { name: 'Discover rooms', exact: true }).click();
  await page.getByRole('textbox', { name: 'Search rooms by topic or UUID' }).fill('midnight');
  await expect(page.locator('.discovery-card')).toHaveCount(1);
  await page.getByRole('button', { name: 'Join conversation' }).click();
  await expect(page.getByRole('heading', { name: 'The midnight kitchen', exact: true })).toBeVisible();
});

test('landing and palette have no detected WCAG A/AA issues or page overflow', async ({ page }) => {
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()).violations).toEqual([]);
  await page.getByRole('button', { name: 'Open command palette' }).click();
  expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()).violations).toEqual([]);
});
