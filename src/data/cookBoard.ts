/**
 * Живой слой поверх weekMenus: очередь готовок и холодильник.
 * Календарные пн/ср/пт — только происхождение набора в шаблоне, не дата.
 * Остатки считаются по блюдам: говядина может остаться, курица — кончиться раньше.
 */

import {
  addDays,
  cycleId,
  cycleStartFromId,
  dateFromIso,
  formatIsoGenitive,
  isoDate,
  slotStartIso,
  type MenuSlotId,
} from './calendar'
import { getWeekMenu, weekMenus, type MenuSlot, type WeekMenu } from './menu'
import { getEffectiveSlot, type MenuOverrides } from './menuOverrides'
import {
  dishHasOutcomeThisCycle,
  lastOutcomeCookedOn,
  slotDishHasOutcome,
  type MealStatsStore,
} from './mealStats'
import { normalizePortionScale } from '../lib/portionScale'
import { weekNumbers } from './weeks'

export const DEFAULT_EAT_DAYS = 2
export const DEFAULT_COOK_PORTIONS = 6
export const SHOP_WINDOW_SIZE = 3
export const SLOT_ORDER: MenuSlotId[] = ['mon-tue', 'wed-thu', 'fri-sat']

export function cookPortionsFromScale(scale?: number): number {
  return Math.max(1, Math.round(DEFAULT_COOK_PORTIONS * normalizePortionScale(scale)))
}

export type CookedBatch = {
  cookedOn: string
  eatDays?: number
}

export type FridgeDish = {
  key: string
  batchId: string
  dishId: string
  cookedOn: string
  cookedPortions: number
  remaining: number
  eatDays?: number
}

export type DishMark = 'cooked' | 'eaten' | 'leftover'

export const DISH_MARK_OPTIONS: { id: DishMark; label: string }[] = [
  { id: 'cooked', label: 'Готово' },
]

export type CookBoard = {
  cycleId: string
  fridge: FridgeDish[]
  cooked: Record<string, CookedBatch>
  dishMarks: Record<string, DishMark>
  /** Блюда, которые собираемся готовить (завтра) — для списка «нужно купить». */
  plannedDishIds: string[]
  /** Ингредиенты, которые уже есть (ключ — нормализованная строка). */
  shopHave: Record<string, true>
  rev?: number
}

export type BatchStatus = 'eating' | 'cooked' | 'next' | 'pending'

export type CookBatchView = {
  id: string
  cycleId: string
  week: number
  slotId: MenuSlotId
  slot: MenuSlot
  status: BatchStatus
  cookedOn?: string
}

export type ShopWindow = {
  index: number
  id: string
  label: string
  batchIds: string[]
  batches: CookBatchView[]
  menu: WeekMenu
}

export const COOK_BOARD_REV = 2

export function emptyCookBoard(cycle: string = cycleId()): CookBoard {
  return {
    cycleId: cycle,
    fridge: [],
    cooked: {},
    dishMarks: {},
    plannedDishIds: [],
    shopHave: {},
    rev: COOK_BOARD_REV,
  }
}

function asStringIds(raw: unknown): string[] {
  if (!Array.isArray(raw)) return []
  const out: string[] = []
  const seen = new Set<string>()
  for (const value of raw) {
    if (typeof value !== 'string' || !value || seen.has(value)) continue
    seen.add(value)
    out.push(value)
  }
  return out
}

function asShopHave(raw: unknown): Record<string, true> {
  if (!raw || typeof raw !== 'object') return {}
  const out: Record<string, true> = {}
  for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
    if (value === true || value === 1 || value === 'true') out[key] = true
  }
  return out
}

export function isDishPlanned(board: CookBoard, dishId: string): boolean {
  return (board.plannedDishIds ?? []).includes(dishId)
}

