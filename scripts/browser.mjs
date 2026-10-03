import { preview } from 'vite';
import { chromium } from '@playwright/test';
export async function startBrowser() {
  const server = await preview({ preview: { host: '127.0.0.1', port: 0, strictPort: true } });
  const address = server.httpServer.address();
  const url = `http://127.0.0.1:${address.port}/beauty-clinic/`;
  const browser = await chromium.launch();
  return {
    browser,
    url,
    close: async () => {
      await browser.close();
      await new Promise((resolve, reject) =>
        server.httpServer.close((error) => (error ? reject(error) : resolve())),
      );
    },
  };
}
export async function ready(page) {
  const route = new URL(page.url()).hash.split('?')[0].replace('#/', '');
  const headings = {
    dashboard: 'ภาพรวมคลินิก',
    appointments: /จองคิว|ตารางนัดหมายของฉัน/,
    customers: 'ลูกค้า',
    courses: 'คอร์สของลูกค้า',
    sales: 'ขายและใบเสร็จ',
    inventory: 'สินค้าและสต็อก',
    treatments: 'รายการบริการ',
  };
  if (headings[route])
    await page.getByRole('heading', { name: headings[route], exact: true }).waitFor();
  if (route.startsWith('customers/')) await page.locator('.details-grid').first().waitFor();
  await page.locator('[data-ready="true"]').waitFor();
  await page.locator('[data-loading="true"]').waitFor({ state: 'hidden' });
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(
    () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))),
  );
}
export async function login(page, url, role = 'owner', screenshot = true) {
  await page.goto(url + (screenshot ? '?screenshot=1' : '') + '#/login');
  await page.getByLabel('บทบาท').selectOption(role);
  if (role === 'practitioner') await page.getByLabel('ผู้ให้บริการ').selectOption('s1');
  await page.getByRole('button', { name: 'เข้าสู่ระบบ', exact: true }).click();
  await ready(page);
}
