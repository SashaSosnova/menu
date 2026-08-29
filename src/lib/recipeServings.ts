import { dishBatchYieldG, dishCookPortions } from '../data/dishMeta'

const STANDARD_PORTIONS = 6

const DAY_ABBR = new Set(['пн', 'вт', 'ср', 'чт', 'пт', 'сб', 'вс'])

function parseGrams(s: string): number {
  return Number(s.replace(',', '.'))
}

function isScheduleSegment(segment: string): boolean {
  const s = segment.trim().toLowerCase()
  if (!s) return true
  if (DAY_ABBR.has(s)) return true
  if (/^нед\.?\s*\d/.test(s)) return true
  if (/\bнед\.?\s*\d/.test(s)) return true
  if (/^(?:пн|вт|ср|чт|пт|сб|вс)\s*[–-]\s*(?:пн|вт|ср|чт|пт|сб|вс)/.test(s)) return true
  if (/(?:пн|вт|ср|чт|пт|сб|вс)\s+нед\.?\s*\d/.test(s)) return true
  if (/(?:пн|вт|ср|чт|пт|сб|вс)[^·]*(?:ужин|обед)/.test(s)) return true
  if (/^на\s+(?:пн|вт|ср|чт|пт|сб|вс)\b/.test(s)) return true
  if (/^день в день$/.test(s)) return true
  return false
}

/** Убираем день недели, неделю меню и привязку к слоту готовки */
export function stripCookSchedule(text: string): string {
  return cleanRecipeServings(text)
}

/** Чистим поле servings в данных — без дней недели и недель меню */
export function cleanRecipeServings(text: string): string {
  return text
    .split('·')
    .map((part) => part.trim())
    .filter((part) => part && !isScheduleSegment(part))
    .join(' · ')
    .replace(/\s{2,}/g, ' ')
    .trim()
}

function round10(n: number): number {
  return Math.round(n / 10) * 10
}

function parseYieldFromServings(text: string): number | null {
  const kg = text.match(/(\d+(?:[,.]\d+)?)\s*кг/i)
  if (kg) return parseGrams(kg[1]) * 1000

  const cooked = text.match(/~?\s*(\d+(?:[,.]\d+)?)\s*г\s*(?:готов|готовой|готового)/i)
  if (cooked) return parseGrams(cooked[1])

  const raw = text.match(/~?\s*(\d+(?:[,.]\d+)?)\s*г\s*сыр/i)
  if (raw) return round10(parseGrams(raw[1]) * 0.85)

  const standalone = text.match(/(?:^|[·—–\-]\s*)~?\s*(\d+(?:[,.]\d+)?)\s*г(?:\s|[·]|$)/i)
  if (standalone) return parseGrams(standalone[1])

  return null
}

function portionWord(n: number): string {
  const n10 = n % 10
  const n100 = n % 100
  if (n10 === 1 && n100 !== 11) return 'порция'
  if (n10 >= 2 && n10 <= 4 && (n100 < 12 || n100 > 14)) return 'порции'
  return 'порций'
}

function parsePortionCount(text: string): number | null {
  if (/\d+\s*[–-]\s*\d+\s*порц/i.test(text)) return STANDARD_PORTIONS
  const m = text.match(/(\d+)\s*порц/i)
  if (!m) return null
  const n = Number(m[1])
  return n >= 1 && n <= 24 ? n : null
}

/** Порции и вес закладки: «6 порций — 1200 г». */
export function formatPortionYieldLine(
  dishId: string,
  servings: string,
  scale = 1,
): string {
  const raw = servings.trim()
  const parsedPortions = parsePortionCount(raw)
  const parsedG = parseYieldFromServings(raw)
  const plannedG = dishBatchYieldG(dishId)
  const portions = parsedPortions ?? (plannedG ? dishCookPortions(dishId) : STANDARD_PORTIONS)
  const grams = parsedG ?? plannedG
  const shownG = grams ? Math.round(grams * scale) : undefined

  if (shownG) return `${portions} ${portionWord(portions)} — ${shownG} г`
  if (parsedPortions) return `${portions} ${portionWord(portions)}`
  return stripCookSchedule(raw)
}
