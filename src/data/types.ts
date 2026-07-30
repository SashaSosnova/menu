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

export type Dish = {
  id: string
  name: string
  macros?: Macros
  recipe?: Recipe
}

export type MealPart = {
  dishId?: string
  name: string
  macros?: Macros
}

export type WeekDay = 'ПН' | 'ВТ' | 'СР' | 'ЧТ' | 'ПТ' | 'СБ' | 'ВС'

export type DayMenu = {
  day: WeekDay
  /** Если задано — день без расписания блюд (например вс: доедание). */
  note?: string
  lunch?: MealPart[]
  dinner?: MealPart[]
}

export type WeekMenu = {
  week: number
  days: DayMenu[]
}

export type ShoppingItem = {
  product: string
  amount: string
  note?: string
}
