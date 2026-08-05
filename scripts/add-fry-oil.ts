/**
 * Add Масло растительное 20 г to recipes that need pan frying.
 * Run: npm run add:fry-oil
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { dishes } from '../src/data/dishes.ts'
import { extraDishes } from '../src/data/extraDishes.ts'
import { ensureFryOil } from '../src/lib/recipeFryOil.ts'

function patchDishIngredients(
  content: string,
  id: string,
  ingredients: string[],
): string | null {
  const keyRe = new RegExp(`\\n  ${id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}: \\{`)
  const match = keyRe.exec(content)
  if (!match) return null
  const start = match.index

  const fieldIdx = content.indexOf('ingredients:', start)
  if (fieldIdx < 0 || fieldIdx > start + 15000) return null

  const after = content.slice(fieldIdx + 12)
  const blockMatch = after.match(/^\s*\[([\s\S]*?)\n\s*\],/m)
  if (!blockMatch) return null

  const lines = ingredients.map((line) => {
    const escaped = line.replace(/\\/g, '\\\\').replace(/'/g, "\\'")
    return `        '${escaped}',`
  })

  const replacement = `ingredients: [\n${lines.join('\n')}\n      ],`
  const endLen = blockMatch[0].length
  return content.slice(0, fieldIdx) + replacement + content.slice(fieldIdx + 12 + endLen)
}

function patchFile(
  file: string,
  dishMap: Record<string, { recipe?: { ingredients?: string[]; steps?: string } }>,
) {
  let content = readFileSync(file, 'utf8').replace(/\r\n/g, '\n').replace(/\r/g, '\n')
  let patches = 0

  for (const [id, dish] of Object.entries(dishMap)) {
    const raw = dish.recipe?.ingredients
    const steps = dish.recipe?.steps ?? ''
    if (!raw?.length || !steps) continue

    const nextIng = ensureFryOil(raw, steps)
    if (nextIng.join('\n') === raw.join('\n')) continue

    const next = patchDishIngredients(content, id, nextIng)
    if (!next) {
      console.warn(`skip ${id}`)
      continue
    }
    content = next
    patches++
    console.log(`  ${id}`)
  }

  writeFileSync(file, content, 'utf8')
  console.log(`${file}: patched ${patches} dishes`)
}

const mainDishes = Object.fromEntries(
  Object.entries(dishes).filter(([id]) => !(id in extraDishes)),
)

console.log('dishes.ts:')
patchFile('src/data/dishes.ts', mainDishes)
console.log('extraDishes.ts:')
patchFile('src/data/extraDishes.ts', extraDishes)

console.log('Done.')
