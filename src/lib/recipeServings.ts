import { getDish } from '../data/dishes'
import { familyMeal } from '../data/portions'

const STANDARD_PORTIONS = 6
const FAMILY_MEALS = STANDARD_PORTIONS / 3

const DAY_ABBR = new Set(['пн', 'вт', 'ср', 'чт', 'пт', 'сб', 'вс'])

function parseGrams(s: string): number {
  return Number(s.replace(',', '.'))
}

function isDateSegment(segment: string): boolean {
  const s = segment.trim().toLowerCase()
  if (!s) return true
  if (DAY_ABBR.has(s)) return true
  if (/^нед\.?\s*\d+/i.test(s)) return true
  if (/^(?:пн|вт|ср|чт|пт|сб|вс)\s*[–-]\s*(?:пн|вт|ср|чт|пт|сб|вс)$/i.test(s)) return true
  if (/^(?:пн|вт|ср|чт|пт|сб|вс)\s*ужин/i.test(s)) return true
  if (/^на\s+(?:пн|вт|ср|чт|пт|сб|вс)/i.test(s)) return true
  if (/^день в день$/i.test(s)) return true
  if (/^к рыбе$/i.test(s)) return true
  return false
}

function isPortionSegment(segment: string): boolean {
  return /\d+\s*(?:[–-]\s*\d+\s*)?порц/i.test(segment.trim())
}

/** Убираем день недели, неделю меню и привязку к слоту готовки */
export function stripCookSchedule(text: string): string {
  return text
    .split('·')
    .map((part) => part.trim())
    .filter((part) => part && !isDateSegment(part))
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

  const standalone = text.match(/(?:^|[·]\s*)(\d+(?:[,.]\d+)?)\s*г(?:\s|[·]|$)/i)
  if (standalone) return parseGrams(standalone[1])

  return null
}

function parsePlateTriple(text: string): number | null {
  const slash = text.match(/(\d+)\s*[\/·]\s*(\d+)\s*[\/·]\s*(\d+)\s*г/i)
  if (slash) return Number(slash[1]) + Number(slash[2]) + Number(slash[3])

  const named = text.match(
    /ты\s*~?\s*(\d+)\s*г[^]*?муж\s*~?\s*(\d+)\s*г[^]*?реб[^\d]*~?\s*(\d+)\s*г/i,
  )
  if (named) return Number(named[1]) + Number(named[2]) + Number(named[3])

  return null
}

function parseYieldFromSteps(steps: string): number | null {
  const perMeal = parsePlateTriple(steps)
  if (perMeal) return round10(perMeal * FAMILY_MEALS)

  const batch = steps.match(/(\d+(?:[,.]\d+)?)\s*г\s*на\s/i)
  if (batch) return parseGrams(batch[1])

  return null
}

function parseDryGrainYield(ingredients: string[]): number | null {
  for (const line of ingredients) {
    const m = line.match(/(\d+(?:[,.]\d+)?)\s*г\s*сух/i)
    if (!m) continue
    if (/2\s*семейн/i.test(line)) return familyMeal.sideCookedG * 2
    if (/1\s*семейн/i.test(line)) return familyMeal.sideCookedG
    return round10(parseGrams(m[1]) * 2.5)
  }
  return null
}

function sumIngredientYield(ingredients: string[]): number {
  let total = 0

  for (const line of ingredients) {
    const lower = line.toLowerCase()
    if (/чеснок|специ|соль|перец молот|лавров|орегано|сахар|укроп|зуб|ст\.л|ч\.л|мл/.test(lower)) {
      if (!/\d+\s*г/.test(line)) continue
    }

    const rangeG = line.match(/(\d+(?:[,.]\d+)?)\s*[–-]\s*(\d+(?:[,.]\d+)?)\s*г/i)
    if (rangeG) {
      total += (parseGrams(rangeG[1]) + parseGrams(rangeG[2])) / 2
      continue
    }

    const dry = line.match(/(\d+(?:[,.]\d+)?)\s*г\s*сух/i)
    if (dry) {
      total += parseGrams(dry[1]) * 2.5
      continue
    }

    const grams = line.match(/(\d+(?:[,.]\d+)?)\s*г/i)
    if (grams) {
      total += parseGrams(grams[1])
    }
  }

  if (total <= 0) return 0
  return round10(total * 0.9)
}

