/**
 * Календарь меню: 4 недели с первого понедельника месяца.
 * В воскресенье уже переключаемся на следующую неделю (подготовка).
 * После 4-й недели цикл стартует заново со следующего месяца.
 */

import { weekNumbers, type WeekNumber } from './weeks'

export type MenuSlotId = 'mon-tue' | 'wed-thu' | 'fri-sat'

const slotOffset: Record<MenuSlotId, { start: number; end: number }> = {
  'mon-tue': { start: 0, end: 1 },
  'wed-thu': { start: 2, end: 3 },
  'fri-sat': { start: 4, end: 5 },
}

const MS_DAY = 24 * 60 * 60 * 1000
const CYCLE_DAYS = 28

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

export function addDays(base: Date, days: number): Date {
  const d = new Date(base)
  d.setDate(d.getDate() + days)
  return d
}

/** Локальная дата YYYY-MM-DD. */
export function isoDate(d: Date = new Date()): string {
  const x = startOfDay(d)
  return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`
}

export function dateFromIso(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, (m ?? 1) - 1, d ?? 1)
}

/** Старт цикла из id «2026-08». */
export function cycleStartFromId(id: string): Date {
  const [ys, ms] = id.split('-')
  const y = Number(ys)
  const m = Number(ms)
  return firstMondayOfMonth(y, (m || 1) - 1)
}

function daysBetween(from: Date, to: Date): number {
  return Math.round((startOfDay(to).getTime() - startOfDay(from).getTime()) / MS_DAY)
}

/** Первый понедельник месяца (1-е, если оно уже понедельник). */
export function firstMondayOfMonth(year: number, monthIndex: number): Date {
  const d = new Date(year, monthIndex, 1)
  const day = d.getDay() // 0=вс … 1=пн … 6=сб
  const add = day === 0 ? 1 : day === 1 ? 0 : 8 - day
  return new Date(year, monthIndex, 1 + add)
}

/**
 * Опорная дата для выбора недели: в воскресенье смотрим уже на понедельник
 * следующей недели (свободный день / заготовки вперёд).
 */
export function weekRefDate(today: Date = new Date()): Date {
  const d = startOfDay(today)
  if (d.getDay() === 0) d.setDate(d.getDate() + 1)
  return d
}

export type CycleContext = {
  monthStart: Date
  week: WeekNumber
}

/** Текущий 4-недельный цикл и номер вкладки. */
export function getCycleContext(today: Date = new Date()): CycleContext {
  const ref = weekRefDate(today)
  let start = firstMondayOfMonth(ref.getFullYear(), ref.getMonth())

  if (ref < start) {
    const prev = new Date(ref.getFullYear(), ref.getMonth() - 1, 1)
    start = firstMondayOfMonth(prev.getFullYear(), prev.getMonth())
  }

  let offset = daysBetween(start, ref)

  if (offset >= CYCLE_DAYS) {
    const nextMonth = new Date(start.getFullYear(), start.getMonth() + 1, 1)
    start = firstMondayOfMonth(nextMonth.getFullYear(), nextMonth.getMonth())
    offset = daysBetween(start, ref)
    if (offset < 0) {
      return { monthStart: start, week: 1 }
    }
  }

  const week = weekNumbers[
    Math.min(weekNumbers.length - 1, Math.max(0, Math.floor(offset / 7)))
  ]
  return { monthStart: start, week }
}

export function getMonthStart(today: Date = new Date()): Date {
  return getCycleContext(today).monthStart
}

/** Старт текущего цикла на момент загрузки модуля (этикетки, скрипты). */
export const monthStart: Date = getMonthStart()

/** Идентификатор 4-недельного цикла, например «2026-08». */
export function cycleId(start: Date = getMonthStart()): string {
  return `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}`
}

function weekStartDate(week: number, cycleStart: Date = getMonthStart()): Date {
  return addDays(cycleStart, (week - 1) * 7)
}

/** Дата старта слота (пн / ср / пт) в цикле. */
export function slotStartIso(
  week: number,
  slot: MenuSlotId,
  cycleStart: Date = getMonthStart(),
): string {
  return isoDate(addDays(weekStartDate(week, cycleStart), slotOffset[slot].start))
}

/** Срок хранения в морозилке: дата заготовки + N месяцев → «до ДД.ММ.ГГГГ» */
export function freezerBestBefore(
  from: Date = getMonthStart(),
  months = 3,
): string {
  const d = new Date(from)
  d.setMonth(d.getMonth() + months)
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const yyyy = d.getFullYear()
  return `до ${dd}.${mm}.${yyyy}`
}

/** «сегодня», «вчера», «5 дн. назад», «29.08» или «29.08.2025». */
export function formatLastCookedOn(iso: string, today: Date = new Date()): string {
  const cooked = dateFromIso(iso)
  const days = daysBetween(cooked, startOfDay(today))
  if (days === 0) return 'сегодня'
  if (days === 1) return 'вчера'
  if (days >= 2 && days < 14) return `${days} дн. назад`
  const dd = String(cooked.getDate()).padStart(2, '0')
  const mm = String(cooked.getMonth() + 1).padStart(2, '0')
  if (cooked.getFullYear() !== today.getFullYear()) {
    return `${dd}.${mm}.${cooked.getFullYear()}`
  }
  return `${dd}.${mm}`
}

export function lastCookedCaption(iso?: string, today: Date = new Date()): string {
  if (!iso) return 'ещё не готовили'
  return `готовили ${formatLastCookedOn(iso, today)}`
}

/** «заморозили сегодня», «вчера», «N дн. назад» или дата. */
export function frozenOnCaption(iso?: string, today: Date = new Date()): string {
  if (!iso) return 'дата заморозки не записана'
  return `заморозили ${formatLastCookedOn(iso, today)}`
}

