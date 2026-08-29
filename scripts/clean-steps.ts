/**
 * Clean recipe steps — cooking method only (no schedule, no plate portions).
 * Run: npm run clean:steps
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { dishes } from '../src/data/dishes.ts'
import { extraDishes } from '../src/data/extraDishes.ts'
import { cleanRecipeSteps, splitRecipeSteps } from '../src/lib/recipeSteps.ts'

const STEP_OVERRIDES: Record<string, string> = {}

function formatStepsHelper(text: string): string {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
  if (lines.length === 0) return `steps: '',`
  const body = lines
    .map((line) => `'${line.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}',`)
    .join('\n        ')
  return `steps: steps(\n        ${body}\n      ),`
}

function patchDishSteps(content: string, id: string, nextSteps: string): string | null {
  const keyRe = new RegExp(`\\n  ${id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}: \\{`)
  const match = keyRe.exec(content)
  if (!match) return null
  const start = match.index

  const stepsIdx = content.indexOf('steps:', start)
  if (stepsIdx < 0 || stepsIdx > start + 12000) return null

  const afterSteps = content.slice(stepsIdx + 6)
  const helper = afterSteps.match(/^\s*steps\(([\s\S]*?)\)\s*,/)
  const multiline = afterSteps.match(/^\s*\n\s*'((?:\\'|[^'])*)',/s)
  const inline = afterSteps.match(/^\s*'((?:\\'|[^'])*)',/s)

  const replacement = formatStepsHelper(nextSteps)
  const endMatch = helper ?? multiline ?? inline
  if (!endMatch) return null

  const endLen = endMatch[0].length
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
    const cleaned =
      STEP_OVERRIDES[id] ??
      splitRecipeSteps(raw)
        .map((line) => cleanRecipeSteps(line))
        .filter(Boolean)
        .join('\n')
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
