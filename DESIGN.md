---
name: Diego & Erika · La suite del sobre
description: Invitación de boda como suite de papelería formal sobre cartulina verde, con su libro de sobres para los novios.
colors:
  verde: "#1c3a2d"
  verde-hondo: "#11261c"
  verde-medio: "#24493a"
  verde-forro: "#2a4d3c"
  verde-luz: "#3e6a52"
  salvia: "#a3bcaa"
  salvia-clara: "#cfdcd2"
  algodon: "#f6f5ef"
  algodon-hondo: "#ecebe2"
  algodon-sombra: "#dcdfd3"
  tinta: "#15271e"
  tinta-suave: "#4b5f55"
  tinta-tenue: "#5d7066"
  linea: "#cdd5cb"
  polen: "#d6981f"
  polen-claro: "#e8b44c"
  polen-hondo: "#9a6a10"
  destello: "#f3d27e"
  destello-luz: "#fff7df"
  declinado: "#9b4a3c"
  mesa-panel: "#edf1ec"
  blanco: "#ffffff"
typography:
  display:
    fontFamily: "'Castoro Titling', 'Castoro', Georgia, serif"
    fontSize: "clamp(2.75rem, 13vw, 4.4rem)"
    fontWeight: 400
    lineHeight: 0.92
    letterSpacing: "0.05em"
  headline:
    fontFamily: "'Castoro Titling', 'Castoro', Georgia, serif"
    fontSize: "clamp(1.7rem, 6vw, 2.3rem)"
    fontWeight: 400
    lineHeight: 1.15
    letterSpacing: "0.1em"
  title:
    fontFamily: "'Castoro Titling', 'Castoro', Georgia, serif"
    fontSize: "1.5rem"
    fontWeight: 400
    lineHeight: 1.2
    letterSpacing: "0.07em"
  label-grabada:
    fontFamily: "'Castoro Titling', 'Castoro', Georgia, serif"
    fontSize: "0.78rem"
    fontWeight: 400
    letterSpacing: "0.24em"
  body:
    fontFamily: "'Castoro', Georgia, 'Times New Roman', serif"
    fontSize: "1.1rem"
    fontWeight: 400
    lineHeight: 1.5
  body-italica:
    fontFamily: "'Castoro', Georgia, 'Times New Roman', serif"
    fontSize: "1.14rem"
    fontWeight: 400
    lineHeight: 1.45
  mano:
    fontFamily: "'Rouge Script', 'Castoro', cursive"
    fontSize: "2.2rem"
    fontWeight: 400
    lineHeight: 1.1
  cifras:
    fontFamily: "'Castoro', Georgia, serif"
    fontSize: "2.2rem"
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "0.04em"
    fontFeature: "'lnum' 1, 'tnum' 1"
  ui:
    fontFamily: "'Hanken Grotesk', system-ui, -apple-system, 'Segoe UI', sans-serif"
    fontSize: "0.95rem"
    fontWeight: 600
    lineHeight: 1.1
  ui-cuerpo:
    fontFamily: "'Hanken Grotesk', system-ui, -apple-system, 'Segoe UI', sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.45
rounded:
  papel: "3px"
  sobre: "4px"
  panel-control: "6px"
  panel-marco: "8px"
  dialogo: "10px"
  pildora: "999px"
  sello: "50%"
spacing:
  filete: "11px"
  campo: "10px 12px"
  tarjeta: "30px 24px 40px"
  vegetal: "44px 28px"
  seccion: "clamp(112px, 15vh, 176px)"
components:
  boton-responder:
    backgroundColor: "{colors.polen}"
    textColor: "{colors.tinta}"
    typography: "{typography.title}"
    rounded: "{rounded.papel}"
    padding: "0 22px"
    height: "58px"
  boton-responder-hover:
    backgroundColor: "{colors.polen-claro}"
  opcion-respuesta:
    backgroundColor: "{colors.blanco}"
    textColor: "{colors.tinta}"
    typography: "{typography.body}"
    rounded: "{rounded.papel}"
    padding: "{spacing.campo}"
    height: "60px"
  tarjeta-algodon:
    backgroundColor: "{colors.algodon}"
    textColor: "{colors.tinta}"
    rounded: "{rounded.papel}"
    padding: "{spacing.tarjeta}"
    width: "440px"
  enlace-accion:
    textColor: "{colors.verde-forro}"
    typography: "{typography.ui}"
    height: "44px"
  panel-boton-principal:
    backgroundColor: "{colors.verde}"
    textColor: "{colors.algodon}"
    typography: "{typography.ui}"
    rounded: "{rounded.panel-control}"
    padding: "0 16px"
    height: "42px"
  panel-boton-principal-hover:
    backgroundColor: "{colors.verde-medio}"
  panel-boton-secundario:
    backgroundColor: "{colors.blanco}"
    textColor: "{colors.tinta}"
    typography: "{typography.ui}"
    rounded: "{rounded.panel-control}"
    padding: "0 16px"
    height: "42px"
  panel-campo:
    backgroundColor: "{colors.blanco}"
    textColor: "{colors.tinta}"
    typography: "{typography.ui-cuerpo}"
    rounded: "{rounded.panel-control}"
    padding: "{spacing.campo}"
    height: "44px"
  panel-segmento-activo:
    backgroundColor: "{colors.verde}"
    textColor: "{colors.algodon}"
    rounded: "{rounded.pildora}"
  panel-contador:
    backgroundColor: "{colors.blanco}"
    textColor: "{colors.tinta}"
    typography: "{typography.cifras}"
    padding: "14px 16px 12px"
  sello-confirmado:
    textColor: "{colors.polen-hondo}"
    typography: "{typography.label-grabada}"
    rounded: "{rounded.pildora}"
    padding: "3px 10px 2px"
  sello-declinado:
    textColor: "{colors.declinado}"
    typography: "{typography.label-grabada}"
    rounded: "{rounded.pildora}"
  sello-pendiente:
    textColor: "{colors.tinta-tenue}"
    typography: "{typography.label-grabada}"
    rounded: "{rounded.pildora}"
---

# Design System: Diego & Erika · La suite del sobre

## Overview

**Creative North Star: "La suite del sobre"**

La invitación es un sobre que va y vuelve. Todo el sistema es papelería formal: una cartulina verde hoja salpicada de destellos dorados que es el suelo de cada pantalla, tarjetas de algodón blanco impresas con tinta verde negra, títulos en romanas grabadas, el nombre del invitado escrito a mano, un sello postal del ramo, un número de sobre y un matasellos que se queda cuando el invitado responde. Nada flota sobre un fondo neutro de sitio web: cada superficie es una pieza de papel con su grosor, su filete y su sombra de mesa.

La densidad es baja y ceremonial en la invitación (una pieza a la vez, columnas estrechas, mucho verde alrededor) y tranquila y exacta en el panel, que hereda el mundo en voz baja: suelo salvia claro, barra de cartulina verde, cifras en casilleros fijos y estados estampados como matasellos. El movimiento es de papel: bisagras, volteos y deslizamientos con fricción, nunca rebotes. El ramo de rosas y lirios blancos florece una vez y luego solo se mece.

Se rechaza el arreglo por defecto del género: sobre marfil con lacre, nombres dorados en script, acuarela y cuenta regresiva como protagonista.

**Key Characteristics:**
- Suelo de cartulina verde (`verde`) con fibra y grano en toda la invitación y, encima, destellos dorados que titilan, como de cuento de hadas (pedido de Mario, 2026-10-22); nunca un fondo claro de página.
- Tarjetas de algodón con filete interior a 11px y una ligera rotación, como piezas sobre una mesa.
- Cuatro voces tipográficas con oficios separados: grabada, texto, mano y controles.
- Las cifras siempre en Castoro con números de caja alta, nunca en la romana grabada.
- Polen azafrán racionado a responder y a la confirmación.
- El número de sobre (N.º 027) une sobre, tarjeta, respuesta y fila del panel.

## Colors

Una gama de bosque y papel: verdes profundos de cartulina, algodón cálido, tinta verde casi negra y una sola nota de polen de lirio.

