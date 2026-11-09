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

  // Vestimenta: la lámina «Dress code» (2026-11-09, imagen de Mario en
  // referencias-boda/referencias/DressCode.png). Las ilustraciones son las de
  // la imagen, recortadas en dos filas (assets/vestimenta/ellas.webp y
  // ellos.webp, sin el papel). Cada vestido y cada traje trae aparte su capa
  // (ellas-<id>.webp / ellos-<id>.webp: las sombras de la tela en gris y la
  // silueta en el alfa); con un color distinto al de la imagen, la capa se
  // pinta de ese color encima (hard-light, en assets/vestimenta.css). Con el
  // color de siempre no se pinta nada: se ve la ilustración tal cual.
  // Las recortó herramientas/vestimenta/recortar.mjs; caja = izquierda, arriba,
  // ancho y alto de la capa, en % de su fila.
  const DC_IMG = 'assets/vestimenta/';
  const DC_FILAS = {
    ellas: {
      ancho: 949,
      alto: 474,
      prendas: [
        { id: 'terracota', hex: '#9c4720', caja: [1.264, 15.401, 11.275, 82.068] },
        { id: 'mostaza', hex: '#b17610', caja: [11.697, 13.924, 11.486, 82.7] },
        { id: 'vino', hex: '#53151c', caja: [22.339, 22.996, 9.062, 74.262] },
        { id: 'esmeralda', hex: '#113e31', caja: [31.612, 15.612, 9.8, 81.646] },
        { id: 'olivo', hex: '#46512f', caja: [40.885, 22.363, 9.273, 74.895] },
        { id: 'marino', hex: '#152232', caja: [48.788, 22.996, 12.75, 75.105] },
        { id: 'petroleo', hex: '#1f3840', caja: [61.117, 16.456, 7.482, 80.38] },
        { id: 'cafe', hex: '#412c1b', caja: [67.756, 18.987, 10.327, 78.692] },
        { id: 'ciruela', hex: '#381a25', caja: [76.502, 17.3, 12.54, 81.013] },
        { id: 'lila', hex: '#4d384b', caja: [86.723, 14.979, 13.277, 82.489] },
      ],
    },
    ellos: {
      ancho: 850,
      alto: 434,
      prendas: [
        { id: 'cafe', hex: '#281a11', caja: [0.706, 14.516, 16.118, 76.959] },
        { id: 'marino', hex: '#18191e', caja: [18.471, 15.207, 15.412, 76.498] },
        { id: 'negro', hex: '#12110d', caja: [34.941, 14.747, 15.529, 76.498] },
        { id: 'gris', hex: '#2a2929', caja: [50.824, 14.977, 15.176, 76.728] },
        { id: 'marino2', hex: '#1b1c21', caja: [67.176, 14.286, 15.412, 76.728] },
        { id: 'cafe2', hex: '#28221d', caja: [82.588, 14.747, 16.706, 76.959] },
      ],
    },
  };

  // Una fila de figuras: la ilustración y, encima, las prendas que cambiaron
  // de color.
  function dcFila(nombre, colores, alt) {
    const f = DC_FILAS[nombre];
    const tintes = f.prendas.map((pr, i) => {
      const c = colores[i];
      const hex = c && /^#[0-9a-f]{6}$/i.test(c.hex || '') ? c.hex.toLowerCase() : null;
      if (!hex || hex === pr.hex) return '';
      const capa = `url('${DC_IMG}${nombre}-${pr.id}.webp')`;
      const [x, y, w, h] = pr.caja;
      return `<span class="dc-tinte" style="left: ${x}%; top: ${y}%; width: ${w}%; height: ${h}%; background-color: ${hex}; background-image: ${capa}; -webkit-mask-image: ${capa}; mask-image: ${capa}" aria-hidden="true"></span>`;
    }).join('');
    return `<figure class="dc-fila dc-fila-${nombre}" style="aspect-ratio: ${f.ancho} / ${f.alto}">
            <img src="${DC_IMG}${nombre}.webp" width="${f.ancho}" height="${f.alto}" alt="${esc(alt)}" loading="lazy" decoding="async">
            ${tintes}
          </figure>`;
  }

  // «terracota, amarillo mostaza y vino»
  const enumerar = (nombres) => {
    const n = nombres.filter(Boolean).map((t) => t.toLowerCase());
    return n.length > 1 ? `${n.slice(0, -1).join(', ')} y ${n[n.length - 1]}` : (n[0] || '');
  };

  function vestimentaLamina(b, x) {
    const t = (clave) => Pg.texto(x.pagina, b, clave);
    const vestidos = Pg.colores(b, 'vestidos').slice(0, DC_FILAS.ellas.prendas.length);
    const trajes = Pg.colores(b, 'trajes').slice(0, DC_FILAS.ellos.prendas.length);
    const punto = (c) => `<li class="dc-color"><span class="dc-circulo" style="--c: ${c.hex}"></span><span class="dc-color-nombre">${esc(c.nombre)}</span></li>`;
    const icono = (img, texto) => `<li><img src="${DC_IMG}icono-${img}.webp" width="68" height="69" alt="" loading="lazy" decoding="async"><span>${cifras(texto)}</span></li>`;
    const conVestidos = vestidos.length ? `: ${enumerar(vestidos.map((c) => c.nombre))}` : '';
    const conTrajes = trajes.length ? `: ${enumerar(trajes.map((c) => c.nombre))}` : '';
    const detalles = [['vestido', t('detalle1')], ['zapato', t('detalle2')], ['reloj', t('detalle3')]].filter(([, d]) => d);
    return `<article class="dc-lamina" aria-labelledby="vestimenta-titulo">
      <div class="dc-contenido">
        <header class="dc-cabecera">
          <img class="dc-hoja dc-hoja-1" src="${DC_IMG}hoja-1.webp" width="106" height="130" alt="" aria-hidden="true" loading="lazy" decoding="async">
          <h2 class="dc-titulo" id="vestimenta-titulo">
            <span class="dc-ante">${titulo(x, b)}</span>
            <span class="dc-floron" aria-hidden="true"></span>
            <span class="dc-grande">${cifras(t('grande'))}</span>
          </h2>
          <p class="dc-codigo vestimenta-codigo" data-vestimenta-codigo></p>
          <p class="dc-nota vestimenta-nota" data-vestimenta-nota hidden></p>
        </header>

        <section class="dc-grupo dc-grupo-ellas" aria-labelledby="dc-ellas">
          <div class="dc-texto">
            <h3 class="dc-quien" id="dc-ellas">${cifras(t('rotuloEllas'))}</h3>
            ${parrafos(t('textoEllas'))}
          </div>
          ${dcFila('ellas', vestidos, `Diez invitadas con vestido largo${conVestidos}.`)}
        </section>

        ${vestidos.length ? `<section class="dc-bloque-colores" aria-labelledby="dc-colores">
          <h3 class="dc-rotulo" id="dc-colores">${cifras(t('rotuloColores'))}</h3>
          <ul class="dc-colores">${vestidos.map(punto).join('')}</ul>
        </section>` : ''}

        <div class="dc-divisor" aria-hidden="true"><span class="dc-floron"></span></div>

        <section class="dc-grupo dc-grupo-ellos" aria-labelledby="dc-ellos">
          <div class="dc-texto">
            <h3 class="dc-quien" id="dc-ellos">${cifras(t('rotuloEllos'))}</h3>
            ${parrafos(t('textoEllos'))}
            <img class="dc-hoja dc-hoja-2" src="${DC_IMG}hoja-2.webp" width="108" height="110" alt="" aria-hidden="true" loading="lazy" decoding="async">
          </div>
          ${dcFila('ellos', trajes, `Seis invitados de traje con camisa blanca y corbata${conTrajes}.`)}
        </section>

        <footer class="dc-pie">
          <section class="dc-evitar" aria-labelledby="dc-evitar">
            <img src="${DC_IMG}evitar.webp" width="84" height="84" alt="" aria-hidden="true" loading="lazy" decoding="async">
            <div>
              <h3 id="dc-evitar">${cifras(t('rotuloEvitar'))}</h3>
              ${parrafos(t('textoEvitar'))}
            </div>
          </section>
          ${detalles.length ? `<section class="dc-detalles" aria-labelledby="dc-detalles">
            <h3 id="dc-detalles">${cifras(t('rotuloDetalles'))}</h3>
            <ul>${detalles.map(([img, d]) => icono(img, d)).join('')}</ul>
          </section>` : ''}
          ${t('gracias') ? `<div class="dc-gracias">${parrafos(t('gracias'))}</div>` : ''}
        </footer>

        ${b.ideas ? `<p class="dc-ideas"><a class="boton-pildora" href="${esc(b.ideas)}" target="_blank" rel="noopener">${esc(t('ideasTexto'))}${P.icono('externo')}</a></p>` : ''}
        <ul class="vestimenta-fotos" data-vestimenta-fotos aria-label="Fotos de referencia" hidden></ul>
      </div>
    </article>`;
  }

  const VINO = {
    invitacion(b, x) {
      const padres = [b.padresDos, b.padresUno].filter(Boolean);
      return `<section class="pliego pliego-formal" ${de(b, 'invitacion-formal')} aria-labelledby="formal-titulo">
          <div class="formal-sobre" data-formal-sobre>
          <!-- El sobre ya abierto, de terciopelo rojo con oro (como el de la
               intro), dejado a un lado; la carta descansa junto a él. -->
          <div class="formal-envoltura" aria-hidden="true">
            <svg class="formal-solapa" viewBox="0 0 100 50" preserveAspectRatio="none" focusable="false">
              <defs>
                <linearGradient id="formal-oro" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stop-color="#8b6522"/><stop offset=".28" stop-color="#e9cf8a"/><stop offset=".5" stop-color="#b8913f"/><stop offset=".74" stop-color="#f1d999"/><stop offset="1" stop-color="#a07a2e"/>
                </linearGradient>
                <radialGradient id="formal-terciopelo" cx=".5" cy=".8" r=".85">
                  <stop offset="0" stop-color="#861a2a"/><stop offset=".65" stop-color="#5e0d1b"/><stop offset="1" stop-color="#470915"/>
                </radialGradient>
              </defs>
              <polygon points="0.6,50 50,1.2 99.4,50" fill="url(#formal-terciopelo)" stroke="url(#formal-oro)" stroke-width="1.6" stroke-linejoin="round" vector-effect="non-scaling-stroke"/>
            </svg>
            <span class="formal-sobre-fondo"></span>
            <span class="formal-bolsillo"></span>
            <svg class="formal-bolsillo-filo" viewBox="0 0 100 100" preserveAspectRatio="none" focusable="false">
              <polyline points="0,0 50,50 100,0" fill="none" stroke="url(#formal-oro)" stroke-width="1.6" stroke-linejoin="round" vector-effect="non-scaling-stroke"/>
            </svg>
          </div>
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

    // La vestimenta es una lámina a todo el ancho, fuera del forro.
    vestimenta: (b, x) => `<section class="dc-seccion" ${de(b, 'vestimenta')}>
        ${vestimentaLamina(b, x)}
      </section>`,

    // Los regalos y las dudas son hojas de papel vegetal sobre el forro; las
    // que van seguidas comparten el mismo forro y la misma hoja (ver pintar()).
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

    // Las preguntas son una sección entera, de lado a lado, sin tarjeta (como
    // el itinerario): el título y la lista van directo sobre su banda.
    preguntas: (b, x) => `<section class="pliego pliego-preguntas" ${de(b, 'preguntas')} aria-labelledby="preguntas-titulo" hidden>
        <div class="pliego-texto">
          <h2 class="pliego-titulo" id="preguntas-titulo">${titulo(x, b)}</h2>
          <div class="preguntas-lista" data-preguntas></div>
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

  const FORRO = ['regalos', 'contacto'];

  /*
   * El HTML de los bloques visibles, en orden. x: { pagina, verVacios }.
   * Los regalos y las dudas que van seguidos comparten un forro y la misma
   * hoja. La vestimenta va sola, a todo el ancho.
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
        if (hoja) {
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
