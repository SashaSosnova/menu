import type { MealPart, WeekMenu } from './types'
import { dishes } from './dishes'

function part(dishId: string, name?: string): MealPart {
  const dish = dishes[dishId]
  return {
    dishId,
    name: name ?? dish.name,
    macros: dish.macros,
  }
}

/** Основное + гарнир; салат всегда общий «Овощной салат». */
function meal(...dishIds: string[]): MealPart[] {
  return [...dishIds.map((id) => part(id)), { name: 'Овощной салат' }]
}

function mealNamed(parts: { id: string; name?: string }[]): MealPart[] {
  return [...parts.map((p) => part(p.id, p.name)), { name: 'Овощной салат' }]
}

const sundayLeftovers = {
  day: 'ВС' as const,
  note: 'Доедаем остатки — без нового меню. Что осталось с сб и недели.',
}

/**
 * Пн–сб: обед ≠ ужин; к приёму — овощной салат (варианты списком ниже меню).
 * На каждой неделе: говядина + курица + рыба.
 */
export const weeks: WeekMenu[] = [
  {
    week: 1,
    days: [
      {
        day: 'ПН',
        lunch: meal('bolognese', 'pasta'),
        dinner: meal('chicken_tomato_cream', 'buckwheat'),
      },
      {
        day: 'ВТ',
        lunch: meal('chicken_tomato_cream', 'rice'),
        dinner: meal('bolognese', 'buckwheat'),
      },
      {
        day: 'СР',
        lunch: meal('chicken_legs', 'stewed_cabbage', 'rice'),
        dinner: meal('chicken_meatballs', 'buckwheat'),
      },
      {
        day: 'ЧТ',
        lunch: meal('chicken_legs', 'stewed_cabbage', 'bulgur'),
        dinner: meal('trout', 'cream_sauce', 'boiled_potato'),
      },
      {
        day: 'ПТ',
        lunch: mealNamed([{ id: 'leftovers_fish', name: 'Остатки форели' }, { id: 'rice' }]),
        dinner: meal('shrimp_pasta'),
      },
      {
        day: 'СБ',
        lunch: meal('thighs_soy', 'buckwheat'),
        dinner: mealNamed([
          { id: 'leftovers_fish', name: 'Остатки пасты с креветками' },
          { id: 'mash' },
          { id: 'peas' },
        ]),
      },
      sundayLeftovers,
    ],
  },
  {
    week: 2,
    days: [
      {
        day: 'ПН',
        lunch: meal('goulash', 'pasta'),
        dinner: meal('pineapple_chicken', 'rice'),
      },
      {
        day: 'ВТ',
        lunch: meal('pineapple_chicken', 'rice'),
        dinner: meal('goulash', 'buckwheat'),
      },
      {
        day: 'СР',
        lunch: meal('chicken_veg_stew', 'rice'),
        dinner: meal('chicken_cutlets', 'buckwheat'),
      },
      {
        day: 'ЧТ',
        lunch: meal('chicken_veg_stew', 'bulgur'),
        dinner: meal('pollock', 'tomato_cream_sauce', 'boiled_potato'),
      },
      {
        day: 'ПТ',
        lunch: mealNamed([{ id: 'leftovers_fish', name: 'Остатки минтая' }, { id: 'rice' }]),
        dinner: meal('shrimp', 'rice'),
      },
      {
        day: 'СБ',
        lunch: meal('wings', 'buckwheat'),
        dinner: mealNamed([
          { id: 'leftovers_fish', name: 'Остатки креветок' },
          { id: 'baked_potato' },
          { id: 'peas' },
        ]),
      },
      sundayLeftovers,
    ],
  },
  {
    week: 3,
    days: [
      {
        day: 'ПН',
        lunch: meal('beef_stroganoff', 'pasta'),
        dinner: meal('chicken_mushrooms', 'buckwheat'),
      },
      {
        day: 'ВТ',
        lunch: meal('chicken_mushrooms', 'bulgur'),
        dinner: meal('beef_stroganoff', 'buckwheat'),
      },
      {
        day: 'СР',
        lunch: meal('chicken_veg_stew', 'cauliflower', 'rice'),
        dinner: meal('chicken_cutlets', 'buckwheat'),
      },
      {
        day: 'ЧТ',
        lunch: meal('chicken_veg_stew', 'cauliflower', 'bulgur'),
        dinner: meal('trout', 'cream_sauce', 'boiled_potato'),
      },
      {
        day: 'ПТ',
        lunch: mealNamed([{ id: 'leftovers_fish', name: 'Остатки форели' }, { id: 'rice' }]),
        dinner: meal('shrimp_pasta'),
      },
      {
        day: 'СБ',
        lunch: meal('chicken_baked_herbs', 'buckwheat'),
        dinner: mealNamed([
          { id: 'leftovers_fish', name: 'Остатки пасты с креветками' },
          { id: 'boiled_potato' },
          { id: 'corn_peas' },
        ]),
      },
      sundayLeftovers,
    ],
  },
  {
    week: 4,
    days: [
      {
        day: 'ПН',
        lunch: meal('rice_meat'),
        dinner: meal('chicken_stroganoff', 'buckwheat'),
      },
      {
        day: 'ВТ',
        lunch: meal('chicken_stroganoff', 'bulgur'),
        dinner: meal('rice_meat'),
      },
      {
        day: 'СР',
        lunch: meal('chicken_zucchini', 'pasta'),
        dinner: meal('chicken_meatballs', 'buckwheat'),
      },
      {
        day: 'ЧТ',
        lunch: meal('chicken_zucchini', 'bulgur'),
        dinner: meal('pollock', 'cream_dill_sauce', 'boiled_potato'),
      },
      {
        day: 'ПТ',
        lunch: mealNamed([{ id: 'leftovers_fish', name: 'Остатки минтая' }, { id: 'rice' }]),
        dinner: meal('pineapple_shrimp', 'rice'),
      },
      {
        day: 'СБ',
        lunch: meal('chicken_potato_roast'),
        dinner: mealNamed([
          { id: 'leftovers_fish', name: 'Остатки креветок с ананасом' },
          { id: 'rice' },
          { id: 'peas' },
        ]),
      },
      sundayLeftovers,
    ],
  },
]
