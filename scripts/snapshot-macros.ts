import { writeFileSync } from 'node:fs'
import { dishes } from '../src/data/dishes.ts'

const out: {
  version: 1
  exportedAt: string
  dishes: Record<string, { name: string; kcal: number; protein: number; fat: number; carbs: number }>
} = {
  version: 1,
  exportedAt: new Date().toISOString(),
  dishes: {},
}

for (const dish of Object.values(dishes)) {
  if (!dish.macros) continue
  out.dishes[dish.id] = { name: dish.name, ...dish.macros }
}

writeFileSync('public/dishes-macros.json', `${JSON.stringify(out, null, 2)}\n`, 'utf8')
console.log(`Snapshot: ${Object.keys(out.dishes).length} dishes with macros`)
