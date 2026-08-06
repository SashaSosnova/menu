/**
 * Align menu recipe ingredients to planer products-catalog.json.
 * Run: npx tsx scripts/align-ingredients.ts
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { dishes } from '../src/data/dishes.ts'
import { ensureFryOil } from '../src/lib/recipeFryOil.ts'

type Product = { name: string; aliases: string[] }

const catalog: Product[] = JSON.parse(
  readFileSync('products-catalog.json', 'utf8'),
).products

const catalogNames = new Set(catalog.map((p) => p.name))

function norm(s: string): string {
  return s
    .toLowerCase()
    .replace(/ё/g, 'е')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function tokens(s: string): string[] {
  return norm(s).split(' ').filter((t) => t.length >= 2)
}

function scoreMatch(query: string, productName: string): number {
  const q = norm(query)
  const n = norm(productName)
  if (!q || !n) return 0
  if (q === n) return 100
  if (n.includes(q) && q.length >= 4) return 85
  if (q.includes(n) && n.length >= 4) return 75
  const qTok = tokens(q)
  const nTok = tokens(n)
  const overlap = qTok.filter((t) => nTok.some((nt) => nt === t || nt.startsWith(t) || t.startsWith(nt))).length
  if (overlap === 0) return 0
  return 25 + overlap * 18
}

const OVERRIDES: Record<string, string> = {
  говядина: 'Говядина бескостная',
  лук: 'Лук репчатый',
  'филе курицы': 'Филе грудки куриное сырое',
  'куриный фарш': 'Филе грудки куриное сырое',
  'филе форели': 'Форель радужная филе с кожей',
  форель: 'Форель радужная филе с кожей',
  'филе минтая': 'Минтай филе без кожи',
  минтай: 'Минтай филе без кожи',
  креветки: 'Креветки сырые',
  бёдра: 'Куриное филе бедра сырое',
  бедра: 'Куриное филе бедра сырое',
  'бёдра без кожи и костей': 'Куриное филе бедра сырое',
  ножки: 'Голень куриная сырая',
  крылья: 'Крыло куриное сырые',
  'перец сладкий': 'Перец болгарский',
  'томаты в соку': 'Томаты кусочками в томатном соке',
  'ананас консервированный в соку': 'Ананас',
  'филе курицы': 'Филе грудки куриное сырое',
  'филе минтая': 'Минтай филе без кожи',
  'горошек или кукуруза': 'Горошек зелёный',
  томаты: 'Помидор',
  помидоры: 'Помидор',
  'томатная паста': 'Паста томатная',
  лимон: 'Лимон',
  'соевый соус': 'Соус соевый',
  'сливочное масло': 'Масло сливочное 82,5%',
  'сливки 10%': 'Сливки 10%',
  'сливки 20%': 'Сливки 20%',
  сливки: 'Сливки 10%',
  сметана: 'Сметана 20%',
  молоко: 'Молоко 2,5%',
  макароны: 'Макароны Linguine',
  паста: 'Макароны Linguine',
  рис: 'Рис',
  гречка: 'Гречка',
  киноа: 'Киноа',
  булгур: 'Булгур',
  капуста: 'Капуста белокочанная',
  'цветная капуста': 'Капуста цветная',
  'салат листовой': 'Салат листовой',
  салат: 'Салат листовой',
  'лук фиолетовый': 'Лук фиолетовый',
  'красный лук': 'Лук фиолетовый',
  картофель: 'Картофель',
  морковь: 'Морковь',
  чеснок: 'Чеснок',
  'ананас консервированный в соку': 'Ананас',
  ананас: 'Ананас',
  'ананас в соку': 'Ананас',
  шампиньоны: 'Шампиньоны сырые',
  кабачок: 'Кабачок',
  брокколи: 'Брокколи',
  горошек: 'Горошек зелёный',
  'горошек или кукуруза': 'Горошек зелёный',
  кукуруза: 'Кукуруза',
  сахар: 'Сахар',
  мёд: 'Мёд',
  мед: 'Мёд',
  мука: 'Мука пшеничная в/с',
  яйцо: 'Яйцо куриное',
  укроп: 'Укроп',
  петрушка: 'Петрушка',
  лимон: 'Лимон',
  сыр: 'Сыр твёрдый Пармезан',
  'сыр тёртый': 'Сыр твёрдый Пармезан',
  масло: 'Масло растительное',
  оливки: 'Оливки',
  творог: 'Творог мягкий 5%',
  овсянка: 'Овсяное хлопья',
  манка: 'Сухари панировочные',
  'манка или овсянка': 'Сухари панировочные',
  имбирь: 'Имбирь (молотый)',
  'малосольные огурцы': 'Огурец',
  огурцы: 'Огурец',
  зелень: 'Укроп',
  'капуста белокочанная': 'Капуста белокочанная',
  'капуста по корейски': 'Капуста белокочанная',
  'капустный салат': 'Капуста белокочанная',
  'сметана для заправки': 'Сметана 15%',
  'соус основа для болоньезе': 'Соус основа для болоньезе',
  'куриные котлеты': 'Филе грудки куриное сырое',
  'запечённое филе': 'Филе грудки куриное сырое',
  'запеченное филе': 'Филе грудки куриное сырое',
  'свежий огурец': 'Огурец',
  'готовая морковь по-корейски': 'Морковь',
  'морковь по-корейски': 'Морковь',
  'йогурт натуральный': 'Сметана 15%',
  'горошек замороженный': 'Горошек зелёный',
  'сливочное масло': 'Масло сливочное 82,5%',
  масла: 'Масло растительное',
  'форель или минтай': 'Форель радужная филе с кожей',
  'масло или сметана': 'Масло растительное',
  'укроп или петрушка': 'Укроп',
  'укроп по желанию': 'Укроп',
  'масло по желанию': 'Масло растительное',
  'кусочек масла по желанию': 'Масло сливочное 82,5%',
  'чуть масла или лимон при подаче': 'Масло растительное',
}

/** When weight is missing, use typical amount (not 2 g). Spices still go through spiceLine. */
const DEFAULT_GRAMS: Record<string, number> = {
  'Капуста белокочанная': 200,
  'Салат листовой': 250,
  'Лук фиолетовый': 50,
  Огурец: 100,
  Помидор: 250,
  'Сметана 20%': 30,
  'Сметана 15%': 30,
  Укроп: 2,
  Петрушка: 2,
  Чеснок: 5,
  'Масло растительное': 20,
  'Масло сливочное 82,5%': 10,
  'Сливки 10%': 100,
  Морковь: 100,
  'Филе грудки куриное сырое': 200,
  'Куриное филе бедра сырое': 200,
  'Крыло куриное сырые': 200,
  'Форель радужная филе с кожей': 150,
  Картофель: 200,
}

