import { useMemo, useState } from 'react'
import {
  menuRefIds,
  menuRefLabel,
  cycleIndexOf,
  type MenuDishRef,
} from '../data/menu'
import { dishMeta, childEatsKind, isCompleteDish } from '../data/dishMeta'
import { getDish } from '../data/dishes'
import { formatMacros } from '../lib/macros'
import { getCookbookDish, getEffectiveRecipe, type CookbookStore } from '../data/cookbook'
import { isoDate, lastCookedCaption } from '../data/calendar'
import {
  batchIdForDish,
  bumpFridgePortions,
  cookPortionsFromScale,
  DISH_MARK_OPTIONS,
  displayDishMarkForDish,
  dishQueueGroup,
  fridgeDishKey,
  availableSideIdsForMain,
  isDishPlanned,
  lastCookedOnForDishes,
  listCookQueue,
  toggleShopHave,
  plannedSideForMain,
  setDishPrepared,
  setPlannedSide,
  slotPrimaryDishIds,
  toggleDishPlanned,
  type CookBatchView,
  type CookBoard,
  type DishMark,
} from '../data/cookBoard'
import { plannedDishNames, plannedShopNeeds } from '../data/cookShop'
import { applyPrepForDishCook, type PrepFreezer } from '../data/prep'
import { entryHasFrozenPrep, nextCookDishIds } from '../data/cycleQueue'
import { type MenuRole } from '../data/menuOverrides'
import { useMenuSync } from '../hooks/useMenuSync'
import { useEscapeKey } from '../hooks/useEscapeKey'
import type { MealStatsStore } from '../data/mealStats'
import { scaleIngredientLine } from '../lib/portionScale'
import { formatPortionYieldLine } from '../lib/recipeServings'
import { ChildEatsMark } from './ChildEatsMark'
import { RecipeStepsList } from './RecipeStepsList'

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
            <p className="muted">{formatPortionYieldLine(dishId, recipe.servings, scale)}</p>
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
              <RecipeStepsList steps={recipe.steps} />
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
  lastCooked,
  onClose,
}: {
  item: MenuDishRef
  cookbook: CookbookStore
  scales: Record<string, number>
  lastCooked?: string
  onClose: () => void
}) {
  useEscapeKey(onClose)
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
            <h2 className="menu-recipe-title">
              {dishLabel(item)}
              <ChildEatsMark dishId={item.dishId} />
            </h2>
            <p className="muted">{lastCookedCaption(lastCooked)}</p>
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

type SideOption = {
  id: string
  name: string
  lastCooked?: string
}

function SideOptionRow({
  name,
  lastCooked,
  picked,
  onPick,
  onOpenRecipe,
}: {
  name: string
  lastCooked?: string
  picked: boolean
  onPick: () => void
  onOpenRecipe?: () => void
}) {
  const pickedClass = picked ? ' is-picked' : ''
  return (
    <li className="menu-dish-row menu-dish-row--side">
      <div className={`menu-dish-card${pickedClass}`}>
        <div className="menu-dish-card-head">
          <button
            type="button"
            className="menu-recipe-link menu-recipe-link--side"
            onClick={onOpenRecipe ?? onPick}
          >
            <span className="menu-recipe-link-text">
              <span className="menu-recipe-link-name">{name}</span>
              {onOpenRecipe ? (
                <span className="menu-last-cooked">{lastCookedCaption(lastCooked)}</span>
              ) : null}
            </span>
          </button>
          {onOpenRecipe ? (
            <button
              type="button"
              className="menu-recipe-open"
              onClick={onOpenRecipe}
              aria-label={`Рецепт: ${name}`}
            >
              ›
            </button>
          ) : null}
        </div>
        <div className="outcome-chips" role="group" aria-label={`${name}: выбор`}>
          <button
            type="button"
            className={picked ? 'outcome-chip is-active' : 'outcome-chip'}
            aria-pressed={picked}
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onPick()
            }}
          >
            {picked ? 'Выбрано' : 'Выбрать'}
          </button>
        </div>
      </div>
    </li>
  )
}

