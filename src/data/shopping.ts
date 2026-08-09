import type { ShoppingItem } from './types'
import { buildWeeklyShopping } from './weekShopping'

/** Итого на месяц — что купить. Нарезка и пакеты — во вкладке «Заготовки». */
export const monthlyMeatFish: ShoppingItem[] = [
  { product: 'Говядина (мякоть)', amount: '5,2 кг' },
  { product: 'Куриное филе', amount: '3,45 кг' },
  { product: 'Куриные ножки', amount: '2 кг' },
  { product: 'Куриные бёдра без кожи и костей', amount: '1,3 кг' },
  { product: 'Куриные крылья', amount: '1,5 кг' },
  { product: 'Форель (филе)', amount: '1,6 кг' },
  { product: 'Минтай (филе)', amount: '700 г' },
  { product: 'Креветки очищенные', amount: '900 г' },
]

export const monthlyFrozenVeg: ShoppingItem[] = [
  { product: 'Брокколи замороженная', amount: '1–1,5 кг' },
  { product: 'Цветная капуста', amount: '2 кочана или 1 кг зам.' },
]

/** @deprecated */
export const monthlyShopping: ShoppingItem[] = [
  ...monthlyMeatFish,
  ...monthlyFrozenVeg,
]

/**
 * Скоропорт по неделям — сумма ингредиентов из рецептов меню
 * (мясо/рыба из морозилки и кладовая не дублируются).
 */
export const weeklyShopping: Record<number, ShoppingItem[]> =
  buildWeeklyShopping()

/** @deprecated */
export const monthlyMarinades: ShoppingItem[] = []
/** @deprecated */
export const monthlyFreezer = monthlyShopping
