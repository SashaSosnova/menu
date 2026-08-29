/**
 * Итог по порциям после двух дней готовки.
 * Ключ слота: «цикл|неделя|слот», например «2026-08|1|mon-tue».
 */

import {
  cycleId,
  cycleStartFromId,
  getMonthStart,
  slotStartIso,
  type MenuSlotId,
} from './calendar'

export type PortionOutcome = 'fast' | 'exact' | 'leftover'

export type DishStat = {
  outcome?: PortionOutcome
}

export type SlotStat = {
  dishes: Record<string, DishStat>
}

export type MealStatsStore = Record<string, SlotStat>

export const MEAL_STATS_KEY = 'meal-stats-v1'

function parseSlotStatKey(
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

const SLOT_IDS: MenuSlotId[] = ['mon-tue', 'wed-thu', 'fri-sat']

function isSlotId(value: string): value is MenuSlotId {
  return SLOT_IDS.includes(value as MenuSlotId)
}

function slotIsoFromStatKey(key: string): string | undefined {
  const parsed = parseSlotStatKey(key)
  if (!parsed || !isSlotId(parsed.slotId)) return undefined
  const start = parsed.cycle ? cycleStartFromId(parsed.cycle) : getMonthStart()
  return slotStartIso(parsed.week, parsed.slotId, start)
}

export function lastOutcomeCookedOn(
  stats: MealStatsStore,
  dishId: string,
  cycle?: string,
): string | undefined {
  let latest: string | undefined
  for (const [key, slot] of Object.entries(stats)) {
    if (!slot.dishes[dishId]?.outcome) continue
    const parsed = parseSlotStatKey(key)
    if (!parsed) continue
    if (cycle && parsed.cycle && parsed.cycle !== cycle) continue
    const iso = slotIsoFromStatKey(key)
    if (iso && (!latest || iso > latest)) latest = iso
  }
  return latest
}

export function dishHasOutcomeThisCycle(
  stats: MealStatsStore,
  dishId: string,
  cycle: string,
): boolean {
  for (const [key, slot] of Object.entries(stats)) {
    if (!slot.dishes[dishId]?.outcome) continue
    const parsed = parseSlotStatKey(key)
    if (!parsed) continue
    if (parsed.cycle && parsed.cycle !== cycle) continue
    return true
  }
  return false
}

export function slotDishHasOutcome(
  stats: MealStatsStore | undefined,
  batchId: string,
  dishId: string,
): boolean {
  return Boolean(stats?.[batchId]?.dishes[dishId]?.outcome)
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
