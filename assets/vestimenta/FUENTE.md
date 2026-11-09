# Lámina «Dress code» (2026-11-09)

Todo lo de esta carpeta sale de la imagen que mandó Mario para el código de vestimenta, guardada en `referencias-boda/referencias/DressCode.png` (1080 × 1581 px). Las ilustraciones son las de la imagen, sin redibujar.

| Archivo | Qué es |
|---|---|
| `ellas.webp` | Las diez invitadas (949 × 474 px), sin el papel |
| `ellas-<color>.webp` | Por vestido: la luz de la tela en gris y su silueta en el alfa |
| `ellos.webp` | Los seis invitados (850 × 434 px), sin el papel |
| `ellos-<color>.webp` | Por traje: lo mismo; la camisa, la corbata y los zapatos quedan fuera |
| `hoja-1.webp`, `hoja-2.webp` | Las dos ramitas de línea |
| `floron.webp` | El florón de los filetes |
| `evitar.webp` | El círculo con la X de «Evitar» |
| `icono-vestido.webp`, `icono-zapato.webp`, `icono-reloj.webp` | Los íconos de «Detalles que suman» |

El papel de cada pieza se volvió transparente: compuesta sobre el papel de la lámina (#eae8dc) se ve igual que en la imagen.

Las recortan `herramientas/vestimenta/recortar.mjs` (las filas y las capas de cada prenda, con `ellas.json` y `ellos.json`) y `herramientas/vestimenta/piezas.mjs` (lo demás). Con el mismo PNG dan los mismos archivos.

Para cambiar el color de un vestido o un traje, la invitación pone su capa encima de la ilustración con el color elegido de fondo y `background-blend-mode: hard-light` (ver `assets/vestimenta.css`). Con el color de la imagen no pone nada.
