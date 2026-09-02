import { useEffect, useRef, useState } from 'react'
import {
  frozenOnOf,
  isPrepInFreezer,
  packWord,
  prepCheckIds,
  prepGroups,
  prepMatchesNext,
  putPrepInFreezer,
  sumPrepAmounts,
  takePrepFromFreezer,
  type PrepFreezer,
  type PrepItem,
} from '../data/prep'
import { nextCookDishIds } from '../data/cycleQueue'
import { lastCookedOnForDishes, type CookBoard } from '../data/cookBoard'
import { frozenOnCaption, isoDate, lastCookedCaption } from '../data/calendar'
import { useMenuSync } from '../hooks/useMenuSync'
import type { MealStatsStore } from '../data/mealStats'
import { SwipeActions } from './SwipeActions'

function FrozenOnEdit({
  frozenOn,
  onChange,
}: {
  frozenOn?: string
  onChange: (iso: string) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return
    inputRef.current?.focus()
  }, [open])

  function openPicker() {
    const el = inputRef.current
    if (!el) return
    try {
      if (typeof el.showPicker === 'function') {
        el.showPicker()
        return
      }
    } catch {
      // Native picker needs a visible input.
    }
    setOpen(true)
  }

  return (
    <span className="prep-frozen-on">
      <button type="button" className="prep-frozen-on-btn" onClick={openPicker}>
        {frozenOnCaption(frozenOn)}
      </button>
      <input
        ref={inputRef}
        type="date"
        className={open ? undefined : 'prep-frozen-on-picker'}
        value={frozenOn ?? ''}
        max={isoDate()}
        aria-label="Дата заготовки"
        tabIndex={open ? 0 : -1}
        onChange={(event) => {
          const value = event.target.value
          if (!value) return
          onChange(value)
          setOpen(false)
        }}
        onBlur={() => setOpen(false)}
      />
    </span>
  )
}

function packUnits(item: PrepItem) {
  if (item.packs) return item.packs
  return [{ id: item.id, label: item.label, amount: item.amount, dishIds: item.dishIds }]
}

function PackLine({
  label,
  amount,
  cookedLabel,
  frozenOn,
  isNext,
  pool,
  onToggle,
  onFrozenOnChange,
}: {
  label: string
  amount: string
  cookedLabel?: string
  frozenOn?: string
  isNext?: boolean
  pool: 'freezer' | 'future'
  onToggle: (packed: boolean) => void
  onFrozenOnChange?: (iso: string) => void
}) {
  return (
    <SwipeActions
      right={
        pool === 'freezer'
          ? { label: 'Снять', tone: 'danger', onClick: () => onToggle(false) }
          : { label: 'В морозилку', tone: 'ok', onClick: () => onToggle(true) }
      }
    >
      <div
        className={['prep-item', pool === 'freezer' ? 'is-frozen' : '', isNext ? 'is-next' : '']
          .filter(Boolean)
          .join(' ')}
      >
        <div className="prep-item-main">
          <span className="prep-body">
            <span className="prep-head">
              <span className="prep-product">{label}</span>
              <span className="prep-amount">{amount}</span>
            </span>
            {cookedLabel ? <span className="menu-last-cooked">{cookedLabel}</span> : null}
          </span>
        </div>
        {pool === 'freezer' && onFrozenOnChange ? (
          <FrozenOnEdit frozenOn={frozenOn} onChange={onFrozenOnChange} />
        ) : null}
      </div>
    </SwipeActions>
  )
}

function GroupList({
  items,
  freezer,
  nextCook,
  pool,
  board,
  stats,
  onToggle,
  onFrozenOnChange,
}: {
  items: PrepItem[]
  freezer: PrepFreezer
  nextCook: Set<string>
  pool: 'freezer' | 'future'
  board: CookBoard
  stats: MealStatsStore
  onToggle: (id: string, packed: boolean) => void
  onFrozenOnChange: (id: string, iso: string) => void
}) {
  const packs = items.flatMap(packUnits)

  return (
    <ul className="prep-list">
      {packs.map((pack) => {
        const isNext = prepMatchesNext(pack, nextCook)
        const cookedLabel = pack.dishIds?.length
          ? lastCookedCaption(lastCookedOnForDishes(board, pack.dishIds, stats))
          : undefined
        return (
          <li key={pack.id}>
            <PackLine
              label={pack.label}
              amount={pack.amount}
              cookedLabel={cookedLabel}
              frozenOn={frozenOnOf(freezer, pack.id)}
              isNext={isNext}
              pool={pool}
              onToggle={(packed) => onToggle(pack.id, packed)}
              onFrozenOnChange={(iso) => onFrozenOnChange(pack.id, iso)}
            />
          </li>
        )
      })}
    </ul>
  )
}

