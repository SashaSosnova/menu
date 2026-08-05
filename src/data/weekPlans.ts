import type { CookBatch, ShoppingItem, WeekPlan } from './types'
import { dryForMeals, potatoForMeals } from './portions'

const baseWeekly: ShoppingItem[] = [
  { product: 'Лук', amount: '1,5–2 кг', note: 'Соусы + зажарка к крупам/пасте' },
  { product: 'Морковь', amount: '0,8–1 кг', note: 'Соусы + зажарка к гарнирам' },
  { product: 'Чеснок', amount: '2–3 головки' },
  { product: 'Огурцы свежие', amount: '6–7 шт', note: 'К тарелке' },
  { product: 'Помидоры', amount: '800 г–1 кг', note: 'К тарелке' },
  { product: 'Перец сладкий', amount: '2–3 шт' },
  { product: 'Капуста на салат', amount: '½–1 вилка' },
  {
    product: 'Морковь/капуста по-корейски',
    amount: 'по желанию',
    note: 'Закуска к тарелке',
  },
  { product: 'Сметана 20%', amount: '350–400 г', note: 'Салаты + соусы' },
  { product: 'Йогурт натуральный', amount: '200 г', note: 'Иногда в салат' },
  { product: 'Зелень', amount: '2 пучка' },
  {
    product: 'К тарелке (опционально)',
    amount: 'по желанию',
    note: 'Сыр, колбаса, фрукты, овощи',
  },
]

function batch(
  when: string,
  covers: string,
  time: string,
  title: string,
  mains: CookBatch['mains'],
  sides: CookBatch['sides'],
  note?: string,
): CookBatch {
  return { when, covers, time, title, mains, sides, note }
}

const portion6 = '6 порций'

/**
 * На каждой неделе ровно 1 цельное, тип чередуется:
 * 1 паста · 2 картошка · 3 овощи · 4 крупа
 * Белки/нед: мясо 2 · курица 2–3 · рыба 1; креветки 2×/мес (нед. 1 и 4).
 * Без цельного: 2 основных + 2 гарнира. С цельным: + 1 основной + 1 гарнир.
 * Два гарнира — разных типов (не две крупы / не две пасты / не две картошки).
 * Каждый component-основной сочетается с каждым гарниром готовки.
 */
