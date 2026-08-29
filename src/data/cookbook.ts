import { dishes, getDish } from './dishes'
import { dishMeta } from './dishMeta'
import { cycleMains } from './menu'
import type { Dish, Recipe } from './types'
import { withPrepPackStep } from '../lib/recipeSteps'

export type RecipeRating = 1 | 2 | 3 | 4 | 5

export const RATING_OPTIONS: { value: RecipeRating; label: string; short: string }[] = [
  { value: 1, label: 'Совсем не зашло', short: '✕' },
  { value: 2, label: 'Не очень', short: '2' },
  { value: 3, label: 'Нормально', short: '3' },
  { value: 4, label: 'Понравилось', short: '4' },
  { value: 5, label: 'Безумно понравилось', short: '★' },
]

export type RecipeOverride = {
  name?: string
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
  kind: 'component' | 'side' | 'extra'
}

export type CookbookStore = {
  recipes: Record<string, RecipeOverride>
  ratings: Record<string, RecipeRating>
  customDishes?: CustomDish[]
}

export const COOKBOOK_KEY = 'cookbook-v1'

export function isCustomDish(id: string, store: CookbookStore): boolean {
  return store.customDishes?.some((d) => d.id === id) ?? false
}

export function getCookbookDish(id: string, store: CookbookStore): Dish | undefined {
  const custom = store.customDishes?.find((d) => d.id === id)
  if (custom) {
    return { id: custom.id, name: custom.name, kind: custom.kind }
  }
  const dish = getDish(id)
  if (!dish) return undefined
  const name = store.recipes[id]?.name?.trim()
  return name ? { ...dish, name } : dish
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

export function getCookbookDishes(store: CookbookStore): {
  mains: Dish[]
  sides: Dish[]
  extras: Dish[]
} {
  const mains: Dish[] = []
  const sides: Dish[] = []
  const extras: Dish[] = []

  const orSecondary = new Set(cycleMains.flatMap((item) => item.orDishIds ?? []))

  for (const id of Object.keys(dishes)) {
    const meta = dishMeta[id]
    if (!meta) continue
    if (orSecondary.has(id)) continue
    const dish = getCookbookDish(id, store)
    if (!dish) continue

    if (meta.kind === 'component' || meta.kind === 'complete') {
      mains.push(dish)
    } else if (meta.kind === 'side') {
      sides.push(dish)
    } else if (meta.kind === 'extra') {
      extras.push(dish)
    }
  }

  for (const custom of store.customDishes ?? []) {
    const dish: Dish = { id: custom.id, name: custom.name, kind: custom.kind }
    if (custom.kind === 'component') mains.push(dish)
    else if (custom.kind === 'extra') extras.push(dish)
    else sides.push(dish)
  }

  const byName = (a: Dish, b: Dish) => a.name.localeCompare(b.name, 'ru')
  mains.sort(byName)
  sides.sort(byName)
  extras.sort(byName)

  return { mains, sides, extras }
}

export function getEffectiveRecipe(
  dishId: string,
  store: CookbookStore,
): Recipe | undefined {
  const recipe = getEditableRecipe(dishId, store)
  if (!recipe) return undefined
  return {
    ...recipe,
    steps: withPrepPackStep(dishId, recipe.steps),
  }
}

/** Рецепт как в книге, без авто-шага про пакет из морозилки. */
export function getEditableRecipe(
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
