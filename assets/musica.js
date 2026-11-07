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
    if (audio.dataset.archivo !== conf.archivo) {
      audio.src = conf.archivo;
      audio.dataset.archivo = conf.archivo;
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
