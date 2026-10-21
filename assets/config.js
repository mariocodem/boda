/*
 * Configuración de la boda. Todo lo que cambia entre "por confirmar" y el dato
 * real vive aquí; el diseño no necesita tocarse.
 *
 * Fecha, lugares, itinerario, vestimenta y regalos también se editan desde el
 * panel (pestaña «La boda»). Lo que se guarde allí reemplaza lo de este archivo.
 *
 * Un valor en null se muestra en la invitación como «Por confirmar».
 */
window.BODA = {
  pareja: {
    uno: { nombre: 'Diego', apellido: 'Triana' },
    dos: { nombre: 'Erika', apellido: 'Ramos' },
  },

  // Día de la boda ('2027-03-20') y hora de la ceremonia en 24 horas ('16:00'),
  // en hora de Colombia.
  fecha: null,
  hora: null,
  ciudad: null,

  // Hasta cuándo pueden responder los invitados. Ejemplo: '2027-02-20'
  fechaLimiteRespuesta: null,

  // lat y lng los llena el panel al buscar el lugar en Google Maps.
  // mapa: enlace propio de Google Maps (opcional); si está, se usa tal cual.
  ceremonia: {
    lugar: null,      // 'Parroquia de ...'
    direccion: null,  // 'Calle 00 # 00-00, Barrio'
    lat: null,
    lng: null,
    placeId: null,
    mapa: null,
  },

  recepcion: {
    mismoLugar: false, // true: la recepción es en el mismo sitio de la ceremonia
    hora: null,        // '19:00'
    lugar: null,
    direccion: null,
    lat: null,
    lng: null,
    placeId: null,
    mapa: null,
  },

  // Momentos del día, en orden. Vacío = se arma con la ceremonia y la recepción.
  // Ejemplo: [{ hora: '16:00', titulo: 'Ceremonia', detalle: 'Parroquia de ...' }]
  itinerario: [],

  vestimenta: {
    codigo: null,   // 'Formal'
    nota: null,     // 'Evitar el blanco, que es de la novia.' (por ejemplo)
  },
  regalos: null,    // 'Lluvia de sobres el día de la boda.' (por ejemplo)

  // WhatsApp para dudas de los invitados, con indicativo: '573001234567'
  contacto: { whatsapp: null, nombre: null },

  // Video del camino al altar, controlado por el scroll: uno horizontal para
  // pantallas anchas y uno vertical para teléfonos (ver video/FUENTE.md).
  // inicio: cuadro que se ve mientras carga. final: el que queda cuando el
  // invitado pidió reducir el movimiento.
  video: {
    horizontal: {
      archivo: 'video/altar-horizontal.mp4',
      inicio: 'video/altar-horizontal-inicio.jpg',
      final: 'video/altar-horizontal-final.jpg',
    },
    vertical: {
      archivo: 'video/altar-vertical.mp4',
      inicio: 'video/altar-vertical-inicio.jpg',
      final: 'video/altar-vertical-final.jpg',
    },
  },

  // Estilo de la invitación: paleta de colores y familia de letra. Se cambia
  // desde el panel (pestaña «La boda» → Estilo). Paletas: verde, rosa, lavanda,
  // cielo, durazno, salvia. Letras: grabada, romana, romantica, fina.
  estilo: { paleta: 'verde', letra: 'grabada' },

  // Fotos: se suben desde el panel (pestaña «La boda»). Lo que se suba allí
  // reemplaza esto. También sirve poner aquí rutas a archivos de la carpeta
  // fotos/, por ejemplo:
  //   fotoPortada: { archivo: 'fotos/portada.jpg', encuadre: '50% 30%' },
  //   fotos: [{ archivo: 'fotos/pareja-1.jpg', forma: 'vertical' }],
  // encuadre: qué parte de la foto queda a la vista dentro del arco.
  fotoPortada: null,
  fotos: [],

  // Google Maps para el panel: búsqueda de lugares con autocompletado y pin que
  // se puede mover. Clave de navegador con «Maps JavaScript API» y «Places API
  // (New)» activas, restringida a la dirección de tu sitio (ver LEEME.md).
  // Sin clave, el panel busca igual en un mapa de Google, sin autocompletado.
  googleMaps: {
    apiKey: '',
    mapId: '',  // opcional; vacío usa el mapa de demostración de Google
  },

  // Supabase. Vacío = modo local (los datos viven solo en este navegador).
  // Copia aquí la URL del proyecto y la clave pública "anon" (Settings → API).
  supabase: {
    url: '',
    anonKey: '',
  },

  // Clave del panel en modo local. No protege nada de verdad: es solo para
  // probar. Con Supabase el panel usa correo y contraseña.
  claveLocal: 'diegoyerika',

  // Dirección pública de la invitación, para generar los enlaces personales.
  // Vacío = se deduce de la dirección donde está abierto el panel.
  urlInvitacion: '',
};
