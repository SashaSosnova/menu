/**
 * Сумма ингредиентов рецептов недели → список закупок (скоропорт).
 * Мясо/рыба из морозилки и базовая кладовая не входят.
 */

import { getDish } from './dishes'
import { getWeekMenu } from './menu'
import type { ShoppingItem } from './types'
import type { WeekNumber } from './weeks'

type ParsedQty = {
  name: string
  /** Базовая единица для суммирования: г / мл / шт / пучок / головки / банка / ст.л. / ч.л. */
  unit: string
  gramsOrMl: number
}

/** Белок из месячных заготовок — в недельный список не дублируем. */
const FREEZER_PROTEIN =
  /^(говядина|филе грудки|куриное филе|голень|крыло|бёдра|бедра|форель|минтай|креветки)/i

/** Кладовая / специи — не пишем в скоропорт. */
const PANTRY =
  /^(соль|сахар|перец чёрный|перец черный|перец белый|перец молотый|паприка|орегано|лавровый|масло растительное|масло оливковое|куркума|карри|прованские|сухари|вода|мука|мёд|мед|соус соевый)/i

function normKey(s: string): string {
  return s.toLowerCase().replace(/ё/g, 'е').trim()
}

/** Короткие имена для чеклиста (ключи без ё). */
const SHOP_NAME: Record<string, string> = {
  'лук репчатый': 'Лук',
  'лук фиолетовый': 'Лук фиолетовый',
  'лук-порей': 'Лук-порей',
  морковь: 'Морковь',
  'перец болгарский': 'Перец сладкий',
  кабачок: 'Кабачок',
  помидор: 'Томаты',
  'помидоры черри': 'Помидоры черри',
  'томаты кусочками в томатном соке': 'Томаты в соку',
  'паста томатная': 'Томатная паста',
  'перетертые томаты': 'Перетёртые томаты',
  брокколи: 'Брокколи',
  'капуста цветная': 'Цветная капуста',
  картофель: 'Картофель',
  чеснок: 'Чеснок',
  'зеленый лук': 'Зелёный лук',
  укроп: 'Укроп',
  шпинат: 'Шпинат',
  'салат листовой': 'Салат листовой',
  огурец: 'Огурцы',
  'сметана 20%': 'Сметана 20%',
  'сливки 10%': 'Сливки 10%',
  'молоко 2,5%': 'Молоко 2,5%',
  'масло сливочное 82,5%': 'Сливочное масло',
  'масло сливочное': 'Сливочное масло',
  'макароны linguine': 'Макароны',
  рис: 'Рис',
  гречка: 'Гречка',
  булгур: 'Булгур',
  'сыр твердый пармезан': 'Твёрдый сыр',
  'шампиньоны сырые': 'Шампиньоны',
  'горошек зеленый': 'Горошек',
  кукуруза: 'Кукуруза',
  изюм: 'Изюм',
  ананас: 'Ананас',
  лимон: 'Лимон',
  'бульон говяжий': 'Бульон говяжий',
  'красное сухое вино': 'Красное сухое вино',
  'горчица дижонская': 'Горчица дижонская',
  'тимьян свежий': 'Тимьян свежий',
  'розмарин свежий': 'Розмарин свежий',
  'сельдерей (стебли)': 'Сельдерей',
  'яйцо куриное': 'Яйца',
  'соус майонезный легкий': 'Соус майонезный лёгкий',
}

function shopName(raw: string): string {
  return SHOP_NAME[normKey(raw)] ?? raw
}

function parseIngredientLine(line: string): ParsedQty | null {
  const m = line.match(
    /^(.+?)\s+(\d+(?:[,.]\d+)?)\s*(г|кг|мл|л|шт|пучок|пучка|головк[аи]|банк[аи]|ст\.?\s*л\.?|ч\.?\s*л\.?)\s*$/i,
  )
  if (!m) return null

  const rawName = m[1].trim()
  const value = Number(m[2].replace(',', '.'))
  const unitRaw = m[3].toLowerCase().replace(/\s+/g, '')

  if (FREEZER_PROTEIN.test(rawName) || PANTRY.test(rawName)) return null

  let unit = unitRaw
  let gramsOrMl = value

  if (unitRaw === 'кг') {
    unit = 'г'
    gramsOrMl = value * 1000
  } else if (unitRaw === 'л') {
    unit = 'мл'
    gramsOrMl = value * 1000
  } else if (unitRaw.startsWith('ст')) {
    unit = 'ст.л.'
  } else if (unitRaw.startsWith('ч')) {
    unit = 'ч.л.'
  } else if (unitRaw.startsWith('голов')) {
    unit = 'головки'
  } else if (unitRaw.startsWith('пуч')) {
    unit = 'пучок'
  } else if (unitRaw.startsWith('банк')) {
    unit = 'банка'
  } else if (unitRaw === 'г' || unitRaw === 'мл' || unitRaw === 'шт') {
    unit = unitRaw
  }

  // Сливки: г ≈ мл — сводим к мл
  const name = shopName(rawName)
  if (/сливки/i.test(name) && unit === 'г') {
    unit = 'мл'
  }

  return { name, unit, gramsOrMl }
}

