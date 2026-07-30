import type { ShoppingItem } from './types'

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
  { product: 'Лук', amount: '2 кг' },
  { product: 'Морковь', amount: '1 кг' },
  { product: 'Чеснок', amount: '3 головки' },
  { product: 'Зелень (укроп, петрушка)', amount: 'по пучку' },
  { product: 'Картофель', amount: '1,5 кг', note: 'Для пюре в субботу' },
  { product: 'Молоко 1,5%', amount: '200 мл', note: 'Для пюре' },
  { product: 'Макароны / крупы', amount: 'по пачке', note: 'Если заканчиваются' },
]

export const weekPlans: WeekPlan[] = [
  {
    week: 1,
    shopping: [
      ...baseWeekly,
      { product: 'Капуста белокочанная', amount: '1 кг', note: 'На тушёную капусту' },
      { product: 'Кабачки', amount: '2 шт', note: 'Свежие, на курицу с кабачком' },
      { product: 'Перец болгарский', amount: '2 шт', note: 'Свежий' },
      { product: 'Томаты в соку', amount: '400 г', note: 'Или паста 2 ст.л. + вода' },
      { product: 'Томатная паста', amount: '2 ст.л.', note: 'Для капусты' },
      { product: 'Сметана 20%', amount: '350–400 г' },
      { product: 'Сливки 10%', amount: '200–250 мл', note: 'Для соуса к форели' },
    ],
    cooking: [
      {
        when: 'Воскресенье',
        time: '~2 ч',
        title: 'Две заготовки + крупы',
        dishIds: ['bolognese', 'chicken_zucchini'],
        note: 'Сварить 1 ст. гречки и 1 ст. риса на будни.',
      },
      {
        when: 'Среда',
        time: '~1 ч',
        title: 'Овощи + рыба с соусом',
        dishIds: ['stewed_cabbage', 'trout', 'cream_sauce'],
        note: 'Ножки можно пожарить в этот же день или к ужину среды/четверга.',
      },
      {
        when: 'По ходу недели',
        time: '~25–30 мин',
        title: 'Куриные ножки',
        dishIds: ['chicken_legs'],
        note: 'К капусте в ср–пт и к пюре в субботу.',
      },
      {
        when: 'Пятница',
        time: '~10 мин',
        title: 'Креветки',
        dishIds: ['shrimp'],
        note: 'К остаткам капусты и макаронам.',
      },
      {
        when: 'Суббота',
        time: '~40 мин',
        title: 'Крылья + пюре',
        dishIds: ['wings', 'mash'],
      },
    ],
  },
  {
    week: 2,
    shopping: [
      ...baseWeekly,
      { product: 'Баклажаны', amount: '2 шт', note: 'Свежие, на рагу' },
      { product: 'Кабачки', amount: '2 шт', note: 'Свежие' },
      { product: 'Перец сладкий', amount: '4 шт', note: 'На гуляш и рагу' },
      { product: 'Помидоры свежие', amount: '300–600 г', note: 'На курицу и рагу' },
      { product: 'Томатная паста', amount: '1 ст.л.', note: 'Для гуляша' },
      { product: 'Сметана 20%', amount: '350–400 г' },
      { product: 'Йогурт греческий', amount: '200 г', note: 'Для песто-соуса' },
      { product: 'Песто', amount: '1 ст.л.', note: 'Или базилик + чеснок + орехи' },
      { product: 'Паприка', amount: '2 ст.л.', note: 'Если нет дома' },
      { product: 'Соевый соус', amount: '4 ст.л.', note: 'Для бёдер' },
      { product: 'Имбирь, мёд', amount: 'по чуть-чуть', note: 'Для маринада бёдер' },
    ],
    cooking: [
      {
        when: 'Воскресенье',
        time: '~2 ч',
        title: 'Две заготовки + крупы',
        dishIds: ['goulash', 'chicken_tomato_cream'],
        note: 'Сварить гречку и рис.',
      },
      {
        when: 'Среда',
        time: '~1 ч',
        title: 'Овощное рагу + рыба с соусом',
        dishIds: ['veggie_stew', 'pollock', 'pesto_sauce'],
      },
      {
        when: 'По ходу недели',
        time: '~25–30 мин',
        title: 'Куриные ножки',
        dishIds: ['chicken_legs'],
      },
      {
        when: 'Пятница',
        time: '~10 мин',
        title: 'Креветки',
        dishIds: ['shrimp'],
      },
      {
        when: 'Суббота',
        time: '~40 мин',
        title: 'Бёдра в соевом + пюре',
        dishIds: ['thighs_soy', 'mash'],
        note: 'Часть бёдер останется на вс–вт следующей недели.',
      },
    ],
  },
  {
    week: 3,
    shopping: [
      ...baseWeekly,
      { product: 'Цветная капуста', amount: '1 кочан', note: 'Свежая' },
      { product: 'Перец сладкий', amount: '2 шт', note: 'На чили' },
      { product: 'Томаты', amount: '400 г', note: 'В соку или свежие' },
      { product: 'Фасоль красная консервированная', amount: '1 банка' },
      { product: 'Чили', amount: 'по вкусу' },
      { product: 'Сметана 20%', amount: 'по необходимости' },
      { product: 'Сыр нежирный', amount: '100–150 г', note: 'На сырный соус' },
      { product: 'Молоко 1,5%', amount: '200 мл + для пюре', note: 'На сырный соус и пюре' },
      { product: 'Мука', amount: '1 ст.л.', note: 'Для сырного соуса' },
      { product: 'Сливки 10%', amount: 'по необходимости' },
    ],
    cooking: [
      {
        when: 'Воскресенье',
        time: '~1,5 ч',
        title: 'Чили + крупы',
        dishIds: ['chili'],
        note: 'Бёдра — остатки с субботы прошлой недели; если закончились, запеките новую партию.',
      },
      {
        when: 'Среда',
        time: '~1 ч',
        title: 'Цветная капуста + форель с сырным соусом',
        dishIds: ['cauliflower', 'trout', 'cheese_sauce'],
      },
      {
        when: 'По ходу недели',
        time: '~25–30 мин',
        title: 'Куриные ножки',
        dishIds: ['chicken_legs'],
      },
      {
        when: 'Пятница',
        time: '~10 мин',
        title: 'Креветки',
        dishIds: ['shrimp'],
      },
      {
        when: 'Суббота',
        time: '~40 мин',
        title: 'Крылья + пюре',
        dishIds: ['wings', 'mash'],
      },
    ],
  },
  {
    week: 4,
    shopping: [
      ...baseWeekly,
      { product: 'Кабачки', amount: '3 шт', note: 'Свежие' },
      { product: 'Перец сладкий', amount: '4 шт', note: 'На рис с мясом и кабачки' },
      { product: 'Помидоры свежие', amount: '3 шт' },
      { product: 'Шампиньоны', amount: '400 г', note: 'Свежие' },
      { product: 'Сметана 20%', amount: '200 г', note: 'На курицу с грибами' },
      { product: 'Сливки 10%', amount: '200 мл', note: 'Сливочно-укропный соус' },
      { product: 'Соевый соус', amount: '4 ст.л.', note: 'Для риса с мясом' },
      { product: 'Имбирь', amount: '1 ч.л.', note: 'Тёртый' },
      { product: 'Рис сухой', amount: '150 г', note: 'В заготовку «рис с мясом»' },
    ],
    cooking: [
      {
        when: 'Воскресенье',
        time: '~2 ч',
        title: 'Рис с мясом + курица с грибами',
        dishIds: ['rice_meat', 'chicken_mushrooms'],
        note: 'Рис уже входит в «рис с мясом»; гречку сварить отдельно.',
      },
      {
        when: 'Среда',
        time: '~1 ч',
        title: 'Тушёный кабачок + минтай с соусом',
        dishIds: ['stewed_zucchini', 'pollock', 'cream_dill_sauce'],
      },
      {
        when: 'По ходу недели',
        time: '~25–30 мин',
        title: 'Куриные ножки',
        dishIds: ['chicken_legs'],
      },
      {
        when: 'Пятница',
        time: '~10 мин',
        title: 'Креветки',
        dishIds: ['shrimp'],
      },
      {
        when: 'Суббота',
        time: '~40 мин',
        title: 'Крылья + пюре',
        dishIds: ['wings', 'mash'],
      },
    ],
  },
]

export function getWeekPlan(week: number): WeekPlan {
  return weekPlans.find((p) => p.week === week)!
}
