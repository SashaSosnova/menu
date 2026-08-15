/**
 * Итог по порциям после двух дней готовки.
 * Ключ слота: «цикл|неделя|слот», например «2026-08|1|mon-tue».
 */

import { cycleId } from './calendar'

export type PortionOutcome = 'fast' | 'exact' | 'leftover'

export type DishStat = {
  outcome?: PortionOutcome
}

export type SlotStat = {
  dishes: Record<string, DishStat>
}

export type MealStatsStore = Record<string, SlotStat>

export const PORTION_OUTCOME_OPTIONS: { id: PortionOutcome; label: string }[] = [
  { id: 'fast', label: 'Не хватило' },
  { id: 'exact', label: 'Ровно' },
  { id: 'leftover', label: 'Осталось' },
]

export const MEAL_STATS_KEY = 'meal-stats-v1'

export function slotStatKey(
  week: number,
  slotId: string,
  cycle: string = cycleId(),
): string {
  return `${cycle}|${week}|${slotId}`
}

export function parseSlotStatKey(
  key: string,
): { cycle: string; week: number; slotId: string } | null {
  const parts = key.split('|')
  if (parts.length === 3) {
    return { cycle: parts[0]!, week: Number(parts[1]), slotId: parts[2]! }
  }
  if (parts.length === 2) {
    return { cycle: '', week: Number(parts[0]), slotId: parts[1]! }
  }
  return null
}

/** Старые ключи «1|mon-tue» → текущий цикл. Уже префиксированные не трогаем. */
export function migrateCycleKeys(
  store: MealStatsStore,
  cycle: string = cycleId(),
): MealStatsStore {
  const out: MealStatsStore = {}
  for (const [key, value] of Object.entries(store)) {
    const parsed = parseSlotStatKey(key)
    if (!parsed) continue
    const nextKey = parsed.cycle ? key : `${cycle}|${key}`
    if (!out[nextKey]) out[nextKey] = value
  }
  return out
}

export const seedStats: MealStatsStore = {}

type LegacyDishStat = {
  outcome?: PortionOutcome
  leftover?: 'none' | '1' | '2' | '3plus'
  note?: string
}

type LegacySlotStat = {
  note?: string
  dishes: Record<string, LegacyDishStat>
}

export function migrateDishStat(stat: LegacyDishStat | undefined): DishStat {
  if (!stat) return {}
  if (stat.outcome) return { outcome: stat.outcome }
  if (stat.leftover === 'none') return { outcome: 'exact' }
  if (stat.leftover) return { outcome: 'leftover' }
  return {}
}

export function migrateMealStats(raw: MealStatsStore | LegacySlotStat): MealStatsStore {
  const out: MealStatsStore = {}
  for (const [key, slot] of Object.entries(raw)) {
    const dishes: Record<string, DishStat> = {}
    for (const [dishId, stat] of Object.entries(slot?.dishes ?? {})) {
      dishes[dishId] = migrateDishStat(stat as LegacyDishStat)
    }
    out[key] = { dishes }
  }
  return migrateCycleKeys(out)
}

/** @deprecated Используйте useMenuSync */
export function loadMealStats(): MealStatsStore {
  try {
    const raw = localStorage.getItem(MEAL_STATS_KEY)
    if (!raw) return {}
    return migrateMealStats(JSON.parse(raw) as MealStatsStore)
  } catch {
    return {}
  }
}

/** @deprecated Используйте useMenuSync */
export function saveMealStats(_store: MealStatsStore): void {
  // no-op
}
