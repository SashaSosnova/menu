/**
 * Меню на 4 недели — источник правды для вкладки «Меню».
 * Рецепты и КБЖУ — в dishes.ts по dishId.
 */

export type MenuDishRef = {
  dishId: string
  /** Подпись, если отличается от dishes[id].name */
  label?: string
  /** Соус день в день */
  daySauceId?: string
}

export type MenuSlot = {
  id: 'mon-tue' | 'wed-thu' | 'fri-sat'
  title: string
  covers: string
  complete?: MenuDishRef
  mains: MenuDishRef[]
  sides: MenuDishRef[]
  /** Фиксированные пары [горячее dishId, гарнир dishId] */
  pairs?: [string, string][]
  note?: string
}

export type WeekMenu = {
  week: number
  summary: string
  slots: MenuSlot[]
}

export const weekMenus: WeekMenu[] = [
  {
    week: 1,
    summary: 'Мясо×2 · курица×3 · креветки. Курица: филе + ножки.',
    slots: [
      {
        id: 'mon-tue',
        title: 'ПН+ВТ',
        covers: 'пн–вт',
        note: 'Оба горячих с соусом → сухие гарниры.',
        mains: [
          { dishId: 'bolognese' },
          { dishId: 'chicken_tomato_cream' },
        ],
        sides: [{ dishId: 'pasta' }, { dishId: 'buckwheat_veg' }],
      },
      {
        id: 'wed-thu',
        title: 'СР+ЧТ',
        covers: 'ср–чт',
        note: 'Оба горячих с соусом → сухие гарниры.',
        mains: [
          { dishId: 'beef_pepper' },
          { dishId: 'chicken_meatballs' },
        ],
        sides: [{ dishId: 'rice_veg' }, { dishId: 'broccoli_steam' }],
      },
      {
        id: 'fri-sat',
        title: 'ПТ+СБ',
        covers: 'пт–сб',
        note: 'Полноценное = креветки. Сухие ножки + соусный гарнир.',
        complete: { dishId: 'shrimp_pasta' },
        mains: [
          {
            dishId: 'chicken_legs',
            label: 'Ножки в медово-чесночном маринаде',
          },
        ],
        sides: [{ dishId: 'stewed_potato' }],
      },
    ],
  },
  {
    week: 2,
    summary: 'Мясо×2 · курица×3 · рыба. Курица: филе + крылья.',
    slots: [
      {
        id: 'mon-tue',
        title: 'ПН+ВТ',
        covers: 'пн–вт',
        note: 'Рыба + курица, оба с соусом.',
        mains: [
          {
            dishId: 'trout',
            label: 'Форель на гриле',
            daySauceId: 'cream_sauce',
          },
          { dishId: 'chicken_mushrooms' },
        ],
        sides: [{ dishId: 'mash' }, { dishId: 'cauliflower_fried' }],
      },
      {
        id: 'wed-thu',
        title: 'СР+ЧТ',
        covers: 'ср–чт',
        note: 'Фиксированные пары: гуляш→киноа, крылья→паста.',
        mains: [
          { dishId: 'goulash' },
          { dishId: 'wings', label: 'Крылья в соево-медовом маринаде' },
        ],
        sides: [{ dishId: 'quinoa_veg' }, { dishId: 'pasta_cream' }],
        pairs: [
          ['goulash', 'quinoa_veg'],
          ['wings', 'pasta_cream'],
        ],
      },
      {
        id: 'fri-sat',
        title: 'ПТ+СБ',
        covers: 'пт–сб',
        note: 'Полноценное = курица с картофелем.',
        complete: {
          dishId: 'chicken_potato_roast',
          label: 'Картофель запечённый с курицей',
        },
        mains: [{ dishId: 'beef_stroganoff' }],
        sides: [{ dishId: 'bulgur_veg' }],
      },
    ],
  },
  {
    week: 3,
    summary: 'Мясо×2 · курица×3 · рыба. Курица: бёдра + ножки.',
    slots: [
      {
        id: 'mon-tue',
        title: 'ПН+ВТ',
        covers: 'пн–вт',
        note: 'Рыба + курица, оба с соусом.',
        mains: [
          { dishId: 'pollock_tomato_cream' },
          { dishId: 'chicken_cubes_veg' },
        ],
        sides: [{ dishId: 'rice_veg' }, { dishId: 'broccoli_roast' }],
      },
      {
        id: 'wed-thu',
        title: 'СР+ЧТ',
        covers: 'ср–чт',
        note: 'Мясо + курица, оба с соусом.',
        mains: [
          { dishId: 'beef_paprikash' },
          { dishId: 'thighs_sour_cream' },
        ],
        sides: [{ dishId: 'bulgur_veg' }, { dishId: 'baked_potato' }],
      },
      {
        id: 'fri-sat',
        title: 'ПТ+СБ',
        covers: 'пт–сб',
        note: 'Полноценное = мясо с картофелем.',
        complete: { dishId: 'beef_potato_stew' },
        mains: [
          {
            dishId: 'chicken_legs_paprika',
            label: 'Ножки в паприке с чесноком',
          },
        ],
        sides: [{ dishId: 'pasta_cheese' }],
      },
    ],
  },
  {
    week: 4,
    summary: 'Мясо×2 · курица×3 · рыба. Курица: строганов + крылья.',
    slots: [
      {
        id: 'mon-tue',
        title: 'ПН+ВТ',
        covers: 'пн–вт',
        note: 'Мясо + курица, оба с соусом.',
        mains: [
          { dishId: 'beef_veg_stew' },
          { dishId: 'chicken_stroganoff' },
        ],
        sides: [{ dishId: 'pasta' }, { dishId: 'buckwheat_veg' }],
      },
      {
        id: 'wed-thu',
        title: 'СР+ЧТ',
        covers: 'ср–чт',
        note: 'Мясо + рыба, оба с соусом.',
        mains: [
          { dishId: 'beef_stew' },
          {
            dishId: 'trout',
            label: 'Форель запечённая с лимоном',
            daySauceId: 'cream_sauce',
          },
        ],
        sides: [{ dishId: 'quinoa_veg' }, { dishId: 'cauliflower_roast' }],
      },
      {
        id: 'fri-sat',
        title: 'ПТ+СБ',
        covers: 'пт–сб',
        note: 'Полноценное = паста с курицей.',
        complete: { dishId: 'chicken_pasta_zucchini' },
        mains: [
          {
            dishId: 'wings_paprika',
            label: 'Крылья в паприке с чесноком',
          },
        ],
        sides: [{ dishId: 'stewed_potato' }],
      },
    ],
  },
]

export function getWeekMenu(week: number): WeekMenu {
  return weekMenus.find((w) => w.week === week) ?? weekMenus[0]
}
