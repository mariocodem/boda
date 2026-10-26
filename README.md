# Invitación de boda · Diego & Erika

Sitio estático (HTML, CSS y JavaScript, sin paso de build) con dos páginas:

- `index.html`: la invitación. Cada invitado la abre desde su enlace personal (`index.html?i=CÓDIGO`): ve su nombre escrito en el sobre, lo abre y la tarjeta llena la pantalla. Al bajar, la tarjeta se asienta sobre la mesa y aparecen tres tarjetitas con el día, la hora y el lugar. Todo va sobre un fondo de destellos dorados que titilan. Cada parte que sigue es un «pliego»: un título grande impreso en la cartulina, su tarjeta y, si le toca, una foto de la pareja al lado. Siguen cómo llegar (mapa y botones para Google Maps, Waze y Apple Maps), dónde quedarse, el itinerario, nuestra historia, las fotos que sobran, el código de vestimenta, los regalos (con la cuenta para transferencias y las listas de tiendas), las preguntas frecuentes y, al final, la tarjeta de respuesta. Quien ya confirmó ve además su **tarjeta de mesa**, con el plano del salón y su mesa encerrada (cuando los novios publican las mesas).
- `admin.html`: el **libro de sobres**, el panel para administrar invitados, repartir enlaces y seguir las respuestas. En la pestaña **Mesas** se arma el plano del salón y se sienta a cada familia. **Tareas**, **Presupuesto** y **Proveedores** son el organizador de la boda: la agenda por etapas, los gastos y pagos, y a quién se cotizó o contrató. En la pestaña **La boda** se editan el estilo (colores y letra), las fotos, la fecha, los lugares (con Google Maps), el alojamiento, el itinerario, la historia, la vestimenta (con fotos de referencia), los regalos, las preguntas frecuentes y las preguntas opcionales de la respuesta.

## Probar en tu computador

```sh
python3 servir.py
```

Es como `python3 -m http.server 8000`, pero le pide al navegador que siempre revise si un archivo cambió. Con el servidor de siempre, el navegador puede quedarse con un JavaScript viejo y las funciones nuevas parecen no funcionar. Por lo mismo, `index.html` y `admin.html` piden cada archivo con su versión (`?v=20261023`): al publicar cambios, sube ese número en los dos HTML.

Abre `http://localhost:8000/admin.html`, entra con la clave local (`diegoyerika`, en `assets/config.js`) y pulsa «Cargar ejemplos para probar». Desde cada fila puedes abrir la invitación de ese invitado.

Sin Supabase todo funciona en **modo local**: los datos viven solo en ese navegador. Sirve para probar, no para recibir respuestas reales.

## Datos de la boda

Se editan desde el panel, pestaña **La boda**: estilo, foto principal, día y hora, ciudad, fecha límite para responder, ceremonia y recepción (nombre, dirección y ubicación en el mapa), alojamiento, itinerario, nuestra historia, fotos de la pareja, código de vestimenta (con fotos de referencia), regalos, preguntas frecuentes y la tarjeta de respuesta. Lo que se deje vacío aparece en la invitación como «por confirmar»; el alojamiento, la historia y las preguntas frecuentes, si están vacíos, no aparecen.

- **Alojamiento:** hoteles cerca, con dirección, enlace y una nota (por ejemplo, la tarifa especial). En la invitación van después de «Cómo llegar», cada uno con «Ver el hotel» y «Cómo llegar».
- **Nuestra historia:** texto libre; una línea en blanco separa los párrafos. Va antes de las fotos de la pareja.
- **Regalos:** el mensaje, una cuenta para transferencias (banco o app, tipo, número, a nombre de quién; con el botón «Copiar el número») y hasta cuatro enlaces a listas de regalos de tiendas. La cuenta la ve cualquiera que abra la invitación, como en una tarjeta impresa.
- **Preguntas frecuentes:** hasta doce, con su respuesta; se abren tocándolas. «Empezar con preguntas comunes» trae solo las preguntas: las respuestas las escriben ustedes.
- **Tarjeta de respuesta:** dos preguntas opcionales para quien confirma: alergias o restricciones con la comida y una canción para la fiesta. Lo que contesten aparece en la pestaña Invitados («Lo que pidieron», para pasárselo al banquete y a la música), en el diálogo de cada invitado y en «Exportar CSV».

