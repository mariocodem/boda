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
  seccion: "88px"
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

La invitación es un sobre que va y vuelve. Todo el sistema es papelería formal: una cartulina verde hoja que es el suelo de cada pantalla, tarjetas de algodón blanco impresas con tinta verde negra, títulos en romanas grabadas, el nombre del invitado escrito a mano, un sello postal del ramo, un número de sobre y un matasellos que se queda cuando el invitado responde. Nada flota sobre un fondo neutro de sitio web: cada superficie es una pieza de papel con su grosor, su filete y su sombra de mesa.

La densidad es baja y ceremonial en la invitación (una pieza a la vez, columnas estrechas, mucho verde alrededor) y tranquila y exacta en el panel, que hereda el mundo en voz baja: suelo salvia claro, barra de cartulina verde, cifras en casilleros fijos y estados estampados como matasellos. El movimiento es de papel: bisagras, volteos y deslizamientos con fricción, nunca rebotes. El ramo de rosas y lirios blancos florece una vez y luego solo se mece.

Se rechaza el arreglo por defecto del género: sobre marfil con lacre, nombres dorados en script, acuarela y cuenta regresiva como protagonista.

**Key Characteristics:**
- Suelo de cartulina verde (`verde`) con fibra y grano en toda la invitación; nunca un fondo claro de página.
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

### Neutral
- **Algodón** (`algodon`): el papel de toda tarjeta, del papel vegetal y del diálogo del panel. **Algodón hondo** (`algodon-hondo`) para hovers y marcos de foto; **algodón sombra** (`algodon-sombra`) solo para los ceros a la izquierda de los contadores, que son relleno y no información.
- **Tinta** (`tinta`): texto sobre papel. **Tinta suave** (`tinta-suave`) para texto secundario, apellidos y descripciones; **tinta tenue** (`tinta-tenue`) para marcas de sobre, «por confirmar» y placeholders.
- **Línea** (`linea`): bordes de opciones y campos, renglones del mensaje, divisores entre momentos.
- **Mesa salvia** (`mesa-panel`): el suelo del panel. **Blanco** (`blanco`) para tablas, contadores, campos y casillas.

### Paletas elegibles
Desde el panel (La boda → Estilo) los novios eligen una de seis paletas; `assets/estilos.js` redefine con ella los tokens de esta sección (los nombres son los de la paleta verde: `verde` es «el suelo», `algodon` «el papel», `tinta` «la tinta»). **Verde hoja** es la original. Las cinco pastel (**Rosa empolvado**, **Lavanda**, **Azul cielo**, **Durazno**, **Salvia**) tienen suelo y sobre claros, así que lo que va escrito sobre la cartulina pasa a tinta oscura del mismo tono: `tinta-sobre` (nombre del sobre, rúbrica, firma), `salvia` y `salvia-clara` (secundarios, de 4.5:1 o más sobre el suelo). Cada paleta trae además su tinta y su algodón levemente teñidos, el velo del altar, el tono de las sombras (`--sombra`), el sello postal repintado y el forro repintado (fondo y líneas; las hojas siguen verdes). En las pastel el matasellos del sobre y el foco van en polen hondo para no perderse. El polen sigue siendo el mismo en todas: es el del lirio.

### Named Rules
**La regla del suelo verde.** La invitación entera, de la escena del sobre al remite, se apoya en la cartulina verde. El papel claro solo existe como pieza (tarjeta, vegetal, foto), nunca como fondo de página.

**La regla del polen.** El azafrán significa «responder» y «confirmado». Va en el botón de respuesta, en el foco, en el matasellos de confirmación y en sus reflejos del panel (sello, contador y tramo de confirmados). No se usa como decoración ni para otro estado.

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
Cuatro familias, cada una con sus cuatro voces (`--f-grabada`, `--f-texto`, `--f-mano`, `--f-cifras`) y dos escalas para igualar tamaños (`--escala-nombres`, `--escala-mano`): **Grabada** (Castoro Titling, Castoro, Rouge Script; la original), **Romana** (Cinzel, Crimson Pro, Great Vibes), **Romántica** (Playfair Display, Lora, Parisienne) y **Fina** (Bodoni Moda, Spectral, Allura). La voz grabada siempre va en caja alta (`text-transform: uppercase`), porque las otras romanas sí tienen minúsculas. Las fuentes se cargan solo cuando la familia está elegida.

