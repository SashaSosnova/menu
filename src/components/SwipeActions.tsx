import { useEffect, useRef, type MouseEvent, type PointerEvent, type ReactNode } from 'react'

const ACTION_WIDTH = 104
const LOCK = 8

export type SwipeAction = {
  label: string
  tone?: 'danger' | 'ok' | 'plan'
  onClick: () => void
}

const closers = new Set<() => void>()

function closeOthers(keep?: () => void) {
  for (const close of closers) {
    if (close !== keep) close()
  }
}

export function SwipeActions({
  left,
  right,
  children,
}: {
  left?: SwipeAction
  right?: SwipeAction
  children: ReactNode
}) {
  const frontRef = useRef<HTMLDivElement>(null)
  const xRef = useRef(0)
  const startRef = useRef<{
    x: number
    y: number
    base: number
    locked: 'h' | 'v' | null
    id: number
  } | null>(null)
  const suppressClick = useRef(false)
  const minX = right ? -ACTION_WIDTH : 0
  const maxX = left ? ACTION_WIDTH : 0

  const closeRef = useRef(() => {})

  function setX(px: number, animate: boolean) {
    const node = frontRef.current
    if (!node) return
    xRef.current = px
    node.style.transition = animate ? 'transform 0.2s ease' : 'none'
    node.style.transform = `translate3d(${px}px,0,0)`
  }

  useEffect(() => {
    const close = () => {
      if (xRef.current === 0) return
      setX(0, true)
    }
    closeRef.current = close
    closers.add(close)
    return () => {
      closers.delete(close)
    }
  }, [])

  function snap(px: number) {
    const next = px > ACTION_WIDTH / 2 ? maxX : px < -ACTION_WIDTH / 2 ? minX : 0
    setX(next, true)
  }

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    if (
      (event.target as HTMLElement).closest(
        'input, a, .outcome-chip, .menu-recipe-open, .fridge-step-btn, .swipe-actions-btn, .prep-frozen-on',
      )
    ) {
      return
    }
    closeOthers(closeRef.current)
    startRef.current = {
      x: event.clientX,
      y: event.clientY,
      base: xRef.current,
      locked: null,
      id: event.pointerId,
    }
  }

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    const start = startRef.current
    if (!start || event.pointerId !== start.id) return
    const dx = event.clientX - start.x
    const dy = event.clientY - start.y
    if (!start.locked) {
      if (Math.abs(dx) < LOCK && Math.abs(dy) < LOCK) return
      start.locked = Math.abs(dx) > Math.abs(dy) ? 'h' : 'v'
      if (start.locked === 'v') {
        startRef.current = null
        return
      }
      event.currentTarget.setPointerCapture(event.pointerId)
      event.currentTarget.style.touchAction = 'none'
    }
    if (start.locked !== 'h') return
    setX(Math.min(maxX, Math.max(minX, start.base + dx)), false)
  }

  function onPointerUp(event: PointerEvent<HTMLDivElement>) {
    const start = startRef.current
    if (!start || event.pointerId !== start.id) {
      startRef.current = null
      return
    }
    const dx = event.clientX - start.x
    const dy = event.clientY - start.y
    event.currentTarget.style.touchAction = ''
    startRef.current = null
    if (start.locked === 'h') {
      suppressClick.current = true
      snap(start.base + dx)
      return
    }
    if (Math.abs(dx) < LOCK && Math.abs(dy) < LOCK && xRef.current !== 0) {
      setX(0, true)
    }
  }

  function onClickCapture(event: MouseEvent<HTMLDivElement>) {
    if (!suppressClick.current) return
    event.preventDefault()
    event.stopPropagation()
    suppressClick.current = false
  }

  return (
    <div className="swipe-actions">
      {left ? (
        <button
          type="button"
          className={`swipe-actions-btn is-left is-${left.tone ?? 'plan'}`}
          onClick={() => {
            setX(0, true)
            left.onClick()
          }}
        >
          {left.label}
        </button>
      ) : null}
      {right ? (
        <button
          type="button"
          className={`swipe-actions-btn is-right is-${right.tone ?? 'danger'}`}
          onClick={() => {
            setX(0, true)
            right.onClick()
          }}
        >
          {right.label}
        </button>
      ) : null}
      <div
        ref={frontRef}
        className="swipe-actions-front"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onClickCapture={onClickCapture}
      >
        {children}
      </div>
    </div>
  )
}
