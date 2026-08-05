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

function addDays(base: Date, days: number): Date {
  const d = new Date(base)
  d.setDate(d.getDate() + days)
  return d
}

function dayMonth(d: Date): string {
  return `${d.getDate()}.${String(d.getMonth() + 1).padStart(2, '0')}`
}

function rangeLabel(from: Date, to: Date): string {
  return `${dayMonth(from)} - ${dayMonth(to)}`
}

/** Подпись на пакет: «нед.1 · 5.08 - 6.08» */
export function packUseLabel(week: number, slot: MenuSlotId): string {
  const weekStart = addDays(monthStart, (week - 1) * 7)
  const { start, end } = slotOffset[slot]
  const from = addDays(weekStart, start)
  const to = addDays(weekStart, end)
  return `нед.${week} · ${rangeLabel(from, to)}`
}

export function weekRangeLabel(week: number): string {
  const weekStart = addDays(monthStart, (week - 1) * 7)
  const weekEnd = addDays(weekStart, 6)
  return rangeLabel(weekStart, weekEnd)
}
