import { writeFileSync } from 'node:fs'
import { dishes } from '../src/data/dishes.ts'
import { withPrepPackStep } from '../src/lib/recipeSteps.ts'

/** Keep in sync with planer `MENU_SYNC_SKIP_IDS`. */
const EXPORT_SKIP_DISH_IDS = new Set([
  'leftovers_cutlets',
  'leftovers_roast',
  'leftovers_baked_chicken',
  'leftovers_wings',
  'leftovers_fish',
  'leftovers_thighs',
  'salad_carrot_korean',
])

const list = Object.values(dishes)
  .filter((d) => d.recipe && d.recipe.ingredients.length > 0)
  .filter((d) => !EXPORT_SKIP_DISH_IDS.has(d.id))
  .map((d) => ({
    id: d.id,
    name: d.name,
    ingredients: d.recipe!.ingredients,
    ...(d.recipe!.steps.trim()
      ? { steps: withPrepPackStep(d.id, d.recipe!.steps.trim()) }
      : {}),
    ...(d.recipe!.servings.trim() ? { servings: d.recipe!.servings.trim() } : {}),
    ...(d.recipe!.storage?.trim() ? { storage: d.recipe!.storage.trim() } : {}),
    ...(d.recipe!.weeks?.length ? { weeks: d.recipe!.weeks } : {}),
  }))
  .sort((a, b) => a.name.localeCompare(b.name, 'ru'))

const payload = {
  version: 1,
  exportedAt: new Date().toISOString(),
  dishes: list,
}

writeFileSync('public/dishes.json', `${JSON.stringify(payload, null, 2)}\n`, 'utf8')
console.log(`Exported ${list.length} dishes → public/dishes.json`)
