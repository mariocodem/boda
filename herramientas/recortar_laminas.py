"""Recorta las láminas de Redouté: quita el papel y deja la planta con transparencia.

Uso: python recortar_laminas.py [nombre ...]   (sin nombres, todas)
Salida: recortes/<nombre>.png (máster) y vistas/<nombre>.jpg (sobre crema, sobre verde y sobre una foto).

Cómo: el papel se aplana a blanco (cada píxel dividido por el color local del
papel); la pintura se separa como tinta sobre blanco; lo que tiene tinta fuerte
(hojas, tallos, botones) queda opaco, y cada flor, dentro de su caja, se cierra
y se rellena para que los pétalos claros queden enteros y opacos.
"""
import sys
import numpy as np
from PIL import Image
from scipy import ndimage as ndi

# crop: fracciones (x0, y0, x1, y1) de la lámina completa, sin la leyenda.
# flores: cajas de las flores en fracciones de la lámina completa.
# cierre: radio del cierre de cada flor, en fracción del ancho del recorte.
# solo_color_desde: desde esa fracción de alto, solo se queda lo que tiene color.
LAMINAS = {
    'rosa-alba-regalis': dict(crop=(0.03, 0.04, 0.95, 0.85), flores=[(0.26, 0.09, 0.68, 0.34)]),
    'rosa-damascena-subalba': dict(crop=(0.04, 0.03, 0.97, 0.89), flores=[(0.31, 0.12, 0.89, 0.46)]),
    'rosa-alba-foliacea': dict(crop=(0.00, 0.00, 1.00, 0.89), margen=0.01, cierre=0.012, flores=[(0.38, 0.15, 0.76, 0.43)]),
    'rosa-centifolia-foliacea': dict(crop=(0.00, 0.00, 1.00, 0.905), flores=[
        (0.28, 0.08, 0.50, 0.27), (0.40, 0.08, 0.84, 0.40)]),
    'rosa-multiflora-carnea': dict(crop=(0.05, 0.02, 0.88, 0.805), flores=[]),
    'rosa-indica-fragrans': dict(crop=(0.03, 0.05, 0.95, 0.855), margen=0.015, flores=[(0.33, 0.21, 0.77, 0.49), (0.60, 0.14, 0.70, 0.24)]),
    'lilium-candidum': dict(crop=(0.24, 0.00, 0.92, 0.475), margen=0.012, cierre=0.011, tolerancia_papel=36, flores=[(0.30, 0.00, 0.92, 0.33), (0.30, 0.28, 0.58, 0.40)],
                            solo_color_desde=0.415, piso=0.10, lado=1800),
    'rosa-sepium': dict(crop=(0.05, 0.04, 0.97, 0.86), cierre=0.009, margen=0.02, flores=[
        (0.17, 0.17, 0.39, 0.31), (0.54, 0.09, 0.76, 0.21), (0.69, 0.47, 0.81, 0.56), (0.61, 0.57, 0.73, 0.65)]),
}

LADO = 2400  # se trabaja con el lado largo a esta medida como máximo


def fondo_local(img, candidato, paso=32):
    """El color del papel en cada punto: mediana del papel por bloque, con los huecos rellenos."""
    h, w, _ = img.shape
    gh, gw = (h + paso - 1) // paso, (w + paso - 1) // paso
    rej = np.full((gh, gw, 3), np.nan)
    for j in range(gh):
        for i in range(gw):
            msk = candidato[j * paso:(j + 1) * paso, i * paso:(i + 1) * paso]
            if msk.sum() > paso * paso * 0.3:
                rej[j, i] = np.median(img[j * paso:(j + 1) * paso, i * paso:(i + 1) * paso][msk], axis=0)
    vacio = np.isnan(rej[..., 0])
    while vacio.any():
        suma = np.zeros_like(rej)
        cuenta = np.zeros((gh, gw, 1))
        lleno = ~vacio
        for dj, di in ((-1, 0), (1, 0), (0, -1), (0, 1), (-1, -1), (1, 1), (-1, 1), (1, -1)):
            suma += np.roll(np.roll(np.nan_to_num(rej), dj, 0), di, 1) * np.roll(np.roll(lleno, dj, 0), di, 1)[..., None]
            cuenta += np.roll(np.roll(lleno, dj, 0), di, 1)[..., None]
        nuevo = vacio & (cuenta[..., 0] > 0)
        rej[nuevo] = suma[nuevo] / cuenta[nuevo]
        vacio = np.isnan(rej[..., 0])
    rej = ndi.uniform_filter(rej, size=(5, 5, 1), mode='nearest')
    return np.asarray(Image.fromarray(np.clip(rej, 0, 255).astype(np.uint8)).resize((w, h), Image.BILINEAR)).astype(np.float64)