**La regla de las cifras.** Ningún número se compone en Castoro Titling: su «1» se lee como «I». Toda cifra va envuelta en la voz `--f-cifras` (Castoro, `lining-nums`), también dentro de etiquetas grabadas, matasellos y sellos de estado.

**La regla de la mano.** Rouge Script escribe solo lo que se escribiría a mano en un sobre real: el nombre del destinatario, el «&» y la firma. Nunca un título, un botón ni un párrafo.

**La regla del control.** Hanken Grotesk aparece donde hay que operar (enlaces de acción, errores, notas técnicas, el panel). En la invitación nunca compone contenido ceremonial.

## Layout

Teléfono primero. La invitación es un recorrido vertical de escenas. El sobre y luego la tarjeta ocupan el 100 % de la pantalla; la tarjeta se asienta sobre la mesa. Le sigue el camino al altar (video a pantalla completa, fijo mientras dura su recorrido). Después vienen piezas de papel de ancho acotado en una columna centrada: Cómo llegar a 920px, el itinerario a 620px, el papel vegetal de la vestimenta a 640px sobre el de regalos a 920px y la respuesta a 520px, al final. Las fotos van en una mesa de 6 columnas hasta 1040px. Entre secciones hay de 96 a 120px de verde. La respuesta ya no asoma al principio: es lo último antes del remite.

Cortes en 640px (padding generoso, botones de mapas en tres columnas, hora del itinerario a la izquierda del hilo, fotos a 12 columnas) y 960px (mapa y datos de cada lugar lado a lado, alternando). Con `min-width: 960px` y proporción de al menos 5:4, la tarjeta pasa a apaisada: la foto en arco con el ramo a la izquierda (44 %), el texto a la derecha, el doble filete a 22px y las tarjetitas del altar abajo a la izquierda. Con `max-height: 740px` la portada aprieta el interlineado y la pista queda solo en flecha.

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
**La regla del papel sobre la mesa.** Una sombra solo existe si hay una pieza de papel que la proyecta. Nada de resplandores ni sombras de color.

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
La invitación no tiene navegación: se recorre como un objeto, de arriba abajo. El panel tiene una barra fija de cartulina verde con el sello monograma, el título grabado «Libro de sobres», la firma caligráfica en salvia, dos pestañas («Invitados» y «La boda», la activa en algodón con un subrayado de 2px; bajo 760px pasan a una fila propia), un chip de modo y botones de barra.

### La boda (panel)
Formulario en hojas blancas con borde de línea y radio de 8px: Estilo, Foto principal, Fecha, Ceremonia, Recepción, Itinerario, Fotos de la pareja, Vestimenta y regalos. **Estilo:** tarjetas de opción con radio oculto (borde verde y sello de palomita al elegir): las paletas muestran su suelo, su sobre y una tarjetita con las iniciales; las letras, los nombres y una línea de texto en esa familia; al lado, fija en escritorio, una vista previa del sobre y la tarjeta en pequeño con la foto principal. **Fotos:** zonas de subida con borde discontinuo (tocar o arrastrar), miniaturas cuadradas con mover antes, mover después y quitar, sello «Sin guardar» en polen hondo hasta guardar; la foto principal se encuadra tocándola (o con dos controles) junto a una vista del arco con el ramo, en las proporciones del teléfono. Cada lugar lleva sus campos a la izquierda y un mapa de 4:3 a la derecha. Con clave de Google Maps hay buscador con autocompletado, mapa y pin que se arrastra. Sin clave, la vista previa se busca por nombre y dirección, con la nota «revisa que el mapa muestre el lugar correcto», y el pin se fija pegando el enlace de «Compartir». El itinerario es una lista de filas (hora, momento, detalle) con botones para subir, bajar y quitar. Una barra de guardar fija abajo, en mesa salvia translúcida, muestra el estado en polen hondo cuando hay cambios sin guardar.

