import type { DishKind, ProteinType } from './types'

export type DishMeta = {
  kind: DishKind
  protein?: ProteinType
  /** Вкусные гарниры — классика тарелки */
  sides?: string[]
}

/** Метаданные для сборки тарелки и готовик */
export const dishMeta: Record<string, DishMeta> = {
  // —— Говядина ——
  bolognese: {
    kind: 'component',
    protein: 'beef',
    sides: ['pasta'],
  },
  goulash: {
    kind: 'component',
    protein: 'beef',
    sides: ['rice_veg', 'mash', 'boiled_potato', 'pasta'],
  },
  beef_stroganoff: {
    kind: 'component',
    protein: 'beef',
    sides: ['mash', 'rice_veg', 'buckwheat_veg', 'bulgur_veg', 'pasta'],
  },
  beef_pepper: {
    kind: 'component',
    protein: 'beef',
    sides: ['rice_veg', 'buckwheat_veg', 'bulgur_veg', 'broccoli_steam', 'roast_veg'],
  },
  beef_pulled: {
    kind: 'component',
    protein: 'beef',
    sides: ['mash', 'buckwheat_veg', 'pasta', 'boiled_potato', 'roast_veg'],
  },
  beef_roast_herb: {
    kind: 'component',
    protein: 'beef',
    sides: ['mash', 'boiled_potato', 'roast_veg', 'veg_salad', 'rice_veg', 'buckwheat_veg'],
  },
  beef_meatballs: {
    kind: 'component',
    protein: 'beef',
    sides: ['pasta', 'mash', 'rice_veg', 'buckwheat_veg', 'boiled_potato'],
  },

  // —— Курица ——
  chicken_tomato_cream: {
    kind: 'component',
    protein: 'chicken',
    sides: ['pasta', 'rice_veg', 'mash', 'buckwheat_veg', 'broccoli_steam'],
  },
  chicken_legs_honey: {
    kind: 'component',
    protein: 'chicken',
    sides: ['mash', 'roast_veg', 'rice_veg', 'buckwheat_veg', 'boiled_potato'],
  },
  chicken_legs_paprika: {
    kind: 'component',
    protein: 'chicken',
    sides: ['mash', 'roast_veg', 'rice_veg', 'buckwheat_veg', 'boiled_potato'],
  },
  chicken_cutlets: {
    kind: 'component',
    protein: 'chicken',
    sides: ['mash', 'buckwheat_veg', 'pasta', 'boiled_potato', 'cauliflower'],
  },
  chicken_schnitzel: {
    kind: 'component',
    protein: 'chicken',
    sides: ['mash', 'boiled_potato', 'veg_salad', 'pasta'],
  },
  chicken_stroganoff: {
    kind: 'component',
    protein: 'chicken',
    sides: ['mash', 'rice_veg', 'buckwheat_veg', 'bulgur_veg', 'pasta', 'veg_salad'],
  },
  chicken_meatballs: {
    kind: 'component',
    protein: 'chicken',
    sides: ['pasta', 'mash', 'rice_veg', 'buckwheat_veg'],
  },
  wings_soy: {
    kind: 'component',
    protein: 'chicken',
    sides: ['roast_veg', 'rice_veg', 'broccoli_steam', 'cauliflower'],
  },
  wings_paprika: {
    kind: 'component',
    protein: 'chicken',
    sides: ['roast_veg', 'rice_veg', 'broccoli_steam', 'cauliflower'],
  },
  thighs_sour_cream: {
    kind: 'component',
    protein: 'chicken',
    sides: ['mash', 'pasta', 'rice_veg', 'buckwheat_veg', 'roast_veg'],
  },

  shrimp_rice_hainan: { kind: 'complete', protein: 'shrimp' },

  // —— Рыба / морепродукты ——
  trout: {
    kind: 'component',
    protein: 'fish',
    sides: ['mash', 'boiled_potato', 'cauliflower', 'broccoli_steam', 'rice_veg', 'veg_salad'],
  },
  trout_spinach: {
    kind: 'component',
    protein: 'fish',
    sides: ['rice_veg', 'pasta', 'buckwheat_veg', 'mash'],
  },
  pollock: {
    kind: 'component',
    protein: 'fish',
    sides: ['pasta', 'rice_veg', 'roast_veg', 'mash', 'boiled_potato'],
  },
  shrimp_pasta: { kind: 'complete', protein: 'shrimp' },

  broccoli_steam: { kind: 'side' },
  cauliflower: { kind: 'side' },
  roast_veg: { kind: 'side' },
  veg_salad: { kind: 'side' },
  beef_potato_stew: { kind: 'complete', protein: 'beef' },
  chicken_pasta_mushroom: { kind: 'complete', protein: 'chicken' },

  pasta: { kind: 'side' },
  buckwheat_veg: { kind: 'side' },
  rice_veg: { kind: 'side' },
  bulgur_veg: { kind: 'side' },
  mash: { kind: 'side' },
  boiled_potato: { kind: 'side' },

  peas_cream: { kind: 'extra' },
  peas_sour_cream: { kind: 'extra' },
  green_beans_garlic: { kind: 'extra' },
  corn_cream: { kind: 'extra' },
  carrots_butter: { kind: 'extra' },
  mushrooms_cream: { kind: 'extra' },
}
