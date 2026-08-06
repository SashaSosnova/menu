/**
 * Пул блюд — основа меню.
 *
 * Неделя: 5 горячих + 5 гарниров + 1 полноценное
 * Месяц: 20 горячих + 20 гарниров + 4 полноценных
 *
 * Сочетаемость горячего и гарнира — dishMeta.sides.
 * Гарниры в пуле в основном сухие (крупы, картофель, овощи, паста, салат).
 */

export type Wetness = 'dry' | 'sauce'

export type CatalogDish = {
  name: string
  wetness: Wetness
  /** Соус день в день (к сухой рыбе) */
  daySauce?: string
}

/** —— ГОРЯЧЕЕ —— */

export const chickenMains: CatalogDish[] = [
  { name: 'Ножки медово-чесночные', wetness: 'dry' },
  { name: 'Ножки в паприке', wetness: 'dry' },
  { name: 'Крылья соево-медовые', wetness: 'dry' },
  { name: 'Крылья в паприке', wetness: 'dry' },
  { name: 'Бёдра запечённые со сметаной и чесноком', wetness: 'sauce' },
  { name: 'Филе в томатно-сметанном соусе', wetness: 'sauce' },
  { name: 'Куриный строганов', wetness: 'sauce' },
  { name: 'Куриные тефтели в томатно-сметанном соусе', wetness: 'sauce' },
  { name: 'Куриные котлеты', wetness: 'dry' },
  { name: 'Куриные отбивные в панировке', wetness: 'dry' },
]

/** Вся говядина с соусом — к ней только сухой гарнир */
export const beefMains: CatalogDish[] = [
  /** Уникальное: только макароны; готовка вместе с цельным */
  { name: 'Болоньезе', wetness: 'sauce' },
  { name: 'Бефстроганов', wetness: 'sauce' },
  { name: 'Гуляш с паприкой', wetness: 'sauce' },
  { name: 'Говядина с перцем в соевом', wetness: 'sauce' },
  { name: 'Рваная говядина в красном вине', wetness: 'sauce' },
  { name: 'Говядина в горчично-травной корочке', wetness: 'sauce' },
  { name: 'Говяжьи тефтели в томатно-сметанном соусе', wetness: 'sauce' },
]

/**
 * Сухая рыба — соус отдельно день в день → на тарелке как «с соусом»,
 * поэтому к ней идёт сухой гарнир.
 */
export const fishMains: CatalogDish[] = [
  { name: 'Форель в аэрогриле', wetness: 'dry' },
  { name: 'Форель со шпинатом и черри в сливках', wetness: 'sauce' },
  { name: 'Минтай запечённый с овощами и сыром', wetness: 'sauce' },
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
  { name: 'Картофельное пюре', wetness: 'dry' },
  { name: 'Картофель отварной с укропом', wetness: 'dry' },
]

export const grainSides: CatalogDish[] = [
  { name: 'Рис с луком и морковью', wetness: 'dry' },
  { name: 'Гречка с луком и морковью', wetness: 'dry' },
  { name: 'Булгур с луком и морковью', wetness: 'dry' },
]

export const vegSides: CatalogDish[] = [
  { name: 'Брокколи в аэрогриле с пармезаном', wetness: 'dry' },
  { name: 'Цветная капуста (аэрогриль или духовка)', wetness: 'dry' },
  { name: 'Овощи запечённые', wetness: 'dry' },
  { name: 'Свежий овощной салат', wetness: 'dry' },
]

export const pastaSides: CatalogDish[] = [
  { name: 'Паста отварная', wetness: 'dry' },
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

/** Пара ок, если ровно одно из двух — с соусом */
export function pairOk(main: CatalogDish, side: CatalogDish): boolean {
  return main.wetness !== side.wetness
}
