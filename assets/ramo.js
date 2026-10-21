/*
 * Ramo de rosas blancas y lirios blancos, dibujado en SVG.
 *
 * Ramo.crear(contenedor) dibuja el ramo ya abierto (visible sin JS de animación
 * y con movimiento reducido). Ramo.florecer(svg) lo cierra y lo hace florecer:
 * tallos que crecen, hojas que se despliegan, rosas que abren en espiral y
 * lirios que despliegan tépalos y estambres. Después queda un vaivén leve.
 */
(function () {
  const NS = 'http://www.w3.org/2000/svg';
  let serie = 0;

  function n(tag, attrs, padre) {
    const e = document.createElementNS(NS, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (padre) padre.appendChild(e);
    return e;
  }

  const r1 = (v) => Math.round(v * 10) / 10;

  function polar(gradosDesdeArriba, radio) {
    const a = ((gradosDesdeArriba - 90) * Math.PI) / 180;
    return [r1(Math.cos(a) * radio), r1(Math.sin(a) * radio)];
  }

  function azar(semilla) {
    let s = semilla % 2147483647;
    return () => {
      s = (s * 16807) % 2147483647;
      return (s - 1) / 2147483646;
    };
  }

  function lineal(defs, id, paradas, dir) {
    const g = n('linearGradient', Object.assign({ id }, dir || { x1: 0, y1: 1, x2: 0, y2: 0 }), defs);
    paradas.forEach(([o, c, op]) => n('stop', { offset: o, 'stop-color': c, 'stop-opacity': op == null ? 1 : op }, g));
  }

  function radial(defs, id, paradas, attrs) {
    const g = n('radialGradient', Object.assign({ id }, attrs || {}), defs);
    paradas.forEach(([o, c, op]) => n('stop', { offset: o, 'stop-color': c, 'stop-opacity': op == null ? 1 : op }, g));
  }

  // Grupo colocado en (x, y) y girado; su hijo .anima se transforma desde el origen.
  function pieza(padre, x, y, giro, clase, retraso) {
    const g = n('g', { transform: `translate(${r1(x)} ${r1(y)}) rotate(${r1(giro)})`, class: clase }, padre);
    const a = n('g', { class: 'anima', style: `--d:${Math.round(retraso)}ms` }, g);
    return a;
  }

  // ---------- Formas ----------

  function formaPetaloRosa(w, h) {
    return `M${r1(-w * 0.22)} 0 C${r1(-w)} ${r1(-h * 0.18)} ${r1(-w * 1.08)} ${r1(-h * 0.8)} ${r1(-w * 0.55)} ${r1(-h * 0.97)}`
      + ` C${r1(-w * 0.28)} ${r1(-h * 1.05)} ${r1(-w * 0.1)} ${r1(-h * 0.95)} 0 ${r1(-h * 0.9)}`
      + ` C${r1(w * 0.1)} ${r1(-h * 0.95)} ${r1(w * 0.28)} ${r1(-h * 1.05)} ${r1(w * 0.55)} ${r1(-h * 0.97)}`
      + ` C${r1(w * 1.08)} ${r1(-h * 0.8)} ${r1(w)} ${r1(-h * 0.18)} ${r1(w * 0.22)} 0 Z`;
  }

  function formaTepalo(w, h) {
    return `M0 0 C${r1(w * 0.9)} ${r1(-h * 0.12)} ${r1(w * 1.05)} ${r1(-h * 0.55)} ${r1(w * 0.36)} ${r1(-h * 0.86)}`
      + ` Q${r1(w * 0.08)} ${r1(-h * 0.985)} 0 ${r1(-h)}`
      + ` Q${r1(-w * 0.08)} ${r1(-h * 0.985)} ${r1(-w * 0.36)} ${r1(-h * 0.86)}`
      + ` C${r1(-w * 1.05)} ${r1(-h * 0.55)} ${r1(-w * 0.9)} ${r1(-h * 0.12)} 0 0 Z`;
  }

  function formaHoja(w, h) {
    return `M0 0 C${r1(w)} ${r1(-h * 0.22)} ${r1(w * 0.85)} ${r1(-h * 0.72)} 0 ${r1(-h)}`
      + ` C${r1(-w * 0.85)} ${r1(-h * 0.72)} ${r1(-w)} ${r1(-h * 0.22)} 0 0 Z`;
  }

  // ---------- Flores ----------

  function rosa(capa, defs, ids, o) {
    const { x, y, r, giro, retraso, rnd } = o;
    const raiz = n('g', { transform: `translate(${x} ${y}) rotate(${giro}) scale(1 ${o.inclina || 1})`, class: 'rosa' }, capa);
    const flor = n('g', { class: 'anima flor-abre', style: `--d:${retraso}ms` }, raiz);
    const gid = `${ids}-rosa-${serie++}`;
    radial(defs, gid, [
      [0, '#a9b9a8'], [0.3, '#cdd7ca'], [0.62, '#eaeee5'], [0.86, '#f8f9f4'], [1, '#ffffff'],
    ], { cx: 0, cy: 0, r: r1(r * 0.66), gradientUnits: 'userSpaceOnUse' });

    // Pétalos exteriores: dos coronas anchas que abren hacia afuera.
    const coronas = [
      { k: 5, w: 0.78, h: 1.0, base: rnd() * 72, d: 420 },
      { k: 5, w: 0.64, h: 0.84, base: 36 + rnd() * 30, d: 300 },
    ];
    coronas.forEach((c) => {
      for (let i = 0; i < c.k; i += 1) {
        const a = c.base + i * (360 / c.k) + (rnd() - 0.5) * 18;
        const p = pieza(flor, 0, 0, a, 'petalo-ext', retraso + c.d + i * 55);
        const w = r * c.w * (0.9 + rnd() * 0.2);
        const h = r * c.h * (0.92 + rnd() * 0.12);
        n('path', { d: formaPetaloRosa(w, h), fill: `url(#${ids}-petalo)`, stroke: '#b9c8b6', 'stroke-width': 0.9 }, p);
        n('path', { d: `M${r1(-w * 0.62)} ${r1(-h * 0.86)} Q0 ${r1(-h * 0.74)} ${r1(w * 0.62)} ${r1(-h * 0.86)}`, fill: 'none', stroke: '#d5ded1', 'stroke-width': 1.1, 'stroke-linecap': 'round', opacity: 0.9 }, p);
        n('path', { d: `M0 ${r1(-h * 0.14)} Q${r1(w * 0.1)} ${r1(-h * 0.42)} ${r1(w * 0.04)} ${r1(-h * 0.66)}`, fill: 'none', stroke: '#cdd8ca', 'stroke-width': 1, opacity: 0.7 }, p);
      }
    });

    // Corazón en espiral: medias lunas desplazadas que giran con el ángulo
    // áureo, para que los bordes de los pétalos se enrosquen y no formen anillos.
    const corazon = n('g', { class: 'anima corazon', style: `--d:${retraso + 120}ms` }, flor);
    let ang = rnd() * 360;
    const capas = 8;
    for (let i = 0; i < capas; i += 1) {
      const rr = r * (0.6 - i * 0.064);
      const span = 205 + rnd() * 60 - i * 6;
      const desvio = polar(ang + span / 2 + 180, rr * 0.16);
      const g = n('g', { transform: `translate(${desvio[0]} ${desvio[1]})` }, corazon);
      const p1 = polar(ang, rr);
      const p2 = polar(ang + span, rr);
      const c = polar(ang + span / 2, rr * 0.5);
      n('path', {
        d: `M${p1[0]} ${p1[1]} A${r1(rr)} ${r1(rr)} 0 ${span > 180 ? 1 : 0} 1 ${p2[0]} ${p2[1]} Q${c[0]} ${c[1]} ${p1[0]} ${p1[1]} Z`,
        fill: `url(#${gid})`,
      }, g);
      const q1 = polar(ang + 14, rr);
      const q2 = polar(ang + span - 10, rr);
      n('path', {
        d: `M${q1[0]} ${q1[1]} A${r1(rr)} ${r1(rr)} 0 ${span - 24 > 180 ? 1 : 0} 1 ${q2[0]} ${q2[1]}`,
        fill: 'none', stroke: i < 2 ? '#bccab9' : '#9fb19d', 'stroke-width': i < 2 ? 1 : 1.1, 'stroke-linecap': 'round',
      }, g);
      const s1 = polar(ang + span * 0.25, rr * 0.86);
      const s2 = polar(ang + span * 0.7, rr * 0.86);
      n('path', { d: `M${s1[0]} ${s1[1]} A${r1(rr * 0.86)} ${r1(rr * 0.86)} 0 0 1 ${s2[0]} ${s2[1]}`, fill: 'none', stroke: '#b3c2b0', 'stroke-width': 2.2, 'stroke-linecap': 'round', opacity: 0.35 }, g);
      ang += 137.5;
    }
    n('ellipse', { cx: 0, cy: 0, rx: r1(r * 0.07), ry: r1(r * 0.05), fill: '#9fb09d' }, corazon);
  }

  function lirio(capa, defs, ids, o) {
    const { x, y, h, giro, retraso, rnd } = o;
    const raiz = n('g', { transform: `translate(${x} ${y}) rotate(${giro})`, class: 'lirio' }, capa);
    const flor = n('g', { class: 'anima flor-abre', style: `--d:${retraso}ms` }, raiz);

    const tepalos = [];
    for (let i = 0; i < 3; i += 1) tepalos.push({ a: i * 120 + (rnd() - 0.5) * 10, h: h, w: h * 0.19, d: i * 70 });
    for (let i = 0; i < 3; i += 1) tepalos.push({ a: 60 + i * 120 + (rnd() - 0.5) * 10, h: h * 0.94, w: h * 0.25, d: 160 + i * 70 });
    tepalos.forEach((t) => {
      const p = pieza(flor, 0, 0, t.a, 'tepalo', retraso + t.d);
      n('path', { d: formaTepalo(t.w, t.h), fill: `url(#${ids}-tepalo)`, stroke: '#c3d0bd', 'stroke-width': 0.9 }, p);
      n('path', { d: `M0 ${r1(-t.h * 0.06)} Q${r1(t.w * 0.06)} ${r1(-t.h * 0.5)} 0 ${r1(-t.h * 0.9)}`, fill: 'none', stroke: '#c6d5b4', 'stroke-width': 1.4, 'stroke-linecap': 'round' }, p);
      n('path', { d: `M${r1(t.w * 0.16)} ${r1(-t.h * 0.16)} Q${r1(t.w * 0.26)} ${r1(-t.h * 0.5)} ${r1(t.w * 0.08)} ${r1(-t.h * 0.84)}`, fill: 'none', stroke: '#ffffff', 'stroke-width': 1.2, 'stroke-linecap': 'round', opacity: 0.9 }, p);
      n('path', { d: `M${r1(-t.w * 0.3)} ${r1(-t.h * 0.83)} Q0 ${r1(-t.h * 0.9)} ${r1(t.w * 0.3)} ${r1(-t.h * 0.83)}`, fill: 'none', stroke: '#d3ddcd', 'stroke-width': 1, 'stroke-linecap': 'round' }, p);
    });

    n('circle', { cx: 0, cy: 0, r: r1(h * 0.2), fill: `url(#${ids}-garganta)` }, flor);

    const centro = n('g', { class: 'anima estambres', style: `--d:${retraso + 620}ms` }, flor);
    for (let i = 0; i < 6; i += 1) {
      const a = 30 + i * 60 + (rnd() - 0.5) * 18;
      const largo = h * (0.48 + rnd() * 0.08);
      const fin = polar(a, largo);
      const ctrl = polar(a + 8, largo * 0.55);
      n('path', { d: `M0 0 Q${ctrl[0]} ${ctrl[1]} ${fin[0]} ${fin[1]}`, fill: 'none', stroke: '#d4dfc0', 'stroke-width': 1.5, 'stroke-linecap': 'round' }, centro);
      const ant = n('g', { transform: `translate(${fin[0]} ${fin[1]}) rotate(${r1(a)})` }, centro);
      n('ellipse', { cx: 0, cy: 0, rx: r1(h * 0.028), ry: r1(h * 0.075), fill: '#b9761a' }, ant);
      n('ellipse', { cx: r1(-h * 0.008), cy: r1(-h * 0.01), rx: r1(h * 0.012), ry: r1(h * 0.05), fill: '#e2aa3d' }, ant);
    }
    const ap = (rnd() - 0.5) * 30;
    const finP = polar(ap, h * 0.6);
    n('path', { d: `M0 0 L${finP[0]} ${finP[1]}`, stroke: '#c3d6a4', 'stroke-width': 2.4, 'stroke-linecap': 'round' }, centro);
    n('circle', { cx: finP[0], cy: finP[1], r: r1(h * 0.04), fill: '#a9c27c' }, centro);
  }

  // Lirio visto de lado: trompeta con tépalos que se curvan hacia afuera.
  function lirioPerfil(capa, defs, ids, o) {
    const { x, y, h, giro, retraso, rnd } = o;
    const raiz = n('g', { transform: `translate(${x} ${y}) rotate(${giro})`, class: 'lirio' }, capa);
    const flor = n('g', { class: 'anima flor-abre', style: `--d:${retraso}ms` }, raiz);
    const tubo = h * 0.36;
    n('path', {
      d: `M${r1(-h * 0.05)} 0 C${r1(-h * 0.06)} ${r1(-tubo * 0.5)} ${r1(-h * 0.1)} ${r1(-tubo * 0.85)} ${r1(-h * 0.13)} ${r1(-tubo)} L${r1(h * 0.13)} ${r1(-tubo)} C${r1(h * 0.1)} ${r1(-tubo * 0.85)} ${r1(h * 0.06)} ${r1(-tubo * 0.5)} ${r1(h * 0.05)} 0 Z`,
      fill: `url(#${ids}-capullo)`, stroke: '#b9c9b0', 'stroke-width': 0.8,
    }, flor);
    const boca = n('g', { transform: `translate(0 ${r1(-tubo)})` }, flor);
    const atras = [-34, 0, 34];
    atras.forEach((a, i) => {
      const p = pieza(boca, 0, 0, a + (rnd() - 0.5) * 6, 'tepalo', retraso + 60 + i * 60);
      n('path', { d: formaTepalo(h * 0.15, h * 0.6), fill: `url(#${ids}-tepalo-sombra)`, stroke: '#bfcdba', 'stroke-width': 0.8 }, p);
      n('path', { d: `M0 ${r1(-h * 0.04)} Q${r1(h * 0.01)} ${r1(-h * 0.3)} 0 ${r1(-h * 0.54)}`, fill: 'none', stroke: '#c4d3b3', 'stroke-width': 1.2 }, p);
    });
    const est = n('g', { class: 'anima estambres', style: `--d:${retraso + 560}ms` }, boca);
    [-14, -5, 5, 14].forEach((a) => {
      const fin = polar(a, h * 0.62);
      n('path', { d: `M0 0 Q${r1(fin[0] * 0.4)} ${r1(fin[1] * 0.6)} ${fin[0]} ${fin[1]}`, fill: 'none', stroke: '#d4dfc0', 'stroke-width': 1.3 }, est);
      const ant = n('g', { transform: `translate(${fin[0]} ${fin[1]}) rotate(${a + 90})` }, est);
      n('ellipse', { cx: 0, cy: 0, rx: r1(h * 0.06), ry: r1(h * 0.022), fill: '#b9761a' }, ant);
    });
    [-68, 68].forEach((a, i) => {
      const p = pieza(boca, 0, 0, a, 'tepalo', retraso + 220 + i * 80);
      const w = h * 0.17;
      const l = h * 0.62;
      const lado = a < 0 ? -1 : 1;
      n('path', {
        d: `M0 0 C${r1(w)} ${r1(-l * 0.15)} ${r1(w * 1.1)} ${r1(-l * 0.6)} ${r1(w * 0.4 + lado * w * 0.3)} ${r1(-l * 0.92)} Q${r1(lado * w * 0.7)} ${r1(-l * 1.04)} ${r1(lado * w * 1.1)} ${r1(-l * 0.96)} Q${r1(-w * 0.2)} ${r1(-l * 0.8)} ${r1(-w * 0.9)} ${r1(-l * 0.5)} C${r1(-w)} ${r1(-l * 0.25)} ${r1(-w * 0.6)} ${r1(-l * 0.08)} 0 0 Z`,
        fill: `url(#${ids}-tepalo)`, stroke: '#c3d0bd', 'stroke-width': 0.9,
      }, p);
      n('path', { d: `M0 ${r1(-l * 0.05)} Q${r1(w * 0.1)} ${r1(-l * 0.5)} ${r1(lado * w * 0.4)} ${r1(-l * 0.86)}`, fill: 'none', stroke: '#c6d5b4', 'stroke-width': 1.3 }, p);
    });
  }

  function capulloLirio(capa, ids, o) {
    const { x, y, h, giro, retraso } = o;
    const p = pieza(capa, x, y, giro, 'capullo', retraso);
    const w = h * 0.13;
    n('path', {
      d: `M${r1(-w * 0.35)} 0 C${r1(-w * 0.5)} ${r1(-h * 0.35)} ${r1(-w * 1.1)} ${r1(-h * 0.62)} ${r1(-w * 0.75)} ${r1(-h * 0.86)} Q${r1(-w * 0.2)} ${r1(-h * 1.02)} 0 ${r1(-h)} Q${r1(w * 0.2)} ${r1(-h * 1.02)} ${r1(w * 0.75)} ${r1(-h * 0.86)} C${r1(w * 1.1)} ${r1(-h * 0.62)} ${r1(w * 0.5)} ${r1(-h * 0.35)} ${r1(w * 0.35)} 0 Z`,
      fill: `url(#${ids}-capullo)`, stroke: '#b4c6aa', 'stroke-width': 0.8,
    }, p);
    n('path', { d: `M0 ${r1(-h * 0.3)} Q${r1(w * 0.25)} ${r1(-h * 0.65)} 0 ${r1(-h * 0.97)}`, fill: 'none', stroke: '#c2d3b2', 'stroke-width': 1 }, p);
    n('path', { d: `M${r1(-w * 0.45)} ${r1(-h * 0.45)} Q${r1(-w * 0.55)} ${r1(-h * 0.7)} ${r1(-w * 0.3)} ${r1(-h * 0.9)}`, fill: 'none', stroke: '#ffffff', 'stroke-width': 1.2, 'stroke-linecap': 'round', opacity: 0.85 }, p);
  }

  function capulloRosa(capa, ids, o) {
    const { x, y, s, giro, retraso } = o;
    const p = pieza(capa, x, y, giro, 'capullo', retraso);
    n('path', { d: `M0 0 C${r1(s * 0.7)} ${r1(-s * 0.35)} ${r1(s * 0.75)} ${r1(-s * 1.05)} 0 ${r1(-s * 1.35)} C${r1(-s * 0.75)} ${r1(-s * 1.05)} ${r1(-s * 0.7)} ${r1(-s * 0.35)} 0 0 Z`, fill: `url(#${ids}-petalo)`, stroke: '#bccab9', 'stroke-width': 0.9 }, p);
    n('path', { d: `M${r1(-s * 0.35)} ${r1(-s * 1.0)} Q0 ${r1(-s * 0.7)} ${r1(s * 0.4)} ${r1(-s * 1.08)}`, fill: 'none', stroke: '#b6c4b3', 'stroke-width': 1 }, p);
    [-40, 0, 40].forEach((a) => {
      const g = n('g', { transform: `rotate(${a})` }, p);
      n('path', { d: `M0 0 Q${r1(s * 0.22)} ${r1(-s * 0.4)} 0 ${r1(-s * 0.85)} Q${r1(-s * 0.22)} ${r1(-s * 0.4)} 0 0 Z`, fill: `url(#${ids}-hoja)` }, g);
    });
  }

  function hojaSimple(capa, ids, o) {
    const { x, y, largo, ancho, giro, retraso, tipo } = o;
    const p = pieza(capa, x, y, giro, 'hoja', retraso);
    n('path', { d: formaHoja(ancho, largo), fill: `url(#${ids}-${tipo === 'lirio' ? 'hoja-lirio' : 'hoja'})` }, p);
    n('path', { d: `M0 ${r1(-largo * 0.04)} Q${r1(ancho * 0.12)} ${r1(-largo * 0.5)} 0 ${r1(-largo * 0.94)}`, fill: 'none', stroke: tipo === 'lirio' ? '#7da474' : '#5d8a62', 'stroke-width': 1.1, opacity: 0.8 }, p);
    if (tipo !== 'lirio') {
      for (let i = 1; i <= 3; i += 1) {
        const yy = -largo * (0.2 + i * 0.18);
        n('path', { d: `M${r1(ancho * 0.02)} ${r1(yy)} Q${r1(ancho * 0.4)} ${r1(yy - largo * 0.04)} ${r1(ancho * 0.62)} ${r1(yy - largo * 0.12)}`, fill: 'none', stroke: '#4f7c56', 'stroke-width': 0.8, opacity: 0.7 }, p);
        n('path', { d: `M${r1(-ancho * 0.02)} ${r1(yy)} Q${r1(-ancho * 0.4)} ${r1(yy - largo * 0.04)} ${r1(-ancho * 0.62)} ${r1(yy - largo * 0.12)}`, fill: 'none', stroke: '#4f7c56', 'stroke-width': 0.8, opacity: 0.7 }, p);
      }
    }
  }

  // Hoja compuesta de rosa: pecíolo con cinco foliolos.
  function hojaRosa(capa, ids, o) {
    const { x, y, largo, giro, retraso } = o;
    const p = pieza(capa, x, y, giro, 'hoja', retraso);
    n('path', { d: `M0 0 Q${r1(largo * 0.05)} ${r1(-largo * 0.5)} 0 ${r1(-largo * 0.78)}`, fill: 'none', stroke: '#2e5236', 'stroke-width': 2, 'stroke-linecap': 'round' }, p);
    const fol = [
      { yy: -0.78, a: 0, l: 0.36, w: 0.13 },
      { yy: -0.6, a: -48, l: 0.3, w: 0.11 },
      { yy: -0.6, a: 48, l: 0.3, w: 0.11 },
      { yy: -0.36, a: -58, l: 0.26, w: 0.1 },
      { yy: -0.36, a: 58, l: 0.26, w: 0.1 },
    ];
    fol.forEach((f) => {
      const g = n('g', { transform: `translate(0 ${r1(largo * f.yy)}) rotate(${f.a})` }, p);
      const L = largo * f.l;
      const W = largo * f.w;
      n('path', { d: formaHoja(W, L), fill: `url(#${ids}-hoja)` }, g);
      n('path', { d: `M0 ${r1(-L * 0.05)} L0 ${r1(-L * 0.9)}`, stroke: '#5d8a62', 'stroke-width': 0.8, opacity: 0.8 }, g);
    });
  }

  function cinta(capa, ids, x, y, retraso) {
    const g = n('g', { transform: `translate(${x} ${y})`, class: 'cinta' }, capa);
    const a = n('g', { class: 'anima', style: `--d:${retraso}ms` }, g);
    const relleno = `url(#${ids}-cinta)`;
    const borde = '#c3cec1';
    // Colas
    n('path', { d: 'M-6 4 C-18 40 -6 80 -30 128 L-20 122 L-16 136 C2 92 -4 44 4 6 Z', fill: relleno, stroke: borde, 'stroke-width': 0.9 }, a);
    n('path', { d: 'M6 4 C22 36 18 74 40 116 L30 112 L28 126 C8 86 10 44 -2 8 Z', fill: relleno, stroke: borde, 'stroke-width': 0.9 }, a);
    // Lazadas
    n('path', { d: 'M0 0 C-30 -26 -64 -14 -58 8 C-52 28 -22 16 0 0 Z', fill: relleno, stroke: borde, 'stroke-width': 0.9 }, a);
    n('path', { d: 'M0 0 C30 -26 64 -14 58 8 C52 28 22 16 0 0 Z', fill: relleno, stroke: borde, 'stroke-width': 0.9 }, a);
    n('path', { d: 'M-8 -2 C-26 -14 -44 -10 -46 2', fill: 'none', stroke: '#d2dbcf', 'stroke-width': 1 }, a);
    n('path', { d: 'M8 -2 C26 -14 44 -10 46 2', fill: 'none', stroke: '#d2dbcf', 'stroke-width': 1 }, a);
    // Nudo
    n('rect', { x: -10, y: -9, width: 20, height: 18, rx: 6, fill: relleno, stroke: borde, 'stroke-width': 0.9 }, a);
  }

  // ---------- Composición ----------

  const ATADO = { x: 300, y: 468 };

  const ROSAS = [
    { x: 300, y: 170, r: 50, giro: 10, retraso: 760, inclina: 0.88 },
    { x: 216, y: 262, r: 60, giro: -24, retraso: 860, inclina: 0.9 },
    { x: 394, y: 260, r: 60, giro: 32, retraso: 940, inclina: 0.9 },
    { x: 304, y: 252, r: 68, giro: 0, retraso: 640 },
    { x: 256, y: 338, r: 54, giro: 15, retraso: 1060, inclina: 0.86 },
  ];

  const LIRIOS = [
    { x: 218, y: 178, h: 76, giro: -16, retraso: 980 },
    { x: 386, y: 178, h: 84, giro: 14, retraso: 1040 },
    { x: 354, y: 336, h: 74, giro: 28, retraso: 1160 },
  ];

  const PERFILES = [
    { x: 160, y: 288, h: 118, giro: -70, retraso: 1120 },
    { x: 444, y: 294, h: 124, giro: 68, retraso: 1200 },
  ];

  const CAPULLOS_LIRIO = [
    { x: 266, y: 150, h: 96, giro: -20, retraso: 700 },
    { x: 336, y: 146, h: 108, giro: 18, retraso: 760 },
    { x: 188, y: 206, h: 80, giro: -52, retraso: 820 },
  ];

  const CAPULLOS_ROSA = [
    { x: 448, y: 214, s: 26, giro: 52, retraso: 900 },
    { x: 160, y: 228, s: 22, giro: -58, retraso: 960 },
  ];

  function crear(contenedor, opciones) {
    const op = Object.assign({ semilla: 7 }, opciones);
    const ids = `ramo${Math.floor(Math.random() * 1e6)}`;
    const rnd = azar(op.semilla * 977 + 13);
    const svg = n('svg', {
      viewBox: '0 0 600 640',
      class: 'ramo',
      role: 'img',
      'aria-label': 'Ramo de rosas blancas y lirios blancos atado con una cinta',
      focusable: 'false',
    });
    const defs = n('defs', {}, svg);
    lineal(defs, `${ids}-petalo`, [[0, '#c6d2c3'], [0.42, '#e9eee4'], [0.8, '#fbfcf8'], [1, '#ffffff']]);
    lineal(defs, `${ids}-tepalo`, [[0, '#a8c27a'], [0.22, '#dbe7c8'], [0.52, '#f7f9f1'], [1, '#ffffff']]);
    lineal(defs, `${ids}-tepalo-sombra`, [[0, '#9db673'], [0.3, '#cfdcc0'], [0.7, '#e4eadf'], [1, '#eef1ea']]);
    lineal(defs, `${ids}-capullo`, [[0, '#6f955b'], [0.45, '#cbdbb6'], [1, '#f5f8ee']]);
    lineal(defs, `${ids}-hoja`, [[0, '#1d3a28'], [1, '#3b6946']], { x1: 0, y1: 1, x2: 1, y2: 0 });
    lineal(defs, `${ids}-hoja-lirio`, [[0, '#2c5639'], [1, '#5f8c58']]);
    lineal(defs, `${ids}-cinta`, [[0, '#ffffff'], [0.45, '#dfe6dc'], [0.7, '#f4f6f1'], [1, '#ffffff']], { x1: 0, y1: 0, x2: 1, y2: 0.4 });
    radial(defs, `${ids}-garganta`, [[0, '#9fbb6c'], [0.5, '#c7d9a5', 0.7], [1, '#e6eed8', 0]]);
    const filtro = n('filter', { id: `${ids}-sombra`, x: '-20%', y: '-20%', width: '140%', height: '140%' }, defs);
    n('feGaussianBlur', { stdDeviation: 18 }, filtro);

    const todo = n('g', { class: 'ramo-vaiven' }, svg);
    if (op.sombra !== false) n('ellipse', { cx: 300, cy: 300, rx: 200, ry: 150, fill: '#04120b', opacity: 0.5, filter: `url(#${ids}-sombra)`, class: 'ramo-sombra' }, todo);

    // Tallos: de cada flor al atado, y el manojo bajo la cinta.
    const tallos = n('g', { class: 'tallos' }, todo);
    const cabezas = [].concat(ROSAS, LIRIOS, PERFILES, CAPULLOS_LIRIO, CAPULLOS_ROSA);
    cabezas.forEach((c, i) => {
      const dx = (i % 5 - 2) * 2.4;
      const cx = (c.x + ATADO.x) / 2 + (c.x - ATADO.x) * 0.15;
      n('path', {
        d: `M${ATADO.x + dx} ${ATADO.y} Q${r1(cx)} ${r1((c.y + ATADO.y) / 2 + 30)} ${c.x} ${c.y}`,
        fill: 'none', stroke: i % 2 ? '#3f6a45' : '#4c7a4f', 'stroke-width': 4, 'stroke-linecap': 'round',
        class: 'tallo', style: `--d:${Math.max(0, (c.retraso || 600) - 640)}ms`,
      }, tallos);
    });
    for (let i = 0; i < 15; i += 1) {
      const t = (i - 7) * 0.75;
      const x0 = ATADO.x + t * 2.2;
      const x1 = ATADO.x + t * 8.5 + (rnd() - 0.5) * 6;
      const y1 = ATADO.y + 134 + (rnd() - 0.5) * 18;
      n('path', {
        d: `M${r1(x0)} ${ATADO.y - 6} Q${r1(x0 + t * 2)} ${ATADO.y + 60} ${r1(x1)} ${r1(y1)}`,
        fill: 'none', stroke: i % 3 ? '#4a774d' : '#3a6340', 'stroke-width': 4.2, 'stroke-linecap': 'butt',
        class: 'tallo tallo-bajo', style: `--d:${80 + i * 20}ms`,
      }, tallos);
      n('ellipse', { cx: r1(x1), cy: r1(y1), rx: 2.3, ry: 1.3, fill: '#a7c48f', class: 'corte', style: `--d:${500 + i * 20}ms` }, tallos);
    }

    const hojas = n('g', { class: 'hojas' }, todo);
    [
      { x: 262, y: 214, largo: 190, ancho: 15, giro: -38, retraso: 300 },
      { x: 342, y: 210, largo: 178, ancho: 14, giro: 34, retraso: 360 },
      { x: 220, y: 300, largo: 170, ancho: 15, giro: -96, retraso: 420 },
      { x: 384, y: 304, largo: 164, ancho: 15, giro: 100, retraso: 460 },
    ].forEach((h) => hojaSimple(hojas, ids, Object.assign({ tipo: 'lirio' }, h)));
    [
      { x: 214, y: 316, largo: 150, giro: -72, retraso: 380 },
      { x: 388, y: 318, largo: 150, giro: 74, retraso: 440 },
      { x: 236, y: 372, largo: 124, giro: -128, retraso: 520 },
      { x: 368, y: 374, largo: 128, giro: 126, retraso: 560 },
      { x: 300, y: 196, largo: 118, giro: 4, retraso: 600 },
    ].forEach((h) => hojaRosa(hojas, ids, h));

    const flores = n('g', { class: 'flores' }, todo);
    CAPULLOS_LIRIO.forEach((c) => capulloLirio(flores, ids, c));
    CAPULLOS_ROSA.forEach((c) => capulloRosa(flores, ids, c));
    PERFILES.forEach((p) => lirioPerfil(flores, defs, ids, Object.assign({ rnd }, p)));
    lirio(flores, defs, ids, Object.assign({ rnd }, LIRIOS[0]));
    lirio(flores, defs, ids, Object.assign({ rnd }, LIRIOS[1]));
    rosa(flores, defs, ids, Object.assign({ rnd }, ROSAS[0]));
    rosa(flores, defs, ids, Object.assign({ rnd }, ROSAS[1]));
    rosa(flores, defs, ids, Object.assign({ rnd }, ROSAS[2]));
    rosa(flores, defs, ids, Object.assign({ rnd }, ROSAS[3]));
    rosa(flores, defs, ids, Object.assign({ rnd }, ROSAS[4]));
    lirio(flores, defs, ids, Object.assign({ rnd }, LIRIOS[2]));

    cinta(todo, ids, ATADO.x, ATADO.y, 1500);

    contenedor.appendChild(svg);
    svg.querySelectorAll('.tallo').forEach((t) => {
      const l = Math.ceil(t.getTotalLength ? t.getTotalLength() : 300);
      t.style.setProperty('--l', l);
    });
    return svg;
  }

  function florecer(svg) {
    if (!svg) return;
    svg.classList.remove('florece');
    svg.classList.add('por-florecer');
    // Fuerza el estado cerrado antes de animar.
    void svg.getBoundingClientRect();
    requestAnimationFrame(() => {
      svg.classList.add('florece');
      svg.classList.remove('por-florecer');
    });
  }

  window.Ramo = { crear, florecer };
})();
