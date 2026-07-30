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
  { product: 'Сметана 20%', amount: '350–400 г', note: 'Салаты + тефтели + соусы' },
  { product: 'Йогурт натуральный', amount: '200 г', note: 'Иногда в салат вместо сметаны' },
  { product: 'Зелень', amount: '2 пучка', note: 'Укроп/петрушка в салаты и к рыбе' },
  {
    product: 'Картофель',
    amount: 'по плану недели',
    note: `На 1 приём семьи ~450 г сырого (тарелка 80/200/130 г). Не варите «запас на неделю».`,
  },
  { product: 'Молоко 1,5%', amount: '100 мл', note: 'Только если пюре' },
  {
    product: 'Макароны / крупы',
    amount: 'см. строки ниже',
    note: `Гарнир на приём: ты 80 г · муж 200 г · ребёнок 130 г готового (= рис ${dryForMeals('rice', 1)} г / гречка ${dryForMeals('buckwheat', 1)} г сухих)`,
  },
]

export const weekPlans: WeekPlan[] = [
  {
    week: 1,
    shopping: [
      ...baseWeekly,
      { product: 'Капуста белокочанная', amount: '1 кг' },
      { product: 'Перец болгарский', amount: '1 шт' },
      { product: 'Томаты в соку', amount: '400 г' },
      { product: 'Томатная паста', amount: '2 ст.л.' },
      { product: 'Сливки 10%', amount: '350–400 мл', note: 'Форель чт ужин + паста с креветками пт' },
      { product: 'Сливочное масло', amount: '50 г' },
      {
        product: 'Рис',
        amount: `${dryForMeals('rice', 3) + dryForMeals('rice', 1, true)} г сухого`,
        note: 'Вт+пт+вс обычные приёмы + ср с капустой (меньше). Варить в вс.',
      },
      {
        product: 'Гречка',
        amount: `${dryForMeals('buckwheat', 4)} г сухого`,
        note: 'Пн/вт/ср ужин + сб обед. Варить в вс.',
      },
      {
        product: 'Булгур',
        amount: `${dryForMeals('bulgur', 1, true)} г сухого`,
        note: 'Чт обед с капустой. Сварить в среду.',
      },
      {
        product: 'Макароны',
        amount: `${dryForMeals('pasta', 1) + dryForMeals('pasta', 1)} г`,
        note: `Пн обед ${dryForMeals('pasta', 1)} г + пт ужин (паста с креветками) ${dryForMeals('pasta', 1)} г`,
      },
      {
        product: 'Картофель доп.',
        amount: `${potatoForMeals(2) + potatoForMeals(1)} г`,
        note: `Пюре сб+вс ${potatoForMeals(2)} г + отварной чт к рыбе ${potatoForMeals(1)} г`,
      },
      { product: 'Лимон', amount: '1 шт', note: 'По желанию к форели' },
    ],
    cooking: [
      {
        when: 'Воскресенье',
        time: '≤2 ч',
        title: 'Болоньезе + курица томатно-сметанная + тефтели + рис + гречка',
        dishIds: ['bolognese', 'chicken_tomato_cream', 'chicken_meatballs', 'rice', 'buckwheat'],
        note: `Тефтели → ср ужин. Рис ~${dryForMeals('rice', 3) + dryForMeals('rice', 1, true)} г сухих, гречка ~${dryForMeals('buckwheat', 4)} г. На тарелку гарнир 80/200/130 г.`,
      },
      {
        when: 'Среда',
        time: '≤1 ч',
        title: 'Тушёная капуста + ножки + булгур (обед)',
        dishIds: ['stewed_cabbage', 'chicken_legs', 'bulgur'],
        note: `Ножки 8 шт на ср+чт (1/2/1 на обед). Капуста ~${familyMeal.stewedVegG * 2} г. Булгур ${dryForMeals('bulgur', 1, true)} г. Ужин: тефтели + гречка.`,
      },
      {
        when: 'Четверг · ужин',
        time: '~25–30 мин',
        title: 'Форель + картошка — день в день',
        dishIds: ['trout', 'cream_sauce', 'boiled_potato'],
        note: `Обед — разогрев. Ужин: форель 400 г + картофель ${potatoForMeals(1)} г сырого; часть рыбы на пт обед.`,
      },
      {
        when: 'Пятница · ужин',
        time: '~25 мин',
        title: 'Паста с креветками — день в день',
        dishIds: ['shrimp_pasta'],
        note: `Обед — разогрев форели + рис. Ужин: паста ${dryForMeals('pasta', 1)} г сухих + креветки 400 г.`,
      },
      {
        when: 'Суббота',
        time: '≤1 ч',
        title: 'Крылья + пюре',
        dishIds: ['wings', 'mash'],
        note: `Крылья 16 шт: сб обед ~8, ужин ~5–6, вс ~2–3. Пюре из ${potatoForMeals(2)} г — только сб+вс ужин.`,
      },
    ],
  },
  {
    week: 2,
    shopping: [
      ...baseWeekly,
      { product: 'Кабачки', amount: '2 шт' },
      { product: 'Перец сладкий', amount: '4 шт', note: 'Рагу + курица с ананасом + салаты' },
      { product: 'Помидоры', amount: '500–600 г' },
      { product: 'Томатная паста', amount: '1–2 ст.л.' },
      { product: 'Ананас в соку', amount: '250–300 г', note: 'Не в сиропе · к курице (вс)' },
      { product: 'Сметана 20%', amount: '300 г' },
      { product: 'Сливки 10%', amount: '100 мл', note: 'К минтаю чт ужин' },
      { product: 'Паприка сладкая', amount: '2 ст.л.' },
      { product: 'Соевый соус', amount: '4–5 ст.л.', note: 'Курица-ананас + бёдра' },
      { product: 'Мёд', amount: '1–2 ч.л.' },
      {
        product: 'Рис',
        amount: `${dryForMeals('rice', 5) + dryForMeals('rice', 1, true)} г сухого`,
        note: 'Пн ужин, вт/пт/вс обед, пт ужин + ср с рагу (меньше).',
      },
      {
        product: 'Гречка',
        amount: `${dryForMeals('buckwheat', 3)} г сухого`,
        note: 'Вт/ср ужин + сб обед.',
      },
      {
        product: 'Булгур',
        amount: `${dryForMeals('bulgur', 1, true)} г сухого`,
        note: 'Чт обед с рагу.',
      },
      {
        product: 'Макароны',
        amount: `${dryForMeals('pasta', 1)} г`,
        note: 'Пн обед к гуляшу.',
      },
      {
        product: 'Картофель доп.',
        amount: `${potatoForMeals(2) + potatoForMeals(1)} г`,
        note: `Запечённый сб+вс ${potatoForMeals(2)} г + чт к рыбе ${potatoForMeals(1)} г`,
      },
    ],
    cooking: [
      {
        when: 'Воскресенье',
        time: '≤2 ч',
        title: 'Гуляш + курица с ананасом + тефтели + рис + гречка',
        dishIds: ['goulash', 'pineapple_chicken', 'chicken_meatballs', 'rice', 'buckwheat'],
        note: `Тефтели → ср ужин. Рис ~${dryForMeals('rice', 5) + dryForMeals('rice', 1, true)} г, гречка ~${dryForMeals('buckwheat', 3)} г сухих. Гарнир на тарелку 80/200/130 г.`,
      },
      {
        when: 'Среда',
        time: '≤1 ч',
        title: 'Овощное рагу + ножки + булгур (обед)',
        dishIds: ['veggie_stew', 'chicken_legs', 'bulgur'],
        note: `Рагу ~${familyMeal.stewedVegG * 2} г на ср+чт. Булгур ${dryForMeals('bulgur', 1, true)} г. Ужин: тефтели + гречка.`,
      },
      {
        when: 'Четверг · ужин',
        time: '~25–30 мин',
        title: 'Минтай + картошка — день в день',
        dishIds: ['pollock', 'tomato_cream_sauce', 'boiled_potato'],
        note: `Обед — разогрев. Картофель ${potatoForMeals(1)} г. Часть минтая на пт обед.`,
      },
      {
        when: 'Пятница · ужин',
        time: '~10–15 мин',
        title: 'Креветки с рисом — день в день',
        dishIds: ['shrimp'],
        note: 'Обед — разогрев минтая. Ужин: креветки 400 г + рис с тарелки 80/200/130 г.',
      },
      {
        when: 'Суббота',
        time: '≤1 ч',
        title: 'Бёдра + запечённый картофель',
        dishIds: ['thighs_soy', 'baked_potato'],
        note: `Бёдра 14 шт — до вт нед. 3 (сб по ~4, дальше по ~2). Картофель ${potatoForMeals(2)} г на сб+вс ужин.`,
      },
    ],
  },
  {
    week: 3,
    shopping: [
      ...baseWeekly,
      { product: 'Цветная капуста', amount: '1 кочан' },
      { product: 'Перец сладкий', amount: '2 шт' },
      { product: 'Томаты', amount: '400 г' },
      { product: 'Томатная паста', amount: '2 ст.л.' },
      { product: 'Сливки 10%', amount: '350–400 мл', note: 'Форель чт + паста с креветками пт' },
      { product: 'Сметана', amount: '100 г' },
      { product: 'Сливочное масло', amount: '30 г' },
      {
        product: 'Рис',
        amount: `${dryForMeals('rice', 2) + dryForMeals('rice', 1, true)} г сухого`,
        note: 'Пт+вс обед + ср с цветной капустой.',
      },
      {
        product: 'Гречка',
        amount: `${dryForMeals('buckwheat', 4)} г сухого`,
        note: 'Пн/вт/ср ужин + сб обед.',
      },
      {
        product: 'Булгур',
        amount: `${dryForMeals('bulgur', 1) + dryForMeals('bulgur', 1, true)} г сухого`,
        note: 'Вт обед (вс) + чт с капустой (ср).',
      },
      {
        product: 'Макароны',
        amount: `${dryForMeals('pasta', 1) + dryForMeals('pasta', 1)} г`,
        note: `Пн обед + пт ужин по ${dryForMeals('pasta', 1)} г`,
      },
      {
        product: 'Картофель доп.',
        amount: `${potatoForMeals(3)} г`,
        note: `Чт ужин + сб ужин + вс ужин по ${potatoForMeals(1)} г`,
      },
    ],
    cooking: [
      {
        when: 'Воскресенье',
        time: '≤2 ч',
        title: 'Говядина в томате + тефтели + рис + гречка + булгур',
        dishIds: ['beef_tomato', 'chicken_meatballs', 'rice', 'buckwheat', 'bulgur'],
        note: `Тефтели → ср ужин. Гречка ${dryForMeals('buckwheat', 4)} г, булгур на вт ${dryForMeals('bulgur', 1)} г. Гарнир 80/200/130 г.`,
      },
      {
        when: 'Среда',
        time: '≤1 ч',
        title: 'Цветная капуста + ножки + булгур (обед)',
        dishIds: ['cauliflower', 'chicken_legs', 'bulgur'],
        note: `Булгур ${dryForMeals('bulgur', 1, true)} г на чт. Ужин: тефтели + гречка.`,
      },
      {
        when: 'Четверг · ужин',
        time: '~25–30 мин',
        title: 'Форель + картошка — день в день',
        dishIds: ['trout', 'cream_sauce', 'boiled_potato'],
        note: `Картофель ${potatoForMeals(1)} г. Часть форели на пт обед.`,
      },
      {
        when: 'Пятница · ужин',
        time: '~25 мин',
        title: 'Паста с креветками — день в день',
        dishIds: ['shrimp_pasta'],
        note: `Паста ${dryForMeals('pasta', 1)} г сухих + креветки 400 г.`,
      },
      {
        when: 'Суббота',
        time: '≤1 ч',
        title: 'Крылья + отварной картофель',
        dishIds: ['wings', 'boiled_potato'],
        note: `Крылья 16 шт (сб обед+ужин + вс). Картофель ${potatoForMeals(2)} г на сб+вс ужин.`,
      },
    ],
  },
  {
    week: 4,
    shopping: [
      ...baseWeekly,
      { product: 'Кабачки', amount: '3 шт' },
      { product: 'Перец сладкий', amount: '3 шт' },
      { product: 'Помидоры', amount: '3 шт' },
      { product: 'Шампиньоны', amount: '400 г' },
      { product: 'Сметана 20%', amount: '200 г' },
      { product: 'Сливки 10%', amount: '200 мл', note: 'К минтаю чт ужин' },
      { product: 'Соевый соус', amount: '4–5 ст.л.' },
      {
        product: 'Рис',
        amount: `${150 + dryForMeals('rice', 2) + dryForMeals('rice', 1)} г сухого`,
        note: `150 г в «рис с мясом» + пт/вс обед + пт ужин к креветкам ${dryForMeals('rice', 1)} г`,
      },
      { product: 'Ананас в соку', amount: '200 г' },
      { product: 'Мёд', amount: '½ ч.л.' },
      {
        product: 'Гречка',
        amount: `${dryForMeals('buckwheat', 3)} г сухого`,
        note: 'Пн/ср ужин + сб обед.',
      },
      {
        product: 'Булгур',
        amount: `${dryForMeals('bulgur', 1) + dryForMeals('bulgur', 1, true)} г сухого`,
        note: 'Вт обед + чт с кабачком.',
      },
      {
        product: 'Макароны',
        amount: `${dryForMeals('pasta', 1, true)} г`,
        note: 'Ср обед с кабачком (уменьшенная порция).',
      },
      {
        product: 'Картофель доп.',
        amount: `${potatoForMeals(2) + potatoForMeals(1)} г`,
        note: `Пюре сб+вс ${potatoForMeals(2)} г + чт к рыбе ${potatoForMeals(1)} г`,
      },
    ],
    cooking: [
      {
        when: 'Воскресенье',
        time: '≤2 ч',
        title: 'Рис с мясом + курица с грибами + тефтели + гречка + булгур',
        dishIds: ['rice_meat', 'chicken_mushrooms', 'chicken_meatballs', 'buckwheat', 'bulgur'],
        note: `Тефтели → ср ужин. Гречка ${dryForMeals('buckwheat', 3)} г, булгур на вт ${dryForMeals('bulgur', 1)} г.`,
      },
      {
        when: 'Среда',
        time: '≤1 ч',
        title: 'Тушёный кабачок + ножки + булгур + паста (обед)',
        dishIds: ['stewed_zucchini', 'chicken_legs', 'bulgur', 'pasta'],
        note: `Паста ${dryForMeals('pasta', 1, true)} г сухих. Булгур ${dryForMeals('bulgur', 1, true)} г на чт. Ужин: тефтели + гречка.`,
      },
      {
        when: 'Четверг · ужин',
        time: '~25–30 мин',
        title: 'Минтай + картошка — день в день',
        dishIds: ['pollock', 'cream_dill_sauce', 'boiled_potato'],
        note: `Картофель ${potatoForMeals(1)} г. Часть минтая на пт обед.`,
      },
      {
        when: 'Пятница · ужин',
        time: '~20–25 мин',
        title: 'Креветки с ананасом + рис — день в день',
        dishIds: ['pineapple_shrimp', 'rice'],
        note: `Рис ${dryForMeals('rice', 1)} г сухих + креветки. Обед — разогрев минтая.`,
      },
      {
        when: 'Суббота',
        time: '≤1 ч',
        title: 'Крылья + пюре',
        dishIds: ['wings', 'mash'],
        note: `Крылья 16 шт. Пюре из ${potatoForMeals(2)} г — сб+вс ужин. Гарнир 80/200/130 г.`,
      },
    ],
  },
]

export function getWeekPlan(week: number): WeekPlan {
  return weekPlans.find((p) => p.week === week)!
}
