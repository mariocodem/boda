/*
 * Panel de administración: el libro de sobres, el plano de mesas y los datos
 * de la boda (con su estilo y sus fotos). Las tareas, el presupuesto y los
 * proveedores viven en planeacion.js.
 */
(function () {
  const C = window.BODA;
  const P = window.Papeleria;
  const D = window.Datos;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const esc = P.escapar;

  const estado = {
    lista: [],
    filtro: 'todos',
    lado: '',
    busqueda: '',
    orden: { campo: 'numero', dir: 1 },
    editando: null,
    recien: null,
    importables: [],
  };

  const FILTROS = [
    { id: 'todos', texto: 'Todos', prueba: () => true },
    { id: 'pendiente', texto: 'Por responder', prueba: (i) => i.estado === 'pendiente' },
    { id: 'confirmado', texto: 'Confirmados', prueba: (i) => i.estado === 'confirmado' },
    { id: 'declinado', texto: 'No asisten', prueba: (i) => i.estado === 'declinado' },
    { id: 'sin-abrir', texto: 'Sin abrir', prueba: (i) => !i.abiertoEn && i.estado === 'pendiente' },
  ];

  const LADOS = { diego: 'Diego', erika: 'Erika', ambos: 'Ambos' };

  // ---------- Utilidades ----------

  function iconos(raiz = document) {
    $$('[data-icono]', raiz).forEach((el) => {
      if (el.querySelector('.icono')) return;
      const texto = el.textContent.trim();
      el.innerHTML = `${P.icono(el.dataset.icono)}<span>${esc(texto)}</span>`;
    });
    $$('[data-icono-solo]', raiz).forEach((el) => {
      if (!el.querySelector('.icono')) el.insertAdjacentHTML('afterbegin', P.icono(el.dataset.iconoSolo));
    });
  }

  function cifra(n, ancho = 3) {
    const s = String(Math.max(0, n));
    const ceros = Math.max(0, ancho - s.length);
    return `${ceros ? `<span class="cero">${'0'.repeat(ceros)}</span>` : ''}${s}`;
  }

  const relativo = new Intl.RelativeTimeFormat('es', { numeric: 'auto' });
  function hace(iso) {
    if (!iso) return '';
    const seg = (new Date(iso).getTime() - Date.now()) / 1000;
    const pasos = [[60, 'second'], [3600, 'minute'], [86400, 'hour'], [604800, 'day'], [2629800, 'week'], [31557600, 'month'], [Infinity, 'year']];
    const div = { second: 1, minute: 60, hour: 3600, day: 86400, week: 604800, month: 2629800, year: 31557600 };
    for (const [lim, u] of pasos) {
      if (Math.abs(seg) < lim) return relativo.format(Math.round(seg / div[u]), u);
    }
    return '';
  }

  function telefonoWa(t) {
    let d = String(t || '').replace(/\D/g, '');
    if (d.length === 10 && d.startsWith('3')) d = '57' + d;
    return d;
  }

  function telefonoBonito(t) {
    const d = String(t || '').replace(/\D/g, '');
    if (d.length === 10) return `${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6)}`;
    if (d.length === 12 && d.startsWith('57')) return `+57 ${d.slice(2, 5)} ${d.slice(5, 8)} ${d.slice(8)}`;
    return t;
  }

  function mensajeWa(i) {
    const enlace = D.enlace(i.codigo);
    return i.cupos > 1
      ? `Hola, ${i.nombre}. Diego y Erika los invitan a su boda. Abran su invitación y confírmennos aquí: ${enlace}`
      : `Hola, ${i.nombre}. Diego y Erika te invitan a su boda. Abre tu invitación y confírmanos aquí: ${enlace}`;
  }

  function enlaceWa(i) {
    const tel = telefonoWa(i.telefono);
    return `https://wa.me/${tel}?text=${encodeURIComponent(mensajeWa(i))}`;
  }

  async function copiar(texto) {
    try {
      await navigator.clipboard.writeText(texto);
      return true;
    } catch {
      const t = document.createElement('textarea');
      t.value = texto;
      t.setAttribute('readonly', '');
      t.style.position = 'fixed';
      t.style.opacity = '0';
      document.body.appendChild(t);
      t.select();
      let ok = false;
      try { ok = document.execCommand('copy'); } catch { ok = false; }
      t.remove();
      return ok;
    }
  }

  function aviso(texto, op = {}) {
    const caja = document.createElement('div');
    caja.className = `aviso${op.error ? ' error' : ''}`;
    caja.setAttribute('role', op.error ? 'alert' : 'status');
    caja.innerHTML = `<span>${esc(texto)}</span>${op.accion ? `<button type="button">${esc(op.accion)}</button>` : ''}`;
    $('#avisos').appendChild(caja);
    let cerrado = false;
    const cerrar = () => {
      if (cerrado) return;
      cerrado = true;
      caja.remove();
    };
    if (op.accion) {
      $('button', caja).addEventListener('click', () => {
        cerrar();
        op.alHacer();
      });
    }
    setTimeout(cerrar, op.duracion || (op.accion ? 7000 : 3200));
  }

  // ---------- Entrada ----------

  function mostrarEntrada() {
    $('#panel').hidden = true;
    $('#entrada').hidden = false;
    const campos = $('[data-campos-entrada]');
    if (D.modo === 'supabase') {
      campos.innerHTML = `
        <label class="campo"><span class="campo-etiqueta">Correo</span><input name="correo" type="email" autocomplete="username" required></label>
        <label class="campo"><span class="campo-etiqueta">Contraseña</span><input name="clave" type="password" autocomplete="current-password" required></label>`;
      $('[data-nota-modo]').textContent = 'Entra con la cuenta autorizada en Supabase.';
    } else {
      campos.innerHTML = `
        <label class="campo"><span class="campo-etiqueta">Clave del panel</span><input name="clave" type="password" autocomplete="current-password" required></label>`;
      $('[data-nota-modo]').textContent = 'Modo local: la lista vive solo en este navegador. Para recibir respuestas reales, conecta Supabase (ver LEEME.md).';
    }
    const primero = $('input', campos);
    if (primero) primero.focus();
  }

  $('#form-entrada').addEventListener('submit', async (e) => {
    e.preventDefault();
    const f = e.currentTarget;
    const error = $('#entrada-error');
    const boton = $('button[type="submit"]', f);
    error.textContent = '';
    const datos = Object.fromEntries(new FormData(f));
    if (!datos.clave || (D.modo === 'supabase' && !datos.correo)) {
      error.textContent = D.modo === 'supabase' ? 'Escribe tu correo y tu contraseña.' : 'Escribe la clave del panel.';
      return;
    }
    boton.disabled = true;
    boton.textContent = 'Entrando…';
    try {
      await D.entrar({ correo: datos.correo, clave: datos.clave });
      await mostrarPanel();
    } catch (err) {
      error.textContent = err.message;
    } finally {
      boton.disabled = false;
      boton.textContent = 'Entrar';
    }
  });

  // ---------- Panel ----------

  async function mostrarPanel() {
    $('#entrada').hidden = true;
    $('#panel').hidden = false;
    const chip = $('[data-chip-modo]');
    chip.dataset.modo = D.modo;
    chip.textContent = D.modo === 'supabase' ? 'Conectado a Supabase' : 'Modo local';
    chip.title = D.modo === 'supabase' ? '' : 'Los datos viven solo en este navegador';
    mostrarVista(location.hash.slice(1));
    await recargar();
  }

  async function recargar({ silencioso } = {}) {
    try {
      const [lista] = await Promise.all([D.listar(), cargarPlano()]);
      estado.lista = lista;
      pintar();
      pintarMesas();
      window.Planeacion.alCambiarInvitados();
    } catch (e) {
      if (!silencioso) aviso(e.message, { error: true });
      if (/sesión|permiso/i.test(e.message)) mostrarEntrada();
    }
  }

  function totales(l) {
    const t = { sobres: l.length, cupos: 0, confirmados: 0, pendientes: 0, noVan: 0, abiertas: 0, respondieron: 0 };
    l.forEach((i) => {
      t.cupos += i.cupos;
      if (i.estado === 'confirmado') {
        t.confirmados += i.asistentes;
        t.noVan += i.cupos - i.asistentes;
      } else if (i.estado === 'declinado') {
        t.noVan += i.cupos;
      } else {
        t.pendientes += i.cupos;
      }
      if (i.abiertoEn || i.estado !== 'pendiente') t.abiertas += 1;
      if (i.estado !== 'pendiente') t.respondieron += 1;
    });
    return t;
  }

  function pintarCifras() {
    const t = totales(estado.lista);
    const ancho = Math.max(3, String(t.cupos).length);
    $('[data-contadores]').innerHTML = [
      ['Sobres enviados', cifra(t.sobres, ancho), ''],
      ['Cupos en total', cifra(t.cupos, ancho), ''],
      ['Cupos confirmados', cifra(t.confirmados, ancho), 'destacado'],
      ['Cupos sin respuesta', cifra(t.pendientes, ancho), ''],
      ['Cupos que no van', cifra(t.noVan, ancho), ''],
      ['Sobres abiertos', `${cifra(t.abiertas, ancho)}<small>de ${t.sobres}</small>`, ''],
    ].map(([e, v, c]) => `<div class="contador ${c}"><dt>${e}</dt><dd>${v}</dd></div>`).join('');

    const total = t.cupos || 1;
    const pct = (n) => `${((n / total) * 100).toFixed(2)}%`;
    $('[data-reparto]').innerHTML = t.cupos ? `
      <div class="reparto-barra" role="img" aria-label="${t.confirmados} cupos confirmados, ${t.pendientes} por responder, ${t.noVan} no asisten, de ${t.cupos}">
        <span class="r-confirmado" style="width:${pct(t.confirmados)}"></span>
        <span class="r-pendiente" style="width:${pct(t.pendientes)}"></span>
        <span class="r-declinado" style="width:${pct(t.noVan)}"></span>
      </div>
      <ul class="reparto-leyenda">
        <li><i style="background:var(--polen)"></i>${t.confirmados} cupos confirmados</li>
        <li><i style="background:var(--salvia)"></i>${t.pendientes} sin respuesta</li>
        <li><i style="background:var(--declinado)"></i>${t.noVan} no van</li>
        <li>${t.respondieron} de ${t.sobres} sobres respondidos</li>
      </ul>` : '';
  }

  function pintarFiltros() {
    $('[data-filtros]').innerHTML = FILTROS.map((f) => {
      const n = estado.lista.filter(f.prueba).length;
      return `<button type="button" data-filtro="${f.id}" aria-pressed="${estado.filtro === f.id}">${f.texto} <b>${n}</b></button>`;
    }).join('');
  }

  function visibles() {
    const f = FILTROS.find((x) => x.id === estado.filtro) || FILTROS[0];
    const q = estado.busqueda.trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
    const qDig = q.replace(/\D/g, '');
    const l = estado.lista.filter((i) => {
      if (!f.prueba(i)) return false;
      if (estado.lado && i.lado !== estado.lado) return false;
      if (!q) return true;
      const nombre = i.nombre.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
      return nombre.includes(q)
        || i.codigo.toLowerCase().includes(q)
        || (i.notas || '').toLowerCase().includes(q)
        || (qDig.length >= 3 && String(i.telefono || '').replace(/\D/g, '').includes(qDig));
    });
    const { campo, dir } = estado.orden;
    const peso = { pendiente: 0, confirmado: 1, declinado: 2 };
    l.sort((a, b) => {
      let x;
      let y;
      if (campo === 'nombre') return a.nombre.localeCompare(b.nombre, 'es') * dir;
      if (campo === 'estado') { x = peso[a.estado]; y = peso[b.estado]; }
      else if (campo === 'abierto') { x = a.abiertoEn ? new Date(a.abiertoEn).getTime() : 0; y = b.abiertoEn ? new Date(b.abiertoEn).getTime() : 0; }
      else { x = a[campo]; y = b[campo]; }
      return ((x > y) - (x < y)) * dir || a.numero - b.numero;
    });
    return l;
  }

  function selloEstado(i) {
    if (i.estado === 'confirmado') return `<span class="sello-estado sello-confirmado">Confirmado</span>`;
    if (i.estado === 'declinado') return `<span class="sello-estado sello-declinado">No asiste</span>`;
    return `<span class="sello-estado sello-pendiente">Pendiente</span>`;
  }

  function cabecera(campo, texto, clase) {
    const activo = estado.orden.campo === campo;
    const sort = activo ? ` aria-sort="${estado.orden.dir === 1 ? 'ascending' : 'descending'}"` : '';
    return `<th class="${clase || ''}"${sort}><button type="button" data-orden="${campo}">${texto}${P.icono('orden')}</button></th>`;
  }

  function pintarTabla() {
    const marco = $('[data-tabla]');
    if (!estado.lista.length) {
      marco.innerHTML = `<div class="vacio">
          <div class="vacio-sobre" aria-hidden="true"></div>
          <h2>Aún no hay sobres en el libro</h2>
          <p>Agrega a cada invitado o familia con sus cupos. Cada uno recibe un enlace personal para abrir su invitación y responder.</p>
          <div class="libro-botones">
            <button class="boton boton-principal" type="button" data-agregar data-icono="mas">Agregar el primer invitado</button>
            <button class="boton boton-secundario" type="button" data-importar data-icono="subir">Importar lista</button>
            ${D.modo === 'local' ? '<button class="boton boton-secundario" type="button" data-ejemplos data-icono="sobre">Cargar ejemplos para probar</button>' : ''}
          </div>
        </div>`;
      iconos(marco);
      return;
    }
    const filas = visibles();
    if (!filas.length) {
      marco.innerHTML = `<div class="vacio"><h2>Nadie coincide</h2><p>Ningún sobre cumple con la búsqueda o el filtro elegido.</p>
        <div class="libro-botones"><button class="boton boton-secundario" type="button" data-limpiar>Quitar filtros</button></div></div>`;
      return;
    }
    marco.innerHTML = `<table class="tabla">
        <thead><tr>
          ${cabecera('numero', 'N.º', 'col-num')}
          ${cabecera('nombre', 'Invitado', 'col-nombre')}
          ${cabecera('cupos', 'Cupos', 'col-cupos')}
          ${cabecera('estado', 'Respuesta', 'col-estado')}
          <th class="col-lado">De</th>
          ${cabecera('abierto', 'Abierta', 'col-abierta')}
          <th class="col-acciones"><span class="solo-lectores">Acciones</span></th>
        </tr></thead>
        <tbody>${filas.map(fila).join('')}</tbody>
      </table>`;
    if (estado.recien) {
      const tr = $(`tr[data-id="${CSS.escape(estado.recien)}"]`, marco);
      if (tr) {
        tr.classList.add('recien');
        tr.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
      estado.recien = null;
    }
  }

  function fila(i) {
    const mesa = mesaDe(i);
    const meta = [
      i.telefono ? `<span>${esc(telefonoBonito(i.telefono))}</span>` : '',
      mesa ? `<span>Mesa ${mesa.numero}</span>` : '',
      i.alergias ? `<span class="meta-pedido" title="${esc(i.alergias)}">Comida: ${esc(i.alergias)}</span>` : '',
      i.notas ? `<span>${esc(i.notas)}</span>` : '',
      `<span>${esc(i.codigo)}</span>`,
    ].join('');
    const cupos = i.estado === 'confirmado'
      ? `<b>${i.asistentes}</b> <span>de ${i.cupos}</span>`
      : `<b>${i.cupos}</b> <span>${i.cupos === 1 ? 'cupo' : 'cupos'}</span>`;
    const abierta = i.abiertoEn
      ? `<span class="abierta-celda" title="${esc(new Date(i.abiertoEn).toLocaleString('es-CO'))}">${esc(hace(i.abiertoEn))}</span>`
      : `<span class="abierta-celda no">Sin abrir</span>`;
    const n = esc(i.nombre);
    return `<tr data-id="${esc(i.id)}">
        <td class="col-num"><span class="num-sobre">${P.numeroSobre(i.numero)}</span></td>
        <td class="col-nombre"><div class="invitado-nombre">${n}</div><div class="invitado-meta">${meta}</div></td>
        <td class="col-cupos"><span class="cupos-celda">${cupos}</span></td>
        <td class="col-estado">${selloEstado(i)}</td>
        <td class="col-lado">${LADOS[i.lado] || 'Ambos'}</td>
        <td class="col-abierta">${abierta}</td>
        <td class="col-acciones"><div class="acciones">
          <button class="boton-icono" type="button" data-accion="copiar" title="Copiar enlace" aria-label="Copiar enlace de ${n}">${P.icono('enlace')}</button>
          <a class="boton-icono" href="${esc(enlaceWa(i))}" target="_blank" rel="noopener" title="Enviar por WhatsApp" aria-label="Enviar invitación por WhatsApp a ${n}">${P.icono('whatsapp')}</a>
          <a class="boton-icono" href="${esc(D.enlace(i.codigo, { vista: true }))}" target="_blank" rel="noopener" title="Ver su invitación" aria-label="Ver la invitación de ${n}">${P.icono('ojo')}</a>
          <button class="boton-icono" type="button" data-accion="editar" title="Editar" aria-label="Editar a ${n}">${P.icono('editar')}</button>
          <button class="boton-icono peligro" type="button" data-accion="eliminar" title="Eliminar" aria-label="Eliminar a ${n}">${P.icono('eliminar')}</button>
        </div></td>
      </tr>`;
  }

  function pintarCorreo() {
    const resp = estado.lista
      .filter((i) => i.estado !== 'pendiente' && i.respondidoEn)
      .sort((a, b) => new Date(b.respondidoEn) - new Date(a.respondidoEn))
      .slice(0, 6);
    const caja = $('[data-correo]');
    if (!resp.length) {
      caja.innerHTML = '<li class="correo-vacio">Cuando alguien responda, su tarjeta llegará aquí.</li>';
      return;
    }
    caja.innerHTML = resp.map((i) => {
      const va = i.estado === 'confirmado';
      const que = va
        ? (i.cupos === 1 ? 'Confirmó su asistencia' : `Confirmó ${i.asistentes} de ${i.cupos} cupos`)
        : 'No podrá asistir';
      return `<li class="correo-item" data-estado="${i.estado}">
          ${P.matasellos({ texto: va ? 'CONFIRMADO' : 'RESPONDIDO', fecha: i.respondidoEn, ondas: false, textura: false })}
          <div>
            <p class="correo-quien">${esc(i.nombre)}</p>
            <p class="correo-que">${que} · ${esc(hace(i.respondidoEn))}</p>
            ${i.mensaje ? `<p class="correo-mensaje">«${esc(i.mensaje)}»</p>` : ''}
          </div>
        </li>`;
    }).join('');
  }

  // Lo que contestaron a las preguntas opcionales de la tarjeta, para pasárselo
  // al banquete y a la música. Solo cuenta quien confirmó.
  function pintarPedidos() {
    const caja = $('[data-pedidos]');
    const van = estado.lista.filter((i) => i.estado === 'confirmado');
    const comida = van.filter((i) => i.alergias).sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
    const canciones = van.filter((i) => i.cancion).sort((a, b) => new Date(b.respondidoEn || 0) - new Date(a.respondidoEn || 0));
    caja.hidden = !comida.length && !canciones.length;
    const grupo = (titulo, lista, fila) => (lista.length ? `<h3 class="pedidos-titulo">${titulo} <b>${lista.length}</b></h3>
        <ul class="correo-lista">${lista.map(fila).join('')}</ul>` : '');
    caja.innerHTML = `<h2 class="correo-titulo">Lo que pidieron</h2>
      ${grupo('Para el banquete', comida, (i) => `<li class="pedido">
          <p class="correo-quien">${esc(i.nombre)} <span class="pedido-cuantos">· ${i.asistentes === 1 ? '1 persona' : `${i.asistentes} personas`}</span></p>
          <p class="correo-mensaje">${esc(i.alergias)}</p>
        </li>`)}
      ${grupo('Para la música', canciones, (i) => `<li class="pedido">
          <p class="correo-mensaje">${esc(i.cancion)}</p>
          <p class="correo-que">Pedida por ${esc(i.nombre)}</p>
        </li>`)}`;
  }

  function pintar() {
    pintarCifras();
    pintarFiltros();
    pintarTabla();
    pintarCorreo();
    pintarPedidos();
  }

  // ---------- Diálogo de invitado ----------

  const dlg = $('#dialogo-invitado');
  const formInv = $('#form-invitado');

  function abrirInvitado(inv) {
    estado.editando = inv || null;
    formInv.reset();
    $('[data-error-invitado]').textContent = '';
    $$('[aria-invalid]', formInv).forEach((el) => el.removeAttribute('aria-invalid'));
    $('#dialogo-invitado-titulo').innerHTML = inv ? `Sobre N.º <span class="cifra">${P.numeroSobre(inv.numero)}</span>` : 'Agregar invitado';
    $('[data-guardar]').textContent = inv ? 'Guardar cambios' : 'Agregar';
    $('[data-solo-edicion]').hidden = !inv;
    opcionesMesa(inv ? inv.mesa : null);
    const f = formInv.elements;
    if (inv) {
      f.nombre.value = inv.nombre;
      f.cupos.value = inv.cupos;
      f.telefono.value = inv.telefono || '';
      f.notas.value = inv.notas || '';
      $(`input[name="lado"][value="${inv.lado || 'ambos'}"]`, formInv).checked = true;
      $(`input[name="estado"][value="${inv.estado}"]`, formInv).checked = true;
      f.asistentes.value = inv.estado === 'confirmado' ? inv.asistentes : inv.cupos;
      $('[data-mensaje-invitado]').hidden = !inv.mensaje;
      $('[data-mensaje-texto]').textContent = inv.mensaje || '';
      f.alergias.value = inv.alergias || '';
      f.cancion.value = inv.cancion || '';
      $('[data-enlace-texto]').textContent = D.enlace(inv.codigo);
    }
    sincronizarAsistentes();
    sincronizarPasos();
    dlg.showModal();
    f.nombre.focus();
  }

  function sincronizarAsistentes() {
    const f = formInv.elements;
    const conf = f.estado && f.estado.value === 'confirmado';
    $('[data-asistentes-campo]').hidden = !conf;
    $$('[data-pedido-campo]', formInv).forEach((el) => { el.hidden = !conf; });
    f.asistentes.max = f.cupos.value || 20;
  }

  function sincronizarPasos() {
    $$('[data-paso]', formInv).forEach((paso) => {
      const input = $('input', paso);
      const v = Number(input.value) || 0;
      $('[data-paso-menos]', paso).disabled = v <= Number(input.min);
      $('[data-paso-mas]', paso).disabled = v >= Number(input.max);
    });
  }

  $$('[data-paso]', formInv).forEach((paso) => {
    const input = $('input', paso);
    $('[data-paso-menos]', paso).innerHTML = P.icono('menos');
    $('[data-paso-mas]', paso).innerHTML = P.icono('mas');
    const mover = (d) => {
      const min = Number(input.min);
      const max = Number(input.max);
      input.value = Math.min(max, Math.max(min, (Number(input.value) || min) + d));
      input.dispatchEvent(new Event('change', { bubbles: true }));
    };
    $('[data-paso-menos]', paso).addEventListener('click', () => mover(-1));
    $('[data-paso-mas]', paso).addEventListener('click', () => mover(1));
    input.addEventListener('input', sincronizarPasos);
  });

  formInv.addEventListener('change', (e) => {
    if (e.target.name === 'estado' || e.target.name === 'cupos') sincronizarAsistentes();
    if (e.target.name === 'cupos' && Number(formInv.elements.asistentes.value) > Number(e.target.value)) {
      formInv.elements.asistentes.value = e.target.value;
    }
    sincronizarPasos();
  });

  $$('[data-cerrar]', dlg).forEach((b) => b.addEventListener('click', () => dlg.close()));

  $('[data-copiar-enlace]').addEventListener('click', async () => {
    if (!estado.editando) return;
    const ok = await copiar(D.enlace(estado.editando.codigo));
    aviso(ok ? 'Enlace copiado.' : 'No se pudo copiar. Selecciónalo y cópialo a mano.', { error: !ok });
  });

  formInv.addEventListener('submit', async (e) => {
    e.preventDefault();
    const f = formInv.elements;
    const error = $('[data-error-invitado]');
    error.textContent = '';
    $$('[aria-invalid]', formInv).forEach((el) => el.removeAttribute('aria-invalid'));
    const datos = {
      nombre: f.nombre.value.trim(),
      cupos: Number(f.cupos.value),
      telefono: f.telefono.value.trim(),
      lado: f.lado.value || 'ambos',
      notas: f.notas.value.trim(),
    };
    // Solo con mesas en el plano: así el esquema viejo de Supabase sigue sirviendo.
    if (!$('[data-campo-mesa]', formInv).hidden) datos.mesa = f.mesa.value || null;
    if (!datos.nombre) {
      f.nombre.setAttribute('aria-invalid', 'true');
      error.textContent = 'Escribe el nombre que irá en el sobre.';
      f.nombre.focus();
      return;
    }
    if (!Number.isInteger(datos.cupos) || datos.cupos < 1 || datos.cupos > 20) {
      f.cupos.setAttribute('aria-invalid', 'true');
      error.textContent = 'Los cupos van de 1 a 20.';
      f.cupos.focus();
      return;
    }
    if (estado.editando) {
      datos.estado = f.estado.value;
      // Solo se mandan si cambiaron: así el esquema viejo de Supabase sigue sirviendo.
      ['alergias', 'cancion'].forEach((c) => {
        const v = f[c].value.trim();
        if (datos.estado === 'confirmado' && v !== (estado.editando[c] || '')) datos[c] = v;
      });
      if (datos.estado === 'confirmado') {
        datos.asistentes = Number(f.asistentes.value);
        if (!Number.isInteger(datos.asistentes) || datos.asistentes < 1 || datos.asistentes > datos.cupos) {
          f.asistentes.setAttribute('aria-invalid', 'true');
          error.textContent = `Los asistentes confirmados van de 1 a ${datos.cupos}.`;
          f.asistentes.focus();
          return;
        }
      }
    }
    const boton = $('[data-guardar]');
    boton.disabled = true;
    try {
      if (estado.editando) {
        const act = await D.actualizar(estado.editando.id, datos);
        estado.recien = act.id;
        dlg.close();
        aviso(`Sobre N.º ${P.numeroSobre(act.numero)} actualizado.`);
      } else {
        const nuevo = await D.crear(datos);
        estado.recien = nuevo.id;
        dlg.close();
        aviso(`Sobre N.º ${P.numeroSobre(nuevo.numero)} agregado.`, {
          accion: 'Copiar enlace',
          alHacer: async () => aviso((await copiar(D.enlace(nuevo.codigo))) ? 'Enlace copiado.' : 'No se pudo copiar.'),
        });
      }
      await recargar();
    } catch (err) {
      error.textContent = err.message;
    } finally {
      boton.disabled = false;
    }
  });

  // ---------- Importar ----------

  const dlgImp = $('#dialogo-importar');
  const formImp = $('#form-importar');

  function leerLista(texto) {
    const filas = [];
    const errores = [];
    texto.split(/\r?\n/).forEach((linea, n) => {
      if (!linea.trim()) return;
      const sep = linea.includes('\t') ? '\t' : linea.includes(';') ? ';' : ',';
      const [nombre = '', cupos = '', telefono = '', lado = ''] = linea.split(sep).map((x) => x.trim());
      if (n === 0 && /^nombre$/i.test(nombre)) return;
      if (!nombre) {
        errores.push(`Línea ${n + 1}: falta el nombre.`);
        return;
      }
      const c = cupos === '' ? 1 : Number(cupos);
      if (!Number.isInteger(c) || c < 1 || c > 20) {
        errores.push(`Línea ${n + 1}: los cupos deben ser un número de 1 a 20.`);
        return;
      }
      const l = lado.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
      filas.push({ nombre: nombre.slice(0, 120), cupos: c, telefono, lado: LADOS[l] ? l : 'ambos' });
    });
    return { filas, errores };
  }

  formImp.elements.lista.addEventListener('input', () => {
    const { filas, errores } = leerLista(formImp.elements.lista.value);
    estado.importables = errores.length ? [] : filas;
    const cupos = filas.reduce((s, f) => s + f.cupos, 0);
    $('[data-vista-importar]').innerHTML = filas.length
      ? `Se agregarán <b>${filas.length}</b> ${filas.length === 1 ? 'sobre' : 'sobres'} con <b>${cupos}</b> cupos.`
      : '';
    $('[data-error-importar]').textContent = errores.slice(0, 4).join(' ') + (errores.length > 4 ? ` Y ${errores.length - 4} más.` : '');
    $('[data-confirmar-importar]').disabled = !estado.importables.length;
  });

  $$('[data-cerrar]', dlgImp).forEach((b) => b.addEventListener('click', () => dlgImp.close()));

  formImp.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!estado.importables.length) return;
    const boton = $('[data-confirmar-importar]');
    boton.disabled = true;
    try {
      const creados = await D.crearVarios(estado.importables);
      dlgImp.close();
      aviso(`${creados.length} ${creados.length === 1 ? 'sobre agregado' : 'sobres agregados'}.`);
      await recargar();
    } catch (err) {
      $('[data-error-importar]').textContent = err.message;
      boton.disabled = false;
    }
  });

  function abrirImportar() {
    formImp.reset();
    estado.importables = [];
    $('[data-vista-importar]').textContent = '';
    $('[data-error-importar]').textContent = '';
    $('[data-confirmar-importar]').disabled = true;
    dlgImp.showModal();
    formImp.elements.lista.focus();
  }

  // ---------- Exportar ----------

  function exportar() {
    const campos = ['N.º', 'Nombre', 'Cupos', 'De', 'WhatsApp', 'Respuesta', 'Asistentes', 'Mesa', 'Mensaje', 'Alergias o restricciones', 'Canción', 'Notas', 'Abierta', 'Respondió', 'Enlace'];
    const txt = { pendiente: 'Pendiente', confirmado: 'Confirmado', declinado: 'No asiste' };
    const celda = (v) => `"${String(v == null ? '' : v).replace(/"/g, '""')}"`;
    const fecha = (iso) => (iso ? new Date(iso).toLocaleString('es-CO') : '');
    const mesa = (i) => {
      const m = mesaDe(i);
      return m ? `${m.numero}${m.nombre ? ` (${m.nombre})` : ''}` : '';
    };
    const filas = estado.lista.map((i) => [
      P.numeroSobre(i.numero), i.nombre, i.cupos, LADOS[i.lado] || 'Ambos', i.telefono, txt[i.estado],
      i.estado === 'confirmado' ? i.asistentes : 0, mesa(i), i.mensaje, i.alergias, i.cancion, i.notas, fecha(i.abiertoEn), fecha(i.respondidoEn), D.enlace(i.codigo),
    ].map(celda).join(';'));
    const csv = '﻿' + [campos.map(celda).join(';')].concat(filas).join('\r\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    a.download = `invitados-diego-y-erika-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  }

  // ---------- Ejemplos (solo modo local) ----------

  async function cargarEjemplos() {
    const ahora = Date.now();
    const dias = (n) => new Date(ahora - n * 86400000).toISOString();
    await D.crearVarios([
      { nombre: 'Familia Rodríguez Gómez', cupos: 4, telefono: '3001234567', lado: 'erika', notas: 'Ejemplo' },
      { nombre: 'Lucía Méndez', cupos: 1, lado: 'diego', notas: 'Ejemplo', estado: 'confirmado', asistentes: 1, mensaje: '¡Allá estaré! Los quiero mucho.', abiertoEn: dias(5), respondidoEn: dias(4) },
      { nombre: 'Tíos Triana Pardo', cupos: 2, telefono: '3109876543', lado: 'diego', notas: 'Ejemplo', estado: 'confirmado', asistentes: 2, mensaje: 'Felicitaciones, mijo. Ahí estaremos.', cancion: 'La bilirrubina, Juan Luis Guerra', abiertoEn: dias(3), respondidoEn: dias(2) },
      { nombre: 'Familia Ramos Ortiz', cupos: 5, lado: 'erika', notas: 'Ejemplo', estado: 'confirmado', asistentes: 3, alergias: 'Uno es vegetariano', abiertoEn: dias(2), respondidoEn: dias(1) },
      { nombre: 'Andrés y Paula', cupos: 2, lado: 'ambos', notas: 'Ejemplo', estado: 'declinado', mensaje: 'Estaremos de viaje, ¡qué tristeza! Los celebramos a la vuelta.', abiertoEn: dias(6), respondidoEn: dias(6) },
      { nombre: 'Camila Herrera', cupos: 2, telefono: '3204567890', lado: 'erika', notas: 'Ejemplo', abiertoEn: dias(1) },
    ]);
    aviso('Se cargaron 6 invitados de ejemplo.');
    await recargar();
  }

  // ---------- La boda: fecha, lugares, itinerario ----------

  const formBoda = $('#form-boda');
  const GM = C.googleMaps || {};
  const COLOMBIA = { lat: 4.6, lng: -74.08 };
  const boda = {
    cargada: false,
    sucio: false,
    guardando: false,
    pines: { ceremonia: null, recepcion: null },
    mapas: {},
    google: null,
    preparandoMapas: false,
    // Fotos en edición: { url, blob, vista, forma, encuadre?, nota?, carpeta, falta }.
    // blob sin url = elegida y aún sin subir (se sube al guardar).
    fotos: { portada: null, galeria: [], vestimenta: [] },
    cargandoFotos: Promise.resolve(),
    turnoFotos: 0,
    refsGuardadas: new Set(),
    subidas: new Set(),
  };

  function editorLugar(clave) {
    const ejemplo = clave === 'ceremonia' ? 'Parroquia, capilla o jardín' : 'Hacienda, club o salón';
    return `<div class="lugar-editor" data-lugar="${clave}">
        <div class="lugar-campos">
          <div class="campo" data-buscar-lugar hidden>
            <span class="campo-etiqueta" id="buscar-${clave}">Buscar en Google Maps</span>
            <div class="autocompletar" data-autocompletar></div>
            <span class="campo-ayuda">Elige el lugar de la lista: se llenan el nombre, la dirección y el pin.</span>
          </div>
          <label class="campo">
            <span class="campo-etiqueta">Nombre del lugar</span>
            <input type="text" data-campo="lugar" maxlength="160" placeholder="${ejemplo}" autocomplete="off">
          </label>
          <label class="campo">
            <span class="campo-etiqueta">Dirección</span>
            <input type="text" data-campo="direccion" maxlength="240" placeholder="Calle 00 # 00-00, barrio" autocomplete="off">
          </label>
          <label class="campo">
            <span class="campo-etiqueta">Enlace de Google Maps <em>(opcional)</em></span>
            <input type="url" data-campo="mapa" maxlength="600" placeholder="https://maps.app.goo.gl/…" autocomplete="off" inputmode="url">
            <span class="campo-ayuda" data-ayuda-enlace>Pega el enlace de «Compartir» de Google Maps para que todos lleguen exactamente a ese punto.</span>
          </label>
        </div>
        <div class="lugar-mapa">
          <div class="mapa-lienzo" data-lienzo></div>
          <div class="mapa-pie">
            <p class="mapa-pin" data-pin></p>
            <button class="boton boton-secundario boton-chico" type="button" data-quitar-pin hidden>Quitar el pin</button>
          </div>
        </div>
      </div>`;
  }

  $$('[data-editor]', formBoda).forEach((el) => { el.outerHTML = editorLugar(el.dataset.editor); });

  const editor = (clave) => $(`[data-lugar="${clave}"]`, formBoda);
  const ciudadBoda = () => formBoda.elements.ciudad.value.trim();

  function leerLugar(clave) {
    const ed = editor(clave);
    const v = (c) => $(`[data-campo="${c}"]`, ed).value.trim();
    const pin = boda.pines[clave];
    return {
      lugar: v('lugar'),
      direccion: v('direccion'),
      mapa: v('mapa'),
      lat: pin ? pin.lat : null,
      lng: pin ? pin.lng : null,
      placeId: pin ? pin.placeId : null,
    };
  }

  function escribirLugar(clave, l) {
    const ed = editor(clave);
    $('[data-campo="lugar"]', ed).value = l.lugar || '';
    $('[data-campo="direccion"]', ed).value = l.direccion || '';
    $('[data-campo="mapa"]', ed).value = l.mapa || '';
    boda.pines[clave] = l.lat != null && l.lng != null ? { lat: l.lat, lng: l.lng, placeId: l.placeId || null } : null;
  }

  function filaMomento(m) {
    const x = m || {};
    return `<li class="momento-fila">
        <label class="campo campo-hora">
          <span class="campo-etiqueta">Hora</span>
          <input type="time" step="300" data-m="hora" value="${esc(x.hora || '')}">
        </label>
        <label class="campo">
          <span class="campo-etiqueta">Momento</span>
          <input type="text" data-m="titulo" maxlength="80" placeholder="Ceremonia, cena, baile…" value="${esc(x.titulo || '')}" autocomplete="off">
        </label>
        <label class="campo">
          <span class="campo-etiqueta">Detalle <em>(opcional)</em></span>
          <input type="text" data-m="detalle" maxlength="200" placeholder="Lugar o una nota corta" value="${esc(x.detalle || '')}" autocomplete="off">
        </label>
        <div class="momento-acciones">
          <button class="boton-icono" type="button" data-mover="-1" title="Subir" aria-label="Subir este momento">${P.icono('subir_fila')}</button>
          <button class="boton-icono" type="button" data-mover="1" title="Bajar" aria-label="Bajar este momento">${P.icono('bajar_fila')}</button>
          <button class="boton-icono peligro" type="button" data-quitar-momento title="Quitar" aria-label="Quitar este momento">${P.icono('eliminar')}</button>
        </div>
      </li>`;
  }

  function pintarItinerario(lista) {
    $('[data-itinerario]', formBoda).innerHTML = lista.map(filaMomento).join('');
    sincronizarItinerario();
  }

  function sincronizarItinerario() {
    const filas = $$('.momento-fila', formBoda);
    filas.forEach((li, i) => {
      $('[data-mover="-1"]', li).disabled = i === 0;
      $('[data-mover="1"]', li).disabled = i === filas.length - 1;
    });
    $('[data-itinerario]', formBoda).hidden = !filas.length;
    $('[data-sembrar-itinerario]', formBoda).hidden = filas.length > 0;
  }

  // ---------- La boda: listas de filas (hoteles, listas de regalos, preguntas) ----------

  const FILAS = {
    hoteles: {
      max: 6,
      cual: 'este hotel',
      campos: [
        { c: 'nombre', etiqueta: 'Hotel', max: 80, ejemplo: 'Nombre del hotel', falta: 'A un hotel le falta el nombre.' },
        { c: 'direccion', etiqueta: 'Dirección', max: 160, ejemplo: 'Calle 00 # 00-00, barrio' },
        { c: 'enlace', etiqueta: 'Página o reservas', max: 600, ejemplo: 'https://…', url: true },
        { c: 'nota', etiqueta: 'Nota', max: 200, ejemplo: 'Tarifa especial, a 10 minutos…' },
      ],
    },
    listas: {
      max: 4,
      cual: 'esta lista',
      campos: [
        { c: 'nombre', etiqueta: 'Tienda', max: 60, ejemplo: 'Falabella, Éxito, Amazon…', falta: 'A una lista de regalos le falta la tienda.' },
        { c: 'enlace', etiqueta: 'Enlace de la lista', max: 600, ejemplo: 'https://…', url: true, falta: 'A una lista de regalos le falta el enlace.' },
      ],
    },
    preguntas: {
      max: 12,
      cual: 'esta pregunta',
      campos: [
        { c: 'pregunta', etiqueta: 'Pregunta', max: 160, ejemplo: '¿Pueden ir niños?', falta: 'A una respuesta le falta su pregunta.' },
        { c: 'respuesta', etiqueta: 'Respuesta', max: 800, area: true, falta: 'A una pregunta le falta la respuesta.' },
      ],
    },
  };

  // Solo las preguntas: las respuestas las escriben los novios.
  const PREGUNTAS_COMUNES = ['¿Pueden ir niños?', '¿Hay parqueadero?', '¿Hasta qué hora es la fiesta?', '¿Puedo llevar a alguien más?', '¿Habrá transporte de regreso?'];

  function filaEditable(clave, x = {}) {
    const cfg = FILAS[clave];
    const campos = cfg.campos.map((k) => {
      const ejemplo = k.ejemplo ? ` placeholder="${esc(k.ejemplo)}"` : '';
      const control = k.area
        ? `<textarea data-f="${k.c}" rows="2" maxlength="${k.max}"${ejemplo}>${esc(x[k.c] || '')}</textarea>`
        : `<input type="${k.url ? 'url' : 'text'}" data-f="${k.c}" maxlength="${k.max}"${ejemplo} value="${esc(x[k.c] || '')}" autocomplete="off"${k.url ? ' inputmode="url"' : ''}>`;
      return `<label class="campo">
          <span class="campo-etiqueta">${k.etiqueta}${k.falta ? '' : ' <em>(opcional)</em>'}</span>
          ${control}
        </label>`;
    }).join('');
    return `<li class="fila-editor" data-campos="${cfg.campos.length}">
        ${campos}
        <div class="momento-acciones">
          <button class="boton-icono" type="button" data-mover-fila="-1" title="Subir" aria-label="Subir ${cfg.cual}">${P.icono('subir_fila')}</button>
          <button class="boton-icono" type="button" data-mover-fila="1" title="Bajar" aria-label="Bajar ${cfg.cual}">${P.icono('bajar_fila')}</button>
          <button class="boton-icono peligro" type="button" data-quitar-fila title="Quitar" aria-label="Quitar ${cfg.cual}">${P.icono('eliminar')}</button>
        </div>
      </li>`;
  }

  function pintarFilas(clave, lista) {
    $(`[data-filas="${clave}"]`, formBoda).innerHTML = lista.map((x) => filaEditable(clave, x)).join('');
    sincronizarFilas(clave);
  }

  function sincronizarFilas(clave) {
    const ol = $(`[data-filas="${clave}"]`, formBoda);
    const filas = $$('.fila-editor', ol);
    filas.forEach((li, i) => {
      $('[data-mover-fila="-1"]', li).disabled = i === 0;
      $('[data-mover-fila="1"]', li).disabled = i === filas.length - 1;
    });
    ol.hidden = !filas.length;
    $(`[data-agregar-fila="${clave}"]`, formBoda).hidden = filas.length >= FILAS[clave].max;
    if (clave === 'preguntas') $('[data-sembrar-preguntas]', formBoda).hidden = filas.length > 0;
  }

  function leerFilas(clave) {
    return $$(`[data-filas="${clave}"] .fila-editor`, formBoda)
      .map((li) => Object.fromEntries(FILAS[clave].campos.map((k) => [k.c, $(`[data-f="${k.c}"]`, li).value.trim()])))
      .filter((x) => Object.values(x).some(Boolean));
  }

  // La primera fila empezada a la que le falta algo, o con un enlace que no es https.
  function filaIncompleta() {
    for (const clave of Object.keys(FILAS)) {
      for (const li of $$(`[data-filas="${clave}"] .fila-editor`, formBoda)) {
        const campos = FILAS[clave].campos.map((k) => [k, $(`[data-f="${k.c}"]`, li)]);
        if (campos.every(([, el]) => !el.value.trim())) continue;
        for (const [k, el] of campos) {
          const v = el.value.trim();
          if (k.falta && !v) return { el, texto: k.falta };
          if (k.url && v && !/^https:\/\/\S+$/.test(v)) return { el, texto: 'Los enlaces deben empezar por https://' };
        }
      }
    }
    return null;
  }

  function leerItinerario() {
    return $$('.momento-fila', formBoda)
      .map((li) => ({
        hora: $('[data-m="hora"]', li).value || null,
        titulo: $('[data-m="titulo"]', li).value.trim(),
        detalle: $('[data-m="detalle"]', li).value.trim(),
      }))
      .filter((m) => m.hora || m.titulo || m.detalle);
  }

  function leerBoda() {
    const f = formBoda.elements;
    return {
      fecha: f.fecha.value || null,
      hora: f.hora.value || null,
      ciudad: ciudadBoda(),
      fechaLimiteRespuesta: f.fechaLimiteRespuesta.value || null,
      ceremonia: leerLugar('ceremonia'),
      recepcion: Object.assign(leerLugar('recepcion'), {
        mismoLugar: f['recepcion-mismo'].checked,
        hora: f['recepcion-hora'].value || null,
      }),
      itinerario: leerItinerario(),
      vestimenta: {
        codigo: f['vestimenta-codigo'].value.trim(),
        nota: f['vestimenta-nota'].value.trim(),
        fotos: boda.fotos.vestimenta.filter((x) => x.url).map((x) => ({ url: x.url, forma: x.forma, nota: (x.nota || '').trim() })),
      },
      regalos: f.regalos.value.trim(),
      cuentaRegalos: {
        banco: f['cuenta-banco'].value.trim(),
        tipo: f['cuenta-tipo'].value.trim(),
        numero: f['cuenta-numero'].value.trim(),
        titular: f['cuenta-titular'].value.trim(),
        documento: f['cuenta-documento'].value.trim(),
      },
      listasRegalos: leerFilas('listas'),
      historia: f.historia.value.trim(),
      alojamiento: { nota: f['alojamiento-nota'].value.trim(), hoteles: leerFilas('hoteles') },
      preguntas: leerFilas('preguntas'),
      respuesta: { alergias: f['pedir-alergias'].checked, cancion: f['pedir-cancion'].checked },
      fotoPortada: boda.fotos.portada && boda.fotos.portada.url
        ? { url: boda.fotos.portada.url, forma: boda.fotos.portada.forma, encuadre: boda.fotos.portada.encuadre }
        : null,
      fotos: boda.fotos.galeria.filter((x) => x.url).map((x) => ({ url: x.url, forma: x.forma })),
      estilo: estiloElegido(),
      mariposa: f.mariposa.checked,
    };
  }

  function escribirBoda(ev) {
    const f = formBoda.elements;
    f.fecha.value = ev.fecha || '';
    f.hora.value = ev.hora || '';
    f.ciudad.value = ev.ciudad || '';
    f.fechaLimiteRespuesta.value = ev.fechaLimiteRespuesta || '';
    escribirLugar('ceremonia', ev.ceremonia);
    escribirLugar('recepcion', ev.recepcion);
    f['recepcion-hora'].value = ev.recepcion.hora || '';
    f['recepcion-mismo'].checked = ev.recepcion.mismoLugar;
    pintarItinerario(ev.itinerario);
    f['vestimenta-codigo'].value = ev.vestimenta.codigo || '';
    f['vestimenta-nota'].value = ev.vestimenta.nota || '';
    f.regalos.value = ev.regalos || '';
    const cuenta = ev.cuentaRegalos || {};
    ['banco', 'tipo', 'numero', 'titular', 'documento'].forEach((k) => { f[`cuenta-${k}`].value = cuenta[k] || ''; });
    pintarFilas('listas', ev.listasRegalos);
    f.historia.value = ev.historia || '';
    f['alojamiento-nota'].value = ev.alojamiento.nota || '';
    pintarFilas('hoteles', ev.alojamiento.hoteles);
    pintarFilas('preguntas', ev.preguntas);
    f['pedir-alergias'].checked = ev.respuesta.alergias;
    f['pedir-cancion'].checked = ev.respuesta.cancion;
    const e = Estilos.normalizar(ev.estilo);
    f.color.value = e.color || Estilos.COLOR_LIBRE;
    f['color-codigo'].value = f.color.value;
    f['color-codigo'].removeAttribute('aria-invalid');
    $(`input[name="paleta"][value="${e.paleta}"]`, formBoda).checked = true;
    $(`input[name="letra"][value="${e.letra}"]`, formBoda).checked = true;
    f.mariposa.checked = ev.mariposa !== false;
    pintarEstilo();
    boda.cargandoFotos = cargarFotos(ev);
    sincronizarMismoLugar();
    pintarVistaFecha();
    ['ceremonia', 'recepcion'].forEach(refrescarLugar);
  }

  function pintarVistaFecha() {
    const f = formBoda.elements;
    const d = P.fechaEvento({ fecha: f.fecha.value, hora: f.hora.value });
    const caja = $('[data-vista-fecha]', formBoda);
    if (!d) {
      caja.textContent = 'Sin día, la invitación dice «Fecha por confirmar».';
      return;
    }
    const partes = [P.fechaLarga(d), P.horaBonita(f.hora.value), ciudadBoda()].filter(Boolean);
    caja.innerHTML = `Así se lee en la invitación: <b>${esc(partes.join(' · '))}</b>`;
  }

  function sincronizarMismoLugar() {
    editor('recepcion').hidden = formBoda.elements['recepcion-mismo'].checked;
    if (!editor('recepcion').hidden) refrescarLugar('recepcion');
  }

  function marcarSucio() {
    if (!boda.cargada) return;
    boda.sucio = true;
    const e = $('[data-estado-boda]', formBoda);
    e.textContent = 'Cambios sin guardar';
    e.dataset.tono = 'sucio';
  }

  // Coordenadas dentro de un enlace largo de Google Maps. Los cortos
  // (maps.app.goo.gl) no las traen: se guardan tal cual.
  function coordsDeEnlace(url) {
    let s = url;
    try { s = decodeURIComponent(url); } catch { /* enlace con % sueltos */ }
    const m = s.match(/!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/)
      || s.match(/@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/)
      || s.match(/[?&](?:q|query|ll|destination|daddr)=(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)/);
    if (!m) return null;
    const lat = Number(m[1]);
    const lng = Number(m[2]);
    return Math.abs(lat) <= 90 && Math.abs(lng) <= 180 ? { lat, lng } : null;
  }

  function fijarPin(clave, pin) {
    boda.pines[clave] = pin ? { lat: Number(pin.lat.toFixed(6)), lng: Number(pin.lng.toFixed(6)), placeId: pin.placeId || null } : null;
    marcarSucio();
    refrescarLugar(clave);
  }

  function refrescarLugar(clave) {
    const ed = editor(clave);
    if (!ed || ed.hidden) return;
    const pin = boda.pines[clave];
    $('[data-pin]', ed).innerHTML = pin
      ? `Pin en <span class="cifra">${pin.lat.toFixed(5)}, ${pin.lng.toFixed(5)}</span>${boda.google ? ' · arrástralo para afinar' : ''}`
      : (boda.google
        ? 'Busca el lugar o toca el mapa para poner el pin.'
        : 'Sin pin: revisa que el mapa muestre el lugar correcto. La invitación mostrará el mapa cuando haya pin; para ponerlo, pega el enlace de «Compartir».');
    $('[data-quitar-pin]', ed).hidden = !pin;
    if (boda.google) {
      moverMarcador(clave);
      return;
    }
    const lienzo = $('[data-lienzo]', ed);
    const m = P.mapas(leerLugar(clave), ciudadBoda());
    if (!m) {
      lienzo.innerHTML = '<p class="mapa-vacio">Escribe el nombre o la dirección del lugar para ver el mapa.</p>';
      return;
    }
    const actual = $('iframe', lienzo);
    if (actual && actual.dataset.fuente === m.previa) return;
    lienzo.innerHTML = `<iframe src="${esc(m.previa)}" data-fuente="${esc(m.previa)}" title="Vista previa del mapa" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>`;
  }

  const refrescarLuego = {};
  function refrescarEnUnRato(clave) {
    clearTimeout(refrescarLuego[clave]);
    refrescarLuego[clave] = setTimeout(() => refrescarLugar(clave), 700);
  }

  // Google Maps con clave: autocompletado de lugares, mapa y pin que se mueve.
  function cargarGoogle() {
    if (window.google && window.google.maps && window.google.maps.importLibrary) return Promise.resolve(window.google.maps);
    return new Promise((listo, falla) => {
      window.mapasListos = () => listo(window.google.maps);
      window.gm_authFailure = () => usarSinGoogle('Google Maps no aceptó la clave. Revisa que tenga activas «Maps JavaScript API» y «Places API (New)» y que permita esta dirección.');
      const s = document.createElement('script');
      s.async = true;
      s.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(GM.apiKey)}&v=weekly&loading=async&language=es&region=CO&callback=mapasListos`;
      s.onerror = () => falla(new Error('No se pudo cargar Google Maps. Revisa tu conexión.'));
      document.head.appendChild(s);
    });
  }

  async function prepararMapas() {
    if (boda.preparandoMapas) return;
    boda.preparandoMapas = true;
    if (!GM.apiKey) {
      usarSinGoogle();
      return;
    }
    try {
      const maps = await cargarGoogle();
      const [mapsLib, markerLib, placesLib] = await Promise.all([
        maps.importLibrary('maps'), maps.importLibrary('marker'), maps.importLibrary('places'),
      ]);
      boda.google = { Map: mapsLib.Map, Marcador: markerLib.AdvancedMarkerElement, Autocompletar: placesLib.PlaceAutocompleteElement };
      $('[data-nota-mapas]', formBoda).hidden = true;
      ['ceremonia', 'recepcion'].forEach(montarGoogle);
    } catch (e) {
      usarSinGoogle(e.message);
    }
  }

  function usarSinGoogle(motivo) {
    boda.google = null;
    Object.keys(boda.mapas).forEach((k) => delete boda.mapas[k]);
    $$('[data-lugar]', formBoda).forEach((ed) => {
      $('[data-buscar-lugar]', ed).hidden = true;
      $('[data-lienzo]', ed).innerHTML = '';
    });
    $('[data-nota-mapas]', formBoda).hidden = false;
    if (motivo) aviso(motivo, { error: true, duracion: 9000 });
    ['ceremonia', 'recepcion'].forEach(refrescarLugar);
  }

  function montarGoogle(clave) {
    const g = boda.google;
    const ed = editor(clave);
    const pin = boda.pines[clave];
    const lienzo = $('[data-lienzo]', ed);
    lienzo.innerHTML = '';
    const mapa = new g.Map(lienzo, {
      center: pin || COLOMBIA,
      zoom: pin ? 16 : 6,
      mapId: GM.mapId || 'DEMO_MAP_ID',
      disableDefaultUI: true,
      zoomControl: true,
      fullscreenControl: true,
      clickableIcons: false,
      gestureHandling: 'cooperative',
    });
    const marcador = new g.Marcador({ gmpDraggable: true, title: clave === 'ceremonia' ? 'Ceremonia' : 'Recepción' });
    marcador.addListener('dragend', () => {
      const p = marcador.position;
      const lat = typeof p.lat === 'function' ? p.lat() : p.lat;
      const lng = typeof p.lng === 'function' ? p.lng() : p.lng;
      fijarPin(clave, { lat, lng });
    });
    mapa.addListener('click', (e) => fijarPin(clave, { lat: e.latLng.lat(), lng: e.latLng.lng() }));
    boda.mapas[clave] = { mapa, marcador };

    const auto = new g.Autocompletar({});
    try { auto.includedRegionCodes = ['co']; } catch { /* versión sin filtro de país */ }
    auto.setAttribute('aria-labelledby', `buscar-${clave}`);
    $('[data-autocompletar]', ed).replaceChildren(auto);
    $('[data-buscar-lugar]', ed).hidden = false;

    const elegir = async (lugar) => {
      await lugar.fetchFields({ fields: ['displayName', 'formattedAddress', 'location', 'id'] });
      $('[data-campo="lugar"]', ed).value = lugar.displayName || '';
      $('[data-campo="direccion"]', ed).value = (lugar.formattedAddress || '').replace(/,\s*Colombia$/, '');
      fijarPin(clave, { lat: lugar.location.lat(), lng: lugar.location.lng(), placeId: lugar.id });
    };
    const fallo = () => aviso('No se pudo traer ese lugar de Google Maps. Inténtalo de nuevo.', { error: true });
    auto.addEventListener('gmp-select', (e) => { if (e.placePrediction) elegir(e.placePrediction.toPlace()).catch(fallo); });
    auto.addEventListener('gmp-placeselect', (e) => { if (e.place) elegir(e.place).catch(fallo); });
    refrescarLugar(clave);
  }

  function moverMarcador(clave) {
    const m = boda.mapas[clave];
    if (!m) return;
    const pin = boda.pines[clave];
    if (!pin) {
      m.marcador.map = null;
      return;
    }
    m.marcador.position = { lat: pin.lat, lng: pin.lng };
    m.marcador.map = m.mapa;
    m.mapa.panTo({ lat: pin.lat, lng: pin.lng });
    if (m.mapa.getZoom() < 14) m.mapa.setZoom(16);
  }

  // ---------- La boda: estilo ----------

  const NOMBRES = { uno: C.pareja.uno.nombre, dos: C.pareja.dos.nombre };

  function opcionesEstilo() {
    const paletas = Object.entries(Estilos.PALETAS).concat([[Estilos.LIBRE, { nombre: 'Color libre' }]]);
    $('[data-paletas]', formBoda).innerHTML = paletas.map(([clave, p]) => `<label class="paleta${clave === Estilos.LIBRE ? ' paleta-libre' : ''}">
        <input type="radio" name="paleta" value="${clave}">
        <span class="paleta-muestra" data-paleta-muestra="${clave}" aria-hidden="true">
          <span class="paleta-sobre"></span>
          <span class="paleta-carta">${esc(NOMBRES.uno[0])}<i>&amp;</i>${esc(NOMBRES.dos[0])}</span>
        </span>
        <span class="paleta-nombre">${esc(p.nombre)}</span>
      </label>`).join('');
    $('[data-letras]', formBoda).innerHTML = Object.entries(Estilos.LETRAS).map(([clave, l]) => `<label class="letra">
        <input type="radio" name="letra" value="${clave}">
        <span class="letra-muestra" data-letra-muestra="${clave}" aria-hidden="true">
          <span class="letra-nombres">${esc(NOMBRES.uno)} <i>&amp;</i> ${esc(NOMBRES.dos)}</span>
          <span class="letra-texto">tienen el gusto de invitarte</span>
        </span>
        <span class="letra-nombre">${esc(l.nombre)}<small>${esc(l.descripcion)}</small></span>
      </label>`).join('');
    Object.keys(Estilos.LETRAS).forEach(Estilos.cargarLetra);
  }

  function estiloElegido() {
    const f = formBoda.elements;
    return Estilos.normalizar({ paleta: f.paleta.value, letra: f.letra.value, color: f.color.value });
  }

  // Cada opción se pinta con su paleta (o su letra) y lo demás elegido.
  function pintarEstilo() {
    const e = estiloElegido();
    $$('[data-paleta-muestra]', formBoda).forEach((el) => Estilos.aplicar({ paleta: el.dataset.paletaMuestra, letra: e.letra, color: e.color }, el));
    $$('[data-letra-muestra]', formBoda).forEach((el) => Estilos.aplicar(Object.assign({}, e, { letra: el.dataset.letraMuestra }), el));
    const color = e.paleta === Estilos.LIBRE ? `&color=${encodeURIComponent(e.color)}` : '';
    const mariposa = formBoda.elements.mariposa.checked ? '' : '&mariposa=no';
    $('[data-ver-estilo]', formBoda).href = `index.html?vista=panel&paleta=${e.paleta}&letra=${e.letra}${color}${mariposa}`;
    pintarMuestra();
  }

  // El selector de color y su código van juntos; tocar cualquiera elige «Color libre».
  let pintandoColor = 0;
  function elegirColor(t) {
    const f = formBoda.elements;
    if (t.name === 'color-codigo') {
      let v = t.value.trim().toLowerCase();
      if (!v.startsWith('#')) v = `#${v}`;
      if (/^#[0-9a-f]{3}$/.test(v)) v = `#${[...v.slice(1)].map((x) => x + x).join('')}`;
      if (!/^#[0-9a-f]{6}$/.test(v)) {
        t.setAttribute('aria-invalid', 'true');
        return;
      }
      f.color.value = v;
    } else {
      f['color-codigo'].value = t.value;
      f['color-codigo'].removeAttribute('aria-invalid');
    }
    $(`input[name="paleta"][value="${Estilos.LIBRE}"]`, formBoda).checked = true;
    // Al arrastrar el selector llegan muchos cambios: se pinta una vez por cuadro.
    cancelAnimationFrame(pintandoColor);
    pintandoColor = requestAnimationFrame(pintarEstilo);
  }

  // Vista previa: el sobre y la tarjeta en pequeño, con la foto principal.
  async function pintarMuestra() {
    const e = estiloElegido();
    const caja = $('[data-muestra]', formBoda);
    const portada = boda.fotos.portada;
    Estilos.aplicar(e, caja);
    caja.innerHTML = `
      <div class="muestra-sobre">
        <span class="muestra-numero">N.º <span class="cifra">027</span></span>
        <span class="muestra-sello sello-postal">${P.sello(Estilos.paleta(e).sello)}</span>
        <span class="muestra-para">Para</span>
        <span class="muestra-nombre">Familia Rodríguez</span>
        <span class="muestra-rubrica"></span>
      </div>
      <div class="muestra-carta">
        <span class="muestra-arco">${portada && portada.vista && !portada.falta ? `<img src="${esc(portada.vista)}" alt="" style="object-position:${esc(portada.encuadre)}">` : ''}</span>
        <span class="muestra-nombres">${esc(NOMBRES.uno)}</span>
        <span class="muestra-y">&amp;</span>
        <span class="muestra-nombres">${esc(NOMBRES.dos)}</span>
        <span class="muestra-texto">tienen el gusto de invitarte a celebrar su matrimonio</span>
      </div>`;
    const forro = await Estilos.forro(e);
    const ahora = estiloElegido();
    // Ruta absoluta: dentro de una variable, una ruta relativa se leería desde admin.css.
    if (ahora.paleta === e.paleta && ahora.color === e.color) caja.style.setProperty('--forro-img', forro || `url("${new URL('assets/forro.svg', location.href).href}")`);
  }

  // ---------- La boda: fotos ----------

  const LISTAS = {
    galeria: { caja: '[data-galeria]', max: 6, carpeta: 'pareja', lado: 2000, nombre: 'foto', nota: false, titulo: 'Fotos de la pareja' },
    vestimenta: { caja: '[data-vestimenta-fotos]', max: 4, carpeta: 'vestimenta', lado: 1400, nombre: 'referencia', nota: true, titulo: 'Fotos de referencia' },
  };

  // Reduce la foto a un tamaño razonable y la pasa a JPG antes de subirla.
  async function prepararFoto(archivo, lado) {
    if (archivo.type && !archivo.type.startsWith('image/')) throw new Error(`«${archivo.name}» no es una foto.`);
    const fuente = URL.createObjectURL(archivo);
    try {
      const img = new Image();
      img.src = fuente;
      try {
        await img.decode();
      } catch {
        throw new Error(`No se pudo leer «${archivo.name}». Prueba con una foto en JPG o PNG.`);
      }
      const escala = Math.min(1, lado / Math.max(img.naturalWidth, img.naturalHeight));
      const ancho = Math.max(1, Math.round(img.naturalWidth * escala));
      const alto = Math.max(1, Math.round(img.naturalHeight * escala));
      const lienzo = document.createElement('canvas');
      lienzo.width = ancho;
      lienzo.height = alto;
      const ctx = lienzo.getContext('2d');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, ancho, alto);
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, ancho, alto);
      const blob = await new Promise((r) => lienzo.toBlob(r, 'image/jpeg', 0.85));
      if (!blob) throw new Error(`No se pudo preparar «${archivo.name}».`);
      return { blob, vista: URL.createObjectURL(blob), forma: alto >= ancho ? 'vertical' : 'horizontal', url: null, falta: false };
    } finally {
      URL.revokeObjectURL(fuente);
    }
  }

  async function fotoGuardada(f, extra) {
    const vista = await D.urlFoto(f.url);
    return Object.assign({ url: f.url, blob: null, vista, forma: f.forma, falta: !vista }, extra);
  }

  function refsDe(ev) {
    return new Set([ev.fotoPortada && ev.fotoPortada.url]
      .concat(ev.fotos.map((f) => f.url), ev.vestimenta.fotos.map((f) => f.url))
      .filter(Boolean));
  }

  async function cargarFotos(ev) {
    const turno = ++boda.turnoFotos;
    const [portada, galeria, vestimenta] = await Promise.all([
      ev.fotoPortada ? fotoGuardada(ev.fotoPortada, { encuadre: ev.fotoPortada.encuadre, carpeta: 'portada' }) : null,
      Promise.all(ev.fotos.map((f) => fotoGuardada(f, { carpeta: 'pareja' }))),
      Promise.all(ev.vestimenta.fotos.map((f) => fotoGuardada(f, { nota: f.nota || '', carpeta: 'vestimenta' }))),
    ]);
    if (turno !== boda.turnoFotos) return;
    boda.fotos = { portada, galeria, vestimenta };
    boda.refsGuardadas = refsDe(ev);
    pintarPortada();
    pintarLista('galeria');
    pintarLista('vestimenta');
    pintarMuestra();
  }

  function todasLasFotos() {
    return [boda.fotos.portada].concat(boda.fotos.galeria, boda.fotos.vestimenta).filter(Boolean);
  }

  // Si una ruta de la carpeta del sitio no existe, el cuadro lo dice.
  function marcarFaltantes(caja, lista) {
    $$('img[data-i]', caja).forEach((img) => {
      img.addEventListener('error', () => {
        const f = lista()[Number(img.dataset.i)];
        if (f && !f.falta) {
          f.falta = true;
          img.replaceWith(Object.assign(document.createElement('span'), { className: 'foto-falta', textContent: 'No se encontró la foto' }));
        }
      }, { once: true });
    });
  }

  function zonaSubir({ clave, texto, detalle, multiple }) {
    return `<label class="subir-zona" data-subir="${clave}">
        <input class="solo-lectores" type="file" accept="image/*"${multiple ? ' multiple' : ''}>
        ${P.icono('foto', 'subir-icono')}
        <span class="subir-texto"><b>${texto}</b><span>${detalle}</span></span>
      </label>`;
  }

  function pintarPortada() {
    const caja = $('[data-portada]', formBoda);
    const f = boda.fotos.portada;
    if (!f) {
      caja.innerHTML = zonaSubir({ clave: 'portada', texto: 'Subir la foto principal', detalle: 'Toca para elegirla o arrástrala aquí' });
      return;
    }
    const [x, y] = f.encuadre.split(' ').map(parseFloat);
    const foto = f.falta ? '<span class="foto-falta">No se encontró la foto</span>' : `<img src="${esc(f.vista)}" alt="" data-i="0">`;
    caja.innerHTML = `<div class="portada-editor">
        <div class="encuadre">
          <div class="encuadre-foto" data-encuadre-foto>
            ${foto}
            <span class="encuadre-punto" data-punto style="left:${x}%;top:${y}%"></span>
          </div>
          <p class="campo-ayuda">Toca la foto en lo que debe quedar a la vista.</p>
        </div>
        <figure class="portada-arco">
          <div class="arco">
            <div class="arco-foto">${f.falta ? '' : `<img src="${esc(f.vista)}" alt="Vista previa de la foto en el arco" data-arco-img style="object-position:${esc(f.encuadre)}">`}</div>
            <div class="arco-ramo" data-arco-ramo></div>
          </div>
          <figcaption class="campo-ayuda">Así queda en la tarjeta</figcaption>
        </figure>
        <div class="portada-controles">
          <label class="campo">
            <span class="campo-etiqueta">Encuadre horizontal</span>
            <input type="range" min="0" max="100" step="1" value="${x}" data-encuadre="x">
          </label>
          <label class="campo">
            <span class="campo-etiqueta">Encuadre vertical</span>
            <input type="range" min="0" max="100" step="1" value="${y}" data-encuadre="y">
          </label>
          <div class="libro-botones">
            <label class="boton boton-secundario subir-boton" data-subir="portada">
              <input class="solo-lectores" type="file" accept="image/*">${P.icono('foto')}<span>Cambiar foto</span>
            </label>
            <button class="boton boton-secundario" type="button" data-quitar-portada>${P.icono('eliminar')}<span>Quitar</span></button>
          </div>
          ${f.blob ? '<p class="foto-nueva">Se sube al guardar los cambios.</p>' : ''}
        </div>
      </div>`;
    Ramo.crear($('[data-arco-ramo]', caja), { semilla: 7, sombra: false });
    marcarFaltantes(caja, () => [boda.fotos.portada]);
  }

  function fijarEncuadre(x, y) {
    const f = boda.fotos.portada;
    if (!f) return;
    const c = (n) => Math.min(100, Math.max(0, Math.round(n)));
    f.encuadre = `${c(x)}% ${c(y)}%`;
    const caja = $('[data-portada]', formBoda);
    $('[data-encuadre="x"]', caja).value = c(x);
    $('[data-encuadre="y"]', caja).value = c(y);
    Object.assign($('[data-punto]', caja).style, { left: `${c(x)}%`, top: `${c(y)}%` });
    const arco = $('[data-arco-img]', caja);
    if (arco) arco.style.objectPosition = f.encuadre;
    const mini = $('.muestra-arco img', formBoda);
    if (mini) mini.style.objectPosition = f.encuadre;
    marcarSucio();
  }

  function pintarLista(clave) {
    const cfg = LISTAS[clave];
    const lista = boda.fotos[clave];
    const caja = $(cfg.caja, formBoda);
    caja.dataset.lista = clave;
    const quedan = cfg.max - lista.length;
    const items = lista.map((f, i) => {
      const n = `${cfg.nombre} ${i + 1}`;
      return `<li class="foto-item" data-forma="${f.forma}" data-i="${i}">
          <div class="foto-item-marco">
            ${f.falta ? '<span class="foto-falta">No se encontró la foto</span>' : `<img src="${esc(f.vista)}" alt="${esc(n[0].toUpperCase() + n.slice(1))}" data-i="${i}">`}
            ${f.blob ? '<span class="foto-nueva-sello">Sin guardar</span>' : ''}
          </div>
          ${cfg.nota ? `<label class="foto-item-nota"><span class="solo-lectores">Nombre de la ${n}</span><input type="text" maxlength="40" placeholder="Nombre (opcional)" value="${esc(f.nota || '')}" data-nota-foto autocomplete="off"></label>` : ''}
          ${clave === 'galeria' ? '<p class="foto-item-lugar" data-lugar-foto></p>' : ''}
          <div class="foto-item-acciones">
            <button class="boton-icono" type="button" data-mover-foto="-1" title="Mover antes" aria-label="Mover la ${n} antes"${i === 0 ? ' disabled' : ''}>${P.icono('antes')}</button>
            <button class="boton-icono" type="button" data-mover-foto="1" title="Mover después" aria-label="Mover la ${n} después"${i === lista.length - 1 ? ' disabled' : ''}>${P.icono('despues')}</button>
            <button class="boton-icono peligro" type="button" data-quitar-foto title="Quitar" aria-label="Quitar la ${n}">${P.icono('eliminar')}</button>
          </div>
        </li>`;
    }).join('');
    caja.innerHTML = `${lista.length ? `<ol class="fotos-editor${cfg.nota ? ' con-nota' : ''}" aria-label="${cfg.titulo}">${items}</ol>` : ''}
      ${quedan > 0
        ? zonaSubir({ clave, multiple: true, texto: lista.length ? 'Agregar más fotos' : 'Agregar fotos', detalle: `Toca para elegirlas o arrástralas aquí · ${quedan === 1 ? 'cabe 1 más' : `caben ${quedan}`}` })
        : `<p class="hoja-vista">Ya están las ${cfg.max}. Quita una para poner otra.</p>`}`;
    marcarFaltantes(caja, () => boda.fotos[clave]);
    if (clave === 'galeria') rotularGaleria();
  }

  // Debajo de cada foto de la pareja, en qué parte de la invitación queda
  // (ver P.lugaresFotos): depende del orden y de si hay historia.
  function rotularGaleria() {
    const rotulos = $$('[data-lugar-foto]', formBoda);
    const lugares = P.lugaresFotos(rotulos.length, Boolean(formBoda.elements.historia.value.trim()));
    rotulos.forEach((p, i) => { p.textContent = P.LUGARES_FOTO[lugares[i]]; });
  }

  async function recibirArchivos(clave, archivos) {
    const elegidos = Array.from(archivos || []);
    if (!elegidos.length) return;
    const zona = $(`.subir-zona[data-subir="${clave}"], .subir-boton[data-subir="${clave}"]`, formBoda);
    if (zona) {
      zona.classList.add('preparando');
      const b = $('b, span:last-child', zona);
      if (b) b.textContent = 'Preparando…';
    }
    if (clave === 'portada') {
      try {
        const f = await prepararFoto(elegidos[0], 1600);
        const previa = boda.fotos.portada;
        if (previa && previa.blob) URL.revokeObjectURL(previa.vista);
        boda.fotos.portada = Object.assign(f, { carpeta: 'portada', encuadre: '50% 30%' });
        marcarSucio();
      } catch (err) {
        aviso(err.message, { error: true });
      }
      pintarPortada();
      pintarMuestra();
      return;
    }
    const cfg = LISTAS[clave];
    const destino = boda.fotos[clave];
    const caben = cfg.max - destino.length;
    if (elegidos.length > caben) aviso(caben === 1 ? 'Solo cabía 1 foto más: se agregó la primera.' : `Solo cabían ${caben} fotos más: se agregaron las primeras.`);
    for (const archivo of elegidos.slice(0, Math.max(0, caben))) {
      try {
        destino.push(Object.assign(await prepararFoto(archivo, cfg.lado), { carpeta: cfg.carpeta, nota: '' }));
        marcarSucio();
      } catch (err) {
        aviso(err.message, { error: true });
      }
    }
    pintarLista(clave);
  }

  function soltarVista(f) {
    if (f && f.blob && f.vista) URL.revokeObjectURL(f.vista);
  }

  // Al guardar: primero suben las fotos nuevas; después de guardar se borran
  // del almacenamiento las que ya no se usan.
  async function subirFotosNuevas(estadoEl) {
    await boda.cargandoFotos;
    const nuevas = todasLasFotos().filter((f) => f.blob && !f.url);
    for (let i = 0; i < nuevas.length; i += 1) {
      estadoEl.textContent = nuevas.length === 1 ? 'Subiendo la foto…' : `Subiendo fotos… ${i + 1} de ${nuevas.length}`;
      nuevas[i].url = await D.subirFoto(nuevas[i].blob, nuevas[i].carpeta);
      boda.subidas.add(nuevas[i].url);
    }
  }

  function limpiarFotos(guardado) {
    const usadas = refsDe(guardado);
    [...boda.refsGuardadas, ...boda.subidas].forEach((r) => {
      if (!usadas.has(r)) D.borrarFoto(r).catch(() => { /* queda huérfana; no estorba */ });
    });
    boda.refsGuardadas = usadas;
    boda.subidas.clear();
  }

  opcionesEstilo();

  async function abrirBoda() {
    if (boda.cargada) return;
    const e = $('[data-estado-boda]', formBoda);
    e.textContent = 'Cargando…';
    try {
      escribirBoda(await D.evento());
      boda.cargada = true;
      e.textContent = D.modo === 'local' ? 'Modo local: se guarda en este navegador' : 'Sin cambios';
      delete e.dataset.tono;
      prepararMapas();
    } catch (err) {
      e.textContent = '';
      aviso(err.message, { error: true });
    }
  }

  $('[data-lugar="ceremonia"]', formBoda).insertAdjacentHTML('beforebegin',
    `<p class="hoja-ayuda nota-mapas" data-nota-mapas hidden>La vista previa busca por nombre y dirección. Con una clave de Google Maps en <code>assets/config.js</code> puedes buscar el lugar con autocompletado y mover el pin (ver LEEME.md).</p>`);

  formBoda.addEventListener('input', (e) => {
    marcarSucio();
    const t = e.target;
    if (['fecha', 'hora', 'ciudad'].includes(t.name)) pintarVistaFecha();
    if (t.name === 'ciudad') ['ceremonia', 'recepcion'].forEach(refrescarEnUnRato);
    const ed = t.closest('[data-lugar]');
    if (ed && (t.dataset.campo === 'lugar' || t.dataset.campo === 'direccion')) refrescarEnUnRato(ed.dataset.lugar);
    if (t.matches('[aria-invalid]')) t.removeAttribute('aria-invalid');
    if (t.dataset.encuadre) {
      const caja = $('[data-portada]', formBoda);
      fijarEncuadre(Number($('[data-encuadre="x"]', caja).value), Number($('[data-encuadre="y"]', caja).value));
    }
    if (t.matches('[data-nota-foto]')) {
      const f = boda.fotos.vestimenta[Number(t.closest('[data-i]').dataset.i)];
      if (f) f.nota = t.value;
    }
    if (t.name === 'color' || t.name === 'color-codigo') elegirColor(t);
    if (t.name === 'historia') rotularGaleria();
  });

  // Arrastrar fotos a las zonas de subida.
  formBoda.addEventListener('dragover', (e) => {
    const zona = e.target.closest('.subir-zona');
    if (!zona) return;
    e.preventDefault();
    zona.classList.add('encima');
  });
  formBoda.addEventListener('dragleave', (e) => {
    const zona = e.target.closest('.subir-zona');
    if (zona && !zona.contains(e.relatedTarget)) zona.classList.remove('encima');
  });
  formBoda.addEventListener('drop', (e) => {
    const zona = e.target.closest('.subir-zona');
    if (!zona) return;
    e.preventDefault();
    zona.classList.remove('encima');
    recibirArchivos(zona.dataset.subir, e.dataTransfer.files);
  });
  // Una foto soltada fuera de las zonas no debe abrirse en lugar del panel.
  ['dragover', 'drop'].forEach((tipo) => document.addEventListener(tipo, (e) => {
    if (e.dataTransfer && Array.from(e.dataTransfer.types || []).includes('Files')) e.preventDefault();
  }));

  formBoda.addEventListener('change', (e) => {
    const t = e.target;
    if (t.type === 'file') {
      const zona = t.closest('[data-subir]');
      recibirArchivos(zona.dataset.subir, t.files);
      t.value = '';
      return;
    }
    if (t.name === 'paleta' || t.name === 'letra' || t.name === 'mariposa') pintarEstilo();
    // Un código a medio escribir vuelve al color elegido al salir del campo.
    if (t.name === 'color-codigo') {
      t.value = formBoda.elements.color.value;
      t.removeAttribute('aria-invalid');
    }
    if (t.name === 'recepcion-mismo') sincronizarMismoLugar();
    if (t.dataset.campo === 'mapa') {
      const ed = t.closest('[data-lugar]');
      const ayuda = $('[data-ayuda-enlace]', ed);
      const valor = t.value.trim();
      if (!valor) {
        ayuda.textContent = 'Pega el enlace de «Compartir» de Google Maps para que todos lleguen exactamente a ese punto.';
        return;
      }
      const c = coordsDeEnlace(valor);
      if (c) {
        fijarPin(ed.dataset.lugar, c);
        ayuda.textContent = 'Listo: tomamos el punto exacto de ese enlace.';
      } else {
        ayuda.textContent = 'Google Maps abrirá este enlace tal cual. Waze y Apple Maps usarán el nombre y la dirección.';
      }
    }
  });

  formBoda.addEventListener('click', (e) => {
    // Tocar la foto fija el encuadre; con teclado se usan los dos controles.
    const encuadre = e.target.closest('[data-encuadre-foto]');
    if (encuadre) {
      const r = encuadre.getBoundingClientRect();
      fijarEncuadre(((e.clientX - r.left) / r.width) * 100, ((e.clientY - r.top) / r.height) * 100);
      return;
    }
    const t = e.target.closest('button');
    if (!t) return;
    if (t.matches('[data-agregar-fila]')) {
      const clave = t.dataset.agregarFila;
      const ol = $(`[data-filas="${clave}"]`, formBoda);
      ol.insertAdjacentHTML('beforeend', filaEditable(clave));
      sincronizarFilas(clave);
      marcarSucio();
      $('.fila-editor:last-child [data-f]', ol).focus();
      return;
    }
    if (t.matches('[data-sembrar-preguntas]')) {
      pintarFilas('preguntas', PREGUNTAS_COMUNES.map((pregunta) => ({ pregunta })));
      marcarSucio();
      $('[data-filas="preguntas"] [data-f="respuesta"]', formBoda).focus();
      return;
    }
    if (t.matches('[data-mover-fila], [data-quitar-fila]')) {
      const li = t.closest('li');
      const clave = li.closest('[data-filas]').dataset.filas;
      if (t.dataset.moverFila) {
        const otro = t.dataset.moverFila === '-1' ? li.previousElementSibling : li.nextElementSibling;
        if (!otro) return;
        if (t.dataset.moverFila === '-1') otro.before(li);
        else otro.after(li);
        sincronizarFilas(clave);
        const mismo = $(`[data-mover-fila="${t.dataset.moverFila}"]`, li);
        (mismo.disabled ? $('[data-f]', li) : mismo).focus();
      } else {
        const foco = li.nextElementSibling || li.previousElementSibling;
        li.remove();
        sincronizarFilas(clave);
        if (foco) $('[data-f]', foco).focus();
        else $(`[data-agregar-fila="${clave}"]`, formBoda).focus();
      }
      marcarSucio();
      return;
    }
    if (t.matches('[data-quitar-portada]')) {
      soltarVista(boda.fotos.portada);
      boda.fotos.portada = null;
      pintarPortada();
      pintarMuestra();
      marcarSucio();
      $('[data-portada] input[type="file"]', formBoda).focus();
      return;
    }
    if (t.matches('[data-mover-foto], [data-quitar-foto]')) {
      const clave = t.closest('[data-lista]').dataset.lista;
      const lista = boda.fotos[clave];
      const i = Number(t.closest('[data-i]').dataset.i);
      let foco;
      if (t.dataset.moverFoto) {
        const j = i + Number(t.dataset.moverFoto);
        if (j < 0 || j >= lista.length) return;
        [lista[i], lista[j]] = [lista[j], lista[i]];
        foco = () => {
          const mismo = $(`[data-i="${j}"] [data-mover-foto="${t.dataset.moverFoto}"]`, formBoda.querySelector(LISTAS[clave].caja));
          return mismo && !mismo.disabled ? mismo : $(`[data-i="${j}"] [data-quitar-foto]`, formBoda.querySelector(LISTAS[clave].caja));
        };
      } else {
        soltarVista(lista.splice(i, 1)[0]);
        foco = () => {
          const caja = formBoda.querySelector(LISTAS[clave].caja);
          return $(`[data-i="${Math.min(i, lista.length - 1)}"] [data-quitar-foto]`, caja) || $('input[type="file"]', caja);
        };
      }
      pintarLista(clave);
      marcarSucio();
      const el = foco();
      if (el) el.focus();
      return;
    }
    if (t.matches('[data-agregar-momento]')) {
      $('[data-itinerario]', formBoda).insertAdjacentHTML('beforeend', filaMomento());
      sincronizarItinerario();
      marcarSucio();
      $('.momento-fila:last-child [data-m="hora"]', formBoda).focus();
    } else if (t.matches('[data-sembrar-itinerario]')) {
      const ev = leerBoda();
      pintarItinerario([
        { hora: ev.hora, titulo: 'Ceremonia', detalle: ev.ceremonia.lugar },
        { hora: ev.recepcion.hora, titulo: 'Recepción', detalle: ev.recepcion.mismoLugar ? ev.ceremonia.lugar : ev.recepcion.lugar },
      ]);
      marcarSucio();
      $('.momento-fila [data-m="titulo"]', formBoda).focus();
    } else if (t.matches('[data-mover]')) {
      const li = t.closest('li');
      const otro = t.dataset.mover === '-1' ? li.previousElementSibling : li.nextElementSibling;
      if (!otro) return;
      if (t.dataset.mover === '-1') otro.before(li);
      else otro.after(li);
      sincronizarItinerario();
      marcarSucio();
      const mismo = $(`[data-mover="${t.dataset.mover}"]`, li);
      (mismo.disabled ? $('[data-m="titulo"]', li) : mismo).focus();
    } else if (t.matches('[data-quitar-momento]')) {
      const li = t.closest('li');
      const foco = li.nextElementSibling || li.previousElementSibling;
      li.remove();
      sincronizarItinerario();
      marcarSucio();
      if (foco) $('[data-m="titulo"]', foco).focus();
      else $('[data-agregar-momento]', formBoda).focus();
    } else if (t.matches('[data-quitar-pin]')) {
      const ed = t.closest('[data-lugar]');
      fijarPin(ed.dataset.lugar, null);
      $('[data-campo="lugar"]', ed).focus();
    }
  });

  formBoda.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (boda.guardando || !boda.cargada) return;
    $$('[aria-invalid]', formBoda).forEach((el) => el.removeAttribute('aria-invalid'));
    const sinNombre = $$('.momento-fila', formBoda).find((li) => {
      const v = (c) => $(`[data-m="${c}"]`, li).value.trim();
      return !v('titulo') && (v('hora') || v('detalle'));
    });
    if (sinNombre) {
      const campo = $('[data-m="titulo"]', sinNombre);
      campo.setAttribute('aria-invalid', 'true');
      campo.focus();
      aviso('A un momento del itinerario le falta el nombre.', { error: true });
      return;
    }
    const incompleta = filaIncompleta();
    if (incompleta) {
      incompleta.el.setAttribute('aria-invalid', 'true');
      incompleta.el.focus();
      aviso(incompleta.texto, { error: true });
      return;
    }
    const cuenta = ['banco', 'tipo', 'titular', 'documento'].some((k) => formBoda.elements[`cuenta-${k}`].value.trim());
    if (cuenta && !formBoda.elements['cuenta-numero'].value.trim()) {
      formBoda.elements['cuenta-numero'].setAttribute('aria-invalid', 'true');
      formBoda.elements['cuenta-numero'].focus();
      aviso('Falta el número de la cuenta para los regalos.', { error: true });
      return;
    }
    const enlaceMalo = $$('[data-campo="mapa"]', formBoda).find((i) => i.value.trim() && !/^https:\/\/\S+$/.test(i.value.trim()));
    if (enlaceMalo) {
      enlaceMalo.setAttribute('aria-invalid', 'true');
      enlaceMalo.focus();
      aviso('El enlace de Google Maps debe empezar por https://', { error: true });
      return;
    }
    const boton = $('[data-guardar-boda]', formBoda);
    const estadoEl = $('[data-estado-boda]', formBoda);
    boda.guardando = true;
    boton.disabled = true;
    estadoEl.textContent = 'Guardando…';
    try {
      await subirFotosNuevas(estadoEl);
      estadoEl.textContent = 'Guardando…';
      const guardado = await D.guardarEvento(leerBoda());
      limpiarFotos(guardado);
      boda.sucio = false;
      escribirBoda(guardado);
      estadoEl.textContent = D.modo === 'local' ? 'Guardado en este navegador' : 'Guardado: los invitados ya lo ven';
      estadoEl.dataset.tono = 'listo';
      aviso('Datos de la boda guardados.');
    } catch (err) {
      estadoEl.textContent = 'No se guardó';
      estadoEl.dataset.tono = 'error';
      aviso(err.message, { error: true });
    } finally {
      boda.guardando = false;
      boton.disabled = false;
    }
  });

  addEventListener('beforeunload', (e) => {
    if (mesas.pendiente) guardarPlano();
    if (!boda.sucio && !mesas.pendiente && !mesas.guardando) return;
    e.preventDefault();
    e.returnValue = '';
  });

  // ---------- Mesas: el plano del salón ----------

  const S = window.Salon;
  const vistaMesas = $('[data-vista-panel="mesas"]');
  const marcoPlano = $('[data-plano]', vistaMesas);
  const inspector = $('[data-inspector]', vistaMesas);
  const listaFamilias = $('[data-familias]', vistaMesas);
  const mesas = {
    plan: S.normalizar(null),
    error: '',
    seleccion: null,   // id de la pieza elegida en el plano
    sentando: null,    // id de la familia que espera que le toquen su mesa
    busqueda: '',
    pendiente: false,  // cambios del plano que aún no se guardan
    guardando: false,
    otraVez: false,
    temporizador: null,
    arrastre: null,    // una pieza que se mueve (o un espacio que cambia de tamaño)
    familia: null,     // una familia que se lleva con el ratón hasta su mesa
    cuadro: 0,
    ignorarClic: false,
  };

  // En el teléfono el plano entra completo y los nombres de los espacios crecen.
  const planoChico = matchMedia('(max-width: 759px)');
  planoChico.addEventListener('change', () => { if (!vistaMesas.hidden) pintarPlano(); });

  const pieza = (id) => mesas.plan.piezas.find((p) => p.id === id) || null;
  const cuantas =(n, uno, varios) => `${n} ${n === 1 ? uno : varios}`;
  const sinTildes = (t) => String(t || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

  // La mesa de una familia, si sigue en el plano.
  function mesaDe(i) {
    const p = i && i.mesa ? pieza(i.mesa) : null;
    return S.esMesa(p) ? p : null;
  }

  // Puestos que ocupa una familia: sus confirmados o, si no ha respondido, sus cupos.
  function personas(i) {
    if (i.estado === 'confirmado') return i.asistentes;
    return i.estado === 'pendiente' ? i.cupos : 0;
  }

  function ocupacion() {
    const o = {};
    estado.lista.forEach((i) => {
      const m = mesaDe(i);
      if (!m) return;
      const x = o[m.id] || (o[m.id] = { confirmados: 0, pendientes: 0, familias: [] });
      if (i.estado === 'confirmado') x.confirmados += i.asistentes;
      else if (i.estado === 'pendiente') x.pendientes += i.cupos;
      x.familias.push(i);
    });
    return o;
  }

  const porSentar = () => estado.lista.filter((i) => i.estado !== 'declinado' && !mesaDe(i));

  async function cargarPlano() {
    // Lo que se está editando no se pisa con lo guardado.
    if (mesas.pendiente || mesas.guardando || mesas.arrastre) return;
    try {
      mesas.plan = await D.salon();
      mesas.error = '';
    } catch (err) {
      mesas.error = err.message;
    }
  }

  function opcionesMesa(actual) {
    const o = ocupacion();
    const lista = mesas.plan.piezas.filter(S.esMesa).sort((a, b) => a.numero - b.numero);
    $('[data-campo-mesa]', formInv).hidden = !lista.length;
    const select = formInv.elements.mesa;
    select.innerHTML = '<option value="">Sin mesa</option>' + lista.map((m) => {
      const x = o[m.id] || { confirmados: 0, pendientes: 0 };
      return `<option value="${esc(m.id)}">Mesa ${m.numero}${m.nombre ? ` · ${esc(m.nombre)}` : ''} (${x.confirmados + x.pendientes} de ${m.puestos})</option>`;
    }).join('');
    select.value = actual && mesaDe({ mesa: actual }) ? actual : '';
  }

  // ---------- Mesas: pintar ----------

  function pintarMesas({ inspector: completo = true } = {}) {
    if (vistaMesas.hidden) return;
    const o = ocupacion();
    pintarCifrasMesas(o);
    pintarPublicar();
    pintarSentando();
    pintarPlano(o);
    if (completo) pintarInspector(o);
    else pintarResumen(o);
    pintarFamilias();
  }

  function pintarCifrasMesas() {
    const lista = mesas.plan.piezas.filter(S.esMesa);
    const puestos = lista.reduce((s, m) => s + m.puestos, 0);
    let con = 0;
    let sin = 0;
    estado.lista.forEach((i) => {
      if (mesaDe(i)) con += personas(i);
      else sin += personas(i);
    });
    const libres = puestos - con;
    const ancho = Math.max(3, String(Math.max(puestos, con, sin)).length);
    $('[data-contadores-mesas]').innerHTML = [
      ['Mesas', cifra(lista.length, ancho)],
      ['Puestos', `${cifra(puestos, ancho)}<small>${libres < 0 ? `faltan ${-libres}` : cuantas(libres, 'libre', 'libres')}</small>`],
      ['Personas con mesa', cifra(con, ancho)],
      ['Personas sin mesa', cifra(sin, ancho)],
    ].map(([e, v]) => `<div class="contador"><dt>${e}</dt><dd>${v}</dd></div>`).join('');
  }

  function pintarPublicar() {
    const casilla = $('[data-mostrar-mesas]', vistaMesas);
    casilla.checked = mesas.plan.mostrar;
    casilla.closest('.publicar').dataset.publicado = mesas.plan.mostrar;
    $('[data-nota-publicar]', vistaMesas).textContent = mesas.plan.mostrar
      ? 'Encendido: cada invitado que confirmó ve su mesa y el plano del salón en su invitación.'
      : 'Apagado: nadie ve su mesa todavía. Organiza el salón con calma y enciéndelo cuando esté listo.';
  }

  function pintarSentando() {
    const caja = $('[data-sentando]', vistaMesas);
    const i = mesas.sentando && estado.lista.find((x) => x.id === mesas.sentando);
    if (!i) {
      mesas.sentando = null;
      caja.hidden = true;
      return;
    }
    caja.hidden = false;
    caja.innerHTML = `<span>Sentando a <b>${esc(i.nombre)}</b> (${cuantas(personas(i), 'persona', 'personas')}). Toca su mesa en el plano.</span>
      <button class="boton boton-barra boton-chico" type="button" data-cancelar-sentar>Cancelar</button>`;
  }

  function pintarPlano(o = ocupacion()) {
    const activo = document.activeElement;
    const foco = activo && marcoPlano.contains(activo) && activo.closest('[data-pieza]') ? activo.closest('[data-pieza]').dataset.pieza : null;
    let vacio = '';
    if (!mesas.plan.piezas.length) {
      vacio = mesas.error
        ? `<div class="plano-vacio"><h2>No se pudo traer el plano</h2><p>${esc(mesas.error)}</p>
            <div class="libro-botones"><button class="boton boton-secundario" type="button" data-reintentar-plano data-icono="actualizar">Intentar de nuevo</button></div></div>`
        : `<div class="plano-vacio"><h2>El salón está vacío</h2>
            <p>Agrega las mesas y los espacios que ayudan a ubicarse (la pista, la entrada, la música) y arrástralos a su lugar. O empieza con un salón de ejemplo y ajústalo.</p>
            <div class="libro-botones">
              <button class="boton boton-principal" type="button" data-nueva="redonda" data-icono="mesa">Agregar la primera mesa</button>
              <button class="boton boton-secundario" type="button" data-ejemplo-salon>Empezar con un salón de ejemplo</button>
            </div></div>`;
    }
    marcoPlano.innerHTML = S.dibujar(mesas.plan, {
      modo: 'editor',
      seleccion: mesas.seleccion,
      ocupacion: o,
      eligiendo: Boolean(mesas.sentando),
      tamZona: planoChico.matches ? 34 : 22,
      titulo: 'Plano del salón',
    }) + vacio;
    if (vacio) iconos(marcoPlano);
    if (foco) {
      const g = $(`[data-pieza="${CSS.escape(foco)}"]`, marcoPlano);
      if (g) g.focus({ preventScroll: true });
    }
  }

  function paso(nombre, valor, { min, max, salto = 1, menos, mas }) {
    return `<span class="paso" data-paso>
        <button type="button" data-paso-menos aria-label="${menos}">${P.icono('menos')}</button>
        <input type="number" data-pz="${nombre}" min="${min}" max="${max}" step="${salto}" value="${valor}" inputmode="numeric">
        <button type="button" data-paso-mas aria-label="${mas}">${P.icono('mas')}</button>
      </span>`;
  }

  function sincronizarPasosMesa() {
    $$('[data-paso]', inspector).forEach((caja) => {
      const input = $('input', caja);
      const v = Number(input.value) || 0;
      $('[data-paso-menos]', caja).disabled = v <= Number(input.min);
      $('[data-paso-mas]', caja).disabled = v >= Number(input.max);
    });
  }

  function metaFamilia(i) {
    if (i.estado === 'confirmado') return `<i class="punto confirmado"></i>${cuantas(i.asistentes, 'confirmado', 'confirmados')}`;
    if (i.estado === 'pendiente') return `<i class="punto pendiente"></i>${cuantas(i.cupos, 'cupo', 'cupos')} sin confirmar`;
    return '<i class="punto declinado"></i>No asiste: no ocupa puesto';
  }

  function resumenMesa(p, x) {
    const sentados = x.confirmados + x.pendientes;
    const libres = p.puestos - sentados;
    const repetida = mesas.plan.piezas.some((q) => q !== p && S.esMesa(q) && q.numero === p.numero);
    const ocupa = libres < 0
      ? `<p class="ocupacion de-mas"><b>${sentados}</b> personas en ${cuantas(p.puestos, 'puesto', 'puestos')}: se pasa por ${-libres}.</p>`
      : `<p class="ocupacion"><b>${sentados}</b> de ${cuantas(p.puestos, 'puesto ocupado', 'puestos ocupados')}${x.pendientes ? ` · ${x.pendientes} sin confirmar` : ''}</p>`;
    return ocupa + (repetida ? `<p class="campo-error">Ya hay otra mesa con el número ${p.numero}.</p>` : '');
  }

  function filaSentado(i) {
    const n = esc(i.nombre);
    return `<li class="sentado" data-sentado="${esc(i.id)}">
        <span class="sentado-texto"><span class="familia-nombre">${n}</span><span class="familia-meta">${metaFamilia(i)}</span></span>
        ${i.estado !== 'declinado' ? `<button class="boton boton-secundario boton-chico" type="button" data-cambiar-mesa aria-label="Cambiar de mesa a ${n}">Cambiar</button>` : ''}
        <button class="boton-icono" type="button" data-sacar title="Quitar de la mesa" aria-label="Quitar a ${n} de la mesa">${P.icono('cerrar')}</button>
      </li>`;
  }

  function pintarInspector(o = ocupacion()) {
    const p = pieza(mesas.seleccion);
    if (!p) {
      mesas.seleccion = null;
      inspector.innerHTML = `<p class="inspector-vacio">${mesas.plan.piezas.length
        ? 'Toca una mesa del plano para cambiarle el número o los puestos y ver quién se sienta en ella.'
        : 'Aquí vas a editar cada mesa y ver quién se sienta en ella.'}</p>
        <p class="inspector-vacio">Para sentar a una familia, tócala en «Por sentar» y después toca su mesa. Con el ratón también puedes arrastrarla hasta la mesa.</p>`;
      return;
    }
    const titulo = p.forma === 'zona' ? esc(p.nombre || 'Espacio') : `Mesa <span class="cifra">${p.numero}</span>`;
    const que = p.forma === 'zona' ? `el espacio ${esc(p.nombre || '')}`.trim() : `la mesa ${p.numero}`;
    const cabeza = `<header class="inspector-cabeza">
        <h2 class="inspector-titulo" data-titulo-pieza>${titulo}</h2>
        <button class="boton-icono peligro" type="button" data-quitar-pieza title="Quitar del plano" aria-label="Quitar ${que} del plano">${P.icono('eliminar')}</button>
      </header>`;
    if (p.forma === 'zona') {
      inspector.innerHTML = `${cabeza}
        <p class="campo-ayuda">Un espacio que ayuda a ubicarse en el salón. Arrastra su esquina para cambiarle el tamaño.</p>
        <label class="campo">
          <span class="campo-etiqueta">Nombre</span>
          <input type="text" data-pz="nombre" maxlength="40" list="nombres-espacio" placeholder="Pista de baile" value="${esc(p.nombre || '')}" autocomplete="off">
        </label>
        <div class="campo-fila campo-pasos">
          <label class="campo"><span class="campo-etiqueta">Ancho</span>${paso('ancho', p.ancho, { min: 60, max: S.ANCHO, salto: 20, menos: 'Más angosto', mas: 'Más ancho' })}</label>
          <label class="campo"><span class="campo-etiqueta">Alto</span>${paso('alto', p.alto, { min: 60, max: S.ALTO, salto: 20, menos: 'Más bajo', mas: 'Más alto' })}</label>
        </div>`;
      sincronizarPasosMesa();
      return;
    }
    const x = o[p.id] || { confirmados: 0, pendientes: 0, familias: [] };
    const familias = x.familias.slice().sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
    const radio = (name, value, texto, actual) => `<label><input type="radio" name="${name}" value="${value}"${actual ? ' checked' : ''}><span>${texto}</span></label>`;
    inspector.innerHTML = `${cabeza}
      <div data-resumen-mesa>${resumenMesa(p, x)}</div>
      <div class="campo-fila campo-pasos">
        <label class="campo"><span class="campo-etiqueta">Número</span>${paso('numero', p.numero, { min: 1, max: 999, menos: 'Número anterior', mas: 'Número siguiente' })}</label>
        <label class="campo"><span class="campo-etiqueta">Puestos</span>${paso('puestos', p.puestos, { min: 1, max: 30, menos: 'Un puesto menos', mas: 'Un puesto más' })}</label>
      </div>
      <label class="campo">
        <span class="campo-etiqueta">Nombre <em>(opcional)</em></span>
        <input type="text" data-pz="nombre" maxlength="40" placeholder="Por ejemplo, Los padrinos" value="${esc(p.nombre || '')}" autocomplete="off">
        <span class="campo-ayuda">El invitado lo ve debajo del número de su mesa.</span>
      </label>
      <fieldset class="campo">
        <legend class="campo-etiqueta">Forma</legend>
        <div class="segmentos segmentos-form">${radio('pz-forma', 'redonda', 'Redonda', p.forma === 'redonda')}${radio('pz-forma', 'larga', 'Larga', p.forma === 'larga')}</div>
      </fieldset>
      ${p.forma === 'larga' ? `<fieldset class="campo">
        <legend class="campo-etiqueta">Sentido</legend>
        <div class="segmentos segmentos-form">${radio('pz-giro', '0', 'Horizontal', p.giro !== 90)}${radio('pz-giro', '90', 'Vertical', p.giro === 90)}</div>
      </fieldset>` : ''}
      <div class="campo">
        <span class="campo-etiqueta">Se sientan aquí</span>
        ${familias.length
          ? `<ul class="sentados">${familias.map(filaSentado).join('')}</ul>`
          : '<p class="campo-ayuda">Nadie todavía. Toca una familia de «Por sentar» para traerla a esta mesa.</p>'}
      </div>`;
    sincronizarPasosMesa();
  }

  // Lo que cambia mientras se edita un campo, sin volver a pintar el campo.
  function pintarResumen(o) {
    const p = pieza(mesas.seleccion);
    if (!p) return;
    const titulo = $('[data-titulo-pieza]', inspector);
    if (p.forma === 'zona') {
      if (titulo) titulo.textContent = p.nombre || 'Espacio';
      return;
    }
    if (titulo) titulo.innerHTML = `Mesa <span class="cifra">${p.numero}</span>`;
    const caja = $('[data-resumen-mesa]', inspector);
    if (caja) caja.innerHTML = resumenMesa(p, o[p.id] || { confirmados: 0, pendientes: 0 });
  }

  function pintarFamilias() {
    const todas = porSentar();
    const total = todas.reduce((s, i) => s + personas(i), 0);
    $('[data-por-sentar-cuenta]', vistaMesas).textContent = todas.length
      ? `${cuantas(todas.length, 'familia', 'familias')} · ${cuantas(total, 'persona', 'personas')}`
      : '';
    $('[data-buscar-familia]', vistaMesas).closest('.buscador').hidden = todas.length < 8 && !mesas.busqueda;
    if (!estado.lista.length) {
      listaFamilias.innerHTML = '<li class="familias-vacio">Aún no hay invitados. Agrégalos en la pestaña <a href="#invitados">Invitados</a>.</li>';
      return;
    }
    if (!todas.length) {
      listaFamilias.innerHTML = '<li class="familias-vacio">Todas las familias que van ya tienen mesa.</li>';
      return;
    }
    const q = sinTildes(mesas.busqueda.trim());
    const lista = todas
      .filter((i) => !q || sinTildes(i.nombre).includes(q))
      .sort((a, b) => (a.estado !== 'confirmado') - (b.estado !== 'confirmado') || a.nombre.localeCompare(b.nombre, 'es'));
    if (!lista.length) {
      listaFamilias.innerHTML = '<li class="familias-vacio">Ninguna familia por sentar se llama así.</li>';
      return;
    }
    const elegida = pieza(mesas.seleccion);
    const destino = S.esMesa(elegida) && !mesas.sentando ? elegida : null;
    listaFamilias.innerHTML = lista.map((i) => {
      const armada = mesas.sentando === i.id;
      const accion = destino ? `Sentar en la mesa ${destino.numero}` : armada ? 'Toca su mesa' : 'Elegir mesa';
      return `<li><button class="familia" type="button" data-familia="${esc(i.id)}"${destino ? '' : ` aria-pressed="${armada}"`}>
          <span class="familia-nombre">${esc(i.nombre)}</span>
          <span class="familia-meta">${metaFamilia(i)}</span>
          <span class="familia-accion">${accion}</span>
        </button></li>`;
    }).join('');
  }

  // ---------- Mesas: guardar ----------

  function estadoPlano(texto, tono) {
    const el = $('[data-estado-plano]', vistaMesas);
    el.textContent = texto;
    if (tono) el.dataset.tono = tono;
    else delete el.dataset.tono;
  }

  function cambioPlano() {
    mesas.pendiente = true;
    estadoPlano('Cambios sin guardar', 'sucio');
    clearTimeout(mesas.temporizador);
    mesas.temporizador = setTimeout(guardarPlano, 700);
  }

  async function guardarPlano() {
    clearTimeout(mesas.temporizador);
    if (mesas.guardando) {
      mesas.otraVez = true;
      return false;
    }
    mesas.guardando = true;
    mesas.pendiente = false;
    estadoPlano('Guardando…');
    let ok = false;
    try {
      await D.guardarSalon(mesas.plan);
      ok = true;
      if (!mesas.pendiente) estadoPlano(D.modo === 'local' ? 'Guardado en este navegador' : 'Guardado', 'listo');
    } catch (err) {
      mesas.pendiente = true;
      estadoPlano('No se guardó', 'error');
      aviso(err.message, { error: true, accion: 'Reintentar', alHacer: guardarPlano });
    } finally {
      mesas.guardando = false;
      if (mesas.otraVez) {
        mesas.otraVez = false;
        guardarPlano();
      }
    }
    return ok;
  }

  // ---------- Mesas: piezas ----------

  function siguienteNumero() {
    return mesas.plan.piezas.filter(S.esMesa).reduce((m, p) => Math.max(m, p.numero), 0) + 1;
  }

  // El primer hueco libre, de arriba abajo y de izquierda a derecha.
  function ubicar(p) {
    const h = S.huella(p);
    const choca = (x, y) => mesas.plan.piezas.some((o) => {
      const k = S.huella(o);
      return Math.abs(o.x - x) < h.x + k.x + 16 && Math.abs(o.y - y) < h.y + k.y + 16;
    });
    for (let y = Math.ceil((h.y + 20) / 10) * 10; y <= S.ALTO - h.y - 10; y += 20) {
      for (let x = Math.ceil((h.x + 20) / 10) * 10; x <= S.ANCHO - h.x - 10; x += 20) {
        if (!choca(x, y)) {
          p.x = x;
          p.y = y;
          return S.encajar(p);
        }
      }
    }
    p.x = S.ANCHO / 2;
    p.y = S.ALTO / 2;
    return S.encajar(p);
  }

  function agregarPieza(forma) {
    if (mesas.plan.piezas.length >= 150) {
      aviso('El plano ya tiene 150 piezas: quita alguna para agregar otra.', { error: true });
      return;
    }
    const base = { id: S.nuevoId(), forma };
    if (forma === 'zona') {
      const hayPista = mesas.plan.piezas.some((p) => p.forma === 'zona' && /pista/i.test(p.nombre || ''));
      Object.assign(base, { nombre: hayPista ? null : 'Pista de baile', ancho: 280, alto: 180 });
    } else {
      Object.assign(base, { numero: siguienteNumero(), puestos: forma === 'larga' ? 10 : 8, giro: 0 });
    }
    const p = ubicar(S.normalizarPieza(base));
    mesas.plan.piezas.push(p);
    mesas.seleccion = p.id;
    mesas.sentando = null;
    cambioPlano();
    pintarMesas();
    const g = $(`[data-pieza="${p.id}"]`, marcoPlano);
    if (g) {
      g.focus({ preventScroll: true });
      g.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    }
  }

  // Un punto de partida: la música, la pista, la entrada y 12 mesas de 8.
  function salonDeEjemplo() {
    const piezas = [
      { forma: 'zona', nombre: 'Música', x: 600, y: 100, ancho: 220, alto: 80 },
      { forma: 'zona', nombre: 'Pista de baile', x: 600, y: 320, ancho: 320, alto: 220 },
      { forma: 'zona', nombre: 'Entrada', x: 600, y: 750, ancho: 200, alto: 60 },
    ];
    [170, 370, 570].forEach((y) => [150, 330, 870, 1050].forEach((x) => {
      piezas.push({ forma: 'redonda', numero: piezas.length - 2, puestos: 8, x, y });
    }));
    mesas.plan.piezas = piezas.map((p) => S.normalizarPieza(Object.assign({ id: S.nuevoId() }, p)));
    mesas.seleccion = null;
    cambioPlano();
    pintarMesas();
    aviso('Listo: 12 mesas de 8 puestos, la pista, la música y la entrada. Muévelas a su lugar.');
  }

  function quitarPieza(id) {
    const pos = mesas.plan.piezas.findIndex((p) => p.id === id);
    if (pos < 0) return;
    const [p] = mesas.plan.piezas.splice(pos, 1);
    const ids = estado.lista.filter((x) => x.mesa === p.id).map((x) => x.id);
    estado.lista.forEach((x) => { if (ids.includes(x.id)) x.mesa = null; });
    if (mesas.seleccion === id) mesas.seleccion = null;
    cambioPlano();
    pintarMesas();
    pintarTabla();
    D.asignarMesa(ids, null).catch((err) => aviso(err.message, { error: true }));
    const que = S.esMesa(p) ? `Mesa ${p.numero} eliminada.` : `Espacio «${p.nombre || 'sin nombre'}» eliminado.`;
    aviso(`${que}${ids.length ? ` ${cuantas(ids.length, 'familia quedó', 'familias quedaron')} sin mesa.` : ''}`, {
      accion: 'Deshacer',
      alHacer: async () => {
        mesas.plan.piezas.splice(Math.min(pos, mesas.plan.piezas.length), 0, p);
        estado.lista.forEach((x) => { if (ids.includes(x.id)) x.mesa = p.id; });
        mesas.seleccion = p.id;
        cambioPlano();
        pintarMesas();
        pintarTabla();
        try {
          await D.asignarMesa(ids, p.id);
        } catch (err) {
          aviso(err.message, { error: true });
        }
      },
    });
  }

  // ---------- Mesas: sentar ----------

  async function sentar(invId, mesaId) {
    const i = estado.lista.find((x) => x.id === invId);
    if (!i) return;
    const antes = i.mesa || null;
    const destino = mesaId ? pieza(mesaId) : null;
    mesas.sentando = null;
    if (antes === (destino ? destino.id : null)) {
      pintarMesas();
      return;
    }
    i.mesa = destino ? destino.id : null;
    if (destino) mesas.seleccion = destino.id;
    pintarMesas();
    pintarTabla();
    try {
      await D.asignarMesa([i.id], i.mesa);
    } catch (err) {
      i.mesa = antes;
      pintarMesas();
      pintarTabla();
      aviso(err.message, { error: true });
      return;
    }
    const x = destino ? ocupacion()[destino.id] : null;
    const exceso = x ? x.confirmados + x.pendientes - destino.puestos : 0;
    const texto = destino
      ? `${i.nombre} quedó en la mesa ${destino.numero}${exceso > 0 ? `, que ahora se pasa por ${cuantas(exceso, 'puesto', 'puestos')}` : ''}.`
      : `${i.nombre} quedó sin mesa.`;
    aviso(texto, { accion: 'Deshacer', alHacer: () => sentar(i.id, antes) });
  }

  function armar(id) {
    mesas.sentando = mesas.sentando === id ? null : id;
    pintarMesas();
    if (!mesas.sentando) return;
    // En el teléfono el plano queda arriba de la lista: se trae a la vista.
    const r = marcoPlano.getBoundingClientRect();
    if (r.top < 60 || r.top > innerHeight * 0.6) $('[data-sentando]', vistaMesas).scrollIntoView({ block: 'start', behavior: 'smooth' });
  }

  function cancelarSentar() {
    if (!mesas.sentando) return;
    const id = mesas.sentando;
    mesas.sentando = null;
    pintarMesas();
    const b = $(`[data-familia="${CSS.escape(id)}"]`, listaFamilias);
    if (b) b.focus();
  }

  function tocarPieza(id) {
    const p = pieza(id);
    if (!p) return;
    if (mesas.sentando) {
      if (S.esMesa(p)) sentar(mesas.sentando, p.id);
      else aviso('Elige una mesa: los espacios no tienen puestos.', { error: true });
      return;
    }
    mesas.seleccion = id;
    pintarMesas();
  }

  // ---------- Mesas: el plano con el ratón, el dedo y el teclado ----------

  function puntoPlano(e) {
    const svg = $('svg', marcoPlano);
    const m = svg && svg.getScreenCTM();
    if (!m) return { x: 0, y: 0 };
    const q = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse());
    return { x: q.x, y: q.y };
  }

  const redondear = (n, salto = 10) => Math.round(n / salto) * salto;

  marcoPlano.addEventListener('pointerdown', (e) => {
    if (e.button !== 0 || mesas.arrastre) return;
    const g = e.target.closest('[data-pieza]');
    const p = g && pieza(g.dataset.pieza);
    if (!p) return;
    e.preventDefault();
    g.focus({ preventScroll: true });
    mesas.arrastre = {
      id: p.id,
      tipo: e.target.closest('[data-tirador]') ? 'tamano' : 'mover',
      inicio: puntoPlano(e),
      pantalla: { x: e.clientX, y: e.clientY },
      desde: { x: p.x, y: p.y, ancho: p.ancho, alto: p.alto },
      movido: false,
      puntero: e.pointerId,
    };
    marcoPlano.setPointerCapture(e.pointerId);
  });

  marcoPlano.addEventListener('pointermove', (e) => {
    const a = mesas.arrastre;
    if (!a || e.pointerId !== a.puntero) return;
    if (!a.movido && Math.hypot(e.clientX - a.pantalla.x, e.clientY - a.pantalla.y) < 5) return;
    const p = pieza(a.id);
    if (!p) return;
    a.movido = true;
    marcoPlano.classList.add('arrastrando');
    const q = puntoPlano(e);
    const dx = q.x - a.inicio.x;
    const dy = q.y - a.inicio.y;
    if (a.tipo === 'tamano') {
      // La esquina de arriba a la izquierda queda quieta.
      p.ancho = Math.min(S.ANCHO, Math.max(60, redondear(a.desde.ancho + dx, 20)));
      p.alto = Math.min(S.ALTO, Math.max(60, redondear(a.desde.alto + dy, 20)));
      p.x = a.desde.x + (p.ancho - a.desde.ancho) / 2;
      p.y = a.desde.y + (p.alto - a.desde.alto) / 2;
    } else {
      p.x = redondear(a.desde.x + dx);
      p.y = redondear(a.desde.y + dy);
    }
    S.encajar(p);
    if (mesas.cuadro) return;
    mesas.cuadro = requestAnimationFrame(() => {
      mesas.cuadro = 0;
      const g = $(`[data-pieza="${a.id}"]`, marcoPlano);
      if (a.tipo === 'mover' && g) g.setAttribute('transform', `translate(${p.x} ${p.y})`);
      else pintarPlano();
    });
  });

  function soltarPieza(e) {
    const a = mesas.arrastre;
    if (!a || e.pointerId !== a.puntero) return;
    mesas.arrastre = null;
    marcoPlano.classList.remove('arrastrando');
    if (marcoPlano.hasPointerCapture(e.pointerId)) marcoPlano.releasePointerCapture(e.pointerId);
    if (a.movido) {
      mesas.ignorarClic = true;
      setTimeout(() => { mesas.ignorarClic = false; });
      if (!mesas.sentando) mesas.seleccion = a.id;
      cambioPlano();
      pintarMesas();
      return;
    }
    if (e.type === 'pointerup') tocarPieza(a.id);
  }
  marcoPlano.addEventListener('pointerup', soltarPieza);
  marcoPlano.addEventListener('pointercancel', soltarPieza);

  marcoPlano.addEventListener('keydown', (e) => {
    const g = e.target.closest('[data-pieza]');
    const p = g && pieza(g.dataset.pieza);
    if (!p) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      tocarPieza(p.id);
      return;
    }
    if (e.key === 'Delete' || e.key === 'Backspace') {
      e.preventDefault();
      const siguiente = g.nextElementSibling && g.nextElementSibling.dataset.pieza;
      quitarPieza(p.id);
      const el = (siguiente && $(`[data-pieza="${CSS.escape(siguiente)}"]`, marcoPlano)) || $('[data-pieza]', marcoPlano) || $('[data-nueva="redonda"]', vistaMesas);
      el.focus({ preventScroll: true });
      return;
    }
    const salto = e.shiftKey ? 50 : 10;
    const mov = { ArrowLeft: [-salto, 0], ArrowRight: [salto, 0], ArrowUp: [0, -salto], ArrowDown: [0, salto] }[e.key];
    if (!mov) return;
    e.preventDefault();
    p.x += mov[0];
    p.y += mov[1];
    S.encajar(p);
    if (!mesas.sentando) mesas.seleccion = p.id;
    cambioPlano();
    pintarMesas();
  });

  // Una familia de «Por sentar» se puede llevar con el ratón hasta su mesa.
  listaFamilias.addEventListener('pointerdown', (e) => {
    if (e.pointerType !== 'mouse' || e.button !== 0) return;
    const b = e.target.closest('[data-familia]');
    if (!b) return;
    e.preventDefault();
    mesas.familia = { id: b.dataset.familia, x: e.clientX, y: e.clientY, fantasma: null, destino: null };
  });

  document.addEventListener('pointermove', (e) => {
    const f = mesas.familia;
    if (!f) return;
    if (!f.fantasma) {
      if (Math.hypot(e.clientX - f.x, e.clientY - f.y) < 6) return;
      const i = estado.lista.find((x) => x.id === f.id);
      f.fantasma = Object.assign(document.createElement('div'), { className: 'familia-fantasma', textContent: i ? i.nombre : '' });
      document.body.appendChild(f.fantasma);
      document.body.classList.add('llevando-familia');
    }
    f.fantasma.style.transform = `translate(${e.clientX + 14}px, ${e.clientY + 12}px)`;
    const debajo = document.elementFromPoint(e.clientX, e.clientY);
    const g = debajo && debajo.closest('[data-pieza]');
    const destino = g && S.esMesa(pieza(g.dataset.pieza)) ? g.dataset.pieza : null;
    if (destino === f.destino) return;
    f.destino = destino;
    $$('.destino', marcoPlano).forEach((x) => x.classList.remove('destino'));
    if (g && destino) g.classList.add('destino');
  });

  document.addEventListener('pointerup', () => {
    const f = mesas.familia;
    if (!f) return;
    mesas.familia = null;
    if (!f.fantasma) return; // fue un clic: lo atiende el botón
    f.fantasma.remove();
    document.body.classList.remove('llevando-familia');
    mesas.ignorarClic = true;
    setTimeout(() => { mesas.ignorarClic = false; });
    if (f.destino) sentar(f.id, f.destino);
    else pintarPlano();
  });

  // ---------- Mesas: botones y campos ----------

  vistaMesas.addEventListener('click', (e) => {
    if (mesas.ignorarClic) return;
    const b = e.target.closest('button');
    if (!b) {
      // Tocar el piso del salón suelta la mesa elegida.
      if (e.target.closest('[data-plano]') && !e.target.closest('[data-pieza], .plano-vacio') && mesas.seleccion && !mesas.sentando) {
        mesas.seleccion = null;
        pintarMesas();
      }
      return;
    }
    // Con teclado (detail 0) el foco sigue a la tarea: lo que se pinta de nuevo no lo pierde.
    const teclado = e.detail === 0;
    const enfocar = (selector, raiz, i) => {
      const todos = $$(selector, raiz);
      const el = todos[Math.min(i, todos.length - 1)];
      if (el) el.focus();
    };
    if (b.matches('[data-nueva]')) agregarPieza(b.dataset.nueva);
    else if (b.matches('[data-ejemplo-salon]')) salonDeEjemplo();
    else if (b.matches('[data-reintentar-plano]')) cargarPlano().then(() => pintarMesas());
    else if (b.matches('[data-familia]')) {
      const elegida = pieza(mesas.seleccion);
      const i = $$('[data-familia]', listaFamilias).indexOf(b);
      if (S.esMesa(elegida) && !mesas.sentando) {
        sentar(b.dataset.familia, elegida.id);
        if (teclado) enfocar('[data-familia]', listaFamilias, i);
      } else {
        armar(b.dataset.familia);
        if (teclado) enfocar(mesas.sentando ? '.es-mesa' : '[data-familia]', mesas.sentando ? marcoPlano : listaFamilias, mesas.sentando ? 0 : i);
      }
    } else if (b.matches('[data-cancelar-sentar]')) cancelarSentar();
    else if (b.matches('[data-quitar-pieza]')) {
      quitarPieza(mesas.seleccion);
      $('[data-nueva="redonda"]', vistaMesas).focus();
    } else if (b.matches('[data-cambiar-mesa]')) {
      armar(b.closest('[data-sentado]').dataset.sentado);
      if (teclado) enfocar('.es-mesa', marcoPlano, 0);
    } else if (b.matches('[data-sacar]')) {
      const i = $$('[data-sacar]', inspector).indexOf(b);
      sentar(b.closest('[data-sentado]').dataset.sentado, null);
      if (!$('[data-sacar]', inspector)) $('[data-titulo-pieza]', inspector).setAttribute('tabindex', '-1');
      enfocar('[data-sacar], [data-titulo-pieza]', inspector, i);
    } else if (b.matches('[data-paso-menos], [data-paso-mas]')) {
      const input = $('input', b.closest('[data-paso]'));
      const salto = Number(input.step) || 1;
      const v = (Number(input.value) || 0) + (b.matches('[data-paso-mas]') ? salto : -salto);
      input.value = Math.min(Number(input.max), Math.max(Number(input.min), v));
      input.dispatchEvent(new Event('change', { bubbles: true }));
    }
  });

  inspector.addEventListener('input', (e) => {
    const t = e.target;
    const p = pieza(mesas.seleccion);
    if (!p || t.dataset.pz !== 'nombre') return;
    p.nombre = t.value.trim().slice(0, 40) || null;
    cambioPlano();
    pintarMesas({ inspector: false });
  });

  inspector.addEventListener('change', (e) => {
    const t = e.target;
    const p = pieza(mesas.seleccion);
    if (!p) return;
    if (t.name === 'pz-forma' || t.name === 'pz-giro') {
      if (t.name === 'pz-forma') {
        p.forma = t.value;
        if (p.forma === 'larga') p.giro = p.giro || 0;
        else delete p.giro;
      } else {
        p.giro = Number(t.value) === 90 ? 90 : 0;
      }
      S.encajar(p);
      cambioPlano();
      pintarMesas();
      const igual = $(`input[name="${t.name}"][value="${t.value}"]`, inspector);
      if (igual) igual.focus();
      return;
    }
    const campo = t.dataset.pz;
    if (!['numero', 'puestos', 'ancho', 'alto'].includes(campo)) return;
    const salto = Number(t.step) || 1;
    const v = redondear(Number(t.value), salto);
    p[campo] = Number.isFinite(v) && t.value !== '' ? Math.min(Number(t.max), Math.max(Number(t.min), v)) : p[campo];
    t.value = p[campo];
    S.encajar(p);
    sincronizarPasosMesa();
    cambioPlano();
    pintarMesas({ inspector: false });
  });

  $('[data-mostrar-mesas]', vistaMesas).addEventListener('change', async (e) => {
    mesas.plan.mostrar = e.target.checked;
    pintarPublicar();
    if (await guardarPlano()) {
      aviso(mesas.plan.mostrar ? 'Listo: los invitados que confirmaron ya ven su mesa.' : 'Las mesas ya no se ven en las invitaciones.');
    }
  });

  $('[data-buscar-familia]', vistaMesas).addEventListener('input', (e) => {
    mesas.busqueda = e.target.value;
    pintarFamilias();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape' || vistaMesas.hidden || dlg.open || dlgImp.open) return;
    if (mesas.sentando) cancelarSentar();
    else if (mesas.seleccion && marcoPlano.contains(document.activeElement)) {
      mesas.seleccion = null;
      pintarMesas();
    }
  });

  // ---------- Vistas: invitados, mesas y la boda ----------

  const VISTAS = ['invitados', 'mesas', 'tareas', 'presupuesto', 'proveedores', 'boda'];

  function mostrarVista(nombre) {
    const vista = VISTAS.includes(nombre) ? nombre : 'invitados';
    const panelVista = $(`[data-vista-panel="${vista}"]`);
    if (panelVista.hidden) window.scrollTo(0, 0);
    $$('[data-vista-panel]').forEach((el) => { el.hidden = el.dataset.vistaPanel !== vista; });
    $$('[data-vista]').forEach((a) => {
      if (a.dataset.vista === vista) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });
    // En pantallas angostas las pestañas se deslizan: la elegida queda a la vista.
    const nav = $('.vistas');
    const activa = $(`[data-vista="${vista}"]`, nav);
    if (nav.scrollWidth > nav.clientWidth) {
      nav.scrollLeft += activa.getBoundingClientRect().left - nav.getBoundingClientRect().left - (nav.clientWidth - activa.offsetWidth) / 2;
    }
    if (vista === 'boda') abrirBoda();
    if (vista === 'mesas') pintarMesas();
    window.Planeacion.mostrar(vista);
  }

  addEventListener('hashchange', () => {
    if (!$('#panel').hidden) mostrarVista(location.hash.slice(1));
  });

  // ---------- Eventos ----------

  document.addEventListener('click', async (e) => {
    const t = e.target.closest('button, a');
    if (!t) return;
    if (t.matches('[data-agregar]')) abrirInvitado();
    else if (t.matches('[data-importar]')) abrirImportar();
    else if (t.matches('[data-exportar]')) {
      if (estado.lista.length) exportar();
      else aviso('No hay invitados para exportar todavía.');
    } else if (t.matches('[data-ejemplos]')) cargarEjemplos().catch((err) => aviso(err.message, { error: true }));
    else if (t.matches('[data-limpiar]')) {
      estado.filtro = 'todos';
      estado.lado = '';
      estado.busqueda = '';
      $('[data-buscar]').value = '';
      $('[data-lado]').value = '';
      pintarFiltros();
      pintarTabla();
    } else if (t.matches('[data-filtro]')) {
      estado.filtro = t.dataset.filtro;
      pintarFiltros();
      pintarTabla();
    } else if (t.matches('[data-orden]')) {
      const c = t.dataset.orden;
      estado.orden = { campo: c, dir: estado.orden.campo === c ? -estado.orden.dir : 1 };
      pintarTabla();
      const nuevo = $(`[data-orden="${c}"]`);
      if (nuevo) nuevo.focus();
    } else if (t.matches('[data-salir]')) {
      await D.salir();
      estado.lista = [];
      mostrarEntrada();
    } else if (t.dataset.accion) {
      const id = t.closest('tr').dataset.id;
      const inv = estado.lista.find((x) => x.id === id);
      if (!inv) return;
      if (t.dataset.accion === 'copiar') {
        const ok = await copiar(D.enlace(inv.codigo));
        aviso(ok ? `Enlace de ${inv.nombre} copiado.` : 'No se pudo copiar el enlace.', { error: !ok });
      } else if (t.dataset.accion === 'editar') {
        abrirInvitado(inv);
      } else if (t.dataset.accion === 'eliminar') {
        try {
          await D.eliminar(inv.id);
          await recargar();
          aviso(`Sobre N.º ${P.numeroSobre(inv.numero)} eliminado.`, {
            accion: 'Deshacer',
            alHacer: async () => {
              try {
                await D.restaurar(inv);
                estado.recien = inv.id;
                await recargar();
              } catch (err) {
                aviso(err.message, { error: true });
              }
            },
          });
        } catch (err) {
          aviso(err.message, { error: true });
        }
      }
    }
  });

  let temporizador;
  $('[data-buscar]').addEventListener('input', (e) => {
    clearTimeout(temporizador);
    temporizador = setTimeout(() => {
      estado.busqueda = e.target.value;
      pintarTabla();
    }, 120);
  });

  $('[data-lado]').addEventListener('change', (e) => {
    estado.lado = e.target.value;
    pintarTabla();
  });

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && !$('#panel').hidden && !dlg.open && !dlgImp.open && !mesas.arrastre && !mesas.familia) recargar({ silencioso: true });
  });

  // ---------- Arranque ----------

  window.Planeacion.iniciar({ aviso, iconos, cifra, hace, telefonoWa, telefonoBonito, invitados: () => estado.lista });

  (async function arrancar() {
    iconos();
    let sesion = null;
    try {
      sesion = await D.sesion();
    } catch {
      sesion = null;
    }
    if (sesion) await mostrarPanel();
    else mostrarEntrada();
  })();
})();
