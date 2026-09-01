/**
 * Очередь горячего и рекомендуемый план готовки.
 * Каталог сортируется по давности; план — по заготовке, давности и разнообразию белков.
 */

import { isoDate, dateFromIso } from './calendar'
import { lastCookedOnForDishes, type CookBoard } from './cookBoard'
import { dishMeta } from './dishMeta'
import { cycleIndexOf, cycleMains, menuRefIds, type MenuDishRef } from './menu'
import { dishHasFrozenPrep, type PrepFreezer } from './prep'
import type { MealStatsStore } from './mealStats'
import type { ProteinType } from './types'

const MS_DAY = 24 * 60 * 60 * 1000
const WEEK_DAYS = 7
const COOK_PAIR = 2

type ProteinFamily = 'beef' | 'chicken' | 'seafood' | 'veg'

type RecommendContext = {
  board: CookBoard
  stats: MealStatsStore | undefined
  freezer: PrepFreezer | undefined
  todayIso: string
  lastFamilies: ProteinFamily[]
  weekFamilyCounts: Partial<Record<ProteinFamily, number>>
  fridgeFamilies: Set<ProteinFamily>
  pickedFamilies: Set<ProteinFamily>
  needSeafood: boolean
}

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

function plannedCycleEntries(board: CookBoard): MenuDishRef[] {
  return cycleMains.filter((item) => isPlannedItem(board, item))
}

function daysSince(iso: string, todayIso: string): number {
  return Math.round((dateFromIso(todayIso).getTime() - dateFromIso(iso).getTime()) / MS_DAY)
}

function entryProtein(item: MenuDishRef): ProteinType | undefined {
  for (const id of menuRefIds(item)) {
    const protein = dishMeta[id]?.protein
    if (protein) return protein
  }
  return undefined
}

function proteinFamily(protein: ProteinType | undefined): ProteinFamily | undefined {
  if (!protein) return undefined
  if (protein === 'fish' || protein === 'shrimp') return 'seafood'
  if (protein === 'veg') return 'veg'
  return protein
}

function entryFamily(item: MenuDishRef): ProteinFamily | undefined {
  return proteinFamily(entryProtein(item))
}

function familyOfDishId(dishId: string): ProteinFamily | undefined {
  return proteinFamily(dishMeta[dishId]?.protein)
}

function isMainLeftover(dishId: string): boolean {
  const kind = dishMeta[dishId]?.kind
  return kind !== 'side' && kind !== 'extra'
}

function fridgeDishIds(board: CookBoard): Set<string> {
  const ids = new Set<string>()
  for (const dish of board.fridge) {
    if (dish.remaining > 0) ids.add(dish.dishId)
  }
  return ids
}

function isInFridge(board: CookBoard, item: MenuDishRef): boolean {
  const fridge = fridgeDishIds(board)
  return menuRefIds(item).some((id) => fridge.has(id))
}

function fridgeFamiliesOf(board: CookBoard): Set<ProteinFamily> {
  const families = new Set<ProteinFamily>()
  for (const dish of board.fridge) {
    if (dish.remaining <= 0 || !isMainLeftover(dish.dishId)) continue
    const family = familyOfDishId(dish.dishId)
    if (family) families.add(family)
  }
  return families
}

type CookEvent = { date: string; family: ProteinFamily }

function mainCookHistory(board: CookBoard, stats: MealStatsStore | undefined): CookEvent[] {
  const events: CookEvent[] = []
  for (const item of cycleMains) {
    const date = lastCookedOnForDishes(board, menuRefIds(item), stats)
    const family = entryFamily(item)
    if (!date || !family) continue
    events.push({ date, family })
  }
  events.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0))
  return events
}

function cycleIndex(item: MenuDishRef): number {
  const index = cycleIndexOf(item.dishId)
  return index < 0 ? 999 : index
}

