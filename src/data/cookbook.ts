import { dishes, getDish } from './dishes'
import { dishMeta } from './dishMeta'
import type { Dish, Recipe } from './types'

/** Соусы день в день — не показываем в книге */
const SAUCE_IDS = new Set(['cream_sauce', 'tomato_cream_sauce', 'cream_dill_sauce'])

export type RecipeRating = 1 | 2 | 3 | 4 | 5

export const RATING_OPTIONS: { value: RecipeRating; label: string; short: string }[] = [
  { value: 1, label: 'Совсем не зашло', short: '✕' },
  { value: 2, label: 'Не очень', short: '2' },
  { value: 3, label: 'Нормально', short: '3' },
  { value: 4, label: 'Понравилось', short: '4' },
  { value: 5, label: 'Безумно понравилось', short: '★' },
]

export type RecipeOverride = {
  servings?: string
  ingredients?: string[]
  steps?: string
  storage?: string
  /** Личная заметка к блюду */
  note?: string
}

export type CustomDish = {
  id: string
  name: string
  kind: 'component' | 'side'
}

export type CookbookStore = {
  recipes: Record<string, RecipeOverride>
  ratings: Record<string, RecipeRating>
  customDishes?: CustomDish[]
}

export const COOKBOOK_KEY = 'cookbook-v1'

/** @deprecated Используйте MenuSyncProvider — оставлено для совместимости */
export function loadCookbook(): CookbookStore {
  try {
    const raw = localStorage.getItem(COOKBOOK_KEY)
    if (!raw) return { recipes: {}, ratings: {}, customDishes: [] }
    const parsed = JSON.parse(raw) as CookbookStore
    return {
      recipes: parsed.recipes ?? {},
      ratings: parsed.ratings ?? {},
      customDishes: parsed.customDishes ?? [],
    }
  } catch {
    return { recipes: {}, ratings: {}, customDishes: [] }
  }
}

/** @deprecated Используйте MenuSyncProvider */
export function saveCookbook(_store: CookbookStore): void {
  // no-op — сохранение через appStore / облако
}

export function isCustomDish(id: string, store: CookbookStore): boolean {
  return store.customDishes?.some((d) => d.id === id) ?? false
}

export function getCookbookDish(id: string, store: CookbookStore): Dish | undefined {
  const custom = store.customDishes?.find((d) => d.id === id)
  if (custom) {
    return { id: custom.id, name: custom.name, kind: custom.kind }
  }
  return getDish(id)
}

export function createCustomDishId(): string {
  return `custom_${Date.now()}`
}

export function removeCustomDish(store: CookbookStore, id: string): CookbookStore {
  const { [id]: _recipe, ...recipes } = store.recipes
  const { [id]: _rating, ...ratings } = store.ratings
  return {
    recipes,
    ratings,
    customDishes: store.customDishes?.filter((d) => d.id !== id) ?? [],
  }
}

export function getCookbookDishes(store: CookbookStore): { mains: Dish[]; sides: Dish[] } {
  const mains: Dish[] = []
  const sides: Dish[] = []

  for (const id of Object.keys(dishes)) {
    const meta = dishMeta[id]
    if (!meta) continue
    const dish = getDish(id)
    if (!dish) continue

    if (meta.kind === 'component' || meta.kind === 'complete') {
      mains.push(dish)
    } else if (meta.kind === 'side' && !SAUCE_IDS.has(id)) {
      sides.push(dish)
    }
  }

  for (const custom of store.customDishes ?? []) {
    const dish: Dish = { id: custom.id, name: custom.name, kind: custom.kind }
    if (custom.kind === 'component') mains.push(dish)
    else sides.push(dish)
  }

  const byName = (a: Dish, b: Dish) => a.name.localeCompare(b.name, 'ru')
  mains.sort(byName)
  sides.sort(byName)

  return { mains, sides }
}

export function getEffectiveRecipe(
  dishId: string,
  store: CookbookStore,
): Recipe | undefined {
  const base = getDish(dishId)?.recipe
  const override = store.recipes[dishId]
  if (!base && !override) return undefined

  return {
    servings: override?.servings ?? base?.servings ?? '',
    ingredients: override?.ingredients ?? base?.ingredients ?? [],
    steps: override?.steps ?? base?.steps ?? '',
    storage: override?.storage ?? base?.storage,
    weeks: base?.weeks,
  }
}

export function hasRecipeOverride(dishId: string, store: CookbookStore): boolean {
  if (isCustomDish(dishId, store)) return true
  return Boolean(store.recipes[dishId])
}

export function ratingLabel(rating: RecipeRating): string {
  return RATING_OPTIONS.find((o) => o.value === rating)?.label ?? ''
}
