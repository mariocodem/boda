/*
 * El salón: las mesas y los espacios del plano (pista, entrada, música…), sus
 * medidas y su dibujo en SVG. Lo usan el panel (pestaña «Mesas»), donde se
 * arma el plano, y la invitación, que le muestra a cada invitado confirmado
 * dónde queda su mesa.
 *
 * El plano mide 1200 × 800 unidades. Cada pieza guarda su centro (x, y):
 *  - redonda y larga: mesas con número, nombre opcional y puestos; la larga
 *    puede ir horizontal (giro 0) o vertical (giro 90).
 *  - zona: un espacio del salón con nombre, ancho y alto. No tiene puestos.
 */
(function () {
  const esc = (t) => window.Papeleria.escapar(t);

  const ANCHO = 1200;
  const ALTO = 800;
  const FORMAS = ['redonda', 'larga', 'zona'];
  const ID = /^[a-z0-9]{4,24}$/;
  const MAX_PIEZAS = 150;

  // Medidas de las mesas, en unidades del plano.
  const SILLA = 10;        // radio de una silla
  const SEPARA = 14;       // del borde de la mesa al centro de cada silla
  const FONDO_LARGA = 54;  // ancho del tablero de una mesa larga
  const PASO_SILLA = 38;   // de una silla a la siguiente en una mesa larga

  const limitar = (n, min, max) => Math.min(max, Math.max(min, n));
  const fmt = (n) => Math.round(n * 10) / 10;

  function entero(v, min, max, base) {
    const n = Math.round(Number(v));
    return v !== '' && v != null && Number.isFinite(n) ? limitar(n, min, max) : base;
  }

  function texto(v, max) {
    const s = v == null ? '' : String(v).trim();
    return s ? s.slice(0, max) : null;
  }

  const radioMesa = (puestos) => limitar(16 + puestos * 3.8, 30, 100);
  const largoMesa = (puestos) => Math.max(90, Math.ceil(puestos / 2) * PASO_SILLA + 14);

  // Media anchura y media altura de lo que ocupa una pieza, con sus sillas.
  function huella(p) {
    if (p.forma === 'zona') return { x: p.ancho / 2, y: p.alto / 2 };
    if (p.forma === 'redonda') {
      const r = radioMesa(p.puestos) + SEPARA + SILLA;
      return { x: r, y: r };
    }
    const a = largoMesa(p.puestos) / 2 + 4;
    const b = FONDO_LARGA / 2 + SEPARA + SILLA;
    return p.giro === 90 ? { x: b, y: a } : { x: a, y: b };
  }

  // Ninguna pieza se sale del salón.
  function encajar(p) {
    const h = huella(p);
    const dentro = (v, medio, total) => (medio * 2 >= total ? total / 2 : limitar(v, medio, total - medio));
    p.x = Math.round(dentro(p.x, h.x, ANCHO));
    p.y = Math.round(dentro(p.y, h.y, ALTO));
    return p;
  }

  function normalizarPieza(x) {
    if (!x || !ID.test(String(x.id || ''))) return null;
    const forma = FORMAS.includes(x.forma) ? x.forma : 'redonda';
    const p = {
      id: String(x.id),
      forma,
      x: entero(x.x, 0, ANCHO, ANCHO / 2),
      y: entero(x.y, 0, ALTO, ALTO / 2),
      nombre: texto(x.nombre, 40),
    };
    if (forma === 'zona') {
      p.ancho = entero(x.ancho, 60, ANCHO, 240);
      p.alto = entero(x.alto, 60, ALTO, 160);
    } else {
      p.numero = entero(x.numero, 1, 999, 1);
      p.puestos = entero(x.puestos, 1, 30, 8);
      if (forma === 'larga') p.giro = Number(x.giro) === 90 ? 90 : 0;
    }
    return encajar(p);
  }

  // { mostrar: si los invitados confirmados ven su mesa, piezas: [...] }
  function normalizar(s) {
    const x = s || {};
    const vistos = new Set();
    const piezas = (Array.isArray(x.piezas) ? x.piezas : [])
      .map(normalizarPieza)
      .filter((p) => p && !vistos.has(p.id) && vistos.add(p.id))
      .slice(0, MAX_PIEZAS);
    return { mostrar: x.mostrar === true, piezas };
  }

  const esMesa = (p) => Boolean(p) && p.forma !== 'zona';
  const nombrePieza = (p) => (p.forma === 'zona' ? p.nombre || 'Espacio' : `Mesa ${p.numero}`);

  function nuevoId() {
    const bytes = new Uint8Array(8);
    crypto.getRandomValues(bytes);
    return 'p' + Array.from(bytes, (b) => (b % 36).toString(36)).join('');
  }

  // Dónde va cada silla, en el orden en que se llenan.
  function sillas(p) {
    const n = p.puestos;
    if (p.forma === 'redonda') {
      const d = radioMesa(n) + SEPARA;
      return Array.from({ length: n }, (_, i) => {
        const a = -Math.PI / 2 + (i * 2 * Math.PI) / n;
        return [d * Math.cos(a), d * Math.sin(a)];
      });
    }
    const arriba = Math.ceil(n / 2);
    const y = FONDO_LARGA / 2 + SEPARA;
    const fila = (k, lado) => Array.from({ length: k }, (_, j) => [(j - (k - 1) / 2) * PASO_SILLA, lado * y]);
    const a = fila(arriba, -1);
    const b = fila(n - arriba, 1);
    const orden = [];
    a.forEach((s, j) => {
      orden.push(s);
      if (b[j]) orden.push(b[j]);
    });
    return p.giro === 90 ? orden.map(([sx, sy]) => [-sy, sx]) : orden;
  }

  // ---------- Dibujo ----------

  function tablero(p) {
    if (p.forma === 'redonda') return `<circle class="tablero" r="${fmt(radioMesa(p.puestos))}"/>`;
    const l = largoMesa(p.puestos);
    const [w, h] = p.giro === 90 ? [FONDO_LARGA, l] : [l, FONDO_LARGA];
    return `<rect class="tablero" x="${fmt(-w / 2)}" y="${fmt(-h / 2)}" width="${w}" height="${h}" rx="6"/>`;
  }

  // La silueta de la pieza con sus sillas, un poco más grande: para tocarla y
  // para el anillo de foco.
  function contorno(p, clase, extra) {
    const h = huella(p);
    if (p.forma === 'redonda') return `<circle class="${clase}" r="${fmt(h.x + extra)}"/>`;
    return `<rect class="${clase}" x="${fmt(-h.x - extra)}" y="${fmt(-h.y - extra)}" width="${fmt(2 * (h.x + extra))}" height="${fmt(2 * (h.y + extra))}" rx="${10 + extra}"/>`;
  }

  function partir(palabras, max) {
    const lineas = [];
    palabras.forEach((w) => {
      const ultima = lineas[lineas.length - 1];
      if (ultima && `${ultima} ${w}`.length <= max) lineas[lineas.length - 1] = `${ultima} ${w}`;
      else lineas.push(w);
    });
    return lineas;
  }

  // El nombre de un espacio, en capitulares, partido en líneas para que quepa.
  function rotulo(nombre, ancho, alto, tam) {
    const palabras = String(nombre).toUpperCase().split(/\s+/).filter(Boolean);
    const caben = (t) => Math.max(1, Math.floor((ancho - 28) / (t * 0.95)));
    for (let t = tam; t >= 12; t -= 2) {
      const lineas = partir(palabras, caben(t));
      if (lineas.length * t * 1.25 <= alto - 16 && lineas.every((l) => l.length <= caben(t))) return { lineas, t };
    }
    return { lineas: partir(palabras, caben(12)).slice(0, 3), t: 12 };
  }

  function nombreZona(p, tam) {
    const { lineas, t } = rotulo(p.nombre || 'Espacio', p.ancho, p.alto, tam);
    const alto = t * 1.25;
    const y0 = -((lineas.length - 1) * alto) / 2;
    return `<text class="zona-nombre" style="font-size:${t}px" aria-hidden="true">${lineas
      .map((l, i) => `<tspan x="0" y="${fmt(y0 + i * alto)}" dy=".36em">${esc(l)}</tspan>`)
      .join('')}</text>`;
  }

  function zona(p, op, editor) {
    const fondo = `<rect class="zona-fondo" x="${fmt(-p.ancho / 2)}" y="${fmt(-p.alto / 2)}" width="${p.ancho}" height="${p.alto}" rx="8"/>`;
    const centro = `transform="translate(${p.x} ${p.y})"`;
    if (!editor) return `<g class="pieza es-zona" ${centro}>${fondo}${nombreZona(p, 34)}</g>`;
    const elegida = op.seleccion === p.id;
    const tirador = elegida
      ? `<g class="tirador" data-tirador transform="translate(${fmt(p.ancho / 2)} ${fmt(p.alto / 2)})"><circle r="17"/><path d="M-6 3L3-6M-1 6L6-1"/></g>`
      : '';
    return `<g class="pieza es-zona${elegida ? ' elegida' : ''}" data-pieza="${p.id}" ${centro} tabindex="0" role="button" aria-pressed="${elegida}" aria-label="${esc(`${nombrePieza(p)} (espacio del salón)`)}">
        ${contorno(p, 'pieza-foco', 8)}${fondo}${nombreZona(p, op.tamZona || 22)}${tirador}
      </g>`;
  }

  function mesa(p, op, editor) {
    const centro = `transform="translate(${p.x} ${p.y})"`;
    if (!editor) {
      const destacada = op.destacada === p.id;
      return `<g class="pieza es-mesa${destacada ? ' destacada' : ''}" ${centro}>${tablero(p)}<text class="mesa-numero" dy=".36em">${p.numero}</text></g>`;
    }
    const o = (op.ocupacion && op.ocupacion[p.id]) || { confirmados: 0, pendientes: 0 };
    const sentados = o.confirmados + o.pendientes;
    const elegida = op.seleccion === p.id;
    const clases = ['pieza', 'es-mesa'];
    if (elegida) clases.push('elegida');
    if (sentados > p.puestos) clases.push('de-mas');
    const asientos = sillas(p).map(([x, y], i) => {
      const c = i < o.confirmados ? ' confirmada' : i < sentados ? ' pendiente' : '';
      return `<circle class="silla${c}" cx="${fmt(x)}" cy="${fmt(y)}" r="${SILLA}"/>`;
    }).join('');
    const libres = p.puestos - sentados;
    const estado = libres > 0 ? `${libres} ${libres === 1 ? 'libre' : 'libres'}` : libres === 0 ? 'llena' : `se pasa por ${-libres}`;
    const etiqueta = `${nombrePieza(p)}${p.nombre ? `, ${p.nombre}` : ''}: ${sentados} de ${p.puestos} puestos, ${estado}${op.eligiendo ? '. Sentar aquí' : ''}`;
    return `<g class="${clases.join(' ')}" data-pieza="${p.id}" ${centro} tabindex="0" role="button" aria-pressed="${elegida}" aria-label="${esc(etiqueta)}">
        ${contorno(p, 'pieza-toque', 4)}${contorno(p, 'pieza-foco', 8)}<g class="sillas">${asientos}</g>${tablero(p)}
        <text class="mesa-numero" y="-7" dy=".36em">${p.numero}</text>
        <text class="mesa-cuenta" y="16" dy=".36em">${sentados}/${p.puestos}</text>
      </g>`;
  }

  // Un círculo trazado a mano alrededor de la mesa del invitado.
  function anillo(p) {
    const r = p.forma === 'redonda' ? radioMesa(p.puestos) : 0;
    const l = p.forma === 'larga' ? largoMesa(p.puestos) / 2 : 0;
    let rx = p.forma === 'redonda' ? r * 1.3 + 30 : l + 36;
    let ry = p.forma === 'redonda' ? r * 1.12 + 26 : FONDO_LARGA / 2 + 36;
    if (p.giro === 90) [rx, ry] = [ry, rx];
    // Una vuelta y un poco más, que se abre al cerrar, como un trazo de pluma.
    const puntos = [];
    const n = 80;
    for (let i = 0; i <= n; i += 1) {
      const k = i / n;
      const a = -Math.PI * 0.7 + k * 2.2 * Math.PI;
      const v = 1 + 0.06 * Math.sin(k * Math.PI * 2.6 + 0.4) + 0.13 * k * k;
      puntos.push(`${fmt(rx * v * Math.cos(a))} ${fmt(ry * v * Math.sin(a))}`);
    }
    return `<path class="plano-anillo" transform="translate(${p.x} ${p.y}) rotate(-14)" d="M${puntos.join('L')}" pathLength="1"/>`;
  }

  // En la invitación el plano se recorta a lo que hay en el salón, para que
  // se vea más grande en el teléfono.
  function encuadre(piezas) {
    if (!piezas.length) return { x: 0, y: 0, w: ANCHO, h: ALTO };
    let x0 = Infinity;
    let y0 = Infinity;
    let x1 = -Infinity;
    let y1 = -Infinity;
    piezas.forEach((p) => {
      const h = huella(p);
      x0 = Math.min(x0, p.x - h.x);
      y0 = Math.min(y0, p.y - h.y);
      x1 = Math.max(x1, p.x + h.x);
      y1 = Math.max(y1, p.y + h.y);
    });
    const m = 36;
    x0 -= m;
    y0 -= m;
    let w = x1 - x0 + m;
    let h = y1 - y0 + m;
    if (w / h < 0.8) {
      const nw = h * 0.8;
      x0 -= (nw - w) / 2;
      w = nw;
    }
    if (w / h > 2) {
      const nh = w / 2;
      y0 -= (nh - h) / 2;
      h = nh;
    }
    return { x: fmt(x0), y: fmt(y0), w: fmt(w), h: fmt(h) };
  }

  /*
   * op.modo: 'editor' (panel) o 'invitado' (invitación).
   * Editor: op.seleccion (id), op.ocupacion ({ id: { confirmados, pendientes } }),
   *         op.eligiendo (se está sentando a una familia), op.tamZona (letra
   *         de los espacios; más grande cuando el plano se ve pequeño).
   * Invitado: op.destacada (id de su mesa).
   */
  function dibujar(plan, op = {}) {
    const editor = op.modo !== 'invitado';
    const piezas = plan.piezas;
    const zonas = piezas.filter((p) => p.forma === 'zona');
    const mesas = piezas.filter(esMesa).sort((a, b) => (a.id === op.destacada) - (b.id === op.destacada));
    const caja = editor ? { x: 0, y: 0, w: ANCHO, h: ALTO } : encuadre(piezas);
    const cuerpo = zonas.map((p) => zona(p, op, editor)).join('') + mesas.map((p) => mesa(p, op, editor)).join('');
    const marcada = !editor && piezas.find((p) => p.id === op.destacada && esMesa(p));
    const fondo = editor
      ? `<defs><pattern id="plano-puntos" width="40" height="40" patternUnits="userSpaceOnUse"><circle cx="20" cy="20" r="1.8"/></pattern></defs>
         <rect class="plano-piso" width="${ANCHO}" height="${ALTO}"/>
         <rect class="plano-muros" x="1" y="1" width="${ANCHO - 2}" height="${ALTO - 2}" rx="4"/>`
      : `<rect class="plano-muros" x="${fmt(caja.x + 4)}" y="${fmt(caja.y + 4)}" width="${fmt(caja.w - 8)}" height="${fmt(caja.h - 8)}" rx="10"/>`;
    const papel = editor ? 'role="group"' : 'role="img"';
    return `<svg class="plano ${editor ? 'plano-editor' : 'plano-invitado'}${op.eligiendo ? ' eligiendo' : ''}" viewBox="${caja.x} ${caja.y} ${caja.w} ${caja.h}" ${papel} aria-label="${esc(op.titulo || 'Plano del salón')}">${fondo}${cuerpo}${marcada ? anillo(marcada) : ''}</svg>`;
  }

  window.Salon = {
    ANCHO,
    ALTO,
    normalizar,
    normalizarPieza,
    huella,
    encajar,
    esMesa,
    nombrePieza,
    nuevoId,
    dibujar,
  };
})();
