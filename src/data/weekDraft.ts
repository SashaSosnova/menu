/**
 * Черновик меню для проверки правил.
 * Пока текстом — без привязки к старым dish id.
 */

export type DraftItem = {
  name: string
  wetness: 'dry' | 'sauce'
  protein?: 'beef' | 'chicken' | 'fish' | 'shrimp'
  daySauce?: string
}

export type DraftCook = {
  day: string
  covers: string
  note?: string
  complete?: string
  mains: DraftItem[]
  sides: DraftItem[]
  /** Если мокрость горячих разная — явные пары */
  pairs?: [string, string][]
}

export type DraftWeek = {
  week: number
  summary: string
  cooks: DraftCook[]
}

export const week1: DraftWeek = {
  week: 1,
  summary:
    'Белки: мясо×2 · курица×3 · креветки. Болоньезе уникальное (только паста) + золотой рис с креветками (Хайнань).',
  cooks: [
    {
      day: 'Понедельник',
      covers: 'пн–вт',
      note: 'Мясо + курица, оба с соусом.',
      mains: [
        {
          name: 'Говядина с перцем в соевом',
          wetness: 'sauce',
          protein: 'beef',
        },
        {
          name: 'Филе в томатно-сметанном соусе',
          wetness: 'sauce',
          protein: 'chicken',
        },
      ],
      sides: [
        { name: 'Гречка с луком и морковью', wetness: 'dry' },
        { name: 'Брокколи в аэрогриле с пармезаном', wetness: 'dry' },
      ],
    },
    {
      day: 'Среда',
      covers: 'ср–чт',
      note: 'Две курицы → пюре + овощи запечённые.',
      mains: [
        {
          name: 'Куриные отбивные в панировке',
          wetness: 'dry',
          protein: 'chicken',
        },
        {
          name: 'Ножки медово-чесночные / Ножки в паприке',
          wetness: 'dry',
          protein: 'chicken',
        },
      ],
      sides: [
        { name: 'Картофельное пюре', wetness: 'dry' },
        { name: 'Овощи запечённые', wetness: 'dry' },
      ],
    },
    {
      day: 'Пятница',
      covers: 'пт–сб',
      note: 'Болоньезе уникальное: только паста + цельное (золотой рис с креветками).',
      complete: 'Золотой рис с креветками (Хайнань)',
      mains: [{ name: 'Болоньезе', wetness: 'sauce', protein: 'beef' }],
      sides: [{ name: 'Паста отварная', wetness: 'dry' }],
    },
  ],
}

export const week2: DraftWeek = {
  week: 2,
  summary:
    'Белки: мясо×2 · курица×2 · рыба · креветки. Курица: котлеты + крылья. Полноценное — паста с креветками.',
  cooks: [
    {
      day: 'Понедельник',
      covers: 'пн–вт',
      note: 'Рыба + курица. Форель в аэрогриле + котлеты · пюре + цветная.',
      mains: [
        {
          name: 'Форель в аэрогриле',
          wetness: 'dry',
          protein: 'fish',
        },
        {
          name: 'Куриные котлеты',
          wetness: 'dry',
          protein: 'chicken',
        },
      ],
      sides: [
        { name: 'Картофельное пюре', wetness: 'dry' },
        { name: 'Цветная капуста (аэрогриль или духовка)', wetness: 'dry' },
      ],
    },
    {
      day: 'Среда',
      covers: 'ср–чт',
      note: 'Мясо с соусом + сухие крылья → только фиксированные пары.',
      mains: [
        { name: 'Гуляш с паприкой', wetness: 'sauce', protein: 'beef' },
        {
          name: 'Крылья соево-медовые / Крылья в паприке',
          wetness: 'dry',
          protein: 'chicken',
        },
      ],
      sides: [
        { name: 'Рис с луком и морковью', wetness: 'dry' },
        { name: 'Овощи запечённые', wetness: 'dry' },
      ],
      pairs: [
        ['Гуляш с паприкой', 'Рис с луком и морковью'],
        ['Крылья соево-медовые / Крылья в паприке', 'Овощи запечённые'],
      ],
    },
    {
      day: 'Пятница',
      covers: 'пт–сб',
      note: 'Полноценное = паста с креветками. Мясо с соусом + сухая крупа.',
      complete: 'Паста с креветками',
      mains: [
        { name: 'Бефстроганов', wetness: 'sauce', protein: 'beef' },
      ],
      sides: [{ name: 'Булгур с луком и морковью', wetness: 'dry' }],
    },
  ],
}

