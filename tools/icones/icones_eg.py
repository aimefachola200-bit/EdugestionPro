# Icônes ÉduGestion Pro (sarcelle) et ÉduGestion Pro Master (bleu nuit) : livre ouvert, toque, liseré aux couleurs du Bénin.
import sys, os
from PIL import Image, ImageDraw, ImageFont
def dessiner(fond, badge, S=1024, maskable=False):
    im = Image.new('RGBA', (S, S), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    if maskable: d.rectangle([0, 0, S, S], fill=fond)
    else: d.rounded_rectangle([0, 0, S - 1, S - 1], radius=int(S * 0.22), fill=fond)
    k = 0.78 if maskable else 1.0
    cx, cy = S / 2, S / 2
    P = lambda x, y: (cx + (x - 512) * k * S / 1024, cy + (y - 512) * k * S / 1024)
    blanc = (255, 255, 255, 255)
    # livre ouvert
    g = [P(160, 470), P(500, 540), P(500, 820), P(160, 750)]
    dr = [P(864, 470), P(524, 540), P(524, 820), P(864, 750)]
    d.polygon(g, fill=blanc); d.polygon(dr, fill=blanc)
    for i, y in enumerate((590, 650, 710)):
        d.line([P(220, y - 40), P(450, y + 10)], fill=fond, width=int(14 * k * S / 1024))
        d.line([P(804, y - 40), P(574, y + 10)], fill=fond, width=int(14 * k * S / 1024))
    # toque
    d.polygon([P(512, 170), P(820, 300), P(512, 430), P(204, 300)], fill=blanc)
    d.polygon([P(340, 360), P(684, 360), P(684, 450), P(512, 500), P(340, 450)], fill=blanc)
    d.line([P(800, 310), P(800, 450)], fill=(252, 209, 22, 255), width=int(16 * k * S / 1024))
    d.ellipse([P(780, 440), P(820, 480)], fill=(252, 209, 22, 255))
    # liseré vert / jaune / rouge
    y0, y1 = 870, 905
    d.rectangle([P(200, y0), P(408, y1)], fill=(0, 135, 81, 255))
    d.rectangle([P(408, y0), P(616, y1)], fill=(252, 209, 22, 255))
    d.rectangle([P(616, y0), P(824, y1)], fill=(232, 17, 45, 255))
    if badge:  # pastille « M » de la Master
        a, b = P(700, 560), P(900, 760)
        d.ellipse([a, b], fill=(252, 209, 22, 255), outline=fond, width=int(12 * k * S / 1024))
        try: f = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', int(130 * k * S / 1024))
        except OSError: f = ImageFont.load_default()
        d.text(((a[0] + b[0]) / 2, (a[1] + b[1]) / 2), 'M', font=f, fill=fond, anchor='mm')
    return im
def tout(dossier, fond, badge):
    base = dessiner(fond, badge); mask = dessiner(fond, badge, maskable=True)
    for n in (48, 72, 96, 128, 144, 152, 167, 180, 192, 256, 384, 512, 1024):
        base.resize((n, n), Image.LANCZOS).save(os.path.join(dossier, f'icon-{n}.png'))
    for n in (192, 512): mask.resize((n, n), Image.LANCZOS).save(os.path.join(dossier, f'icon-maskable-{n}.png'))
    base.resize((256, 256), Image.LANCZOS).save(os.path.join(dossier, 'favicon.ico'), sizes=[(16, 16), (32, 32), (48, 48), (64, 64)])
tout(sys.argv[1], (11, 93, 94, 255), False)
tout(sys.argv[2], (20, 48, 107, 255), True)
