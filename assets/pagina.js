/*
 * La página de la invitación: su tema, su fondo, sus textos y sus bloques. La
 * comparten la invitación, que la pinta, y el panel (pestaña «Diseño»), donde
 * se edita como en WordPress.
 *
 *   { tema: 'vino' | 'victoriano' | 'pliegos' | 'editorial',
 *     trato: 'tu' | 'usted',
 *     animacion: 'completas' | 'suaves' | 'ninguna',
 *     musica: { archivo, volumen, activa },
 *     fondo: { tipo: 'tema' | 'color' | 'degradado' | 'imagen', color, color2,
 *              direccion, imagen, velo },
 *     portada: { texto, textoVarios, pista },   // la tarjeta (va siempre primero)
 *     cierre: { con, firma, volver },           // el remite (va siempre al final)
 *     bloques: [{ id, tipo, oculto, ...campos del tipo }] }
 *
 * Las secciones con datos de la boda (los detalles, cómo llegar, el
 * itinerario…) son únicas: se ordenan, se ocultan y se les cambian los textos,
 * pero sus datos se llenan en «La boda». Los bloques libres (texto, foto,
 * galería, cita…) se agregan, se duplican y se quitan.
 *
 * Un texto vacío (null) usa el de siempre, que depende del trato y de si la
 * invitación es para una persona o para varias (campos «Varios»).
 */
