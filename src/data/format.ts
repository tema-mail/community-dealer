// Форматирование без данных склада: этот файл можно импортировать в скрипты браузера.
// Неразрывные пробелы: цена и пробег не переносятся внутри числа.
export const formatPrice = (n: number) => `${n.toLocaleString('ru-RU').replace(/\s/g, ' ')} ₽`;
export const formatKm = (n: number) => `${n.toLocaleString('ru-RU').replace(/\s/g, ' ')} км`;
export const carsWord = (n: number) =>
  n % 10 === 1 && n % 100 !== 11 ? 'автомобиль' : [2, 3, 4].includes(n % 10) && ![12, 13, 14].includes(n % 100) ? 'автомобиля' : 'автомобилей';
