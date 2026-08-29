import { childEatsCaption, childEatsKind } from '../data/dishMeta'

export function ChildEatsMark({ dishId }: { dishId: string }) {
  const kind = childEatsKind(dishId)
  if (!kind) return null

  const label = childEatsCaption(dishId)

  return (
    <span className={`child-eats-mark is-${kind}`} title={label} aria-label={label}>
      <svg viewBox="0 0 16 16" aria-hidden="true">
        <circle cx="8" cy="4.1" r="2.35" fill="currentColor" />
        <path
          d="M3.6 14.2v-1.2c0-2.2 1.9-3.8 4.4-3.8s4.4 1.6 4.4 3.8v1.2"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
        />
      </svg>
    </span>
  )
}
