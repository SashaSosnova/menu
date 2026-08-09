export type Macros = {
  kcal: number
  protein: number
  fat: number
  carbs: number
}

export type Recipe = {
  servings: string
  ingredients: string[]
  steps: string
  storage?: string
  weeks?: number[]
}

/** component = белок отдельно; complete = всё в одной кастрюле; side = гарнир; extra = дополнение к тарелке */
export type DishKind = 'component' | 'complete' | 'side' | 'extra'

export type ProteinType = 'beef' | 'chicken' | 'fish' | 'shrimp' | 'veg'

export type Dish = {
  id: string
  name: string
  /** Подставляется из dishes-macros.json (planer), не хранится в dishes.ts */
  macros?: Macros
  recipe?: Recipe
  kind?: DishKind
  protein?: ProteinType
  /** Сочетаемые гарниры (id). Для complete не нужно. */
  sides?: string[]
}

export type ShoppingItem = {
  product: string
  amount: string
  note?: string
}

export type BatchItem = {
  dishId: string
  /** Варианты на выбор — в списке через « / » */
  orDishIds?: string[]
  /** Обычно «6 порций» ≈ 2 семейных приёма */
  portions: string
}

/** Одна готовка → запас на ~2 дня */
export type CookBatch = {
  when: string
  covers: string
  time: string
  title: string
  note?: string
  mains: BatchItem[]
  sides: BatchItem[]
}

/** Тип цельного блюда недели (чередуем) */
export type CompleteBase = 'pasta' | 'potato' | 'vegetables' | 'grain'

export type WeekPlan = {
  week: number
  /** Ровно одно цельное на неделю */
  completeDishId?: string
  batches: CookBatch[]
  shopping: ShoppingItem[]
  freeDayNote: string
}

export const completeBaseLabel: Record<CompleteBase, string> = {
  pasta: 'паста',
  potato: 'картошка',
  vegetables: 'овощи',
  grain: 'крупа',
}

export const weekCompleteBase: Record<number, CompleteBase> = {
  1: 'grain',
  2: 'pasta',
  3: 'potato',
  4: 'pasta',
}

