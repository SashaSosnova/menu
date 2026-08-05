import bundle from '../../public/dishes-macros.json'
import type { Macros } from './types'

type DishMacrosEntry = Macros & { name: string }

type DishMacrosBundle = {
  version?: number
  exportedAt?: string
  dishes?: Record<string, DishMacrosEntry>
}

const data = bundle as DishMacrosBundle
const byId = data.dishes ?? {}

/** КБЖУ на 100 г — из planer (dishes-macros.json), не из исходников рецептов. */
export function getDishMacros(id: string): Macros | undefined {
  const entry = byId[id]
  if (!entry) return undefined
  return {
    kcal: entry.kcal,
    protein: entry.protein,
    fat: entry.fat,
    carbs: entry.carbs,
  }
}

export function dishMacrosExportedAt(): string | undefined {
  return data.exportedAt
}
