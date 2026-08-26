/**
 * Пул блюд — основа меню.
 *
 * Неделя: 5 горячих + 5 гарниров + 1 полноценное
 * Месяц: 20 горячих + 20 гарниров + 4 полноценных
 *
 * Вкусные пары горячее + гарнир — dishMeta.sides.
 */

export type CatalogDish = {
  name: string
}

/** —— ГОРЯЧЕЕ —— */

export const chickenMains: CatalogDish[] = [
  { name: 'Ножки медово-чесночные' },
  { name: 'Ножки в паприке' },
  { name: 'Крылья соево-медовые' },
  { name: 'Крылья в паприке' },
  { name: 'Бёдра запечённые со сметаной и чесноком' },
  { name: 'Филе в томатно-сметанном соусе' },
  { name: 'Куриный строганов' },
  { name: 'Куриные тефтели в томатно-сметанном соусе' },
  { name: 'Куриные котлеты' },
  { name: 'Куриные отбивные в панировке' },
]

export const beefMains: CatalogDish[] = [
  { name: 'Болоньезе' },
  { name: 'Бефстроганов' },
  { name: 'Гуляш с паприкой' },
  { name: 'Говядина с перцем в соевом' },
  { name: 'Рваная говядина в красном вине' },
  { name: 'Говядина в горчично-травной корочке' },
  { name: 'Говяжьи тефтели в томатно-сметанном соусе' },
]

export const fishMains: CatalogDish[] = [
  { name: 'Форель в аэрогриле' },
  { name: 'Форель со шпинатом и черри в сливках' },
  { name: 'Минтай запечённый с овощами и сыром' },
]

/** @deprecated Соусы день в день больше не используются */
export const fishDaySauces = [] as const

export const mains = {
  chicken: chickenMains,
  beef: beefMains,
  fish: fishMains,
} as const

/** —— ГАРНИРЫ —— */

export const potatoSides: CatalogDish[] = [
  { name: 'Картофельное пюре' },
  { name: 'Картофель отварной с укропом' },
]

export const grainSides: CatalogDish[] = [
  { name: 'Рис с луком и морковью' },
  { name: 'Гречка с луком и морковью' },
  { name: 'Булгур с луком и морковью' },
]

export const vegSides: CatalogDish[] = [
  { name: 'Брокколи в аэрогриле с пармезаном' },
  { name: 'Цветная капуста (аэрогриль или духовка)' },
  { name: 'Овощи запечённые' },
  { name: 'Свежий овощной салат' },
]

export const pastaSides: CatalogDish[] = [
  { name: 'Паста отварная' },
]

export const sides = {
  potato: potatoSides,
  grain: grainSides,
  veg: vegSides,
  pasta: pastaSides,
} as const

export type SideGroup = keyof typeof sides

/** —— ПОЛНОЦЕННЫЕ —— */

export type CompleteProtein = 'shrimp' | 'chicken' | 'beef'

export type CompleteDish = {
  name: string
  protein: CompleteProtein
}

export const completes: CompleteDish[] = [
  { name: 'Золотой рис с креветками (Хайнань)', protein: 'shrimp' },
  { name: 'Паста с креветками', protein: 'shrimp' },
  { name: 'Паста с курицей и грибами', protein: 'chicken' },
  { name: 'Картофель тушёный с мясом', protein: 'beef' },
  { name: 'Картофель запечённый с курицей', protein: 'chicken' },
]