export const week3: DraftWeek = {
  week: 3,
  summary:
    'Белки: мясо×2 · курица×3 · рыба. Курица: бёдра + ножки + строганов. Полноценное — картофель тушёный с мясом.',
  cooks: [
    {
      day: 'Понедельник',
      covers: 'пн–вт',
      note: 'Рыба + курица. Минтай + бёдра · паста + овощи запечённые.',
      mains: [
        {
          name: 'Минтай запечённый с овощами и сыром',
          wetness: 'sauce',
          protein: 'fish',
        },
        {
          name: 'Бёдра запечённые со сметаной и чесноком',
          wetness: 'sauce',
          protein: 'chicken',
        },
      ],
      sides: [
        { name: 'Паста отварная', wetness: 'dry' },
        { name: 'Овощи запечённые', wetness: 'dry' },
      ],
    },
    {
      day: 'Среда',
      covers: 'ср–чт',
      note: 'Говяжьи тефтели + ножки · булгур + картофель отварной.',
      mains: [
        {
          name: 'Говяжьи тефтели в томатно-сметанном соусе',
          wetness: 'sauce',
          protein: 'beef',
        },
        {
          name: 'Ножки медово-чесночные / Ножки в паприке',
          wetness: 'dry',
          protein: 'chicken',
        },
      ],
      sides: [
        { name: 'Булгур с луком и морковью', wetness: 'dry' },
        { name: 'Картофель отварной с укропом', wetness: 'dry' },
      ],
    },
    {
      day: 'Пятница',
      covers: 'пт–сб',
      note: 'Полноценное = мясо. К куриному строганову — салат.',
      complete: 'Картофель тушёный с мясом',
      mains: [
        {
          name: 'Куриный строганов',
          wetness: 'sauce',
          protein: 'chicken',
        },
      ],
      sides: [{ name: 'Свежий овощной салат', wetness: 'dry' }],
    },
  ],
}

export const week4: DraftWeek = {
  week: 4,
  summary:
    'Белки: мясо×3 · курица×2 · рыба. Курица: тефтели + паста с грибами.',
  cooks: [
    {
      day: 'Понедельник',
      covers: 'пн–вт',
      note: 'Мясо + куриные тефтели. Гречка + пюре.',
      mains: [
        {
          name: 'Рваная говядина в красном вине',
          wetness: 'sauce',
          protein: 'beef',
        },
        {
          name: 'Куриные тефтели в томатно-сметанном соусе',
          wetness: 'sauce',
          protein: 'chicken',
        },
      ],
      sides: [
        { name: 'Гречка с луком и морковью', wetness: 'dry' },
        { name: 'Картофельное пюре', wetness: 'dry' },
      ],
    },
    {
      day: 'Среда',
      covers: 'ср–чт',
      note: 'Гуляш + форель со шпинатом · рис + цветная.',
      mains: [
        {
          name: 'Гуляш с паприкой',
          wetness: 'sauce',
          protein: 'beef',
        },
        {
          name: 'Форель со шпинатом и черри в сливках',
          wetness: 'sauce',
          protein: 'fish',
        },
      ],
      sides: [
        { name: 'Рис с луком и морковью', wetness: 'dry' },
        { name: 'Цветная капуста (аэрогриль или духовка)', wetness: 'dry' },
      ],
    },
    {
      day: 'Пятница',
      covers: 'пт–сб',
      note: 'Полноценное = курица.',
      complete: 'Паста с курицей и грибами',
      mains: [
        {
          name: 'Говядина в горчично-травной корочке',
          wetness: 'sauce',
          protein: 'beef',
        },
      ],
      sides: [
        {
          name: 'Свежий овощной салат',
          wetness: 'dry',
        },
      ],
    },
  ],
}

export const draftWeeks = [week1, week2, week3, week4]
