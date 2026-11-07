# Prompt para Claude Code — Invitación de boda (landing page) en vino tinto, 100 % personalizable

> Cómo usarlo: copia la carpeta `referencias/` dentro del proyecto `boda/` y pega todo este texto en Claude Code.
> Antes de pegarlo, cambia solo lo que está en **[CORCHETES]** si ya tienes los datos. Si no, deja los marcadores: todo se podrá editar después desde el panel.

---

## 0. Rol y forma de trabajar

Actúa como desarrollador front-end senior y diseñador de experiencias digitales para eventos. Vas a construir una **invitación de boda tipo landing page**, mobile-first, elegante, con animaciones cinematográficas y **todo el contenido editable sin tocar código** (textos, fotos, fondos, colores, fuentes, secciones, orden, música).

Reglas de trabajo:
1. **Primero audita** la carpeta actual. Si ya existe una invitación con animaciones, **NO borres ni reescribas las animaciones existentes**: intégralas en la nueva estructura y dime cuáles conservaste.
2. Trabaja **por fases** (sección 9). Al terminar cada fase, detente, resume qué hiciste, cómo probarlo y espera mi visto bueno.
3. Antes de diseñar, **mira las imágenes de `referencias/`** (ver sección 1). Son inspiración: combina las ideas en un diseño **original**; no copies marcas, logos, marcas de agua (p. ej. “@loventinvita”, “Creado por …”) ni textos literales de las referencias.
4. Si un dato falta, usa un marcador claro (`[NOMBRE_NOVIA]`) en el archivo de contenido, nunca lo inventes en el HTML.

---

## 1. Referencias (carpeta `referencias/`) y qué tomar de cada una

| Archivo | Qué tomar |
|---|---|
| `video/01-paleta-moodboard.jpg` | Paleta oscura: negro `#000000`, vino muy oscuro, verde bosque `#021503`, rosa polvo `#E5D6D6`. Concepto: “romántico oscuro, cinematográfico, botánico de bosque”. |
| `video/02-hero-sobre-sello.jpg` | **Intro**: fondo de bosque de pinos con niebla, texto “El día más importante de nuestra vida ha llegado / ¡Nos casamos!”, **sobre vino tinto con sello de cera dorado** y “Abrir aquí”, nombres en caligrafía debajo. |
| `video/03-sobre-abriendose.jpg` | **Animación de apertura**: la solapa del sobre se abre en 3D y salen tarjetas (una tarjeta de borde ornamentado + una polaroid). |
| `video/04-portada-nombres.jpg` | **Portada**: foto vertical de la pareja a pantalla completa, “Nuestra boda” + nombres en script blanco arriba. |
| `video/05-tarjeta-marco-ornamental.jpg` | Tarjeta blanca con **marco victoriano/barroco de filigrana vino tinto**, que sale de un bolsillo de sobre. Contiene nombres, mensaje y fecha. |
| `video/06-…polaroids-cuenta-regresiva.jpg` | **Polaroids en blanco y negro** dispersas y ligeramente rotadas sobre fondo oscuro + frase + **cuenta regresiva** (días / horas / min / seg). |
| `video/07-…ubicacion.jpg`, `08-…` | Tarjeta de **ubicación** con marco ornamental y botón **“Ver mapa”** sobre foto de bosque. |
| `video/08-…itinerario.jpg`, `09-itinerario-detalle.jpg` | **Itinerario** sobre fondo oscuro: hora — línea — evento, con iconos lineales. |
| `video/10-codigo-vestimenta.jpg` | Tarjeta de **código de vestimenta** con siluetas de hombre y mujer, puntos de color y botón “Ver ideas”. |
| `video/11-tarjetas-dobles.jpg` | Dos tarjetas ornamentales lado a lado (en escritorio) sobre foto panorámica: ideal para **Regalos** y **Confirmar asistencia**. |
| `video/12-camafeo-cierre.jpg` | **Cierre**: foto en marco ovalado tipo camafeo plateado sobre fondo vino tinto + frase final romántica. |
| `video/13-footer.jpg` | Footer con iniciales y fecha. |
| `img-01-olivia-daniel-estructura.png` | **Estructura de contenido**: calendario “Save the date” con corazón sobre el día, programa con iconos en círculos, dress code con círculos de color, nota de regalo (lluvia de sobres / luna de miel), venue con foto + “Ver en mapa”, **galería tipo mosaico**, **QR** al sitio, frase de cierre, “¡Gracias!”. Bordes de **papel rasgado** entre secciones y rosas blancas en esquinas. |
| `img-02-lucia-juan-vino.png` | **Estilo vino tinto sobre marfil**: “FALTAN:” con contador grande, tira de fecha “SÁBADO | 29 | NOVIEMBRE”, iconos lineales finos en vino (iglesia, copas, anillos, cubiertos, globo de disco), botones píldora vino “CÓMO LLEGAR”, sección **Instagram/hashtag** y **Playlist**. Transición de foto con borde rasgado. |
| `img-03-dress-code.png` | **Código de vestimenta completo**: título + subtítulo, columnas *Ellos / Ellas* con ilustración y viñetas, **paleta sugerida** con nombres, **ejemplos de atuendos** y **colores a evitar** (tachados con X). |

