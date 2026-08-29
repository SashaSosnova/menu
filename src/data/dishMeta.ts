import type { DishKind, ProteinType } from './types'
import { cycleMains, menuRefIds } from './menu'

export type DishMeta = {
  kind: DishKind
  protein?: ProteinType
  /** Вкусные гарниры — классика тарелки */
  sides?: string[]
  /**
   * Ребёнок ест это блюдо. false → закладка на 4 порции (двое взрослых, 2 дня).
   * По умолчанию true для горячего и цельного.
   */
  childEats?: boolean
}

/** Метаданные для сборки тарелки и готовик */
export const dishMeta: Record<string, DishMeta> = {
  // —— Говядина ——
  bolognese: {
    kind: 'complete',
    protein: 'beef',
    childEats: false,
  },
  goulash: {
    kind: 'component',
    protein: 'beef',
    childEats: false,
    sides: ['mash', 'boiled_potato', 'pasta'],
  },
  beef_stroganoff: {
    kind: 'component',
    protein: 'beef',
    sides: ['mash'],
  },
  beef_pulled: {
    kind: 'component',
    protein: 'beef',
    childEats: false,
    sides: ['mash', 'pasta'],
  },
  beef_roast_herb: {
    kind: 'component',
    protein: 'beef',
    childEats: false,
    sides: ['boiled_potato', 'roast_veg', 'broccoli_steam', 'cauliflower'],
  },
  beef_meatballs: {
    kind: 'component',
    protein: 'beef',
    sides: ['mash', 'pasta'],
  },

  // —— Курица ——
  chicken_tomato_cream: {
    kind: 'component',
    protein: 'chicken',
    sides: ['rice_veg', 'mash'],
  },
  chicken_legs_honey: {
    kind: 'component',
    protein: 'chicken',
    sides: ['rice_veg', 'broccoli_steam'],
  },
  chicken_legs_paprika: {
    kind: 'component',
    protein: 'chicken',
    sides: ['rice_veg', 'boiled_potato', 'roast_veg'],
  },
  chicken_cutlets: {
    kind: 'component',
    protein: 'chicken',
    sides: ['mash', 'buckwheat_veg', 'fried_potato'],
  },
  chicken_schnitzel: {
    kind: 'component',
    protein: 'chicken',
    sides: ['fried_potato', 'mash', 'broccoli_steam', 'cauliflower'],
  },
  chicken_stroganoff: {
    kind: 'component',
    protein: 'chicken',
    sides: ['mash', 'rice_veg'],
  },
  chicken_meatballs: {
    kind: 'component',
    protein: 'chicken',
    sides: ['mash', 'pasta', 'rice_veg'],
  },
  wings_soy: {
    kind: 'component',
    protein: 'chicken',
    childEats: false,
    sides: ['rice_veg', 'broccoli_steam'],
  },
  wings_paprika: {
    kind: 'component',
    protein: 'chicken',
    childEats: false,
    sides: ['fried_potato', 'rice_veg', 'roast_veg'],
  },
  thighs_sour_cream: {
    kind: 'component',
    protein: 'chicken',
    sides: ['mash', 'rice_veg'],
  },
  chicken_liver_sour_cream: {
    kind: 'component',
    protein: 'chicken',
    sides: ['buckwheat_veg', 'mash'],
  },
  chicken_grill: {
    kind: 'component',
    protein: 'chicken',
    sides: ['rice_veg', 'buckwheat_veg', 'fried_potato', 'broccoli_steam', 'cauliflower', 'roast_veg'],
  },

  // —— Рыба / морепродукты ——
  trout: {
    kind: 'component',
    protein: 'fish',
    childEats: false,
    sides: ['boiled_potato', 'broccoli_steam', 'cauliflower'],
  },
  trout_spinach: {
    kind: 'component',
    protein: 'fish',
    childEats: false,
    sides: ['boiled_potato'],
  },
  pollock: {
    kind: 'complete',
    protein: 'fish',
    childEats: false,
  },
  shrimp_pasta: {
    kind: 'complete',
    protein: 'shrimp',
    childEats: false,
    sides: ['broccoli_steam'],
  },

  broccoli_steam: { kind: 'side' },
  cauliflower: { kind: 'side' },
  roast_veg: { kind: 'side' },
  veg_salad: { kind: 'side' },
  beef_potato_stew: { kind: 'complete', protein: 'beef' },
  navy_pasta: { kind: 'complete', protein: 'beef' },
  chicken_pasta_zucchini: { kind: 'complete', protein: 'chicken' },

  pasta: { kind: 'side' },
  buckwheat_veg: { kind: 'side' },
  rice_veg: { kind: 'side' },
  bulgur_veg: { kind: 'side' },
  mash: { kind: 'side' },
  boiled_potato: { kind: 'side' },
  fried_potato: { kind: 'side' },
}

