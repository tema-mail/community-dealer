// Склад Community: весь каталог дилера на auto.ru (scripts/scrape_autoru.py → scripts/build_data.py → cars.json).
// Авито с нашего IP не открывается; дилер ведёт тот же парк на auto.ru.
import raw from './cars.json';
import { img, url } from './site';

export type Car = {
  id: string;
  slug: string;
  brand: string;
  brandSlug: string;
  model: string;
  trim: string;
  year: number;
  price: number;
  status: string;
  used: boolean;
  mileage: number | null;
  owners?: string;
  pts?: string;
  history?: string;
  catalog: string;
  body: string;
  engine: string;
  power: number;
  fuel: string;
  gearbox: string;
  drive: string;
  wheel: string;
  color: string;
  colorName: string;
  interior: string;
  options: string[];
  tax: number | null;
  photos: string[];
  source: string;
};

export const cars = raw.cars as Car[];
export const stockDate = raw.date;

// Каталоги по кузову (порядок – как в меню)
export const bodyCatalogs = [
  { slug: 'vnedorozhniki', title: 'Внедорожники', lead: 'G-Класс, Range Rover, Cayenne, GLE и GLS в Москве' },
  { slug: 'sedany', title: 'Седаны', lead: 'S-Класс, E-Класс и Panamera – представительский класс и спорт' },
  { slug: 'miniveny', title: 'Минивэны', lead: 'V-Класс Extra Long и Lexus LM – бизнес-салон для семьи и компании' },
  { slug: 'sportkary', title: 'Спорткары', lead: 'Ferrari и Porsche 911 – машины для эмоций' },
].map((c) => ({ ...c, cars: cars.filter((car) => car.catalog === c.slug) }));

// Каталоги по маркам: порядок – по числу машин
export const brandCatalogs = [...new Set(cars.map((c) => c.brandSlug))]
  .map((slug) => {
    const list = cars.filter((c) => c.brandSlug === slug);
    return { slug, title: list[0].brand, cars: list };
  })
  .sort((a, b) => b.cars.length - a.cars.length);

export const carName = (c: Car) => `${c.brand} ${c.model}`;
export const fullName = (c: Car) => `${carName(c)}${c.trim ? ` ${c.trim}` : ''}`;
export const carUrl = (c: Car) => url(`catalog/${c.brandSlug}/${c.slug}/`);
export const photo = (c: Car, n: number, w: 800 | 1200) => img(`cars/${c.id}/${String(n).padStart(2, '0')}-${w}.webp`);

export { formatPrice, formatKm, carsWord } from './format';