function formatAmount(value: number, unit: string): string {
  let v = value
  let u = unit

  if (u === 'г' && v >= 1000) {
    v = Math.round(v) / 1000
    u = 'кг'
  } else if (u === 'мл' && v >= 1000) {
    v = Math.round(v) / 1000
    u = 'л'
  } else if (u === 'г' || u === 'мл') {
    v = Math.round(v)
  } else {
    v = Math.round(v * 100) / 100
  }

  const num = Number.isInteger(v)
    ? String(v)
    : String(v)
        .replace(/\.?0+$/, '')
        .replace('.', ',')

  return `${num} ${u}`
}

/** Порядок групп в чеклисте. */
const ORDER = [
  'Лук',
  'Лук фиолетовый',
  'Лук-порей',
  'Морковь',
  'Чеснок',
  'Перец сладкий',
  'Кабачок',
  'Томаты',
  'Помидоры черри',
  'Томаты в соку',
  'Томатная паста',
  'Перетёртые томаты',
  'Брокколи',
  'Цветная капуста',
  'Картофель',
  'Шампиньоны',
  'Шпинат',
  'Сельдерей',
  'Огурцы',
  'Салат листовой',
  'Укроп',
  'Зелёный лук',
  'Тимьян свежий',
  'Розмарин свежий',
  'Сметана 20%',
  'Сливки 10%',
  'Молоко 2,5%',
  'Сливочное масло',
  'Твёрдый сыр',
  'Яйца',
  'Макароны',
  'Рис',
  'Гречка',
  'Булгур',
  'Горошек',
  'Кукуруза',
  'Изюм',
  'Ананас',
  'Лимон',
  'Горчица дижонская',
  'Красное сухое вино',
  'Бульон говяжий',
  'Соус майонезный лёгкий',
]

function sortKey(name: string): number {
  const i = ORDER.indexOf(name)
  return i === -1 ? 1000 : i
}

/** Блюда недели: primary dishId (без альтернатив orDishIds). */
function weekDishIds(week: number): string[] {
  const menu = getWeekMenu(week)
  const ids = new Set<string>()
  for (const slot of menu.slots) {
    if (slot.complete) ids.add(slot.complete.dishId)
    for (const m of slot.mains) ids.add(m.dishId)
    for (const s of slot.sides) ids.add(s.dishId)
  }
  return [...ids]
}

export function aggregateWeekShopping(week: number): ShoppingItem[] {
  const agg = new Map<string, { name: string; unit: string; value: number }>()

  for (const id of weekDishIds(week)) {
    const dish = getDish(id)
    if (!dish?.recipe) continue
    for (const line of dish.recipe.ingredients) {
      const parsed = parseIngredientLine(line)
      if (!parsed) continue
      const key = `${parsed.name.toLowerCase()}|${parsed.unit}`
      const prev = agg.get(key)
      if (prev) prev.value += parsed.gramsOrMl
      else
        agg.set(key, {
          name: parsed.name,
          unit: parsed.unit,
          value: parsed.gramsOrMl,
        })
    }
  }

  return [...agg.values()]
    .sort(
      (a, b) =>
        sortKey(a.name) - sortKey(b.name) ||
        a.name.localeCompare(b.name, 'ru'),
    )
    .map((row) => ({
      product: row.name,
      amount: formatAmount(row.value, row.unit),
    }))
}

export function buildWeeklyShopping(): Record<WeekNumber, ShoppingItem[]> {
  return {
    1: aggregateWeekShopping(1),
    2: aggregateWeekShopping(2),
    3: aggregateWeekShopping(3),
    4: aggregateWeekShopping(4),
  }
}
