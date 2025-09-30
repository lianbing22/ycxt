import { test, expect } from '@playwright/test';

test.describe('监控大屏核心流程', () => {
  test('导航与可视化渲染', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'YCXT 控制面板' })).toBeVisible();

    await page.getByRole('link', { name: '大屏总览' }).click();
    await expect(page.getByRole('heading', { name: '大屏可视化面板' })).toBeVisible();
    await expect(page.getByText('智能预测提示')).toBeVisible();
  });

  test('报文表格展示', async ({ page }) => {
    await page.goto('/messages');
    await expect(page.getByRole('heading', { name: '实时报文' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: '设备' })).toBeVisible();
  });
});
