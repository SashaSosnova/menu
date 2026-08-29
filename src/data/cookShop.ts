import { parseIngredientAmount, scaleIngredientLine } from '../lib/portionScale'
import { getCookbookDish, getEffectiveRecipe, type CookbookStore } from './cookbook'
import type { CookBoard } from './cookBoard'
import { getDish } from './dishes'
import { prepPackCoversIngredient } from './prep'

export type ShopNeedLine = {
  key: string
  text: string
  have: boolean
}

export function shopHaveKey(line: string): string {
  return line.toLowerCase().replace(/ё/g, 'е').replace(/\s+/g, ' ').trim()
}

export function shopProductKey(name: string): string {
  return name.toLowerCase().replace(/ё/g, 'е').replace(/\s+/g, ' ').trim()
}

/** Выбранное горячее плюс гарниры к нему. */
export function plannedShopDishIds(board: CookBoard): string[] {
  const ids: string[] = []
  const seen = new Set<string>()
  for (const mainId of board.plannedDishIds ?? []) {
    if (!seen.has(mainId)) {
      seen.add(mainId)
      ids.push(mainId)
    }
    const sideId = board.plannedSideByMain?.[mainId]
    if (typeof sideId === 'string' && !seen.has(sideId)) {
      seen.add(sideId)
      ids.push(sideId)
    }
  }
  return ids
}

export function plannedDishNames(board: CookBoard, cookbook: CookbookStore): string[] {
  const names: string[] = []
  for (const dishId of plannedShopDishIds(board)) {
    const name =
      getCookbookDish(dishId, cookbook)?.name ?? getDish(dishId)?.name ?? dishId
    if (!names.includes(name)) names.push(name)
  }
  return names
}

function formatShopQty(n: number): string {
  if (n >= 50) return String(Math.round(n / 5) * 5)
  if (Number.isInteger(n)) return String(n)
  const r = Math.round(n * 10) / 10
  return Number.isInteger(r) ? String(r) : String(r).replace('.', ',')
}

function lineHave(have: Record<string, true>, productKey: string, fullKey: string): boolean {
  return Boolean(have[productKey] || have[fullKey])
}

/** Неотмеченные и отмеченные ингредиенты блюд, слитые по продукту. */
export function shopNeedsForDishIds(
  board: CookBoard,
  cookbook: CookbookStore,
  dishIds: string[],
  scales: Record<string, number> = {},
): ShopNeedLine[] {
  const have = board.shopHave ?? {}
  const merged = new Map<
    string,
    { name: string; qty: number | null; unit: string; texts: string[] }
  >()

  for (const dishId of dishIds) {
    const recipe = getEffectiveRecipe(dishId, cookbook)
    const scale = scales[dishId] ?? 1
    for (const raw of recipe?.ingredients ?? []) {
      const text = scaleIngredientLine(raw, scale).trim()
      if (!text) continue
      if (prepPackCoversIngredient(dishId, text)) continue
      const parsed = parseIngredientAmount(text)
      const key = shopProductKey(parsed.name || text)
      if (!key) continue
      const prev = merged.get(key)
      if (!prev) {
        merged.set(key, {
          name: parsed.name || text,
          qty: parsed.qty,
          unit: parsed.unit,
          texts: [text],
        })
        continue
      }
      prev.texts.push(text)
      if (parsed.qty != null && prev.qty != null && parsed.unit === prev.unit) {
        prev.qty += parsed.qty
      } else if (parsed.qty != null && prev.qty == null) {
        prev.qty = parsed.qty
        prev.unit = parsed.unit
      }
    }
  }

  const out: ShopNeedLine[] = []
  for (const [key, item] of merged) {
    const text =
      item.qty != null && item.unit
        ? `${item.name} ${formatShopQty(item.qty)} ${item.unit}`
        : item.texts[0]!
    out.push({
      key,
      text,
      have: item.texts.some((t) => lineHave(have, key, shopHaveKey(t))) || Boolean(have[key]),
    })
  }
  return out
}

/** Ингредиенты запланированных блюд и гарниров. */
export function plannedShopNeeds(
  board: CookBoard,
  cookbook: CookbookStore,
  scales: Record<string, number> = {},
): ShopNeedLine[] {
  return shopNeedsForDishIds(board, cookbook, plannedShopDishIds(board), scales)
}
