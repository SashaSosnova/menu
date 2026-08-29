import { getPrepPackLabel } from '../data/prep'

const DAY_ABBR = /\b(?:пн|вт|ср|чт|пт|сб|вс)\b/gi

const STEP_SPLIT = /(?<=[.!?])\s+(?=[«"„(А-ЯЁA-Z0-9])/

function tidyStep(part: string): string {
  return part
    .replace(/^\d+[.)]\s+/, '')
    .replace(/[.]+$/, '')
    .trim()
}

/** Шаги рецепта: из абзаца или из строк — список для нумерации. */
export function splitRecipeSteps(text: string): string[] {
  const trimmed = text.trim()
  if (!trimmed) return []

  if (/\r?\n/.test(trimmed)) {
    return trimmed
      .split(/\r?\n/)
      .map(tidyStep)
      .filter(Boolean)
  }

  return trimmed
    .split(STEP_SPLIT)
    .map(tidyStep)
    .filter(Boolean)
}

export function joinRecipeSteps(steps: string[]): string {
  return steps.map(tidyStep).filter(Boolean).join('\n')
}

/** Первый шаг: взять подписанный пакет из морозилки (если есть заготовка) */
export function withPrepPackStep(dishId: string, steps: string): string {
  const label = getPrepPackLabel(dishId)
  const trimmed = steps.trim()
  if (!label || !trimmed) return steps

  const prefix = `Взять пакет из морозилки «${label}».`
  if (/Взять\s+пакет\s+из\s+морозилки/i.test(trimmed)) return steps
  if (trimmed.includes(`«${label}»`) && /морозил/i.test(trimmed)) return steps

  if (/\r?\n/.test(trimmed)) return `${prefix}\n${trimmed}`
  return `${prefix} ${trimmed}`
}

/** Убираем авто-шаг про пакет, чтобы не задвоить при сохранении. */
export function stripAutoPrepPackStep(dishId: string, steps: string): string {
  const label = getPrepPackLabel(dishId)
  const trimmed = steps.trim()
  if (!label || !trimmed) return steps
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return trimmed
    .replace(new RegExp(`^Взять\\s+пакет\\s+из\\s+морозилки\\s+«${escaped}»\\.?\\s*`, 'i'), '')
    .trim()
}

const DAY_NAMES =
  /^(?:в\s+)?(?:понедельник|вторник|среду|четверг|пятницу|субботу|воскресенье|день\s+рыбы)\b/i

/** Убираем дни недели, порции на тарелку и подачу — оставляем способ приготовления */
export function cleanRecipeSteps(text: string): string {
  let s = text.trim()

  s = s.replace(/^Заранее:[^.]*?(?:морозилка|холодильник)\.\s*/i, '')
  s = s.replace(
    /^В\s+(?:понедельник|вторник|среду|четверг|пятницу|субботу|воскресенье|день\s+рыбы):\s*/i,
    '',
  )

  const parts = s
    .split(/\.\s+/)
    .map((part) => cleanStepPart(part.trim()))
    .filter(Boolean)

  const out = finalizeSteps(parts.join('. '))
  if (!out) return text.trim()
  return out
}

function finalizeSteps(text: string): string {
  let s = text.replace(/\s{2,}/g, ' ').trim()
  s = s.replace(/(?:\.\s*)+$/g, '.')
  s = s.replace(/\.\s+\./g, '. ')
  s = s.replace(/\s+\./g, '.')
  if (!s) return ''
  return s.endsWith('.') ? s : `${s}.`
}

function isServingPart(part: string): boolean {
  const lower = part.toLowerCase()
  if (/^на\s+тарелку\b/.test(lower)) return true
  if (/^порци/i.test(lower)) return true
  if (/^ты\s*~?\d+/i.test(part)) return true
  if (/^с\s+тушён/i.test(lower)) return true
  if (/^к\s+(?:гречке|рыбе|картошке|классика|киноа|пасте)/i.test(lower)) return true
  if (/^полить\s+рыбу/i.test(lower)) return true
  if (/при\s+подаче/i.test(lower)) return true
  if (/^подавать\b/i.test(lower)) return true
  if (/^покупная/i.test(lower)) return true
  if (/^тёртую\s+морковь/i.test(lower)) return true
  if (/^не\s+подавать/i.test(lower)) return true
  if (/^цельное/i.test(lower)) return true
  if (/^сразу\s+смешать\s+с\s+(?:гарниром|рисом|киноа)/i.test(lower)) return true
  if (/^отдельно\s+(?:креветки|не\s+едаем|не\s+пода)/i.test(lower)) return true
  if (/^без\s+отдельного\s+гарнира/i.test(lower)) return true
  if (/^крупу\s+или/i.test(lower)) return true
  if (/^отлично\s+к/i.test(lower)) return true
  if (/^если\s+хочется\s+морковь/i.test(lower)) return true
  if (/^капуста\s+по-корейски\s+тоже/i.test(lower)) return true
  if (/^один\s+гарнир/i.test(lower)) return true
  if (/сметана\s+в\s+тарелке/i.test(lower)) return true
  return false
}

function stripServingTail(part: string): string {
  let p = part

  p = p.replace(/\s*[—–-]\s*отдельно\s+не\s+пода[^\.,]*/gi, '')
  p = p.replace(/\s*[—–-]\s*без\s+отдельного\s+гарнира[^\.,]*/gi, '')
  p = p.replace(/\s*На\s+тарелку[^.,]*/gi, '')
  p = p.replace(/\s*на\s+тарелку[^.,]*/gi, '')
  p = p.replace(/\s*Порци(?:и|я)\s+(?:готового|как\s+у)[^.,]*/gi, '')
  p = p.replace(/\s*Порция\s+на\s+тарелке[^.,]*/gi, '')
  p = p.replace(/\s*порция\s*~?[^.,]*/gi, '')
  p = p.replace(/\s*К\s+гречке[^.,]*/gi, '')
  p = p.replace(/\s*Классика\s+к[^.,]*/gi, '')
  p = p.replace(/\s*К\s+рыбе[^.,]*/gi, '')
  p = p.replace(/\s*К\s+картошке[^.,]*/gi, '')
  p = p.replace(/\bты\s*~?\d+[^.,]*/gi, '')
  p = p.replace(/\s*~?\d+\s*\/\s*\d+\s*\/\s*\d+\s*г[^.,]*/gi, '')
  p = p.replace(/\s*~?\d+\s*г\s*\+\s*гарнир/gi, '')
  p = p.replace(/\s*белка\+(?:соуса|овощей)\s*~?[^.,]*/gi, '')
  p = p.replace(/\s*С\s+тушён[^.,]*/gi, '')
  p = p.replace(/\s*К\s+ножкам[^.,]*/gi, '')
  p = p.replace(/\s*К\s+рису[^.,]*/gi, '')
  p = p.replace(/\s*Полить\s+рыбу[^.,]*/gi, '')
  p = p.replace(/\s*при\s+подаче[^.,]*/gi, '')
  p = p.replace(/\s*К\s+(?:киноа|пасте|гречке)[^.,]*/gi, '')
  p = p.replace(/\s*Не\s+подавать\s+к[^.,]*/gi, '')
  p = p.replace(/\s*Отлично\s+к[^.,]*/gi, '')
  p = p.replace(/\s*Цельное[^.,]*/gi, '')
  p = p.replace(/\s*Крупу\s+или\s+картошку[^.,]*/gi, '')
  p = p.replace(/\s*к\s+этому\s+белку[^.,]*/gi, '')
  p = p.replace(/\s*Сразу\s+смешать\s+с\s+(?:гарниром|рисом|киноа)[^.,]*/gi, '')
  p = p.replace(/\s*Отдельно\s+креветки[^.,]*/gi, '')

  return p.replace(/\s{2,}/g, ' ').replace(/\s+,/g, ',').trim()
}

function cleanStepPart(part: string): string {
  if (!part) return ''

  const lower = part.toLowerCase()
  if (DAY_NAMES.test(part)) return ''
  if (isServingPart(part)) return ''
  if (/только\s+разогреть/.test(lower)) return ''
  if (/^\d+\s*г\s*на\s*(?:сб|вс|пн|вт|ср|чт|пт)/i.test(part)) return ''
  if (/варить\s+в\s+будни/.test(lower)) return ''
  if (/только\s+вс\/ср\/сб/.test(lower)) return ''
  if (/кастрюля\s+на\s+пн/i.test(lower)) return ''
  if (/пн\s*ужин\s*\+\s*вт\s*обед/i.test(lower)) return ''
  if (/ср\s*\+\s*чт\s*обед/i.test(lower)) return ''
  if (/сб\s*ужин\s*\+\s*вс/i.test(lower)) return ''
  if (/сб\s*обед\s*с\s*картофелем,\s*вс\s*доедаем/i.test(lower)) return ''
  if (/сб\s*ужин\s*—\s*остатки/i.test(lower)) return ''
  if (/после\s+заготовки\s+ножек\s+на\s+обед/i.test(lower)) return ''
  if (/^обычно\s+заменяем\s+на/i.test(lower)) return ''
  if (/^максимум\s+1\s+раз\s+в/i.test(lower)) return ''

  let p = part
  p = p.replace(/\s*\([^)]*(?:нед\.?\s*\d|пн|вт|ср|чт|пт|сб|вс)[^)]*\)/gi, '')
  p = p.replace(/\s*\(вс,\s*нед\.?\s*\d\)/gi, '')
  p = p.replace(/\s*—\s*кастрюля\s+на\s+пн[^.]*$/i, '')
  p = p.replace(/\s*—\s*крупой\/пasta\/[^.]*$/i, '')
  p = p.replace(/\s*из\s+(?:той\s+же\s+)?готовки\b/gi, '')
  p = p.replace(/\s*из\s+готовки\b/gi, '')
  p = p.replace(/\s*;\s*нед\.?\s*\d[^.;]*$/i, '')
  p = p.replace(/\s*;\s*[^.;]*(?:сб\+вс|сб\+вс)[^.;]*$/i, '')
  p = p.replace(/\s*·\s*[^.;]*(?:сб\+вс)[^.;]*$/i, '')
  p = p.replace(/\s*Чт\s*—\s*к\s+рыбе\s*;?\s*/gi, '')
  p = p.replace(/\s*К\s+бёдрам\s*\(пт\),\s*не\s+к\s+рыбе\.?\s*$/i, '')
  p = p.replace(/\s*и\s+остатки\.?\s*$/i, '')
  p = p.replace(/\s*Рис\s+варить\s+ОТДЕЛЬНО\s+той\s+же\s+готовкой\s*\([^)]*\)\s*—\s*[^.]*\.?\s*$/i, '')

  p = p.replace(DAY_ABBR, '')
  p = p.replace(/\s*нед\.?\s*\d+(?:\s*[–-]\s*\d+)?/gi, '')
  p = p.replace(/\s*\+\s*пт\s*обед/gi, '')
  p = p.replace(/\s*на\s+пт\s+обед/gi, '')
  p = p.replace(/\s*~?\d+\s*г\s*на\s+троих[^,]*,\s*сразу\s+отложить[^.]*$/i, '')
  p = p.replace(/\s*~?\d+\s*г\s*сразу\s+в\s+контейнер[^.]*$/i, '')
  p = p.replace(/\s*Ужин\s*~?\d+\s*г\s*на\s+троих[^,]*,\s*~?\d+\s*г[^.]*$/i, '')

  p = stripServingTail(p)

  p = p.replace(/\s{2,}/g, ' ').replace(/\s+,/g, ',').trim()

  if (!p || /^[,;—\-\s]+$/.test(p)) return ''
  return p
}
