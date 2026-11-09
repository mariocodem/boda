// Recorta las piezas pequeñas de la lámina «Dress code» (las dos ramitas, el
// florón de los filetes, el círculo de «Evitar» y los tres íconos de
// «Detalles que suman») y vuelve transparente su papel con color-to-alpha
// contra el papel de alrededor: compuestas sobre ese papel quedan iguales.
//
// Uso: node herramientas/vestimenta/piezas.mjs referencias-boda/referencias/DressCode.png salida
// y después se copian salida/*.webp a assets/vestimenta/.
import fs from 'fs';
import { conPagina, dataUrl, guardar } from './lib.mjs';
const [,, imagen, salida] = process.argv;
const PIEZAS = {
  'hoja-1': [12, 183, 118, 313],
  'hoja-2': [48, 1275, 156, 1385],
  'floron': [522, 63, 561, 82],
  'evitar': [42, 1455, 126, 1539],
  'icono-vestido': [347, 1460, 414, 1529],
  'icono-zapato': [506, 1460, 574, 1529],
  'icono-reloj': [670, 1460, 738, 1529],
};
fs.mkdirSync(salida, { recursive: true });
const r = await conPagina((p) => p.evaluate(async ([src, piezas]) => {
  const img = new Image(); img.src = src; await img.decode();
  const out = {};
  for (const [nombre, [x0, y0, x1, y1]] of Object.entries(piezas)) {
    const W = x1 - x0, H = y1 - y0;
    const c = document.createElement('canvas'); c.width = W; c.height = H;
    const g = c.getContext('2d'); g.drawImage(img, x0, y0, W, H, 0, 0, W, H);
    const id = g.getImageData(0, 0, W, H); const d = id.data;
    // el papel: mediana del contorno
    const cs = [[], [], []];
    for (let x = 0; x < W; x++) for (const y of [0, H - 1]) for (let q = 0; q < 3; q++) cs[q].push(d[(y * W + x) * 4 + q]);
    for (let y = 0; y < H; y++) for (const x of [0, W - 1]) for (let q = 0; q < 3; q++) cs[q].push(d[(y * W + x) * 4 + q]);
    const B = cs.map((a) => a.sort((u, v) => u - v)[a.length >> 1]);
    for (let i = 0; i < W * H; i++) {
      let a = 0;
      for (let q = 0; q < 3; q++) { const P = d[i*4+q]; const t = P > B[q] ? (P - B[q]) / (255 - B[q]) : (B[q] - P) / B[q]; a = Math.max(a, t); }
      // el ruido de la compresión cerca del papel se vuelve papel
      a = a < 0.035 ? 0 : a;
      if (a === 0) { d[i*4+3] = 0; continue; }
      for (let q = 0; q < 3; q++) d[i*4+q] = (d[i*4+q] - B[q]) / a + B[q];
      d[i*4+3] = Math.round(a * 255);
    }
    g.putImageData(id, 0, 0);
    out[nombre] = { url: c.toDataURL('image/webp', 0.95), W, H, papel: B };
  }
  return out;
}, [dataUrl(imagen), PIEZAS]));
for (const [n, v] of Object.entries(r)) { guardar(v.url, `${salida}/${n}.webp`); console.log(n, v.W + 'x' + v.H, 'papel', v.papel.join(',')); }
