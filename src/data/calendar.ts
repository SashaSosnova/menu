/**
 * Календарь меню. Нед.1 начинается в понедельник.
 * Сейчас: 3.08–9.08.2026.
 */
export const monthStart = new Date(2026, 7, 3) // 3 августа 2026

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

function addDays(base: Date, days: number): Date {
  const d = new Date(base)
  d.setDate(d.getDate() + days)
  return d
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

/** «5 августа - 6 августа (Среда + Четверг)» */
export function slotRangeLabel(week: number, slot: MenuSlotId): string {
  const weekStart = addDays(monthStart, (week - 1) * 7)
  const { start, end } = slotOffset[slot]
  const from = addDays(weekStart, start)
  const to = addDays(weekStart, end)
  const [day1, day2] = SLOT_DAY_NAMES[slot]
  return `${dayMonthGenitive(from)} - ${dayMonthGenitive(to)} (${day1} + ${day2})`
}

/** Подпись на пакет: «нед.1 · 5.08 - 6.08» */
export function packUseLabel(week: number, slot: MenuSlotId): string {
  const weekStart = addDays(monthStart, (week - 1) * 7)
  const { start, end } = slotOffset[slot]
  const from = addDays(weekStart, start)
  const to = addDays(weekStart, end)
  return `нед.${week} · ${rangeLabel(from, to)}`
}

function dateRangeGenitive(from: Date, to: Date): string {
  if (from.getMonth() === to.getMonth()) {
    return `${from.getDate()} – ${to.getDate()} ${MONTH_GENITIVE[from.getMonth()]}`
  }
  return `${dayMonthGenitive(from)} – ${dayMonthGenitive(to)}`
}

/** «3 – 9 августа» — полная неделя пн–вс */
export function weekRangeLabel(week: number): string {
  const weekStart = addDays(monthStart, (week - 1) * 7)
  const weekEnd = addDays(weekStart, 6)
  return dateRangeGenitive(weekStart, weekEnd)
}
