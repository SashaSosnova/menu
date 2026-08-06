/**
 * Clean recipe servings — remove weekday scheduling, keep yield/time/notes.
 * Run: npm run clean:servings
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { dishes } from '../src/data/dishes.ts'
import { extraDishes } from '../src/data/extraDishes.ts'
import { cleanRecipeServings } from '../src/lib/recipeServings.ts'

const SERVINGS_OVERRIDES: Record<string, string> = {
  chicken_cutlets: '6 порций · ~35 мин',
  trout: '900 г · 2 семейных приёма · ~15 мин',
  trout_spinach: '6 порций · ~25 мин',
  pollock: '6 порций · ~35 мин',
}

function patchDishServings(content: string, id: string, servings: string): string | null {
  const keyRe = new RegExp(`\\n  ${id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}: \\{`)
  const match = keyRe.exec(content)
  if (!match) return null
  const start = match.index

  const fieldIdx = content.indexOf('servings:', start)
  if (fieldIdx < 0 || fieldIdx > start + 12000) return null

  const after = content.slice(fieldIdx + 9)
  const inline = after.match(/^\s*'((?:\\'|[^'])*)',/s)
  if (!inline) return null

  const escaped = servings.replace(/\\/g, '\\\\').replace(/'/g, "\\'")
  const replacement = `servings: '${escaped}',`
  return content.slice(0, fieldIdx) + replacement + content.slice(fieldIdx + 9 + inline[0].length)
}

function patchFile(
  file: string,
  dishMap: Record<string, { recipe?: { servings?: string } }>,
) {
  let content = readFileSync(file, 'utf8').replace(/\r\n/g, '\n').replace(/\r/g, '\n')
  let patches = 0

  for (const [id, dish] of Object.entries(dishMap)) {
    const raw = dish.recipe?.servings
    if (!raw) continue
    const cleaned = SERVINGS_OVERRIDES[id] ?? cleanRecipeServings(raw)
    if (cleaned === raw) continue
    const next = patchDishServings(content, id, cleaned)
    if (!next) {
      console.warn(`skip ${id}`)
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
)

patchFile('src/data/dishes.ts', mainDishes)
patchFile('src/data/extraDishes.ts', extraDishes)

console.log('Done.')