/** Full ingredient lists for dishes that cannot be inferred line-by-line. */
const DISH_OVERRIDES: Record<string, string[]> = {
  boiled_potato: ['Картофель 700 г', 'Укроп 2 г', 'Масло сливочное 82,5% 15 г', 'Соль 2 г'],
  broccoli_steam: [
    'Брокколи 850 г',
    'Пармезан 40 г',
    'Масло растительное (спрей) 5 г',
    'Соль 2 г',
  ],
  pasta: ['Макароны Linguine 320 г', 'Соль 2 г'],
  mash: [
    'Картофель 700 г',
    'Молоко 2,5% 90 г',
    'Масло растительное 28 г',
    'Соль 2 г',
  ],
  chicken_tomato_cream: [
    'Филе грудки куриное сырое 600 г',
    'Кабачок 600 г',
    'Лук репчатый 100 г',
    'Помидор 300 г',
    'Сметана 20% 150 г',
    'Чеснок 10 г',
  ],
  beef_meatballs: [
    'Говядина бескостная 450 г',
    'Лук репчатый 100 г',
    'Сухари панировочные 15 г',
    'Томаты кусочками в томатном соке 200 г',
    'Сметана 20% 100 г',
    'Соль 2 г',
    'Паприка сладкая 2 г',
  ],
  chicken_legs: [
    'Голень куриная сырая 1000 г',
    'Масло растительное 15 г',
    'Соль 2 г',
    '— маринад на выбор (один) —',
    'А) Мёд-чеснок: мёд 5 г, чеснок 10 г, паприка 2 г',
    'Б) Паприка: паприка 5 г, чеснок 10 г',
  ],
  wings: [
    'Крыло куриное сырые 1500 г',
    'Масло растительное 15 г',
    'Соль 2 г',
    '— маринад на выбор (один) —',
    'А) Соево-медовый: соевый соус 45 г, мёд 5 г, паприка 2 г, чеснок 5 г',
    'Б) Паприка: паприка 5 г, чеснок 10 г',
  ],
  thighs_sour_cream: [
    'Куриное филе бедра сырое 1300 г',
    'Сметана 20% 100 г',
    'Чеснок 10 г',
    'Паприка сладкая 2 г',
    'Масло растительное 15 г',
    'Соль 2 г',
  ],
  shrimp_pasta: [
    'Макароны Linguine 370 г',
    'Креветки сырые 450 г',
    'Сливки 10% 175 г',
    'Чеснок 10 г',
    'Масло сливочное 82,5% 15 г',
    'Соль 2 г',
  ],
  shrimp_rice_hainan: [
    'Рис 370 г',
    'Креветки сырые 450 г',
    'Чеснок 40 г',
    'Морковь 120 г',
    'Горошек зелёный 120 г',
    'Кукуруза консервированная или замороженная 120 г',
    'Ананас свежий или консервированный 250 г',
    'Изюм 40 г',
    'Яйцо куриное 100 г',
    'Масло растительное 30 г',
    'Соус соевый светлый 25 г',
    'Карри порошок мягкий 4 г',
    'Соль 2 г',
    'Перец белый молотый 1 г',
    'Зелёный лук 30 г',
  ],
  chicken_stroganoff: [
    'Филе грудки куриное сырое 600 г',
    'Лук репчатый 100 г',
    'Сметана 20% 200 г',
    'Паста томатная 5 г',
    'Мука пшеничная в/с 5 г',
    'Масло растительное 20 г',
    'Соль 2 г',
    'Паприка сладкая 2 г',
  ],
  chicken_meatballs: [
    'Филе грудки куриное сырое 500 г',
    'Лук репчатый 100 г',
    'Сухари панировочные 20 г',
    'Томаты кусочками в томатном соке 200 г',
    'Сметана 20% 100 г',
    'Масло растительное 20 г',
    'Соль 2 г',
    'Паприка сладкая 2 г',
  ],
  buckwheat_veg: [
    'Гречка 180 г',
    'Лук репчатый 100 г',
    'Морковь 100 г',
    'Масло растительное 20 г',
    'Соль 2 г',
  ],
  rice_veg: [
    'Рис 180 г',
    'Лук репчатый 100 г',
    'Морковь 100 г',
    'Масло растительное 20 г',
    'Соль 2 г',
  ],
  bulgur_veg: [
    'Булгур 180 г',
    'Лук репчатый 100 г',
    'Морковь 100 г',
    'Масло растительное 20 г',
    'Соль 2 г',
  ],
}