- **Modo local:** se guarda en ese navegador (sirve para probar).
- **Con Supabase:** se guarda en la tabla `evento` y todos los invitados lo ven al instante.

`assets/config.js` tiene los valores de arranque (lo guardado en el panel los reemplaza), además del WhatsApp de contacto y las claves.

### Estilo

En **La boda → Estilo** se elige la paleta de colores (Verde hoja, Rosa empolvado, Lavanda, Azul cielo, Durazno o Salvia) y la letra (Grabada, Romana, Romántica o Fina).

Para cualquier otro color está **Color libre**: «Elegir cualquier color» abre la paleta completa del sistema, y también se puede escribir el código (por ejemplo `#c9a3b5`). De ese color sale la paleta entera: el sobre, el forro, el sello, la tarjeta y la tinta. Con un color claro la invitación va en tinta oscura de ese tono, como las paletas pastel; con uno oscuro, en letras claras, como Verde hoja. Los textos se oscurecen o aclaran solos hasta leerse bien.

La vista previa muestra el sobre y la tarjeta en pequeño; «Ver la invitación con este estilo» la abre completa antes de guardar. El estilo cambia el sobre, su forro y su sello, la tarjeta y toda la página.

### Ubicación con Google Maps

Sin configurar nada, el panel muestra una vista previa del mapa con el nombre y la dirección del lugar. Para fijar el punto exacto, pega en «Enlace de Google Maps» el enlace de **Compartir** de Google Maps: si trae coordenadas (los enlaces largos `google.com/maps/...@4.60,-74.07`), se toma el pin de ahí; si es corto (`maps.app.goo.gl`), Google Maps lo abre tal cual y Waze y Apple Maps usan el nombre y la dirección.

Para **buscar el lugar con autocompletado y mover el pin en el mapa**, agrega una clave de Google Maps:

