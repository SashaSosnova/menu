import { useMemo, useState } from 'react'
import {
  menuRefIds,
  menuRefLabel,
  type MenuDishRef,
} from '../data/menu'
import { getDish } from '../data/dishes'
import { formatMacros } from '../lib/macros'
import { getCookbookDish, getEffectiveRecipe, type CookbookStore } from '../data/cookbook'
import { isoDate } from '../data/calendar'
import {
  batchIdForDish,
  bumpFridgePortions,
  cookPortionsFromScale,
  DISH_MARK_OPTIONS,
  displayDishMarkForDish,
  dishQueueGroup,
  isDishPlanned,
  lastCookedOnForDish,
  listCookQueue,
  markShopHave,
  setDishPrepared,
  slotPrimaryDishIds,
  toggleDishPlanned,
  type CookBatchView,
  type CookBoard,
  type DishMark,
} from '../data/cookBoard'
import { plannedDishNames, plannedShopNeeds } from '../data/cookShop'
import {
  pairFitForSide,
  type MenuRole,
  type PairFit,
} from '../data/menuOverrides'
import { useMenuSync } from '../hooks/useMenuSync'
import type { MealStatsStore } from '../data/mealStats'
import { scaleIngredientLine } from '../lib/portionScale'
import { formatServingsDisplay } from '../lib/recipeServings'

function dishLabel(item: MenuDishRef): string {
  return menuRefLabel(item, (id) => getDish(id)?.name)
}

function RecipeVariantBlock({
  dishId,
  cookbook,
  sauceNote,
  scale = 1,
}: {
  dishId: string
  cookbook: CookbookStore
  sauceNote?: string
  scale?: number
}) {
  const dish = getCookbookDish(dishId, cookbook) ?? getDish(dishId)
  const recipe = getEffectiveRecipe(dishId, cookbook)
  if (!dish) return null
  const ingredients =
    recipe && scale !== 1
      ? recipe.ingredients.map((line) => scaleIngredientLine(line, scale))
      : recipe?.ingredients

  return (
    <div className="menu-recipe-variant">
      <h3>{dish.name}</h3>
      {dish.macros ? (
        <p className="modal-macros muted">КБЖУ {formatMacros(dish.macros)} на 100 г</p>
      ) : null}
      {recipe ? (
        <>
          {recipe.servings ? (
            <p className="muted">{formatServingsDisplay(dishId, recipe.servings, scale)}</p>
          ) : null}
          {sauceNote ? <p className="muted">{sauceNote}</p> : null}
          {ingredients && ingredients.length > 0 ? (
            <>
              <h4>Ингредиенты</h4>
              <ul className="ingredient-list">
                {ingredients.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </>
          ) : null}
          {recipe.steps ? (
            <>
              <h4>Как готовить</h4>
              <p className="steps">{recipe.steps}</p>
            </>
          ) : null}
          {recipe.storage ? (
            <>
              <h4>Хранение</h4>
              <p>{recipe.storage}</p>
            </>
          ) : null}
        </>
      ) : (
        <p className="muted">Рецепт пока не добавлен — можно дописать во вкладке «Книга».</p>
      )}
    </div>
  )
}

function RecipePeekModal({
  item,
  cookbook,
  scales,
  onClose,
}: {
  item: MenuDishRef
  cookbook: CookbookStore
  scales: Record<string, number>
  onClose: () => void
}) {
  const ids = menuRefIds(item)
  const sauce = item.daySauceId ? getDish(item.daySauceId) : undefined
  const sauceNote = sauce?.recipe
    ? `Соус: ${sauce.name}. ${sauce.recipe.steps}`
    : undefined

  return (
    <div className="modal-backdrop" onClick={onClose} role="presentation">
      <div className="modal" onClick={(e) => e.stopPropagation()} role="dialog">
        <div className="modal-header">
          <div>
            <h2>{dishLabel(item)}</h2>
            {ids.length > 1 ? (
              <p className="muted">На выбор один вариант маринада</p>
            ) : null}
          </div>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Закрыть">
            ×
          </button>
        </div>
        <div className="modal-body">
          {ids.map((id) => (
            <RecipeVariantBlock
              key={id}
              dishId={id}
              cookbook={cookbook}
              sauceNote={id === item.dishId ? sauceNote : undefined}
              scale={scales[id] ?? 1}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function DishRow({
  item,
  kind,
  mark,
  selected,
  fit,
  complete,
  planned,
  onToggleCooked,
  onTogglePlanned,
  onOpenRecipe,
  onSelect,
}: {
  item: MenuDishRef
  kind: 'main' | 'side'
  mark?: DishMark
  selected?: boolean
  fit?: PairFit | null
  complete?: boolean
  planned?: boolean
  onToggleCooked: (nextPrepared: boolean) => void
  onTogglePlanned: () => void
  onOpenRecipe: () => void
  onSelect?: () => void
}) {
  const fitClass = fit ? ` is-fit-${fit}` : ''
  const selectedClass = selected ? ' is-selected' : ''
  const cooked = mark === 'cooked' || mark === 'leftover'

  return (
    <li className={`menu-dish-row menu-dish-row--${kind}`}>
      <div className={`menu-dish-card${selectedClass}${fitClass}`}>
        <div className="menu-dish-card-head">
          <button
            type="button"
            className={`menu-recipe-link menu-recipe-link--${kind}`}
            onClick={() => {
              if (onSelect) onSelect()
              else onOpenRecipe()
            }}
          >
            <span className="menu-recipe-link-name">
              {dishLabel(item)}
              {complete ? <span className="menu-replaced-tag">цельное</span> : null}
            </span>
          </button>
          <button
            type="button"
            className="menu-recipe-open"
            onClick={onOpenRecipe}
            aria-label={`Рецепт: ${dishLabel(item)}`}
          >
            ›
          </button>
        </div>
        <div
          className="outcome-chips"
          role="group"
          aria-label={`${dishLabel(item)}: статус`}
        >
          {DISH_MARK_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              className={cooked ? 'outcome-chip is-active' : 'outcome-chip'}
              aria-pressed={cooked}
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                onToggleCooked(!cooked)
              }}
            >
              {opt.label}
            </button>
          ))}
          <button
            type="button"
            className={planned ? 'outcome-chip is-active' : 'outcome-chip'}
            aria-pressed={Boolean(planned)}
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onTogglePlanned()
            }}
          >
            Закупки
          </button>
        </div>
      </div>
    </li>
  )
}

