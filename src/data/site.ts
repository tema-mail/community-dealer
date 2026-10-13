// Контакты и ссылки Community (проверено 13.10.2026: Telegram-канал, 2ГИС, auto.ru).
export const site = {
  name: 'Community',
  full: 'Community Dealer',
  phone: '+7 993 288-68-88',
  phoneHref: 'tel:+79932886888',
  whatsapp: 'https://wa.me/79932886888',
  telegram: 'https://t.me/community_dealer',
  autoru: 'https://auto.ru/diler/cars/all/community_dealer_moskva/',
  address: 'Москва, Ленинградский проспект, 36 стр. 36',
  place: 'ВТБ Арена Парк',
  hours: 'Ежедневно 10:00–21:00, по записи',
  map: 'https://yandex.ru/maps/?text=%D0%9C%D0%BE%D1%81%D0%BA%D0%B2%D0%B0%2C%20%D0%9B%D0%B5%D0%BD%D0%B8%D0%BD%D0%B3%D1%80%D0%B0%D0%B4%D1%81%D0%BA%D0%B8%D0%B9%20%D0%BF%D1%80%D0%BE%D1%81%D0%BF%D0%B5%D0%BA%D1%82%2036%D1%8136',
};

// Ссылка с учётом подпапки GitHub Pages.
export const url = (path = '') => `${import.meta.env.BASE_URL.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
export const img = (path: string) => url(`img/${path}`);
