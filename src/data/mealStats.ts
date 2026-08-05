/**
 * Итог по порциям после двух дней готовки.
 */

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

export function slotStatKey(week: number, slotId: string): string {
  return `${week}|${slotId}`
}

export const seedStats: MealStatsStore = {
  [slotStatKey(1, 'mon-tue')]: {
    dishes: {
      chicken_tomato_cream: { outcome: 'exact' },
      buckwheat_veg: { outcome: 'exact' },
      pasta: { outcome: 'exact' },
      bolognese: { outcome: 'leftover' },
    },
  },
}

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
  return out
}

/** @deprecated Используйте useMenuSync */
export function loadMealStats(): MealStatsStore {
  try {
    const raw = localStorage.getItem(MEAL_STATS_KEY)
    if (!raw) return structuredClone(seedStats)
    const parsed = migrateMealStats(JSON.parse(raw) as MealStatsStore)
    const next = { ...parsed }
    for (const [key, value] of Object.entries(seedStats)) {
      if (!next[key]) next[key] = structuredClone(value)
    }
    return next
  } catch {
    return structuredClone(seedStats)
  }
}

/** @deprecated Используйте useMenuSync */
export function saveMealStats(_store: MealStatsStore): void {
  // no-op
}
