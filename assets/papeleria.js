/*
 * Piezas de papelería compartidas: iconos, sello postal, matasellos, formatos
 * de fecha y hora, y enlaces de mapas.
 */
(function () {
  const TRAZOS = {
    copiar: '<rect x="8.5" y="8.5" width="11" height="11" rx="2"/><path d="M15.5 8.5V6.5a2 2 0 0 0-2-2h-7a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h2"/>',
    whatsapp: '<path d="M4.6 19.4l1.1-3.6A7.9 7.9 0 1 1 8.6 18.6z"/><path d="M9.3 8.6c.2-.5.5-.5.8-.5h.5c.2 0 .4.1.5.4l.6 1.5c.1.2 0 .5-.1.6l-.5.6c.6 1.1 1.4 1.9 2.5 2.5l.6-.5c.2-.2.4-.2.6-.1l1.5.6c.3.1.4.3.4.5v.5c0 .3 0 .6-.5.8-.6.3-1.7.5-3.3-.4a8.6 8.6 0 0 1-3.2-3.2c-.9-1.6-.7-2.7-.4-3.3z"/>',
    editar: '<path d="M14.5 5.5l4 4"/><path d="M4.5 19.5l1-4.2L15.8 5a1.8 1.8 0 0 1 2.6 0l.6.6a1.8 1.8 0 0 1 0 2.6L8.7 18.5z"/>',
    eliminar: '<path d="M4.5 7h15"/><path d="M9.5 7V5.2c0-.4.3-.7.7-.7h3.6c.4 0 .7.3.7.7V7"/><path d="M6.5 7l.8 11.3c.1.7.6 1.2 1.3 1.2h6.8c.7 0 1.2-.5 1.3-1.2L17.5 7"/><path d="M10 10.5v5.5M14 10.5v5.5"/>',
    buscar: '<circle cx="10.5" cy="10.5" r="6"/><path d="M15 15l4.5 4.5"/>',
    mas: '<path d="M12 5v14M5 12h14"/>',
    menos: '<path d="M5 12h14"/>',
    ojo: '<path d="M2.8 12s3.4-6.2 9.2-6.2 9.2 6.2 9.2 6.2-3.4 6.2-9.2 6.2S2.8 12 2.8 12z"/><circle cx="12" cy="12" r="2.6"/>',
    mapa: '<path d="M12 20.5s6.5-5.6 6.5-11a6.5 6.5 0 0 0-13 0c0 5.4 6.5 11 6.5 11z"/><circle cx="12" cy="9.5" r="2.3"/>',
    calendario: '<rect x="4" y="5.5" width="16" height="14" rx="2"/><path d="M4 10h16M8.5 3.5v4M15.5 3.5v4"/>',
    descargar: '<path d="M12 4.5v10M7.5 10.5l4.5 4.5 4.5-4.5"/><path d="M5 17.5v1a1.5 1.5 0 0 0 1.5 1.5h11a1.5 1.5 0 0 0 1.5-1.5v-1"/>',
    subir: '<path d="M12 15V5M7.5 9.5L12 5l4.5 4.5"/><path d="M5 17.5v1a1.5 1.5 0 0 0 1.5 1.5h11a1.5 1.5 0 0 0 1.5-1.5v-1"/>',
    salir: '<path d="M14 5h3.5A1.5 1.5 0 0 1 19 6.5v11a1.5 1.5 0 0 1-1.5 1.5H14"/><path d="M10 8l-4 4 4 4M6 12h9"/>',
    actualizar: '<path d="M19 12a7 7 0 0 1-12.1 4.8M5 12a7 7 0 0 1 12.1-4.8"/><path d="M17.5 3.8v3.6h-3.6M6.5 20.2v-3.6h3.6"/>',
    cerrar: '<path d="M6.5 6.5l11 11M17.5 6.5l-11 11"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    sobre: '<rect x="3.5" y="6" width="17" height="12" rx="1.5"/><path d="M4 6.8l8 6 8-6"/>',
    enlace: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
    flecha: '<path d="M6 9l6 6 6-6"/>',
    orden: '<path d="M8 10l4-4 4 4M8 14l4 4 4-4"/>',
    reloj: '<circle cx="12" cy="12" r="8"/><path d="M12 7.5V12l3 2"/>',
    waze: '<path d="M6.4 16.3c-1.8-.5-2.9-1.8-2.9-3.4 1.1 0 1.6-.7 1.8-2.2.5-3.6 3.3-5.9 7-5.9 4.1 0 7.2 3 7.2 6.8 0 2.4-1.4 4.2-3.7 5.1"/><path d="M9.8 17.8h3.6"/><circle cx="8" cy="18" r="1.7"/><circle cx="15.2" cy="18" r="1.7"/><path d="M10.6 12.8c.9.9 2.6.9 3.5 0"/><path d="M10.4 9.6v.3M14.4 9.6v.3"/>',
    navegar: '<path d="M19.5 4.5L4.5 11l6.6 1.9 1.9 6.6z"/>',
    externo: '<path d="M14 5h5v5M19 5l-7.5 7.5"/><path d="M17.5 13.5v4a1.5 1.5 0 0 1-1.5 1.5H6.5A1.5 1.5 0 0 1 5 17.5V8a1.5 1.5 0 0 1 1.5-1.5h4"/>',
    subir_fila: '<path d="M6.5 14.5L12 9l5.5 5.5"/>',
    bajar_fila: '<path d="M6.5 9.5L12 15l5.5-5.5"/>',
    foto: '<rect x="3.5" y="5" width="17" height="14" rx="2"/><circle cx="9" cy="10" r="1.8"/><path d="M4 17.5l5-5 4 4 2.5-2.5 4.5 4.5"/>',
    antes: '<path d="M14.5 6.5L9 12l5.5 5.5"/>',
    despues: '<path d="M9.5 6.5L15 12l-5.5 5.5"/>',
    guardar: '<path d="M5.5 4.5h10l3 3v11a1.5 1.5 0 0 1-1.5 1.5H7a1.5 1.5 0 0 1-1.5-1.5z"/><path d="M8.5 4.5v4h6v-4M8.5 20v-5.5h7V20"/>',
    mesa: '<circle cx="12" cy="12" r="4.8"/><circle cx="12" cy="3.9" r="1.5"/><circle cx="12" cy="20.1" r="1.5"/><circle cx="3.9" cy="12" r="1.5"/><circle cx="20.1" cy="12" r="1.5"/>',
    mesa_larga: '<rect x="4" y="9.3" width="16" height="5.4" rx="1"/><circle cx="8" cy="5.2" r="1.5"/><circle cx="12" cy="5.2" r="1.5"/><circle cx="16" cy="5.2" r="1.5"/><circle cx="8" cy="18.8" r="1.5"/><circle cx="12" cy="18.8" r="1.5"/><circle cx="16" cy="18.8" r="1.5"/>',
    espacio: '<path d="M4.5 8V5.8c0-.7.6-1.3 1.3-1.3H8M16 4.5h2.2c.7 0 1.3.6 1.3 1.3V8M19.5 16v2.2c0 .7-.6 1.3-1.3 1.3H16M8 19.5H5.8c-.7 0-1.3-.6-1.3-1.3V16"/><path d="M11 4.5h2M11 19.5h2M4.5 11v2M19.5 11v2"/>',
    regalo: '<rect x="4" y="9" width="16" height="4" rx="1"/><path d="M5.5 13v5.5a1.5 1.5 0 0 0 1.5 1.5h10a1.5 1.5 0 0 0 1.5-1.5V13M12 9v11"/><path d="M12 9c-1.2-2.6-4.6-4.4-5.6-2.4C5.6 8.2 9 9 12 9zM12 9c1.2-2.6 4.6-4.4 5.6-2.4.8 1.6-2.6 2.4-5.6 2.4z"/>',
    telefono: '<path d="M8.2 4.5h-2a1.5 1.5 0 0 0-1.5 1.6c.6 7.2 6 12.6 13.2 13.2a1.5 1.5 0 0 0 1.6-1.5v-2.1a1 1 0 0 0-.7-1l-2.7-.9a1 1 0 0 0-1.1.3l-1.2 1.4a11 11 0 0 1-4.8-4.8l1.4-1.2a1 1 0 0 0 .3-1.1l-.9-2.7a1 1 0 0 0-1-.7z"/>',
    cama: '<path d="M3.5 18.5v-12M3.5 15h17v3.5"/><path d="M20.5 15v-2.5a2.5 2.5 0 0 0-2.5-2.5h-7.5v5"/><circle cx="7" cy="11.8" r="1.8"/>',
    tarea: '<rect x="4.5" y="4.5" width="15" height="15" rx="2"/><path d="M8.5 12.2l2.4 2.4 4.6-5"/>',
    dinero: '<rect x="3.5" y="7" width="17" height="10" rx="1.5"/><circle cx="12" cy="12" r="2.4"/><path d="M6.5 10v4M17.5 10v4"/>',
    tienda: '<path d="M4.5 9.5h15l-1.2-4h-12.6z"/><path d="M5.5 9.5v9h13v-9"/><path d="M10 18.5v-5h4v5"/>',
  };

  function icono(nombre, clase) {
    return `<svg class="icono${clase ? ' ' + clase : ''}" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${TRAZOS[nombre] || ''}</svg>`;
  }

  // Sello postal del ramo: rosas, lirios de perfil y cinta, en blanco sobre el
  // color de la paleta (verde por defecto; ver Estilos.PALETAS).
  function sello(colores) {
    const c = Object.assign({ fondo: '#24493a', marco: '#a3bcaa', hoja: '#6f9a80', flor: '#f6f5ef', florSombra: '#dfe7e1' }, colores);
    const rosa = (x, y, r, g) => `<g transform="translate(${x} ${y}) rotate(${g})">
        <circle r="${r}" fill="${c.flor}"/>
        <path d="M${-r * 0.5} ${r * 0.1}c0-${r * 0.6} ${r * 0.9}-${r * 0.75} ${r}-${r * 0.1}M${-r * 0.2} ${r * 0.15}c0-${r * 0.3} ${r * 0.45}-${r * 0.35} ${r * 0.45} 0M${-r * 0.75} ${r * 0.45}c${r * 0.5} ${r * 0.35} ${r * 1.1} ${r * 0.3} ${r * 1.4}-${r * 0.15}" fill="none" stroke="${c.fondo}" stroke-width=".8" stroke-linecap="round"/>
      </g>`;
    const lirio = (x, y, g) => `<g transform="translate(${x} ${y}) rotate(${g})">
        <path d="M-1.6 0c-.4-3-1-5.5-2.6-8h8.4c-1.6 2.5-2.2 5-2.6 8z" fill="${c.florSombra}"/>
        <path d="M-4-7.6c-4-2.4-7-5.6-11.5-6 2 1.6 3 3.4 4.6 4.8 2.2 1.8 4.4 2.4 6.9 2.7z" fill="${c.flor}"/>
        <path d="M4-7.6c4-2.4 7-5.6 11.5-6-2 1.6-3 3.4-4.6 4.8-2.2 1.8-4.4 2.4-6.9 2.7z" fill="${c.flor}"/>
        <path d="M-3.4-7c-1.4-3.6-.4-7.4 3.4-10.4 3.8 3 4.8 6.8 3.4 10.4-2.2 1-4.6 1-6.8 0z" fill="${c.flor}"/>
        <path d="M0-9l-3.6-9.5M0-9l.2-11M0-9l3.8-9.4" stroke="${c.flor}" stroke-width=".6" stroke-linecap="round"/>
        <circle cx="-3.6" cy="-18.8" r=".9" fill="#e8b44c"/><circle cx=".2" cy="-20.4" r=".9" fill="#e8b44c"/><circle cx="3.8" cy="-18.7" r=".9" fill="#e8b44c"/>
      </g>`;
    return `<svg viewBox="0 0 70 86" aria-hidden="true" focusable="false">
      <rect width="70" height="86" fill="${c.fondo}"/>
      <rect x="3.5" y="3.5" width="63" height="79" fill="none" stroke="${c.marco}" stroke-width=".8"/>
      <g stroke="${c.marco}" stroke-width=".9" stroke-linecap="round" fill="none">
        <path d="M35 58L26 40M35 58l-3-22M35 58l2-24M35 58l8-20M35 58l12-26M35 58l-15-24M35 58v13M35 58l-3 12M35 58l3 12"/>
      </g>
      <g fill="${c.hoja}">
        <path d="M23 46c-6-1-10-4-11-8 5 0 9 3 11 8z"/><path d="M47 45c6-1 10-4 11-8-5 0-9 3-11 8z"/>
      </g>
      ${lirio(20, 34, -38)}${lirio(51, 31, 36)}${lirio(35, 24, 4)}
      ${rosa(28, 41, 5.6, -10)}${rosa(42, 40, 5.8, 20)}${rosa(35, 47, 5.2, 0)}
      <g fill="${c.flor}">
        <path d="M35 58c-4-3-8-3-9 0 1 2 5 2 9 0zM35 58c4-3 8-3 9 0-1 2-5 2-9 0z"/>
        <path d="M34 58l-3 9 2-.5.5 2 2-10.5zM36 58l3 9-2-.5-.5 2-2-10.5z" opacity=".9"/>
        <circle cx="35" cy="58" r="1.6"/>
      </g>
      <text x="35" y="79" text-anchor="middle" font-family="Castoro Titling, serif" font-size="6.4" letter-spacing="1.2" fill="${c.flor}">COLOMBIA</text>
      <text x="8" y="13" font-family="Castoro Titling, serif" font-size="7" fill="${c.flor}">D·E</text>
    </svg>`;
  }

  const MESES = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];

  function fechaSello(iso) {
    const d = iso ? new Date(iso) : new Date();
    return { dia: String(d.getDate()).padStart(2, '0'), mes: MESES[d.getMonth()], anio: String(d.getFullYear()) };
  }

  let serie = 0;
  function matasellos({ texto = 'RESPONDIDO', fecha, ondas = true, textura = true } = {}) {
    const f = fechaSello(fecha);
    const id = `ms${serie++}${Math.floor(Math.random() * 1e5)}`;
    return `<svg class="matasellos" viewBox="0 0 ${ondas ? 190 : 104} 104" aria-hidden="true" focusable="false">
      <defs>
        <filter id="${id}-t" x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" seed="${serie}" result="r"/>
          <feDisplacementMap in="SourceGraphic" in2="r" scale="2.4" result="d"/>
          <feColorMatrix in="r" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.1 1.4" result="m"/>
          <feComposite in="d" in2="m" operator="in"/>
        </filter>
        <path id="${id}-a" d="M14 52a38 38 0 0 1 76 0"/>
        <path id="${id}-b" d="M18 52a34 34 0 0 0 68 0"/>
      </defs>
      <g${textura ? ` filter="url(#${id}-t)"` : ''}>
        <circle cx="52" cy="52" r="47" fill="none" stroke="currentColor" stroke-width="2.4"/>
        <circle cx="52" cy="52" r="31" fill="none" stroke="currentColor" stroke-width="1.6"/>
        <text font-size="10.5" letter-spacing="2.4"><textPath href="#${id}-a" startOffset="50%" text-anchor="middle">${texto}</textPath></text>
        <text font-size="8.5" letter-spacing="2.2"><textPath href="#${id}-b" startOffset="50%" text-anchor="middle" side="left">DIEGO · ERIKA</textPath></text>
        <text x="52" y="49" text-anchor="middle" font-size="17"><tspan class="cifra">${f.dia}</tspan> ${f.mes}</text>
        <text x="52" y="64" text-anchor="middle" font-size="11" letter-spacing="2" class="cifra">${f.anio}</text>
        ${ondas ? `<g fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round">
          <path d="M104 30c9-7 18 7 27 0s18 7 27 0 18 7 27 0"/>
          <path d="M104 46c9-7 18 7 27 0s18 7 27 0 18 7 27 0"/>
          <path d="M104 62c9-7 18 7 27 0s18 7 27 0 18 7 27 0"/>
          <path d="M104 78c9-7 18 7 27 0s18 7 27 0 18 7 27 0"/>
        </g>` : ''}
      </g>
    </svg>`;
  }

  function numeroSobre(n) {
    return String(n || 0).padStart(3, '0');
  }

  function escapar(t) {
    return String(t == null ? '' : t).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  // ---------- Fecha y hora de la boda (siempre en hora de Colombia) ----------

  const ZONA = 'America/Bogota';

  // Instante de la ceremonia, o null si falta el día. Sin hora, mediodía.
  function fechaEvento(ev) {
    if (!ev || !ev.fecha) return null;
    const d = new Date(`${ev.fecha}T${ev.hora || '12:00'}:00-05:00`);
    return Number.isNaN(d.getTime()) ? null : d;
  }

  function fechaLarga(d) {
    const s = new Intl.DateTimeFormat('es-CO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: ZONA }).format(d).replace(',', '');
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  function diaMes(iso) {
    const d = new Date(`${iso}T12:00:00-05:00`);
    if (Number.isNaN(d.getTime())) return null;
    return new Intl.DateTimeFormat('es-CO', { day: 'numeric', month: 'long', timeZone: ZONA }).format(d);
  }

  // '16:00' → '4:00 p. m.'
  function horaBonita(h) {
    if (!h) return null;
    const d = new Date(`2000-01-01T${h}:00-05:00`);
    if (Number.isNaN(d.getTime())) return h;
    return new Intl.DateTimeFormat('es-CO', { hour: 'numeric', minute: '2-digit', timeZone: ZONA }).format(d);
  }

  // ---------- Cómo llegar: enlaces para cada app de mapas ----------

  function destino(l, ciudad) {
    if (!l) return null;
    const coords = l.lat != null && l.lng != null ? `${l.lat},${l.lng}` : null;
    const texto = [l.lugar, l.direccion, ciudad].filter(Boolean).join(', ');
    if (!coords && !l.lugar && !l.direccion && !l.mapa) return null;
    return { coords, texto, nombre: l.lugar || '', placeId: l.placeId || '', mapa: l.mapa || '' };
  }

  function mapas(l, ciudad) {
    const d = destino(l, ciudad);
    if (!d) return null;
    const q = encodeURIComponent(d.coords || d.texto);
    const google = d.mapa || `https://www.google.com/maps/dir/?api=1&destination=${q}${d.placeId ? `&destination_place_id=${encodeURIComponent(d.placeId)}` : ''}`;
    const waze = d.coords
      ? `https://waze.com/ul?ll=${encodeURIComponent(d.coords)}&navigate=yes`
      : `https://waze.com/ul?q=${encodeURIComponent(d.texto)}&navigate=yes`;
    const apple = `https://maps.apple.com/?daddr=${q}${d.nombre ? `&q=${encodeURIComponent(d.nombre)}` : ''}`;
    // Mapa embebido de Google Maps (no necesita clave). Solo con pin: buscado
    // por texto puede caer en otro lugar con un nombre parecido.
    const previa = `https://maps.google.com/maps?q=${q}&z=16&hl=es&output=embed`;
    return { google, waze, apple, embebido: d.coords ? previa : '', previa, texto: d.texto };
  }

  // ---------- Fotos de la pareja: dónde va cada una ----------

  // Se reparten por la invitación en el orden del panel: una junto a los
  // detalles, otra junto al itinerario, otra junto a la historia (si la hay) y
  // otra junto a la respuesta; las demás van juntas antes de la vestimenta.
  const LUGARES_FOTO = {
    detalles: 'Junto a «Los detalles»',
    itinerario: 'Junto al itinerario',
    historia: 'Junto a «Nuestra historia»',
    responder: 'Junto a la respuesta',
    momentos: 'Con las otras fotos, antes de la vestimenta',
  };

  function lugaresFotos(cuantas, conHistoria) {
    const pliegos = ['detalles', 'itinerario'].concat(conHistoria ? ['historia'] : [], ['responder']);
    return Array.from({ length: cuantas }, (_, i) => pliegos[i] || 'momentos');
  }

  window.Papeleria = { icono, sello, matasellos, numeroSobre, escapar, fechaSello, fechaEvento, fechaLarga, diaMes, horaBonita, mapas, LUGARES_FOTO, lugaresFotos };
})();