**Síntesis del estilo final:** romántico-elegante con un toque gótico botánico. Intro oscura y cinematográfica (bosque, niebla, sobre vino con sello dorado) → cuerpo claro marfil con detalles vino tinto, filigranas y papel rasgado → secciones oscuras puntuales (itinerario, polaroids, cierre) para dar ritmo claro/oscuro.

---

## 2. Identidad visual

### 2.1 Paleta por defecto “Vino & Marfil” (todas como CSS custom properties, editables)
```css
--color-vino-900: #2A0509;   /* casi negro vino: fondos oscuros */
--color-vino-800: #4A0A12;   /* fondos de sección oscura */
--color-vino-700: #6B0F1E;   /* PRINCIPAL: títulos, botones, iconos */
--color-vino-500: #8E2436;   /* hover, acentos */
--color-vino-300: #B86A76;   /* líneas finas, separadores */
--color-rosa-polvo: #E5D6D6; /* fondos suaves, tarjetas secundarias */
--color-marfil: #F8F3EC;     /* fondo principal claro */
--color-papel: #FFFDF9;      /* tarjetas */
--color-oro: #C9A15B;        /* sello de cera, detalles mínimos */
--color-bosque: #1E2A1F;     /* verde muy oscuro opcional (intro/pinos) */
--color-tinta: #1C1416;      /* texto principal */
```
Contraste mínimo AA (4.5:1) en todo texto. Texto marfil sobre vino-800/900; texto tinta o vino-700 sobre marfil.

### 2.2 Temas predefinidos (seleccionables desde el panel)
- **Vino & Marfil** (por defecto, el de arriba).
- **Vino Gótico Bosque**: base vino-900 + bosque, texto marfil (como el video).
- **Vino & Rosa Polvo**: más suave y luminoso (como `img-02`).
- **Personalizado**: el usuario elige cada color con *color pickers*.

### 2.3 Tipografía (Google Fonts, editable)
- Caligrafía para nombres y palabras clave (“Nos casamos”, “Para siempre”): **Pinyon Script** (alternativas: Great Vibes, Parisienne).
- Títulos en versales con tracking amplio (“CEREMONIA”, “ITINERARIO”): **Cinzel** o **Marcellus**.
- Texto: **Cormorant Garamond** (alternativa: EB Garamond / Lora).
- Números de la cuenta regresiva: Cormorant Garamond en peso 500, tamaño grande.

