import assert from 'node:assert/strict';
import { mkdir, readFile } from 'node:fs/promises';
import ExcelJS from 'exceljs';
import { startBrowser, ready, login } from './browser.mjs';
const app = await startBrowser();
const failures = [];
try {
  await mkdir('test-results', { recursive: true });
  for (const width of [1440, 390]) {
    const context = await app.browser.newContext({
      viewport: { width, height: width === 390 ? 844 : 900 },
      timezoneId: 'Asia/Bangkok',
      deviceScaleFactor: width === 390 ? 2 : 1,
    });
    const page = await context.newPage();
    page.on('pageerror', (error) => failures.push(error.message));
    page.on('download', (download) => console.log('DOWNLOAD', download.suggestedFilename()));
    await login(page, app.url);
    for (const route of [
      'dashboard',
      'appointments',
      'customers',
      'customers/c1',
      'courses',
      'sales',
      'inventory',
      'treatments',
    ]) {
      await page.goto(app.url + '?screenshot=1#/' + route);
      await ready(page);
      assert.equal(
        await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
        false,
        `${route} overflow ${width}`,
      );
      assert.equal(await page.locator('.demo-banner').count(), 0);
      console.log(`PASS ${width}px ${route}`);
    }
    await page.goto(app.url + '#/dashboard?screenshot=1');
    await ready(page);
    assert.equal(await page.locator('.demo-banner').count(), 0);
    await page.goto(app.url + '#/dashboard');
    await ready(page);
    assert.equal(await page.locator('.demo-banner').count(), 1);
    if (width === 390) {
      await page.getByRole('button', { name: 'เปิดเมนู' }).click();
      await page.getByRole('link', { name: 'ลูกค้า', exact: true }).click();
      await ready(page);
      assert.equal(await page.locator('.mobile-open').count(), 0);
    }
    await page.goto(app.url + '?screenshot=1#/sales');
    await ready(page);
    await page.locator('.sale-item').filter({ hasText: 'ดูแลผิวหน้าเติมน้ำ' }).click();
    await page.getByRole('button', { name: 'คอร์ส', exact: true }).click();
    await page.locator('.sale-item').filter({ hasText: 'ดูแลผิวหน้าเติมน้ำ' }).click();
    await page.getByRole('button', { name: 'สินค้า', exact: true }).click();
    await page.locator('.sale-item').filter({ hasText: 'เจลล้างหน้าอ่อนโยน' }).click();
    if (width === 390) await page.getByRole('button', { name: 'รายการขาย', exact: true }).click();
    await page.getByRole('button', { name: 'รับชำระเงิน', exact: true }).click();
    await page.getByTestId('receipt').waitFor();
    const pdfPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: 'ดาวน์โหลด PDF' }).click();
    const pdf = await Promise.race([
      pdfPromise,
      page
        .locator('[data-sonner-toast][data-type="error"]')
        .waitFor()
        .then(async () => {
          throw new Error(await page.locator('[data-sonner-toast][data-type="error"]').innerText());
        }),
    ]);
    const pdfPath = `test-results/receipt-${width}.pdf`;
    await pdf.saveAs(pdfPath);
    const pdfBytes = await readFile(pdfPath);
    assert.equal(pdfBytes.subarray(0, 4).toString(), '%PDF');
    assert.ok(pdfBytes.length > 10000);
    await page.getByRole('button', { name: 'ปิด', exact: true }).click();
    await page.goto(app.url + '?screenshot=1#/inventory');
    await ready(page);
    const excelPromise = page.waitForEvent('download', { timeout: 10000 }).catch(async (error) => {
      console.log(
        'EXPORT STATE',
        await page.locator('[data-sonner-toast]').allTextContents(),
        await page.getByRole('heading', { level: 1 }).allTextContents(),
      );
      await page.screenshot({ path: 'test-results/export-failure.png' });
      throw error;
    });
    await page.getByRole('button', { name: 'ส่งออก Excel' }).click();
    const excel = await Promise.race([
      excelPromise,
      page
        .locator('[data-sonner-toast][data-type="error"]')
        .waitFor()
        .then(async () => {
          throw new Error(await page.locator('[data-sonner-toast][data-type="error"]').innerText());
        }),
    ]);
    const excelPath = `test-results/stock-${width}.xlsx`;
    await excel.saveAs(excelPath);
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(excelPath);
    assert.equal(workbook.worksheets[0].rowCount, 31);
    await login(page, app.url, 'receptionist');
    await page.goto(app.url + '#/customers/c1');
    await ready(page);
    assert.equal(await page.getByText('ข้อควรระวัง', { exact: true }).count(), 0);
    await page.goto(app.url + '#/dashboard');
    await page.getByRole('heading', { name: 'จองคิว', exact: true }).waitFor();
    await login(page, app.url, 'practitioner');
    assert.equal(await page.locator('.calendar-column').count(), 1);
    assert.equal(await page.getByText(/฿/).count(), 0);
    assert.equal(await page.getByRole('button', { name: 'จองคิวใหม่' }).count(), 0);
    await page.goto(app.url + '#/sales');
    await page.getByRole('heading', { name: 'ตารางนัดหมายของฉัน' }).waitFor();
    console.log(
      `PASS ${width}px role redirects, PDF (${pdfBytes.length} bytes), XLSX, banner, navigation`,
    );
    await context.close();
  }
  assert.deepEqual(failures, [], 'Browser runtime errors');
} finally {
  await app.close();
}
