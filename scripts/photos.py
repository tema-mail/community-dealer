"""Готовит фото всего склада: скачивает кадры из src/data/cars.json, размывает номера, пишет WebP.

Запуск: python3 scripts/photos.py <папка-кэш>   (кэш вне репозитория: исходники 1200×900 и нарезка для распознавания)
Результат: public/img/cars/<id>/NN-{800,1200}.webp

Номер на фото сайта всегда скрыт (правило владельца). На кадрах дилера стоит табличка со старым
названием «ULTIMA MOTORS», у машин с пробегом – настоящий госномер. Ищем их встроенным распознаванием
текста macOS (scripts/plates.swift): целый кадр и нижняя полоса, увеличенная вдвое, – мелкие таблички
Vision видит только так. Первый экран (hero-headlight) сделан отдельно из оригинала и лежит в репозитории.
"""
import json
import re
import subprocess
import sys
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / 'src' / 'data' / 'cars.json'
OUT = ROOT / 'public' / 'img' / 'cars'
CACHE = Path(sys.argv[1]).resolve()
SWIFT = ROOT / 'scripts' / 'plates.swift'

PLATE = re.compile(
    r'ULTIMA|MOTORS?\b|COMMUNITY|COMMUN|\bRUS\b|'
    r'[АВЕКМНОРСТУХABEKMHOPCTYX]\s?\d{3}\s?[АВЕКМНОРСТУХABEKMHOPCTYX]{2}\s?\d{2,3}',
    re.I,
)
# обрывок таблички на краю крупного плана: «RS», «ORS», «MOTO», «ULTI»…
PARTIAL = re.compile(r'^(?:[MOTRS]{2,6}|ULTI\w*|\w*TIMA\w*|MOTO\w*|\w*OTORS?)$', re.I)
EXTERIOR = 8  # первые кадры галереи – экстерьер, там бывает номер; их проверяем тщательнее

# нарезка: (левый, верхний, правый, нижний) в долях кадра; увеличение ×2 для полос
TILES = [(0, 0, 1, 1), (0, 0.35, 1, 1), (0, 0.35, 0.55, 1), (0.45, 0.35, 1, 1)]


def download(url: str, dst: Path):
    if not dst.exists() or dst.stat().st_size < 1000:
        subprocess.run(['curl', '-s', '--retry', '3', '-o', str(dst), f'{url}/1200x900'], check=True)


def make_tiles(src: Path, exterior: bool):
    im = Image.open(src).convert('RGB')
    w, h = im.size
    out = []
    for k, (l, t, r, b) in enumerate(TILES if exterior else TILES[:1]):
        tile = CACHE / 'tiles' / f'{src.stem}_{k}.jpg'
        if not tile.exists():
            crop = im.crop((int(l * w), int(t * h), int(r * w), int(b * h)))
            if k:
                crop = crop.resize((crop.width * 2, crop.height * 2), Image.LANCZOS)
            crop.save(tile, quality=92)
        out.append((tile, (l, t, r, b)))
    return out


def ocr(paths):
    """Распознавание пачками в 4 потока; результат: путь → список рамок."""
    chunks = [paths[i::4] for i in range(4)]

    def run(chunk):
        res = subprocess.run(['swift', str(SWIFT), *map(str, chunk)], capture_output=True, text=True)
        if res.returncode != 0:
            raise SystemExit(f'распознавание упало, фото не записаны: {res.stderr[-500:]}')
        return [json.loads(l) for l in res.stdout.splitlines() if l.startswith('{')]

    found = {}
    with ThreadPoolExecutor(4) as ex:
        for part in ex.map(run, chunks):
            for row in part:
                found[row['path']] = row['boxes']
    # номер на фото сайта обязан быть скрыт: без результата распознавания по каждой плитке не пишем ничего
    missing = [p for p in paths if str(p) not in found]
    if missing:
        raise SystemExit(f'нет результата распознавания для {len(missing)} плиток, например {missing[0]}')
    return found


def blur(im: Image.Image, boxes):
    w, h = im.size
    for x, y, bw, bh in boxes:
        # запас вокруг надписи: табличка шире и выше строки текста
        box = (
            max(0, int((x - bw * 0.25) * w)), max(0, int((y - bh * 1.2) * h)),
            min(w, int((x + bw * 1.25) * w)), min(h, int((y + bh * 2.2) * h)),
        )
        region = im.crop(box)
        rw, rh = region.size
        region = region.resize((max(1, rw // 24), max(1, rh // 24))).resize((rw, rh)).filter(ImageFilter.GaussianBlur(14))
        im.paste(region, box)


def main():
    cars = json.loads(DATA.read_text())['cars']
    (CACHE / 'src').mkdir(parents=True, exist_ok=True)
    (CACHE / 'tiles').mkdir(parents=True, exist_ok=True)

    jobs = []  # (машина, номер кадра, исходник)
    for car in cars:
        for n, url in enumerate(car['photos']):
            jobs.append((car, n, CACHE / 'src' / f"{car['id']}_{n:02d}.jpg", url))
    with ThreadPoolExecutor(12) as ex:
        list(ex.map(lambda j: download(j[3], j[2]), jobs))
    print('скачано кадров:', len(jobs))

    tiles = {j[2]: make_tiles(j[2], j[1] < EXTERIOR) for j in jobs}
    found = ocr([t for ts in tiles.values() for t, _ in ts])

    report = []
    for car, n, src, _ in jobs:
        boxes = []
        for tile, (l, t, r, b) in tiles[src]:
            for bx in found.get(str(tile), []):
                at_edge = bx['x'] < 0.08 or bx['x'] + bx['w'] > 0.92 or bx['y'] + bx['h'] > 0.85
                if PLATE.search(bx['text']) or (at_edge and PARTIAL.match(bx['text'].strip())):
                    # рамка в долях плитки → в доли кадра
                    boxes.append((l + bx['x'] * (r - l), t + bx['y'] * (b - t), bx['w'] * (r - l), bx['h'] * (b - t)))
                    report.append(f"{car['id']} кадр {n + 1}: «{bx['text']}»")
        im = Image.open(src).convert('RGB')
        blur(im, boxes)
        dst = OUT / car['id']
        dst.mkdir(parents=True, exist_ok=True)
        for width in (800, 1200):
            copy = im.copy()
            copy.thumbnail((width, width))
            copy.save(dst / f'{n + 1:02d}-{width}.webp', 'WEBP', quality=80, method=6)
    (CACHE / 'plates.txt').write_text('\n'.join(report))
    print('размыто надписей:', len(report), '– список в', CACHE / 'plates.txt')


if __name__ == '__main__':
    main()
