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

export const weeks: WeekMenu[] = [
  {
    week: 1,
    days: [
      {
        day: 'ПН',
        lunch: [part('bolognese'), part('pasta')],
        dinner: [part('chicken_zucchini'), part('buckwheat')],
      },
      {
        day: 'ВТ',
        lunch: [part('chicken_zucchini'), part('bulgur')],
        dinner: [part('bolognese'), part('pasta')],
      },
      {
        day: 'СР',
        lunch: [part('bolognese'), part('rice')],
        dinner: [part('stewed_cabbage'), part('chicken_legs'), part('buckwheat')],
      },
      {
        day: 'ЧТ',
        lunch: [part('stewed_cabbage'), part('pasta'), part('chicken_legs')],
        dinner: [part('trout'), part('cream_sauce'), part('rice')],
      },
      {
        day: 'ПТ',
        lunch: [part('trout'), part('bulgur'), part('cream_sauce')],
        dinner: [part('stewed_cabbage'), part('shrimp'), part('pasta')],
      },
      {
        day: 'СБ',
        lunch: [part('wings'), part('buckwheat')],
        dinner: [part('mash'), part('chicken_legs')],
      },
      {
        day: 'ВС',
        lunch: [part('leftovers_wings'), part('buckwheat')],
        dinner: [part('mash'), part('egg_or_fish')],
      },
    ],
  },
  {
    week: 2,
    days: [
      {
        day: 'ПН',
        lunch: [part('goulash'), part('pasta')],
        dinner: [part('chicken_tomato_cream'), part('buckwheat')],
      },
      {
        day: 'ВТ',
        lunch: [part('chicken_tomato_cream'), part('bulgur')],
        dinner: [part('goulash', 'Гуляш'), part('pasta')],
      },
      {
        day: 'СР',
        lunch: [part('goulash', 'Гуляш'), part('rice')],
        dinner: [part('veggie_stew'), part('chicken_legs'), part('buckwheat')],
      },
      {
        day: 'ЧТ',
        lunch: [part('veggie_stew'), part('pasta'), part('chicken_legs')],
        dinner: [part('pollock'), part('pesto_sauce'), part('rice')],
      },
      {
        day: 'ПТ',
        lunch: [part('pollock'), part('bulgur'), part('pesto_sauce')],
        dinner: [part('veggie_stew'), part('shrimp'), part('pasta')],
      },
      {
        day: 'СБ',
        lunch: [part('thighs_soy'), part('buckwheat')],
        dinner: [part('mash'), part('chicken_legs')],
      },
      {
        day: 'ВС',
        lunch: [part('leftovers_thighs'), part('buckwheat')],
        dinner: [part('mash'), part('egg_or_fish')],
      },
    ],
  },
  {
    week: 3,
    days: [
      {
        day: 'ПН',
        lunch: [part('chili'), part('pasta')],
        dinner: [part('thighs_soy', 'Бёдра в соевом'), part('buckwheat')],
      },
      {
        day: 'ВТ',
        lunch: [part('thighs_soy', 'Бёдра в соевом'), part('bulgur')],
        dinner: [part('chili', 'Чили'), part('pasta')],
      },
      {
        day: 'СР',
        lunch: [part('chili', 'Чили'), part('rice')],
        dinner: [part('cauliflower'), part('chicken_legs'), part('buckwheat')],
      },
      {
        day: 'ЧТ',
        lunch: [part('cauliflower'), part('pasta'), part('chicken_legs')],
        dinner: [part('trout'), part('cheese_sauce'), part('rice')],
      },
      {
        day: 'ПТ',
        lunch: [part('trout'), part('bulgur'), part('cheese_sauce')],
        dinner: [part('cauliflower'), part('shrimp'), part('pasta')],
      },
      {
        day: 'СБ',
        lunch: [part('wings', 'Крылья'), part('buckwheat')],
        dinner: [part('mash'), part('chicken_legs')],
      },
      {
        day: 'ВС',
        lunch: [part('leftovers_wings'), part('buckwheat')],
        dinner: [part('mash'), part('egg_or_fish')],
      },
    ],
  },
  {
    week: 4,
    days: [
      {
        day: 'ПН',
        lunch: [part('rice_meat')],
        dinner: [part('chicken_mushrooms'), part('buckwheat')],
      },
      {
        day: 'ВТ',
        lunch: [part('chicken_mushrooms'), part('bulgur')],
        dinner: [part('rice_meat', 'Рис с мясом')],
      },
      {
        day: 'СР',
        lunch: [part('rice_meat', 'Рис с мясом')],
        dinner: [part('stewed_zucchini'), part('chicken_legs'), part('pasta')],
      },
      {
        day: 'ЧТ',
        lunch: [part('stewed_zucchini'), part('pasta'), part('chicken_legs')],
        dinner: [part('pollock'), part('cream_dill_sauce'), part('rice')],
      },
      {
        day: 'ПТ',
        lunch: [part('pollock'), part('bulgur'), part('cream_dill_sauce')],
        dinner: [part('stewed_zucchini'), part('shrimp'), part('pasta')],
      },
      {
        day: 'СБ',
        lunch: [part('wings', 'Крылья'), part('buckwheat')],
        dinner: [part('mash'), part('chicken_legs')],
      },
      {
        day: 'ВС',
        lunch: [part('leftovers_wings'), part('buckwheat')],
        dinner: [part('mash'), part('egg_or_fish')],
      },
    ],
  },
]
