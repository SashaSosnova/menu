import type { DishKind, ProteinType } from './types'

export type DishMeta = {
  kind: DishKind
  protein?: ProteinType
  /** Сочетаемые гарниры */
  sides?: string[]
}

/** Сухие крупы */
const dryGrainSides = ['buckwheat_veg', 'rice_veg', 'bulgur_veg'] as const

/** Картофель */
const potatoSides = ['mash', 'boiled_potato'] as const

/** Овощные гарниры (без салата — он почти универсален) */
const vegSides = [
  'broccoli_steam',
  'cauliflower',
  'roast_veg',
] as const

/** Универсальные: салат + отварная паста */
const alwaysSides = ['pasta', 'veg_salad'] as const

/** Метаданные для сборки тарелки и готовик */
export const dishMeta: Record<string, DishMeta> = {
  // —— Говядина ——
  /** Уникальное: только паста; в меню — готовка с цельным (без второго горячего на общий гарнир). */
  bolognese: {
    kind: 'component',
    protein: 'beef',
    sides: ['pasta'],
  },
  goulash: {
    kind: 'component',
    protein: 'beef',
    sides: [
      ...dryGrainSides,
      ...potatoSides,
      ...alwaysSides,
      ...vegSides,
    ],
  },
  beef_stroganoff: {
    kind: 'component',
    protein: 'beef',
    sides: [
      ...dryGrainSides,
      'mash',
      'boiled_potato',
      ...alwaysSides,
      'broccoli_steam',
      'cauliflower',
      'roast_veg',
    ],
  },
  beef_pepper: {
    kind: 'component',
    protein: 'beef',
    sides: [
      ...dryGrainSides,
      ...alwaysSides,
      'broccoli_steam',
      'cauliflower',
      'roast_veg',
    ],
  },
  beef_pulled: {
    kind: 'component',
    protein: 'beef',
    sides: [
      ...dryGrainSides,
      ...potatoSides,
      ...alwaysSides,
      'broccoli_steam',
      'cauliflower',
      'roast_veg',
    ],
  },
  beef_roast_herb: {
    kind: 'component',
    protein: 'beef',
    sides: [
      ...dryGrainSides,
      ...potatoSides,
      ...alwaysSides,
      ...vegSides,
    ],
  },

  // —— Курица ——
  chicken_tomato_cream: {
    kind: 'component',
    protein: 'chicken',
    sides: [
      ...dryGrainSides,
      ...potatoSides,
      ...alwaysSides,
      'broccoli_steam',
      'cauliflower',
      'roast_veg',
    ],
  },
  chicken_legs_honey: {
    kind: 'component',
    protein: 'chicken',
    sides: [
      ...dryGrainSides,
      ...potatoSides,
      ...alwaysSides,
      ...vegSides,
    ],
  },
  chicken_legs_paprika: {
    kind: 'component',
    protein: 'chicken',
    sides: [
      ...dryGrainSides,
      ...potatoSides,
      ...alwaysSides,
      ...vegSides,
    ],
  },
  beef_meatballs: {
    kind: 'component',
    protein: 'beef',
    sides: [
      ...dryGrainSides,
      ...potatoSides,
      ...alwaysSides,
      ...vegSides,
    ],
  },
  chicken_cutlets: {
    kind: 'component',
    protein: 'chicken',
    sides: [
      ...dryGrainSides,
      ...potatoSides,
      ...alwaysSides,
      ...vegSides,
    ],
  },
  chicken_schnitzel: {
    kind: 'component',
    protein: 'chicken',
    sides: [
      ...dryGrainSides,
      ...potatoSides,
      ...alwaysSides,
      ...vegSides,
    ],
  },
  chicken_stroganoff: {
    kind: 'component',
    protein: 'chicken',
    sides: [
      ...dryGrainSides,
      ...potatoSides,
      ...alwaysSides,
      'broccoli_steam',
      'cauliflower',
      'roast_veg',
    ],
  },
  chicken_meatballs: {
    kind: 'component',
    protein: 'chicken',
    sides: [
      ...dryGrainSides,
      ...potatoSides,
      ...alwaysSides,
      ...vegSides,
    ],
  },
  wings_soy: {
    kind: 'component',
    protein: 'chicken',
    sides: [
      ...dryGrainSides,
      ...alwaysSides,
      'broccoli_steam',
      'cauliflower',
      'roast_veg',
    ],
  },
  wings_paprika: {
    kind: 'component',
    protein: 'chicken',
    sides: [
      ...dryGrainSides,
      ...alwaysSides,
      'broccoli_steam',
      'cauliflower',
      'roast_veg',
    ],
  },
  /** Цельное с картошкой — на нед. 2 */
  /** Цельное с рисом — на нед. 1 */
  shrimp_rice_hainan: { kind: 'complete', protein: 'shrimp' },

  // —— Рыба / морепродукты ——
  trout: {
    kind: 'component',
    protein: 'fish',
    sides: [
      ...dryGrainSides,
      ...potatoSides,
      ...alwaysSides,
      'broccoli_steam',
      'cauliflower',
      'roast_veg',
    ],
  },
  trout_spinach: {
    kind: 'component',
    protein: 'fish',
    sides: [
      ...dryGrainSides,
      ...potatoSides,
      ...alwaysSides,
      'broccoli_steam',
      'cauliflower',
      'roast_veg',
    ],
  },
  pollock: {
    kind: 'component',
    protein: 'fish',
    sides: [
      ...dryGrainSides,
      ...potatoSides,
      ...alwaysSides,
      'broccoli_steam',
      'cauliflower',
      'roast_veg',
    ],
  },
  /** Цельное с пастой — на нед. 2 */
  shrimp_pasta: { kind: 'complete', protein: 'shrimp' },

  // —— Новые (меню v2) ——
  broccoli_steam: { kind: 'side' },
  cauliflower: { kind: 'side' },
  roast_veg: { kind: 'side' },
  veg_salad: { kind: 'side' },
  thighs_sour_cream: {
    kind: 'component',
    protein: 'chicken',
    sides: [
      ...dryGrainSides,
      ...potatoSides,
      ...alwaysSides,
      'broccoli_steam',
      'cauliflower',
      'roast_veg',
    ],
  },
  beef_potato_stew: { kind: 'complete', protein: 'beef' },
  chicken_pasta_mushroom: { kind: 'complete', protein: 'chicken' },

  // —— Гарниры ——
  pasta: { kind: 'side' },
  buckwheat_veg: { kind: 'side' },
  rice_veg: { kind: 'side' },
  bulgur_veg: { kind: 'side' },
  mash: { kind: 'side' },
  boiled_potato: { kind: 'side' },

  // —— Дополнительно (к тарелке, не основной гарнир) ——
  peas_cream: { kind: 'extra' },
  peas_sour_cream: { kind: 'extra' },
  green_beans_garlic: { kind: 'extra' },
  corn_cream: { kind: 'extra' },
  carrots_butter: { kind: 'extra' },
  mushrooms_cream: { kind: 'extra' },
}
