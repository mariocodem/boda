/*
 * La mariposa de papel dorado. Llega volando cuando el ramo termina de
 * florecer y se posa en él; al bajar, despega y acompaña al invitado; cuando
 * deja de bajar, se posa en la esquina de la pieza de papel más cercana (una
 * tarjeta, una foto, el papel vegetal, el sello del remite).
 *
 * Es papel troquelado con oro: las alas son dos bisagras que se doblan sobre
 * el cuerpo, el oro brilla según el ángulo y su sombra se aleja de la mesa
 * mientras vuela. Los colores salen de la paleta (--destello, --destello-luz).
 *
 * La página la apaga con <html data-mariposa="no"> (opción del panel). Con
 * movimiento reducido no vuela: se queda quieta sobre el ramo.
 */
(function () {
  const doc = document.documentElement;
  const reducido = matchMedia('(prefers-reduced-motion: reduce)').matches;
  // Dónde se puede posar, en el orden en que aparecen.
  const POSADEROS = '.ramo-lugar, .tarjeta:not(.tarjeta-invitacion), .foto, .vegetal, .remite-sello';
  const LLEGADA = 2600; // lo que tarda el ramo en florecer
  const QUIETA = 520; // sin scroll este tiempo, busca dónde posarse

  // Media mariposa (la derecha); la izquierda es la misma, reflejada.
  const ALA_DELANTE = 'M1.5 31C10 17 28 6 55 4.5c1.6-.1 2.7 1.3 2.1 3C54.5 16 50 28 41.5 39 30 42.5 14 42 2 40z';
  const ALA_ATRAS = 'M2 41.5c12-.5 28 0 36.5 3.5 5.5 2.5 6 9 2.5 14-2.5 3.5-5 5-6.5 8-.9 3-1.9 7.5-4 10.5-.9-3-1.9-5.5-4.5-7C18 67 9 60 1.8 50z';
  const ALA = `
    <path class="ala-forma" d="${ALA_DELANTE}"/>
    <path class="ala-forma" d="${ALA_ATRAS}"/>
    <path class="ala-orilla" d="M53.6 8C51.4 16.5 47.6 27 40.4 36.8"/>
    <path class="ala-orilla" d="M38.4 47c3.4 2.2 3.4 7.6.6 11.2-2.4 3.2-5.2 5.6-6.8 9.6"/>
    <path class="ala-brillo" d="${ALA_DELANTE}"/>
    <path class="ala-brillo" d="${ALA_ATRAS}"/>
    <path class="ala-borde" d="M5 31.5C13 20.5 28 10.5 50.5 8.6"/>
    <path class="ala-borde" d="M6 44.6c10 0 22 .6 29.5 3.6"/>
    <g class="ala-nervios">
      <path d="M2 34C14 24 30 14 52 7"/><path d="M2 36c14-6 30-12 48-16"/><path d="M2 38c14-2 28-3 42-4"/>
      <path d="M2 44c12 2 24 6 36 11"/><path d="M2 46.5c8 6.5 16 14.5 26 21.5"/><path d="M2 48.5c4 6.5 9 11.5 15 15.5"/>
    </g>
    <g class="ala-puntos">
      <circle cx="52.4" cy="11.5" r="1.25"/><circle cx="50.4" cy="18.4" r="1.05"/><circle cx="47.2" cy="25.4" r="0.95"/>
      <circle cx="43.6" cy="31.6" r="0.85"/><circle cx="39.6" cy="52" r="1.1"/><circle cx="36.2" cy="59.6" r="0.95"/>
    </g>`;

  const MARCADO = `
    <svg class="mariposa-tintas" width="0" height="0" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="mariposa-oro" gradientUnits="userSpaceOnUse" x1="0" y1="44" x2="58" y2="6">
          <stop offset="0" style="stop-color: var(--mariposa-hondo)"/>
          <stop offset="0.3" style="stop-color: var(--mariposa-oro)"/>
          <stop offset="0.5" style="stop-color: var(--mariposa-luz)"/>
          <stop offset="0.7" style="stop-color: var(--mariposa-oro)"/>
          <stop offset="1" style="stop-color: var(--mariposa-medio)"/>
        </linearGradient>
        <linearGradient id="mariposa-brillo" gradientUnits="userSpaceOnUse" x1="8" y1="70" x2="52" y2="4">
          <stop offset="0.3" stop-color="#fff" stop-opacity="0"/>
          <stop offset="0.5" stop-color="#fff" stop-opacity="0.95"/>
          <stop offset="0.7" stop-color="#fff" stop-opacity="0"/>
        </linearGradient>
      </defs>
    </svg>
    <span class="mariposa-alas">
      <svg class="ala ala-izq" viewBox="-60 0 60 80" aria-hidden="true" focusable="false"><g transform="scale(-1 1)">${ALA}</g></svg>
      <svg class="ala ala-der" viewBox="0 0 60 80" aria-hidden="true" focusable="false">${ALA}</svg>
      <svg class="mariposa-cuerpo" viewBox="-12 0 24 80" aria-hidden="true" focusable="false">
        <path class="antena" d="M-.8 23C-3 15-6 9-9.5 4.5"/><path class="antena" d="M.8 23C3 15 6 9 9.5 4.5"/>
        <circle class="antena-punta" cx="-9.7" cy="4.2" r="1.2"/><circle class="antena-punta" cx="9.7" cy="4.2" r="1.2"/>
        <circle class="cuerpo" cx="0" cy="24.5" r="2.5"/>
        <ellipse class="cuerpo" cx="0" cy="33" rx="2.5" ry="6"/>
        <path class="cuerpo" d="M0 38.5c2.6 2 2.5 16-0 26-2.5-10-2.6-24 0-26z"/>
      </svg>
    </span>`;

  let el = null;
  let corriendo = false;
  let antes = 0;
  let reloj = 0;

  // Estado del vuelo, en coordenadas de la pantalla.
  const m = {
    modo: 'oculta', // oculta | posandose | posada | volando
    x: 0, y: 0, vx: 0, vy: 0,
    giro: 0,
    fase: 0,
    vuelo: 1, // 0 posada, 1 en el aire
    posadero: null,
    sitio: { lado: 'der', costado: null },
    giroPosada: 14,
    scrollPosada: 0,
  };
  // Posada, no despega por un ajuste corto de lectura: solo al bajar de verdad.
  const DESPEGUE = 90;

  let ultimoScroll = 0;
  let scrollAntes = window.scrollY;
  let rapidez = 0; // px/s, suavizada
  let llegadaPendiente = null;

  const limitar = (v, a, b) => Math.min(b, Math.max(a, v));
  const visible = (r) => r.width > 0 && r.height > 0;

  function crear() {
    el = document.createElement('div');
    el.className = 'mariposa';
    el.setAttribute('aria-hidden', 'true');
    el.innerHTML = MARCADO;
    document.body.appendChild(el);
  }

  function encendida() {
    return doc.dataset.mariposa !== 'no';
  }

  // El punto donde se posa en una pieza: una esquina de arriba, casi en el
  // borde, como si se hubiera parado en el papel; o, en una pieza más alta que
  // la pantalla, el borde de un costado (costado: px desde el borde de arriba).
  // En el ramo, sobre las flores.
  function anclaDe(pieza, sitio) {
    const r = pieza.getBoundingClientRect();
    if (!visible(r)) return null;
    if (pieza.matches('.ramo-lugar')) return { x: r.left + r.width * 0.6, y: r.top + r.height * 0.3 };
    if (pieza.matches('.remite-sello')) return { x: r.left + r.width * 0.82, y: r.top + r.height * 0.14 };
    // Pegada al borde: las alas quedan medio afuera y no tapan lo escrito.
    const der = sitio.lado === 'der';
    if (sitio.costado != null) return { x: der ? r.right - 4 : r.left + 4, y: r.top + sitio.costado };
    const borde = Math.min(16, r.width * 0.06);
    return { x: der ? r.right - borde : r.left + borde, y: r.top + borde * 0.5 };
  }

  const enFranja = (a) => a.y > innerHeight * 0.08 && a.y < innerHeight * 0.82 && a.x > 12 && a.x < innerWidth - 12;

  // La pieza a la vista más cercana: una esquina de arriba si está en la
  // pantalla; si no, un costado a la altura por donde va.
  function buscarPosadero() {
    const alto = innerHeight;
    let mejor = null;
    const probar = (pieza, sitio, castigo) => {
      const a = anclaDe(pieza, sitio);
      if (!a || !enFranja(a)) return;
      const d = Math.hypot(a.x - m.x, a.y - m.y) + castigo;
      if (!mejor || d < mejor.d) mejor = { pieza, sitio, d };
    };
    document.querySelectorAll(POSADEROS).forEach((pieza) => {
      if (pieza.closest('[hidden]')) return;
      const r = pieza.getBoundingClientRect();
      if (!visible(r) || r.width < 48) return;
      ['der', 'izq'].forEach((lado) => {
        probar(pieza, { lado, costado: null }, 0);
        if (r.top < alto * 0.1 && r.bottom > alto * 0.3 && !pieza.matches('.ramo-lugar, .remite-sello')) {
          const y = limitar(m.y, Math.max(r.top, alto * 0.18), Math.min(r.bottom, alto * 0.74));
          probar(pieza, { lado, costado: y - r.top }, 70);
        }
      });
    });
    return mejor;
  }

  function posarseEn(pieza, sitio) {
    m.posadero = pieza;
    m.sitio = sitio;
    m.modo = 'posandose';
    m.scrollPosada = window.scrollY;
    // Se posa mirando un poco hacia afuera de la pieza.
    m.giroPosada = (sitio.lado === 'der' ? 1 : -1) * (sitio.costado == null ? 10 + Math.random() * 12 : 4 + Math.random() * 6);
  }

  // La ruta del vuelo mientras se baja: va y viene por la pantalla con la
  // lectura, un poco por delante cuando se baja rápido.
  function rumbo(t) {
    const s = window.scrollY;
    const ancho = innerWidth;
    const alto = innerHeight;
    const margen = Math.min(60, ancho * 0.1);
    const x = ancho * (0.5 + 0.34 * Math.sin(s * 0.0021 + 0.8) + 0.05 * Math.sin(t * 0.9));
    const y = alto * (0.42 + 0.14 * Math.sin(s * 0.0033 + 2.1)) + 10 * Math.sin(t * 1.7) + limitar(rapidez * 0.04, -alto * 0.1, alto * 0.1);
    return { x: limitar(x, margen, ancho - margen), y: limitar(y, alto * 0.14, alto * 0.8) };
  }

  function cuadro(ahora) {
    if (!corriendo) return;
    const dt = Math.min(0.05, (ahora - (antes || ahora)) / 1000);
    antes = ahora;
    reloj += dt;

    // Rapidez del scroll, suavizada.
    const s = window.scrollY;
    const v = dt > 0 ? (s - scrollAntes) / dt : 0;
    scrollAntes = s;
    rapidez += (v - rapidez) * Math.min(1, dt * 6);

    const quieta = performance.now() - ultimoScroll > QUIETA;
    if (m.modo === 'volando' && quieta) {
      const p = buscarPosadero();
      if (p) posarseEn(p.pieza, p.sitio);
    }

    let meta;
    if (m.modo === 'posandose' || m.modo === 'posada') {
      meta = m.posadero && m.posadero.isConnected && !m.posadero.closest('[hidden]') ? anclaDe(m.posadero, m.sitio) : null;
      // Si su pieza se va de la pantalla, despega.
      if (!meta || meta.y < innerHeight * 0.03 || meta.y > innerHeight * 0.94) {
        m.modo = 'volando';
        meta = rumbo(reloj);
      }
    } else {
      meta = rumbo(reloj);
    }

    if (m.modo === 'posada') {
      // Posada, va pegada al papel.
      m.x = meta.x;
      m.y = meta.y;
      m.vx = 0;
      m.vy = 0;
    } else {
      // Resorte con amortiguación crítica: llega sin pasarse ni rebotar.
      const k = m.modo === 'posandose' ? 22 : 9;
      const c = 2 * Math.sqrt(k);
      m.vx += ((meta.x - m.x) * k - m.vx * c) * dt;
      m.vy += ((meta.y - m.y) * k - m.vy * c) * dt;
      m.x += m.vx * dt;
      m.y += m.vy * dt;
      if (m.modo === 'posandose' && Math.hypot(meta.x - m.x, meta.y - m.y) < 1.5 && Math.hypot(m.vx, m.vy) < 40) {
        m.modo = 'posada';
      }
    }

    // En el aire aletea rápido (más si se baja rápido); posada, abre y cierra despacio.
    const enAire = m.modo === 'posada' ? 0 : 1;
    m.vuelo += (enAire - m.vuelo) * Math.min(1, dt * (enAire ? 6 : 3));
    const frecuencia = 0.32 + m.vuelo * (3.4 + Math.min(1, Math.abs(rapidez) / 1600) * 2.2);
    m.fase += dt * frecuencia * Math.PI * 2;
    const batida = 0.5 - 0.5 * Math.cos(m.fase);
    const ala = m.vuelo * (6 + 66 * batida) + (1 - m.vuelo) * (14 + 40 * batida);

    // Se inclina hacia donde va; posada, mira hacia afuera de la pieza.
    const giroMeta = m.modo === 'posada' ? m.giroPosada : limitar(m.vx * 0.05, -30, 30) + Math.sin(reloj * 2.3) * 4 * m.vuelo;
    m.giro += (giroMeta - m.giro) * Math.min(1, dt * 5);

    pintar(ala);
    requestAnimationFrame(cuadro);
  }

  function pintar(ala) {
    el.style.transform = `translate3d(${m.x.toFixed(1)}px, ${m.y.toFixed(1)}px, 0) rotate(${m.giro.toFixed(2)}deg)`;
    el.style.setProperty('--ala', ala.toFixed(1));
    // El oro brilla cuando el ala se inclina hacia la luz.
    el.style.setProperty('--brillo', (Math.sin((ala / 72) * Math.PI) * 0.75).toFixed(3));
    el.style.setProperty('--altura', m.vuelo.toFixed(3));
  }

  function arrancar() {
    if (corriendo) return;
    corriendo = true;
    antes = 0;
    requestAnimationFrame(cuadro);
  }

  function parar() {
    corriendo = false;
  }

  // Entra volando desde arriba a la derecha y se posa en el ramo.
  function llegar() {
    if (!encendida() || doc.classList.contains('intro')) return;
    if (!el) crear();
    el.hidden = false;
    const ramo = document.querySelector('.ramo-lugar');
    if (reducido) {
      m.modo = 'posada';
      m.posadero = ramo;
      m.giroPosada = 12;
      m.vuelo = 0;
      quieta();
      return;
    }
    if (m.modo === 'oculta') {
      m.x = innerWidth + 40;
      m.y = innerHeight * 0.1;
      m.vx = -220;
      m.vy = 60;
      m.giro = -24;
      m.modo = 'volando';
      const r = ramo && ramo.getBoundingClientRect();
      if (r && visible(r) && r.top < innerHeight * 0.8 && r.bottom > 0) posarseEn(ramo, { lado: 'der', costado: null });
    }
    arrancar();
  }

  // Movimiento reducido: posada en el ramo, sin aletear; solo sigue al papel.
  function quieta() {
    const a = m.posadero && anclaDe(m.posadero, m.sitio);
    if (!a) return;
    m.x = a.x;
    m.y = a.y;
    m.giro = m.giroPosada;
    pintar(26);
  }

  function apagar() {
    parar();
    m.modo = 'oculta';
    if (llegadaPendiente) clearTimeout(llegadaPendiente);
    llegadaPendiente = null;
    if (el) el.hidden = true;
  }

  function revisar() {
    if (!encendida()) {
      apagar();
      return;
    }
    if (doc.classList.contains('intro') || m.modo !== 'oculta' || llegadaPendiente) return;
    llegadaPendiente = setTimeout(() => {
      llegadaPendiente = null;
      llegar();
    }, reducido ? 0 : LLEGADA);
  }

  addEventListener('scroll', () => {
    ultimoScroll = performance.now();
    if (reducido) {
      if (m.modo === 'posada') quieta();
      return;
    }
    if (m.modo === 'posandose' || (m.modo === 'posada' && Math.abs(window.scrollY - m.scrollPosada) > DESPEGUE)) m.modo = 'volando';
  }, { passive: true });

  addEventListener('resize', () => { if (reducido && m.modo === 'posada') quieta(); });

  // Cuando la página quita la clase intro (el sobre se abrió) o cambia la
  // opción del panel, la mariposa llega o se va.
  new MutationObserver(revisar).observe(doc, { attributes: true, attributeFilter: ['class', 'data-mariposa'] });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', revisar);
  else revisar();

  window.Mariposa = { llegar, apagar };
})();
