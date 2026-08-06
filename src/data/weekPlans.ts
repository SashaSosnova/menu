import type { CookBatch, ShoppingItem, WeekPlan } from './types'
import { dryForMeals, potatoForMeals } from './portions'

const baseWeekly: ShoppingItem[] = [
  { product: 'Лук', amount: '1,5–2 кг', note: 'Соусы + зажарка к крупам/пасте' },
  { product: 'Морковь', amount: '0,8–1 кг', note: 'Соусы + зажарка к гарнирам' },
  { product: 'Чеснок', amount: '2–3 головки' },
  { product: 'Огурцы свежие', amount: '6–7 шт', note: 'К тарелке' },
  { product: 'Помидоры', amount: '800 г–1 кг', note: 'К тарелке' },
  { product: 'Перец сладкий', amount: '2–3 шт' },
  { product: 'Салат листовой', amount: '1 упаковка', note: 'К тарелке / вместо капусты' },
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
 * На каждой неделе ровно 1 цельное:
 * 1 крупа (рис с креветками) · 2 паста (креветки) · 3 картошка · 4 паста (курица+грибы)
 * Белки/нед: мясо 2 · курица 2–3 · рыба 1; креветки на нед. 1 и 2.
 * Без цельного: 2 основных + 2 гарнира. С цельным: + 1 основной + 1 гарнир.
 * Два гарнира — разных типов (не две крупы / не две пасты / не две картошки).
 * Каждый component-основной сочетается с каждым гарниром готовки.
 */
export const weekPlans: WeekPlan[] = [
  {
    week: 1,
    completeDishId: 'shrimp_rice_hainan',
    freeDayNote:
      'Воскресенье — свободный день: доставка, семья, остатки. Обязательного меню нет.',
    batches: [
      batch(
        'Вс / Пн',
        'пн–вт',
        '≤2 ч',
        'Говядина с перцем + курица томат-сметана · гречка + брокколи',
        [
          { dishId: 'beef_pepper', portions: portion6 },
          { dishId: 'chicken_tomato_cream', portions: portion6 },
        ],
        [
          { dishId: 'buckwheat_veg', portions: portion6 },
          { dishId: 'broccoli_steam', portions: portion6 },
        ],
      ),
      batch(
        'Среда',
        'ср–чт',
        '≤1,5 ч',
        'Отбивные в панировке + ножки · пюре + овощи запечённые',
        [
          { dishId: 'chicken_schnitzel', portions: portion6 },
          {
            dishId: 'chicken_legs_honey',
            orDishIds: ['chicken_legs_paprika'],
            portions: '8 шт (~6 порций)',
          },
        ],
        [
          { dishId: 'mash', portions: portion6 },
          { dishId: 'roast_veg', portions: portion6 },
        ],
      ),
      batch(
        'Пятница',
        'пт–сб',
        '≤1,5 ч',
        'Болоньезе + золотой рис с креветками (цельное) · паста к болоньезе',
        [
          { dishId: 'bolognese', portions: portion6 },
          { dishId: 'shrimp_rice_hainan', portions: portion6 },
        ],
        [{ dishId: 'pasta', portions: portion6 }],
        'Болоньезе уникальное — только паста. Цельное — золотой рис с креветками. Мясо 2 · курица 3 · море 1.',
      ),
    ],
    shopping: [
      ...baseWeekly,
      { product: 'Томаты в соку', amount: '400 г', note: 'Болоньезе пт' },
      { product: 'Томаты / томатная паста', amount: '300 г + 2 ст.л.', note: 'Курица в соусе пн' },
      { product: 'Брокколи', amount: '850 г', note: 'Пн в аэрогриле' },
      { product: 'Сыр твёрдый Пармезан', amount: '40 г', note: 'Пн брокколи' },
      { product: 'Креветки', amount: '450 г', note: 'Пт цельное' },
      { product: 'Чеснок', amount: '2 головки доп.', note: 'Пт золотой рис — много чеснока' },
      { product: 'Горошек', amount: '120 г', note: 'Пт золотой рис' },
      { product: 'Кукуруза', amount: '120 г', note: 'Пт золотой рис' },
      { product: 'Изюм', amount: '40 г', note: 'Пт золотой рис' },
      { product: 'Ананас', amount: '1 шт или 250 г конс.', note: 'Пт золотой рис — можно подать в половинке' },
      { product: 'Карри мягкий', amount: '4 г', note: 'Пт золотой цвет риса' },
      { product: 'Соевый соус светлый', amount: '25 г', note: 'Пт золотой рис' },
      { product: 'Яйца', amount: '2 шт', note: 'Пт золотой рис' },
      {
        product: 'Макароны',
        amount: `${dryForMeals('pasta', 2)} г`,
        note: 'Пт к болоньезе',
      },
      {
        product: 'Гречка',
        amount: `${dryForMeals('buckwheat', 2)} г`,
        note: 'Пн с луком и морковью',
      },
      {
        product: 'Рис',
        amount: '370 г',
        note: 'Пт цельное — золотой рис с креветками',
      },
      {
        product: 'Картофель',
        amount: `${potatoForMeals(2)} г`,
        note: 'Ср пюре',
      },
      { product: 'Молоко 1,5%', amount: '100 мл', note: 'Пюре' },
      { product: 'Лимон', amount: '1 шт', note: 'По желанию' },
    ],
  },

  {
    week: 2,
    completeDishId: 'shrimp_pasta',
    freeDayNote:
      'Воскресенье — свободный день: доставка, семья, остатки. Обязательного меню нет.',
    batches: [
      batch(
        'Вс / Пн',
        'пн–вт',
        '≤2 ч',
        'Форель в аэрогриле + котлеты · пюре + цветная капуста',
        [
          { dishId: 'trout', portions: portion6 },
          { dishId: 'chicken_cutlets', portions: portion6 },
        ],
        [
          { dishId: 'mash', portions: portion6 },
          { dishId: 'cauliflower', portions: portion6 },
        ],
        'Оба гарнира — к обоим основным.',
      ),
      batch(
        'Среда',
        'ср–чт',
        '≤1,5 ч',
        'Гуляш + крылья · рис + овощи запечённые',
        [
          { dishId: 'goulash', portions: portion6 },
          {
            dishId: 'wings_soy',
            orDishIds: ['wings_paprika'],
            portions: '16 шт (~6 порций)',
          },
        ],
        [
          { dishId: 'rice_veg', portions: portion6 },
          { dishId: 'roast_veg', portions: portion6 },
        ],
        'Пары: гуляш→рис, крылья→овощи.',
      ),
      batch(
        'Пятница',
        'пт–сб',
        '≤1,5 ч',
        'Паста с креветками (цельное) + бефстроганов · булгур',
        [
          { dishId: 'shrimp_pasta', portions: portion6 },
          { dishId: 'beef_stroganoff', portions: portion6 },
        ],
        [{ dishId: 'bulgur_veg', portions: portion6 }],
        'Цельное — паста с креветками. К бефстроганову — булгур. Мясо 2 · курица 2 · рыба 1 · креветки 1.',
      ),
    ],
    shopping: [
      ...baseWeekly,
      { product: 'Цветная капуста', amount: '900 г', note: 'Пн гарнир' },
      {
        product: 'Овощи на запекание',
        amount: '~900 г',
        note: 'Ср: кабачок 250 · перец 150 · лук 80 · морковь 100 · цветная 150 · брокколи 150',
      },
      { product: 'Перец сладкий', amount: '500 г', note: 'Гуляш 350 + овощи 150' },
      { product: 'Томатная паста', amount: '2–3 ст.л.' },
      { product: 'Паприка сладкая', amount: '2 ст.л.' },
      { product: 'Соевый соус', amount: '3 ст.л.', note: 'Если выбрали соево-медовый маринад к крыльям' },
      { product: 'Мёд', amount: '1 ч.л.', note: 'Если выбрали соево-медовый маринад' },
      { product: 'Сметана', amount: '400 г', note: 'Гуляш + бефстроганов' },
      { product: 'Сливочное масло', amount: '50 г', note: 'Пюре + паста с креветками' },
      { product: 'Креветки', amount: '450 г', note: 'Пт цельное' },
      { product: 'Сливки 10%', amount: '175 г', note: 'Пт паста с креветками' },
      { product: 'Макароны', amount: '370 г', note: 'Пт цельное' },
      {
        product: 'Рис',
        amount: `${dryForMeals('rice', 2)} г`,
        note: 'Ср с луком и морковью',
      },
      {
        product: 'Булгур',
        amount: `${dryForMeals('bulgur', 2)} г`,
        note: 'Пт с луком и морковью — к говядине',
      },
      {
        product: 'Картофель',
        amount: `${potatoForMeals(2)} г`,
        note: 'Пн пюре',
      },
      { product: 'Молоко 1,5%', amount: '100 мл', note: 'Пюре' },
    ],
  },

  {
    week: 3,
    completeDishId: 'beef_potato_stew',
    freeDayNote:
      'Воскресенье — свободный день: доставка, семья, остатки. Обязательного меню нет.',
    batches: [
      batch(
        'Вс / Пн',
        'пн–вт',
        '≤2 ч',
        'Минтай + бёдра · паста + овощи запечённые',
        [
          { dishId: 'pollock', portions: portion6 },
          { dishId: 'thighs_sour_cream', portions: portion6 },
        ],
        [
          { dishId: 'pasta', portions: portion6 },
          { dishId: 'roast_veg', portions: portion6 },
        ],
      ),
      batch(
        'Среда',
        'ср–чт',
        '≤1,5 ч',
        'Говяжьи тефтели + ножки · булгур + картофель отварной',
        [
          { dishId: 'beef_meatballs', portions: portion6 },
          {
            dishId: 'chicken_legs_honey',
            orDishIds: ['chicken_legs_paprika'],
            portions: '8 шт (~6 порций)',
          },
        ],
        [
          { dishId: 'bulgur_veg', portions: portion6 },
          { dishId: 'boiled_potato', portions: portion6 },
        ],
      ),
      batch(
        'Пятница',
        'пт–сб',
        '≤1,5 ч',
        'Куриный строганов + картофель тушёный с мясом · салат',
        [
          { dishId: 'chicken_stroganoff', portions: portion6 },
          { dishId: 'beef_potato_stew', portions: portion6 },
        ],
        [{ dishId: 'veg_salad', portions: portion6 }],
        'К строганову — салат. Овощи запечённые были в пн с пастой.',
      ),
    ],
    shopping: [
      ...baseWeekly,
      {
        product: 'Овощи на запекание',
        amount: '~900 г',
        note: 'Пн: кабачок 250 · перец 150 · лук 80 · морковь 100 · цветная 150 · брокколи 150',
      },
      { product: 'Салат листовой доп.', amount: '250 г', note: 'Пт гарнир к строганову' },
      { product: 'Лук фиолетовый', amount: '50 г', note: 'Пт салат' },
      { product: 'Соус майонезный лёгкий', amount: '80 г', note: 'Минтай пн' },
      { product: 'Сыр твёрдый Пармезан', amount: '80 г', note: 'Минтай пн' },
      { product: 'Томаты в соку', amount: '200 г', note: 'Ср говяжьи тефтели' },
      { product: 'Томатная паста', amount: '80 г + 1 ч.л.', note: 'Пт цельное + строганов' },
      { product: 'Паприка сладкая', amount: '1 ст.л.', note: 'Картофель с мясом пт' },
      { product: 'Сметана доп.', amount: '400 г', note: 'Бёдра + тефтели + строганов' },
      { product: 'Укроп', amount: '1 пучок', note: 'Ср к отварному картофелю' },
      {
        product: 'Макароны',
        amount: `${dryForMeals('pasta', 2)} г`,
        note: 'Пн',
      },
      {
        product: 'Булгур',
        amount: `${dryForMeals('bulgur', 2)} г`,
        note: 'Ср',
      },
      {
        product: 'Картофель',
        amount: `${potatoForMeals(2) + 700} г`,
        note: 'Ср отварной 700 + пт цельное 700',
      },
    ],
  },

  {
    week: 4,
    completeDishId: 'chicken_pasta_mushroom',
    freeDayNote:
      'Воскресенье — свободный день: доставка, семья, остатки. Обязательного меню нет.',
    batches: [
      batch(
        'Вс / Пн',
        'пн–вт',
        '≤2 ч',
        'Рваная говядина + куриные тефтели · гречка + пюре',
        [
          { dishId: 'beef_pulled', portions: portion6 },
          { dishId: 'chicken_meatballs', portions: portion6 },
        ],
        [
          { dishId: 'buckwheat_veg', portions: portion6 },
          { dishId: 'mash', portions: portion6 },
        ],
        'Пюре вместо цветной — к обоим горячим.',
      ),
      batch(
        'Среда',
        'ср–чт',
        '≤1,5 ч',
        'Гуляш + форель со шпинатом · рис + цветная капуста',
        [
          { dishId: 'goulash', portions: portion6 },
          { dishId: 'trout_spinach', portions: portion6 },
        ],
        [
          { dishId: 'rice_veg', portions: portion6 },
          { dishId: 'cauliflower', portions: portion6 },
        ],
      ),
      batch(
        'Пятница',
        'пт–сб',
        '≤1,5 ч',
        'Паста с курицей и грибами (цельное) + говядина травная · салат',
        [
          { dishId: 'chicken_pasta_mushroom', portions: portion6 },
          { dishId: 'beef_roast_herb', portions: portion6 },
        ],
        [{ dishId: 'veg_salad', portions: portion6 }],
        'Цельное — паста с грибами. Мясо 3 · курица 2 · рыба 1.',
      ),
    ],
    shopping: [
      ...baseWeekly,
      { product: 'Цветная капуста', amount: '900 г', note: 'Ср' },
      { product: 'Томаты в соку', amount: '200 г', note: 'Пн куриные тефтели' },
      { product: 'Перец сладкий', amount: '350 г', note: 'Ср гуляш' },
      { product: 'Паприка сладкая', amount: '30 г', note: 'Ср гуляш' },
      { product: 'Томатная паста', amount: '15 г', note: 'Ср гуляш' },
      { product: 'Салат листовой доп.', amount: '250 г', note: 'Пт салат к говядине' },
      { product: 'Лук фиолетовый', amount: '50 г', note: 'Пт салат' },
      { product: 'Шампиньоны', amount: '400 г', note: 'Пт паста с курицей' },
      { product: 'Шпинат', amount: '100 г', note: 'Форель ср' },
      { product: 'Помидоры черри', amount: '100 г', note: 'Форель ср' },
      { product: 'Сливки 10%', amount: '220 мл', note: 'Форель 150 + соус к травной 70' },
      { product: 'Горчица дижонская', amount: '40 г', note: 'Пт говядина в корочке' },
      { product: 'Макароны', amount: '370 г', note: 'Пт цельное' },
      { product: 'Сметана', amount: '400 г', note: 'Гуляш ср + паста пт' },
      {
        product: 'Рис',
        amount: `${dryForMeals('rice', 2)} г`,
        note: 'Ср',
      },
      {
        product: 'Гречка',
        amount: `${dryForMeals('buckwheat', 2)} г`,
        note: 'Пн',
      },
      {
        product: 'Картофель',
        amount: `${potatoForMeals(2)} г`,
        note: 'Пн пюре',
      },
      { product: 'Молоко 1,5%', amount: '100 мл', note: 'Пюре' },
    ],
  },
]

export function getWeekPlan(week: number): WeekPlan {
  return weekPlans.find((p) => p.week === week)!
}
