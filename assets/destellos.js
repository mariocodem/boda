/*
 * Destellos dorados: el fondo de toda la invitación, como en un cuento de
 * hadas. Un lienzo fijo detrás de las piezas de papel (y detrás del sobre)
 * donde flotan luces doradas desenfocadas, titilan destellos de cuatro puntas
 * y sube despacio un polvo de oro.
 *
 * Los colores salen de la paleta (--destello, --destello-luz): sobre los
 * suelos oscuros el oro se suma como luz; sobre los pastel se pinta en oro
 * viejo con halo claro. Con movimiento reducido el cielo queda quieto.
 */
(function () {
  const caja = document.querySelector('.destellos');
  if (!caja) return;
  const lienzo = caja.querySelector('canvas');
  const ctx = lienzo.getContext('2d');
  const doc = document.documentElement;
  const reducido = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const TAU = Math.PI * 2;

  let ancho = 0;
  let alto = 0;
  let escala = 1;
  let sembrada = 0;
  let luces = [];
  let destellos = [];
  let polvo = [];
  let sprites = null;
  let tonos = '';
  let mezcla = 'lighter';
  let pedido = false;

  // Azar con semilla: cada visita ve el mismo cielo.
  function azar(semilla) {
    let s = semilla >>> 0;
    return () => {
      s = (s + 0x6d2b79f5) >>> 0;
      let t = Math.imul(s ^ (s >>> 15), s | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // Cualquier color de CSS pasa a [r, g, b] a través del propio lienzo.
  function rgb(color) {
    ctx.fillStyle = '#000';
    ctx.fillStyle = color;
    const n = parseInt(ctx.fillStyle.slice(1), 16);
    return [n >> 16, (n >> 8) & 255, n & 255];
  }
  const rgba = (c, a) => `rgba(${c[0]}, ${c[1]}, ${c[2]}, ${a})`;

  function nuevoLienzo(lado) {
    const c = document.createElement('canvas');
    c.width = lado;
    c.height = lado;
    return c;
  }

  // Estrella de cuatro puntas con los lados curvos hacia adentro.
  function estrella(g, largo, cintura) {
    g.beginPath();
    g.moveTo(0, -largo);
    g.quadraticCurveTo(cintura, -cintura, largo, 0);
    g.quadraticCurveTo(cintura, cintura, 0, largo);
    g.quadraticCurveTo(-cintura, cintura, -largo, 0);
    g.quadraticCurveTo(-cintura, -cintura, 0, -largo);
    g.fill();
  }

  // Los destellos y el polvo se dibujan una vez y luego solo se estampan.
  function pintarSprites(oro, luz, clara) {
    const halo = clara ? luz : oro;
    const L = 128;
    const m = L / 2;

    const d = nuevoLienzo(L);
    let g = d.getContext('2d');
    g.translate(m, m);
    let rg = g.createRadialGradient(0, 0, 0, 0, 0, m * 0.5);
    rg.addColorStop(0, rgba(halo, clara ? 0.9 : 0.5));
    rg.addColorStop(1, rgba(halo, 0));
    g.fillStyle = rg;
    g.fillRect(-m, -m, L, L);
    rg = g.createRadialGradient(0, 0, 0, 0, 0, m);
    rg.addColorStop(0, rgba(luz, 1));
    rg.addColorStop(0.18, rgba(oro, 1));
    rg.addColorStop(1, rgba(oro, 0));
    g.fillStyle = rg;
    estrella(g, m, m * 0.07);
    g.rotate(Math.PI / 4);
    g.globalAlpha = 0.55;
    estrella(g, m * 0.42, m * 0.05);
    g.globalAlpha = 1;
    rg = g.createRadialGradient(0, 0, 0, 0, 0, m * 0.1);
    rg.addColorStop(0, rgba(luz, 1));
    rg.addColorStop(1, rgba(luz, 0));
    g.fillStyle = rg;
    g.fillRect(-m, -m, L, L);

    const p = nuevoLienzo(32);
    g = p.getContext('2d');
    rg = g.createRadialGradient(16, 16, 0, 16, 16, 16);
    rg.addColorStop(0, rgba(luz, 1));
    rg.addColorStop(0.28, rgba(oro, 0.75));
    rg.addColorStop(1, rgba(oro, 0));
    g.fillStyle = rg;
    g.fillRect(0, 0, 32, 32);

    // Luz desenfocada: un disco suave, sin centro, como fuera de foco.
    const b = nuevoLienzo(L);
    g = b.getContext('2d');
    rg = g.createRadialGradient(m, m, 0, m, m, m);
    rg.addColorStop(0, rgba(halo, 0.55));
    rg.addColorStop(0.6, rgba(halo, 0.35));
    rg.addColorStop(1, rgba(halo, 0));
    g.fillStyle = rg;
    g.fillRect(0, 0, L, L);

    return { destello: d, polvo: p, luz: b };
  }

  function leerPaleta() {
    const css = getComputedStyle(doc);
    const oro = css.getPropertyValue('--destello').trim() || '#f3d27e';
    const luz = css.getPropertyValue('--destello-luz').trim() || '#fff7df';
    const clara = Boolean(window.Estilos && Estilos.paleta({ paleta: doc.dataset.paleta, color: doc.dataset.color }).clara);
    const clave = `${oro}|${luz}|${clara}`;
    if (clave === tonos) return false;
    tonos = clave;
    mezcla = clara ? 'source-over' : 'lighter';
    sprites = pintarSprites(rgb(oro), rgb(luz), clara);
    return true;
  }

  // Las posiciones van en fracciones de la pantalla: al girar el teléfono el
  // cielo se estira en vez de rehacerse.
  function sembrar() {
    const r = azar(91);
    const area = ancho * alto;
    sembrada = area;
    const cuantos = (por, menos, mas) => Math.round(Math.min(mas, Math.max(menos, area / por)));
    luces = Array.from({ length: cuantos(90000, 7, 16) }, () => ({
      x: r(),
      y: r(),
      z: 0.2 + r() * 0.4,
      tam: 26 + r() * 54,
      deriva: 0.015 + r() * 0.03,
      fase: r() * TAU,
      brillo: 0.12 + r() * 0.16,
    }));
    destellos = Array.from({ length: cuantos(6500, 54, 150) }, () => {
      const z = 0.35 + r() * 0.65;
      return {
        x: r(),
        y: r(),
        z,
        tam: (3.5 + Math.pow(r(), 2.4) * 21) * z,
        periodo: 2.2 + r() * 4.6,
        fase: r(),
        giro: (r() - 0.5) * 0.6,
        base: 0.16 + r() * 0.3,
      };
    });
    polvo = Array.from({ length: cuantos(5200, 64, 210) }, () => ({
      x: r(),
      y: r(),
      z: 0.3 + r() * 0.7,
      tam: 1.6 + r() * 3,
      sube: 0.006 + r() * 0.016,
      vaiven: 6 + r() * 20,
      fase: r() * TAU,
      brillo: 0.3 + r() * 0.55,
    }));
  }

  function medir() {
    ancho = caja.clientWidth;
    alto = caja.clientHeight;
    escala = Math.min(2, window.devicePixelRatio || 1);
    lienzo.width = Math.round(ancho * escala);
    lienzo.height = Math.round(alto * escala);
    const area = ancho * alto;
    if (!sembrada || Math.abs(area - sembrada) / sembrada > 0.3) sembrar();
  }

  // Lo que sale por arriba entra por abajo, con un margen para que no se note.
  const envolver = (v, largo) => ((((v + 24) % (largo + 48)) + largo + 48) % (largo + 48)) - 24;

  function pintar(t) {
    if (!sprites || !ancho) return;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, lienzo.width, lienzo.height);
    ctx.globalCompositeOperation = mezcla;
    // Al bajar, el cielo se corre un poco: los destellos cercanos, más.
    const bajada = reducido ? 0 : window.scrollY * 0.06;

    // Las luces de fondo, las más lejanas, apenas se mueven.
    ctx.setTransform(escala, 0, 0, escala, 0, 0);
    luces.forEach((l) => {
      const x = l.x * ancho + (reducido ? 0 : Math.sin(t * l.deriva * 4 + l.fase) * 30);
      const y = envolver(l.y * alto - (reducido ? 0 : t * l.deriva * 18) - bajada * l.z, alto);
      ctx.globalAlpha = l.brillo * (reducido ? 1 : 0.75 + 0.25 * Math.sin(t * 0.5 + l.fase));
      ctx.drawImage(sprites.luz, x - l.tam, y - l.tam, l.tam * 2, l.tam * 2);
    });

    destellos.forEach((d) => {
      const x = d.x * ancho;
      const y = envolver(d.y * alto - bajada * d.z, alto);
      const ola = reducido ? 0.35 : 0.5 + 0.5 * Math.sin(TAU * (t / d.periodo + d.fase));
      const chispa = Math.pow(ola, 4);
      const lado = d.tam * (0.55 + chispa * 0.95);
      const giro = d.giro + chispa * 0.3;
      const cos = Math.cos(giro) * escala;
      const sen = Math.sin(giro) * escala;
      ctx.globalAlpha = Math.min(1, d.base + chispa * 0.9);
      ctx.setTransform(cos, sen, -sen, cos, x * escala, y * escala);
      ctx.drawImage(sprites.destello, -lado, -lado, lado * 2, lado * 2);
    });

    ctx.setTransform(escala, 0, 0, escala, 0, 0);
    polvo.forEach((p) => {
      const x = p.x * ancho + (reducido ? 0 : Math.sin(t * 0.35 + p.fase) * p.vaiven);
      const y = envolver(p.y * alto - (reducido ? 0 : t * p.sube * alto) - bajada * p.z, alto);
      const lado = p.tam * p.z;
      ctx.globalAlpha = p.brillo * (reducido ? 0.8 : 0.65 + 0.35 * Math.sin(t * 1.4 + p.fase * 3));
      ctx.drawImage(sprites.polvo, x - lado, y - lado, lado * 2, lado * 2);
    });
    ctx.globalAlpha = 1;
  }

  function cuadro(ms) {
    pintar(ms / 1000);
    requestAnimationFrame(cuadro);
  }

  // Quieto, el cielo se repinta solo cuando cambia la pantalla o la paleta.
  function repintar() {
    if (pedido) return;
    pedido = true;
    requestAnimationFrame(() => {
      pedido = false;
      pintar(0);
    });
  }

  medir();
  leerPaleta();
  if ('ResizeObserver' in window) {
    new ResizeObserver(() => {
      medir();
      if (reducido) repintar();
    }).observe(caja);
  }
  // El panel o Supabase pueden cambiar la paleta después de pintar.
  new MutationObserver(() => {
    if (leerPaleta() && reducido) repintar();
  }).observe(doc, { attributes: true, attributeFilter: ['style', 'data-paleta', 'data-color'] });

  if (reducido) repintar();
  else requestAnimationFrame(cuadro);
})();
