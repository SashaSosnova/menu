/**
 * Цикл горячего: готовим по порядку и сначала, без привязки к неделе и дню.
 * Обычно два блюда за готовку — в списке рядом разные белки.
 * Гарниры — общий пул, сочетания из dishMeta.
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

/** Горячее по кругу. Пары на готовку: курица + говядина, через раз рыба. Ножки и крылья — одно блюдо. */
export const cycleMains: MenuDishRef[] = [
  { dishId: 'chicken_grill' },
  { dishId: 'goulash' },
  { dishId: 'chicken_schnitzel' },
  { dishId: 'beef_potato_stew' },
  { dishId: 'chicken_liver_sour_cream' },
  { dishId: 'beef_roast_herb' },
  { dishId: 'chicken_tomato_cream' },
  { dishId: 'navy_pasta' },
  { dishId: 'chicken_legs_honey', orDishIds: ['chicken_legs_paprika'], label: 'Ножки' },
  { dishId: 'bolognese' },
  { dishId: 'chicken_cutlets' },
  { dishId: 'trout' },
  { dishId: 'wings_soy', orDishIds: ['wings_paprika'], label: 'Крылья' },
  { dishId: 'beef_stroganoff' },
  { dishId: 'thighs_sour_cream' },
  { dishId: 'pollock' },
  { dishId: 'chicken_meatballs' },
  { dishId: 'beef_pulled' },
  { dishId: 'chicken_stroganoff' },
  { dishId: 'beef_meatballs' },
  { dishId: 'chicken_pasta_zucchini' },
  { dishId: 'trout_spinach' },
  { dishId: 'shrimp_pasta' },
]

export const cycleSides: MenuDishRef[] = [
  { dishId: 'pasta' },
  { dishId: 'mash' },
  { dishId: 'buckwheat_veg' },
  { dishId: 'rice_veg' },
  { dishId: 'bulgur_veg' },
  { dishId: 'boiled_potato' },
  { dishId: 'fried_potato' },
  { dishId: 'roast_veg' },
  { dishId: 'broccoli_steam' },
  { dishId: 'cauliflower' },
  { dishId: 'veg_salad' },
]

export function cycleIndexOf(dishId: string): number {
  return cycleMains.findIndex((item) => menuRefIds(item).includes(dishId))
}

/** Совместимость с очередью готовки: один набор на весь цикл. */
export const weekMenus: WeekMenu[] = [
  {
    week: 1,
    summary: 'Цикл горячего, гарниры отдельно.',
    slots: [
      {
        id: 'mon-tue',
        title: 'Цикл',
        covers: '',
        mains: cycleMains,
        sides: cycleSides,
      },
    ],
  },
]

export function getWeekMenu(week: number): WeekMenu {
  return weekMenus.find((w) => w.week === week) ?? weekMenus[0]
}
