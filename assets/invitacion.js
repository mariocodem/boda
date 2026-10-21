/*
 * La invitación: abre el sobre, llena la suite con los datos del invitado y de
 * la boda, mueve las escenas con el scroll y maneja la tarjeta de respuesta.
 */
(function () {
  const C = window.BODA;
  const P = window.Papeleria;
  const doc = document.documentElement;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const esc = P.escapar;

  const params = new URLSearchParams(location.search);
  const codigo = window.Datos.limpiarCodigo(params.get('i'));
  const vistaPanel = params.get('vista') === 'panel';
  const reducido = matchMedia('(prefers-reduced-motion: reduce)').matches;
  // Desde el panel se puede ver la invitación con un estilo aún sin guardar.
  const estiloVista = Estilos.desdeUrl(params);
  const pareja = `${C.pareja.uno.nombre} y ${C.pareja.dos.nombre}`;
  const verVacios = () => window.Datos.modo === 'local' || vistaPanel;
  const CLAVE_ABIERTA = `boda-diego-erika:abierta:${codigo || 'general'}`;

  // Datos de la boda: config.js, reemplazado por lo que se guarde en el panel.
  let E = window.Datos.eventoBase();

  const estado = {
    invitacion: null, // { numero, nombre, cupos, estado, asistentes, mensaje, respondidoEn }
    carga: codigo ? 'cargando' : 'sin-codigo', // cargando | lista | no-encontrada | error | sin-codigo
    editando: false,
    eleccion: null,
    cuantos: 1,
    mensaje: '',
    enviando: false,
    error: '',
    recienSellada: false,
  };

  const plural = () => Boolean(estado.invitacion && estado.invitacion.cupos > 1);
  const t = (uno, varios) => (plural() ? varios : uno);

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
    el.innerHTML = html || '';
    el.hidden = !html;
  }

  // ---------- La boda ----------

  function llenarEvento() {
    aplicarEstilo();
    llenarRetrato();
    llenarFotos();
    llenarVestimentaFotos();
    const fecha = P.fechaEvento(E);
    const larga = fecha ? P.fechaLarga(fecha) : null;
    porConfirmar($('[data-fecha]'), larga, 'Fecha por confirmar');
    porConfirmar($('[data-ciudad]'), E.ciudad, 'Ciudad por confirmar');
    llenarCapitulos(fecha, larga);
    llenarSitios();
    llenarItinerario();
    llenarCalendario(fecha);

    porConfirmar($('[data-vestimenta-codigo]'), E.vestimenta.codigo, 'Por confirmar');
    mostrar($('[data-vestimenta-nota]'), E.vestimenta.nota ? conCifras(E.vestimenta.nota) : '');
    porConfirmar($('[data-regalos]'), E.regalos, 'Por confirmar');

    const tel = C.contacto && C.contacto.whatsapp ? String(C.contacto.whatsapp).replace(/\D/g, '') : '';
    if (tel) {
      const quien = C.contacto.nombre || 'los novios';
      $('[data-contacto]').hidden = false;
      $('[data-contacto-texto]').innerHTML = `Escríbele a ${esc(quien)}.<br><a class="enlace-accion" href="https://wa.me/${tel}" target="_blank" rel="noopener">${P.icono('whatsapp')}<span>Escribir por WhatsApp</span></a>`;
    }
    pedirCuadro();
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

    $$('[data-copiar]', caja).forEach((b) => b.addEventListener('click', async () => {
      const etiqueta = $('span', b);
      let ok = false;
      try {
        await navigator.clipboard.writeText(b.dataset.copiar);
        ok = true;
      } catch { /* sin portapapeles */ }
      etiqueta.textContent = ok ? 'Dirección copiada' : 'No se pudo copiar';
      setTimeout(() => { etiqueta.textContent = 'Copiar dirección'; }, 2200);
    }));
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
    $('[data-itinerario]').innerHTML = momentosDelDia().map((m) => {
      const h = P.horaBonita(m.hora);
      return `<li class="dia-momento">
          <p class="dia-hora${h ? '' : ' por-confirmar'}">${h ? conCifras(h) : 'Por confirmar'}</p>
          <span class="dia-punto" aria-hidden="true"></span>
          <div class="dia-texto">
            <h3 class="dia-titulo">${conCifras(m.titulo)}</h3>
            ${m.detalle ? `<p class="dia-detalle">${conCifras(m.detalle)}</p>` : ''}
          </div>
        </li>`;
    }).join('');
  }

  function llenarCalendario(fecha) {
    const cal = $('[data-calendario]');
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
  }

  // ---------- Estilo y fotos (vienen de la pestaña «La boda» del panel) ----------

  function aplicarEstilo() {
    const e = Estilos.aplicar(estiloVista || E.estilo);
    if (!estiloVista) Estilos.recordar(e);
    $('.sobre-sello').innerHTML = P.sello(Estilos.PALETAS[e.paleta].sello);
    Estilos.listo(e).then(() => doc.classList.remove('estilo-pendiente'));
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

  async function llenarFotos() {
    const seccion = $('#fotos');
    const mesa = $('[data-fotos]');
    const lista = E.fotos || [];
    const urls = await Promise.all(lista.map((f) => window.Datos.urlFoto(f.url)));
    mesa.innerHTML = lista.map((f, i) => (urls[i]
      ? fotoImpresa(f, urls[i], { alt: pareja, etiqueta: `Ver en grande la foto ${i + 1} de ${pareja}` })
      : '')).join('');
    const contar = () => {
      mesa.dataset.cuantas = mesa.children.length;
      seccion.hidden = !mesa.children.length;
    };
    retirarRotas(mesa, contar);
    contar();
  }

  async function llenarVestimentaFotos() {
    const caja = $('[data-vestimenta-fotos]');
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

  // Visor: cualquier foto de la mesa o de la vestimenta se puede ver en grande.
  function prepararVisor() {
    const visor = $('#visor');
    const img = new Image();
    $('[data-visor-foto]', visor).appendChild(img);
    document.addEventListener('click', (e) => {
      const boton = e.target.closest('.foto-boton');
      if (!boton) return;
      const original = $('img', boton);
      const pie = boton.closest('figure').querySelector('figcaption');
      img.src = original.currentSrc || original.src;
      img.alt = original.alt;
      $('[data-visor-pie]', visor).textContent = pie ? pie.textContent : '';
      visor.showModal();
    });
    $('[data-visor-cerrar]', visor).addEventListener('click', () => visor.close());
    // Tocar fuera de la foto también la cierra.
    visor.addEventListener('click', (e) => { if (e.target === visor) visor.close(); });
  }

  // ---------- Invitado ----------

  function llenarInvitado() {
    const inv = estado.invitacion;
    const nombre = inv ? inv.nombre : 'nuestros invitados';
    const numero = inv ? P.numeroSobre(inv.numero) : '···';
    $$('[data-numero]').forEach((el) => { el.textContent = numero; });
    $('[data-nombre]').textContent = nombre;
    $('[data-cupos]').innerHTML = inv ? `<span class="cifra">${inv.cupos}</span> ${inv.cupos === 1 ? 'CUPO RESERVADO' : 'CUPOS RESERVADOS'}` : '';
    $('[data-texto-invitacion]').textContent = inv && inv.cupos > 1
      ? 'tienen el gusto de invitarlos a celebrar su matrimonio'
      : 'tienen el gusto de invitarte a celebrar su matrimonio';

    const nombreSobre = $('[data-nombre-sobre]');
    const ya = nombreSobre.textContent;
    nombreSobre.textContent = nombre;
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
      if (inv) estado.cuantos = inv.estado === 'confirmado' && inv.asistentes ? inv.asistentes : inv.cupos;
    } catch (e) {
      estado.carga = 'error';
      estado.error = e.message;
    }
    llenarInvitado();
    pintarRespuesta();
  }

  // ---------- Tarjeta de respuesta ----------

  const CHECK = '<svg viewBox="0 0 30 30" aria-hidden="true"><path d="M6 16l6 7L26 4"/></svg>';

  function contactoHtml() {
    const tel = C.contacto && C.contacto.whatsapp ? String(C.contacto.whatsapp).replace(/\D/g, '') : '';
    return tel
      ? `<a class="enlace-accion" href="https://wa.me/${tel}" target="_blank" rel="noopener">${P.icono('whatsapp')}<span>Escribirnos por WhatsApp</span></a>`
      : '';
  }

  function pintarRespuesta() {
    const caja = $('[data-respuesta]');
    const inv = estado.invitacion;

    if (estado.carga === 'cargando') {
      caja.innerHTML = `<h2 class="respuesta-titulo">¿Nos acompañas?</h2><p class="respuesta-sub">Buscando tu tarjeta…</p>`;
      return;
    }
    if (estado.carga === 'sin-codigo') {
      caja.innerHTML = `<h2 class="respuesta-titulo">¿Nos acompañas?</h2>
        <p class="respuesta-sub">Esta tarjeta se responde desde el enlace personal que te enviamos. Ábrelo desde el mensaje y aquí aparecerán tu nombre y tus cupos.</p>${contactoHtml()}`;
      return;
    }
    if (estado.carga === 'no-encontrada') {
      caja.innerHTML = `<h2 class="respuesta-titulo">No encontramos tu tarjeta</h2>
        <p class="respuesta-sub">Revisa que el enlace esté completo, tal como te llegó. Si el problema sigue, escríbenos.</p>${contactoHtml()}`;
      return;
    }
    if (estado.carga === 'error') {
      caja.innerHTML = `<h2 class="respuesta-titulo">No pudimos traer tu tarjeta</h2>
        <p class="respuesta-sub">${esc(estado.error || 'Revisa tu conexión a internet.')}</p>
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
    const titulo = va ? '¡Qué alegría!' : 'Gracias por avisarnos';
    let resumen;
    if (va) {
      resumen = inv.cupos === 1
        ? 'Confirmaste tu asistencia. Diego y Erika ya tienen tu respuesta.'
        : `Confirmaron <b>${inv.asistentes}</b> de ${inv.cupos} cupos. Diego y Erika ya tienen su respuesta.`;
    } else {
      resumen = t('Te vamos a extrañar. Si tus planes cambian, puedes cambiar la respuesta aquí mismo.', 'Los vamos a extrañar. Si sus planes cambian, pueden cambiar la respuesta aquí mismo.');
    }
    caja.innerHTML = `<div class="respuesta-hecha${estado.recienSellada ? ' recien-sellada' : ''}" data-estado="${inv.estado}">
        ${P.matasellos({ texto: va ? 'CONFIRMADO' : 'RESPONDIDO', fecha: inv.respondidoEn })}
        <h2 class="respuesta-titulo">${titulo}</h2>
        <p class="respuesta-resumen">${resumen}</p>
        ${inv.mensaje ? `<blockquote class="respuesta-cita">${esc(inv.mensaje)}</blockquote>` : ''}
        <button class="enlace-accion" type="button" data-cambiar>${P.icono('editar')}<span>Cambiar la respuesta</span></button>
      </div>`;
    estado.recienSellada = false;
    $('[data-cambiar]', caja).addEventListener('click', () => {
      estado.editando = true;
      estado.eleccion = inv.estado === 'confirmado' ? 'si' : 'no';
      estado.mensaje = inv.mensaje || '';
      pintarRespuesta();
      const marcado = $('input[name="asiste"]:checked', caja);
      if (marcado) marcado.focus();
    });
  }

  function pintarFormulario(caja, inv) {
    const limite = E.fechaLimiteRespuesta ? P.diaMes(E.fechaLimiteRespuesta) : null;
    const sub = limite ? t(`Por favor responde antes del ${limite}.`, `Por favor respondan antes del ${limite}.`) : '';
    const si = t('Asistiré con gusto', 'Asistiremos con gusto');
    const no = t('Lamento no poder ir', 'Lamentamos no poder ir');
    caja.innerHTML = `<form class="respuesta-form" novalidate>
        <fieldset>
          <legend class="respuesta-titulo">${t('¿Nos acompañas?', '¿Nos acompañan?')}</legend>
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
          </div>` : ''}
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

    function actualizarContador() {
      if (!valor) return;
      valor.textContent = estado.cuantos;
      menos.disabled = estado.cuantos <= 1;
      mas.disabled = estado.cuantos >= inv.cupos;
    }
    actualizarContador();

    $$('input[name="asiste"]', form).forEach((r) => r.addEventListener('change', () => {
      estado.eleccion = r.value;
      estado.error = '';
      $('.respuesta-error', form).textContent = '';
      detalle.hidden = false;
      if (cuantos) cuantos.hidden = r.value !== 'si';
    }));
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
        errorEl.textContent = t('Marca si vienes o no para poder enviar.', 'Marquen si vienen o no para poder enviar.');
        return;
      }
      const boton = $('.boton-responder', form);
      estado.enviando = true;
      boton.disabled = true;
      boton.innerHTML = '<span class="girando" aria-hidden="true"></span><span>Enviando…</span>';
      try {
        const actualizada = await window.Datos.responder(codigo, {
          asiste: estado.eleccion === 'si',
          asistentes: inv.cupos === 1 ? 1 : estado.cuantos,
          mensaje: estado.mensaje,
        });
        estado.invitacion = actualizada;
        estado.editando = false;
        estado.error = '';
        estado.recienSellada = !reducido;
        llenarInvitado();
        pintarRespuesta();
        $('#respuesta').scrollIntoView({ behavior: reducido ? 'auto' : 'smooth', block: 'nearest' });
      } catch (err) {
        estado.error = `${err.message} Tu respuesta no se envió.`;
        errorEl.textContent = estado.error;
        boton.disabled = false;
        boton.textContent = 'Enviar respuesta';
      } finally {
        estado.enviando = false;
      }
    });
  }

  // ---------- Scroll: la tarjeta se asienta, el video avanza, el día se traza ----------

  const escenas = [];
  let pedido = false;

  const limitar = (x) => Math.min(1, Math.max(0, x));
  const salir = (x) => 1 - Math.pow(1 - x, 3);

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

  function escenaAltar() {
    const seccion = $('#altar');
    const video = $('.altar-video', seccion);
    const capitulos = $$('[data-capitulo]', seccion);
    // Tramo del recorrido en que se ve cada tarjetita; la última se queda.
    const tramos = [[-1, 0.31], [0.33, 0.62], [0.64, 2]];
    const giros = [-1.4, 1.2, -0.8];
    const fuente = elegirVideo(video);
    const scrub = { objetivo: 0, actual: 0, cuadros: 0, corriendo: false };

    function avanzar() {
      const d = scrub.objetivo - scrub.actual;
      scrub.actual = Math.abs(d) < 0.004 ? scrub.objetivo : scrub.actual + d * 0.2;
      if (!video.seeking && Math.abs(video.currentTime - scrub.actual) > 0.001) video.currentTime = scrub.actual;
      scrub.cuadros += 1;
      const listo = scrub.actual === scrub.objetivo && !video.seeking;
      if (listo || scrub.cuadros > 240) {
        scrub.corriendo = false;
        return;
      }
      requestAnimationFrame(avanzar);
    }

    if (fuente && !reducido) {
      video.addEventListener('loadedmetadata', pedirCuadro);
      cargarVideo(video, fuente.archivo);
    }

    escenas.push(() => {
      const r = seccion.getBoundingClientRect();
      if (r.bottom < 0 || r.top > innerHeight) return;
      const p = recorrido(r);

      if (!reducido && video.duration && video.readyState >= 1) {
        scrub.objetivo = p * Math.max(0, video.duration - 0.06);
        if (!scrub.corriendo) {
          scrub.corriendo = true;
          scrub.cuadros = 0;
          requestAnimationFrame(avanzar);
        }
      }

      if (reducido) return;
      capitulos.forEach((cap, i) => {
        const [a, b] = tramos[i];
        const entra = salir(limitar((p - a) / 0.07));
        const sale = salir(limitar((p - (b - 0.07)) / 0.07));
        const visible = entra * (1 - sale);
        cap.style.opacity = visible.toFixed(3);
        cap.style.transform = `translate3d(0, ${((1 - entra) * 64 - sale * 44).toFixed(1)}px, 0) rotate(${((1 - entra) * 5 + giros[i]).toFixed(2)}deg)`;
        cap.classList.toggle('apagado', visible < 0.02);
      });
    });
  }

  function elegirVideo(video) {
    const cfg = C.video || {};
    const vertical = innerWidth / innerHeight < 0.9;
    const fuente = (vertical ? cfg.vertical : cfg.horizontal) || cfg.horizontal || cfg.vertical;
    if (!fuente || !fuente.archivo) {
      $('#altar').classList.add('sin-video');
      return null;
    }
    // Con movimiento reducido el altar queda quieto, en su último cuadro.
    video.poster = (reducido ? fuente.final : fuente.inicio) || '';
    return fuente;
  }

  // El video entero en memoria: así se puede ir a cualquier cuadro aunque el
  // servidor no entregue el archivo por partes (iOS y Chrome lo necesitan).
  async function cargarVideo(video, url) {
    try {
      const r = await fetch(url);
      if (!r.ok) throw new Error(String(r.status));
      video.src = URL.createObjectURL(await r.blob());
    } catch {
      video.src = url;
    }
    // iOS solo pinta cuadros de un video que ya arrancó una vez.
    const intento = video.play();
    if (intento && intento.then) {
      intento.then(() => {
        video.pause();
        pedirCuadro();
      }).catch(() => {});
    }
  }

  function escenaDia() {
    const caja = $('.dia');
    escenas.push(() => {
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

  function repartirRespuesta() {
    const tarjeta = $('#respuesta');
    if (reducido || !('IntersectionObserver' in window)) return;
    tarjeta.classList.add('por-repartir');
    const io = new IntersectionObserver((entradas) => {
      if (!entradas.some((e) => e.isIntersecting)) return;
      tarjeta.classList.remove('por-repartir');
      io.disconnect();
    });
    io.observe(tarjeta);
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
    if (!reducido) Ramo.florecer(ramoSvg);
    pedirCuadro();
    // El foco pasa del sobre (que desaparece) al título de la tarjeta.
    const titulo = $('#nombres');
    titulo.setAttribute('tabindex', '-1');
    requestAnimationFrame(() => titulo.focus({ preventScroll: true }));
    setTimeout(() => doc.classList.remove('recien-abierta'), 3200);
  }

  async function abrir() {
    if (abierto || doc.classList.contains('abriendo')) return;
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

    // 1. El sobre se voltea.
    await Promise.all(pares.map((el) => animar(el, [
      { transform: 'none' },
      { transform: 'translateY(-14px) scaleX(0.02) rotate(-1.5deg)' },
    ], { duration: 300, easing: 'cubic-bezier(.55,0,.75,.2)' })));
    pares.forEach((el) => { el.dataset.cara = 'dorso'; });
    await Promise.all(pares.map((el) => animar(el, [
      { transform: 'translateY(-14px) scaleX(0.02) rotate(-1.5deg)' },
      { transform: 'none' },
    ], { duration: 420, easing: 'cubic-bezier(.16,1,.3,1)' })));
    await espera(160);

    // 2. La solapa se levanta con su sello y deja ver la tarjeta dentro.
    await animar(cerrada, [
      { transform: 'perspective(1200px) rotateX(0deg)' },
      { transform: 'perspective(1200px) rotateX(90deg)' },
    ], { duration: 560, easing: 'cubic-bezier(.45,0,.55,1)' });
    cerrada.style.visibility = 'hidden';
    await espera(520);

    // 3. El sobre se desvanece y luego aparece la tarjeta.
    await animar($('.escena'), [{ opacity: 1 }, { opacity: 0 }], { duration: 600, easing: 'ease-in-out' });
    await espera(80);
    terminarIntro();
  }

  function iniciar() {
    // Sin esta clase todo queda quieto y visible: la tarjeta, el altar y el día.
    if (!reducido) doc.classList.add('scroll-vivo');
    $('.sobre-sello').innerHTML = P.sello(Estilos.PALETAS[Estilos.normalizar({ paleta: doc.dataset.paleta }).paleta].sello);
    // Si los datos de la boda tardan, la página se muestra con el estilo que tenga.
    setTimeout(() => doc.classList.remove('estilo-pendiente'), 3000);
    prepararVisor();
    llenarInvitado();
    ramoSvg = Ramo.crear($('#ramo'), { semilla: 7, sombra: false });

    escenaPortada();
    escenaAltar();
    escenaDia();
    repartirRespuesta();
    addEventListener('scroll', pedirCuadro, { passive: true });
    addEventListener('resize', pedirCuadro);

    let yaAbierta = false;
    try { yaAbierta = sessionStorage.getItem(CLAVE_ABIERTA) === '1'; } catch { /* sin almacenamiento */ }
    if (yaAbierta) {
      doc.classList.remove('intro');
      abierto = true;
      if (!reducido) fuentesListas().then(() => Ramo.florecer(ramoSvg));
    } else {
      $('#sobre').addEventListener('click', abrir);
    }

    $('[data-volver]').addEventListener('click', () => {
      try { sessionStorage.removeItem(CLAVE_ABIERTA); } catch { /* sin almacenamiento */ }
      window.scrollTo(0, 0);
      location.reload();
    });

    cargarEvento();
    cargar();
    pedirCuadro();
  }

  iniciar();
})();
