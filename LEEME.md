# Invitación de boda · Diego & Erika

Sitio estático (HTML, CSS y JavaScript, sin paso de build) con dos páginas:

- `index.html`: la invitación. Cada invitado la abre desde su enlace personal (`index.html?i=CÓDIGO`): ve su nombre escrito en el sobre, lo abre y la tarjeta llena la pantalla. Al bajar, la tarjeta se asienta sobre la mesa y un video avanza por el pasillo de una iglesia hasta el altar (con el día, la hora y el lugar). Siguen cómo llegar (mapa y botones para Google Maps, Waze y Apple Maps), el itinerario, el código de vestimenta y, al final, la tarjeta de respuesta.
- `admin.html`: el **libro de sobres**, el panel para administrar invitados, repartir enlaces y seguir las respuestas. En la pestaña **La boda** se editan el estilo (colores y letra), las fotos, la fecha, los lugares (con Google Maps), el itinerario, la vestimenta (con fotos de referencia) y los regalos.

## Probar en tu computador

```sh
python3 -m http.server 8000
```

Abre `http://localhost:8000/admin.html`, entra con la clave local (`diegoyerika`, en `assets/config.js`) y pulsa «Cargar ejemplos para probar». Desde cada fila puedes abrir la invitación de ese invitado.

Sin Supabase todo funciona en **modo local**: los datos viven solo en ese navegador. Sirve para probar, no para recibir respuestas reales.

## Datos de la boda

Se editan desde el panel, pestaña **La boda**: estilo, foto principal, día y hora, ciudad, fecha límite para responder, ceremonia y recepción (nombre, dirección y ubicación en el mapa), itinerario, fotos de la pareja, código de vestimenta (con fotos de referencia) y regalos. Lo que se deje vacío aparece en la invitación como «por confirmar».

- **Modo local:** se guarda en ese navegador (sirve para probar).
- **Con Supabase:** se guarda en la tabla `evento` y todos los invitados lo ven al instante.

`assets/config.js` tiene los valores de arranque (lo guardado en el panel los reemplaza), además del WhatsApp de contacto, el video y las claves.

### Estilo

En **La boda → Estilo** se elige la paleta de colores (Verde hoja, Rosa empolvado, Lavanda, Azul cielo, Durazno o Salvia) y la letra (Grabada, Romana, Romántica o Fina). La vista previa muestra el sobre y la tarjeta en pequeño; «Ver la invitación con este estilo» la abre completa antes de guardar. El estilo cambia el sobre, su forro y su sello, la tarjeta y toda la página.

### Ubicación con Google Maps

Sin configurar nada, el panel muestra una vista previa del mapa con el nombre y la dirección del lugar. Para fijar el punto exacto, pega en «Enlace de Google Maps» el enlace de **Compartir** de Google Maps: si trae coordenadas (los enlaces largos `google.com/maps/...@4.60,-74.07`), se toma el pin de ahí; si es corto (`maps.app.goo.gl`), Google Maps lo abre tal cual y Waze y Apple Maps usan el nombre y la dirección.

Para **buscar el lugar con autocompletado y mover el pin en el mapa**, agrega una clave de Google Maps:

