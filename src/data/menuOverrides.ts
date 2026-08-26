/**
 * Локальные правки меню поверх weekMenus: замена блюда или обмен местами.
 * Ключ позиции: «неделя:слот:роль:индекс».
 */

import { dishMeta } from './dishMeta'
import { getDish } from './dishes'
import {
  getWeekMenu,
  menuRefIds,
  type MenuDishRef,
  type MenuSlot,
  type WeekMenu,
} from './menu'
import type { MenuSlotId } from './calendar'
import type { DishKind } from './types'

export type MenuRole = 'complete' | 'mains' | 'sides'

export type MenuPosition = {
  week: number
  slotId: MenuSlotId
  role: MenuRole
  index: number
}

export type MenuOverrides = Record<string, MenuDishRef>

export type SideGroup = 'potato' | 'grain' | 'veg' | 'pasta' | 'salad' | 'other'

const SIDE_GROUP: Record<string, SideGroup> = {
  mash: 'potato',
  boiled_potato: 'potato',
  buckwheat_veg: 'grain',
  rice_veg: 'grain',
  bulgur_veg: 'grain',
  broccoli_steam: 'veg',
  cauliflower: 'veg',
  roast_veg: 'veg',
  pasta: 'pasta',
  veg_salad: 'salad',
}

export function menuPosKey(pos: MenuPosition): string {
  return `${pos.week}:${pos.slotId}:${pos.role}:${pos.index}`
}

export function cloneMenuRef(ref: MenuDishRef): MenuDishRef {
  return {
    dishId: ref.dishId,
    ...(ref.orDishIds?.length ? { orDishIds: [...ref.orDishIds] } : {}),
    ...(ref.label ? { label: ref.label } : {}),
    ...(ref.daySauceId ? { daySauceId: ref.daySauceId } : {}),
  }
}

export function menuRefsEqual(a: MenuDishRef, b: MenuDishRef): boolean {
  return (
    a.dishId === b.dishId &&
    (a.label ?? '') === (b.label ?? '') &&
    (a.daySauceId ?? '') === (b.daySauceId ?? '') &&
    JSON.stringify(a.orDishIds ?? []) === JSON.stringify(b.orDishIds ?? [])
  )
}

export function getSlotRef(
  slot: MenuSlot,
  role: MenuRole,
  index: number,
): MenuDishRef | undefined {
  if (role === 'complete') return index === 0 ? slot.complete : undefined
  if (role === 'mains') return slot.mains[index]
  return slot.sides[index]
}

export function catalogKindForRole(role: MenuRole): DishKind {
  if (role === 'complete') return 'complete'
  if (role === 'mains') return 'component'
  return 'side'
}

export function roleTitle(role: MenuRole): string {
  if (role === 'complete') return 'цельное'
  if (role === 'mains') return 'горячее'
  return 'гарнир'
}

export function sideGroup(dishId: string): SideGroup {
  return SIDE_GROUP[dishId] ?? 'other'
}

export function sideGroupLabel(group: SideGroup): string {
  if (group === 'potato') return 'картофель'
  if (group === 'grain') return 'крупа'
  if (group === 'veg') return 'овощи'
  if (group === 'pasta') return 'паста'
  if (group === 'salad') return 'салат'
  return 'гарнир'
}

export function weekHasOverrides(overrides: MenuOverrides, week: number): boolean {
  const prefix = `${week}:`
  return Object.keys(overrides).some((key) => key.startsWith(prefix))
}

export function isPositionOverridden(overrides: MenuOverrides, pos: MenuPosition): boolean {
  return menuPosKey(pos) in overrides
}

function pickRef(
  pos: MenuPosition,
  seed: MenuDishRef,
  overrides: MenuOverrides,
): MenuDishRef {
  const over = overrides[menuPosKey(pos)]
  return cloneMenuRef(over ?? seed)
}

function remapPairsByIndex(original: MenuSlot, next: MenuSlot): MenuSlot['pairs'] {
  if (!original.pairs?.length) return original.pairs
  const remapped: [string, string][] = []
  for (const [hotId, sideId] of original.pairs) {
    const mainIdx = original.mains.findIndex((m) => menuRefIds(m).includes(hotId))
    const sideIdx = original.sides.findIndex((s) => menuRefIds(s).includes(sideId))
    if (mainIdx < 0 || sideIdx < 0) continue
    const hotVariant = menuRefIds(original.mains[mainIdx]).indexOf(hotId)
    const sideVariant = menuRefIds(original.sides[sideIdx]).indexOf(sideId)
    const newHotIds = menuRefIds(next.mains[mainIdx]!)
    const newSideIds = menuRefIds(next.sides[sideIdx]!)
    const newHot = newHotIds[hotVariant] ?? newHotIds[0]
    const newSide = newSideIds[sideVariant] ?? newSideIds[0]
    if (newHot && newSide) remapped.push([newHot, newSide])
  }
  return remapped.length ? remapped : undefined
}