function groupUnits(
  items: PrepItem[],
  freezer: PrepFreezer,
  inFreezer: boolean,
): PrepItem[] {
  return items.flatMap((item) => {
    if (item.packs) {
      const packs = item.packs.filter(
        (pack) => isPrepInFreezer(freezer, pack.id) === inFreezer,
      )
      if (packs.length === 0) return []
      return [{ ...item, packs }]
    }
    return isPrepInFreezer(freezer, item.id) === inFreezer ? [item] : []
  })
}

function PoolSection({
  title,
  total,
  pools,
  freezer,
  nextCook,
  board,
  stats,
  pool,
  onToggle,
  onFrozenOnChange,
}: {
  title: string
  total: number
  pools: ReturnType<typeof buildPools>
  freezer: PrepFreezer
  nextCook: Set<string>
  board: CookBoard
  stats: MealStatsStore
  pool: 'freezer' | 'future'
  onToggle: (id: string, packed: boolean) => void
  onFrozenOnChange: (id: string, iso: string) => void
}) {
  const rows = pools.filter((p) =>
    pool === 'freezer' ? p.frozenCount > 0 : p.futureCount > 0,
  )

  return (
    <section className="prep-pool">
      <h3 className="cook-queue-heading">
        {title}
        <span className="prep-pool-count">
          {total} {packWord(total)}
        </span>
      </h3>
      {total === 0 ? (
        <p className="fridge-empty">{pool === 'freezer' ? 'Пока пусто' : 'Всё в морозилке'}</p>
      ) : pool === 'freezer' ? (
        <GroupList
          items={rows.flatMap((row) => row.frozenItems)}
          freezer={freezer}
          nextCook={nextCook}
          pool={pool}
          board={board}
          stats={stats}
          onToggle={onToggle}
          onFrozenOnChange={onFrozenOnChange}
        />
      ) : (
        <div className="week-sections">
          {rows.map((row) => (
            <details key={row.group.id} className="fold">
              <summary>
                <span className="prep-fold-line">
                  <span className="prep-fold-title">{row.group.title}</span>
                  <span className="prep-group-count">
                    {row.futureCount} {packWord(row.futureCount)}
                    {row.futureAmount ? ` · ${row.futureAmount}` : ''}
                  </span>
                </span>
              </summary>
              <div className="fold-body">
                <GroupList
                  items={row.futureItems}
                  freezer={freezer}
                  nextCook={nextCook}
                  pool={pool}
                  board={board}
                  stats={stats}
                  onToggle={onToggle}
                  onFrozenOnChange={onFrozenOnChange}
                />
              </div>
            </details>
          ))}
        </div>
      )}
    </section>
  )
}

function itemAmounts(item: PrepItem): string[] {
  return packUnits(item).map((pack) => pack.amount)
}

function buildPools(freezer: PrepFreezer) {
  return prepGroups.map((group) => {
    const frozenItems = groupUnits(group.items, freezer, true)
    const futureItems = groupUnits(group.items, freezer, false)
    const frozenIds = frozenItems.flatMap(prepCheckIds)
    const futureIds = futureItems.flatMap(prepCheckIds)
    return {
      group,
      frozenItems,
      futureItems,
      frozenCount: frozenIds.length,
      futureCount: futureIds.length,
      frozenAmount: sumPrepAmounts(frozenItems.flatMap(itemAmounts)),
      futureAmount: sumPrepAmounts(futureItems.flatMap(itemAmounts)),
    }
  })
}

export function PrepTab() {
  const { state, patchState } = useMenuSync()
  const freezer = state.freezerStock
  const nextCook = nextCookDishIds(state.cookBoard, state.mealStats, freezer)

  function setPacked(id: string, packed: boolean) {
    patchState((prev) => {
      const stock = prev.freezerStock ?? {}
      const inFreezer = isPrepInFreezer(stock, id)
      if (packed === inFreezer) return prev
      return {
        ...prev,
        freezerStock: packed
          ? putPrepInFreezer(stock, id, isoDate())
          : takePrepFromFreezer(stock, id),
      }
    })
  }

  function setFrozenOn(id: string, frozenOn: string) {
    patchState((prev) => {
      const stock = prev.freezerStock ?? {}
      if (!isPrepInFreezer(stock, id)) return prev
      return {
        ...prev,
        freezerStock: putPrepInFreezer(stock, id, frozenOn),
      }
    })
  }

  const pools = buildPools(freezer)
  const frozenTotal = pools.reduce((n, p) => n + p.frozenCount, 0)
  const futureTotal = pools.reduce((n, p) => n + p.futureCount, 0)
  const listProps = {
    pools,
    freezer,
    nextCook,
    board: state.cookBoard,
    stats: state.mealStats,
    onToggle: setPacked,
    onFrozenOnChange: setFrozenOn,
  }

  return (
    <section className="view">
      <PoolSection title="Морозилка" total={frozenTotal} pool="freezer" {...listProps} />
      <PoolSection
        title="Будущие заготовки"
        total={futureTotal}
        pool="future"
        {...listProps}
      />
    </section>
  )
}
