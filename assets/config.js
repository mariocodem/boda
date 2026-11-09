/*
 * Configuración de la boda. Todo lo que cambia entre "por confirmar" y el dato
 * real vive aquí; el diseño no necesita tocarse.
 *
 * Fecha, lugares, alojamiento, itinerario, historia, vestimenta, regalos y
 * preguntas también se editan desde el panel (pestaña «La boda»), y el estilo
 * y la página desde «Diseño». Lo que se guarde allí reemplaza lo de este
 * archivo.
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
    codigo: 'Formal / Elegante',
    nota: null,     // 'Evitar el blanco, que es de la novia.' (por ejemplo)
  },
  regalos: null,    // 'Lluvia de sobres el día de la boda.' (por ejemplo)
  // Cuenta para regalos en dinero (opcional): sin número no aparece.
  // { banco: 'Bancolombia', tipo: 'Ahorros', numero: '000-000000-00', titular: 'Erika Ramos', documento: null }
  cuentaRegalos: null,
  // Mesas de regalos de una tienda: [{ nombre: 'Falabella', enlace: 'https://…' }]
  listasRegalos: [],

  // Nuestra historia: texto libre; una línea en blanco separa los párrafos.
  historia: null,

  // Hoteles cerca, para quienes vienen de lejos. Sin hoteles no aparece.
  // hoteles: [{ nombre: 'Hotel …', direccion: '…', enlace: 'https://…', nota: 'Tarifa especial' }]
  alojamiento: { nota: null, hoteles: [] },

  // Preguntas frecuentes: [{ pregunta: '¿Pueden ir niños?', respuesta: '…' }]
  preguntas: [],

  // Preguntas opcionales de la tarjeta de respuesta.
  respuesta: { alergias: false, cancion: false },

  // WhatsApp para dudas de los invitados, con indicativo: '573001234567'
  contacto: { whatsapp: null, nombre: null },

  // Estilo de la invitación: paleta de colores y familia de letra. Se cambia
  // desde el panel (pestaña «Diseño» → Tema). Paletas: verde, rosa, lavanda,
  // cielo, durazno, salvia, terracota, vino, marfil, bosque, rosapolvo, o libre con su color (paleta:
  // 'libre', color: '#c9a3b5'). Letras: grabada, romana, romantica, fina,
  // editorial, victoriana, cinzel; la del texto puede ser otra (letraTexto: 'editorial').
  // El tema, el fondo, el trato, los textos y el orden de los bloques también
  // se arman en «Diseño» (ver assets/pagina.js).
  // Desde 2026-11-06 el de arranque es el del tema Vino & Marfil.
  estilo: { paleta: 'marfil', letra: 'cinzel' },

  // La mariposa de papel dorado que se posa en el ramo y acompaña al bajar.
  // false la quita (también se apaga desde el panel, en Diseño → Tema).
  mariposa: true,

  // Fotos: se suben desde el panel (pestaña «La boda»). Lo que se suba allí
  // reemplaza esto. Las de la pareja se reparten por la invitación, en orden:
  // las tres primeras en el álbum, justo después de la tarjeta (la primera
  // grande); después, junto a los detalles, al itinerario, a la historia y a la
  // respuesta (en el orden de sus bloques); las demás van juntas. También sirve
  // poner aquí rutas a archivos de la carpeta fotos/, por ejemplo:
  //   fotoPortada: { archivo: 'fotos/portada.jpg', encuadre: '50% 30%' },
  //   fotos: [{ archivo: 'fotos/pareja-1.jpg', forma: 'vertical' }],
  // encuadre: qué parte de la foto queda a la vista dentro del arco (en la
  // principal) o en la ventana del marco del cierre (en las de la pareja).
  // Las de Diego y Erika que vinieron en fotos/ (2026-11-05). El álbum se lleva
  // las tres primeras: en ellas la pareja está al centro, que es lo que queda
  // a la vista en una ventana ovalada. La del lago va junto a los detalles,
  // donde se ve entera, y en el marco del cierre (Vino & Marfil), donde la
  // pareja está a la izquierda: por eso su encuadre la corre al borde.
  // La del bosque a color va en el arco de la tarjeta.
  // fotosArranque: al cambiar estas fotos, cambia también esta fecha: así
  // reemplazan una vez a las que estuvieran guardadas desde el panel.
  fotosArranque: '2026-11-05',
  fotoPortada: { archivo: 'fotos/pareja-bosque.jpg', encuadre: '58% 50%' },
  fotos: [
    { archivo: 'fotos/pareja-retrato.jpg', forma: 'horizontal' },
    { archivo: 'fotos/pareja-bosque-bn.jpg', forma: 'horizontal' },
    { archivo: 'fotos/pareja-flores.jpg', forma: 'horizontal' },
    { archivo: 'fotos/pareja-lago.jpg', forma: 'horizontal', encuadre: '0% 50%' },
  ],

  // Google Maps para el panel: búsqueda de lugares con autocompletado y pin que
  // se puede mover. Clave de navegador con «Maps JavaScript API» y «Places API
  // (New)» activas, restringida a la dirección de tu sitio (ver LEEME.md).
  // Sin clave, el panel busca igual en un mapa de Google, sin autocompletado.
  googleMaps: {
    apiKey: '',
    mapId: '',  // opcional; vacío usa el mapa de demostración de Google
  },

  // Entrar al panel con Google, y con esa misma cuenta pasar las tareas a
  // Google Calendar: el ID de cliente de OAuth (tipo «Aplicación web»), que
  // termina en .apps.googleusercontent.com. Es público por diseño, como la
  // clave de Maps: lo protege la lista de «Orígenes de JavaScript autorizados»
  // en Google Cloud. Nunca pongas aquí el «secreto del cliente»: en modo local
  // no hace falta, y con Supabase va solo en Supabase. Con Supabase, Google
  // también se activa allá (ver README, «Entrar con Google y Google Calendar»).
  // Vacío = el panel entra solo con la clave (o correo y contraseña).
  google: {
    clientId: '501068896688-n2usoucqsuriptb6j1jtr7sf8i7r0kho.apps.googleusercontent.com',
  },

  // Supabase. Vacío = modo local (los datos viven solo en este navegador).
  // Copia aquí la URL del proyecto y la clave pública "anon" (Settings → API).
  supabase: {
    url: '',
    anonKey: '',
  },

  // Clave del panel en modo local. No protege nada de verdad: es solo para
  // probar. Con Supabase el panel usa correo y contraseña, o Google.
  claveLocal: 'diegoyerika',

  // Dirección pública de la invitación, para generar los enlaces personales.
  // Vacío = se deduce de la dirección donde está abierto el panel.
  urlInvitacion: '',
};
