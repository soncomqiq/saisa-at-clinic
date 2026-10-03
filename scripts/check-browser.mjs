import assert from 'node:assert/strict';
import { mkdir, readFile } from 'node:fs/promises';
import ExcelJS from 'exceljs';
import AxeBuilder from '@axe-core/playwright';
import { execFileSync } from 'node:child_process';
import { startBrowser, ready, login } from './browser.mjs';
const app = await startBrowser();
const failures = [];
assert.equal(
  execFileSync('git', ['diff', '4e8f99f', '--', 'src/domain', 'src/services', 'src/App.tsx'], {
    encoding: 'utf8',
  }),
  '',
  'Protected domain/service/route files changed',
);
async function checkAccessibility(page, label) {
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();
  assert.deepEqual(
    results.violations.map((violation) => ({
      id: violation.id,
      nodes: violation.nodes.map((node) => ({ target: node.target, reason: node.failureSummary })),
    })),
    [],
    label,
  );
  console.log('PASS accessibility', label);
}
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
    const numeralWidths = await page.evaluate(() => {
      const sample = document.createElement('span');
      sample.className = 'numeric';
      sample.style.display = 'inline-block';
      sample.style.position = 'fixed';
      sample.style.fontSize = 'var(--text-lead)';
      document.body.appendChild(sample);
      const widths = [...'0123456789'].map((digit) => {
        sample.textContent = digit;
        return sample.getBoundingClientRect().width;
      });
      sample.remove();
      return widths;
    });
    assert.ok(
      Math.max(...numeralWidths) - Math.min(...numeralWidths) < 0.1,
      'Sarabun numerals must have equal advances',
    );
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
      await checkAccessibility(page, `${width}px ${route}`);
      console.log(`PASS ${width}px ${route}`);
    }
    await page.goto(app.url + '#/dashboard?screenshot=1');
    await ready(page);
    assert.equal(await page.locator('.demo-banner').count(), 0);
    await page.goto(app.url + '#/dashboard');
    await ready(page);
    assert.equal(await page.locator('.demo-banner').count(), 1);
    const recordBox = await page.locator('.day-record').first().boundingBox();
    assert.ok(
      recordBox && recordBox.y + recordBox.height <= (width === 390 ? 844 : 900),
      'Dashboard must show a complete appointment with banner',
    );
    await page.keyboard.press('Tab');
    const focus = await page.evaluate(() => {
      const element = document.activeElement;
      const style = getComputedStyle(element);
      return {
        visible: element.matches(':focus-visible'),
        outline: style.outlineStyle,
        width: parseFloat(style.outlineWidth),
      };
    });
    assert.ok(
      focus.visible && focus.outline !== 'none' && focus.width >= 2,
      'Visible keyboard focus',
    );
    if (width === 390) {
      await page.getByRole('button', { name: 'เปิดเมนู' }).click();
      await page.getByRole('dialog').waitFor();
      await checkAccessibility(page, 'mobile drawer');
      await page.keyboard.press('Escape');
      await page.getByRole('dialog').waitFor({ state: 'hidden' });
      assert.equal(
        await page
          .getByRole('button', { name: 'เปิดเมนู' })
          .evaluate((element) => document.activeElement === element),
        true,
        'Drawer returns focus',
      );
      await page.getByRole('button', { name: 'เปิดเมนู' }).click();
      await page.getByRole('link', { name: 'ลูกค้า', exact: true }).click();
      await ready(page);
      await page.getByRole('dialog').waitFor({ state: 'hidden' });
    }
    await page.goto(app.url + '?screenshot=1#/customers');
    await ready(page);
    await page.getByLabel('ค้นหาลูกค้า').fill('ไม่มีชื่อนี้ในข้อมูล');
    await page.getByText('ไม่พบลูกค้าที่ตรงกับคำค้น', { exact: true }).waitFor();
    await checkAccessibility(page, 'customer empty state');
    await page.getByRole('button', { name: 'ล้างคำค้น', exact: true }).click();
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(app.url + '?screenshot=1#/appointments');
    await ready(page);
    await page.getByRole('button', { name: 'จองคิวใหม่', exact: true }).click();
    await page.getByRole('dialog').waitFor();
    await checkAccessibility(page, 'booking dialog');
    assert.equal(
      await page.evaluate(
        () => getComputedStyle(document.querySelector('.modal-overlay')).animationName,
      ),
      'none',
    );
    await page.keyboard.press('Escape');
    await page.getByRole('dialog').waitFor({ state: 'hidden' });
    assert.equal(
      await page
        .getByRole('button', { name: 'จองคิวใหม่', exact: true })
        .evaluate((element) => document.activeElement === element),
      true,
      'Booking dialog returns focus',
    );
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
    await checkAccessibility(page, 'receipt preview');
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
    await page.goto(app.url + '?screenshot=1#/login');
    await ready(page);
    await checkAccessibility(page, 'login');
    console.log(
      `PASS ${width}px role redirects, PDF (${pdfBytes.length} bytes), XLSX, banner, navigation`,
    );
    await context.close();
  }
  assert.deepEqual(failures, [], 'Browser runtime errors');
} finally {
  await app.close();
}