export function applyMenuOverrides(base: WeekMenu, overrides: MenuOverrides): WeekMenu {
  return {
    ...base,
    slots: base.slots.map((slot) => {
      const complete =
        slot.complete != null
          ? pickRef(
              { week: base.week, slotId: slot.id, role: 'complete', index: 0 },
              slot.complete,
              overrides,
            )
          : undefined
      const mains = slot.mains.map((ref, index) =>
        pickRef({ week: base.week, slotId: slot.id, role: 'mains', index }, ref, overrides),
      )
      const sides = slot.sides.map((ref, index) =>
        pickRef({ week: base.week, slotId: slot.id, role: 'sides', index }, ref, overrides),
      )
      const next: MenuSlot = { ...slot, complete, mains, sides }
      next.pairs = remapPairsByIndex(slot, next)
      return next
    }),
  }
}

export function getEffectiveWeekMenu(
  week: number,
  overrides: MenuOverrides | undefined,
): WeekMenu {
  const base = getWeekMenu(week)
  if (!overrides || Object.keys(overrides).length === 0) return base
  return applyMenuOverrides(base, overrides)
}

export function getEffectiveSlot(
  week: number,
  slotId: MenuSlotId,
  overrides: MenuOverrides | undefined,
): MenuSlot {
  const menu = getEffectiveWeekMenu(week, overrides)
  return menu.slots.find((s) => s.id === slotId) ?? getWeekMenu(week).slots.find((s) => s.id === slotId)!
}

export function findDishPosition(
  menu: WeekMenu,
  dishId: string,
  role: MenuRole,
): Omit<MenuPosition, 'week'> | undefined {
  for (const slot of menu.slots) {
    if (role === 'complete' && slot.complete && menuRefIds(slot.complete).includes(dishId)) {
      return { slotId: slot.id, role, index: 0 }
    }
    if (role === 'mains') {
      const index = slot.mains.findIndex((m) => menuRefIds(m).includes(dishId))
      if (index >= 0) return { slotId: slot.id, role, index }
    }
    if (role === 'sides') {
      const index = slot.sides.findIndex((s) => menuRefIds(s).includes(dishId))
      if (index >= 0) return { slotId: slot.id, role, index }
    }
  }
  return undefined
}

export function setMenuRef(
  overrides: MenuOverrides,
  week: number,
  pos: Omit<MenuPosition, 'week'>,
  ref: MenuDishRef,
): MenuOverrides {
  const seed = getWeekMenu(week)
  const slot = seed.slots.find((s) => s.id === pos.slotId)
  const seedRef = slot ? getSlotRef(slot, pos.role, pos.index) : undefined
  const key = menuPosKey({ week, ...pos })
  const next = { ...overrides }
  if (seedRef && menuRefsEqual(seedRef, ref)) delete next[key]
  else next[key] = cloneMenuRef(ref)
  return next
}

export function swapMenuPositions(
  overrides: MenuOverrides,
  week: number,
  a: Omit<MenuPosition, 'week'>,
  b: Omit<MenuPosition, 'week'>,
): MenuOverrides {
  if (a.slotId === b.slotId && a.role === b.role && a.index === b.index) return overrides
  const menu = getEffectiveWeekMenu(week, overrides)
  const slotA = menu.slots.find((s) => s.id === a.slotId)
  const slotB = menu.slots.find((s) => s.id === b.slotId)
  const refA = slotA ? getSlotRef(slotA, a.role, a.index) : undefined
  const refB = slotB ? getSlotRef(slotB, b.role, b.index) : undefined
  if (!refA || !refB) return overrides
  return setMenuRef(setMenuRef(overrides, week, a, refB), week, b, refA)
}

export function replaceMenuDish(
  overrides: MenuOverrides,
  week: number,
  pos: Omit<MenuPosition, 'week'>,
  dishId: string,
): MenuOverrides {
  const menu = getEffectiveWeekMenu(week, overrides)
  const slot = menu.slots.find((s) => s.id === pos.slotId)
  const current = slot ? getSlotRef(slot, pos.role, pos.index) : undefined
  if (current?.dishId === dishId) return overrides

  const occupied = findDishPosition(menu, dishId, pos.role)
  if (
    occupied &&
    (occupied.slotId !== pos.slotId || occupied.role !== pos.role || occupied.index !== pos.index)
  ) {
    return swapMenuPositions(overrides, week, pos, occupied)
  }

  return setMenuRef(overrides, week, pos, { dishId })
}

