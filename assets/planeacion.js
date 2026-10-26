/*
 * Panel: la planeación de la boda, como en un organizador de bodas.
 *  - Tareas: la agenda por etapas, de un año antes a después de la boda. Con
 *    la fecha de la boda cada etapa dice hasta cuándo va, cuál toca ahora y qué
 *    tareas van atrasadas.
 *  - Presupuesto: los gastos por categoría (estimado, costo final y pagado),
 *    cuánto queda y los próximos pagos.
 *  - Proveedores: a quién se cotizó, a quién se contrató y cómo hablarle; cada
 *    uno se puede llevar al presupuesto.
 *
 * admin.js la arranca con sus utilidades (Planeacion.iniciar) y le dice qué
 * pestaña se abre (Planeacion.mostrar). Cada herramienta se guarda sola un
 * momento después de cada cambio, como el plano de mesas.
 */
(function () {
  const P = window.Papeleria;
  const D = window.Datos;
  const PL = window.Planeador;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const esc = P.escapar;
  const dinero = PL.dinero;

  const VISTAS = ['tareas', 'presupuesto', 'proveedores'];
  const NOMBRE_VISTA = { invitados: 'Invitados', mesas: 'Mesas', presupuesto: 'Presupuesto', proveedores: 'Proveedores', boda: 'La boda' };

  // Utilidades de admin.js: aviso, iconos, cifra, hace, telefonoWa, telefonoBonito, invitados.
  let panel = null;
  let vista = null;
  let fechaBoda = null;
  let cargando = null;
  // Lo recién agregado, para resaltarlo al pintar: { tarea, partidas: [ids], proveedor }.
  const recien = {};

  // Un documento por herramienta, con su estado de guardado.
  const docs = {};
  VISTAS.forEach((clave) => {
    docs[clave] = { clave, datos: PL.normalizar(clave, null), cargado: false, error: '', pendiente: false, guardando: false, otraVez: false, temporizador: null };
  });
  const listo = (doc) => doc.cargado;

  const filtros = { tareas: 'pendientes', proveedores: { estado: 'todos', categoria: '', busqueda: '' } };

  const conCifras = (t) => esc(t).replace(/\d+/g, '<span class="cifra">$&</span>');
  const cuantas = (n, uno, varios) => `${n} ${n === 1 ? uno : varios}`;
  const sinTildes = (t) => String(t || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

  const fechaLarga = new Intl.DateTimeFormat('es-CO', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
  const fechaCorta = new Intl.DateTimeFormat('es-CO', { day: 'numeric', month: 'short', timeZone: 'UTC' });
  const deDia = (iso) => new Date(`${iso}T12:00:00Z`);
  const diasHasta = (iso) => Math.round((Date.parse(`${iso}T00:00:00Z`) - Date.parse(`${PL.hoy()}T00:00:00Z`)) / 86400000);

  // ---------- Cargar y guardar ----------

  async function cargar() {
    // Lo que tiene cambios sin guardar no se pisa con lo guardado.
    const libres = VISTAS.filter((c) => !docs[c].pendiente && !docs[c].guardando);
    const [evento, ...resultados] = await Promise.allSettled([D.evento()].concat(libres.map((c) => D.planeacion(c))));
    if (evento.status === 'fulfilled') fechaBoda = evento.value.fecha;
    resultados.forEach((r, i) => {
      const doc = docs[libres[i]];
      if (doc.pendiente || doc.guardando) return;
      if (r.status === 'fulfilled') {
        doc.datos = r.value;
        doc.cargado = true;
        doc.error = '';
      } else {
        doc.error = r.reason.message;
      }
    });
  }

  function recargar() {
    if (!cargando) cargando = cargar().finally(() => { cargando = null; });
    return cargando.then(() => { if (vista) pintar(); });
  }

  function estadoGuardado(doc, texto, tono) {
    const el = $(`[data-estado-planeacion="${doc.clave}"]`);
    el.textContent = texto;
    if (tono) el.dataset.tono = tono;
    else delete el.dataset.tono;
  }

  function cambio(doc) {
    doc.pendiente = true;
    estadoGuardado(doc, 'Cambios sin guardar', 'sucio');
    clearTimeout(doc.temporizador);
    doc.temporizador = setTimeout(() => guardar(doc), 700);
  }

  async function guardar(doc) {
    clearTimeout(doc.temporizador);
    if (doc.guardando) {
      doc.otraVez = true;
      return false;
    }
    doc.guardando = true;
    doc.pendiente = false;
    estadoGuardado(doc, 'Guardando…');
    let ok = false;
    try {
      await D.guardarPlaneacion(doc.clave, doc.datos);
      ok = true;
      if (!doc.pendiente) estadoGuardado(doc, D.modo === 'local' ? 'Guardado en este navegador' : 'Guardado', 'listo');
    } catch (err) {
      doc.pendiente = true;
      estadoGuardado(doc, 'No se guardó', 'error');
      panel.aviso(err.message, { error: true, accion: 'Reintentar', alHacer: () => guardar(doc) });
    } finally {
      doc.guardando = false;
      if (doc.otraVez) {
        doc.otraVez = false;
        guardar(doc);
      }
    }
    return ok;
  }

  addEventListener('beforeunload', (e) => {
    const sucios = VISTAS.map((c) => docs[c]).filter((d) => d.pendiente || d.guardando);
    if (!sucios.length) return;
    sucios.forEach((d) => { if (d.pendiente) guardar(d); });
    e.preventDefault();
    e.returnValue = '';
  });

  // Mientras no llega lo guardado no se edita: guardar una lista vacía
  // borraría la de verdad.
  function sinCargar(doc, que) {
    if (doc.error) {
      return `<div class="marco-vacio"><div class="vacio"><h2>No se pudo traer ${que}</h2><p>${esc(doc.error)}</p>
          <div class="libro-botones"><button class="boton boton-secundario" type="button" data-reintentar-planeacion data-icono="actualizar">Intentar de nuevo</button></div></div></div>`;
    }
    return `<p class="cargando-planeacion">Cargando ${que}…</p>`;
  }

  function pintar() {
    if (vista === 'tareas') pintarTareas();
    else if (vista === 'presupuesto') pintarPresupuesto();
    else if (vista === 'proveedores') pintarProveedores();
  }

  function resaltar(selector) {
    const el = $(selector);
    if (!el) return;
    el.classList.add('recien');
    el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }

  // Los campos de dinero se leen con o sin puntos y se escriben con formato al salir.
  document.addEventListener('focusout', (e) => {
    const t = e.target;
    if (!t.matches || !t.matches('[data-dinero]')) return;
    const v = PL.leerPesos(t.value);
    t.value = v != null ? dinero(v) : '';
  });

  // ---------- Tareas ----------

  const vistaTareas = $('[data-vista-panel="tareas"]');
  const cajaEtapas = $('[data-etapas]', vistaTareas);
  const dlgTarea = $('#dialogo-tarea');
  const formTarea = $('#form-tarea');
  let tareaEditando = null;

  const FILTROS_TAREAS = [
    { id: 'pendientes', texto: 'Por hacer', prueba: (t) => !t.hecha },
    { id: 'hechas', texto: 'Hechas', prueba: (t) => t.hecha },
    { id: 'todas', texto: 'Todas', prueba: () => true },
  ];

  const tarea = (id) => docs.tareas.datos.lista.find((t) => t.id === id) || null;

  // Dónde está hoy cada etapa: pasada, ahora o por venir. Sin fecha, null.
  function momentoEtapa(lim, hoy) {
    if (!lim) return null;
    if (hoy > lim.hasta) return 'pasada';
    if (!lim.desde || hoy > lim.desde) return 'ahora';
    return 'futura';
  }

  function cuentaTareas() {
    const lista = docs.tareas.datos.lista;
    const lims = PL.limites(fechaBoda);
    const hoy = PL.hoy();
    const hechas = lista.filter((t) => t.hecha).length;
    const atrasadas = lims ? lista.filter((t) => !t.hecha && hoy > lims[t.etapa].hasta).length : 0;
    return { total: lista.length, hechas, atrasadas, lims, hoy };
  }

  function pintarCifrasTareas() {
    const c = cuentaTareas();
    const ancho = Math.max(3, String(c.total).length);
    $('[data-contadores-tareas]').innerHTML = [
      ['Tareas', panel.cifra(c.total, ancho), ''],
      ['Hechas', panel.cifra(c.hechas, ancho), ''],
      ['Por hacer', panel.cifra(c.total - c.hechas, ancho), ''],
      ['Atrasadas', c.lims ? panel.cifra(c.atrasadas, ancho) : `${panel.cifra(0, ancho)}<small>falta la fecha</small>`, c.atrasadas ? 'alerta' : ''],
    ].map(([e, v, k]) => `<div class="contador ${k}"><dt>${e}</dt><dd>${v}</dd></div>`).join('');

    const pct = (n) => `${((n / (c.total || 1)) * 100).toFixed(2)}%`;
    const porHacer = c.total - c.hechas - c.atrasadas;
    $('[data-reparto-tareas]').innerHTML = c.total ? `
      <div class="reparto-barra" role="img" aria-label="${c.hechas} de ${c.total} tareas hechas${c.atrasadas ? `, ${c.atrasadas} atrasadas` : ''}">
        <span class="r-hecha" style="width:${pct(c.hechas)}"></span>
        <span class="r-declinado" style="width:${pct(c.atrasadas)}"></span>
      </div>
      <ul class="reparto-leyenda">
        <li><i style="background:var(--verde-forro)"></i>${cuantas(c.hechas, 'hecha', 'hechas')}</li>
        ${c.atrasadas ? `<li><i style="background:var(--declinado)"></i>${cuantas(c.atrasadas, 'atrasada', 'atrasadas')}</li>` : ''}
        <li><i class="muestra-vacia"></i>${porHacer} por hacer</li>
        <li>${Math.round((c.hechas / c.total) * 100)} % de la agenda</li>
      </ul>` : '';

    const cuenta = $('[data-cuenta-boda]', vistaTareas);
    if (!fechaBoda) {
      cuenta.innerHTML = 'Pon la fecha en <a href="#boda">La boda</a> para ver hasta cuándo va cada etapa.';
    } else {
      const dias = diasHasta(fechaBoda);
      if (dias > 1) cuenta.innerHTML = `Faltan <span class="cifra">${dias}</span> días para la boda.`;
      else if (dias === 1) cuenta.textContent = '¡La boda es mañana!';
      else if (dias === 0) cuenta.textContent = '¡La boda es hoy!';
      else cuenta.innerHTML = `La boda fue hace <span class="cifra">${-dias}</span> ${dias === -1 ? 'día' : 'días'}.`;
    }

    $('[data-filtros-tareas]', vistaTareas).innerHTML = FILTROS_TAREAS.map((f) => {
      const n = docs.tareas.datos.lista.filter(f.prueba).length;
      return `<button type="button" data-filtro-tarea="${f.id}" aria-pressed="${filtros.tareas === f.id}">${f.texto} <b>${n}</b></button>`;
    }).join('');
  }

  function filaTarea(t, vencida) {
    const titulo = esc(t.titulo);
    const detalle = [
      vencida && !t.hecha ? '<span class="tarea-atrasada">Atrasada</span>' : '',
      t.hecha && t.hechaEn ? `<span class="tarea-hecha-en">Hecha ${esc(panel.hace(t.hechaEn))}</span>` : '',
      t.nota ? `<span class="tarea-nota">${esc(t.nota)}</span>` : '',
      t.ir ? `<a class="tarea-ir" href="#${t.ir}">Ir a ${NOMBRE_VISTA[t.ir]}</a>` : '',
    ].join('');
    return `<li class="tarea" data-tarea="${esc(t.id)}"${t.hecha ? ' data-hecha' : ''}>
        <label class="tarea-casilla">
          <input type="checkbox" data-hacer${t.hecha ? ' checked' : ''}>
          <span class="tarea-titulo">${titulo}</span>
        </label>
        <div class="tarea-acciones">
          <button class="boton-icono" type="button" data-editar-tarea title="Editar" aria-label="Editar «${titulo}»">${P.icono('editar')}</button>
          <button class="boton-icono peligro" type="button" data-quitar-tarea title="Quitar" aria-label="Quitar «${titulo}»">${P.icono('eliminar')}</button>
        </div>
        ${detalle ? `<div class="tarea-detalle">${detalle}</div>` : ''}
      </li>`;
  }

  function cabezaEtapa(e, todas, lim, momento) {
    const hechas = todas.filter((t) => t.hecha).length;
    const fecha = lim ? `${momento === 'pasada' ? 'Terminó el' : 'Hasta el'} ${fechaLarga.format(deDia(lim.hasta))}` : '';
    return `<header class="etapa-cabeza">
        <h2 class="hoja-titulo" id="etapa-${e.id}">${conCifras(e.nombre)}</h2>
        ${momento === 'ahora' ? '<span class="etapa-ahora">Ahora</span>' : ''}
        <p class="etapa-cuenta" data-cuenta-etapa><b>${hechas}</b> de ${todas.length}</p>
        ${fecha ? `<p class="etapa-fecha">${conCifras(fecha)}</p>` : ''}
      </header>`;
  }

  function pintarTareas() {
    const doc = docs.tareas;
    pintarCifrasTareas();
    if (!listo(doc)) {
      cajaEtapas.innerHTML = sinCargar(doc, 'las tareas');
      panel.iconos(cajaEtapas);
      return;
    }
    const lista = doc.datos.lista;
    if (!lista.length) {
      cajaEtapas.innerHTML = `<div class="marco-vacio"><div class="vacio">
          <div class="vacio-sobre" aria-hidden="true"></div>
          <h2>La agenda está vacía</h2>
          <p>Empiecen con la lista sugerida: ${PL.TAREAS_SUGERIDAS.length} tareas repartidas desde un año antes hasta después de la boda. Después quiten, cambien o agreguen lo que quieran.</p>
          <div class="libro-botones">
            <button class="boton boton-principal" type="button" data-sembrar-tareas data-icono="tarea">Empezar con la lista sugerida</button>
            <button class="boton boton-secundario" type="button" data-nueva-tarea data-icono="mas">Agregar una tarea</button>
          </div>
        </div></div>`;
      panel.iconos(cajaEtapas);
      return;
    }
    const { lims, hoy } = cuentaTareas();
    const f = FILTROS_TAREAS.find((x) => x.id === filtros.tareas) || FILTROS_TAREAS[0];
    const html = PL.ETAPAS.map((e) => {
      const todas = lista.filter((t) => t.etapa === e.id);
      const visibles = todas.filter(f.prueba);
      if (!visibles.length) return '';
      const lim = lims && lims[e.id];
      const momento = momentoEtapa(lim, hoy);
      return `<section class="hoja etapa" data-etapa="${e.id}" data-momento="${momento || ''}" aria-labelledby="etapa-${e.id}">
          ${cabezaEtapa(e, todas, lim, momento)}
          <ul class="tareas-lista">${visibles.map((t) => filaTarea(t, Boolean(lim) && hoy > lim.hasta)).join('')}</ul>
        </section>`;
    }).join('');
    cajaEtapas.innerHTML = html || `<div class="marco-vacio"><div class="vacio">
        <h2>${filtros.tareas === 'hechas' ? 'Aún no han marcado tareas' : '¡No queda nada por hacer!'}</h2>
        <p>${filtros.tareas === 'hechas' ? 'Cuando marquen una tarea como hecha, aparecerá aquí.' : 'Todas las tareas de la agenda están hechas.'}</p>
        <div class="libro-botones"><button class="boton boton-secundario" type="button" data-filtro-tarea="todas">Ver todas</button></div>
      </div></div>`;
    if (recien.tarea) {
      resaltar(`[data-tarea="${CSS.escape(recien.tarea)}"]`);
      recien.tarea = null;
    }
  }

  // Marcar una tarea no la saca de la lista enseguida: así no salta debajo del
  // dedo, y desmarcarla es el deshacer.
  function marcarTarea(t, hecha, li) {
    t.hecha = hecha;
    t.hechaEn = hecha ? new Date().toISOString() : null;
    cambio(docs.tareas);
    if (li) {
      li.toggleAttribute('data-hecha', hecha);
      const seccion = li.closest('[data-etapa]');
      const todas = docs.tareas.datos.lista.filter((x) => x.etapa === t.etapa);
      const cuenta = seccion && $('[data-cuenta-etapa]', seccion);
      if (cuenta) cuenta.innerHTML = `<b>${todas.filter((x) => x.hecha).length}</b> de ${todas.length}`;
    }
    pintarCifrasTareas();
  }

  function sembrarTareas() {
    const doc = docs.tareas;
    const ya = new Set(doc.datos.lista.map((t) => sinTildes(t.titulo)));
    const nuevas = PL.TAREAS_SUGERIDAS
      .filter(([, titulo]) => !ya.has(sinTildes(titulo)))
      .map(([etapa, titulo, ir]) => ({ id: PL.nuevoId(), titulo, etapa, nota: null, hecha: false, hechaEn: null, ir: ir || null }));
    doc.datos.lista.push(...nuevas);
    filtros.tareas = 'pendientes';
    cambio(doc);
    pintar();
    panel.aviso(`Listo: ${nuevas.length} tareas, de un año antes a después de la boda.`);
  }

  function quitarTarea(t) {
    const lista = docs.tareas.datos.lista;
    const pos = lista.indexOf(t);
    if (pos < 0) return;
    lista.splice(pos, 1);
    cambio(docs.tareas);
    pintar();
    panel.aviso(`Tarea «${t.titulo}» quitada.`, {
      accion: 'Deshacer',
      alHacer: () => {
        // La lista pudo recargarse mientras tanto: se vuelve a poner en la de ahora.
        const ahora = docs.tareas.datos.lista;
        if (!tarea(t.id)) ahora.splice(Math.min(pos, ahora.length), 0, t);
        recien.tarea = t.id;
        cambio(docs.tareas);
        pintar();
      },
    });
  }

  function abrirTarea(t) {
    tareaEditando = t || null;
    formTarea.reset();
    $('[data-error-tarea]').textContent = '';
    $$('[aria-invalid]', formTarea).forEach((el) => el.removeAttribute('aria-invalid'));
    $('#dialogo-tarea-titulo').textContent = t ? 'Editar tarea' : 'Agregar tarea';
    $('[data-guardar-tarea]').textContent = t ? 'Guardar cambios' : 'Agregar';
    const lims = PL.limites(fechaBoda);
    const f = formTarea.elements;
    f.etapa.innerHTML = PL.ETAPAS.map((e) => `<option value="${e.id}">${esc(e.nombre)}${lims ? ` · hasta el ${esc(fechaLarga.format(deDia(lims[e.id].hasta)))}` : ''}</option>`).join('');
    $('[data-ayuda-etapa]').textContent = lims ? '' : 'Con la fecha de la boda (pestaña La boda) cada etapa dice hasta cuándo va.';
    if (t) {
      f.titulo.value = t.titulo;
      f.etapa.value = t.etapa;
      f.nota.value = t.nota || '';
    } else {
      // Una tarea nueva cae en la etapa que toca ahora.
      const hoy = PL.hoy();
      const ahora = lims && PL.ETAPAS.find((e) => momentoEtapa(lims[e.id], hoy) === 'ahora');
      f.etapa.value = ahora ? ahora.id : PL.ETAPAS[0].id;
    }
    dlgTarea.showModal();
    f.titulo.focus();
  }

  formTarea.addEventListener('submit', (e) => {
    e.preventDefault();
    const f = formTarea.elements;
    const titulo = f.titulo.value.trim();
    if (!titulo) {
      f.titulo.setAttribute('aria-invalid', 'true');
      $('[data-error-tarea]').textContent = 'Escribe la tarea.';
      f.titulo.focus();
      return;
    }
    const datos = { titulo: titulo.slice(0, 120), etapa: f.etapa.value, nota: f.nota.value.trim().slice(0, 300) || null };
    if (tareaEditando) {
      Object.assign(tareaEditando, datos);
      recien.tarea = tareaEditando.id;
    } else {
      const t = Object.assign({ id: PL.nuevoId(), hecha: false, hechaEn: null, ir: null }, datos);
      docs.tareas.datos.lista.push(t);
      recien.tarea = t.id;
      if (filtros.tareas === 'hechas') filtros.tareas = 'pendientes';
    }
    dlgTarea.close();
    cambio(docs.tareas);
    pintar();
    panel.aviso(tareaEditando ? 'Tarea actualizada.' : 'Tarea agregada.');
  });

  vistaTareas.addEventListener('change', (e) => {
    const c = e.target.closest('[data-hacer]');
    if (!c || !listo(docs.tareas)) return;
    const li = c.closest('[data-tarea]');
    const t = tarea(li.dataset.tarea);
    if (!t) return;
    marcarTarea(t, c.checked, li);
  });

  vistaTareas.addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    if (b.matches('[data-reintentar-planeacion]')) {
      recargar();
      return;
    }
    if (!listo(docs.tareas)) return;
    if (b.matches('[data-nueva-tarea]')) abrirTarea();
    else if (b.matches('[data-sembrar-tareas]')) sembrarTareas();
    else if (b.matches('[data-filtro-tarea]')) {
      filtros.tareas = b.dataset.filtroTarea;
      pintar();
      const igual = $(`[data-filtros-tareas] [data-filtro-tarea="${filtros.tareas}"]`, vistaTareas);
      if (igual) igual.focus();
    } else if (b.matches('[data-editar-tarea], [data-quitar-tarea]')) {
      const t = tarea(b.closest('[data-tarea]').dataset.tarea);
      if (!t) return;
      if (b.matches('[data-editar-tarea]')) abrirTarea(t);
      else {
        const li = b.closest('[data-tarea]');
        const siguiente = (li.nextElementSibling || li.previousElementSibling || {}).dataset;
        quitarTarea(t);
        const foco = siguiente && siguiente.tarea && $(`[data-tarea="${CSS.escape(siguiente.tarea)}"] [data-hacer]`, vistaTareas);
        (foco || $('[data-nueva-tarea]', vistaTareas)).focus();
      }
    }
  });

  // ---------- Presupuesto ----------

  const vistaPresupuesto = $('[data-vista-panel="presupuesto"]');
  const cajaPartidas = $('[data-partidas]', vistaPresupuesto);
  const campoTotal = $('[data-total-presupuesto]', vistaPresupuesto);
  const dlgPartida = $('#dialogo-partida');
  const formPartida = $('#form-partida');
  let partidaEditando = null;

  const partida = (id) => docs.presupuesto.datos.partidas.find((p) => p.id === id) || null;
  const proveedor = (id) => docs.proveedores.datos.lista.find((v) => v.id === id) || null;

  function confirmados() {
    return panel.invitados().reduce((s, i) => s + (i.estado === 'confirmado' ? i.asistentes : 0), 0);
  }

  function pintarCifrasPresupuesto() {
    const { total, partidas } = docs.presupuesto.datos;
    const c = PL.cuentas(partidas);
    const queda = total != null ? total - c.costo : null;
    const personas = confirmados();
    const vacio = '<span class="cero">—</span>';
    $('[data-contadores-presupuesto]').innerHTML = [
      ['Presupuesto', total != null ? esc(dinero(total)) : `${vacio}<small>sin definir</small>`, ''],
      ['Costo estimado', `${esc(dinero(c.costo))}${queda != null ? `<small>${queda >= 0 ? `quedan ${esc(dinero(queda))}` : `se pasa por ${esc(dinero(-queda))}`}</small>` : ''}`, queda != null && queda < 0 ? 'alerta' : ''],
      ['Pagado', esc(dinero(c.pagado)), ''],
      ['Por pagar', esc(dinero(c.porPagar)), ''],
      ['Por invitado', personas && c.costo ? `${esc(dinero(Math.round(c.costo / personas)))}<small>${cuantas(personas, 'confirmado', 'confirmados')}</small>` : `${vacio}<small>${personas ? 'sin gastos' : 'sin confirmados'}</small>`, ''],
    ].map(([e, v, k]) => `<div class="contador ${k}"><dt>${e}</dt><dd>${v}</dd></div>`).join('');

    const base = Math.max(total || 0, c.costo);
    const pct = (n) => `${((n / (base || 1)) * 100).toFixed(2)}%`;
    $('[data-reparto-presupuesto]').innerHTML = base ? `
      <div class="reparto-barra" role="img" aria-label="${esc(`Pagado ${dinero(c.pagado)}, por pagar ${dinero(c.porPagar)}${queda != null ? (queda >= 0 ? `, sin gastar ${dinero(queda)}` : `, se pasa por ${dinero(-queda)}`) : ''}`)}">
        <span class="r-hecha" style="width:${pct(c.pagado)}"></span>
        <span class="r-pendiente" style="width:${pct(c.porPagar)}"></span>
      </div>
      <ul class="reparto-leyenda">
        <li><i style="background:var(--verde-forro)"></i>Pagado ${esc(dinero(c.pagado))}</li>
        <li><i style="background:var(--salvia)"></i>Por pagar ${esc(dinero(c.porPagar))}</li>
        ${queda != null ? (queda >= 0
          ? `<li><i class="muestra-vacia"></i>Sin gastar ${esc(dinero(queda))}</li>`
          : `<li class="reparto-alerta"><i style="background:var(--declinado)"></i>Se pasa del presupuesto por ${esc(dinero(-queda))}</li>`) : ''}
      </ul>` : '';
  }

  function filaPartida(p) {
    const prov = p.proveedor ? proveedor(p.proveedor) : null;
    const saldo = PL.saldoDe(p);
    const meta = [
      prov && prov.nombre !== p.concepto ? `<span>${esc(prov.nombre)}</span>` : '',
      p.vence && saldo ? `<span>Próximo pago: ${esc(fechaCorta.format(deDia(p.vence)))}</span>` : '',
      p.nota ? `<span>${esc(p.nota)}</span>` : '',
    ].join('');
    const vacio = '<span class="dinero-vacio">—</span>';
    const celda = (n, etiqueta) => `<td class="col-dinero" data-etiqueta="${etiqueta}">${n != null ? esc(dinero(n)) : vacio}</td>`;
    const c = esc(p.concepto);
    return `<tr data-partida="${esc(p.id)}">
        <td class="col-concepto"><div class="invitado-nombre">${c}</div>${meta ? `<div class="invitado-meta">${meta}</div>` : ''}</td>
        ${celda(p.estimado, 'Estimado')}
        ${celda(p.costo, 'Costo final')}
        ${celda(p.pagado, 'Pagado')}
        <td class="col-dinero col-saldo" data-etiqueta="Por pagar">${PL.costoDe(p) ? (saldo ? esc(dinero(saldo)) : '<span class="saldado">Pagado</span>') : vacio}</td>
        <td class="col-acciones"><div class="acciones">
          <button class="boton-icono" type="button" data-editar-partida title="Editar" aria-label="Editar ${c}">${P.icono('editar')}</button>
          <button class="boton-icono peligro" type="button" data-quitar-partida title="Quitar" aria-label="Quitar ${c}">${P.icono('eliminar')}</button>
        </div></td>
      </tr>`;
  }

  function pintarPagos() {
    const caja = $('[data-pagos]', vistaPresupuesto);
    const pagos = docs.presupuesto.datos.partidas
      .filter((p) => p.vence && PL.saldoDe(p) > 0)
      .sort((a, b) => a.vence.localeCompare(b.vence))
      .slice(0, 8);
    if (!pagos.length) {
      caja.innerHTML = '<li class="correo-vacio">Pon la fecha del próximo pago en cada gasto y aquí verás lo que viene.</li>';
      return;
    }
    caja.innerHTML = pagos.map((p) => {
      const dias = diasHasta(p.vence);
      const f = P.fechaSello(`${p.vence}T12:00:00`);
      let cuando = `en ${dias} días`;
      if (dias < 0) cuando = `venció hace ${cuantas(-dias, 'día', 'días')}`;
      else if (dias === 0) cuando = 'vence hoy';
      else if (dias === 1) cuando = 'vence mañana';
      return `<li class="pago${dias < 0 ? ' vencido' : ''}">
          <span class="pago-hoja" aria-hidden="true"><span class="cifra">${f.dia}</span>${f.mes}</span>
          <div>
            <p class="correo-quien">${esc(p.concepto)}</p>
            <p class="correo-que">${esc(dinero(PL.saldoDe(p)))} · ${cuando}</p>
          </div>
        </li>`;
    }).join('');
  }

  function pintarPresupuesto() {
    const doc = docs.presupuesto;
    pintarCifrasPresupuesto();
    pintarPagos();
    if (document.activeElement !== campoTotal) campoTotal.value = doc.datos.total != null ? dinero(doc.datos.total) : '';
    campoTotal.disabled = !listo(doc);
    if (!listo(doc)) {
      cajaPartidas.innerHTML = sinCargar(doc, 'el presupuesto');
      panel.iconos(cajaPartidas);
      return;
    }
    const partidas = doc.datos.partidas;
    if (!partidas.length) {
      cajaPartidas.innerHTML = `<div class="marco-vacio"><div class="vacio">
          <h2>Aún no hay gastos</h2>
          <p>Anoten cada gasto con lo que creen que costará; cuando lo contraten, el costo final y lo que van pagando. O empiecen con los gastos de siempre, sin montos, y llénenlos.</p>
          <div class="libro-botones">
            <button class="boton boton-principal" type="button" data-nueva-partida data-icono="mas">Agregar gasto</button>
            <button class="boton boton-secundario" type="button" data-sembrar-partidas data-icono="dinero">Empezar con los gastos de siempre</button>
          </div>
        </div></div>`;
      panel.iconos(cajaPartidas);
      return;
    }
    cajaPartidas.innerHTML = Object.keys(PL.CATEGORIAS).map((cat) => {
      const lista = partidas.filter((p) => p.categoria === cat);
      if (!lista.length) return '';
      const s = PL.cuentas(lista);
      let suma = esc(dinero(s.costo));
      if (s.porPagar) suma += ` · por pagar ${esc(dinero(s.porPagar))}`;
      else if (s.costo) suma += ' · pagado';
      return `<section class="categoria" aria-labelledby="cat-${cat}">
          <header class="categoria-cabeza">
            <h2 class="categoria-titulo" id="cat-${cat}">${esc(PL.CATEGORIAS[cat])}</h2>
            <p class="categoria-suma">${suma}</p>
          </header>
          <div class="tabla-marco"><table class="tabla tabla-partidas">
            <thead><tr>
              <th class="col-concepto">Concepto</th>
              <th class="col-dinero">Estimado</th>
              <th class="col-dinero">Costo final</th>
              <th class="col-dinero">Pagado</th>
              <th class="col-dinero">Por pagar</th>
              <th class="col-acciones"><span class="solo-lectores">Acciones</span></th>
            </tr></thead>
            <tbody>${lista.map(filaPartida).join('')}</tbody>
          </table></div>
        </section>`;
    }).join('');
    if (recien.partidas) {
      recien.partidas.slice(1).forEach((id) => {
        const tr = $(`[data-partida="${CSS.escape(id)}"]`, cajaPartidas);
        if (tr) tr.classList.add('recien');
      });
      resaltar(`[data-partida="${CSS.escape(recien.partidas[0])}"]`);
      recien.partidas = null;
    }
  }

  function sembrarPartidas() {
    const doc = docs.presupuesto;
    const ya = new Set(doc.datos.partidas.map((p) => `${p.categoria}:${sinTildes(p.concepto)}`));
    const nuevas = PL.PARTIDAS_SUGERIDAS
      .filter(([cat, concepto]) => !ya.has(`${cat}:${sinTildes(concepto)}`))
      .map(([categoria, concepto]) => ({ id: PL.nuevoId(), categoria, concepto, estimado: null, costo: null, pagado: null, vence: null, proveedor: null, nota: null }));
    doc.datos.partidas.push(...nuevas);
    cambio(doc);
    pintar();
    panel.aviso(`Listo: ${nuevas.length} gastos sin montos. Toca el lápiz de cada uno para llenarlo.`);
  }

  function quitarPartida(p) {
    const lista = docs.presupuesto.datos.partidas;
    const pos = lista.indexOf(p);
    if (pos < 0) return;
    lista.splice(pos, 1);
    cambio(docs.presupuesto);
    pintar();
    panel.aviso(`Gasto «${p.concepto}» quitado.`, {
      accion: 'Deshacer',
      alHacer: () => {
        const ahora = docs.presupuesto.datos.partidas;
        if (!partida(p.id)) ahora.splice(Math.min(pos, ahora.length), 0, p);
        recien.partidas = [p.id];
        cambio(docs.presupuesto);
        pintar();
      },
    });
  }

  function opcionesCategoria(select, actual, { todas } = {}) {
    select.innerHTML = (todas ? `<option value="">${todas}</option>` : '')
      + Object.entries(PL.CATEGORIAS).map(([k, v]) => `<option value="${k}">${esc(v)}</option>`).join('');
    select.value = actual || (todas ? '' : 'otros');
  }

  function abrirPartida(p, base) {
    partidaEditando = p || null;
    formPartida.reset();
    $('[data-error-partida]').textContent = '';
    $$('[aria-invalid]', formPartida).forEach((el) => el.removeAttribute('aria-invalid'));
    $('#dialogo-partida-titulo').textContent = p ? 'Editar gasto' : 'Agregar gasto';
    $('[data-guardar-partida]').textContent = p ? 'Guardar cambios' : 'Agregar';
    const x = p || base || {};
    const f = formPartida.elements;
    opcionesCategoria(f.categoria, x.categoria || 'ceremonia');
    const provs = docs.proveedores.datos.lista
      .filter((v) => v.estado !== 'descartado' || v.id === x.proveedor)
      .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
    f.proveedor.innerHTML = '<option value="">Sin proveedor</option>'
      + provs.map((v) => `<option value="${esc(v.id)}">${esc(v.nombre)} · ${esc(PL.CATEGORIAS[v.categoria])}</option>`).join('');
    f.proveedor.value = x.proveedor && proveedor(x.proveedor) ? x.proveedor : '';
    f.concepto.value = x.concepto || '';
    ['estimado', 'costo', 'pagado'].forEach((k) => { f[k].value = x[k] != null ? dinero(x[k]) : ''; });
    f.vence.value = x.vence || '';
    f.nota.value = x.nota || '';
    dlgPartida.showModal();
    f.concepto.focus();
  }

  // Al elegir un proveedor en un gasto nuevo, su categoría viene con él.
  formPartida.elements.proveedor.addEventListener('change', (e) => {
    const v = proveedor(e.target.value);
    if (v && !partidaEditando) formPartida.elements.categoria.value = v.categoria;
  });

  formPartida.addEventListener('submit', (e) => {
    e.preventDefault();
    const f = formPartida.elements;
    const concepto = f.concepto.value.trim();
    if (!concepto) {
      f.concepto.setAttribute('aria-invalid', 'true');
      $('[data-error-partida]').textContent = 'Escribe en qué es el gasto.';
      f.concepto.focus();
      return;
    }
    const datos = {
      categoria: f.categoria.value,
      concepto: concepto.slice(0, 80),
      proveedor: f.proveedor.value || null,
      estimado: PL.leerPesos(f.estimado.value),
      costo: PL.leerPesos(f.costo.value),
      pagado: PL.leerPesos(f.pagado.value),
      vence: f.vence.value || null,
      nota: f.nota.value.trim().slice(0, 300) || null,
    };
    if (partidaEditando) Object.assign(partidaEditando, datos);
    else docs.presupuesto.datos.partidas.push(Object.assign({ id: PL.nuevoId() }, datos));
    const lista = docs.presupuesto.datos.partidas;
    recien.partidas = [partidaEditando ? partidaEditando.id : lista[lista.length - 1].id];
    dlgPartida.close();
    cambio(docs.presupuesto);
    pintar();
    panel.aviso(partidaEditando ? 'Gasto actualizado.' : 'Gasto agregado.');
  });

  campoTotal.addEventListener('input', () => {
    if (!listo(docs.presupuesto)) return;
    docs.presupuesto.datos.total = PL.leerPesos(campoTotal.value);
    cambio(docs.presupuesto);
    pintarCifrasPresupuesto();
  });

  function exportarPresupuesto() {
    const campos = ['Categoría', 'Concepto', 'Proveedor', 'Estimado', 'Costo final', 'Pagado', 'Por pagar', 'Próximo pago', 'Nota'];
    const celda = (v) => `"${String(v == null ? '' : v).replace(/"/g, '""')}"`;
    const orden = Object.keys(PL.CATEGORIAS);
    const filas = docs.presupuesto.datos.partidas
      .slice()
      .sort((a, b) => orden.indexOf(a.categoria) - orden.indexOf(b.categoria))
      .map((p) => {
        const v = p.proveedor && proveedor(p.proveedor);
        return [PL.CATEGORIAS[p.categoria], p.concepto, v ? v.nombre : '', p.estimado, p.costo, p.pagado, PL.saldoDe(p), p.vence, p.nota].map(celda).join(';');
      });
    const csv = '﻿' + [campos.map(celda).join(';')].concat(filas).join('\r\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    a.download = `presupuesto-diego-y-erika-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  }

  vistaPresupuesto.addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    if (b.matches('[data-reintentar-planeacion]')) {
      recargar();
      return;
    }
    if (!listo(docs.presupuesto)) return;
    if (b.matches('[data-nueva-partida]')) abrirPartida();
    else if (b.matches('[data-sembrar-partidas]')) sembrarPartidas();
    else if (b.matches('[data-exportar-presupuesto]')) {
      if (docs.presupuesto.datos.partidas.length) exportarPresupuesto();
      else panel.aviso('Aún no hay gastos para exportar.');
    } else if (b.matches('[data-editar-partida], [data-quitar-partida]')) {
      const p = partida(b.closest('[data-partida]').dataset.partida);
      if (!p) return;
      if (b.matches('[data-editar-partida]')) abrirPartida(p);
      else {
        quitarPartida(p);
        $('[data-nueva-partida]', vistaPresupuesto).focus();
      }
    }
  });

  // ---------- Proveedores ----------

  const vistaProveedores = $('[data-vista-panel="proveedores"]');
  const cajaProveedores = $('[data-lista-proveedores]', vistaProveedores);
  const dlgProveedor = $('#dialogo-proveedor');
  const formProveedor = $('#form-proveedor');
  let proveedorEditando = null;

  const FILTROS_PROVEEDORES = [
    { id: 'todos', texto: 'Todos', prueba: (v) => v.estado !== 'descartado' },
    { id: 'evaluando', texto: 'Evaluando', prueba: (v) => v.estado === 'evaluando' },
    { id: 'contratado', texto: 'Contratados', prueba: (v) => v.estado === 'contratado' },
    { id: 'descartado', texto: 'Descartados', prueba: (v) => v.estado === 'descartado' },
  ];

  $('[data-estados-proveedor]', formProveedor).innerHTML = Object.entries(PL.ESTADOS)
    .map(([k, v]) => `<label><input type="radio" name="estado" value="${k}"${k === 'evaluando' ? ' checked' : ''}><span>${v}</span></label>`).join('');

  const partidasDe = (v) => docs.presupuesto.datos.partidas.filter((p) => p.proveedor === v.id);

  function selloProveedor(estado) {
    return `<span class="sello-estado sello-${estado}">${PL.ESTADOS[estado]}</span>`;
  }

  function pintarCifrasProveedores() {
    const lista = docs.proveedores.datos.lista;
    const n = (e) => lista.filter((v) => v.estado === e).length;
    const ancho = 3;
    $('[data-contadores-proveedores]').innerHTML = [
      ['Proveedores', panel.cifra(lista.length - n('descartado'), ancho)],
      ['Contratados', panel.cifra(n('contratado'), ancho)],
      ['Evaluando', panel.cifra(n('evaluando'), ancho)],
      ['Descartados', panel.cifra(n('descartado'), ancho)],
    ].map(([e, v]) => `<div class="contador"><dt>${e}</dt><dd>${v}</dd></div>`).join('');

    $('[data-filtros-proveedores]', vistaProveedores).innerHTML = FILTROS_PROVEEDORES.map((f) => {
      const k = lista.filter(f.prueba).length;
      return `<button type="button" data-filtro-proveedor="${f.id}" aria-pressed="${filtros.proveedores.estado === f.id}">${f.texto} <b>${k}</b></button>`;
    }).join('');

    const select = $('[data-categoria-proveedor]', vistaProveedores);
    const usadas = Object.keys(PL.CATEGORIAS).filter((k) => lista.some((v) => v.categoria === k));
    if (filtros.proveedores.categoria && !usadas.includes(filtros.proveedores.categoria)) filtros.proveedores.categoria = '';
    select.innerHTML = '<option value="">Todas las categorías</option>'
      + usadas.map((k) => `<option value="${k}">${esc(PL.CATEGORIAS[k])} (${lista.filter((v) => v.categoria === k).length})</option>`).join('');
    select.value = filtros.proveedores.categoria;
    select.closest('.selector').hidden = usadas.length < 2;
  }

  function ficha(v) {
    const pres = partidasDe(v);
    const c = PL.cuentas(pres);
    const wa = panel.telefonoWa(v.telefono);
    const n = esc(v.nombre);
    const meta = [v.contacto && esc(v.contacto), v.telefono && esc(panel.telefonoBonito(v.telefono)), v.correo && esc(v.correo)].filter(Boolean).join(' · ');
    let enPresupuesto = '';
    if (pres.length) {
      enPresupuesto = `En el presupuesto: ${esc(dinero(c.costo))}`;
      if (c.porPagar) enPresupuesto += ` · faltan ${esc(dinero(c.porPagar))}`;
      else if (c.costo) enPresupuesto += ' · pagado';
    }
    return `<article class="ficha" data-proveedor="${esc(v.id)}" data-estado="${v.estado}">
        <header class="ficha-cabeza">
          <p class="ficha-categoria">${esc(PL.CATEGORIAS[v.categoria])}</p>
          ${selloProveedor(v.estado)}
        </header>
        <h3 class="ficha-nombre">${n}</h3>
        ${meta ? `<p class="ficha-meta">${meta}</p>` : ''}
        ${v.precio != null ? `<p class="ficha-precio"><b>${esc(dinero(v.precio))}</b> ${v.estado === 'contratado' ? 'acordado' : 'cotizado'}</p>` : ''}
        ${enPresupuesto ? `<p class="ficha-presupuesto">${enPresupuesto}</p>` : ''}
        ${v.nota ? `<p class="ficha-nota">${esc(v.nota)}</p>` : ''}
        <div class="acciones ficha-acciones">
          ${wa ? `<a class="boton-icono" href="https://wa.me/${wa}" target="_blank" rel="noopener" title="Escribir por WhatsApp" aria-label="Escribirle a ${n} por WhatsApp">${P.icono('whatsapp')}</a>
          <a class="boton-icono" href="tel:${esc(v.telefono.replace(/[^\d+]/g, ''))}" title="Llamar" aria-label="Llamar a ${n}">${P.icono('telefono')}</a>` : ''}
          ${v.correo ? `<a class="boton-icono" href="mailto:${esc(v.correo)}" title="Escribir un correo" aria-label="Escribirle un correo a ${n}">${P.icono('sobre')}</a>` : ''}
          ${v.web ? `<a class="boton-icono" href="${esc(v.web)}" target="_blank" rel="noopener" title="Abrir su página" aria-label="Abrir la página de ${n}">${P.icono('externo')}</a>` : ''}
          <span class="ficha-hueco"></span>
          <button class="boton-icono" type="button" data-al-presupuesto title="${pres.length ? 'Ver en el presupuesto' : 'Agregar al presupuesto'}" aria-label="${pres.length ? `Ver a ${n} en el presupuesto` : `Agregar a ${n} al presupuesto`}">${P.icono('dinero')}</button>
          <button class="boton-icono" type="button" data-editar-proveedor title="Editar" aria-label="Editar a ${n}">${P.icono('editar')}</button>
          <button class="boton-icono peligro" type="button" data-quitar-proveedor title="Quitar" aria-label="Quitar a ${n}">${P.icono('eliminar')}</button>
        </div>
      </article>`;
  }

  function pintarProveedores() {
    const doc = docs.proveedores;
    pintarCifrasProveedores();
    if (!listo(doc)) {
      cajaProveedores.innerHTML = sinCargar(doc, 'los proveedores');
      panel.iconos(cajaProveedores);
      return;
    }
    const lista = doc.datos.lista;
    if (!lista.length) {
      cajaProveedores.innerHTML = `<div class="marco-vacio"><div class="vacio">
          <h2>Aún no hay proveedores</h2>
          <p>Anoten a cada fotógrafo, banquete o músico que coticen, con su contacto y su precio. Al contratarlo, llévenlo al presupuesto con un toque.</p>
          <div class="libro-botones">
            <button class="boton boton-principal" type="button" data-nuevo-proveedor data-icono="mas">Agregar el primer proveedor</button>
          </div>
        </div></div>`;
      panel.iconos(cajaProveedores);
      return;
    }
    const fl = filtros.proveedores;
    const f = FILTROS_PROVEEDORES.find((x) => x.id === fl.estado) || FILTROS_PROVEEDORES[0];
    const q = sinTildes(fl.busqueda.trim());
    const orden = Object.keys(PL.CATEGORIAS);
    const peso = { contratado: 0, evaluando: 1, descartado: 2 };
    const visibles = lista
      .filter((v) => f.prueba(v) && (!fl.categoria || v.categoria === fl.categoria))
      .filter((v) => !q || [v.nombre, v.contacto, v.nota, v.correo, PL.CATEGORIAS[v.categoria]].some((x) => sinTildes(x).includes(q)))
      .sort((a, b) => orden.indexOf(a.categoria) - orden.indexOf(b.categoria) || peso[a.estado] - peso[b.estado] || a.nombre.localeCompare(b.nombre, 'es'));
    if (!visibles.length) {
      cajaProveedores.innerHTML = `<div class="marco-vacio"><div class="vacio"><h2>Nadie coincide</h2><p>Ningún proveedor cumple con la búsqueda o el filtro elegido.</p>
          <div class="libro-botones"><button class="boton boton-secundario" type="button" data-limpiar-proveedores>Quitar filtros</button></div></div></div>`;
      return;
    }
    cajaProveedores.innerHTML = `<div class="fichas">${visibles.map(ficha).join('')}</div>`;
    if (recien.proveedor) {
      resaltar(`[data-proveedor="${CSS.escape(recien.proveedor)}"]`);
      recien.proveedor = null;
    }
  }

  // Un proveedor pasa al presupuesto como un gasto de su categoría, con su precio.
  function alPresupuesto(v) {
    const pres = partidasDe(v);
    if (pres.length) {
      recien.partidas = pres.map((p) => p.id);
      location.hash = '#presupuesto';
      return;
    }
    const p = {
      id: PL.nuevoId(),
      categoria: v.categoria,
      concepto: v.nombre,
      estimado: v.precio,
      costo: v.estado === 'contratado' ? v.precio : null,
      pagado: null,
      vence: null,
      proveedor: v.id,
      nota: null,
    };
    docs.presupuesto.datos.partidas.push(p);
    cambio(docs.presupuesto);
    pintar();
    panel.aviso(`${v.nombre} quedó en el presupuesto${v.precio != null ? ` por ${dinero(v.precio)}` : ''}.`, {
      accion: 'Ver',
      alHacer: () => {
        recien.partidas = [p.id];
        location.hash = '#presupuesto';
      },
    });
  }

  function quitarProveedor(v) {
    const lista = docs.proveedores.datos.lista;
    const pos = lista.indexOf(v);
    if (pos < 0) return;
    lista.splice(pos, 1);
    // Sus gastos se quedan en el presupuesto, sin proveedor.
    const sueltas = partidasDe(v).map((p) => p.id);
    docs.presupuesto.datos.partidas.forEach((p) => { if (sueltas.includes(p.id)) p.proveedor = null; });
    cambio(docs.proveedores);
    if (sueltas.length) cambio(docs.presupuesto);
    pintar();
    panel.aviso(`${v.nombre} quitado de los proveedores.${sueltas.length ? ` ${cuantas(sueltas.length, 'gasto sigue', 'gastos siguen')} en el presupuesto.` : ''}`, {
      accion: 'Deshacer',
      alHacer: () => {
        const ahora = docs.proveedores.datos.lista;
        if (!proveedor(v.id)) ahora.splice(Math.min(pos, ahora.length), 0, v);
        docs.presupuesto.datos.partidas.forEach((p) => { if (sueltas.includes(p.id)) p.proveedor = v.id; });
        recien.proveedor = v.id;
        cambio(docs.proveedores);
        if (sueltas.length) cambio(docs.presupuesto);
        pintar();
      },
    });
  }

  function abrirProveedor(v) {
    proveedorEditando = v || null;
    formProveedor.reset();
    $('[data-error-proveedor]').textContent = '';
    $$('[aria-invalid]', formProveedor).forEach((el) => el.removeAttribute('aria-invalid'));
    $('#dialogo-proveedor-titulo').textContent = v ? 'Editar proveedor' : 'Agregar proveedor';
    $('[data-guardar-proveedor]').textContent = v ? 'Guardar cambios' : 'Agregar';
    const f = formProveedor.elements;
    opcionesCategoria(f.categoria, v ? v.categoria : (filtros.proveedores.categoria || 'foto'));
    $(`input[name="estado"][value="${v ? v.estado : 'evaluando'}"]`, formProveedor).checked = true;
    if (v) {
      f.nombre.value = v.nombre;
      f.contacto.value = v.contacto || '';
      f.telefono.value = v.telefono || '';
      f.correo.value = v.correo || '';
      f.web.value = v.web || '';
      f.precio.value = v.precio != null ? dinero(v.precio) : '';
      f.nota.value = v.nota || '';
    }
    dlgProveedor.showModal();
    f.nombre.focus();
  }

  formProveedor.addEventListener('submit', (e) => {
    e.preventDefault();
    const f = formProveedor.elements;
    const error = $('[data-error-proveedor]');
    $$('[aria-invalid]', formProveedor).forEach((el) => el.removeAttribute('aria-invalid'));
    const datos = {
      nombre: f.nombre.value.trim().slice(0, 80),
      categoria: f.categoria.value,
      estado: f.estado.value || 'evaluando',
      contacto: f.contacto.value.trim().slice(0, 80) || null,
      telefono: f.telefono.value.trim() || null,
      correo: f.correo.value.trim() || null,
      web: f.web.value.trim() || null,
      precio: PL.leerPesos(f.precio.value),
      nota: f.nota.value.trim().slice(0, 600) || null,
    };
    let malo = null;
    if (!datos.nombre) malo = [f.nombre, 'Escribe el nombre del proveedor.'];
    else if (datos.telefono && datos.telefono.replace(/\D/g, '').length < 7) malo = [f.telefono, 'Ese teléfono parece incompleto.'];
    else if (datos.correo && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(datos.correo)) malo = [f.correo, 'Revisa el correo: le falta algo.'];
    else if (datos.web && !/^https:\/\/\S+$/.test(datos.web)) malo = [f.web, 'La página debe empezar por https://'];
    if (malo) {
      malo[0].setAttribute('aria-invalid', 'true');
      error.textContent = malo[1];
      malo[0].focus();
      return;
    }
    const antes = proveedorEditando ? proveedorEditando.estado : null;
    let v = proveedorEditando;
    if (v) Object.assign(v, datos);
    else {
      v = Object.assign({ id: PL.nuevoId() }, datos);
      docs.proveedores.datos.lista.push(v);
      if (!FILTROS_PROVEEDORES.find((x) => x.id === filtros.proveedores.estado).prueba(v)) filtros.proveedores.estado = 'todos';
    }
    recien.proveedor = v.id;
    dlgProveedor.close();
    cambio(docs.proveedores);
    pintar();
    const contratado = v.estado === 'contratado' && antes !== 'contratado';
    if (contratado && !partidasDe(v).length) {
      panel.aviso(`${v.nombre} quedó contratado.`, {
        accion: 'Agregar al presupuesto',
        alHacer: () => {
          const actual = proveedor(v.id);
          if (actual) alPresupuesto(actual);
        },
      });
    } else {
      panel.aviso(proveedorEditando ? 'Proveedor actualizado.' : 'Proveedor agregado.');
    }
  });

  vistaProveedores.addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    if (b.matches('[data-reintentar-planeacion]')) {
      recargar();
      return;
    }
    if (!listo(docs.proveedores)) return;
    if (b.matches('[data-nuevo-proveedor]')) abrirProveedor();
    else if (b.matches('[data-filtro-proveedor]')) {
      filtros.proveedores.estado = b.dataset.filtroProveedor;
      pintar();
      const igual = $(`[data-filtro-proveedor="${filtros.proveedores.estado}"]`, vistaProveedores);
      if (igual) igual.focus();
    } else if (b.matches('[data-limpiar-proveedores]')) {
      filtros.proveedores = { estado: 'todos', categoria: '', busqueda: '' };
      $('[data-buscar-proveedor]', vistaProveedores).value = '';
      pintar();
    } else if (b.matches('[data-al-presupuesto], [data-editar-proveedor], [data-quitar-proveedor]')) {
      const v = proveedor(b.closest('[data-proveedor]').dataset.proveedor);
      if (!v) return;
      if (b.matches('[data-al-presupuesto]')) alPresupuesto(v);
      else if (b.matches('[data-editar-proveedor]')) abrirProveedor(v);
      else {
        quitarProveedor(v);
        $('[data-nuevo-proveedor]', vistaProveedores).focus();
      }
    }
  });

  let temporizadorBusqueda;
  $('[data-buscar-proveedor]', vistaProveedores).addEventListener('input', (e) => {
    clearTimeout(temporizadorBusqueda);
    temporizadorBusqueda = setTimeout(() => {
      filtros.proveedores.busqueda = e.target.value;
      pintar();
    }, 120);
  });

  $('[data-categoria-proveedor]', vistaProveedores).addEventListener('change', (e) => {
    filtros.proveedores.categoria = e.target.value;
    pintar();
  });

  // ---------- Diálogos y regreso a la pestaña ----------

  const dialogos = [dlgTarea, dlgPartida, dlgProveedor];
  dialogos.forEach((d) => $$('[data-cerrar]', d).forEach((b) => b.addEventListener('click', () => d.close())));

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState !== 'visible' || !vista || $('#panel').hidden || dialogos.some((d) => d.open)) return;
    recargar();
  });

  window.Planeacion = {
    iniciar(utilidades) {
      panel = utilidades;
    },
    // admin.js avisa qué pestaña quedó a la vista.
    mostrar(nombre) {
      vista = VISTAS.includes(nombre) ? nombre : null;
      if (!vista) return;
      pintar();
      recargar();
    },
    // Los invitados cambiaron: el costo por invitado también.
    alCambiarInvitados() {
      if (vista === 'presupuesto') pintarCifrasPresupuesto();
    },
  };
})();
