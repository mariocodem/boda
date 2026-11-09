/*
 * La música de la invitación (Diseño → Tema → Música). Nunca suena sola:
 * arranca con el toque que abre el sobre, entra subiendo de a poco hasta su
 * volumen y el botón flotante la pausa o la vuelve a poner. Si el invitado ya
 * había abierto el sobre (vuelve a la página), queda el botón, en pausa.
 *
 * invitacion.js le pasa la configuración de la página (configurar) y le avisa
 * cuando se abre el sobre (abierta).
 */
(function () {
  const boton = document.querySelector('[data-musica]');
  if (!boton) return;
  const texto = boton.querySelector('[data-musica-texto]');
  const audio = new Audio();
  audio.loop = true;
  audio.preload = 'none';

  let conf = { archivo: null, volumen: 0.4, activa: true };
  let abierta = false;
  let sonando = false;
  let fundido = 0;

  const lista = () => Boolean(conf.activa && conf.archivo);

  // La canción subida en modo local (local:<id>) vive en IndexedDB de este
  // navegador: Datos le da una dirección blob: (y la recuerda). Las demás se
  // usan tal cual.
  function direccion(ref) {
    if (!String(ref || '').startsWith('local:')) return Promise.resolve(ref);
    return window.Datos ? window.Datos.urlFoto(ref) : Promise.resolve(null);
  }

  function pintar() {
    boton.hidden = !(lista() && abierta);
    boton.setAttribute('aria-pressed', sonando ? 'true' : 'false');
    boton.dataset.sonando = sonando ? 'si' : 'no';
    texto.textContent = sonando ? 'Pausar la música' : 'Poner la música';
    boton.title = texto.textContent;
  }

  // Sube o baja el volumen en «ms» (en iPhone el volumen no se puede cambiar:
  // suena al del teléfono).
  function fundir(hasta, ms, alFin) {
    cancelAnimationFrame(fundido);
    const desde = audio.volume;
    const t0 = performance.now();
    const paso = (t) => {
      const k = Math.min(1, (t - t0) / ms);
      audio.volume = Math.min(1, Math.max(0, desde + (hasta - desde) * k));
      if (k < 1) fundido = requestAnimationFrame(paso);
      else if (alFin) alFin();
    };
    fundido = requestAnimationFrame(paso);
  }

  async function sonar() {
    if (!lista()) return;
    const pedida = conf.archivo;
    if (audio.dataset.archivo !== pedida) {
      const src = await direccion(pedida);
      if (!src || conf.archivo !== pedida) {
        sonando = false;
        pintar();
        return;
      }
      audio.src = src;
      audio.dataset.archivo = pedida;
    }
    audio.volume = 0;
    try {
      await audio.play();
      sonando = true;
      fundir(conf.volumen, 2400);
    } catch {
      // El navegador no la dejó sonar (o el archivo no está): queda el botón.
      sonando = false;
    }
    pintar();
  }

  function callar() {
    sonando = false;
    fundir(0, 450, () => audio.pause());
    pintar();
  }

  boton.addEventListener('click', () => (sonando ? callar() : sonar()));
  audio.addEventListener('error', () => {
    sonando = false;
    pintar();
  });

  window.Musica = {
    configurar(m) {
      conf = Object.assign({ archivo: null, volumen: 0.4, activa: true }, m || {});
      // La del modo local se abre desde ya: así el toque que abre el sobre no
      // espera a IndexedDB para que suene.
      if (lista()) direccion(conf.archivo);
      if (!lista() && sonando) callar();
      else if (sonando) fundir(conf.volumen, 300);
      pintar();
    },
    abierta({ gesto }) {
      abierta = true;
      if (gesto) sonar();
      pintar();
    },
  };
})();