(function () {
  const C = window.BODA || { pareja: { uno: { nombre: 'Diego' }, dos: { nombre: 'Erika' } } };
  const UNO = C.pareja.uno.nombre;
  const DOS = C.pareja.dos.nombre;
  const FIRMA = `${UNO} & ${DOS}`;

  const ID = /^[a-z0-9]{4,24}$/;
  const HEX = /^#[0-9a-f]{6}$/;
  const MAX_BLOQUES = 60;

  const TEMAS = {
    // El de arranque desde el 2026-11-06 (prompt de Mario con referencias en
    // referencias-boda/): marfil con filigranas vino, intro de bosque con niebla
    // y secciones oscuras que dan ritmo. Sus bloques propios llevan tema: 'vino'.
    vino: {
      nombre: 'Vino & Marfil',
      descripcion: 'Marfil con filigranas vino tinto, un sobre vino con sello dorado sobre un bosque con niebla, polaroids, camafeo y secciones oscuras.',
      paleta: 'marfil',
      letra: 'cinzel',
    },
    // Espíritu victoriano (pedido de Mario, 2026-11-05).
    victoriano: {
      nombre: 'Victoriano',
      descripcion: 'Terciopelo vino, papel marfil con filetes y florituras doradas, caligrafía inglesa y un álbum de fotos con ventanas ovaladas.',
      paleta: 'vino',
      letra: 'victoriana',
    },
    pliegos: {
      nombre: 'Pliegos',
      descripcion: 'Tarjetas de algodón sobre la cartulina del sobre, con títulos grabados.',
    },
    editorial: {
      nombre: 'Editorial',
      descripcion: 'Página crema con titulares grandes, fotos a todo el alto y láminas de rosas y lirios.',
      // Al elegir el tema se proponen sus colores y su letra.
      paleta: 'terracota',
      letra: 'editorial',
    },
  };

  // Láminas de Redouté (assets/flores, ver FUENTE.md).
  const FLORES = {
    'rosa-alba-regalis': 'Rosa blanca real',
    'rosa-alba-foliacea': 'Rosa blanca de hojas',
    'rosa-damascena-subalba': 'Rosa damascena',
    'rosa-centifolia-foliacea': 'Rosa centifolia',
    'rosa-multiflora-carnea': 'Ramillete de rosas',
    'rosa-indica-fragrans': 'Rosa de té',
    'rosa-sepium': 'Rosa silvestre',
    'lilium-candidum': 'Lirio blanco',
  };

  const DIRECCIONES = { abajo: 'De arriba abajo', diagonal: 'En diagonal', centro: 'Desde el centro' };

  // ---------- Los campos de cada bloque ----------

  // Un campo: [clave, tipo, etiqueta, opciones]. Tipos: linea, parrafos,
  // enlace, foto, fotos, opciones, flor, colores. «defecto» puede ser un texto o
  // { tu, usted, varios } (con «varios», el campo tiene su pareja «…Varios»).
  const linea = (clave, etiqueta, defecto = '', op = {}) => Object.assign({ clave, tipo: 'linea', etiqueta, defecto, max: 120 }, op);
  const parrafos = (clave, etiqueta, op = {}) => Object.assign({ clave, tipo: 'parrafos', etiqueta, defecto: '', max: 3000 }, op);
  const titulo = (defecto) => linea('titulo', 'Título', defecto);

  const TIPOS = {
    // Fijos: no se mueven ni se ocultan. Sus textos sí se cambian.
    portada: {
      nombre: 'Portada',
      icono: 'sobre',
      fijo: true,
      ayuda: 'La tarjeta con la foto, el ramo y los nombres. Va siempre primero: se asienta al bajar.',
      datos: 'portada',
      campos: [
        linea('texto', 'Frase de la invitación', {
          tu: 'tienen el gusto de invitarte a celebrar su matrimonio',
          usted: 'tienen el gusto de invitarle a celebrar su matrimonio',
          varios: 'tienen el gusto de invitarlos a celebrar su matrimonio',
        }, { max: 160 }),
        linea('pista', 'Invitación a bajar', 'Desliza para ver los detalles', { max: 60 }),
        // La intro del tema Vino & Marfil: el sobre sobre un bosque con niebla.
        linea('introArriba', 'Intro: frase de arriba (Vino & Marfil)', 'El día más importante de nuestra vida ha llegado', { max: 90 }),
        linea('introFrase', 'Intro: frase en caligrafía (Vino & Marfil)', '¡Nos casamos!', { max: 40 }),
        linea('abrir', 'Intro: texto del sobre (Vino & Marfil)', 'Abrir aquí', { max: 30 }),
        { clave: 'introFoto', tipo: 'foto', etiqueta: 'Intro: foto del fondo (Vino & Marfil)', ayuda: 'Un bosque con niebla, por ejemplo. Sin foto se usa la de la portada, con la niebla encima.' },
      ],
    },
    cierre: {
      nombre: 'Cierre',
      icono: 'sobre',
      fijo: true,
      ayuda: 'El remite con el sello, al final de la invitación.',
      campos: [
        linea('con', 'Despedida', 'Con cariño,', { max: 60 }),
        linea('firma', 'Firma', FIRMA, { max: 60 }),
        linea('volver', 'Botón para volver al sobre', 'Volver a cerrar el sobre', { max: 60 }),
        parrafos('frase', 'Frase final (Vino & Marfil)', { defecto: 'Ninguna medida de tiempo contigo será suficiente, pero empecemos con un para siempre.', max: 300 }),
        linea('gracias', 'Agradecimiento (Vino & Marfil)', '¡Gracias!', { max: 40 }),
        { clave: 'foto', tipo: 'foto', etiqueta: 'Foto del camafeo (Vino & Marfil)', ayuda: 'Va en un marco ovalado. Sin foto se usa la última de la pareja.' },
      ],
    },

    // Secciones con datos de la boda: una de cada una.
    // El álbum va justo después de la tarjeta: las fotos de la pareja a todo
    // lo ancho, una grande y dos más chicas.
    album: {
      nombre: 'Álbum de fotos',
      icono: 'fotos',
      unico: true,
      // Una página guardada antes de que existiera lo recibe a la vista.
      nuevoVisible: true,
      ayuda: 'Las tres primeras fotos de la pareja, justo después de la tarjeta: la primera grande y las otras dos más chicas. Sin fotos no aparece.',
      datos: 'fotos',
      campos: [
        linea('frase', 'Frase de arriba', '¡Nos casamos!', { max: 80 }),
        linea('titulo', 'Nombres', FIRMA, { max: 60 }),
      ],
    },
    detalles: {
      nombre: 'Los detalles',
      icono: 'calendario',
      unico: true,
      foto: true,
      ayuda: 'El día, la hora y el lugar de la ceremonia, con la cuenta de los días que faltan.',
      datos: 'fecha',
      campos: [
        titulo('Los detalles'),
        linea('dia', 'Tarjeta de la fecha', 'El día', { max: 40 }),
        linea('ceremonia', 'Tarjeta de la hora', 'La ceremonia', { max: 40 }),
        linea('lugar', 'Tarjeta del lugar', 'El lugar', { max: 40 }),
        linea('enlace', 'Enlace a cómo llegar', 'Ver cómo llegar', { max: 40 }),
      ],
    },
    calendario: {
      nombre: 'El gran día',
      icono: 'calendario',
      unico: true,
      nuevoVisible: true,
      ayuda: 'El calendario del mes de la boda, con el día encerrado. Usa la fecha de «La boda»; sin fecha no aparece.',
      datos: 'fecha',
      campos: [titulo('El gran día'), linea('faltan', 'Antes de la cuenta regresiva (Vino & Marfil)', 'Faltan', { max: 40 })],
    },
    llegar: {
      nombre: 'Cómo llegar',
      icono: 'mapa',
      unico: true,
      ayuda: 'La ceremonia y la recepción, cada una con su mapa y los botones de Google Maps, Waze y Apple Maps.',
      datos: 'ceremonia',
      campos: [titulo('Cómo llegar')],
    },
    alojamiento: {
      nombre: 'Dónde quedarse',
      icono: 'cama',
      unico: true,
      ayuda: 'Hoteles cerca, para quienes vienen de lejos. Sin hoteles no aparece.',
      datos: 'alojamiento',
      campos: [titulo('Dónde quedarse')],
    },
    itinerario: {
      nombre: 'Itinerario',
      icono: 'reloj',
      unico: true,
      foto: true,
      ayuda: 'Los momentos del día, unidos por un hilo que se traza al bajar.',
      datos: 'itinerario',
      campos: [titulo('Itinerario')],
    },
    historia: {
      nombre: 'Nuestra historia',
      icono: 'corazon',
      unico: true,
      foto: true,
      ayuda: 'Una carta de los novios, firmada. Sin historia no aparece.',
      datos: 'historia',
      campos: [titulo('Nuestra historia'), linea('firma', 'Firma', FIRMA, { max: 60 })],
    },
    fotos: {
      nombre: 'Fotos de la pareja',
      icono: 'foto',
      unico: true,
      ayuda: 'Las fotos de la pareja que no van junto a otra sección, sueltas sobre la mesa.',
      datos: 'fotos',
      campos: [titulo(`Fotos de ${UNO} y ${DOS}`)],
    },
    vestimenta: {
      nombre: 'Vestimenta',
      icono: 'vestido',
      unico: true,
      ayuda: 'El código de vestimenta como una lámina: Ellos y Ellas con su figura, la paleta sugerida, ejemplos de atuendos vestidos con esa paleta y los colores a evitar. Los colores se cambian con su selector.',
      datos: 'vestimenta',
      campos: [
        titulo('Código de vestimenta'),
        linea('subtitulo', 'Frase debajo del código', 'Queremos que se vean espectaculares y estén cómodos para disfrutar con nosotros.', { max: 200 }),
        parrafos('ellos', 'Ellos: una idea por línea', { defecto: 'Traje oscuro (azul marino, gris marengo o negro)\nCamisa de vestir\nCorbata\nZapatos de vestir\nAccesorios a gusto', max: 600 }),
        parrafos('ellas', 'Ellas: una idea por línea', { defecto: 'Vestido largo, midi o de cóctel elegante\nTacones o sandalias elegantes\nAccesorios a gusto para complementar\nBolso pequeño o de mano', max: 600 }),
        { clave: 'paleta', tipo: 'colores', etiqueta: 'Paleta de colores sugerida', max: 10, ayuda: 'Los atuendos de ejemplo se visten con estos colores.', defecto: [
          { nombre: 'Durazno empolvado', hex: '#e2a38a' }, { nombre: 'Rosa empolvado', hex: '#d98287' },
          { nombre: 'Borgoña', hex: '#8c1c33' }, { nombre: 'Malva', hex: '#8e5867' },
          { nombre: 'Verde salvia', hex: '#a9b48e' }, { nombre: 'Verde oliva', hex: '#56613b' },
          { nombre: 'Terracota', hex: '#b9562f' }, { nombre: 'Azul marino', hex: '#1f3556' },
        ] },
        { clave: 'evitar', tipo: 'colores', etiqueta: 'Colores a evitar', max: 8, defecto: [
          { nombre: 'Blanco', hex: '#ffffff' }, { nombre: 'Champaña', hex: '#efe0cc' },
          { nombre: 'Biscotti', hex: '#e2c6a8' }, { nombre: 'Beige', hex: '#e6cfb5' },
        ] },
        linea('notaEvitar', 'Nota de los colores a evitar (opcional)', '', { max: 160 }),
        { clave: 'ideas', tipo: 'enlace', etiqueta: 'Enlace a ideas (opcional)', ayuda: 'Un tablero de Pinterest, por ejemplo. Empieza por https://' },
        linea('ideasTexto', 'Texto del botón de ideas', 'Ver ideas', { max: 30 }),
      ],
    },
    regalos: {
      nombre: 'Regalos',
      icono: 'regalo',
      unico: true,
      ayuda: 'El mensaje, la cuenta para transferencias (Nequi, Daviplata o banco) y las listas de regalos.',
      datos: 'regalos',
      campos: [
        titulo('Regalos'),
        { clave: 'cuentaVista', tipo: 'opciones', etiqueta: 'Los datos de la cuenta', defecto: 'boton', opciones: { boton: 'Detrás de «Ver datos»', visible: 'A la vista' } },
      ],
    },
    contacto: {
      nombre: 'Dudas',
      icono: 'whatsapp',
      unico: true,
      ayuda: 'Un botón para escribirles por WhatsApp. Aparece cuando config.js tiene el número de contacto.',
      campos: [titulo('Dudas')],
    },
    preguntas: {
      nombre: 'Preguntas frecuentes',
      icono: 'pregunta',
      unico: true,
      ayuda: 'Preguntas que se abren al tocarlas. Sin preguntas no aparece.',
      datos: 'preguntas',
      campos: [titulo('Preguntas frecuentes')],
    },
    responder: {
      nombre: 'Respuesta',
      icono: 'sobre',
      unico: true,
      obligatorio: true,
      foto: true,
      ayuda: 'La tarjeta donde cada invitado confirma, y su tarjeta de mesa. No se puede ocultar: es lo más importante.',
      datos: 'respuesta',
      campos: [linea('titulo', 'Título', {
        tu: 'Esperamos compartir este día contigo',
        usted: 'Esperamos compartir este día con usted',
        varios: 'Esperamos compartir este día con ustedes',
      })],
    },

    // Del tema Vino & Marfil: en los otros temas no se pintan.
    invitacion: {
      nombre: 'Invitación formal',
      icono: 'sobre',
      unico: true,
      tema: 'vino',
      nuevoVisible: true,
      ayuda: 'Una tarjeta con marco de filigrana que sale del sobre: «Junto a nuestras familias…», los nombres de los padres y un verso (opcionales). Solo en el tema Vino & Marfil.',
      campos: [
        linea('encabezado', 'Encabezado', 'Junto a nuestras familias', { max: 80 }),
        linea('texto', 'Invitación', {
          tu: 'tenemos el honor de invitarte a celebrar nuestro matrimonio',
          usted: 'tenemos el honor de invitarle a celebrar nuestro matrimonio',
          varios: 'tenemos el honor de invitarlos a celebrar nuestro matrimonio',
        }, { max: 200 }),
        linea('padresDos', `Padres de ${DOS} (opcional)`, '', { max: 120 }),
        linea('padresUno', `Padres de ${UNO} (opcional)`, '', { max: 120 }),
        parrafos('verso', 'Frase o versículo (opcional)', { max: 400 }),
        linea('versoAutor', 'Autor o cita (opcional)', '', { max: 80 }),
      ],
    },
    polaroids: {
      nombre: 'Polaroids',
      icono: 'fotos',
      unico: true,
      tema: 'vino',
      nuevoVisible: true,
      ayuda: 'Hasta cuatro fotos en blanco y negro, sueltas sobre un fondo oscuro; al tocarlas pasan a color. Sin fotos propias usa las de la pareja. Solo en el tema Vino & Marfil.',
      campos: [
        parrafos('frase', 'Frase', { defecto: 'El amor escribió nuestra historia, y celebraremos juntos su capítulo más hermoso.', max: 300 }),
        { clave: 'fotos', tipo: 'fotos', etiqueta: 'Fotos (opcional)', max: 4 },
      ],
    },
    parallax: {
      nombre: 'Foto con frase',
      icono: 'foto',
      unico: true,
      tema: 'vino',
      nuevoVisible: true,
      ayuda: 'Una foto a todo lo ancho que se mueve suave al bajar, con una frase encima. Sin foto usa una de la pareja. Solo en el tema Vino & Marfil.',
      campos: [
        { clave: 'foto', tipo: 'foto', etiqueta: 'Foto (opcional)' },
        parrafos('frase', 'Frase', { defecto: 'Y aquí comienza nuestro para siempre.', max: 300 }),
        linea('autor', 'Autor (opcional)', '', { max: 80 }),
      ],
    },
    social: {
      nombre: 'Comparte el momento',
      icono: 'corazon',
      unico: true,
      tema: 'vino',
      nuevoVisible: true,
      ayuda: 'El hashtag de la boda, su Instagram y la playlist. Sin ninguno de los tres, los invitados no ven este bloque. Solo en el tema Vino & Marfil.',
      campos: [
        titulo('Comparte el momento'),
        parrafos('texto', 'Texto', { defecto: 'No queremos perdernos nada: compartan sus fotos y videos con nuestro hashtag.', max: 400 }),
        linea('hashtag', 'Hashtag (opcional)', '', { max: 60 }),
        { clave: 'instagram', tipo: 'enlace', etiqueta: 'Instagram (opcional)', ayuda: 'El enlace al perfil, https://instagram.com/…' },
        { clave: 'playlist', tipo: 'enlace', etiqueta: 'Playlist (opcional)', ayuda: 'Una playlist colaborativa de Spotify o de YouTube Music.' },
        linea('playlistTexto', 'Texto de la playlist', '¿Qué canción no puede faltar?', { max: 80 }),
      ],
    },

    // Bloques libres: los que se agregan.
    texto: {
      nombre: 'Texto',
      icono: 'texto',
      libre: true,
      ayuda: 'Un título y párrafos: una dedicatoria, un aviso, unas palabras.',
      campos: [
        linea('titulo', 'Título (opcional)'),
        parrafos('cuerpo', 'Texto', { ayuda: 'Una línea en blanco separa los párrafos.' }),
        { clave: 'alinear', tipo: 'opciones', etiqueta: 'Alineación', defecto: 'centro', opciones: { centro: 'Centrado', izquierda: 'A la izquierda' } },
        { clave: 'caja', tipo: 'opciones', etiqueta: 'Va', defecto: 'tarjeta', opciones: { tarjeta: 'En una tarjeta', suelto: 'Sobre el fondo' } },
      ],
    },
    foto: {
      nombre: 'Foto',
      icono: 'foto',
      libre: true,
      ayuda: 'Una foto, con un pie si quieres. Los invitados la pueden ver en grande.',
      campos: [
        { clave: 'foto', tipo: 'foto', etiqueta: 'Foto' },
        linea('pie', 'Pie de foto (opcional)'),
        { clave: 'tamano', tipo: 'opciones', etiqueta: 'Tamaño', defecto: 'mediana', opciones: { mediana: 'Mediana', grande: 'A todo el ancho' } },
      ],
    },
    galeria: {
      nombre: 'Galería',
      icono: 'fotos',
      libre: true,
      ayuda: 'Varias fotos juntas, hasta 12.',
      campos: [linea('titulo', 'Título (opcional)'), { clave: 'fotos', tipo: 'fotos', etiqueta: 'Fotos', max: 12 }],
    },
    cita: {
      nombre: 'Cita',
      icono: 'cita',
      libre: true,
      ayuda: 'Una frase, un verso o una lectura, con su autor.',
      campos: [parrafos('texto', 'Cita', { max: 600 }), linea('autor', 'Autor (opcional)', '', { max: 80 })],
    },
    boton: {
      nombre: 'Botón',
      icono: 'enlace',
      libre: true,
      ayuda: 'Un enlace a otra página: un álbum, una transmisión, un formulario.',
      campos: [
        linea('titulo', 'Título (opcional)'),
        parrafos('texto', 'Texto (opcional)', { max: 600 }),
        linea('etiqueta', 'Texto del botón', 'Ver más', { max: 40 }),
        { clave: 'enlace', tipo: 'enlace', etiqueta: 'Enlace', ayuda: 'Empieza por https://' },
      ],
    },
    separador: {
      nombre: 'Separador',
      icono: 'flor',
      libre: true,
      ayuda: 'Una lámina de rosas o lirios, o una línea fina, para separar partes.',
      campos: [{ clave: 'adorno', tipo: 'flor', etiqueta: 'Adorno', defecto: 'rosa-alba-regalis' }],
    },
    cuenta: {
      nombre: 'Cuenta regresiva',
      icono: 'reloj',
      libre: true,
      ayuda: 'Los días, horas y minutos que faltan para la ceremonia. Usa la fecha y la hora de «La boda».',
      datos: 'fecha',
      campos: [titulo('Falta poco')],
    },
    video: {
      nombre: 'Video',
      icono: 'video',
      libre: true,
      ayuda: 'Un video de YouTube o de Vimeo.',
      campos: [
        linea('titulo', 'Título (opcional)'),
        { clave: 'enlace', tipo: 'enlace', etiqueta: 'Enlace del video', ayuda: 'El enlace de YouTube o de Vimeo, por ejemplo https://youtu.be/…' },
        linea('pie', 'Pie (opcional)'),
      ],
    },
  };

  const LIBRES = Object.keys(TIPOS).filter((t) => TIPOS[t].libre);
  const UNICOS = Object.keys(TIPOS).filter((t) => TIPOS[t].unico);

  // El orden de siempre de las secciones.
  const ORDEN = ['album', 'invitacion', 'detalles', 'calendario', 'polaroids', 'llegar', 'alojamiento', 'itinerario', 'parallax', 'historia', 'fotos', 'vestimenta', 'regalos', 'social', 'contacto', 'preguntas', 'responder'];

  // Cuánto se mueve la invitación: todo, lo suave (sin lo que se repite sin
  // fin) o nada (como con «reducir movimiento»).
  const ANIMACIONES = { completas: 'Completas', suaves: 'Suaves', ninguna: 'Ninguna' };

  // ---------- Normalizar ----------

  function texto(v, max) {
    const s = v == null ? '' : String(v).trim();
    return s ? s.slice(0, max) : null;
  }

  function enlace(v) {
    const s = String(v || '').trim();
    return /^https:\/\/\S+$/.test(s) ? s.slice(0, 600) : null;
  }

  // Igual que en datos.js: un enlace https, local:<id> o una ruta del sitio.
  function refFoto(v) {
    const s = String(v || '').trim();
    if (/^https:\/\/\S+$/.test(s) && s.length <= 600) return s;
    if (/^local:[a-z0-9-]{6,48}$/i.test(s)) return s;
    if (/^[\w-]+(\/[\w.-]+)*\.(jpe?g|png|webp|avif|gif)$/i.test(s) && !s.includes('..')) return s;
    return null;
  }

  function foto(f) {
    const x = typeof f === 'string' ? { url: f } : (f || {});
    const url = refFoto(x.url);
    return url ? { url, forma: x.forma === 'horizontal' ? 'horizontal' : 'vertical' } : null;
  }

  // Una lista de colores con nombre: [{ nombre, hex }]. null = los de siempre.
  // Acepta también el formato de texto de antes («Verde salvia #9caf88»).
  function listaColores(v, max = 10) {
    if (v == null) return null;
    const lista = Array.isArray(v) ? v : String(v).split('\n').map((l) => {
      const m = /^(.*?)[\s,;:–-]*(#[0-9a-f]{6})?\s*$/i.exec(l.trim());
      return m && (m[1] || m[2]) ? { nombre: m[1], hex: m[2] } : null;
    });
    return lista.filter(Boolean).map((x) => ({
      nombre: texto(x.nombre, 30) || '',
      hex: HEX.test(String(x.hex || '').toLowerCase()) ? String(x.hex).toLowerCase() : '#cccccc',
    })).slice(0, max);
  }

  // Los colores de un bloque: los elegidos o los de siempre.
  function coloresDe(bloque, clave) {
    const c = campo(bloque.tipo, clave);
    return bloque[clave] == null ? (c ? c.defecto : []) : bloque[clave];
  }

  function nuevoId() {
    const bytes = new Uint8Array(8);
    crypto.getRandomValues(bytes);
    return 'b' + Array.from(bytes, (b) => (b % 36).toString(36)).join('');
  }

  // Los valores de un bloque, campo por campo. Lo vacío queda en null.
  function campos(tipo, x) {
    const r = {};
    TIPOS[tipo].campos.forEach((c) => {
      const v = x[c.clave];
      if (c.tipo === 'linea' || c.tipo === 'parrafos') {
        r[c.clave] = texto(v, c.max);
        if (c.defecto && typeof c.defecto === 'object') r[`${c.clave}Varios`] = texto(x[`${c.clave}Varios`], c.max);
      } else if (c.tipo === 'enlace') r[c.clave] = enlace(v);
      else if (c.tipo === 'foto') r[c.clave] = foto(v);
      else if (c.tipo === 'fotos') r[c.clave] = (Array.isArray(v) ? v : []).map(foto).filter(Boolean).slice(0, c.max);
      else if (c.tipo === 'opciones') r[c.clave] = Object.prototype.hasOwnProperty.call(c.opciones, v) ? v : c.defecto;
      else if (c.tipo === 'flor') r[c.clave] = v === 'linea' || FLORES[v] ? v : c.defecto;
      else if (c.tipo === 'colores') r[c.clave] = listaColores(v, c.max);
    });
    return r;
  }

  function normalizarBloque(x) {
    if (!x || !TIPOS[x.tipo] || TIPOS[x.tipo].fijo) return null;
    const id = ID.test(String(x.id || '')) ? String(x.id) : nuevoId();
    const b = Object.assign({ id, tipo: x.tipo }, campos(x.tipo, x));
    if (x.oculto === true && !TIPOS[x.tipo].obligatorio) b.oculto = true;
    return b;
  }

  function color(v, base) {
    const s = String(v || '').trim().toLowerCase();
    return HEX.test(s) ? s : base;
  }

  function normalizarFondo(f) {
    const x = f || {};
    const tipo = ['color', 'degradado', 'imagen'].includes(x.tipo) ? x.tipo : 'tema';
    const r = {
      tipo,
      color: color(x.color, '#f6f2e7'),
      color2: color(x.color2, '#e9d5c8'),
      direccion: DIRECCIONES[x.direccion] ? x.direccion : 'abajo',
      imagen: foto(x.imagen),
      velo: Math.min(90, Math.max(0, Math.round(Number(x.velo)))) || 0,
    };
    if (x.velo == null || x.velo === '') r.velo = 60;
    if (r.tipo === 'imagen' && !r.imagen) r.tipo = 'tema';
    return r;
  }

  // La música de fondo: un mp3 del sitio (media/…) o un enlace https. Suena
  // solo cuando el invitado abre el sobre, y siempre se puede pausar.
  function normalizarMusica(m) {
    const x = m || {};
    const s = String(x.archivo || '').trim();
    const archivo = (/^https:\/\/\S+$/.test(s) || (/^[\w-]+(\/[\w.-]+)*\.(mp3|m4a|aac|ogg|oga|wav)$/i.test(s) && !s.includes('..'))) ? s.slice(0, 600) : null;
    const volumen = Math.min(1, Math.max(0.05, Number(x.volumen) || 0.4));
    return { archivo, volumen: Math.round(volumen * 100) / 100, activa: x.activa !== false };
  }

  function normalizar(p) {
    const x = p || {};
    const vistos = new Set();
    let bloques = (Array.isArray(x.bloques) ? x.bloques : [])
      .map(normalizarBloque)
      .filter((b) => {
        if (!b) return false;
        const clave = TIPOS[b.tipo].unico ? `tipo:${b.tipo}` : `id:${b.id}`;
        if (vistos.has(clave) || vistos.has(`id:${b.id}`)) return false;
        vistos.add(clave);
        vistos.add(`id:${b.id}`);
        return true;
      })
      .slice(0, MAX_BLOQUES);
    // Una sección que falta vuelve (oculta si no es obligatoria), cerca de donde va siempre.
    if (Array.isArray(x.bloques)) {
      ORDEN.forEach((tipo, i) => {
        if (bloques.some((b) => b.tipo === tipo)) return;
        const despues = ORDEN.slice(0, i).reverse().map((t) => bloques.findIndex((b) => b.tipo === t)).find((k) => k >= 0);
        const nuevo = normalizarBloque({ tipo, id: tipo, oculto: !TIPOS[tipo].obligatorio && !TIPOS[tipo].nuevoVisible });
        bloques.splice(despues == null ? 0 : despues + 1, 0, nuevo);
      });
    } else {
      bloques = ORDEN.map((tipo) => normalizarBloque({ tipo, id: tipo }));
    }
    return {
      tema: TEMAS[x.tema] ? x.tema : 'vino',
      trato: x.trato === 'usted' ? 'usted' : 'tu',
      animacion: ANIMACIONES[x.animacion] ? x.animacion : 'completas',
      musica: normalizarMusica(x.musica),
      fondo: normalizarFondo(x.fondo),
      portada: campos('portada', x.portada || {}),
      cierre: campos('cierre', x.cierre || {}),
      bloques,
    };
  }

  function nuevoBloque(tipo) {
    return normalizarBloque({ tipo, id: nuevoId() });
  }

  function duplicar(b) {
    return normalizarBloque(Object.assign(JSON.parse(JSON.stringify(b)), { id: nuevoId(), oculto: false }));
  }

  // ---------- Leer ----------

  function campo(tipo, clave) {
    return TIPOS[tipo].campos.find((c) => c.clave === clave);
  }

  // El texto de un campo: el escrito o el de siempre, según el trato y si la
  // invitación es para varias personas.
  function textoDe(pagina, bloque, clave, { varios = false } = {}) {
    const c = campo(bloque.tipo || bloque, clave);
    const valores = typeof bloque === 'string' ? pagina[bloque] : bloque;
    if (!c) return '';
    const d = c.defecto;
    if (d && typeof d === 'object') {
      if (varios) return (valores && valores[`${clave}Varios`]) || d.varios;
      return (valores && valores[clave]) || (pagina.trato === 'usted' ? d.usted : d.tu);
    }
    return (valores && valores[clave]) || d || '';
  }

  // Las fotos que usa una página (para no borrar las que siguen en uso).
  function fotosDe(pagina) {
    const refs = new Set();
    if (pagina.fondo && pagina.fondo.imagen) refs.add(pagina.fondo.imagen.url);
    ['portada', 'cierre'].forEach((k) => {
      TIPOS[k].campos.forEach((c) => { if (c.tipo === 'foto' && pagina[k] && pagina[k][c.clave]) refs.add(pagina[k][c.clave].url); });
    });
    pagina.bloques.forEach((b) => {
      TIPOS[b.tipo].campos.forEach((c) => {
        if (c.tipo === 'foto' && b[c.clave]) refs.add(b[c.clave].url);
        if (c.tipo === 'fotos') (b[c.clave] || []).forEach((f) => refs.add(f.url));
      });
    });
    return refs;
  }

  // Un video de YouTube o de Vimeo, para ponerlo en un iframe.
  function videoEmbebido(url) {
    const s = String(url || '');
    let m = /^https:\/\/(?:www\.|m\.)?(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([\w-]{11})/.exec(s);
    if (m) return `https://www.youtube-nocookie.com/embed/${m[1]}`;
    m = /^https:\/\/(?:www\.|player\.)?vimeo\.com\/(?:video\/)?(\d{6,12})/.exec(s);
    if (m) return `https://player.vimeo.com/video/${m[1]}?dnt=1`;
    return null;
  }

  // Claro u oscuro: decide la tinta que va sobre un fondo propio.
  function claro(hex) {
    const n = parseInt(String(hex).slice(1), 16);
    const lin = (v) => {
      const c = v / 255;
      return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    };
    const l = 0.2126 * lin((n >> 16) & 255) + 0.7152 * lin((n >> 8) & 255) + 0.0722 * lin(n & 255);
    return l > 0.4;
  }

  window.Pagina = {
    TEMAS,
    TIPOS,
    LIBRES,
    UNICOS,
    ORDEN,
    ANIMACIONES,
    FLORES,
    DIRECCIONES,
    normalizar,
    normalizarBloque,
    nuevoBloque,
    duplicar,
    nuevoId,
    campo,
    texto: textoDe,
    colores: coloresDe,
    fotosDe,
    videoEmbebido,
    claro,
  };
})();