function estimateTotalYieldGrams(
  servings: string,
  ingredients: string[],
  steps: string,
): number | null {
  const cookedFromServings = servings.match(/~?\s*(\d+(?:[,.]\d+)?)\s*г\s*(?:готов|готовой|готового)/i)
  if (cookedFromServings) return parseGrams(cookedFromServings[1])

  const fromSteps = parseYieldFromSteps(steps)
  if (fromSteps) return fromSteps

  const fromServings = parseYieldFromServings(servings)
  if (fromServings) return fromServings

  const fromDry = parseDryGrainYield(ingredients)
  if (fromDry) return fromDry

  const fromIngredients = sumIngredientYield(ingredients)
  if (fromIngredients >= 400) return fromIngredients

  return null
}

function formatCookTime(text: string): string | null {
  const m = text.match(/~?\s*(\d+(?:[,.]\d+)?)\s*(мин(?:ут)?|ч(?:ас(?:а)?)?)/i)
  if (!m) return null

  const value = parseGrams(m[1])
  const unit = m[2].toLowerCase()

  if (unit.startsWith('ч')) {
    const valueStr = Number.isInteger(value) ? String(value) : String(value).replace('.', ',')
    const int = Math.floor(value)
    const hasFraction = value % 1 !== 0
    let label: string
    if (hasFraction) label = 'часа'
    else if (int % 10 === 1 && int % 100 !== 11) label = 'час'
    else if ([2, 3, 4].includes(int % 10) && ![12, 13, 14].includes(int % 100)) label = 'часа'
    else label = 'часов'
    return `Время готовки = ${valueStr} ${label}`
  }

  const mins = Math.round(value)
  let label: string
  if (mins % 10 === 1 && mins % 100 !== 11) label = 'минута'
  else if ([2, 3, 4].includes(mins % 10) && ![12, 13, 14].includes(mins % 100)) label = 'минуты'
  else label = 'минут'
  return `Время готовки = ${mins} ${label}`
}

function buildGramLine(totalG: number): string {
  const per = round10(totalG / STANDARD_PORTIONS)
  return `${per} г × ${STANDARD_PORTIONS} порций`
}

function meaningfulNotes(raw: string): string {
  return raw
    .split('·')
    .map((part) => part.trim())
    .filter((part) => {
      if (!part || isDateSegment(part)) return false
      if (isPortionSegment(part)) return false
      if (/~?\d+[,.]?\d*\s*(?:мин(?:ут)?|ч(?:ас(?:а)?)?)/i.test(part)) return false
      if (/~?\d+(?:[,.]\d+)?\s*г/i.test(part)) return false
      if (/\d+(?:[,.]\d+)?\s*кг/i.test(part)) return false
      return true
    })
    .join(' · ')
}

/** Порции + граммы + время без дат готовки (всегда расчёт на 6 порций) */
export function formatServingsDisplay(dishId: string, servings: string): string {
  const raw = servings.trim()
  if (!raw) return ''

  const dish = getDish(dishId)
  const ingredients = dish?.recipe?.ingredients ?? []
  const steps = dish?.recipe?.steps ?? ''

  const totalG = estimateTotalYieldGrams(raw, ingredients, steps)
  const time = formatCookTime(raw)
  const notes = meaningfulNotes(raw)

  const parts: string[] = []
  if (totalG) parts.push(buildGramLine(totalG))
  else parts.push(stripCookSchedule(raw))
  if (notes) parts.push(notes)
  if (time) parts.push(time)

  return parts.filter(Boolean).join(' · ')
}