export function toggleDishPlanned(board: CookBoard, dishId: string): CookBoard {
  const ids = board.plannedDishIds ?? []
  const plannedDishIds = ids.includes(dishId)
    ? ids.filter((id) => id !== dishId)
    : [...ids, dishId]
  return {
    ...board,
    plannedDishIds,
    shopHave: plannedDishIds.length === 0 ? {} : (board.shopHave ?? {}),
  }
}

export function unplanDish(board: CookBoard, dishId: string): CookBoard {
  const ids = board.plannedDishIds ?? []
  if (!ids.includes(dishId)) return board
  const plannedDishIds = ids.filter((id) => id !== dishId)
  return {
    ...board,
    plannedDishIds,
    shopHave: plannedDishIds.length === 0 ? {} : (board.shopHave ?? {}),
  }
}

export function markShopHave(board: CookBoard, key: string): CookBoard {
  if (!key || board.shopHave?.[key]) return board
  return { ...board, shopHave: { ...(board.shopHave ?? {}), [key]: true } }
}

export function makeBatchId(cycle: string, week: number, slotId: MenuSlotId): string {
  return `${cycle}|${week}|${slotId}`
}

export function fridgeDishKey(batchId: string, dishId: string): string {
  return `${batchId}::${dishId}`
}

export function parseBatchId(
  id: string,
): { cycleId: string; week: number; slotId: MenuSlotId } | null {
  const parts = id.split('|')
  if (parts.length !== 3) return null
  const week = Number(parts[1])
  const slotId = parts[2] as MenuSlotId
  if (!Number.isFinite(week) || !SLOT_ORDER.includes(slotId)) return null
  return { cycleId: parts[0]!, week, slotId }
}

export function templateBatchIds(cycle: string): string[] {
  const ids: string[] = []
  for (const week of weekNumbers) {
    const menu = weekMenus.find((w) => w.week === week)
    for (const slot of menu?.slots ?? SLOT_ORDER.map((id) => ({ id }))) {
      ids.push(makeBatchId(cycle, week, slot.id))
    }
  }
  return ids
}

export function slotPrimaryDishIds(slot: MenuSlot): string[] {
  const ids: string[] = []
  if (slot.complete) ids.push(slot.complete.dishId)
  for (const m of slot.mains) ids.push(m.dishId)
  for (const s of slot.sides) ids.push(s.dishId)
  return ids
}

export function slotDishIds(slot: MenuSlot): string[] {
  const ids: string[] = []
  if (slot.complete) ids.push(slot.complete.dishId, ...(slot.complete.orDishIds ?? []))
  for (const m of slot.mains) ids.push(m.dishId, ...(m.orDishIds ?? []))
  for (const s of slot.sides) ids.push(s.dishId, ...(s.orDishIds ?? []))
  return ids
}

function dishIdsForBatch(batchId: string): string[] {
  const parsed = parseBatchId(batchId)
  if (!parsed) return []
  const slot = getWeekMenu(parsed.week).slots.find((s) => s.id === parsed.slotId)
  return slot ? slotPrimaryDishIds(slot) : []
}

function isCookedRecord(value: unknown): value is CookedBatch {
  if (!value || typeof value !== 'object') return false
  const rec = value as CookedBatch
  return typeof rec.cookedOn === 'string'
}

function asFridgeDish(value: unknown): FridgeDish | null {
  if (!value || typeof value !== 'object') return null
  const rec = value as Record<string, unknown>
  if (
    typeof rec.key !== 'string' ||
    typeof rec.batchId !== 'string' ||
    typeof rec.dishId !== 'string' ||
    typeof rec.cookedOn !== 'string'
  ) {
    return null
  }
  const cookedPortions =
    typeof rec.cookedPortions === 'number' && rec.cookedPortions > 0
      ? Math.round(rec.cookedPortions)
      : DEFAULT_COOK_PORTIONS
  const remainingRaw =
    typeof rec.remaining === 'number' ? Math.round(rec.remaining) : cookedPortions
  const remaining = Math.min(cookedPortions, Math.max(0, remainingRaw))
  if (remaining <= 0) return null
  const eatDays =
    typeof rec.eatDays === 'number' ? Math.max(1, rec.eatDays) : DEFAULT_EAT_DAYS
  return {
    key: rec.key,
    batchId: rec.batchId,
    dishId: rec.dishId,
    cookedOn: rec.cookedOn,
    cookedPortions,
    remaining,
    eatDays,
  }
}

