import { chromium } from '@playwright/test';
import { mkdir, readFile } from 'node:fs/promises';

const WIDTH = Number(process.env.GALLERY_WIDTH || 1920);
const HEIGHT = Number(process.env.GALLERY_HEIGHT || 1280);
if (!Number.isFinite(WIDTH) || !Number.isFinite(HEIGHT) || WIDTH < 800 || HEIGHT < 600)
  throw new Error('Gallery dimensions must be at least 800 × 600');
const manifest = JSON.parse(await readFile('docs/screenshots/manifest.json', 'utf8'));
const browser = await chromium.launch();
try {
  await mkdir('docs/screenshots/gallery', { recursive: true });
  const page = await browser.newPage({
    viewport: { width: WIDTH, height: HEIGHT },
    deviceScaleFactor: 1,
  });
  const scale = Math.min(WIDTH / 1920, HEIGHT / 1280);
  for (const file of manifest.files) {
    const desktop = (await readFile('docs/screenshots/' + file.desktop)).toString('base64');
    const mobile = (await readFile('docs/screenshots/' + file.mobile)).toString('base64');
    await page.setContent(`<!doctype html><html lang="th"><head><meta charset="utf-8"><style>
      *{box-sizing:border-box}body{margin:0;background:#edf2ee;overflow:hidden}
      .stage{position:absolute;width:1920px;height:1280px;left:50%;top:50%;transform:translate(-50%,-50%) scale(${scale});background:radial-gradient(ellipse at 25% 20%,#fbfdfb,#e7eeea 75%)}
      .laptop{position:absolute;left:155px;top:155px;width:1370px}
      .screen{background:#303b35;border:13px solid #303b35;border-top-width:22px;border-bottom-width:22px;border-radius:18px 18px 7px 7px;position:relative;box-shadow:0 20px 70px #203e2820}
      .screen:before{content:'';position:absolute;top:-15px;left:50%;width:5px;height:5px;background:#708779;border-radius:50%}
      .screen img{display:block;width:100%;height:auto;border-radius:2px}
      .base{width:1490px;height:24px;margin-left:-60px;background:linear-gradient(#e4e9e5,#a9b8ae);border-radius:2px 2px 60px 60px;box-shadow:0 22px 30px #20422a15;position:relative}
      .base:before{content:'';position:absolute;top:0;left:42%;width:16%;height:7px;background:#bbc7be;border-radius:0 0 8px 8px}
      .phone{position:absolute;right:230px;bottom:95px;width:294px;border:11px solid #263b30;border-top-width:16px;border-bottom-width:16px;border-radius:36px;background:#263b30;box-shadow:0 20px 50px #1d352d30;overflow:hidden}
      .phone img{display:block;width:100%;height:auto;border-radius:24px}
      .phone:after{content:'';position:absolute;width:72px;height:5px;bottom:6px;left:50%;transform:translateX(-50%);background:#94a99c;border-radius:4px}
    </style></head><body><main class="stage"><div class="laptop"><div class="screen"><img alt="${file.title}" src="data:image/png;base64,${desktop}"></div><div class="base"></div></div><div class="phone"><img alt="${file.title} มือถือ" src="data:image/png;base64,${mobile}"></div></main></body></html>`);
    await page
      .locator('img')
      .evaluateAll((images) => Promise.all(images.map((image) => image.decode())));
    await page.screenshot({
      path: `docs/screenshots/gallery/${file.name}.png`,
      animations: 'disabled',
    });
    console.log('GALLERY', file.name, `${WIDTH}×${HEIGHT}`);
  }
} finally {
  await browser.close();
}
