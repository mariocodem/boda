/*
 * Estilos de la invitación: paletas de color y familias de letra.
 *
 * La invitación y el panel comparten estas definiciones. Cada paleta redefine
 * los tokens de base.css (los nombres son los de la paleta verde original:
 * --verde es «el suelo», --algodon «el papel», --tinta «la tinta») y cada
 * familia de letra redefine las cuatro voces tipográficas.
 *
 * Estilos.aplicar(estilo, elemento) escribe las variables en el elemento (por
 * defecto <html>), carga las fuentes y, en la página, repinta el forro.
 */
(function () {
  const CLAVE = 'boda-diego-erika:estilo';
  const DEFECTO = { paleta: 'verde', letra: 'grabada' };

  // Grano del suelo más suave para los papeles claros.
  const GRANO_SUAVE = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='g' x='0' y='0' width='100%25' height='100%25'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 .07 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23g)'/%3E%3C/svg%3E\")";

  // En las paletas pastel el suelo es claro: lo que se escribe sobre él
  // (--tinta-sobre, --salvia, --salvia-clara) pasa a tinta oscura del mismo tono.
  function pastel(p) {
    return {
      nombre: p.nombre,
      clara: true,
      tema: p.suelo,
      vars: {
        '--verde': p.suelo,
        '--verde-medio': p.medio,
        '--verde-hondo': p.hondo,
        '--verde-forro': p.enlace,
        '--verde-luz': p.luz,
        '--salvia': p.salvia,
        '--salvia-clara': p.salviaClara,
        '--tinta-sobre': p.tintaSobre,
        '--cartulina-luz': p.cartulina[0],
        '--cartulina-media': p.cartulina[1],
        '--cartulina-honda': p.cartulina[2],
        '--algodon': p.algodon[0],
        '--algodon-hondo': p.algodon[1],
        '--algodon-sombra': p.algodon[2],
        '--tinta': p.tinta[0],
        '--tinta-suave': p.tinta[1],
        '--tinta-tenue': p.tinta[2],
        '--linea': p.linea,
        '--brillo-suelo': 'rgba(255, 255, 255, 0.42)',
        '--velo-altar': p.velo,
        '--sombra': p.sombra,
        '--matasellos-sobre': '#9a6a10',
        '--foco': '#9a6a10',
        '--barra-riel': p.suelo,
        '--grano-suelo': GRANO_SUAVE,
      },
      sello: p.sello,
      forro: p.forro,
    };
  }

  const PALETAS = {
    verde: {
      nombre: 'Verde hoja',
      clara: false,
      tema: '#1c3a2d',
      vars: {
        '--verde': '#1c3a2d',
        '--verde-medio': '#24493a',
        '--verde-hondo': '#11261c',
        '--verde-forro': '#2a4d3c',
        '--verde-luz': '#3e6a52',
        '--salvia': '#a3bcaa',
        '--salvia-clara': '#cfdcd2',
        '--tinta-sobre': '#f6f5ef',
        '--cartulina-luz': '#2f5d48',
        '--cartulina-media': '#27503e',
        '--cartulina-honda': '#1f4434',
        '--algodon': '#f6f5ef',
        '--algodon-hondo': '#ecebe2',
        '--algodon-sombra': '#dcdfd3',
        '--tinta': '#15271e',
        '--tinta-suave': '#4b5f55',
        '--tinta-tenue': '#5d7066',
        '--linea': '#cdd5cb',
        '--brillo-suelo': 'rgba(62, 106, 82, 0.45)',
        '--velo-altar': '#b9cbbd',
        '--sombra': '#081810',
        '--matasellos-sobre': '#e8b44c',
        '--foco': '#d6981f',
        '--barra-riel': '#11261c',
        '--grano-suelo': 'var(--grano)',
      },
      sello: { fondo: '#24493a', marco: '#a3bcaa', hoja: '#6f9a80', flor: '#f6f5ef', florSombra: '#dfe7e1' },
      forro: null,
    },
    rosa: pastel({
      nombre: 'Rosa empolvado',
      suelo: '#e8cfcb',
      medio: '#ddbcb7',
      hondo: '#4b2e33',
      enlace: '#8a4f5a',
      luz: '#b0707b',
      salvia: '#77484f',
      salviaClara: '#5e3a40',
      tintaSobre: '#4a2a30',
      cartulina: ['#f0dcd8', '#e7cbc6', '#dcbab4'],
      algodon: ['#fbf7f3', '#f2e9e4', '#e6d8d3'],
      tinta: ['#3a2127', '#6a4f55', '#7c6066'],
      linea: '#e6d6d2',
      velo: '#ecd0d0',
      sombra: '#4a2830',
      sello: { fondo: '#a8707a', marco: '#f3dcd8', hoja: '#7f9c7f', flor: '#fffaf7', florSombra: '#f1dcd9' },
      forro: { fondo: '#c99ca1', linea: '#8f5e66' },
    }),
    lavanda: pastel({
      nombre: 'Lavanda',
      suelo: '#dcd3e8',
      medio: '#cdc1de',
      hondo: '#2c2540',
      enlace: '#5c4a85',
      luz: '#8670ad',
      salvia: '#5d4e7c',
      salviaClara: '#463a63',
      tintaSobre: '#2e2545',
      cartulina: ['#e5ddef', '#d9cfe6', '#ccc0dd'],
      algodon: ['#faf8fc', '#efebf4', '#e1dbe9'],
      tinta: ['#241d36', '#574d6c', '#6b6182'],
      linea: '#ddd6e6',
      velo: '#ddd2ea',
      sombra: '#2a2140',
      sello: { fondo: '#8c78b0', marco: '#ece6f4', hoja: '#7f9c86', flor: '#fdfbff', florSombra: '#e7e0f0' },
      forro: { fondo: '#b3a4cc', linea: '#6f5d96' },
    }),
    cielo: pastel({
      nombre: 'Azul cielo',
      suelo: '#d3e0ec',
      medio: '#c1d2e2',
      hondo: '#1d2c3c',
      enlace: '#3b5f84',
      luz: '#5f86ad',
      salvia: '#4a6380',
      salviaClara: '#34495f',
      tintaSobre: '#1f2e3f',
      cartulina: ['#dde8f2', '#d0dfeb', '#c2d4e4'],
      algodon: ['#f8fafc', '#ebf0f4', '#dbe3ea'],
      tinta: ['#1b2735', '#4b5a6b', '#5c6c7e'],
      linea: '#d5dde5',
      velo: '#d4e0ec',
      sombra: '#1c2a3a',
      sello: { fondo: '#6f93b8', marco: '#e3edf5', hoja: '#7f9c86', flor: '#fbfdff', florSombra: '#dfe9f1' },
      forro: { fondo: '#98b4cf', linea: '#4f7091' },
    }),
    durazno: pastel({
      nombre: 'Durazno',
      suelo: '#f2dccb',
      medio: '#e9cbb5',
      hondo: '#4a2d20',
      enlace: '#8f4f33',
      luz: '#c07a58',
      salvia: '#80503b',
      salviaClara: '#63392a',
      tintaSobre: '#4a2a1e',
      cartulina: ['#f6e5d7', '#efd6c3', '#e6c6ae'],
      algodon: ['#fdf9f5', '#f4ebe3', '#e9dbcf'],
      tinta: ['#3a2419', '#6b5145', '#7d6356'],
      linea: '#eadcd1',
      velo: '#f0d6c6',
      sombra: '#4a2a1c',
      sello: { fondo: '#c98a6c', marco: '#f8e6da', hoja: '#7f9c7f', flor: '#fffbf7', florSombra: '#f3e1d5' },
      forro: { fondo: '#dcae93', linea: '#a0634a' },
    }),
    salvia: pastel({
      nombre: 'Salvia',
      suelo: '#d5e3d7',
      medio: '#c3d6c6',
      hondo: '#1c3326',
      enlace: '#2f5a43',
      luz: '#4f7f62',
      salvia: '#45614f',
      salviaClara: '#33493b',
      tintaSobre: '#1d3326',
      cartulina: ['#dfeadf', '#d2e1d4', '#c4d6c7'],
      algodon: ['#f8faf6', '#edf1ea', '#dde5db'],
      tinta: ['#15271e', '#4b5f55', '#5d7066'],
      linea: '#d3ddd2',
      velo: '#cfdfd2',
      sombra: '#1a3024',
      sello: { fondo: '#6f9a80', marco: '#e6efe7', hoja: '#3e6a52', flor: '#fbfdfb', florSombra: '#e1ebe2' },
      forro: { fondo: '#9dbaa6', linea: '#4d775f' },
    }),
  };

  // Cada familia trae su romana para títulos (siempre en caja alta), su serifa
  // de texto con itálica, su caligrafía y una escala para igualar tamaños.
  // Las cifras van en la serifa de texto con números de caja alta.
  const LETRAS = {
    grabada: {
      nombre: 'Grabada',
      descripcion: 'Romana grabada y caligrafía inglesa',
      css: null,
      cargar: ['400 1em "Castoro Titling"', '400 1em "Castoro"', 'italic 400 1em "Castoro"', '400 1em "Rouge Script"'],
      vars: {
        '--f-grabada': "'Castoro Titling', 'Castoro', Georgia, serif",
        '--f-texto': "'Castoro', Georgia, 'Times New Roman', serif",
        '--f-mano': "'Rouge Script', 'Castoro', cursive",
        '--f-cifras': "'Castoro', Georgia, serif",
        '--escala-nombres': '1',
        '--escala-mano': '1',
      },
    },
    romana: {
      nombre: 'Romana',
      descripcion: 'Capitales clásicas y caligrafía suelta',
      css: 'https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500&family=Crimson+Pro:ital,wght@0,400;0,500;1,400&family=Great+Vibes&display=swap',
      cargar: ['400 1em "Cinzel"', '400 1em "Crimson Pro"', 'italic 400 1em "Crimson Pro"', '400 1em "Great Vibes"'],
      vars: {
        '--f-grabada': "'Cinzel', 'Crimson Pro', Georgia, serif",
        '--f-texto': "'Crimson Pro', Georgia, 'Times New Roman', serif",
        '--f-mano': "'Great Vibes', 'Crimson Pro', cursive",
        '--f-cifras': "'Crimson Pro', Georgia, serif",
        '--escala-nombres': '0.88',
        '--escala-mano': '0.92',
      },
    },
    romantica: {
      nombre: 'Romántica',
      descripcion: 'Serifa de alto contraste y caligrafía redonda',
      css: 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500&family=Lora:ital@0;1&family=Parisienne&display=swap',
      cargar: ['400 1em "Playfair Display"', '400 1em "Lora"', 'italic 400 1em "Lora"', '400 1em "Parisienne"'],
      vars: {
        '--f-grabada': "'Playfair Display', 'Lora', Georgia, serif",
        '--f-texto': "'Lora', Georgia, 'Times New Roman', serif",
        '--f-mano': "'Parisienne', 'Lora', cursive",
        '--f-cifras': "'Lora', Georgia, serif",
        '--escala-nombres': '0.94',
        '--escala-mano': '0.8',
      },
    },
    fina: {
      nombre: 'Fina',
      descripcion: 'Didona de trazo fino y caligrafía ligera',
      css: 'https://fonts.googleapis.com/css2?family=Bodoni+Moda:wght@400;500&family=Spectral:ital,wght@0,400;1,400&family=Allura&display=swap',
      cargar: ['400 1em "Bodoni Moda"', '400 1em "Spectral"', 'italic 400 1em "Spectral"', '400 1em "Allura"'],
      vars: {
        '--f-grabada': "'Bodoni Moda', 'Spectral', Georgia, serif",
        '--f-texto': "'Spectral', Georgia, 'Times New Roman', serif",
        '--f-mano': "'Allura', 'Spectral', cursive",
        '--f-cifras': "'Spectral', Georgia, serif",
        '--escala-nombres': '0.92',
        '--escala-mano': '0.96',
      },
    },
  };

  function normalizar(e) {
    const x = e || {};
    return {
      paleta: PALETAS[x.paleta] ? x.paleta : DEFECTO.paleta,
      letra: LETRAS[x.letra] ? x.letra : DEFECTO.letra,
    };
  }

  const cargadas = {};
  function cargarLetra(letra) {
    const l = LETRAS[letra];
    if (!l || !l.css) return Promise.resolve();
    if (!cargadas[letra]) {
      cargadas[letra] = new Promise((listo) => {
        const enlace = document.createElement('link');
        enlace.rel = 'stylesheet';
        enlace.href = l.css;
        enlace.onload = listo;
        enlace.onerror = listo;
        document.head.appendChild(enlace);
      });
    }
    return cargadas[letra];
  }

  const espera = (ms) => new Promise((r) => setTimeout(r, ms));

  // Resuelve cuando las fuentes del estilo están descargadas (o a los 2.5 s).
  function listo(estilo) {
    const e = normalizar(estilo);
    const l = LETRAS[e.letra];
    const fuentes = cargarLetra(e.letra).then(() => (document.fonts && document.fonts.load
      ? Promise.all(l.cargar.map((f) => document.fonts.load(f).catch(() => null)))
      : null));
    return Promise.race([fuentes, espera(2500)]);
  }

  // El forro del sobre es un SVG con el verde de fondo; para las otras
  // paletas se repinta su fondo y sus líneas y se usa como imagen en línea.
  let plantillaForro = null;
  const forros = {};
  function forro(paleta) {
    const f = PALETAS[paleta] && PALETAS[paleta].forro;
    if (!f) return Promise.resolve(null);
    if (!forros[paleta]) {
      if (!plantillaForro) {
        plantillaForro = fetch('assets/forro.svg')
          .then((r) => (r.ok ? r.text() : null))
          .catch(() => null);
      }
      forros[paleta] = plantillaForro.then((svg) => {
        if (!svg) return null;
        const pintado = svg
          .replace(/(<rect[^>]*fill=")#24473a/, `$1${f.fondo}`)
          .replace(/#24473a/g, f.linea);
        return `url("data:image/svg+xml,${encodeURIComponent(pintado)}")`;
      });
    }
    return forros[paleta];
  }

  let turno = 0;
  function aplicar(estilo, el) {
    const e = normalizar(estilo);
    const raiz = el || document.documentElement;
    const vars = Object.assign({}, PALETAS[e.paleta].vars, LETRAS[e.letra].vars);
    Object.keys(vars).forEach((k) => raiz.style.setProperty(k, vars[k]));
    raiz.dataset.paleta = e.paleta;
    raiz.dataset.letra = e.letra;
    cargarLetra(e.letra);
    if (raiz === document.documentElement) {
      const meta = document.querySelector('meta[name="theme-color"]');
      if (meta) meta.content = PALETAS[e.paleta].tema;
      const mio = ++turno;
      if (!PALETAS[e.paleta].forro) raiz.style.removeProperty('--forro-img');
      else forro(e.paleta).then((url) => { if (url && mio === turno) raiz.style.setProperty('--forro-img', url); });
    }
    return e;
  }

  function recordar(estilo) {
    try { localStorage.setItem(CLAVE, JSON.stringify(normalizar(estilo))); } catch { /* sin almacenamiento */ }
  }

  function recordado() {
    try {
      const v = JSON.parse(localStorage.getItem(CLAVE));
      return v && v.paleta ? normalizar(v) : null;
    } catch {
      return null;
    }
  }

  // Vista previa desde el panel: index.html?vista=panel&paleta=rosa&letra=fina
  function desdeUrl(params) {
    if (params.get('vista') !== 'panel' || !(params.get('paleta') || params.get('letra'))) return null;
    return normalizar({ paleta: params.get('paleta'), letra: params.get('letra') });
  }

  // Primer estilo de la página, antes de pintar: la vista previa del panel, lo
  // guardado en este navegador (modo local) o lo recordado de la última visita.
  // Si no hay nada y los datos vienen de Supabase, la escena espera al estilo.
  function arrancar() {
    const C = window.BODA || {};
    const local = !(C.supabase && C.supabase.url && C.supabase.anonKey);
    let e = desdeUrl(new URLSearchParams(location.search));
    if (!e && local) {
      try {
        const ev = JSON.parse(localStorage.getItem('boda-diego-erika:evento'));
        if (ev && ev.estilo) e = ev.estilo;
      } catch { /* sin datos guardados */ }
    }
    if (!e) e = recordado();
    if (!e) {
      e = C.estilo;
      if (!local) document.documentElement.classList.add('estilo-pendiente');
    }
    return aplicar(e);
  }

  window.Estilos = { PALETAS, LETRAS, DEFECTO, normalizar, aplicar, cargarLetra, listo, forro, recordar, recordado, desdeUrl, arrancar };
})();