function migrateLegacyFridge(raw: unknown, cooked: Record<string, CookedBatch>): FridgeDish[] {
  if (Array.isArray(raw)) return raw.flatMap((item) => {
    const dish = asFridgeDish(item)
    return dish ? [dish] : []
  })
  if (!raw || typeof raw !== 'object') return []
  const rec = raw as { batchId?: string; cookedOn?: string; eatDays?: number }
  if (typeof rec.batchId !== 'string' || typeof rec.cookedOn !== 'string') return []
  const eatDays = Math.max(1, typeof rec.eatDays === 'number' ? rec.eatDays : DEFAULT_EAT_DAYS)
  if (!cooked[rec.batchId]) {
    cooked[rec.batchId] = { cookedOn: rec.cookedOn, eatDays }
  }
  return dishIdsForBatch(rec.batchId).map((dishId) => ({
    key: fridgeDishKey(rec.batchId!, dishId),
    batchId: rec.batchId!,
    dishId,
    cookedOn: rec.cookedOn!,
    cookedPortions: DEFAULT_COOK_PORTIONS,
    remaining: DEFAULT_COOK_PORTIONS,
    eatDays,
  }))
}

function isDishMark(value: unknown): value is DishMark {
  return value === 'cooked' || value === 'eaten' || value === 'leftover'
}

export function normalizeCookBoard(raw: unknown): CookBoard {
  const empty = emptyCookBoard()
  if (!raw || typeof raw !== 'object') return empty
  const rec = raw as Partial<CookBoard> & { fridge?: unknown }
  const cycle = typeof rec.cycleId === 'string' && rec.cycleId ? rec.cycleId : empty.cycleId
  if (rec.rev !== COOK_BOARD_REV) return emptyCookBoard(cycle)

  const cooked: Record<string, CookedBatch> = {}
  if (rec.cooked && typeof rec.cooked === 'object') {
    for (const [id, value] of Object.entries(rec.cooked)) {
      if (isCookedRecord(value)) cooked[id] = { cookedOn: value.cookedOn, eatDays: value.eatDays }
    }
  }
  const fridge = migrateLegacyFridge(rec.fridge, cooked)
  const fridgeKeys = new Set(fridge.map((d) => d.key))
  const dishMarks: Record<string, DishMark> = {}
  if (rec.dishMarks && typeof rec.dishMarks === 'object') {
    for (const [key, value] of Object.entries(rec.dishMarks)) {
      if (!isDishMark(value)) continue
      if ((value === 'cooked' || value === 'leftover') && !fridgeKeys.has(key)) continue
      dishMarks[key] = value
    }
  }
  if (Object.keys(dishMarks).length === 0) {
    for (const dish of fridge) {
      dishMarks[dish.key] =
        dish.remaining < dish.cookedPortions ? 'leftover' : 'cooked'
    }
  }
  return {
    cycleId: cycle,
    fridge,
    cooked,
    dishMarks,
    plannedDishIds: asStringIds(rec.plannedDishIds),
    shopHave: asShopHave(rec.shopHave),
    rev: COOK_BOARD_REV,
  }
}

export function pendingBatchIds(board: CookBoard): string[] {
  return templateBatchIds(board.cycleId).filter((id) => !board.cooked[id])
}

export function nextBatchId(board: CookBoard): string | undefined {
  return pendingBatchIds(board)[0]
}