type QueueDish = {
  key: string
  batch: CookBatchView
  item: MenuDishRef
  kind: 'main' | 'side'
  role: MenuRole
  index: number
  complete?: boolean
}

function uniqueByDishId(dishes: QueueDish[]): QueueDish[] {
  const seen = new Set<string>()
  const out: QueueDish[] = []
  for (const dish of dishes) {
    if (seen.has(dish.item.dishId)) continue
    seen.add(dish.item.dishId)
    out.push(dish)
  }
  return out
}

function queueColumns(queue: CookBatchView[]): { mains: QueueDish[]; sides: QueueDish[] } {
  const mains: QueueDish[] = []
  const sides: QueueDish[] = []
  for (const batch of queue) {
    const { slot } = batch
    if (slot.complete) {
      mains.push({
        key: `${batch.id}::${slot.complete.dishId}::complete`,
        batch,
        item: slot.complete,
        kind: 'main',
        role: 'complete',
        index: 0,
        complete: true,
      })
    }
    slot.mains.forEach((item, index) => {
      mains.push({
        key: `${batch.id}::${item.dishId}::mains::${index}`,
        batch,
        item,
        kind: 'main',
        role: 'mains',
        index,
      })
    })
    slot.sides.forEach((item, index) => {
      sides.push({
        key: `${batch.id}::${item.dishId}::sides::${index}`,
        batch,
        item,
        kind: 'side',
        role: 'sides',
        index,
      })
    })
  }
  return { mains: uniqueByDishId(mains), sides: uniqueByDishId(sides) }
}

const QUEUE_GROUP_ORDER = { cooking: 0, todo: 1, done: 2 } as const

function recencyKey(board: CookBoard, dishId: string, stats?: MealStatsStore): string {
  return lastCookedOnForDish(board, dishId, stats) ?? ''
}

