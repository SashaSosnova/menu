/**
 * Пул горячего: фиксированный порядок из цикла.
 * Не готовили — как в списке; приготовленное уходит в конец.
 */

import { lastCookedOnForDishes, type CookBoard } from './cookBoard'
import { cycleIndexOf, cycleMains, menuRefIds, type MenuDishRef } from './menu'
import { dishHasFrozenPrep, type PrepFreezer } from './prep'
import type { MealStatsStore } from './mealStats'

export function entryHasFrozenPrep(
  freezer: PrepFreezer | undefined,
  item: MenuDishRef,
): boolean {
  return menuRefIds(item).some((id) => dishHasFrozenPrep(freezer, id))
}

/** Сначала без даты (порядок цикла), затем по дате готовки — свежие в конце. */
export function compareByOldestCooked(
  a: MenuDishRef,
  b: MenuDishRef,
  board: CookBoard,
  stats?: MealStatsStore,
): number {
  const ad = lastCookedOnForDishes(board, menuRefIds(a), stats) ?? ''
  const bd = lastCookedOnForDishes(board, menuRefIds(b), stats) ?? ''
  if (ad !== bd) return ad < bd ? -1 : 1
  const ai = cycleIndexOf(a.dishId)
  const bi = cycleIndexOf(b.dishId)
  return (ai < 0 ? 999 : ai) - (bi < 0 ? 999 : bi)
}

function isPlannedItem(board: CookBoard, item: MenuDishRef): boolean {
  const planned = new Set(board.plannedDishIds ?? [])
  return menuRefIds(item).some((id) => planned.has(id))
}

function nextCookEntries(
  board: CookBoard,
  stats: MealStatsStore | undefined,
  count = 2,
): MenuDishRef[] {
  return [...cycleMains]
    .filter((item) => !isPlannedItem(board, item))
    .sort((a, b) => compareByOldestCooked(a, b, board, stats))
    .slice(0, count)
}

export function nextCookDishIds(
  board: CookBoard,
  stats: MealStatsStore | undefined,
  _freezer?: PrepFreezer,
  count = 2,
): Set<string> {
  const ids = new Set<string>()
  for (const item of nextCookEntries(board, stats, count)) {
    for (const id of menuRefIds(item)) ids.add(id)
  }
  return ids
}
