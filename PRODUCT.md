# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Confirmado por Mario el 2026-10-19: sitio estático (HTML, CSS y JavaScript sin paso de build), publicable en GitHub Pages, con Supabase como backend opcional para invitados y confirmaciones.

- Sin claves de Supabase configuradas, todo funciona en **modo local** (localStorage del navegador), útil para probar y para el diseño.
- Con la URL del proyecto y la clave pública (`anon`) de Supabase, invitados y confirmaciones se guardan en la base de datos y el panel usa el login de Supabase (correo y contraseña).

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
- Animación de un ramo de rosas blancas y lirios blancos (requisito explícito).
- Responsive: teléfono primero.
- Estilo elegible desde el panel (pedido de Mario, 2026-10-21): seis paletas (la verde original y cinco pastel) y cuatro familias de letra elegantes.
- Panel de administración: crear, editar y eliminar invitados (nombre, cupos, teléfono, notas), ver estado de confirmación, totales, búsqueda y filtros, enlaces personales, exportar.
- Idioma de la interfaz: español (Colombia).
- **Por decidir:** fecha, ciudad, lugar(es), horarios, código de vestimenta, regalos. Se dejan como marcadores editables «por confirmar» en un único bloque de configuración.

## Brand Commitments

- Nombres de la pareja: **Diego Triana** y **Erika Ramos**, en ese orden (como los dio el usuario).
- Flores: rosas blancas y lirios blancos.

## Evidence on Hand

- Fotos de la pareja: **pendientes**; los novios las suben desde el panel (foto principal, hasta 6 de la pareja y hasta 4 de referencia de vestimenta). Sin fotos, el arco de la portada muestra el forro y la mesa de fotos no aparece.
- No hay fecha, lugar, historia de la pareja ni textos propios todavía: no inventar datos del evento ni anécdotas presentadas como reales.

## Product Principles

1. La invitación es un objeto, no un sitio web: abrirla debe sentirse como abrir un sobre de papel.
2. El invitado llega con una sola pregunta (¿cuándo, dónde y voy?) y la responde en segundos desde el teléfono.
3. Cada invitado es nombrado: el enlace personal es el centro de la experiencia.
4. El panel es una herramienta tranquila y exacta: números claros, acciones a un toque.
5. Nada de datos inventados: lo que no está confirmado se ve como «por confirmar».

## Accessibility & Inclusion

- Invitados de todas las edades (abuelos incluidos): texto legible, contraste suficiente, botones grandes.
- Las animaciones respetan `prefers-reduced-motion` y la invitación se puede abrir con teclado.