1. En [Google Cloud Console](https://console.cloud.google.com/) crea un proyecto y activa **Maps JavaScript API** y **Places API (New)** (piden una cuenta de facturación; el uso de un panel así cabe de sobra en el cupo gratuito mensual).
2. En **APIs y servicios → Credenciales** crea una **clave de API** y restríngela: *Restricciones de aplicaciones → Sitios web* con la dirección de tu sitio (por ejemplo `https://tu-usuario.github.io/*` y `http://localhost:8000/*`) y *Restricciones de API* a esas dos APIs.
3. Pega la clave en `googleMaps.apiKey` de `assets/config.js`. (Opcional: un *Map ID* propio en `googleMaps.mapId`; sin él se usa el de demostración de Google).

La clave del navegador es visible por diseño; su protección es la restricción por dirección del paso 2.

En la invitación, cada lugar trae un mapa y tres botones: **Google Maps** (abre la ruta), **Waze** y **Apple Maps**, además de «Copiar dirección» y «Agregar al calendario».

## Fondo de destellos

Detrás de toda la invitación titilan destellos dorados y sube un polvo de oro (`assets/destellos.js`). Sus colores siguen la paleta elegida en el panel: oro claro sobre Verde hoja y oro viejo sobre las pastel. Quien tenga activado «reducir movimiento» en su teléfono los ve quietos.

## Mariposa dorada

Una mariposa de papel dorado (`assets/mariposa.js` y `assets/mariposa.css`) llega volando cuando el ramo termina de florecer y se posa en él. Al bajar, despega y acompaña al invitado; cuando deja de bajar, se posa en la esquina de la tarjeta o de la foto más cercana. Su oro sigue la paleta. Se apaga desde el panel en **La boda → Estilo → Mariposa dorada** (o con `mariposa: false` en `assets/config.js`). Con «reducir movimiento» no vuela: se queda quieta sobre el ramo.

## Fotos

Se suben desde el panel, pestaña **La boda**:

- **Foto principal:** va en el arco de la portada de la tarjeta, con el ramo apoyado en su esquina de abajo a la izquierda. Mejor vertical, con las caras en la mitad de arriba. Toca la foto (o usa los dos controles de encuadre) para elegir qué parte queda a la vista; al lado se ve cómo queda en la tarjeta.
- **Fotos de la pareja:** hasta 6, repartidas por la invitación en el orden que elijas: la 1 junto a «Los detalles», la 2 junto al itinerario, la 3 junto a «Nuestra historia» (si la escriben) y la siguiente junto a la respuesta; las demás van juntas antes de la vestimenta. En el panel, debajo de cada foto dice dónde queda; para cambiarla de lugar, muévela. Los invitados las pueden tocar para verlas en grande.
- **Fotos de referencia de vestimenta:** hasta 4, en la hoja del código de vestimenta, cada una con un nombre corto opcional («Ellas», «Ellos»).

El panel reduce cada foto y la pasa a JPG antes de subirla; se suben al pulsar «Guardar cambios», y las que quites se borran al guardar.

- **Modo local:** las fotos quedan en ese navegador (IndexedDB), solo para probar.
- **Con Supabase:** van al bucket público `fotos` de Storage, que crea `supabase/esquema.sql`.

También se pueden poner rutas a archivos de la carpeta `fotos/` en `fotoPortada` y `fotos` de `assets/config.js`; lo que se suba desde el panel las reemplaza.

## Mesas

En la pestaña **Mesas** del panel se dibuja el salón y se decide dónde se sienta cada familia:

- **Plano:** «Mesa redonda», «Mesa larga» y «Espacio» (la pista, la entrada, la música, el bar…) agregan piezas al plano. Se arrastran a su lugar; los espacios cambian de tamaño desde su esquina. Con el teclado: Tab para llegar a una mesa, flechas para moverla (Mayúscula para moverla más) y Supr para quitarla. «Empezar con un salón de ejemplo» arma 12 mesas de 8, la pista, la música y la entrada para ajustarlas.
- **Cada mesa:** al tocarla se editan su número, sus puestos, un nombre opcional («Los padrinos»), la forma (redonda o larga, horizontal o vertical) y se ve quién se sienta en ella.
- **Sentar:** en «Por sentar» están las familias sin mesa que no han dicho que no van. Toca una familia y después su mesa en el plano; con una mesa elegida, tocar una familia la sienta ahí mismo; con el ratón también se puede arrastrar la familia hasta la mesa. La familia entera va a una sola mesa. También se cambia desde «Editar» en la lista de invitados.
- **Sillas:** cada mesa dibuja sus puestos; en polen los de quien confirmó, en salvia los de quien no ha respondido (cuentan sus cupos) y en blanco los libres. Si una mesa se pasa de puestos, su borde se pone rojo.
- **Mostrar su mesa a los invitados:** mientras esté apagado, nadie ve su mesa. Al encenderlo, cada invitado que confirmó ve al final de su invitación una tarjeta con su nombre, el número de su mesa y el plano del salón con su mesa encerrada, y en la portada un enlace «Mesa 4» que lleva a ella. Si confirmó y aún no tiene mesa, la tarjeta dice «por confirmar».

El plano se guarda solo (en este navegador en modo local; en la tabla `salon` con Supabase). La columna «Mesa» sale también en «Exportar CSV».

## Tareas, presupuesto y proveedores

El organizador de la boda, como el de Bodas.net. Cada pestaña se guarda sola un momento después de cada cambio (en este navegador en modo local; en la tabla `planeacion` con Supabase, que solo ven los administradores).

- **Tareas:** la agenda por etapas, de «De 12 a 10 meses antes» a «Después de la boda». «Empezar con la lista sugerida» trae 45 tareas para quitar, cambiar o completar; algunas llevan a la pestaña donde se hacen («Ir a Mesas»). Con la fecha de la boda, cada etapa dice hasta cuándo va, la que toca se enmarca con «Ahora» y lo que quedó de etapas pasadas se marca como atrasado. Arriba: cuántas hay, hechas, por hacer y atrasadas.
- **Presupuesto:** el presupuesto total y cada gasto por categoría, con estimado, costo final (reemplaza al estimado en las cuentas cuando ya se sabe), pagado y fecha del próximo pago. Arriba: lo que cuesta la boda, lo pagado, lo que falta, cuánto queda del presupuesto y el costo por invitado confirmado. Al lado, «Próximos pagos» con lo que vence. «Exportar CSV» lo descarga para Excel.
- **Proveedores:** cada proveedor con su categoría, estado (evaluando, contratado o descartado), contacto, WhatsApp o teléfono, correo, página y precio. Desde su ficha se le escribe por WhatsApp, se le llama o se abre su página; el botón del billete lo lleva al presupuesto como un gasto (o muestra el que ya tiene). Al marcarlo como contratado, el panel ofrece agregarlo al presupuesto.

## Conectar Supabase (respuestas reales)

1. Crea un proyecto gratuito en [supabase.com](https://supabase.com).
2. En **SQL Editor**, pega y ejecuta `supabase/esquema.sql`. (Si ya lo habías ejecutado antes, vuelve a ejecutarlo: agrega lo que falte, como la tabla `evento`, el espacio `fotos` de Storage, el plano de mesas, la tabla `planeacion` y las preguntas opcionales de la respuesta, sin tocar los invitados).
3. En **Authentication → Users**, crea tu usuario (correo y contraseña). Recomendado: en **Authentication → Sign In / Providers** desactiva el registro público.
4. En el SQL Editor autoriza tu correo:
   ```sql
   insert into public.administradores (email) values ('tu-correo@ejemplo.com');
   ```
5. En **Settings → API** copia la *Project URL* y la clave pública *anon* a `supabase` en `assets/config.js`.

Con eso el panel pide correo y contraseña, y las respuestas de los invitados llegan desde cualquier teléfono.

**Seguridad:** la clave `anon` es pública por diseño. Los invitados no pueden leer la lista: solo pueden ver y responder la invitación cuyo código conocen, a través de las funciones `ver_invitacion` y `responder_invitacion`. La tabla completa solo la ven las cuentas de `administradores`. Los datos de la boda (tabla `evento`), el plano del salón (tabla `salon`) y las fotos (bucket `fotos`) los puede ver cualquiera, como una invitación impresa, y solo los administradores los cambian. Quién se sienta en cada mesa no es público: `ver_invitacion` le devuelve a cada invitado solo su mesa, y solo cuando confirmó y las mesas están publicadas. Las tareas, el presupuesto y los proveedores (tabla `planeacion`) son privados: ni los invitados ni nadie sin cuenta de administrador los puede leer.

Si dos personas editan la misma pestaña de planeación a la vez desde dos teléfonos, gana lo último que se guardó: conviene que cada uno use una pestaña distinta o que recarguen antes de editar.

## Publicar en GitHub Pages

Sube la carpeta a un repositorio, activa **Settings → Pages** desde la rama principal y copia la dirección pública en `urlInvitacion` de `assets/config.js` para que los enlaces del panel apunten ahí.

`admin.html` no está enlazado desde la invitación y lleva `noindex`, pero su protección real es el login de Supabase.

## Cómo se reparten las invitaciones

En el panel, cada fila tiene:

- **Copiar enlace**: el enlace personal del invitado.
- **WhatsApp**: abre WhatsApp con un mensaje listo y el enlace (si el invitado tiene número, va directo a su chat).
- **Ver**: abre su invitación en vista previa, sin marcarla como abierta y sin poder responder.
- **Editar**: nombre, cupos, teléfono, de quién es invitado, mesa (cuando el plano tiene mesas), notas, y la respuesta si te contestaron por otro medio (con sus alergias y su canción).

«Importar lista» acepta una línea por invitado (`nombre; cupos; WhatsApp; diego|erika|ambos`) o columnas pegadas desde Excel o Google Sheets. «Exportar CSV» descarga todo, con enlaces, listo para abrir en Excel.

## Estructura

```
index.html            invitación
admin.html            panel (invitados, mesas y «La boda»)
assets/config.js      valores de arranque, Google Maps y conexión
assets/datos.js       modo local y Supabase (invitados, datos de la boda, fotos, mesas y planeación)
assets/salon.js       plano del salón: medidas de mesas y espacios, y su dibujo en SVG
assets/estilos.js     paletas de color y familias de letra
assets/ramo.js        ramo de rosas y lirios (SVG animado)
assets/destellos.js   fondo de destellos dorados (lienzo animado)
assets/papeleria.js   iconos, sello postal, matasellos, fechas y enlaces de mapas
assets/invitacion.*   sobre, tarjeta, escenas con scroll, respuesta y tarjeta de mesa
assets/admin.*        panel
assets/planeador.js   tareas, presupuesto y proveedores: categorías, etapas, sugeridos y cuentas
assets/planeacion.js  las pestañas Tareas, Presupuesto y Proveedores del panel
assets/forro.svg      forro del sobre
supabase/esquema.sql  tablas, permisos y funciones
servir.py             servidor local para probar, sin copias viejas en el navegador
fotos/                fotos puestas a mano (opcional; lo normal es subirlas desde el panel)
```
