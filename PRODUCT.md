# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Confirmado por Mario el 2026-10-19: sitio estático (HTML, CSS y JavaScript sin paso de build), publicable en GitHub Pages, con Supabase como backend opcional para invitados y confirmaciones.

- Sin claves de Supabase configuradas, todo funciona en **modo local** (localStorage del navegador), útil para probar y para el diseño.
- Con la URL del proyecto y la clave pública (`anon`) de Supabase, invitados y confirmaciones se guardan en la base de datos y el panel usa el login de Supabase (correo y contraseña, o Google desde 2026-11-06); solo entran las cuentas de la tabla `administradores`.

## Users

- **Invitados** de la boda de Diego Triana y Erika Ramos. Llegan casi siempre desde el teléfono, abriendo un enlace personal que les mandaron (normalmente por WhatsApp). Su tarea: abrir la invitación, enterarse de cuándo y dónde es, y confirmar si asisten y cuántos van de sus cupos.
- **Los novios (o quien administre)**: arman la lista de invitados, reparten los enlaces personales y siguen las confirmaciones desde el panel de administración.

## Product Purpose

Invitación digital de boda: una tarjeta animada que se abre con un toque, seguida de una página con los datos del evento y la confirmación de asistencia. Éxito: cada invitado confirma desde su enlace sin fricción y los novios saben en todo momento cuántas personas van.

## Positioning

Es la invitación de una boda concreta, no una plantilla: cada invitado ve su nombre y sus cupos, y la confirmación llega directo al panel de los novios.

## Operating Context

- Los enlaces se reparten por WhatsApp; el panel debe generar, copiar y compartir el enlace de cada invitado o familia.
- Confirmación por **enlace personal** (`?i=código`): muestra el nombre del invitado o familia y sus cupos; responde sí/no y cuántas personas asisten dentro de su cupo.
- El panel se usa desde el teléfono y desde el computador.

## Capabilities and Constraints

