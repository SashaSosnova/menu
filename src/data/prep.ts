/**
 * Заготовки на цикл блюд — группировка по удобству работы.
 * label = подпись на пакет; dishIds = блюда, для которых этот пакет.
 */

export type PrepPack = {
  id: string
  /** Подпись на пакет: «тип мяса · вид разделки · полное название блюда» */
  label: string
  amount: string
  /** Блюда из цикла, для которых достаём этот пакет */
  dishIds?: string[]
}

export type PrepItem = {
  id: string
  label: string
  amount: string
  how?: string
  /** Блюда из цикла (если нет отдельных packs) */
  dishIds?: string[]
  /** Отдельные пакеты — каждый можно положить в морозилку */
  packs?: PrepPack[]
}

export type PrepGroup = {
  id: string
  title: string
  intro?: string
  items: PrepItem[]
}

export function prepMatchesNext(
  item: { dishIds?: string[] },
  nextDishIds: Set<string> | null,
): boolean {
  if (!nextDishIds || nextDishIds.size === 0) return false
  return (item.dishIds ?? []).some((id) => nextDishIds.has(id))
}

export const prepGroups: PrepGroup[] = [
  {
    id: 'beef',
    title: 'Говядина',
    intro:
      '4,3 кг говядины, плюс 300 г свинины в фарш болоньезе. Сначала соломка, потом кубики, крупные куски, в конце фарш.',
    items: [
      {
        id: 'beef-strips-stroganoff',
        label: 'Говядина · соломка · Бефстроганов',
        amount: '600 г',
        how: 'Поперёк волокон, полоски 1×5 см. Перед нарезкой — 20 мин в морозилке.',
        dishIds: ['beef_stroganoff'],
      },
      {
        id: 'beef-cubes',
        label: 'Кубики 2–3 см',
        amount: '1,2 кг',
        packs: [
          {
            id: 'beef-cubes-goulash-w2',
            label: 'Говядина · кубики · Гуляш с паприкой',
            amount: '600 г',
            dishIds: ['goulash'],
          },
          {
            id: 'beef-cubes-potato',
            label: 'Говядина · кубики · Картофель тушёный с говядиной',
            amount: '600 г',
            dishIds: ['beef_potato_stew'],
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
            label: 'Говядина · крупный кусок · Рваная говядина в красном вине',
            amount: '450 г',
            dishIds: ['beef_pulled'],
          },
          {
            id: 'beef-large-roast',
            label: 'Говядина · крупный кусок · Говядина в горчично-травной корочке',
            amount: '700 г',
            dishIds: ['beef_roast_herb'],
          },
        ],
      },
      {
        id: 'beef-mince-bolognese',
        label: 'Говядина и свинина · фарш · Паста болоньезе',
        amount: '700 г',
        how: '400 г говядина + 300 г свинина, прокрутить вместе.',
        dishIds: ['bolognese'],
      },
      {
        id: 'beef-mince',
        label: 'Фарш',
        amount: '950 г',
        how: 'Прокрутить или купить готовый.',
        packs: [
          {
            id: 'beef-mince-navy',
            label: 'Говядина · фарш · Макароны по-флотски',
            amount: '500 г',
            dishIds: ['navy_pasta'],
          },
          {
            id: 'beef-meatballs-pack',
            label: 'Говядина · фарш · Говяжьи тефтели в томатно-сметанном соусе',
            amount: '450 г',
            dishIds: ['beef_meatballs'],
          },
        ],
      },
    ],
  },
  {
    id: 'chicken-fillet',
    title: 'Курица',
    intro: 'Филе, ножки, крылья, бёдра, печень.',
    items: [
      {
        id: 'chick-cubes',
        label: 'Кубики ~2 см',
        amount: '1,15 кг',
        packs: [
          {
            id: 'chick-cubes-tomato',
            label: 'Курица · кубики · Курица в томатно-сметанном соусе',
            amount: '600 г',
            dishIds: ['chicken_tomato_cream'],
          },
          {
            id: 'chick-cubes-pasta-zucchini',
            label: 'Курица · кубики · Паста с курицей и кабачком',
            amount: '550 г',
            dishIds: ['chicken_pasta_zucchini'],
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
            label: 'Курица · соломка · Куриный строганов',
            amount: '600 г',
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
            label: 'Курица · отбивные · Куриные отбивные в панировке',
            amount: '600 г',
            dishIds: ['chicken_schnitzel'],
          },
        ],
      },
      {
        id: 'chick-mince',
        label: 'Фарш',
        amount: '1,2 кг',
        how: 'Котлеты — из филе. Фрикадельки — лучше из бедра, не из одной грудки.',
        packs: [
          {
            id: 'chick-mince-cutlets-w2',
            label: 'Курица · фарш · Куриные котлеты',
            amount: '600 г',
            dishIds: ['chicken_cutlets'],
          },
          {
            id: 'chick-mince-meatballs-w4',
            label: 'Курица · фарш · Куриные фрикадельки в соусе',
            amount: '600 г',
            dishIds: ['chicken_meatballs'],
          },
        ],
      },
      {
        id: 'chick-grill',
        label: 'Курица · филе · Филе куриное гриль',
        amount: '600 г',
        how: 'Целые грудки или стейки, не кубики.',
        dishIds: ['chicken_grill'],
      },
      {
        id: 'chick-legs',
        label: 'Ножки',
        amount: '2 кг',
        how: 'Медово-чесночные: мёд 5 г + чеснок 10 г + паприка 2 г + масло + соль. Паприка: паприка 5 г + чеснок 10 г + масло + соль.',
        packs: [
          {
            id: 'legs-w1',
            label: 'Курица · ножки · Ножки медово-чесночные',
            amount: '1 кг',
            dishIds: ['chicken_legs_honey'],
          },
          {
            id: 'legs-w3',
            label: 'Курица · ножки · Ножки в паприке',
            amount: '1 кг',
            dishIds: ['chicken_legs_paprika'],
          },
        ],
      },
      {
        id: 'wings-w2',
        label: 'Курица · крылья · Крылья соево-медовые / Крылья в паприке',
        amount: '1,5 кг',
        dishIds: ['wings_soy', 'wings_paprika'],
        how: 'На выбор: соево-медовые (соевый 45 г + мёд 5 г + паприка 2 г + чеснок 5 г) или паприка (паприка 5 г + чеснок 10 г + масло + соль).',
      },
      {
        id: 'thighs-cream',
        label: 'Курица · бёдра · Бёдра в грибном сметанном соусе',
        amount: '800 г',
        dishIds: ['thighs_sour_cream'],
        how: 'Обсушить. Соус — свежий, в пакет не класть.',
      },
      {
        id: 'chicken-liver',
        label: 'Курица · печень · Куриная печень в сметане',
        amount: '600 г',
        dishIds: ['chicken_liver_sour_cream'],
        how: 'Промыть, обсушить, плёнки срезать. Крупные куски разрезать. Не солить заранее.',
      },
    ],
  },
  {
    id: 'fish',
    title: 'Рыба',
    intro: 'Куски ~100–150 г. Разложить по пакетам и заморозить.',
    items: [
      {
        id: 'trout',
        label: 'Форель',
        amount: '1,6 кг',
        how: 'Куски ~100–150 г.',
        packs: [
          {
            id: 'trout-grill',
            label: 'Форель · куски · Форель в аэрогриле',
            amount: '900 г',
            dishIds: ['trout'],
          },
          {
            id: 'trout-spinach',
            label: 'Форель · куски · Форель со шпинатом и черри в сливках',
            amount: '700 г',
            dishIds: ['trout_spinach'],
          },
        ],
      },
      {
        id: 'pollock',
        label: 'Минтай · куски · Минтай с овощами и сыром',
        amount: '750 г',
        how: 'Куски ~100–150 г.',
        dishIds: ['pollock'],
      },
    ],
  },
  {
    id: 'shrimp',
    title: 'Креветки',
    intro: 'Разморозить в холодильнике перед готовкой.',
    items: [
      {
        id: 'shrimp-pasta-w2',
        label: 'Креветки · целые · Паста с креветками',
        amount: '400 г',
        dishIds: ['shrimp_pasta'],
        how: 'Разморозить в холодильнике, обсушить. Хвосты можно оставить.',
      },
    ],
  },
]

