import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { startBrowser, ready, login } from './browser.mjs';

const scenarios = [
  ['dashboard', 'ภาพรวมคลินิก'],
  ['appointments-week', 'ตารางนัดหมายรายสัปดาห์'],
  ['appointments-day', 'ตารางนัดหมายรายวัน'],
  ['appointments-room', 'ตารางห้องบริการ'],
  ['booking-conflict', 'คำเตือนเมื่อจองคิวซ้อน'],
  ['customer-active-courses', 'ข้อมูลลูกค้าและคอร์สที่ใช้งานได้'],
  ['courses', 'คอร์สของลูกค้า'],
  ['sales-bill', 'รายการขายระหว่างสร้างบิล'],
  ['receipt-preview', 'ใบเสร็จรับเงิน'],
  ['inventory-low-stock', 'รายการสต็อกต่ำ'],
  ['practitioner-schedule', 'ตารางนัดหมายเฉพาะผู้ให้บริการ'],
];
const app = await startBrowser();
const captured = [];
const errors = [];
try {
  for (const device of ['desktop', 'mobile']) {
    const mobile = device === 'mobile';
    const context = await app.browser.newContext({
      viewport: mobile ? { width: 390, height: 844 } : { width: 1440, height: 900 },
      deviceScaleFactor: mobile ? 2 : 1,
      timezoneId: 'Asia/Bangkok',
      locale: 'th-TH',
      isMobile: mobile,
      hasTouch: mobile,
      reducedMotion: 'reduce',
    });
    const page = await context.newPage();
    page.on('pageerror', (error) => errors.push(error.message));
    const directory = `docs/screenshots/${device}`;
    await mkdir(directory, { recursive: true });
    await login(page, app.url);
    const go = async (route) => {
      await page.goto(app.url + '?screenshot=1#/' + route);
      await ready(page);
      await page.evaluate(() => scrollTo(0, 0));
    };
    const capture = async (name) => {
      await page.locator('[data-sonner-toast]').waitFor({ state: 'hidden' });
      await page.mouse.move(0, 0);
      await page.evaluate(
        () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))),
      );
      await page.evaluate(() => document.fonts.ready);
      assert.equal(await page.locator('.demo-banner').count(), 0);
      assert.equal(await page.locator('[data-loading="true"]').count(), 0);
      assert.equal(
        await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
        false,
      );
      const path = `${directory}/${name}.png`;
      await page.screenshot({ path, fullPage: false, animations: 'disabled' });
      captured.push(path);
      console.log('CAPTURE', path);
    };
    await capture('dashboard');
    await go('appointments');
    await page.getByRole('button', { name: 'สัปดาห์', exact: true }).click();
    await capture('appointments-week');
    await page.getByRole('button', { name: 'วัน', exact: true }).click();
    await capture('appointments-day');
    await page.getByRole('button', { name: 'ห้อง', exact: true }).click();
    await capture('appointments-room');

    const tomorrow = await page.evaluate(() => {
      const date = new Date();
      date.setDate(date.getDate() + 1);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    });
    await page.getByRole('button', { name: 'วัน', exact: true }).click();
    await page.getByLabel('เลือกวันที่').fill(tomorrow);
    await page.waitForFunction(
      (day) =>
        document.querySelector('.calendar-legend>.muted')?.textContent.split(' ')[0] ===
        String(Number(day.split('-')[2])),
      tomorrow,
    );
    const event = page.locator('.calendar-event').first();
    const customer = await event.locator('strong').innerText();
    const treatment = await event.locator('.event-treatment').innerText();
    const time = (await event.locator('.event-time').innerText()).split('–')[0];
    await event.click();
    const practitioner = await page.locator('.modal .details-grid dd').nth(1).innerText();
    const room = await page.locator('.modal .details-grid dd').nth(2).innerText();
    await page.getByRole('button', { name: 'ปิด', exact: true }).click();
    await page.getByRole('button', { name: 'จองคิวใหม่', exact: true }).click();
    const selectPrefix = async (label, prefix) => {
      const select = page.getByRole('combobox', { name: label, exact: true });
      await select.waitFor({ state: 'visible' });
      await select.locator('option').first().waitFor({ state: 'attached' });
      const value = await select
        .locator('option')
        .evaluateAll(
          (options, text) =>
            options.find((option) => option.textContent.trim().startsWith(text.trim()))?.value,
          prefix,
        );
      assert.ok(value, `Missing option ${label}: ${prefix}`);
      await select.selectOption(value);
    };
    await selectPrefix('ลูกค้า', customer);
    await selectPrefix('บริการ', treatment);
    await page
      .getByRole('combobox', { name: 'ผู้ให้บริการ', exact: true })
      .selectOption({ label: practitioner });
    await page
      .getByRole('combobox', { name: 'ห้องบริการ', exact: true })
      .selectOption({ label: room });
    await page.getByLabel('วันที่นัดหมาย').fill(tomorrow);
    await page.getByLabel('เวลาเริ่มนัดหมาย').fill(time);
    await page.getByRole('button', { name: 'บันทึกนัดหมาย', exact: true }).click();
    await page.getByTestId('booking-warning').waitFor();
    assert.match(await page.getByTestId('booking-warning').innerText(), /มีนัดหมายแล้ว/);
    await page.getByTestId('booking-warning').scrollIntoViewIfNeeded();
    if (mobile)
      await page.locator('.modal').evaluate((element) => {
        element.scrollTop = element.scrollHeight;
      });
    await capture('booking-conflict');
    await page.getByRole('button', { name: 'ปิด', exact: true }).click();

    await go('customers/c1');
    assert.ok(await page.locator('.course-card').count());
    await capture('customer-active-courses');
    await go('courses');
    await capture('courses');
    await go('sales');
    await page.locator('.sale-item').filter({ hasText: 'ดูแลผิวหน้าเติมน้ำ' }).click();
    await page.getByRole('button', { name: 'คอร์ส', exact: true }).click();
    await page.locator('.sale-item').filter({ hasText: 'ดูแลผิวหน้าเติมน้ำ' }).click();
    await page.getByRole('button', { name: 'สินค้า', exact: true }).click();
    await page.locator('.sale-item').filter({ hasText: 'เจลล้างหน้าอ่อนโยน' }).click();
    await page.evaluate(() => scrollTo(0, 0));
    if (mobile)
      await page
        .locator('.bill')
        .evaluate((element) => scrollTo(0, element.getBoundingClientRect().top + scrollY - 20));
    await capture('sales-bill');
    await page.getByRole('button', { name: 'ประวัติใบเสร็จ', exact: true }).click();
    const mixed = page.locator('.panel .list-row').filter({ hasText: '2 รายการ' });
    const row = (await mixed.count()) ? mixed.first() : page.locator('.panel .list-row').first();
    await row.getByRole('button', { name: 'ดูใบเสร็จ' }).click();
    await page.getByTestId('receipt').waitFor();
    await capture('receipt-preview');
    await page.getByRole('button', { name: 'ปิด', exact: true }).click();
    await go('inventory');
    await page.getByLabel('กรองสินค้า').selectOption('low');
    await capture('inventory-low-stock');
    await login(page, app.url, 'practitioner');
    assert.equal(await page.locator('.calendar-column').count(), 1);
    assert.equal(await page.getByText(/฿/).count(), 0);
    await capture('practitioner-schedule');
    await context.close();
  }
  assert.deepEqual(errors, []);
  const files = scenarios.map(([name, title]) => ({
    name,
    title,
    role: name === 'practitioner-schedule' ? 'practitioner' : 'owner',
    desktop: `desktop/${name}.png`,
    mobile: `mobile/${name}.png`,
    gallery: `gallery/${name}.png`,
  }));
  await writeFile(
    'docs/screenshots/manifest.json',
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        desktop: { width: 1440, height: 900, scale: 1 },
        mobile: { width: 390, height: 844, scale: 2 },
        files,
      },
      null,
      2,
    ),
  );
  console.log(`Captured ${captured.length} screenshots, all scenarios clean.`);
} finally {
  await app.close();
}
