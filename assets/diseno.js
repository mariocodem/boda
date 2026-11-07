/*
 * La pestaña «Diseño» del panel: la invitación como en WordPress.
 *
 * A la izquierda, los bloques de la página (ver assets/pagina.js): se ordenan
 * arrastrándolos (o con sus flechas), se ocultan, se duplican, se quitan y se
 * agregan; al tocar uno se editan sus textos y lo suyo. En «Tema» se elige el
 * diseño (Pliegos o Editorial), los colores, las letras, el fondo, el trato y
 * la mariposa. A la derecha, la invitación de verdad (index.html?vista=editor)
 * dentro de un iframe, que recibe cada cambio al instante; tocar un bloque en
 * ella lo abre aquí.
 *
 * Todo se edita en un borrador que se guarda solo y que solo ven los novios
 * (Datos.diseno). «Publicar» lo pasa al evento, que es lo que ven los
 * invitados; «Descartar cambios» vuelve a lo publicado.
 *
 * admin.js la arranca con sus utilidades (Diseno.iniciar) y le dice qué
 * pestaña se abre (Diseno.mostrar).
 */
(function () {
  const D = window.Datos;
  const P = window.Papeleria;
  const Pg = window.Pagina;
  const C = window.BODA;
  const esc = P.escapar;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  // Utilidades del panel: aviso, iconos, hace, prepararFoto.
  let u = null;

  const vista = $('[data-vista-panel="diseno"]');
  const raiz = $('[data-diseno]', vista);
  const panelBloques = $('[data-panel-bloques]', vista);
  const panelTema = $('[data-panel-tema]', vista);
  const panelBloque = $('[data-panel-bloque]', vista);
  const marco = $('[data-marco]', vista);
  const iframe = $('[data-vista-previa]', vista);

  const d = {
    cargado: false,
    cargando: null,
    error: '',
    publicado: null, // { pagina, estilo, mariposa }: lo que ven los invitados
    borrador: null,  // lo mismo, más subidas (fotos del borrador) y editadoEn
    evento: null,    // los datos de la boda: dicen qué secciones están vacías
    elegido: null,   // el bloque abierto ('portada' y 'cierre' son los fijos)
    pestana: 'bloques',
    dispositivo: 'movil',
    invitado: 'uno',
    sobre: false,
    pendiente: false,
    guardando: false,
    otraVez: false,
    temporizador: null,
    publicando: false,
    subiendo: 0,
    arrastre: null,
  };

  const NOMBRES = { uno: C.pareja.uno.nombre, dos: C.pareja.dos.nombre };
  const copia = (x) => JSON.parse(JSON.stringify(x));
  const pagina = () => d.borrador.pagina;

  // ---------- Borrador y publicado ----------

  function limpio(x) {
    return { pagina: Pg.normalizar(x.pagina), estilo: Estilos.normalizar(x.estilo), mariposa: x.mariposa !== false };
  }

  const huella = (x) => JSON.stringify(limpio(x));
  const hayCambios = () => Boolean(d.borrador && d.publicado) && huella(d.borrador) !== huella(d.publicado);

  async function cargar() {
    d.error = '';
    pintarEstado('Cargando…');
    try {
      const [ev, borrador] = await Promise.all([D.evento(), D.diseno()]);
      d.evento = ev;
      d.publicado = limpio(ev);
      d.borrador = borrador ? Object.assign(limpio(borrador), { subidas: borrador.subidas || [], editadoEn: borrador.editadoEn }) : Object.assign(copia(d.publicado), { subidas: [], editadoEn: null });
      d.cargado = true;
    } catch (err) {
      d.error = err.message;
    }
    pintarTodo();
    cargarVista();
  }

  function cambio({ lista = true } = {}) {
    d.borrador.pagina = Pg.normalizar(d.borrador.pagina);
    d.pendiente = true;
    clearTimeout(d.temporizador);
    d.temporizador = setTimeout(guardarBorrador, 800);
    enviarVista();
    if (lista) pintarBloques();
    pintarEstado();
  }

  async function guardarBorrador() {
    clearTimeout(d.temporizador);
    if (!d.borrador) return true;
    if (d.guardando) {
      d.otraVez = true;
      return false;
    }
    d.guardando = true;
    d.pendiente = false;
    pintarEstado();
    let ok = false;
    try {
      d.borrador.editadoEn = new Date().toISOString();
      await D.guardarDiseno(d.borrador);
      ok = true;
    } catch (err) {
      d.pendiente = true;
      u.aviso(err.message, { error: true, accion: 'Reintentar', alHacer: guardarBorrador });
    } finally {
      d.guardando = false;
      pintarEstado();
      if (d.otraVez) {
        d.otraVez = false;
        guardarBorrador();
      }
    }
    return ok;
  }

  // Las fotos que se subieron para el borrador y ya no usa nadie se borran.
  function limpiarFotos(antes) {
    const usadas = new Set([...Pg.fotosDe(d.publicado.pagina), ...Pg.fotosDe(d.borrador.pagina)]);
    const sobran = new Set([...antes, ...d.borrador.subidas].filter((r) => !usadas.has(r)));
    sobran.forEach((r) => D.borrarFoto(r).catch(() => { /* queda huérfana; no estorba */ }));
    d.borrador.subidas = d.borrador.subidas.filter((r) => !sobran.has(r) && !Pg.fotosDe(d.publicado.pagina).has(r));
  }

  // ---------- Respaldo: exportar, importar y restaurar ----------

  function descargar(nombre, texto) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([texto], { type: 'application/json' }));
    a.download = nombre;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  }

  async function exportarJson() {
    try {
      const evento = await D.evento();
      const contenido = { formato: 'invitacion-boda', version: 1, exportado: new Date().toISOString(), evento, borrador: d.borrador ? limpio(d.borrador) : null };
      descargar('invitacion.json', JSON.stringify(contenido, null, 2));
      u.aviso('Descargado: invitacion.json.');
    } catch (err) {
      u.aviso(err.message, { error: true });
    }
  }

  async function importarJson(archivo) {
    let j = null;
    try {
      j = JSON.parse(await archivo.text());
    } catch {
      j = null;
    }
    const ev = j && (j.evento || j);
    if (!ev || typeof ev !== 'object' || Array.isArray(ev) || !('pagina' in ev || 'fecha' in ev || 'ceremonia' in ev)) {
      u.aviso('Ese archivo no es un invitacion.json de esta invitación.', { error: true });
      return;
    }
    if (!window.confirm('Importar reemplaza los datos de la boda guardados (fecha, lugares, textos…) y deja el diseño del archivo en el borrador, sin publicarlo. ¿Seguir?')) return;
    try {
      const actual = await D.evento();
      const datos = Object.assign({}, ev);
      ['pagina', 'estilo', 'mariposa'].forEach((k) => { delete datos[k]; });
      // Los datos de la boda se guardan; el diseño publicado se queda como está.
      await D.guardarEvento(Object.assign({}, actual, datos, { pagina: actual.pagina, estilo: actual.estilo, mariposa: actual.mariposa }));
      d.borrador = Object.assign(limpio(j.borrador || ev), { subidas: d.borrador ? d.borrador.subidas : [], editadoEn: null });
      await guardarBorrador();
      u.aviso('Importado. El diseño quedó en el borrador: revísalo y publícalo.');
      setTimeout(() => location.reload(), 1200);
    } catch (err) {
      u.aviso(err.message, { error: true });
    }
  }

  function restaurarDiseno() {
    if (!d.borrador) return;
    if (!window.confirm('El borrador vuelve al diseño de arranque: tema, colores, letras, textos y orden de los bloques. Los datos de la boda no se tocan y nada se publica hasta que pulses Publicar. ¿Seguir?')) return;
    d.borrador.pagina = Pg.normalizar(null);
    d.borrador.estilo = Estilos.normalizar((window.BODA || {}).estilo);
    d.borrador.mariposa = (window.BODA || {}).mariposa !== false;
    cambio();
    pintarTodo();
    u.aviso('El borrador volvió al diseño de arranque.');
  }

  async function publicar() {
    if (d.publicando || d.subiendo || !hayCambios()) return;
    d.publicando = true;
    pintarEstado('Publicando…');
    try {
      const antes = Pg.fotosDe(d.publicado.pagina);
      const nuevo = limpio(d.borrador);
      // Solo cambia el diseño: los datos de la boda se quedan como están.
      const actual = await D.evento();
      const guardado = await D.guardarEvento(Object.assign({}, actual, nuevo));
      d.evento = guardado;
      d.publicado = limpio(guardado);
      limpiarFotos(antes);
      await guardarBorrador();
      document.dispatchEvent(new CustomEvent('diseno:publicado', { detail: d.publicado.pagina }));
      u.aviso(D.modo === 'local' ? 'Publicado en este navegador.' : 'Publicado: los invitados ya ven el diseño nuevo.');
    } catch (err) {
      u.aviso(err.message, { error: true });
    } finally {
      d.publicando = false;
      pintarEstado();
    }
  }

  function descartar() {
    if (!hayCambios()) return;
    const antes = copia(d.borrador);
    d.borrador = Object.assign(copia(d.publicado), { subidas: antes.subidas, editadoEn: null });
    d.elegido = null;
    pintarTodo();
    cambio();
    u.aviso('Volviste a lo publicado.', {
      accion: 'Deshacer',
      alHacer: () => {
        d.borrador = antes;
        pintarTodo();
        cambio();
      },
    });
  }

  // ---------- La vista previa ----------

  function cargarVista() {
    if (!d.cargado) return;
    iframe.src = `index.html?vista=editor${d.sobre ? '&sobre=1' : ''}`;
  }

  let envio = 0;
  function enviarVista() {
    if (envio || !d.borrador) return;
    envio = requestAnimationFrame(() => {
      envio = 0;
      if (!iframe.contentWindow) return;
      iframe.contentWindow.postMessage({ tipo: 'diseno', pagina: pagina(), estilo: d.borrador.estilo, mariposa: d.borrador.mariposa, invitado: d.invitado }, location.origin);
    });
  }

  function mostrarEnVista(id, mostrar = true) {
    if (iframe.contentWindow) iframe.contentWindow.postMessage({ tipo: 'elegir', id, mostrar }, location.origin);
  }

  addEventListener('message', (e) => {
    if (e.origin !== location.origin || e.source !== iframe.contentWindow || !e.data) return;
    if (e.data.tipo === 'lista') {
      enviarVista();
      if (d.elegido) setTimeout(() => mostrarEnVista(d.elegido), 300);
    } else if (e.data.tipo === 'elegido') {
      abrir(e.data.id, { desdeVista: true });
    }
  });

  // En computador la invitación se pinta a 1280 de ancho y se achica para caber.
  function ajustarMarco() {
    marco.dataset.dispositivo = d.dispositivo;
    if (d.dispositivo !== 'computador') {
      iframe.style.removeProperty('width');
      iframe.style.removeProperty('height');
      iframe.style.removeProperty('transform');
      return;
    }
    const escala = Math.min(1, marco.clientWidth / 1280);
    iframe.style.width = '1280px';
    iframe.style.height = `${Math.round(marco.clientHeight / escala)}px`;
    iframe.style.transform = `scale(${escala})`;
  }
  new ResizeObserver(() => { if (!vista.hidden) ajustarMarco(); }).observe(marco);

  // ---------- Pintar ----------

  function pintarTodo() {
    pintarEstado();
    if (!d.cargado) {
      panelBloques.innerHTML = d.error
        ? `<div class="diseno-error"><p><b>No se pudo traer el diseño.</b> ${esc(d.error)}</p><button class="boton boton-secundario" type="button" data-reintentar-diseno data-icono="actualizar">Intentar de nuevo</button></div>`
        : '<p class="diseno-ayuda">Cargando el diseño…</p>';
      u.iconos(panelBloques);
      return;
    }
    pintarPestanas();
    pintarBloques();
    pintarTema();
    pintarBloque();
    pintarBarraVista();
  }

  function pintarEstado(texto) {
    const el = $('[data-estado-diseno]', vista);
    const cambios = hayCambios();
    let t = texto;
    if (!t) {
      if (!d.cargado) t = d.error ? 'Sin conexión con el diseño' : 'Cargando…';
      else if (d.subiendo) t = 'Subiendo la foto…';
      else if (d.guardando) t = 'Guardando el borrador…';
      else if (cambios) t = `Borrador con cambios sin publicar${d.borrador.editadoEn && !d.pendiente ? ` · guardado ${u.hace(d.borrador.editadoEn)}` : ''}`;
      else t = D.modo === 'local' ? 'Todo publicado (en este navegador)' : 'Todo publicado: los invitados ven esto';
    }
    el.textContent = t;
    el.dataset.tono = cambios ? 'sucio' : 'listo';
    $('[data-publicar]', vista).disabled = !cambios || d.publicando || d.subiendo > 0;
    $('[data-descartar]', vista).disabled = !cambios || d.publicando;
  }

  function pintarPestanas() {
    const abierto = Boolean(d.elegido);
    $$('[data-pestana]', vista).forEach((b) => {
      const si = b.dataset.pestana === d.pestana;
      b.setAttribute('aria-selected', String(si && !abierto));
      b.tabIndex = si ? 0 : -1;
    });
    panelBloques.hidden = abierto || d.pestana !== 'bloques';
    panelTema.hidden = abierto || d.pestana !== 'tema';
    panelBloque.hidden = !abierto;
  }

  function pintarBarraVista() {
    $$('[data-dispositivo]', vista).forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.dispositivo === d.dispositivo)));
    $$('[data-invitado]', vista).forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.invitado === d.invitado)));
    $('[data-ver-sobre]', vista).setAttribute('aria-pressed', String(d.sobre));
    ajustarMarco();
  }

  // ---------- Bloques: la lista ----------

  const tipoDe = (id) => (id === 'portada' || id === 'cierre' ? id : (pagina().bloques.find((b) => b.id === id) || {}).tipo);
  const bloqueDe = (id) => pagina().bloques.find((b) => b.id === id) || null;
  const valoresDe = (id) => (id === 'portada' || id === 'cierre' ? pagina()[id] : bloqueDe(id));

  // Por qué una sección no se ve aunque esté encendida: le faltan datos.
  function sinDatos(tipo) {
    const ev = d.evento;
    if (!ev) return '';
    if (tipo === 'alojamiento' && !ev.alojamiento.hoteles.length) return 'Sin hoteles: no se ve';
    if (tipo === 'historia' && !ev.historia) return 'Sin historia: no se ve';
    if (tipo === 'preguntas' && !ev.preguntas.length) return 'Sin preguntas: no se ve';
    if (tipo === 'contacto' && !(C.contacto && C.contacto.whatsapp)) return 'Sin WhatsApp de contacto: no se ve';
    if (tipo === 'fotos') {
      const lugares = P.lugaresFotos(ev.fotos.length, Boolean(ev.historia), pagina());
      if (!lugares.includes('momentos')) return 'Sin fotos que sobren: no se ve';
    }
    return '';
  }

  // Lo que dice cada fila debajo del nombre.
  function resumen(b) {
    if (b.oculto) return 'Oculto';
    const t = Pg.TIPOS[b.tipo];
    if (t.libre) {
      if (b.tipo === 'texto') return b.titulo || (b.cuerpo ? b.cuerpo.slice(0, 60) : 'Vacío: no se ve');
      if (b.tipo === 'foto') return b.foto ? (b.pie || 'Una foto') : 'Sin foto: no se ve';
      if (b.tipo === 'galeria') return b.fotos.length ? `${b.fotos.length} ${b.fotos.length === 1 ? 'foto' : 'fotos'}` : 'Sin fotos: no se ve';
      if (b.tipo === 'cita') return b.texto ? b.texto.slice(0, 60) : 'Vacía: no se ve';
      if (b.tipo === 'boton') return b.enlace ? Pg.texto(pagina(), b, 'etiqueta') : 'Sin enlace: no se ve';
      if (b.tipo === 'separador') return b.adorno === 'linea' ? 'Línea fina' : Pg.FLORES[b.adorno];
      if (b.tipo === 'video') return Pg.videoEmbebido(b.enlace) ? (b.titulo || 'Video') : 'Sin video: no se ve';
      return Pg.texto(pagina(), b, 'titulo');
    }
    // El título, si no es el mismo nombre del bloque.
    const titulo = t.campos.some((c) => c.clave === 'titulo') ? Pg.texto(pagina(), b, 'titulo') : '';
    return sinDatos(b.tipo) || (titulo === t.nombre ? '' : titulo);
  }

  function filaFija(id) {
    const t = Pg.TIPOS[id];
    return `<li class="bloque-fila fija${d.elegido === id ? ' elegida' : ''}" data-id="${id}">
        <span class="bloque-asa" aria-hidden="true"></span>
        <button class="bloque-abrir" type="button" data-abrir="${id}">
          ${P.icono(t.icono)}<span class="bloque-nombre">${t.nombre}<small>${id === 'portada' ? 'Va siempre primero' : 'Va siempre al final'}</small></span>
        </button>
      </li>`;
  }

  function filaBloque(b, i, total) {
    const t = Pg.TIPOS[b.tipo];
    const nombre = esc(t.nombre);
    const vacio = !b.oculto && /no se ve/.test(resumen(b));
    return `<li class="bloque-fila${b.oculto ? ' oculta' : ''}${vacio ? ' vacia' : ''}${d.elegido === b.id ? ' elegida' : ''}" data-id="${esc(b.id)}">
        <span class="bloque-asa" data-asa title="Arrastra para cambiarlo de lugar">${P.icono('arrastrar')}</span>
        <button class="bloque-abrir" type="button" data-abrir="${esc(b.id)}">
          ${P.icono(t.icono)}<span class="bloque-nombre">${nombre}<small>${esc(resumen(b))}</small></span>
        </button>
        <span class="bloque-botones">
          <button class="boton-icono" type="button" data-mover="-1" aria-label="Subir ${nombre}"${i === 0 ? ' disabled' : ''}>${P.icono('subir_fila')}</button>
          <button class="boton-icono" type="button" data-mover="1" aria-label="Bajar ${nombre}"${i === total - 1 ? ' disabled' : ''}>${P.icono('bajar_fila')}</button>
          ${t.obligatorio ? '' : `<button class="boton-icono" type="button" data-ocultar aria-pressed="${Boolean(b.oculto)}" aria-label="${b.oculto ? 'Mostrar' : 'Ocultar'} ${nombre}" title="${b.oculto ? 'Mostrar' : 'Ocultar'}">${P.icono(b.oculto ? 'oculto' : 'ojo')}</button>`}
        </span>
      </li>`;
  }

  function pintarBloques() {
    if (!d.cargado) return;
    const foco = document.activeElement && panelBloques.contains(document.activeElement) ? document.activeElement : null;
    const clave = foco && foco.closest('[data-id]') ? [foco.closest('[data-id]').dataset.id, foco.dataset.mover || (foco.matches('[data-ocultar]') ? 'ocultar' : 'abrir')] : null;
    const bloques = pagina().bloques;
    panelBloques.innerHTML = `
      <p class="diseno-ayuda">Toca un bloque para editarlo, aquí o en la vista previa. Arrástralo por su asa para cambiarlo de lugar.</p>
      <ol class="bloques-lista" data-lista>
        ${filaFija('portada')}
        ${bloques.map((b, i) => filaBloque(b, i, bloques.length)).join('')}
        ${filaFija('cierre')}
      </ol>
      <div class="agregar">
        <button class="boton boton-secundario" type="button" data-agregar-bloque aria-expanded="false" aria-controls="menu-agregar" data-icono="mas">Agregar bloque</button>
        <div class="agregar-menu" id="menu-agregar" data-menu-agregar hidden>
          ${Pg.LIBRES.map((tipo) => {
            const t = Pg.TIPOS[tipo];
            return `<button class="agregar-opcion" type="button" data-nuevo="${tipo}">${P.icono(t.icono)}<span><b>${t.nombre}</b><small>${t.ayuda}</small></span></button>`;
          }).join('')}
        </div>
      </div>`;
    u.iconos(panelBloques);
    if (clave) {
      const fila = $(`[data-id="${CSS.escape(clave[0])}"]`, panelBloques);
      const el = fila && (clave[1] === 'abrir' ? $('[data-abrir]', fila) : clave[1] === 'ocultar' ? $('[data-ocultar]', fila) : $(`[data-mover="${clave[1]}"]`, fila));
      if (el && !el.disabled) el.focus();
      else if (fila) $('[data-abrir]', fila).focus();
    }
  }

  function mover(id, paso) {
    const lista = pagina().bloques;
    const i = lista.findIndex((b) => b.id === id);
    const j = i + paso;
    if (i < 0 || j < 0 || j >= lista.length) return;
    const [b] = lista.splice(i, 1);
    lista.splice(j, 0, b);
    cambio();
    mostrarEnVista(id);
  }

  function ocultar(id) {
    const b = bloqueDe(id);
    if (!b || Pg.TIPOS[b.tipo].obligatorio) return;
    b.oculto = !b.oculto;
    cambio();
    pintarBloque();
    if (!b.oculto) setTimeout(() => mostrarEnVista(id), 250);
  }

  function agregar(tipo) {
    const b = Pg.nuevoBloque(tipo);
    const lista = pagina().bloques;
    const i = lista.findIndex((x) => x.id === d.elegido);
    if (i >= 0) lista.splice(i + 1, 0, b);
    else lista.push(b);
    cambio();
    abrir(b.id);
  }

  function duplicar(id) {
    const b = bloqueDe(id);
    if (!b || !Pg.TIPOS[b.tipo].libre) return;
    const nuevo = Pg.duplicar(b);
    const lista = pagina().bloques;
    lista.splice(lista.indexOf(b) + 1, 0, nuevo);
    cambio();
    abrir(nuevo.id);
    u.aviso(`${Pg.TIPOS[b.tipo].nombre}: copia agregada debajo.`);
  }

  function quitar(id) {
    const lista = pagina().bloques;
    const i = lista.findIndex((b) => b.id === id);
    if (i < 0 || !Pg.TIPOS[lista[i].tipo].libre) return;
    const [b] = lista.splice(i, 1);
    d.elegido = null;
    pintarPestanas();
    cambio();
    const fila = $$('[data-abrir]', panelBloques)[Math.min(i + 1, lista.length)];
    if (fila) fila.focus();
    u.aviso(`Bloque «${Pg.TIPOS[b.tipo].nombre}» quitado.`, {
      accion: 'Deshacer',
      alHacer: () => {
        pagina().bloques.splice(Math.min(i, pagina().bloques.length), 0, b);
        cambio();
        abrir(b.id);
      },
    });
  }

  // Arrastrar una fila por su asa, con el ratón o con el dedo.
  panelBloques.addEventListener('pointerdown', (e) => {
    const asa = e.target.closest('[data-asa]');
    if (!asa || e.button !== 0) return;
    const fila = asa.closest('[data-id]');
    e.preventDefault();
    const filas = $$('.bloque-fila:not(.fija)', panelBloques);
    d.arrastre = { fila, filas, desde: filas.indexOf(fila), hasta: filas.indexOf(fila), y: e.clientY, puntero: e.pointerId, altos: filas.map((f) => f.getBoundingClientRect()) };
    asa.setPointerCapture(e.pointerId);
    fila.classList.add('llevando');
  });

  panelBloques.addEventListener('pointermove', (e) => {
    const a = d.arrastre;
    if (!a || e.pointerId !== a.puntero) return;
    const dy = e.clientY - a.y;
    const r = a.altos[a.desde];
    const centro = r.top + r.height / 2 + dy;
    let hasta = a.altos.findIndex((x) => centro < x.top + x.height / 2);
    if (hasta < 0) hasta = a.altos.length - 1;
    else if (hasta > a.desde) hasta -= 1;
    a.hasta = hasta;
    a.fila.style.transform = `translateY(${dy}px)`;
    a.filas.forEach((f, k) => {
      if (f === a.fila) return;
      let mueve = 0;
      if (a.desde < hasta && k > a.desde && k <= hasta) mueve = -r.height;
      if (a.desde > hasta && k < a.desde && k >= hasta) mueve = r.height;
      f.style.transform = mueve ? `translateY(${mueve}px)` : '';
    });
  });

  function soltarFila(e) {
    const a = d.arrastre;
    if (!a || e.pointerId !== a.puntero) return;
    d.arrastre = null;
    a.filas.forEach((f) => { f.style.transform = ''; });
    a.fila.classList.remove('llevando');
    if (e.type === 'pointerup' && a.hasta !== a.desde) {
      const lista = pagina().bloques;
      const [b] = lista.splice(a.desde, 1);
      lista.splice(a.hasta, 0, b);
      cambio();
      mostrarEnVista(b.id);
    }
  }
  panelBloques.addEventListener('pointerup', soltarFila);
  panelBloques.addEventListener('pointercancel', soltarFila);

  // ---------- Un bloque abierto: sus campos ----------

  function abrir(id, { desdeVista = false } = {}) {
    if (!tipoDe(id)) return;
    d.elegido = id;
    // En el teléfono, tocar un bloque en la vista previa vuelve a editar.
    if (desdeVista) cambiarModo('editar');
    pintarPestanas();
    pintarBloque();
    pintarBloques();
    if (!desdeVista) mostrarEnVista(id);
    const titulo = $('[data-titulo-bloque]', panelBloque);
    if (titulo) titulo.focus({ preventScroll: desdeVista });
  }

  function cerrar() {
    const id = d.elegido;
    d.elegido = null;
    mostrarEnVista(null, false);
    pintarPestanas();
    pintarBloques();
    const fila = id && $(`[data-id="${CSS.escape(id)}"] [data-abrir]`, panelBloques);
    if (fila) fila.focus();
  }

  const DATOS = {
    portada: ['La foto, los nombres, la fecha y la ciudad', 'Foto principal'],
    fecha: ['La fecha, la hora y los lugares', 'Fecha'],
    ceremonia: ['Los lugares y sus mapas', 'Ceremonia'],
    alojamiento: ['Los hoteles', 'Alojamiento'],
    itinerario: ['Los momentos del día', 'Itinerario'],
    historia: ['El texto de la historia', 'Nuestra historia'],
    fotos: ['Las fotos de la pareja', 'Fotos de la pareja'],
    vestimenta: ['El código, la nota y las fotos de referencia', 'Vestimenta'],
    regalos: ['El mensaje, la cuenta y las listas', 'Regalos'],
    preguntas: ['Las preguntas y sus respuestas', 'Preguntas frecuentes'],
    respuesta: ['La fecha límite y las preguntas opcionales', 'Tarjeta de respuesta'],
  };

  function campoHtml(c, v) {
    const id = `dc-${c.clave}`;
    const varios = c.defecto && typeof c.defecto === 'object';
    if (c.tipo === 'linea' || c.tipo === 'parrafos' || c.tipo === 'enlace') {
      const defecto = varios ? (pagina().trato === 'usted' ? c.defecto.usted : c.defecto.tu) : (c.defecto || '');
      const entrada = (clave, valor, ejemplo, idx) => (c.tipo === 'parrafos'
        ? `<textarea id="${idx}" data-campo="${clave}" rows="5" maxlength="${c.max}" placeholder="${esc(ejemplo)}">${esc(valor || '')}</textarea>`
        : `<input id="${idx}" type="${c.tipo === 'enlace' ? 'url' : 'text'}" data-campo="${clave}" ${c.max ? `maxlength="${c.max}"` : ''} placeholder="${esc(c.tipo === 'enlace' ? 'https://' : ejemplo)}" value="${esc(valor || '')}" autocomplete="off"${c.tipo === 'enlace' ? ' inputmode="url" spellcheck="false"' : ''}>`);
      const ayuda = c.ayuda || (defecto ? 'Vacío, va el texto de siempre.' : '');
      let html = `<div class="campo">
          <label class="campo-etiqueta" for="${id}">${esc(c.etiqueta)}${varios ? ' <em>(para una persona)</em>' : ''}</label>
          ${entrada(c.clave, v[c.clave], defecto, id)}
          ${ayuda ? `<span class="campo-ayuda">${esc(ayuda)}</span>` : ''}
        </div>`;
      if (varios) {
        html += `<div class="campo">
            <label class="campo-etiqueta" for="${id}-varios">${esc(c.etiqueta)} <em>(para una familia)</em></label>
            ${entrada(`${c.clave}Varios`, v[`${c.clave}Varios`], c.defecto.varios, `${id}-varios`)}
          </div>`;
      }
      return html;
    }
    if (c.tipo === 'opciones') {
      return `<fieldset class="campo">
          <legend class="campo-etiqueta">${esc(c.etiqueta)}</legend>
          <div class="segmentos segmentos-form">${Object.entries(c.opciones).map(([valor, texto]) => `<label><input type="radio" name="dc-${c.clave}" data-campo="${c.clave}" value="${valor}"${v[c.clave] === valor ? ' checked' : ''}><span>${esc(texto)}</span></label>`).join('')}</div>
        </fieldset>`;
    }
    if (c.tipo === 'flor') {
      const opciones = Object.entries(Pg.FLORES).concat([['linea', 'Línea fina']]);
      return `<fieldset class="campo">
          <legend class="campo-etiqueta">${esc(c.etiqueta)}</legend>
          <div class="flores">${opciones.map(([k, nombre]) => `<label class="flor-opcion">
              <input type="radio" name="dc-${c.clave}" data-campo="${c.clave}" value="${k}"${v[c.clave] === k ? ' checked' : ''}>
              <span class="flor-muestra">${k === 'linea' ? '<i class="flor-linea"></i>' : `<img src="assets/flores/${k}-600.webp" alt="" loading="lazy">`}</span>
              <span class="flor-nombre">${esc(nombre)}</span>
            </label>`).join('')}</div>
          <span class="campo-ayuda">Láminas de Pierre-Joseph Redouté (siglo XIX, dominio público).</span>
        </fieldset>`;
    }
    if (c.tipo === 'foto') {
      const f = v[c.clave];
      return `<div class="campo">
          <span class="campo-etiqueta">${esc(c.etiqueta)}</span>
          <div class="diseno-fotos">
            ${f ? `<figure class="diseno-foto"><img data-miniatura="${esc(f.url)}" alt="La foto elegida"></figure>` : ''}
            <label class="boton boton-secundario subir-boton diseno-subir">
              <input type="file" accept="image/*" data-subir-foto="${c.clave}" class="solo-lectores">
              ${P.icono('subir')}<span>${f ? 'Cambiar la foto' : 'Elegir foto'}</span>
            </label>
            ${f ? `<button class="enlace-quitar" type="button" data-quitar-foto="${c.clave}">Quitar la foto</button>` : ''}
          </div>
          <span class="campo-ayuda">El panel la reduce y la pasa a JPG antes de subirla.</span>
        </div>`;
    }
    if (c.tipo === 'fotos') {
      const lista = v[c.clave] || [];
      return `<div class="campo">
          <span class="campo-etiqueta">${esc(c.etiqueta)} <em>(${lista.length} de ${c.max})</em></span>
          <ul class="diseno-galeria">${lista.map((f, i) => `<li>
              <img data-miniatura="${esc(f.url)}" alt="Foto ${i + 1}">
              <span class="diseno-galeria-botones">
                <button class="boton-icono" type="button" data-mover-foto="${i}" data-paso="-1" aria-label="Foto ${i + 1} antes"${i === 0 ? ' disabled' : ''}>${P.icono('antes')}</button>
                <button class="boton-icono" type="button" data-mover-foto="${i}" data-paso="1" aria-label="Foto ${i + 1} después"${i === lista.length - 1 ? ' disabled' : ''}>${P.icono('despues')}</button>
                <button class="boton-icono peligro" type="button" data-quitar-de="${c.clave}" data-i="${i}" aria-label="Quitar la foto ${i + 1}">${P.icono('cerrar')}</button>
              </span>
            </li>`).join('')}</ul>
          ${lista.length < c.max ? `<label class="boton boton-secundario subir-boton diseno-subir">
              <input type="file" accept="image/*" multiple data-subir-fotos="${c.clave}" data-max="${c.max}" class="solo-lectores">
              ${P.icono('subir')}<span>Agregar fotos</span>
            </label>` : ''}
        </div>`;
    }
    // Una lista de colores con nombre (la paleta de la vestimenta): selector de
    // color, nombre, quitar y agregar.
    if (c.tipo === 'colores') {
      const lista = v[c.clave] == null ? c.defecto : v[c.clave];
      return `<div class="campo campo-colores">
          <span class="campo-etiqueta">${esc(c.etiqueta)} <em>(${lista.length} de ${c.max})</em></span>
          <ul class="lista-colores">${lista.map((x, i) => `<li>
              <input type="color" value="${esc(x.hex)}" data-color-de="${c.clave}" data-i="${i}" data-parte="hex" aria-label="Color ${i + 1}${x.nombre ? `: ${esc(x.nombre)}` : ''}">
              <input type="text" value="${esc(x.nombre)}" data-color-de="${c.clave}" data-i="${i}" data-parte="nombre" maxlength="30" aria-label="Nombre del color ${i + 1}" autocomplete="off">
              <button class="boton-icono peligro" type="button" data-quitar-color="${c.clave}" data-i="${i}" aria-label="Quitar ${esc(x.nombre || `el color ${i + 1}`)}">${P.icono('cerrar')}</button>
            </li>`).join('')}</ul>
          <div class="lista-colores-botones">
            ${lista.length < c.max ? `<button class="boton boton-secundario" type="button" data-agregar-color="${c.clave}">${P.icono('mas')}<span>Agregar color</span></button>` : ''}
            ${v[c.clave] != null ? `<button class="enlace-accion" type="button" data-colores-siempre="${c.clave}">Volver a los de siempre</button>` : ''}
          </div>
          ${c.ayuda ? `<span class="campo-ayuda">${esc(c.ayuda)}</span>` : ''}
        </div>`;
    }
    return '';
  }

  // La lista de colores de un campo, para cambiarla (copia: el borrador se
  // normaliza con cada cambio).
  function listaDeColores(clave) {
    const v = valoresDe(d.elegido);
    const c = v && Pg.campo(tipoDe(d.elegido), clave);
    if (!c) return null;
    return { v, c, lista: (v[clave] == null ? c.defecto : v[clave]).map((x) => Object.assign({}, x)) };
  }

  function leerColor(t) {
    const x = listaDeColores(t.dataset.colorDe);
    const k = Number(t.dataset.i);
    if (!x || !x.lista[k]) return;
    x.lista[k][t.dataset.parte] = t.value;
    x.v[x.c.clave] = x.lista;
    cambio({ lista: false });
  }

  function pintarBloque() {
    if (!d.cargado || !d.elegido) {
      panelBloque.innerHTML = '';
      return;
    }
    const id = d.elegido;
    const tipo = tipoDe(id);
    if (!tipo) {
      d.elegido = null;
      pintarPestanas();
      return;
    }
    const t = Pg.TIPOS[tipo];
    const v = valoresDe(id);
    const datos = t.datos && DATOS[t.datos];
    const falta = sinDatos(tipo);
    panelBloque.innerHTML = `
      <header class="bloque-cabeza">
        <button class="boton boton-barra boton-chico volver" type="button" data-cerrar-bloque data-icono="antes">Bloques</button>
        <h2 class="bloque-titulo" tabindex="-1" data-titulo-bloque>${P.icono(t.icono)}<span>${esc(t.nombre)}</span></h2>
      </header>
      <p class="diseno-ayuda">${esc(t.ayuda)}</p>
      ${v.oculto ? '<p class="bloque-aviso">Está oculto: los invitados no lo ven.</p>' : falta ? `<p class="bloque-aviso">${esc(falta)}.</p>` : ''}
      ${datos ? `<p class="bloque-datos">${esc(datos[0])}: en <a href="#boda" data-ir-boda>La boda → ${esc(datos[1])}</a>.</p>` : ''}
      ${tipo === 'fotos' && pagina().tema !== 'editorial' ? '<p class="campo-ayuda">En el tema Pliegos las fotos van sueltas, sin título a la vista: lo leen los lectores de pantalla.</p>' : ''}
      <div class="bloque-campos" data-campos>${t.campos.map((c) => campoHtml(c, v)).join('')}</div>
      ${t.fijo ? '' : `<div class="bloque-acciones">
        ${t.obligatorio ? '' : `<button class="boton boton-secundario boton-chico" type="button" data-ocultar-abierto data-icono="${v.oculto ? 'ojo' : 'oculto'}">${v.oculto ? 'Mostrar' : 'Ocultar'}</button>`}
        ${t.libre ? '<button class="boton boton-secundario boton-chico" type="button" data-duplicar data-icono="duplicar">Duplicar</button>' : ''}
        ${t.libre ? '<button class="boton boton-secundario boton-chico peligro" type="button" data-quitar-bloque data-icono="eliminar">Quitar</button>' : ''}
      </div>`}`;
    u.iconos(panelBloque);
    $$('[data-miniatura]', panelBloque).forEach(async (img) => {
      const url = await D.urlFoto(img.dataset.miniatura);
      if (url) img.src = url;
      else img.closest('figure, li').classList.add('falta');
    });
  }

  // Un campo cambia: el valor va al borrador y a la vista previa al instante.
  function leerCampo(t) {
    const v = valoresDe(d.elegido);
    if (!v) return;
    v[t.dataset.campo] = t.value;
    cambio({ lista: false });
    // La fila de la lista dice el título o el estado del bloque.
    const fila = $(`[data-id="${CSS.escape(d.elegido)}"] small`, panelBloques);
    const b = bloqueDe(d.elegido);
    if (fila && b) fila.textContent = resumen(b);
  }

  async function subirFotos(archivos, max) {
    const elegidos = Array.from(archivos || []).slice(0, max);
    const refs = [];
    d.subiendo += 1;
    pintarEstado();
    try {
      for (const archivo of elegidos) {
        const f = await u.prepararFoto(archivo, 1800);
        const url = await D.subirFoto(f.blob, 'diseno');
        URL.revokeObjectURL(f.vista);
        d.borrador.subidas.push(url);
        refs.push({ url, forma: f.forma });
      }
    } catch (err) {
      u.aviso(err.message, { error: true });
    } finally {
      d.subiendo -= 1;
      pintarEstado();
    }
    if (Array.from(archivos || []).length > max) u.aviso(max === 1 ? 'Solo cabía 1 foto más: se agregó la primera.' : `Solo cabían ${max} fotos más: se agregaron las primeras.`);
    return refs;
  }

  panelBloque.addEventListener('input', (e) => {
    if (e.target.dataset.campo && e.target.type !== 'radio') leerCampo(e.target);
    else if (e.target.dataset.colorDe) leerColor(e.target);
  });

  panelBloque.addEventListener('click', (e) => {
    const b = e.target.closest('[data-agregar-color], [data-quitar-color], [data-colores-siempre]');
    if (!b) return;
    const clave = b.dataset.agregarColor || b.dataset.quitarColor || b.dataset.coloresSiempre;
    const x = listaDeColores(clave);
    if (!x) return;
    let lista = x.lista;
    if (b.dataset.agregarColor) lista.push({ nombre: 'Nuevo color', hex: '#c9a3b5' });
    else if (b.dataset.quitarColor) lista.splice(Number(b.dataset.i), 1);
    else lista = null;
    x.v[clave] = lista;
    cambio();
    pintarBloque();
    const foco = b.dataset.agregarColor ? $$('.lista-colores input[type="text"]', panelBloque).pop() : $(`[data-agregar-color="${clave}"]`, panelBloque);
    if (foco) foco.focus();
  });

  panelBloque.addEventListener('change', async (e) => {
    const t = e.target;
    if (t.dataset.campo && t.type === 'radio') {
      leerCampo(t);
      return;
    }
    // Un enlace que no empieza por https:// no llega a la invitación.
    if (t.type === 'url') {
      const malo = t.value.trim() && !/^https:\/\/\S+$/.test(t.value.trim());
      if (malo) {
        t.setAttribute('aria-invalid', 'true');
        u.aviso('El enlace debe empezar por https://', { error: true });
      } else t.removeAttribute('aria-invalid');
      return;
    }
    const v = valoresDe(d.elegido);
    if (t.dataset.subirFoto) {
      const id = d.elegido;
      const [f] = await subirFotos(t.files, 1);
      if (f && d.elegido === id) {
        v[t.dataset.subirFoto] = f;
        cambio();
        pintarBloque();
        $(`[data-subir-foto]`, panelBloque).focus();
      }
    } else if (t.dataset.subirFotos) {
      const id = d.elegido;
      const lista = v[t.dataset.subirFotos];
      const nuevas = await subirFotos(t.files, Number(t.dataset.max) - lista.length);
      if (nuevas.length && d.elegido === id) {
        lista.push(...nuevas);
        cambio();
        pintarBloque();
        const otra = $('[data-subir-fotos]', panelBloque);
        if (otra) otra.focus();
      }
    }
  });

  panelBloque.addEventListener('click', (e) => {
    const b = e.target.closest('button, a');
    if (!b) return;
    const v = valoresDe(d.elegido);
    if (b.matches('[data-cerrar-bloque]')) cerrar();
    else if (b.matches('[data-ocultar-abierto]')) {
      ocultar(d.elegido);
      const otro = $('[data-ocultar-abierto]', panelBloque);
      if (otro) otro.focus();
    } else if (b.matches('[data-duplicar]')) duplicar(d.elegido);
    else if (b.matches('[data-quitar-bloque]')) quitar(d.elegido);
    else if (b.matches('[data-quitar-foto]')) {
      v[b.dataset.quitarFoto] = null;
      cambio();
      pintarBloque();
      $('[data-subir-foto]', panelBloque).focus();
    } else if (b.matches('[data-quitar-de]')) {
      const lista = v[b.dataset.quitarDe];
      lista.splice(Number(b.dataset.i), 1);
      cambio();
      pintarBloque();
      const resto = $$('[data-quitar-de]', panelBloque);
      (resto[Math.min(Number(b.dataset.i), resto.length - 1)] || $('[data-subir-fotos]', panelBloque)).focus();
    } else if (b.matches('[data-mover-foto]')) {
      const clave = Pg.TIPOS[tipoDe(d.elegido)].campos.find((c) => c.tipo === 'fotos').clave;
      const lista = v[clave];
      const i = Number(b.dataset.moverFoto);
      const j = i + Number(b.dataset.paso);
      [lista[i], lista[j]] = [lista[j], lista[i]];
      cambio();
      pintarBloque();
      const mismo = $(`[data-mover-foto="${j}"][data-paso="${b.dataset.paso}"]`, panelBloque);
      if (mismo && !mismo.disabled) mismo.focus();
    }
  });

  // ---------- Tema ----------

  function pintarTema() {
    if (!d.cargado) return;
    // El foco vuelve al mismo control después de pintar.
    const activo = panelTema.contains(document.activeElement) ? document.activeElement : null;
    const marca = activo && (activo.dataset.tema ? 'tema' : activo.dataset.fondo ? 'fondo' : null);
    const volver = marca ? `[data-${marca}="${activo.dataset[marca]}"]` : null;
    pintarFormTema();
    if (volver) {
      const el = $(`${volver}:checked`, panelTema) || $(volver, panelTema);
      if (el) el.focus();
    }
  }

  function pintarFormTema() {
    const p = pagina();
    const e = d.borrador.estilo;
    const f = p.fondo;
    const paletas = Object.entries(Estilos.PALETAS).concat([[Estilos.LIBRE, { nombre: 'Color libre' }]]);
    panelTema.innerHTML = `
      <fieldset class="tema-grupo">
        <legend class="tema-titulo">Diseño</legend>
        <div class="temas">${Object.entries(Pg.TEMAS).map(([k, t]) => `<label class="tema-opcion">
            <input type="radio" name="dt-tema" data-tema="tema" value="${k}"${p.tema === k ? ' checked' : ''}>
            <span class="tema-muestra tema-muestra-${k}" aria-hidden="true"><i></i><i></i><i></i></span>
            <span class="tema-nombre"><b>${esc(t.nombre)}</b><small>${esc(t.descripcion)}</small></span>
          </label>`).join('')}</div>
      </fieldset>

      <fieldset class="tema-grupo">
        <legend class="tema-titulo">Colores</legend>
        <div class="paletas">${paletas.map(([clave, pl]) => `<label class="paleta${clave === Estilos.LIBRE ? ' paleta-libre' : ''}">
            <input type="radio" name="dt-paleta" data-tema="paleta" value="${clave}"${e.paleta === clave ? ' checked' : ''}>
            <span class="paleta-muestra" data-paleta-muestra="${clave}" aria-hidden="true">
              <span class="paleta-sobre"></span>
              <span class="paleta-carta">${esc(NOMBRES.uno[0])}<i>&amp;</i>${esc(NOMBRES.dos[0])}</span>
            </span>
            <span class="paleta-nombre">${esc(pl.nombre)}</span>
          </label>`).join('')}</div>
        <div class="color-libre">
          <label class="color-libre-rueda">
            <input type="color" data-tema="color" value="${e.color || Estilos.COLOR_LIBRE}">
            <span>Elegir cualquier color</span>
          </label>
          <input class="color-libre-codigo" data-tema="color-codigo" type="text" value="${e.color || Estilos.COLOR_LIBRE}" maxlength="7" spellcheck="false" autocomplete="off" aria-label="Código del color, por ejemplo #c9a3b5">
        </div>
        <p class="campo-ayuda">Con un color claro la invitación va en tinta oscura de ese tono; con uno oscuro, en letras claras.</p>
      </fieldset>

      <fieldset class="tema-grupo">
        <legend class="tema-titulo">Letra de los títulos</legend>
        <div class="letras">${Object.entries(Estilos.LETRAS).map(([clave, l]) => `<label class="letra">
            <input type="radio" name="dt-letra" data-tema="letra" value="${clave}"${e.letra === clave ? ' checked' : ''}>
            <span class="letra-muestra" data-letra-muestra="${clave}" aria-hidden="true">
              <span class="letra-nombres">${esc(NOMBRES.uno)} <i>&amp;</i> ${esc(NOMBRES.dos)}</span>
              <span class="letra-texto">tienen el gusto de invitarte</span>
            </span>
            <span class="letra-nombre">${esc(l.nombre)}<small>${esc(l.descripcion)}</small></span>
          </label>`).join('')}</div>
        <label class="campo">
          <span class="campo-etiqueta">Letra del texto</span>
          <select data-tema="letraTexto">
            <option value="">La misma de los títulos</option>
            ${Object.entries(Estilos.LETRAS).filter(([k]) => k !== e.letra).map(([k, l]) => `<option value="${k}"${e.letraTexto === k ? ' selected' : ''}>${esc(l.nombre)}: ${esc(l.descripcion.toLowerCase())}</option>`).join('')}
          </select>
          <span class="campo-ayuda">Los párrafos, las fechas y las horas.</span>
        </label>
      </fieldset>

      <fieldset class="tema-grupo">
        <legend class="tema-titulo">Fondo</legend>
        <div class="segmentos segmentos-form">${[['tema', 'Del tema'], ['color', 'Color'], ['degradado', 'Degradado'], ['imagen', 'Foto']].map(([k, t]) => `<label><input type="radio" name="dt-fondo" data-fondo="tipo" value="${k}"${f.tipo === k || (k === 'imagen' && d.fondoFoto) ? ' checked' : ''}><span>${t}</span></label>`).join('')}</div>
        ${f.tipo === 'color' || f.tipo === 'degradado' ? `<div class="fondo-colores">
            <label class="color-libre-rueda"><input type="color" data-fondo="color" value="${f.color}"><span>${f.tipo === 'degradado' ? 'Primer color' : 'Color'}</span></label>
            ${f.tipo === 'degradado' ? `<label class="color-libre-rueda"><input type="color" data-fondo="color2" value="${f.color2}"><span>Segundo color</span></label>` : ''}
          </div>
          ${f.tipo === 'degradado' ? `<label class="campo"><span class="campo-etiqueta">Dirección</span>
            <select data-fondo="direccion">${Object.entries(Pg.DIRECCIONES).map(([k, t]) => `<option value="${k}"${f.direccion === k ? ' selected' : ''}>${t}</option>`).join('')}</select></label>` : ''}
          <p class="campo-ayuda">Los títulos que van sobre el fondo se oscurecen o se aclaran solos para leerse.</p>` : ''}
        ${f.tipo === 'imagen' || d.fondoFoto ? `<div class="diseno-fotos">
            ${f.imagen ? `<figure class="diseno-foto"><img data-miniatura="${esc(f.imagen.url)}" alt="La foto del fondo"></figure>` : ''}
            <label class="boton boton-secundario subir-boton diseno-subir"><input type="file" accept="image/*" data-fondo-foto class="solo-lectores">${P.icono('subir')}<span>${f.imagen ? 'Cambiar la foto' : 'Elegir foto'}</span></label>
          </div>
          ${f.imagen ? `<label class="campo"><span class="campo-etiqueta">Velo sobre la foto: <output data-velo-valor>${f.velo}%</output></span>
            <input type="range" min="0" max="90" step="5" value="${f.velo}" data-fondo="velo">
            <span class="campo-ayuda">Un velo del color del suelo, para que los títulos se lean sobre la foto.</span></label>` : '<p class="campo-ayuda">Elige una foto: va quieta detrás de toda la invitación.</p>'}` : ''}
      </fieldset>

      <fieldset class="tema-grupo">
        <legend class="tema-titulo">Trato</legend>
        <div class="segmentos segmentos-form">
          <label><input type="radio" name="dt-trato" data-tema="trato" value="tu"${p.trato === 'tu' ? ' checked' : ''}><span>Tú</span></label>
          <label><input type="radio" name="dt-trato" data-tema="trato" value="usted"${p.trato === 'usted' ? ' checked' : ''}><span>Usted</span></label>
        </div>
        <p class="campo-ayuda">Cómo le hablan a quien la invitación es para una sola persona: «¿Nos acompañas?» o «¿Nos acompaña?». A una familia siempre se le habla de «ustedes».</p>
      </fieldset>

      <fieldset class="tema-grupo">
        <legend class="tema-titulo">Mariposa dorada</legend>
        <label class="casilla"><input type="checkbox" data-tema="mariposa"${d.borrador.mariposa ? ' checked' : ''}><span>Que vuele por la invitación</span></label>
        <p class="campo-ayuda">Se posa en el ramo, acompaña a los invitados mientras bajan y se posa en la tarjeta donde se detienen.</p>
      </fieldset>

      <fieldset class="tema-grupo">
        <legend class="tema-titulo">Animaciones</legend>
        <div class="segmentos segmentos-form">
          ${Object.entries(Pg.ANIMACIONES).map(([k, t]) => `<label><input type="radio" name="dt-animacion" data-tema="animacion" value="${k}"${p.animacion === k ? ' checked' : ''}><span>${t}</span></label>`).join('')}
        </div>
        <p class="campo-ayuda">Completas: todo se mueve. Suaves: sin lo que se repite sin fin (la niebla, el vaivén del ramo). Ninguna: todo quieto y legible, como con «reducir movimiento» en el teléfono.</p>
      </fieldset>

      <fieldset class="tema-grupo">
        <legend class="tema-titulo">Música</legend>
        <label class="campo"><span class="campo-etiqueta">Canción</span>
          <input type="text" data-tema="musica-archivo" value="${esc(p.musica.archivo || '')}" placeholder="media/cancion.mp3" spellcheck="false" autocomplete="off">
          <span class="campo-ayuda">Pon el mp3 en la carpeta <code>media/</code> del sitio y escribe aquí su ruta, o pega un enlace https. Que sea una canción que puedan usar.</span></label>
        <label class="campo"><span class="campo-etiqueta">Volumen: <output data-musica-valor>${Math.round(p.musica.volumen * 100)}%</output></span>
          <input type="range" min="5" max="100" step="5" value="${Math.round(p.musica.volumen * 100)}" data-tema="musica-volumen"></label>
        <label class="casilla"><input type="checkbox" data-tema="musica-activa"${p.musica.activa ? ' checked' : ''}><span>Que suene al abrir el sobre</span></label>
        <p class="campo-ayuda">Nunca suena sola: arranca con el toque que abre el sobre, entra despacio y el botón redondo de abajo a la derecha la pausa.</p>
      </fieldset>

      <fieldset class="tema-grupo">
        <legend class="tema-titulo">Respaldo</legend>
        <div class="diseno-respaldo">
          <button class="boton boton-secundario" type="button" data-respaldo="exportar" data-icono="descargar">Exportar invitacion.json</button>
          <label class="boton boton-secundario subir-boton"><input type="file" accept="application/json,.json" data-respaldo="importar" class="solo-lectores">${P.icono('subir')}<span>Importar</span></label>
          <button class="boton boton-secundario" type="button" data-respaldo="restaurar" data-icono="deshacer">Restaurar el diseño de arranque</button>
        </div>
        <p class="campo-ayuda">Exportar descarga todo el contenido: los datos de la boda, el diseño publicado y el borrador. Importar lo trae de vuelta: los datos de la boda se guardan al instante y el diseño queda en el borrador para revisarlo y publicarlo. Las fotos subidas en modo local no viajan en el archivo. Restaurar vuelve el borrador al diseño de arranque (los datos de la boda no se tocan).</p>
      </fieldset>`;
    u.iconos(panelTema);
    pintarMuestras();
    $$('[data-miniatura]', panelTema).forEach(async (img) => {
      const url = await D.urlFoto(img.dataset.miniatura);
      if (url) img.src = url;
    });
    Object.keys(Estilos.LETRAS).forEach(Estilos.cargarLetra);
  }

  // Cada opción se pinta con su paleta (o su letra) y lo demás elegido.
  function pintarMuestras() {
    const e = d.borrador.estilo;
    $$('[data-paleta-muestra]', panelTema).forEach((el) => Estilos.aplicar({ paleta: el.dataset.paletaMuestra, letra: e.letra, color: e.color || Estilos.COLOR_LIBRE }, el));
    $$('[data-letra-muestra]', panelTema).forEach((el) => Estilos.aplicar(Object.assign({}, e, { letra: el.dataset.letraMuestra, letraTexto: e.letraTexto }), el));
  }

  function cambiarEstilo(cambios, { tema = true } = {}) {
    d.borrador.estilo = Estilos.normalizar(Object.assign({}, d.borrador.estilo, cambios));
    cambio({ lista: false });
    if (tema) pintarTema();
    else pintarMuestras();
  }

  // Al elegir un tema se proponen sus colores y su letra; se puede volver a los de antes.
  function elegirTema(tema) {
    const p = pagina();
    if (p.tema === tema) return;
    const antes = Object.assign({}, d.borrador.estilo);
    p.tema = tema;
    const t = Pg.TEMAS[tema];
    if (t.paleta) {
      d.borrador.estilo = Estilos.normalizar(Object.assign({}, antes, { paleta: t.paleta, letra: t.letra, letraTexto: null }));
    } else if (antes.paleta === 'terracota' && antes.letra === 'editorial') {
      d.borrador.estilo = Estilos.normalizar(Object.assign({}, antes, Estilos.DEFECTO, { letraTexto: null }));
    }
    cambio();
    pintarTema();
    if (huella({ estilo: antes }) !== huella({ estilo: d.borrador.estilo })) {
      u.aviso(`Tema ${t.nombre}, con sus colores y su letra.`, {
        accion: 'Conservar los míos',
        alHacer: () => {
          d.borrador.estilo = antes;
          cambio();
          pintarTema();
        },
      });
    }
  }

  let pintandoColor = 0;
  panelTema.addEventListener('input', (e) => {
    const t = e.target;
    if (t.dataset.tema === 'color' || t.dataset.tema === 'color-codigo') {
      let v = t.value.trim().toLowerCase();
      if (!v.startsWith('#')) v = `#${v}`;
      if (/^#[0-9a-f]{3}$/.test(v)) v = `#${[...v.slice(1)].map((x) => x + x).join('')}`;
      if (!/^#[0-9a-f]{6}$/.test(v)) {
        t.setAttribute('aria-invalid', 'true');
        return;
      }
      t.removeAttribute('aria-invalid');
      const otro = $(`[data-tema="${t.dataset.tema === 'color' ? 'color-codigo' : 'color'}"]`, panelTema);
      otro.value = v;
      $(`input[data-tema="paleta"][value="${Estilos.LIBRE}"]`, panelTema).checked = true;
      // Al arrastrar el selector llegan muchos cambios: se pinta una vez por cuadro.
      cancelAnimationFrame(pintandoColor);
      pintandoColor = requestAnimationFrame(() => cambiarEstilo({ paleta: Estilos.LIBRE, color: v }, { tema: false }));
    } else if (t.dataset.fondo === 'color' || t.dataset.fondo === 'color2') {
      pagina().fondo[t.dataset.fondo] = t.value;
      cambio({ lista: false });
    } else if (t.dataset.fondo === 'velo') {
      pagina().fondo.velo = Number(t.value);
      $('[data-velo-valor]', panelTema).textContent = `${t.value}%`;
      cambio({ lista: false });
    }
  });

  panelTema.addEventListener('click', (e) => {
    const b = e.target.closest('button[data-respaldo]');
    if (!b) return;
    if (b.dataset.respaldo === 'exportar') exportarJson();
    else if (b.dataset.respaldo === 'restaurar') restaurarDiseno();
  });

  panelTema.addEventListener('input', (e) => {
    if (e.target.dataset.tema !== 'musica-volumen') return;
    const salida = $('[data-musica-valor]', panelTema);
    if (salida) salida.textContent = `${e.target.value}%`;
  });

  panelTema.addEventListener('change', async (e) => {
    const t = e.target;
    const p = pagina();
    if (t.dataset.tema === 'tema') elegirTema(t.value);
    else if (t.dataset.tema === 'paleta') cambiarEstilo({ paleta: t.value, color: d.borrador.estilo.color || Estilos.COLOR_LIBRE }, { tema: false });
    else if (t.dataset.tema === 'letra') cambiarEstilo({ letra: t.value });
    else if (t.dataset.tema === 'letraTexto') cambiarEstilo({ letraTexto: t.value || null });
    else if (t.dataset.tema === 'color-codigo') {
      // Un código a medio escribir vuelve al color elegido al salir del campo.
      t.value = d.borrador.estilo.color || Estilos.COLOR_LIBRE;
      t.removeAttribute('aria-invalid');
    } else if (t.dataset.tema === 'trato') {
      p.trato = t.value;
      cambio({ lista: false });
    } else if (t.dataset.tema === 'mariposa') {
      d.borrador.mariposa = t.checked;
      cambio({ lista: false });
    } else if (t.dataset.tema === 'animacion') {
      p.animacion = t.value;
      cambio({ lista: false });
    } else if (t.dataset.tema === 'musica-archivo') {
      const escrito = t.value.trim();
      p.musica = Object.assign({}, p.musica, { archivo: escrito });
      cambio({ lista: false });
      if (escrito && !pagina().musica.archivo) {
        t.setAttribute('aria-invalid', 'true');
        u.aviso('Esa ruta no sirve: escribe algo como media/cancion.mp3 o un enlace https.', { error: true });
      } else t.removeAttribute('aria-invalid');
    } else if (t.dataset.tema === 'musica-volumen') {
      p.musica = Object.assign({}, p.musica, { volumen: Number(t.value) / 100 });
      cambio({ lista: false });
    } else if (t.dataset.tema === 'musica-activa') {
      p.musica = Object.assign({}, p.musica, { activa: t.checked });
      cambio({ lista: false });
    } else if (t.dataset.respaldo === 'importar') {
      const archivo = t.files && t.files[0];
      t.value = '';
      if (archivo) importarJson(archivo);
    } else if (t.dataset.fondo === 'tipo') {
      // La foto se elige antes de ponerla: mientras tanto el fondo sigue como estaba.
      d.fondoFoto = t.value === 'imagen' && !p.fondo.imagen;
      if (!d.fondoFoto) {
        p.fondo.tipo = t.value;
        cambio({ lista: false });
      }
      pintarTema();
      const marcado = $('input[data-fondo="tipo"]:checked', panelTema);
      if (marcado) marcado.focus();
    } else if (t.dataset.fondo === 'direccion') {
      p.fondo.direccion = t.value;
      cambio({ lista: false });
    } else if (t.matches('[data-fondo-foto]')) {
      const [f] = await subirFotos(t.files, 1);
      if (!f) return;
      p.fondo.imagen = f;
      p.fondo.tipo = 'imagen';
      d.fondoFoto = false;
      cambio({ lista: false });
      pintarTema();
    }
  });

  // ---------- Modos, pestañas y barra de la vista previa ----------

  function cambiarModo(modo) {
    raiz.dataset.modo = modo;
    $$('.diseno-modos [data-modo]', vista).forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.modo === modo)));
    if (modo === 'vista') requestAnimationFrame(ajustarMarco);
  }

  vista.addEventListener('click', (e) => {
    const b = e.target.closest('button, a');
    if (!b || !d.cargado && !b.matches('[data-reintentar-diseno]')) return;
    if (b.matches('[data-reintentar-diseno]')) cargar();
    else if (b.matches('.diseno-modos [data-modo]')) cambiarModo(b.dataset.modo);
    else if (b.matches('[data-pestana]')) {
      d.pestana = b.dataset.pestana;
      d.elegido = null;
      mostrarEnVista(null, false);
      pintarPestanas();
    } else if (b.matches('[data-publicar]')) publicar();
    else if (b.matches('[data-descartar]')) descartar();
    else if (b.matches('[data-dispositivo]')) {
      d.dispositivo = b.dataset.dispositivo;
      pintarBarraVista();
    } else if (b.matches('[data-invitado]')) {
      d.invitado = b.dataset.invitado;
      pintarBarraVista();
      enviarVista();
    } else if (b.matches('[data-ver-sobre]')) {
      d.sobre = !d.sobre;
      pintarBarraVista();
      cargarVista();
    } else if (b.matches('[data-ir-boda]')) {
      // El enlace lleva a La boda; el borrador se guarda antes de salir.
      if (d.pendiente) guardarBorrador();
    } else if (panelBloques.contains(b)) {
      const fila = b.closest('[data-id]');
      if (b.matches('[data-abrir]')) abrir(b.dataset.abrir);
      else if (b.matches('[data-mover]')) mover(fila.dataset.id, Number(b.dataset.mover));
      else if (b.matches('[data-ocultar]')) ocultar(fila.dataset.id);
      else if (b.matches('[data-agregar-bloque]')) {
        const menu = $('[data-menu-agregar]', panelBloques);
        menu.hidden = !menu.hidden;
        b.setAttribute('aria-expanded', String(!menu.hidden));
        if (!menu.hidden) $('[data-nuevo]', menu).focus();
      } else if (b.matches('[data-nuevo]')) agregar(b.dataset.nuevo);
    }
  });

  // Las pestañas Bloques y Tema se recorren con las flechas.
  $('[data-pestanas]', vista).addEventListener('keydown', (e) => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    const botones = $$('[data-pestana]', vista);
    const i = botones.indexOf(document.activeElement);
    const otro = botones[(i + (e.key === 'ArrowRight' ? 1 : botones.length - 1)) % botones.length];
    otro.focus();
    otro.click();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape' || vista.hidden) return;
    const menu = $('[data-menu-agregar]', panelBloques);
    if (menu && !menu.hidden) {
      menu.hidden = true;
      $('[data-agregar-bloque]', panelBloques).focus();
    } else if (d.elegido && raiz.contains(document.activeElement) && !document.querySelector('dialog[open]')) {
      cerrar();
    }
  });

  addEventListener('beforeunload', (e) => {
    if (d.pendiente) guardarBorrador();
    if (!d.pendiente && !d.guardando && !d.subiendo) return;
    e.preventDefault();
    e.returnValue = '';
  });

  window.Diseno = {
    iniciar(utilidades) {
      u = utilidades;
      u.iconos(vista);
    },
    mostrar(nombre) {
      if (nombre !== 'diseno') {
        if (d.pendiente) guardarBorrador();
        return;
      }
      if (!d.cargado && !d.cargando) {
        d.cargando = cargar().finally(() => { d.cargando = null; });
      } else if (d.cargado) {
        pintarTodo();
        // Lo que se cambió en La boda (fechas, hoteles…) se ve al volver.
        D.evento().then((ev) => {
          d.evento = ev;
          d.publicado = limpio(ev);
          pintarEstado();
          pintarBloques();
          cargarVista();
        }).catch(() => {});
      }
      requestAnimationFrame(ajustarMarco);
    },
  };
})();