### Sobre (signature)
Botón que ocupa el 100 % de la pantalla, en teléfono (vertical) y en computador (apaisado), en cartulina verde con fibra: número de sobre arriba a la izquierda, sello postal del ramo perforado arriba a la derecha, «Para» en itálica, el nombre caligrafiado con una rúbrica que se traza, y los cupos en voz grabada. Sus piezas se miden con el lado corto de la pantalla (sello postal de 76 a 150px, sello de cierre de 64 a 128px, nombre hasta 5.8rem) y la dirección se corre al 36 % en pantallas apaisadas. Al tocarlo se voltea, la solapa se levanta con bisagra y deja ver el forro estampado de rosas y lirios con la tarjeta de algodón esperando dentro; tras una pausa breve el sobre se desvanece (0.6s) y la tarjeta aparece con un fundido (0.9s) mientras el ramo florece. Si el invitado ya respondió, el sobre trae su matasellos.

### Tarjeta a pantalla completa (signature)
La invitación ocupa el 100 % de la pantalla, con doble filete (1px a 14px del borde y otro a 6px más adentro; 22px en escritorio). Arriba (a la izquierda en escritorio) va la foto de los novios impresa en un arco de medio punto 4:5 con su filete a 5px (7px en escritorio), con el encuadre elegido en el panel; sin foto, el arco deja ver el forro del sobre. El ramo descansa sobre la esquina de abajo a la izquierda del arco con una sombra de contacto: el centro de las flores cae sobre esa esquina, tapa solo esa parte de la foto, y los tallos salen hacia el borde de la tarjeta (74° en teléfono, casi tendido, para no tocar los nombres; 42° en escritorio). El arco se corre a la derecha para que foto y ramo queden centrados juntos. Al pie, «Desliza para ver los detalles» en itálica con una flecha que se traza. Con el scroll, la sección mide 190svh y la tarjeta queda fija mientras `--p` va de 0 a 1: la tarjeta baja a 82 % (83 % en escritorio) con -1.4° de giro, y el ramo sube un poco más que ella, de modo que se asoma sobre el verde. Es papel que se asienta en la mesa.

### Camino al altar (signature)
Un video de una iglesia decorada con flores blancas (horizontal para pantallas anchas, vertical recortado al pasillo para teléfonos) se adelanta y se devuelve cuadro a cuadro con el scroll, a lo largo de 460svh. Lleva un velo de salvia en multiply, el grano de la cartulina y un degradado verde hondo arriba y abajo. Tres tarjetitas de algodón (capítulos: «El día», «La ceremonia», «El lugar») se relevan: cada una entra subiendo 64px y girando 5°, y sale hacia arriba. La última se queda. El título del capítulo va en voz Title (1.5rem, 1.7rem en escritorio), el dato debajo (fecha grabada, hora en cifras a 2.3rem, lugar en Castoro), y la nota en itálica. En teléfono van arriba, sobre el techo, para dejar ver el altar; en escritorio, abajo a la izquierda. El video se carga entero en memoria para poder ir a cualquier cuadro con cualquier servidor. Con movimiento reducido, el altar queda quieto en su último cuadro y las tres tarjetitas apiladas.

### Cómo llegar
Tarjeta de algodón a 920px con un bloque por lugar (o uno solo si ceremonia y recepción comparten sitio). El momento («Ceremonia», «Recepción») va en voz Title, la hora en cifras a 1.5rem, el nombre en Castoro a 1.35rem y la dirección en tinta suave. Cuando hay pin, el mapa de Google se monta como foto: marco de algodón de 8px, esquineros de 22px, -0.6° a 0.7° de giro y saturación al 45 %. Sin pin no hay mapa, porque la búsqueda por texto puede caer en otro lugar. Los botones de apps (Google Maps con la ruta, Waze, Apple Maps) tienen 54px de alto, borde de línea, fondo blanco al 55 %, ícono en verde forro y flecha de salida tenue: una columna en teléfono y tres desde 640px. Debajo, «Copiar dirección» y «Agregar al calendario» como enlaces de acción.

