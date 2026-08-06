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

/** Сколько семейных приёмов закрывает типичная заготовка */
export const prepMeals = 2

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

/** Закладка на 2 семейных приёма */
export const familyPrep = {
  proteinG: familyMeal.proteinG * prepMeals, // 900
  sideCookedG: familyMeal.sideCookedG * prepMeals, // 700
  sideWithStewedCookedG: familyMeal.sideWithStewedCookedG * prepMeals,
  stewedVegG: familyMeal.stewedVegG * prepMeals,
  saladG: familyMeal.saladG * prepMeals,
  peasG: familyMeal.peasG * prepMeals,
}

/**
 * Сухое на 1 семейный приём гарнира (~350 г готового).
 * Крупа с зажаркой: 90 г сухой + 50 г лука + 50 г моркови.
 * В рецептах обычно уже ×2 (закладка на 2 приёма).
 */
export const dryPerFamilyMeal = {
  rice: 90,
  buckwheat: 90,
  bulgur: 90,
  pasta: 160,
}

/** Большой салат вместо гарнира — на 1 семейный приём */
export const bigSaladPerMealG = 350

/** Картофель сырой на 1 семейный приём готового пюре/отварного (~350 г) */
export const potatoRawPerMealG = 350

export function dryForMeals(
  kind: keyof typeof dryPerFamilyMeal,
  meals: number,
  withStewed = false,
): number {
  const base = dryPerFamilyMeal[kind]
  const per = withStewed
    ? Math.round(base * (familyMeal.sideWithStewedCookedG / familyMeal.sideCookedG))
    : base
  return Math.round((per * meals) / 5) * 5
}

export function potatoForMeals(meals: number): number {
  return Math.round((potatoRawPerMealG * meals) / 50) * 50
}

/** Краткая шпаргалка на тарелку */
export const plateGuide = [
  {
    title: 'Сборка тарелки (компонент + гарнир)',
    lines: [
      `Женщина: горячее ${people[0].proteinG} г · гарнир ${people[0].sideG} г`,
      `Мужчина: горячее ${people[1].proteinG} г · гарнир ${people[1].sideG} г`,
      `Ребёнок: горячее ${people[2].proteinG} г · гарнир ${people[2].sideG} г`,
      `Семья за приём: горячее ~${familyMeal.proteinG} г · гарнир ~${familyMeal.sideCookedG} г`,
      `Заготовка на 2 приёма: горячее ~${familyPrep.proteinG} г (все ингредиенты + соус) · гарнир ~${familyPrep.sideCookedG} г`,
    ],
  },
  {
    title: 'Белок + большой салат (без крупы/картошки)',
    lines: [
      `Салат вместо гарнира: семья ~${bigSaladPerMealG} г за приём · ~${familyPrep.saladG} г на 2 приёма`,
      'Резать в момент еды — не готовить заранее пакетом.',
    ],
  },
  {
    title: 'Цельное блюдо (плов, паста с креветками, мясо с картошкой…)',
    lines: [
      'Гарнир уже внутри — второй крупой/картошкой не дополнять.',
      'На неделю — не больше одного такого блюда.',
      `Ориентир на 2 приёма ~${familyPrep.proteinG + familyPrep.sideCookedG} г (горячее+гарнир в одном).`,
    ],
  },
  {
    title: 'Сухое / сырое на закладку гарнира (2 приёма ≈ 700 г готового)',
    lines: [
      `Рис/гречка/булгур ${dryForMeals('rice', prepMeals)} г сухих + лук 100 г + морковь 100 г`,
      `Паста ${dryForMeals('pasta', prepMeals)} г сухих`,
      `Картофель сырой на пюре/отварной ~${potatoForMeals(prepMeals)} г`,
      'В рецептах ниже — уже закладка на 2 приёма, не удваивать ещё раз.',
    ],
  },
]