### 2.4 Elementos gráficos (SVG propios, inline, que hereden `currentColor`)
- Marcos ornamentales victorianos (rectangular, en arco, ovalado tipo camafeo).
- Divisores: línea fina + corazón pequeño al centro (como en `img-01`).
- Bordes de **papel rasgado** (SVG `mask`/`clip-path`) para transiciones entre secciones.
- Ramas/rosas botánicas en esquinas (dibujo lineal, color configurable).
- Sello de cera dorado con iniciales de la pareja (generado en SVG con las iniciales del contenido).
- Set de **iconos lineales** finos: ubicación, anillos, copas, iglesia, cámara, cubiertos, pastel, música, sobre, regalo, vestido, traje, calendario, Instagram.
- Textura de papel muy sutil (ruido SVG o imagen ligera) sobre marfil.

---

## 3. Recorrido de la invitación (secciones en orden por defecto)

Cada sección debe poder **activarse/desactivarse y reordenarse** desde el panel.

0. **Intro — Sobre con sello**
   - Fondo: foto/video de bosque con niebla (editable), con capa de niebla animada lenta (CSS/canvas ligero).
   - Texto pequeño: “El día más importante de nuestra vida ha llegado” + script “¡Nos casamos!”.
   - Sobre vino tinto flotando suavemente, sello de cera dorado con iniciales, texto “Abrir aquí”. Nombres en script debajo.
   - Al tocar: el sello se “rompe”/desvanece, la solapa rota en 3D (`rotateX`), suben las tarjetas y la página hace transición a la portada. **Aquí arranca la música** (el gesto del usuario permite el autoplay).
   - Si hay enlace personalizado (`?i=codigo`), el sobre muestra “Para: Familia Pérez”.

1. **Portada (Hero)**: foto vertical de la pareja a pantalla completa (otra para escritorio, opcional), “Nuestra boda”, nombres en script, fecha `DD · MM · AAAA`, indicador de scroll. Borde inferior de papel rasgado.

2. **Invitación formal**: tarjeta con marco ornamental que entra deslizándose “desde el sobre”. Texto: “Junto a nuestras familias, tenemos el honor de invitarte…”, nombres de padres (opcional), frase/versículo (opcional).

3. **Save the date + cuenta regresiva**
   - Tira de fecha estilo `SÁBADO | 29 | NOVIEMBRE`.
   - Mini calendario del mes con **corazón vino tinto sobre el día** (generado automáticamente desde la fecha).
   - “FALTAN:” + días / horas / minutos / segundos en vivo. Cuando llegue el día: “¡Hoy es el gran día!”; después: “¡Gracias por acompañarnos!”.
   - Botones: **Agregar a Google Calendar** y **descargar .ics**.

4. **Nuestra historia (polaroids)**: fondo vino oscuro, 2–4 polaroids en B/N dispersas y rotadas que entran cayendo; al tocarlas pasan a color y se enderezan. Frase editable (“El amor escribió nuestra historia y celebraremos su capítulo más hermoso en…”). Opcional: mini línea de tiempo de la relación.

5. **Ceremonia y Recepción**: dos tarjetas con marco ornamental (lado a lado en escritorio, apiladas en móvil): icono, nombre del lugar, dirección, hora, botón píldora **“Cómo llegar”** (Google Maps) + enlace Waze. Foto del lugar opcional. Si ambos son el mismo lugar, una sola tarjeta.

6. **Itinerario**: sección oscura. Línea vertical que **se dibuja con el scroll**; cada evento aparece en secuencia con icono en círculo + hora + nombre (+ descripción opcional). Lista editable (agregar/quitar/reordenar, elegir icono).
   Ejemplo por defecto: Llegada de invitados · Ceremonia · Brindis/cóctel · Entrada de los novios · Cena · Fotos · Baile/fiesta · Fin.

7. **Foto parallax con frase**: imagen a pantalla completa (ej. pareja con paraguas en la niebla) con efecto parallax suave y una cita encima.

