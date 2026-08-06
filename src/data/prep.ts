/**
 * Заготовки на месяц — группировка по удобству работы.
 * label = подпись на пакет; week+slot = когда достаём.
 */

import { packUseLabel, type MenuSlotId } from './calendar'

export type PrepPack = {
  id: string
  /** Подпись на пакет, напр. «Говядина Перец» */
  label: string
  amount: string
  week: number
  slot: MenuSlotId
  /** Блюда из меню, для которых достаём этот пакет */
  dishIds?: string[]
}

export type PrepItem = {
  id: string
  label: string
  amount: string
  how?: string
  week?: number
  slot?: MenuSlotId
  /** Блюда из меню (если нет отдельных packs) */
  dishIds?: string[]
  /** Отдельные пакеты — галочка на каждый */
  packs?: PrepPack[]
}

export type PrepGroup = {
  id: string
  title: string
  intro?: string
  /** Рецепт маринада на всю группу */
  marinade?: string
  items: PrepItem[]
}

export function prepUse(week: number, slot: MenuSlotId): string {
  return packUseLabel(week, slot)
}

export const prepGroups: PrepGroup[] = [
  {
    id: 'beef',
    title: 'Говядина — разделываем всю разом',
    intro:
      '5,2 кг мякоти. Сначала вся соломка, потом все кубики, крупные куски, в конце фарш.',
    items: [
      {
        id: 'beef-strips',
        label: 'Соломка',
        amount: '1,2 кг',
        how: 'Тонкая соломка поперёк волокон.',
        packs: [
          {
            id: 'beef-strips-pepper',
            label: 'Говядина Перец',
            amount: '600 г',
            week: 1,
            slot: 'mon-tue',
            dishIds: ['beef_pepper'],
          },
          {
            id: 'beef-strips-stroganoff',
            label: 'Говядина Бефстроганов',
            amount: '600 г',
            week: 2,
            slot: 'fri-sat',
            dishIds: ['beef_stroganoff'],
          },
        ],
      },
      {
        id: 'beef-cubes',
        label: 'Кубики ~2 см',
        amount: '1,9 кг',
        packs: [
          {
            id: 'beef-cubes-goulash-w2',
            label: 'Говядина Гуляш',
            amount: '600 г',
            week: 2,
            slot: 'wed-thu',
            dishIds: ['goulash'],
          },
          {
            id: 'beef-cubes-potato',
            label: 'Говядина Картофель тушёный',
            amount: '700 г',
            week: 3,
            slot: 'fri-sat',
            dishIds: ['beef_potato_stew'],
          },
          {
            id: 'beef-cubes-goulash-w4',
            label: 'Говядина Гуляш',
            amount: '600 г',
            week: 4,
            slot: 'wed-thu',
            dishIds: ['goulash'],
          },
        ],
      },
      {
        id: 'beef-large',
        label: 'Крупный кусок',
        amount: '1,15 кг',
        how: '1–2 цельных куска: томление или запекание.',
        packs: [
          {
            id: 'beef-large-pulled',
            label: 'Говядина Рваная',
            amount: '450 г',
            week: 4,
            slot: 'mon-tue',
            dishIds: ['beef_pulled'],
          },
          {
            id: 'beef-large-roast',
            label: 'Говядина Запечённая',
            amount: '700 г',
            week: 4,
            slot: 'fri-sat',
            dishIds: ['beef_roast_herb'],
          },
        ],
      },
      {
        id: 'beef-mince',
        label: 'Фарш',
        amount: '950 г',
        how: 'Прокрутить или купить готовый.',
        packs: [
          {
            id: 'beef-mince-bolognese',
            label: 'Говядина Фарш болоньезе',
            amount: '500 г',
            week: 1,
            slot: 'fri-sat',
            dishIds: ['bolognese'],
          },
          {
            id: 'beef-meatballs-pack',
            label: 'Говядина Фарш тефтели',
            amount: '450 г',
            week: 3,
            slot: 'wed-thu',
            dishIds: ['beef_meatballs'],
          },
        ],
      },
    ],
  },
  {
    id: 'chicken-fillet',
    title: 'Куриное филе — нарезаем всё разом',
    intro: 'Кубики, соломка, отбивные, фарш.',
    items: [
      {
        id: 'chick-cubes',
        label: 'Кубики ~2 см',
        amount: '1,15 кг',
        packs: [
          {
            id: 'chick-cubes-tomato',
            label: 'Курица Томат-сметана',
            amount: '600 г',
            week: 1,
            slot: 'mon-tue',
            dishIds: ['chicken_tomato_cream'],
          },
          {
            id: 'chick-cubes-pasta-mushroom',
            label: 'Курица Паста с грибами',
            amount: '550 г',
            week: 4,
            slot: 'fri-sat',
            dishIds: ['chicken_pasta_mushroom'],
          },
        ],
      },
      {
        id: 'chick-strips',
        label: 'Соломка',
        amount: '600 г',
        how: 'Как для бефстроганова — полоски ~1 см.',
        packs: [
          {
            id: 'chick-strips-stroganoff',
            label: 'Курица Строганов',
            amount: '600 г',
            week: 3,
            slot: 'fri-sat',
            dishIds: ['chicken_stroganoff'],
          },
        ],
      },
      {
        id: 'chick-schnitzel',
        label: 'Отбивные',
        amount: '600 г',
        how: 'Нарезать, отбить, можно сложить в пакет через пергамент.',
        packs: [
          {
            id: 'chick-schnitzel-w1',
            label: 'Курица Шницели',
            amount: '600 г',
            week: 1,
            slot: 'wed-thu',
            dishIds: ['chicken_schnitzel'],
          },
        ],
      },
      {
        id: 'chick-mince',
        label: 'Фарш',
        amount: '1,1 кг',
        how: 'Прокрутить из филе.',
        packs: [
          {
            id: 'chick-mince-cutlets-w2',
            label: 'Курица Фарш котлеты',
            amount: '600 г',
            week: 2,
            slot: 'mon-tue',
            dishIds: ['chicken_cutlets'],
          },
          {
            id: 'chick-mince-meatballs-w4',
            label: 'Курица Фарш тефтели',
            amount: '500 г',
            week: 4,
            slot: 'mon-tue',
            dishIds: ['chicken_meatballs'],
          },
        ],
      },
    ],
  },
  {
    id: 'marinate-legs-wings',
    title: 'Ножки и крылья — маринад на выбор',
    intro:
      'На каждый пакет — один маринад. Подписать пакет выбранным вариантом.',
    marinade:
      'Ножки: (А) мёд 1 ч.л. + чеснок 2 зуб. + соль + масло 1–2 ст.л. + чуть паприки · (Б) паприка 1–2 ч.л. + чеснок 2 зуб. + соль + масло 1–2 ст.л.\nКрылья: (А) соевый 3 ст.л. + мёд 1 ч.л. + паприка + чеснок 1 зуб. + чуть масла · (Б) паприка 1–2 ч.л. + чеснок 2 зуб. + соль + масло 1–2 ст.л.',
    items: [
      {
        id: 'legs-w1',
        label: 'Курица Ножки',
        amount: '1 кг',
        week: 1,
        slot: 'wed-thu',
        dishIds: ['chicken_legs'],
      },
      {
        id: 'legs-w3',
        label: 'Курица Ножки',
        amount: '1 кг',
        week: 3,
        slot: 'wed-thu',
        dishIds: ['chicken_legs'],
      },
      {
        id: 'wings-w2',
        label: 'Курица Крылья',
        amount: '1,5 кг',
        week: 2,
        slot: 'wed-thu',
        dishIds: ['wings'],
      },
    ],
  },
  {
    id: 'marinate-cream',
    title: 'Сметана + чеснок',
    marinade:
      'Сметана 3–4 ст.л., чеснок 2–3 зуб., соль, паприка, чуть масла. Бёдра без кожи и костей. В пакет → морозилка.',
    items: [
      {
        id: 'thighs-cream',
        label: 'Курица Бёдра сметана',
        amount: '1,3 кг',
        week: 3,
        slot: 'mon-tue',
        dishIds: ['thighs_sour_cream'],
      },
    ],
  },
  {
    id: 'fish',
    title: 'Рыба и креветки',
    intro: 'Разложить по пакетам и заморозить.',
    items: [
      {
        id: 'trout',
        label: 'Форель',
        amount: '1,6 кг',
        how: 'Куски ~100–150 г.',
        packs: [
          {
            id: 'trout-grill',
            label: 'Форель Гриль',
            amount: '900 г',
            week: 2,
            slot: 'mon-tue',
            dishIds: ['trout'],
          },
          {
            id: 'trout-spinach',
            label: 'Форель Шпинат',
            amount: '700 г',
            week: 4,
            slot: 'wed-thu',
            dishIds: ['trout_spinach'],
          },
        ],
      },
      {
        id: 'pollock',
        label: 'Минтай',
        amount: '700 г',
        week: 3,
        slot: 'mon-tue',
        how: 'Куски ~100–150 г.',
        dishIds: ['pollock'],
      },
      {
        id: 'shrimp',
        label: 'Креветки',
        amount: '900 г',
        how: 'Разморозить в холодильнике перед готовкой.',
        packs: [
          {
            id: 'shrimp-rice-w1',
            label: 'Креветки рис Хайнань',
            amount: '450 г',
            week: 1,
            slot: 'fri-sat',
            dishIds: ['shrimp_rice_hainan'],
          },
          {
            id: 'shrimp-pasta-w2',
            label: 'Креветки паста',
            amount: '450 г',
            week: 2,
            slot: 'fri-sat',
            dishIds: ['shrimp_pasta'],
          },
        ],
      },
    ],
  },
]

/** Все id, которые можно отметить галочкой */
export function prepCheckIds(item: PrepItem): string[] {
  return item.packs?.map((p) => p.id) ?? [item.id]
}

export function countPrepChecks(): { total: number; ids: string[] } {
  const ids = prepGroups.flatMap((g) => g.items.flatMap(prepCheckIds))
  return { total: ids.length, ids }
}

function buildDishPrepLabelMap(): Record<string, string> {
  const map: Record<string, string> = {}
  for (const group of prepGroups) {
    for (const item of group.items) {
      if (item.packs) {
        for (const pack of item.packs) {
          for (const dishId of pack.dishIds ?? []) {
            map[dishId] = pack.label
          }
        }
      } else {
        for (const dishId of item.dishIds ?? []) {
          map[dishId] = item.label
        }
      }
    }
  }
  return map
}

let dishPrepLabels: Record<string, string> | null = null

/** Подпись на пакет из заготовок для блюда меню */
export function getPrepPackLabel(dishId: string): string | undefined {
  if (!dishPrepLabels) dishPrepLabels = buildDishPrepLabelMap()
  return dishPrepLabels[dishId]
}
