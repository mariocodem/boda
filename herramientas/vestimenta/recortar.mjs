// Recorta una fila de figuras de la lámina «Dress code» y separa cada prenda.
//
// Uso (desde la raíz del proyecto):
//   node herramientas/vestimenta/recortar.mjs referencias-boda/referencias/DressCode.png herramientas/vestimenta/ellas.json salida
//   node herramientas/vestimenta/recortar.mjs referencias-boda/referencias/DressCode.png herramientas/vestimenta/ellos.json salida
// y después se copian salida/ellas*.webp y salida/ellos*.webp a assets/vestimenta/.
// Opcional, un cuarto argumento con colores de prueba: '["#d8a7a7", ...]'.
//
// Cómo: cada píxel del recorte se compara (en Lab, con la luz a media fuerza)
// con muestras de cada prenda, de la piel, del pelo, del papel y de lo demás
// (rectángulos de la configuración) y se queda con la clase más parecida.
// Cada prenda se queda con los pedazos que tocan sus núcleos, se cierra (2 px),
// rellena huecos chicos, suma las sombras oscuras pegadas al borde y se le
// quitan las corbatas, los zapatos y la mano (polígonos «excluir»).
//
// Sale:
//  - <nombre>.webp: la fila sin el papel (transparente)
//  - <nombre>-<id>.webp: por prenda, la luz de la tela en gris (RGB) y su silueta (alfa),
//    lista para background-blend-mode: hard-light sobre el color elegido
//  - <nombre>.json: caja de cada prenda en % de la fila y su color de origen
//    (van a DC_FILAS en assets/bloques.js)
//  - vista-*.png: la máscara teñida, las etiquetas y una prueba de colores
import fs from 'fs';
import { conPagina, dataUrl, guardar } from './lib.mjs';
const [,, imagen, config, salida, pruebaJson] = process.argv;
const cfg = JSON.parse(fs.readFileSync(config, 'utf8'));
const prueba = pruebaJson ? JSON.parse(pruebaJson) : null;
fs.mkdirSync(salida, { recursive: true });
const r = await conPagina((p) => p.evaluate(async ([src, cfg, prueba]) => {
  const img = new Image(); img.src = src; await img.decode();
  const [X0, Y0, X1, Y1] = cfg.recorte;
  const W = X1 - X0, H = Y1 - Y0, N = W * H;
  const c = document.createElement('canvas'); c.width = W; c.height = H;
  const g = c.getContext('2d'); g.drawImage(img, X0, Y0, W, H, 0, 0, W, H);
  const id = g.getImageData(0, 0, W, H); const d = id.data;
  const [BR, BG, BB] = cfg.fondo;
  // Borrar el texto gris que entra en el recorte (poca saturación, más oscuro que el papel)
  for (const [tx0, ty0, tx1, ty1] of cfg.borrarTexto || []) {
    for (let y = Math.max(0, ty0 - Y0); y < Math.min(H, ty1 - Y0); y++) for (let x = Math.max(0, tx0 - X0); x < Math.min(W, tx1 - X0); x++) {
      const k = (y * W + x) * 4; const mx = Math.max(d[k], d[k+1], d[k+2]), mn = Math.min(d[k], d[k+1], d[k+2]);
      if (mx - mn < 28) { d[k] = BR; d[k+1] = BG; d[k+2] = BB; }
    }
  }
  // Lab
  const lin = (v) => { v /= 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
  const f = (t) => t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116;
  const lab = (R, G, B) => { const r = lin(R), gg = lin(G), b = lin(B);
    const x = (0.4124 * r + 0.3576 * gg + 0.1805 * b) / 0.95047, y = 0.2126 * r + 0.7152 * gg + 0.0722 * b, z = (0.0193 * r + 0.1192 * gg + 0.9505 * b) / 1.08883;
    return [116 * f(y) - 16, 500 * (f(x) - f(y)), 200 * (f(y) - f(z))]; };
  const L = new Float32Array(N), A = new Float32Array(N), Bb = new Float32Array(N);
  for (let i = 0; i < N; i++) { const [l, a, b] = lab(d[i*4], d[i*4+1], d[i*4+2]); L[i] = l; A[i] = a; Bb[i] = b; }
  // Clases y muestras
  const enRect = ([x0, y0, x1, y1], fn) => { for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) { const lx = x - X0, ly = y - Y0; if (lx >= 0 && ly >= 0 && lx < W && ly < H) fn(ly * W + lx, lx, ly); } };
  let semilla = 7; const azar = () => { semilla = (semilla * 16807) % 2147483647; return semilla / 2147483647; };
  const lejosDelPapel = (i) => Math.hypot(d[i*4] - BR, d[i*4+1] - BG, d[i*4+2] - BB) > 22;
  const filtros = { claro: (i) => L[i] > 72, pelo: (i) => L[i] < 40 };
  const muestras = (rects, max = 90, nombre) => { const t = []; const ok = filtros[nombre] || (() => true); rects.forEach((rc) => enRect(rc, (i) => { if (lejosDelPapel(i) && ok(i)) t.push(i); })); for (let k = t.length - 1; k > 0; k--) { const j = Math.floor(azar() * (k + 1)); [t[k], t[j]] = [t[j], t[k]]; } return t.slice(0, max).map((i) => [L[i], A[i], Bb[i]]); };
  const clases = [];
  cfg.prendas.forEach((pr, n) => clases.push({ nombre: pr.id, prenda: n, caja: pr.caja, m: muestras(pr.nucleos, 120, pr.id) }));
  Object.entries(cfg.clases).forEach(([nombre, def]) => clases.push({ nombre, prenda: -1, caja: def.caja, m: muestras(def.rects, 120, nombre) }));
  // El fondo: el papel, sus sombras y píxeles reales cercanos al papel
  const fl = lab(BR, BG, BB);
  const claros = []; for (let i = 0; i < N; i++) if (Math.hypot(d[i*4] - BR, d[i*4+1] - BG, d[i*4+2] - BB) < 34) claros.push(i);
  const mf = [fl, lab(225, 222, 212), lab(215, 211, 200), lab(242, 240, 232), lab(205, 200, 190)];
  for (let k = 0; k < 120 && claros.length; k++) { const i = claros[Math.floor(azar() * claros.length)]; mf.push([L[i], A[i], Bb[i]]); }
  clases.push({ nombre: 'fondo', prenda: -1, m: mf });
  const wL = 0.5;
  const etiqueta = new Int16Array(N).fill(-1);
  for (let i = 0; i < N; i++) {
    const x = i % W + X0, y = ((i / W) | 0) + Y0;
    let mejor = 1e9, cual = -1;
    for (let k = 0; k < clases.length; k++) {
      const cl = clases[k];
      if (cl.caja && (x < cl.caja[0] || x >= cl.caja[2] || y < cl.caja[1] || y >= cl.caja[3])) continue;
      for (const [l, a, b] of cl.m) { const dd = (wL * (L[i] - l)) ** 2 + (A[i] - a) ** 2 + (Bb[i] - b) ** 2; if (dd < mejor) { mejor = dd; cual = k; } }
    }
    etiqueta[i] = cual;
  }
  // Polígonos a excluir (corbatas, zapatos)
  const dentro = (pol, x, y) => { let s = false; for (let a = 0, b = pol.length - 1; a < pol.length; b = a++) { const [xa, ya] = pol[a], [xb, yb] = pol[b]; if ((ya > y) !== (yb > y) && x < (xb - xa) * (y - ya) / (yb - ya) + xa) s = !s; } return s; };
  const excluido = new Uint8Array(N);
  (cfg.excluir || []).forEach((pol) => { for (let i = 0; i < N; i++) if (!excluido[i] && dentro(pol, i % W + X0 + 0.5, ((i / W) | 0) + Y0 + 0.5)) excluido[i] = 1; });
  // Morfología
  const dilatar = (m, r) => { const o = new Uint8Array(N); for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { if (!m[y * W + x]) continue; for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) { if (dx * dx + dy * dy > r * r + r) continue; const nx = x + dx, ny = y + dy; if (nx >= 0 && ny >= 0 && nx < W && ny < H) o[ny * W + nx] = 1; } } return o; };
  const erosionar = (m, r) => { const inv = new Uint8Array(N); for (let i = 0; i < N; i++) inv[i] = m[i] ? 0 : 1; const di = dilatar(inv, r); const o = new Uint8Array(N); for (let i = 0; i < N; i++) o[i] = di[i] ? 0 : 1; return o; };
  const componentes = (m) => { const comp = new Int32Array(N).fill(-1); const tam = []; for (let s = 0; s < N; s++) { if (!m[s] || comp[s] >= 0) continue; const pila = [s]; comp[s] = tam.length; let n = 0; while (pila.length) { const i = pila.pop(); n++; const x = i % W, y = (i / W) | 0; for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { const nx = x + dx, ny = y + dy; if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue; const j = ny * W + nx; if (m[j] && comp[j] < 0) { comp[j] = tam.length; pila.push(j); } } } tam.push(n); } return { comp, tam }; };
  const hexA = (h) => [1, 3, 5].map((k) => parseInt(h.slice(k, k + 2), 16));
  const luma = (r, g2, b) => (0.299 * r + 0.587 * g2 + 0.114 * b) / 255;
  const resultado = { W, H, prendas: [] };
  const mascaras = [];
  cfg.prendas.forEach((pr, n) => {
    const k = clases.findIndex((cl) => cl.prenda === n);
    let m = new Uint8Array(N);
    for (let i = 0; i < N; i++) if (etiqueta[i] === k && !excluido[i]) m[i] = 1;
    // quedarse con los pedazos que tocan los núcleos
    const { comp } = componentes(m); const sirve = new Set();
    pr.nucleos.forEach((rc) => enRect(rc, (i) => { if (comp[i] >= 0) sirve.add(comp[i]); }));
    for (let i = 0; i < N; i++) m[i] = m[i] && sirve.has(comp[i]) ? 1 : 0;
    // cerrar y rellenar huecos chicos
    m = erosionar(dilatar(m, 2), 2);
    const inv = new Uint8Array(N); for (let i = 0; i < N; i++) inv[i] = m[i] ? 0 : 1;
    const h = componentes(inv);
    const [cx0, cy0, cx1, cy1] = pr.caja.map((v, q) => v - (q % 2 ? Y0 : X0));
    const tocaBorde = new Set();
    for (let i = 0; i < N; i++) { if (h.comp[i] < 0) continue; const x = i % W, y = (i / W) | 0; if (x <= Math.max(0, cx0) || y <= Math.max(0, cy0) || x >= Math.min(W, cx1) - 1 || y >= Math.min(H, cy1) - 1) tocaBorde.add(h.comp[i]); }
    const noRellenar = new Set(clases.map((cl, q) => (cl.nombre === 'fondo' || cl.nombre === 'piel' || cl.nombre === 'claro') ? q : -1));
    for (let i = 0; i < N; i++) if (h.comp[i] >= 0 && !tocaBorde.has(h.comp[i]) && h.tam[h.comp[i]] < (pr.hueco || 250) && !noRellenar.has(etiqueta[i])) m[i] = 1;
    // Las sombras oscuras pegadas al borde (entre el brazo y la tela) se suman:
    // con hard-light quedan oscuras en cualquier color.
    const vetadas = new Set(clases.map((cl, q) => (cl.nombre === 'pelo' || cl.nombre === 'bolso' || cl.nombre === 'dorado') ? q : -1));
    for (let paso = 0; paso < (pr.crecer ?? 4); paso++) {
      const nuevos = [];
      for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) {
        const i = y * W + x; if (m[i] || excluido[i] || vetadas.has(etiqueta[i]) || L[i] >= (cfg.oscuro || 34)) continue;
        if (etiqueta[i] >= 0 && clases[etiqueta[i]].prenda >= 0 && clases[etiqueta[i]].prenda !== n) continue;
        if (m[i - 1] || m[i + 1] || m[i - W] || m[i + W] || m[i - W - 1] || m[i - W + 1] || m[i + W - 1] || m[i + W + 1]) nuevos.push(i);
      }
      nuevos.forEach((i) => { m[i] = 1; });
    }
    // El papel que la morfología haya cerrado entre la tela y el brazo vuelve a ser papel
    const fondoK = clases.findIndex((cl) => cl.nombre === 'fondo');
    const claroK = clases.findIndex((cl) => cl.nombre === 'claro');
    for (let i = 0; i < N; i++) if (m[i] && ((etiqueta[i] === fondoK && L[i] > 75) || (claroK >= 0 && etiqueta[i] === claroK && L[i] > 70))) m[i] = 0;
    // fuera de la caja y lo excluido, nada
    for (let i = 0; i < N; i++) { const x = i % W + X0, y = ((i / W) | 0) + Y0; if (excluido[i] || x < pr.caja[0] || x >= pr.caja[2] || y < pr.caja[1] || y >= pr.caja[3]) m[i] = 0; }
    // color de origen: el dado (los círculos de la lámina) o la mediana de los núcleos
    let hex = pr.hex;
    if (!hex) { const rs = [], gs = [], bs = []; pr.nucleos.forEach((rc) => enRect(rc, (i) => { if (m[i]) { rs.push(d[i*4]); gs.push(d[i*4+1]); bs.push(d[i*4+2]); } })); const orden = rs.map((_, q) => q).sort((u, v) => luma(rs[u], gs[u], bs[u]) - luma(rs[v], gs[v], bs[v])); const tramo = orden.slice(Math.floor(orden.length * 0.5), Math.floor(orden.length * 0.9)); const prom = (a) => Math.round(tramo.reduce((t, q) => t + a[q], 0) / tramo.length); hex = '#' + [prom(rs), prom(gs), prom(bs)].map((v) => v.toString(16).padStart(2, '0')).join(''); }
    // alfa suave (3x3) y sombras
    const alfa = new Float32Array(N);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { let s = 0, q = 0; for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { const nx = x + dx, ny = y + dy; if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue; s += m[ny * W + nx]; q++; } alfa[y * W + x] = m[y * W + x] ? s / q : (s / q) * 0.5; }
    let bx0 = W, by0 = H, bx1 = -1, by1 = -1;
    for (let i = 0; i < N; i++) if (alfa[i] > 0.02) { const x = i % W, y = (i / W) | 0; bx0 = Math.min(bx0, x); by0 = Math.min(by0, y); bx1 = Math.max(bx1, x); by1 = Math.max(by1, y); }
    const yd = luma(...hexA(hex));
    const bw = bx1 - bx0 + 1, bh = by1 - by0 + 1;
    const capa = new ImageData(bw, bh);
    const S = new Float32Array(N);
    const Y = new Float32Array(N);
    for (let y = by0; y <= by1; y++) for (let x = bx0; x <= bx1; x++) { const i = y * W + x; Y[i] = luma(d[i*4], d[i*4+1], d[i*4+2]); }
    // El borde de la prenda (mezclado con el papel o la piel) toma la luz de la tela de adentro
    const borde = (i) => { const x = i % W; return m[i] && (x === 0 || x === W - 1 || !m[i - 1] || !m[i + 1] || !m[i - W] || !m[i + W]); };
    const Yb = new Float32Array(Y);
    for (let y = Math.max(0, by0 - 1); y <= Math.min(H - 1, by1 + 1); y++) for (let x = Math.max(0, bx0 - 1); x <= Math.min(W - 1, bx1 + 1); x++) {
      const i = y * W + x; if (!(borde(i) || (!m[i] && alfa[i] > 0))) continue;
      let sum = 0, q = 0;
      for (let dy = -3; dy <= 3; dy++) for (let dx = -3; dx <= 3; dx++) { const nx = x + dx, ny = y + dy; if (nx < 1 || ny < 1 || nx >= W - 1 || ny >= H - 1) continue; const j = ny * W + nx; if (m[j] && !borde(j)) { sum += Y[j]; q++; } }
      if (q) Yb[i] = Math.min(Y[i], sum / q);
    }
    Y.set(Yb);
    // Telas casi negras: el grano de la foto se amplifica al aclararlas; se suaviza la luz (solo dentro de la prenda)
    const rs = pr.suavizar ?? cfg.suavizar ?? 0;
    const Ys = rs ? new Float32Array(N) : Y;
    if (rs) for (let y = by0; y <= by1; y++) for (let x = bx0; x <= bx1; x++) {
      const i = y * W + x; let sum = 0, q = 0;
      for (let dy = -rs; dy <= rs; dy++) for (let dx = -rs; dx <= rs; dx++) { const nx = x + dx, ny = y + dy; if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue; const j = ny * W + nx; if (!m[j]) continue; const w = 1 / (1 + dx * dx + dy * dy); sum += Y[j] * w; q += w; }
      Ys[i] = q ? sum / q : Y[i];
    }
    const kc = pr.contraste ?? cfg.contraste ?? 1;
    for (let y = by0; y <= by1; y++) for (let x = bx0; x <= bx1; x++) {
      const i = y * W + x; const yp = Ys[i];
      let s = yp <= yd ? yp / (2 * yd) : 1 - (1 - yp) / (2 * (1 - yd));
      s = 0.5 + (s - 0.5) * kc;
      S[i] = Math.max(0, Math.min(1, s));
      const o = ((y - by0) * bw + (x - bx0)) * 4; const v = Math.round(S[i] * 255);
      capa.data[o] = capa.data[o+1] = capa.data[o+2] = v; capa.data[o+3] = Math.round(alfa[i] * 255);
    }
    const cc = document.createElement('canvas'); cc.width = bw; cc.height = bh; cc.getContext('2d').putImageData(capa, 0, 0);
    mascaras.push({ alfa, S, hex });
    resultado.prendas.push({ id: pr.id, hex, caja: [bx0, by0, bw, bh], pct: [bx0 / W * 100, by0 / H * 100, bw / W * 100, bh / H * 100].map((v) => +v.toFixed(3)), webp: cc.toDataURL('image/webp', 0.9) });
  });
  // La fila sin fondo: lo cercano al papel se vuelve transparente (rampa de 6 a 26)
  const base = new ImageData(new Uint8ClampedArray(d), W, H);
  for (let i = 0; i < N; i++) {
    const dist = Math.hypot(d[i*4] - BR, d[i*4+1] - BG, d[i*4+2] - BB);
    base.data[i*4+3] = dist <= 6 ? 0 : dist >= 26 ? 255 : Math.round((dist - 6) / 20 * 255);
  }
  const cb = document.createElement('canvas'); cb.width = W; cb.height = H; cb.getContext('2d').putImageData(base, 0, 0);
  resultado.base = cb.toDataURL('image/webp', 0.9);
  // Vistas: máscara teñida y recoloreado de prueba (con la misma cuenta que hace el CSS)
  const vista = (fn) => { const v = new ImageData(W, H); for (let i = 0; i < N; i++) { const a = base.data[i*4+3] / 255; for (let q = 0; q < 3; q++) v.data[i*4+q] = d[i*4+q] * a + [BR, BG, BB][q] * (1 - a); v.data[i*4+3] = 255; } fn(v); const cv = document.createElement('canvas'); cv.width = W; cv.height = H; cv.getContext('2d').putImageData(v, 0, 0); return cv.toDataURL('image/png'); };
  const tintes = [[255,0,200],[0,220,255],[255,230,0],[0,255,90]];
  resultado.vistaMascara = vista((v) => mascaras.forEach(({ alfa }, n) => { const t = tintes[n % 4]; for (let i = 0; i < N; i++) if (alfa[i] > 0) for (let q = 0; q < 3; q++) v.data[i*4+q] = v.data[i*4+q] * (1 - 0.55 * alfa[i]) + t[q] * 0.55 * alfa[i]; }));
  const hl = (cb2, cs) => cs <= 0.5 ? cb2 * 2 * cs : 1 - (1 - cb2) * (1 - (2 * cs - 1));
  const colores = prueba || mascaras.map((_, n) => mascaras[(n + 3) % mascaras.length].hex);
  resultado.vistaColor = vista((v) => mascaras.forEach(({ alfa, S }, n) => { const T = hexA(colores[n]).map((u) => u / 255); for (let i = 0; i < N; i++) if (alfa[i] > 0) for (let q = 0; q < 3; q++) v.data[i*4+q] = v.data[i*4+q] * (1 - alfa[i]) + hl(T[q], S[i]) * 255 * alfa[i]; }));
  resultado.vistaIgual = vista((v) => mascaras.forEach(({ alfa, S, hex }) => { const T = hexA(hex).map((u) => u / 255); for (let i = 0; i < N; i++) if (alfa[i] > 0) for (let q = 0; q < 3; q++) v.data[i*4+q] = v.data[i*4+q] * (1 - alfa[i]) + hl(T[q], S[i]) * 255 * alfa[i]; }));
  // Mapa de etiquetas: cada clase con su color
  const pal = clases.map((cl, q) => cl.nombre === 'fondo' ? [255,255,255] : cl.nombre === 'piel' ? [255,190,150] : cl.nombre === 'pelo' ? [0,0,0] : cl.nombre === 'claro' ? [200,200,255] : cl.prenda < 0 ? [255,0,0] : [[230,0,180],[0,170,230],[230,200,0],[0,200,60]][cl.prenda % 4]);
  { const v = new ImageData(W, H); for (let i = 0; i < N; i++) { const t = etiqueta[i] >= 0 ? pal[etiqueta[i]] : [128,128,128]; v.data.set([...t, 255], i * 4); } const cv = document.createElement('canvas'); cv.width = W; cv.height = H; cv.getContext('2d').putImageData(v, 0, 0); resultado.vistaEtiquetas = cv.toDataURL('image/png'); }
  resultado.clases = clases.map((cl) => cl.nombre);
  return resultado;
}, [dataUrl(imagen), cfg, prueba]), { timeout: 0 });
guardar(r.base, `${salida}/${cfg.nombre}.webp`);
guardar(r.vistaMascara, `${salida}/vista-${cfg.nombre}-mascara.png`);
guardar(r.vistaColor, `${salida}/vista-${cfg.nombre}-color.png`);
guardar(r.vistaEtiquetas, `${salida}/vista-${cfg.nombre}-etiquetas.png`);
guardar(r.vistaIgual, `${salida}/vista-${cfg.nombre}-igual.png`);
r.prendas.forEach((pr) => guardar(pr.webp, `${salida}/${cfg.nombre}-${pr.id}.webp`));
const info = { ancho: r.W, alto: r.H, prendas: r.prendas.map(({ id, hex, pct }) => ({ id, hex, pct })) };
fs.writeFileSync(`${salida}/${cfg.nombre}.json`, JSON.stringify(info, null, 1));
console.log(JSON.stringify(info));