8. **Código de vestimenta** (inspirado en `img-03`)
   - Título “Código de vestimenta” + tipo editable (Formal elegante / Etiqueta / Semi-formal / Cóctel) + subtítulo.
   - Columnas **Ellos / Ellas** con ilustración/silueta SVG y viñetas editables.
   - **Paleta sugerida para invitados** con círculos y nombres.
   - **Colores reservados / a evitar** con X: **la novia se casa en vino tinto**, así que por defecto reservar *vino tinto, borgoña, rojo* (“reservado para la novia”) y además *blanco, marfil, champagne*. Mostrar la nota: “El vino tinto es el color de la novia; te pedimos elegir otro tono 💛”.
   - Paleta sugerida por defecto (que **no compita** con el vino): verde salvia, verde oliva, azul marino, azul polvo, lavanda, gris perla, negro (solo hombres), durazno empolvado. Todo editable.
   - Botón **“Ver ideas”** → modal/carrusel con ejemplos de atuendos (imágenes que suba el usuario) o enlace a un tablero de Pinterest.

9. **Regalos**: tarjeta ornamental. “Tu presencia es nuestro mejor regalo; si deseas tener un detalle con nosotros…”. Opciones activables: lluvia de sobres, cuenta bancaria (Nequi/Daviplata/banco, con botón **copiar** y número oculto tras “Ver datos”), lista de regalos (enlace), aporte a luna de miel.

10. **Galería**: mosaico (masonry) de hasta 8–12 fotos con *lightbox* (swipe en móvil, teclado en escritorio) y botón “Ver más fotos”.

11. **Comparte el momento**: hashtag con botón copiar + enlace a Instagram. **Playlist**: “¿Qué canción no puede faltar?” → mini formulario o enlace a playlist colaborativa de Spotify.

12. **Confirmar asistencia (RSVP)**
    - Campos: nombre, ¿asistirás? (sí/no), número de acompañantes (limitado por el cupo del enlace personalizado), restricciones alimentarias, mensaje para los novios.
    - Fecha límite para confirmar visible (“Confirma antes del …”).
    - Envío configurable: (a) **WhatsApp** con mensaje prellenado al número de los novios (por defecto, cero backend); (b) **Google Sheets** vía Google Apps Script (endpoint configurable); (c) Formspree.
    - Estado de éxito con animación (corazón/confeti sutil en vino y oro).

13. **QR y compartir**: QR generado en el cliente con la URL de la invitación + botón “Compartir” (Web Share API) + copiar enlace.

14. **Cierre**: fondo vino-800, foto en **marco ovalado tipo camafeo**, frase final editable (“Ninguna medida de tiempo contigo será suficiente… empecemos con un *para siempre*”), “¡Gracias!”, “Con amor, [NOMBRES]”.

15. **Footer**: iniciales en monograma, fecha. Sin marcas de terceros.

**Elementos globales:**
- Botón flotante de **música** (play/pausa) con icono animado; archivo de audio configurable (mp3 que yo suba, volumen inicial bajo, *fade in*).
- Barra de progreso de lectura fina en vino tinto (opcional).
- Pétalos/partículas sutiles opcionales (desactivables).

---

## 4. Personalización (lo más importante)

### 4.1 Todo el contenido vive en UN archivo
`/content/invitacion.json` (con un JSON Schema en `/content/schema.json` para validar). El HTML **no** debe tener textos ni rutas de imágenes fijos. Estructura sugerida:

