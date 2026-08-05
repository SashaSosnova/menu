/**
 * Журнал остатков по слотам меню.
 * Копим факты → потом корректируем закладки.
 */

export type LeftoverLevel = 'none' | '1' | '2' | '3plus'

export type DishStat = {
  leftover?: LeftoverLevel
  note?: string
}

export type SlotStat = {
  note?: string
  dishes: Record<string, DishStat>
}

export type MealStatsStore = Record<string, SlotStat>

export const LEFTOVER_OPTIONS: { id: LeftoverLevel; label: string }[] = [
  { id: 'none', label: 'съели' },
  { id: '1', label: '~1' },
  { id: '2', label: '~2' },
  { id: '3plus', label: '~3+' },
]

export const MEAL_STATS_KEY = 'meal-stats-v1'

export function slotStatKey(week: number, slotId: string): string {
  return `${week}|${slotId}`
}

/** Стартовые факты пн–вт нед.1 — только если ключа ещё нет в storage */
export const seedStats: MealStatsStore = {
  [slotStatKey(1, 'mon-tue')]: {
    note: 'Гречка сухое 180 г · паста разово 200 г (норма пока 185)',
    dishes: {
      chicken_tomato_cream: { leftover: 'none' },
      buckwheat_veg: { leftover: 'none', note: 'сухое 180 г' },
      pasta: { leftover: 'none', note: 'сухое 200 г разово' },
      bolognese: {
        leftover: '2',
        note: 'ты/муж ~150 г, ребёнок не ел',
      },
    },
  },
}

export function loadMealStats(): MealStatsStore {
  try {
    const raw = localStorage.getItem(MEAL_STATS_KEY)
    if (!raw) {
      localStorage.setItem(MEAL_STATS_KEY, JSON.stringify(seedStats))
      return structuredClone(seedStats)
    }
    const parsed = JSON.parse(raw) as MealStatsStore
    // Подмешать seed только для отсутствующих слотов
    let changed = false
    const next = { ...parsed }
    for (const [key, value] of Object.entries(seedStats)) {
      if (!next[key]) {
        next[key] = structuredClone(value)
        changed = true
      }
    }
    if (changed) {
      localStorage.setItem(MEAL_STATS_KEY, JSON.stringify(next))
    }
    return next
  } catch {
    return structuredClone(seedStats)
  }
}

export function saveMealStats(store: MealStatsStore): void {
  localStorage.setItem(MEAL_STATS_KEY, JSON.stringify(store))
}
