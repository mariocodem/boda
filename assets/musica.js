/*
 * La música de la invitación (Diseño → Tema → Música). Arranca sola con el
 * toque que abre el sobre, entra subiendo de a poco hasta su volumen y el
 * botón flotante la pausa o la vuelve a poner. Si el invitado ya había abierto
 * el sobre (vuelve a la página), queda el botón, en pausa.
 *
 * La canción llega con los datos de la boda (de Supabase), y el invitado
 * puede tocar el sobre antes: entonces la música queda pedida y arranca
 * apenas llega. Ese toque deja «despierto» el reproductor (en iPhone el audio
 * solo arranca con un toque del usuario).
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

  // Una centésima de segundo de silencio, para despertar el reproductor.
  const SILENCIO = 'data:audio/wav;base64,UklGRnQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YVAAAACAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgA==';

  let conf = { archivo: null, volumen: 0.4, activa: true };
  let abierta = false;
  let sonando = false;
  // Abrieron el sobre y la canción todavía no estaba lista para sonar.
  let pedida = false;
  let fundido = 0;
  // Las direcciones blob: de las canciones del modo local, ya abiertas.
  const locales = {};

  const lista = () => Boolean(conf.activa && conf.archivo);
  const esLocal = (ref) => String(ref || '').startsWith('local:');

  // La dirección que suena: el enlace tal cual, o la blob: de la canción del
  // modo local (null mientras IndexedDB la abre).
  const fuente = (ref) => (esLocal(ref) ? locales[ref] || null : ref);

  // La canción del modo local (local:<id>) vive en IndexedDB de este
  // navegador: Datos le da una dirección blob:. Si ya la pidieron, suena.
  function abrirLocal(ref) {
    if (!esLocal(ref) || locales[ref] || !window.Datos) return;
    window.Datos.urlFoto(ref).then((url) => {
      if (!url) return;
      locales[ref] = url;
      if (pedida && lista() && conf.archivo === ref) sonar();
    });
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

  // Con el toque del sobre, si la canción aún no llega: el silencio suena
  // mudo un instante y el reproductor queda habilitado para cuando llegue.
  function despertar() {
    if (audio.dataset.archivo || audio.dataset.despierto) return;
    audio.dataset.despierto = 'si';
    audio.muted = true;
    audio.src = SILENCIO;
    audio.play().then(() => { if (!audio.dataset.archivo) audio.pause(); }, () => { /* lo intenta la canción */ });
  }

  // Sin esperas antes de play(): así cuenta como parte del toque del invitado.
  function sonar() {
    if (!lista()) return;
    const src = fuente(conf.archivo);
    if (!src) {
      pedida = true;
      despertar();
      abrirLocal(conf.archivo);
      return;
    }
    pedida = false;
    if (audio.dataset.archivo !== conf.archivo) {
      audio.src = src;
      audio.dataset.archivo = conf.archivo;
    }
    audio.muted = false;
    audio.volume = 0;
    audio.play().then(() => {
      sonando = true;
      fundir(conf.volumen, 2400);
      pintar();
    }, () => {
      // El navegador no la dejó sonar (o el archivo no está): queda el botón.
      sonando = false;
      pintar();
    });
  }

  function callar() {
    sonando = false;
    fundir(0, 450, () => audio.pause());
    pintar();
  }

  boton.addEventListener('click', () => {
    pedida = false;
    if (sonando) callar();
    else sonar();
  });
  audio.addEventListener('error', () => {
    if (!audio.dataset.archivo) return; // el silencio no cuenta
    sonando = false;
    pintar();
  });

  window.Musica = {
    configurar(m) {
      conf = Object.assign({ archivo: null, volumen: 0.4, activa: true }, m || {});
      // La del modo local se abre desde ya, para no esperar a IndexedDB.
      if (lista()) abrirLocal(conf.archivo);
      if (!lista() && sonando) callar();
      else if (sonando) fundir(conf.volumen, 300);
      // Abrieron el sobre antes de que llegara la canción: suena ya.
      else if (pedida && lista()) sonar();
      pintar();
    },
    abierta({ gesto }) {
      abierta = true;
      if (gesto) {
        if (lista()) sonar();
        else {
          pedida = true;
          despertar();
        }
      }
      pintar();
    },
  };
})();
