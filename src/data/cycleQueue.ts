/**
 * Следующие блюда: давно не готовили — раньше, и только если пакет ещё в морозилке.
 */

import { dishQueueGroup, lastCookedOnForDishes, type CookBoard } from './cookBoard'
import { cycleIndexOf, cycleMains, menuRefIds, type MenuDishRef } from './menu'
import { dishHasFrozenPrep, type PrepFreezer } from './prep'
import type { MealStatsStore } from './mealStats'

export function entryHasFrozenPrep(
  freezer: PrepFreezer | undefined,
  item: MenuDishRef,
): boolean {
  return menuRefIds(item).some((id) => dishHasFrozenPrep(freezer, id))
}

/** Без даты — раньше всех; при равной дате — порядок цикла. */
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

function nextCookEntries(
  board: CookBoard,
  stats: MealStatsStore | undefined,
  freezer: PrepFreezer | undefined,
  count = 2,
): MenuDishRef[] {
  const todoWithPrep = cycleMains.filter((item) => {
    const group = dishQueueGroup(board, item.dishId, stats)
    return group === 'todo' && entryHasFrozenPrep(freezer, item)
  })
  const pool =
    todoWithPrep.length > 0
      ? todoWithPrep
      : cycleMains.filter(
          (item) =>
            dishQueueGroup(board, item.dishId, stats) !== 'cooking' &&
            entryHasFrozenPrep(freezer, item),
        )
  return [...pool]
    .sort((a, b) => compareByOldestCooked(a, b, board, stats))
    .slice(0, count)
}

export function nextCookDishIds(
  board: CookBoard,
  stats: MealStatsStore | undefined,
  freezer: PrepFreezer | undefined,
  count = 2,
): Set<string> {
  const ids = new Set<string>()
  for (const item of nextCookEntries(board, stats, freezer, count)) {
    for (const id of menuRefIds(item)) ids.add(id)
  }
  return ids
}