const ISO_DAY = /^\d{4}-\d{2}-\d{2}$/

/** Пакет в морозилке: дата, когда заготовили и убрали. */
export type PrepFreezerEntry = {
  frozenOn?: string
}

export type PrepFreezer = Record<string, PrepFreezerEntry>

/** Какой пакет сняли с морозилки при готовке (чтобы вернуть с той же датой). */
export type PrepTakenEntry = {
  packId: string
  frozenOn?: string
}

export type PrepTaken = Record<string, PrepTakenEntry>

export function parsePrepFreezer(raw: unknown): PrepFreezer {
  if (!raw || typeof raw !== 'object') return {}
  const out: PrepFreezer = {}
  for (const [id, value] of Object.entries(raw as Record<string, unknown>)) {
    if (!id) continue
    if (value === true) {
      out[id] = {}
      continue
    }
    if (value === false || value == null) continue
    if (typeof value === 'object') {
      const frozenOn = (value as { frozenOn?: unknown }).frozenOn
      out[id] =
        typeof frozenOn === 'string' && ISO_DAY.test(frozenOn)
          ? { frozenOn }
          : {}
    }
  }
  return out
}

export function parsePrepTaken(raw: unknown): PrepTaken {
  if (!raw || typeof raw !== 'object') return {}
  const out: PrepTaken = {}
  for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
    if (typeof value === 'string' && value) {
      out[key] = { packId: value }
      continue
    }
    if (!value || typeof value !== 'object') continue
    const packId = (value as { packId?: unknown }).packId
    if (typeof packId !== 'string' || !packId) continue
    const frozenOn = (value as { frozenOn?: unknown }).frozenOn
    out[key] =
      typeof frozenOn === 'string' && ISO_DAY.test(frozenOn)
        ? { packId, frozenOn }
        : { packId }
  }
  return out
}

