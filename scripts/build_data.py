"""Превращает сырой склад auto.ru (src/data/autoru.json) в данные сайта (src/data/cars.json).

Запуск: python3 scripts/build_data.py
Что делает: красивые названия марок и моделей, каталоги по кузову, цвета и салон из описания продавца,
список опций, выбор кадров для галереи. Ручные уточнения – в OVERRIDES.
"""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
RAW = ROOT / 'src' / 'data' / 'autoru.json'
OUT = ROOT / 'src' / 'data' / 'cars.json'

BRANDS = {
    'MERCEDES': ('Mercedes-Benz', 'mercedes-benz'),
    'LAND_ROVER': ('Land Rover', 'land-rover'),
    'PORSCHE': ('Porsche', 'porsche'),
    'FERRARI': ('Ferrari', 'ferrari'),
    'VOLVO': ('Volvo', 'volvo'),
    'LEXUS': ('Lexus', 'lexus'),
}
MODELS = {
    's_klasse': 'S-Класс', 'e_klasse': 'E-Класс', 'gle_klasse_amg': 'AMG GLE', 'gle_klasse_coupe_amg': 'AMG GLE Coupé',
    'g_klasse_amg': 'AMG G-Класс', 'v_klasse': 'V-Класс', 'gls_klasse': 'GLS', '911': '911', 'cayenne': 'Cayenne',
    'panamera': 'Panamera', '12cilindri': '12Cilindri', '296_gtb': '296 GTS', 'xc60': 'XC60', 'lm': 'LM',
    'range_rover': 'Range Rover', 'range_rover_sport': 'Range Rover Sport',
}
# кузов auto.ru → каталог по кузову
BODIES = {
    'Внедорожник 5 дв.': ('vnedorozhniki', 'Внедорожник'),
    'Седан': ('sedany', 'Седан'),
    'Лифтбек': ('sedany', 'Лифтбек'),
    'Минивэн': ('miniveny', 'Минивэн'),
    'Купе': ('sportkary', 'Купе'),
    'Родстер': ('sportkary', 'Родстер'),
}
GEARBOX = {'Автоматическая': 'Автомат', 'Роботизированная': 'Робот', 'Вариатор': 'Вариатор', 'Механическая': 'Механика'}
# уточнения, которых нет в выгрузке
OVERRIDES = {
    '1133060238': {'mileage': 17010, 'owners': '1 владелец', 'pts': 'Оригинал / электронный', 'history': 'По базе ГИБДД ДТП не было'},
}
MAX_PHOTOS = 12


def colors(desc: str):
    body = re.search(r'(?:Цвет кузова|Кузов|Цвет)\s*[:\-–—]\s*(.+)', desc)
    salon = re.search(r'(?:Цвет салона|Салон|Интерьер)\s*[:\-–—]\s*(.+)', desc)
    clean = lambda m: m.group(1).strip().rstrip('.').replace('—', '–') if m else ''
    return clean(body), clean(salon)


def options(desc: str):
    """Пункты списка опций из описания продавца; подпункты «- …» склеиваем с родителем."""
    text = desc.split('Преимущества', 1)[0]
    if 'опции' in text.lower():
        text = re.split(r'(?i)основные опции:?|опции:', text, maxsplit=1)[-1]
    items, joined = [], set()
    for raw in text.splitlines():
        line = raw.strip()
        # цвет и салон показываем отдельно; «на заказ», «подробности по телефону» – не опции
        if not line or re.match(r'(?i)^[•·▪●✔✓\-–—]?\s*(цвет|кузов|салон|интерьер|автомобиль|возможно|на заказ|подробност|\*)', line):
            continue
        sub = re.match(r'^[-–—]\s*(.+)', line)
        bullet = re.match(r'^[•·▪●✔✓]\s*(.+)', line)
        if sub and items:
            # первый подпункт идёт после двоеточия, следующие – через запятую
            items[-1] = items[-1].rstrip(':') + (', ' if items[-1] in joined else ': ') + sub.group(1)
            joined.add(items[-1])
        elif bullet:
            items.append(bullet.group(1))
        elif items or len(line) < 90:
            items.append(line)
    items = [re.sub(r'\s+', ' ', i).replace('—', '–').strip(' ;') for i in items]
    return [i for i in items if 2 < len(i) < 400]


def pick_frames(n: int):
    """Галерея: первые 8 кадров (экстерьер с разных сторон) + 4 из второй половины (детали и салон)."""
    if n <= MAX_PHOTOS:
        return list(range(n))
    first = list(range(8))
    rest = [round(n * k) for k in (0.55, 0.65, 0.75, 0.85)]
    return first + [r for r in rest if r not in first and r < n]


def main():
    raw = json.loads(RAW.read_text())
    cars = []
    for c in raw['cars']:
        brand, brand_slug = BRANDS[c['brand']]
        model_key = re.search(r'/cars/(?:new/group|used/sale)/[^/]+/([^/]+)/', c['url']).group(1)
        model = MODELS[model_key]
        s = c['specs']
        catalog, body = BODIES[s['Кузов']]
        engine = s['Двигатель'].replace('\xa0', ' ')
        power = int(re.search(r'(\d+)\s*л\.с\.', engine).group(1))
        fuel = engine.rsplit(',', 1)[-1].strip().capitalize()
        volume = re.match(r'([\d.]+ л),', engine)
        trim = s['Комплектация']
        for prefix in (model, 'Panamera'):
            trim = re.sub(rf'^{re.escape(prefix)}\s+', '', trim)
        if trim == model:
            trim = ''
        if model.startswith('AMG'):
            trim = re.sub(r'^AMG\s+', '', trim)
        trim = re.sub(r'V?300 d экстра длинный', '300 d', trim)
        long = 'Extra Long' if 'Extra Long' in c['name'] else 'Long' if 'Long' in c['name'] else ''
        if long and long not in trim:
            trim = f'{trim} {long}'.strip()
        color_name, interior = colors(c['description'])
        frames = pick_frames(len(c['photos']))
        car = {
            'id': c['id'],
            'slug': f"{re.sub(r'[^a-z0-9]+', '-', model.lower().replace('-класс', '-klasse').replace('é', 'e')).strip('-')}-{c['id']}",
            'brand': brand,
            'brandSlug': brand_slug,
            'model': model,
            'trim': trim,
            'year': c['year'],
            'price': c['price'],
            'status': c['status'],
            'used': c['used'],
            'mileage': 0 if not c['used'] else None,
            'catalog': catalog,
            'body': body,
            'engine': f"{volume.group(1)}, {fuel.lower()}" if volume else fuel,
            'power': power,
            'fuel': fuel,
            'gearbox': GEARBOX.get(s['Коробка'], s['Коробка']),
            'drive': s['Привод'],
            'wheel': s['Руль'],
            'color': s['Цвет'],
            'colorName': color_name,
            'interior': interior,
            'options': options(c['description']),
            'tax': c['tax'],
            'photos': [c['photos'][i] for i in frames],
            'source': c['url'],
        }
        car.update(OVERRIDES.get(c['id'], {}))
        cars.append(car)
    # порядок по умолчанию: дороже – выше
    cars.sort(key=lambda x: -x['price'])
    OUT.write_text(json.dumps({'date': raw['date'], 'source': raw['source'], 'cars': cars}, ensure_ascii=False, indent=1))
    print('машин:', len(cars), '→', OUT)


if __name__ == '__main__':
    main()
