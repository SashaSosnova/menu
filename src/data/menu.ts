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

/** Горячее по кругу. Соседние позиции — разные белки (говядина / курица / рыба / креветки). */
export const cycleMains: MenuDishRef[] = [
  { dishId: 'navy_pasta' },
  { dishId: 'chicken_tomato_cream' },
  { dishId: 'goulash' },
  { dishId: 'chicken_schnitzel' },
  { dishId: 'bolognese' },
  { dishId: 'chicken_cutlets' },
  { dishId: 'beef_stroganoff' },
  { dishId: 'chicken_legs_honey' },
  { dishId: 'beef_meatballs' },
  { dishId: 'wings_soy', orDishIds: ['wings_paprika'] },
  { dishId: 'beef_potato_stew' },
  { dishId: 'chicken_legs_paprika' },
  { dishId: 'beef_pulled' },
  { dishId: 'chicken_meatballs' },
  { dishId: 'beef_roast_herb' },
  { dishId: 'chicken_stroganoff' },
  { dishId: 'trout' },
  { dishId: 'thighs_sour_cream' },
  { dishId: 'pollock' },
  { dishId: 'chicken_pasta_zucchini' },
  { dishId: 'trout_spinach' },
  { dishId: 'chicken_liver_sour_cream' },
  { dishId: 'shrimp_pasta' },
  { dishId: 'chicken_grill' },
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
