# Publicar la invitación en producción

Guía paso a paso para dejar la invitación funcionando de verdad, con las respuestas de los invitados llegando desde cualquier teléfono:

- **Cloudflare Pages** sirve el sitio (`index.html`, `admin.html` y `assets/`). No hay servidor propio ni paso de compilación: solo se copian los archivos.
- **Supabase** guarda los invitados, las respuestas, los datos de la boda, el diseño, las mesas, la planeación y las fotos. También maneja las cuentas del panel.
- **Google** da tres cosas: entrar al panel con «Continuar con Google», pasar las tareas a Google Calendar y, si quieres, buscar los lugares con autocompletado en el panel (Google Maps).

Hazlo en el orden de la guía. Cada servicio necesita la dirección de los otros, así que se van apuntando en la hoja de datos de abajo.

> **Dirección de ejemplo.** En toda la guía el sitio aparece como `https://boda-diego-erika.pages.dev` y Supabase como `https://TU-REF.supabase.co`. Reemplázalas por las tuyas. Si tienes dominio propio (por ejemplo `https://diegoyerika.com`), agrégalo en todos los lugares donde aparezca la de `pages.dev`.

---

## 0. Antes de empezar

### Cuentas que necesitas

| Servicio | Para qué | Costo |
|---|---|---|
| GitHub | El repositorio `mariocodem/boda` (ya lo tienes) | Gratis |
| Cloudflare | Publicar el sitio | Gratis |
| Supabase | Datos, cuentas del panel y fotos | Gratis (ver límites en el paso 3.8) |
| Google Cloud | El proyecto donde ya está el ID de cliente de `assets/config.js` | Gratis. Maps pide una cuenta de facturación, pero el panel cabe en el cupo gratis |

### Saca un respaldo de lo que hiciste en modo local

Mientras `supabase.url` esté vacío en `assets/config.js`, todo lo que haces en el panel vive **solo en tu navegador**: no pasa solo a producción. Antes de conectar Supabase:

1. **Diseño → Tema → Respaldo → «Exportar invitacion.json»**: trae los datos de la boda (fecha, lugares, itinerario, vestimenta, regalos…) y el diseño.
2. **Invitados → «Exportar CSV»**: la lista de invitados.
3. Toma nota (o captura) del **plano de mesas** y de **tareas, presupuesto y proveedores**: no tienen exportación para volver a importarlos y toca rehacerlos en producción.
4. Las **fotos que subiste desde el panel** en modo local (IndexedDB) no viajan en el respaldo: ten a mano los archivos para subirlos otra vez. Las que están en la carpeta `fotos/` del proyecto sí van con el sitio.

### Hoja de datos (llénala a medida que avanzas)

| Dato | Dónde lo sacas | Ejemplo | Dónde va |
|---|---|---|---|
| Dirección del sitio | Cloudflare, paso 2 | `https://boda-diego-erika.pages.dev` | Supabase, Google, `config.js`, `index.html` |
| Project URL de Supabase | Supabase, paso 3.7 | `https://TU-REF.supabase.co` | `config.js` y Google |
| Clave publicable de Supabase | Supabase, paso 3.7 | `sb_publishable_…` | `config.js` |
| ID de cliente de Google | Ya está en `config.js` | `501068896688-n2usoucqsuriptb6j1jtr7sf8i7r0kho.apps.googleusercontent.com` | `config.js` y Supabase |
| Secreto del cliente de Google | Google Cloud, paso 4.3 | `GOCSPX-…` | **Solo** en Supabase |
| Clave de Google Maps (opcional) | Google Cloud, paso 4.4 | `AIza…` | `config.js` |
| Contraseña de la base de datos | Supabase, paso 3.1 | — | Tu gestor de contraseñas. No va en ningún archivo |

