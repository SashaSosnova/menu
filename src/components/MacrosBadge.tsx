import type { Macros } from '../data/types'
import { formatMacros } from '../lib/macros'

export function MacrosBadge({ macros }: { macros: Macros }) {
  return (
    <span className="macros" title="ккал / белки / жиры / углеводы на 100 г">
      {formatMacros(macros)}
    </span>
  )
}
