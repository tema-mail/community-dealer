"""Готовит фото машин для сайта из оригиналов объявлений auto.ru.

Запуск: python3 scripts/photos.py <папка с оригиналами c{N}_{NN}.jpg>
Оригиналы (≈225 МБ) в репозиторий не кладём: источник – объявления Community на auto.ru.

На фронтальных кадрах стоит дилерская табличка со старым названием «ULTIMA MOTORS» –
её размываем (правило владельца: номерной знак на фото сайта всегда скрыт).
"""
import sys
from pathlib import Path
from PIL import Image, ImageFilter

SRC = Path(sys.argv[1])
OUT = Path(__file__).resolve().parent.parent / 'public' / 'img'

# машина → (номер в выдаче auto.ru, кадры по порядку галереи; первый – главный)
CARS = {
    'ferrari-12cilindri': (0, [3, 10, 16, 15, 8, 12, 13, 14, 18, 23, 24, 27, 32]),
    'mercedes-amg-g63': (1, [1, 10, 7, 11, 12, 15, 18, 21, 23, 26, 30]),
    'porsche-911-turbo-s': (2, [3, 7, 12, 8, 9, 10, 11, 14, 16, 18, 21, 24, 28]),
}

# табличка на номерной рамке: (левый, верхний, правый, нижний) в пикселях оригинала
PLATES = {
    'c1_01': (1110, 1860, 1690, 2110),
    'c2_03': (3080, 1740, 3640, 2000),
    'c1_07': (0, 3400, 1050, 4076),  # край таблички «…ORS» на крупном плане фары
}

# первый экран: крупный план фары Porsche
HERO = 'c2_12'


def blur_box(im, box):
    # сначала грубая пикселизация, потом размытие: текст не читается даже на 6000 px
    region = im.crop(box)
    w, h = region.size
    region = region.resize((max(1, w // 60), max(1, h // 60))).resize((w, h))
    region = region.filter(ImageFilter.GaussianBlur(60))
    im.paste(region, box)


def save(im, path, widths):
    path.parent.mkdir(parents=True, exist_ok=True)
    for w in widths:
        copy = im.copy()
        copy.thumbnail((w, w * 2))
        copy.save(f'{path}-{w}.webp', 'WEBP', quality=80, method=6)


def load(name):
    im = Image.open(SRC / f'{name}.jpg').convert('RGB')
    if name in PLATES:
        blur_box(im, PLATES[name])
    return im


for slug, (car, frames) in CARS.items():
    for i, frame in enumerate(frames, 1):
        name = f'c{car}_{frame:02d}'
        save(load(name), OUT / 'cars' / slug / f'{i:02d}', (800, 1600))
        print(slug, i, name)

save(load(HERO), OUT / 'hero-headlight', (1200, 2400))
print('hero', HERO)