const SPICE_LABELS: Record<string, string> = {
  соль: 'Соль',
  ореgano: 'Орегано',
  орегано: 'Орегано',
  'лавровый лист': 'Лавровый лист',
  лавр: 'Лавровый лист',
  'сладкая паприка': 'Паприка сладкая',
  паприка: 'Паприка сладкая',
  паприки: 'Паприка сладкая',
  базилик: 'Базилик',
  'орегано базилик': 'Орегано',
  'орегано/базилик': 'Орегано',
}

function overrideKeyMatches(h: string, key: string): boolean {
  const k = norm(key)
  if (!k) return false
  if (h === k) return true
  const escaped = k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return new RegExp(`(?:^|\\s)${escaped}(?:\\s|$)`).test(h)
}

function findProduct(hint: string, dishName: string): string | null {
  const h = norm(hint)
  if (!h) return null

  for (const name of catalogNames) {
    if (norm(name) === h) return name
  }

  for (const [key, val] of Object.entries(OVERRIDES).sort((a, b) => b[0].length - a[0].length)) {
    if (overrideKeyMatches(h, key)) {
      if (catalogNames.has(val)) return val
    }
  }

  if (h === 'филе' || (h.startsWith('филе ') && !h.includes('куриц'))) {
    const dn = norm(dishName)
    if (/минтай|треск|рыб|форел|судак|хек|кревет/.test(dn)) {
      return catalogNames.has('Минтай филе без кожи') ? 'Минтай филе без кожи' : null
    }
    return 'Филе грудки куриное сырое'
  }

  let best = ''
  let bestScore = 0
  for (const name of catalogNames) {
    const s = scoreMatch(h, name)
    if (s > bestScore) {
      bestScore = s
      best = name
    }
  }
  return bestScore >= 42 ? best : null
}

