/*
 * La planeación de la boda: las tareas (la agenda), el presupuesto y los
 * proveedores. Solo la usa el panel; con Supabase vive en la tabla planeacion,
 * que nadie más que los administradores puede leer.
 *
 * Cada herramienta es un documento:
 *  - tareas:      { lista: [{ id, titulo, etapa, nota, hecha, hechaEn, ir }] }
 *  - presupuesto: { total, partidas: [{ id, categoria, concepto, estimado,
 *                   costo, pagado, vence, proveedor, nota }] }
 *  - proveedores: { lista: [{ id, nombre, categoria, estado, contacto,
 *                   telefono, correo, web, precio, nota }] }
 *
 * El dinero va en pesos enteros. Una partida puede apuntar a un proveedor por
 * su id; si el proveedor ya no está, la partida queda sin él.
 */
(function () {
  const ID = /^[a-z0-9]{4,24}$/;
  const DIA = /^\d{4}-\d{2}-\d{2}$/;
  const MAX_PESOS = 99999999999;

  // Lo mismo para el presupuesto y para los proveedores, en el orden en que se
  // suelen contratar.
  const CATEGORIAS = {
    ceremonia: 'Ceremonia',
    recepcion: 'Lugar de la recepción',
    banquete: 'Banquete y bebidas',
    torta: 'Torta y postres',
    foto: 'Fotografía y video',
    musica: 'Música y animación',
    flores: 'Flores y decoración',
    novia: 'Vestido de novia y accesorios',
    novio: 'Traje del novio',
    belleza: 'Maquillaje y peinado',
    anillos: 'Anillos y arras',
    papeleria: 'Invitaciones y recuerdos',
    transporte: 'Transporte',
    planeador: 'Wedding planner',
    luna: 'Luna de miel',
    otros: 'Otros',
  };

  const ESTADOS = {
    evaluando: 'Evaluando',
    contratado: 'Contratado',
    descartado: 'Descartado',
  };

  // Las etapas de la agenda, de la más lejana a después de la boda. «hasta» es
  // cuánto antes (o después) de la boda deberían quedar hechas sus tareas.
  const ETAPAS = [
    { id: 'doce', nombre: 'De 12 a 10 meses antes', hasta: { meses: -10 } },
    { id: 'nueve', nombre: 'De 9 a 7 meses antes', hasta: { meses: -7 } },
    { id: 'seis', nombre: 'De 6 a 4 meses antes', hasta: { meses: -4 } },
    { id: 'tres', nombre: 'De 3 a 2 meses antes', hasta: { meses: -2 } },
    { id: 'mes', nombre: 'El último mes', hasta: { dias: -7 } },
    { id: 'semana', nombre: 'La última semana', hasta: { dias: 0 } },
    { id: 'despues', nombre: 'Después de la boda', hasta: { meses: 2 } },
  ];

  // Pestañas del panel a las que puede llevar una tarea.
  const VISTAS = ['invitados', 'mesas', 'presupuesto', 'proveedores', 'boda'];

  // La lista para empezar: [etapa, tarea, pestaña a la que lleva].
  const TAREAS_SUGERIDAS = [
    ['doce', 'Definir el presupuesto de la boda', 'presupuesto'],
    ['doce', 'Hacer la primera lista de invitados', 'invitados'],
    ['doce', 'Elegir la fecha y la ciudad', 'boda'],
    ['doce', 'Reservar el lugar de la ceremonia'],
    ['doce', 'Reservar el lugar de la recepción'],
    ['doce', 'Decidir si contratan wedding planner', 'proveedores'],
    ['doce', 'Contratar fotografía y video', 'proveedores'],
    ['nueve', 'Contratar el banquete', 'proveedores'],
    ['nueve', 'Contratar la música: orquesta o DJ', 'proveedores'],
    ['nueve', 'Elegir a los padrinos y testigos'],
    ['nueve', 'Buscar el vestido de novia'],
    ['nueve', 'Reservar hoteles para los invitados que vienen de lejos', 'boda'],
    ['nueve', 'Planear la luna de miel'],
    ['nueve', 'Abrir la lista de regalos', 'boda'],
    ['seis', 'Avisar la fecha a los invitados («reserva la fecha»)'],
    ['seis', 'Contratar flores y decoración', 'proveedores'],
    ['seis', 'Elegir el traje del novio'],
    ['seis', 'Empezar los trámites de la parroquia o la notaría'],
    ['seis', 'Elegir los anillos'],
    ['seis', 'Contratar maquillaje y peinado', 'proveedores'],
    ['seis', 'Contratar el transporte', 'proveedores'],
    ['seis', 'Elegir la torta'],
    ['tres', 'Enviar las invitaciones', 'invitados'],
    ['tres', 'Probar el menú del banquete'],
    ['tres', 'Armar el itinerario del día', 'boda'],
    ['tres', 'Elegir las canciones de la entrada y del primer baile'],
    ['tres', 'Prueba de maquillaje y peinado'],
    ['tres', 'Comprar los recuerdos para los invitados'],
    ['tres', 'Reunir los documentos del matrimonio'],
    ['mes', 'Llamar a quienes no han respondido', 'invitados'],
    ['mes', 'Armar el plano de mesas', 'mesas'],
    ['mes', 'Confirmar el número de invitados con el banquete', 'invitados'],
    ['mes', 'Última prueba del vestido y del traje'],
    ['mes', 'Confirmar horarios con todos los proveedores', 'proveedores'],
    ['mes', 'Preparar los pagos finales', 'presupuesto'],
    ['mes', 'Mostrar las mesas a los invitados', 'mesas'],
    ['semana', 'Entregar la lista final al banquete y al salón', 'invitados'],
    ['semana', 'Ensayo de la ceremonia'],
    ['semana', 'Recoger el vestido y el traje'],
    ['semana', 'Dejar listos los anillos y las arras'],
    ['semana', 'Preparar la maleta de la luna de miel'],
    ['despues', 'Enviar los agradecimientos'],
    ['despues', 'Recibir las fotos y el video'],
    ['despues', 'Devolver lo alquilado'],
    ['despues', 'Registrar el matrimonio en la notaría'],
  ];

  // Para empezar el presupuesto: [categoría, concepto], sin montos.
  const PARTIDAS_SUGERIDAS = [
    ['ceremonia', 'Iglesia, notaría o juez'],
    ['recepcion', 'Alquiler del lugar'],
    ['banquete', 'Banquete'],
    ['banquete', 'Bebidas'],
    ['torta', 'Torta'],
    ['foto', 'Fotografía'],
    ['foto', 'Video'],
    ['musica', 'Orquesta o DJ'],
    ['flores', 'Flores'],
    ['flores', 'Decoración'],
    ['novia', 'Vestido'],
    ['novia', 'Zapatos y accesorios'],
    ['novio', 'Traje'],
    ['belleza', 'Maquillaje y peinado'],
    ['anillos', 'Argollas'],
    ['papeleria', 'Recuerdos'],
    ['transporte', 'Carro de los novios'],
    ['luna', 'Viaje'],
  ];

  const limitar = (n, min, max) => Math.min(max, Math.max(min, n));

  function texto(v, max) {
    const s = v == null ? '' : String(v).trim();
    return s ? s.slice(0, max) : null;
  }

  function pesos(v) {
    if (v === '' || v == null) return null;
    const n = Math.round(Number(v));
    return Number.isFinite(n) && n >= 0 ? Math.min(n, MAX_PESOS) : null;
  }

  // Solo enlaces https: terminan en un href del panel.
  function enlace(v) {
    const s = String(v || '').trim();
    return /^https:\/\/\S+$/.test(s) ? s.slice(0, 600) : null;
  }

  function correo(v) {
    const s = String(v || '').trim();
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s) ? s.slice(0, 120) : null;
  }

  function telefono(v) {
    const s = String(v || '').replace(/[^\d+ ()-]/g, '').trim();
    return /\d{7,}/.test(s.replace(/\D/g, '')) ? s.slice(0, 30) : null;
  }

  const dia = (v) => (DIA.test(String(v || '')) ? String(v) : null);
  const instante = (v) => (v && !Number.isNaN(Date.parse(v)) ? new Date(v).toISOString() : null);
  const idValido = (v) => (ID.test(String(v || '')) ? String(v) : null);

  // Sin ids repetidos y con un máximo.
  function unicos(lista, normalizar, max) {
    const vistos = new Set();
    return (Array.isArray(lista) ? lista : [])
      .map(normalizar)
      .filter((x) => x && !vistos.has(x.id) && vistos.add(x.id))
      .slice(0, max);
  }

  function normalizarTarea(x) {
    const id = idValido(x && x.id);
    const titulo = texto(x && x.titulo, 120);
    if (!id || !titulo) return null;
    const hecha = x.hecha === true;
    return {
      id,
      titulo,
      etapa: ETAPAS.some((e) => e.id === x.etapa) ? x.etapa : ETAPAS[0].id,
      nota: texto(x.nota, 300),
      hecha,
      hechaEn: hecha ? instante(x.hechaEn) : null,
      ir: VISTAS.includes(x.ir) ? x.ir : null,
    };
  }

  function normalizarPartida(x) {
    const id = idValido(x && x.id);
    const concepto = texto(x && x.concepto, 80);
    if (!id || !concepto) return null;
    return {
      id,
      categoria: CATEGORIAS[x.categoria] ? x.categoria : 'otros',
      concepto,
      estimado: pesos(x.estimado),
      costo: pesos(x.costo),
      pagado: pesos(x.pagado),
      vence: dia(x.vence),
      proveedor: idValido(x.proveedor),
      nota: texto(x.nota, 300),
    };
  }

  function normalizarProveedor(x) {
    const id = idValido(x && x.id);
    const nombre = texto(x && x.nombre, 80);
    if (!id || !nombre) return null;
    return {
      id,
      nombre,
      categoria: CATEGORIAS[x.categoria] ? x.categoria : 'otros',
      estado: ESTADOS[x.estado] ? x.estado : 'evaluando',
      contacto: texto(x.contacto, 80),
      telefono: telefono(x.telefono),
      correo: correo(x.correo),
      web: enlace(x.web),
      precio: pesos(x.precio),
      nota: texto(x.nota, 600),
    };
  }

  const NORMALIZAR = {
    tareas: (d) => ({ lista: unicos(d && d.lista, normalizarTarea, 300) }),
    presupuesto: (d) => ({ total: pesos(d && d.total), partidas: unicos(d && d.partidas, normalizarPartida, 300) }),
    proveedores: (d) => ({ lista: unicos(d && d.lista, normalizarProveedor, 200) }),
  };

  function normalizar(clave, datos) {
    if (!NORMALIZAR[clave]) throw new Error(`No existe la herramienta «${clave}».`);
    return NORMALIZAR[clave](datos || {});
  }

  function nuevoId() {
    const bytes = new Uint8Array(10);
    crypto.getRandomValues(bytes);
    return 'x' + Array.from(bytes, (b) => (b % 36).toString(36)).join('');
  }

  // ---------- Dinero ----------

  const FORMATO = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });
  const dinero = (n) => (n == null ? '' : FORMATO.format(n));

  // '1.500.000', '$ 1,500,000' o '1500000' → 1500000.
  function leerPesos(s) {
    const d = String(s || '').replace(/\D/g, '');
    return d ? pesos(d.slice(0, 11)) : null;
  }

  // Lo que se espera gastar: el costo final si ya se sabe; si no, el estimado.
  const costoDe = (p) => (p.costo != null ? p.costo : p.estimado || 0);
  const saldoDe = (p) => Math.max(0, costoDe(p) - (p.pagado || 0));

  function cuentas(partidas) {
    return partidas.reduce((t, p) => {
      t.estimado += p.estimado || 0;
      t.costo += costoDe(p);
      t.pagado += p.pagado || 0;
      t.porPagar += saldoDe(p);
      return t;
    }, { estimado: 0, costo: 0, pagado: 0, porPagar: 0 });
  }

  // ---------- Fechas de la agenda ----------

  // 'AAAA-MM-DD' movido unos meses o días, sin salirse del mes.
  function mover(iso, { meses = 0, dias = 0 }) {
    const [a, m, d] = iso.split('-').map(Number);
    const ultimo = new Date(Date.UTC(a, m - 1 + meses + 1, 0)).getUTCDate();
    const f = new Date(Date.UTC(a, m - 1 + meses, limitar(d, 1, ultimo)));
    f.setUTCDate(f.getUTCDate() + dias);
    return f.toISOString().slice(0, 10);
  }

  // Hasta cuándo va cada etapa, con la fecha de la boda. Sin fecha, null.
  function limites(fechaBoda) {
    if (!DIA.test(String(fechaBoda || ''))) return null;
    const r = {};
    ETAPAS.forEach((e, i) => {
      r[e.id] = { desde: i ? r[ETAPAS[i - 1].id].hasta : null, hasta: mover(fechaBoda, e.hasta) };
    });
    return r;
  }

  // Hoy en Colombia, como 'AAAA-MM-DD'.
  function hoy() {
    return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Bogota' }).format(new Date());
  }

  window.Planeador = {
    CATEGORIAS,
    ESTADOS,
    ETAPAS,
    VISTAS,
    TAREAS_SUGERIDAS,
    PARTIDAS_SUGERIDAS,
    normalizar,
    nuevoId,
    dinero,
    leerPesos,
    costoDe,
    saldoDe,
    cuentas,
    limites,
    hoy,
  };
})();