### Itinerario
Tarjeta de algodón a 620px. Un hilo vertical de 1px en línea recorre los momentos y otro en tinta suave se traza encima con el scroll (`--hilo`, escala desde arriba) hasta el 62 % de la pantalla. Cada punto de 13px pasa de anillo a relleno de tinta cuando el hilo lo alcanza; el texto nunca se atenúa. La hora va en cifras (1.3rem, a la derecha del hilo desde 640px), el momento en grabada a 1.15rem y el detalle en itálica. Vacío, se arma con la ceremonia y la recepción.

### Código de vestimenta
Hoja propia de papel vegetal a 640px, rotada -0.9°, que se monta sobre la de regalos y dudas (rotada 0.6°). El código va en grabada grande, clamp(2rem, 9vw, 3.1rem), y la nota en itálica. Debajo, hasta cuatro fotos de referencia como copias pequeñas de algodón (210px; 300px las apaisadas) con esquineros de 24px, giradas -1.4° y 1.6° alternadas, y su nombre en itálica al pie («Ellas», «Ellos»).

### Fotos y visor
La mesa de fotos lleva hasta seis copias en tandas de tres (columnas 6/6/4 en teléfono, 6/6/6 desde 640px y 4/5/3 desde 960px, con sus desfases), de la cuarta en adelante giradas al revés; con una sola foto va centrada y con dos, en pareja. Toda foto de la mesa y de la vestimenta se toca para verla en grande: un visor de algodón ajustado a la foto, sobre un velo del tono hondo de la paleta, con su nombre al pie y «Cerrar».

### Matasellos (signature)
Doble círculo en tinta de sello con textura de desplazamiento, texto en arco («RESPONDIDO» y «DIEGO · ERIKA»), fecha en cifras y cuatro ondas. Se estampa con un golpe de 0.55s (escala 1.5 a 1, rotación a -11°) y se queda. En el panel aparece reducido junto a cada respuesta reciente.

### Contador del panel (signature)
Celdas blancas separadas por filetes de 1px; etiqueta en Hanken 600 a 0.82rem y cifra en Castoro a 2.1rem con casillero fijo de tres dígitos, donde los ceros a la izquierda se apagan en algodón sombra. Cupos confirmados en polen hondo.

### Ramo
SVG procedural de rosas y lirios blancos que florece al abrir: tallos que crecen, hojas que se despliegan, rosas que abren en espiral, lirios que despliegan seis tépalos y estambres, cinta; después un vaivén de 7s. Con movimiento reducido todo llega a su estado final al instante.

### Motion
Tres curvas de papel en `base.css`: `--sal-papel` (salida con fricción) para deslizar y estampar, `--sal-suave` para trazos y hover, `--entra-papel` para recoger. Duraciones de 0.3 a 1.5s en la invitación y de 0.15 a 0.3s en el panel.

Las escenas con scroll (tarjeta que se asienta, video del altar, hilo del itinerario) las mueve un solo `requestAnimationFrame` por scroll que escribe propiedades personalizadas y transforms. Solo se activan con la clase `scroll-vivo`: sin ella, todo queda quieto y visible. La tarjeta de respuesta se reparte (sube 70px y gira de 6° a 0.7°) cuando entra en pantalla.

**La regla del papel que se mueve.** Todo se mueve como papel: bisagra, volteo, deslizamiento con fricción, estampado. Nunca rebote ni elástico. Con `prefers-reduced-motion` las animaciones se reducen a 1ms y no hay escenas fijas ni video en movimiento.

## Do's and Don'ts

### Do:
- **Do** apoyar toda pantalla de la invitación sobre la cartulina verde (`verde`) con fibra y grano; el papel claro solo como pieza.
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
- **Don't** recurrir al sobre marfil con lacre, nombres dorados en script, acuarela o una cuenta regresiva como protagonista.
- **Don't** animar con rebotes ni curvas elásticas.
- **Don't** poner sombras a elementos que no sean piezas de papel.
