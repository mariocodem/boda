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
  const codigo = window.Datos.limpiarCodigo(params.get('i'));
  const vistaPanel = params.get('vista') === 'panel';
  const reducido = matchMedia('(prefers-reduced-motion: reduce)').matches;
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

  const estado = {
    invitacion: null, // { numero, nombre, cupos, estado, asistentes, mensaje, respondidoEn }
    carga: codigo ? 'cargando' : 'sin-codigo', // cargando | lista | no-encontrada | error | sin-codigo
    editando: false,
    eleccion: null,
    cuantos: 1,
    mensaje: '',
    // Las preguntas opcionales de la tarjeta (se encienden en el panel).
    alergias: '',
    cancion: '',
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
    llenarAlojamiento();
    llenarItinerario();
    llenarCalendario(fecha);
    llenarHistoria();

    porConfirmar($('[data-vestimenta-codigo]'), E.vestimenta.codigo, 'Por confirmar');
    mostrar($('[data-vestimenta-nota]'), E.vestimenta.nota ? conCifras(E.vestimenta.nota) : '');
    llenarRegalos();
    llenarPreguntas();

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
    $('#historia').hidden = !html && !verVacios();
    $('[data-historia]').innerHTML = html || (verVacios() ? pendiente('Aún no está su historia', 'Nuestra historia') : '');
    repartirFotos();
  }

  // El texto de regalos, la cuenta para transferencias y las listas de tiendas.
  // Solo dice «por confirmar» si no hay nada de eso.
  function llenarRegalos() {
    const cuenta = E.cuentaRegalos;
    const listas = E.listasRegalos || [];
    const texto = $('[data-regalos]');
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
      caja.innerHTML = `<dl class="cuenta">${filas.map(([e, v, c]) => `<div><dt>${e}</dt><dd${c ? ` class="${c}"` : ''}>${conCifras(v)}</dd></div>`).join('')}</dl>
        <button class="enlace-accion" type="button">${P.icono('copiar')}<span>Copiar el número</span></button>`;
      copiable($('button', caja), cuenta.numero.replace(/[\s.-]/g, ''), 'Número copiado');
    }

    const ul = $('[data-regalos-listas]');
    ul.hidden = !listas.length;
    ul.innerHTML = listas.map((l) => `<li><a class="enlace-accion" href="${esc(l.enlace)}" target="_blank" rel="noopener">${P.icono('regalo')}<span>Ver la lista en ${esc(l.nombre)}</span></a></li>`).join('');
  }

  function llenarPreguntas() {
    const lista = E.preguntas || [];
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
    // La tarjeta pudo pintarse antes de saber qué preguntas lleva y hasta cuándo
    // se responde; si nadie la está llenando, se vuelve a pintar.
    if (estado.carga === 'lista' && !estado.enviando && !$('[data-respuesta]').contains(document.activeElement)) pintarRespuesta();
  }

  // ---------- Estilo y fotos (vienen de la pestaña «La boda» del panel) ----------

  function aplicarEstilo() {
    const e = Estilos.aplicar(estiloVista || E.estilo);
    if (!estiloVista) Estilos.recordar(e);
    // La mariposa (assets/mariposa.js) mira este atributo.
    doc.dataset.mariposa = (mariposaVista || (E.mariposa ? 'si' : 'no')) === 'no' ? 'no' : 'si';
    $('.sobre-sello').innerHTML = P.sello(Estilos.paleta(e).sello);
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

  // Las fotos de la pareja se reparten por la invitación (ver P.lugaresFotos):
  // una al lado de cada pliego que le toca y las demás juntas, sueltas sobre
  // la mesa.
  async function llenarFotos() {
    const lista = E.fotos || [];
    const urls = await Promise.all(lista.map((f) => window.Datos.urlFoto(f.url)));
    const buenas = lista.map((f, i) => ({ f, url: urls[i], i })).filter((x) => x.url);
    const lugares = P.lugaresFotos(buenas.length, Boolean(parrafos(E.historia)));
    const impresa = (x) => fotoImpresa(x.f, x.url, { alt: pareja, etiqueta: `Ver en grande la foto ${x.i + 1} de ${pareja}` });
    const cajas = $$('[data-foto-pliego]');
    cajas.forEach((caja) => {
      const k = lugares.indexOf(caja.dataset.fotoPliego);
      caja.innerHTML = k >= 0 ? impresa(buenas[k]) : '';
    });
    const mesa = $('[data-fotos]');
    mesa.innerHTML = buenas.filter((x, k) => lugares[k] === 'momentos').map(impresa).join('');
    cajas.concat(mesa).forEach((caja) => retirarRotas(caja, repartirFotos));
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
    const mesa = $('[data-fotos]');
    mesa.dataset.cuantas = mesa.children.length;
    $('#fotos').hidden = !mesa.children.length;
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
    $('[data-titulo-responder]').textContent = inv && inv.cupos > 1
      ? 'Esperamos compartir este día con ustedes'
      : 'Esperamos compartir este día contigo';

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
    const mesaVisible = (mesaDelInvitado() || {}).mesa;
    const titulo = va ? '¡Qué alegría!' : 'Gracias por avisarnos';
    let resumen;
    if (va) {
      resumen = inv.cupos === 1
        ? 'Confirmaste tu asistencia. Diego y Erika ya tienen tu respuesta.'
        : `Confirmaron <b>${inv.asistentes}</b> de ${inv.cupos} cupos. Diego y Erika ya tienen su respuesta.`;
    } else {
      resumen = t('Te vamos a extrañar. Si tus planes cambian, puedes cambiar la respuesta aquí mismo.', 'Los vamos a extrañar. Si sus planes cambian, pueden cambiar la respuesta aquí mismo.');
    }
    const datos = va ? [['Comida', inv.alergias], ['Canción', inv.cancion]].filter(([, v]) => v) : [];
    caja.innerHTML = `<div class="respuesta-hecha${estado.recienSellada ? ' recien-sellada' : ''}" data-estado="${inv.estado}">
        ${P.matasellos({ texto: va ? 'CONFIRMADO' : 'RESPONDIDO', fecha: inv.respondidoEn })}
        <h2 class="respuesta-titulo">${titulo}</h2>
        <p class="respuesta-resumen">${resumen}</p>
        ${datos.length ? `<dl class="respuesta-datos">${datos.map(([e, v]) => `<div><dt>${e}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>` : ''}
        ${inv.mensaje ? `<blockquote class="respuesta-cita">${esc(inv.mensaje)}</blockquote>` : ''}
        <div class="respuesta-acciones">
          ${mesaVisible ? `<a class="enlace-accion" href="#mesa">${P.icono('mesa')}<span>Ver ${t('tu', 'su')} mesa: la <span class="cifra">${mesaVisible.numero}</span></span></a>` : ''}
          <button class="enlace-accion" type="button" data-cambiar>${P.icono('editar')}<span>Cambiar la respuesta</span></button>
        </div>
      </div>`;
    estado.recienSellada = false;
    $('[data-cambiar]', caja).addEventListener('click', () => {
      estado.editando = true;
      estado.eleccion = inv.estado === 'confirmado' ? 'si' : 'no';
      estado.mensaje = inv.mensaje || '';
      estado.alergias = inv.alergias || '';
      estado.cancion = inv.cancion || '';
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
    // Preguntas que solo se hacen a quien va, si los novios las encendieron.
    const pide = E.respuesta || {};
    const extra = (clave, etiqueta, ejemplo, max) => (pide[clave] ? `<label class="renglon-campo" data-solo-si${estado.eleccion === 'si' ? '' : ' hidden'}>
            <span class="campo-etiqueta">${etiqueta} <em>(opcional)</em></span>
            <input type="text" name="${clave}" maxlength="${max}" value="${esc(estado[clave])}" placeholder="${ejemplo}" autocomplete="off">
          </label>` : '');
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
          ${extra('alergias', t('¿Tienes alguna alergia o restricción con la comida?', '¿Alguno tiene alergias o restricciones con la comida?'), 'Vegetariano, sin gluten, alergia al maní…', 300)}
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
        errorEl.textContent = t('Marca si vienes o no para poder enviar.', 'Marquen si vienen o no para poder enviar.');
        return;
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
        estado.error = `${err.message} Tu respuesta no se envió.`;
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
    const ver = mesaDelInvitado();
    const mesa = ver && ver.mesa;
    enlace.hidden = !mesa;
    if (mesa) {
      enlace.innerHTML = `Mesa <span class="cifra">${mesa.numero}</span>`;
      enlace.setAttribute('aria-label', `${t('Tu mesa', 'Su mesa')}: la ${mesa.numero}. Ver dónde queda en el plano`);
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
        <h2 class="mesa-titulo" id="mesa-titulo"><span class="mesa-palabra">${t('Tu mesa', 'Su mesa')}</span><span class="mesa-pendiente por-confirmar">por confirmar</span></h2>
        <p class="mesa-nota">${t(
          'Diego y Erika están organizando las mesas. Vuelve a abrir tu invitación más cerca del día para ver la tuya.',
          'Diego y Erika están organizando las mesas. Vuelvan a abrir su invitación más cerca del día para ver la suya.',
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
          <figcaption>${t('Tu mesa', 'Su mesa')} es la que está encerrada en el plano del salón.</figcaption>
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
    // Sin esta clase todo queda quieto y visible: la tarjeta y el día.
    if (!reducido) doc.classList.add('scroll-vivo');
    $('.sobre-sello').innerHTML = P.sello(Estilos.paleta({ paleta: doc.dataset.paleta, color: doc.dataset.color }).sello);
    // Si los datos de la boda tardan, la página se muestra con el estilo que tenga.
    setTimeout(() => doc.classList.remove('estilo-pendiente'), 3000);
    prepararVisor();
    llenarInvitado();
    ramoSvg = Ramo.crear($('#ramo'), { semilla: 7, sombra: false });

    escenaPortada();
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
    cargarSalon();
    cargar();
    pedirCuadro();
  }

  iniciar();
})();