export const weekPlans: WeekPlan[] = [
  {
    week: 1,
    completeDishId: 'shrimp_pasta',
    freeDayNote:
      'Воскресенье — свободный день: доставка, семья, остатки. Обязательного меню нет.',
    batches: [
      batch(
        'Вс / Пн',
        'пн–вт',
        '≤2 ч',
        'Говядина + курица · паста с грибами + гречка с овощами',
        [
          { dishId: 'bolognese', portions: portion6 },
          { dishId: 'chicken_tomato_cream', portions: portion6 },
        ],
        [
          { dishId: 'pasta_mushroom', portions: portion6 },
          { dishId: 'buckwheat_veg', portions: portion6 },
        ],
      ),
      batch(
        'Среда',
        'ср–чт',
        '≤1,5 ч',
        'Ножки + форель · рис с овощами + брокколи',
        [
          { dishId: 'chicken_legs', portions: '8 шт (~6 порций)' },
          { dishId: 'trout', portions: portion6 },
        ],
        [
          { dishId: 'rice_veg', portions: portion6 },
          { dishId: 'broccoli_roast', portions: portion6 },
        ],
        'Брокколи — к рыбе. Сливочный соус к форели в день еды.',
      ),
      batch(
        'Пятница',
        'пт–сб',
        '≤1,5 ч',
        'Паста с креветками (цельное · паста) + говядина в томате · киноа с овощами',
        [
          { dishId: 'shrimp_pasta', portions: portion6 },
          { dishId: 'beef_tomato', portions: portion6 },
        ],
        [{ dishId: 'quinoa_veg', portions: portion6 }],
        'Цельное недели — паста. Креветки 1-й раз за месяц. К говядине — киноа. Мясо 2 · курица 2 · рыба 1 · креветки 1.',
      ),
    ],
    shopping: [
      ...baseWeekly,
      { product: 'Томаты в соку', amount: '800 г', note: 'Болоньезе + говядина в томате' },
      { product: 'Томаты / томатная паста', amount: '300 г + 2 ст.л.', note: 'Курица в соусе' },
      { product: 'Сливки 10%', amount: '300–350 мл', note: 'Форель + паста с креветками' },
      { product: 'Сливочное масло', amount: '50 г' },
      { product: 'Шампиньоны', amount: '350–400 г', note: 'Вс/пн к пасте' },
      { product: 'Перец сладкий доп.', amount: '2 шт', note: 'Говядина в томате' },
      { product: 'Брокколи или цветная', amount: '800–900 г', note: 'Ср к рыбе' },
      {
        product: 'Макароны',
        amount: `${dryForMeals('pasta', 2) + dryForMeals('pasta', 1)} г`,
        note: 'Вс/пн с грибами + пт цельное',
      },
      {
        product: 'Гречка',
        amount: `${dryForMeals('buckwheat', 2)} г`,
        note: 'Вс/пн с луком и морковью',
      },
      {
        product: 'Рис',
        amount: `${dryForMeals('rice', 2)} г`,
        note: 'Ср с луком и морковью',
      },
      {
        product: 'Киноа',
        amount: `${dryForMeals('quinoa', 2)} г`,
        note: 'Пт с луком и морковью — к говядине',
      },
      { product: 'Лимон', amount: '1 шт', note: 'По желанию к форели' },
    ],
  },

  {
    week: 2,
    completeDishId: 'chicken_potato_roast',
    freeDayNote:
      'Воскресенье — свободный день: доставка, семья, остатки. Обязательного меню нет.',
    batches: [
      batch(
        'Вс / Пн',
        'пн–вт',
        '≤2 ч',
        'Гуляш + курица с ананасом · рис с овощами + брокколи',
        [
          { dishId: 'goulash', portions: portion6 },
          { dishId: 'pineapple_chicken', portions: portion6 },
        ],
        [
          { dishId: 'rice_veg', portions: portion6 },
          { dishId: 'broccoli_roast', portions: portion6 },
        ],
        'Оба гарнира — к обоим основным. Сливочную пасту на этой неделе к пт (к тушёной говядине).',
      ),
      batch(
        'Среда',
        'ср–чт',
        '≤1,5 ч',
        'Крылья + минтай · булгур с овощами + брокколи',
        [
          { dishId: 'wings', portions: '16 шт (~6 порций)' },
          { dishId: 'pollock', portions: portion6 },
        ],
        [
          { dishId: 'bulgur_veg', portions: portion6 },
          { dishId: 'broccoli_roast', portions: portion6 },
        ],
        'Брокколи к рыбе. Томатно-сливочный соус к минтаю — в день еды.',
      ),
      batch(
        'Пятница',
        'пт–сб',
        '≤1,5 ч',
        'Жаркое курица+картошка (цельное · картошка) + тушёная говядина · паста со сливками',
        [
          { dishId: 'chicken_potato_roast', portions: portion6 },
          { dishId: 'beef_stew', portions: portion6 },
        ],
        [{ dishId: 'pasta_cream', portions: portion6 }],
        'Цельное недели — картошка. К говядине — сливочная паста. Креветок на этой неделе нет. Мясо 2 · курица 3 · рыба 1.',
      ),
    ],
    shopping: [
      ...baseWeekly,
      { product: 'Кабачки или брокколи в рагу', amount: '300 г', note: 'Не обязательно — жаркое отдельно' },
      { product: 'Брокколи или цветная', amount: '1,4–1,6 кг', note: 'Вс/пн + ср к рыбе/обоим' },
      { product: 'Перец сладкий', amount: '4 шт' },
      { product: 'Ананас в соку', amount: '250–300 г' },
      { product: 'Томатная паста', amount: '2–3 ст.л.' },
      { product: 'Сливки 10%', amount: '300–350 мл', note: 'Паста пт + минтай' },
      { product: 'Чеснок доп.', amount: '1 головка', note: 'Сливочная паста пт' },
      { product: 'Паприка сладкая', amount: '2 ст.л.' },
      { product: 'Соевый соус', amount: '3 ст.л.' },
      { product: 'Мёд', amount: '1 ч.л.' },
      { product: 'Сметана', amount: '400 г', note: 'Гуляш + жаркое + тушёная говядина' },
      {
        product: 'Макароны',
        amount: `${dryForMeals('pasta', 2)} г`,
        note: 'Пт в сливочном соусе — к говядине',
      },
      {
        product: 'Рис',
        amount: `${dryForMeals('rice', 2)} г`,
        note: 'Вс/пн с луком и морковью',
      },
      {
        product: 'Булгур',
        amount: `${dryForMeals('bulgur', 2)} г`,
        note: 'Ср с луком и морковью',
      },
      {
        product: 'Картофель',
        amount: '900 г',
        note: 'Пт в жаркое (цельное) — в ср картошки нет',
      },
    ],
  },

  {
    week: 3,
    completeDishId: 'chicken_veg_stew',
    freeDayNote:
      'Воскресенье — свободный день: доставка, семья, остатки. Обязательного меню нет.',
    batches: [
      batch(
        'Вс / Пн',
        'пн–вт',
        '≤2 ч',
        'Бефстроганов + курица с грибами · паста с сыром + пюре',
        [
          { dishId: 'beef_stroganoff', portions: portion6 },
          { dishId: 'chicken_mushrooms', portions: portion6 },
        ],
        [
          { dishId: 'pasta_cheese', portions: portion6 },
          { dishId: 'mash', portions: portion6 },
        ],
        'Пюре — к бефстроганову. К курице — паста с сыром.',
      ),
      batch(
        'Среда',
        'ср–чт',
        '≤1,5 ч',
        'Курица с овощами (цельное · овощи) + форель · рис с овощами',
        [
          { dishId: 'chicken_veg_stew', portions: portion6 },
          { dishId: 'trout', portions: portion6 },
        ],
        [{ dishId: 'rice_veg', portions: portion6 }],
        'Цельное недели — овощи. К форели — рис. Картошка была в вс/пн (пюре).',
      ),
      batch(
        'Пятница',
        'пт–сб',
        '≤1,5 ч',
        'Бёдра + говядина с паприкой · паста с грибами + киноа с овощами',
        [
          { dishId: 'thighs_soy', portions: '10 шт (~6 порций)' },
          { dishId: 'beef_paprikash', portions: portion6 },
        ],
        [
          { dishId: 'pasta_mushroom', portions: portion6 },
          { dishId: 'quinoa_veg', portions: portion6 },
        ],
        'Креветок нет (уже были в нед. 1). Без двойных сливок. Мясо 2 · курица 3 · рыба 1.',
      ),
    ],
    shopping: [
      ...baseWeekly,
      { product: 'Брокколи или цветная', amount: '300–400 г', note: 'К тарелке / в рагу по желанию' },
      { product: 'Кабачок', amount: '300 г', note: 'В цельное рагу' },
      { product: 'Перец сладкий', amount: '4–5 шт', note: 'Рагу + паприкаш' },
      { product: 'Шампиньоны', amount: '750–800 г', note: 'Курица с грибами + паста пт' },
      { product: 'Сливки 10%', amount: '150–200 мл', note: 'Только к форели в день еды' },
      { product: 'Твёрдый сыр', amount: '80–100 г', note: 'Вс/пн к пасте' },
      { product: 'Томатная паста', amount: '2–3 ст.л.' },
      { product: 'Паприка сладкая', amount: '2 ст.л.', note: 'Паприкаш' },
      {
        product: 'Соевый / мёд к бёдрам',
        amount: 'если ещё не в маринаде',
      },
      { product: 'Сметана доп.', amount: '450 г', note: 'Бефстроганов + грибы + рагу + паприкаш' },
      {
        product: 'Макароны',
        amount: `${dryForMeals('pasta', 2) + dryForMeals('pasta', 2)} г`,
        note: 'Вс/пн с сыром + пт с грибами',
      },
      {
        product: 'Рис',
        amount: `${dryForMeals('rice', 2)} г`,
        note: 'Ср с луком и морковью — к форели',
      },
      {
        product: 'Киноа',
        amount: `${dryForMeals('quinoa', 2)} г`,
        note: 'Пт с луком и морковью',
      },
      {
        product: 'Картофель',
        amount: `${potatoForMeals(2)} г`,
        note: 'Вс/пн пюре',
      },
      { product: 'Молоко 1,5%', amount: '100 мл', note: 'Пюре' },
    ],
  },

  {
    week: 4,
    completeDishId: 'rice_meat',
    freeDayNote:
      'Воскресенье — свободный день: доставка, семья, остатки. Обязательного меню нет.',
    batches: [
      batch(
        'Вс / Пн',
        'пн–вт',
        '≤2 ч',
        'Рис с мясом (цельное · крупа) + куриный строганов · гречка с овощами',
        [
          { dishId: 'rice_meat', portions: portion6 },
          { dishId: 'chicken_stroganoff', portions: portion6 },
        ],
        [{ dishId: 'buckwheat_veg', portions: portion6 }],
        'Цельное недели — крупа. К строганову — гречка.',
      ),
      batch(
        'Среда',
        'ср–чт',
        '≤1,5 ч',
        'Говядина с перцем + минтай · паста с грибами + брокколи',
        [
          { dishId: 'beef_pepper', portions: portion6 },
          { dishId: 'pollock', portions: portion6 },
        ],
        [
          { dishId: 'pasta_mushroom', portions: portion6 },
          { dishId: 'broccoli_roast', portions: portion6 },
        ],
        'Брокколи к рыбе. Сливочно-укропный соус — в день еды.',
      ),
      batch(
        'Пятница',
        'пт–сб',
        '≤1,5 ч',
        'Креветки с ананасом + тефтели · рис с овощами + брокколи',
        [
          { dishId: 'pineapple_shrimp', portions: portion6 },
          { dishId: 'chicken_meatballs', portions: portion6 },
        ],
        [
          { dishId: 'rice_veg', portions: portion6 },
          { dishId: 'broccoli_roast', portions: portion6 },
        ],
        'Оба гарнира — к обоим основным. Креветки 2-й раз за месяц. Мясо 2 · курица 2 · рыба 1 · креветки 1.',
      ),
    ],
    shopping: [
      ...baseWeekly,
      { product: 'Брокколи или цветная', amount: '1,4–1,6 кг', note: 'Ср + пт' },
      { product: 'Перец сладкий', amount: '5–6 шт', note: 'Говядина ср + креветки' },
      { product: 'Шампиньоны', amount: '350–400 г', note: 'Ср паста + строганов по желанию' },
      { product: 'Сливки 10%', amount: '100 мл', note: 'К минтаю' },
      { product: 'Соевый соус', amount: '7 ст.л.', note: 'Рис с мясом + говядина ср + креветки' },
      { product: 'Ананас в соку', amount: '200 г' },
      { product: 'Мёд', amount: '½ ч.л.' },
      { product: 'Томатная паста', amount: '2 ст.л.' },
      { product: 'Сметана', amount: '300 г', note: 'Строганов + тефтели' },
      {
        product: 'Рис',
        amount: `${150 + dryForMeals('rice', 2)} г`,
        note: '150 г в цельное + пт рис с овощами',
      },
      {
        product: 'Гречка',
        amount: `${dryForMeals('buckwheat', 2)} г`,
        note: 'Вс/пн с луком и морковью',
      },
      {
        product: 'Макароны',
        amount: `${dryForMeals('pasta', 2)} г`,
        note: 'Ср с грибной поджаркой',
      },
      { product: 'Сухари панировочные', amount: '1 ст.л.', note: 'Тефтели и котлеты' },
    ],
  },
]

export function getWeekPlan(week: number): WeekPlan {
  return weekPlans.find((p) => p.week === week)!
}
