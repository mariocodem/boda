/*
 * Capa de datos: invitados, datos de la boda (fecha, lugares, itinerario,
 * estilo), sus fotos, el plano de mesas del salón y la planeación de los
 * novios (tareas, presupuesto y proveedores).
 *
 * Modo local: localStorage del navegador (para probar y diseñar); las fotos
 * van en IndexedDB del mismo navegador.
 * Modo Supabase: base de datos real; los invitados solo pueden leer y responder
 * su propia invitación a través de dos funciones (ver supabase/esquema.sql).
 * Las fotos van al bucket público «fotos» de Supabase Storage. El plano del
 * salón (tabla salon) es público como el evento; la mesa de cada invitado vive
 * en su fila y solo la ve él, cuando confirmó y los novios publicaron las mesas.
 * La planeación (tabla planeacion) es privada: solo la ven los administradores.
 */
(function () {
  const C = window.BODA;
  const CLAVE_LOCAL = 'boda-diego-erika:invitados';
  const CLAVE_SESION_LOCAL = 'boda-diego-erika:panel';
  // La pestaña del panel que estaba abierta al ir a Google, para volver a ella.
  const CLAVE_VISTA = 'boda-diego-erika:vista';
  const Google = () => window.CalendarioGoogle;
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
    // PKCE: al volver de Google llega ?code=… en la dirección, sin tocar el
    // #pestaña del panel.
    cliente = window.supabase.createClient(C.supabase.url, C.supabase.anonKey, { auth: { flowType: 'pkce' } });
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

  // La mesa de un invitado es el id de una pieza del plano (ver salon.js).
  function limpiarMesa(m) {
    return /^[a-z0-9]{4,24}$/.test(String(m || '')) ? String(m) : null;
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
      alergias: f.alergias || '',
      cancion: f.cancion || '',
      nombresAsistentes: Array.isArray(f.nombres_asistentes) ? f.nombres_asistentes : [],
      mesa: f.mesa || null,
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
    if ('alergias' in i) fila.alergias = texto(i.alergias, 300);
    if ('cancion' in i) fila.cancion = texto(i.cancion, 120);
    if ('nombresAsistentes' in i) fila.nombres_asistentes = nombres(i.nombresAsistentes);
    if ('mesa' in i) fila.mesa = limpiarMesa(i.mesa);
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
    if (/Signups not allowed|signup.*disabled/i.test(msg)) {
      return new Error('Esa cuenta de Google todavía no tiene usuario en Supabase. Créalo en Authentication → Users con el mismo correo (ver README, «Entrar con Google»).');
    }
    if (/provider is not enabled|Unsupported provider/i.test(msg)) {
      return new Error('Falta activar Google en Supabase (Authentication → Sign In / Providers). Ver README, «Entrar con Google».');
    }
    if (/access_denied/i.test(msg)) return new Error('Se canceló la entrada con Google.');
    const falta = /42P01|42703|PGRST202|PGRST204|PGRST205|does not exist|schema cache/i.test(`${msg} ${e.code || ''}`);
    if (/planeacion/.test(msg) && falta) {
      return new Error('Faltan las tareas, el presupuesto y los proveedores en Supabase. Vuelve a ejecutar supabase/esquema.sql.');
    }
    // El borrador del diseño va en planeacion con la clave «diseno», que un
    // esquema viejo no deja guardar.
    if (/planeacion_clave_check|23514/.test(`${msg} ${e.code || ''}`)) {
      return new Error('Falta el borrador del diseño en Supabase. Vuelve a ejecutar supabase/esquema.sql.');
    }
    if (/nombres_asistentes|p_nombres/.test(msg) && falta) {
      return new Error('Faltan los nombres de los asistentes en Supabase. Vuelve a ejecutar supabase/esquema.sql.');
    }
    if (/alergias|cancion/.test(msg) && falta) {
      return new Error('Faltan las preguntas de la respuesta en Supabase. Vuelve a ejecutar supabase/esquema.sql.');
    }
    if (/evento/.test(msg) && falta) {
      return new Error('Falta la tabla de los datos de la boda en Supabase. Vuelve a ejecutar supabase/esquema.sql.');
    }
    if (/salon|mesa/.test(msg) && falta) {
      return new Error('Falta el plano de mesas en Supabase. Vuelve a ejecutar supabase/esquema.sql.');
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

  // Quiénes van: un nombre por persona, sin vacíos, hasta «max».
  function nombres(lista, max = 20) {
    return (Array.isArray(lista) ? lista : []).map((x) => texto(x, 80)).filter(Boolean).slice(0, max);
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

  // Solo enlaces https: estos valores terminan en un href de la invitación.
  function enlaceHttps(v) {
    const s = String(v || '').trim();
    return /^https:\/\/\S+$/.test(s) ? s.slice(0, 600) : null;
  }

  function filas(lista, max, fn, obligatorios) {
    return (Array.isArray(lista) ? lista : [])
      .map((x) => fn(x || {}))
      .filter((x) => obligatorios.every((c) => x[c]))
      .slice(0, max);
  }

  // La cuenta para regalos en dinero. Sin número no hay cuenta.
  function cuentaRegalos(c) {
    const x = c || {};
    const numero = texto(x.numero, 40);
    if (!numero) return null;
    return {
      banco: texto(x.banco, 60),
      tipo: texto(x.tipo, 40),
      numero,
      titular: texto(x.titular, 80),
      documento: texto(x.documento, 30),
    };
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
      cuentaRegalos: cuentaRegalos(x.cuentaRegalos),
      listasRegalos: filas(x.listasRegalos, 4, (l) => ({ nombre: texto(l.nombre, 60), enlace: enlaceHttps(l.enlace) }), ['nombre', 'enlace']),
      historia: texto(x.historia, 3000),
      alojamiento: {
        nota: texto(x.alojamiento && x.alojamiento.nota, 400),
        hoteles: filas(x.alojamiento && x.alojamiento.hoteles, 6, (h) => ({
          nombre: texto(h.nombre, 80),
          direccion: texto(h.direccion, 160),
          enlace: enlaceHttps(h.enlace),
          nota: texto(h.nota, 200),
        }), ['nombre']),
      },
      preguntas: filas(x.preguntas, 12, (q) => ({ pregunta: texto(q.pregunta, 160), respuesta: texto(q.respuesta, 800) }), ['pregunta', 'respuesta']),
      // Preguntas opcionales de la tarjeta de respuesta.
      respuesta: { alergias: Boolean(x.respuesta && x.respuesta.alergias), cancion: Boolean(x.respuesta && x.respuesta.cancion) },
      fotoPortada: x.fotoPortada ? Object.assign(foto(x.fotoPortada) || {}, { encuadre: encuadre(x.fotoPortada.encuadre) }) : null,
      fotos: fotos(x.fotos, 6),
      // De qué versión de las fotos de arranque (config.js) vienen estas fotos.
      fotosArranque: texto(x.fotosArranque, 40),
      estilo: {
        paleta: /^[a-z]{2,20}$/.test((x.estilo && x.estilo.paleta) || '') ? x.estilo.paleta : 'verde',
        letra: /^[a-z]{2,20}$/.test((x.estilo && x.estilo.letra) || '') ? x.estilo.letra : 'grabada',
        // El color de la paleta «libre» (ver Estilos.LIBRE).
        color: /^#[0-9a-f]{6}$/i.test((x.estilo && x.estilo.color) || '') ? x.estilo.color.toLowerCase() : undefined,
        // La letra del texto, si es otra que la de los títulos.
        letraTexto: /^[a-z]{2,20}$/.test((x.estilo && x.estilo.letraTexto) || '') ? x.estilo.letraTexto : undefined,
      },
      // La mariposa de papel dorado; se apaga desde el panel (Diseño → Tema).
      mariposa: x.mariposa !== false,
      // El tema, el fondo, los textos y los bloques (ver assets/pagina.js).
      pagina: window.Pagina.normalizar(x.pagina),
    };
    if (limpio.fotoPortada && !limpio.fotoPortada.url) limpio.fotoPortada = null;
    return limpio;
  }

  // Lo guardado desde el panel reemplaza, campo por campo, lo de config.js.
  // Las fotos de arranque (config.js, con su versión en fotosArranque) son la
  // excepción: si se pusieron después de lo guardado, reemplazan una vez la
  // foto principal y las de la pareja guardadas. En cuanto el panel guarda con
  // esa versión, vuelven a mandar las del panel.
  function mezclarEvento(guardado) {
    const g = guardado && C.fotosArranque && guardado.fotosArranque !== C.fotosArranque
      ? Object.assign({}, guardado, { fotoPortada: C.fotoPortada, fotos: C.fotos, fotosArranque: C.fotosArranque })
      : guardado;
    return normalizarEvento(g ? Object.assign({}, C, g) : C);
  }

  // El borrador de la pestaña «Diseño»: lo que se publica en el evento (la
  // página, el estilo y la mariposa) y las fotos que se subieron para él.
  // Es privado: los invitados ven solo lo publicado.
  const CLAVE_DISENO = 'boda-diego-erika:diseno';

  function normalizarDiseno(d) {
    if (!d || !d.pagina) return null;
    const ev = normalizarEvento({ pagina: d.pagina, estilo: d.estilo, mariposa: d.mariposa });
    return {
      pagina: ev.pagina,
      estilo: ev.estilo,
      mariposa: ev.mariposa,
      subidas: (Array.isArray(d.subidas) ? d.subidas : []).map(refFoto).filter(Boolean).slice(0, 200),
      editadoEn: typeof d.editadoEn === 'string' && !Number.isNaN(Date.parse(d.editadoEn)) ? d.editadoEn : null,
    };
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

  // Lo subido se puede borrar; las rutas de la carpeta del sitio no. Las fotos
  // van al bucket «fotos» y la canción al bucket «musica».
  const BASE_PUBLICA = conSupabase ? `${C.supabase.url.replace(/\/+$/, '')}/storage/v1/object/public/` : null;
  const BUCKETS = ['fotos', 'musica'];

  // El bucket y la ruta de un archivo subido a Supabase, o null.
  function enStorage(ref) {
    const s = String(ref || '');
    if (!BASE_PUBLICA || !s.startsWith(BASE_PUBLICA)) return null;
    const resto = s.slice(BASE_PUBLICA.length);
    const bucket = BUCKETS.find((b) => resto.startsWith(`${b}/`));
    return bucket ? { bucket, ruta: decodeURIComponent(resto.slice(bucket.length + 1)) } : null;
  }

  function esSubida(ref) {
    return String(ref || '').startsWith('local:') || Boolean(enStorage(ref));
  }

  // La canción: un mp3 tal cual, hasta 20 MB (lo mismo que acepta el bucket
  // «musica» de supabase/esquema.sql).
  const MAX_MB_MUSICA = 20;
  const mb = (bytes) => (bytes / 1048576).toLocaleString('es-CO', { maximumFractionDigits: 1 });

  function validarMusica(archivo) {
    if (!archivo || !archivo.size) throw new Error('Ese archivo está vacío. Elige un .mp3.');
    const esMp3 = /\.mp3$/i.test(archivo.name || '') || /^audio\/(mpeg|mp3)$/i.test(archivo.type || '');
    if (!esMp3) throw new Error('La canción tiene que ser un archivo .mp3.');
    if (archivo.size > MAX_MB_MUSICA * 1048576) throw new Error(`La canción pesa ${mb(archivo.size)} MB y el máximo es ${MAX_MB_MUSICA} MB.`);
  }

  // Los errores de Supabase al subir la canción, que traducirError leería
  // como de fotos.
  function errorMusica(e) {
    const msg = String((e && e.message) || e);
    if (/bucket not found/i.test(msg)) return new Error('Falta el espacio para la música en Supabase: ejecuta supabase/esquema.sql en el SQL Editor.');
    if (/row-level security|unauthorized|403/i.test(msg)) return new Error('Supabase no dejó subir la canción: ejecuta supabase/esquema.sql en el SQL Editor y revisa que tu correo esté en administradores.');
    if (/payload too large|exceeded the maximum allowed size|413/i.test(msg)) return new Error(`La canción pesa más de lo que acepta Supabase (${MAX_MB_MUSICA} MB).`);
    if (/mime type|invalid_mime/i.test(msg)) return new Error('Supabase solo acepta la canción en .mp3.');
    return traducirError(e);
  }

  // ---------- Modo local ----------

  const CLAVE_SALON = 'boda-diego-erika:salon';
  const CLAVE_PLANEACION = 'boda-diego-erika:planeacion:';

  function salonLocal() {
    try {
      return window.Salon.normalizar(JSON.parse(localStorage.getItem(CLAVE_SALON)));
    } catch {
      return window.Salon.normalizar(null);
    }
  }

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

  // Como ver_invitacion: la mesa solo se ve con la asistencia confirmada y las
  // mesas publicadas.
  function publico(i) {
    return {
      numero: i.numero,
      nombre: i.nombre,
      cupos: i.cupos,
      estado: i.estado,
      asistentes: i.asistentes,
      mensaje: i.mensaje,
      alergias: i.alergias || '',
      cancion: i.cancion || '',
      nombresAsistentes: i.estado === 'confirmado' ? nombres(i.nombresAsistentes) : [],
      respondidoEn: i.respondidoEn,
      mesa: i.estado === 'confirmado' && salonLocal().mostrar ? i.mesa || null : null,
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
      // Sin la pregunta en la tarjeta, lo que ya había se queda.
      if (r.alergias != null) i.alergias = texto(r.alergias, 300) || '';
      if (r.cancion != null) i.cancion = texto(r.cancion, 120) || '';
      // Quiénes van: sin la lista (una tarjeta vieja) lo que había se queda.
      if (!r.asiste) i.nombresAsistentes = [];
      else if (r.nombres != null) i.nombresAsistentes = nombres(r.nombres, i.asistentes);
      i.respondidoEn = new Date().toISOString();
      guardarLocal(lista);
      return publico(i);
    },
    async sesion() {
      try {
        const v = sessionStorage.getItem(CLAVE_SESION_LOCAL);
        if (v === '1') return { correo: 'Modo local' };
        const g = v && JSON.parse(v);
        return g && g.correo ? { correo: g.correo, nombre: g.nombre || '', google: true } : null;
      } catch {
        return null;
      }
    },
    async entrar({ clave }) {
      if (clave !== C.claveLocal) throw new Error('Esa no es la clave del panel.');
      try { sessionStorage.setItem(CLAVE_SESION_LOCAL, '1'); } catch { /* sin almacenamiento: la sesión dura lo que la página */ }
      return { correo: 'Modo local' };
    },
    // Con Google se entra sin la clave: los datos viven en este navegador, así
    // que la cuenta sirve para saber quién entró y para el calendario.
    googleDisponible() {
      return Boolean(Google() && Google().configurado());
    },
    async entrarConGoogle() {
      const p = await Google().entrar();
      const s = { correo: p.correo, nombre: p.nombre, google: true };
      try { sessionStorage.setItem(CLAVE_SESION_LOCAL, JSON.stringify(s)); } catch { /* dura lo que la página */ }
      return Object.assign({ calendario: p.calendario }, s);
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
          alergias: texto(n.alergias, 300) || '',
          cancion: texto(n.cancion, 120) || '',
          nombresAsistentes: n.estado === 'confirmado' ? nombres(n.nombresAsistentes, Number(n.asistentes)) : [],
          mesa: limpiarMesa(n.mesa),
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
      if ('mesa' in cambios) nuevo.mesa = limpiarMesa(cambios.mesa);
      if ('alergias' in cambios) nuevo.alergias = texto(cambios.alergias, 300) || '';
      if ('cancion' in cambios) nuevo.cancion = texto(cambios.cancion, 120) || '';
      if ('nombresAsistentes' in cambios) nuevo.nombresAsistentes = nombres(cambios.nombresAsistentes, nuevo.asistentes);
      if (nuevo.estado !== 'confirmado') nuevo.nombresAsistentes = [];
      Object.assign(i, nuevo);
      guardarLocal(lista);
      return i;
    },
    async eliminar(id) {
      guardarLocal(leerLocal().filter((x) => x.id !== id));
    },
    async asignarMesa(ids, mesa) {
      const lista = leerLocal();
      lista.forEach((x) => { if (ids.includes(x.id)) x.mesa = limpiarMesa(mesa); });
      guardarLocal(lista);
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
    // En modo local la canción vive con las fotos, en IndexedDB del navegador.
    async subirMusica(archivo) {
      const id = idFoto();
      await fotosLocales('readwrite', (st) => st.put(new Blob([archivo], { type: 'audio/mpeg' }), id));
      return `local:${id}`;
    },
    async diseno() {
      try {
        return normalizarDiseno(JSON.parse(localStorage.getItem(CLAVE_DISENO)));
      } catch {
        return null;
      }
    },
    async guardarDiseno(d) {
      const limpio = normalizarDiseno(d);
      try {
        if (limpio) localStorage.setItem(CLAVE_DISENO, JSON.stringify(limpio));
        else localStorage.removeItem(CLAVE_DISENO);
      } catch {
        throw new Error('Este navegador no permite guardar datos (¿modo privado?).');
      }
      return limpio;
    },
    async salon() {
      return salonLocal();
    },
    async guardarSalon(plan) {
      const limpio = window.Salon.normalizar(plan);
      try {
        localStorage.setItem(CLAVE_SALON, JSON.stringify(limpio));
      } catch {
        throw new Error('Este navegador no permite guardar datos (¿modo privado?).');
      }
      return limpio;
    },
    async planeacion(clave) {
      try {
        return window.Planeador.normalizar(clave, JSON.parse(localStorage.getItem(CLAVE_PLANEACION + clave)));
      } catch (e) {
        if (/herramienta/.test(e.message)) throw e;
        return window.Planeador.normalizar(clave, null);
      }
    },
    async guardarPlaneacion(clave, datos) {
      const limpio = window.Planeador.normalizar(clave, datos);
      try {
        localStorage.setItem(CLAVE_PLANEACION + clave, JSON.stringify(limpio));
      } catch {
        throw new Error('Este navegador no permite guardar datos (¿modo privado?).');
      }
      return limpio;
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
      alergias: f.alergias || '',
      cancion: f.cancion || '',
      nombresAsistentes: Array.isArray(f.nombres_asistentes) ? f.nombres_asistentes : [],
      respondidoEn: f.respondido_en,
      mesa: f.mesa || null,
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
      const base = {
        p_codigo: codigo,
        p_asiste: r.asiste,
        p_asistentes: r.asiste ? r.asistentes : 0,
        p_mensaje: (r.mensaje || '').trim().slice(0, 1000),
      };
      // Las preguntas extra solo viajan si la tarjeta las hizo: sin ellas, lo
      // que ya había se queda.
      const extra = {};
      if (r.alergias != null) extra.p_alergias = String(r.alergias).trim().slice(0, 300);
      if (r.cancion != null) extra.p_cancion = String(r.cancion).trim().slice(0, 120);
      const conNombres = r.nombres != null ? { p_nombres: nombres(r.nombres, r.asistentes) } : {};
      const sinFuncion = (err) => err && /PGRST202|Could not find the function/i.test(`${err.code} ${err.message}`);
      let { data, error } = await s.rpc('responder_invitacion', Object.assign({}, base, extra, conNombres));
      // Con un esquema viejo (sin los nombres, o sin las preguntas) la respuesta llega igual.
      if (sinFuncion(error) && Object.keys(conNombres).length) {
        ({ data, error } = await s.rpc('responder_invitacion', Object.assign({}, base, extra)));
      }
      if (sinFuncion(error) && Object.keys(extra).length) {
        ({ data, error } = await s.rpc('responder_invitacion', base));
      }
      if (error) throw traducirError(error);
      return publicoDesdeFila(Array.isArray(data) ? data[0] : data);
    },
    async sesion() {
      // ¿Vuelve de Google? Trae ?code=… (o el error) en la dirección.
      const params = new URLSearchParams(location.search);
      const hash = new URLSearchParams(location.hash.slice(1));
      const vuelta = params.has('code') || params.has('error') || hash.has('error');
      const limpiarDireccion = () => {
        if (!vuelta) return;
        let vista = '';
        try {
          vista = sessionStorage.getItem(CLAVE_VISTA) || '';
          sessionStorage.removeItem(CLAVE_VISTA);
        } catch { /* sin pestaña guardada */ }
        history.replaceState(null, '', location.pathname + (/^#[a-z]+$/.test(vista) ? vista : ''));
      };
      const codigoFallo = params.get('error') || hash.get('error') || '';
      const detalleFallo = params.get('error_description') || hash.get('error_description') || '';
      const fallo = [detalleFallo, codigoFallo && `(${codigoFallo})`].filter(Boolean).join(' ');
      const s = await sb();
      const { data } = await s.auth.getSession();
      limpiarDireccion();
      if (fallo && !data.session) throw traducirError(new Error(fallo));
      const sesion = data.session;
      if (!sesion) return null;
      // Una cuenta de Google cualquiera puede entrar a Supabase: el panel es
      // solo para las de la tabla administradores.
      const { data: esAdmin, error } = await s.rpc('es_admin');
      if (error) throw traducirError(error);
      if (!esAdmin) {
        await s.auth.signOut();
        throw new Error(`La cuenta ${sesion.user.email} no está autorizada para el panel. Agrégala a la tabla administradores (ver README).`);
      }
      const meta = sesion.user.user_metadata || {};
      const proveedores = (sesion.user.app_metadata && sesion.user.app_metadata.providers) || [];
      const google = proveedores.includes('google');
      // El permiso del calendario solo llega justo al volver de Google.
      if (Google()) await Google().recibir(vuelta ? sesion.provider_token : null, sesion.user.email, meta.full_name || meta.name || '');
      return { correo: sesion.user.email, nombre: meta.full_name || meta.name || '', google };
    },
    // Google en Supabase: hace falta el ID de cliente en config.js (para
    // renovar el permiso del calendario) y Google activo en el proyecto.
    async googleDisponible() {
      if (!Google() || !Google().configurado()) return false;
      try {
        const r = await fetch(`${C.supabase.url.replace(/\/+$/, '')}/auth/v1/settings`, { headers: { apikey: C.supabase.anonKey } });
        const ajustes = await r.json();
        return Boolean(ajustes && ajustes.external && ajustes.external.google);
      } catch {
        return false;
      }
    },
    // Va a Google y vuelve a admin.html con la sesión (y el permiso del
    // calendario). La página se va: esta promesa no hace falta esperarla.
    async entrarConGoogle() {
      const s = await sb();
      try { sessionStorage.setItem(CLAVE_VISTA, location.hash); } catch { /* vuelve a la primera pestaña */ }
      const { error } = await s.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: location.origin + location.pathname,
          scopes: Google().ALCANCE,
          queryParams: { prompt: 'select_account' },
        },
      });
      if (error) throw traducirError(error);
      return { redirigiendo: true };
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
    async asignarMesa(ids, mesa) {
      if (!ids.length) return;
      const s = await sb();
      const { error } = await s.from('invitados').update({ mesa: limpiarMesa(mesa) }).in('id', ids);
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
      // Vacías no se mandan estas columnas: así deshacer funciona aunque falten en el esquema.
      ['mesa', 'alergias', 'cancion'].forEach((c) => { if (!fila[c]) delete fila[c]; });
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
    async salon() {
      const s = await sb();
      const { data, error } = await s.from('salon').select('datos').eq('id', 1).maybeSingle();
      if (error) throw traducirError(error);
      return window.Salon.normalizar(data && data.datos);
    },
    async guardarSalon(plan) {
      const s = await sb();
      const limpio = window.Salon.normalizar(plan);
      const { error } = await s.from('salon').upsert({ id: 1, datos: limpio, actualizado_en: new Date().toISOString() });
      if (error) throw traducirError(error);
      return limpio;
    },
    async planeacion(clave) {
      const s = await sb();
      const { data, error } = await s.from('planeacion').select('datos').eq('clave', clave).maybeSingle();
      if (error) throw traducirError(error);
      return window.Planeador.normalizar(clave, data && data.datos);
    },
    async guardarPlaneacion(clave, datos) {
      const s = await sb();
      const limpio = window.Planeador.normalizar(clave, datos);
      const { error } = await s.from('planeacion').upsert({ clave, datos: limpio, actualizado_en: new Date().toISOString() });
      if (error) throw traducirError(error);
      return limpio;
    },
    // El borrador va en la tabla planeacion, que solo ven los administradores.
    async diseno() {
      const s = await sb();
      const { data, error } = await s.from('planeacion').select('datos').eq('clave', 'diseno').maybeSingle();
      if (error) throw traducirError(error);
      return normalizarDiseno(data && data.datos);
    },
    async guardarDiseno(d) {
      const s = await sb();
      const limpio = normalizarDiseno(d);
      const { error } = await s.from('planeacion').upsert({ clave: 'diseno', datos: limpio || {}, actualizado_en: new Date().toISOString() });
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
    async subirMusica(archivo) {
      const s = await sb();
      const ruta = `cancion/${Date.now().toString(36)}-${idFoto()}.mp3`;
      const { error } = await s.storage.from('musica').upload(ruta, archivo, { contentType: 'audio/mpeg', cacheControl: '31536000', upsert: false });
      if (error) throw errorMusica(error);
      return s.storage.from('musica').getPublicUrl(ruta).data.publicUrl;
    },
    // Sirve para las fotos y para la canción: cada una se borra de su bucket.
    async borrarFoto(ref) {
      const x = enStorage(ref);
      if (!x) return;
      const s = await sb();
      const { error } = await s.storage.from(x.bucket).remove([x.ruta]);
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
    googleDisponible: () => Promise.resolve(motor.googleDisponible()).catch(() => false),
    entrarConGoogle: envolver(() => motor.entrarConGoogle()),
    salir: envolver(() => motor.salir()),
    listar: envolver(() => motor.listar()),
    crear: envolver(async (inv) => (await motor.crearVarios([inv]))[0]),
    crearVarios: envolver((lista) => motor.crearVarios(lista)),
    actualizar: envolver((id, cambios) => motor.actualizar(id, cambios)),
    eliminar: envolver((id) => motor.eliminar(id)),
    restaurar: envolver((inv) => motor.restaurar(inv)),
    asignarMesa: envolver((ids, mesa) => motor.asignarMesa(ids, mesa)),
    salon: envolver(() => motor.salon()),
    guardarSalon: envolver((plan) => motor.guardarSalon(plan)),
    planeacion: envolver((clave) => motor.planeacion(clave)),
    guardarPlaneacion: envolver((clave, datos) => motor.guardarPlaneacion(clave, datos)),
    diseno: envolver(() => motor.diseno()),
    guardarDiseno: envolver((d) => motor.guardarDiseno(d)),
    evento: envolver(() => motor.evento()),
    guardarEvento: envolver((ev) => motor.guardarEvento(ev)),
    eventoBase: () => mezclarEvento(null),
    normalizarEvento,
    subirFoto: envolver((blob, carpeta) => motor.subirFoto(blob, carpeta)),
    borrarFoto: envolver((ref) => (esSubida(ref) ? motor.borrarFoto(ref) : null)),
    subirMusica: envolver((archivo) => {
      validarMusica(archivo);
      return motor.subirMusica(archivo);
    }),
    MAX_MB_MUSICA,
    // urlFoto también le da su dirección blob: a la canción del modo local.
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
