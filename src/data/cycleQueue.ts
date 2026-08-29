/**
 * Следующие блюда цикла: сначала по порядку, и только если пакет ещё в морозилке.
 */

import { dishQueueGroup, type CookBoard } from './cookBoard'
import { cycleMains, menuRefIds, type MenuDishRef } from './menu'
import { dishHasFrozenPrep, type PrepFreezer } from './prep'
import type { MealStatsStore } from './mealStats'

export function entryHasFrozenPrep(
  freezer: PrepFreezer | undefined,
  item: MenuDishRef,
): boolean {
  return menuRefIds(item).some((id) => dishHasFrozenPrep(freezer, id))
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
  return pool.slice(0, count)
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
