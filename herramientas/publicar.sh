
#!/usr/bin/env bash
# Arma la carpeta publicar/ con solo lo que va al sitio público.
# Cloudflare Pages lo ejecuta en cada despliegue.
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