- Tarjeta de invitación animada que se reproduce al tocarla, como apertura de la página.
- Animación de un ramo de rosas blancas y lirios blancos (requisito explícito; desde el 2026-11-06 no va en el tema Vino & Marfil, por pedido de Mario).
- Responsive: teléfono primero.
- Estilo elegible desde el panel (pedido de Mario, 2026-10-21; desde 2026-10-27 en Diseño → Tema): siete paletas (la verde original, cinco pastel y Terracota) o un color libre, y cinco familias de letra elegantes (la del texto puede ser otra que la de los títulos).
- Panel de administración: crear, editar y eliminar invitados (nombre, cupos, teléfono, notas), ver estado de confirmación, totales, búsqueda y filtros, enlaces personales, exportar.
- Organización y mariposa (pedido de Mario, 2026-10-23): después de la portada, cada parte es un pliego con su foto (las fotos de la pareja se reparten, no van todas juntas), con espacio parejo y sin piezas montadas; una mariposa dorada acompaña al bajar. Todo sigue siendo personalizable desde el panel (la mariposa se apaga en Estilo; el lugar de cada foto depende de su orden).
- Mesas (pedido de Mario, 2026-10-22; 2026-10-27: un toque elige la pieza también en Firefox, y las mesas se agrandan con su tirador, sin tener que moverlas): en el panel, un plano 2D del salón para organizar las mesas y sentar a cada familia (una invitación va entera a una mesa). El invitado que confirmó ve su mesa en la invitación solo cuando los novios la publican («Mostrar su mesa a los invitados»).
- Funciones de Bodas.net (pedido de Mario, 2026-10-23): en el panel, **Tareas** (desde 2026-11-05 una lista con fechas y Google Calendar, ver abajo; antes, una agenda por etapas), **Presupuesto** (gastos por categoría con estimado, costo final, pagado, próximos pagos y costo por invitado) y **Proveedores** (estado, contacto y precio; se llevan al presupuesto). Son privados (tabla `planeacion`). En la invitación: dónde quedarse, nuestra historia, preguntas frecuentes, cuenta para transferencias y listas de regalos, y dos preguntas opcionales al confirmar (alergias o restricciones de comida, una canción), que el panel junta en «Lo que pidieron».
- Página editorial (desde 2026-10-27 es el tema «Editorial», elegible en Diseño junto al de pliegos; pedido de Mario, 2026-10-23, con una invitación editorial de Canva como referencia): después del sobre y de la tarjeta a pantalla completa, que se conservan con su escena de scroll, la invitación es una página editorial: fondo crema, titulares en serif de alto contraste en terracota, láminas botánicas de Redouté (dominio público, `assets/flores/`) sobre los bordes y las fotos, dos columnas que alternan (una en el teléfono) y botones en píldora. Destellos más suaves. Tratamiento «tú», editable. Regla: ninguna animación existente se quita; se adapta a la nueva estructura y, si no encaja, se le pregunta a Mario.
- Edición tipo WordPress (pedido de Mario, 2026-10-23; decidido el 2026-10-27): la página es una lista de bloques (`assets/pagina.js`) que se arma en la pestaña **Diseño** del panel, con la invitación en vivo al lado (teléfono o computador, para una persona o una familia) y tocando un bloque en ella para editarlo. Mario eligió: **los dos diseños como temas** (Pliegos, el actual, y Editorial, el del mock), **editor visual en vivo** y, en la primera entrega, **todo**: secciones y bloques (ordenar, ocultar, duplicar y quitar los libres; agregar texto, foto, galería, cita, botón, separador con láminas, cuenta regresiva y video), **todos los textos** (con variantes para una persona y para una familia, y trato «tú» o «usted»), **tema y fondo** (paleta, letras de títulos y de texto por separado, fondo de color, degradado o foto) y **borrador que se publica** (privado, en `planeacion`). La portada (con su escena de scroll) va siempre primero y el cierre al final; las demás animaciones viajan con su bloque. Las secciones con datos siguen llenándose en «La boda», que ya no tiene «Estilo». Pendiente: asistente de organización (invitados conectados con las respuestas, sugerencias de textos de una librería curada, sin IA).
- Espíritu victoriano (pedido de Mario, 2026-11-05, con las invitaciones de colección de Lovent Invita como referencia de cómo se ve: sobre con lacre, tarjetas de papel por capas, calendario del mes, caligrafía): un tercer tema, **Victoriano**, que pasa a ser el de una página nueva (terciopelo vino con damasco, papel marfil con doble filete dorado, caligrafía inglesa con florituras de 1870, sellos de lacre dorado). Las demás animaciones siguen igual. Dos secciones nuevas que aparecen en todos los temas: el **Álbum de fotos**, el hero justo después de la tarjeta, con las tres primeras fotos de la pareja en orden jerárquico (una grande y dos más chicas; en Victoriano, ventanas ovaladas doradas), y **El gran día**, el calendario del mes con el día encerrado. Las fotos de Diego y Erika que llegaron en `fotos/` quedan como fotos de arranque en `config.js` (lo que se suba en el panel las reemplaza).
- Quiénes van (pedido de Mario, 2026-11-06; cambia lo decidido el 2026-10-23, cuando bastaba con saber cuántos): al confirmar, una invitación de más de un cupo escribe el nombre de cada persona que va (obligatorio, uno por persona; con un solo cupo va la del sobre). Se guarda en `nombres_asistentes` (Supabase) y el panel lo muestra en la tabla, en las respuestas recientes y en el bloque «Quiénes van», con su descarga en CSV, una fila por persona.
- Tareas con Google Calendar (pedido de Mario, 2026-11-05): las tareas son una lista con fecha y hora (no por meses), ordenada por fecha, con las atrasadas arriba; la lista sugerida trae sus fechas repartidas hasta la boda (apretadas entre hoy y la boda si falta menos de un año) y las tareas de antes reciben la del fin de su etapa. El panel se conecta a Google Calendar con el permiso mínimo (`calendar.app.created`): crea su propio calendario «Boda de Diego y Erika» y pasa allí cada tarea con fecha, con aviso el día antes; las hechas van con ✓ y las quitadas se borran. Va en un solo sentido (del panel a Google). Necesita un ID de cliente de OAuth en `config.js` (los pasos en el README).
- Entrar con Google (pedido de Mario, 2026-11-06): el panel se abre con «Continuar con Google» y esa cuenta queda conectada al calendario de las tareas, sin conectarlo aparte; lo pendiente pasa solo al entrar. La clave (o correo y contraseña) queda plegada debajo. En modo local la ventana de Google la abre el navegador (Google Identity Services); con Supabase es su login con Google (PKCE), y Supabase guarda el secreto del cliente. El permiso del calendario dura una hora (no hay servidor que lo renueve) y vive en la pestaña: «Renovar el permiso» es un toque. El calendario recuerda de qué cuenta es; si entra otra, no se duplica sin que lo pidan («Pasarlas a esta cuenta»).
- Tema Vino & Marfil (prompt de Mario del 2026-11-06, con referencias en `referencias-boda/`; Mario aprobó las recomendaciones de la Fase 1 y pidió llegar a la Fase 7 sin detenerse): pasa a ser el tema de arranque. Se mantuvieron el stack sin build (sin Vite, GSAP ni Lenis: Lenis rompería las escenas con scroll), la confirmación por Supabase con el panel (no WhatsApp/Sheets/Formspree), el login del panel y el modelo de datos (no un `invitacion.json` fijo: se exporta e importa desde Diseño). Ninguna animación se quitó: el sobre suma el lacre que se rompe; el corazón del calendario reemplaza al anillo solo en este tema (el anillo era estático). Nuevos: intro de bosque con niebla, polaroids, foto con parallax, redes, QR, camafeo, música (solo con el toque que abre el sobre), nivel de animación, asistente de configuración y vestimenta completa (Ellos/Ellas, colores). Sin datos inventados: la paleta sugerida y los colores a evitar van vacíos (la ayuda trae un ejemplo) y «el vino tinto es el color de la novia» no se afirma en ninguna parte hasta que Mario lo confirme.
  - **Ramo y destellos (2026-11-06, pedido explícito de Mario: «quita el ramo de flores y el fondo con esas estrellas, la idea es que siga la referencia»):** en Vino & Marfil no se arman ni se pintan. Los otros temas los conservan (el ramo sigue siendo el requisito de esos diseños).
  - **Correcciones de Mario (2026-11-07):** «que se vea exactamente igual que el video, con temática de crepúsculo»: página sobre el bosque oscuro con niebla; el sobre muestra la solapa con el lacre (sin voltearse), el lacre se rompe y la tarjeta sale; la portada es la foto a pantalla completa (sin la tarjeta a pantalla completa ni las fotos chicas del álbum en este tema); la invitación formal sale de un sobre vino; el cierre va sobre damasco. Polaroids a color, en su proporción, más grandes y entrando desde la izquierda. Fuera «Comparte la invitación» (el QR). Vestimenta como la lámina de referencia, con figuras que se visten con la paleta y colores elegibles con selector; sus textos traen unos de siempre a pedido de Mario. Mario autorizó estos cambios de animaciones al pedir el video tal cual; los otros temas no cambian.
  - **Estado (2026-11-06):** Fases 2 a 7 hechas y probadas (Chromium en teléfono y computador, Firefox). Lighthouse en teléfono, servido con compresión: rendimiento 87–91, accesibilidad, buenas prácticas y SEO 100, CLS 0. Vista previa de WhatsApp: `fotos/og-boda.jpg` con la dirección de GitHub Pages del repositorio (`mariocodem.github.io/boda`). Por responder de Mario: si Erika se casa de vino tinto (para la nota de colores a evitar), la canción en mp3, una foto o video de bosque con niebla para la intro (mientras tanto se usa la foto principal) y los nombres de los padres.
