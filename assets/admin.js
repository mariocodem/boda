/*
 * Panel de administración: el libro de sobres y los datos de la boda (con su
 * estilo y sus fotos).
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
      estado.lista = await D.listar();
      pintar();
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
    const meta = [
      i.telefono ? `<span>${esc(telefonoBonito(i.telefono))}</span>` : '',
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

  function pintar() {
    pintarCifras();
    pintarFiltros();
    pintarTabla();
    pintarCorreo();
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
    const campos = ['N.º', 'Nombre', 'Cupos', 'De', 'WhatsApp', 'Respuesta', 'Asistentes', 'Mensaje', 'Notas', 'Abierta', 'Respondió', 'Enlace'];
    const txt = { pendiente: 'Pendiente', confirmado: 'Confirmado', declinado: 'No asiste' };
    const celda = (v) => `"${String(v == null ? '' : v).replace(/"/g, '""')}"`;
    const fecha = (iso) => (iso ? new Date(iso).toLocaleString('es-CO') : '');
    const filas = estado.lista.map((i) => [
      P.numeroSobre(i.numero), i.nombre, i.cupos, LADOS[i.lado] || 'Ambos', i.telefono, txt[i.estado],
      i.estado === 'confirmado' ? i.asistentes : 0, i.mensaje, i.notas, fecha(i.abiertoEn), fecha(i.respondidoEn), D.enlace(i.codigo),
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
      { nombre: 'Tíos Triana Pardo', cupos: 2, telefono: '3109876543', lado: 'diego', notas: 'Ejemplo', estado: 'confirmado', asistentes: 2, mensaje: 'Felicitaciones, mijo. Ahí estaremos.', abiertoEn: dias(3), respondidoEn: dias(2) },
      { nombre: 'Familia Ramos Ortiz', cupos: 5, lado: 'erika', notas: 'Ejemplo', estado: 'confirmado', asistentes: 3, abiertoEn: dias(2), respondidoEn: dias(1) },
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
      fotoPortada: boda.fotos.portada && boda.fotos.portada.url
        ? { url: boda.fotos.portada.url, forma: boda.fotos.portada.forma, encuadre: boda.fotos.portada.encuadre }
        : null,
      fotos: boda.fotos.galeria.filter((x) => x.url).map((x) => ({ url: x.url, forma: x.forma })),
      estilo: estiloElegido(),
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
    const e = Estilos.normalizar(ev.estilo);
    $(`input[name="paleta"][value="${e.paleta}"]`, formBoda).checked = true;
    $(`input[name="letra"][value="${e.letra}"]`, formBoda).checked = true;
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
    $('[data-paletas]', formBoda).innerHTML = Object.entries(Estilos.PALETAS).map(([clave, p]) => `<label class="paleta">
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
    return Estilos.normalizar({ paleta: f.paleta.value, letra: f.letra.value });
  }

  // Cada opción se pinta con su paleta (o su letra) y lo demás elegido.
  function pintarEstilo() {
    const e = estiloElegido();
    $$('[data-paleta-muestra]', formBoda).forEach((el) => Estilos.aplicar({ paleta: el.dataset.paletaMuestra, letra: e.letra }, el));
    $$('[data-letra-muestra]', formBoda).forEach((el) => Estilos.aplicar({ paleta: e.paleta, letra: el.dataset.letraMuestra }, el));
    $('[data-ver-estilo]', formBoda).href = `index.html?vista=panel&paleta=${e.paleta}&letra=${e.letra}`;
    pintarMuestra();
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
        <span class="muestra-sello sello-postal">${P.sello(Estilos.PALETAS[e.paleta].sello)}</span>
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
    const forro = await Estilos.forro(e.paleta);
    // Ruta absoluta: dentro de una variable, una ruta relativa se leería desde admin.css.
    if (estiloElegido().paleta === e.paleta) caja.style.setProperty('--forro-img', forro || `url("${new URL('assets/forro.svg', location.href).href}")`);
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
    if (t.name === 'paleta' || t.name === 'letra') pintarEstilo();
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
    if (!boda.sucio) return;
    e.preventDefault();
    e.returnValue = '';
  });

  // ---------- Vistas: invitados y la boda ----------

  function mostrarVista(nombre) {
    const vista = nombre === 'boda' ? 'boda' : 'invitados';
    const panelVista = $(`[data-vista-panel="${vista}"]`);
    if (panelVista.hidden) window.scrollTo(0, 0);
    $$('[data-vista-panel]').forEach((el) => { el.hidden = el.dataset.vistaPanel !== vista; });
    $$('[data-vista]').forEach((a) => {
      if (a.dataset.vista === vista) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });
    if (vista === 'boda') abrirBoda();
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
    if (document.visibilityState === 'visible' && !$('#panel').hidden && !dlg.open && !dlgImp.open) recargar({ silencioso: true });
  });

  // ---------- Arranque ----------

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
