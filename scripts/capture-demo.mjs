import puppeteer from 'puppeteer-core';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FRAMES_DIR = path.join(__dirname, 'frames');
const CHROME = process.env.SCULPTR_CHROME_PATH ?? 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe';
const URL = process.env.SCULPTR_APP_URL ?? 'http://localhost:3000';

// Grid layout (DrawPanel):
// Panel container: left=56, p-3 (12px)
// Card: x=68, top=12, width=310
// Toolbar height: ~48px (p-3 = 12px top + buttons ~24px + pb-2 = 8px bottom)
// Grid section: pt-1 (4px top) + p-3 (12px)
// Grid element: x=80, y=76, width=284, height=284
// Cell size: 284/24 ≈ 11.83px
const GRID_X = 80;
const GRID_Y = 76;
const CELL = 284 / 24;

let frameIdx = 0;

function cellCenter(col, row) {
  return {
    x: GRID_X + col * CELL + CELL / 2,
    y: GRID_Y + row * CELL + CELL / 2,
  };
}

async function shot(page, label) {
  const file = path.join(FRAMES_DIR, `${String(frameIdx).padStart(3, '0')}_${label}.png`);
  await page.screenshot({ path: file, type: 'png' });
  console.log(`[${frameIdx}] ${label}`);
  frameIdx++;
  return file;
}

async function wait(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function drawHeart(page) {
  // Heart shape in 24x24 grid — centered at col 11-12
  const pixels = [
    // Row 3 — top humps start
    [4,3],[5,3],              [10,3],[11,3],
    // Row 4 — humps peak
    [3,4],[4,4],[5,4],[6,4],  [9,4],[10,4],[11,4],[12,4],
    // Row 5 — humps connect
    [2,5],[3,5],[4,5],[5,5],[6,5],[7,5],[8,5],[9,5],[10,5],[11,5],[12,5],[13,5],
    // Row 6
    [1,6],[2,6],[3,6],[4,6],[5,6],[6,6],[7,6],[8,6],[9,6],[10,6],[11,6],[12,6],[13,6],[14,6],
    // Row 7
    [1,7],[2,7],[3,7],[4,7],[5,7],[6,7],[7,7],[8,7],[9,7],[10,7],[11,7],[12,7],[13,7],[14,7],
    // Row 8
    [2,8],[3,8],[4,8],[5,8],[6,8],[7,8],[8,8],[9,8],[10,8],[11,8],[12,8],[13,8],
    // Row 9
    [3,9],[4,9],[5,9],[6,9],[7,9],[8,9],[9,9],[10,9],[11,9],[12,9],
    // Row 10
    [4,10],[5,10],[6,10],[7,10],[8,10],[9,10],[10,10],[11,10],
    // Row 11
    [5,11],[6,11],[7,11],[8,11],[9,11],[10,11],
    // Row 12
    [6,12],[7,12],[8,12],[9,12],
    // Row 13 — tip
    [7,13],[8,13],
  ];

  for (const [col, row] of pixels) {
    const { x, y } = cellCenter(col, row);
    await page.mouse.click(x, y);
    await wait(15);
  }
}

async function main() {
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: false,
    args: [
      '--window-size=1280,760',
      '--enable-webgl',
      '--enable-webgl2',
      '--use-angle=d3d11',
      '--disable-gpu-sandbox',
      '--no-sandbox',
      '--user-data-dir=C:\\Temp\\sculptr-puppeteer',
      '--disable-infobars',
    ],
    defaultViewport: { width: 1280, height: 720 },
  });

  const page = await browser.newPage();
  await page.goto(URL, { waitUntil: 'networkidle0', timeout: 30000 });

  // Wait for Three.js to render
  await wait(2500);

  // ── SCENE 1: Default state — floating star ──────────────────────────────
  console.log('Scene 1: Default star');
  for (let i = 0; i < 8; i++) {
    await shot(page, `star_${i}`);
    await wait(200);
  }

  // ── SCENE 2: Open Draw panel ────────────────────────────────────────────
  console.log('Scene 2: Open Draw');
  await page.click('button[title="Draw"]');
  await wait(300);
  await shot(page, 'draw_open');

  // Clear any existing pixels (click trash icon)
  // Trash button is in toolbar: approximately x=418, y=51 (within panel)
  // Actually: Panel at x=56, card x=68, toolbar padding 12px, trash is ml-auto
  // Trash button: rightmost in the toolbar row, at approx x=68+310-12-16=350, y=12+12+12=36
  const clearBtn = await page.$('button[title="Clear"]');
  if (clearBtn) {
    await clearBtn.click();
    await wait(200);
  }
  await shot(page, 'draw_cleared');

  // ── SCENE 3: Draw a heart ───────────────────────────────────────────────
  console.log('Scene 3: Draw heart');
  await drawHeart(page);
  await shot(page, 'heart_drawn');
  await wait(800);

  // ── SCENE 4: 3D heart renders ───────────────────────────────────────────
  console.log('Scene 4: 3D heart');
  for (let i = 0; i < 8; i++) {
    await shot(page, `heart_3d_${i}`);
    await wait(250);
  }

  // ── SCENE 5: Open settings ──────────────────────────────────────────────
  console.log('Scene 5: Settings');
  // Settings button (≡ icon) is top-right — approximately (755, 45)
  const settingsBtn = await page.$('button[title="Settings"]');
  if (settingsBtn) {
    await settingsBtn.click();
  } else {
    await page.mouse.click(755, 45);
  }
  await wait(500);
  await shot(page, 'settings_open');

  // ── SCENE 6: Change material to Chrome ──────────────────────────────────
  console.log('Scene 6: Chrome material');
  // Find the Material select by looking for select elements and picking the one with 'chrome' option
  const changed = await page.evaluate(() => {
    const selects = Array.from(document.querySelectorAll('select'));
    for (const sel of selects) {
      const opts = Array.from(sel.options).map(o => o.value);
      if (opts.includes('chrome')) {
        sel.value = 'chrome';
        sel.dispatchEvent(new Event('change', { bubbles: true }));
        return true;
      }
    }
    return false;
  });
  console.log('Material changed:', changed);
  await wait(800);
  await shot(page, 'chrome_material');

  for (let i = 0; i < 5; i++) {
    await shot(page, `chrome_${i}`);
    await wait(250);
  }

  // ── SCENE 7: Change animation to spin ───────────────────────────────────
  console.log('Scene 7: Spin animation');
  await page.evaluate(() => {
    const selects = Array.from(document.querySelectorAll('select'));
    for (const sel of selects) {
      const opts = Array.from(sel.options).map(o => o.value);
      if (opts.includes('spin')) {
        sel.value = 'spin';
        sel.dispatchEvent(new Event('change', { bubbles: true }));
        return true;
      }
    }
    return false;
  });
  await wait(600);

  for (let i = 0; i < 6; i++) {
    await shot(page, `spin_${i}`);
    await wait(280);
  }

  // ── SCENE 8: Close settings + capture ───────────────────────────────────
  console.log('Scene 8: Close & capture');
  if (settingsBtn) {
    await settingsBtn.click();
  } else {
    await page.mouse.click(755, 45);
  }
  await wait(400);
  await shot(page, 'final_clean');

  // Click capture (white circle at bottom center)
  // ExportBar: bottom center. Button at approx (640, 666) in 1280x720
  await page.mouse.click(640, 666);
  await wait(150);
  await shot(page, 'capture_ring');
  await wait(400);
  await shot(page, 'capture_end');

  console.log(`\nTotal frames: ${frameIdx} → saved to ${FRAMES_DIR}`);
  await browser.close();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