function sortMains(mains: QueueDish[], board: CookBoard, stats?: MealStatsStore): QueueDish[] {
  return [...mains].sort((a, b) => {
    const aGroup = QUEUE_GROUP_ORDER[dishQueueGroup(board, a.item.dishId, stats)]
    const bGroup = QUEUE_GROUP_ORDER[dishQueueGroup(board, b.item.dishId, stats)]
    if (aGroup !== bGroup) return aGroup - bGroup
    return recencyKey(board, a.item.dishId, stats).localeCompare(
      recencyKey(board, b.item.dishId, stats),
    )
  })
}

function fitForSide(selected: QueueDish | null, side: QueueDish): PairFit | null {
  if (!selected) return null
  return pairFitForSide(
    {
      item: selected.item,
      slot: selected.batch.slot,
      complete: selected.complete,
    },
    { item: side.item },
  )
}

function sortSides(
  sides: QueueDish[],
  board: CookBoard,
  selected: QueueDish | null,
  stats?: MealStatsStore,
): QueueDish[] {
  return [...sides].sort((a, b) => {
    if (selected && !selected.complete) {
      const aTasty = fitForSide(selected, a) === 'good' ? 0 : 1
      const bTasty = fitForSide(selected, b) === 'good' ? 0 : 1
      if (aTasty !== bTasty) return aTasty - bTasty
    }
    return recencyKey(board, a.item.dishId, stats).localeCompare(
      recencyKey(board, b.item.dishId, stats),
    )
  })
}

function CookColumns({
  queue,
  board,
  stats,
  scales,
  selectedKey,
  onSelect,
  onBoardChange,
  onOpenRecipe,
}: {
  queue: CookBatchView[]
  board: CookBoard
  stats: MealStatsStore
  scales: Record<string, number>
  selectedKey: string | null
  onSelect: (dish: QueueDish) => void
  onBoardChange: (board: CookBoard | ((prev: CookBoard) => CookBoard)) => void
  onOpenRecipe: (item: MenuDishRef) => void
}) {
  const columns = useMemo(() => queueColumns(queue), [queue])
  const selected = columns.mains.find((d) => d.key === selectedKey) ?? null
  const mains = sortMains(columns.mains, board, stats)
  const sides = sortSides(columns.sides, board, selected, stats)

  function renderDish(dish: QueueDish) {
    const { batch, item, kind } = dish
    const mark = displayDishMarkForDish(board, item.dishId, stats)
    const markBatchId = batchIdForDish(board, item.dishId, batch.id)
    const markBatch = queue.find((b) => b.id === markBatchId) ?? batch
    const dishIds = slotPrimaryDishIds(markBatch.slot)
    const fit = kind === 'side' ? fitForSide(selected, dish) : null

    return (
      <DishRow
        key={dish.item.dishId}
        item={item}
        kind={kind}
        complete={dish.complete}
        mark={mark}
        planned={isDishPlanned(board, item.dishId)}
        selected={kind === 'main' && dish.key === selectedKey}
        fit={kind === 'side' ? fit : undefined}
        onToggleCooked={(nextPrepared) => {
          onBoardChange((current) =>
            setDishPrepared(
              current,
              batchIdForDish(current, item.dishId, batch.id),
              item.dishId,
              dishIds,
              nextPrepared,
              isoDate(),
              cookPortionsFromScale(scales[item.dishId]),
            ),
          )
          if (kind === 'main' && nextPrepared) onSelect(dish)
        }}
        onTogglePlanned={() => {
          onBoardChange((current) => toggleDishPlanned(current, item.dishId))
        }}
        onOpenRecipe={() => onOpenRecipe(item)}
        onSelect={kind === 'main' ? () => onSelect(dish) : undefined}
      />
    )
  }

  return (
    <div className="cook-columns">
      <section className="menu-dish-group menu-dish-group--main">
        <h4>Горячее</h4>
        <ul className="menu-slot-dishes">{mains.map(renderDish)}</ul>
      </section>
      <section className="menu-dish-group menu-dish-group--side">
        <h4>Гарнир</h4>
        <ul className="menu-slot-dishes">{sides.map(renderDish)}</ul>
      </section>
    </div>
  )
}

