---
version: 1
slug: "index-html"
primary_target: "index.html"
related_targets: ["admin.html"]
---

## Alcance

Superficie: `index.html`, la invitación que abre cada invitado desde su enlace personal (`?i=código`). Modo: **Persuade** (el invitado entiende la invitación y confirma). Superficie relacionada: `admin.html`, el panel (modo Operate), donde se editará todo el contenido de la página.

Audiencia: familia y amigos de Diego y Erika, de todas las edades, casi siempre desde el teléfono, abriendo un enlace de WhatsApp. Acción: confirmar asistencia (sí/no, cuántos de sus cupos) y saber cuándo, dónde y cómo llegar. Contenido real: nombres de la pareja; flores de la marca (rosas y lirios blancos). Fecha, lugar, horarios, vestimenta, historia y fotos: los llenan los novios; vacíos, «por confirmar» o la sección no aparece.

Restricciones de Mario (2026-10-23): no se elimina ni se rompe ninguna animación existente (se adapta a la nueva estructura; si no encaja, se pregunta). Se conservan el sobre y la tarjeta a pantalla completa con su escena de scroll antes de la página. Destellos más suaves. Tratamiento «tú», editable. Todo el contenido sale del modelo de datos.

## Direction contract

THESIS: La invitación sigue llegando en su sobre y se abre en una página editorial de boda: titulares enormes frente a fotos, sobre crema, con láminas de Redouté (rosas y lirios) que se apoyan en los bordes y en las esquinas de las fotos. Rechaza la plantilla genérica del género (acuarela, script dorado, cuenta regresiva como héroe) y la página de datos sin carácter.

OWN-WORLD: Suelo crema #f6f2e7 con grano suave; titulares en Gloock de alto contraste, caja mixta, interlineado 0.88, en terracota #9d594d; texto en Hanken Grotesk en terracota honda; láminas botánicas recortadas que cruzan los bordes de la página y de las fotos; fotos rectas sin marco; botones en píldora con filete de 1px. La única pieza de papel es la tarjeta (la de pantalla completa, la de respuesta y la de mesa).

STORY: El invitado abre su sobre, ve la tarjeta con su nombre, la tarjeta se asienta al bajar y empieza la página: los nombres gigantes con «Confirmar asistencia», nuestra historia, los detalles de la boda, cómo llegar, el itinerario con su hilo, la vestimenta y los regalos, las preguntas y el cierre, donde responde en la tarjeta que se reparte sobre la mesa.

FIRST VIEWPORT: El sobre y la tarjeta a pantalla completa no cambian de forma (solo de colores). Primera pantalla de la página: en escritorio, dos columnas; a la izquierda «¡Guarda la fecha!» en texto pequeño, «Diego / y / Erika» en Gloock gigante centrado y la píldora «Confirmar asistencia»; a la derecha la foto vertical a casi todo el alto, con una rosa de Redouté sobre su esquina de abajo que sale de la foto, y un ramillete que cuelga desde el borde de arriba de la página. En teléfono, una columna: frase, nombres, píldora y foto.

FORM: fijada por Mario con una imagen de referencia (invitación editorial de Canva) y no por sorteo; las animaciones firma se heredan (sobre, ramo, tarjeta que se asienta, destellos, mariposa, hilo, tarjeta que se reparte, matasellos). seed: none (unavailable)

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Pendiente

Fase 0: mock estático (`.impeccable/mocks/editorial/`) para aprobación de Mario. Después: modelo de datos de la página (Fase 1), diseño editorial en la invitación real (Fase 2), editor tipo WordPress (Fase 3) y asistente de organización (Fase 4).
