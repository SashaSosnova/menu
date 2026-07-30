import type { Macros } from '../data/types'
import { formatMacros } from '../data/dishes'

export function MacrosBadge({ macros }: { macros: Macros }) {
  return (
    <span className="macros" title="ккал / белки / жиры / углеводы на 100 г">
      {formatMacros(macros)}
    </span>
  )
}
