/*
 * La cuenta de Google del panel y las tareas en Google Calendar (pedidos de
 * Mario, 2026-11-05 y 2026-11-06).
 *
 * Se entra al panel con Google y esa misma cuenta queda conectada al
 * calendario: no hay que conectarlo aparte en Tareas. En modo local la
 * ventana de Google la abre este archivo (Google Identity Services); con
 * Supabase, el inicio de sesión es el de Supabase con Google (datos.js) y
 * aquí llega el permiso que Google le dio (recibir).
 *
 * La app crea su propio calendario en esa cuenta («Boda de Diego y Erika») y
 * pone allí cada tarea con fecha como un evento: de todo el día, o de una hora
 * si la tarea la tiene. Cada vez que se sincroniza, crea los eventos nuevos,
 * cambia los que cambiaron, borra los de las tareas quitadas o sin fecha, y
 * marca con ✓ los de las tareas hechas. Va en un solo sentido: lo que se
 * cambie en Google Calendar no vuelve al panel.
 *
 * Permisos: el perfil básico (correo y nombre, para saber quién entró) y
 * «calendar.app.created», que deja a la app manejar los calendarios que ella
 * misma creó y nada más del Google Calendar de la persona. El permiso vence
 * en una hora y se guarda solo en esa pestaña del navegador (sessionStorage):
 * sobrevive a recargar la página y se borra al cerrarla o al salir. Renovarlo
 * es un toque: si ya se dio, la ventana de Google se cierra sola.
 *
 * El ID de cliente de OAuth va en config.js (google.clientId); es público por
 * diseño, y su protección es la lista de direcciones autorizadas en Google
 * Cloud (ver README). El secreto del cliente nunca va aquí.
 */