function cleanHint(h: string): string {
  return h
    .replace(/\s+(минимум|по желанию)$/iu, '')
    .replace(/\([^)]*\)/g, '')
    .trim()
}

function parseWeight(line: string): { grams: number | null; before: string } {
  let s = line.trim().replace(/^[-•*]\s*/, '')

  const leadMeasure = s.match(
    /^(\d+(?:[.,]\d+)?)\s*(?:[–—-]\s*(\d+(?:[.,]\d+)?)\s*)?(шт\.?|ч\.?\s*л\.?|ст\.?\s*л\.?)\s+(.+)/iu,
  )
  if (leadMeasure) {
    const a = Number(leadMeasure[1]!.replace(',', '.'))
    const b = leadMeasure[2] ? Number(leadMeasure[2].replace(',', '.')) : a
    const unit = leadMeasure[3]!.toLowerCase().replace(/\s+/g, '')
    let grams: number | null = null
    const avg = (a + b) / 2
    if (unit.startsWith('шт')) grams = Math.round(avg * 75)
    else if (unit.startsWith('ч')) grams = Math.round(avg * 5)
    else if (unit.startsWith('ст')) grams = Math.round(avg * 15)
    return { grams, before: cleanHint(leadMeasure[4]!) }
  }

  const rangeWeight = s.match(
    /(\d+(?:[.,]\d+)?)\s*[–—-]\s*(\d+(?:[.,]\d+)?)\s*(кг|kg|грамм(?:а|ов)?|гр|г|мл|ml)/iu,
  )
  if (rangeWeight && rangeWeight.index != null) {
    const a = Number(rangeWeight[1]!.replace(',', '.'))
    const b = Number(rangeWeight[2]!.replace(',', '.'))
    let grams = Math.round(((a + b) / 2) * 10) / 10
    const unit = rangeWeight[3]!.toLowerCase()
    if (unit === 'кг' || unit === 'kg') grams *= 1000
    const before = s.slice(0, rangeWeight.index).replace(/[-–—:]\s*$/u, '').trim()
    return { grams, before }
  }

  const weight = s.match(
    /(\d+(?:[.,]\d+)?)\s*(кг|kg|грамм(?:а|ов)?|гр|г|мл|ml)(?=\s|$|[^\p{L}])/iu,
  )
  if (weight && weight.index != null) {
    let grams = Number(weight[1]!.replace(',', '.'))
    const unit = weight[2]!.toLowerCase()
    if (unit === 'кг' || unit === 'kg') grams *= 1000
    const before = s.slice(0, weight.index).replace(/[-–—:]\s*$/u, '').trim()
    return { grams, before }
  }

  const rangeMeasure = s.match(
    /(\d+(?:[.,]\d+)?)\s*[–—-]\s*(\d+(?:[.,]\d+)?)\s*(шт\.?|ч\.?\s*л\.?|ст\.?\s*л\.?)/iu,
  )
  if (rangeMeasure && rangeMeasure.index != null) {
    const a = Number(rangeMeasure[1]!.replace(',', '.'))
    const b = Number(rangeMeasure[2]!.replace(',', '.'))
    const unit = rangeMeasure[3]!.toLowerCase().replace(/\s+/g, '')
    let grams: number | null = null
    const avg = (a + b) / 2
    if (unit.startsWith('шт')) grams = Math.round(avg * 75)
    else if (unit.startsWith('ч')) grams = Math.round(avg * 5)
    else if (unit.startsWith('ст')) grams = Math.round(avg * 15)
    const before = s.slice(0, rangeMeasure.index).replace(/[-–—:]\s*$/u, '').trim()
    return { grams, before }
  }

  const measure = s.match(
    /^(.*?)\s+(\d+(?:[.,]\d+)?)\s*(шт\.?|ч\.?\s*л\.?|ст\.?\s*л\.?)(?=\s|$|[^\p{L}(])/iu,
  )
  if (measure) {
    const before = measure[1]!.replace(/[-–—:]\s*$/u, '').trim()
    const n = Number(measure[2]!.replace(',', '.'))
    const unit = measure[3]!.toLowerCase().replace(/\s+/g, '')
    let grams: number | null = null
    if (unit.startsWith('шт')) grams = Math.round(n * 75)
    else if (unit.startsWith('ч')) grams = Math.round(n * 5)
    else if (unit.startsWith('ст')) grams = Math.round(n * 15)
    return { grams, before }
  }

  const kochan = s.match(/^(.*?)\s+1\s+кочан/i)
  if (kochan) {
    const inner = s.match(/~?\s*(\d+)\s*г/)
    return { grams: inner ? Number(inner[1]) : 900, before: kochan[1]!.trim() }
  }

  return { grams: null, before: s.replace(/\([^)]*\)/g, '').trim() }
}

