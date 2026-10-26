/*
 * Estilos de la invitación: paletas de color y familias de letra.
 *
 * La invitación y el panel comparten estas definiciones. Cada paleta redefine
 * los tokens de base.css (los nombres son los de la paleta verde original:
 * --verde es «el suelo», --algodon «el papel», --tinta «la tinta») y cada
 * familia de letra redefine las cuatro voces tipográficas. Con la paleta
 * «libre», la paleta entera sale de un solo color (estilo.color).
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
        // Sobre un suelo claro el destello va en oro viejo y su halo es luz.
        '--destello': '#b8862b',
        '--destello-luz': '#fffaf0',
        '--destello-halo': 'rgba(255, 246, 222, 0.62)',
        '--destello-sombra': 'color-mix(in srgb, var(--sombra) 16%, transparent)',
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
        '--destello': '#f3d27e',
        '--destello-luz': '#fff7df',
        '--destello-halo': 'rgba(232, 180, 76, 0.22)',
        '--destello-sombra': 'color-mix(in srgb, var(--sombra) 55%, transparent)',
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
      sombra: '#1a3024',
      sello: { fondo: '#6f9a80', marco: '#e6efe7', hoja: '#3e6a52', flor: '#fbfdfb', florSombra: '#e1ebe2' },
      forro: { fondo: '#9dbaa6', linea: '#4d775f' },
    }),
  };

  // ---------- Color libre ----------
  // Además de las paletas de arriba, el panel puede elegir cualquier color para
  // el suelo: de él sale la paleta entera, con los mismos pasos de luz y croma
  // que las paletas hechas a mano, medidos en OKLCH para que todos los tonos
  // queden igual de claros. Un color claro se arma como las pastel (tinta
  // oscura del mismo tono); uno oscuro, como Verde hoja (letras de algodón).
  const LIBRE = 'libre';
  const COLOR_LIBRE = '#c9a3b5';
  const HEX = /^#[0-9a-f]{6}$/;

  const lineal = (v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
  const gamma = (v) => (v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055);
  const canales = (hex) => {
    const n = parseInt(hex.slice(1), 16);
    return [n >> 16, (n >> 8) & 255, n & 255].map((v) => lineal(v / 255));
  };

  function aOklch(hex) {
    const [r, g, b] = canales(hex);
    const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
    const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
    const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
    const a = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
    const z = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
    return { l: 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s, c: Math.hypot(a, z), h: Math.atan2(z, a) };
  }

  function rgbDeOklch(l, c, h) {
    const a = c * Math.cos(h);
    const z = c * Math.sin(h);
    const x = (l + 0.3963377774 * a + 0.2158037573 * z) ** 3;
    const y = (l - 0.1055613458 * a - 0.0638541728 * z) ** 3;
    const w = (l - 0.0894841775 * a - 1.291485548 * z) ** 3;
    return [
      4.0767416621 * x - 3.3077115913 * y + 0.2309699292 * w,
      -1.2684380046 * x + 2.6097574011 * y - 0.3413193965 * w,
      -0.0041960863 * x - 0.7034186147 * y + 1.707614701 * w,
    ];
  }

  const fuera = (rgb) => rgb.some((v) => v < -1e-4 || v > 1 + 1e-4);

  // Un tono que no cabe en la pantalla conserva su luz y pierde croma.
  function deOklch(l, c, h) {
    const luz = Math.min(1, Math.max(0, l));
    let rgb = rgbDeOklch(luz, c, h);
    if (fuera(rgb)) {
      let bajo = 0;
      let alto = c;
      for (let i = 0; i < 16; i++) {
        const medio = (bajo + alto) / 2;
        if (fuera(rgbDeOklch(luz, medio, h))) alto = medio;
        else bajo = medio;
      }
      rgb = rgbDeOklch(luz, bajo, h);
    }
    return '#' + rgb.map((v) => Math.round(gamma(Math.min(1, Math.max(0, v))) * 255).toString(16).padStart(2, '0')).join('');
  }

  // Contraste WCAG entre dos colores.
  function contraste(x, y) {
    const lum = (hex) => {
      const [r, g, b] = canales(hex);
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };
    const a = lum(x);
    const b = lum(y);
    return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
  }

  function rgba(hex, alfa) {
    const n = parseInt(hex.slice(1), 16);
    return `rgba(${n >> 16}, ${(n >> 8) & 255}, ${n & 255}, ${alfa})`;
  }

  function generar(hex) {
    const { l: L, c: C, h: H } = aOklch(hex);
    const tono = (l, c) => deOklch(l, c, H);
    // Croma proporcional al del color elegido, con techo para los tonos fuertes.
    const k = (f, techo) => Math.min(C * f, techo);
    // Lo que se escribe sobre el suelo parte de su luz de siempre y se aleja
    // del fondo hasta leerse (4.5:1).
    const legible = (l, c, paso, fondo) => {
      let luz = l;
      let x = tono(luz, c);
      while (contraste(x, fondo) < 4.5 && luz > 0.02 && luz < 0.98) {
        luz += paso;
        x = tono(luz, c);
      }
      return x;
    };
    const clara = contraste(hex, '#15271e') >= contraste(hex, '#f6f5ef');

    if (clara) {
      const medio = tono(L - 0.048, C * 1.35);
      const honda = tono(L - 0.048, C * 1.4);
      const deg = ((H * 180) / Math.PI + 360) % 360;
      return Object.assign(pastel({
        nombre: 'Color libre',
        suelo: hex,
        medio,
        hondo: tono(0.31, k(1.6, 0.06)),
        enlace: tono(0.47, k(3, 0.11)),
        luz: tono(0.61, k(3, 0.11)),
        salvia: legible(0.47, k(2.2, 0.08), -0.02, medio),
        salviaClara: legible(0.39, k(2, 0.07), -0.02, medio),
        tintaSobre: legible(0.31, k(1.7, 0.06), -0.02, honda),
        cartulina: [tono(L + 0.03, C * 0.8), tono(L - 0.008, C * 1.1), honda],
        algodon: [tono(0.981, k(0.22, 0.008)), tono(0.947, k(0.45, 0.016)), tono(0.903, k(0.7, 0.024))],
        tinta: [tono(0.27, k(1.4, 0.05)), tono(0.46, k(1.4, 0.05)), tono(0.52, k(1.4, 0.05))],
        linea: tono(0.892, k(0.7, 0.025)),
        sombra: tono(0.3, k(1.7, 0.06)),
        sello: {
          fondo: tono(0.64, k(2.7, 0.1)),
          marco: tono(0.93, k(0.8, 0.03)),
          // Sobre un sello verde las hojas van más hondas, como en Salvia.
          hoja: C > 0.015 && deg > 110 && deg < 190 ? '#3e6a52' : '#7f9c86',
          flor: tono(0.99, k(0.2, 0.007)),
          florSombra: tono(0.92, k(0.8, 0.03)),
        },
        forro: { fondo: tono(0.76, k(2, 0.08)), linea: tono(0.54, k(2.6, 0.1)) },
      }), { libre: true });
    }

    // Con un color oscuro, el sobre (lo primero que se ve) lleva el color
    // elegido tal cual y el suelo baja un tono, como en Verde hoja.
    const Ls = L - 0.075;
    const Cs = C / 1.3;
    const ks = (f, techo) => Math.min(Cs * f, techo);
    const suelo = tono(Ls, Cs);
    const medio = tono(Ls + 0.052, Cs * 1.16);
    const hondo = tono(Ls - 0.074, Cs * 0.77);
    const luz = tono(Ls + 0.164, Cs * 1.47);
    const cartulinaLuz = tono(L + 0.043, C * 1.1);
    const algodon = tono(0.969, ks(0.19, 0.008));
    const salvia = legible(Math.max(0.771, Ls + 0.45), ks(0.86, 0.06), 0.02, medio);
    const forro = tono(Ls + 0.046, Cs * 1.1);
    return {
      nombre: 'Color libre',
      clara: false,
      libre: true,
      tema: suelo,
      vars: {
        '--verde': suelo,
        '--verde-medio': medio,
        '--verde-hondo': hondo,
        // También es el color de los enlaces sobre la tarjeta.
        '--verde-forro': legible(Ls + 0.067, Cs * 1.16, -0.02, algodon),
        '--verde-luz': luz,
        '--salvia': salvia,
        '--salvia-clara': legible(0.882, ks(0.44, 0.03), 0.02, medio),
        '--tinta-sobre': legible(0.969, ks(0.19, 0.008), 0.01, cartulinaLuz),
        '--cartulina-luz': cartulinaLuz,
        '--cartulina-media': hex,
        '--cartulina-honda': tono(L - 0.042, C * 0.92),
        '--algodon': algodon,
        '--algodon-hondo': tono(0.938, ks(0.28, 0.012)),
        '--algodon-sombra': tono(0.898, ks(0.37, 0.016)),
        '--tinta': tono(0.254, ks(0.7, 0.05)),
        '--tinta-suave': tono(0.466, ks(0.67, 0.05)),
        '--tinta-tenue': tono(0.526, ks(0.65, 0.05)),
        '--linea': tono(0.864, ks(0.37, 0.02)),
        '--brillo-suelo': rgba(luz, 0.45),
        '--destello': '#f3d27e',
        '--destello-luz': '#fff7df',
        '--destello-halo': 'rgba(232, 180, 76, 0.22)',
        '--destello-sombra': 'color-mix(in srgb, var(--sombra) 55%, transparent)',
        '--sombra': tono(Ls - 0.13, Cs * 0.65),
        '--matasellos-sobre': '#e8b44c',
        '--foco': '#d6981f',
        '--barra-riel': hondo,
        '--grano-suelo': 'var(--grano)',
      },
      sello: { fondo: medio, marco: salvia, hoja: '#6f9a80', flor: '#f6f5ef', florSombra: tono(0.92, ks(0.28, 0.012)) },
      forro: { fondo: forro, linea: forro },
    };
  }

  // El panel repinta las muestras a cada paso del selector: se guarda la última.
  let ultimaLibre = null;
  function libre(color) {
    if (!ultimaLibre || ultimaLibre.color !== color) ultimaLibre = { color, paleta: generar(color) };
    return ultimaLibre.paleta;
  }

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

  // El color libre se conserva aunque se elija otra paleta: así el panel lo
  // recuerda si se vuelve a él.
  function normalizar(e) {
    const x = e || {};
    const color = typeof x.color === 'string' && HEX.test(x.color.toLowerCase()) ? x.color.toLowerCase() : null;
    const n = {
      paleta: (PALETAS[x.paleta] || (x.paleta === LIBRE && color)) ? x.paleta : DEFECTO.paleta,
      letra: LETRAS[x.letra] ? x.letra : DEFECTO.letra,
    };
    if (color) n.color = color;
    return n;
  }

  // La paleta de un estilo: una de las hechas a mano o la del color libre.
  function paleta(estilo) {
    const e = normalizar(estilo);
    return e.paleta === LIBRE ? libre(e.color) : PALETAS[e.paleta];
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
  function forro(estilo) {
    const e = normalizar(estilo);
    const f = paleta(e).forro;
    if (!f) return Promise.resolve(null);
    const clave = e.paleta === LIBRE ? `${LIBRE}:${e.color}` : e.paleta;
    if (!forros[clave]) {
      // Del color libre basta el último forro.
      Object.keys(forros).forEach((c) => { if (c.startsWith(`${LIBRE}:`)) delete forros[c]; });
      if (!plantillaForro) {
        plantillaForro = fetch('assets/forro.svg')
          .then((r) => (r.ok ? r.text() : null))
          .catch(() => null);
      }
      forros[clave] = plantillaForro.then((svg) => {
        if (!svg) return null;
        const pintado = svg
          .replace(/(<rect[^>]*fill=")#24473a/, `$1${f.fondo}`)
          .replace(/#24473a/g, f.linea);
        return `url("data:image/svg+xml,${encodeURIComponent(pintado)}")`;
      });
    }
    return forros[clave];
  }

  let turno = 0;
  function aplicar(estilo, el) {
    const e = normalizar(estilo);
    const raiz = el || document.documentElement;
    const p = paleta(e);
    const vars = Object.assign({}, p.vars, LETRAS[e.letra].vars);
    Object.keys(vars).forEach((k) => raiz.style.setProperty(k, vars[k]));
    raiz.dataset.paleta = e.paleta;
    if (e.paleta === LIBRE) raiz.dataset.color = e.color;
    else delete raiz.dataset.color;
    raiz.dataset.letra = e.letra;
    cargarLetra(e.letra);
    if (raiz === document.documentElement) {
      const meta = document.querySelector('meta[name="theme-color"]');
      if (meta) meta.content = p.tema;
      const mio = ++turno;
      if (!p.forro) raiz.style.removeProperty('--forro-img');
      else forro(e).then((url) => { if (url && mio === turno) raiz.style.setProperty('--forro-img', url); });
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
  // (con color libre: &paleta=libre&color=%23c9a3b5)
  function desdeUrl(params) {
    if (params.get('vista') !== 'panel' || !(params.get('paleta') || params.get('letra'))) return null;
    return normalizar({ paleta: params.get('paleta'), letra: params.get('letra'), color: params.get('color') });
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

  window.Estilos = { PALETAS, LETRAS, DEFECTO, LIBRE, COLOR_LIBRE, normalizar, paleta, aplicar, cargarLetra, listo, forro, recordar, recordado, desdeUrl, arrancar };
})();
