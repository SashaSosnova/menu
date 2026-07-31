import type { ShoppingItem } from './types'

/** Итого на месяц — что купить. Нарезка и пакеты — во вкладке «Заготовки». */
export const monthlyMeatFish: ShoppingItem[] = [
  { product: 'Говядина (мякоть)', amount: '4,7 кг' },
  { product: 'Куриное филе', amount: '4,2 кг' },
  { product: 'Куриные ножки', amount: '2 кг' },
  { product: 'Куриные бёдра без кожи и костей', amount: '1,3 кг' },
  { product: 'Куриные крылья', amount: '3 кг' },
  { product: 'Форель (филе)', amount: '1,4 кг' },
  { product: 'Минтай (филе)', amount: '700 г' },
  { product: 'Креветки очищенные', amount: '400 г' },
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

/** Скоропорт и овощи по неделям — только продукт и количество */
export const weeklyShopping: Record<number, ShoppingItem[]> = {
  1: [
    { product: 'Лук', amount: '1,5 кг' },
    { product: 'Морковь', amount: '0,8 кг' },
    { product: 'Перец сладкий', amount: '4 шт' },
    { product: 'Кабачок', amount: '2 шт' },
    { product: 'Томаты', amount: '800 г' },
    { product: 'Томаты в соку', amount: '1 банка' },
    { product: 'Сметана 20%', amount: '400 г' },
    { product: 'Сливки 10%', amount: '200 мл' },
    { product: 'Чеснок', amount: '2 головки' },
    { product: 'Картофель', amount: '1 кг' },
    { product: 'Макароны', amount: '550 г' },
    { product: 'Гречка', amount: '330 г' },
    { product: 'Рис', amount: '290 г' },
    { product: 'Брокколи', amount: '900 г' },
    { product: 'Зелень', amount: '2 пучка' },
    { product: 'Огурцы', amount: '4 шт' },
    { product: 'Помидоры на салат', amount: '4 шт' },
  ],
  2: [
    { product: 'Лук', amount: '1,5 кг' },
    { product: 'Морковь', amount: '0,8 кг' },
    { product: 'Перец сладкий', amount: '3 шт' },
    { product: 'Шампиньоны', amount: '400 г' },
    { product: 'Сметана 20%', amount: '500 г' },
    { product: 'Сливки 10%', amount: '300 мл' },
    { product: 'Укроп', amount: '1 пучок' },
    { product: 'Картофель', amount: '1,8 кг' },
    { product: 'Цветная капуста', amount: '1 кочан' },
    { product: 'Макароны', amount: '370 г' },
    { product: 'Киноа', amount: '280 г' },
    { product: 'Булгур', amount: '330 г' },
    { product: 'Лимон', amount: '1 шт' },
    { product: 'Зелень', amount: '1 пучок' },
  ],
  3: [
    { product: 'Лук', amount: '1,5 кг' },
    { product: 'Морковь', amount: '1 кг' },
    { product: 'Перец сладкий', amount: '5 шт' },
    { product: 'Кабачок', amount: '2 шт' },
    { product: 'Томаты', amount: '500 г' },
    { product: 'Сметана 20%', amount: '400 г' },
    { product: 'Сливки 10%', amount: '150 мл' },
    { product: 'Картофель', amount: '2 кг' },
    { product: 'Брокколи', amount: '900 г' },
    { product: 'Рис', amount: '290 г' },
    { product: 'Булгур', amount: '330 г' },
    { product: 'Макароны', amount: '370 г' },
    { product: 'Твёрдый сыр', amount: '100 г' },
    { product: 'Зелень', amount: '2 пучка' },
  ],
  4: [
    { product: 'Лук', amount: '1,5 кг' },
    { product: 'Морковь', amount: '1 кг' },
    { product: 'Перец сладкий', amount: '3 шт' },
    { product: 'Кабачок', amount: '5 шт' },
    { product: 'Сметана 20%', amount: '400 г' },
    { product: 'Сливки 10%', amount: '250 мл' },
    { product: 'Укроп', amount: '1 пучок' },
    { product: 'Лимон', amount: '1 шт' },
    { product: 'Картофель', amount: '1 кг' },
    { product: 'Цветная капуста', amount: '1 кочан' },
    { product: 'Макароны', amount: '550 г' },
    { product: 'Гречка', amount: '330 г' },
    { product: 'Киноа', amount: '280 г' },
    { product: 'Шампиньоны', amount: '200 г' },
    { product: 'Зелень', amount: '1 пучок' },
  ],
}

/** @deprecated */
export const monthlyMarinades: ShoppingItem[] = []
/** @deprecated */
export const monthlyFreezer = monthlyShopping
