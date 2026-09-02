/**
 * Живой слой: очередь готовок и холодильник поверх цикла блюд.
 * Остатки считаются по блюдам: говядина может остаться, курица — кончиться раньше.
 */

import {
  cycleId,
  cycleStartFromId,
  isoDate,
  slotStartIso,
  type MenuSlotId,
} from './calendar'
import { cycleMains, getWeekMenu, menuRefIds, weekMenus, type MenuSlot } from './menu'
import { getEffectiveSlot, type MenuOverrides } from './menuOverrides'
import {
  dishHasOutcomeThisCycle,
  lastOutcomeCookedOn,
  slotDishHasOutcome,
  type MealStatsStore,
} from './mealStats'
import {
  builtInSideIds,
  dishCookPortions,
  dishMeta,
  isCompleteDish,
  matchingSideIds,
} from './dishMeta'
import { parsePrepTaken, type PrepTaken } from './prep'
import { normalizePortionScale } from '../lib/portionScale'

export const DEFAULT_EAT_DAYS = 2
export const DEFAULT_COOK_PORTIONS = 6
export const SLOT_ORDER: MenuSlotId[] = ['mon-tue', 'wed-thu', 'fri-sat']

export function cookPortionsFromScale(dishId: string, scale?: number): number {
  return Math.max(1, Math.round(dishCookPortions(dishId) * normalizePortionScale(scale)))
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
  /** Гарнир, который положили в холодильник вместе с этим горячим. */
  cookedWith?: string
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
  /** Горячее, выбранное для готовки. */
  plannedDishIds: string[]
  /**
   * Гарнир к запланированному горячему.
   * string — id гарнира, null — без гарнира.
   */
  plannedSideByMain?: Record<string, string | null>
  /** Ингредиенты, которые уже есть (ключ — нормализованная строка). */
  shopHave: Record<string, true>
  /** Одноразовые правки живых данных (не сбрасывать повторно). */
  patches?: string[]
  /** Последняя дата готовки блюда (YYYY-MM-DD), не привязана к слоту календаря. */
  lastCookedOn?: Record<string, string>
  /** Какой пакет заготовки забрали из морозилки при готовке блюда (ключ холодильника). */
  prepTaken?: PrepTaken
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

export const COOK_BOARD_REV = 2

export function emptyCookBoard(cycle: string = cycleId()): CookBoard {
  return {
    cycleId: cycle,
    fridge: [],
    cooked: {},
    dishMarks: {},
    plannedDishIds: [],
    plannedSideByMain: {},
    shopHave: {},
    patches: [],
    lastCookedOn: {},
    prepTaken: {},
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

function asIsoDateMap(raw: unknown): Record<string, string> {
  if (!raw || typeof raw !== 'object') return {}
  const out: Record<string, string> = {}
  for (const [id, value] of Object.entries(raw as Record<string, unknown>)) {
    if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) out[id] = value
  }
  return out
}

function withLastCookedOn(
  board: CookBoard,
  dishId: string,
  cookedOn: string,
): Record<string, string> {
  const lastCookedOn = { ...(board.lastCookedOn ?? {}) }
  const prev = lastCookedOn[dishId]
  if (!prev || cookedOn > prev) lastCookedOn[dishId] = cookedOn
  return lastCookedOn
}

function isPlannableMain(dishId: string): boolean {
  return dishMeta[dishId]?.kind !== 'side'
}

function asPlannedMains(raw: unknown): string[] {
  return asStringIds(raw).filter(isPlannableMain)
}

function asPlannedSides(
  raw: unknown,
  plannedMains: string[],
): Record<string, string | null> {
  if (!raw || typeof raw !== 'object') return {}
  const allowed = new Set(plannedMains)
  const out: Record<string, string | null> = {}
  for (const [mainId, value] of Object.entries(raw as Record<string, unknown>)) {
    if (!allowed.has(mainId)) continue
    if (value === null) {
      out[mainId] = null
      continue
    }
    if (typeof value !== 'string' || !value) continue
    if (!matchingSideIds(mainId).includes(value)) continue
    out[mainId] = value
  }
  return out
}

/** Гарниры, уже занятые планом: выбранные пары + то, что внутри цельных. */
export function takenSideIds(board: CookBoard, exceptMainId?: string): Set<string> {
  const taken = new Set<string>()
  for (const mainId of board.plannedDishIds ?? []) {
    for (const id of builtInSideIds(mainId)) taken.add(id)
    const chosen = board.plannedSideByMain?.[mainId]
    if (typeof chosen === 'string' && mainId !== exceptMainId) taken.add(chosen)
  }
  return taken
}

export function availableSideIdsForMain(board: CookBoard, mainId: string): string[] {
  const taken = takenSideIds(board, mainId)
  return matchingSideIds(mainId).filter((id) => !taken.has(id))
}

export function isDishPlanned(board: CookBoard, dishId: string): boolean {
  const planned = board.plannedDishIds ?? []
  if (planned.includes(dishId)) return true
  const group = cycleMains.find((item) => menuRefIds(item).includes(dishId))
  return Boolean(group && menuRefIds(group).some((id) => planned.includes(id)))
}

export function plannedSideForMain(
  board: CookBoard,
  mainId: string,
): string | null | undefined {
  if (!isDishPlanned(board, mainId)) return undefined
  return board.plannedSideByMain?.[mainId]
}

function emptyShopIfNoPlan(
  plannedDishIds: string[],
  shopHave: Record<string, true> | undefined,
): Record<string, true> {
  return plannedDishIds.length === 0 ? {} : (shopHave ?? {})
}

function clearPlannedSide(
  map: Record<string, string | null>,
  mainId: string,
): Record<string, string | null> {
  if (!(mainId in map)) return map
  const next = { ...map }
  delete next[mainId]
  return next
}

export function toggleDishPlanned(board: CookBoard, dishId: string): CookBoard {
  return setDishPlanned(board, dishId, !isDishPlanned(board, dishId))
}

export function setDishPlanned(
  board: CookBoard,
  dishId: string,
  planned: boolean,
): CookBoard {
  if (!isPlannableMain(dishId)) return board
  const already = isDishPlanned(board, dishId)
  if (planned === already) return board
  if (!planned) return unplanDish(board, dishId)

  const plannedDishIds = [...(board.plannedDishIds ?? []), dishId]
  const plannedSideByMain = { ...(board.plannedSideByMain ?? {}) }
  if (isCompleteDish(dishId) && matchingSideIds(dishId).length === 0) {
    plannedSideByMain[dishId] = null
  }
  return {
    ...board,
    plannedDishIds,
    plannedSideByMain: stealBuiltInSides(plannedSideByMain, dishId),
  }
}

/** Если цельное уже «заняло» гарнир, снимаем его с других запланированных. */
function stealBuiltInSides(
  plannedSideByMain: Record<string, string | null>,
  mainId: string,
): Record<string, string | null> {
  const implied = builtInSideIds(mainId)
  if (implied.length === 0) return plannedSideByMain
  const next = { ...plannedSideByMain }
  for (const [other, side] of Object.entries(next)) {
    if (other === mainId) continue
    if (typeof side === 'string' && implied.includes(side)) delete next[other]
  }
  return next
}

export function setPlannedSide(
  board: CookBoard,
  mainId: string,
  sideId: string | null,
): CookBoard {
  if (!isDishPlanned(board, mainId)) return board
  if (typeof sideId === 'string' && !matchingSideIds(mainId).includes(sideId)) return board
  const plannedSideByMain = { ...(board.plannedSideByMain ?? {}) }
  const current = plannedSideByMain[mainId]
  if (typeof sideId === 'string' && current === sideId) return board
  if (sideId === null && mainId in plannedSideByMain && current === null) return board
  if (typeof sideId === 'string') {
    for (const [other, side] of Object.entries(plannedSideByMain)) {
      if (other !== mainId && side === sideId) delete plannedSideByMain[other]
    }
    plannedSideByMain[mainId] = sideId
  } else {
    plannedSideByMain[mainId] = null
  }
  return { ...board, plannedSideByMain }
}

export function unplanDish(board: CookBoard, dishId: string): CookBoard {
  const ids = board.plannedDishIds ?? []
  if (!ids.includes(dishId)) return board
  const plannedDishIds = ids.filter((id) => id !== dishId)
  return {
    ...board,
    plannedDishIds,
    plannedSideByMain: clearPlannedSide(board.plannedSideByMain ?? {}, dishId),
    shopHave: emptyShopIfNoPlan(plannedDishIds, board.shopHave),
  }
}

export function markShopHave(board: CookBoard, key: string): CookBoard {
  if (!key || board.shopHave?.[key]) return board
  return { ...board, shopHave: { ...(board.shopHave ?? {}), [key]: true } }
}

export function toggleShopHave(board: CookBoard, key: string): CookBoard {
  if (!key) return board
  const shopHave = { ...(board.shopHave ?? {}) }
  if (shopHave[key]) {
    delete shopHave[key]
    return { ...board, shopHave }
  }
  return { ...board, shopHave: { ...shopHave, [key]: true } }
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
  return weekMenus.flatMap((menu) =>
    menu.slots.map((slot) => makeBatchId(cycle, menu.week, slot.id)),
  )
}

export function isBareCookBoard(board: CookBoard): boolean {
  return (
    board.fridge.length === 0 &&
    Object.keys(board.cooked).length === 0 &&
    Object.keys(board.dishMarks ?? {}).length === 0 &&
    (board.plannedDishIds?.length ?? 0) === 0
  )
}

/** Даты готовки больше не сеем из календаря — цикл блюд не привязан к пн/ср/пт. */
export function seedPastPlanCooks(board: CookBoard): CookBoard {
  return board
}

export const FRIDGE_LEFTOVER_PATCH = '2026-08-w4-fridge-1'

const WEEK4_FRIDGE_LEFTOVERS: { dishId: string; remaining: number }[] = [
  { dishId: 'beef_pulled', remaining: 1 },
  { dishId: 'chicken_meatballs', remaining: 1 },
  { dishId: 'buckwheat_veg', remaining: 1 },
  { dishId: 'mash', remaining: 1 },
]

/** Рваная говядина, тефтели, гречка, пюре — по 1 порции с готовки пн–вт недели 4. */
export function applyFridgeLeftoverPatch(board: CookBoard): CookBoard {
  const patches = board.patches ?? []
  if (patches.includes(FRIDGE_LEFTOVER_PATCH)) return board
  const nextPatches = [...patches, FRIDGE_LEFTOVER_PATCH]
  if (board.cycleId !== '2026-08') return { ...board, patches: nextPatches }

  const batchId = makeBatchId('2026-08', 4, 'mon-tue')
  const cookedOn =
    board.cooked[batchId]?.cookedOn ??
    slotStartIso(4, 'mon-tue', cycleStartFromId('2026-08'))
  const leftoverIds = new Set(WEEK4_FRIDGE_LEFTOVERS.map((d) => d.dishId))
  const fridge = board.fridge.filter(
    (d) => !(d.batchId === batchId && leftoverIds.has(d.dishId)),
  )
  const dishMarks = { ...(board.dishMarks ?? {}) }
  const cooked = {
    ...board.cooked,
    [batchId]: board.cooked[batchId] ?? { cookedOn, eatDays: DEFAULT_EAT_DAYS },
  }

  for (const { dishId, remaining } of WEEK4_FRIDGE_LEFTOVERS) {
    const key = fridgeDishKey(batchId, dishId)
    fridge.push({
      key,
      batchId,
      dishId,
      cookedOn,
      cookedPortions: DEFAULT_COOK_PORTIONS,
      remaining,
      eatDays: DEFAULT_EAT_DAYS,
    })
    dishMarks[key] = 'leftover'
  }

  return { ...board, fridge, dishMarks, cooked, patches: nextPatches }
}

export const COOKED_ON_PATCH = '2026-08-cooked-dates-3'
export const COOKED_ON_FILL_PATCH = '2026-09-fill-missing-cooked-on-1'
export const LEGS_WINGS_COOKED_ON_PATCH = '2026-09-legs-wings-aug-30'

const COOKED_ON_DATES: Record<string, string> = {
  chicken_tomato_cream: '2026-08-03',
  chicken_legs_honey: '2026-08-30',
  chicken_legs_paprika: '2026-08-30',
  bolognese: '2026-08-07',
  trout: '2026-08-10',
  chicken_cutlets: '2026-08-10',
  wings_soy: '2026-08-30',
  wings_paprika: '2026-08-30',
  shrimp_pasta: '2026-08-14',
  beef_stroganoff: '2026-08-14',
  pollock: '2026-08-17',
  thighs_sour_cream: '2026-08-17',
  beef_meatballs: '2026-08-19',
  chicken_stroganoff: '2026-08-21',
  beef_pulled: '2026-08-24',
  chicken_meatballs: '2026-08-24',
  trout_spinach: '2026-08-27',
  chicken_pasta_zucchini: '2026-08-27',
}

/** Даты готовок августа 2026 — как в сетке пн/ср/пт. */
export function applyCookedOnPatch(board: CookBoard): CookBoard {
  const patches = board.patches ?? []
  if (patches.includes(COOKED_ON_PATCH)) return board

  const lastCookedOn = { ...(board.lastCookedOn ?? {}) }
  for (const [dishId, iso] of Object.entries(COOKED_ON_DATES)) {
    if (!lastCookedOn[dishId]) lastCookedOn[dishId] = iso
  }

  const fridge = board.fridge.map((dish) => {
    const iso = COOKED_ON_DATES[dish.dishId]
    if (!iso || dish.cookedOn === iso) return dish
    return { ...dish, cookedOn: iso }
  })

  const cooked = { ...board.cooked }
  const leftoverBatchId = makeBatchId('2026-08', 4, 'mon-tue')
  if (cooked[leftoverBatchId]) {
    cooked[leftoverBatchId] = {
      ...cooked[leftoverBatchId],
      cookedOn: COOKED_ON_DATES.beef_pulled,
    }
  }

  return {
    ...board,
    lastCookedOn,
    fridge,
    cooked,
    patches: [...patches, COOKED_ON_PATCH],
  }
}

/** Вернуть августовские даты, если случайное «Готово» стёрло сид. */
export function applyMissingCookedOnFill(board: CookBoard): CookBoard {
  const patches = board.patches ?? []
  if (patches.includes(COOKED_ON_FILL_PATCH)) return board
  const today = isoDate()
  const inFridge = new Set(
    board.fridge.filter((d) => d.remaining > 0).map((d) => d.dishId),
  )
  const lastCookedOn = { ...(board.lastCookedOn ?? {}) }
  for (const [dishId, iso] of Object.entries(COOKED_ON_DATES)) {
    if (!lastCookedOn[dishId]) lastCookedOn[dishId] = iso
  }
  for (const [dishId, iso] of Object.entries(lastCookedOn)) {
    if (inFridge.has(dishId)) continue
    if (iso !== today && iso <= today) continue
    const seeded = COOKED_ON_DATES[dishId]
    if (seeded) lastCookedOn[dishId] = seeded
    else delete lastCookedOn[dishId]
  }
  return {
    ...board,
    lastCookedOn,
    patches: [...patches, COOKED_ON_FILL_PATCH],
  }
}

const LEGS_WINGS_COOKED_ON = '2026-08-30'
const LEGS_WINGS_DISH_IDS = [
  'chicken_legs_honey',
  'chicken_legs_paprika',
  'wings_soy',
  'wings_paprika',
] as const

/** Ножки и крылья готовили 30 августа — не из слота календаря и не из случайного «Готово». */
export function applyLegsWingsCookedOnPatch(board: CookBoard): CookBoard {
  const patches = board.patches ?? []
  if (patches.includes(LEGS_WINGS_COOKED_ON_PATCH)) return board
  const lastCookedOn = { ...(board.lastCookedOn ?? {}) }
  for (const dishId of LEGS_WINGS_DISH_IDS) lastCookedOn[dishId] = LEGS_WINGS_COOKED_ON
  const fridge = board.fridge.map((dish) =>
    (LEGS_WINGS_DISH_IDS as readonly string[]).includes(dish.dishId)
      ? { ...dish, cookedOn: LEGS_WINGS_COOKED_ON }
      : dish,
  )
  return {
    ...board,
    lastCookedOn,
    fridge,
    patches: [...patches, LEGS_WINGS_COOKED_ON_PATCH],
  }
}

export function slotPrimaryDishIds(slot: MenuSlot): string[] {
  const ids: string[] = []
  if (slot.complete) ids.push(slot.complete.dishId)
  for (const m of slot.mains) ids.push(m.dishId)
  for (const s of slot.sides) ids.push(s.dishId)
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
  const cookedWith =
    typeof rec.cookedWith === 'string' && rec.cookedWith ? rec.cookedWith : undefined
  return {
    key: rec.key,
    batchId: rec.batchId,
    dishId: rec.dishId,
    cookedOn: rec.cookedOn,
    cookedPortions,
    remaining,
    eatDays,
    ...(cookedWith ? { cookedWith } : {}),
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
  const plannedDishIds = asPlannedMains(rec.plannedDishIds)
  return {
    cycleId: cycle,
    fridge,
    cooked,
    dishMarks,
    plannedDishIds,
    plannedSideByMain: asPlannedSides(rec.plannedSideByMain, plannedDishIds),
    shopHave: asShopHave(rec.shopHave),
    patches: asStringIds(rec.patches),
    lastCookedOn: asIsoDateMap(rec.lastCookedOn),
    prepTaken: parsePrepTaken(rec.prepTaken),
    rev: COOK_BOARD_REV,
  }
}

export function pendingBatchIds(board: CookBoard): string[] {
  return templateBatchIds(board.cycleId).filter((id) => !board.cooked[id])
}

export function cycleHasPendingOrFridge(board: CookBoard): boolean {
  return board.fridge.length > 0 || pendingBatchIds(board).length > 0
}

/** Цикл в id обновляем, холодильник, даты и план не сбрасываем. */
export function advanceCookBoard(board: CookBoard, todayCycle: string = cycleId()): CookBoard {
  if (board.cycleId === todayCycle) return board
  return { ...board, cycleId: todayCycle }
}

export function resolveCookBoard(
  raw: unknown,
  todayCycle: string = cycleId(),
): CookBoard {
  let board = advanceCookBoard(normalizeCookBoard(raw), todayCycle)
  if (isBareCookBoard(board)) board = seedPastPlanCooks(board)
  return applyLegsWingsCookedOnPatch(
    applyMissingCookedOnFill(applyCookedOnPatch(applyFridgeLeftoverPatch(board))),
  )
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
  const today = isoDate()
  const consider = (iso?: string) => {
    if (!iso || iso > today) return
    if (!latest || iso > latest) latest = iso
  }
  consider(board.lastCookedOn?.[dishId])
  for (const dish of board.fridge) {
    if (dish.dishId === dishId) consider(dish.cookedOn)
  }
  if (stats) consider(lastOutcomeCookedOn(stats, dishId))
  return latest
}

export function lastCookedOnForDishes(
  board: CookBoard,
  dishIds: string[],
  stats?: MealStatsStore,
): string | undefined {
  let latest: string | undefined
  for (const id of dishIds) {
    const iso = lastCookedOnForDish(board, id, stats)
    if (iso && (!latest || iso > latest)) latest = iso
  }
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
  cookedWith?: string,
): FridgeDish[] {
  const key = fridgeDishKey(batchId, dishId)
  const prev = fridge.find((d) => d.key === key)
  const without = fridge.filter((d) => d.key !== key)
  if (mark !== 'cooked' && mark !== 'leftover') return without
  const portions = prev?.cookedPortions ?? cookedPortions
  const remaining = prev?.remaining ?? portions
  if (remaining <= 0) return without
  const withSide = cookedWith ?? prev?.cookedWith
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
      ...(withSide ? { cookedWith: withSide } : {}),
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
  cookedWith?: string,
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
    cookedWith,
  )
  const lastCookedOn =
    nextMark === 'cooked' || nextMark === 'leftover'
      ? withLastCookedOn(board, dishId, cookedOn)
      : board.lastCookedOn
  const nextBoard = { ...board, dishMarks, fridge, lastCookedOn }
  const cooked = { ...board.cooked }
  if (batchAllMarked(nextBoard, batchId, batchDishIds)) {
    if (!cooked[batchId]) cooked[batchId] = { cookedOn, eatDays: DEFAULT_EAT_DAYS }
  } else {
    delete cooked[batchId]
  }
  const prepTaken = { ...(board.prepTaken ?? {}) }
  if (nextMark !== 'cooked' && nextMark !== 'leftover') delete prepTaken[key]
  return { ...nextBoard, cooked, prepTaken }
}

function forgetDishCook(
  board: CookBoard,
  dishId: string,
  batchId: string,
  batchDishIds: string[],
): CookBoard {
  const key = fridgeDishKey(batchId, dishId)
  const cookedOn = board.fridge.find((d) => d.key === key)?.cookedOn
  const dishMarks = { ...(board.dishMarks ?? {}) }
  delete dishMarks[key]
  const fridge = board.fridge.filter((d) => d.key !== key)
  const lastCookedOn = { ...(board.lastCookedOn ?? {}) }
  if (cookedOn && lastCookedOn[dishId] === cookedOn) {
    const seeded = COOKED_ON_DATES[dishId]
    if (seeded && seeded < cookedOn) lastCookedOn[dishId] = seeded
    else delete lastCookedOn[dishId]
  }
  const prepTaken = { ...(board.prepTaken ?? {}) }
  delete prepTaken[key]
  const nextBoard = { ...board, dishMarks, fridge, lastCookedOn, prepTaken }
  const cooked = { ...board.cooked }
  const ids = batchDishIds.length > 0 ? batchDishIds : dishIdsForBatch(batchId)
  if (!batchAllMarked(nextBoard, batchId, ids)) delete cooked[batchId]
  return { ...nextBoard, cooked }
}

function sidesCookedWithMain(
  board: CookBoard,
  dishId: string,
  batchId: string,
): string[] {
  const remembered = board.fridge
    .filter((d) => d.dishId === dishId && d.cookedWith)
    .map((d) => d.cookedWith!)
  if (remembered.length > 0) return [...new Set(remembered)]

  const main = board.fridge.find((d) => d.dishId === dishId && d.batchId === batchId)
  if (!main) return []
  const matching = matchingSideIds(dishId)
  const claimed = new Set(
    board.fridge
      .filter((d) => d.dishId !== dishId && d.cookedWith)
      .map((d) => d.cookedWith!),
  )
  return [
    ...new Set(
      board.fridge
        .filter(
          (d) =>
            d.batchId === batchId &&
            d.dishId !== dishId &&
            matching.includes(d.dishId) &&
            d.cookedOn === main.cookedOn &&
            !claimed.has(d.dishId),
        )
        .map((d) => d.dishId),
    ),
  ]
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
  if (!prepared) {
    const sides = sidesCookedWithMain(board, dishId, batchId)
    let next = forgetDishCook(board, dishId, batchId, batchDishIds)
    for (const sideId of sides) {
      next = forgetDishCook(next, sideId, batchId, batchDishIds)
    }
    return next
  }
  if (dishQueueGroup(board, dishId) === 'cooking') return board
  const sideId = board.plannedSideByMain?.[dishId]
  let next = applyDishMark(
    board,
    batchId,
    dishId,
    batchDishIds,
    'cooked',
    cookedOn,
    cookedPortions,
    typeof sideId === 'string' ? sideId : undefined,
  )
  if (typeof sideId === 'string') {
    next = applyDishMark(
      next,
      batchId,
      sideId,
      batchDishIds,
      'cooked',
      cookedOn,
      dishCookPortions(sideId),
    )
  }
  return unplanDish(next, dishId)
}

/** Убрать блюдо из холодильника и не считать эту готовку. */
export function discardFridgeDish(board: CookBoard, key: string): CookBoard {
  const dish = board.fridge.find((d) => d.key === key)
  if (!dish) return board
  return forgetDishCook(board, dish.dishId, dish.batchId, dishIdsForBatch(dish.batchId))
}

/** Положить к остаткам другой гарнир — без записи лишней готовки горячего. */
export function addFridgeSide(board: CookBoard, mainKey: string, sideId: string): CookBoard {
  return setFridgeSide(board, mainKey, sideId)
}

/** Заменить гарнир у остатка горячего или убрать его (chip «Без гарнира»). */
export function setFridgeSide(
  board: CookBoard,
  mainKey: string,
  sideId: string | null,
): CookBoard {
  const main = board.fridge.find((d) => d.key === mainKey)
  if (!main || dishMeta[main.dishId]?.kind === 'side') return board
  const matching = matchingSideIds(main.dishId)
  if (matching.length === 0) return board
  if (typeof sideId === 'string' && !matching.includes(sideId)) return board

  let next = board
  for (const row of board.fridge) {
    if (row.batchId !== main.batchId) continue
    if (!matching.includes(row.dishId)) continue
    if (typeof sideId === 'string' && row.dishId === sideId) continue
    next = discardFridgeDish(next, row.key)
  }

  if (typeof sideId !== 'string') {
    return {
      ...next,
      fridge: next.fridge.map((d) =>
        d.key === mainKey ? { ...d, cookedWith: undefined } : d,
      ),
    }
  }

  if (next.fridge.some((d) => d.dishId === sideId && d.remaining > 0)) {
    return {
      ...next,
      fridge: next.fridge.map((d) =>
        d.key === mainKey ? { ...d, cookedWith: sideId } : d,
      ),
    }
  }

  const marked = applyDishMark(
    next,
    main.batchId,
    sideId,
    dishIdsForBatch(main.batchId),
    'cooked',
    main.cookedOn,
    dishCookPortions(sideId),
  )
  return {
    ...marked,
    fridge: marked.fridge.map((d) =>
      d.key === mainKey ? { ...d, cookedWith: sideId } : d,
    ),
  }
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

