/*
 * Capa de datos: invitados, datos de la boda (fecha, lugares, itinerario,
 * estilo) y sus fotos.
 *
 * Modo local: localStorage del navegador (para probar y diseñar); las fotos
 * van en IndexedDB del mismo navegador.
 * Modo Supabase: base de datos real; los invitados solo pueden leer y responder
 * su propia invitación a través de dos funciones (ver supabase/esquema.sql).
 * Las fotos van al bucket público «fotos» de Supabase Storage.
 */
(function () {
  const C = window.BODA;
  const CLAVE_LOCAL = 'boda-diego-erika:invitados';
  const CLAVE_SESION_LOCAL = 'boda-diego-erika:panel';
  const ALFABETO = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  const SUPABASE_JS = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.min.js';

  const conSupabase = Boolean(C.supabase && C.supabase.url && C.supabase.anonKey);
  let cliente = null;

  function cargarScript(src) {
    return new Promise((resolver, rechazar) => {
      const s = document.createElement('script');
      s.src = src;
      s.onload = resolver;
      s.onerror = () => rechazar(new Error('No se pudo cargar la conexión con la base de datos.'));
      document.head.appendChild(s);
    });
  }

  async function sb() {
    if (cliente) return cliente;
    if (!window.supabase) await cargarScript(SUPABASE_JS);
    cliente = window.supabase.createClient(C.supabase.url, C.supabase.anonKey);
    return cliente;
  }

  function generarCodigo() {
    const bytes = new Uint8Array(6);
    crypto.getRandomValues(bytes);
    return Array.from(bytes, (b) => ALFABETO[b % ALFABETO.length]).join('');
  }

  function limpiarCodigo(codigo) {
    return String(codigo || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 12);
  }

  function desdeFila(f) {
    return {
      id: f.id,
      numero: f.numero,
      codigo: f.codigo,
      nombre: f.nombre,
      cupos: f.cupos,
      telefono: f.telefono || '',
      lado: f.lado || 'ambos',
      notas: f.notas || '',
      estado: f.estado || 'pendiente',
      asistentes: f.asistentes || 0,
      mensaje: f.mensaje || '',
      abiertoEn: f.abierto_en || null,
      respondidoEn: f.respondido_en || null,
      creadoEn: f.creado_en || null,
    };
  }

  function aFila(i) {
    const fila = {};
    if ('nombre' in i) fila.nombre = String(i.nombre).trim();
    if ('cupos' in i) fila.cupos = Number(i.cupos);
    if ('telefono' in i) fila.telefono = i.telefono ? String(i.telefono).trim() : null;
    if ('lado' in i) fila.lado = i.lado || 'ambos';
    if ('notas' in i) fila.notas = i.notas ? String(i.notas).trim() : null;
    if ('estado' in i) fila.estado = i.estado;
    if ('asistentes' in i) fila.asistentes = Number(i.asistentes) || 0;
    if ('mensaje' in i) fila.mensaje = i.mensaje || null;
    if ('respondidoEn' in i) fila.respondido_en = i.respondidoEn;
    if ('abiertoEn' in i) fila.abierto_en = i.abiertoEn;
    return fila;
  }

  function validar(i) {
    const nombre = String(i.nombre || '').trim();
    if (!nombre) throw new Error('Escribe el nombre del invitado o de la familia.');
    if (nombre.length > 120) throw new Error('El nombre es demasiado largo (máximo 120 caracteres).');
    const cupos = Number(i.cupos);
    if (!Number.isInteger(cupos) || cupos < 1 || cupos > 20) throw new Error('Los cupos van de 1 a 20.');
    if ('asistentes' in i && i.estado === 'confirmado') {
      const a = Number(i.asistentes);
      if (!Number.isInteger(a) || a < 1 || a > cupos) throw new Error(`Los asistentes confirmados van de 1 a ${cupos}.`);
    }
  }

  function traducirError(e) {
    if (!e) return new Error('Algo salió mal.');
    const msg = String(e.message || e);
    if (/evento/.test(msg) && /42P01|PGRST205|does not exist|schema cache/i.test(`${msg} ${e.code || ''}`)) {
      return new Error('Falta la tabla de los datos de la boda en Supabase. Vuelve a ejecutar supabase/esquema.sql.');
    }
    if (/bucket not found/i.test(msg)) return new Error('Falta el espacio para las fotos en Supabase. Vuelve a ejecutar supabase/esquema.sql.');
    if (/payload too large|exceeded the maximum allowed size/i.test(msg)) return new Error('La foto es demasiado pesada para Supabase.');
    if (/mime type|invalid_mime/i.test(msg)) return new Error('Supabase no aceptó ese tipo de archivo. Sube un JPG o PNG.');
    if (/asistentes_fuera_de_cupo/.test(msg)) return new Error('Ese número supera los cupos de la invitación.');
    if (/codigo_invalido/.test(msg)) return new Error('No encontramos esta invitación.');
    if (/Invalid login credentials/i.test(msg)) return new Error('Correo o contraseña incorrectos.');
    if (/Failed to fetch|NetworkError|network/i.test(msg)) return new Error('Sin conexión. Revisa tu internet e inténtalo de nuevo.');
    if (/JWT|permission|42501/i.test(msg)) return new Error('Tu sesión no tiene permiso para esto. Vuelve a entrar.');
    return e instanceof Error ? e : new Error(msg);
  }

  // ---------- Datos de la boda: fecha, lugares, itinerario ----------

  const CLAVE_EVENTO = 'boda-diego-erika:evento';
  const HORA = /^([01]\d|2[0-3]):[0-5]\d$/;
  const DIA = /^\d{4}-\d{2}-\d{2}$/;

  function texto(v, max) {
    const s = v == null ? '' : String(v).trim();
    return s ? s.slice(0, max) : null;
  }

  function coordenada(v, limite) {
    if (v === '' || v == null) return null;
    const n = Number(v);
    return Number.isFinite(n) && Math.abs(n) <= limite ? n : null;
  }

  function hora(v) {
    return HORA.test(v || '') ? v : null;
  }

  function lugar(l) {
    const x = l || {};
    return {
      lugar: texto(x.lugar, 160),
      direccion: texto(x.direccion, 240),
      lat: coordenada(x.lat, 90),
      lng: coordenada(x.lng, 180),
      placeId: texto(x.placeId, 300),
      // Solo enlaces https: este valor termina en un href de la invitación.
      mapa: /^https:\/\/\S+$/.test(String(x.mapa || '').trim()) ? String(x.mapa).trim().slice(0, 600) : null,
    };
  }

  // Una foto se guarda por su referencia: un enlace https (Supabase Storage),
  // una ruta de la carpeta del sitio (fotos/portada.jpg) o local:<id> para las
  // que viven en IndexedDB del navegador (modo local). Nada más llega a un src.
  function refFoto(v) {
    const s = String(v || '').trim();
    if (/^https:\/\/\S+$/.test(s) && s.length <= 600) return s;
    if (/^local:[a-z0-9-]{6,48}$/i.test(s)) return s;
    if (/^[\w-]+(\/[\w.-]+)*\.(jpe?g|png|webp|avif|gif)$/i.test(s) && !s.includes('..')) return s;
    return null;
  }

  function encuadre(v) {
    const m = /^(\d{1,3}(?:\.\d+)?)% (\d{1,3}(?:\.\d+)?)%$/.exec(String(v || '').trim());
    if (!m) return '50% 30%';
    const c = (n) => Math.min(100, Math.max(0, Math.round(Number(n))));
    return `${c(m[1])}% ${c(m[2])}%`;
  }

  function foto(f, { nota } = {}) {
    const x = typeof f === 'string' ? { url: f } : (f || {});
    const url = refFoto(x.url || x.archivo);
    if (!url) return null;
    const r = { url, forma: x.forma === 'horizontal' ? 'horizontal' : 'vertical' };
    if (nota) r.nota = texto(x.nota, 40);
    return r;
  }

  function fotos(lista, max, op) {
    return (Array.isArray(lista) ? lista : []).map((f) => foto(f, op)).filter(Boolean).slice(0, max);
  }

  function normalizarEvento(e) {
    const x = e || {};
    let fecha = texto(x.fecha, 40);
    let h = hora(x.hora);
    // Compatibilidad con la fecha ISO completa: '2027-03-20T16:00:00-05:00'.
    if (fecha && fecha.includes('T')) {
      h = h || hora(fecha.slice(11, 16));
      fecha = fecha.slice(0, 10);
    }
    const r = x.recepcion || {};
    const vest = typeof x.vestimenta === 'string' ? { codigo: x.vestimenta } : (x.vestimenta || {});
    const limpio = {
      fecha: DIA.test(fecha || '') ? fecha : null,
      hora: h,
      ciudad: texto(x.ciudad, 80),
      fechaLimiteRespuesta: DIA.test(x.fechaLimiteRespuesta || '') ? x.fechaLimiteRespuesta : null,
      ceremonia: lugar(x.ceremonia),
      recepcion: Object.assign(lugar(r), { mismoLugar: Boolean(r.mismoLugar), hora: hora(r.hora) }),
      itinerario: (Array.isArray(x.itinerario) ? x.itinerario : [])
        .map((m) => ({ hora: hora(m && m.hora), titulo: texto(m && m.titulo, 80), detalle: texto(m && m.detalle, 200) }))
        .filter((m) => m.titulo)
        .slice(0, 20),
      vestimenta: { codigo: texto(vest.codigo, 60), nota: texto(vest.nota, 400), fotos: fotos(vest.fotos, 4, { nota: true }) },
      regalos: texto(x.regalos, 600),
      fotoPortada: x.fotoPortada ? Object.assign(foto(x.fotoPortada) || {}, { encuadre: encuadre(x.fotoPortada.encuadre) }) : null,
      fotos: fotos(x.fotos, 6),
      estilo: {
        paleta: /^[a-z]{2,20}$/.test((x.estilo && x.estilo.paleta) || '') ? x.estilo.paleta : 'verde',
        letra: /^[a-z]{2,20}$/.test((x.estilo && x.estilo.letra) || '') ? x.estilo.letra : 'grabada',
      },
    };
    if (limpio.fotoPortada && !limpio.fotoPortada.url) limpio.fotoPortada = null;
    return limpio;
  }

  // Lo guardado desde el panel reemplaza, campo por campo, lo de config.js.
  function mezclarEvento(guardado) {
    return normalizarEvento(guardado ? Object.assign({}, C, guardado) : C);
  }

  // ---------- Fotos ----------

  // Modo local: las fotos viven en IndexedDB de este navegador.
  let baseFotos = null;
  function abrirFotos() {
    if (!baseFotos) {
      baseFotos = new Promise((listo, falla) => {
        if (!window.indexedDB) {
          falla(new Error('Este navegador no permite guardar fotos (¿modo privado?).'));
          return;
        }
        const pedido = indexedDB.open('boda-diego-erika-fotos', 1);
        pedido.onupgradeneeded = () => pedido.result.createObjectStore('fotos');
        pedido.onsuccess = () => listo(pedido.result);
        pedido.onerror = () => falla(new Error('Este navegador no permite guardar fotos (¿modo privado?).'));
      });
    }
    return baseFotos;
  }

  async function fotosLocales(modo, fn) {
    const db = await abrirFotos();
    return new Promise((listo, falla) => {
      const tx = db.transaction('fotos', modo);
      const pedido = fn(tx.objectStore('fotos'));
      tx.oncomplete = () => listo(pedido && pedido.result);
      tx.onerror = () => falla(new Error('No se pudo guardar la foto en este navegador (puede que no quede espacio).'));
    });
  }

  function idFoto() {
    const bytes = new Uint8Array(9);
    crypto.getRandomValues(bytes);
    return Array.from(bytes, (b) => b.toString(36).padStart(2, '0')).join('');
  }

  // Enlaces de las fotos locales ya abiertas, para no repetirlos.
  const vistas = {};
  async function urlFoto(ref) {
    if (!ref || !String(ref).startsWith('local:')) return ref || null;
    if (!vistas[ref]) {
      vistas[ref] = fotosLocales('readonly', (st) => st.get(ref.slice(6)))
        .then((blob) => (blob ? URL.createObjectURL(blob) : null))
        .catch(() => null);
    }
    return vistas[ref];
  }

  // Las fotos subidas se pueden borrar; las rutas de la carpeta del sitio no.
  const BASE_STORAGE = conSupabase ? `${C.supabase.url.replace(/\/+$/, '')}/storage/v1/object/public/fotos/` : null;
  function esSubida(ref) {
    const s = String(ref || '');
    return s.startsWith('local:') || Boolean(BASE_STORAGE && s.startsWith(BASE_STORAGE));
  }

  // ---------- Modo local ----------

  function leerLocal() {
    try {
      const v = JSON.parse(localStorage.getItem(CLAVE_LOCAL));
      return Array.isArray(v) ? v : [];
    } catch {
      return [];
    }
  }

  function guardarLocal(lista) {
    try {
      localStorage.setItem(CLAVE_LOCAL, JSON.stringify(lista));
    } catch {
      throw new Error('Este navegador no permite guardar datos (¿modo privado?).');
    }
  }

  function publico(i) {
    return {
      numero: i.numero,
      nombre: i.nombre,
      cupos: i.cupos,
      estado: i.estado,
      asistentes: i.asistentes,
      mensaje: i.mensaje,
      respondidoEn: i.respondidoEn,
    };
  }

  const local = {
    async invitacion(codigo, { marcar }) {
      const lista = leerLocal();
      const i = lista.find((x) => x.codigo === codigo);
      if (!i) return null;
      if (marcar && !i.abiertoEn) {
        i.abiertoEn = new Date().toISOString();
        guardarLocal(lista);
      }
      return publico(i);
    },
    async responder(codigo, r) {
      const lista = leerLocal();
      const i = lista.find((x) => x.codigo === codigo);
      if (!i) throw new Error('No encontramos esta invitación.');
      if (r.asiste && (r.asistentes < 1 || r.asistentes > i.cupos)) throw new Error('Ese número supera los cupos de la invitación.');
      i.estado = r.asiste ? 'confirmado' : 'declinado';
      i.asistentes = r.asiste ? r.asistentes : 0;
      i.mensaje = (r.mensaje || '').trim().slice(0, 1000);
      i.respondidoEn = new Date().toISOString();
      guardarLocal(lista);
      return publico(i);
    },
    async sesion() {
      try {
        return sessionStorage.getItem(CLAVE_SESION_LOCAL) === '1' ? { correo: 'Modo local' } : null;
      } catch {
        return null;
      }
    },
    async entrar({ clave }) {
      if (clave !== C.claveLocal) throw new Error('Esa no es la clave del panel.');
      try { sessionStorage.setItem(CLAVE_SESION_LOCAL, '1'); } catch { /* sin almacenamiento: la sesión dura lo que la página */ }
      return { correo: 'Modo local' };
    },
    async salir() {
      try { sessionStorage.removeItem(CLAVE_SESION_LOCAL); } catch { /* nada que limpiar */ }
    },
    async listar() {
      return leerLocal().sort((a, b) => a.numero - b.numero);
    },
    async crearVarios(nuevos) {
      const lista = leerLocal();
      const usados = new Set(lista.map((x) => x.codigo));
      let numero = lista.reduce((m, x) => Math.max(m, x.numero), 0);
      const creados = nuevos.map((n) => {
        validar(n);
        let codigo;
        do codigo = generarCodigo(); while (usados.has(codigo));
        usados.add(codigo);
        numero += 1;
        return {
          id: crypto.randomUUID ? crypto.randomUUID() : codigo + Date.now(),
          numero,
          codigo,
          nombre: String(n.nombre).trim(),
          cupos: Number(n.cupos),
          telefono: n.telefono || '',
          lado: n.lado || 'ambos',
          notas: n.notas || '',
          estado: n.estado || 'pendiente',
          asistentes: n.estado === 'confirmado' ? Number(n.asistentes) : 0,
          mensaje: n.mensaje || '',
          abiertoEn: n.abiertoEn || null,
          respondidoEn: n.respondidoEn || (n.estado && n.estado !== 'pendiente' ? new Date().toISOString() : null),
          creadoEn: new Date().toISOString(),
        };
      });
      guardarLocal(lista.concat(creados));
      return creados;
    },
    async actualizar(id, cambios) {
      const lista = leerLocal();
      const i = lista.find((x) => x.id === id);
      if (!i) throw new Error('Ese invitado ya no existe.');
      const nuevo = Object.assign({}, i, cambios);
      validar(nuevo);
      if (nuevo.estado !== 'confirmado') nuevo.asistentes = 0;
      if (cambios.estado && cambios.estado !== i.estado) {
        nuevo.respondidoEn = cambios.estado === 'pendiente' ? null : new Date().toISOString();
      }
      Object.assign(i, nuevo);
      guardarLocal(lista);
      return i;
    },
    async eliminar(id) {
      guardarLocal(leerLocal().filter((x) => x.id !== id));
    },
    async restaurar(inv) {
      const lista = leerLocal().filter((x) => x.id !== inv.id);
      lista.push(inv);
      guardarLocal(lista);
      return inv;
    },
    async evento() {
      try {
        return mezclarEvento(JSON.parse(localStorage.getItem(CLAVE_EVENTO)));
      } catch {
        return mezclarEvento(null);
      }
    },
    async guardarEvento(ev) {
      const limpio = normalizarEvento(ev);
      try {
        localStorage.setItem(CLAVE_EVENTO, JSON.stringify(limpio));
      } catch {
        throw new Error('Este navegador no permite guardar datos (¿modo privado?).');
      }
      return limpio;
    },
    async subirFoto(blob) {
      const id = idFoto();
      await fotosLocales('readwrite', (st) => st.put(blob, id));
      return `local:${id}`;
    },
    async borrarFoto(ref) {
      if (!String(ref).startsWith('local:')) return;
      await fotosLocales('readwrite', (st) => st.delete(ref.slice(6)));
      if (vistas[ref]) vistas[ref].then((u) => u && URL.revokeObjectURL(u));
      delete vistas[ref];
    },
  };

  // ---------- Modo Supabase ----------

  function publicoDesdeFila(f) {
    return f ? {
      numero: f.numero,
      nombre: f.nombre,
      cupos: f.cupos,
      estado: f.estado,
      asistentes: f.asistentes,
      mensaje: f.mensaje || '',
      respondidoEn: f.respondido_en,
    } : null;
  }

  const remoto = {
    async invitacion(codigo, { marcar }) {
      const s = await sb();
      const { data, error } = await s.rpc('ver_invitacion', { p_codigo: codigo, p_marcar: marcar });
      if (error) throw traducirError(error);
      return publicoDesdeFila(Array.isArray(data) ? data[0] : data);
    },
    async responder(codigo, r) {
      const s = await sb();
      const { data, error } = await s.rpc('responder_invitacion', {
        p_codigo: codigo,
        p_asiste: r.asiste,
        p_asistentes: r.asiste ? r.asistentes : 0,
        p_mensaje: (r.mensaje || '').trim().slice(0, 1000),
      });
      if (error) throw traducirError(error);
      return publicoDesdeFila(Array.isArray(data) ? data[0] : data);
    },
    async sesion() {
      const s = await sb();
      const { data } = await s.auth.getSession();
      return data.session ? { correo: data.session.user.email } : null;
    },
    async entrar({ correo, clave }) {
      const s = await sb();
      const { data, error } = await s.auth.signInWithPassword({ email: correo, password: clave });
      if (error) throw traducirError(error);
      const { data: esAdmin, error: e2 } = await s.rpc('es_admin');
      if (e2 || !esAdmin) {
        await s.auth.signOut();
        throw new Error('Esta cuenta no está autorizada para el panel. Agrégala a la tabla administradores.');
      }
      return { correo: data.user.email };
    },
    async salir() {
      const s = await sb();
      await s.auth.signOut();
    },
    async listar() {
      const s = await sb();
      const { data, error } = await s.from('invitados').select('*').order('numero');
      if (error) throw traducirError(error);
      return data.map(desdeFila);
    },
    async crearVarios(nuevos) {
      const s = await sb();
      nuevos.forEach(validar);
      for (let intento = 0; intento < 5; intento += 1) {
        const filas = nuevos.map((n) => {
          const f = aFila(Object.assign({ estado: 'pendiente' }, n));
          f.codigo = generarCodigo();
          if (f.estado !== 'confirmado') f.asistentes = 0;
          if (f.estado !== 'pendiente') f.respondido_en = new Date().toISOString();
          return f;
        });
        const { data, error } = await s.from('invitados').insert(filas).select();
        if (!error) return data.map(desdeFila);
        if (error.code !== '23505') throw traducirError(error);
      }
      throw new Error('No se pudieron generar códigos únicos. Inténtalo de nuevo.');
    },
    async actualizar(id, cambios) {
      const s = await sb();
      const actual = await s.from('invitados').select('*').eq('id', id).single();
      if (actual.error) throw traducirError(actual.error);
      const previo = desdeFila(actual.data);
      const nuevo = Object.assign({}, previo, cambios);
      validar(nuevo);
      if (nuevo.estado !== 'confirmado') nuevo.asistentes = 0;
      if (cambios.estado && cambios.estado !== previo.estado) {
        nuevo.respondidoEn = cambios.estado === 'pendiente' ? null : new Date().toISOString();
      }
      const fila = aFila(Object.assign({}, cambios, {
        asistentes: nuevo.asistentes,
        respondidoEn: nuevo.respondidoEn,
      }));
      const { data, error } = await s.from('invitados').update(fila).eq('id', id).select().single();
      if (error) throw traducirError(error);
      return desdeFila(data);
    },
    async eliminar(id) {
      const s = await sb();
      const { error } = await s.from('invitados').delete().eq('id', id);
      if (error) throw traducirError(error);
    },
    async restaurar(inv) {
      const s = await sb();
      const fila = Object.assign(aFila(inv), {
        id: inv.id,
        numero: inv.numero,
        codigo: inv.codigo,
        creado_en: inv.creadoEn,
      });
      const { data, error } = await s.from('invitados').insert(fila).select().single();
      if (error) throw traducirError(error);
      return desdeFila(data);
    },
    async evento() {
      const s = await sb();
      const { data, error } = await s.from('evento').select('datos').eq('id', 1).maybeSingle();
      if (error) throw traducirError(error);
      return mezclarEvento(data && data.datos);
    },
    async guardarEvento(ev) {
      const s = await sb();
      const limpio = normalizarEvento(ev);
      const { error } = await s.from('evento').upsert({ id: 1, datos: limpio, actualizado_en: new Date().toISOString() });
      if (error) throw traducirError(error);
      return limpio;
    },
    async subirFoto(blob, carpeta) {
      const s = await sb();
      const ruta = `${carpeta || 'fotos'}/${Date.now().toString(36)}-${idFoto()}.jpg`;
      const { error } = await s.storage.from('fotos').upload(ruta, blob, { contentType: blob.type || 'image/jpeg', cacheControl: '31536000', upsert: false });
      if (error) throw traducirError(error);
      return s.storage.from('fotos').getPublicUrl(ruta).data.publicUrl;
    },
    async borrarFoto(ref) {
      if (!BASE_STORAGE || !String(ref).startsWith(BASE_STORAGE)) return;
      const s = await sb();
      const { error } = await s.storage.from('fotos').remove([decodeURIComponent(ref.slice(BASE_STORAGE.length))]);
      if (error) throw traducirError(error);
    },
  };

  const motor = conSupabase ? remoto : local;

  function envolver(fn) {
    return async (...args) => {
      try {
        return await fn(...args);
      } catch (e) {
        throw traducirError(e);
      }
    };
  }

  window.Datos = {
    modo: conSupabase ? 'supabase' : 'local',
    limpiarCodigo,
    invitacion: envolver((codigo, op = {}) => motor.invitacion(limpiarCodigo(codigo), { marcar: op.marcar !== false })),
    responder: envolver((codigo, r) => motor.responder(limpiarCodigo(codigo), r)),
    sesion: envolver(() => motor.sesion()),
    entrar: envolver((cred) => motor.entrar(cred)),
    salir: envolver(() => motor.salir()),
    listar: envolver(() => motor.listar()),
    crear: envolver(async (inv) => (await motor.crearVarios([inv]))[0]),
    crearVarios: envolver((lista) => motor.crearVarios(lista)),
    actualizar: envolver((id, cambios) => motor.actualizar(id, cambios)),
    eliminar: envolver((id) => motor.eliminar(id)),
    restaurar: envolver((inv) => motor.restaurar(inv)),
    evento: envolver(() => motor.evento()),
    guardarEvento: envolver((ev) => motor.guardarEvento(ev)),
    eventoBase: () => mezclarEvento(null),
    normalizarEvento,
    subirFoto: envolver((blob, carpeta) => motor.subirFoto(blob, carpeta)),
    borrarFoto: envolver((ref) => (esSubida(ref) ? motor.borrarFoto(ref) : null)),
    urlFoto,
    esSubida,
    enlace(codigo, { vista } = {}) {
      const base = C.urlInvitacion || new URL('./', location.href).href;
      const url = new URL(base);
      url.search = '';
      url.searchParams.set('i', codigo);
      if (vista) url.searchParams.set('vista', 'panel');
      return url.href;
    },
  };
})();