function formatLine(product: string, grams: number | null): string {
  let g = grams
  if (g == null || g <= 0) {
    g = DEFAULT_GRAMS[product] ?? 2
  }
  if (g <= 5 && /масло/i.test(product)) {
    g = DEFAULT_GRAMS[product] ?? 15
  }
  const rounded = g >= 10 ? Math.round(g) : Math.round(g * 10) / 10
  return `${product} ${rounded} г`
}

function spiceLine(label: string): string {
  const cleaned = cleanHint(label)
  const key = norm(cleaned)
  for (const [k, name] of Object.entries(SPICE_LABELS)) {
    if (key === k || key.startsWith(k + ' ')) return formatLine(name, 2)
  }
  if (/^(соль|сахар|орегано|лавр|паприка|базилик)/.test(key)) {
    const word = cleaned.split(/\s+/)[0]!
    const name = SPICE_LABELS[norm(word)] ?? word.charAt(0).toUpperCase() + word.slice(1)
    return formatLine(name, 2)
  }
  return formatLine(cleaned.charAt(0).toUpperCase() + cleaned.slice(1), 2)
}

function isSpiceOnly(hint: string, grams: number | null): boolean {
  const n = norm(hint)
  if (grams != null && grams > 5) return false
  if (SPICE_LABELS[n]) return true
  if (/^(соль|орегано|лавр|базилик|сахар)(\s|$)/.test(n)) return true
  if (/^паприка(\s|$)/.test(n) && !/перец|болгар/.test(n)) return true
  return false
}

