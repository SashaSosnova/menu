import type { DishKind, ProteinType } from './types'

export type DishMeta = {
  kind: DishKind
  protein?: ProteinType
  /** Сочетаемые гарниры */
  sides?: string[]
}

/** Все вкусные пасты-гарниры (+ голая на крайний случай) */
const pastaSides = [
  'pasta_cream',
  'pasta_cheese',
  'pasta_mushroom',
  'pasta_tomato',
  'pasta',
] as const

/** Метаданные для сборки тарелки и готовик */
export const dishMeta: Record<string, DishMeta> = {
  // —— Говядина ——
  bolognese: {
    kind: 'component',
    protein: 'beef',
    sides: [...pastaSides, 'buckwheat_veg', 'buckwheat'],
  },
  goulash: {
    kind: 'component',
    protein: 'beef',
    sides: [...pastaSides, 'buckwheat_veg', 'rice_veg', 'mash', 'broccoli_roast'],
  },
  beef_stroganoff: {
    kind: 'component',
    protein: 'beef',
    sides: [...pastaSides, 'buckwheat_veg', 'mash'],
  },
  rice_meat: { kind: 'complete', protein: 'beef' },
  beef_tomato: {
    kind: 'component',
    protein: 'beef',
    sides: [...pastaSides, 'buckwheat_veg', 'rice_veg', 'quinoa_veg'],
  },
  beef_stew: {
    kind: 'component',
    protein: 'beef',
    sides: ['quinoa_veg', 'buckwheat_veg', 'mash', ...pastaSides],
  },
  beef_paprikash: {
    kind: 'component',
    protein: 'beef',
    sides: [...pastaSides, 'quinoa_veg', 'buckwheat_veg', 'rice_veg'],
  },
  beef_pepper: {
    kind: 'component',
    protein: 'beef',
    sides: [...pastaSides, 'rice_veg', 'buckwheat_veg', 'broccoli_roast'],
  },

  // —— Курица ——
  chicken_tomato_cream: {
    kind: 'component',
    protein: 'chicken',
    sides: ['buckwheat_veg', 'rice_veg', ...pastaSides],
  },
  pineapple_chicken: {
    kind: 'component',
    protein: 'chicken',
    sides: ['rice_veg', 'buckwheat_veg', 'broccoli_roast'],
  },
  chicken_legs: {
    kind: 'component',
    protein: 'chicken',
    sides: ['rice_veg', 'bulgur_veg', 'quinoa_veg', 'mash', 'broccoli_roast'],
  },
  chicken_meatballs: {
    kind: 'component',
    protein: 'chicken',
    sides: ['quinoa_veg', 'buckwheat_veg', 'rice_veg', ...pastaSides, 'mash', 'broccoli_roast', 'big_salad'],
  },
  chicken_cutlets: {
    kind: 'component',
    protein: 'chicken',
    sides: ['bulgur_veg', 'quinoa_veg', 'rice_veg', 'mash', 'big_salad'],
  },
  /** Цельное овощное — на нед. 3 */
  chicken_veg_stew: { kind: 'complete', protein: 'chicken' },
  chicken_mushrooms: {
    kind: 'component',
    protein: 'chicken',
    sides: ['buckwheat_veg', ...pastaSides, 'mash'],
  },
  chicken_stroganoff: {
    kind: 'component',
    protein: 'chicken',
    sides: ['buckwheat_veg', 'quinoa_veg', ...pastaSides],
  },
  chicken_zucchini: {
    kind: 'component',
    protein: 'chicken',
    sides: [...pastaSides, 'bulgur_veg', 'rice_veg'],
  },
  chicken_baked_herbs: {
    kind: 'component',
    protein: 'chicken',
    sides: ['quinoa_veg', 'buckwheat_veg', ...pastaSides, 'mash', 'big_salad'],
  },
  thighs_soy: {
    kind: 'component',
    protein: 'chicken',
    sides: ['quinoa_veg', 'buckwheat_veg', ...pastaSides, 'mash', 'big_salad'],
  },
  wings: {
    kind: 'component',
    protein: 'chicken',
    sides: ['bulgur_veg', 'quinoa_veg', 'buckwheat_veg', 'broccoli_roast', 'big_salad'],
  },
  /** Цельное с картошкой — на нед. 2 */
  chicken_potato_roast: { kind: 'complete', protein: 'chicken' },

  // —— Рыба / морепродукты ——
  trout: {
    kind: 'component',
    protein: 'fish',
    sides: ['broccoli_roast', 'boiled_potato', 'rice_veg', 'bulgur_veg'],
  },
  pollock: {
    kind: 'component',
    protein: 'fish',
    sides: ['broccoli_roast', 'boiled_potato', 'bulgur_veg', 'rice_veg', ...pastaSides],
  },
  /** Креветки только в соусе + крупа/паста, не «просто отварные» */
  shrimp_cream: {
    kind: 'component',
    protein: 'shrimp',
    sides: ['rice_veg', 'quinoa_veg', ...pastaSides],
  },
  /** Цельное с пастой — на нед. 1 */
  shrimp_pasta: { kind: 'complete', protein: 'shrimp' },
  pineapple_shrimp: {
    kind: 'component',
    protein: 'shrimp',
    sides: ['rice_veg', 'quinoa_veg', 'broccoli_roast'],
  },

  // —— Новые (меню v2) ——
  broccoli_steam: { kind: 'side' },
  stewed_potato: { kind: 'side' },
  cauliflower_fried: { kind: 'side' },
  cauliflower_roast: { kind: 'side' },
  pollock_tomato_cream: {
    kind: 'component',
    protein: 'fish',
    sides: ['rice_veg', 'broccoli_roast', 'broccoli_steam', 'boiled_potato'],
  },
  chicken_cubes_veg: {
    kind: 'component',
    protein: 'chicken',
    sides: ['rice_veg', 'buckwheat_veg', 'broccoli_steam', 'broccoli_roast'],
  },
  thighs_sour_cream: {
    kind: 'component',
    protein: 'chicken',
    sides: ['baked_potato', 'bulgur_veg', 'quinoa_veg', 'mash'],
  },
  chicken_legs_paprika: {
    kind: 'component',
    protein: 'chicken',
    sides: ['pasta_cheese', 'pasta_cream', 'stewed_potato', 'mash'],
  },
  wings_paprika: {
    kind: 'component',
    protein: 'chicken',
    sides: ['stewed_potato', 'pasta_cream', 'bulgur_veg', 'big_salad'],
  },
  beef_veg_stew: {
    kind: 'component',
    protein: 'beef',
    sides: ['buckwheat_veg', 'pasta', 'rice_veg', 'mash'],
  },
  beef_potato_stew: { kind: 'complete', protein: 'beef' },
  chicken_pasta_zucchini: { kind: 'complete', protein: 'chicken' },

  // —— Гарниры ——
  pasta: { kind: 'side' },
  pasta_tomato: { kind: 'side' },
  pasta_cream: { kind: 'side' },
  pasta_cheese: { kind: 'side' },
  pasta_mushroom: { kind: 'side' },
  buckwheat: { kind: 'side' },
  bulgur: { kind: 'side' },
  rice: { kind: 'side' },
  quinoa: { kind: 'side' },
  buckwheat_veg: { kind: 'side' },
  rice_veg: { kind: 'side' },
  bulgur_veg: { kind: 'side' },
  quinoa_veg: { kind: 'side' },
  mash: { kind: 'side' },
  baked_potato: { kind: 'side' },
  boiled_potato: { kind: 'side' },
  broccoli_roast: { kind: 'side' },
  stewed_cabbage: { kind: 'side' },
  cauliflower: { kind: 'side' },
  peas: { kind: 'side' },
  corn_peas: { kind: 'side' },
  big_salad: { kind: 'side' },
  cream_sauce: { kind: 'side' },
  tomato_cream_sauce: { kind: 'side' },
  cream_dill_sauce: { kind: 'side' },
}