/** Гарниры, которые уже внутри цельного блюда — второй раз не предлагаем. */
export function builtInSideIds(dishId: string): string[] {
  if (
    dishId === 'navy_pasta' ||
    dishId === 'shrimp_pasta' ||
    dishId === 'chicken_pasta_zucchini' ||
    dishId === 'bolognese'
  ) {
    return ['pasta']
  }
  if (dishId === 'beef_potato_stew') return ['boiled_potato', 'mash']
  return []
}

export function isCompleteDish(dishId: string): boolean {
  return dishMeta[dishId]?.kind === 'complete'
}

/** Подходящие гарниры из меты. У вариантов « / » — объединение. */
export function matchingSideIds(mainId: string): string[] {
  const group = cycleMains.find((item) => menuRefIds(item).includes(mainId))
  const mains = group ? menuRefIds(group) : [mainId]
  const seen = new Set<string>()
  const out: string[] = []
  for (const id of mains) {
    for (const sid of dishMeta[id]?.sides ?? []) {
      if (seen.has(sid)) continue
      seen.add(sid)
      out.push(sid)
    }
  }
  return out
}

/** Ребёнок ест блюдо. Гарниры — всегда да. */
export function childEatsDish(dishId: string): boolean {
  const meta = dishMeta[dishId]
  if (!meta || meta.kind === 'side' || meta.kind === 'extra') return true
  return meta.childEats !== false
}

/** 4 порции, если ребёнок не ест; 6 — если ест. Гарнир всегда 6. */
export function dishCookPortions(dishId: string): number {
  const meta = dishMeta[dishId]
  if (!meta || meta.kind === 'side' || meta.kind === 'extra') return 6
  return childEatsDish(dishId) ? 6 : 4
}

/**
 * Готовый вес закладки на 2 дня.
 * Горячее: 700 г без ребёнка / 900 г с ребёнком.
 * Цельное: 900 г / 1200 г.
 * Гарнир: 700 г (100 + 150 + 100 г × 2 приёма).
 */
export function dishBatchYieldG(dishId: string): number | undefined {
  const meta = dishMeta[dishId]
  if (!meta) return undefined
  if (meta.kind === 'complete') return childEatsDish(dishId) ? 1200 : 900
  if (meta.kind === 'component') return childEatsDish(dishId) ? 900 : 700
  if (meta.kind === 'side') return 700
  return undefined
}

export function childEatsCaption(dishId: string): string | undefined {
  const kind = childEatsKind(dishId)
  if (!kind) return undefined
  return kind === 'eats' ? 'Ребёнок ест' : 'Ребёнок не ест'
}

export function childEatsKind(dishId: string): 'eats' | 'skips' | undefined {
  const meta = dishMeta[dishId]
  if (!meta || meta.kind === 'extra') return undefined
  if (meta.kind === 'side') return 'eats'
  return childEatsDish(dishId) ? 'eats' : 'skips'
}