function scoreEntry(item: MenuDishRef, ctx: RecommendContext): number {
  const protein = entryProtein(item)
  const family = proteinFamily(protein)
  const cookedOn = lastCookedOnForDishes(ctx.board, menuRefIds(item), ctx.stats)
  const days = cookedOn ? daysSince(cookedOn, ctx.todayIso) : null

  let score = 0
  if (entryHasFrozenPrep(ctx.freezer, item)) score += 400
  score += days === null ? 500 : Math.min(Math.max(days, 0), 180)

  if (family && ctx.pickedFamilies.has(family)) score -= 700
  if (family && ctx.lastFamilies[0] === family) score -= 160
  if (family && ctx.lastFamilies[0] === family && ctx.lastFamilies[1] === family) score -= 120
  if (family && ctx.fridgeFamilies.has(family)) score -= 110
  if (family) score -= (ctx.weekFamilyCounts[family] ?? 0) * 45
  if (ctx.needSeafood && family === 'seafood') {
    score += 180
    if (protein === 'fish') score += 40
  }
  return score
}

function pickBest(candidates: MenuDishRef[], ctx: RecommendContext): MenuDishRef | undefined {
  let best: MenuDishRef | undefined
  let bestScore = -Infinity
  let bestIndex = 999
  for (const item of candidates) {
    const score = scoreEntry(item, ctx)
    const index = cycleIndex(item)
    if (
      !best ||
      score > bestScore ||
      (score === bestScore && index < bestIndex)
    ) {
      best = item
      bestScore = score
      bestIndex = index
    }
  }
  return best
}

/**
 * Два ближайших блюда: есть заготовка, давно не готовили,
 * и белок не повторяет недавнее меню (говядина/курица подряд, рыба на неделе).
 * Уже запланированные не предлагаем — добиваем пару до двух.
 */
export function recommendCookPlan(
  board: CookBoard,
  stats: MealStatsStore | undefined,
  freezer?: PrepFreezer,
  count = COOK_PAIR,
  todayIso = isoDate(),
): MenuDishRef[] {
  const planned = plannedCycleEntries(board)
  const want = Math.max(0, count - planned.length)
  if (want === 0) return []

  const candidates = cycleMains.filter(
    (item) => !isPlannedItem(board, item) && !isInFridge(board, item),
  )
  const history = mainCookHistory(board, stats)
  const lastFamilies = history.slice(0, 3).map((event) => event.family)
  const weekFamilyCounts: Partial<Record<ProteinFamily, number>> = {}
  for (const event of history) {
    if (daysSince(event.date, todayIso) > WEEK_DAYS) continue
    weekFamilyCounts[event.family] = (weekFamilyCounts[event.family] ?? 0) + 1
  }
  const fridgeFamilies = fridgeFamiliesOf(board)
  const pickedFamilies = new Set<ProteinFamily>()
  for (const item of planned) {
    const family = entryFamily(item)
    if (family) pickedFamilies.add(family)
  }

  const remaining = [...candidates]
  const picked: MenuDishRef[] = []
  while (picked.length < want && remaining.length > 0) {
    const needSeafood =
      (weekFamilyCounts.seafood ?? 0) === 0 &&
      !fridgeFamilies.has('seafood') &&
      !pickedFamilies.has('seafood')
    const best = pickBest(remaining, {
      board,
      stats,
      freezer,
      todayIso,
      lastFamilies,
      weekFamilyCounts,
      fridgeFamilies,
      pickedFamilies,
      needSeafood,
    })
    if (!best) break
    picked.push(best)
    remaining.splice(remaining.indexOf(best), 1)
    const family = entryFamily(best)
    if (family) pickedFamilies.add(family)
  }
  return picked
}

/** Блюда ближайшей готовки: план пользователя, иначе рекомендуемая пара. */
export function nextCookDishIds(
  board: CookBoard,
  stats: MealStatsStore | undefined,
  freezer?: PrepFreezer,
  count = COOK_PAIR,
): Set<string> {
  const ids = new Set<string>()
  for (const item of plannedCycleEntries(board)) {
    for (const id of menuRefIds(item)) ids.add(id)
  }
  for (const item of recommendCookPlan(board, stats, freezer, count)) {
    for (const id of menuRefIds(item)) ids.add(id)
  }
  return ids
}
