import { scaleIngredientLine } from '../lib/portionScale'
import { getCookbookDish, getEffectiveRecipe, type CookbookStore } from './cookbook'
import type { CookBoard } from './cookBoard'
import { getDish } from './dishes'

export type ShopNeedLine = {
  key: string
  text: string
}

export function shopHaveKey(line: string): string {
  return line.toLowerCase().replace(/ё/g, 'е').replace(/\s+/g, ' ').trim()
}

export function plannedDishNames(board: CookBoard, cookbook: CookbookStore): string[] {
  const names: string[] = []
  for (const dishId of board.plannedDishIds ?? []) {
    const name =
      getCookbookDish(dishId, cookbook)?.name ?? getDish(dishId)?.name ?? dishId
    if (!names.includes(name)) names.push(name)
  }
  return names
}

/** Неотмеченные ингредиенты запланированных блюд. */
export function plannedShopNeeds(
  board: CookBoard,
  cookbook: CookbookStore,
  scales: Record<string, number> = {},
): ShopNeedLine[] {
  const have = board.shopHave ?? {}
  const seen = new Set<string>()
  const out: ShopNeedLine[] = []
  for (const dishId of board.plannedDishIds ?? []) {
    const recipe = getEffectiveRecipe(dishId, cookbook)
    const scale = scales[dishId] ?? 1
    for (const raw of recipe?.ingredients ?? []) {
      const text = scaleIngredientLine(raw, scale).trim()
      if (!text) continue
      const key = shopHaveKey(text)
      if (have[key] || seen.has(key)) continue
      seen.add(key)
      out.push({ key, text })
    }
  }
  return out
}