export function frozenOnOf(
  freezer: PrepFreezer | undefined,
  id: string,
): string | undefined {
  return freezer?.[id]?.frozenOn
}

export function putPrepInFreezer(
  freezer: PrepFreezer,
  id: string,
  frozenOn: string,
): PrepFreezer {
  return { ...freezer, [id]: { frozenOn } }
}

export function takePrepFromFreezer(freezer: PrepFreezer, id: string): PrepFreezer {
  if (!(id in freezer)) return freezer
  const next = { ...freezer }
  delete next[id]
  return next
}

type PrepUnit = {
  id: string
  label: string
  amount: string
  how?: string
  dishIds: string[]
  groupId: string
  groupTitle: string
  groupIntro?: string
  itemId: string
  itemLabel: string
  itemAmount: string
  itemHow?: string
  hasPacks: boolean
}

/** Все id пакетов у позиции (или сама позиция, если пакетов нет) */
export function prepCheckIds(item: PrepItem): string[] {
  return item.packs?.map((p) => p.id) ?? [item.id]
}

function listPrepUnits(): PrepUnit[] {
  const units: PrepUnit[] = []
  for (const group of prepGroups) {
    for (const item of group.items) {
      if (item.packs) {
        for (const pack of item.packs) {
          units.push({
            id: pack.id,
            label: pack.label,
            amount: pack.amount,
            dishIds: pack.dishIds ?? [],
            groupId: group.id,
            groupTitle: group.title,
            groupIntro: group.intro,
            itemId: item.id,
            itemLabel: item.label,
            itemAmount: item.amount,
            itemHow: item.how,
            hasPacks: true,
          })
        }
      } else {
        units.push({
          id: item.id,
          label: item.label,
          amount: item.amount,
          how: item.how,
          dishIds: item.dishIds ?? [],
          groupId: group.id,
          groupTitle: group.title,
          groupIntro: group.intro,
          itemId: item.id,
          itemLabel: item.label,
          itemAmount: item.amount,
          itemHow: item.how,
          hasPacks: false,
        })
      }
    }
  }
  return units
}

export function isPrepInFreezer(
  freezer: PrepFreezer | undefined,
  id: string,
): boolean {
  return freezer != null && Object.hasOwn(freezer, id)
}

function unitMatchesDish(unit: PrepUnit, dishId: string): boolean {
  return unit.dishIds.includes(dishId)
}

