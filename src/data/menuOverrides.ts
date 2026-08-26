/**
 * Правки меню поверх weekMenus (сохранённые замены).
 * Ключ позиции: «неделя:слот:роль:индекс».
 */

import { dishMeta } from './dishMeta'
import {
  getWeekMenu,
  menuRefIds,
  type MenuDishRef,
  type MenuSlot,
  type WeekMenu,
} from './menu'
import type { MenuSlotId } from './calendar'

export type MenuRole = 'complete' | 'mains' | 'sides'

export type MenuPosition = {
  week: number
  slotId: MenuSlotId
  role: MenuRole
  index: number
}

export type MenuOverrides = Record<string, MenuDishRef>

function menuPosKey(pos: MenuPosition): string {
  return `${pos.week}:${pos.slotId}:${pos.role}:${pos.index}`
}

function cloneMenuRef(ref: MenuDishRef): MenuDishRef {
  return {
    dishId: ref.dishId,
    ...(ref.orDishIds?.length ? { orDishIds: [...ref.orDishIds] } : {}),
    ...(ref.label ? { label: ref.label } : {}),
    ...(ref.daySauceId ? { daySauceId: ref.daySauceId } : {}),
  }
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

function sideFitsMain(sideId: string, mainId: string): boolean {
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