function DishRow({
  item,
  mark,
  complete,
  planned,
  plannedSide,
  availableSides,
  isNext,
  lastCooked,
  onToggleCooked,
  onTogglePlanned,
  onPickSide,
  onOpenRecipe,
  onOpenSide,
}: {
  item: MenuDishRef
  mark?: DishMark
  complete?: boolean
  planned?: boolean
  plannedSide?: string | null
  availableSides: SideOption[]
  isNext?: boolean
  lastCooked?: string
  onToggleCooked: (nextPrepared: boolean) => void
  onTogglePlanned: () => void
  onPickSide: (sideId: string | null) => void
  onOpenRecipe: () => void
  onOpenSide: (item: MenuDishRef) => void
}) {
  const nextClass = isNext ? ' is-next' : ''
  const plannedClass = planned ? ' is-planned' : ''
  const cooked = mark === 'cooked' || mark === 'leftover'
  const childKind = childEatsKind(item.dishId)
  const childClass = childKind ? ` is-child-${childKind}` : ''

  return (
    <li className="menu-dish-row menu-dish-row--main">
      <div className={`menu-dish-card${plannedClass}${nextClass}${childClass}`}>
        <div className="menu-dish-card-head">
          <button
            type="button"
            className="menu-recipe-link menu-recipe-link--main"
            aria-pressed={Boolean(planned)}
            onClick={onTogglePlanned}
          >
            <span className="menu-recipe-link-text">
              <span className="menu-recipe-link-name">
                {dishLabel(item)}
                {complete ? <span className="menu-replaced-tag">цельное</span> : null}
                {isNext ? <span className="menu-replaced-tag">следующие</span> : null}
                <ChildEatsMark dishId={item.dishId} />
              </span>
              <span className="menu-last-cooked">{lastCookedCaption(lastCooked)}</span>
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
        </div>
        {planned && complete && availableSides.length === 0 ? (
          <p className="plan-sides-note">Цельное — отдельный гарнир не нужен</p>
        ) : null}
        {planned && (!complete || availableSides.length > 0) ? (
          <div className="plan-sides">
            <h4>Гарнир</h4>
            <ul className="menu-slot-dishes plan-sides-list">
              {availableSides.map((side) => (
                <SideOptionRow
                  key={side.id}
                  name={side.name}
                  lastCooked={side.lastCooked}
                  picked={plannedSide === side.id}
                  onPick={() => onPickSide(side.id)}
                  onOpenRecipe={() => onOpenSide({ dishId: side.id })}
                />
              ))}
              <SideOptionRow
                name="Без гарнира"
                picked={plannedSide === null}
                onPick={() => onPickSide(null)}
              />
            </ul>
          </div>
        ) : null}
      </div>
    </li>
  )
}

type QueueDish = {
  key: string
  batch: CookBatchView
  item: MenuDishRef
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

function queueMains(queue: CookBatchView[]): QueueDish[] {
  const mains: QueueDish[] = []
  for (const batch of queue) {
    const { slot } = batch
    if (slot.complete) {
      mains.push({
        key: `${batch.id}::${slot.complete.dishId}::complete`,
        batch,
        item: slot.complete,
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
        role: 'mains',
        index,
        complete: dishMeta[item.dishId]?.kind === 'complete' || isCompleteDish(item.dishId),
      })
    })
  }
  return uniqueByDishId(mains)
}

function sortMains(
  mains: QueueDish[],
  board: CookBoard,
  stats: MealStatsStore | undefined,
  freezer: PrepFreezer,
  nextIds: Set<string>,
): QueueDish[] {
  const rank = (dish: QueueDish) => {
    if (menuRefIds(dish.item).some((id) => nextIds.has(id))) return 0
    if (dishQueueGroup(board, dish.item.dishId, stats) === 'cooking') return 1
    if (entryHasFrozenPrep(freezer, dish.item)) return 2
    return 3
  }
  return [...mains].sort((a, b) => {
    const ar = rank(a)
    const br = rank(b)
    if (ar !== br) return ar - br
    const ai = cycleIndexOf(a.item.dishId)
    const bi = cycleIndexOf(b.item.dishId)
    return (ai < 0 ? 999 : ai) - (bi < 0 ? 999 : bi)
  })
}

function sideLabel(sideId: string, cookbook: CookbookStore): string {
  return getCookbookDish(sideId, cookbook)?.name ?? getDish(sideId)?.name ?? sideId
}