/** Первый пакет этого блюда, который сейчас в морозилке (порядок как в списке заготовок). */
export function pickFrozenPackForDish(
  freezer: PrepFreezer | undefined,
  dishId: string,
): PrepUnit | undefined {
  return listPrepUnits().find(
    (unit) => unitMatchesDish(unit, dishId) && isPrepInFreezer(freezer, unit.id),
  )
}

export function dishHasFrozenPrep(
  freezer: PrepFreezer | undefined,
  dishId: string,
): boolean {
  return Boolean(pickFrozenPackForDish(freezer, dishId))
}

/** Пакет заготовки для блюда — его белок в покупках на готовку не дублируем. */
function prepUnitForDish(dishId: string): PrepUnit | undefined {
  return listPrepUnits().find((unit) => unitMatchesDish(unit, dishId))
}

export function prepPackCoversIngredient(dishId: string, line: string): boolean {
  const unit = prepUnitForDish(dishId)
  if (!unit) return false
  const lower = line.toLowerCase().replace(/ё/g, 'е')
  const label = unit.label.toLowerCase().replace(/ё/g, 'е')
  const title = unit.groupTitle.toLowerCase().replace(/ё/g, 'е')
  if (label.includes('говядин') && /говядин/.test(lower)) return true
  if (label.includes('свинин') && /свинин/.test(lower)) return true
  if (title === 'курица' || label.startsWith('курица')) {
    return /куриц|грудк|печен|бедр|ножк|крыл/.test(lower)
  }
  if (label.includes('форел') && /форел/.test(lower)) return true
  if (label.includes('минтай') && /минтай/.test(lower)) return true
  if (label.includes('кревет') && /кревет/.test(lower)) return true
  return false
}

/**
 * Готовка блюда: один пакет уходит из морозилки в пул будущих.
 * Отмена готовки: тот же пакет возвращается с прежней датой заморозки.
 */
export function applyPrepForDishCook(
  freezer: PrepFreezer,
  taken: PrepTaken,
  cookKey: string,
  dishId: string,
  prepared: boolean,
): { freezer: PrepFreezer; taken: PrepTaken } {
  const takenNorm = parsePrepTaken(taken)
  if (prepared) {
    if (takenNorm[cookKey]) return { freezer, taken: takenNorm }
    const pack = pickFrozenPackForDish(freezer, dishId)
    if (!pack) return { freezer, taken: takenNorm }
    const frozenOn = freezer[pack.id]?.frozenOn
    return {
      freezer: takePrepFromFreezer(freezer, pack.id),
      taken: {
        ...takenNorm,
        [cookKey]: frozenOn ? { packId: pack.id, frozenOn } : { packId: pack.id },
      },
    }
  }

  const rec = takenNorm[cookKey]
  if (!rec) return { freezer, taken: takenNorm }
  const nextTaken = { ...takenNorm }
  delete nextTaken[cookKey]
  return {
    freezer: rec.frozenOn
      ? putPrepInFreezer(freezer, rec.packId, rec.frozenOn)
      : { ...freezer, [rec.packId]: {} },
    taken: nextTaken,
  }
}

export function parseAmountGrams(amount: string): number | null {
  const s = amount.trim().replace(',', '.').replace(/\s+/g, '')
  const kg = /^([\d.]+)кг$/i.exec(s)
  if (kg) {
    const n = Number(kg[1])
    return Number.isFinite(n) ? Math.round(n * 1000) : null
  }
  const g = /^([\d.]+)г$/i.exec(s)
  if (g) {
    const n = Number(g[1])
    return Number.isFinite(n) ? Math.round(n) : null
  }
  return null
}

function formatGrams(grams: number): string {
  if (grams >= 1000) {
    const kg = grams / 1000
    return `${String(kg).replace('.', ',')} кг`
  }
  return `${grams} г`
}

export function sumPrepAmounts(amounts: string[]): string | undefined {
  let total = 0
  let known = 0
  for (const amount of amounts) {
    const grams = parseAmountGrams(amount)
    if (grams == null) continue
    total += grams
    known += 1
  }
  if (known === 0) return undefined
  return formatGrams(total)
}

export function packWord(n: number): string {
  const n10 = n % 10
  const n100 = n % 100
  if (n10 === 1 && n100 !== 11) return 'пакет'
  if (n10 >= 2 && n10 <= 4 && (n100 < 12 || n100 > 14)) return 'пакета'
  return 'пакетов'
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