def cerrar(mascara, r):
    """Cierre morfológico con un disco de radio r, por distancias.

    Se rellena con un margen vacío para que la orilla de la imagen no cuente
    como pintura (si no, el cierre se traga las esquinas de papel)."""
    m = int(r) + 2
    dil = ndi.distance_transform_edt(~np.pad(mascara, m)) <= r
    return (ndi.distance_transform_edt(dil) > r)[m:-m, m:-m]


def recortar(nombre, p):
    im = Image.open(f'alta/{nombre}.jpg').convert('RGB')
    W, H = im.size
    x0, y0, x1, y1 = p['crop']
    im = im.crop((int(W * x0), int(H * y0), int(W * x1), int(H * y1)))
    lado = p.get('lado', LADO)
    if max(im.size) > lado:
        im.thumbnail((lado, lado), Image.LANCZOS)
    img = np.asarray(im).astype(np.float64)
    h, w, _ = img.shape
    a_caja = lambda f: (int((f[0] - x0) / (x1 - x0) * w), int((f[1] - y0) / (y1 - y0) * h),
                        int((f[2] - x0) / (x1 - x0) * w), int((f[3] - y0) / (y1 - y0) * h))

    # 1. Papel aplanado a blanco.
    gris = img.mean(-1)
    borde = np.concatenate([img[:24].reshape(-1, 3), img[-24:].reshape(-1, 3), img[:, :24].reshape(-1, 3), img[:, -24:].reshape(-1, 3)])
    papel = np.median(borde, axis=0)
    cerca = np.abs(img - papel).max(-1) < p.get('tolerancia_papel', 22)
    fondo = fondo_local(img, cerca)
    N = np.clip(img / np.maximum(fondo, 1), 0, 1)

    # 2. Tinta sobre blanco: lo que le falta a cada canal para ser blanco.
    tinta = (1 - N).max(-1)
    tinta = ndi.median_filter(tinta, size=3)  # sin grano de papel ni bloques de compresión
    croma = N.max(-1) - N.min(-1)
    piso = p.get('piso', 0.045)
    a = np.clip((tinta - piso) / 0.28, 0, 1) ** 0.8

    a_flor = a.copy()  # las flores se cierran con la tinta completa
    if 'solo_color_desde' in p:
        corte = int(h * (p['solo_color_desde'] - y0) / (y1 - y0))
        a[corte:] = np.minimum(a[corte:], np.clip((croma[corte:] - 0.10) / 0.06, 0, 1))

    # 3. Lo de tinta fuerte (hojas, tallos, botones) es opaco.
    fuerte = a > 0.55
    fuerte_crudo = fuerte.copy()
    partes, n = ndi.label(fuerte)
    if n:
        tam = ndi.sum(fuerte, partes, np.arange(1, n + 1))
        fuerte = np.isin(partes, np.arange(1, n + 1)[tam > h * w * 0.00004])
    # Fuera las manchas grises del papel: partes sin color y sin tinta oscura.
    partes, n = ndi.label(fuerte)
    if n:
        idx = np.arange(1, n + 1)
        sin_color = ndi.mean(croma, partes, idx) < 0.06
        claras = ndi.mean(tinta, partes, idx) < 0.42
        fuerte &= ~np.isin(partes, idx[sin_color & claras])
    if 'solo_color_desde' in p:
        partes, n = ndi.label(fuerte[corte:])
        if n:
            tam = ndi.sum(fuerte[corte:], partes, np.arange(1, n + 1))
            fuerte[corte:] &= np.isin(partes, np.arange(1, n + 1)[tam > tam.max() * 0.3])
    # Los huecos cerrados con algo de tinta (nervios claros) son hoja; los de papel, no.
    huecos = ndi.binary_fill_holes(fuerte) & ~fuerte
    hs, nh = ndi.label(huecos)
    if nh:
        idx = np.arange(1, nh + 1)
        con_tinta = (ndi.mean(a, hs, idx) >= 0.14) | (ndi.mean(croma, hs, idx) >= 0.05)
        fuerte |= np.isin(hs, idx[con_tinta])

    # Lo que es casi papel y queda lejos de la tinta fuerte vuelve a ser transparente.
    casi_papel = ndi.gaussian_filter(tinta, 1.5) < piso + 0.02
    fuerte &= ~(casi_papel & (ndi.distance_transform_edt(~fuerte_crudo) > 5))

    # 4. Cada flor se cierra y se rellena: pétalos claros enteros y opacos.
    cuerpo = np.zeros((h, w), bool)
    r = p.get('cierre', 0.017) * w
    m_ = p.get('margen', 0.035)  # margen de cada caja, para que no corte pétalos en recto
    for f in p['flores']:
        cx0, cy0, cx1, cy1 = a_caja((f[0] - m_, f[1] - m_, f[2] + m_, f[3] + m_))
        cx1, cy1 = min(cx1, w), min(cy1, h)
        cx0, cy0 = max(cx0, 0), max(cy0, 0)
        sub = a_flor[cy0:cy1, cx0:cx1] > 0.12
        sub = ndi.binary_opening(sub, iterations=1)
        cerrado = ndi.binary_fill_holes(cerrar(sub, r))
        # solo la parte grande (la flor), no las motas
        lab, m = ndi.label(cerrado)
        if m:
            tam = ndi.sum(cerrado, lab, np.arange(1, m + 1))
            cerrado = np.isin(lab, np.arange(1, m + 1)[tam > tam.max() * 0.08])
        cuerpo[cy0:cy1, cx0:cx1] |= cerrado

    # 5. La planta: lo fuerte, los cuerpos y su orilla suave; nada más lejos.
    planta = fuerte | cuerpo
    cerca_planta = ndi.distance_transform_edt(~planta) <= 4
    alfa = np.where(planta, 1.0, np.where(cerca_planta, a, 0.0))
    # Fuera las piezas sueltas muy chicas que no tocan la planta.
    piezas, n = ndi.label(alfa > 0.3)
    if n:
        tam = ndi.sum(alfa > 0.3, piezas, np.arange(1, n + 1))
        sueltas = np.isin(piezas, np.arange(1, n + 1)[tam < tam.max() * 0.0025])
        alfa[ndi.binary_dilation(sueltas, iterations=2)] = 0
    alfa = ndi.gaussian_filter(alfa, 0.55)
    alfa[planta & (ndi.distance_transform_edt(planta) > 2)] = 1.0

    # Color: dentro, la lámina aplanada; en la orilla, sin el blanco del papel mezclado.
    a3 = np.clip(alfa, 1e-3, 1)[..., None]
    color = np.where(alfa[..., None] > 0.97, N, np.clip((N - (1 - a3)) / a3, 0, 1))
    out = np.dstack([color * 255, alfa * 255]).round().astype(np.uint8)
    o = Image.fromarray(out, 'RGBA')
    o = o.crop(o.getchannel('A').point(lambda v: 255 if v > 10 else 0).getbbox())
    o.save(f'recortes/{nombre}.png', optimize=True)

    # Vista: sobre crema, sobre verde y sobre una foto (gris con textura) para ver huecos.
    v = o.copy(); v.thumbnail((620, 620))
    vista = Image.new('RGB', (v.width * 3 + 40, v.height + 10), (40, 40, 40))
    rng = np.random.default_rng(1)
    foto = Image.fromarray((ndi.gaussian_filter(rng.random((v.height, v.width)), 6) * 900 % 255).astype(np.uint8)).convert('RGB')
    for k, base in enumerate([Image.new('RGB', v.size, (246, 242, 231)), Image.new('RGB', v.size, (28, 58, 45)), foto]):
        base.paste(v, (0, 0), v)
        vista.paste(base, (5 + k * (v.width + 15), 5))
    vista.save(f'vistas/{nombre}.jpg', quality=88)
    print(nombre, o.size)


if __name__ == '__main__':
    import os
    os.makedirs('recortes', exist_ok=True)
    os.makedirs('vistas', exist_ok=True)
    for n in (sys.argv[1:] or LAMINAS):
        recortar(n, LAMINAS[n])
