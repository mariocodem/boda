# Invitación de boda · Diego & Erika

Sitio estático (HTML, CSS y JavaScript, sin paso de build) con dos páginas:

- `index.html`: la invitación. Cada invitado la abre desde su enlace personal (`index.html?i=CÓDIGO`): ve su nombre escrito en el sobre, lo abre y la tarjeta llena la pantalla. Al bajar, la tarjeta se asienta sobre la mesa y empiezan los **bloques** de la página, en el orden que se arma en el panel (pestaña **Diseño**). Todo va sobre un fondo de destellos dorados que titilan. De entrada van el **álbum** (las tres primeras fotos de la pareja, una grande y dos más chicas), los detalles (el día, la hora y el lugar), **el gran día** (el calendario del mes con el día encerrado), cómo llegar (mapa y botones para Google Maps, Waze y Apple Maps), dónde quedarse, el itinerario, nuestra historia, las fotos que sobran, el código de vestimenta, los regalos (con la cuenta para transferencias y las listas de tiendas), las dudas, las preguntas frecuentes y, al final, la tarjeta de respuesta; a eso se le suman los bloques que se agreguen (textos, fotos, galerías, citas, botones, separadores con flores, cuenta regresiva y videos). Quien ya confirmó ve además su **tarjeta de mesa**, con el plano del salón y su mesa encerrada (cuando los novios publican las mesas).
- `admin.html`: el **libro de sobres**, el panel para administrar invitados, repartir enlaces y seguir las respuestas. En la pestaña **Mesas** se arma el plano del salón y se sienta a cada familia. **Tareas**, **Presupuesto** y **Proveedores** son el organizador de la boda: la lista de tareas con sus fechas (que puede pasar a Google Calendar), los gastos y pagos, y a quién se cotizó o contrató. En la pestaña **La boda** se editan las fotos, la fecha, los lugares (con Google Maps), el alojamiento, el itinerario, la historia, la vestimenta (con fotos de referencia), los regalos, las preguntas frecuentes y las preguntas opcionales de la respuesta. En **Diseño** se arma la página como en WordPress: el tema, los colores, las letras, el fondo, el orden de los bloques y sus textos, con la invitación en vivo al lado.

## Probar en tu computador

```sh
python3 servir.py
```

Es como `python3 -m http.server 8000`, pero le pide al navegador que siempre revise si un archivo cambió. Con el servidor de siempre, el navegador puede quedarse con un JavaScript viejo y las funciones nuevas parecen no funcionar. Por lo mismo, `index.html` y `admin.html` piden cada archivo con su versión (`?v=20261107`): al publicar cambios, sube ese número en los dos HTML.

Abre `http://localhost:8000/admin.html`, entra con la clave local (`diegoyerika`, en `assets/config.js`) o con Google si ya pusiste su ID de cliente (ver «Entrar con Google y Google Calendar»), y pulsa «Cargar ejemplos para probar». Desde cada fila puedes abrir la invitación de ese invitado.

Sin Supabase todo funciona en **modo local**: los datos viven solo en ese navegador. Sirve para probar, no para recibir respuestas reales.

## Datos de la boda

Se editan desde el panel, pestaña **La boda**: foto principal, día y hora, ciudad, fecha límite para responder, ceremonia y recepción (nombre, dirección y ubicación en el mapa), alojamiento, itinerario, nuestra historia, fotos de la pareja, código de vestimenta (con fotos de referencia), regalos, preguntas frecuentes y la tarjeta de respuesta. Lo que se deje vacío aparece en la invitación como «por confirmar»; el alojamiento, la historia y las preguntas frecuentes, si están vacíos, no aparecen.

- **Alojamiento:** hoteles cerca, con dirección, enlace y una nota (por ejemplo, la tarifa especial). En la invitación cada uno lleva «Ver el hotel» y «Cómo llegar».
- **Nuestra historia:** texto libre; una línea en blanco separa los párrafos.
- **Regalos:** el mensaje, una cuenta para transferencias (banco o app, tipo, número, a nombre de quién; con el botón «Copiar el número») y hasta cuatro enlaces a listas de regalos de tiendas. La cuenta la ve cualquiera que abra la invitación, como en una tarjeta impresa.
- **Preguntas frecuentes:** hasta doce, con su respuesta; se abren tocándolas. «Empezar con preguntas comunes» trae solo las preguntas: las respuestas las escriben ustedes.
- **Tarjeta de respuesta:** dos preguntas opcionales para quien confirma: alergias o restricciones con la comida y una canción para la fiesta. Lo que contesten aparece en la pestaña Invitados («Lo que pidieron», para pasárselo al banquete y a la música), en el diálogo de cada invitado y en «Exportar CSV».
- **Quiénes van:** cuando una invitación de más de un cupo confirma, la tarjeta pide el nombre de cada persona que va, un renglón por cada una (crecen y se achican con «¿Cuántos irán?»); no se puede enviar con un renglón vacío. Con un solo cupo no lo pregunta: va la persona del sobre. La tarjeta respondida lo repite («Van: Ana, Luis y Marta»). En el panel, pestaña Invitados: los nombres van debajo de cada invitación en la tabla (con «falta 1 nombre» si confirmaron más de los que nombraron) y en «Respuestas recientes»; el bloque **Quiénes van** junta a todas las personas por nombre, con su invitación y su mesa, y «Descargar la lista» baja un CSV con una fila por persona (para la entrada, el banquete o el plano de mesas). Si alguien respondió por otro medio, los nombres se escriben en «Editar» (uno por renglón). «Exportar CSV» trae la columna «Quiénes van».