- Idioma de la interfaz: español (Colombia).
- **Por decidir:** fecha, ciudad, lugar(es), horarios, código de vestimenta, regalos. Se dejan como marcadores editables «por confirmar» en un único bloque de configuración.

## Brand Commitments

- Nombres de la pareja: **Diego Triana** y **Erika Ramos**, en ese orden (como los dio el usuario).
- Flores: rosas blancas y lirios blancos.

## Evidence on Hand

- Fotos de la pareja: **pendientes**; los novios las suben desde el panel (foto principal, hasta 6 de la pareja y hasta 4 de referencia de vestimenta). Sin fotos, el arco de la portada muestra el forro y la mesa de fotos no aparece.
- No hay fecha, lugar, historia de la pareja ni textos propios todavía: no inventar datos del evento ni anécdotas presentadas como reales. La historia, el alojamiento, la cuenta de regalos y las preguntas frecuentes los escriben los novios; vacíos, no aparecen. Las listas sugeridas (tareas, gastos, preguntas comunes sin respuesta) son ayudas de planeación, nunca datos del evento.

## Product Principles

1. La invitación es un objeto, no un sitio web: abrirla debe sentirse como abrir un sobre de papel.
2. El invitado llega con una sola pregunta (¿cuándo, dónde y voy?) y la responde en segundos desde el teléfono.
3. Cada invitado es nombrado: el enlace personal es el centro de la experiencia.
4. El panel es una herramienta tranquila y exacta: números claros, acciones a un toque.
5. Nada de datos inventados: lo que no está confirmado se ve como «por confirmar».

## Accessibility & Inclusion

- Invitados de todas las edades (abuelos incluidos): texto legible, contraste suficiente, botones grandes.
- Las animaciones respetan `prefers-reduced-motion` y la invitación se puede abrir con teclado.
