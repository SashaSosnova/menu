/**
 * Порции на семью из 3 человек: женщина · мужчина · ребёнок.
 * Рецепты гарниров и многие горячие — закладка сразу на 2 приёма (обед+ужин / два дня).
 *
 * Гарнир на 1 приём: 100 + 150 + 100 = 350 г → на 2 приёма = 700 г
 * Горячее на 1 приём: ~450 г → на 2 приёма = ~900 г
 *   (весь вес блюда: мясо/рыба + овощи в соусе + соусы, не только белок)
 * Цельное на 2 приёма: ~ горячее+гарнир = ~1600 г (мясо и картофель/крупа внутри)
 *
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
  peasG: number
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
    peasG: 60,
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
    peasG: 120,
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
    peasG: 70,
  },
]

function familySum(field: keyof Pick<PersonPortion, 'proteinG' | 'sideG' | 'sideWithStewedG' | 'stewedVegG' | 'saladG' | 'peasG'>): number {
  return people.reduce((s, p) => s + p[field] * p.count, 0)
}

/** Сумма на один семейный обед или ужин (3 человека) */
export const familyMeal = {
  proteinG: familySum('proteinG'), // 450
  sideCookedG: familySum('sideG'), // 350
  sideWithStewedCookedG: familySum('sideWithStewedG'),
  stewedVegG: familySum('stewedVegG'),
  saladG: familySum('saladG'),
  peasG: familySum('peasG'),
}

