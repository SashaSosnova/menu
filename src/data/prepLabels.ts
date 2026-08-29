/**
 * Строки этикеток для NIIMBOT: продукт, вид нарезки, вес, блюдо, срок хранения.
 */

import { freezerBestBefore, monthStart } from './calendar'
import { getDish } from './dishes'
import { prepGroups, type PrepItem } from './prep'

export type PrepLabelIconKey = 'beef' | 'chicken' | 'fish' | 'shrimp'

export type PrepLabelRow = {
  id: string
  product: string
  form: string
  amount: string
  dish: string
  /** «до ДД.ММ.ГГГГ» */
  useBy: string
  iconKey: PrepLabelIconKey
}

/**
 * Срок в морозилке (−18 °C) от даты заготовки, месяцев.
 * Говядина дольше; птица средне; рыба и креветки короче.
 */
export const FREEZER_MONTHS_BY_ICON: Record<PrepLabelIconKey, number> = {
  beef: 4,
  chicken: 3,
  fish: 2,
  shrimp: 2,
}

const FORM_BY_ITEM_LABEL: Record<string, string> = {
  Соломка: 'соломка',
  Фарш: 'фарш',
  'Кубики ~2 см': 'кубики',
  'Кубики 2–3 см': 'кубики',
  'Крупный кусок': 'крупный кусок',
  Отбивные: 'отбивные',
  Форель: 'куски',
}

function productForGroup(groupId: string, item: PrepItem): string {
  if (groupId === 'beef') return 'Говядина'
  if (
    groupId === 'chicken-fillet' ||
    groupId === 'legs' ||
    groupId === 'wings' ||
    groupId === 'thighs' ||
    groupId === 'liver' ||
    groupId === 'marinate-legs-wings' ||
    groupId === 'marinate-cream'
  ) {
    return 'Курица'
  }
  if (groupId === 'shrimp') return 'Креветки'
  if (groupId === 'fish') {
    if (item.id === 'trout' || item.id.startsWith('trout')) return 'Форель'
    if (item.id === 'pollock') return 'Минтай'
    if (item.id === 'shrimp' || item.id.startsWith('shrimp')) return 'Креветки'
  }
  return item.label
}

function iconForProduct(product: string): PrepLabelIconKey {
  if (product === 'Говядина') return 'beef'
  if (product === 'Курица') return 'chicken'
  if (product === 'Креветки') return 'shrimp'
  return 'fish'
}

function formForItem(item: PrepItem): string {
  const mapped = FORM_BY_ITEM_LABEL[item.label]
  if (mapped) return mapped
  const parts = item.label.split(/\s*[·.]\s+/)
  if (parts.length >= 3) return parts[1]!.toLowerCase()
  return item.label.toLowerCase()
}

function dishNames(dishIds?: string[]): string {
  if (!dishIds?.length) return ''
  return dishIds
    .map((id) => getDish(id)?.name ?? id)
    .join(' / ')
}

function buildRow(
  id: string,
  groupId: string,
  item: PrepItem,
  amount: string,
  dishIds: string[] | undefined,
  frozenFrom: Date,
): PrepLabelRow {
  const product = productForGroup(groupId, item)
  const iconKey = iconForProduct(product)
  return {
    id,
    product,
    form: formForItem(item),
    amount,
    dish: dishNames(dishIds),
    useBy: freezerBestBefore(frozenFrom, FREEZER_MONTHS_BY_ICON[iconKey]),
    iconKey,
  }
}

/** Все пакеты/позиции заготовок — по одной строке на этикетку. */
export function listPrepLabelRows(
  frozenFrom: Date = monthStart,
): PrepLabelRow[] {
  const rows: PrepLabelRow[] = []

  for (const group of prepGroups) {
    for (const item of group.items) {
      if (item.packs?.length) {
        for (const pack of item.packs) {
          rows.push(
            buildRow(
              pack.id,
              group.id,
              item,
              pack.amount,
              pack.dishIds,
              frozenFrom,
            ),
          )
        }
      } else {
        rows.push(
          buildRow(
            item.id,
            group.id,
            item,
            item.amount,
            item.dishIds,
            frozenFrom,
          ),
        )
      }
    }
  }

  return rows
}
