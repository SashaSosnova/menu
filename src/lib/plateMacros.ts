import { getDish } from '../data/dishes'
import {
  menuRefIds,
  type MenuDishRef,
  type MenuSlot,
} from '../data/menu'
import { people, type PersonId, type PersonPortion } from '../data/portions'
import type { Macros } from '../data/types'

export function getPersonPortion(id: PersonId): PersonPortion {
  return people.find((p) => p.id === id) ?? people[0]
}

export function scaleMacros(macros: Macros, grams: number): Macros {
  const k = grams / 100
  return {
    kcal: macros.kcal * k,
    protein: macros.protein * k,
    fat: macros.fat * k,
    carbs: macros.carbs * k,
  }
}

export function addMacros(a: Macros, b: Macros): Macros {
  return {
    kcal: a.kcal + b.kcal,
    protein: a.protein + b.protein,
    fat: a.fat + b.fat,
    carbs: a.carbs + b.carbs,
  }
}

export function roundMacros(m: Macros): Macros {
  return {
    kcal: Math.round(m.kcal),
    protein: Math.round(m.protein),
    fat: Math.round(m.fat),
    carbs: Math.round(m.carbs),
  }
}

function dishName(id: string): string {
  return getDish(id)?.name ?? id
}

function macrosForDishGrams(dishId: string, grams: number): Macros | undefined {
  const macros = getDish(dishId)?.macros
  if (!macros) return undefined
  return scaleMacros(macros, grams)
}

export type PlateCombo = {
  key: string
  /** Подпись вида «Горячее 1 + гарнир 2» */
  roleLabel: string
  hotName: string
  sideName?: string
  hotId: string
  sideId?: string
  /** Цельное блюдо без отдельного гарнира */
  complete: boolean
  macros?: Macros
  /** Если у блюда варианты маринада — мин/макс ккал по вариантам */
  kcalRange?: { min: number; max: number }
}

function plateFromHotSide(
  hotId: string,
  sideId: string | undefined,
  person: PersonPortion,
  complete: boolean,
): Macros | undefined {
  if (complete) {
    return macrosForDishGrams(hotId, person.proteinG + person.sideG)
  }
  const hot = macrosForDishGrams(hotId, person.proteinG)
  const side = sideId ? macrosForDishGrams(sideId, person.sideG) : undefined
  if (!hot || !side) return undefined
  return addMacros(hot, side)
}

function resolveRefIndex(refs: MenuDishRef[], dishId: string): number {
  return refs.findIndex((ref) => menuRefIds(ref).includes(dishId))
}

function roleLabel(hotIndex: number, sideIndex: number | undefined, complete: boolean): string {
  if (complete) return 'Цельное'
  if (sideIndex === undefined) return `Горячее ${hotIndex + 1}`
  return `Горячее ${hotIndex + 1} + гарнир ${sideIndex + 1}`
}

function expandComboVariants(
  hotIds: string[],
  sideIds: string[] | undefined,
  person: PersonPortion,
  complete: boolean,
  hotIndex: number,
  sideIndex: number | undefined,
): PlateCombo {
  const variants: { hotId: string; sideId?: string; macros?: Macros }[] = []
  for (const hotId of hotIds) {
    if (complete || !sideIds?.length) {
      variants.push({
        hotId,
        macros: plateFromHotSide(hotId, undefined, person, complete),
      })
    } else {
      for (const sideId of sideIds) {
        variants.push({
          hotId,
          sideId,
          macros: plateFromHotSide(hotId, sideId, person, false),
        })
      }
    }
  }

  const primary = variants[0]
  const kcals = variants
    .map((v) => v.macros?.kcal)
    .filter((n): n is number => typeof n === 'number')
  const min = kcals.length ? Math.min(...kcals) : undefined
  const max = kcals.length ? Math.max(...kcals) : undefined
  const kcalRange =
    min !== undefined && max !== undefined && Math.round(min) !== Math.round(max)
      ? { min, max }
      : undefined

  return {
    key: `${complete ? 'c' : 'h'}:${hotIds.join('|')}+${sideIds?.join('|') ?? ''}`,
    roleLabel: roleLabel(hotIndex, sideIndex, complete),
    hotName: hotIds.map(dishName).join(' / '),
    sideName: sideIds?.map(dishName).join(' / '),
    hotId: primary.hotId,
    sideId: primary.sideId,
    complete,
    macros: primary.macros ? roundMacros(primary.macros) : undefined,
    kcalRange: kcalRange
      ? { min: Math.round(kcalRange.min), max: Math.round(kcalRange.max) }
      : undefined,
  }
}

/** Допустимые тарелки слота для выбранной роли. */
export function slotPlateCombos(slot: MenuSlot, personId: PersonId = 'woman'): PlateCombo[] {
  const person = getPersonPortion(personId)
  const combos: PlateCombo[] = []

  if (slot.complete) {
    combos.push(
      expandComboVariants(menuRefIds(slot.complete), undefined, person, true, 0, undefined),
    )
  }

  if (slot.pairs?.length) {
    const seen = new Set<string>()
    for (const [hotId, sideId] of slot.pairs) {
      const hotRef = slot.mains.find((m) => menuRefIds(m).includes(hotId))
      const sideRef = slot.sides.find((s) => menuRefIds(s).includes(sideId))
      if (!hotRef || !sideRef) continue
      const hotIds = menuRefIds(hotRef)
      const sideIds = menuRefIds(sideRef)
      const groupKey = `${hotRef.dishId}+${sideRef.dishId}`
      if (seen.has(groupKey)) continue
      seen.add(groupKey)
      const hotIndex = resolveRefIndex(slot.mains, hotId)
      const sideIndex = resolveRefIndex(slot.sides, sideId)
      combos.push(
        expandComboVariants(
          hotIds,
          sideIds,
          person,
          false,
          Math.max(0, hotIndex),
          Math.max(0, sideIndex),
        ),
      )
    }
    return combos
  }

  for (let hi = 0; hi < slot.mains.length; hi++) {
    const hotRef = slot.mains[hi]
    for (let si = 0; si < slot.sides.length; si++) {
      const sideRef = slot.sides[si]
      combos.push(
        expandComboVariants(
          menuRefIds(hotRef),
          menuRefIds(sideRef),
          person,
          false,
          hi,
          si,
        ),
      )
    }
  }

  return combos
}

export function sumComboKcal(combos: PlateCombo[]): number {
  return combos.reduce((sum, c) => sum + (c.macros?.kcal ?? 0), 0)
}

/**
 * Сумма порций всех блюд слота (горячие + гарниры + цельное).
 * Комбинации не важны: каждое блюдо учитывается один раз.
 */
export function slotDishesTotalKcal(slot: MenuSlot, personId: PersonId = 'woman'): number {
  const person = getPersonPortion(personId)
  let total = 0

  if (slot.complete) {
    const m = macrosForDishGrams(slot.complete.dishId, person.proteinG + person.sideG)
    if (m) total += m.kcal
  }

  for (const main of slot.mains) {
    const m = macrosForDishGrams(main.dishId, person.proteinG)
    if (m) total += m.kcal
  }

  for (const side of slot.sides) {
    const m = macrosForDishGrams(side.dishId, person.sideG)
    if (m) total += m.kcal
  }

  return Math.round(total)
}