```json
{
  "meta": { "titulo": "", "descripcion": "", "imagenOg": "", "idioma": "es-CO" },
  "pareja": { "novia": "[NOMBRE_NOVIA]", "novio": "[NOMBRE_NOVIO]", "iniciales": "[X & Y]", "padresNovia": "", "padresNovio": "" },
  "evento": { "fechaHora": "[AAAA-MM-DDTHH:MM:00-05:00]", "zonaHoraria": "America/Bogota", "fechaLimiteRsvp": "" },
  "tema": { "preset": "vino-marfil", "colores": {}, "fuentes": { "script": "Pinyon Script", "titulos": "Cinzel", "texto": "Cormorant Garamond" }, "animaciones": "completas | suaves | ninguna", "particulas": true },
  "musica": { "archivo": "/media/cancion.mp3", "volumen": 0.4, "activa": true },
  "secciones": [
    { "id": "intro", "activa": true, "fondo": { "tipo": "imagen|video|color", "valor": "" }, "textos": {} }
  ],
  "lugares": [ { "tipo": "ceremonia", "nombre": "", "direccion": "", "hora": "", "mapsUrl": "", "wazeUrl": "", "foto": "" } ],
  "itinerario": [ { "hora": "16:00", "titulo": "", "descripcion": "", "icono": "anillos" } ],
  "dressCode": { "tipo": "Formal elegante", "ellos": [], "ellas": [], "paletaSugerida": [{ "nombre": "", "hex": "" }], "coloresReservados": [{ "nombre": "Vino tinto", "hex": "#6B0F1E", "nota": "Reservado para la novia" }], "ideas": [] },
  "regalos": { "mensaje": "", "opciones": [] },
  "galeria": [],
  "social": { "hashtag": "", "instagram": "", "playlistUrl": "" },
  "rsvp": { "modo": "whatsapp|sheets|formspree", "whatsapp": "", "endpoint": "" },
  "invitados": [ { "codigo": "fam-perez", "nombre": "Familia Pérez", "cupos": 3 } ]
}
```

### 4.2 Panel de edición `/admin` (tipo WordPress, sin tocar código)
- Protegido con un PIN simple (configurable; aclara en el README que es protección básica, no seguridad real).
- **Asistente de configuración paso a paso** (wizard) para la primera vez, inspirado en el formulario del video: 1) datos de la pareja y fecha, 2) concepto y tema de color, 3) lugares, 4) itinerario, 5) dress code, 6) fotos (hasta 8 principales + galería), 7) música, 8) regalos y RSVP, 9) invitados, 10) revisión final.
- Editor por secciones con **vista previa en vivo** (iframe a la derecha en escritorio, pestaña en móvil).
- Controles: textos, selector de fecha/hora, **subir/cambiar imágenes y fondos** (con recorte y punto focal), color pickers + presets, selector de fuentes, interruptores de sección, **reordenar secciones con arrastrar y soltar**, CRUD de itinerario, lugares, colores del dress code, invitados.
- Nivel de animación: completas / suaves / ninguna.
- Guardado: autoguardado en `localStorage` + **Exportar/Importar `invitacion.json`** + botón “Restaurar valores por defecto”.
- Las imágenes subidas se comprimen en el navegador (WebP, máx. ~1600 px) antes de guardarse.
- Opcional (fase final, solo si lo pido): persistencia en la nube con **Supabase** (tabla de contenido + Storage para imágenes + tabla de RSVP) para editar sin volver a desplegar.

### 4.3 Enlaces personalizados por invitado
`/?i=fam-perez` → saludo personalizado en el sobre y la invitación (“Querida Familia Pérez, hemos reservado **3** lugares para ustedes”) y el RSVP limita acompañantes a esos cupos. En el panel: generar la lista de enlaces y un botón “Enviar por WhatsApp” para cada invitado.

---

## 5. Animación y experiencia

- Librerías: **GSAP + ScrollTrigger** (animaciones) y **Lenis** (scroll suave). Si el proyecto ya usa otra librería de animación, mantenla.
- Coreografía: entradas con *fade + blur + desplazamiento corto*, escalonadas; marcos ornamentales que se “dibujan” (`stroke-dashoffset`); papel rasgado que se revela; parallax suave en fotos; polaroids que caen con rotación; contador con números que cambian con *flip* suave.
- Duraciones elegantes (0.8–1.4 s, *ease* `power2.out` / `expo.out`); nada brusco.
- **Respeta `prefers-reduced-motion`** y el ajuste “animaciones: ninguna” del panel (mostrar todo estático y legible).
- 60 fps en móvil de gama media: animar solo `transform` y `opacity`; nada de animar `filter` en elementos grandes de forma continua.

---

## 6. Requisitos técnicos

