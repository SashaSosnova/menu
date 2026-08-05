import type { Macros } from '../data/types'

export function formatMacros(macros: Macros): string {
  return `${macros.kcal}/${macros.protein}/${macros.fat}/${macros.carbs}`
}