### Primary
- **Cartulina verde hoja** (`verde`): el suelo de toda la invitación, la barra del panel, el botón principal y el segmento activo del panel. Se acompaña de su familia para dar volumen al papel: **verde hondo** (`verde-hondo`) para el fondo de escena y los avisos, **verde medio** (`verde-medio`) para el hover del botón principal y el fondo del sello postal, **verde forro** (`verde-forro`) para enlaces de acción y el anillo de foco de campos, **verde luz** (`verde-luz`) para el «&» caligráfico y el brillo radial del suelo.

### Secondary
- **Polen de lirio** (`polen`): el botón «Responder», el anillo de foco global y el tramo de confirmados en la barra de reparto. **Polen claro** (`polen-claro`) es su hover y la selección de texto; **polen hondo** (`polen-hondo`) es la tinta del matasellos de confirmación, del sello «Confirmado» y del contador de cupos confirmados en el panel.

### Tertiary
- **Salvia** (`salvia`, `salvia-clara`): tinta clara sobre la cartulina verde: número de sobre, «Con cariño», subtítulo caligráfico del panel, tramo de pendientes.
- **Ladrillo declinado** (`declinado`): solo para «No asiste», errores y la acción de eliminar.

### Destellos
- **Oro de destello** (`destello`) con su **luz** (`destello-luz`): solo los destellos, el polvo y las luces del fondo, con un halo dorado (`destello-halo`) arriba y en las esquinas y las orillas en sombra (`destello-sombra`). En las paletas pastel el destello pasa a oro viejo (#b8862b) y su halo a luz cálida. No es el polen: nunca toca un texto, un botón ni un estado.

### Neutral
- **Algodón** (`algodon`): el papel de toda tarjeta, del papel vegetal y del diálogo del panel. **Algodón hondo** (`algodon-hondo`) para hovers y marcos de foto; **algodón sombra** (`algodon-sombra`) solo para los ceros a la izquierda de los contadores, que son relleno y no información.
- **Tinta** (`tinta`): texto sobre papel. **Tinta suave** (`tinta-suave`) para texto secundario, apellidos y descripciones; **tinta tenue** (`tinta-tenue`) para marcas de sobre, «por confirmar» y placeholders.
- **Línea** (`linea`): bordes de opciones y campos, renglones del mensaje, divisores entre momentos.
- **Mesa salvia** (`mesa-panel`): el suelo del panel. **Blanco** (`blanco`) para tablas, contadores, campos y casillas.

### Paletas elegibles
Desde el panel (Diseño → Tema) los novios eligen una de ocho paletas o un color libre; `assets/estilos.js` redefine con ella los tokens de esta sección (los nombres son los de la paleta verde: `verde` es «el suelo», `algodon` «el papel», `tinta` «la tinta»). **Verde hoja** es la original. Las cinco pastel (**Rosa empolvado**, **Lavanda**, **Azul cielo**, **Durazno**, **Salvia**) tienen suelo y sobre claros, así que lo que va escrito sobre la cartulina pasa a tinta oscura del mismo tono: `tinta-sobre` (nombre del sobre, rúbrica, firma), `salvia` y `salvia-clara` (secundarios, de 4.5:1 o más sobre el suelo). Cada paleta trae además su tinta y su algodón levemente teñidos, los tonos del destello (oro claro sobre suelo oscuro, oro viejo con halo de luz sobre los pastel), el tono de las sombras (`--sombra`), el sello postal repintado y el forro repintado (fondo y líneas; las hojas siguen verdes). En las pastel el matasellos del sobre y el foco van en polen hondo para no perderse. El polen sigue siendo el mismo en todas: es el del lirio. La excepción es **Terracota** (la del tema Editorial, del mock del 2026-10-23): suelo crema #f6f2e7, titulares en terracota #9d594d, texto corrido en terracota honda #84463a (`tinta-texto`, 6.4:1), destellos más suaves, y la acción de responder en terracota en lugar de azafrán. Y **Vino** (la del tema Victoriano, desde 2026-11-05), oscura como Verde hoja: suelo de terciopelo #4f1621, papel marfil #f8f1e2, tinta parda #2f1517, lo escrito sobre el suelo en oro claro #ecd49c, los enlaces sobre el papel en vino #7a2433, el polen en oro #c9a04e y el forro en líneas de oro #caa45a sobre vino #5e1d2a.

### Named Rules
**La regla del suelo verde.** La invitación entera, de la escena del sobre al remite, se apoya en la cartulina del suelo (`verde`, sea cual sea la paleta). El papel claro solo existe como pieza (tarjeta, vegetal, foto), nunca como fondo de página. Desde 2026-10-27 los novios pueden poner un fondo propio (color, degradado o foto con velo del color del suelo); sobre él, lo escrito en el suelo se oscurece o se aclara solo para leerse. En el tema Editorial el suelo es la página crema y el papel queda solo para las tarjetas.

**La regla del polen.** El azafrán significa «responder» y «confirmado». Va en el botón de respuesta, en el foco, en el matasellos de confirmación y en sus reflejos del panel (sello, contador y tramo de confirmados). No se usa como decoración ni para otro estado. Los destellos del fondo van en su propio oro (`destello`) y no cuentan como polen.

**La regla del matasellos.** El estado persistente de una respuesta se marca con un matasellos en tinta de sello: polen hondo para confirmado, tinta suave (invitación) o ladrillo (panel) para declinado.

## Typography

**Display Font:** Castoro Titling (con Castoro y Georgia)
**Body Font:** Castoro, redonda e itálica (con Georgia y Times New Roman)
**Hand Font:** Rouge Script (con Castoro y cursive)
**Label/UI Font:** Hanken Grotesk (con system-ui)

**Character:** Una romana grabada de capitulares espaciadas como en una tarjeta impresa en relieve, una serifa de texto cálida con itálica de carta, una caligrafía que solo escribe nombres y una grotesca discreta que aparece cuando hay que operar algo.

### Hierarchy
- **Display** (Castoro Titling 400, clamp(2.75rem, 13vw, 4.4rem), interlineado 0.92, +0.05em): los nombres de la pareja en la invitación.
- **Headline** (Castoro Titling 400, clamp(1.7rem, 6vw, 2.3rem), 1.15, +0.1em): «El día» y los títulos grabados de sección; dentro del papel vegetal baja a 1.35rem con +0.24em.
- **Title** (Castoro Titling 400, 1.5rem, 1.2, +0.07em): título de la tarjeta de respuesta; el botón «Responder» usa la misma voz a 1.02rem con +0.16em. En el panel, títulos de 1.12 a 1.8rem con +0.05 a +0.08em.
- **Label grabada** (Castoro Titling 400, 0.66 a 1.05rem, +0.14 a +0.44em): apellidos, cupos, nombres de momento, número de sobre, sellos de estado. Siempre en caja alta porque la familia solo tiene capitulares.
- **Body** (Castoro 400, 1.1rem, 1.5, máximo 25 a 34ch): lugares, vestimenta, regalos, resúmenes. La **itálica** (1.14rem, 1.45) lleva el texto de la invitación, «por confirmar», «Para» y el mensaje del invitado.
- **Mano** (Rouge Script 400, 2.2rem en la tarjeta, clamp(2.5rem, 11.5vw, 3.4rem) en el sobre, hasta 4.4rem en la firma): el nombre del invitado, el «&» y la firma «Diego & Erika».
- **Cifras** (Castoro 400, números de caja alta y tabulares, +0.04em): todo número; 2.2rem en el contador de asistentes, 2.1rem en los contadores del panel.
- **UI** (Hanken Grotesk 600, 0.92 a 0.95rem): enlaces de acción, errores, notas y todo el panel (cuerpo a 1rem, 400).

### Named Rules
### Familias de letra elegibles
Cuatro familias, cada una con sus cuatro voces (`--f-grabada`, `--f-texto`, `--f-mano`, `--f-cifras`) y dos escalas para igualar tamaños (`--escala-nombres`, `--escala-mano`): **Grabada** (Castoro Titling, Castoro, Rouge Script; la original), **Romana** (Cinzel, Crimson Pro, Great Vibes), **Romántica** (Playfair Display, Lora, Parisienne) y **Fina** (Bodoni Moda, Spectral, Allura). La voz grabada siempre va en caja alta (`text-transform: uppercase`), porque las otras romanas sí tienen minúsculas. Las fuentes se cargan solo cuando la familia está elegida. La sexta, **Victoriana** (Old Standard TT para la voz grabada, el texto y las cifras; Pinyon Script para la mano; la del tema Victoriano), lleva la grabada en caja alta como siempre. La quinta, **Editorial** (Gloock, Hanken Grotesk, Rouge Script; la del tema Editorial), va en caja mixta: sus titulares no se pasan a mayúsculas y las etiquetas chicas (apellidos, cupos, marcas) pasan a la sans. Desde 2026-10-27 la letra del texto puede ser otra familia que la de los títulos (`letraTexto`): de ella se toman `--f-texto` y `--f-cifras`.

**La regla de las cifras.** Ningún número se compone en Castoro Titling: su «1» se lee como «I». Toda cifra va envuelta en la voz `--f-cifras` (Castoro, `lining-nums`), también dentro de etiquetas grabadas, matasellos y sellos de estado.

**La regla de la mano.** Rouge Script escribe solo lo que se escribiría a mano en un sobre real: el nombre del destinatario, el «&» y la firma. Nunca un título, un botón ni un párrafo.

**La regla del control.** Hanken Grotesk aparece donde hay que operar (enlaces de acción, errores, notas técnicas, el panel). En la invitación nunca compone contenido ceremonial.

## Layout

Teléfono primero. La invitación es un recorrido vertical de escenas. El sobre y luego la tarjeta ocupan el 100 % de la pantalla; la tarjeta se asienta sobre la mesa. Después, cada parte es un **pliego** (pedido de Mario, 2026-10-23, con una invitación de Canva como referencia de organización): su título grande impreso en la cartulina, sus piezas de papel y, si le toca, una foto de la pareja. El orden de siempre: Los detalles (con foto), Cómo llegar, Dónde quedarse, Itinerario (con foto), Nuestra historia (con foto), las fotos que sobran, el forro con la vestimenta, los regalos y las dudas, Preguntas frecuentes y, al final, la respuesta (con foto) antes del remite. Desde 2026-10-27 es una lista de bloques que los novios ordenan, ocultan y completan en Diseño; la portada va siempre primero y el remite al final, y las fotos de la pareja siguen el orden de los bloques. Los pliegos miden 620px (920 Cómo llegar, 1040 las fotos sueltas) y entre uno y otro hay `--entre-pliegos` de verde (clamp(112px, 15vh, 176px)), también antes del forro y del remite; dentro, el título queda a 26–36px de su pieza. Nada se monta: cada pieza tiene su aire.

Cortes en 640px (padding generoso, botones de mapas en tres columnas, hora del itinerario a la izquierda del hilo, las tarjetitas de los detalles repartidas en la columna, tres fotos sueltas en fila) y 960px (mapa y datos de cada lugar lado a lado, alternando; un pliego con foto pasa a dos columnas, texto de 620px y foto de 440px, con la foto a la derecha y a la izquierda alternadas; sin foto, las tarjetitas de los detalles van en fila; la vestimenta y los regalos lado a lado). Con `min-width: 960px` y proporción de al menos 5:4, la tarjeta pasa a apaisada: la foto en arco con el ramo a la izquierda (44 %), el texto a la derecha y el doble filete a 22px. Con `max-height: 740px` la portada aprieta el interlineado y la pista queda solo en flecha.

El panel es una obra de hasta 1320px con padding lateral `clamp(16px, 3vw, 32px)`: barra fija arriba, franja de contadores (2, 3 y 6 columnas en 0, 760 y 1100px), y a partir de 1100px el libro de invitados con una columna lateral fija de 320px para respuestas recientes. Bajo 760px la tabla se convierte en tarjetas.

## Elevation & Depth

Profundidad física de papel sobre mesa. Las piezas llevan una sombra en tres capas que imita grosor, contacto y caída. El sobre, que llena la pantalla, marca su volumen por dentro: la solapa proyecta sombra sobre el bolsillo y el borde del bolsillo sobre la tarjeta que espera dentro. Las rotaciones leves (-0.8°, 1.1°, -0.5°) son parte de la profundidad. El papel vegetal es la única capa translúcida: algodón al 87% con `backdrop-filter: blur(1px)` sobre el forro estampado. El panel es casi plano: bordes de línea y sombras solo en diálogo, avisos y tarjeta de entrada.

### Shadow Vocabulary
- **Sombra de tarjeta** (`--sombra-tarjeta`: `0 1px 1px rgba(8,24,16,.18), 0 10px 24px -8px rgba(6,20,13,.5), 0 32px 60px -24px rgba(4,14,9,.6)`): toda tarjeta y foto de la invitación.
- **Canto del botón de respuesta** (`inset 0 1px 0 rgba(255,255,255,.35), 0 2px 0 var(--polen-hondo), 0 8px 16px -8px rgba(8,24,16,.4)`): el botón se hunde 2px al pulsarlo y pierde el canto.
- **Vegetal** (`0 22px 44px -26px rgba(8,24,16,.55)`): sombra larga y suave del papel translúcido.
- **Diálogo del panel** (`0 40px 80px -30px rgba(4,14,9,.7)`) y **aviso** (`0 16px 30px -12px rgba(0,0,0,.5)`).
- **Anillo de foco de campo** (`0 0 0 3px rgba(42,77,60,.18)`): campos del panel.

### Named Rules
**La regla del papel sobre la mesa.** Una sombra solo existe si hay una pieza de papel que la proyecta. Nada de resplandores ni sombras de color. Los halos de los destellos son luz del fondo, no sombra de ninguna pieza: nunca rodean una tarjeta, una foto ni un botón.

## Shapes

Esquinas de papel cortado: 3px en tarjetas, opciones y botón de respuesta; 4px en el sobre y sus solapas. Los sellos de cierre (monograma «D E») son círculos de algodón con doble anillo interior. El sello postal tiene borde perforado por máscara radial. Las tarjetas llevan un filete de 1px a 11px del borde. El mensaje del invitado se escribe sobre renglones de 32px, sin caja. El panel suaviza las formas a 6px en controles, 8px en marcos y avisos, 10px en el diálogo y píldoras completas en filtros y sellos de estado.

## Components

### Buttons
Táctil y ceremonial en la invitación; sobrio y exacto en el panel.
- **Responder (primario de la invitación):** polen con tinta, voz grabada a 1.02rem con +0.16em, 58px de alto, 22px de padding lateral, esquina de papel (3px) y canto de 2px en polen hondo. Hover a polen claro; al pulsar se hunde 2px. Mientras envía muestra un giro y baja a 75% de opacidad.
- **Enlace de acción:** Hanken 600 a 0.95rem en verde forro, subrayado al 40% que se completa en hover, 44px de alto mínimo. Sobre la cartulina verde pasa a salvia clara.
- **Contador (±):** círculo de 48px con trazo de tinta de 1.5px sobre blanco; desactivado al 30%.
- **Panel:** botón principal en cartulina verde con algodón (hover verde medio), secundario blanco con borde de línea, peligro en ladrillo, botones de barra transparentes con borde blanco al 18%. 42px de alto, 6px de radio, Hanken 600 a 0.92rem.

### Chips
- **Segmentos de filtro (panel):** píldoras blancas con borde de línea y texto tinta suave; la activa en cartulina verde con algodón y su recuento.
- **Sellos de estado (panel):** píldora con doble anillo (borde de 1.5px más halo de 2px blanco y 1px de color), voz grabada a 0.72rem con +0.14em, rotada -2°. Confirmado en polen hondo, No asiste en ladrillo, Pendiente en tinta tenue con trazo discontinuo y sin halo.

### Cards / Containers
- **Corner Style:** papel cortado (3px).
- **Background:** algodón con un grano muy fino de papel.
- **Shadow Strategy:** sombra de tarjeta (ver Elevation & Depth).
- **Border:** filete interior de 1px en tinta al 13% a 11px del borde.
- **Internal Padding:** 30px 24px 40px en la invitación, 48px 26px 44px en detalles; más amplio desde 640px.
- **Marca de sobre:** cada tarjeta lleva abajo a la derecha su «Sobre N.º 027» o «Respuesta · N.º 027» en voz grabada tenue, con el número en cifras.

### Inputs / Fields
- **Opciones Sí / No:** casillas de 60px en dos columnas, borde de línea y fondo blanco al 50%; marcadas pasan a borde tinta y fondo blanco, y la palomita se dibuja con un trazo (0.35s). Foco con anillo de polen.
- **Mensaje:** textarea sin caja, en itálica a 1.08rem sobre renglones de 32px que se oscurecen al enfocar.
- **Panel:** campos blancos de 44px, borde de línea, 6px de radio; foco con borde verde forro y anillo verde al 18%; inválido en ladrillo.
- **Foco global:** contorno de 3px en polen con 3px de separación.

### Navigation
La invitación no tiene navegación: se recorre como un objeto, de arriba abajo. El panel tiene una barra fija de cartulina verde con el sello monograma, el título grabado «Libro de sobres», la firma caligráfica en salvia, siete pestañas («Invitados», «Mesas», «Tareas», «Presupuesto», «Proveedores», «La boda» y «Diseño», la activa en algodón con un subrayado de 2px; bajo 1100px pasan a una fila propia que se desliza si no caben, y la elegida queda a la vista), un chip de modo y botones de barra (bajo 1280px solo con su ícono y sin el chip).

### Tema Vino & Marfil (2026-11-06)
Romántico y elegante con un toque gótico botánico; ritmo claro/oscuro. Colores (paleta Vino & Marfil): suelo marfil #f6efe6, papel #fffdf9, vino principal #6b0f1e (títulos de tarjeta, botones, filigranas, corazón), vino hondo #4a0a12 (títulos sobre el suelo), acento #8e2436 (hover), rosa viejo #b86a76 (filetes y divisores sobre lo oscuro), rosa polvo #e5d6d6, noche vino #2a0509 (secciones oscuras), oro #c9a15b/#ecd49c (solo el lacre, los iconos y la hora del itinerario, el marco del camafeo y el monograma). Letras: Cinzel en versales con +0.2em para los títulos (1.45–2.3rem), Cormorant Garamond a 1.08rem para leer y para las cifras, Pinyon Script para nombres, «¡Nos casamos!» y «¡Gracias!». **Intro:** foto a pantalla completa con un velo de noche vino y verde bosque, tres velos de niebla que cruzan en 46–62 s (solo transform), el sobre vino apaisado (88vw, máx. 560px, 0.68 de alto) que flota 8px en 6 s, con lo escrito en oro claro y sus piezas medidas en cqw/cqh; lacre dorado irregular que se rompe (escala 1.3, gira 10° y se apaga en 520 ms) antes de abrir la solapa. **Títulos:** versales vino hondo con el divisor de corazón (150×15px, máscara) en vino acento. **Tarjetas:** papel con un filete interior al 30% del vino y, en las formales, filigrana de volutas en las cuatro esquinas (62px) y una cresta arriba (120px), en máscara del color de la paleta. **Botones:** píldora vino llena con texto marfil en Cinzel a 0.8rem +0.14em. **Portada:** la primera foto a 100svh (máx. 980px) con velo arriba y abajo y borde de papel rasgado de 26px; las otras dos a 4:5, desfasadas 44px. **Secciones oscuras** (itinerario, polaroids, cierre) de lado a lado con box-shadow de 100vmax recortado. **Itinerario:** iconos lineales en círculos de 44px con borde oro, hora en Cinzel oro claro, el hilo y los puntos alcanzados en oro. **Polaroids:** marco #fbf8f2 con 38px abajo, giradas −7°/5°/−3°/8°, en blanco y negro; caen 46vh con giro al llegar (1.1 s, escalonadas 140 ms) y al tocarlas se enderezan y pasan a color (0.6/0.9 s). **Calendario:** tira de fecha entre filetes, el día en un corazón vino con la cifra en marfil, «Faltan» en versales y la cuenta en Cormorant 500. **Camafeo:** óvalo 3:4 con marco dorado cónico de 11px, doble filo y cresta. **Música:** botón redondo de 52px abajo a la derecha, vino hondo con cuatro barras que ondulan mientras suena. **Sin ramo ni destellos** (pedido de Mario, 2026-11-06): la tarjeta de la portada queda con la foto en arco y los nombres; el suelo, marfil liso con su grano.

Correcciones del 2026-11-07 (crepúsculo, como el video): el suelo de todo el tema es la foto del bosque fija detrás de la página con velos verdes y negros (sin filtros), y lo escrito sobre él va en marfil #f3e6d8. El sobre de la intro empieza por la solapa: «Abrir aquí» en oro claro a la izquierda del lacre y «Para…» en caligrafía sobre el bolsillo; la tarjeta con filigrana sube 46% al abrir (900 ms). La invitación formal va sobre una banda gris niebla de lado a lado, dentro de un sobre vino (fondo con la solapa abierta hacia arriba y bolsillo con corte en V de 250px) del que sube 170px al llegar (1.3 s), con un lacre dorado de 58px arriba. Polaroids a color en su proporción, 2 columnas en el teléfono y 4 desde 900px, que entran desde −120vw con giro (1.15 s, escalonadas). La vestimenta es una lámina de 980px: código en versales entre filetes, figuras de 132px (traje azul marino, vestido del sexto color de la paleta) con Ellos y Ellas a los lados, rótulos entre filetes, círculos de 40px, cuatro parejas de ejemplo y rosas de Redouté en dos esquinas. El cierre va sobre el damasco del forro con un velo de noche vino al 72–86%.

### Entrada del panel
Desde 2026-11-06, en la tarjeta de entrada, debajo del subtítulo, «Continuar con Google» a lo ancho (48px), el botón claro de las pautas de Google: fondo blanco, borde #747775, texto #1f1f1f en Hanken 600 y la G de cuatro colores a 20px (son los únicos colores de marca ajenos del panel, y solo aquí). Debajo, en Hanken a 0.86rem y tinta suave, «Con tu cuenta de Google entras al panel y queda conectado el calendario de las tareas.». Después, plegada, «o entra con la clave del panel» (o «con correo y contraseña» con Supabase) entre dos filetes de línea, que abre los campos de siempre con «Entrar» en botón secundario. Sin ID de cliente de Google, la tarjeta es la de antes: los campos abiertos y «Entrar» en verde.

### La boda (panel)
Formulario en hojas blancas con borde de línea y radio de 8px: Foto principal, Fecha, Ceremonia, Recepción, Itinerario, Fotos de la pareja, Vestimenta y regalos (el estilo pasó a Diseño). **Fotos:** zonas de subida con borde discontinuo (tocar o arrastrar), miniaturas cuadradas con mover antes, mover después y quitar, sello «Sin guardar» en polen hondo hasta guardar; la foto principal se encuadra tocándola (o con dos controles) junto a una vista del arco con el ramo, en las proporciones del teléfono. Cada lugar lleva sus campos a la izquierda y un mapa de 4:3 a la derecha. Con clave de Google Maps hay buscador con autocompletado, mapa y pin que se arrastra. Sin clave, la vista previa se busca por nombre y dirección, con la nota «revisa que el mapa muestre el lugar correcto», y el pin se fija pegando el enlace de «Compartir». El itinerario es una lista de filas (hora, momento, detalle) con botones para subir, bajar y quitar. Una barra de guardar fija abajo, en mesa salvia translúcida, muestra el estado en polen hondo cuando hay cambios sin guardar.

### Diseño (panel)
La invitación como en WordPress (pedido de Mario, 2026-10-27). Dos columnas desde 900px: a la izquierda el editor en una hoja blanca de 320–400px; a la derecha la vista previa, fija mientras el editor baja, sobre un fondo punteado de mesa salvia: un teléfono de 390px con marco de 8px casi negro y radio de 22px, o el computador pintado a 1280px y achicado para caber. Encima de la vista, segmentos «Teléfono / Computador» y «Una persona / Una familia», y «Ver el sobre». En el teléfono, dos segmentos «Editar / Vista previa» muestran uno a la vez. Arriba, el título grabado «Diseño», el estado del borrador (en polen hondo con cambios sin publicar) y «Descartar cambios» y «Publicar» (principal). **Bloques:** pestañas en una franja de mesa salvia; la lista es de filas blancas con borde de línea (asa de seis puntos, ícono en verde forro, nombre en Hanken 600 con su resumen debajo, subir, bajar y el ojo); la portada y el cierre van fijos en filas discontinuas sobre mesa salvia; la fila abierta lleva borde verde y un filete de 3px a la izquierda; la oculta baja al 55 %; la que no se ve por falta de datos dice por qué en polen hondo. Al arrastrar, la fila se levanta con sombra y las demás le abren campo. «Agregar bloque» despliega los ocho libres en fichas con su ícono y su ayuda. **Un bloque abierto:** «‹ Bloques», su título grabado con ícono, la ayuda, el aviso (oculto o sin datos) en crema y el enlace a La boda en mesa salvia; los campos de siempre del panel, con el texto de siempre en gris como placeholder; las láminas del separador en una rejilla de tres; las fotos en miniaturas cuadradas. **Tema:** grupos separados por línea: los dos temas en fichas con su miniatura, las paletas y las letras como en el antiguo Estilo (tarjetas con radio oculto, borde verde y palomita), el fondo en segmentos con sus colores, el trato y la mariposa. En la vista previa, cada bloque se enmarca con un trazo discontinuo de polen al pasar y uno continuo de 3px cuando está abierto.

### Mesas (panel)
El plano del salón como una hoja blanca con borde de línea y radio de 8px, en proporción 3:2 (1200 × 800 unidades), con el piso punteado cada 40 unidades en línea y los muros en tinta tenue. Encima, cuatro contadores (Mesas, Puestos con sus libres, Personas con mesa, Personas sin mesa; 2 columnas y 4 desde 760px) y la leyenda de sillas; debajo del título «Mesas», los botones «Espacio», «Mesa larga» y «Mesa redonda» (principal), y la casilla «Mostrar su mesa a los invitados» en una franja blanca que se enmarca en verde forro al encenderse. **Mesas:** tablero blanco con trazo de 1.5px en tinta tenue (sin escalar con el plano), número en cifras al centro y la cuenta «6/8» en Hanken debajo; alrededor, una silla por puesto: polen con borde polen hondo si quien se sienta confirmó (el mismo polen del tramo de confirmados), salvia si no ha respondido, blanca con borde de línea si está libre. La mesa elegida se llena de cartulina verde con cifras en algodón; la que se pasa de puestos lleva el borde en ladrillo. Redonda: radio que crece con los puestos. Larga: sillas a los dos lados, horizontal o vertical. **Espacios** (pista, entrada, música): rectángulos en mesa salvia con trazo discontinuo y su nombre en voz grabada, partido en líneas para que quepa; elegidos, trazo verde continuo y un tirador circular verde en la esquina para cambiar el tamaño. Las mesas elegidas también llevan su tirador (con flechas dobles): en el borde de la redonda, a 45°, y en la punta de la larga; arrastrarlo suma o quita un puesto cada 14px (dos en la larga). En el teléfono los tiradores pasan de 17 a 36 unidades para el dedo. Las piezas se arrastran con rejilla de 10 unidades; con teclado, flechas (Mayúscula ×5) y Supr. El foco es un anillo de polen alrededor de la silueta con sus sillas. Mientras se sienta a una familia, una franja de cartulina verde sobre el plano dice a quién, los espacios se apagan al 40 % y las mesas se iluminan en algodón hondo con borde verde forro al pasar. Al lado (fijo desde 1100px, debajo en teléfono): el inspector en hoja blanca (título grabado «Mesa 4», ocupación en cifras, pasos de número y puestos, nombre, forma en segmentos y la lista «Se sientan aquí») y «Por sentar», una lista de filas blancas con nombre, puntos de estado y la acción en verde forro; la familia elegida pasa a cartulina verde. En el teléfono el plano entra completo: sin la cuenta, con el número a 40 unidades y los nombres de los espacios más grandes.

### Planeación (panel)
Tres pestañas con el mismo oficio tranquilo del libro de sobres: contadores arriba, una barra de reparto y la lista en hojas blancas. Se guardan solas, con el estado («Cambios sin guardar» en polen hondo, «Guardado») al pie. **El verde forro es «hecho»:** tareas hechas, lo pagado, el gasto saldado y el proveedor contratado van en verde forro; el polen sigue siendo solo de los invitados (responder y confirmado), y lo atrasado o pasado de presupuesto, en ladrillo.
- **Tareas:** desde 2026-11-05 una sola lista con fechas, no por etapas (pedido de Mario). Una hoja blanca con rótulos cortos en voz grabada a 0.78rem (+0.16em) donde empieza cada tramo: «Atrasadas» (en ladrillo), «Esta semana», «Más adelante», «Sin fecha» y «Hechas». Cada tarea lleva a la izquierda la hojita de calendario de «Próximos pagos» (46px, filete superior de 4px en verde forro, ladrillo si está atrasada; discontinua, «sin fecha», si no tiene) y la casilla de 24px que se llena de verde forro con su palomita trazada; hecha, el texto se tacha en tinta tenue y se queda en su lugar hasta volver a pintar (desmarcarla es el deshacer). Debajo, en Hanken a 0.86rem: el día de la semana con la fecha larga y la hora, «Atrasada» en ladrillo, la nota, «Ir a Mesas» en verde forro y, con Google Calendar, un punto verde forro «En Google Calendar» o un anillo tenue «Por pasar a Google Calendar». Sobre la lista, la franja **Google Calendar**: blanca con borde de línea (enmarcada en verde forro cuando está conectada, con el sello «Conectado»), título grabado, su estado en una línea (en ladrillo si falló), debajo «Con la cuenta» y el correo en 600 (tinta tenue a 0.84rem) cuando está conectada, y a la derecha «Conectar con Google» (o «Renovar el permiso» cuando venció la hora) o «Sincronizar ahora», «Abrir Google Calendar» y «Desconectar». Si el calendario es de otra cuenta, el borde pasa a discontinuo en tinta tenue (un aviso, no un error), sin sello, con «Pasarlas a esta cuenta» y «Desconectar». El diálogo de la tarea pide fecha y hora (opcional) en una fila.
- **Presupuesto:** cinco contadores de dinero con la cifra a 1.45rem y su nota debajo («quedan $ 44.000.000»); el último ocupa la fila que le quede. Cada categoría es un título grabado con su suma y una tabla (estimado, costo final, pagado, por pagar alineados a la derecha en cifras tabulares; «Pagado» en verde forro cuando no queda saldo); en el teléfono cada gasto es una tarjeta con sus cuatro montos en dos columnas. «Próximos pagos» va en la columna lateral: una hojita de calendario (filete superior de 4px en verde forro, ladrillo si venció) con el día en cifras y el mes grabado.
- **Proveedores:** fichas blancas en rejilla de 290px: categoría en Hanken tenue, sello de estado (Contratado en verde forro, Evaluando discontinuo en tinta tenue, Descartado en ladrillo), nombre en Castoro a 1.3rem, precio en cifras, «En el presupuesto: …» en verde forro y la nota en itálica. Al pie, WhatsApp, llamar, correo y página a la izquierda; presupuesto, editar y quitar a la derecha.
- **La boda:** alojamiento, listas de regalos y preguntas frecuentes usan filas como las del itinerario (fondo #fbfbf8, subir, bajar y quitar); la cuenta para transferencias es una rejilla de campos.
- **Lo que pidieron:** debajo de «Respuestas recientes», dos listas: «Para el banquete» (familia, cuántas personas y su restricción en itálica) y «Para la música» (la canción en itálica y quién la pidió).

### Pliegos
Cada parte de la invitación después de la portada. El **título de pliego** va impreso en la cartulina, en voz grabada en caja alta, clamp(2.15rem, 1.1rem + 4.4vw, 4.4rem) (por `--escala-nombres`), interlineado 0.98 y +0.05em, en `tinta-sobre`, alineado a la izquierda y con un filete corto de 56px debajo; el de la respuesta es una frase («Esperamos compartir este día contigo», «con ustedes» si hay varios cupos) y baja a clamp(2rem, 1rem + 3.8vw, 3.6rem). Debajo, sus piezas, que ya no llevan el título adentro. La **foto del pliego** es una copia grande de algodón con esquineros de 30px: en teléfono va debajo, al 86 % (hasta 420px; 560 si es apaisada), corrida a la derecha y a la izquierda alternadas y girada 1.8° o -1.6°; desde 960px va al lado, a 440px, alternando de lado entre pliegos. Las fotos de la pareja se reparten en el orden del panel (`Papeleria.lugaresFotos`): la 1 en Los detalles, la 2 en el Itinerario, la 3 en Nuestra historia si hay historia, la siguiente junto a la respuesta; las demás van sueltas en su pliego (ver Fotos y visor). Sin foto, el pliego es una sola columna.

### Bloques libres
Se agregan desde Diseño y van entre los pliegos con su mismo aire (`--entre-pliegos`). En Pliegos: **Texto** en una tarjeta de algodón (girada 0.4°) o en la tinta del suelo, centrado o a la izquierda; **Foto** como copia de algodón girada -1.2° (o recta a todo el ancho, 1040px) con su pie a mano; **Galería** de copias en dos columnas (tres desde 960px) giradas -1.4°, 1.1° y -0.6°; **Cita** en itálica grande con comillas latinas y el autor en grabada; **Botón** en píldora de filete de 1px que se llena al pasar; **Separador** con una lámina de Redouté (120–200px) o una línea fina con un punto; **Cuenta regresiva** en cuatro tarjetitas de algodón con la cifra grande y su nombre en grabada; **Video** de YouTube (sin cookies) o Vimeo en un marco de algodón 16:9. Vacíos, solo se ven con su aviso en modo local y en la vista previa.

### Tema Victoriano
El de siempre desde 2026-11-05 (pedido de Mario: «el espíritu victoriano», con las invitaciones de colección de Lovent Invita como referencia de cómo se ve). Es el HTML de Pliegos vestido en `assets/victoriano.css` (`html[data-tema='victoriano']`), con la paleta **Vino** y la letra **Victoriana**. **Suelo:** terciopelo vino #4f1621 con la fibra y el grano de siempre, un brillo de terciopelo arriba, la orilla de abajo más honda y, debajo de un velo del 90 %, el forro del sobre repetido a 360px como un damasco (rosas y lirios en líneas de oro sobre vino). **Papel:** marfil #f8f1e2 con un brillo más claro arriba; en lugar del filete de 1px, `adornos/marco-victoriano.svg` como `border-image` (corte de 40, 22px en las tarjetas, 30px en la de portada y en el álbum): doble filete dorado con las esquinas cortadas hacia adentro, una voluta en cada esquina y un punto de oro. **Letra:** Old Standard TT (la romana de los libros del siglo XIX) para la voz grabada, el texto y las cifras; Pinyon Script (caligrafía inglesa) para la mano. Los **títulos de pliego** van en la caligrafía, centrados, a clamp(2.9rem, 1.8rem + 4.4vw, 5rem), en `tinta-sobre` (oro claro #ecd49c, 9:1 sobre el vino), con la floritura de *Harpel's Typograph* (1870, `adornos/floritura-harpel.svg`) debajo como máscara rellena de un degradado de oro (oro hondo, oro claro, oro). Los nombres de la portada y los de las tarjetitas de Los detalles («El día», «La ceremonia») también van en la caligrafía; los apellidos y las etiquetas, en la romana en caja alta espaciada. El arco de la foto de la portada lleva un filete dorado a 6px. **Responder** es un botón dorado (degradado de #ecd08a a #a8812f, canto de polen hondo); los **sellos** del sobre y del remite son lacre dorado irregular con el monograma en la caligrafía, en relieve. El polen de esta paleta es oro (#c9a04e): responder y confirmado siguen siendo lo único que lo usa como acción; las florituras y los filetes usan su propio oro (`--oro`, `--oro-claro`, `--oro-hondo`). Los destellos van en oro claro sobre el terciopelo, como luz de vela.

### Álbum (signature)
Pedido de Mario (2026-11-05): las fotos de los novios ocupan el hero después de la tarjeta, en orden jerárquico. Es una sección (`album`, en Diseño se oculta y se le cambian la frase y los nombres) que va primero después de la portada y se lleva las tres primeras fotos de la pareja (`Papeleria.lugaresFotos`); sin fotos no aparece. Encima, sobre el suelo: «¡Nos casamos!» en la romana en caja alta (+0.3em), los nombres en la caligrafía a clamp(3.2rem, 2rem + 6vw, 6.4rem) con su floritura y la fecha larga en caja alta. Debajo, la página del álbum: en Victoriano, una hoja marfil con el marco dorado y ventanas ovaladas 4:5 cortadas en ella, cada una con un bisel de oro (degradado cónico de 6–10px) y la sombra del corte encima de la foto; la foto, con un tono de copia antigua (sepia 16 %). Desde 900px, tres columnas (1 : 1.55 : 1): la primera foto grande en el centro, la segunda a la izquierda pegada abajo y la tercera a la derecha pegada arriba; en el teléfono la grande al 88 % y las dos chicas debajo, lado a lado. Dos láminas de Redouté (rosa real arriba a la izquierda, rosa damascena abajo a la derecha) se imprimen en `multiply` sobre la página, como en un álbum cromolitografiado. En Pliegos y Editorial es la misma composición con las fotos rectas.

### El gran día
La sección `calendario`, después de Los detalles: una tarjeta (girada -0.6°) con el mes de la boda de domingo a sábado (`<table>`, «Dom Lun Mar…» en Hanken o en la romana), el nombre del mes en voz grabada (en Victoriano, en la caligrafía con el año en cifras pequeñas) y el día encerrado en un círculo a mano en polen hondo (verde forro en Victoriano) que no se anima; debajo, la fecha larga y la hora en itálica. Sin fecha no aparece.

### Tema Editorial
El mock del 2026-10-23, como segundo tema (pedido de Mario, 2026-10-27: los dos diseños, como temas). Usa el mismo HTML que Pliegos (`html[data-tema='editorial']`). Los pliegos se abren a 1360px con `--margen` a los lados y, desde 960px, una rejilla de 12 columnas: el texto en 6 y la foto en 5, alternando de lado y llegando al borde de la página. Los titulares en la voz grabada a clamp(3rem, 1.25rem + 6vw, 6.6rem), interlineado 0.9, -0.025em, sin filete. Las piezas de papel se imprimen en la página: sin papel, sin giro, sin marca de sobre ni esquineros; los datos de Los detalles en tres columnas con la etiqueta en Hanken 500 en caja alta (+0.2em) y el dato en el titular; el itinerario con la hora en Hanken y el momento en el titular, el hilo en `tinta-sobre`; los botones de mapas en píldora de filete. Las fotos van rectas, sin marco. La vestimenta, los regalos y las dudas pierden el forro y el papel vegetal y quedan en dos columnas. El único papel es la tarjeta: la de portada, la de respuesta (con «Enviar» en píldora) y la de mesa. **Láminas de Redouté** (rosa real en Los detalles, lirio en el Itinerario, ramillete en la respuesta) se asoman desde el borde en el aire entre las partes, detrás del texto: sobre un suelo claro se imprimen en `multiply`; sobre uno oscuro van opacas con su sombra. Funciona con cualquier paleta: los titulares en `tinta-sobre` y el texto en `tinta-texto` (o `tinta-sobre`).

### Dónde quedarse, Nuestra historia y Preguntas frecuentes
Tres pliegos que solo aparecen si los novios los llenan, cada uno con su tarjeta de algodón a todo el ancho del pliego y su marca de sobre. **Dónde quedarse** (después de Cómo llegar, -0.6°): una nota en itálica y los hoteles separados por líneas, el nombre en Castoro a 1.35rem, la dirección en tinta suave, la nota en itálica y «Ver el hotel» y «Cómo llegar» como enlaces de acción. **Nuestra historia** (después del itinerario, -0.4°): una carta, con párrafos en texto a 1.12rem alineados a la izquierda en 36ch y la firma «Diego & Erika» a mano (2.3rem) abajo a la derecha. **Preguntas frecuentes** (antes de la respuesta, 0.5°): renglones entre líneas; la pregunta en texto a 1.12rem con un más trazado a pluma que se vuelve menos al abrir, y la respuesta en itálica tinta suave.

### Regalos
En el papel vegetal de regalos, debajo del mensaje: la cuenta para transferencias en una ficha de borde punteado (banco, número, a nombre de, documento; las etiquetas en grabada a 0.68rem y el número en cifras a 1.45rem) con «Copiar el número», y las listas de tiendas como enlaces de acción con el ícono de regalo. Sin mensaje pero con cuenta o listas, no dice «por confirmar».

### Quiénes van
En la tarjeta de respuesta, solo con más de un cupo y cuando marcan que van: debajo del contador «¿Cuántos irán?», «¿Quiénes van?» en la etiqueta de campo y un renglón por persona (los mismos renglones en itálica del mensaje, con su número en cifras tenues a la izquierda: «1.», «2.»), que crecen y se achican con el contador y guardan lo escrito. Un renglón vacío no deja enviar: se marca con la línea en ladrillo y el aviso pide «el nombre de cada persona que va». Respondida, la tarjeta suma «VAN» a sus datos (como «COMIDA» y «CANCIÓN»), con los nombres unidos como en una frase («Ana, Luis y Marta»). En el panel: debajo del nombre de la invitación, «Van: …» en tinta suave a 0.88rem y, si faltan, «falta 1 nombre» en itálica 600; en «Respuestas recientes», los nombres bajo la línea de la respuesta; y el bloque **Quiénes van** en la columna lateral, plegable (abierto mientras tiene doce o menos): el título grabado con la cuenta en cifras («8 personas · 1 sin nombre»), una lista de renglones con el nombre en 600 y su invitación y mesa en tinta tenue, y «Descargar la lista» (botón secundario chico).

### Preguntas opcionales de la respuesta
Solo a quien marca que va: «¿Tienes alguna alergia o restricción con la comida?» y «Una canción que no puede faltar en la fiesta», cada una en un renglón en itálica, como el mensaje, que se oscurece al escribir. Respondida, la tarjeta las repite bajo el resumen («COMIDA», «CANCIÓN» en grabada tenue, la respuesta en itálica).

### Tarjeta de mesa
La pieza que espera al invitado confirmado cuando los novios publican las mesas, como la tarjeta de mesa de una recepción. Tarjeta de algodón a 420px debajo de la respuesta, girada -1.3°, centrada: «Para» en itálica, el nombre del invitado a mano, «MESA» en voz grabada a 0.95rem con +0.32em y el número en cifras a 4.4rem; el nombre de la mesa en itálica si lo tiene. Debajo, el plano impreso en la tarjeta, recortado a lo que hay en el salón: muros y espacios en tinta clara (3 a 38 %), las mesas en algodón con su número en cifras tenues y la del invitado llena de tinta con el número en algodón, encerrada por un círculo a mano en tinta (una vuelta y un poco más, que se abre al cerrar) que se traza en 1.3s cuando la tarjeta llega. La tarjeta se reparte sobre la mesa verde (sube 64px y pasa de -7° a -1.3°) al entrar en pantalla; con movimiento reducido el círculo ya está trazado. Sin mesa asignada dice «Su mesa» y «por confirmar» en itálica tenue, con una nota. En la portada, bajo los cupos, «MESA 4» en voz grabada subrayada lleva a la tarjeta, y la respuesta confirmada suma «Ver su mesa: la 4».

### Sobre (signature)
Botón que ocupa el 100 % de la pantalla, en teléfono (vertical) y en computador (apaisado), en cartulina verde con fibra: número de sobre arriba a la izquierda, sello postal del ramo perforado arriba a la derecha, «Para» en itálica, el nombre caligrafiado con una rúbrica que se traza, y los cupos en voz grabada. Sus piezas se miden con el lado corto de la pantalla (sello postal de 76 a 150px, sello de cierre de 64 a 128px, nombre hasta 5.8rem) y la dirección se corre al 36 % en pantallas apaisadas. Al tocarlo se voltea, la solapa se levanta con bisagra y deja ver el forro estampado de rosas y lirios con la tarjeta de algodón esperando dentro; tras una pausa breve el sobre se desvanece (0.6s) y la tarjeta aparece con un fundido (0.9s) mientras el ramo florece. Si el invitado ya respondió, el sobre trae su matasellos.

### Tarjeta a pantalla completa (signature)
La invitación ocupa el 100 % de la pantalla, con doble filete (1px a 14px del borde y otro a 6px más adentro; 22px en escritorio). Arriba (a la izquierda en escritorio) va la foto de los novios impresa en un arco de medio punto 4:5 con su filete a 5px (7px en escritorio), con el encuadre elegido en el panel; sin foto, el arco deja ver el forro del sobre. El ramo descansa sobre la esquina de abajo a la izquierda del arco con una sombra de contacto: el centro de las flores cae sobre esa esquina, tapa solo esa parte de la foto, y los tallos salen hacia el borde de la tarjeta (74° en teléfono, casi tendido, para no tocar los nombres; 42° en escritorio). El arco se corre a la derecha para que foto y ramo queden centrados juntos. Al pie, «Desliza para ver los detalles» en itálica con una flecha que se traza. Con el scroll, la sección mide 190svh y la tarjeta queda fija mientras `--p` va de 0 a 1: la tarjeta baja a 82 % (83 % en escritorio) con -1.4° de giro, y el ramo sube un poco más que ella, de modo que se asoma sobre el verde. Es papel que se asienta en la mesa.

### Destellos (signature)
El fondo de toda la invitación, detrás del sobre y de cada pieza (pedido de Mario, 2026-10-22: «destellos dorados, como cuento de hadas»): un lienzo fijo (`assets/destellos.js`) sobre la cartulina, con un halo dorado arriba y en las esquinas y las orillas en sombra. Tres capas: luces doradas desenfocadas que flotan despacio (7 a 16), destellos de cuatro puntas con los lados curvos y una cruz diagonal más corta que titilan cada 2 a 7s y crecen al brillar (54 a 150), y polvo de oro que sube con un vaivén (64 a 210). La cantidad va con el área de la pantalla y el cielo sale de una semilla fija: es el mismo en cada visita. Al bajar, el cielo se corre un poco (6 % del scroll, más los destellos cercanos). Sobre suelo oscuro el oro se suma como luz; sobre los pastel se pinta en oro viejo con halo claro. Con movimiento reducido queda pintado y quieto.

### Mariposa (signature)
Pedido de Mario (2026-10-23): una mariposa dorada que anima al bajar. Es papel troquelado en oro (`assets/mariposa.js` y `mariposa.css`), de 50 a 78px de envergadura: dos alas con cola, cada una una bisagra sobre el cuerpo (`rotateY` con perspectiva), rellenas de un degradado de oro (oro hondo, `destello`, `destello-luz`) con la orilla en oro hondo y puntos de troquel, nervaduras grabadas y un filete claro; el oro brilla según el ángulo del ala. Llega volando 2.6s después de abrir el sobre (cuando el ramo termina de florecer) y se posa sobre las flores. Al bajar más de 90px despega y acompaña la lectura por una ruta que va y viene por la pantalla, inclinándose hacia donde va y aleteando más rápido cuanto más rápido se baja; medio segundo después de parar, se posa en la esquina de arriba de la pieza más cercana (tarjeta, foto, papel vegetal, sello del remite), o en el borde de un costado si la pieza es más alta que la pantalla, siempre pegada al borde para no tapar lo escrito; posada, abre y cierra las alas despacio. Su sombra es la de una pieza de papel: pegada al posarse, más lejos y difusa al volar. Se mueve con un resorte de amortiguación crítica: llega sin rebotar. Sobre los pastel el oro es oro viejo. Se apaga desde el panel (Estilo → «Mariposa dorada»; `<html data-mariposa="no">`). Con movimiento reducido no vuela: queda quieta sobre el ramo y se va con él.

### Cuándo y dónde
El pliego «Los detalles»: tres tarjetitas de algodón (capítulos: «El día», «La ceremonia», «El lugar») repartidas sobre la mesa después de la portada: apiladas a 360px en teléfono; desde 640px a 420px y sueltas en la columna (la segunda corrida a la derecha, la tercera un 6 % a la izquierda), giradas -1.4°, 1.2° y -0.8°; desde 960px sin foto al lado, en fila, con la del medio 56px más abajo y la última 18px. El título del capítulo va en voz Title (1.5rem, 1.7rem en escritorio apaisado), el dato debajo (fecha grabada, hora en cifras a 2.3rem y 2.8rem en escritorio apaisado, lugar en Castoro) y la nota en itálica. «El lugar» lleva «Ver cómo llegar». Hasta el 2026-10-22 iban sobre un video del camino al altar controlado por el scroll; Mario pidió quitarlo.

### Cómo llegar
Tarjeta de algodón a 920px con un bloque por lugar (o uno solo si ceremonia y recepción comparten sitio). El momento («Ceremonia», «Recepción») va en voz Title, la hora en cifras a 1.5rem, el nombre en Castoro a 1.35rem y la dirección en tinta suave. Cuando hay pin, el mapa de Google se monta como foto: marco de algodón de 8px, esquineros de 22px, -0.6° a 0.7° de giro y saturación al 45 %. Sin pin no hay mapa, porque la búsqueda por texto puede caer en otro lugar. Los botones de apps (Google Maps con la ruta, Waze, Apple Maps) tienen 54px de alto, borde de línea, fondo blanco al 55 %, ícono en verde forro y flecha de salida tenue: una columna en teléfono y tres desde 640px. Debajo, «Copiar dirección» y «Agregar al calendario» como enlaces de acción.

### Itinerario
Tarjeta de algodón a 620px. Un hilo vertical de 1px en línea recorre los momentos y otro en tinta suave se traza encima con el scroll (`--hilo`, escala desde arriba) hasta el 62 % de la pantalla. Cada punto de 13px pasa de anillo a relleno de tinta cuando el hilo lo alcanza; el texto nunca se atenúa. La hora va en cifras (1.3rem, a la derecha del hilo desde 640px), el momento en grabada a 1.15rem y el detalle en itálica. Vacío, se arma con la ceremonia y la recepción.

### Código de vestimenta
Hoja propia de papel vegetal a 640px, rotada -0.9°, junto a la de regalos y dudas (rotada 0.6°): en teléfono una debajo de la otra con 32px entre ellas, desde 960px lado a lado (640 y 440px, la de regalos 56px más abajo, con «Dudas» bajo una línea). Ya no se montan (pedido de Mario, 2026-10-23: respetar los espacios). El código va en grabada grande, clamp(2rem, 9vw, 3.1rem), y la nota en itálica. Debajo, hasta cuatro fotos de referencia como copias pequeñas de algodón (210px; 300px las apaisadas) con esquineros de 24px, giradas -1.4° y 1.6° alternadas, y su nombre en itálica al pie («Ellas», «Ellos»).

### Fotos y visor
Las fotos de la pareja ya no van todas juntas: se reparten por los pliegos (ver Pliegos). Las que sobran (hasta tres) van sueltas en su propio pliego antes del forro, a 1040px: dos en pareja con la segunda 48px más abajo (72px desde 960px), la tercera centrada debajo en teléfono y en fila desde 640px; una sola, centrada a 480px (640 si es apaisada). Toda foto de la mesa y de la vestimenta se toca para verla en grande: un visor de algodón ajustado a la foto, sobre un velo del tono hondo de la paleta, con su nombre al pie y «Cerrar».

### Matasellos (signature)
Doble círculo en tinta de sello con textura de desplazamiento, texto en arco («RESPONDIDO» y «DIEGO · ERIKA»), fecha en cifras y cuatro ondas. Se estampa con un golpe de 0.55s (escala 1.5 a 1, rotación a -11°) y se queda. En el panel aparece reducido junto a cada respuesta reciente.

### Contador del panel (signature)
Celdas blancas separadas por filetes de 1px; etiqueta en Hanken 600 a 0.82rem y cifra en Castoro a 2.1rem con casillero fijo de tres dígitos, donde los ceros a la izquierda se apagan en algodón sombra. Cupos confirmados en polen hondo.

### Ramo
SVG procedural de rosas y lirios blancos que florece al abrir: tallos que crecen, hojas que se despliegan, rosas que abren en espiral, lirios que despliegan seis tépalos y estambres, cinta; después un vaivén de 7s. Con movimiento reducido todo llega a su estado final al instante.

### Motion
Tres curvas de papel en `base.css`: `--sal-papel` (salida con fricción) para deslizar y estampar, `--sal-suave` para trazos y hover, `--entra-papel` para recoger. Duraciones de 0.3 a 1.5s en la invitación y de 0.15 a 0.3s en el panel.

Las escenas con scroll (tarjeta que se asienta, hilo del itinerario) las mueve un solo `requestAnimationFrame` por scroll que escribe propiedades personalizadas y transforms. Solo se activan con la clase `scroll-vivo`: sin ella, todo queda quieto y visible. La tarjeta de respuesta se reparte (sube 70px y gira de 6° a 0.7°) cuando entra en pantalla. Los destellos tienen su propio `requestAnimationFrame` continuo, que solo estampa sprites dibujados una vez.

**La regla del papel que se mueve.** Todo se mueve como papel: bisagra, volteo, deslizamiento con fricción, estampado. Nunca rebote ni elástico. Solo los destellos del fondo se mueven como luz: titilan y flotan. La mariposa es papel que vuela: sus alas son bisagras y llega sin pasarse. Con `prefers-reduced-motion` las animaciones se reducen a 1ms, no hay escenas fijas y los destellos quedan quietos.

## Do's and Don'ts

### Do:
- **Do** apoyar toda pantalla de la invitación sobre la cartulina verde (`verde`) con fibra, grano y sus destellos dorados; el papel claro solo como pieza.
- **Do** envolver toda cifra en la voz de cifras (Castoro, `lining-nums`), también dentro de textos grabados y matasellos.
- **Do** reservar el polen para responder, el foco y el estado confirmado.
- **Do** marcar el estado persistente con el matasellos o su sello de estado, nunca con un globo o un color de fondo.
- **Do** repetir el número de sobre de tres cifras (N.º 027) en sobre, tarjeta, respuesta y fila del panel.
- **Do** mostrar lo no confirmado en itálica tenue («Fecha por confirmar»), nunca como hueco o dato inventado.
- **Do** mantener los objetivos táctiles de la invitación en 44px o más (58px el botón de respuesta, 60px las opciones, 54px los botones de mapas).
- **Do** dejar la respuesta al final del recorrido, después de cómo llegar, el itinerario y la vestimenta.
- **Do** mostrar un mapa solo cuando el lugar tiene pin; sin pin, el nombre, la dirección y los botones de apps.

### Don't:
- **Don't** componer números en Castoro Titling.
- **Don't** usar Rouge Script para títulos, botones o párrafos.
- **Don't** usar el polen como acento decorativo, para avisos o para estados distintos de confirmado.
- **Don't** recurrir al sobre marfil con lacre, nombres dorados en script, acuarela o una cuenta regresiva como protagonista (el bloque Cuenta regresiva es opcional y va entre las partes, nunca en la portada).
- **Don't** animar con rebotes ni curvas elásticas.
- **Don't** pintar con el oro de los destellos un texto, un botón o un estado, ni poner destellos encima de las piezas de papel. La mariposa sí se posa en ellas: es una pieza de papel dorado, no un destello.
- **Don't** montar una pieza sobre otra ni juntar todas las fotos en un solo lugar: cada pliego tiene su aire y su foto.
- **Don't** poner sombras a elementos que no sean piezas de papel.