**Lo que nunca va en el repositorio:** el secreto del cliente de Google, la clave secreta de Supabase (`sb_secret_…` o la antigua `service_role`) y la contraseña de la base de datos. Lo que sí va en `config.js` (la Project URL, la clave publicable, el ID de cliente y la clave de Maps) es público por diseño. Lo protegen la seguridad de las tablas de Supabase y las restricciones por dirección de Google.

---

## 1. Preparar el repositorio

Hay que agregar tres archivos para que Cloudflare publique **solo** el sitio y no las carpetas de trabajo. Si no, quedarían públicas `referencias-boda/` (las imágenes de referencia, que el README dice que no conviene publicar), `.impeccable/`, `herramientas/`, `supabase/`, los `.md` y las fotos originales de WhatsApp.

### 1.1 `herramientas/publicar.sh` (nuevo)

Arma la carpeta `publicar/` con lo que va al sitio. Cloudflare lo ejecuta en cada despliegue.

```bash
#!/usr/bin/env bash
# Arma la carpeta publicar/ con solo lo que va al sitio público.
# Cloudflare Pages lo ejecuta en cada despliegue (Build command:
# bash herramientas/publicar.sh · Build output directory: publicar).
# No se publican: referencias-boda/, .impeccable/, herramientas/, supabase/,
# los .md ni las fotos originales de WhatsApp.
set -euo pipefail
cd "$(dirname "$0")/.."

rm -rf publicar
mkdir -p publicar/fotos

cp index.html admin.html publicar/
if [ -f _headers ]; then cp _headers publicar/; fi
cp -r assets publicar/
find fotos -maxdepth 1 -type f ! -name 'WhatsApp*' -exec cp {} publicar/fotos/ \;
if [ -d media ]; then cp -r media publicar/; fi

echo "Listo: publicar/ con $(find publicar -type f | wc -l) archivos ($(du -sh publicar | cut -f1))."
```

Si algún día agregas otra carpeta que el sitio necesite (por ejemplo, otra al lado de `fotos/`), súmala aquí con otro `cp -r`. La música ya no necesita carpeta: se sube desde el panel al bucket `musica` de Supabase (si existe `media/`, se copia sola).

### 1.2 `_headers` (nuevo, en la raíz del proyecto)

Cloudflare lee este archivo y agrega esos encabezados a las respuestas. Le pide a los buscadores que no indexen el panel y evita que otra página meta el sitio dentro de un marco.

```
/*
  X-Content-Type-Options: nosniff
  X-Frame-Options: SAMEORIGIN
  Referrer-Policy: strict-origin-when-cross-origin

/admin*
  X-Robots-Tag: noindex, nofollow
  Cache-Control: no-store
```

No le agregues `Referrer-Policy: no-referrer`: la clave de Google Maps se valida con el *referer* y dejaría de funcionar. `SAMEORIGIN` sí deja que la vista previa de **Diseño** muestre la invitación, porque es el mismo sitio.

### 1.3 `.gitignore` (nuevo, en la raíz)

Para que la carpeta generada no se suba al repositorio:

```
publicar/
```

### 1.4 Probarlo en tu computador

```sh
bash herramientas/publicar.sh
cd publicar && python3 ../servir.py
```

Abre `http://localhost:8000/index.html` y `http://localhost:8000/admin.html`. Si se ven bien, la carpeta está completa. Cierra el servidor con Ctrl+C y vuelve a la raíz (`cd ..`).

### 1.5 Subir los cambios

```sh
git add herramientas/publicar.sh _headers .gitignore
git commit -m "Preparar publicación en Cloudflare Pages"
git push
```

Antes, haz commit de todo lo demás que esté pendiente (por ejemplo la lámina de vestimenta y el cierre): Cloudflare publica lo que está en GitHub, no lo de tu computador.

---

## 2. Cloudflare Pages

### 2.1 Crear el proyecto

