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

/**
 * Правило дня: один приём — готовка (или заготовка), второй — только разогрев + салат.
 * Ср: заготовка → обед; ужин — тефтели (разогрев).
 * Чт ужин — рыба день в день; пт обед — остатки рыбы; пт ужин — креветки.
 */
export const weeks: WeekMenu[] = [
  {
    week: 1,
    days: [
      {
        day: 'ПН',
        lunch: [part('bolognese'), part('pasta'), part('salad_cabbage')],
        dinner: [part('chicken_tomato_cream'), part('buckwheat'), part('salad_pepper_tomato')],
      },
      {
        day: 'ВТ',
        lunch: [part('chicken_tomato_cream'), part('rice'), part('salad_tomato_cucumber')],
        dinner: [part('bolognese'), part('buckwheat'), part('salad_cabbage_cucumber')],
      },
      {
        day: 'СР',
        lunch: [part('chicken_legs'), part('stewed_cabbage'), part('rice')],
        dinner: [
          part('chicken_meatballs'),
          part('buckwheat'),
          part('salad_tomato_herbs'),
        ],
      },
      {
        day: 'ЧТ',
        lunch: [part('chicken_legs'), part('stewed_cabbage'), part('bulgur')],
        dinner: [
          part('trout'),
          part('cream_sauce'),
          part('boiled_potato'),
          part('salad_cabbage'),
        ],
      },
      {
        day: 'ПТ',
        lunch: [
          part('leftovers_fish', 'Остатки форели'),
          part('rice'),
          part('salad_tomato_cucumber'),
        ],
        dinner: [part('shrimp_pasta'), part('salad_tomato_cucumber')],
      },
      {
        day: 'СБ',
        lunch: [part('wings'), part('buckwheat'), part('salad_cabbage')],
        dinner: [part('wings'), part('mash'), part('peas')],
      },
      {
        day: 'ВС',
        lunch: [part('leftovers_wings'), part('rice'), part('salad_pepper_tomato')],
        dinner: [
          part('leftovers_fish', 'Остатки пасты с креветками'),
          part('mash'),
          part('salad_tomato_herbs'),
        ],
      },
    ],
  },
  {
    week: 2,
    days: [
      {
        day: 'ПН',
        lunch: [part('goulash'), part('pasta'), part('salad_cabbage')],
        dinner: [part('pineapple_chicken'), part('rice'), part('salad_cabbage')],
      },
      {
        day: 'ВТ',
        lunch: [part('pineapple_chicken'), part('rice'), part('salad_tomato_cucumber')],
        dinner: [part('goulash'), part('buckwheat'), part('salad_cabbage_cucumber')],
      },
      {
        day: 'СР',
        lunch: [part('chicken_legs'), part('veggie_stew'), part('rice')],
        dinner: [
          part('chicken_meatballs'),
          part('buckwheat'),
          part('salad_tomato_yogurt'),
        ],
      },
      {
        day: 'ЧТ',
        lunch: [part('chicken_legs'), part('veggie_stew'), part('bulgur')],
        dinner: [
          part('pollock'),
          part('tomato_cream_sauce'),
          part('boiled_potato'),
          part('salad_cabbage'),
        ],
      },
      {
        day: 'ПТ',
        lunch: [
          part('leftovers_fish', 'Остатки минтая'),
          part('rice'),
          part('salad_pepper_tomato'),
        ],
        dinner: [part('shrimp'), part('rice'), part('salad_tomato_cucumber')],
      },
      {
        day: 'СБ',
        lunch: [part('thighs_soy'), part('buckwheat'), part('salad_cabbage')],
        dinner: [part('thighs_soy'), part('baked_potato'), part('peas')],
      },
      {
        day: 'ВС',
        lunch: [part('leftovers_thighs'), part('rice'), part('salad_cabbage')],
        dinner: [
          part('leftovers_fish', 'Остатки креветок'),
          part('baked_potato'),
          part('salad_tomato_herbs'),
        ],
      },
    ],
  },
  {
    week: 3,
    days: [
      {
        day: 'ПН',
        lunch: [part('beef_tomato'), part('pasta'), part('salad_cabbage')],
        dinner: [part('leftovers_thighs'), part('buckwheat'), part('salad_tomato_cucumber')],
      },
      {
        day: 'ВТ',
        lunch: [part('leftovers_thighs'), part('bulgur'), part('salad_pepper_tomato')],
        dinner: [part('beef_tomato'), part('buckwheat'), part('salad_tomato_herbs')],
      },
      {
        day: 'СР',
        lunch: [part('chicken_legs'), part('cauliflower'), part('rice')],
        dinner: [
          part('chicken_meatballs'),
          part('buckwheat'),
          part('salad_tomato_herbs'),
        ],
      },
      {
        day: 'ЧТ',
        lunch: [part('chicken_legs'), part('cauliflower'), part('bulgur')],
        dinner: [
          part('trout'),
          part('cream_sauce'),
          part('boiled_potato'),
          part('salad_cabbage'),
        ],
      },
      {
        day: 'ПТ',
        lunch: [
          part('leftovers_fish', 'Остатки форели'),
          part('rice'),
          part('salad_tomato_cucumber'),
        ],
        dinner: [part('shrimp_pasta'), part('salad_cabbage')],
      },
      {
        day: 'СБ',
        lunch: [part('wings'), part('buckwheat'), part('salad_pepper_tomato')],
        dinner: [part('wings'), part('boiled_potato'), part('corn_peas')],
      },
      {
        day: 'ВС',
        lunch: [part('leftovers_wings'), part('rice'), part('salad_cabbage_cucumber')],
        dinner: [
          part('leftovers_fish', 'Остатки пасты с креветками'),
          part('boiled_potato'),
          part('salad_tomato_cucumber'),
        ],
      },
    ],
  },
  {
    week: 4,
    days: [
      {
        day: 'ПН',
        lunch: [part('rice_meat'), part('salad_tomato_cucumber')],
        dinner: [part('chicken_mushrooms'), part('buckwheat'), part('salad_cabbage')],
      },
      {
        day: 'ВТ',
        lunch: [part('chicken_mushrooms'), part('bulgur'), part('salad_pepper_tomato')],
        dinner: [part('rice_meat'), part('salad_tomato_cucumber')],
      },
      {
        day: 'СР',
        lunch: [part('chicken_legs'), part('stewed_zucchini'), part('pasta')],
        dinner: [
          part('chicken_meatballs'),
          part('buckwheat'),
          part('salad_tomato_herbs'),
        ],
      },
      {
        day: 'ЧТ',
        lunch: [part('chicken_legs'), part('stewed_zucchini'), part('bulgur')],
        dinner: [
          part('pollock'),
          part('cream_dill_sauce'),
          part('boiled_potato'),
          part('salad_cabbage'),
        ],
      },
      {
        day: 'ПТ',
        lunch: [
          part('leftovers_fish', 'Остатки минтая'),
          part('rice'),
          part('salad_cabbage'),
        ],
        dinner: [part('pineapple_shrimp'), part('rice'), part('salad_pepper_tomato')],
      },
      {
        day: 'СБ',
        lunch: [part('wings'), part('buckwheat'), part('salad_tomato_cucumber')],
        dinner: [part('wings'), part('mash'), part('peas')],
      },
      {
        day: 'ВС',
        lunch: [part('leftovers_wings'), part('rice'), part('salad_tomato_herbs')],
        dinner: [
          part('leftovers_fish', 'Остатки креветок'),
          part('mash'),
          part('salad_cabbage_cucumber'),
        ],
      },
    ],
  },
]
