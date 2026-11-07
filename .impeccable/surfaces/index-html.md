---
version: 1
slug: "index-html"
primary_target: "index.html"
related_targets: ["admin.html"]
---

## Alcance

Superficie: `index.html`, la invitación que abre cada invitado desde su enlace personal (`?i=código`). Modo: **Persuade** (el invitado entiende la invitación y confirma). Superficie relacionada: `admin.html`, el panel (modo Operate), donde se edita todo en «Diseño» y «La boda».

Audiencia: familia y amigos de Diego y Erika, de todas las edades, casi siempre desde el teléfono, abriendo un enlace de WhatsApp. Acción: confirmar asistencia (sí/no, cuántos de sus cupos) y saber cuándo, dónde y cómo llegar. Contenido real: nombres de la pareja; sus fotos (en `fotos/`, de arranque en `config.js`); flores de la marca (rosas y lirios blancos). Fecha, lugar, horarios, vestimenta e historia: los llenan los novios; vacíos, «por confirmar» o la sección no aparece.

Restricciones de Mario: no se elimina ni se rompe ninguna animación existente (se adapta; si no encaja, se pregunta). Se conservan el sobre y la tarjeta a pantalla completa con su escena de scroll antes de la página. Destellos suaves sobre los suelos claros. Tratamiento «tú», editable. Todo el contenido sale del modelo de datos. Tres temas elegibles (Victoriano, Pliegos, Editorial); Victoriano es el de siempre desde 2026-11-05.

## Direction contract

THESIS: La invitación es una suite de papelería victoriana que llega en su sobre lacrado: después de la tarjeta, las fotos de la pareja en una página de álbum con ventanas ovaladas doradas y, al bajar, cada parte en papel marfil sobre terciopelo vino. Rechaza la invitación digital genérica (fondo blanco, script dorado sobre foto a sangre, cuenta regresiva como héroe) y el pastiche de encaje sin oficio.

OWN-WORLD: Terciopelo vino #4f1621 con el forro del sobre asomando como damasco; papel marfil #f8f1e2 con doble filete dorado de esquinas cortadas (border-image); títulos en caligrafía inglesa (Pinyon Script) en oro claro con la floritura de Harpel (1870) debajo; texto en Old Standard TT; ventanas ovaladas con bisel de oro; láminas de Redouté impresas sobre el papel; lacre dorado; botón de responder dorado.

STORY: El invitado abre su sobre lacrado, ve la tarjeta con su nombre, la tarjeta se asienta y llega el álbum: «¡Nos casamos!», los nombres y la fecha, y la página con la foto grande al centro y dos chicas a los lados. Siguen los detalles, el gran día en su calendario, cómo llegar, el itinerario con su hilo, la historia, la vestimenta y los regalos, las preguntas y la respuesta, que se reparte sobre el terciopelo.

FIRST VIEWPORT: El sobre y la tarjeta a pantalla completa conservan su forma y su escena (solo cambian a vino, marfil, oro y caligrafía). Primera pantalla después de la tarjeta: sobre el terciopelo, «¡NOS CASAMOS!» en caja alta espaciada, «Diego & Erika» en caligrafía gigante con su floritura y la fecha; debajo, la página del álbum a todo lo ancho: en escritorio la foto 1 en un óvalo grande al centro, la 2 abajo a la izquierda y la 3 arriba a la derecha, rosas de Redouté en dos esquinas; en teléfono la grande arriba y las dos chicas debajo.

FORM: fijada por Mario (2026-11-05) con las invitaciones de colección de Lovent Invita como referencia de cómo se ve y el pedido de «espíritu victoriano», no por sorteo; hereda el HTML de Pliegos y todas las animaciones firma (sobre, ramo, tarjeta que se asienta, destellos, mariposa, hilo, respuesta que se reparte, matasellos). seed: none (unavailable)

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Pendiente

Hecho el 2026-11-05: tema Victoriano (`assets/victoriano.css`, paleta Vino y letra Victoriana en `assets/estilos.js`), secciones Álbum y El gran día (`assets/pagina.js`, `assets/bloques.js`), DESIGN.md con sus secciones. Pendiente: la revisión final del tema con la fecha y los lugares reales, y el asistente de organización (invitados conectados con las respuestas, sugerencias de textos).
