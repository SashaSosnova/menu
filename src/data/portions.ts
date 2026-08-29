/**
 * Порции на два дня.
 *
 * 4 порции — ребёнок это блюдо не ест (двое взрослых):
 *   горячее 700 г, цельное 900 г
 * 6 порций — ребёнок ест:
 *   горячее 900 г, цельное 1200 г
 *
 * Гарнир на 2 приёма: 100 + 150 + 100 = 350 г × 2 = 700 г
 * КБЖУ у блюд в меню — на 100 г.
 */

export type PersonId = 'woman' | 'man' | 'child'

export type PersonPortion = {
  id: PersonId
  label: string
  /** Сколько таких человек в семье */
  count: number
  dayKcal: number
  mealKcal: number
  /** Горячее на тарелке (весь компонент с соусом) на 1 человека за приём */
  proteinG: number
  /** Готовый гарнир на 1 человека за приём */
  sideG: number
  /** Гарнир меньше, если в приёме уже тушёные овощи */
  sideWithStewedG: number
  stewedVegG: number
  saladG: number
}

export const people: PersonPortion[] = [
  {
    id: 'woman',
    label: 'Женщина',
    count: 1,
    dayKcal: 1350,
    mealKcal: 410,
    proteinG: 150,
    sideG: 100,
    sideWithStewedG: 75,
    stewedVegG: 120,
    saladG: 100,
  },
  {
    id: 'man',
    label: 'Мужчина',
    count: 1,
    dayKcal: 2400,
    mealKcal: 850,
    proteinG: 200,
    sideG: 150,
    sideWithStewedG: 110,
    stewedVegG: 180,
    saladG: 120,
  },
  {
    id: 'child',
    label: 'Ребёнок',
    count: 1,
    dayKcal: 1700,
    mealKcal: 600,
    proteinG: 100,
    sideG: 100,
    sideWithStewedG: 75,
    stewedVegG: 140,
    saladG: 80,
  },
]

function familySum(field: keyof Pick<PersonPortion, 'proteinG' | 'sideG' | 'sideWithStewedG' | 'stewedVegG' | 'saladG'>): number {
  return people.reduce((s, p) => s + p[field] * p.count, 0)
}

/** Сумма на один семейный обед или ужин (3 человека) */
export const familyMeal = {
  proteinG: familySum('proteinG'), // 450
  sideCookedG: familySum('sideG'), // 350
  sideWithStewedCookedG: familySum('sideWithStewedG'),
  stewedVegG: familySum('stewedVegG'),
  saladG: familySum('saladG'),
}

