/**
 * Пул блюд — основа меню.
 *
 * Неделя: 5 горячих + 5 гарниров + 1 полноценное
 * Месяц: 20 горячих + 20 гарниров + 4 полноценных
 *
 * Правило пары:
 *   сухой гарнир  + горячее с соусом
 *   гарнир с соусом + сухое горячее
 *
 * В готовке предпочтительно оба горячих одной «мокрости»,
 * чтобы любой гарнир подходил к любому горячему.
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
  { name: 'Ножки в медово-чесночном маринаде', wetness: 'dry' },
  { name: 'Ножки в паприке с чесноком', wetness: 'dry' },
  { name: 'Бёдра в соево-медовом маринаде', wetness: 'dry' },
  { name: 'Бёдра запечённые со сметаной и чесноком', wetness: 'sauce' },
  { name: 'Крылья в соево-медовом маринаде', wetness: 'dry' },
  { name: 'Крылья в паприке с чесноком', wetness: 'dry' },
  { name: 'Филе в томатно-сметанном соусе', wetness: 'sauce' },
  { name: 'Филе с грибами в сметане', wetness: 'sauce' },
  { name: 'Куриный строганов', wetness: 'sauce' },
  { name: 'Филе запечённое с травами', wetness: 'dry' },
  { name: 'Филе кубиками с овощами', wetness: 'sauce' },
  { name: 'Куриные котлеты', wetness: 'dry' },
  { name: 'Куриные тефтели в томатном соусе', wetness: 'sauce' },
  { name: 'Куриные тефтели в томатно-сметанном соусе', wetness: 'sauce' },
]

/** Вся говядина с соусом — к ней только сухой гарнир */
export const beefMains: CatalogDish[] = [
  { name: 'Болоньезе', wetness: 'sauce' },
  { name: 'Тушёное мясо с овощами', wetness: 'sauce' },
  { name: 'Говядина тушёная со сметаной', wetness: 'sauce' },
  { name: 'Бефстроганов', wetness: 'sauce' },
  { name: 'Гуляш с паприкой', wetness: 'sauce' },
  { name: 'Говядина в томатном соусе', wetness: 'sauce' },
  { name: 'Говядина с перцем в соевом', wetness: 'sauce' },
  { name: 'Говядина с паприкой и перцем', wetness: 'sauce' },
]

/**
 * Сухая рыба — соус отдельно день в день → на тарелке как «с соусом»,
 * поэтому к ней идёт сухой гарнир.
 */
export const fishMains: CatalogDish[] = [
  {
    name: 'Форель на гриле',
    wetness: 'sauce',
    daySauce: 'Сливочно-укропный соус',
  },
  {
    name: 'Форель запечённая с лимоном',
    wetness: 'sauce',
    daySauce: 'Сливочно-укропный соус',
  },
  { name: 'Минтай с овощами в духовке', wetness: 'sauce' },
  { name: 'Минтай в томатно-сливочном соусе', wetness: 'sauce' },
]

/** Соусы день в день к сухой рыбе */
export const fishDaySauces = [
  'Сливочно-укропный соус',
  'Томатно-сливочный соус',
  'Сливочный с чесноком',
] as const

export const mains = {
  chicken: chickenMains,
  beef: beefMains,
  fish: fishMains,
} as const

/** —— ГАРНИРЫ —— */

export const potatoSides: CatalogDish[] = [
  { name: 'Картофельное пюре', wetness: 'dry' },
  { name: 'Картофель запечённый дольками', wetness: 'dry' },
  { name: 'Картофель отварной с укропом', wetness: 'dry' },
  { name: 'Картофель тушёный с луком и морковью', wetness: 'sauce' },
]

export const grainSides: CatalogDish[] = [
  { name: 'Рис отварной', wetness: 'dry' },
  { name: 'Рис с луком и морковью', wetness: 'dry' },
  { name: 'Гречка отварная', wetness: 'dry' },
  { name: 'Гречка с луком и морковью', wetness: 'dry' },
  { name: 'Булгур отварной', wetness: 'dry' },
  { name: 'Булгур с луком и морковью', wetness: 'dry' },
  { name: 'Киноа отварная', wetness: 'dry' },
  { name: 'Киноа с луком и морковью', wetness: 'dry' },
]

export const vegSides: CatalogDish[] = [
  { name: 'Брокколи на пару', wetness: 'dry' },
  { name: 'Брокколи запечённая', wetness: 'dry' },
  { name: 'Цветная капуста жареная', wetness: 'dry' },
  { name: 'Цветная капуста запечённая', wetness: 'dry' },
]

export const pastaSides: CatalogDish[] = [
  { name: 'Паста отварная', wetness: 'dry' },
  { name: 'Паста с томатной зажаркой', wetness: 'sauce' },
  { name: 'Паста в сливочно-чесночном соусе', wetness: 'sauce' },
  { name: 'Паста с сыром и зеленью', wetness: 'sauce' },
  { name: 'Паста с грибной поджаркой', wetness: 'sauce' },
  { name: 'Спагетти отварные', wetness: 'dry' },
  { name: 'Спагетти с томатной зажаркой', wetness: 'sauce' },
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
  { name: 'Паста с креветками', protein: 'shrimp' },
  { name: 'Рис с овощами и креветками', protein: 'shrimp' },
  { name: 'Паста с курицей и кабачком', protein: 'chicken' },
  { name: 'Картофель тушёный с мясом', protein: 'beef' },
  { name: 'Картофель запечённый с курицей', protein: 'chicken' },
]

/** Пара ок, если ровно одно из двух — с соусом */
export function pairOk(main: CatalogDish, side: CatalogDish): boolean {
  return main.wetness !== side.wetness
}