export function cycleHasPendingOrFridge(board: CookBoard): boolean {
  return board.fridge.length > 0 || pendingBatchIds(board).length > 0
}

/** Не сбрасываем хвост при смене месяца, пока очередь или холодильник живы. */
export function advanceCookBoard(board: CookBoard, todayCycle: string = cycleId()): CookBoard {
  if (board.cycleId === todayCycle) return board
  if (cycleHasPendingOrFridge(board)) return board
  return emptyCookBoard(todayCycle)
}

export function resolveCookBoard(
  raw: unknown,
  todayCycle: string = cycleId(),
): CookBoard {
  return advanceCookBoard(normalizeCookBoard(raw), todayCycle)
}

export function getDishMark(board: CookBoard, batchId: string, dishId: string): DishMark | undefined {
  return board.dishMarks?.[fridgeDishKey(batchId, dishId)]
}

export function displayDishMark(board: CookBoard, batchId: string, dishId: string): DishMark | undefined {
  const key = fridgeDishKey(batchId, dishId)
  const fridge = board.fridge.find((d) => d.key === key)
  if (fridge && fridge.remaining > 0) {
    return fridge.remaining < fridge.cookedPortions ? 'leftover' : 'cooked'
  }
  return board.dishMarks?.[key]
}

function dishKeyMatches(key: string, dishId: string): boolean {
  return key.slice(key.lastIndexOf('::') + 2) === dishId
}

export function displayDishMarkForDish(
  board: CookBoard,
  dishId: string,
  stats?: MealStatsStore,
): DishMark | undefined {
  const fridge = board.fridge.find((d) => d.dishId === dishId && d.remaining > 0)
  if (fridge) {
    return fridge.remaining < fridge.cookedPortions ? 'leftover' : 'cooked'
  }
  for (const [key, mark] of Object.entries(board.dishMarks ?? {})) {
    if (mark === 'eaten' && dishKeyMatches(key, dishId)) return mark
  }
  if (stats && dishHasOutcomeThisCycle(stats, dishId, board.cycleId)) return 'eaten'
  return undefined
}

function cookedOnFromBatchId(batchId: string): string | undefined {
  const parsed = parseBatchId(batchId)
  if (!parsed) return undefined
  return slotStartIso(parsed.week, parsed.slotId, cycleStartFromId(parsed.cycleId))
}

export function lastCookedOnForDish(
  board: CookBoard,
  dishId: string,
  stats?: MealStatsStore,
): string | undefined {
  let latest: string | undefined
  const consider = (iso?: string) => {
    if (iso && (!latest || iso > latest)) latest = iso
  }
  for (const dish of board.fridge) {
    if (dish.dishId === dishId) consider(dish.cookedOn)
  }
  for (const [key, mark] of Object.entries(board.dishMarks ?? {})) {
    if (!mark || !dishKeyMatches(key, dishId)) continue
    const batchId = key.slice(0, key.lastIndexOf('::'))
    consider(board.cooked[batchId]?.cookedOn)
    consider(cookedOnFromBatchId(batchId))
  }
  if (stats) consider(lastOutcomeCookedOn(stats, dishId, board.cycleId))
  return latest
}

export function dishQueueGroup(
  board: CookBoard,
  dishId: string,
  stats?: MealStatsStore,
): 'cooking' | 'todo' | 'done' {
  const mark = displayDishMarkForDish(board, dishId, stats)
  if (mark === 'cooked' || mark === 'leftover') return 'cooking'
  if (mark === 'eaten') return 'done'
  return 'todo'
}

export function dishIsPrepared(
  board: CookBoard,
  dishId: string,
  stats?: MealStatsStore,
): boolean {
  return dishQueueGroup(board, dishId, stats) === 'cooking'
}

