/** Номера недель шаблона меню. */
export const weekNumbers = [1, 2, 3, 4] as const

export type WeekNumber = (typeof weekNumbers)[number]
