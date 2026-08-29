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

function packUnits(item: PrepItem) {
  if (item.packs) return item.packs
  return [{ id: item.id, label: item.label, amount: item.amount, dishIds: item.dishIds }]
}

function PackLine({
  label,
  amount,
  cookedLabel,
  frozenOn,
  checked,
  isNext,
  pool,
  onToggle,
  onFrozenOnChange,
}: {
  label: string
  amount: string
  cookedLabel?: string
  frozenOn?: string
  checked: boolean
  isNext?: boolean
  pool: 'freezer' | 'future'
  onToggle: () => void
  onFrozenOnChange?: (iso: string) => void
}) {
  return (
    <div
      className={['prep-item', pool === 'freezer' ? 'is-frozen' : '', isNext ? 'is-next' : '']
        .filter(Boolean)
        .join(' ')}
    >
      <label className="prep-item-main">
        <input type="checkbox" checked={checked} onChange={onToggle} />
        <span className="prep-body">
          <span className="prep-head">
            <span className="prep-product">{label}</span>
            <span className="prep-amount">{amount}</span>
          </span>
          {cookedLabel ? <span className="menu-last-cooked">{cookedLabel}</span> : null}
        </span>
      </label>
      {pool === 'freezer' && onFrozenOnChange ? (
        <span className="prep-frozen-on">
          <span>{frozenOnCaption(frozenOn)}</span>
          <input
            type="date"
            value={frozenOn ?? ''}
            max={isoDate()}
            aria-label="Дата заготовки"
            onChange={(event) => {
              const value = event.target.value
              if (value) onFrozenOnChange(value)
            }}
          />
        </span>
      ) : null}
    </div>
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
  onToggle: (id: string) => void
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
              checked={isPrepInFreezer(freezer, pack.id)}
              onToggle={() => onToggle(pack.id)}
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
  onToggle: (id: string) => void
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
      ) : (
        <div className="week-sections">
          {rows.map((row) => {
            const items = pool === 'freezer' ? row.frozenItems : row.futureItems
            const count = pool === 'freezer' ? row.frozenCount : row.futureCount
            const amount = pool === 'freezer' ? row.frozenAmount : row.futureAmount
            return (
              <details key={row.group.id} className="fold">
                <summary>
                  <span className="prep-fold-line">
                    <span className="prep-fold-title">{row.group.title}</span>
                    <span className="prep-group-count">
                      {count} {packWord(count)}
                      {amount ? ` · ${amount}` : ''}
                    </span>
                  </span>
                </summary>
                <div className="fold-body">
                  <GroupList
                    items={items}
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
            )
          })}
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

  function toggle(id: string) {
    patchState((prev) => {
      const stock = prev.freezerStock ?? {}
      return {
        ...prev,
        freezerStock: isPrepInFreezer(stock, id)
          ? takePrepFromFreezer(stock, id)
          : putPrepInFreezer(stock, id, isoDate()),
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
    onToggle: toggle,
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