1. Entra a [dash.cloudflare.com](https://dash.cloudflare.com) (crea la cuenta si no tienes).
2. En el menú, **Workers & Pages** → **Create application** → pestaña **Pages** → **Connect to Git**.
   > Cloudflare hoy empuja los proyectos nuevos hacia **Workers**. Pages sigue funcionando; solo asegúrate de estar en la pestaña **Pages** y no crear un Worker.
3. **GitHub** → autoriza. Cuando pregunte a qué repositorios dar acceso, elige **solo** `mariocodem/boda`.
4. Elige el repositorio → **Begin setup**.

### 2.2 Configuración del despliegue

En **Set up builds and deployments**:

| Campo | Valor |
|---|---|
| Project name | `boda-diego-erika` (define la dirección: `boda-diego-erika.pages.dev`) |
| Production branch | `main` |
| Framework preset | `None` |
| Build command | `bash herramientas/publicar.sh` |
| Build output directory | `publicar` |
| Root directory | vacío |
| Environment variables | ninguna |

**Save and Deploy**. En un minuto queda publicada. Si el nombre ya está tomado, Cloudflare te da otro: **apunta la dirección exacta** en la hoja de datos.

> Todavía no mandes enlaces: sin Supabase, el sitio publicado está en modo local y las respuestas no llegarían a ningún lado.

### 2.3 Apaga las vistas previas de otras ramas

Por defecto, cada rama distinta de `main` se publica en una dirección de vista previa. Esas vistas previas usarían el mismo `config.js`, o sea **los mismos datos reales de Supabase**. Para evitar sorpresas: **Settings → Builds & deployments → Branch control** (o **Build → Branch control**) y deja las ramas de vista previa en **None**.

### 2.4 Cosas que conviene saber

- **Direcciones limpias:** Cloudflare quita el `.html`. `https://…/admin.html` redirige a `https://…/admin`, y `index.html` es `https://…/`. Por eso en Supabase se registran las dos formas (paso 3.6).
- **Cada `git push` a `main` vuelve a publicar.** El plan gratis da 500 despliegues al mes y ningún archivo puede pasar de 25 MiB (ojo con la música).
- **Volver atrás:** en **Deployments**, el menú ⋯ de un despliegue anterior → **Rollback to this deployment**.

### 2.5 Dominio propio (opcional)

1. En el proyecto: **Custom domains** → **Set up a custom domain** → escribe el dominio.
2. Si el dominio ya está en Cloudflare, se configura solo. Si está en otro proveedor, Cloudflare te dice qué registro CNAME crear (apunta a `boda-diego-erika.pages.dev`).
3. Desde ahí, usa ese dominio en todos los pasos que siguen, además del de `pages.dev`.
4. En la zona del dominio, no actives **Rocket Loader**: reordena los scripts y puede romper la invitación.

---

## 3. Supabase

### 3.1 Crear el proyecto

1. [supabase.com](https://supabase.com) → **New project**.
2. Nombre: `boda-diego-erika`. **Database password**: genera una y guárdala en tu gestor de contraseñas (no va en ningún archivo).
3. **Region:** la más cercana a Colombia. *East US (North Virginia)* o *South America (São Paulo)*; cualquiera de las dos va bien.
4. Plan **Free** → **Create new project**. Tarda un par de minutos.

### 3.2 Crear las tablas, funciones y el bucket de fotos

1. **SQL Editor** → **New query**.
2. Pega **completo** el archivo `supabase/esquema.sql` del proyecto → **Run**. Debe terminar sin error («Success. No rows returned»).
3. Comprueba:
   - **Table Editor**: `invitados`, `administradores`, `evento`, `salon` y `planeacion`.
   - **Storage**: el bucket `fotos`, marcado como público.

El esquema se puede volver a ejecutar completo sin perder datos (sirve cuando el proyecto agregue columnas nuevas).

### 3.3 Crear las cuentas del panel

Por cada persona que va a entrar al panel (por ejemplo tú, Diego y Erika):

1. **Authentication → Users → Add user → Create new user**.
2. El correo: si va a entrar con Google, **su Gmail exacto**. Una contraseña cualquiera (con Google no la usa) y marca **Auto Confirm User**.

### 3.4 Cerrar el registro público

**Authentication → Sign In / Providers** → desactiva **Allow new users to sign up**. Así nadie puede crearse una cuenta sola. Por eso las cuentas del paso 3.3 se crean a mano **antes** de entrar con Google; si no, Google responde que el registro está cerrado.

### 3.5 Autorizar a los administradores

En el **SQL Editor**, con los mismos correos del paso 3.3:

```sql
insert into public.administradores (email) values
  ('tu-correo@gmail.com'),
  ('correo-de-diego@gmail.com'),
  ('correo-de-erika@gmail.com');
```

No importan las mayúsculas. Una cuenta que no esté aquí puede pasar por Google, pero el panel la saca con «no está autorizada».

### 3.6 Direcciones de regreso

**Authentication → URL Configuration**:

- **Site URL:** `https://boda-diego-erika.pages.dev/admin`
- **Redirect URLs** (una por línea, con **Add URL**):

  ```
  https://boda-diego-erika.pages.dev/admin
  https://boda-diego-erika.pages.dev/admin.html
  http://localhost:8000/admin.html
  ```

  Con dominio propio, agrega también `https://tudominio.com/admin` y `https://tudominio.com/admin.html`.

Al volver de Google, el panel le pide a Supabase regresar a la misma dirección donde estaba abierto (`/admin` en Cloudflare). Si esa dirección no está en la lista, Supabase te manda a la *Site URL*.

### 3.7 Copiar la dirección y la clave

**Project Settings → API Keys** (en el menú de Supabase ya no existe «Settings → API», como dice el README viejo):

- **Project URL:** `https://TU-REF.supabase.co`. También aparece en el botón **Connect** de arriba.
- **Publishable key:** empieza por `sb_publishable_…`. Esta es la que va en `config.js`.

> **Usa la publicable, no la `anon` antigua.** Supabase está retirando las claves `anon` y `service_role` (la pestaña *Legacy API keys*) a finales de 2026, probablemente antes de la boda. La librería que usa el proyecto (supabase-js 2.45.4) funciona con la publicable. La lista de pruebas del paso 7 lo confirma.
>
> **Nunca** pongas en el sitio la **secret key** (`sb_secret_…`) ni la `service_role`: se saltan toda la seguridad de las tablas.

### 3.8 Límites del plan gratis

A la fecha de esta guía (revisa [supabase.com/pricing](https://supabase.com/pricing)):

- **Se pausa tras 7 días sin actividad.** Si nadie abre la invitación ni el panel en una semana (por ejemplo antes de repartir los enlaces), el proyecto se pausa y la invitación deja de cargar los datos. Se reactiva con **Restore project** en el panel de Supabase. Entra al panel antes de mandar invitaciones y en las semanas previas a la boda. Si te preocupa, sube a Pro durante el mes de la boda.
- Base de datos de 500 MB, 1 GB de fotos y 5 GB de transferencia al mes: de sobra para una boda (el panel reduce cada foto antes de subirla).
- No cuentes con copias de seguridad automáticas en el plan gratis: exporta el CSV de invitados y el `invitacion.json` de vez en cuando (paso 8).

---

## 4. Google Cloud

Entra a [console.cloud.google.com](https://console.cloud.google.com) y elige el proyecto donde está el ID de cliente que ya tienes en `config.js` (`501068896688-…`).

### 4.1 Activar las APIs

**APIs y servicios → Biblioteca**, y activa:

- **Google Calendar API** (tareas al calendario).
- Solo si vas a usar el buscador de lugares del panel: **Maps JavaScript API** y **Places API (New)**.

### 4.2 Pantalla de consentimiento (Google Auth Platform)

En **Google Auth Platform** (en algunos menús todavía se llama *Pantalla de consentimiento de OAuth*):

1. **Branding (Marca):** nombre «Boda de Diego y Erika», tu correo de soporte y de contacto. En **Authorized domains (Dominios autorizados)** agrega `TU-REF.supabase.co`, como pide la guía de Supabase para Google, y el dominio del sitio (`boda-diego-erika.pages.dev` o el tuyo).
2. **Audience (Público):** tipo **External** y estado **Testing** (Prueba). En **Test users** agrega los Gmail de quienes entran al panel, los mismos del paso 3.3. Mientras la app esté en prueba, solo esas cuentas pueden dar el permiso, y Google no tiene que revisarla.
   > No la pases a *In production*: el permiso del calendario obligaría a una verificación de Google que no hace falta para una boda. En prueba, Google muestra «Google no verificó esta app». Es normal: se sigue con **Continuar**.
3. **Data Access (Acceso a los datos):** además de `openid`, `email` y `profile`, agrega `https://www.googleapis.com/auth/calendar.app.created`. Ese permiso solo deja tocar el calendario que crea la app («Boda de Diego y Erika»), nada más del Google Calendar de nadie.

### 4.3 El cliente de OAuth (el que ya existe)

**Google Auth Platform → Clients** (o **APIs y servicios → Credenciales**) → abre el cliente web `501068896688-…`:

- **Authorized JavaScript origins (Orígenes de JavaScript autorizados)**, sin barra ni ruta al final:

  ```
  https://boda-diego-erika.pages.dev
  http://localhost:8000
  ```

  más `https://tudominio.com` si tienes dominio propio. Sirven para «Renovar el permiso» del calendario, que se pide directo desde el sitio.
- **Authorized redirect URIs (URI de redireccionamiento autorizados):**

  ```
  https://TU-REF.supabase.co/auth/v1/callback
  ```

  Es la Project URL de Supabase con `/auth/v1/callback` al final. Supabase también te la muestra en el paso 4.5.
- **Guardar.** Google avisa que el cambio puede tardar de 5 minutos a unas horas.
- **Secreto del cliente:** cópialo para el paso 4.5. Si Google ya no te muestra el secreto completo (los secretos solo se ven al crearlos), usa **Add secret (Agregar secreto)** en ese cliente y copia el nuevo. Va **solo** en Supabase.

### 4.4 Clave de Google Maps (opcional)

Solo la usa el **panel**, para buscar lugares con autocompletado y mover el pin. Los mapas que ven los invitados no la necesitan. Sin clave, el panel funciona igual con el enlace de «Compartir» de Google Maps.

1. **APIs y servicios → Credenciales → Crear credenciales → Clave de API**.
2. **Restricciones de aplicaciones → Sitios web**:

   ```
   https://boda-diego-erika.pages.dev/*
   http://localhost:8000/*
   ```

   y `https://tudominio.com/*` si aplica.
3. **Restricciones de API**: solo **Maps JavaScript API** y **Places API (New)**.
4. En **Facturación**, crea una alerta de presupuesto baja (por ejemplo 5 USD) por tranquilidad.

### 4.5 Volver a Supabase: activar Google

**Authentication → Sign In / Providers → Google**:

1. Actívalo.
2. **Client ID:** el ID completo (`501068896688-….apps.googleusercontent.com`).
3. **Client Secret:** el del paso 4.3.
4. Revisa que la **Callback URL** que muestra sea la misma que pusiste en Google → **Save**.

En la ventana de Google, al entrar, aparecerá «para continuar a `TU-REF.supabase.co`». Es normal: cambiar ese nombre requiere el dominio personalizado de Supabase, que es de pago.

---

## 5. Conectar el sitio

### 5.1 `assets/config.js`

Cambia solo estas partes:

```js
  google: {
    clientId: '501068896688-n2usoucqsuriptb6j1jtr7sf8i7r0kho.apps.googleusercontent.com', // ya está
  },

  supabase: {
    url: 'https://TU-REF.supabase.co',
    anonKey: 'sb_publishable_…',   // la clave publicable (el campo se sigue llamando anonKey)
  },

  googleMaps: {
    apiKey: 'AIza…',   // opcional; vacío = sin autocompletado en el panel
    mapId: '',
  },

  // Con la barra del final. Los enlaces personales quedan https://…/?i=CÓDIGO
  urlInvitacion: 'https://boda-diego-erika.pages.dev/',
```

`claveLocal` puede quedarse como está: con Supabase conectado ya no sirve para entrar.

### 5.2 `index.html`: la vista previa de WhatsApp

Las etiquetas Open Graph todavía apuntan a GitHub Pages. Cámbialas por la dirección nueva (WhatsApp necesita la dirección completa):

```html
<meta property="og:url" content="https://boda-diego-erika.pages.dev/">
<meta property="og:image" content="https://boda-diego-erika.pages.dev/fotos/og-boda.jpg">
```

### 5.3 Subir la versión de los archivos

En `index.html` y `admin.html`, cambia todos los `?v=20261110` por una versión nueva (por ejemplo la fecha del día, `?v=20261115`). Así ningún teléfono se queda con el `config.js` viejo, que seguiría en modo local. Hazlo cada vez que publiques cambios.

### 5.4 Publicar

```sh
git add assets/config.js index.html admin.html
git commit -m "Conectar Supabase y Google en producción"
git push
```

En **Workers & Pages → boda-diego-erika → Deployments** verás el despliegue nuevo. En un minuto queda en línea.

---

## 6. Primer arranque en producción

1. **Entra al panel:** `https://boda-diego-erika.pages.dev/admin` → **Continuar con Google** (o correo y contraseña). Acepta el permiso del calendario. Si algo falla, mira el paso 9.
2. **Importa el respaldo:** **Diseño → Tema → Respaldo → Importar** y elige el `invitacion.json`. Los datos de la boda se guardan de una vez y el diseño queda en el borrador: revísalo y pulsa **Publicar**.
3. **Sube las fotos** que habías subido en modo local (**La boda** y los bloques de **Diseño**) y pulsa **Guardar cambios** / **Publicar**. Van al bucket `fotos` de Supabase.
4. **Invitados:** abre el CSV exportado en Excel o Google Sheets, deja **en este orden** las columnas *Nombre*, *Cupos*, *WhatsApp* y *De*, cópialas y pégalas en **Invitados → Importar lista**. Cada invitado recibe un **código nuevo**, y los enlaces ya salen con la dirección de producción. Los enlaces del modo local no sirven: no reutilices ninguno.
5. **Mesas, tareas, presupuesto y proveedores:** vuelve a armarlos. Para las tareas, «Empezar con la lista sugerida» las trae con fecha, y se pasan solas al calendario «Boda de Diego y Erika» de la cuenta con la que entraste. Para que los dos lo vean, compártelo desde Google Calendar.
6. **Música (si la usas):** en **Diseño → Tema → Música** pulsa **Subir la canción (.mp3)** (hasta 20 MB) y luego **Publicar**. Va al bucket `musica` de Supabase; si el panel dice que falta, vuelve a ejecutar `supabase/esquema.sql` (paso 3.2).

---

## 7. Pruebas antes de mandar las invitaciones

Hazlas desde un teléfono con datos móviles (no el wifi de la casa) y sin sesión iniciada:

- [ ] Un enlace personal (`https://…/?i=CÓDIGO`) muestra el nombre en el sobre, se abre y carga las fotos y los mapas.
- [ ] Confirma la asistencia con ese invitado de prueba. En el panel, desde **otro** dispositivo, la respuesta aparece en **Invitados**. Esto también confirma que la clave publicable funciona.
- [ ] El enlace general compartido por WhatsApp muestra la imagen `og-boda.jpg`. WhatsApp guarda la vista previa un tiempo; para forzar una nueva, comparte el enlace con `?v=2` al final.
- [ ] En el panel: entrar con Google, crear una tarea con fecha y verla en Google Calendar. Una hora después, «Renovar el permiso» se abre y se cierra solo.
- [ ] Si pusiste la clave de Maps: en **La boda**, el buscador del lugar autocompleta.
- [ ] Subir una foto y verla en la invitación. Quitarla y que desaparezca.
- [ ] Un Gmail que **no** está en `administradores` no puede entrar al panel.
- [ ] `https://…/referencias-boda/` y `https://…/README.md` no existen (dan 404).
- [ ] Antes de repartir, deja el invitado de prueba como estaba: en **Editar**, respuesta pendiente, o bórralo.

---

## 8. Mantenimiento

- **Publicar cambios:** commit y push a `main` (Cloudflare publica solo). Sube el `?v=` en los dos HTML cada vez que cambie un `.js` o un `.css`.
- **Si algo sale mal:** **Deployments → ⋯ → Rollback to this deployment** vuelve al despliegue anterior en segundos.
- **Respaldo:** cada semana, y siempre antes de cambios grandes: **Invitados → Exportar CSV**, **Diseño → Respaldo → Exportar invitacion.json** y **Presupuesto → Exportar CSV**.
- **Pausa de Supabase:** si el proyecto se pausa (paso 3.8), reactívalo desde supabase.com con **Restore project**.
- **Nuevo administrador:** créalo en **Authentication → Users** (paso 3.3), agrégalo a `administradores` (paso 3.5) y como **Test user** en Google (paso 4.2).
- **Nuevo dominio:** agrégalo en Cloudflare (2.5), en las Redirect URLs de Supabase (3.6), en los orígenes del cliente y en la clave de Maps de Google (4.3 y 4.4), y cambia `urlInvitacion` y `og:` (5.1 y 5.2).
- **Cambios en `supabase/esquema.sql`:** cuando el proyecto lo actualice, vuelve a ejecutarlo completo en el SQL Editor (paso 3.2); no borra datos.
- **Después de la boda:** puedes pausar o borrar el proyecto de Supabase y el de Cloudflare. Antes, descarga los respaldos.

---

## 9. Problemas comunes

| Lo que ves | Causa | Arreglo |
|---|---|---|
| Las respuestas solo aparecen en un navegador, o el panel pide la «clave del panel» | El sitio sigue en modo local: `supabase.url` vacío, o el teléfono tiene el `config.js` viejo | Paso 5.1 y subir el `?v=` (5.3) |
| Google dice `redirect_uri_mismatch` | Falta la URI de Supabase en el cliente de Google | Paso 4.3: `https://TU-REF.supabase.co/auth/v1/callback` |
| Google dice «Acceso bloqueado» o `access_denied` | Esa cuenta no es *Test user* | Paso 4.2 |
| Después de Google llegas a `localhost:3000`, a otra dirección o al panel sin sesión | La *Site URL* o las *Redirect URLs* no tienen la dirección del panel | Paso 3.6 (las dos formas: `/admin` y `/admin.html`) |
| «Signups not allowed» al entrar con Google | El registro está cerrado y ese Gmail no tiene usuario | Paso 3.3 (crear el usuario) |
| «La cuenta … no está autorizada» | El correo no está en `administradores` | Paso 3.5 |
| «Renovar el permiso» falla con `origin_mismatch` o no abre | Falta el origen del sitio en el cliente | Paso 4.3 (orígenes de JavaScript); espera unos minutos |
| `Invalid API key` o 401 en todo | Clave mal copiada, o pusiste la secreta | Paso 3.7: la `sb_publishable_…` |
| El buscador de lugares dice `RefererNotAllowedMapError` | La dirección no está en la clave de Maps | Paso 4.4 |
| La invitación no carga los datos y Supabase dice *paused* | Una semana sin actividad (plan gratis) | **Restore project** en Supabase |
| El despliegue falla en Cloudflare | Falta `herramientas/publicar.sh` en GitHub, o el *Build output directory* no es `publicar` | Pasos 1.5 y 2.2; el registro está en **Deployments → View details** |
| WhatsApp muestra la imagen vieja | Caché de WhatsApp | Espera, o comparte el enlace con `?v=2` |
