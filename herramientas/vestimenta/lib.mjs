// Abre Chromium (Playwright) y le pasa las imágenes como data URL: los
// recortes se hacen con canvas, sin Python ni librerías de imagen.
// Playwright se busca junto a este archivo o en PLAYWRIGHT_DIR (la carpeta
// node_modules donde esté instalado, por ejemplo la de `npx playwright`).
import { createRequire } from 'module';
import fs from 'fs';

const require = createRequire(process.env.PLAYWRIGHT_DIR ? `${process.env.PLAYWRIGHT_DIR.replace(/\/$/, '')}/` : import.meta.url);
const { chromium } = require('playwright');

export async function conPagina(fn) {
  const b = await chromium.launch();
  const p = await b.newPage();
  try { return await fn(p); } finally { await b.close(); }
}

export const dataUrl = (f) => 'data:image/png;base64,' + fs.readFileSync(f).toString('base64');
export const guardar = (u, f) => fs.writeFileSync(f, Buffer.from(u.split(',')[1], 'base64'));