1. En [Google Cloud Console](https://console.cloud.google.com/) crea un proyecto y activa **Maps JavaScript API** y **Places API (New)** (piden una cuenta de facturación; el uso de un panel así cabe de sobra en el cupo gratuito mensual).
2. En **APIs y servicios → Credenciales** crea una **clave de API** y restríngela: *Restricciones de aplicaciones → Sitios web* con la dirección de tu sitio (por ejemplo `https://tu-usuario.github.io/*` y `http://localhost:8000/*`) y *Restricciones de API* a esas dos APIs.
3. Pega la clave en `googleMaps.apiKey` de `assets/config.js`. (Opcional: un *Map ID* propio en `googleMaps.mapId`; sin él se usa el de demostración de Google).

La clave del navegador es visible por diseño; su protección es la restricción por dirección del paso 2.

En la invitación, cada lugar trae un mapa y tres botones: **Google Maps** (abre la ruta), **Waze** y **Apple Maps**, además de «Copiar dirección» y «Agregar al calendario».

## Video del altar

`video/` trae un video de stock (licencia libre de Pexels, ver `video/FUENTE.md`) en versión horizontal y vertical. La página lo carga completo y lo avanza cuadro a cuadro con el scroll. Si tienen un video de su iglesia, `video/FUENTE.md` explica cómo prepararlo. Quien tenga activado «reducir movimiento» en su teléfono ve el altar quieto, sin escenas fijas.

## Fotos

Se suben desde el panel, pestaña **La boda**:

- **Foto principal:** va en el arco de la portada de la tarjeta, con el ramo apoyado en su esquina de abajo a la izquierda. Mejor vertical, con las caras en la mitad de arriba. Toca la foto (o usa los dos controles de encuadre) para elegir qué parte queda a la vista; al lado se ve cómo queda en la tarjeta.
- **Fotos de la pareja:** hasta 6, debajo del itinerario, en el orden que elijas. Los invitados las pueden tocar para verlas en grande.
- **Fotos de referencia de vestimenta:** hasta 4, en la hoja del código de vestimenta, cada una con un nombre corto opcional («Ellas», «Ellos»).

El panel reduce cada foto y la pasa a JPG antes de subirla; se suben al pulsar «Guardar cambios», y las que quites se borran al guardar.

- **Modo local:** las fotos quedan en ese navegador (IndexedDB), solo para probar.
- **Con Supabase:** van al bucket público `fotos` de Storage, que crea `supabase/esquema.sql`.

También se pueden poner rutas a archivos de la carpeta `fotos/` en `fotoPortada` y `fotos` de `assets/config.js`; lo que se suba desde el panel las reemplaza.

## Conectar Supabase (respuestas reales)

1. Crea un proyecto gratuito en [supabase.com](https://supabase.com).
2. En **SQL Editor**, pega y ejecuta `supabase/esquema.sql`. (Si ya lo habías ejecutado antes, vuelve a ejecutarlo: agrega la tabla `evento` y el espacio `fotos` de Storage sin tocar los invitados).
3. En **Authentication → Users**, crea tu usuario (correo y contraseña). Recomendado: en **Authentication → Sign In / Providers** desactiva el registro público.
4. En el SQL Editor autoriza tu correo:
   ```sql
   insert into public.administradores (email) values ('tu-correo@ejemplo.com');
   ```
5. En **Settings → API** copia la *Project URL* y la clave pública *anon* a `supabase` en `assets/config.js`.

Con eso el panel pide correo y contraseña, y las respuestas de los invitados llegan desde cualquier teléfono.

**Seguridad:** la clave `anon` es pública por diseño. Los invitados no pueden leer la lista: solo pueden ver y responder la invitación cuyo código conocen, a través de las funciones `ver_invitacion` y `responder_invitacion`. La tabla completa solo la ven las cuentas de `administradores`. Los datos de la boda (tabla `evento`) y las fotos (bucket `fotos`) los puede ver cualquiera, como una invitación impresa, y solo los administradores los cambian.

## Publicar en GitHub Pages

Sube la carpeta a un repositorio, activa **Settings → Pages** desde la rama principal y copia la dirección pública en `urlInvitacion` de `assets/config.js` para que los enlaces del panel apunten ahí.

`admin.html` no está enlazado desde la invitación y lleva `noindex`, pero su protección real es el login de Supabase.

## Cómo se reparten las invitaciones

En el panel, cada fila tiene:

- **Copiar enlace**: el enlace personal del invitado.
- **WhatsApp**: abre WhatsApp con un mensaje listo y el enlace (si el invitado tiene número, va directo a su chat).
- **Ver**: abre su invitación en vista previa, sin marcarla como abierta y sin poder responder.
- **Editar**: nombre, cupos, teléfono, de quién es invitado, notas, y la respuesta si te contestaron por otro medio.

«Importar lista» acepta una línea por invitado (`nombre; cupos; WhatsApp; diego|erika|ambos`) o columnas pegadas desde Excel o Google Sheets. «Exportar CSV» descarga todo, con enlaces, listo para abrir en Excel.

## Estructura

```
index.html            invitación
admin.html            panel (invitados y «La boda»)
assets/config.js      valores de arranque, video, Google Maps y conexión
assets/datos.js       modo local y Supabase (invitados, datos de la boda y fotos)
assets/estilos.js     paletas de color y familias de letra
assets/ramo.js        ramo de rosas y lirios (SVG animado)
assets/papeleria.js   iconos, sello postal, matasellos, fechas y enlaces de mapas
assets/invitacion.*   sobre, tarjeta, escenas con scroll y respuesta
assets/admin.*        panel
assets/forro.svg      forro del sobre
video/                video del altar y su procedencia (FUENTE.md)
supabase/esquema.sql  tablas, permisos y funciones
fotos/                fotos puestas a mano (opcional; lo normal es subirlas desde el panel)
```
