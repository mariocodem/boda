/*
 * El asistente de configuración del panel (2026-11-06): los diez pasos para
 * dejar lista la invitación, en orden, con lo que falta en cada uno y un botón
 * que lleva al lugar donde se completa (La boda, Diseño o Invitados). No
 * repite los formularios: los señala. Se abre con el botón «Asistente» de la
 * barra y también solo, la primera vez, si la boda aún no tiene fecha.
 */
(function () {
  const D = window.Datos;
  const Pg = window.Pagina;
  const P = window.Papeleria;
  const esc = P.escapar;
  const CLAVE_VISTO = 'boda-diego-erika:asistente-visto';

  // Cada paso: dónde se hace y cómo saber si ya está.
  const PASOS = [
    { titulo: 'La pareja y la fecha', ayuda: 'El día, la hora de la ceremonia y la ciudad.', ir: ['boda', '#hoja-fecha'], listo: (e) => Boolean(e.fecha && e.hora), falta: 'Falta la fecha o la hora.' },
    { titulo: 'Tema y colores', ayuda: 'Vino & Marfil, Victoriano, Pliegos o Editorial; la paleta y las letras.', ir: ['diseno', '[data-diseno-pestana="tema"], [data-pestana="tema"]'], listo: () => true, estado: (e) => `Tema: ${(Pg.TEMAS[e.pagina.tema] || {}).nombre || e.pagina.tema}.` },
    { titulo: 'Lugares', ayuda: 'La ceremonia y la recepción, con su mapa.', ir: ['boda', '#hoja-ceremonia'], listo: (e) => Boolean(e.ceremonia && e.ceremonia.lugar), falta: 'Falta el lugar de la ceremonia.' },
    { titulo: 'Itinerario', ayuda: 'Los momentos del día; el icono sale solo de cada título.', ir: ['boda', '#hoja-itinerario'], listo: (e) => Boolean(e.itinerario && e.itinerario.length), falta: 'Sin momentos: se arma con la ceremonia y la recepción.' },
    { titulo: 'Código de vestimenta', ayuda: 'El código, y en Diseño → Vestimenta: los colores de los vestidos y de los trajes, qué evitar y los detalles.', ir: ['boda', '#hoja-vestimenta'], listo: (e) => Boolean(e.vestimenta && e.vestimenta.codigo), falta: 'Falta el código.' },
    { titulo: 'Fotos', ayuda: 'La foto principal y hasta seis de la pareja (las tres primeras van en la portada).', ir: ['boda', '#hoja-portada'], listo: (e) => Boolean(e.fotoPortada && (e.fotos || []).length >= 3), falta: 'Faltan fotos: la principal y al menos tres de la pareja.' },
    { titulo: 'Música', ayuda: 'Una canción en mp3 que suene al abrir el sobre.', ir: ['diseno', '[data-diseno-pestana="tema"], [data-pestana="tema"]'], listo: (e) => Boolean(e.pagina.musica && e.pagina.musica.archivo), falta: 'Sin canción (es opcional).' },
    { titulo: 'Regalos y respuesta', ayuda: 'El mensaje de regalos, la cuenta o las listas, y hasta cuándo pueden responder.', ir: ['boda', '#hoja-regalos'], listo: (e) => Boolean((e.regalos || e.cuentaRegalos || (e.listasRegalos || []).length) && e.fechaLimiteRespuesta), falta: 'Falta el mensaje de regalos o la fecha límite para responder.' },
    { titulo: 'Invitados', ayuda: 'La lista con sus cupos; cada uno recibe su enlace personal por WhatsApp.', ir: ['invitados', '[data-buscar]'], listo: (_, n) => n > 0, falta: 'Todavía no hay invitados.', estado: (_, n) => `${n} ${n === 1 ? 'invitación' : 'invitaciones'}.` },
    { titulo: 'Revisión final', ayuda: 'Abre la invitación como la verá un invitado, revisa cada parte y publica el diseño en Diseño.', ir: ['diseno', null], listo: () => false, falta: 'Revísala de punta a punta antes de enviar los enlaces.', ver: true },
  ];

  let dialogo = null;

  function crear() {
    dialogo = document.createElement('dialog');
    dialogo.className = 'dialogo asistente';
    dialogo.setAttribute('aria-labelledby', 'asistente-titulo');
    dialogo.innerHTML = `<div class="dialogo-form">
        <header class="dialogo-cabeza">
          <h2 id="asistente-titulo">Asistente de configuración</h2>
          <button class="boton-icono" type="button" data-cerrar aria-label="Cerrar">${P.icono('cerrar')}</button>
        </header>
        <div class="dialogo-cuerpo">
          <p class="asistente-intro">Diez pasos para dejar lista la invitación. Cada uno te lleva a donde se completa; vuelve aquí cuando quieras.</p>
          <ol class="asistente-pasos" data-asistente-pasos></ol>
        </div>
      </div>`;
    document.body.appendChild(dialogo);
    dialogo.querySelector('[data-cerrar]').addEventListener('click', () => dialogo.close());
    dialogo.addEventListener('click', (e) => {
      if (e.target === dialogo) dialogo.close();
      const b = e.target.closest('[data-ir]');
      if (!b) return;
      const paso = PASOS[Number(b.dataset.ir)];
      dialogo.close();
      ir(paso.ir[0], paso.ir[1]);
    });
  }

  function ir(vista, selector) {
    location.hash = `#${vista}`;
    if (!selector) return;
    // La pestaña se pinta al cambiar el #: el destino se busca un momento después.
    setTimeout(() => {
      const el = document.querySelector(selector);
      if (!el) return;
      if (el.matches('button, [role="tab"]')) el.click();
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      const caja = el.closest('section, fieldset, form') || el;
      const foco = el.matches('input, select, textarea, button') ? el : caja.querySelector('input:not([type=hidden]), select, textarea');
      if (foco) foco.focus({ preventScroll: true });
    }, 250);
  }

  async function abrir() {
    if (!dialogo) crear();
    const lista = dialogo.querySelector('[data-asistente-pasos]');
    lista.innerHTML = '<li class="asistente-cargando">Revisando…</li>';
    if (!dialogo.open) dialogo.showModal();
    let e = null;
    let n = 0;
    try {
      [e, n] = await Promise.all([D.evento(), D.listar().then((l) => l.length)]);
    } catch (err) {
      lista.innerHTML = `<li class="asistente-cargando">${esc(err.message)}</li>`;
      return;
    }
    const hechos = PASOS.filter((p) => p.listo(e, n)).length;
    lista.innerHTML = PASOS.map((p, i) => {
      const ok = p.listo(e, n);
      const nota = p.estado ? p.estado(e, n) : (ok ? 'Listo.' : p.falta);
      return `<li class="asistente-paso" data-hecho="${ok ? 'si' : 'no'}">
          <span class="asistente-numero" aria-hidden="true">${ok ? P.icono('check') : i + 1}</span>
          <div class="asistente-texto">
            <h3>${esc(p.titulo)}<span class="solo-lectores">${ok ? ' (listo)' : ' (pendiente)'}</span></h3>
            <p>${esc(p.ayuda)}</p>
            <p class="asistente-estado">${esc(nota)}</p>
          </div>
          ${p.ver
            ? `<a class="boton boton-secundario" href="index.html" target="_blank" rel="noopener">Ver la invitación</a>`
            : `<button class="boton boton-secundario" type="button" data-ir="${i}">${ok ? 'Revisar' : 'Ir'}</button>`}
        </li>`;
    }).join('');
    dialogo.querySelector('.asistente-intro').textContent = `${hechos} de ${PASOS.length - 1} pasos listos. Cada uno te lleva a donde se completa; vuelve aquí cuando quieras.`;
  }

  document.addEventListener('click', (e) => {
    if (e.target.closest('[data-asistente]')) abrir();
  });

  window.Asistente = {
    abrir,
    // La primera vez que se entra al panel y la boda no tiene fecha, se abre solo.
    async alEntrar() {
      let visto = false;
      try { visto = localStorage.getItem(CLAVE_VISTO) === '1'; } catch { /* sin almacenamiento */ }
      if (visto) return;
      try {
        const e = await D.evento();
        if (e.fecha) return;
        localStorage.setItem(CLAVE_VISTO, '1');
      } catch {
        return;
      }
      abrir();
    },
  };
})();
