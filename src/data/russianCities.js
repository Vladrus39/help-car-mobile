// Список крупных городов России
export const RUSSIAN_CITIES = [
  // Города-миллионники
  { id: 1, name: 'Москва', region: 'Москва', population: 12_655_000 },
  { id: 2, name: 'Санкт-Петербург', region: 'Ленинградская область', population: 5_384_000 },
  { id: 3, name: 'Новосибирск', region: 'Новосибирская область', population: 1_625_000 },
  { id: 4, name: 'Екатеринбург', region: 'Свердловская область', population: 1_493_000 },
  { id: 5, name: 'Казань', region: 'Республика Татарстан', population: 1_257_000 },
  { id: 6, name: 'Нижний Новгород', region: 'Нижегородская область', population: 1_244_000 },
  { id: 7, name: 'Челябинск', region: 'Челябинская область', population: 1_196_000 },
  { id: 8, name: 'Самара', region: 'Самарская область', population: 1_156_000 },
  { id: 9, name: 'Омск', region: 'Омская область', population: 1_125_000 },
  { id: 10, name: 'Ростов-на-Дону', region: 'Ростовская область', population: 1_137_000 },
  { id: 11, name: 'Уфа', region: 'Республика Башкортостан', population: 1_128_000 },
  { id: 12, name: 'Красноярск', region: 'Красноярский край', population: 1_093_000 },
  { id: 13, name: 'Воронеж', region: 'Воронежская область', population: 1_058_000 },
  { id: 14, name: 'Пермь', region: 'Пермский край', population: 1_055_000 },
  { id: 15, name: 'Волгоград', region: 'Волгоградская область', population: 1_008_000 },

  // Крупные города (500k+)
  { id: 16, name: 'Краснодар', region: 'Краснодарский край', population: 948_000 },
  { id: 17, name: 'Саратов', region: 'Саратовская область', population: 830_000 },
  { id: 18, name: 'Тюмень', region: 'Тюменская область', population: 816_000 },
  { id: 19, name: 'Тольятти', region: 'Самарская область', population: 684_000 },
  { id: 20, name: 'Ижевск', region: 'Удмуртская Республика', population: 646_000 },
  { id: 21, name: 'Барнаул', region: 'Алтайский край', population: 631_000 },
  { id: 22, name: 'Ульяновск', region: 'Ульяновская область', population: 625_000 },
  { id: 23, name: 'Иркутск', region: 'Иркутская область', population: 623_000 },
  { id: 24, name: 'Хабаровск', region: 'Хабаровский край', population: 616_000 },
  { id: 25, name: 'Ярославль', region: 'Ярославская область', population: 608_000 },
  { id: 26, name: 'Владивосток', region: 'Приморский край', population: 604_000 },
  { id: 27, name: 'Махачкала', region: 'Республика Дагестан', population: 603_000 },
  { id: 28, name: 'Томск', region: 'Томская область', population: 575_000 },
  { id: 29, name: 'Оренбург', region: 'Оренбургская область', population: 572_000 },
  { id: 30, name: 'Кемерово', region: 'Кемеровская область', population: 552_000 },
  { id: 31, name: 'Новокузнецк', region: 'Кемеровская область', population: 537_000 },
  { id: 32, name: 'Рязань', region: 'Рязанская область', population: 534_000 },
  { id: 33, name: 'Астрахань', region: 'Астраханская область', population: 524_000 },
  { id: 34, name: 'Набережные Челны', region: 'Республика Татарстан', population: 533_000 },
  { id: 35, name: 'Пенза', region: 'Пензенская область', population: 520_000 },
  { id: 36, name: 'Липецк', region: 'Липецкая область', population: 508_000 },
  { id: 37, name: 'Киров', region: 'Кировская область', population: 507_000 },
  { id: 38, name: 'Чебоксары', region: 'Чувашская Республика', population: 497_000 },
  { id: 39, name: 'Калининград', region: 'Калининградская область', population: 489_000 },
  { id: 40, name: 'Тула', region: 'Тульская область', population: 475_000 },

  // Средние города (250k+)
  { id: 41, name: 'Курск', region: 'Курская область', population: 450_000 },
  { id: 42, name: 'Ставрополь', region: 'Ставропольский край', population: 434_000 },
  { id: 43, name: 'Сочи', region: 'Краснодарский край', population: 424_000 },
  { id: 44, name: 'Улан-Удэ', region: 'Республика Бурятия', population: 437_000 },
  { id: 45, name: 'Тверь', region: 'Тверская область', population: 425_000 },
  { id: 46, name: 'Магнитогорск', region: 'Челябинская область', population: 413_000 },
  { id: 47, name: 'Иваново', region: 'Ивановская область', population: 401_000 },
  { id: 48, name: 'Брянск', region: 'Брянская область', population: 399_000 },
  { id: 49, name: 'Белгород', region: 'Белгородская область', population: 392_000 },
  { id: 50, name: 'Сургут', region: 'Ханты-Мансийский АО', population: 379_000 },
  { id: 51, name: 'Владимир', region: 'Владимирская область', population: 357_000 },
  { id: 52, name: 'Нижний Тагил', region: 'Свердловская область', population: 338_000 },
  { id: 53, name: 'Архангельск', region: 'Архангельская область', population: 346_000 },
  { id: 54, name: 'Чита', region: 'Забайкальский край', population: 324_000 },
  { id: 55, name: 'Калуга', region: 'Калужская область', population: 341_000 },
  { id: 56, name: 'Смоленск', region: 'Смоленская область', population: 318_000 },
  { id: 57, name: 'Волжский', region: 'Волгоградская область', population: 314_000 },
  { id: 58, name: 'Курган', region: 'Курганская область', population: 310_000 },
  { id: 59, name: 'Череповец', region: 'Вологодская область', population: 308_000 },
  { id: 60, name: 'Орёл', region: 'Орловская область', population: 303_000 },
  { id: 61, name: 'Владикавказ', region: 'Республика Северная Осетия', population: 301_000 },
  { id: 62, name: 'Вологда', region: 'Вологодская область', population: 301_000 },
  { id: 63, name: 'Мурманск', region: 'Мурманская область', population: 287_000 },
  { id: 64, name: 'Саранск', region: 'Республика Мордовия', population: 297_000 },
  { id: 65, name: 'Якутск', region: 'Республика Саха (Якутия)', population: 318_000 },
  { id: 66, name: 'Тамбов', region: 'Тамбовская область', population: 261_000 },
  { id: 67, name: 'Стерлитамак', region: 'Республика Башкортостан', population: 280_000 },
  { id: 68, name: 'Грозный', region: 'Чеченская Республика', population: 324_000 },
  { id: 69, name: 'Кострома', region: 'Костромская область', population: 277_000 },
  { id: 70, name: 'Петрозаводск', region: 'Республика Карелия', population: 278_000 },
]

/**
 * Получить город по ID
 */
export function getCityById(id) {
  return RUSSIAN_CITIES.find(city => city.id === id)
}

/**
 * Получить город по названию
 */
export function getCityByName(name) {
  return RUSSIAN_CITIES.find(city => city.name.toLowerCase() === name.toLowerCase())
}

/**
 * Поиск городов
 */
export function searchCities(query) {
  if (!query) return RUSSIAN_CITIES
  
  const lowerQuery = query.toLowerCase()
  return RUSSIAN_CITIES.filter(city => 
    city.name.toLowerCase().includes(lowerQuery) ||
    city.region.toLowerCase().includes(lowerQuery)
  )
}

/**
 * Получить топ городов по населению
 */
export function getTopCities(limit = 15) {
  return RUSSIAN_CITIES.slice(0, limit)
}