- **Stack**: si ya existe un stack en la carpeta, respétalo. Si no, usa **Vite + JavaScript/TypeScript sin framework** (HTML semántico + CSS con custom properties + módulos JS), para que sea liviano y fácil de desplegar en Netlify, Vercel o GitHub Pages.
- Estructura sugerida: `/index.html`, `/admin/index.html`, `/src/sections/*` (un módulo por sección que se renderiza desde el JSON), `/src/styles/` (tokens, base, secciones), `/src/svg/` (marcos, iconos, divisores), `/content/`, `/public/media/`.
- **Mobile-first** (diseña a 375 px y luego 768 px y 1280 px). En escritorio, opcionalmente mostrar la invitación como columna central tipo “tarjeta” sobre un fondo de bosque desenfocado, como en el video.
- **Rendimiento**: imágenes WebP/AVIF con `srcset`, `loading="lazy"` excepto el hero, fuentes con `font-display: swap` y precarga de las 2 principales, video de fondo opcional y con *poster*. Meta: Lighthouse ≥ 90 en Performance y Accesibilidad en móvil.
- **Vista previa al compartir por WhatsApp**: etiquetas Open Graph (`og:title`, `og:description`, `og:image` 1200×630) generadas desde el JSON.
- **Accesibilidad**: `alt` en todas las fotos, foco visible, botones reales (`<button>`), contraste AA, música nunca suena sin acción del usuario y siempre se puede pausar.
- Fechas y horas en español de Colombia con `Intl.DateTimeFormat('es-CO')` y zona `America/Bogota`.
- README en español: cómo editar, cómo exportar/importar el contenido, cómo configurar el RSVP (WhatsApp / Google Sheets con el código de Apps Script incluido) y cómo desplegar.

---

## 7. Lo que NO quiero

- Plantillas genéricas, colores fuera de la paleta, emojis como iconos, sombras duras o bordes redondeados excesivos.
- Textos o rutas hardcodeados fuera del JSON.
- Borrar animaciones que ya existan en el proyecto.
- Copiar logos, marcas de agua o textos literales de las referencias.
- Autoplay de música sin interacción.

---

## 8. Criterios de aceptación

- [ ] Cambiar cualquier texto, foto, fondo, color o fuente desde `/admin` se refleja en la vista previa y en el sitio tras exportar/guardar.
- [ ] Puedo ocultar y reordenar secciones sin romper el diseño (bordes rasgados y fondos alternos se ajustan).
- [ ] Cambiar la fecha actualiza automáticamente cuenta regresiva, calendario, tira de fecha y archivo .ics.
- [ ] El dress code muestra el vino tinto como “reservado para la novia”.
- [ ] El enlace `?i=codigo` personaliza saludo y cupos; el RSVP llega por WhatsApp (y a Google Sheets si lo configuro).
- [ ] Se ve impecable en 360–430 px de ancho y en escritorio; sin scroll horizontal.
- [ ] Con “reducir movimiento” activo, todo se lee sin animaciones.
- [ ] Lighthouse móvil ≥ 90 en Performance y Accesibilidad.

---

## 9. Fases de trabajo (detente al final de cada una)

1. **Auditoría y plan**: revisa la carpeta y las referencias; dime qué existe, qué animaciones vas a conservar y propón la estructura de archivos.
2. **Base**: tokens de diseño, temas, tipografías, SVG (marcos, divisores, iconos, papel rasgado, sello), `invitacion.json` con datos de ejemplo y el renderizador por secciones.
3. **Experiencia de apertura**: intro con sobre + sello + apertura 3D + música + portada.
4. **Secciones de contenido**: invitación, save the date + cuenta regresiva + calendario, polaroids, lugares, itinerario, parallax.
5. **Secciones de servicio**: dress code, regalos, galería + lightbox, social/playlist, RSVP, QR, cierre, footer.
6. **Panel `/admin`**: wizard, editor con vista previa en vivo, imágenes, colores, orden de secciones, invitados, exportar/importar.
7. **Pulido**: animaciones finas, reduced-motion, rendimiento, Open Graph, pruebas en móvil, README.
8. **(Opcional)** Persistencia en Supabase y despliegue.

Empieza por la **Fase 1**.
