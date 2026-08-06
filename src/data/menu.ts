/**
 * Меню на 4 недели — источник правды для вкладки «Меню».
 * Рецепты и КБЖУ — в dishes.ts по dishId.
 */

export type MenuDishRef = {
  dishId: string
  /** Варианты на выбор — в меню через « / » (напр. два маринада) */
  orDishIds?: string[]
  /** Подпись, если отличается от dishes[id].name */
  label?: string
  /** Соус день в день */
  daySauceId?: string
}

export function menuRefIds(item: MenuDishRef): string[] {
  return [item.dishId, ...(item.orDishIds ?? [])]
}

export function menuRefLabel(
  item: MenuDishRef,
  nameOf: (id: string) => string | undefined = () => undefined,
): string {
  if (item.label) return item.label
  return menuRefIds(item)
    .map((id) => nameOf(id) ?? id)
    .join(' / ')
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
    summary: 'Мясо×2 · курица×3 · креветки. Болоньезе + золотой рис с креветками (Хайнань).',
    slots: [
      {
        id: 'mon-tue',
        title: 'ПН+ВТ',
        covers: 'пн–вт',
        note: 'Мясо + курица, оба с соусом → сухие гарниры.',
        mains: [
          { dishId: 'beef_pepper' },
          { dishId: 'chicken_tomato_cream' },
        ],
        sides: [{ dishId: 'buckwheat_veg' }, { dishId: 'broccoli_steam' }],
      },
      {
        id: 'wed-thu',
        title: 'СР+ЧТ',
        covers: 'ср–чт',
        note: 'Курица + курица → пюре + овощи запечённые.',
        mains: [
          { dishId: 'chicken_schnitzel' },
          { dishId: 'chicken_legs_honey', orDishIds: ['chicken_legs_paprika'] },
        ],
        sides: [{ dishId: 'mash' }, { dishId: 'roast_veg' }],
      },
      {
        id: 'fri-sat',
        title: 'ПТ+СБ',
        covers: 'пт–сб',
        note: 'Болоньезе уникальное: только паста. Цельное — золотой рис с креветками (не паста).',
        complete: { dishId: 'shrimp_rice_hainan' },
        mains: [{ dishId: 'bolognese' }],
        sides: [{ dishId: 'pasta' }],
      },
    ],
  },
  {
    week: 2,
    summary: 'Мясо×2 · курица×2 · рыба · креветки. Курица: котлеты + крылья. Цельное — паста с креветками.',
    slots: [
      {
        id: 'mon-tue',
        title: 'ПН+ВТ',
        covers: 'пн–вт',
        note: 'Рыба + курица. Форель в аэрогриле + котлеты.',
        mains: [
          { dishId: 'trout' },
          { dishId: 'chicken_cutlets' },
        ],
        sides: [{ dishId: 'mash' }, { dishId: 'cauliflower' }],
      },
      {
        id: 'wed-thu',
        title: 'СР+ЧТ',
        covers: 'ср–чт',
        note: 'Фиксированные пары: гуляш→рис, крылья→запечённые овощи.',
        mains: [
          { dishId: 'goulash' },
          { dishId: 'wings_soy', orDishIds: ['wings_paprika'] },
        ],
        sides: [{ dishId: 'rice_veg' }, { dishId: 'roast_veg' }],
        pairs: [
          ['goulash', 'rice_veg'],
          ['wings_soy', 'roast_veg'],
          ['wings_paprika', 'roast_veg'],
        ],
      },
      {
        id: 'fri-sat',
        title: 'ПТ+СБ',
        covers: 'пт–сб',
        note: 'Полноценное = паста с креветками. К бефстроганову — булгур.',
        complete: { dishId: 'shrimp_pasta' },
        mains: [{ dishId: 'beef_stroganoff' }],
        sides: [{ dishId: 'bulgur_veg' }],
      },
    ],
  },
  {
    week: 3,
    summary: 'Мясо×2 · курица×3 · рыба. Курица: бёдра + ножки + строганов.',
    slots: [
      {
        id: 'mon-tue',
        title: 'ПН+ВТ',
        covers: 'пн–вт',
        note: 'Рыба + курица. Минтай + бёдра · паста + овощи запечённые.',
        mains: [
          { dishId: 'pollock' },
          { dishId: 'thighs_sour_cream' },
        ],
        sides: [{ dishId: 'pasta' }, { dishId: 'roast_veg' }],
      },
      {
        id: 'wed-thu',
        title: 'СР+ЧТ',
        covers: 'ср–чт',
        note: 'Говяжьи тефтели + ножки · булгур + картофель отварной.',
        mains: [
          { dishId: 'beef_meatballs' },
          { dishId: 'chicken_legs_honey', orDishIds: ['chicken_legs_paprika'] },
        ],
        sides: [{ dishId: 'bulgur_veg' }, { dishId: 'boiled_potato' }],
      },
      {
        id: 'fri-sat',
        title: 'ПТ+СБ',
        covers: 'пт–сб',
        note: 'Полноценное = мясо с картофелем. К куриному строганову — салат.',
        complete: { dishId: 'beef_potato_stew' },
        mains: [{ dishId: 'chicken_stroganoff' }],
        sides: [{ dishId: 'veg_salad' }],
      },
    ],
  },
  {
    week: 4,
    summary: 'Мясо×3 · курица×2 · рыба. Курица: тефтели + паста с грибами.',
    slots: [
      {
        id: 'mon-tue',
        title: 'ПН+ВТ',
        covers: 'пн–вт',
        note: 'Мясо + куриные тефтели. Гречка + пюре.',
        mains: [
          { dishId: 'beef_pulled' },
          { dishId: 'chicken_meatballs' },
        ],
        sides: [{ dishId: 'buckwheat_veg' }, { dishId: 'mash' }],
      },
      {
        id: 'wed-thu',
        title: 'СР+ЧТ',
        covers: 'ср–чт',
        note: 'Гуляш + форель со шпинатом · рис + цветная.',
        mains: [
          { dishId: 'goulash' },
          { dishId: 'trout_spinach' },
        ],
        sides: [{ dishId: 'rice_veg' }, { dishId: 'cauliflower' }],
      },
      {
        id: 'fri-sat',
        title: 'ПТ+СБ',
        covers: 'пт–сб',
        note: 'Полноценное = паста с курицей и грибами.',
        complete: { dishId: 'chicken_pasta_mushroom' },
        mains: [{ dishId: 'beef_roast_herb' }],
        sides: [{ dishId: 'veg_salad' }],
      },
    ],
  },
]

export function getWeekMenu(week: number): WeekMenu {
  return weekMenus.find((w) => w.week === week) ?? weekMenus[0]
}