export function batchIdForDish(
  board: CookBoard,
  dishId: string,
  fallbackBatchId: string,
): string {
  const fridge = board.fridge.find((d) => d.dishId === dishId)
  if (fridge) return fridge.batchId
  for (const key of Object.keys(board.dishMarks ?? {})) {
    if (dishKeyMatches(key, dishId)) return key.slice(0, key.lastIndexOf('::'))
  }
  return fallbackBatchId
}

function batchAllMarked(
  board: CookBoard,
  batchId: string,
  dishIds: string[],
  stats?: MealStatsStore,
): boolean {
  return (
    dishIds.length > 0 &&
    dishIds.every(
      (id) =>
        Boolean(board.dishMarks[fridgeDishKey(batchId, id)]) ||
        slotDishHasOutcome(stats, batchId, id),
    )
  )
}

function syncFridgeDish(
  fridge: FridgeDish[],
  mark: DishMark | undefined,
  batchId: string,
  dishId: string,
  cookedOn: string,
  cookedPortions: number,
): FridgeDish[] {
  const key = fridgeDishKey(batchId, dishId)
  const prev = fridge.find((d) => d.key === key)
  const without = fridge.filter((d) => d.key !== key)
  if (mark !== 'cooked' && mark !== 'leftover') return without
  const portions = prev?.cookedPortions ?? cookedPortions
  const remaining = prev?.remaining ?? portions
  if (remaining <= 0) return without
  return [
    ...without,
    {
      key,
      batchId,
      dishId,
      cookedOn: prev?.cookedOn ?? cookedOn,
      cookedPortions: portions,
      remaining,
      eatDays: prev?.eatDays ?? DEFAULT_EAT_DAYS,
    },
  ]
}

function applyDishMark(
  board: CookBoard,
  batchId: string,
  dishId: string,
  batchDishIds: string[],
  nextMark: DishMark | undefined,
  cookedOn: string,
  cookedPortions: number = DEFAULT_COOK_PORTIONS,
): CookBoard {
  const key = fridgeDishKey(batchId, dishId)
  const dishMarks = { ...(board.dishMarks ?? {}) }
  if (!nextMark) delete dishMarks[key]
  else dishMarks[key] = nextMark

  const fridge = syncFridgeDish(
    board.fridge,
    nextMark,
    batchId,
    dishId,
    cookedOn,
    cookedPortions,
  )
  const nextBoard = { ...board, dishMarks, fridge }
  const cooked = { ...board.cooked }
  if (batchAllMarked(nextBoard, batchId, batchDishIds)) {
    if (!cooked[batchId]) cooked[batchId] = { cookedOn, eatDays: DEFAULT_EAT_DAYS }
  } else {
    delete cooked[batchId]
  }
  return { ...nextBoard, cooked }
}

function forgetDishCook(
  board: CookBoard,
  dishId: string,
  batchId: string,
  batchDishIds: string[],
): CookBoard {
  const dishMarks = { ...(board.dishMarks ?? {}) }
  const affected = new Set<string>([batchId])
  for (const key of Object.keys(dishMarks)) {
    if (!dishKeyMatches(key, dishId)) continue
    affected.add(key.slice(0, key.lastIndexOf('::')))
    delete dishMarks[key]
  }
  const fridge = board.fridge.filter((d) => {
    if (d.dishId !== dishId) return true
    affected.add(d.batchId)
    return false
  })
  const nextBoard = { ...board, dishMarks, fridge }
  const cooked = { ...board.cooked }
  for (const id of affected) {
    const ids = id === batchId && batchDishIds.length > 0 ? batchDishIds : dishIdsForBatch(id)
    if (!batchAllMarked(nextBoard, id, ids)) delete cooked[id]
  }
  return { ...nextBoard, cooked }
}

