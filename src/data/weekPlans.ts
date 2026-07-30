import type { ShoppingItem } from './types'
import { dryForMeals, potatoForMeals, familyMeal } from './portions'

export type CookTask = {
  when: string
  time: string
  title: string
  dishIds: string[]
  note?: string
}

export type WeekPlan = {
  week: number
  shopping: ShoppingItem[]
  cooking: CookTask[]
}

const baseWeekly: ShoppingItem[] = [
  { product: 'Лук', amount: '1,5–2 кг' },
  { product: 'Морковь', amount: '0,6–0,8 кг', note: 'Только в соусы/рагу, не в салат' },
  { product: 'Чеснок', amount: '2–3 головки' },
  { product: 'Огурцы свежие', amount: '6–7 шт', note: 'Салаты: огурец + помидор / капуста' },
  { product: 'Помидоры', amount: '800 г–1 кг', note: 'Салаты почти каждый день' },
  { product: 'Перец сладкий', amount: '2–3 шт', note: 'В салат + в горячее по плану' },
  { product: 'Капуста на салат', amount: '½–1 вилка', note: 'Свежая со сметаной и зеленью' },
  {
    product: 'Морковь/капуста по-корейски',
    amount: 'по желанию',
    note: 'Покупные; иногда вместо обычного салата',
  },
  { product: 'Сметана 20%', amount: '350–400 г', note: 'Салаты + соусы + тефтели/строганов' },
  { product: 'Йогурт натуральный', amount: '200 г', note: 'Иногда в салат вместо сметаны' },
  { product: 'Зелень', amount: '2 пучка', note: 'Укроп/петрушка в салаты и к рыбе' },
  {
    product: 'Картофель',
    amount: 'по плану недели',
    note: `На 1 приём семьи ~450 г сырого (тарелка 80/200/130 г).`,
  },
  { product: 'Молоко 1,5%', amount: '100 мл', note: 'Только если пюре' },
  {
    product: 'Макароны / крупы',
    amount: 'см. строки ниже',
    note: `Гарнир: ты 80 · муж 200 · ребёнок 130 г готового`,
  },
]

