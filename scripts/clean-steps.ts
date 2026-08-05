/**
 * Clean recipe steps — cooking method only (no schedule, no plate portions).
 * Run: npm run clean:steps
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { dishes } from '../src/data/dishes.ts'
import { extraDishes } from '../src/data/extraDishes.ts'
import { cleanRecipeSteps } from '../src/lib/recipeSteps.ts'

const STEP_OVERRIDES: Record<string, string> = {
  pineapple_chicken:
    'Курицу кубиками обжарить с луком 6–7 мин. Перец и чеснок 3 мин. Ананас, соевый соус, мёд, 50 мл сока из банки — 5 мин. Рис варить отдельно. Без острого.',
  salad_pickles: 'Подать как есть.',
  salad_carrot_korean: 'Покупная — по желанию.',
}

function patchDishSteps(content: string, id: string, steps: string): string | null {
  const keyRe = new RegExp(`\\n  ${id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}: \\{`)
  const match = keyRe.exec(content)
  if (!match) return null
  const start = match.index

  const stepsIdx = content.indexOf('steps:', start)
  if (stepsIdx < 0 || stepsIdx > start + 12000) return null

  const afterSteps = content.slice(stepsIdx + 6)
  const multiline = afterSteps.match(/^\s*\n\s*'((?:\\'|[^'])*)',/s)
  const inline = afterSteps.match(/^\s*'((?:\\'|[^'])*)',/s)

  const escaped = steps.replace(/\\/g, '\\\\').replace(/'/g, "\\'")
  const replacement = multiline
    ? `steps:\n        '${escaped}',`
    : inline
      ? `steps: '${escaped}',`
      : null

  if (!replacement) return null

  const endMatch = multiline ?? inline
  const endLen = endMatch![0].length
  return content.slice(0, stepsIdx) + replacement + content.slice(stepsIdx + 6 + endLen)
}

function patchFile(
  file: string,
  dishMap: Record<string, { recipe?: { steps?: string } }>,
) {
  let content = readFileSync(file, 'utf8').replace(/\r\n/g, '\n').replace(/\r/g, '\n')
  let patches = 0

  for (const [id, dish] of Object.entries(dishMap)) {
    const raw = dish.recipe?.steps
    if (!raw) continue
    const cleaned = STEP_OVERRIDES[id] ?? cleanRecipeSteps(raw)
    const next = patchDishSteps(content, id, cleaned)
    if (!next) {
      console.warn(`skip ${id}`)
      continue
    }
    if (next === content) continue
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