function splitList(text: string): string[] {
  return text
    .split(/[,;]/)
    .map((p) => p.trim())
    .filter(Boolean)
}

function alignPart(part: string, dishName: string): string[] {
  const line = part.trim()
  if (!line) return []
  if (/^(вода|бульон)\b/iu.test(line) || /(вода|бульон)\s+(\d|~)/iu.test(line)) return []

  const strippedCommas = line.replace(/\([^)]*\)/g, '').trim()
  if (!/\d/.test(strippedCommas) && strippedCommas.includes(',')) {
    return splitList(strippedCommas).flatMap((p) => alignPart(p, dishName))
  }

  const { grams, before } = parseWeight(line)
  let hint = cleanHint(
    before
      .replace(/^(щепотка|чуть|немного)\s+/i, '')
      .split(/\s+или\s+/i)[0]!
      .trim(),
  )

  const n = norm(hint)

  // spice-only (including «Соль минимум 2 г»)
  if (isSpiceOnly(hint, grams)) return [spiceLine(hint)]

  if (grams == null && hint.includes(',') && !/\d/.test(hint)) {
    return splitList(hint).flatMap((p) => alignPart(p, dishName))
  }

  const product = findProduct(hint, dishName)
  if (!product) {
    if (grams != null) return [formatLine(hint, grams)]
    if (SPICE_LABELS[n] || n.length <= 20) return [spiceLine(hint)]
    return []
  }
  return [formatLine(product, grams)]
}

function alignLine(raw: string, dishName: string): string[] {
  const line = raw.trim()
  if (!line) return []
  if (/^маринад при фасовке:/i.test(line)) return []
  if (/^жаркое\b/i.test(line)) return []
  return alignPart(line, dishName)
}

function alignIngredients(rawList: string[], dishName: string): string[] {
  const out: string[] = []
  for (const raw of rawList) {
    out.push(...alignLine(raw, dishName))
  }
  return out
}

function patchDishIngredients(content: string, id: string, ingLines: string): string | null {
  const escaped = id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const keyRe = new RegExp(`\\n  ${escaped}: \\{`)
  const match = keyRe.exec(content)
  if (!match) return null
  const start = match.index

  const ingKey = content.indexOf('ingredients:', start)
  if (ingKey < 0 || ingKey > start + 12000) return null

  const arrStart = content.indexOf('[', ingKey)
  const arrEnd = content.indexOf('],', arrStart)
  if (arrStart < 0 || arrEnd < 0) return null

  return `${content.slice(0, arrStart + 1)}\n${ingLines}\n      ${content.slice(arrEnd)}`
}

function patchFile(
  file: string,
  dishMap: Record<string, { name: string; recipe?: { ingredients?: string[]; steps?: string } }>,
) {
  let content = readFileSync(file, 'utf8').replace(/\r\n/g, '\n').replace(/\r/g, '\n')
  let patches = 0

  for (const [id, dish] of Object.entries(dishMap)) {
    if (!dish.recipe?.ingredients) continue
    const base =
      DISH_OVERRIDES[id] ?? alignIngredients(dish.recipe.ingredients, dish.name)
    const aligned = ensureFryOil(base, dish.recipe.steps ?? '')
    if (aligned.length === 0) continue

    const ingLines = aligned.map((s) => `        '${s.replace(/'/g, "\\'")}',`).join('\n')
    const next = patchDishIngredients(content, id, ingLines)
    if (!next) {
      console.warn(`skip ${id}: pattern not found in ${file}`)
      continue
    }
    content = next
    patches++
  }

  writeFileSync(file, content, 'utf8')
  console.log(`${file}: patched ${patches} dishes`)
}

const mainDishes = Object.fromEntries(
  Object.entries(dishes).filter(([id]) => !(id in extraDishes)),
) as typeof dishes

patchFile('src/data/dishes.ts', mainDishes)
patchFile('src/data/extraDishes.ts', extraDishes)

console.log('Done. Run: npm run export:dishes')
