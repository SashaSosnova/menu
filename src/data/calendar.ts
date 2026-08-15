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

const MONTH_GENITIVE = [
  'января',
  'февраля',
  'марта',
  'апреля',
  'мая',
  'июня',
  'июля',
  'августа',
  'сентября',
  'октября',
  'ноября',
  'декабря',
] as const

const SLOT_DAY_NAMES: Record<MenuSlotId, [string, string]> = {
  'mon-tue': ['Понедельник', 'Вторник'],
  'wed-thu': ['Среда', 'Четверг'],
  'fri-sat': ['Пятница', 'Суббота'],
}

const MS_DAY = 24 * 60 * 60 * 1000
const CYCLE_DAYS = 28

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

function addDays(base: Date, days: number): Date {
  const d = new Date(base)
  d.setDate(d.getDate() + days)
  return d
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

export function getCurrentWeekNumber(today: Date = new Date()): WeekNumber {
  return getCycleContext(today).week
}

/** Старт текущего цикла на момент загрузки модуля (этикетки, скрипты). */
export const monthStart: Date = getMonthStart()

/** Идентификатор 4-недельного цикла, например «2026-08». */
export function cycleId(start: Date = getMonthStart()): string {
  return `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}`
}

export function previousCycleStart(start: Date = getMonthStart()): Date {
  const prevMonth = new Date(start.getFullYear(), start.getMonth() - 1, 1)
  return firstMondayOfMonth(prevMonth.getFullYear(), prevMonth.getMonth())
}

/** «3 августа – 30 августа» — пн недели 1 … вс недели 4 */
export function cycleRangeLabel(start: Date = getMonthStart()): string {
  return dateRangeGenitive(start, addDays(start, 27))
}

function dayMonthGenitive(d: Date): string {
  return `${d.getDate()} ${MONTH_GENITIVE[d.getMonth()]}`
}

function dayMonthNumeric(d: Date): string {
  return `${d.getDate()}.${String(d.getMonth() + 1).padStart(2, '0')}`
}

function rangeLabel(from: Date, to: Date): string {
  return `${dayMonthNumeric(from)} - ${dayMonthNumeric(to)}`
}

function dateRangeGenitive(from: Date, to: Date): string {
  if (from.getMonth() === to.getMonth()) {
    return `${from.getDate()} – ${to.getDate()} ${MONTH_GENITIVE[from.getMonth()]}`
  }
  return `${dayMonthGenitive(from)} – ${dayMonthGenitive(to)}`
}

function weekStartDate(week: number, cycleStart: Date = getMonthStart()): Date {
  return addDays(cycleStart, (week - 1) * 7)
}

/** «5 августа - 6 августа (Среда + Четверг)» */
export function slotRangeLabel(
  week: number,
  slot: MenuSlotId,
  cycleStart: Date = getMonthStart(),
): string {
  const weekStart = weekStartDate(week, cycleStart)
  const { start, end } = slotOffset[slot]
  const from = addDays(weekStart, start)
  const to = addDays(weekStart, end)
  const [day1, day2] = SLOT_DAY_NAMES[slot]
  return `${dayMonthGenitive(from)} - ${dayMonthGenitive(to)} (${day1} + ${day2})`
}

/** Подпись на пакет: «нед.1 · 5.08 - 6.08» */
export function packUseLabel(
  week: number,
  slot: MenuSlotId,
  cycleStart: Date = getMonthStart(),
): string {
  const weekStart = weekStartDate(week, cycleStart)
  const { start, end } = slotOffset[slot]
  const from = addDays(weekStart, start)
  const to = addDays(weekStart, end)
  return `нед.${week} · ${rangeLabel(from, to)}`
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

/** «3 – 9 августа» — полная неделя пн–вс */
export function weekRangeLabel(
  week: number,
  cycleStart: Date = getMonthStart(),
): string {
  const weekStart = weekStartDate(week, cycleStart)
  const weekEnd = addDays(weekStart, 6)
  return dateRangeGenitive(weekStart, weekEnd)
}
