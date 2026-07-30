/**
 * Порции на семью из 3 человек.
 *
 * Ты: 160 см / 65 кг → 1350 ккал/день
 *   завтрак 300–350 + перекус 200 → на обед+ужин ≈ 800–850 ккал (~410 на приём)
 *
 * Муж: 185 см / ~110 кг, лёгкий дефицит, сидячий + шаги
 *   цель ≈ 2400 ккал/день; завтрак+перекус ≈ 700 → на обед+ужин ≈ 1700 (~850 на приём)
 *
 * Ребёнок 10 лет: 145 см / 30 кг, поддержание ≈ 1700 ккал/день
 *   завтрак+перекус ≈ 500 → на обед+ужин ≈ 1200 (~600 на приём)
 *
 * КБЖУ у блюд в меню — на 100 г. Ниже — граммы на тарелку / на кастрюлю.
 */

export type PersonId = 'woman' | 'man' | 'child'

export type PersonPortion = {
  id: PersonId
  label: string
  dayKcal: number
  mealKcal: number
  /** Готовый белковый компонент (соус с мясом, рыба без лишней кости) */
  proteinG: number
  /** Готовый гарнир: рис / гречка / булгур / паста / пюре / картошка */
  sideG: number
  /** Гарнир меньше, если в приёме уже тушёные овощи (капуста, рагу…) */
  sideWithStewedG: number
  /** Тушёные овощи как «второй гарнир» */
  stewedVegG: number
  saladG: number
  peasG: number
}

export const people: PersonPortion[] = [
  {
    id: 'woman',
    label: 'Ты',
    dayKcal: 1350,
    mealKcal: 410,
    proteinG: 100,
    sideG: 80,
    sideWithStewedG: 60,
    stewedVegG: 120,
    saladG: 100,
    peasG: 60,
  },
  {
    id: 'man',
    label: 'Муж',
    dayKcal: 2400,
    mealKcal: 850,
    proteinG: 180,
    sideG: 200,
    sideWithStewedG: 150,
    stewedVegG: 180,
    saladG: 120,
    peasG: 120,
  },
  {
    id: 'child',
    label: 'Ребёнок',
    dayKcal: 1700,
    mealKcal: 600,
    proteinG: 120,
    sideG: 130,
    sideWithStewedG: 100,
    stewedVegG: 140,
    saladG: 80,
    peasG: 70,
  },
]

/** Сумма на один семейный обед или ужин */
export const familyMeal = {
  proteinG: 400,
  sideCookedG: 410,
  sideWithStewedCookedG: 310,
  stewedVegG: 440,
  saladG: 300,
  peasG: 250,
}

/** Сколько сухого на 410 г готовой крупы/пасты (1 семейный приём) */
export const dryPerFamilyMeal = {
  rice: 145,
  buckwheat: 165,
  bulgur: 165,
  pasta: 185,
}

/** Картофель сырой на 1 семейный приём готового пюре/отварного */
export const potatoRawPerMealG = 450

export function dryForMeals(
  kind: keyof typeof dryPerFamilyMeal,
  meals: number,
  withStewed = false,
): number {
  const base = dryPerFamilyMeal[kind]
  const per = withStewed ? Math.round(base * (familyMeal.sideWithStewedCookedG / familyMeal.sideCookedG)) : base
  return Math.round((per * meals) / 5) * 5
}

export function potatoForMeals(meals: number): number {
  return Math.round((potatoRawPerMealG * meals) / 50) * 50
}

/** Краткая шпаргалка на тарелку */
export const plateGuide = [
  {
    title: 'Обычный приём (белок + крупа/картошка + салат)',
    lines: [
      `Ты: белок ${people[0].proteinG} г · гарнир ${people[0].sideG} г · салат ${people[0].saladG} г`,
      `Муж: белок ${people[1].proteinG} г · гарнир ${people[1].sideG} г · салат ${people[1].saladG} г`,
      `Ребёнок: белок ${people[2].proteinG} г · гарнир ${people[2].sideG} г · салат ${people[2].saladG} г`,
      `Кастрюля на 1 приём семьи: белок ~${familyMeal.proteinG} г · гарнир готовый ~${familyMeal.sideCookedG} г`,
    ],
  },
  {
    title: 'Если есть тушёные овощи (капуста / рагу / кабачок)',
    lines: [
      `Крупы меньше: ты ${people[0].sideWithStewedG} г · муж ${people[1].sideWithStewedG} г · ребёнок ${people[2].sideWithStewedG} г`,
      `Тушёные: ты ${people[0].stewedVegG} г · муж ${people[1].stewedVegG} г · ребёнок ${people[2].stewedVegG} г`,
      `Кастрюля: крупа ~${familyMeal.sideWithStewedCookedG} г + овощи ~${familyMeal.stewedVegG} г`,
    ],
  },
  {
    title: 'Сухое на 1 семейный приём (без тушёных)',
    lines: [
      `Рис ${dryPerFamilyMeal.rice} г · гречка ${dryPerFamilyMeal.buckwheat} г · булгур ${dryPerFamilyMeal.bulgur} г · паста ${dryPerFamilyMeal.pasta} г`,
      `Картофель сырой на пюре/отварной ~${potatoRawPerMealG} г`,
      `Горошек замороженный ~${familyMeal.peasG} г`,
    ],
  },
]