export function setDishPrepared(
  board: CookBoard,
  batchId: string,
  dishId: string,
  batchDishIds: string[],
  prepared: boolean,
  cookedOn: string = isoDate(),
  cookedPortions: number = DEFAULT_COOK_PORTIONS,
): CookBoard {
  if (!prepared) return forgetDishCook(board, dishId, batchId, batchDishIds)
  if (dishQueueGroup(board, dishId) === 'cooking') return board
  return unplanDish(
    applyDishMark(board, batchId, dishId, batchDishIds, 'cooked', cookedOn, cookedPortions),
    dishId,
  )
}

export function setDishMark(
  board: CookBoard,
  batchId: string,
  dishId: string,
  batchDishIds: string[],
  mark: DishMark | undefined,
  cookedOn: string = isoDate(),
  cookedPortions: number = DEFAULT_COOK_PORTIONS,
): CookBoard {
  const shown =
    displayDishMarkForDish(board, dishId) ?? displayDishMark(board, batchId, dishId)
  const cooking =
    shown === 'cooked' ||
    shown === 'leftover' ||
    board.fridge.some((d) => d.dishId === dishId && d.remaining > 0)
  if (!mark || (mark === 'cooked' && cooking) || shown === mark) {
    return forgetDishCook(board, dishId, batchId, batchDishIds)
  }
  if (mark === 'leftover') return board
  return applyDishMark(board, batchId, dishId, batchDishIds, mark, cookedOn, cookedPortions)
}

export function addDishToFridge(
  board: CookBoard,
  batchId: string,
  dishId: string,
  batchDishIds: string[],
  cookedPortions: number = DEFAULT_COOK_PORTIONS,
  cookedOn: string = isoDate(),
): CookBoard {
  return applyDishMark(board, batchId, dishId, batchDishIds, 'cooked', cookedOn, cookedPortions)
}

export function bumpFridgePortions(
  board: CookBoard,
  key: string,
  delta: 1 | -1,
  batchDishIds?: string[],
): CookBoard {
  const dish = board.fridge.find((d) => d.key === key)
  if (!dish) return board
  const nextRemaining = Math.min(
    dish.cookedPortions,
    Math.max(0, dish.remaining + delta),
  )
  if (nextRemaining === dish.remaining) return board
  const ids = batchDishIds?.length ? batchDishIds : dishIdsForBatch(dish.batchId)
  if (nextRemaining === 0) {
    return applyDishMark(board, dish.batchId, dish.dishId, ids, 'eaten', dish.cookedOn)
  }
  const mark: DishMark = nextRemaining < dish.cookedPortions ? 'leftover' : 'cooked'
  const fridge = board.fridge.map((d) =>
    d.key === key ? { ...d, remaining: nextRemaining } : d,
  )
  const dishMarks = { ...(board.dishMarks ?? {}), [key]: mark }
  const nextBoard = { ...board, dishMarks, fridge }
  const cooked = { ...board.cooked }
  if (batchAllMarked(nextBoard, dish.batchId, ids)) {
    if (!cooked[dish.batchId]) {
      cooked[dish.batchId] = { cookedOn: dish.cookedOn, eatDays: DEFAULT_EAT_DAYS }
    }
  } else {
    delete cooked[dish.batchId]
  }
  return { ...nextBoard, cooked }
}

export function listCookQueue(
  board: CookBoard,
  overrides: MenuOverrides | undefined,
  stats?: MealStatsStore,
): CookBatchView[] {
  const eatingIds = new Set(
    Object.entries(board.dishMarks ?? {})
      .filter(([, mark]) => mark === 'cooked' || mark === 'leftover')
      .map(([key]) => key.split('::')[0]!),
  )
  for (const dish of board.fridge) {
    if (dish.remaining > 0) eatingIds.add(dish.batchId)
  }
  const ids = templateBatchIds(board.cycleId)
  const nextId = ids.find((id) => {
    const parsed = parseBatchId(id)
    if (!parsed) return false
    const slot = getEffectiveSlot(parsed.week, parsed.slotId, overrides)
    return !batchAllMarked(board, id, slotPrimaryDishIds(slot), stats)
  })

  return ids.flatMap((id) => {
    const parsed = parseBatchId(id)
    if (!parsed) return []
    const slot = getEffectiveSlot(parsed.week, parsed.slotId, overrides)
    const cooked = board.cooked[id]
    const fromStats = batchAllMarked(board, id, slotPrimaryDishIds(slot), stats)
    const status: BatchStatus =
      id === nextId
        ? 'next'
        : eatingIds.has(id)
          ? 'eating'
          : cooked || fromStats
            ? 'cooked'
            : 'pending'
    return [
      {
        id,
        cycleId: parsed.cycleId,
        week: parsed.week,
        slotId: parsed.slotId,
        slot,
        status,
        cookedOn: cooked?.cookedOn ?? (fromStats ? cookedOnFromBatchId(id) : undefined),
      },
    ]
  })
}