export function resetMenuPosition(
  overrides: MenuOverrides,
  week: number,
  pos: Omit<MenuPosition, 'week'>,
): MenuOverrides {
  const seed = getWeekMenu(week)
  const seedSlot = seed.slots.find((s) => s.id === pos.slotId)
  const seedRef = seedSlot ? getSlotRef(seedSlot, pos.role, pos.index) : undefined
  const menu = getEffectiveWeekMenu(week, overrides)
  const currentSlot = menu.slots.find((s) => s.id === pos.slotId)
  const currentRef = currentSlot ? getSlotRef(currentSlot, pos.role, pos.index) : undefined

  const next = { ...overrides }
  delete next[menuPosKey({ week, ...pos })]

  if (!seedRef || !currentRef) return next

  const counterpart = findDishPosition(menu, seedRef.dishId, pos.role)
  if (
    counterpart &&
    (counterpart.slotId !== pos.slotId || counterpart.index !== pos.index)
  ) {
    const counterpartSeedSlot = seed.slots.find((s) => s.id === counterpart.slotId)
    const counterpartSeed = counterpartSeedSlot
      ? getSlotRef(counterpartSeedSlot, counterpart.role, counterpart.index)
      : undefined
    if (counterpartSeed && counterpartSeed.dishId === currentRef.dishId) {
      delete next[menuPosKey({ week, ...counterpart })]
    }
  }

  return next
}

export function resetWeekOverrides(overrides: MenuOverrides, week: number): MenuOverrides {
  const prefix = `${week}:`
  const next = { ...overrides }
  for (const key of Object.keys(next)) {
    if (key.startsWith(prefix)) delete next[key]
  }
  return next
}

export function dishKindOf(dishId: string, fallback?: DishKind): DishKind | undefined {
  return dishMeta[dishId]?.kind ?? getDish(dishId)?.kind ?? fallback
}

export function sideFitsMain(sideId: string, mainId: string): boolean {
  const allowed = dishMeta[mainId]?.sides
  if (!allowed?.length) return true
  return allowed.includes(sideId)
}

export type PairFit = 'good'

/** Как гарнир сочетается с выбранным горячим. */
export function pairFitForSide(
  main: { item: MenuDishRef; slot: MenuSlot; complete?: boolean },
  side: { item: MenuDishRef },
): PairFit | null {
  if (main.complete) return null
  const mainIds = menuRefIds(main.item)
  const sideIds = menuRefIds(side.item)
  const tasty = mainIds.some((mid) => sideIds.some((sid) => sideFitsMain(sid, mid)))
  return tasty ? 'good' : null
}

export const PAIR_FIT_LABEL: Record<PairFit, string> = {
  good: 'вкусно',
}

export function sideFitInSlot(
  sideId: string,
  slot: MenuSlot,
): { ok: boolean; misses: string[] } {
  const misses: string[] = []
  for (const main of slot.mains) {
    for (const id of menuRefIds(main)) {
      if (!sideFitsMain(sideId, id)) {
        misses.push(getDish(id)?.name ?? id)
      }
    }
  }
  return { ok: misses.length === 0, misses: [...new Set(misses)] }
}

export function mainFitInSlot(
  mainId: string,
  slot: MenuSlot,
): { ok: boolean; misses: string[] } {
  const misses: string[] = []
  for (const side of slot.sides) {
    for (const id of menuRefIds(side)) {
      if (!sideFitsMain(id, mainId)) {
        misses.push(getDish(id)?.name ?? id)
      }
    }
  }
  return { ok: misses.length === 0, misses: [...new Set(misses)] }
}

export function slotSideGroupConflict(
  slot: MenuSlot,
  replacingIndex: number,
  newSideId: string,
): boolean {
  const group = sideGroup(newSideId)
  if (group === 'other') return false
  return slot.sides.some((side, index) => index !== replacingIndex && sideGroup(side.dishId) === group)
}

export type MenuDishSpot = Omit<MenuPosition, 'week'> & {
  title: string
  ref: MenuDishRef
}

export function listRoleSpots(menu: WeekMenu, role: MenuRole): MenuDishSpot[] {
  const spots: MenuDishSpot[] = []
  for (const slot of menu.slots) {
    if (role === 'complete' && slot.complete) {
      spots.push({ slotId: slot.id, role, index: 0, title: slot.title, ref: slot.complete })
    }
    if (role === 'mains') {
      slot.mains.forEach((ref, index) => {
        spots.push({ slotId: slot.id, role, index, title: slot.title, ref })
      })
    }
    if (role === 'sides') {
      slot.sides.forEach((ref, index) => {
        spots.push({ slotId: slot.id, role, index, title: slot.title, ref })
      })
    }
  }
  return spots
}
