/**
 * Check which dishes fail planer-style gram parsing.
 * Run: npx tsx scripts/validate-import.ts
 */
import { dishes } from '../src/data/dishes.ts'
import { extraDishes } from '../src/data/extraDishes.ts'

function extractGrams(raw: string): number | null {
  const s = raw.trim()
  const weight = s.match(
    /(\d+(?:[.,]\d+)?)\s*(кг|kg|грамм(?:а|ов)?|гр|г|мл|ml)(?=\s|$|[^\p{L}])/iu,
  )
  if (weight) {
    let grams = Number(weight[1]!.replace(',', '.'))
    const unit = weight[2]!.toLowerCase()
    if (unit === 'кг' || unit === 'kg') grams *= 1000
    return grams > 0 ? grams : null
  }
  const measure = s.match(
    /^(.*?)\s+(\d+(?:[.,]\d+)?)\s*(шт\.?|ч\.?\s*л\.?|ст\.?\s*л\.?)(?=\s|$|[^\p{L}(])/iu,
  )
  if (measure) {
    const n = Number(measure[2]!.replace(',', '.'))
    const unit = measure[3]!.toLowerCase().replace(/\s+/g, '')
    if (unit.startsWith('шт')) return Math.round(n * 75)
    if (unit.startsWith('ч')) return Math.round(n * 5)
    if (unit.startsWith('ст')) return Math.round(n * 15)
  }
  return null
}

const all = { ...dishes, ...extraDishes }
const fail: string[] = []
const partial: { id: string; bad: string[] }[] = []

for (const [id, dish] of Object.entries(all)) {
  const ings = dish.recipe?.ingredients ?? []
  const withGrams = ings.filter((l) => extractGrams(l) != null)
  if (withGrams.length === 0) {
    fail.push(`${id}: ${ings.join(' | ')}`)
  } else if (withGrams.length < ings.length) {
    partial.push({
      id,
      bad: ings.filter((l) => extractGrams(l) == null),
    })
  }
}

console.log(`Total: ${Object.keys(all).length}`)
console.log(`Fail (no grams): ${fail.length}`)
fail.forEach((f) => console.log('  FAIL', f))
console.log(`Partial: ${partial.length}`)
partial.forEach((p) => console.log(`  PARTIAL ${p.id}:`, p.bad.join(' | ')))
