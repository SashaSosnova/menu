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
    'Белки: мясо×2 · курица×3 · креветки. В готовках разные белки. Курица: филе + ножки. Гарниры: картошка×1 · овощи×1 · крупа×2 · паста×1.',
  cooks: [
    {
      day: 'Понедельник',
      covers: 'пн–вт',
      note: 'Мясо + курица, оба с соусом. Болоньезе → паста; филе → гречка. Кресты тоже ок.',
      mains: [
        { name: 'Болоньезе', wetness: 'sauce', protein: 'beef' },
        {
          name: 'Филе в томатно-сметанном соусе',
          wetness: 'sauce',
          protein: 'chicken',
        },
      ],
      sides: [
        { name: 'Паста отварная', wetness: 'dry' },
        { name: 'Гречка с луком и морковью', wetness: 'dry' },
      ],
    },
    {
      day: 'Среда',
      covers: 'ср–чт',
      note: 'Мясо + курица, оба с соусом. Перец в соевом дружит с рисом и брокколи; тефтели — с обоими.',
      mains: [
        {
          name: 'Говядина с перцем в соевом',
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
        { name: 'Рис с луком и морковью', wetness: 'dry' },
        { name: 'Брокколи на пару', wetness: 'dry' },
      ],
    },
    {
      day: 'Пятница',
      covers: 'пт–сб',
      note: 'Полноценное = рыба. Сухая курица + соусный гарнир.',
      complete: 'Паста с креветками',
      mains: [
        {
          name: 'Ножки в медово-чесночном маринаде',
          wetness: 'dry',
          protein: 'chicken',
        },
      ],
      sides: [
        {
          name: 'Картофель тушёный с луком и морковью',
          wetness: 'sauce',
        },
      ],
    },
  ],
}