function CookList({
  queue,
  board,
  stats,
  freezer,
  cookbook,
  nextIds,
  onBoardChange,
  onDishPrepared,
  onOpenRecipe,
}: {
  queue: CookBatchView[]
  board: CookBoard
  stats: MealStatsStore
  freezer: PrepFreezer
  cookbook: CookbookStore
  nextIds: Set<string>
  onBoardChange: (board: CookBoard | ((prev: CookBoard) => CookBoard)) => void
  onDishPrepared: (dish: QueueDish, nextPrepared: boolean, dishIds: string[]) => void
  onOpenRecipe: (item: MenuDishRef) => void
}) {
  const mains = useMemo(
    () => sortMains(queueMains(queue), board, stats, freezer, nextIds),
    [queue, board, stats, freezer, nextIds],
  )

  return (
    <section className="menu-dish-group menu-dish-group--main">
      <h4>Выбрать блюдо</h4>
      <ul className="menu-slot-dishes">
        {mains.map((dish) => {
          const { batch, item } = dish
          const mark = displayDishMarkForDish(board, item.dishId, stats)
          const markBatchId = batchIdForDish(board, item.dishId, batch.id)
          const markBatch = queue.find((b) => b.id === markBatchId) ?? batch
          const dishIds = slotPrimaryDishIds(markBatch.slot)
          const planned = isDishPlanned(board, item.dishId)
          const complete = Boolean(dish.complete)
          const availableSides = planned
            ? availableSideIdsForMain(board, item.dishId).map((id) => ({
                id,
                name: sideLabel(id, cookbook),
                lastCooked: lastCookedOnForDishes(board, [id], stats),
              }))
            : []

          return (
            <DishRow
              key={dish.item.dishId}
              item={item}
              complete={complete}
              mark={mark}
              planned={planned}
              plannedSide={planned ? plannedSideForMain(board, item.dishId) : undefined}
              availableSides={availableSides}
              isNext={menuRefIds(item).some((id) => nextIds.has(id))}
              lastCooked={lastCookedOnForDishes(board, menuRefIds(item), stats)}
              onToggleCooked={(nextPrepared) => {
                onDishPrepared(dish, nextPrepared, dishIds)
              }}
              onTogglePlanned={() => {
                onBoardChange((current) => toggleDishPlanned(current, item.dishId))
              }}
              onPickSide={(sideId) => {
                onBoardChange((current) => setPlannedSide(current, item.dishId, sideId))
              }}
              onOpenRecipe={() => onOpenRecipe(item)}
              onOpenSide={onOpenRecipe}
            />
          )
        })}
      </ul>
    </section>
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
              <span className="menu-last-cooked">{lastCookedCaption(dish.cookedOn)}</span>
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
  const names = plannedDishNames(board, cookbook)
  if (names.length === 0) return null
  const lines = plannedShopNeeds(board, cookbook, scales)

  return (
    <section className="buy-block">
      <h3 className="cook-queue-heading">Нужно купить</h3>
      <p className="buy-dishes">{names.join(' · ')}</p>
      {lines.length === 0 ? (
        <p className="buy-empty muted">Ничего покупать не нужно</p>
      ) : (
        <ul className="buy-list">
          {lines.map((line) => (
            <li key={line.key}>
              <label className={line.have ? 'buy-row is-have' : 'buy-row'}>
                <input
                  type="checkbox"
                  checked={line.have}
                  onChange={() => onBoardChange((current) => toggleShopHave(current, line.key))}
                />
                <span>{line.text}</span>
              </label>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export function MenuTab() {
  const { state, setCookBoard, patchState } = useMenuSync()
  const [recipeItem, setRecipeItem] = useState<MenuDishRef | null>(null)
  const overrides = state.menuOverrides
  const board = state.cookBoard
  const stats = state.mealStats
  const freezer = state.freezerStock
  const nextIds = useMemo(
    () => nextCookDishIds(board, stats, freezer),
    [board, stats, freezer],
  )
  const queue = useMemo(
    () => listCookQueue(board, overrides, stats),
    [board, overrides, stats],
  )

  return (
    <section className="view">
      <FridgeBlock
        board={board}
        cookbook={state.cookbook}
        onBoardChange={setCookBoard}
      />

      <div className="cook-plan">
        <NeedToBuyBlock
          board={board}
          cookbook={state.cookbook}
          scales={state.portionScales ?? {}}
          onBoardChange={setCookBoard}
        />
        <CookList
          queue={queue}
          board={board}
          stats={stats}
          freezer={freezer}
          cookbook={state.cookbook}
          nextIds={nextIds}
          onBoardChange={setCookBoard}
          onDishPrepared={(dish, nextPrepared, dishIds) => {
            patchState((prev) => {
              const wasCooking =
                dishQueueGroup(prev.cookBoard, dish.item.dishId) === 'cooking'
              if (nextPrepared === wasCooking) return prev
              const batchId = batchIdForDish(
                prev.cookBoard,
                dish.item.dishId,
                dish.batch.id,
              )
              const nextBoard = setDishPrepared(
                prev.cookBoard,
                batchId,
                dish.item.dishId,
                dishIds,
                nextPrepared,
                isoDate(),
                cookPortionsFromScale(
                  dish.item.dishId,
                  state.portionScales?.[dish.item.dishId],
                ),
              )
              const moved = applyPrepForDishCook(
                prev.freezerStock,
                prev.cookBoard.prepTaken ?? {},
                fridgeDishKey(batchId, dish.item.dishId),
                dish.item.dishId,
                nextPrepared,
              )
              return {
                ...prev,
                cookBoard: { ...nextBoard, prepTaken: moved.taken },
                freezerStock: moved.freezer,
              }
            })
          }}
          onOpenRecipe={setRecipeItem}
        />
      </div>

      {recipeItem ? (
        <RecipePeekModal
          item={recipeItem}
          cookbook={state.cookbook}
          scales={state.portionScales ?? {}}
          lastCooked={lastCookedOnForDishes(board, menuRefIds(recipeItem), stats)}
          onClose={() => setRecipeItem(null)}
        />
      ) : null}
    </section>
  )
}