export function pendingBatches(queue: CookBatchView[]): CookBatchView[] {
  return queue.filter((b) => b.status === 'next' || b.status === 'pending')
}

export function dishUntilIso(dish: FridgeDish): string {
  return isoDate(addDays(dateFromIso(dish.cookedOn), (dish.eatDays ?? DEFAULT_EAT_DAYS) - 1))
}

export function nextCookIsoFromFridge(fridge: FridgeDish[]): string | undefined {
  if (fridge.length === 0) return undefined
  const dates = fridge.map((d) => dishUntilIso(d)).sort()
  const earliest = dates[0]
  if (!earliest) return undefined
  return isoDate(addDays(dateFromIso(earliest), 1))
}

export function markBatchCooked(
  board: CookBoard,
  batchId: string,
  dishIds: string[],
  cookedOn: string = isoDate(),
): CookBoard {
  let next = board
  for (const dishId of dishIds) {
    next = applyDishMark(next, batchId, dishId, dishIds, 'cooked', cookedOn)
  }
  return next
}

export function addFridgeDishDay(board: CookBoard, key: string): CookBoard {
  return bumpFridgePortions(board, key, 1)
}

export function shoppingWindows(
  board: CookBoard,
  overrides: MenuOverrides | undefined,
  stats?: MealStatsStore,
): ShopWindow[] {
  const pending = pendingBatches(listCookQueue(board, overrides, stats))
  const windows: ShopWindow[] = []
  for (let i = 0; i < pending.length; i += SHOP_WINDOW_SIZE) {
    const batches = pending.slice(i, i + SHOP_WINDOW_SIZE)
    const index = windows.length + 1
    const batchIds = batches.map((b) => b.id)
    windows.push({
      index,
      id: batchIds.join('_'),
      label: index === 1 ? 'Следующие готовки' : 'Позже в очереди',
      batchIds,
      batches,
      menu: {
        week: index,
        summary: '',
        slots: batches.map((b) => b.slot),
      },
    })
  }
  return windows
}

export function shopChecklistKey(cycle: string, windowId: string): string {
  return `checklist-shop-${cycle}-${windowId}`
}

function fridgePortionsLeft(left: FridgeDish[]): number {
  return left.reduce((sum, dish) => sum + dish.remaining, 0)
}

export function batchStatusLabel(batch: CookBatchView, fridge: FridgeDish[] = []): string {
  const left = fridge.filter((d) => d.batchId === batch.id)
  const portions = fridgePortionsLeft(left)
  if (batch.status === 'next') {
    if (left.length === 0) return 'следующая готовка'
    return portions > 0
      ? `в холодильнике · ${portions} пор. · ещё готовим`
      : 'ещё готовим'
  }
  if (batch.status === 'eating') {
    if (left.length === 0) return 'едим'
    return portions > 0 ? `в холодильнике · ${portions} пор.` : 'в холодильнике'
  }
  if (batch.status === 'cooked' && batch.cookedOn) {
    return `приготовлено ${formatIsoGenitive(batch.cookedOn)}`
  }
  return 'в очереди'
}