export const weekPlans: WeekPlan[] = [
  {
    week: 1,
    shopping: [
      ...baseWeekly,
      { product: 'Капуста белокочанная', amount: '1 кг', note: 'Тушёная на ср–чт' },
      { product: 'Томаты в соку', amount: '400 г' },
      { product: 'Томатная паста', amount: '2 ст.л.' },
      { product: 'Сливки 10%', amount: '350–400 мл', note: 'Форель + паста с креветками' },
      { product: 'Сливочное масло', amount: '50 г' },
      { product: 'Соевый соус', amount: '5 ст.л.', note: 'К бёдрам сб' },
      { product: 'Мёд', amount: '1 ч.л.' },
      {
        product: 'Рис',
        amount: `${dryForMeals('rice', 2) + dryForMeals('rice', 1, true)} г сухого`,
        note: 'Вт/пт + ср с капустой',
      },
      {
        product: 'Гречка',
        amount: `${dryForMeals('buckwheat', 4)} г сухого`,
        note: 'Пн/вт/ср ужин + сб обед',
      },
      {
        product: 'Булгур',
        amount: `${dryForMeals('bulgur', 1, true)} г сухого`,
        note: 'Чт обед',
      },
      {
        product: 'Макароны',
        amount: `${dryForMeals('pasta', 2)} г`,
        note: 'Пн обед + пт ужин',
      },
      {
        product: 'Картофель доп.',
        amount: `${potatoForMeals(2)} г`,
        note: `Пюре сб ужин ${potatoForMeals(1)} г + чт рыба ${potatoForMeals(1)} г. Вс — доедание, без нового меню.`,
      },
      { product: 'Лимон', amount: '1 шт', note: 'По желанию к форели' },
    ],
    cooking: [
      {
        when: 'Воскресенье (заготовки к пн–сб)',
        time: '≤2 ч',
        title: 'Болоньезе + курица томатно-сметанная + тефтели + рис + гречка',
        dishIds: ['bolognese', 'chicken_tomato_cream', 'chicken_meatballs', 'rice', 'buckwheat'],
        note: `Тефтели → ср ужин. Гарнир 80/200/130 г. Меню вс = доедание остатков.`,
      },
      {
        when: 'Среда',
        time: '≤1 ч',
        title: 'Тушёная капуста + ножки + булгур (единственная неделя с ножками)',
        dishIds: ['stewed_cabbage', 'chicken_legs', 'bulgur'],
        note: `Ножки 8 шт на ср+чт. Капуста ~${familyMeal.stewedVegG * 2} г. Ужин: тефтели + гречка.`,
      },
      {
        when: 'Четверг · ужин',
        time: '~25–30 мин',
        title: 'Форель + картошка',
        dishIds: ['trout', 'cream_sauce', 'boiled_potato'],
        note: `Обед — разогрев. Рыба 700 г (часть на пт). Картофель ${potatoForMeals(1)} г.`,
      },
      {
        when: 'Пятница · ужин',
        time: '~25 мин',
        title: 'Паста с креветками',
        dishIds: ['shrimp_pasta'],
        note: 'Обед — остатки форели. Ужин — единственная готовка.',
      },
      {
        when: 'Суббота',
        time: '≤1 ч',
        title: 'Бёдра в соевом + пюре',
        dishIds: ['thighs_soy', 'mash'],
        note: `Обед: бёдра. Ужин: остатки креветочной пасты + пюре. Пюре ${potatoForMeals(1)} г. Вс — доедание остатков.`,
      },
    ],
  },
  {
    week: 2,
    shopping: [
      ...baseWeekly,
      { product: 'Кабачки или брокколи', amount: '300–400 г', note: 'В тушёную курицу' },
      { product: 'Перец сладкий', amount: '4 шт' },
      { product: 'Ананас в соку', amount: '250–300 г', note: 'К курице вс' },
      { product: 'Томатная паста', amount: '1–2 ст.л.' },
      { product: 'Сливки 10%', amount: '100 мл', note: 'К минтаю' },
      { product: 'Паприка сладкая', amount: '2 ст.л.' },
      { product: 'Соевый соус', amount: '3 ст.л.', note: 'Курица-ананас' },
      { product: 'Мёд', amount: '1 ч.л.' },
      {
        product: 'Рис',
        amount: `${dryForMeals('rice', 5) + dryForMeals('rice', 1, true)} г сухого`,
      },
      {
        product: 'Гречка',
        amount: `${dryForMeals('buckwheat', 3)} г сухого`,
        note: 'Вт/ср ужин + сб обед',
      },
      {
        product: 'Булгур',
        amount: `${dryForMeals('bulgur', 1, true)} г сухого`,
      },
      { product: 'Макароны', amount: `${dryForMeals('pasta', 1)} г`, note: 'Пн обед' },
      {
        product: 'Картофель доп.',
        amount: `${potatoForMeals(2)} г`,
        note: `Запечённый сб ужин + чт к рыбе. Вс — доедание.`,
      },
    ],
    cooking: [
      {
        when: 'Воскресенье (заготовки к пн–сб)',
        time: '≤2 ч',
        title: 'Гуляш + курица с ананасом + котлеты + рис + гречка',
        dishIds: ['goulash', 'pineapple_chicken', 'chicken_cutlets', 'rice', 'buckwheat'],
        note: 'Котлеты → ср ужин. Меню вс = доедание. На неделе: говядина + курица + рыба.',
      },
      {
        when: 'Среда',
        time: '≤1 ч',
        title: 'Курица тушёная с овощами + булгур',
        dishIds: ['chicken_veg_stew', 'bulgur'],
        note: `Ср+чт обед. Ужин: котлеты + гречка. Булгур ${dryForMeals('bulgur', 1, true)} г.`,
      },
      {
        when: 'Четверг · ужин',
        time: '~25–30 мин',
        title: 'Минтай + картошка',
        dishIds: ['pollock', 'tomato_cream_sauce', 'boiled_potato'],
        note: `Картофель ${potatoForMeals(1)} г. Часть рыбы на пт.`,
      },
      {
        when: 'Пятница · ужин',
        time: '~10–15 мин',
        title: 'Креветки с рисом',
        dishIds: ['shrimp'],
        note: 'Обед — минтай. Ужин — креветки 400 г.',
      },
      {
        when: 'Суббота',
        time: '≤1 ч',
        title: 'Крылья + запечённый картофель',
        dishIds: ['wings', 'baked_potato'],
        note: `Обед: крылья. Ужин: остатки креветок + картофель. Картофель ${potatoForMeals(1)} г. Вс — доедание.`,
      },
    ],
  },
  {
    week: 3,
    shopping: [
      ...baseWeekly,
      { product: 'Цветная капуста', amount: '1 кочан' },
      { product: 'Кабачок или брокколи', amount: '300 г', note: 'В тушёную курицу' },
      { product: 'Шампиньоны', amount: '400 г', note: 'Курица с грибами' },
      { product: 'Сливки 10%', amount: '350–400 мл' },
      { product: 'Томатная паста', amount: '2 ст.л.' },
      { product: 'Сметана доп.', amount: '300 г', note: 'Бефстроганов + грибы + запечённое' },
      {
        product: 'Рис',
        amount: `${dryForMeals('rice', 2) + dryForMeals('rice', 1, true)} г сухого`,
      },
      {
        product: 'Гречка',
        amount: `${dryForMeals('buckwheat', 4)} г сухого`,
        note: 'Пн/вт/ср ужин + сб обед',
      },
      {
        product: 'Булгур',
        amount: `${dryForMeals('bulgur', 1) + dryForMeals('bulgur', 1, true)} г сухого`,
      },
      {
        product: 'Макароны',
        amount: `${dryForMeals('pasta', 2)} г`,
        note: 'Пн обед + пт ужин',
      },
      {
        product: 'Картофель доп.',
        amount: `${potatoForMeals(2)} г`,
        note: 'Чт рыба + сб ужин. Вс — доедание.',
      },
    ],
    cooking: [
      {
        when: 'Воскресенье (заготовки к пн–сб)',
        time: '≤2 ч',
        title: 'Бефстроганов + курица с грибами + котлеты + крупы',
        dishIds: [
          'beef_stroganoff',
          'chicken_mushrooms',
          'chicken_cutlets',
          'rice',
          'buckwheat',
          'bulgur',
        ],
        note: 'Котлеты → ср ужин. На неделе: говядина + курица + рыба. Меню вс = доедание.',
      },
      {
        when: 'Среда',
        time: '≤1 ч',
        title: 'Курица тушёная + цветная капуста + булгур',
        dishIds: ['chicken_veg_stew', 'cauliflower', 'bulgur'],
        note: 'Ср+чт обед. Ужин: котлеты + гречка.',
      },
      {
        when: 'Четверг · ужин',
        time: '~25–30 мин',
        title: 'Форель + картошка',
        dishIds: ['trout', 'cream_sauce', 'boiled_potato'],
        note: `Картофель ${potatoForMeals(1)} г.`,
      },
      {
        when: 'Пятница · ужин',
        time: '~25 мин',
        title: 'Паста с креветками',
        dishIds: ['shrimp_pasta'],
      },
      {
        when: 'Суббота',
        time: '≤1 ч',
        title: 'Филе запечённое с травами + картофель',
        dishIds: ['chicken_baked_herbs', 'boiled_potato'],
        note: `Обед: запечённое филе. Ужин: остатки креветочной пасты + картофель ${potatoForMeals(1)} г. Вс — доедание.`,
      },
    ],
  },
  {
    week: 4,
    shopping: [
      ...baseWeekly,
      { product: 'Кабачки', amount: '3 шт' },
      { product: 'Перец сладкий', amount: '3 шт' },
      { product: 'Шампиньоны', amount: '200 г', note: 'В куриный строганов по желанию' },
      { product: 'Сливки 10%', amount: '200 мл' },
      { product: 'Соевый соус', amount: '4 ст.л.', note: 'Рис с мясом' },
      { product: 'Ананас в соку', amount: '200 г' },
      { product: 'Мёд', amount: '½ ч.л.' },
      { product: 'Томатная паста', amount: '1 ст.л.' },
      {
        product: 'Рис',
        amount: `${150 + dryForMeals('rice', 3)} г сухого`,
        note: '150 г в рис с мясом + пт обед/ужин + сб ужин',
      },
      {
        product: 'Гречка',
        amount: `${dryForMeals('buckwheat', 2)} г сухого`,
        note: 'Пн ужин + ср ужин',
      },
      {
        product: 'Булгур',
        amount: `${dryForMeals('bulgur', 1) + dryForMeals('bulgur', 1, true)} г сухого`,
      },
      {
        product: 'Макароны',
        amount: `${dryForMeals('pasta', 1, true)} г`,
        note: 'Ср обед',
      },
      {
        product: 'Картофель доп.',
        amount: `${900 + potatoForMeals(1)} г`,
        note: '900 г в жаркое сб + 450 г чт к рыбе. Вс — доедание.',
      },
    ],
    cooking: [
      {
        when: 'Воскресенье (заготовки к пн–сб)',
        time: '≤2 ч',
        title: 'Рис с мясом + куриный строганов + тефтели + крупы',
        dishIds: ['rice_meat', 'chicken_stroganoff', 'chicken_meatballs', 'buckwheat', 'bulgur'],
        note: 'Тефтели → ср ужин. На неделе: говядина + курица + рыба. Меню вс = доедание.',
      },
      {
        when: 'Среда',
        time: '≤1 ч',
        title: 'Курица с кабачками + паста + булгур',
        dishIds: ['chicken_zucchini', 'pasta', 'bulgur'],
        note: `Паста ${dryForMeals('pasta', 1, true)} г к обеду. Ужин: тефтели + гречка.`,
      },
      {
        when: 'Четверг · ужин',
        time: '~25–30 мин',
        title: 'Минтай + картошка',
        dishIds: ['pollock', 'cream_dill_sauce', 'boiled_potato'],
        note: `Картофель ${potatoForMeals(1)} г.`,
      },
      {
        when: 'Пятница · ужин',
        time: '~20–25 мин',
        title: 'Креветки с ананасом + рис',
        dishIds: ['pineapple_shrimp', 'rice'],
      },
      {
        when: 'Суббота',
        time: '≤1 ч',
        title: 'Жаркое: курица с картошкой',
        dishIds: ['chicken_potato_roast'],
        note: 'Обед: жаркое. Ужин: остатки креветок + рис. Вс — доедание остатков.',
      },
    ],
  },
]

export function getWeekPlan(week: number): WeekPlan {
  return weekPlans.find((p) => p.week === week)!
}
