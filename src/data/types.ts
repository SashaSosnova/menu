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
  /** Вкусные гарниры (id). Для complete не нужно. */
  sides?: string[]
  /** Ребёнок ест это горячее. Гарниры не размечаем. */
  childEats?: boolean
}


