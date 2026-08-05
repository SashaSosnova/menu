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
    intro: '4,7 кг мякоти. Сначала вся соломка, потом все кубики, в конце фарш.',
    items: [
      {
        id: 'beef-strips',
        label: 'Соломка',
        amount: '1,8 кг',
        how: 'Тонкая соломка поперёк волокон.',
        packs: [
          {
            id: 'beef-strips-pepper',
            label: 'Говядина Перец',
            amount: '600 г',
            week: 1,
            slot: 'wed-thu',
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
          {
            id: 'beef-strips-paprikash',
            label: 'Говядина Паприкаш',
            amount: '600 г',
            week: 3,
            slot: 'wed-thu',
            dishIds: ['beef_paprikash'],
          },
        ],
      },
      {
        id: 'beef-cubes',
        label: 'Кубики ~2 см',
        amount: '2,35 кг',
        packs: [
          {
            id: 'beef-cubes-goulash',
            label: 'Говядина Гуляш',
            amount: '600 г',
            week: 2,
            slot: 'wed-thu',
            dishIds: ['goulash'],
          },
          {
            id: 'beef-cubes-veg',
            label: 'Говядина Тушёное с овощами',
            amount: '600 г',
            week: 4,
            slot: 'mon-tue',
            dishIds: ['beef_veg_stew'],
          },
          {
            id: 'beef-cubes-stew',
            label: 'Говядина Тушёная со сметаной',
            amount: '600 г',
            week: 4,
            slot: 'wed-thu',
            dishIds: ['beef_stew'],
          },
          {
            id: 'beef-cubes-potato',
            label: 'Говядина Картофель тушёный',
            amount: '550 г',
            week: 3,
            slot: 'fri-sat',
            dishIds: ['beef_potato_stew'],
          },
        ],
      },
      {
        id: 'beef-mince',
        label: 'Говядина Фарш болоньезе',
        amount: '500 г',
        week: 1,
        slot: 'mon-tue',
        how: 'Прокрутить или купить готовый.',
        dishIds: ['bolognese'],
      },
    ],
  },
  {
    id: 'chicken-fillet',
    title: 'Куриное филе — нарезаем всё разом',
    intro: '4,2 кг. Кубики пачкой, потом соломка, фарш и крупные куски.',
    items: [
      {
        id: 'chick-cubes',
        label: 'Кубики ~2 см',
        amount: '2,4 кг',
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
            id: 'chick-cubes-mushrooms',
            label: 'Курица Грибы',
            amount: '600 г',
            week: 2,
            slot: 'mon-tue',
            dishIds: ['chicken_mushrooms'],
          },
          {
            id: 'chick-cubes-veg',
            label: 'Курица С овощами',
            amount: '650 г',
            week: 3,
            slot: 'mon-tue',
            dishIds: ['chicken_cubes_veg'],
          },
          {
            id: 'chick-cubes-pasta',
            label: 'Курица Паста с кабачком',
            amount: '550 г',
            week: 4,
            slot: 'fri-sat',
            dishIds: ['chicken_pasta_zucchini'],
          },
        ],
      },
      {
        id: 'chick-strips',
        label: 'Курица Соломка строганов',
        amount: '600 г',
        week: 4,
        slot: 'mon-tue',
        dishIds: ['chicken_stroganoff'],
      },
      {
        id: 'chick-mince',
        label: 'Курица Фарш тефтели',
        amount: '450 г',
        week: 1,
        slot: 'wed-thu',
        how: 'Прокрутить из филе.',
        dishIds: ['chicken_meatballs'],
      },
      {
        id: 'chick-large',
        label: 'Курица Жаркое с картошкой',
        amount: '700 г',
        week: 2,
        slot: 'fri-sat',
        how: 'Куски ~3–4 см.',
        dishIds: ['chicken_potato_roast'],
      },
    ],
  },
  {
    id: 'marinate-paprika',
    title: 'Паприка + чеснок',
    marinade:
      'Сладкая паприка 1–2 ч.л., чеснок 2 зуб., соль, масло 1–2 ст.л. на каждый кг. В пакет с мясом → морозилка.',
    items: [
      {
        id: 'legs-paprika',
        label: 'Курица Ножки паприка',
        amount: '1 кг',
        week: 3,
        slot: 'fri-sat',
        dishIds: ['chicken_legs_paprika'],
      },
      {
        id: 'wings-paprika',
        label: 'Курица Крылья паприка',
        amount: '1,5 кг',
        week: 4,
        slot: 'fri-sat',
        dishIds: ['wings_paprika'],
      },
    ],
  },
  {
    id: 'marinate-soy-honey',
    title: 'Соевый + мёд',
    marinade:
      'Соевый 3 ст.л., мёд 1 ч.л., паприка, чеснок 1 зуб., чуть масла. В пакет → морозилка.',
    items: [
      {
        id: 'wings-soy',
        label: 'Курица Крылья соевый-мёд',
        amount: '1,5 кг',
        week: 2,
        slot: 'wed-thu',
        dishIds: ['wings'],
      },
    ],
  },
  {
    id: 'marinate-honey-garlic',
    title: 'Мёд + чеснок',
    marinade:
      'Мёд 1 ч.л., чеснок 2 зуб., соль, масло 1–2 ст.л., чуть паприки. В пакет → морозилка.',
    items: [
      {
        id: 'legs-honey',
        label: 'Курица Ножки мёд-чеснок',
        amount: '1 кг',
        week: 1,
        slot: 'fri-sat',
        dishIds: ['chicken_legs'],
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
        slot: 'wed-thu',
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
        amount: '1,4 кг',
        how: 'Куски ~100–150 г.',
        packs: [
          {
            id: 'trout-1',
            label: 'Форель',
            amount: '700 г',
            week: 2,
            slot: 'mon-tue',
            dishIds: ['trout'],
          },
          {
            id: 'trout-2',
            label: 'Форель',
            amount: '700 г',
            week: 4,
            slot: 'wed-thu',
            dishIds: ['trout'],
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
        dishIds: ['pollock', 'pollock_tomato_cream'],
      },
      {
        id: 'shrimp',
        label: 'Креветки',
        amount: '400 г',
        week: 1,
        slot: 'fri-sat',
        dishIds: ['shrimp_pasta', 'pineapple_shrimp', 'shrimp_cream'],
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
