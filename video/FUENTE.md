# Video del camino al altar

- **Original:** «Elegant church wedding ceremony setup», iglesia decorada para una boda, sin novios.
  https://www.pexels.com/video/elegant-church-wedding-ceremony-setup-36546209/
- **Autor:** RECALL FROM THE FUTURE :) en Pexels.
- **Licencia:** Licencia de Pexels: uso gratuito, sin atribución obligatoria, se permite modificarlo.
  https://www.pexels.com/license/
- **Descargado:** 2026-10-21, archivo 1920×1080 a 50 fps, 13,4 s.

## Cómo se preparó

Se usan los primeros 9,6 s (después aparecen personas al fondo), sin audio, a 30 fps y con un
cuadro clave cada 4 cuadros para que el video se pueda adelantar y devolver con el scroll sin saltos.

```sh
# Horizontal (pantallas anchas)
ffmpeg -i original.mp4 -t 9.6 -an -vf "fps=30,scale=1280:-2:flags=lanczos,format=yuv420p" \
  -c:v libx264 -preset slow -crf 26 -g 4 -keyint_min 4 -bf 0 -movflags +faststart altar-horizontal.mp4

# Vertical (teléfonos): recorte central 9:16
ffmpeg -i original.mp4 -t 9.6 -an -vf "fps=30,crop=608:1080:(iw-608)/2:0,scale=540:960:flags=lanczos,format=yuv420p" \
  -c:v libx264 -preset slow -crf 26 -g 4 -keyint_min 4 -bf 0 -movflags +faststart altar-vertical.mp4

# Cuadros fijos: primero (mientras carga) y último (movimiento reducido)
ffmpeg -i altar-horizontal.mp4 -frames:v 1 -q:v 4 altar-horizontal-inicio.jpg
ffmpeg -sseof -0.1 -i altar-horizontal.mp4 -frames:v 1 -q:v 4 altar-horizontal-final.jpg
```

## Cambiarlo por el video de su iglesia

Graben caminando despacio por el pasillo hacia el altar, sin cortes, de 8 a 12 segundos.
Prepárenlo con los mismos comandos (cambiando `-t` por la duración que quieran) y reemplacen
estos archivos con los mismos nombres, o cambien las rutas en `video` dentro de `assets/config.js`.
