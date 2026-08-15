import { useMemo, useState } from 'react'
import type { MenuSlotId } from '../data/calendar'
import { getCookbookDish, getCookbookDishes, type CookbookStore } from '../data/cookbook'
import { getDish } from '../data/dishes'
import { getWeekMenu, menuRefLabel, type MenuDishRef } from '../data/menu'
import {
  catalogKindForRole,
  dishKindOf,
  getEffectiveWeekMenu,
  getSlotRef,
  listRoleSpots,
  mainFitInSlot,
  replaceMenuDish,
  resetMenuPosition,
  roleTitle,
  sideFitInSlot,
  sideGroup,
  sideGroupLabel,
  slotSideGroupConflict,
  type MenuOverrides,
  type MenuRole,
} from '../data/menuOverrides'

export type ReplaceTarget = {
  slotId: MenuSlotId
  role: MenuRole
  index: number
}

type Candidate = {
  dishId: string
  name: string
  action: 'swap' | 'replace'
  swapTitle?: string
  hints: string[]
}

function dishName(id: string, cookbook: CookbookStore): string {
  return getCookbookDish(id, cookbook)?.name ?? getDish(id)?.name ?? id
}

function refLabel(ref: MenuDishRef, cookbook: CookbookStore): string {
  return menuRefLabel(ref, (id) => dishName(id, cookbook))
}

function buildCandidates(
  week: number,
  target: ReplaceTarget,
  overrides: MenuOverrides,
  cookbook: CookbookStore,
  query: string,
): Candidate[] {
  const menu = getEffectiveWeekMenu(week, overrides)
  const slot = menu.slots.find((s) => s.id === target.slotId)
  if (!slot) return []

  const current = getSlotRef(slot, target.role, target.index)
  const kind = catalogKindForRole(target.role)
  const { mains, sides } = getCookbookDishes(cookbook)
  const pool = kind === 'side' ? sides : mains.filter((d) => dishKindOf(d.id, d.kind) === kind)
  const spots = listRoleSpots(menu, target.role)
  const q = query.trim().toLowerCase()

  const out: Candidate[] = []

  for (const dish of pool) {
    if (current && menuRefIdsIncludes(current, dish.id)) continue
    if (q && !dish.name.toLowerCase().includes(q)) continue

    const occupied = spots.find((spot) => menuRefIdsIncludes(spot.ref, dish.id))
    const action: 'swap' | 'replace' =
      occupied &&
      (occupied.slotId !== target.slotId || occupied.index !== target.index)
        ? 'swap'
        : 'replace'

    const hints: string[] = []
    if (target.role === 'sides') {
      const fit = sideFitInSlot(dish.id, slot)
      if (!fit.ok) hints.push(`не к «${fit.misses.join('», «')}»`)
      if (slotSideGroupConflict(slot, target.index, dish.id)) {
        hints.push(`в этой готовке уже есть ${sideGroupLabel(sideGroup(dish.id))}`)
      }
    } else if (target.role === 'mains') {
      const fit = mainFitInSlot(dish.id, slot)
      if (!fit.ok) hints.push(`не с «${fit.misses.join('», «')}»`)
    }

    out.push({
      dishId: dish.id,
      name: dish.name,
      action,
      swapTitle:
        action === 'swap' && occupied
          ? occupied.slotId === target.slotId
            ? 'этой готовке'
            : occupied.title
          : undefined,
      hints,
    })
  }

  return out.sort((a, b) => {
    if (a.action !== b.action) return a.action === 'swap' ? -1 : 1
    return a.name.localeCompare(b.name, 'ru')
  })
}

function menuRefIdsIncludes(ref: MenuDishRef, dishId: string): boolean {
  return ref.dishId === dishId || (ref.orDishIds?.includes(dishId) ?? false)
}

export function ReplaceDishModal({
  week,
  target,
  overrides,
  cookbook,
  onOverridesChange,
  onClose,
}: {
  week: number
  target: ReplaceTarget
  overrides: MenuOverrides
  cookbook: CookbookStore
  onOverridesChange: (next: MenuOverrides) => void
  onClose: () => void
}) {
  const [query, setQuery] = useState('')
  const menu = getEffectiveWeekMenu(week, overrides)
  const seed = getWeekMenu(week)
  const slot = menu.slots.find((s) => s.id === target.slotId)
  const seedSlot = seed.slots.find((s) => s.id === target.slotId)
  const current = slot ? getSlotRef(slot, target.role, target.index) : undefined
  const original = seedSlot ? getSlotRef(seedSlot, target.role, target.index) : undefined
  const changed = Boolean(original && current && original.dishId !== current.dishId)
  const candidates = useMemo(
    () => buildCandidates(week, target, overrides, cookbook, query),
    [week, target, overrides, cookbook, query],
  )
  const swaps = candidates.filter((c) => c.action === 'swap')
  const replacements = candidates.filter((c) => c.action === 'replace')
  const title = roleTitle(target.role)

  function pick(dishId: string) {
    onOverridesChange(replaceMenuDish(overrides, week, target, dishId))
    onClose()
  }

  function restore() {
    onOverridesChange(resetMenuPosition(overrides, week, target))
    onClose()
  }

  return (
    <div className="modal-backdrop" onClick={onClose} role="presentation">
      <div className="modal replace-modal" onClick={(e) => e.stopPropagation()} role="dialog">
        <div className="modal-header">
          <div>
            <h2>Заменить {title}</h2>
            {current ? (
              <p className="muted">Сейчас: {refLabel(current, cookbook)}</p>
            ) : null}
          </div>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Закрыть">
            ×
          </button>
        </div>
        <div className="modal-body">
          <label className="field">
            <span className="field-label">Поиск</span>
            <input
              className="field-input"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Название блюда…"
              autoFocus
            />
          </label>

          {changed && original ? (
            <button type="button" className="ghost-btn replace-restore" onClick={restore}>
              Вернуть «{refLabel(original, cookbook)}»
            </button>
          ) : null}

          {swaps.length > 0 ? (
            <section className="replace-section">
              <h3>Поменять местами</h3>
              <p className="muted replace-section-hint">
                Это блюдо уйдёт на место выбранного.
              </p>
              <div className="replace-option-list">
                {swaps.map((c) => (
                  <CandidateButton key={c.dishId} candidate={c} onPick={pick} />
                ))}
              </div>
            </section>
          ) : null}

          <section className="replace-section">
            <h3>{swaps.length > 0 ? 'Заменить на другое' : 'Выбрать блюдо'}</h3>
            {replacements.length === 0 ? (
              <p className="muted">Ничего не нашлось.</p>
            ) : (
              <div className="replace-option-list">
                {replacements.map((c) => (
                  <CandidateButton key={c.dishId} candidate={c} onPick={pick} />
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}

function CandidateButton({
  candidate,
  onPick,
}: {
  candidate: Candidate
  onPick: (dishId: string) => void
}) {
  return (
    <button type="button" className="replace-option" onClick={() => onPick(candidate.dishId)}>
      <span className="replace-option-name">{candidate.name}</span>
      {candidate.swapTitle ? (
        <span className="replace-hint">сейчас в {candidate.swapTitle}</span>
      ) : null}
      {candidate.hints.map((hint) => (
        <span key={hint} className="replace-hint warn">
          {hint}
        </span>
      ))}
    </button>
  )
}
