/**
 * Очередь горячего и рекомендуемый план готовки.
 * Каталог — по давности; план — разные белки, рыба в чт/пт, заготовка, давность.
 */

import { addDays, isoDate, dateFromIso } from './calendar'
import { lastCookedOnForDishes, takenSideIds, type CookBoard } from './cookBoard'
import { builtInSideIds, dishMeta, matchingSideIds } from './dishMeta'
import { cycleIndexOf, cycleMains, cycleSides, menuRefIds, type MenuDishRef } from './menu'
import { dishHasFrozenPrep, type PrepFreezer } from './prep'
import type { MealStatsStore } from './mealStats'
import type { ProteinType } from './types'

const MS_DAY = 24 * 60 * 60 * 1000
const COOK_PAIR = 2
const NEVER_COOKED_DAYS = 10_000

type ProteinFamily = 'beef' | 'chicken' | 'seafood' | 'veg'

type RecommendContext = {
  board: CookBoard
  stats: MealStatsStore | undefined
  freezer: PrepFreezer | undefined
  todayIso: string
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

function mondayOfWeek(todayIso: string): string {
  const today = dateFromIso(todayIso)
  const day = today.getDay()
  const back = day === 0 ? 6 : day - 1
  return isoDate(addDays(today, -back))
}

function isThursdayOrFriday(todayIso: string): boolean {
  const day = dateFromIso(todayIso).getDay()
  return day === 4 || day === 5
}

function isFishItem(item: MenuDishRef): boolean {
  return entryProtein(item) === 'fish'
}

function weekHasFish(
  board: CookBoard,
  stats: MealStatsStore | undefined,
  todayIso: string,
): boolean {
  const weekStart = mondayOfWeek(todayIso)
  for (const item of cycleMains) {
    if (entryProtein(item) !== 'fish') continue
    const cookedOn = lastCookedOnForDishes(board, menuRefIds(item), stats)
    if (cookedOn && cookedOn >= weekStart && cookedOn <= todayIso) return true
  }
  for (const dish of board.fridge) {
    if (dish.remaining <= 0 || !isMainLeftover(dish.dishId)) continue
    if (dishMeta[dish.dishId]?.protein === 'fish') return true
  }
  return false
}

function recencyDays(item: MenuDishRef, ctx: RecommendContext): number {
  const cookedOn = lastCookedOnForDishes(ctx.board, menuRefIds(item), ctx.stats)
  if (!cookedOn) return NEVER_COOKED_DAYS
  return Math.max(daysSince(cookedOn, ctx.todayIso), 0)
}

function cycleIndex(item: MenuDishRef): number {
  const index = cycleIndexOf(item.dishId)
  return index < 0 ? 999 : index
}

function withoutFamilies(
  pool: MenuDishRef[],
  families: Set<ProteinFamily>,
): MenuDishRef[] {
  if (families.size === 0) return pool
  return pool.filter((item) => {
    const family = entryFamily(item)
    return !family || !families.has(family)
  })
}

function withFrozenPrep(
  pool: MenuDishRef[],
  freezer: PrepFreezer | undefined,
): MenuDishRef[] {
  const ready = pool.filter((item) => entryHasFrozenPrep(freezer, item))
  return ready.length > 0 ? ready : pool
}

function withFish(pool: MenuDishRef[]): MenuDishRef[] {
  const fish = pool.filter(isFishItem)
  if (fish.length > 0) return fish
  const seafood = pool.filter((item) => entryFamily(item) === 'seafood')
  return seafood.length > 0 ? seafood : pool
}

function pickBest(
  candidates: MenuDishRef[],
  ctx: RecommendContext,
  opts?: { excludeFamilies?: Set<ProteinFamily>; takeFish?: boolean },
): MenuDishRef | undefined {
  let pool = candidates
  const mixed = withoutFamilies(pool, opts?.excludeFamilies ?? new Set())
  if (mixed.length > 0) pool = mixed
  if (opts?.takeFish) pool = withFish(pool)
  pool = withFrozenPrep(pool, ctx.freezer)

  let best: MenuDishRef | undefined
  let bestDays = -1
  let bestIndex = 999
  for (const item of pool) {
    const days = recencyDays(item, ctx)
    const index = cycleIndex(item)
    if (!best || days > bestDays || (days === bestDays && index < bestIndex)) {
      best = item
      bestDays = days
      bestIndex = index
    }
  }
  return best
}

function sideCycleIndex(sideId: string): number {
  const index = cycleSides.findIndex((item) => item.dishId === sideId)
  return index < 0 ? 999 : index
}

function pickOldestSideId(
  board: CookBoard,
  stats: MealStatsStore | undefined,
  sideIds: string[],
): string | undefined {
  let best: string | undefined
  let bestDate = '9999-99-99'
  let bestIndex = 999
  for (const id of sideIds) {
    const date = lastCookedOnForDishes(board, [id], stats) ?? ''
    const index = sideCycleIndex(id)
    if (
      !best ||
      date < bestDate ||
      (date === bestDate && index < bestIndex)
    ) {
      best = id
      bestDate = date
      bestIndex = index
    }
  }
  return best
}

export type CookPlanItem = {
  item: MenuDishRef
  sideId?: string
}

function withSuggestedSides(
  board: CookBoard,
  stats: MealStatsStore | undefined,
  mains: MenuDishRef[],
): CookPlanItem[] {
  const taken = takenSideIds(board)
  for (const item of mains) {
    for (const id of menuRefIds(item)) {
      for (const sideId of builtInSideIds(id)) taken.add(sideId)
    }
  }
  return mains.map((item) => {
    const matching = matchingSideIds(item.dishId).filter((id) => !taken.has(id))
    const sideId = pickOldestSideId(board, stats, matching)
    if (sideId) taken.add(sideId)
    return sideId ? { item, sideId } : { item }
  })
}

/**
 * Два блюда: разные белки → рыба в чт/пт если её не было на неделе →
 * заготовка → чем дольше не готовили, тем лучше.
 * К каждому — подходящий гарнир, который готовили давнее всего.
 * Уже запланированные не предлагаем — добиваем пару до двух.
 */
export function recommendCookPlan(
  board: CookBoard,
  stats: MealStatsStore | undefined,
  freezer?: PrepFreezer,
  count = COOK_PAIR,
  todayIso = isoDate(),
): CookPlanItem[] {
  const planned = plannedCycleEntries(board)
  const want = Math.max(0, count - planned.length)
  if (want === 0) return []

  const candidates = cycleMains.filter(
    (item) => !isPlannedItem(board, item) && !isInFridge(board, item),
  )
  const needFish =
    isThursdayOrFriday(todayIso) &&
    !weekHasFish(board, stats, todayIso) &&
    !planned.some(isFishItem)

  const pickedFamilies = new Set<ProteinFamily>()
  for (const item of planned) {
    const family = entryFamily(item)
    if (family) pickedFamilies.add(family)
  }

  let remaining = withoutFamilies(candidates, pickedFamilies)
  const picked: MenuDishRef[] = []
  while (picked.length < want && remaining.length > 0) {
    const lastSlot = picked.length === want - 1
    const takeFish = needFish && lastSlot && !picked.some(isFishItem)
    const best = pickBest(remaining, { board, stats, freezer, todayIso }, {
      excludeFamilies: pickedFamilies,
      takeFish,
    })
    if (!best) break
    picked.push(best)
    const family = entryFamily(best)
    if (family) pickedFamilies.add(family)
    remaining = withoutFamilies(
      remaining.filter((item) => item !== best),
      pickedFamilies,
    )
  }
  return withSuggestedSides(board, stats, picked)
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
    const sideId = board.plannedSideByMain?.[item.dishId]
    if (typeof sideId === 'string') ids.add(sideId)
  }
  for (const plan of recommendCookPlan(board, stats, freezer, count)) {
    for (const id of menuRefIds(plan.item)) ids.add(id)
    if (plan.sideId) ids.add(plan.sideId)
  }
  return ids
}
