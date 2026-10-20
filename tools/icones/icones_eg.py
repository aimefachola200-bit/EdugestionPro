# Icônes ÉduGestion Pro (sarcelle) et ÉduGestion Pro Master (bleu nuit) : livre ouvert, toque, liseré aux couleurs du Bénin.
import sys, os
ARMOIRIES = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'armoiries-benin.png')
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
    g = [P(160, 520), P(500, 580), P(500, 830), P(160, 770)]
    dr = [P(864, 520), P(524, 580), P(524, 830), P(864, 770)]
    d.polygon(g, fill=blanc); d.polygon(dr, fill=blanc)
    for i, y in enumerate((630, 685, 740)):
        d.line([P(220, y - 40), P(450, y + 10)], fill=fond, width=int(14 * k * S / 1024))
        d.line([P(804, y - 40), P(574, y + 10)], fill=fond, width=int(14 * k * S / 1024))
    # armoiries du Bénin dans un médaillon blanc
    arm = Image.open(ARMOIRIES).convert('RGBA')
    (x0, y0), (x1, y1) = P(322, 90), P(702, 470)
    d.ellipse([x0, y0, x1, y1], fill=blanc, outline=(252, 209, 22, 255), width=int(14 * k * S / 1024))
    L = int((x1 - x0) * 0.78); h = int(L * arm.height / arm.width)
    arm = arm.resize((L, h), Image.LANCZOS)
    im.alpha_composite(arm, (int((x0 + x1) / 2 - L / 2), int((y0 + y1) / 2 - h / 2)))
    d = ImageDraw.Draw(im)
    # liseré vert / jaune / rouge
    y0, y1 = 870, 905
    d.rectangle([P(200, y0), P(408, y1)], fill=(0, 135, 81, 255))
    d.rectangle([P(408, y0), P(616, y1)], fill=(252, 209, 22, 255))
    d.rectangle([P(616, y0), P(824, y1)], fill=(232, 17, 45, 255))
    if badge:  # pastille « M » de la Master
        a, b = P(720, 600), P(910, 790)
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