(function () {
  const C = window.BODA || {};
  const conf = C.google || C.googleCalendar || {};
  const ALCANCE = 'https://www.googleapis.com/auth/calendar.app.created';
  const PERFIL = 'openid email profile';
  const API = 'https://www.googleapis.com/calendar/v3';
  const ZONA = 'America/Bogota';
  const GUARDADO = 'boda-diego-erika:google';
  const pareja = C.pareja ? `${C.pareja.uno.nombre} y ${C.pareja.dos.nombre}` : 'la pareja';
  const NOMBRE = `Boda de ${pareja}`;

  // { correo, nombre, valor, vence }: la cuenta y, si hay, el permiso del
  // calendario (valor) con su vencimiento.
  let estado = leer();
  let cargaGis = null;

  function leer() {
    try {
      const g = JSON.parse(sessionStorage.getItem(GUARDADO));
      return g && typeof g === 'object' ? g : {};
    } catch {
      return {};
    }
  }

  function guardar(cambios) {
    estado = Object.assign({}, estado, cambios);
    try {
      sessionStorage.setItem(GUARDADO, JSON.stringify(estado));
    } catch { /* sin almacenamiento: dura lo que la página */ }
  }

  const configurado = () => /^[\w-]+\.apps\.googleusercontent\.com$/.test(String(conf.clientId || ''));
  const conectado = () => Boolean(estado.valor && estado.vence > Date.now() + 30000);
  // Hubo permiso en esta pestaña y ya venció: se renueva con un toque.
  const vencido = () => Boolean(estado.valor) && !conectado();
  const cuenta = () => (estado.correo ? { correo: estado.correo, nombre: estado.nombre || '' } : null);
  const mismo = (a, b) => String(a || '').toLowerCase() === String(b || '').toLowerCase();

  function cargarGis() {
    if (window.google && google.accounts && google.accounts.oauth2) return Promise.resolve();
    if (!cargaGis) {
      cargaGis = new Promise((listo, falla) => {
        const s = document.createElement('script');
        s.src = 'https://accounts.google.com/gsi/client';
        s.async = true;
        s.onload = () => listo();
        s.onerror = () => {
          cargaGis = null;
          falla(new Error('No se pudo cargar el inicio de sesión de Google. Revisa la conexión.'));
        };
        document.head.appendChild(s);
      });
    }
    return cargaGis;
  }

  // La ventana de Google. Tiene que abrirse desde un toque (los navegadores
  // bloquean la ventana si no): por eso el panel carga antes el script de
  // Google con precargar(). elegir: muestra la lista de cuentas (al entrar);
  // sin él, Google usa la cuenta sugerida y, si ya dio el permiso, se cierra
  // sola.
  async function ventana({ elegir = false } = {}) {
    if (!configurado()) throw new Error('Falta el ID de cliente de Google en assets/config.js (google.clientId).');
    await cargarGis();
    return new Promise((listo, falla) => {
      const cliente = google.accounts.oauth2.initTokenClient({
        client_id: conf.clientId,
        scope: `${PERFIL} ${ALCANCE}`,
        include_granted_scopes: true,
        prompt: elegir ? 'select_account' : '',
        login_hint: !elegir && estado.correo ? estado.correo : undefined,
        callback: (r) => {
          if (r.error) {
            falla(new Error(r.error === 'access_denied' ? 'No se dio el permiso en Google.' : `Google no dio el permiso (${r.error}).`));
            return;
          }
          listo(r);
        },
        error_callback: (e) => falla(new Error(e && e.type === 'popup_closed' ? 'Se cerró la ventana de Google antes de terminar.' : 'No se pudo abrir la ventana de Google. Revisa que el navegador no la bloquee.')),
      });
      cliente.requestAccessToken();
    });
  }

  // Quién es la cuenta del permiso: correo y nombre.
  async function perfil(valor) {
    const r = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', { headers: { Authorization: `Bearer ${valor}` } });
    if (!r.ok) throw new Error('Google no dijo con qué cuenta se entró. Inténtalo de nuevo.');
    const p = await r.json();
    if (!p.email) throw new Error('Esa cuenta de Google no tiene correo.');
    return { correo: p.email, nombre: p.name || p.given_name || '' };
  }

  const permisoDe = (r) => (google.accounts.oauth2.hasGrantedAllScopes(r, ALCANCE)
    ? { valor: r.access_token, vence: Date.now() + (Number(r.expires_in) || 3600) * 1000 }
    : { valor: null, vence: 0 });

  /*
   * Entrar al panel con Google (modo local): elige la cuenta, da el permiso
   * del calendario y devuelve { correo, nombre, calendario }. Si en la ventana
   * se quitó el permiso del calendario, se entra igual, sin calendario.
   */
  async function entrar() {
    const r = await ventana({ elegir: true });
    const p = await perfil(r.access_token);
    estado = {};
    guardar(Object.assign(p, permisoDe(r)));
    return Object.assign(cuenta(), { calendario: conectado() });
  }

  // Conectar (o renovar) el permiso del calendario, con la cuenta de la sesión.
  async function conectar() {
    const r = await ventana();
    if (!google.accounts.oauth2.hasGrantedAllScopes(r, ALCANCE)) {
      throw new Error('Hace falta permitir que la app maneje su calendario: en la ventana de Google, deja marcado el permiso de Google Calendar.');
    }
    const p = await perfil(r.access_token);
    guardar(Object.assign(p, permisoDe(r)));
  }

  /*
   * Con Supabase: la sesión del panel ya está. «valor» es el permiso que Google
   * le dio a Supabase al entrar (solo llega justo al volver de Google); sin él,
   * se recuerda la cuenta para sugerirla al renovar.
   */
  async function recibir(valor, correo, nombre = '') {
    if (!valor) {
      if (!estado.correo && correo) guardar({ correo, nombre });
      return;
    }
    let vence = Date.now() + 3500 * 1000;
    let conCalendario = true;
    try {
      const r = await fetch(`https://oauth2.googleapis.com/tokeninfo?access_token=${encodeURIComponent(valor)}`);
      if (r.ok) {
        const t = await r.json();
        if (Number(t.expires_in)) vence = Date.now() + Number(t.expires_in) * 1000;
        conCalendario = String(t.scope || '').split(' ').includes(ALCANCE);
      }
    } catch { /* sin la consulta, se supone la hora de siempre */ }
    estado = {};
    guardar({ correo, nombre, valor: conCalendario ? valor : null, vence: conCalendario ? vence : 0 });
  }

  // Quitar el permiso del calendario (la cuenta sigue en la sesión).
  function desconectar() {
    if (estado.valor && window.google && google.accounts) google.accounts.oauth2.revoke(estado.valor, () => {});
    guardar({ valor: null, vence: 0 });
  }

  // Al salir del panel: se olvidan la cuenta y el permiso de esta pestaña.
  function olvidar() {
    estado = {};
    try { sessionStorage.removeItem(GUARDADO); } catch { /* nada que borrar */ }
  }

  const precargar = () => (configurado() ? cargarGis().catch(() => {}) : Promise.resolve());

  function sinPermiso() {
    if (estado.valor) guardar({ vence: 0 });
    return Object.assign(new Error('El permiso de Google Calendar venció (dura una hora): toca «Renovar el permiso» para seguir.'), { estado: 401, sinPermiso: true });
  }

  // El calendario de las tareas es de otra cuenta: devuelve ese correo.
  function otraCuenta(datos) {
    const de = datos && datos.calendario && datos.calendario.cuenta;
    return de && estado.correo && !mismo(de, estado.correo) ? de : null;
  }

  // Una llamada a la API, con el permiso que haya. Si venció, avisa: renovarlo
  // necesita un toque.
  async function api(metodo, ruta, cuerpo) {
    if (!conectado()) throw sinPermiso();
    const r = await fetch(API + ruta, {
      method: metodo,
      headers: Object.assign({ Authorization: `Bearer ${estado.valor}` }, cuerpo ? { 'Content-Type': 'application/json' } : {}),
      body: cuerpo ? JSON.stringify(cuerpo) : undefined,
    });
    if (r.status === 401) throw sinPermiso();
    if (r.status === 204) return null;
    const datos = await r.json().catch(() => null);
    if (!r.ok) {
      const e = new Error((datos && datos.error && datos.error.message) || `Google Calendar respondió ${r.status}.`);
      e.estado = r.status;
      throw e;
    }
    return datos;
  }

  // ---------- Las tareas como eventos ----------

  const masUnDia = (iso) => {
    const d = new Date(`${iso}T12:00:00Z`);
    d.setUTCDate(d.getUTCDate() + 1);
    return d.toISOString().slice(0, 10);
  };

  function masUnaHora(hhmm) {
    const [h, m] = hhmm.split(':').map(Number);
    const fin = Math.min(h * 60 + m + 60, 23 * 60 + 59);
    return `${String(Math.floor(fin / 60)).padStart(2, '0')}:${String(fin % 60).padStart(2, '0')}`;
  }

  // Lo que se manda a Google por cada tarea. La firma dice si cambió desde la
  // última vez.
  function evento(t, enlacePanel) {
    const nota = [t.nota, 'Tarea del organizador de la boda.', enlacePanel ? `Panel: ${enlacePanel}` : ''].filter(Boolean).join('\n\n');
    const cuando = t.hora
      ? { start: { dateTime: `${t.fecha}T${t.hora}:00`, timeZone: ZONA }, end: { dateTime: `${t.fecha}T${masUnaHora(t.hora)}:00`, timeZone: ZONA } }
      : { start: { date: t.fecha }, end: { date: masUnDia(t.fecha) } };
    return Object.assign({
      summary: (t.hecha ? '✓ ' : '') + t.titulo,
      description: nota,
      // Hecha, en gris; por hacer, el color del calendario.
      colorId: t.hecha ? '8' : undefined,
      transparency: 'transparent',
      // Un aviso: el día antes a las 9 de la mañana, o una hora antes.
      reminders: { useDefault: false, overrides: t.hecha ? [] : [{ method: 'popup', minutes: t.hora ? 60 : 15 * 60 }] },
      extendedProperties: { private: { tarea: t.id } },
    }, cuando);
  }

  const firma = (t) => JSON.stringify([t.titulo, t.fecha, t.hora, t.nota, t.hecha]);
  const pendiente = (t) => (t.fecha ? !t.gcal || t.gcal.firma !== firma(t) : Boolean(t.gcal));

  // Cuántas tareas faltan por pasar a Google (o por quitar de allá).
  function porSincronizar(datos) {
    return datos.lista.filter(pendiente).length + datos.borrados.length;
  }

  // El calendario de la app: el guardado si sigue existiendo en esta cuenta; si
  // no, uno nuevo. Guarda de qué cuenta es, para no duplicarlo en otra.
  async function calendario(datos) {
    if (datos.calendario) {
      try {
        await api('GET', `/calendars/${encodeURIComponent(datos.calendario.id)}`);
        return { cal: Object.assign({}, datos.calendario, { cuenta: datos.calendario.cuenta || estado.correo || null }), nuevo: false };
      } catch (e) {
        if (e.estado !== 404 && e.estado !== 403) throw e;
      }
    }
    const c = await api('POST', '/calendars', { summary: NOMBRE, description: 'Las tareas del organizador de la boda. Lo pone y lo cambia el panel: lo que se edite aquí no vuelve al panel.', timeZone: ZONA });
    return { cal: { id: c.id, nombre: c.summary, cuenta: estado.correo || null }, nuevo: true };
  }

  /*
   * Pasa las tareas a Google Calendar. Cambia «datos» (ids de los eventos, el
   * calendario, los borrados) y devuelve lo que hizo: { creados, cambiados,
   * borrados, fallas, nuevo }. Quien la llama guarda «datos» después.
   * Si el calendario es de otra cuenta no hace nada, salvo con «mover»: crea
   * uno nuevo en esta cuenta y pasa allí todas las tareas.
   */
  async function sincronizar(datos, { enlacePanel, mover = false } = {}) {
    const otra = otraCuenta(datos);
    if (otra && !mover) throw new Error(`Las tareas van al calendario de ${otra}; esta pestaña está conectada con ${estado.correo}.`);
    if (otra) datos.calendario = null;
    const { cal, nuevo } = await calendario(datos);
    datos.calendario = cal;
    // En un calendario nuevo los eventos viejos no existen: se crean de nuevo.
    if (nuevo) {
      datos.lista.forEach((t) => { t.gcal = null; });
      datos.borrados = [];
    }
    const base = `/calendars/${encodeURIComponent(cal.id)}/events`;
    const r = { creados: 0, cambiados: 0, borrados: 0, fallas: 0, nuevo };

    for (const id of datos.borrados.slice()) {
      try {
        await api('DELETE', `${base}/${encodeURIComponent(id)}`);
        r.borrados += 1;
      } catch (e) {
        if (e.estado !== 404 && e.estado !== 410) { r.fallas += 1; continue; }
      }
      datos.borrados = datos.borrados.filter((x) => x !== id);
    }

    for (const t of datos.lista.filter(pendiente)) {
      try {
        if (!t.fecha) {
          await api('DELETE', `${base}/${encodeURIComponent(t.gcal.id)}`).catch((e) => { if (e.estado !== 404 && e.estado !== 410) throw e; });
          t.gcal = null;
          r.borrados += 1;
          continue;
        }
        const ev = evento(t, enlacePanel);
        let hecho = null;
        if (t.gcal) {
          try {
            hecho = await api('PUT', `${base}/${encodeURIComponent(t.gcal.id)}`, ev);
            r.cambiados += 1;
          } catch (e) {
            if (e.estado !== 404 && e.estado !== 410) throw e;
          }
        }
        if (!hecho) {
          hecho = await api('POST', base, ev);
          r.creados += 1;
        }
        t.gcal = { id: hecho.id, firma: firma(t) };
      } catch (e) {
        r.fallas += 1;
        if (e.estado === 401 || e.estado === 403) throw e;
      }
    }
    return r;
  }

  // Abre el calendario en Google Calendar (en la cuenta de quien lo tiene).
  const enlace = (datos) => (datos && datos.calendario ? `https://calendar.google.com/calendar/r?cid=${encodeURIComponent(datos.calendario.id)}` : 'https://calendar.google.com/calendar/r');

  window.CalendarioGoogle = {
    configurado, conectado, vencido, cuenta, precargar, entrar, conectar, recibir, desconectar, olvidar,
    otraCuenta, sincronizar, porSincronizar, pendienteTarea: pendiente, enlace, NOMBRE, ALCANCE,
  };
})();
