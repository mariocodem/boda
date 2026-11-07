/*
 * Los bloques de la invitación: el HTML de cada uno. Lo usa
 * assets/invitacion.js, que pinta los bloques visibles de la página en orden
 * (ver assets/pagina.js) y después llena los datos de la boda en los
 * elementos con data-*.
 *
 * Los dos temas usan el mismo HTML; el tema Editorial lo viste distinto
 * (invitacion.css, html[data-tema='editorial']) y le suma las láminas de
 * flores.
 */
(function () {
  const P = window.Papeleria;
  const Pg = window.Pagina;
  const esc = P.escapar;

  // Las cifras van en la letra de las cifras: en la romana grabada el «1» se lee como «I».
  const cifras = (t) => esc(t).replace(/\d+/g, '<span class="cifra">$&</span>');

  // Párrafos separados por una línea en blanco; dentro, cada salto se respeta.
  function parrafos(t) {
    return String(t || '').split(/\n\s*\n/).map((x) => x.trim()).filter(Boolean)
      .map((x) => `<p>${cifras(x).replace(/\n/g, '<br>')}</p>`).join('');
  }

  const marca = (texto) => `<p class="tarjeta-marca">${texto} · N.º <span class="cifra" data-numero>···</span></p>`;

  // Lo que comparte todo bloque: con qué se reconoce en el editor.
  const de = (b, id) => `id="${id}" data-bloque="${esc(b.id)}" data-tipo="${b.tipo}"`;

  // Un bloque libre todavía vacío: en el panel y en modo local se ve el aviso;
  // los invitados no lo ven.
  const vacio = (b, que) => `<p class="seccion-pendiente"><b>${esc(Pg.TIPOS[b.tipo].nombre)}: ${que}</b><span>Se llena en el panel: Diseño. Mientras esté vacío, los invitados no ven este bloque.</span></p>`;

  // Una lámina de Redouté apoyada en el borde del bloque (solo en el tema Editorial).
  function lamina(x, flor, lado) {
    if (x.pagina.tema !== 'editorial') return '';
    return `<img class="lamina lamina-${lado}" src="assets/flores/${flor}-600.webp" srcset="assets/flores/${flor}-600.webp 600w, assets/flores/${flor}.webp 1200w" sizes="(min-width: 900px) 360px, 46vw" alt="" aria-hidden="true" loading="lazy" decoding="async">`;
  }

  const titulo = (x, b, clave = 'titulo') => cifras(Pg.texto(x.pagina, b, clave));

  // ---------- Del tema Vino & Marfil ----------

  const C = window.BODA || { pareja: { uno: { nombre: 'Diego' }, dos: { nombre: 'Erika' } } };
  const vino = (x) => x.pagina.tema === 'vino';
  const nombresMano = () => `<span>${esc(C.pareja.uno.nombre)}</span> <i>&amp;</i> <span>${esc(C.pareja.dos.nombre)}</span>`;
  const lineas = (t) => String(t || '').split('\n').map((l) => l.trim().replace(/^[-•·*]\s*/, '')).filter(Boolean).slice(0, 12);

  // Figuras para la vestimenta (dibujo propio): un traje y un vestido que se
  // visten con los colores de la paleta. hex ya viene validado (#rrggbb).
  const PIEL = '#e6bd9c';
  const PIEL_SOMBRA = '#d4a27f';
  function figuraEl(traje, x = 0) {
    return `<g transform="translate(${x} 0)">
      <ellipse cx="50" cy="252" rx="24" ry="3.5" fill="rgba(0,0,0,.14)"/>
      <path d="M37 136 L34 246 L46.5 246 L50 158 L53.5 246 L66 246 L63 136 Z" fill="${traje}"/>
      <path d="M50 158 L53.5 246 L66 246 L63 136 L50 136 Z" fill="rgba(0,0,0,.16)"/>
      <path d="M31.5 244.5h15v5.5H28.5c0-2.7 1.2-4.6 3-5.5zM53.5 244.5h15c1.8.9 3 2.8 3 5.5h-18z" fill="#1c1b1d"/>
      <path d="M31 62 C35 56.5 42.5 54.5 50 54.5 C57.5 54.5 65 56.5 69 62 L72.5 104 L67 140 L33 140 L27.5 104 Z" fill="${traje}"/>
      <path d="M30.5 63 C24.5 71 22.5 93 23.5 119 L30.5 119 C30.5 99 32.5 83 35.5 71 Z" fill="${traje}"/>
      <path d="M69.5 63 C75.5 71 77.5 93 76.5 119 L69.5 119 C69.5 99 67.5 83 64.5 71 Z" fill="${traje}"/>
      <path d="M69.5 63 C75.5 71 77.5 93 76.5 119 L72 119 C72 99 70 83 66 70 Z" fill="rgba(0,0,0,.16)"/>
      <path d="M43.5 56 L50 85 L56.5 56 Z" fill="#f6f3ee"/>
      <path d="M48.6 60 L51.4 60 L53 83 L50 89 L47 83 Z" fill="#26252b"/>
      <path d="M43.5 56 L50 85 L39.5 70 Z" fill="rgba(0,0,0,.2)"/>
      <path d="M56.5 56 L50 85 L60.5 70 Z" fill="rgba(0,0,0,.2)"/>
      <path d="M58.5 73 l5 -1.5 l.6 3 z" fill="#f6f3ee"/>
      <ellipse cx="27" cy="122" rx="3.6" ry="4.6" fill="${PIEL}"/>
      <ellipse cx="73" cy="122" rx="3.6" ry="4.6" fill="${PIEL}"/>
      <path d="M45 43 h10 v13 h-10z" fill="${PIEL_SOMBRA}"/>
      <ellipse cx="50" cy="32" rx="10.5" ry="13" fill="${PIEL}"/>
      <path d="M39.5 31 C38.5 18 45 13.5 51 13.5 C58.5 13.5 62.5 19.5 60.5 30 C59.5 24.5 56 21.5 50.5 22 C45.5 22 41.5 25 39.5 31 Z" fill="#2a2120"/>
    </g>`;
  }
  function figuraElla(vestido, x = 0) {
    return `<g transform="translate(${x} 0)">
      <ellipse cx="50" cy="252" rx="26" ry="3.5" fill="rgba(0,0,0,.14)"/>
      <path d="M38.5 27 C36 48 34.5 66 38.5 80 L61.5 80 C65.5 66 64 48 61.5 27 Z" fill="#4a3022"/>
      <path d="M36.5 63 C31.5 76 30.5 96 32.5 121 L36.5 121 C36.5 101 38.5 85 40.5 71 Z" fill="${PIEL}"/>
      <path d="M63.5 63 C68.5 76 69.5 96 67.5 121 L63.5 121 C63.5 101 61.5 85 59.5 71 Z" fill="${PIEL}"/>
      <path d="M46 44 h8 v12 h-8z" fill="${PIEL_SOMBRA}"/>
      <path d="M37 64 C39 57.5 44.5 55.5 50 55.5 C55.5 55.5 61 57.5 63 64 Z" fill="${PIEL}"/>
      <path d="M38 64 L45 61.5 L50 82 L55 61.5 L62 64 L60 99 C64.5 140 70.5 190 75 246 L25 246 C29.5 190 35.5 140 40 99 Z" fill="${vestido}"/>
      <path d="M40 98 C46 101 54 101 60 98 L60.4 103 C54 106 46 106 39.6 103 Z" fill="rgba(0,0,0,.18)"/>
      <path d="M55 150 L61 246 L53.5 246 Z" fill="rgba(0,0,0,.2)"/>
      <path d="M46 120 C44 160 40 200 36 246 M51 118 C51 160 49 205 47 246" stroke="rgba(0,0,0,.12)" stroke-width="1.3" fill="none"/>
      <path d="M29 128 h8 v6 h-8z" fill="#cdb38a"/>
      <ellipse cx="34.5" cy="124" rx="3.3" ry="4.2" fill="${PIEL}"/>
      <ellipse cx="65.5" cy="124" rx="3.3" ry="4.2" fill="${PIEL}"/>
      <ellipse cx="50" cy="32" rx="10" ry="12.5" fill="${PIEL}"/>
      <path d="M39.5 33 C38.5 19 45 14 51 14 C58 14 62 19.5 61 33 C58.5 25 54 21.5 48.5 22.5 C45 23.5 42 27.5 39.5 33 Z" fill="#4a3022"/>
      <path d="M41 46 l2 2 M58 46 l-2 2" stroke="#cdb38a" stroke-width="1.2"/>
    </g>`;
  }
  const figura = (contenido, ancho) => `<svg class="figura" viewBox="0 0 ${ancho} 258" aria-hidden="true" focusable="false">${contenido}</svg>`;
  const TRAJES = ['#1f2a44', '#2e2f33', '#1f2a44', '#57595e'];
  // Qué color de la paleta lleva cada vestido de los ejemplos (como en la lámina).
  const VESTIDOS = [3, 5, 6, 1];

  function vestimentaExtra(b, x) {
    const items = (clave) => lineas(Pg.texto(x.pagina, b, clave));
    const ellos = items('ellos');
    const ellas = items('ellas');
    const paleta = Pg.colores(b, 'paleta');
    const evitar = Pg.colores(b, 'evitar');
    const color = (k) => (paleta.length ? paleta[k % paleta.length].hex : '#56613b');
    const punto = (c, tachado) => `<li${tachado ? ' class="color-tachado"' : ''}><span class="color-punto" style="--c: ${c.hex}"></span><span class="color-nombre">${esc(c.nombre)}</span></li>`;
    const lista = (quien, titulo, cosas) => `<div class="vestimenta-col vestimenta-${quien}"><h3 class="vestimenta-rotulo">${titulo}</h3>${cosas.length ? `<ul>${cosas.map((i) => `<li>${cifras(i)}</li>`).join('')}</ul>` : ''}</div>`;
    const principal = color(paleta.length > 5 ? 5 : paleta.length - 1);
    return `${b.subtitulo || Pg.campo('vestimenta', 'subtitulo') ? `<p class="vestimenta-sub">${cifras(Pg.texto(x.pagina, b, 'subtitulo'))}</p>` : ''}
      <div class="vestimenta-figuras">
        ${lista('ellos', 'Ellos', ellos)}
        <div class="vestimenta-pareja">${figura(figuraEl(TRAJES[0]), 100)}${figura(figuraElla(principal), 100)}</div>
        ${lista('ellas', 'Ellas', ellas)}
      </div>
      ${paleta.length ? `<div class="vestimenta-colores"><h3 class="rotulo-filetes">Paleta de colores sugerida</h3><ul class="colores">${paleta.map((c) => punto(c)).join('')}</ul></div>` : ''}
      ${paleta.length ? `<div class="vestimenta-ejemplos"><h3 class="rotulo-filetes">Ejemplos de atuendos</h3><ul class="atuendos">${VESTIDOS.map((k, i) => `<li>${figura(figuraElla(color(k), 0) + figuraEl(TRAJES[i], 52), 152)}</li>`).join('')}</ul></div>` : ''}
      ${evitar.length ? `<div class="vestimenta-colores vestimenta-evitar"><h3 class="rotulo-filetes">Colores a evitar</h3><ul class="colores">${evitar.map((c) => punto(c, true)).join('')}</ul>${b.notaEvitar ? `<p class="vestimenta-nota-evitar">${cifras(b.notaEvitar)}</p>` : ''}</div>` : ''}
      ${b.ideas ? `<p class="vestimenta-ideas"><a class="boton-pildora" href="${esc(b.ideas)}" target="_blank" rel="noopener">${esc(Pg.texto(x.pagina, b, 'ideasTexto'))}${P.icono('externo')}</a></p>` : ''}`;
  }

  const VINO = {
    invitacion(b, x) {
      const padres = [b.padresDos, b.padresUno].filter(Boolean);
      return `<section class="pliego pliego-formal" ${de(b, 'invitacion-formal')} aria-labelledby="formal-titulo">
          <div class="formal-sobre" data-formal-sobre>
          <span class="formal-sobre-fondo" aria-hidden="true"></span>
          <article class="tarjeta tarjeta-filigrana tarjeta-formal">
            <span class="filigrana" aria-hidden="true"></span>
            <span class="formal-lacre" aria-hidden="true">${esc(C.pareja.uno.nombre[0])}${esc(C.pareja.dos.nombre[0])}</span>
            <p class="formal-encabezado">${titulo(x, b, 'encabezado')}</p>
            <h2 class="formal-nombres" id="formal-titulo">${nombresMano()}</h2>
            <p class="formal-texto" data-texto-formal>${cifras(Pg.texto(x.pagina, b, 'texto'))}</p>
            <p class="formal-fecha" data-fecha-formal hidden></p>
            ${padres.length ? `<div class="formal-padres"><p class="formal-rotulo">Nuestros padres</p>${padres.map((n) => `<p>${cifras(n)}</p>`).join('')}</div>` : ''}
            ${b.verso ? `<blockquote class="formal-verso">${parrafos(b.verso)}${b.versoAutor ? `<footer>${cifras(b.versoAutor)}</footer>` : ''}</blockquote>` : ''}
          </article>
          <span class="formal-bolsillo" aria-hidden="true"></span>
          </div>
        </section>`;
    },

    polaroids: (b, x) => `<section class="pliego-polaroids" ${de(b, 'polaroids')} aria-label="Fotos de ${esc(C.pareja.uno.nombre)} y ${esc(C.pareja.dos.nombre)}" hidden>
        <div class="polaroids" data-polaroids="${esc(JSON.stringify(b.fotos))}"></div>
        <p class="polaroids-frase">${cifras(Pg.texto(x.pagina, b, 'frase'))}</p>
      </section>`,

    parallax: (b, x) => `<section class="parallax" ${de(b, 'parallax')} hidden>
        <div class="parallax-foto" data-parallax="${esc(b.foto ? b.foto.url : '')}" aria-hidden="true"></div>
        <blockquote class="parallax-frase">${parrafos(Pg.texto(x.pagina, b, 'frase'))}${b.autor ? `<footer>${cifras(b.autor)}</footer>` : ''}</blockquote>
      </section>`,

    social(b, x) {
      const hay = b.hashtag || b.instagram || b.playlist;
      if (!hay && !x.verVacios) return '';
      const tag = b.hashtag ? `#${b.hashtag.replace(/^#+/, '').replace(/\s+/g, '')}` : '';
      return `<section class="pliego pliego-social" ${de(b, 'social')} aria-labelledby="social-titulo">
          <div class="pliego-texto">
            <h2 class="pliego-titulo" id="social-titulo">${titulo(x, b)}</h2>
            <article class="tarjeta tarjeta-social">
              ${P.icono('camara', 'social-icono')}
              <div class="libre-texto">${parrafos(Pg.texto(x.pagina, b, 'texto'))}</div>
              ${tag ? `<p class="social-hashtag"><span class="hashtag">${esc(tag)}</span><button class="enlace-accion" type="button" data-copiar="${esc(tag)}" data-copiado="Hashtag copiado">${P.icono('copiar')}<span>Copiar</span></button></p>` : ''}
              ${b.instagram ? `<p class="libre-accion"><a class="boton-pildora" href="${esc(b.instagram)}" target="_blank" rel="noopener">${P.icono('instagram')}<span>Síguenos en Instagram</span></a></p>` : ''}
              ${b.playlist ? `<div class="social-playlist">${P.icono('musica', 'social-icono')}<p>${cifras(Pg.texto(x.pagina, b, 'playlistTexto'))}</p><a class="boton-pildora" href="${esc(b.playlist)}" target="_blank" rel="noopener">Agregar canciones${P.icono('externo')}</a></div>` : ''}
              ${hay ? '' : vacio(b, 'falta el hashtag, el Instagram o la playlist')}
            </article>
          </div>
        </section>`;
    },
  };

  // ---------- Las secciones con datos de la boda ----------

  // Las rosas pintadas en las esquinas de la página del álbum (tema Victoriano),
  // como en los álbumes cromolitografiados de la época.
  function floresAlbum(x) {
    if (x.pagina.tema !== 'victoriano') return '';
    const flor = (nombre, lado) => `<img class="album-flor album-flor-${lado}" src="assets/flores/${nombre}-600.webp" srcset="assets/flores/${nombre}-600.webp 600w, assets/flores/${nombre}.webp 1200w" sizes="(min-width: 900px) 260px, 34vw" alt="" aria-hidden="true" loading="lazy" decoding="async">`;
    return flor('rosa-alba-regalis', 'izq') + flor('rosa-damascena-subalba', 'der');
  }

  const SECCIONES = {
    // El álbum: las fotos de la pareja justo después de la tarjeta. La primera,
    // grande en el centro; las otras dos, más chicas a los lados. La invitación
    // lo muestra cuando hay fotos (invitacion.js, llenarFotos).
    album: (b, x) => `<section class="album" ${de(b, 'album')} aria-labelledby="album-titulo" hidden>
        <div class="album-encabezado">
          <p class="album-frase">${titulo(x, b, 'frase')}</p>
          <h2 class="album-titulo" id="album-titulo">${esc(Pg.texto(x.pagina, b, 'titulo')).replace(/&amp;/g, '<i>&amp;</i>')}</h2>
          <p class="album-fecha" data-fecha-album hidden></p>
        </div>
        <div class="album-pagina">
          ${floresAlbum(x)}
          <div class="album-ventana album-principal" data-foto-album="0"></div>
          <div class="album-ventana album-secundaria" data-foto-album="1"></div>
          <div class="album-ventana album-secundaria" data-foto-album="2"></div>
        </div>
        ${x.verVacios ? `<p class="seccion-pendiente" data-album-vacio hidden><b>Álbum de fotos: faltan las fotos</b><span>Se suben en el panel: La boda → Fotos de la pareja. Las tres primeras van aquí; mientras no haya, los invitados no ven el álbum.</span></p>` : ''}
      </section>`,

    // El calendario del mes de la boda, con el día encerrado a mano.
    calendario: (b, x) => `<section class="pliego pliego-calendario" ${de(b, 'calendario')} aria-labelledby="calendario-titulo" hidden>
        <div class="pliego-texto">
          <h2 class="pliego-titulo" id="calendario-titulo">${titulo(x, b)}</h2>
          <article class="tarjeta tarjeta-calendario">
            ${vino(x) ? '<p class="tira-fecha" data-tira-fecha hidden></p>' : ''}
            <div class="calendario" data-calendario-mes></div>
            ${vino(x) ? `<div class="cuenta-vino"><p class="cuenta-faltan">${titulo(x, b, 'faltan')}</p><div class="cuenta-regresiva" data-cuenta-regresiva></div></div>
            <p class="calendario-acciones" data-calendario-acciones hidden></p>` : ''}
            ${marca(titulo(x, b))}
          </article>
        </div>
      </section>`,

    detalles: (b, x) => `<section class="pliego pliego-detalles" ${de(b, 'cuando')} aria-labelledby="cuando-titulo">
        ${lamina(x, 'rosa-alba-regalis', 'arriba')}
        <div class="pliego-texto">
          <h2 class="pliego-titulo" id="cuando-titulo">${titulo(x, b)}</h2>
          <div class="capitulos">
            <article class="tarjeta capitulo">
              <h3 class="capitulo-titulo">${titulo(x, b, 'dia')}</h3>
              <p class="capitulo-dato" data-fecha-larga>Fecha por confirmar</p>
              <p class="capitulo-nota" data-cuenta hidden></p>
            </article>
            <article class="tarjeta capitulo">
              <h3 class="capitulo-titulo">${titulo(x, b, 'ceremonia')}</h3>
              <p class="capitulo-dato capitulo-hora" data-hora-ceremonia>Hora por confirmar</p>
              <p class="capitulo-nota" data-recepcion-nota hidden></p>
            </article>
            <article class="tarjeta capitulo">
              <h3 class="capitulo-titulo">${titulo(x, b, 'lugar')}</h3>
              <p class="capitulo-dato capitulo-lugar" data-lugar-ceremonia>Lugar por confirmar</p>
              <p class="capitulo-nota" data-direccion-ceremonia hidden></p>
              ${x.visible('llegar') ? `<a class="enlace-accion" href="#llegar">${titulo(x, b, 'enlace')}</a>` : ''}
            </article>
          </div>
        </div>
        <div class="pliego-foto" data-foto-pliego="detalles" hidden></div>
      </section>`,

    llegar: (b, x) => `<section class="pliego pliego-llegar" ${de(b, 'llegar')} aria-labelledby="llegar-titulo">
        <div class="pliego-texto">
          <h2 class="pliego-titulo" id="llegar-titulo">${titulo(x, b)}</h2>
          <article class="tarjeta tarjeta-llegar">
            <div class="sitios" data-sitios></div>
            <p class="llegar-calendario" data-calendario hidden></p>
            ${marca(titulo(x, b))}
          </article>
        </div>
      </section>`,

    alojamiento: (b, x) => `<section class="pliego pliego-alojamiento" ${de(b, 'alojamiento')} aria-labelledby="alojamiento-titulo" hidden>
        <div class="pliego-texto">
          <h2 class="pliego-titulo" id="alojamiento-titulo">${titulo(x, b)}</h2>
          <article class="tarjeta tarjeta-alojamiento">
            <p class="alojamiento-nota" data-alojamiento-nota hidden></p>
            <ul class="hoteles" data-hoteles></ul>
            ${marca('Alojamiento')}
          </article>
        </div>
      </section>`,

    itinerario: (b, x) => `<section class="pliego pliego-programa" ${de(b, 'itinerario')} aria-labelledby="itinerario-titulo">
        ${lamina(x, 'lilium-candidum', 'lado')}
        <div class="pliego-texto">
          <h2 class="pliego-titulo" id="itinerario-titulo">${titulo(x, b)}</h2>
          <article class="tarjeta tarjeta-programa">
            <div class="dia">
              <span class="dia-hilo" aria-hidden="true"></span>
              <ol class="dia-lista" data-itinerario></ol>
            </div>
            ${marca(titulo(x, b))}
          </article>
        </div>
        <div class="pliego-foto" data-foto-pliego="itinerario" hidden></div>
      </section>`,

    historia: (b, x) => `<section class="pliego pliego-historia" ${de(b, 'historia')} aria-labelledby="historia-titulo" hidden>
        <div class="pliego-texto">
          <h2 class="pliego-titulo" id="historia-titulo">${titulo(x, b)}</h2>
          <article class="tarjeta tarjeta-historia">
            <div class="historia-texto" data-historia></div>
            <p class="historia-firma">${esc(Pg.texto(x.pagina, b, 'firma')).replace(/&amp;/g, '<i>&amp;</i>')}</p>
            ${marca(titulo(x, b))}
          </article>
        </div>
        <div class="pliego-foto" data-foto-pliego="historia" hidden></div>
      </section>`,

    // En Pliegos las fotos van sueltas sobre la mesa, sin título a la vista.
    fotos: (b, x) => `<section class="pliego pliego-momentos" ${de(b, 'fotos')} aria-labelledby="fotos-titulo" hidden>
        <h2 class="${x.pagina.tema === 'editorial' ? 'pliego-titulo' : 'solo-lectores'}" id="fotos-titulo">${titulo(x, b)}</h2>
        <div class="fotos-mesa" data-fotos></div>
      </section>`,

    // La vestimenta, los regalos y las dudas son hojas de papel vegetal sobre
    // el forro; las que van seguidas comparten el mismo forro (ver forros()).
    vestimenta: (b, x) => `<div class="vegetal vegetal-vestimenta" ${de(b, 'vestimenta')}>
        <h2 class="titulo-grabado" id="vestimenta-titulo">${titulo(x, b)}</h2>
        <p class="vestimenta-codigo" data-vestimenta-codigo></p>
        <p class="vestimenta-nota" data-vestimenta-nota hidden></p>
        ${vestimentaExtra(b, x)}
        <ul class="vestimenta-fotos" data-vestimenta-fotos aria-label="Fotos de referencia" hidden></ul>
      </div>`,

    regalos: (b, x) => `<div class="vegetal-bloque" ${de(b, 'regalos')} data-cuenta-vista="${b.cuentaVista}">
        <h2 class="titulo-grabado">${titulo(x, b)}</h2>
        <p data-regalos></p>
        <div class="regalo-cuenta" data-regalos-cuenta hidden></div>
        <ul class="regalo-listas" data-regalos-listas aria-label="Listas de regalos" hidden></ul>
      </div>`,

    contacto: (b, x) => `<div class="vegetal-bloque" ${de(b, 'contacto')} data-contacto hidden>
        <h2 class="titulo-grabado">${titulo(x, b)}</h2>
        <p data-contacto-texto></p>
      </div>`,

    preguntas: (b, x) => `<section class="pliego pliego-preguntas" ${de(b, 'preguntas')} aria-labelledby="preguntas-titulo" hidden>
        <div class="pliego-texto">
          <h2 class="pliego-titulo" id="preguntas-titulo">${titulo(x, b)}</h2>
          <article class="tarjeta tarjeta-preguntas">
            <div class="preguntas-lista" data-preguntas></div>
            ${marca('Preguntas')}
          </article>
        </div>
      </section>`,

    responder: (b, x) => `<section class="pliego pliego-responder" ${de(b, 'responder')} aria-labelledby="responder-titulo">
        ${lamina(x, 'rosa-multiflora-carnea', 'arriba')}
        <div class="pliego-texto">
          <h2 class="pliego-titulo" id="responder-titulo" data-titulo-responder>${titulo(x, b)}</h2>
          <article class="tarjeta tarjeta-respuesta" id="respuesta" aria-live="polite">
            ${marca('Respuesta')}
            <div class="respuesta-cuerpo" data-respuesta></div>
          </article>

          <!-- La tarjeta de mesa: aparece cuando el invitado confirmó y los novios publicaron las mesas -->
          <article class="tarjeta tarjeta-mesa" id="mesa" aria-labelledby="mesa-titulo" hidden>
            <div class="mesa-cuerpo" data-mesa></div>
            ${marca('Mesa')}
          </article>
        </div>
        <div class="pliego-foto" data-foto-pliego="responder" hidden></div>
      </section>`,
  };

  // ---------- Los bloques libres ----------

  const LIBRES = {
    texto(b, x) {
      const cuerpo = parrafos(b.cuerpo);
      if (!cuerpo && !b.titulo && !x.verVacios) return '';
      const texto = cuerpo || vacio(b, 'escribe el texto');
      return `<section class="pliego pliego-libre pliego-texto-libre" ${de(b, `b-${b.id}`)} data-alinear="${b.alinear}">
          <div class="pliego-texto">
            ${b.titulo ? `<h2 class="pliego-titulo">${cifras(b.titulo)}</h2>` : ''}
            ${b.caja === 'tarjeta'
              ? `<article class="tarjeta tarjeta-libre"><div class="libre-texto">${texto}</div></article>`
              : `<div class="libre-texto libre-suelto">${texto}</div>`}
          </div>
        </section>`;
    },

    foto(b, x) {
      if (!b.foto && !x.verVacios) return '';
      return `<section class="pliego pliego-libre pliego-foto-libre" ${de(b, `b-${b.id}`)} data-tamano="${b.tamano}">
          ${b.foto
            ? `<div class="libre-foto" data-foto-libre="${esc(b.foto.url)}" data-forma="${b.foto.forma}"${b.pie ? ` data-pie="${esc(b.pie)}"` : ''}></div>`
            : vacio(b, 'elige la foto')}
        </section>`;
    },

    galeria(b, x) {
      if (!b.fotos.length && !x.verVacios) return '';
      return `<section class="pliego pliego-libre pliego-galeria" ${de(b, `b-${b.id}`)}${b.titulo ? '' : ` aria-label="${esc(Pg.TIPOS.galeria.nombre)}"`}>
          ${b.titulo ? `<h2 class="pliego-titulo">${cifras(b.titulo)}</h2>` : ''}
          ${b.fotos.length
            ? `<ul class="galeria" data-galeria="${esc(JSON.stringify(b.fotos))}" data-cuantas="${b.fotos.length}"></ul>`
            : vacio(b, 'agrega las fotos')}
        </section>`;
    },

    cita(b, x) {
      const texto = parrafos(b.texto);
      if (!texto && !x.verVacios) return '';
      return `<section class="pliego pliego-libre pliego-cita" ${de(b, `b-${b.id}`)}>
          ${texto
            ? `<blockquote class="cita"><div class="cita-texto">${texto}</div>${b.autor ? `<footer class="cita-autor">${cifras(b.autor)}</footer>` : ''}</blockquote>`
            : vacio(b, 'escribe la cita')}
        </section>`;
    },

    boton(b, x) {
      if (!b.enlace && !x.verVacios) return '';
      return `<section class="pliego pliego-libre pliego-boton" ${de(b, `b-${b.id}`)}>
          <div class="pliego-texto">
            ${b.titulo ? `<h2 class="pliego-titulo">${cifras(b.titulo)}</h2>` : ''}
            ${b.texto ? `<div class="libre-texto libre-suelto">${parrafos(b.texto)}</div>` : ''}
            ${b.enlace
              ? `<p class="libre-accion"><a class="boton-pildora" href="${esc(b.enlace)}" target="_blank" rel="noopener">${esc(Pg.texto(x.pagina, b, 'etiqueta'))}${P.icono('externo')}</a></p>`
              : vacio(b, 'falta el enlace')}
          </div>
        </section>`;
    },

    separador(b) {
      const flor = b.adorno !== 'linea' ? b.adorno : null;
      return `<div class="separador" ${de(b, `b-${b.id}`)} data-adorno="${flor ? 'flor' : 'linea'}" aria-hidden="true">
          ${flor ? `<img src="assets/flores/${flor}-600.webp" alt="" loading="lazy" decoding="async">` : '<span class="separador-linea"></span>'}
        </div>`;
    },

    cuenta: (b, x) => `<section class="pliego pliego-libre pliego-cuenta" ${de(b, `b-${b.id}`)} aria-labelledby="t-${esc(b.id)}">
        <h2 class="pliego-titulo" id="t-${esc(b.id)}">${titulo(x, b)}</h2>
        <div class="cuenta-regresiva" data-cuenta-regresiva></div>
      </section>`,

    video(b, x) {
      const src = Pg.videoEmbebido(b.enlace);
      if (!src && !x.verVacios) return '';
      const nombre = b.titulo || 'Video';
      return `<section class="pliego pliego-libre pliego-video" ${de(b, `b-${b.id}`)}>
          ${b.titulo ? `<h2 class="pliego-titulo">${cifras(b.titulo)}</h2>` : ''}
          ${src
            ? `<figure class="video">
                <div class="video-marco"><iframe src="${esc(src)}" title="${esc(nombre)}" loading="lazy" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe></div>
                ${b.pie ? `<figcaption>${cifras(b.pie)}</figcaption>` : ''}
              </figure>`
            : vacio(b, b.enlace ? 'ese enlace no es de YouTube ni de Vimeo' : 'falta el enlace')}
        </section>`;
    },
  };

  const FORRO = ['vestimenta', 'regalos', 'contacto'];

  /*
   * El HTML de los bloques visibles, en orden. x: { pagina, verVacios }.
   * La vestimenta, los regalos y las dudas que van seguidos comparten un
   * forro; los regalos y las dudas seguidos, también la misma hoja.
   */
  function pintar(x) {
    // Los bloques de un tema (Vino & Marfil) solo se pintan en ese tema.
    const visibles = x.pagina.bloques.filter((b) => !b.oculto && (!Pg.TIPOS[b.tipo].tema || Pg.TIPOS[b.tipo].tema === x.pagina.tema));
    const ctx = Object.assign({ visible: (tipo) => visibles.some((b) => b.tipo === tipo) }, x);
    const partes = [];
    let forro = null;
    let hoja = null;
    visibles.forEach((b) => {
      if (FORRO.includes(b.tipo)) {
        if (!forro) {
          forro = [];
          partes.push(forro);
        }
        const html = SECCIONES[b.tipo](b, ctx);
        if (b.tipo === 'vestimenta') {
          forro.push(html);
          hoja = null;
        } else if (hoja) {
          hoja.push(html);
        } else {
          hoja = [html];
          forro.push(hoja);
        }
        return;
      }
      forro = null;
      hoja = null;
      partes.push((SECCIONES[b.tipo] || VINO[b.tipo] || LIBRES[b.tipo])(b, ctx));
    });
    return partes.map((p) => (Array.isArray(p)
      ? `<section class="forro">${p.map((h) => (Array.isArray(h) ? `<div class="vegetal vegetal-otros">${h.join('')}</div>` : h)).join('')}</section>`
      : p)).join('');
  }

  window.Bloques = { pintar, parrafos, cifras };
})();