export const week2: DraftWeek = {
  week: 2,
  summary:
    'Белки: мясо×2 · курица×3 · рыба. Курица: филе + крылья (нед.1 были ножки). Полноценное — картофель с курицей. Ср — фиксированные пары из-за мокрости.',
  cooks: [
    {
      day: 'Понедельник',
      covers: 'пн–вт',
      note: 'Рыба + курица, оба с соусом. Форель → пюре/цветная; грибы → пюре. Кресты ок.',
      mains: [
        {
          name: 'Форель на гриле',
          wetness: 'sauce',
          protein: 'fish',
          daySauce: 'Сливочно-укропный соус',
        },
        {
          name: 'Филе с грибами в сметане',
          wetness: 'sauce',
          protein: 'chicken',
        },
      ],
      sides: [
        { name: 'Картофельное пюре', wetness: 'dry' },
        { name: 'Цветная капуста жареная', wetness: 'dry' },
      ],
    },
    {
      day: 'Среда',
      covers: 'ср–чт',
      note: 'Мясо с соусом + сухие крылья → только фиксированные пары.',
      mains: [
        { name: 'Гуляш с паприкой', wetness: 'sauce', protein: 'beef' },
        {
          name: 'Крылья в соево-медовом маринаде',
          wetness: 'dry',
          protein: 'chicken',
        },
      ],
      sides: [
        { name: 'Киноа с луком и морковью', wetness: 'dry' },
        {
          name: 'Паста в сливочно-чесночном соусе',
          wetness: 'sauce',
        },
      ],
      pairs: [
        ['Гуляш с паприкой', 'Киноа с луком и морковью'],
        ['Крылья в соево-медовом маринаде', 'Паста в сливочно-чесночном соусе'],
      ],
    },
    {
      day: 'Пятница',
      covers: 'пт–сб',
      note: 'Полноценное = курица (входит в квоту). Мясо с соусом + сухая крупа.',
      complete: 'Картофель запечённый с курицей',
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
    'Белки: мясо×2 · курица×3 · рыба. Курица: бёдра + ножки. Полноценное — картофель тушёный с мясом. Гарниры без повторов нед.1–2.',
  cooks: [
    {
      day: 'Понедельник',
      covers: 'пн–вт',
      note: 'Рыба + курица, оба с соусом. Минтай → рис/брокколи; филе с овощами → рис.',
      mains: [
        {
          name: 'Минтай в томатно-сливочном соусе',
          wetness: 'sauce',
          protein: 'fish',
        },
        {
          name: 'Филе кубиками с овощами',
          wetness: 'sauce',
          protein: 'chicken',
        },
      ],
      sides: [
        { name: 'Рис с луком и морковью', wetness: 'dry' },
        { name: 'Брокколи запечённая', wetness: 'dry' },
      ],
    },
    {
      day: 'Среда',
      covers: 'ср–чт',
      note: 'Мясо + курица, оба с соусом. Паприкаш → булгур/картошка; бёдра → запечённый картофель.',
      mains: [
        {
          name: 'Говядина с паприкой и перцем',
          wetness: 'sauce',
          protein: 'beef',
        },
        {
          name: 'Бёдра запечённые со сметаной и чесноком',
          wetness: 'sauce',
          protein: 'chicken',
        },
      ],
      sides: [
        { name: 'Булгур с луком и морковью', wetness: 'dry' },
        { name: 'Картофель запечённый дольками', wetness: 'dry' },
      ],
    },
    {
      day: 'Пятница',
      covers: 'пт–сб',
      note: 'Полноценное = мясо (входит в квоту). Сухие ножки + соусная паста.',
      complete: 'Картофель тушёный с мясом',
      mains: [
        {
          name: 'Ножки в паприке с чесноком',
          wetness: 'dry',
          protein: 'chicken',
        },
      ],
      sides: [
        { name: 'Паста с сыром и зеленью', wetness: 'sauce' },
      ],
    },
  ],
}

export const week4: DraftWeek = {
  week: 4,
  summary:
    'Белки: мясо×2 · курица×3 · рыба. Курица: строганов + крылья. Полноценное — паста с курицей и кабачком. Из пула полноценных не использован: рис с креветками.',
  cooks: [
    {
      day: 'Понедельник',
      covers: 'пн–вт',
      note: 'Мясо + курица, оба с соусом. Тушёное → гречка; строганов → паста/гречка.',
      mains: [
        {
          name: 'Тушёное мясо с овощами',
          wetness: 'sauce',
          protein: 'beef',
        },
        {
          name: 'Куриный строганов',
          wetness: 'sauce',
          protein: 'chicken',
        },
      ],
      sides: [
        { name: 'Паста отварная', wetness: 'dry' },
        { name: 'Гречка с луком и морковью', wetness: 'dry' },
      ],
    },
    {
      day: 'Среда',
      covers: 'ср–чт',
      note: 'Мясо + рыба, оба с соусом. Говядина → киноа; форель → цветная (+ соус день в день).',
      mains: [
        {
          name: 'Говядина тушёная со сметаной',
          wetness: 'sauce',
          protein: 'beef',
        },
        {
          name: 'Форель запечённая с лимоном',
          wetness: 'sauce',
          protein: 'fish',
          daySauce: 'Сливочно-укропный соус',
        },
      ],
      sides: [
        { name: 'Киноа с луком и морковью', wetness: 'dry' },
        { name: 'Цветная капуста запечённая', wetness: 'dry' },
      ],
    },
    {
      day: 'Пятница',
      covers: 'пт–сб',
      note: 'Полноценное = курица. Сухие крылья + соусный картофель.',
      complete: 'Паста с курицей и кабачком',
      mains: [
        {
          name: 'Крылья в паприке с чесноком',
          wetness: 'dry',
          protein: 'chicken',
        },
      ],
      sides: [
        {
          name: 'Картофель тушёный с луком и морковью',
          wetness: 'sauce',
        },
      ],
    },
  ],
}

export const draftWeeks = [week1, week2, week3, week4]