- **Modo local:** se guarda en ese navegador (sirve para probar).
- **Con Supabase:** se guarda en la tabla `evento` y todos los invitados lo ven al instante.

`assets/config.js` tiene los valores de arranque (lo guardado en el panel los reemplaza), además del WhatsApp de contacto y las claves.

### Ubicación con Google Maps

Sin configurar nada, el panel muestra una vista previa del mapa con el nombre y la dirección del lugar. Para fijar el punto exacto, pega en «Enlace de Google Maps» el enlace de **Compartir** de Google Maps: si trae coordenadas (los enlaces largos `google.com/maps/...@4.60,-74.07`), se toma el pin de ahí; si es corto (`maps.app.goo.gl`), Google Maps lo abre tal cual y Waze y Apple Maps usan el nombre y la dirección.

Para **buscar el lugar con autocompletado y mover el pin en el mapa**, agrega una clave de Google Maps:

1. En [Google Cloud Console](https://console.cloud.google.com/) crea un proyecto y activa **Maps JavaScript API** y **Places API (New)** (piden una cuenta de facturación; el uso de un panel así cabe de sobra en el cupo gratuito mensual).
2. En **APIs y servicios → Credenciales** crea una **clave de API** y restríngela: *Restricciones de aplicaciones → Sitios web* con la dirección de tu sitio (por ejemplo `https://tu-usuario.github.io/*` y `http://localhost:8000/*`) y *Restricciones de API* a esas dos APIs.
3. Pega la clave en `googleMaps.apiKey` de `assets/config.js`. (Opcional: un *Map ID* propio en `googleMaps.mapId`; sin él se usa el de demostración de Google).

La clave del navegador es visible por diseño; su protección es la restricción por dirección del paso 2.

En la invitación, cada lugar trae un mapa y tres botones: **Google Maps** (abre la ruta), **Waze** y **Apple Maps**, además de «Copiar dirección» y «Agregar al calendario».

## Diseño: la invitación como en WordPress

En la pestaña **Diseño** del panel se arma la página. A la izquierda va el editor; a la derecha, la invitación de verdad, en vivo, como la ve un invitado en el teléfono o en el computador, para una persona o para una familia («Ver el sobre» la muestra cerrada, con su animación). Tocar cualquier parte de la vista previa la abre en el editor. En el teléfono se pasa de «Editar» a «Vista previa» con los dos botones de arriba.

**Bloques.** La página es una lista de bloques entre la portada (siempre primero: es la tarjeta que se asienta al bajar) y el cierre (siempre al final):

- **Ordenar:** arrastra un bloque por su asa (con el ratón o con el dedo), o usa sus flechas.
- **Ocultar:** el ojo lo apaga sin borrarlo. La respuesta no se puede ocultar.
- **Editar:** al tocarlo se cambian sus textos: el título y lo que tenga (en Los detalles, el nombre de cada tarjetita y el enlace; en la historia, la firma; en la portada, la frase de la invitación y la invitación a bajar; en el cierre, la despedida y la firma). Un campo vacío usa el texto de siempre, que se ve en gris. Los textos que cambian si la invitación es para varias personas tienen dos campos: «para una persona» y «para una familia». Los datos de cada sección (fechas, hoteles, preguntas…) se siguen llenando en **La boda**, y el bloque lleva un enlace hasta allá; si una sección no tiene datos, la lista avisa que no se ve.
- **Agregar:** «Agregar bloque» trae los bloques libres: **Texto** (en una tarjeta o sobre el fondo, centrado o a la izquierda), **Foto** (mediana o a todo el ancho, con pie), **Galería** (hasta 12 fotos), **Cita** (con su autor), **Botón** (un enlace a un álbum, una transmisión, un formulario), **Separador** (una lámina de rosas o lirios, o una línea fina), **Cuenta regresiva** (días, horas, minutos y segundos hasta la ceremonia) y **Video** (de YouTube o Vimeo). Van debajo del bloque abierto, o al final. Los libres se **duplican** y se **quitan** (con «Deshacer»). Un bloque libre vacío no lo ven los invitados.

**Tema.**

- **Diseño:** **Victoriano** (el de siempre desde el 2026-11-05: terciopelo vino con un damasco de rosas y lirios, papel marfil con doble filete dorado de esquinas cortadas, títulos en caligrafía inglesa con una floritura de 1870 debajo, sellos de lacre dorado y el álbum de fotos con ventanas ovaladas doradas), **Pliegos** (tarjetas de algodón sobre la cartulina del sobre, con títulos grabados) o **Editorial** (página crema con titulares enormes, el texto directo sobre la página, fotos rectas y láminas de Redouté que se asoman por los bordes; el único papel es la tarjeta: la de portada, la de respuesta y la de mesa). Al elegir un tema se proponen sus colores y su letra; «Conservar los míos» los deja como estaban.
- **Colores:** Vino, Verde hoja, Rosa empolvado, Lavanda, Azul cielo, Durazno, Salvia, Terracota o **Color libre**: «Elegir cualquier color» abre la paleta completa del sistema, y también se puede escribir el código (por ejemplo `#c9a3b5`). De ese color sale la paleta entera: el sobre, el forro, el sello, la tarjeta y la tinta. Con un color claro la invitación va en tinta oscura de ese tono; con uno oscuro, en letras claras. Los textos se oscurecen o aclaran solos hasta leerse bien.
- **Letras:** la de los títulos (Victoriana, Grabada, Romana, Romántica, Fina o Editorial) y, si se quiere otra, la del texto. Victoriana es Old Standard TT (la romana de los libros del siglo XIX) con la caligrafía Pinyon Script.
- **Fondo:** el del tema, un color, un degradado (de arriba abajo, en diagonal o desde el centro) o una foto quieta detrás de toda la invitación, con un velo del color del suelo para que los títulos se lean. Sobre un color propio, lo que va escrito en el fondo se oscurece o se aclara solo.
- **Trato:** «tú» o «usted» para quien la invitación es para una sola persona (a una familia siempre se le habla de «ustedes»). Cambia la portada, la tarjeta de respuesta, la de mesa y los avisos.
- **Mariposa dorada:** encendida o apagada.

**Borrador y publicar.** Todo se edita en un borrador que se guarda solo y que los invitados no ven. Arriba dice si hay cambios sin publicar; **Publicar** los pasa a la invitación y **Descartar cambios** vuelve a lo publicado (con «Deshacer»). Las fotos de los bloques y del fondo se suben al elegirlas; las que dejan de usarse se borran al publicar.

- **Modo local:** el borrador y lo publicado quedan en ese navegador.
- **Con Supabase:** el borrador va en la tabla `planeacion` (privada, como las tareas) y lo publicado en `evento`, junto con los datos de la boda. Si ya tenías el esquema, vuelve a ejecutar `supabase/esquema.sql` para que acepte el borrador.

## Tema Vino & Marfil (el de arranque)

Hecho el 2026-11-06 a partir de las referencias de `referencias-boda/` (ideas, no copias: ni marcas de agua ni textos de ellas; esa carpeta no conviene publicarla). Se elige en **Diseño → Tema** y es el que trae una página nueva; una página ya guardada conserva su tema hasta que elijas este.

- **Crepúsculo (2026-11-07):** como el video de referencia, toda la página va sobre el bosque oscuro con niebla (la foto de la intro, quieta detrás), con la letra en marfil; tarjetas de papel con filigrana vino, el itinerario y las polaroids sobre la noche vino y el cierre sobre damasco vino. Vale para las tres paletas del tema.
- **Intro:** el sobre vino, apaisado, flota sobre el bosque con niebla mostrando la solapa con el lacre dorado y «Abrir aquí» (y «Para…» con el nombre del invitado). Arriba «El día más importante de nuestra vida ha llegado» y «¡Nos casamos!», debajo los nombres; todo editable en Diseño → Portada. Al tocarlo, **el lacre se rompe**, se abre la solapa y **la tarjeta sale del sobre**. En este tema el sobre no se voltea (como en el video).
- **Portada:** después del sobre, la primera foto de la pareja a todo lo alto con «¡Nos casamos!», los nombres y la fecha, cortada abajo con papel rasgado. En este tema no van la tarjeta a pantalla completa ni las dos fotos chicas del álbum (las fotos están en las polaroids).
- **Bloques nuevos** (solo en este tema; en los otros no se pintan): **Invitación formal** (sale de su sobre vino al llegar, con el lacre arriba: «Junto a nuestras familias…», padres y verso opcionales), **Polaroids** (las fotos a color y en su proporción, grandes, que entran desde la izquierda; se tocan para verlas en grande), **Foto con frase** (con parallax suave) y **Comparte el momento** (hashtag con «Copiar», Instagram y playlist; sin ninguno no aparece).
- **El gran día:** la tira «SÁBADO | 20 | MARZO», el calendario con el día dentro de un corazón vino, «Faltan» con días, horas, minutos y segundos, y los botones «Agregar a Google Calendar» y «Descargar .ics».
- **Itinerario** sobre la noche vino, con un icono en cada momento que sale solo de su título (ceremonia → anillos, cóctel → copas, cena → cubiertos, fotos → cámara, fiesta → globo…); el hilo se sigue trazando al bajar.
- **Vestimenta** (en todos los temas): una lámina con el código entre filetes, una frase, **Ellos** y **Ellas** a los lados de dos figuras (traje y vestido), la **paleta de colores sugerida**, **ejemplos de atuendos** vestidos con esa paleta y los **colores a evitar** tachados, más un botón «Ver ideas». Los textos traen unos de siempre y se cambian en Diseño → Vestimenta; los colores se cambian con su selector (agregar, quitar, nombre, «Volver a los de siempre») y las figuras se visten solas con ellos.
- **Regalos:** los datos de la cuenta (Nequi, Daviplata o banco) quedan detrás de «Ver datos», salvo que en Diseño → Regalos elijas «A la vista».
- **Cierre:** la foto en un camafeo ovalado dorado, la frase final, «¡Gracias!», la firma y el pie con el monograma y la fecha.
- **Galería y fotos:** en el visor, las fotos de un mismo grupo se pasan con las flechas, con el teclado o deslizando.
- **Sin ramo ni destellos** (pedido de Mario, 2026-11-06, para que siga la referencia): en este tema no se arma el ramo de rosas y lirios ni se pinta el fondo de destellos dorados (tampoco gasta batería). Los otros temas los conservan. La mariposa sigue (se apaga en Diseño → Tema).
- **Paletas:** Vino & Marfil, Vino gótico bosque (todo oscuro) y Vino & Rosa polvo; con «Color libre» sale una propia. **Letras:** Cinzel y Cormorant (versales, Garamond y Pinyon Script para los nombres).

### Música

En **Diseño → Tema → Música** pulsa **Subir la canción (.mp3)** y elige el archivo (hasta 20 MB); allí mismo se puede oír, cambiar o quitar, y se ajustan el volumen y si suena. Los invitados la oyen cuando pulsas **Publicar**.

- **Modo local:** la canción queda en ese navegador (IndexedDB), solo para probar.
- **Con Supabase:** va al bucket público `musica` de Storage, que crea `supabase/esquema.sql`. Al cambiarla o quitarla y publicar, la anterior se borra.

Una ruta del sitio (`media/cancion.mp3`) o un enlace https que ya estuvieran puestos siguen sonando. Nunca suena sola: arranca con el toque que abre el sobre, entra subiendo despacio y el botón redondo de abajo a la derecha la pausa o la vuelve a poner. Si el invitado vuelve a la página con el sobre ya abierto, queda el botón en pausa. Usa una canción que tengan derecho a poner.

### Animaciones

**Diseño → Tema → Animaciones:** *Completas* (todo), *Suaves* (sin lo que se repite sin fin: niebla, vaivén del ramo) o *Ninguna* (todo quieto y legible, como con «reducir movimiento» en el teléfono, que siempre se respeta).

### Respaldo: exportar e importar

**Diseño → Tema → Respaldo:** «Exportar invitacion.json» descarga todo el contenido (datos de la boda, diseño publicado y borrador). «Importar» lo trae de vuelta: los datos de la boda se guardan al instante y el diseño queda en el borrador para revisarlo y publicarlo. «Restaurar el diseño de arranque» vuelve el borrador al diseño de siempre sin tocar los datos. Las fotos subidas en modo local no viajan en el archivo (con Supabase van por su enlace).

### Rendimiento (Lighthouse, teléfono)

Medido el 2026-11-07 sobre la invitación con el tema Vino & Marfil (ya con el fondo de crepúsculo), servida con compresión como en GitHub Pages: rendimiento 75–80 (varía entre corridas; antes del fondo de bosque daba 87–91), accesibilidad 100, buenas prácticas 100 y SEO 100; sin saltos de diseño (CLS 0). La foto del bosque se pide desde el `<head>` y lo de adentro del sobre no se dibuja hasta que se abre. Lo que más ayudó: mientras el sobre está cerrado la invitación no se calcula ni se dibuja (`content-visibility`), el tema de la última visita se aplica desde el `<head>` (el sobre no cambia de tamaño al cargar), los destellos y el ramo no se preparan en este tema y el QR se arma solo al acercarse. Con `python3 servir.py` da menos porque ese servidor no comprime.

### Asistente de configuración

El botón **Asistente** de la barra del panel abre diez pasos (pareja y fecha, tema, lugares, itinerario, vestimenta, fotos, música, regalos y respuesta, invitados, revisión) con lo que falta en cada uno y un botón que lleva a donde se completa. La primera vez que se entra al panel, si la boda no tiene fecha, se abre solo.

## Fondo de destellos

Detrás de toda la invitación titilan destellos dorados y sube un polvo de oro (`assets/destellos.js`). Sus colores siguen la paleta elegida en el panel: oro claro sobre Verde hoja y oro viejo sobre las pastel y Terracota (más suaves). Quien tenga activado «reducir movimiento» en su teléfono los ve quietos.

## Mariposa dorada

Una mariposa de papel dorado (`assets/mariposa.js` y `assets/mariposa.css`) llega volando cuando el ramo termina de florecer y se posa en él. Al bajar, despega y acompaña al invitado; cuando deja de bajar, se posa en la esquina de la tarjeta o de la foto más cercana. Su oro sigue la paleta. Se apaga desde el panel en **Diseño → Tema → Mariposa dorada** (o con `mariposa: false` en `assets/config.js`). Con «reducir movimiento» no vuela: se queda quieta sobre el ramo.

## Fotos

Se suben desde el panel, pestaña **La boda**:

- **Foto principal:** va en el arco de la portada de la tarjeta, con el ramo apoyado en su esquina de abajo a la izquierda. Mejor vertical, con las caras en la mitad de arriba. Toca la foto (o usa los dos controles de encuadre) para elegir qué parte queda a la vista; al lado se ve cómo queda en la tarjeta.
- **Fotos de la pareja:** hasta 6, repartidas por la invitación en el orden que elijas. Las tres primeras van en el **álbum**, justo después de la tarjeta: la primera grande en el centro y las otras dos más chicas a los lados (en el teléfono, debajo); conviene que en ellas la pareja esté al centro, que es lo que queda a la vista en una ventana ovalada. Las siguientes van una junto a cada parte que lleva foto (los detalles, el itinerario, la historia si la escriben y la respuesta), en el orden en que van esas partes en **Diseño**; las demás van juntas en el bloque «Fotos de la pareja». En el panel, debajo de cada foto dice dónde queda; para cambiarla de lugar, muévela. Los invitados las pueden tocar para verlas en grande.
- **Fotos de referencia de vestimenta:** hasta 4, en la hoja del código de vestimenta, cada una con un nombre corto opcional («Ellas», «Ellos»).

El panel reduce cada foto y la pasa a JPG antes de subirla; se suben al pulsar «Guardar cambios», y las que quites se borran al guardar.

- **Modo local:** las fotos quedan en ese navegador (IndexedDB), solo para probar.
- **Con Supabase:** van al bucket público `fotos` de Storage, que crea `supabase/esquema.sql`.

También se pueden poner rutas a archivos de la carpeta `fotos/` en `fotoPortada` y `fotos` de `assets/config.js`; lo que se suba desde el panel las reemplaza. Hoy están ahí las fotos de Diego y Erika (la del bosque a color en el arco de la tarjeta; el retrato, la del bosque en blanco y negro y la de las flores en el álbum; la del lago junto a los detalles). Si cambias esas fotos en `config.js`, cambia también `fotosArranque` (una fecha): así reemplazan una vez a la foto principal y a las de la pareja que ya estuvieran guardadas desde el panel. Desde que el panel guarda otra vez, vuelven a mandar las del panel.

## Mesas

En la pestaña **Mesas** del panel se dibuja el salón y se decide dónde se sienta cada familia:

- **Plano:** «Mesa redonda», «Mesa larga» y «Espacio» (la pista, la entrada, la música, el bar…) agregan piezas al plano. Se arrastran a su lugar. Al tocar una pieza queda elegida y aparece su tirador: en un espacio, en la esquina, le cambia el ancho y el alto; en una mesa (en el borde de la redonda, en la punta de la larga) la agranda o la achica con sus puestos. Con el teclado: Tab para llegar a una mesa, flechas para moverla (Mayúscula para moverla más) y Supr para quitarla. «Empezar con un salón de ejemplo» arma 12 mesas de 8, la pista, la música y la entrada para ajustarlas.
- **Cada mesa:** al tocarla se editan su número, sus puestos, un nombre opcional («Los padrinos»), la forma (redonda o larga, horizontal o vertical) y se ve quién se sienta en ella.
- **Sentar:** en «Por sentar» están las familias sin mesa que no han dicho que no van. Toca una familia y después su mesa en el plano; con una mesa elegida, tocar una familia la sienta ahí mismo; con el ratón también se puede arrastrar la familia hasta la mesa. La familia entera va a una sola mesa. También se cambia desde «Editar» en la lista de invitados.
- **Sillas:** cada mesa dibuja sus puestos; en polen los de quien confirmó, en salvia los de quien no ha respondido (cuentan sus cupos) y en blanco los libres. Si una mesa se pasa de puestos, su borde se pone rojo.
- **Mostrar su mesa a los invitados:** mientras esté apagado, nadie ve su mesa. Al encenderlo, cada invitado que confirmó ve al final de su invitación una tarjeta con su nombre, el número de su mesa y el plano del salón con su mesa encerrada, y en la portada un enlace «Mesa 4» que lleva a ella. Si confirmó y aún no tiene mesa, la tarjeta dice «por confirmar».

El plano se guarda solo (en este navegador en modo local; en la tabla `salon` con Supabase). La columna «Mesa» sale también en «Exportar CSV».

## Tareas, presupuesto y proveedores

El organizador de la boda, como el de Bodas.net. Cada pestaña se guarda sola un momento después de cada cambio (en este navegador en modo local; en la tabla `planeacion` con Supabase, que solo ven los administradores).

- **Tareas:** una lista con fechas, de la más cercana a la más lejana: arriba las atrasadas, después las de esta semana, las de más adelante, las que no tienen fecha y, al final, las hechas. Cada tarea lleva su fecha y, si se quiere, la hora. «Empezar con la lista sugerida» trae 45 tareas con su fecha ya puesta, repartidas desde un año antes hasta después de la boda (si la boda está a menos de un año, se aprietan entre hoy y la boda); algunas llevan a la pestaña donde se hacen («Ir a Mesas»). Sin la fecha de la boda, las sugeridas quedan sin fecha hasta que la pongan. Las tareas de antes, que iban por etapas, reciben sola la fecha del fin de su etapa. Arriba: cuántas hay, hechas, por hacer y atrasadas. Con fecha, cada tarea pasa a Google Calendar si entraste con Google (ver «Entrar con Google y Google Calendar»).
- **Presupuesto:** el presupuesto total y cada gasto por categoría, con estimado, costo final (reemplaza al estimado en las cuentas cuando ya se sabe), pagado y fecha del próximo pago. Arriba: lo que cuesta la boda, lo pagado, lo que falta, cuánto queda del presupuesto y el costo por invitado confirmado. Al lado, «Próximos pagos» con lo que vence. «Exportar CSV» lo descarga para Excel.
- **Proveedores:** cada proveedor con su categoría, estado (evaluando, contratado o descartado), contacto, WhatsApp o teléfono, correo, página y precio. Desde su ficha se le escribe por WhatsApp, se le llama o se abre su página; el botón del billete lo lleva al presupuesto como un gasto (o muestra el que ya tiene). Al marcarlo como contratado, el panel ofrece agregarlo al presupuesto.

## Entrar con Google y Google Calendar

El panel se abre con **«Continuar con Google»**, y esa misma cuenta queda conectada al calendario de las tareas: no hay que conectarlo aparte. La clave del panel (o el correo y la contraseña, con Supabase) sigue debajo, en «o entra con la clave del panel», por si alguien no tiene Google.

Al entrar, Google pide dos cosas: saber con qué cuenta entras (correo y nombre) y dejar que la app maneje **su propio calendario**. La app crea en esa cuenta el calendario **«Boda de Diego y Erika»** y solo puede tocar ese: no ve ni cambia nada más del Google Calendar de nadie (permiso `calendar.app.created`). Si en la ventana de Google se quita la marca del calendario, se entra igual, sin calendario.

Cada tarea con fecha pasa a ese calendario, con un aviso el día antes a las 9 de la mañana (o una hora antes, si tiene hora). Pasa sola: al entrar, al abrir Tareas y después de cada cambio. Una tarea nueva crea su evento, cambiarla lo actualiza, marcarla como hecha la deja en gris con ✓ y quitarla (o dejarla sin fecha) borra su evento. «Sincronizar ahora» lo fuerza. Va en un solo sentido: lo que se cambie en Google Calendar no vuelve al panel.

**El permiso del calendario dura una hora**, porque el panel no tiene servidor propio que lo renueve. Se guarda solo en esa pestaña del navegador: sobrevive a recargar la página y se borra al cerrarla o al tocar «Salir». Cuando vence, en Tareas aparece **«Renovar el permiso»**: un toque, y como ya lo diste, la ventana de Google se abre y se cierra sola. Lo que cambie mientras tanto se envía al renovar.

El calendario es de la cuenta que lo creó. Para que los dos lo vean, quien lo tiene lo comparte desde Google Calendar (Configuración del calendario «Boda de Diego y Erika» → Compartir con personas determinadas). Si después entra otra cuenta, el panel no pasa nada y avisa de quién es el calendario, para no repetir las tareas en dos calendarios; «Pasarlas a esta cuenta» crea uno nuevo en la cuenta que entró (el otro queda como estaba).

### Activarlo (una sola vez, gratis)

1. En [Google Cloud Console](https://console.cloud.google.com/) crea un proyecto (o usa el de Google Maps) y en **APIs y servicios → Biblioteca** activa **Google Calendar API**.
2. En **Google Auth Platform** (o **Pantalla de consentimiento de OAuth**) configura la app: tipo **Externo**, nombre «Boda de Diego y Erika», tu correo. En **Acceso a los datos** agrega el permiso `.../auth/calendar.app.created` (el correo y el perfil ya vienen). En **Público**, deja la app en **Prueba** y agrega como **usuarios de prueba** las cuentas de Gmail que van a entrar al panel (las de los novios): mientras la app esté en prueba, ninguna otra cuenta puede dar el permiso, y Google no necesita revisarla.
3. En **Clientes** (o **Credenciales**) crea un **ID de cliente de OAuth** de tipo **Aplicación web**. En **Orígenes de JavaScript autorizados** pon las direcciones desde donde se abre el panel, por ejemplo `http://localhost:8000` y `https://tu-usuario.github.io`. Si usas Supabase, en **URI de redireccionamiento autorizados** pon `https://TU-PROYECTO.supabase.co/auth/v1/callback` (la *Project URL* de Supabase más `/auth/v1/callback`).
4. Copia el **ID de cliente** (termina en `.apps.googleusercontent.com`) en `google.clientId` de `assets/config.js`.

En **modo local** eso es todo: aparece «Continuar con Google». Como los datos viven en ese navegador, la cuenta sirve para saber quién entró y para el calendario.

**Con Supabase**, además:

5. En Supabase, **Authentication → Sign In / Providers → Google**: actívalo y pega el **ID de cliente** y el **secreto del cliente** de Google (el secreto está en Google Cloud, en el mismo cliente). El secreto va solo aquí, en Supabase: nunca en `config.js` ni en ninguna parte del sitio.
6. En **Authentication → URL Configuration**, en **Redirect URLs**, agrega la dirección del panel: `http://localhost:8000/admin.html` para probar y `https://tu-usuario.github.io/tu-repositorio/admin.html` publicado.
7. Cada persona que entra al panel necesita su correo de Gmail en la tabla `administradores` (paso 4 de «Conectar Supabase») y un usuario en **Authentication → Users** con ese mismo correo: si ya entraba con correo y contraseña usando ese Gmail, no hay que hacer nada (Google se une a su usuario). Si es nueva y el registro público está apagado, créalo con **Add user → Create new user** y «Auto Confirm User»; la contraseña puede ser cualquiera, no la va a usar.

Una cuenta de Google que no está en `administradores` puede pasar por Google, pero el panel la saca y dice «no está autorizada». Con Supabase el panel recuerda la sesión de un día para otro; el permiso del calendario no (dura una hora), así que al volver otro día se toca «Conectar con Google» en Tareas.

El ID de cliente es público por diseño, como la clave de Google Maps: lo protege la lista de orígenes autorizados del paso 3, y solo las cuentas de prueba pueden dar el permiso. La primera vez Google puede avisar que la app no está verificada: es normal en modo de prueba; se sigue con «Continuar».

## Conectar Supabase (respuestas reales)

1. Crea un proyecto gratuito en [supabase.com](https://supabase.com).
2. En **SQL Editor**, pega y ejecuta `supabase/esquema.sql`. (Si ya lo habías ejecutado antes, vuelve a ejecutarlo: agrega lo que falte, como la tabla `evento`, los espacios `fotos` y `musica` de Storage, el plano de mesas, la tabla `planeacion`, el borrador del diseño, las preguntas opcionales de la respuesta y los nombres de quienes van, sin tocar los invitados). Hasta que lo vuelvas a ejecutar, las respuestas siguen llegando, pero sin los nombres.
3. En **Authentication → Users**, crea tu usuario (correo y contraseña). Recomendado: en **Authentication → Sign In / Providers** desactiva el registro público.
4. En el SQL Editor autoriza tu correo:
   ```sql
   insert into public.administradores (email) values ('tu-correo@ejemplo.com');
   ```
5. En **Settings → API** copia la *Project URL* y la clave pública *anon* a `supabase` en `assets/config.js`.

Con eso el panel pide correo y contraseña (o Google, si lo activas: ver «Entrar con Google y Google Calendar»), y las respuestas de los invitados llegan desde cualquier teléfono.

**Seguridad:** la clave `anon` es pública por diseño. Los invitados no pueden leer la lista: solo pueden ver y responder la invitación cuyo código conocen, a través de las funciones `ver_invitacion` y `responder_invitacion`. La tabla completa solo la ven las cuentas de `administradores`. Los datos de la boda (tabla `evento`), el plano del salón (tabla `salon`) y las fotos (bucket `fotos`) los puede ver cualquiera, como una invitación impresa, y solo los administradores los cambian. Quién se sienta en cada mesa no es público: `ver_invitacion` le devuelve a cada invitado solo su mesa, y solo cuando confirmó y las mesas están publicadas. Las tareas, el presupuesto, los proveedores y el borrador del diseño (tabla `planeacion`) son privados: ni los invitados ni nadie sin cuenta de administrador los puede leer.

Si dos personas editan la misma pestaña de planeación a la vez desde dos teléfonos, gana lo último que se guardó: conviene que cada uno use una pestaña distinta o que recarguen antes de editar.

## Publicar en GitHub Pages

Sube la carpeta a un repositorio, activa **Settings → Pages** desde la rama principal y copia la dirección pública en `urlInvitacion` de `assets/config.js` para que los enlaces del panel apunten ahí.

**Vista previa al compartir por WhatsApp:** `index.html` trae las etiquetas Open Graph con la imagen `fotos/og-boda.jpg` (1200×630, los nombres sobre la foto del bosque) y la dirección `https://mariocodem.github.io/boda/`, la de GitHub Pages de este repositorio. Si publicas en otro dominio, cambia `og:url` y `og:image` en `index.html` (WhatsApp necesita la dirección completa). Si cambian las fotos o los nombres, reemplaza `fotos/og-boda.jpg` por otra de 1200×630. WhatsApp guarda la vista previa un tiempo: los cambios pueden tardar en verse.

`admin.html` no está enlazado desde la invitación y lleva `noindex`, pero su protección real es el login de Supabase (con correo y contraseña o con Google) y la tabla `administradores`.

## Cómo se reparten las invitaciones

En el panel, cada fila tiene:

- **Copiar enlace**: el enlace personal del invitado.
- **WhatsApp**: abre WhatsApp con un mensaje listo y el enlace (si el invitado tiene número, va directo a su chat).
- **Ver**: abre su invitación en vista previa, sin marcarla como abierta y sin poder responder.
- **Editar**: nombre, cupos, teléfono, de quién es invitado, mesa (cuando el plano tiene mesas), notas, y la respuesta si te contestaron por otro medio (con quiénes van, sus alergias y su canción).

«Importar lista» acepta una línea por invitado (`nombre; cupos; WhatsApp; diego|erika|ambos`) o columnas pegadas desde Excel o Google Sheets. «Exportar CSV» descarga todo, con enlaces, listo para abrir en Excel.

## Estructura

```
index.html            invitación
admin.html            panel (invitados, mesas, planeación, «La boda» y «Diseño»)
assets/config.js      valores de arranque, Google Maps y conexión
assets/datos.js       modo local y Supabase (invitados, datos de la boda, fotos, mesas y planeación)
assets/salon.js       plano del salón: medidas de mesas y espacios, y su dibujo en SVG
assets/estilos.js     paletas de color y familias de letra
assets/vino.css       el tema Vino & Marfil: intro de bosque, sobre vino, filigranas, polaroids, camafeo
assets/musica.js      la música: suena al abrir el sobre, con su botón para pausar
assets/asistente.js   el asistente de configuración del panel
assets/victoriano.css el tema Victoriano: terciopelo, marcos y florituras de oro, álbum y sellos de lacre
assets/adornos/       marco dorado (propio) y floritura de Harpel (1870, dominio público) del tema Victoriano; esquinas de filigrana, cresta, divisor con corazón y papel rasgado (propios) del tema Vino & Marfil
assets/pagina.js      la página: temas, fondo, trato, textos y catálogo de bloques
assets/bloques.js     el HTML de cada bloque de la invitación
assets/ramo.js        ramo de rosas y lirios (SVG animado)
assets/destellos.js   fondo de destellos dorados (lienzo animado)
assets/papeleria.js   iconos, sello postal, matasellos, fechas y enlaces de mapas
assets/invitacion.*   sobre, tarjeta, escenas con scroll, respuesta y tarjeta de mesa
assets/admin.*        panel
assets/planeador.js   tareas, presupuesto y proveedores: categorías, sugeridos con sus fechas y cuentas
assets/planeacion.js  las pestañas Tareas, Presupuesto y Proveedores del panel
assets/calendario-google.js  la cuenta de Google del panel y las tareas en Google Calendar: permiso, calendario propio y sincronización
assets/diseno.js      la pestaña Diseño: bloques, tema, vista previa en vivo, borrador y publicar
assets/flores/        láminas de Redouté (dominio público) del tema Editorial y los separadores
assets/forro.svg      forro del sobre
supabase/esquema.sql  tablas, permisos y funciones
servir.py             servidor local para probar, sin copias viejas en el navegador
fotos/                fotos puestas a mano (las de Diego y Erika van de arranque en config.js; lo que se suba en el panel las reemplaza)
herramientas/         recortar_laminas.py: cómo se recortaron las láminas de Redouté
```
