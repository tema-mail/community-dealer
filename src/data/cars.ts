// Три автомобиля Community для MVP. Источник – объявления дилера на auto.ru (снято 13.10.2026):
// характеристики, цвета по каталогу производителя и опции из комментария продавца.
// Авито с нашего IP не открывается, те же машины дилер ведёт на auto.ru.

export type OptionGroup = { title: string; items: string[] };

export type Car = {
  slug: string;
  brand: string;
  model: string;
  tagline: string;
  year: number;
  price: number;
  status: 'В наличии' | 'Под заказ';
  body: string;
  power: number;
  engine: string;
  fuel: string;
  gearbox: string;
  drive: string;
  wheel: string;
  trim: string;
  color: string;
  colorName: string;
  interior: string;
  tax: number;
  photos: number;
  options: OptionGroup[];
  source: string;
};

export const cars: Car[] = [
  {
    slug: 'ferrari-12cilindri',
    brand: 'Ferrari',
    model: '12Cilindri',
    tagline: 'Атмосферный V12 на 830 л.с. в индивидуальном цвете Verde Pino',
    year: 2025,
    price: 64_000_000,
    status: 'В наличии',
    body: 'Купе',
    power: 830,
    engine: '6.5 л, V12',
    fuel: 'Бензин',
    gearbox: 'Робот',
    drive: 'Задний',
    wheel: 'Левый',
    trim: '12Cilindri',
    color: 'Зелёный',
    colorName: 'Verde Pino – индивидуальный тёмно-зелёный, двухслойная окраска Ferrari',
    interior: 'Nero (чёрный), Alcantara с акцентами Giallo Modena',
    tax: 124_500,
    photos: 13,
    source: 'https://auto.ru/cars/new/group/ferrari/12cilindri/23958335/24008117/1131544969-c0c1bc39/',
    options: [
      {
        title: 'Экстерьер',
        items: [
          'Активные Matrix LED фары',
          'Карбон: передний спойлер, задний диффузор, воздуховоды, корпуса зеркал, нижняя часть дверей, крышка багажника, корпус воздушного фильтра',
          'Щитки Scuderia Ferrari',
          'Матовые серые диски',
          'Жёлтые тормозные суппорты',
          'Декоративная ливрея (узкий флаг)',
          'Тонировка Privacy',
          'Шины Goodyear',
        ],
      },
      {
        title: 'Салон',
        items: [
          'Сиденья Daytona',
          'Вентиляция и массаж передних сидений',
          'Карбоновый руль с LED-индикацией',
          'Подогрев руля',
          'Жёлтые ремни безопасности',
          'Логотип Cavallino на подголовниках (Giallo Modena)',
          'Контрастная прострочка (Giallo Modena)',
        ],
      },
      {
        title: 'Комфорт и ассистенты',
        items: [
          'Адаптивный круиз-контроль (ACC)',
          'Передние и задние парктроники',
          'Камеры кругового обзора',
          'Цифровое зеркало заднего вида',
          'Лифт передней оси',
          'Электропривод багажника',
          'Homelink (гаражная система)',
        ],
      },
      {
        title: 'Мультимедиа',
        items: [
          'Пассажирский дисплей',
          'Премиальная аудиосистема',
          'Интерфейс смартфона и беспроводная зарядка',
        ],
      },
    ],
  },
  {
    slug: 'mercedes-amg-g63',
    brand: 'Mercedes-Benz',
    model: 'AMG G 63',
    tagline: 'G-Класс в цвете MANUFAKTUR Olive Green с салоном Saddle Brown',
    year: 2026,
    price: 32_500_000,
    status: 'В наличии',
    body: 'Внедорожник',
    power: 585,
    engine: '4.0 л, V8 битурбо',
    fuel: 'Бензин',
    gearbox: 'Автомат',
    drive: 'Полный',
    wheel: 'Левый',
    trim: 'AMG G 63',
    color: 'Зелёный',
    colorName: 'MANUFAKTUR Olive Green – оливковый зелёный',
    interior: 'Nappa Saddle Brown – коричневая натуральная кожа',
    tax: 87_750,
    photos: 11,
    source: 'https://auto.ru/cars/new/group/mercedes/g_klasse_amg/23919502/23919827/1133160702-6a4474de/',
    options: [
      {
        title: 'Экстерьер',
        items: [
          'Пакет AMG Night',
          'Карбоновый пакет AMG Exterior, карбоновые элементы кузова',
          'Комплект внешней отделки G-Manufaktur / G-Icons Black',
          'Расширенные колёсные арки AMG',
          'Диски AMG 22″ Ludwigshafen (чёрные), шины 295/40 R22',
          'Красные тормозные суппорты AMG',
          'Запасное колесо на задней двери, кожух Black Obsidian',
          'Чёрные эмблемы Mercedes-Benz',
          'Тёмное тонированное остекление и тонированная оптика',
          'Проекция логотипа Mercedes-Benz из зеркал',
          'Подготовка под фаркоп',
        ],
      },
      {
        title: 'Шасси и динамика',
        items: [
          'Пакет AMG Performance',
          'Активная система управления жёсткостью амортизаторов AMG',
          'Переключаемая спортивная выхлопная система AMG',
        ],
      },
      {
        title: 'Салон',
        items: [
          'Эксклюзивная отделка AMG, панель приборов в коже',
          'Потолок Dinamica microfibre чёрный',
          'Ромбовидная прострочка',
          'Руль AMG Carbon / Dinamica с AMG Drive Unit',
          'Мультиконтурные сиденья AMG Active Multicontour Plus',
          'Электрорегулировка сидений с памятью',
          'Подогрев передних и задних сидений',
          'Пакет ENERGIZING Plus',
          'Атмосферная подсветка салона',
          'Карбоновые накладки порогов с подсветкой',
          'Коврики AMG',
        ],
      },
      {
        title: 'Комфорт и ассистенты',
        items: [
          'Адаптивный круиз-контроль DISTRONIC',
          'Ассистент движения в пробках',
          'Распознавание дорожных знаков',
          'Камера кругового обзора 360°',
          'Парковочный пакет',
          'Head-Up Display',
          'Контроль состояния водителя',
          'Электроскладываемые зеркала с памятью и автозатемнением',
          'Обогрев ветрового стекла',
          'KEYLESS-GO',
        ],
      },
      {
        title: 'Мультимедиа',
        items: [
          'MBUX последнего поколения',
          'Навигация с дополненной реальностью',
          'Премиальная акустическая система',
          'Беспроводная зарядка для смартфона',
          'Мультимедиа для задних пассажиров и беспроводные наушники',
        ],
      },
    ],
  },
  {
    slug: 'porsche-911-turbo-s',
    brand: 'Porsche',
    model: '911 Turbo S',
    tagline: 'Новый гибридный Turbo S на 711 л.с. в Malachite Green',
    year: 2026,
    price: 37_500_000,
    status: 'В наличии',
    body: 'Купе',
    power: 711,
    engine: '3.6 л, гибрид',
    fuel: 'Гибрид',
    gearbox: 'Робот',
    drive: 'Полный',
    wheel: 'Левый',
    trim: 'Turbo S',
    color: 'Зелёный',
    colorName: 'Malachite Green Metallic',
    interior: 'Exclusive Manufaktur, двухцветная кожа Black и Aquamarine Blue',
    tax: 106_650,
    photos: 13,
    source: 'https://auto.ru/cars/new/group/porsche/911/24887939/24887942/1132699816-dc228bf1/',
    options: [
      {
        title: 'Экстерьер',
        items: [
          'Эксклюзивные задние фонари Exclusive Design',
          'Чёрные боковые накладки окон Exclusive Manufaktur',
          'Накладки крышки багажника в цвет кузова Exclusive Manufaktur',
          'Крышка топливного бака Exclusive Design',
          "Логотип 'PORSCHE' и надпись модели, сатинированный чёрный",
          "Удаление шильдиков 'turbo S' на дверях",
          'Тонированные стёкла',
          'Спортивная выхлопная система',
          'Ключ в цвет кузова',
        ],
      },
      {
        title: 'Салон',
        items: [
          'Спортивные адаптивные сиденья Plus, 18 электрорегулировок, память',
          'Вентиляция передних сидений',
          'Ремни безопасности Aquamarine Blue',
          'Коврики с контрастной прострочкой Aquamarine Blue',
          'Спортивный хронограф с циферблатом Racing Yellow',
          'Алюминиевые накладки педалей Exclusive Manufaktur',
          'Карбоновые накладки порогов с подсветкой',
          "Подсветка дверей с логотипом 'PORSCHE'",
          'Электрический люк с наклоном и сдвигом',
        ],
      },
      {
        title: 'Комфорт и ассистенты',
        items: [
          'Передний подъёмный механизм (Front Axle Lift)',
          'Адаптивный круиз-контроль',
          'ParkAssist с камерой кругового обзора Surround View',
          'Контроль слепых зон (Lane Change Assist)',
          'Porsche Entry – доступ без ключа',
        ],
      },
      {
        title: 'Мультимедиа',
        items: ['Аудиосистема Burmester High-End Surround Sound'],
      },
    ],
  },
];

export const brands = [...new Set(cars.map((c) => c.brand))];
export const bodies = [...new Set(cars.map((c) => c.body))];

export const formatPrice = (n: number) => `${n.toLocaleString('ru-RU').replace(/ /g, ' ')} ₽`;
export const carName = (c: Car) => `${c.brand} ${c.model}`;