function FridgeBlock({
  board,
  cookbook,
  onBoardChange,
}: {
  board: CookBoard
  cookbook: CookbookStore
  onBoardChange: (board: CookBoard | ((prev: CookBoard) => CookBoard)) => void
}) {
  const fridge = board.fridge

  return (
    <section className="fridge-block">
      <h3 className="cook-queue-heading">Холодильник</h3>
      {fridge.length === 0 ? (
        <p className="fridge-empty">Пусто</p>
      ) : (
        <ul className="fridge-list">
        {fridge.map((dish) => (
          <li key={dish.key} className="fridge-row">
            <div className="fridge-row-text">
              <strong>
                {getCookbookDish(dish.dishId, cookbook)?.name ??
                  getDish(dish.dishId)?.name ??
                  dish.dishId}
              </strong>
            </div>
            <div className="fridge-step">
              <button
                type="button"
                className="fridge-step-btn"
                aria-label="Списать порцию"
                onClick={() => onBoardChange((current) => bumpFridgePortions(current, dish.key, -1))}
              >
                −
              </button>
              <span className="fridge-portions">{dish.remaining} пор.</span>
              <button
                type="button"
                className="fridge-step-btn"
                aria-label="Вернуть порцию"
                disabled={dish.remaining >= dish.cookedPortions}
                onClick={() =>
                  onBoardChange((current) => bumpFridgePortions(current, dish.key, 1))
                }
              >
                +
              </button>
            </div>
          </li>
        ))}
        </ul>
      )}
    </section>
  )
}

function NeedToBuyBlock({
  board,
  cookbook,
  scales,
  onBoardChange,
}: {
  board: CookBoard
  cookbook: CookbookStore
  scales: Record<string, number>
  onBoardChange: (board: CookBoard | ((prev: CookBoard) => CookBoard)) => void
}) {
  const lines = plannedShopNeeds(board, cookbook, scales)
  if (lines.length === 0) return null
  const names = plannedDishNames(board, cookbook)

  return (
    <section className="buy-block">
      <h3 className="cook-queue-heading">Нужно купить</h3>
      {names.length > 0 ? <p className="buy-dishes">{names.join(' · ')}</p> : null}
      <ul className="buy-list">
        {lines.map((line) => (
          <li key={line.key}>
            <label className="buy-row">
              <input
                type="checkbox"
                checked={false}
                onChange={() => onBoardChange((current) => markShopHave(current, line.key))}
              />
              <span>{line.text}</span>
            </label>
          </li>
        ))}
      </ul>
    </section>
  )
}

export function MenuTab() {
  const { state, setCookBoard } = useMenuSync()
  const [recipeItem, setRecipeItem] = useState<MenuDishRef | null>(null)
  const [selectedKey, setSelectedKey] = useState<string | null>(null)
  const overrides = state.menuOverrides
  const board = state.cookBoard
  const stats = state.mealStats
  const queue = useMemo(
    () => listCookQueue(board, overrides, stats),
    [board, overrides, stats],
  )
  const columns = useMemo(() => queueColumns(queue), [queue])
  const resolvedSelect =
    selectedKey && columns.mains.some((d) => d.key === selectedKey)
      ? selectedKey
      : (columns.mains.find(
          (d) => dishQueueGroup(board, d.item.dishId, stats) === 'cooking',
        )?.key ??
        columns.mains.find(
          (d) => dishQueueGroup(board, d.item.dishId, stats) === 'todo',
        )?.key ??
        columns.mains[0]?.key ??
        null)

  return (
    <section className="view">
      <FridgeBlock
        board={board}
        cookbook={state.cookbook}
        onBoardChange={setCookBoard}
      />
      <NeedToBuyBlock
        board={board}
        cookbook={state.cookbook}
        scales={state.portionScales ?? {}}
        onBoardChange={setCookBoard}
      />

      <div className="cook-plan">
        <CookColumns
          queue={queue}
          board={board}
          stats={stats}
          scales={state.portionScales ?? {}}
          selectedKey={resolvedSelect}
          onSelect={(dish) => setSelectedKey(dish.key)}
          onBoardChange={setCookBoard}
          onOpenRecipe={setRecipeItem}
        />
      </div>

      {recipeItem ? (
        <RecipePeekModal
          item={recipeItem}
          cookbook={state.cookbook}
          scales={state.portionScales ?? {}}
          onClose={() => setRecipeItem(null)}
        />
      ) : null}
    </section>
  )
}
