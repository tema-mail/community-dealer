"""Снимает весь склад Community с auto.ru в src/data/autoru.json.

Запуск: python3 scripts/scrape_autoru.py
Нужен Python Playwright и установленный Google Chrome (auto.ru отдаёт данные только браузеру).

Из объявления берём: ld+json Product (название, марка, год, цена, наличие, описание продавца, галерея)
и блок «Характеристики» из текста страницы (комплектация, двигатель, коробка, привод, руль, кузов, цвет),
плюс налог, пробег и заголовок страницы (там модификация целиком).
"""
import asyncio
import json
import re
from datetime import date
from pathlib import Path

from playwright.async_api import async_playwright

DEALER = 'https://auto.ru/diler/cars/all/community_dealer_moskva/'
OUT = Path(__file__).resolve().parent.parent / 'src' / 'data' / 'autoru.json'
LISTING = re.compile(r'https://auto\.ru/cars/(?:new/group/[^"?#\s]+?/\d+-[0-9a-f]+|used/sale/[^"?#\s]+?/\d+-[0-9a-f]+)/')
SPEC_KEYS = ['Комплектация', 'Двигатель', 'Коробка', 'Привод', 'Руль', 'Кузов', 'Цвет', 'Пробег', 'Год выпуска', 'Владельцы', 'ПТС', 'Состояние']


def parse_specs(text: str) -> dict:
    """Пары «ключ / значение» из блока Характеристики (каждое на своей строке)."""
    # у машин с пробегом блок «Владение» (пробег, владельцы, ПТС) стоит над «Характеристиками»
    block = text.split('Владение', 1)[-1] if 'Владение' in text else text.split('Характеристики', 1)[-1]
    block = block.split('Все характеристики', 1)[0]
    lines = [l.strip() for l in block.splitlines() if l.strip()]
    specs = {}
    for k, v in zip(lines, lines[1:]):
        if k in SPEC_KEYS and k not in specs:
            specs[k] = v
    return specs


def parse_page(url: str, html: str, text: str, title: str) -> dict:
    product = {}
    for m in re.finditer(r'<script type="application/ld\+json">(.*?)</script>', html, re.S):
        d = json.loads(m.group(1))
        if d.get('@type') == 'Product':
            product = d
    offers = product.get('offers') or {}
    # ld+json отдаёт только 9 фото; полная галерея – все картинки в разметке до «Комментария продавца»
    photos = []
    for im in product.get('image') or []:
        base = im.get('contentUrl', '').rsplit('/', 1)[0]
        if base and base not in photos:
            photos.append(base)
    cut = html.find('Комментарий продавца')
    if cut > 0:
        found = re.findall(r'(?:https:)?//avatars\.avto\.ru/get-autoru-vos/\d+/[0-9a-f]{32}', html[:cut])
        gallery = list(dict.fromkeys(g if g.startswith('https:') else 'https:' + g for g in found))
        if len(gallery) >= len(photos) and (not photos or photos[0] in gallery):
            photos = gallery
    tax = re.search(r'Налог\s*\n\s*([\d\s ]+)₽', text)
    status = 'В наличии' if 'InStock' in offers.get('availability', '') else 'Под заказ'
    if re.search(r'\bВ пути\b', text[:3000]):
        status = 'В пути'
    if re.search(r'\bНа заказ\b|\bпод заказ\b', text[:3000]):
        status = 'Под заказ'
    return {
        'id': re.search(r'/(\d+)-[0-9a-f]+/$', url).group(1),
        'url': url,
        'used': '/used/' in url,
        'title': title,
        'name': product.get('name', ''),
        'brand': product.get('brand', ''),
        'color': product.get('color', ''),
        'year': int(product.get('productionDate') or 0),
        'price': int(offers.get('price') or 0),
        'status': status,
        'description': product.get('description', ''),
        'specs': parse_specs(text),
        'tax': int(re.sub(r'\D', '', tax.group(1))) if tax else None,
        'photos': photos,
    }


async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(channel='chrome', headless=True)
        ctx = await browser.new_context(viewport={'width': 1440, 'height': 900}, locale='ru-RU')
        page = await ctx.new_page()

        links, n = [], 1
        while True:
            await page.goto(f'{DEALER}?page={n}', wait_until='networkidle', timeout=60000)
            found = [u for u in dict.fromkeys(LISTING.findall(await page.content())) if u not in links]
            print(f'страница {n}: {len(found)} новых объявлений')
            if not found:
                break
            links += found
            n += 1

        cars = []
        for i, url in enumerate(links, 1):
            for attempt in range(3):
                try:
                    await page.goto(url, wait_until='networkidle', timeout=60000)
                    car = parse_page(url, await page.content(), await page.inner_text('body'), await page.title())
                    break
                except Exception as e:  # сеть или антибот – повторяем
                    print('  повтор', attempt + 1, url, str(e)[:80])
                    await page.wait_for_timeout(3000)
            else:
                continue
            print(f'{i}/{len(links)} {car["name"]} {car["year"]} {car["price"]} фото:{len(car["photos"])}')
            cars.append(car)
        await browser.close()

    OUT.write_text(json.dumps({'source': DEALER, 'date': date.today().isoformat(), 'cars': cars}, ensure_ascii=False, indent=1))
    print('записано', len(cars), '→', OUT)


asyncio.run(main())
