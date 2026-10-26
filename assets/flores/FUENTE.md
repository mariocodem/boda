# Flores decorativas: láminas de Redouté

Ocho láminas de Pierre-Joseph Redouté (1759–1840), recortadas con transparencia para ponerlas sobre el fondo, sobre los bordes de las secciones y sobre las esquinas de las fotos. Redouté murió hace más de 180 años: las obras son de dominio público, y las fotos o escaneos de Wikimedia Commons que se usaron también lo son (o van con CC0).

Cada flor está en dos tamaños: `nombre.webp` (1200 px de lado largo, para pantallas grandes o densas) y `nombre-600.webp` (600 px).

| Archivo | Lámina | Fuente | Licencia |
|---|---|---|---|
| `lilium-candidum` | *Lilium candidum*, Lis blanc. *Les Liliacées* (1802–1816) | [Commons](https://commons.wikimedia.org/wiki/File:Lilium_candidum_in_Les_liliacees.jpg) | Dominio público |
| `rosa-damascena-subalba` | *Rosa damascena subalba*. *Les Roses* (1817–1824) | [Commons](https://commons.wikimedia.org/wiki/File:Henry_Joseph_Redout%C3%A9_-_Les_Roses-_Rosa_Damascena,_subalba_-_1965.291_-_Cleveland_Museum_of_Art.jpg), Cleveland Museum of Art 1965.291 | CC0 |
| `rosa-alba-foliacea` | *Rosa alba foliacea*, La Blanche foliacée. *Les Roses* III (1824) | [Commons](https://commons.wikimedia.org/wiki/File:Rosa_alba_foliacea,_Les_Roses_III,_1824,_Redout%C3%A9.jpg) | Dominio público |
| `rosa-alba-regalis` | *Rosa alba regalis*, Rosier blanc royal. *Les Roses* | [Commons](https://commons.wikimedia.org/wiki/File:Rosa_alba_Regalis_001.JPG) | Dominio público |
| `rosa-centifolia-foliacea` | *Rosa centifolia foliacea*. *Les Roses* | [Commons](https://commons.wikimedia.org/wiki/File:Redoute_-_Rosa_centifolia_foliacea.jpg) | Dominio público |
| `rosa-multiflora-carnea` | *Rosa multiflora carnea*. *Les Roses* | [Commons](https://commons.wikimedia.org/wiki/File:Rosa_multiflora_carnea_001.JPG) | Dominio público |
| `rosa-indica-fragrans` | *Rosa indica fragrans*, Rosier des Indes odorant. *Les Roses* | [Commons](https://commons.wikimedia.org/wiki/File:Rosa_indica_fragrans_001.JPG) | Dominio público |
| `rosa-sepium` | *Rosa sepium flore submultiplici*. *Les Roses* | [Commons](https://commons.wikimedia.org/wiki/File:Rosa_sepium_flore_submultiplia_001.JPG) | Dominio público |

Descargadas el 2026-10-23. Se descartaron dos láminas que en Commons van con CC BY 3.0 (*Rosa damascena celsiana* y *Rosa centifolia anemonoides*) y la *Rosa muscosa alba*, cuyos pétalos blancos son el papel mismo y no se pueden separar de él.

## Cómo se recortaron

Con `herramientas/recortar_laminas.py`, sin borrar nada a mano:

1. Se corta la leyenda impresa al pie de cada lámina.
2. El papel se aplana a blanco: cada píxel se divide por el color del papel en ese punto (estimado por bloques, con los huecos rellenos desde los vecinos).
3. La pintura se separa como tinta sobre blanco. Lo de tinta fuerte (hojas, tallos, botones) queda opaco.
4. Cada flor se cierra y se rellena dentro de su caja, para que los pétalos claros queden enteros y opacos y no dejen ver lo que tengan debajo.
5. Se quitan las manchas del papel y las piezas sueltas, y se limpia el tinte del papel en las orillas.

En el lirio, la mitad de abajo de la lámina tiene hojas solo dibujadas, sin pintar: se recortó por debajo de la unión de las hojas.

Sobre fondos claros (crema y pastel) las orillas no se notan. Sobre un fondo muy oscuro, algunos pétalos blancos muestran pequeños dientes donde el cierre tocó el papel; si alguna paleta oscura las usa, conviene revisarlas ahí.

Para repetirlo: en una carpeta aparte, descarga las láminas de la tabla a `alta/<archivo>.jpg` (a 2400 px o más) y corre `python recortar_laminas.py` (necesita Pillow, NumPy y SciPy). Las máster salen en `recortes/`, en PNG; los WebP de esta carpeta se hicieron desde ahí con calidad 84 (alfa 90).
