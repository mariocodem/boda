/*
 * La invitación: abre el sobre, llena la suite con los datos del invitado y de
 * la boda (lugares, alojamiento, itinerario, historia, fotos, vestimenta,
 * regalos y preguntas frecuentes), mueve las escenas con el scroll, maneja la
 * tarjeta de respuesta y, cuando el invitado confirmó y las mesas están
 * publicadas, le muestra la suya.
 */
(function () {
  const C = window.BODA;
  const P = window.Papeleria;
  const doc = document.documentElement;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const esc = P.escapar;

  const params = new URLSearchParams(location.search);
  // La vista previa del editor (panel → Diseño): la invitación dentro de un
  // iframe, que recibe el borrador en vivo y avisa qué bloque se tocó.
  const vistaEditor = params.get('vista') === 'editor' && window.parent !== window;
  const codigo = vistaEditor ? null : window.Datos.limpiarCodigo(params.get('i'));
  const vistaPanel = params.get('vista') === 'panel' || vistaEditor;
  const SIN_MOVIMIENTO = matchMedia('(prefers-reduced-motion: reduce)').matches;
  // Quieto con «reducir movimiento» o con «Animaciones: ninguna» (Diseño → Tema).
  let reducido = SIN_MOVIMIENTO;
  // Desde el panel se puede ver la invitación con un estilo aún sin guardar,
  // con o sin la mariposa.
  const estiloVista = Estilos.desdeUrl(params);
  const mariposaVista = vistaPanel ? params.get('mariposa') : null;
  const pareja = `${C.pareja.uno.nombre} y ${C.pareja.dos.nombre}`;
  const verVacios = () => window.Datos.modo === 'local' || vistaPanel;
  const CLAVE_ABIERTA = `boda-diego-erika:abierta:${codigo || 'general'}`;

  // Datos de la boda: config.js, reemplazado por lo que se guarde en el panel.
  let E = window.Datos.eventoBase();
  // Plano del salón (pestaña «Mesas» del panel). null mientras no llega.
  let salon = null;
  // El borrador que manda el editor: { pagina, estilo, mariposa }.
  let borrador = null;

  // La página que se pinta: la publicada o, en el editor, el borrador.
  const pagina = () => (borrador ? borrador.pagina : E.pagina);
  const bloque = (tipo) => pagina().bloques.find((b) => b.tipo === tipo && !b.oculto) || null;

  const estado = {
    invitacion: null, // { numero, nombre, cupos, estado, asistentes, mensaje, respondidoEn }
    carga: codigo ? 'cargando' : 'sin-codigo', // cargando | lista | no-encontrada | error | sin-codigo
    editando: false,
    eleccion: null,
    cuantos: 1,
    // Quiénes van: un nombre por persona (solo con más de un cupo).
    nombres: [],
    mensaje: '',
    // Las preguntas opcionales de la tarjeta (se encienden en el panel).
    alergias: '',
    cancion: '',
    enviando: false,
    error: '',
    recienSellada: false,
  };

  const plural = () => Boolean(estado.invitacion && estado.invitacion.cupos > 1);
  // Para una persona, de «tú» o de «usted» (Diseño → Tema); para varias, «ustedes».
  const t = (uno, varios, usted = uno) => (plural() ? varios : pagina().trato === 'usted' ? usted : uno);

  // ---------- Formatos ----------

  // Las cifras van en Castoro: en la romana grabada el «1» se lee como «I».
  function conCifras(texto) {
    return esc(texto).replace(/\d+/g, '<span class="cifra">$&</span>');
  }

  function porConfirmar(el, valor, texto) {
    if (!el) return;
    if (valor) {
      el.innerHTML = conCifras(valor);
      el.classList.remove('por-confirmar');
    } else {
      el.textContent = texto;
      el.classList.add('por-confirmar');
    }
  }

  function mostrar(el, html) {
    if (!el) return;
    el.innerHTML = html || '';
    el.hidden = !html;
  }

  // ---------- La página: los bloques en su orden ----------

  let pintada = '';

  // Pinta los bloques si la página cambió y pone los textos de la portada y
  // del cierre. Devuelve true si los bloques se pintaron de nuevo.
  function pintarPagina() {
    const p = pagina();
    doc.dataset.tema = p.tema;
    doc.dataset.animacion = p.animacion;
    // El <head> lo lee en la próxima visita, para pintar desde el primer cuadro
    // con el tema que es (sin que el sobre cambie de tamaño al cargar).
    if (!vistaPanel) {
      try { localStorage.setItem('boda-diego-erika:tema', p.tema); } catch { /* sin almacenamiento */ }
    }
    asegurarRamo();
    prepararSobre();
    const quieto = SIN_MOVIMIENTO || p.animacion === 'ninguna';
    if (quieto !== reducido) {
      reducido = quieto;
      doc.classList.toggle('scroll-vivo', !reducido);
    }
    if (window.Musica) window.Musica.configurar(vistaEditor ? Object.assign({}, p.musica, { activa: false }) : p.musica);
    const clave = JSON.stringify([p, verVacios()]);
    const nueva = clave !== pintada;
    if (nueva) {
      pintada = clave;
      $('[data-bloques]').innerHTML = window.Bloques.pintar({ pagina: p, verVacios: verVacios() });
      repartirRespuesta();
    }
    $('[data-pista-texto]').textContent = Pagina.texto(p, 'portada', 'pista');
    $('[data-cierre-con]').textContent = Pagina.texto(p, 'cierre', 'con');
    $('[data-cierre-firma]').innerHTML = esc(Pagina.texto(p, 'cierre', 'firma')).replace(/&amp;/g, '<i>&amp;</i>');
    $('[data-volver]').textContent = Pagina.texto(p, 'cierre', 'volver');
    return nueva;
  }

  // ---------- La boda ----------

  function llenarEvento() {
    const nueva = pintarPagina();
    aplicarEstilo();
    llenarRetrato();
    llenarFotos();
    llenarVestimentaFotos();
    llenarLibres();
    const fecha = P.fechaEvento(E);
    const larga = fecha ? P.fechaLarga(fecha) : null;
    porConfirmar($('[data-fecha]'), larga, 'Fecha por confirmar');
    porConfirmar($('[data-ciudad]'), E.ciudad, 'Ciudad por confirmar');
    llenarCapitulos(fecha, larga);
    llenarSitios();
    llenarAlojamiento();
    llenarItinerario();
    llenarCalendario(fecha);
    llenarMes(fecha);
    const fechaAlbum = $('[data-fecha-album]');
    if (fechaAlbum) mostrar(fechaAlbum, larga ? conCifras(larga) : '');
    llenarHistoria();
    llenarIntro();
    llenarFechaVino(fecha);
    llenarPolaroids();
    llenarParallax();
    mirarFormal();
    llenarCierre(fecha);
    textosVarios();

    porConfirmar($('[data-vestimenta-codigo]'), E.vestimenta.codigo, 'Por confirmar');
    mostrar($('[data-vestimenta-nota]'), E.vestimenta.nota ? conCifras(E.vestimenta.nota) : '');
    llenarRegalos();
    llenarPreguntas();
    llenarContacto();

    // La portada lleva a la primera parte que se ve.
    const primera = $$('[data-bloques] [data-bloque]').find((el) => !el.hidden);
    $('[data-pista]').href = `#${primera ? primera.id : 'responder'}`;

    // Con los bloques nuevos, lo del invitado se vuelve a poner en su lugar.
    if (nueva) {
      llenarInvitado();
      if (!estado.enviando) pintarRespuesta();
      if (vistaEditor) marcarElegido();
    }
    pedirCuadro();
  }

  // Dudas: el WhatsApp de contacto de config.js.
  function llenarContacto() {
    const caja = $('[data-contacto]');
    if (!caja) return;
    const tel = C.contacto && C.contacto.whatsapp ? String(C.contacto.whatsapp).replace(/\D/g, '') : '';
    caja.hidden = !tel && !verVacios();
    if (!tel) {
      $('[data-contacto-texto]', caja).innerHTML = verVacios()
        ? '<span class="seccion-pendiente"><b>Falta el WhatsApp de contacto</b><span>Se pone en assets/config.js (contacto). Mientras no esté, los invitados no ven esta hoja.</span></span>'
        : '';
      return;
    }
    const quien = C.contacto.nombre || 'los novios';
    $('[data-contacto-texto]', caja).innerHTML = `${t('Escríbele', 'Escríbanle', 'Escríbale')} a ${esc(quien)}.<br><a class="enlace-accion" href="https://wa.me/${tel}" target="_blank" rel="noopener">${P.icono('whatsapp')}<span>Escribir por WhatsApp</span></a>`;
  }

  function llenarCapitulos(fecha, larga) {
    porConfirmar($('[data-fecha-larga]'), larga, 'Fecha por confirmar');
    let cuenta = '';
    if (fecha) {
      const dias = Math.ceil((fecha - Date.now()) / 86400000);
      if (dias > 1) cuenta = `Faltan <span class="cifra">${dias}</span> días`;
      else if (dias === 1) cuenta = '¡Es mañana!';
      else if (dias === 0) cuenta = '¡Es hoy!';
    }
    mostrar($('[data-cuenta]'), cuenta);

    porConfirmar($('[data-hora-ceremonia]'), P.horaBonita(E.hora), 'Hora por confirmar');
    const horaRec = P.horaBonita(E.recepcion.hora);
    mostrar($('[data-recepcion-nota]'), horaRec ? `Recepción · ${conCifras(horaRec)}` : '');

    const c = E.ceremonia;
    porConfirmar($('[data-lugar-ceremonia]'), c.lugar, 'Lugar por confirmar');
    const dir = [c.direccion, E.ciudad].filter(Boolean).join(', ');
    mostrar($('[data-direccion-ceremonia]'), c.lugar && dir ? conCifras(dir) : '');
  }

  function sitios() {
    const c = E.ceremonia;
    const r = E.recepcion;
    const hc = P.horaBonita(E.hora);
    const hr = P.horaBonita(r.hora);
    if (r.mismoLugar) {
      const horas = [hc && `Ceremonia ${hc}`, hr && `recepción ${hr}`].filter(Boolean).join(' · ');
      return [{ momento: 'Ceremonia y recepción', hora: horas, l: c }];
    }
    return [
      { momento: 'Ceremonia', hora: hc, l: c },
      { momento: 'Recepción', hora: hr, l: r },
    ];
  }

  function llenarSitios() {
    const caja = $('[data-sitios]');
    if (!caja) return;
    caja.innerHTML = sitios().map((s) => {
      const m = P.mapas(s.l, E.ciudad);
      const nombre = s.l.lugar;
      const dir = [s.l.direccion, E.ciudad].filter(Boolean).join(', ');
      const salida = P.icono('externo', 'app-salida');
      const datos = `<div class="sitio-datos">
          <h3 class="sitio-momento">${esc(s.momento)}</h3>
          <p class="sitio-hora${s.hora ? '' : ' por-confirmar'}">${s.hora ? conCifras(s.hora) : 'Hora por confirmar'}</p>
          <p class="sitio-nombre${nombre ? '' : ' por-confirmar'}">${nombre ? conCifras(nombre) : 'Lugar por confirmar'}</p>
          ${nombre && dir ? `<p class="sitio-direccion">${conCifras(dir)}</p>` : ''}
          ${m ? `<div class="apps" role="group" aria-label="Abrir ${esc(nombre || s.momento.toLowerCase())} en una app de mapas">
            <a class="app" href="${esc(m.google)}" target="_blank" rel="noopener">${P.icono('mapa')}<span>Google Maps</span>${salida}</a>
            <a class="app" href="${esc(m.waze)}" target="_blank" rel="noopener">${P.icono('waze')}<span>Waze</span>${salida}</a>
            <a class="app" href="${esc(m.apple)}" target="_blank" rel="noopener">${P.icono('navegar')}<span>Apple Maps</span>${salida}</a>
          </div>
          ${m.texto ? `<button class="enlace-accion" type="button" data-copiar="${esc(m.texto)}">${P.icono('copiar')}<span>Copiar dirección</span></button>` : ''}` : ''}
        </div>`;
      if (!m || !m.embebido) return `<div class="sitio sitio-solo">${datos}</div>`;
      return `<div class="sitio">
          <figure class="sitio-mapa">
            <div class="sitio-marco"><iframe src="${esc(m.embebido)}" title="Mapa de ${esc(nombre || s.momento.toLowerCase())}" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe></div>
            <span class="esquina"></span><span class="esquina"></span><span class="esquina"></span><span class="esquina"></span>
          </figure>
          ${datos}
        </div>`;
    }).join('');

    $$('[data-copiar]', caja).forEach((b) => copiable(b, b.dataset.copiar, 'Dirección copiada'));
  }

  // Un botón que copia un texto y lo cuenta un momento en su etiqueta.
  function copiable(boton, valor, hecho) {
    const etiqueta = $('span', boton);
    const normal = etiqueta.textContent;
    boton.addEventListener('click', async () => {
      let ok = false;
      try {
        await navigator.clipboard.writeText(valor);
        ok = true;
      } catch { /* sin portapapeles */ }
      etiqueta.textContent = ok ? hecho : 'No se pudo copiar';
      setTimeout(() => { etiqueta.textContent = normal; }, 2200);
    });
  }

  // Párrafos separados por una línea en blanco; dentro, cada salto se respeta.
  function parrafos(texto) {
    return String(texto || '').split(/\n\s*\n/).map((x) => x.trim()).filter(Boolean)
      .map((x) => `<p>${conCifras(x).replace(/\n/g, '<br>')}</p>`).join('');
  }

  // En modo local y en la vista previa del panel, una sección todavía vacía se
  // ve con un aviso de dónde se llena. Los invitados no la ven.
  function pendiente(que, donde) {
    return `<p class="seccion-pendiente"><b>${que}</b><span>Se llena en el panel: La boda → ${donde}. Mientras esté vacía, los invitados no ven esta tarjeta.</span></p>`;
  }

  // Hoteles para quienes vienen de lejos. Sin hoteles la sección no aparece.
  function llenarAlojamiento() {
    const a = E.alojamiento || { hoteles: [] };
    if (!$('#alojamiento')) return;
    $('#alojamiento').hidden = !a.hoteles.length && !verVacios();
    if (!a.hoteles.length) {
      mostrar($('[data-alojamiento-nota]'), a.nota ? conCifras(a.nota) : '');
      $('[data-hoteles]').innerHTML = verVacios() ? `<li>${pendiente('Aún no hay hoteles', 'Alojamiento')}</li>` : '';
      return;
    }
    mostrar($('[data-alojamiento-nota]'), a.nota ? conCifras(a.nota) : '');
    $('[data-hoteles]').innerHTML = a.hoteles.map((h) => {
      const m = P.mapas({ lugar: h.nombre, direccion: h.direccion }, E.ciudad);
      const dir = [h.direccion, E.ciudad].filter(Boolean).join(', ');
      return `<li class="hotel">
          <h3 class="hotel-nombre">${conCifras(h.nombre)}</h3>
          ${h.direccion ? `<p class="hotel-direccion">${conCifras(dir)}</p>` : ''}
          ${h.nota ? `<p class="hotel-nota">${conCifras(h.nota)}</p>` : ''}
          <div class="hotel-acciones">
            ${h.enlace ? `<a class="enlace-accion" href="${esc(h.enlace)}" target="_blank" rel="noopener">${P.icono('cama')}<span>Ver el hotel</span></a>` : ''}
            ${m ? `<a class="enlace-accion" href="${esc(m.google)}" target="_blank" rel="noopener">${P.icono('mapa')}<span>Cómo llegar</span></a>` : ''}
          </div>
        </li>`;
    }).join('');
  }

  function llenarHistoria() {
    const html = parrafos(E.historia);
    if ($('#historia')) {
      $('#historia').hidden = !html && !verVacios();
      $('[data-historia]').innerHTML = html || (verVacios() ? pendiente('Aún no está su historia', 'Nuestra historia') : '');
    }
    repartirFotos();
  }

  // El texto de regalos, la cuenta para transferencias y las listas de tiendas.
  // Solo dice «por confirmar» si no hay nada de eso.
  function llenarRegalos() {
    const cuenta = E.cuentaRegalos;
    const listas = E.listasRegalos || [];
    const texto = $('[data-regalos]');
    if (!texto) return;
    porConfirmar(texto, E.regalos, 'Por confirmar');
    texto.hidden = !E.regalos && Boolean(cuenta || listas.length);

    const caja = $('[data-regalos-cuenta]');
    caja.hidden = !cuenta;
    caja.innerHTML = '';
    if (cuenta) {
      const filas = [
        ['Banco', [cuenta.banco, cuenta.tipo].filter(Boolean).join(' · ')],
        ['Número', cuenta.numero, 'cuenta-numero'],
        ['A nombre de', cuenta.titular],
        ['Documento', cuenta.documento],
      ].filter(([, v]) => v);
      const datos = `<dl class="cuenta">${filas.map(([e, v, c]) => `<div><dt>${e}</dt><dd${c ? ` class="${c}"` : ''}>${conCifras(v)}</dd></div>`).join('')}</dl>
        <button class="enlace-accion" type="button" data-copiar-numero>${P.icono('copiar')}<span>Copiar el número</span></button>`;
      // Detrás de «Ver datos» (Diseño → Regalos), salvo que se pidan a la vista.
      const vista = caja.closest('[data-cuenta-vista]');
      caja.innerHTML = vista && vista.dataset.cuentaVista === 'boton'
        ? `<button class="boton-pildora" type="button" data-ver-datos aria-expanded="false" aria-controls="cuenta-datos">${P.icono('dinero')}<span>Ver datos</span></button><div class="cuenta-datos" id="cuenta-datos" hidden>${datos}</div>`
        : datos;
      copiable($('[data-copiar-numero]', caja), cuenta.numero.replace(/[\s.-]/g, ''), 'Número copiado');
    }

    const ul = $('[data-regalos-listas]');
    ul.hidden = !listas.length;
    ul.innerHTML = listas.map((l) => `<li><a class="enlace-accion" href="${esc(l.enlace)}" target="_blank" rel="noopener">${P.icono('regalo')}<span>Ver la lista en ${esc(l.nombre)}</span></a></li>`).join('');
  }

  function llenarPreguntas() {
    const lista = E.preguntas || [];
    if (!$('#preguntas')) return;
    $('#preguntas').hidden = !lista.length && !verVacios();
    if (!lista.length) {
      $('[data-preguntas]').innerHTML = verVacios() ? pendiente('Aún no hay preguntas', 'Preguntas frecuentes') : '';
      return;
    }
    $('[data-preguntas]').innerHTML = lista.map((q) => `<details class="pregunta">
        <summary><span class="pregunta-texto">${conCifras(q.pregunta)}</span><span class="pregunta-signo" aria-hidden="true"></span></summary>
        <div class="pregunta-respuesta">${parrafos(q.respuesta)}</div>
      </details>`).join('');
  }

  function momentosDelDia() {
    if (E.itinerario.length) return E.itinerario;
    const c = E.ceremonia;
    const r = E.recepcion;
    return [
      { hora: E.hora, titulo: 'Ceremonia', detalle: c.lugar },
      { hora: r.hora, titulo: 'Recepción', detalle: r.mismoLugar ? c.lugar : r.lugar },
    ];
  }

  function llenarItinerario() {
    const lista = $('[data-itinerario]');
    if (!lista) return;
    lista.innerHTML = momentosDelDia().map((m) => {
      const h = P.horaBonita(m.hora);
      return `<li class="dia-momento">
          <p class="dia-hora${h ? '' : ' por-confirmar'}">${h ? conCifras(h) : 'Por confirmar'}</p>
          <span class="dia-punto" aria-hidden="true"></span>
          <span class="dia-icono" aria-hidden="true">${P.icono(iconoMomento(m.titulo))}</span>
          <div class="dia-texto">
            <h3 class="dia-titulo">${conCifras(m.titulo)}</h3>
            ${m.detalle ? `<p class="dia-detalle">${conCifras(m.detalle)}</p>` : ''}
          </div>
        </li>`;
    }).join('');
  }

  function llenarCalendario(fecha) {
    const cal = $('[data-calendario]');
    if (!cal) return;
    if (!fecha) {
      cal.hidden = true;
      return;
    }
    cal.innerHTML = `<button class="enlace-accion" type="button">${P.icono('calendario')}<span>Agregar al calendario</span></button>`;
    cal.hidden = false;
    $('button', cal).addEventListener('click', () => descargarCalendario(fecha));
  }

  function descargarCalendario(inicio) {
    const fin = new Date(inicio.getTime() + 6 * 3600000);
    const f = (d) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    const c = E.ceremonia;
    const lugar = [c.lugar, c.direccion, E.ciudad].filter(Boolean).join(', ');
    const ics = [
      'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Diego y Erika//Boda//ES', 'BEGIN:VEVENT',
      `UID:boda-diego-erika-${f(inicio)}`, `DTSTAMP:${f(new Date())}`, `DTSTART:${f(inicio)}`, `DTEND:${f(fin)}`,
      'SUMMARY:Boda de Diego y Erika', lugar ? `LOCATION:${lugar.replace(/([,;\\])/g, '\\$1')}` : '',
      'END:VEVENT', 'END:VCALENDAR',
    ].filter(Boolean).join('\r\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' }));
    a.download = 'boda-diego-y-erika.ics';
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  }

  async function cargarEvento() {
    try {
      E = await window.Datos.evento();
    } catch {
      // Sin conexión con la base: la invitación sigue con config.js.
    }
    llenarEvento();
    // La tarjeta pudo pintarse antes de saber qué preguntas lleva y hasta cuándo
    // se responde; si nadie la está llenando, se vuelve a pintar.
    const caja = $('[data-respuesta]');
    if (estado.carga === 'lista' && !estado.enviando && caja && !caja.contains(document.activeElement)) pintarRespuesta();
  }

  // ---------- Estilo y fotos (vienen de la pestaña «La boda» del panel) ----------

  function aplicarEstilo() {
    const e = Estilos.aplicar((borrador && borrador.estilo) || estiloVista || E.estilo);
    if (!estiloVista && !borrador) Estilos.recordar(e);
    // La mariposa (assets/mariposa.js) mira este atributo.
    const mariposa = borrador ? borrador.mariposa : (mariposaVista || (E.mariposa ? 'si' : 'no')) !== 'no';
    doc.dataset.mariposa = mariposa ? 'si' : 'no';
    $('.sobre-sello').innerHTML = P.sello(Estilos.paleta(e).sello);
    aplicarFondo(pagina().fondo);
    Estilos.listo(e).then(() => doc.classList.remove('estilo-pendiente'));
  }

  // El fondo de la página (Diseño → Tema): el del tema, un color, un degradado
  // o una foto con un velo del color del suelo. Sobre un color propio, lo que
  // va escrito en el suelo se oscurece o se aclara para leerse.
  let turnoFondo = 0;
  async function aplicarFondo(f) {
    const mio = ++turnoFondo;
    const s = doc.style;
    ['--fondo-pagina', '--fondo-imagen'].forEach((k) => s.removeProperty(k));
    if (f.tipo === 'tema') {
      delete doc.dataset.fondo;
      return;
    }
    if (f.tipo === 'imagen') {
      const url = await window.Datos.urlFoto(f.imagen.url);
      if (mio !== turnoFondo) return;
      if (!url) {
        delete doc.dataset.fondo;
        return;
      }
      const velo = `color-mix(in srgb, var(--verde) ${f.velo}%, transparent)`;
      s.setProperty('--fondo-imagen', `linear-gradient(${velo}, ${velo}), url("${url.replace(/"/g, '%22')}") center / cover no-repeat`);
      doc.dataset.fondo = 'imagen';
      return;
    }
    const capa = f.tipo === 'color' ? f.color
      : f.direccion === 'centro' ? `radial-gradient(120% 90% at 50% 30%, ${f.color}, ${f.color2})`
      : `linear-gradient(${f.direccion === 'diagonal' ? '135deg' : '180deg'}, ${f.color}, ${f.color2})`;
    s.setProperty('--fondo-pagina', capa);
    s.setProperty('--fondo-color', f.color);
    const claro = Pagina.claro(f.color) && (f.tipo === 'color' || Pagina.claro(f.color2));
    const tintas = claro
      ? { '--tinta-sobre': 'var(--tinta)', '--tinta-texto': 'var(--tinta)', '--salvia': 'var(--tinta-suave)', '--salvia-clara': 'var(--tinta-suave)' }
      : { '--tinta-sobre': '#fbf8f1', '--tinta-texto': '#f1ede4', '--salvia': '#d9d4c9', '--salvia-clara': '#ece8df' };
    Object.entries(tintas).forEach(([k, v]) => s.setProperty(k, v));
    doc.dataset.fondo = claro ? 'claro' : 'oscuro';
    doc.dataset.suelo = doc.dataset.fondo;
  }

  // La foto de los novios en el arco de la portada. Sin foto, el arco deja ver
  // el forro; en modo local o desde el panel dice dónde se sube.
  async function llenarRetrato() {
    const f = E.fotoPortada;
    const marco = $('[data-retrato]');
    const aviso = (titulo, detalle) => {
      marco.innerHTML = verVacios() ? `<p class="retrato-pendiente"><b>${titulo}</b><span>${detalle}</span></p>` : '';
    };
    const url = f ? await window.Datos.urlFoto(f.url) : null;
    if (!url) {
      aviso('Foto de los novios', 'Súbela en el panel');
      return;
    }
    const img = new Image();
    img.alt = pareja;
    img.decoding = 'async';
    img.style.objectPosition = f.encuadre || '50% 30%';
    img.onload = () => marco.replaceChildren(img);
    img.onerror = () => aviso('No se encontró la foto', esc(f.url));
    img.src = url;
  }

  const ESQUINAS = '<span class="esquina"></span><span class="esquina"></span><span class="esquina"></span><span class="esquina"></span>';

  function fotoImpresa(f, url, { alt, etiqueta, pie }) {
    return `<figure class="foto" data-forma="${f.forma === 'horizontal' ? 'horizontal' : 'vertical'}">
        <div class="foto-marco"><button class="foto-boton" type="button" aria-label="${esc(etiqueta)}"><img src="${esc(url)}" alt="${esc(alt)}" loading="lazy" decoding="async"></button></div>
        ${pie != null ? `<figcaption>${esc(pie)}</figcaption>` : ''}${ESQUINAS}
      </figure>`;
  }

  // Si una foto no carga, su copia se retira de la mesa.
  function retirarRotas(caja, alCambiar) {
    $$('img', caja).forEach((img) => {
      img.addEventListener('error', () => {
        (img.closest('li') || img.closest('.foto')).remove();
        alCambiar();
      }, { once: true });
    });
  }

  // Las fotos de la pareja se reparten por la invitación (ver P.lugaresFotos):
  // una al lado de cada pliego que le toca y las demás juntas, sueltas sobre
  // la mesa.
  async function llenarFotos() {
    const lista = E.fotos || [];
    const urls = await Promise.all(lista.map((f) => window.Datos.urlFoto(f.url)));
    const buenas = lista.map((f, i) => ({ f, url: urls[i], i })).filter((x) => x.url);
    const lugares = P.lugaresFotos(buenas.length, Boolean(parrafos(E.historia)), pagina());
    const impresa = (x) => fotoImpresa(x.f, x.url, { alt: pareja, etiqueta: `Ver en grande la foto ${x.i + 1} de ${pareja}` });
    const cajas = $$('[data-foto-pliego]');
    cajas.forEach((caja) => {
      const k = lugares.indexOf(caja.dataset.fotoPliego);
      caja.innerHTML = k >= 0 ? impresa(buenas[k]) : '';
    });
    const mesa = $('[data-fotos]');
    if (mesa) mesa.innerHTML = buenas.filter((x, k) => lugares[k] === 'momentos').map(impresa).join('');
    // El álbum: la primera foto en la ventana grande, las otras dos en las chicas.
    const delAlbum = buenas.filter((x, k) => lugares[k] === 'album');
    const ventanas = $$('[data-foto-album]');
    ventanas.forEach((caja, n) => { caja.innerHTML = delAlbum[n] ? impresa(delAlbum[n]) : ''; });
    cajas.concat(mesa || [], ventanas).forEach((caja) => retirarRotas(caja, repartirFotos));
    repartirFotos();
  }

  // Cada pliego sabe si lleva foto; en pantalla ancha la foto va un pliego a
  // la derecha y el siguiente a la izquierda.
  function repartirFotos() {
    let lado = 'derecha';
    $$('[data-foto-pliego]').forEach((caja) => {
      const pliego = caja.closest('.pliego');
      const con = Boolean(caja.children.length);
      caja.hidden = !con;
      pliego.classList.toggle('con-foto', con);
      if (con && !pliego.hidden) {
        pliego.dataset.lado = lado;
        lado = lado === 'derecha' ? 'izquierda' : 'derecha';
      }
    });
    const album = $('#album');
    if (album) {
      const ventanas = $$('[data-foto-album]', album);
      const llenas = ventanas.filter((v) => v.children.length).length;
      ventanas.forEach((v) => { v.hidden = !v.children.length; });
      album.dataset.cuantas = llenas;
      album.hidden = !llenas && !verVacios();
      const vacio = $('[data-album-vacio]', album);
      if (vacio) vacio.hidden = Boolean(llenas);
    }
    const mesa = $('[data-fotos]');
    if (!mesa) return;
    mesa.dataset.cuantas = mesa.children.length;
    $('#fotos').hidden = !mesa.children.length;
  }

  // El gran día: el calendario del mes de la boda, de domingo a sábado, con el
  // día encerrado en un círculo a mano. Sin fecha no aparece (en el panel y en
  // modo local se ve con «Fecha por confirmar»).
  const DIAS_SEMANA = [['Dom', 'domingo'], ['Lun', 'lunes'], ['Mar', 'martes'], ['Mié', 'miércoles'], ['Jue', 'jueves'], ['Vie', 'viernes'], ['Sáb', 'sábado']];
  const ANILLO = '<svg class="calendario-anillo" viewBox="0 0 64 64" aria-hidden="true" focusable="false"><path d="M33 6c14 .4 25 10 25 25.5S46.5 58 31 58 6 47 6.4 31.6C6.8 17 18 6.6 31.5 6.2c6-.2 11 1.4 15 4.4"/></svg>';
  function llenarMes(fecha) {
    const seccion = $('#calendario');
    if (!seccion) return;
    const caja = $('[data-calendario-mes]', seccion);
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(E.fecha || '');
    if (!fecha || !m) {
      seccion.hidden = !verVacios();
      caja.innerHTML = '<p class="calendario-pendiente por-confirmar">Fecha por confirmar</p>';
      return;
    }
    seccion.hidden = false;
    const anio = +m[1];
    const mes = +m[2] - 1;
    const dia = +m[3];
    const primero = new Date(Date.UTC(anio, mes, 1)).getUTCDay();
    const total = new Date(Date.UTC(anio, mes + 1, 0)).getUTCDate();
    const nombreMes = new Intl.DateTimeFormat('es-CO', { month: 'long', timeZone: 'UTC' }).format(new Date(Date.UTC(anio, mes, 1)));
    const celdas = Array.from({ length: primero }, () => '<td></td>');
    for (let d = 1; d <= total; d += 1) {
      celdas.push(d === dia
        ? `<td class="calendario-el-dia"><span class="cifra">${d}</span>${ANILLO}${CORAZON}</td>`
        : `<td><span class="cifra">${d}</span></td>`);
    }
    while (celdas.length % 7) celdas.push('<td></td>');
    const filas = [];
    for (let i = 0; i < celdas.length; i += 7) filas.push(`<tr>${celdas.slice(i, i + 7).join('')}</tr>`);
    const hora = P.horaBonita(E.hora);
    caja.innerHTML = `<table class="calendario-mes">
        <caption><span class="calendario-nombre">${esc(nombreMes)}</span> <span class="cifra">${anio}</span></caption>
        <thead><tr>${DIAS_SEMANA.map(([c, l]) => `<th scope="col" abbr="${l}">${c}</th>`).join('')}</tr></thead>
        <tbody>${filas.join('')}</tbody>
      </table>
      <p class="calendario-pie">${conCifras(P.fechaLarga(fecha))}${hora ? ` · ${conCifras(hora)}` : ''}</p>`;
  }

  async function llenarVestimentaFotos() {
    const caja = $('[data-vestimenta-fotos]');
    if (!caja) return;
    const lista = E.vestimenta.fotos || [];
    const urls = await Promise.all(lista.map((f) => window.Datos.urlFoto(f.url)));
    caja.innerHTML = lista.map((f, i) => (urls[i] ? `<li>${fotoImpresa(f, urls[i], {
      alt: f.nota ? `Referencia de vestimenta: ${f.nota}` : `Referencia de vestimenta ${i + 1}`,
      etiqueta: `Ver en grande la referencia${f.nota ? ` «${f.nota}»` : ` ${i + 1}`}`,
      pie: f.nota || '',
    })}</li>` : '')).join('');
    const contar = () => { caja.hidden = !caja.children.length; };
    retirarRotas(caja, contar);
    contar();
  }

  // ---------- Los bloques libres: fotos, galerías y cuenta regresiva ----------

  function llenarLibres() {
    $$('[data-foto-libre]').forEach(async (caja) => {
      const ref = caja.dataset.fotoLibre;
      const url = await window.Datos.urlFoto(ref);
      if (!caja.isConnected || caja.dataset.fotoLibre !== ref) return;
      const pie = caja.dataset.pie;
      caja.innerHTML = url
        ? fotoImpresa({ forma: caja.dataset.forma }, url, { alt: pie || `Foto de ${pareja}`, etiqueta: `Ver en grande la foto${pie ? ` «${pie}»` : ''}`, pie: pie || null })
        : (verVacios() ? '<p class="seccion-pendiente"><b>No se encontró la foto</b><span>Vuelve a elegirla en el panel: Diseño.</span></p>' : '');
      retirarRotas(caja, () => {});
    });
    $$('[data-galeria]').forEach(async (ul) => {
      const fotos = JSON.parse(ul.dataset.galeria);
      const urls = await Promise.all(fotos.map((f) => window.Datos.urlFoto(f.url)));
      if (!ul.isConnected) return;
      ul.innerHTML = fotos.map((f, i) => (urls[i]
        ? `<li>${fotoImpresa(f, urls[i], { alt: `Foto ${i + 1} de ${pareja}`, etiqueta: `Ver en grande la foto ${i + 1}` })}</li>`
        : '')).join('');
      const contar = () => { ul.dataset.cuantas = ul.children.length; };
      retirarRotas(ul, contar);
      contar();
    });
    contarRegresiva();
  }

  // La cuenta regresiva: días, horas, minutos y segundos hasta la ceremonia.
  let relojCuenta = 0;
  function contarRegresiva() {
    clearInterval(relojCuenta);
    const cajas = $$('[data-cuenta-regresiva]');
    if (!cajas.length) return;
    const fecha = P.fechaEvento(E);
    const unidad = (n, uno, varios) => `<span class="cuenta-unidad"><span class="cuenta-cifra cifra">${String(n).padStart(2, '0')}</span><span class="cuenta-nombre">${n === 1 ? uno : varios}</span></span>`;
    const pintar = () => {
      let html;
      if (!fecha) {
        html = '<p class="cuenta-nota por-confirmar">La fecha está por confirmar</p>';
      } else {
        const falta = fecha - Date.now();
        if (falta <= 0) {
          html = `<p class="cuenta-nota">${Date.now() - fecha < 86400000 ? '¡Es hoy!' : '¡Ya nos casamos!'}</p>`;
          clearInterval(relojCuenta);
        } else {
          const s = Math.floor(falta / 1000);
          html = unidad(Math.floor(s / 86400), 'día', 'días') + unidad(Math.floor(s / 3600) % 24, 'hora', 'horas')
            + unidad(Math.floor(s / 60) % 60, 'minuto', 'minutos') + unidad(s % 60, 'segundo', 'segundos');
        }
      }
      cajas.forEach((c) => { c.innerHTML = html; });
    };
    pintar();
    // Con movimiento reducido no corre cada segundo: basta cada minuto.
    if (fecha && fecha > Date.now()) relojCuenta = setInterval(pintar, reducido ? 60000 : 1000);
  }

  // Visor: cualquier foto de la mesa o de la vestimenta se puede ver en grande.
  function prepararVisor() {
    const visor = $('#visor');
    const img = new Image();
    $('[data-visor-foto]', visor).appendChild(img);
    // Las fotos de un mismo grupo (galería, polaroids, álbum…) se pasan con las
    // flechas, con el teclado o deslizando.
    let grupo = [];
    let actual = 0;
    const ver = (k) => {
      actual = (k + grupo.length) % grupo.length;
      const boton = grupo[actual];
      const original = $('img', boton);
      const pie = boton.closest('figure').querySelector('figcaption');
      img.src = original.currentSrc || original.src;
      img.alt = original.alt;
      $('[data-visor-pie]', visor).textContent = pie ? pie.textContent : '';
      visor.dataset.varias = grupo.length > 1 ? 'si' : 'no';
    };
    document.addEventListener('click', (e) => {
      const boton = e.target.closest('.foto-boton');
      if (!boton) return;
      const caja = boton.closest('[data-galeria], [data-polaroids], [data-fotos], .album-pagina, [data-vestimenta-fotos]');
      grupo = caja ? $$('.foto-boton', caja) : [boton];
      ver(Math.max(0, grupo.indexOf(boton)));
      visor.showModal();
    });
    $$('[data-visor-paso]', visor).forEach((b) => b.addEventListener('click', () => ver(actual + Number(b.dataset.visorPaso))));
    visor.addEventListener('keydown', (e) => {
      if (grupo.length < 2) return;
      if (e.key === 'ArrowRight') ver(actual + 1);
      if (e.key === 'ArrowLeft') ver(actual - 1);
    });
    let x0 = null;
    visor.addEventListener('pointerdown', (e) => { x0 = e.clientX; });
    visor.addEventListener('pointerup', (e) => {
      if (x0 == null || grupo.length < 2) return;
      const dx = e.clientX - x0;
      x0 = null;
      if (Math.abs(dx) > 50) ver(actual + (dx < 0 ? 1 : -1));
    });
    $('[data-visor-cerrar]', visor).addEventListener('click', () => visor.close());
    // Tocar fuera de la foto también la cierra.
    visor.addEventListener('click', (e) => { if (e.target === visor) visor.close(); });
  }


  // ---------- Tema Vino & Marfil (2026-11-06) ----------

  const ES_VINO = () => doc.dataset.tema === 'vino';
  const CORAZON = '<svg class="calendario-corazon" viewBox="0 0 64 64" aria-hidden="true" focusable="false"><path d="M32 54C20 45 8 36 8 23.5 8 15.5 14 10 21 10c5 0 9 2.6 11 7 2-4.4 6-7 11-7 7 0 13 5.5 13 13.5C56 36 44 45 32 54z"/></svg>';

  // El icono de cada momento del itinerario, por lo que dice su título.
  const ICONOS_MOMENTO = [
    [/ceremon|misa|iglesia|civil|votos|bendici/i, 'anillos'],
    [/llegada|bienvenida|invitados/i, 'ubicacion'],
    [/c[oó]ctel|brindis|copa|recepci/i, 'copas'],
    [/cena|almuerzo|banquete|comida|plato|men[uú]/i, 'cubiertos'],
    [/foto/i, 'camara'],
    [/pastel|torta|ponqu/i, 'pastel'],
    [/baile|fiesta|rumba|vals|m[uú]sica|dj|hora loca/i, 'fiesta'],
    [/entrada|novios/i, 'corazon'],
    [/fin|despedida|cierre/i, 'sobre'],
  ];
  const iconoMomento = (titulo) => (ICONOS_MOMENTO.find(([re]) => re.test(titulo || '')) || [0, 'reloj'])[1];

  // La URL general de la invitación (sin el código de nadie), para el QR.
  function enlaceGeneral() {
    const u = new URL(C.urlInvitacion || './', location.href);
    u.search = '';
    u.hash = '';
    return u.href;
  }

  // La intro: el bosque con niebla detrás del sobre, y sus textos.
  async function llenarIntro() {
    const p = pagina();
    const mano = (sel, clave) => { const el = $(sel); if (el) el.textContent = Pagina.texto(p, 'portada', clave); };
    mano('[data-intro-arriba]', 'introArriba');
    mano('[data-intro-frase]', 'introFrase');
    $$('[data-abrir-texto]').forEach((el) => { el.textContent = Pagina.texto(p, 'portada', 'abrir'); });
    const ref = (p.portada.introFoto && p.portada.introFoto.url) || (E.fotoPortada && E.fotoPortada.url);
    const url = ref ? await window.Datos.urlFoto(ref) : null;
    // Absoluta: dentro de una variable, una ruta relativa se leería desde assets/.
    if (url) {
      const absoluta = new URL(url, location.href).href;
      doc.style.setProperty('--intro-foto', `url("${absoluta.replace(/"/g, '%22')}")`);
      // Para pedirla desde el <head> en la próxima visita (no las blob: de modo local).
      if (!vistaPanel && /^https?:/.test(absoluta)) {
        try { localStorage.setItem('boda-diego-erika:intro-foto', absoluta); } catch { /* sin almacenamiento */ }
      }
    }
    else doc.style.removeProperty('--intro-foto');
  }

  // La tira de la fecha («SÁBADO | 29 | NOVIEMBRE») y los botones del calendario.
  function llenarFechaVino(fecha) {
    const tira = $('[data-tira-fecha]');
    const acciones = $('[data-calendario-acciones]');
    const formal = $('[data-fecha-formal]');
    if (formal) {
      const hora = P.horaBonita(E.hora);
      mostrar(formal, fecha ? conCifras([P.fechaLarga(fecha), hora, E.ciudad].filter(Boolean).join(' · ')) : '');
    }
    if (!tira && !acciones) return;
    if (!fecha) {
      if (tira) tira.hidden = true;
      if (acciones) acciones.hidden = true;
      return;
    }
    const z = { timeZone: 'America/Bogota' };
    const dia = new Intl.DateTimeFormat('es-CO', Object.assign({ weekday: 'long' }, z)).format(fecha);
    const num = new Intl.DateTimeFormat('es-CO', Object.assign({ day: 'numeric' }, z)).format(fecha);
    const mes = new Intl.DateTimeFormat('es-CO', Object.assign({ month: 'long' }, z)).format(fecha);
    if (tira) {
      tira.innerHTML = `<span>${esc(dia)}</span><span class="tira-dia cifra">${esc(num)}</span><span>${esc(mes)}</span>`;
      tira.hidden = false;
    }
    if (acciones) {
      const f = (d) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
      const c = E.ceremonia;
      const lugar = [c.lugar, c.direccion, E.ciudad].filter(Boolean).join(', ');
      const fechas = E.hora
        ? `${f(fecha)}/${f(new Date(fecha.getTime() + 6 * 3600000))}`
        : `${E.fecha.replace(/-/g, '')}/${new Date(Date.parse(`${E.fecha}T12:00:00Z`) + 86400000).toISOString().slice(0, 10).replace(/-/g, '')}`;
      const g = new URL('https://calendar.google.com/calendar/render');
      g.searchParams.set('action', 'TEMPLATE');
      g.searchParams.set('text', `Boda de ${pareja}`);
      g.searchParams.set('dates', fechas);
      if (lugar) g.searchParams.set('location', lugar);
      g.searchParams.set('details', enlaceGeneral());
      acciones.innerHTML = `<a class="boton-pildora" href="${esc(g.href)}" target="_blank" rel="noopener">${P.icono('calendario')}<span>Agregar a Google Calendar</span></a>
        <button class="enlace-accion" type="button">${P.icono('descargar')}<span>Descargar .ics</span></button>`;
      $('button', acciones).addEventListener('click', () => descargarCalendario(fecha));
      acciones.hidden = false;
    }
  }

  // Polaroids: en blanco y negro, giradas; caen al llegar y, al tocarlas, pasan
  // a color y se enderezan (el segundo toque las abre en grande).
  let mirarPolaroids = null;
  async function llenarPolaroids() {
    const caja = $('[data-polaroids]');
    if (!caja) return;
    const seccion = caja.closest('section');
    let lista = JSON.parse(caja.dataset.polaroids || '[]');
    if (!lista.length) lista = (E.fotos || []).slice(0, 4);
    const urls = await Promise.all(lista.map((f) => window.Datos.urlFoto(f.url)));
    if (!caja.isConnected) return;
    const giros = [-4, 3, -2, 4];
    caja.innerHTML = lista.map((f, i) => (urls[i] ? `<div class="polaroid" style="--giro: ${giros[i % 4]}deg; --d: ${i * 140}ms">${fotoImpresa({ forma: 'vertical' }, urls[i], { alt: `Foto ${i + 1} de ${pareja}`, etiqueta: `Ver en grande la foto ${i + 1} de ${pareja}` })}</div>` : '')).join('');
    seccion.hidden = !caja.children.length;
    if (mirarPolaroids) mirarPolaroids.disconnect();
    if (reducido || !('IntersectionObserver' in window)) {
      caja.classList.add('caidas');
      return;
    }
    mirarPolaroids = new IntersectionObserver((entradas) => {
      if (entradas.some((e) => e.isIntersecting)) {
        caja.classList.add('caidas');
        mirarPolaroids.disconnect();
      }
    }, { threshold: 0.25 });
    mirarPolaroids.observe(caja);
  }

  // La tarjeta formal está dentro de su sobre y sale al llegar a ella.
  let mirarSobre = null;
  function mirarFormal() {
    const sobre = $('[data-formal-sobre]');
    if (!sobre) return;
    if (mirarSobre) mirarSobre.disconnect();
    if (reducido || !('IntersectionObserver' in window)) {
      sobre.classList.add('fuera');
      return;
    }
    mirarSobre = new IntersectionObserver((entradas) => {
      if (!entradas.some((e) => e.isIntersecting)) return;
      sobre.classList.add('fuera');
      mirarSobre.disconnect();
    }, { threshold: 0.35 });
    mirarSobre.observe(sobre);
  }

  // En Vino & Marfil el sobre de la intro muestra la solapa con el lacre desde
  // el principio (como en el video de referencia): no se voltea.
  function prepararSobre() {
    if (abierto || doc.classList.contains('abriendo')) return;
    const cara = ES_VINO() ? 'dorso' : 'frente';
    $$('.escena .sobre').forEach((el) => { el.dataset.cara = cara; });
  }

  // La foto con frase: una de la pareja si no tiene propia.
  async function llenarParallax() {
    const caja = $('[data-parallax]');
    if (!caja) return;
    const lista = E.fotos || [];
    const ref = caja.dataset.parallax || (lista[3] || lista[lista.length - 1] || E.fotoPortada || {}).url;
    const url = ref ? await window.Datos.urlFoto(ref) : null;
    if (!caja.isConnected) return;
    caja.closest('section').hidden = !url;
    if (url) caja.style.backgroundImage = `url("${url.replace(/"/g, '%22')}")`;
  }

  function escenaParallax() {
    escenas.push(() => {
      const caja = $('[data-parallax]');
      if (!caja || reducido) return;
      const r = caja.parentElement.getBoundingClientRect();
      if (r.bottom < 0 || r.top > innerHeight) return;
      const k = limitar((innerHeight - r.top) / (innerHeight + r.height));
      caja.style.transform = `translate3d(0, ${((k - 0.5) * -90).toFixed(1)}px, 0)`;
    });
  }

  document.addEventListener('click', async (e) => {
    const b = e.target.closest('[data-copiar], [data-ver-datos]');
    if (!b) return;
    if (b.matches('[data-ver-datos]')) {
      const datos = document.getElementById(b.getAttribute('aria-controls'));
      const abrirlos = datos.hidden;
      datos.hidden = !abrirlos;
      b.setAttribute('aria-expanded', abrirlos ? 'true' : 'false');
      $('span', b).textContent = abrirlos ? 'Ocultar datos' : 'Ver datos';
      return;
    }
    const valor = b.dataset.copiar;
    const etiqueta = $('span', b);
    const normal = etiqueta.textContent;
    let ok = false;
    try { await navigator.clipboard.writeText(valor); ok = true; } catch { /* sin portapapeles */ }
    etiqueta.textContent = ok ? (b.dataset.copiado || 'Copiado') : 'No se pudo copiar';
    setTimeout(() => { etiqueta.textContent = normal; }, 2200);
  });

  // El cierre: la foto en el camafeo, la frase, «¡Gracias!» y el pie.
  async function llenarCierre(fecha) {
    const p = pagina();
    const frase = $('[data-cierre-frase]');
    if (!frase) return;
    frase.innerHTML = window.Bloques.parrafos(Pagina.texto(p, 'cierre', 'frase'));
    frase.hidden = !frase.innerHTML;
    const gracias = $('[data-cierre-gracias]');
    gracias.textContent = Pagina.texto(p, 'cierre', 'gracias');
    gracias.hidden = !gracias.textContent;
    const pie = $('[data-pie-fecha]');
    pie.textContent = fecha ? new Intl.DateTimeFormat('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'America/Bogota' }).format(fecha).replace(/\//g, ' · ') : '';
    const lista = E.fotos || [];
    const ref = (p.cierre.foto && p.cierre.foto.url) || (lista[lista.length - 1] || E.fotoPortada || {}).url;
    const url = ref ? await window.Datos.urlFoto(ref) : null;
    const camafeo = $('[data-camafeo]');
    camafeo.hidden = !url;
    $('[data-camafeo-foto]').innerHTML = url ? `<img src="${esc(url)}" alt="${esc(pareja)}" loading="lazy" decoding="async">` : '';
  }

  // Los textos que cambian si la invitación es para una persona o para varias.
  function textosVarios() {
    const t = $('[data-texto-formal]');
    const b = bloque('invitacion');
    if (t && b) t.innerHTML = conCifras(Pagina.texto(pagina(), b, 'texto', { varios: plural() }));
  }

  // ---------- Invitado ----------

  function llenarInvitado() {
    textosVarios();
    const inv = estado.invitacion;
    const nombre = inv ? inv.nombre : 'nuestros invitados';
    const numero = inv ? P.numeroSobre(inv.numero) : '···';
    $$('[data-numero]').forEach((el) => { el.textContent = numero; });
    $('[data-nombre]').textContent = nombre;
    $('[data-cupos]').innerHTML = inv ? `<span class="cifra">${inv.cupos}</span> ${inv.cupos === 1 ? 'CUPO RESERVADO' : 'CUPOS RESERVADOS'}` : '';
    // Los textos de la página (Diseño): para una persona o para varias.
    const varios = Boolean(inv && inv.cupos > 1);
    $('[data-texto-invitacion]').textContent = Pagina.texto(pagina(), 'portada', 'texto', { varios });
    const responder = bloque('responder');
    const tituloResponder = $('[data-titulo-responder]');
    if (responder && tituloResponder) tituloResponder.innerHTML = window.Bloques.cifras(Pagina.texto(pagina(), responder, 'titulo', { varios }));

    const nombreSobre = $('[data-nombre-sobre]');
    const ya = nombreSobre.textContent;
    nombreSobre.textContent = nombre;
    const paraDorso = $('[data-para-dorso]');
    if (paraDorso) paraDorso.textContent = inv ? `Para ${nombre}` : '';
    $('[data-cupos-sobre]').innerHTML = inv ? `<span class="cifra">${inv.cupos}</span> ${inv.cupos === 1 ? 'CUPO' : 'CUPOS'}` : '';
    $('[data-sobre-etiqueta]').textContent = inv
      ? `Abrir la invitación de Diego y Erika para ${nombre}`
      : 'Abrir la invitación de Diego y Erika';
    if (ya !== nombre && !reducido) {
      const rubrica = $('.sobre-rubrica');
      [nombreSobre, rubrica].forEach((el) => {
        el.classList.remove('escribiendo');
        void el.getBoundingClientRect();
        el.classList.add('escribiendo');
      });
    }

    pintarMesa();

    const ms = $('[data-matasellos-sobre]');
    if (inv && inv.estado !== 'pendiente') {
      ms.innerHTML = P.matasellos({ texto: inv.estado === 'confirmado' ? 'CONFIRMADO' : 'RESPONDIDO', fecha: inv.respondidoEn });
      ms.dataset.estado = inv.estado;
    } else {
      ms.innerHTML = '';
    }
    document.title = inv ? `Para ${nombre} · Diego & Erika` : 'Diego & Erika · Invitación de boda';
  }

  async function cargar() {
    if (!codigo) {
      estado.carga = 'sin-codigo';
      llenarInvitado();
      pintarRespuesta();
      return;
    }
    estado.carga = 'cargando';
    pintarRespuesta();
    try {
      const inv = await window.Datos.invitacion(codigo, { marcar: !vistaPanel });
      estado.invitacion = inv;
      estado.carga = inv ? 'lista' : 'no-encontrada';
      if (inv) {
        estado.cuantos = inv.estado === 'confirmado' && inv.asistentes ? inv.asistentes : inv.cupos;
        estado.nombres = (inv.nombresAsistentes || []).slice();
        estado.alergias = inv.alergias || '';
        estado.cancion = inv.cancion || '';
      }
    } catch (e) {
      estado.carga = 'error';
      estado.error = e.message;
    }
    llenarInvitado();
    pintarRespuesta();
  }

  // ---------- Tarjeta de respuesta ----------

  const CHECK = '<svg viewBox="0 0 30 30" aria-hidden="true"><path d="M6 16l6 7L26 4"/></svg>';
  // «Ana, Luis y Marta»
  const LISTA = new Intl.ListFormat('es', { style: 'long', type: 'conjunction' });

  function contactoHtml() {
    const tel = C.contacto && C.contacto.whatsapp ? String(C.contacto.whatsapp).replace(/\D/g, '') : '';
    return tel
      ? `<a class="enlace-accion" href="https://wa.me/${tel}" target="_blank" rel="noopener">${P.icono('whatsapp')}<span>Escribirnos por WhatsApp</span></a>`
      : '';
  }

  function pintarRespuesta() {
    const caja = $('[data-respuesta]');
    const inv = estado.invitacion;
    if (!caja) return;

    if (estado.carga === 'cargando') {
      caja.innerHTML = `<h2 class="respuesta-titulo">${t('¿Nos acompañas?', '¿Nos acompañan?', '¿Nos acompaña?')}</h2><p class="respuesta-sub">${t('Buscando tu tarjeta…', 'Buscando su tarjeta…', 'Buscando su tarjeta…')}</p>`;
      return;
    }
    if (estado.carga === 'sin-codigo') {
      caja.innerHTML = `<h2 class="respuesta-titulo">${t('¿Nos acompañas?', '¿Nos acompañan?', '¿Nos acompaña?')}</h2>
        <p class="respuesta-sub">${t(
          'Esta tarjeta se responde desde el enlace personal que te enviamos. Ábrelo desde el mensaje y aquí aparecerán tu nombre y tus cupos.',
          'Esta tarjeta se responde desde el enlace personal que les enviamos. Ábranlo desde el mensaje y aquí aparecerán su nombre y sus cupos.',
          'Esta tarjeta se responde desde el enlace personal que le enviamos. Ábralo desde el mensaje y aquí aparecerán su nombre y sus cupos.',
        )}</p>${contactoHtml()}`;
      return;
    }
    if (estado.carga === 'no-encontrada') {
      caja.innerHTML = `<h2 class="respuesta-titulo">${t('No encontramos tu tarjeta', 'No encontramos su tarjeta', 'No encontramos su tarjeta')}</h2>
        <p class="respuesta-sub">${t(
          'Revisa que el enlace esté completo, tal como te llegó. Si el problema sigue, escríbenos.',
          'Revisen que el enlace esté completo, tal como les llegó. Si el problema sigue, escríbannos.',
          'Revise que el enlace esté completo, tal como le llegó. Si el problema sigue, escríbanos.',
        )}</p>${contactoHtml()}`;
      return;
    }
    if (estado.carga === 'error') {
      caja.innerHTML = `<h2 class="respuesta-titulo">${t('No pudimos traer tu tarjeta', 'No pudimos traer su tarjeta', 'No pudimos traer su tarjeta')}</h2>
        <p class="respuesta-sub">${esc(estado.error || t('Revisa tu conexión a internet.', 'Revisen su conexión a internet.', 'Revise su conexión a internet.'))}</p>
        <button class="enlace-accion" type="button" data-reintentar>${P.icono('actualizar')}<span>Intentar de nuevo</span></button>`;
      $('[data-reintentar]', caja).addEventListener('click', cargar);
      return;
    }

    if (inv.estado !== 'pendiente' && !estado.editando) {
      pintarRespondida(caja, inv);
      return;
    }
    pintarFormulario(caja, inv);
  }

  function pintarRespondida(caja, inv) {
    const va = inv.estado === 'confirmado';
    const mesaVisible = (mesaDelInvitado() || {}).mesa;
    const titulo = va ? '¡Qué alegría!' : 'Gracias por avisarnos';
    let resumen;
    if (va) {
      resumen = inv.cupos === 1
        ? t('Confirmaste tu asistencia. Diego y Erika ya tienen tu respuesta.', '', 'Confirmó su asistencia. Diego y Erika ya tienen su respuesta.')
        : `Confirmaron <b>${inv.asistentes}</b> de ${inv.cupos} cupos. Diego y Erika ya tienen su respuesta.`;
    } else {
      resumen = t(
        'Te vamos a extrañar. Si tus planes cambian, puedes cambiar la respuesta aquí mismo.',
        'Los vamos a extrañar. Si sus planes cambian, pueden cambiar la respuesta aquí mismo.',
        'Nos va a hacer falta. Si sus planes cambian, puede cambiar la respuesta aquí mismo.',
      );
    }
    const quienes = va && inv.nombresAsistentes && inv.nombresAsistentes.length ? LISTA.format(inv.nombresAsistentes) : '';
    const datos = va ? [['Van', quienes], ['Comida', inv.alergias], ['Canción', inv.cancion]].filter(([, v]) => v) : [];
    caja.innerHTML = `<div class="respuesta-hecha${estado.recienSellada ? ' recien-sellada' : ''}" data-estado="${inv.estado}">
        ${P.matasellos({ texto: va ? 'CONFIRMADO' : 'RESPONDIDO', fecha: inv.respondidoEn })}
        <h2 class="respuesta-titulo">${titulo}</h2>
        <p class="respuesta-resumen">${resumen}</p>
        ${datos.length ? `<dl class="respuesta-datos">${datos.map(([e, v]) => `<div><dt>${e}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>` : ''}
        ${inv.mensaje ? `<blockquote class="respuesta-cita">${esc(inv.mensaje)}</blockquote>` : ''}
        <div class="respuesta-acciones">
          ${mesaVisible ? `<a class="enlace-accion" href="#mesa">${P.icono('mesa')}<span>Ver ${t('tu', 'su', 'su')} mesa: la <span class="cifra">${mesaVisible.numero}</span></span></a>` : ''}
          <button class="enlace-accion" type="button" data-cambiar>${P.icono('editar')}<span>Cambiar la respuesta</span></button>
        </div>
      </div>`;
    estado.recienSellada = false;
    $('[data-cambiar]', caja).addEventListener('click', () => {
      estado.editando = true;
      estado.eleccion = inv.estado === 'confirmado' ? 'si' : 'no';
      estado.mensaje = inv.mensaje || '';
      estado.nombres = (inv.nombresAsistentes || []).slice();
      estado.alergias = inv.alergias || '';
      estado.cancion = inv.cancion || '';
      pintarRespuesta();
      const marcado = $('input[name="asiste"]:checked', caja);
      if (marcado) marcado.focus();
    });
  }

  function pintarFormulario(caja, inv) {
    const limite = E.fechaLimiteRespuesta ? P.diaMes(E.fechaLimiteRespuesta) : null;
    const sub = limite ? t(`Por favor responde antes del ${limite}.`, `Por favor respondan antes del ${limite}.`, `Por favor responda antes del ${limite}.`) : '';
    const si = t('Asistiré con gusto', 'Asistiremos con gusto');
    const no = t('Lamento no poder ir', 'Lamentamos no poder ir');
    // Preguntas que solo se hacen a quien va, si los novios las encendieron.
    const pide = E.respuesta || {};
    const extra = (clave, etiqueta, ejemplo, max) => (pide[clave] ? `<label class="renglon-campo" data-solo-si${estado.eleccion === 'si' ? '' : ' hidden'}>
            <span class="campo-etiqueta">${etiqueta} <em>(opcional)</em></span>
            <input type="text" name="${clave}" maxlength="${max}" value="${esc(estado[clave])}" placeholder="${ejemplo}" autocomplete="off">
          </label>` : '');
    caja.innerHTML = `<form class="respuesta-form" novalidate>
        <fieldset>
          <legend class="respuesta-titulo">${t('¿Nos acompañas?', '¿Nos acompañan?', '¿Nos acompaña?')}</legend>
          ${sub ? `<p class="respuesta-sub">${conCifras(sub)}</p>` : ''}
          <div class="eleccion-opciones">
            <label class="opcion"><input type="radio" name="asiste" value="si"${estado.eleccion === 'si' ? ' checked' : ''}><span class="opcion-caja">${CHECK}</span><span>${si}</span></label>
            <label class="opcion"><input type="radio" name="asiste" value="no"${estado.eleccion === 'no' ? ' checked' : ''}><span class="opcion-caja">${CHECK}</span><span>${no}</span></label>
          </div>
        </fieldset>
        <div class="respuesta-detalle"${estado.eleccion ? '' : ' hidden'}>
          ${inv.cupos > 1 ? `<div class="cuantos" data-cuantos${estado.eleccion === 'si' ? '' : ' hidden'}>
            <span class="campo-etiqueta" id="cuantos-etiqueta">¿Cuántos irán?</span>
            <div class="contador" role="group" aria-labelledby="cuantos-etiqueta">
              <button type="button" class="contador-boton" data-menos aria-label="Uno menos">${P.icono('menos')}</button>
              <output class="contador-valor" aria-live="polite">${estado.cuantos}</output>
              <button type="button" class="contador-boton" data-mas aria-label="Uno más">${P.icono('mas')}</button>
              <span class="contador-de">de ${inv.cupos} cupos</span>
            </div>
            <fieldset class="quienes">
              <legend class="campo-etiqueta">¿Quiénes van?</legend>
              <ol class="quienes-lista" data-quienes></ol>
            </fieldset>
          </div>` : ''}
          ${extra('alergias', t('¿Tienes alguna alergia o restricción con la comida?', '¿Alguno tiene alergias o restricciones con la comida?', '¿Tiene alguna alergia o restricción con la comida?'), 'Vegetariano, sin gluten, alergia al maní…', 300)}
          ${extra('cancion', 'Una canción que no puede faltar en la fiesta', 'Canción y artista', 120)}
          <label class="mensaje-campo">
            <span class="campo-etiqueta">Unas palabras para Diego y Erika <em>(opcional)</em></span>
            <textarea name="mensaje" rows="3" maxlength="1000">${esc(estado.mensaje)}</textarea>
          </label>
          <button class="boton-responder" type="submit"${vistaPanel ? ' disabled' : ''}>Enviar respuesta</button>
          <p class="respuesta-error" role="alert">${esc(estado.error)}</p>
        </div>
        ${vistaPanel ? '<p class="respuesta-nota">Vista previa desde el panel: esta tarjeta no envía respuestas ni cuenta como abierta.</p>' : ''}
        ${estado.editando ? '<button class="enlace-accion" type="button" data-cancelar>Dejar la respuesta como estaba</button>' : ''}
      </form>`;

    const form = $('form', caja);
    const detalle = $('.respuesta-detalle', form);
    const cuantos = $('[data-cuantos]', form);
    const valor = $('.contador-valor', form);
    const menos = $('[data-menos]', form);
    const mas = $('[data-mas]', form);

    // Un renglón por cada persona que va; lo escrito se guarda al cambiar el número.
    const listaQuienes = $('[data-quienes]', form);
    function pintarQuienes() {
      if (!listaQuienes) return;
      listaQuienes.innerHTML = Array.from({ length: estado.cuantos }, (_, k) => `<li class="quien">
          <input type="text" name="quien" data-quien="${k}" maxlength="80" value="${esc(estado.nombres[k] || '')}" placeholder="Nombre y apellido" aria-label="Nombre de la persona ${k + 1}" autocomplete="${k ? 'off' : 'name'}">
        </li>`).join('');
    }

    function actualizarContador() {
      if (!valor) return;
      valor.textContent = estado.cuantos;
      menos.disabled = estado.cuantos <= 1;
      mas.disabled = estado.cuantos >= inv.cupos;
      pintarQuienes();
    }
    actualizarContador();
    if (listaQuienes) {
      listaQuienes.addEventListener('input', (e) => {
        const k = Number(e.target.dataset.quien);
        if (Number.isInteger(k)) estado.nombres[k] = e.target.value;
        e.target.removeAttribute('aria-invalid');
      });
    }

    $$('input[name="asiste"]', form).forEach((r) => r.addEventListener('change', () => {
      estado.eleccion = r.value;
      estado.error = '';
      $('.respuesta-error', form).textContent = '';
      detalle.hidden = false;
      if (cuantos) cuantos.hidden = r.value !== 'si';
      $$('[data-solo-si]', form).forEach((el) => { el.hidden = r.value !== 'si'; });
    }));
    $$('.renglon-campo input', form).forEach((i) => i.addEventListener('input', () => { estado[i.name] = i.value; }));
    if (menos) {
      menos.addEventListener('click', () => { estado.cuantos = Math.max(1, estado.cuantos - 1); actualizarContador(); });
      mas.addEventListener('click', () => { estado.cuantos = Math.min(inv.cupos, estado.cuantos + 1); actualizarContador(); });
    }
    $('textarea', form).addEventListener('input', (e) => { estado.mensaje = e.target.value; });
    const cancelar = $('[data-cancelar]', form);
    if (cancelar) cancelar.addEventListener('click', () => { estado.editando = false; estado.error = ''; pintarRespuesta(); });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (vistaPanel || estado.enviando) return;
      const errorEl = $('.respuesta-error', form);
      if (!estado.eleccion) {
        errorEl.textContent = t('Marca si vienes o no para poder enviar.', 'Marquen si vienen o no para poder enviar.', 'Marque si viene o no para poder enviar.');
        return;
      }
      // Con más de un cupo, quien va dice quiénes: un nombre por persona.
      const pideNombres = estado.eleccion === 'si' && inv.cupos > 1;
      if (pideNombres) {
        const vacio = $$('[data-quien]', form).find((i) => !i.value.trim());
        if (vacio) {
          vacio.setAttribute('aria-invalid', 'true');
          vacio.focus();
          errorEl.textContent = t('Escribe el nombre de cada persona que va.', 'Escriban el nombre de cada persona que va.', 'Escriba el nombre de cada persona que va.');
          return;
        }
      }
      const boton = $('.boton-responder', form);
      estado.enviando = true;
      boton.disabled = true;
      boton.innerHTML = '<span class="girando" aria-hidden="true"></span><span>Enviando…</span>';
      const va = estado.eleccion === 'si';
      try {
        const actualizada = await window.Datos.responder(codigo, {
          asiste: va,
          asistentes: inv.cupos === 1 ? 1 : estado.cuantos,
          // Quiénes van (con un solo cupo, la persona del sobre).
          nombres: pideNombres ? estado.nombres.slice(0, estado.cuantos).map((n) => String(n || '').trim()) : [],
          mensaje: estado.mensaje,
          // Sin la pregunta en la tarjeta no se manda: lo que había se queda.
          alergias: pide.alergias ? (va ? estado.alergias : '') : undefined,
          cancion: pide.cancion ? (va ? estado.cancion : '') : undefined,
        });
        estado.invitacion = actualizada;
        estado.editando = false;
        estado.error = '';
        estado.recienSellada = !reducido;
        estado.mesaRecien = true;
        llenarInvitado();
        pintarRespuesta();
        $('#respuesta').scrollIntoView({ behavior: reducido ? 'auto' : 'smooth', block: 'nearest' });
      } catch (err) {
        estado.error = `${err.message} ${t('Tu respuesta no se envió.', 'Su respuesta no se envió.', 'Su respuesta no se envió.')}`;
        errorEl.textContent = estado.error;
        boton.disabled = false;
        boton.textContent = 'Enviar respuesta';
      } finally {
        estado.enviando = false;
      }
    });
  }

  // ---------- Tarjeta de mesa ----------

  async function cargarSalon() {
    try {
      salon = await window.Datos.salon();
    } catch {
      salon = null;
    }
    pintarMesa();
    // La tarjeta ya respondida lleva el enlace a la mesa.
    if (estado.invitacion && estado.invitacion.estado !== 'pendiente' && !estado.editando) pintarRespuesta();
  }

  // Qué mostrar: nada, la mesa, o «por confirmar» si aún no le asignan una.
  function mesaDelInvitado() {
    const inv = estado.invitacion;
    if (!inv || inv.estado !== 'confirmado' || !salon || !salon.mostrar) return null;
    const mesa = inv.mesa ? salon.piezas.find((p) => p.id === inv.mesa && Salon.esMesa(p)) : null;
    return { mesa: mesa || null };
  }

  function pintarMesa() {
    const tarjeta = $('#mesa');
    const enlace = $('[data-para-mesa]');
    if (!tarjeta) return;
    const ver = mesaDelInvitado();
    const mesa = ver && ver.mesa;
    enlace.hidden = !mesa;
    if (mesa) {
      enlace.innerHTML = `Mesa <span class="cifra">${mesa.numero}</span>`;
      enlace.setAttribute('aria-label', `${t('Tu mesa', 'Su mesa', 'Su mesa')}: la ${mesa.numero}. Ver dónde queda en el plano`);
    }
    if (!ver) {
      tarjeta.hidden = true;
      delete tarjeta.dataset.clave;
      return;
    }
    // Se vuelve a pintar solo si algo cambió: así el círculo no se traza dos veces.
    const clave = JSON.stringify([estado.invitacion.nombre, mesa, mesa && salon.piezas]);
    if (tarjeta.dataset.clave === clave && !tarjeta.hidden) return;
    tarjeta.dataset.clave = clave;
    const nombre = `<p class="mesa-para">Para</p><p class="mesa-invitado">${esc(estado.invitacion.nombre)}</p>`;
    if (!mesa) {
      $('[data-mesa]', tarjeta).innerHTML = `${nombre}
        <h2 class="mesa-titulo" id="mesa-titulo"><span class="mesa-palabra">${t('Tu mesa', 'Su mesa', 'Su mesa')}</span><span class="mesa-pendiente por-confirmar">por confirmar</span></h2>
        <p class="mesa-nota">${t(
          'Diego y Erika están organizando las mesas. Vuelve a abrir tu invitación más cerca del día para ver la tuya.',
          'Diego y Erika están organizando las mesas. Vuelvan a abrir su invitación más cerca del día para ver la suya.',
          'Diego y Erika están organizando las mesas. Vuelva a abrir su invitación más cerca del día para ver la suya.',
        )}</p>`;
    } else {
      const plano = Salon.dibujar(salon, {
        modo: 'invitado',
        destacada: mesa.id,
        titulo: `Plano del salón con la mesa ${mesa.numero} encerrada en un círculo`,
      });
      $('[data-mesa]', tarjeta).innerHTML = `${nombre}
        <h2 class="mesa-titulo" id="mesa-titulo"><span class="mesa-palabra">Mesa</span><span class="mesa-cifra cifra">${mesa.numero}</span></h2>
        ${mesa.nombre ? `<p class="mesa-apodo">${conCifras(mesa.nombre)}</p>` : ''}
        <figure class="mesa-plano">
          ${plano}
          <figcaption>${t('Tu mesa', 'Su mesa', 'Su mesa')} es la que está encerrada en el plano del salón.</figcaption>
        </figure>`;
    }
    const aparece = tarjeta.hidden;
    tarjeta.hidden = false;
    repartirMesa(tarjeta, aparece);
  }

  // La tarjeta de mesa se reparte sobre la mesa verde al llegar a ella, y el
  // círculo se traza a mano; al confirmar, llega enseguida.
  let mirarMesa = null;
  function repartirMesa(tarjeta, aparece) {
    if (mirarMesa) mirarMesa.disconnect();
    tarjeta.classList.remove('vista');
    if (reducido || !('IntersectionObserver' in window)) {
      tarjeta.classList.add('vista');
      return;
    }
    if (aparece) tarjeta.classList.add('por-repartir');
    mirarMesa = new IntersectionObserver((entradas) => {
      if (!entradas.some((e) => e.isIntersecting)) return;
      mirarMesa.disconnect();
      const pausa = estado.mesaRecien ? 700 : 0;
      estado.mesaRecien = false;
      setTimeout(() => {
        tarjeta.classList.remove('por-repartir');
        tarjeta.classList.add('vista');
      }, pausa);
    }, { threshold: 0.25 });
    mirarMesa.observe(tarjeta);
  }

  // ---------- Scroll: la tarjeta se asienta y el día se traza ----------

  const escenas = [];
  let pedido = false;

  const limitar = (x) => Math.min(1, Math.max(0, x));

  // 0 cuando la sección llega arriba, 1 cuando su recorrido fijo termina.
  // Sin recorrido (movimiento reducido) la escena se queda en su inicio.
  function recorrido(r) {
    const largo = r.height - innerHeight;
    return largo > 0 ? limitar(-r.top / largo) : 0;
  }

  function pedirCuadro() {
    if (pedido) return;
    pedido = true;
    requestAnimationFrame(() => {
      pedido = false;
      escenas.forEach((s) => s());
    });
  }

  function escenaPortada() {
    const seccion = $('#portada');
    const escenario = $('.portada-escenario', seccion);
    if (reducido) return;
    escenas.push(() => {
      const r = seccion.getBoundingClientRect();
      if (r.bottom < 0) return;
      escenario.style.setProperty('--p', recorrido(r).toFixed(4));
    });
  }

  // El itinerario puede estar en cualquier lugar de la página (o no estar): se
  // busca en cada cuadro, porque los bloques se vuelven a pintar.
  function escenaDia() {
    escenas.push(() => {
      const caja = $('.dia');
      if (!caja) return;
      const r = caja.getBoundingClientRect();
      if (r.bottom < -innerHeight || r.top > innerHeight * 2) return;
      // El hilo llega hasta un poco más abajo de la mitad de la pantalla.
      const linea = innerHeight * 0.62;
      const puntos = $$('.dia-punto', caja).map((p) => p.getBoundingClientRect());
      caja.style.setProperty('--hilo', reducido ? 1 : limitar((linea - r.top) / r.height).toFixed(4));
      $$('.dia-momento', caja).forEach((m, i) => {
        m.classList.toggle('alcanzado', reducido || puntos[i].top + puntos[i].height / 2 <= linea);
      });
    });
  }

  // La tarjeta de respuesta se reparte sobre la mesa al llegar a ella. Cada vez
  // que se pintan los bloques hay una tarjeta nueva que espera su turno.
  let mirarRespuesta = null;
  function repartirRespuesta() {
    const tarjeta = $('#respuesta');
    if (mirarRespuesta) mirarRespuesta.disconnect();
    if (!tarjeta || reducido || !('IntersectionObserver' in window)) return;
    tarjeta.classList.add('por-repartir');
    mirarRespuesta = new IntersectionObserver((entradas) => {
      if (!entradas.some((e) => e.isIntersecting)) return;
      tarjeta.classList.remove('por-repartir');
      mirarRespuesta.disconnect();
    });
    mirarRespuesta.observe(tarjeta);
  }

  // ---------- Vista previa del editor (panel → Diseño) ----------

  let elegido = null;

  // El bloque elegido en el panel se enmarca en la vista previa.
  function marcarElegido() {
    $$('.bloque-elegido').forEach((el) => el.classList.remove('bloque-elegido'));
    const el = elegido && $(`[data-bloque="${CSS.escape(elegido)}"]`);
    if (el) el.classList.add('bloque-elegido');
    return el;
  }

  // Los invitados de muestra: uno solo o una familia, sin respuesta todavía.
  function invitadoDeMuestra(cuantos) {
    const varios = cuantos === 'varios';
    return { numero: 27, nombre: varios ? 'Familia Rodríguez' : 'Ana Rodríguez', cupos: varios ? 3 : 1, estado: 'pendiente', asistentes: 0, mensaje: '', respondidoEn: null };
  }

  function prepararEditor() {
    doc.classList.add('editando');
    addEventListener('message', (e) => {
      if (e.origin !== location.origin || e.source !== window.parent || !e.data) return;
      const m = e.data;
      if (m.tipo === 'diseno') {
        borrador = { pagina: Pagina.normalizar(m.pagina), estilo: Estilos.normalizar(m.estilo), mariposa: m.mariposa !== false };
        const inv = invitadoDeMuestra(m.invitado);
        if (!estado.invitacion || estado.invitacion.cupos !== inv.cupos) {
          estado.invitacion = inv;
          estado.cuantos = inv.cupos;
          estado.carga = 'lista';
          estado.eleccion = null;
        }
        llenarEvento();
        llenarInvitado();
        pintarRespuesta();
      } else if (m.tipo === 'elegir') {
        elegido = m.id || null;
        const el = marcarElegido();
        if (el && m.mostrar) el.scrollIntoView({ behavior: reducido ? 'auto' : 'smooth', block: 'center' });
      }
    });
    // Tocar un bloque lo elige en el panel; en la vista previa nada navega ni se envía.
    document.addEventListener('click', (e) => {
      const el = e.target.closest('[data-bloque]');
      if (e.target.closest('dialog')) return;
      e.preventDefault();
      if (!el) return;
      elegido = el.dataset.bloque;
      marcarElegido();
      window.parent.postMessage({ tipo: 'elegido', id: elegido }, location.origin);
    }, true);
    window.parent.postMessage({ tipo: 'lista' }, location.origin);
  }

  // ---------- El sobre ----------

  let ramoSvg = null;
  let abierto = false;

  const espera = (ms) => new Promise((r) => setTimeout(r, ms));

  function fuentesListas() {
    if (!document.fonts || !document.fonts.ready) return Promise.resolve();
    return Promise.race([document.fonts.ready, espera(1500)]);
  }

  function animar(el, cuadros, opciones) {
    const a = el.animate(cuadros, Object.assign({ fill: 'forwards' }, opciones));
    return a.finished.catch(() => {});
  }

  function terminarIntro() {
    doc.classList.remove('intro', 'abriendo');
    doc.classList.add('recien-abierta');
    abierto = true;
    try { sessionStorage.setItem(CLAVE_ABIERTA, '1'); } catch { /* sin almacenamiento */ }
    // La tarjeta aparece donde estaba el sobre y el ramo florece mientras tanto.
    $('#tarjeta').animate([{ opacity: 0 }, { opacity: 1 }], { duration: reducido ? 250 : 900, easing: 'ease-out' });
    // El ramo no va en Vino & Marfil (pedido de Mario, 2026-11-06).
    if (!reducido && ramoSvg) Ramo.florecer(ramoSvg);
    pedirCuadro();
    // El foco pasa del sobre (que desaparece) al título de la tarjeta.
    const titulo = [$('#nombres'), $('#album-titulo')].find((el) => el && el.offsetParent) || $('#nombres');
    titulo.setAttribute('tabindex', '-1');
    requestAnimationFrame(() => titulo.focus({ preventScroll: true }));
    setTimeout(() => doc.classList.remove('recien-abierta'), 3200);
  }

  async function abrir() {
    if (abierto || doc.classList.contains('abriendo')) return;
    // La música arranca con el toque que abre el sobre (nunca sola).
    if (window.Musica && !vistaPanel) window.Musica.abierta({ gesto: true });
    doc.classList.add('abriendo');
    window.scrollTo(0, 0);
    await fuentesListas();

    if (reducido) {
      await animar($('.escena'), [{ opacity: 1 }, { opacity: 0 }], { duration: 250 });
      terminarIntro();
      return;
    }

    const atras = $('.sobre-atras');
    const delante = $('.sobre-delante');
    const pares = [atras, delante];
    const cerrada = $('.solapa-cerrada');

    // 1. El sobre se voltea (en Vino & Marfil ya muestra la solapa).
    if (!ES_VINO()) await Promise.all(pares.map((el) => animar(el, [
      { transform: 'none' },
      { transform: 'translateY(-14px) scaleX(0.02) rotate(-1.5deg)' },
    ], { duration: 300, easing: 'cubic-bezier(.55,0,.75,.2)' })));
    if (!ES_VINO()) {
      pares.forEach((el) => { el.dataset.cara = 'dorso'; });
      await Promise.all(pares.map((el) => animar(el, [
        { transform: 'translateY(-14px) scaleX(0.02) rotate(-1.5deg)' },
        { transform: 'none' },
      ], { duration: 420, easing: 'cubic-bezier(.16,1,.3,1)' })));
    }
    await espera(160);

    // 1b. En Vino & Marfil el sello de lacre se rompe antes de abrir.
    const lacre = $('.sobre-sello-cierre');
    if (ES_VINO() && lacre) {
      await animar(lacre, [
        { transform: 'scale(1) rotate(0deg)', opacity: 1, filter: 'none' },
        { transform: 'scale(1.12) rotate(-4deg)', opacity: 1, offset: 0.35 },
        { transform: 'scale(1.3) rotate(10deg)', opacity: 0 },
      ], { duration: 520, easing: 'cubic-bezier(.5,0,.75,0)' });
    }

    // 2. La solapa se levanta con su sello y deja ver la tarjeta dentro.
    await animar(cerrada, [
      { transform: 'perspective(1200px) rotateX(0deg)' },
      { transform: 'perspective(1200px) rotateX(90deg)' },
    ], { duration: 560, easing: 'cubic-bezier(.45,0,.55,1)' });
    cerrada.style.visibility = 'hidden';
    // En Vino & Marfil la tarjeta sube y sale del sobre antes de pasar a la página.
    const carta = $('.sobre-carta');
    if (ES_VINO() && carta) await animar(carta, [{ transform: 'translateY(0)' }, { transform: 'translateY(-46%)' }], { duration: 900, easing: 'cubic-bezier(.2,.7,.2,1)' });
    await espera(ES_VINO() ? 260 : 520);

    // 3. El sobre se desvanece y luego aparece la tarjeta.
    await animar($('.escena'), [{ opacity: 1 }, { opacity: 0 }], { duration: 600, easing: 'ease-in-out' });
    await espera(80);
    terminarIntro();
  }

  // El ramo se arma solo en los temas que lo llevan (no en Vino & Marfil).
  function asegurarRamo() {
    if (ramoSvg || ES_VINO() || !window.Ramo) return;
    ramoSvg = Ramo.crear($('#ramo'), { semilla: 7, sombra: false });
    if (abierto && !reducido) Ramo.florecer(ramoSvg);
  }

  function iniciar() {
    // Sin esta clase todo queda quieto y visible: la tarjeta y el día.
    if (!reducido) doc.classList.add('scroll-vivo');
    $('.sobre-sello').innerHTML = P.sello(Estilos.paleta({ paleta: doc.dataset.paleta, color: doc.dataset.color }).sello);
    // Si los datos de la boda tardan, la página se muestra con el estilo que tenga.
    setTimeout(() => doc.classList.remove('estilo-pendiente'), 3000);
    prepararVisor();
    // Los bloques de la página (los de config.js mientras llegan los guardados).
    pintarPagina();
    llenarIntro();
    llenarInvitado();
    asegurarRamo();

    escenaPortada();
    escenaDia();
    escenaParallax();
    addEventListener('scroll', pedirCuadro, { passive: true });
    addEventListener('resize', pedirCuadro);

    let yaAbierta = false;
    try { yaAbierta = sessionStorage.getItem(CLAVE_ABIERTA) === '1'; } catch { /* sin almacenamiento */ }
    // En el editor la invitación se ve ya abierta, salvo que se pida el sobre.
    if (vistaEditor) {
      yaAbierta = params.get('sobre') !== '1';
      prepararEditor();
    }
    if (yaAbierta) {
      doc.classList.remove('intro');
      abierto = true;
      if (window.Musica) window.Musica.abierta({ gesto: false });
      if (!reducido) fuentesListas().then(() => { if (ramoSvg) Ramo.florecer(ramoSvg); });
    } else {
      $('#sobre').addEventListener('click', abrir);
    }

    $('[data-volver]').addEventListener('click', () => {
      try { sessionStorage.removeItem(CLAVE_ABIERTA); } catch { /* sin almacenamiento */ }
      window.scrollTo(0, 0);
      location.reload();
    });

    cargarEvento();
    cargarSalon();
    cargar();
    pedirCuadro();
  }

  iniciar();
})();
