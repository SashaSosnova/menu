import { useMemo, useState } from 'react'
import {
  menuRefIds,
  menuRefLabel,
  type MenuDishRef,
} from '../data/menu'
import { compareByOldestCooked, nextCookDishIds, recommendCookPlan, type CookPlanItem } from '../data/cycleQueue'
import { dishMeta, childEatsKind, isCompleteDish, matchingSideIds } from '../data/dishMeta'
import { getDish } from '../data/dishes'
import { formatMacros } from '../lib/macros'
import { getCookbookDish, getEffectiveRecipe, type CookbookStore } from '../data/cookbook'
import { fridgeAgeCaption, isoDate, lastCookedCaption } from '../data/calendar'
import {
  batchIdForDish,
  bumpFridgePortions,
  cookPortionsFromScale,
  displayDishMarkForDish,
  dishQueueGroup,
  fridgeDishKey,
  availableSideIdsForMain,
  isDishPlanned,
  lastCookedOnForDishes,
  listCookQueue,
  toggleShopHave,
  plannedSideForMain,
  discardFridgeDish,
  setFridgeSide,
  setDishPrepared,
  setDishPlanned,
  setPlannedSide,
  slotPrimaryDishIds,
  type CookBatchView,
  type CookBoard,
  type DishMark,
  type FridgeDish,
} from '../data/cookBoard'
import { plannedShopGroups } from '../data/cookShop'
import { applyPrepForDishCook } from '../data/prep'
import { type MenuRole } from '../data/menuOverrides'
import { useMenuSync } from '../hooks/useMenuSync'
import { useEscapeKey } from '../hooks/useEscapeKey'
import type { MealStatsStore } from '../data/mealStats'
import { scaleIngredientLine } from '../lib/portionScale'
import { formatPortionYieldLine } from '../lib/recipeServings'
import { ChildEatsMark } from './ChildEatsMark'
import { RecipeStepsList } from './RecipeStepsList'
import { SwipeActions } from './SwipeActions'

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

function sideChipLabel(
  plannedSide: string | null | undefined,
  availableSides: SideOption[],
): string {
  if (typeof plannedSide !== 'string') return 'Без гарнира'
  return availableSides.find((side) => side.id === plannedSide)?.name ?? plannedSide
}

function SidePickerList({
  options,
  selectedId,
  onPick,
  onOpenSide,
}: {
  options: SideOption[]
  selectedId?: string | null
  onPick: (sideId: string | null) => void
  onOpenSide?: (sideId: string) => void
}) {
  return (
    <ul className="side-picker">
      {options.map((side) => (
        <li key={side.id}>
          <button
            type="button"
            className={
              selectedId === side.id ? 'side-picker-btn is-picked' : 'side-picker-btn'
            }
            onClick={() => onPick(side.id)}
          >
            <span className="side-picker-name">{side.name}</span>
            <span className="menu-last-cooked">{lastCookedCaption(side.lastCooked)}</span>
          </button>
          {onOpenSide ? (
            <button
              type="button"
              className="menu-recipe-open"
              onClick={() => onOpenSide(side.id)}
              aria-label={`Рецепт: ${side.name}`}
            >
              ›
            </button>
          ) : null}
        </li>
      ))}
      <li>
        <button
          type="button"
          className={
            selectedId == null || selectedId === ''
              ? 'side-picker-btn is-picked'
              : 'side-picker-btn'
          }
          onClick={() => onPick(null)}
        >
          <span className="side-picker-name">Без гарнира</span>
        </button>
      </li>
    </ul>
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
  preview = false,
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
  preview?: boolean
}) {
  const [sideOpen, setSideOpen] = useState(false)
  const nextClass = isNext ? ' is-next' : ''
  const plannedClass = planned ? ' is-planned' : ''
  const cooked = mark === 'cooked' || mark === 'leftover'
  const childKind = childEatsKind(item.dishId)
  const childClass = childKind ? ` is-child-${childKind}` : ''
  const canHaveSide = availableSides.length > 0
  const showSideChip = Boolean((planned || preview) && canHaveSide)
  const sideLabelText = sideChipLabel(plannedSide, availableSides)
  const sidePicked = typeof plannedSide === 'string'

  return (
    <li className="menu-dish-row menu-dish-row--main">
      <SwipeActions
        left={{
          label: planned ? 'Из плана' : 'В план',
          tone: 'plan',
          onClick: onTogglePlanned,
        }}
        right={{
          label: cooked ? 'Не готово' : 'Готово',
          tone: 'ok',
          onClick: () => onToggleCooked(!cooked),
        }}
      >
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
                  <ChildEatsMark dishId={item.dishId} />
                </span>
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
            <span className="menu-last-cooked">{lastCookedCaption(lastCooked)}</span>
            {showSideChip ? (
              <button
                type="button"
                className={sidePicked ? 'outcome-chip is-side is-active' : 'outcome-chip is-side'}
                aria-expanded={sideOpen}
                aria-label={sidePicked ? `Гарнир: ${sideLabelText}` : 'Без гарнира'}
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setSideOpen((open) => !open)
                }}
              >
                {sideLabelText}
              </button>
            ) : null}
          </div>
          {showSideChip && sideOpen ? (
            <SidePickerList
              options={availableSides}
              selectedId={plannedSide}
              onPick={(sideId) => {
                onPickSide(sideId)
                setSideOpen(false)
              }}
              onOpenSide={(sideId) => onOpenSide({ dishId: sideId })}
            />
          ) : null}
        </div>
      </SwipeActions>
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
): QueueDish[] {
  const plannedIds = board.plannedDishIds ?? []
  const plannedSet = new Set(plannedIds)
  const isPlannedRow = (dish: QueueDish) =>
    menuRefIds(dish.item).some((id) => plannedSet.has(id))
  const planned = plannedIds
    .map((id) => mains.find((dish) => menuRefIds(dish.item).includes(id)))
    .filter((dish): dish is QueueDish => Boolean(dish))
  const catalog = mains
    .filter((dish) => !isPlannedRow(dish))
    .sort((a, b) => compareByOldestCooked(a.item, b.item, board, stats))
  return [...planned, ...catalog]
}

function sideLabel(sideId: string, cookbook: CookbookStore): string {
  return getCookbookDish(sideId, cookbook)?.name ?? getDish(sideId)?.name ?? sideId
}

function MainDishItem({
  dish,
  queue,
  board,
  stats,
  cookbook,
  nextIds,
  showNextTag,
  suggestedSide,
  preview = false,
  onBoardChange,
  onDishPrepared,
  onOpenRecipe,
}: {
  dish: QueueDish
  queue: CookBatchView[]
  board: CookBoard
  stats: MealStatsStore
  cookbook: CookbookStore
  nextIds: Set<string>
  showNextTag: boolean
  suggestedSide?: string
  preview?: boolean
  onBoardChange: (board: CookBoard | ((prev: CookBoard) => CookBoard)) => void
  onDishPrepared: (dish: QueueDish, nextPrepared: boolean, dishIds: string[]) => void
  onOpenRecipe: (item: MenuDishRef) => void
}) {
  const { batch, item } = dish
  const mark = displayDishMarkForDish(board, item.dishId, stats)
  const markBatchId = batchIdForDish(board, item.dishId, batch.id)
  const markBatch = queue.find((b) => b.id === markBatchId) ?? batch
  const dishIds = slotPrimaryDishIds(markBatch.slot)
  const planned = isDishPlanned(board, item.dishId)
  const complete = Boolean(dish.complete)
  const sideId = planned ? plannedSideForMain(board, item.dishId) : suggestedSide
  const availableSides = (() => {
    if (!planned && !preview) return []
    const ids = availableSideIdsForMain(board, item.dishId)
    if (typeof sideId === 'string' && !ids.includes(sideId)) ids.unshift(sideId)
    return ids.map((id) => ({
      id,
      name: sideLabel(id, cookbook),
      lastCooked: lastCookedOnForDishes(board, [id], stats),
    }))
  })()

  return (
    <DishRow
      item={item}
      complete={complete}
      mark={mark}
      planned={planned}
      preview={preview}
      plannedSide={sideId}
      availableSides={availableSides}
      isNext={showNextTag && menuRefIds(item).some((id) => nextIds.has(id))}
      lastCooked={lastCookedOnForDishes(board, menuRefIds(item), stats)}
      onToggleCooked={(nextPrepared) => {
        onDishPrepared(dish, nextPrepared, dishIds)
      }}
      onTogglePlanned={() => {
        onBoardChange((current) => {
          const next = setDishPlanned(current, item.dishId, !planned)
          if (!planned && suggestedSide) {
            return setPlannedSide(next, item.dishId, suggestedSide)
          }
          return next
        })
      }}
      onPickSide={(pickedSide) => {
        onBoardChange((current) => {
          const next = planned
            ? current
            : setDishPlanned(current, item.dishId, true)
          return setPlannedSide(next, item.dishId, pickedSide)
        })
      }}
      onOpenRecipe={() => onOpenRecipe(item)}
      onOpenSide={onOpenRecipe}
    />
  )
}

function mainForRef(mains: QueueDish[], item: MenuDishRef): QueueDish | undefined {
  const ids = new Set(menuRefIds(item))
  return mains.find((dish) => menuRefIds(dish.item).some((id) => ids.has(id)))
}

function CookList({
  queue,
  board,
  stats,
  cookbook,
  nextIds,
  recommendedItems = [],
  scales,
  onBoardChange,
  onDishPrepared,
  onOpenRecipe,
}: {
  queue: CookBatchView[]
  board: CookBoard
  stats: MealStatsStore
  cookbook: CookbookStore
  nextIds: Set<string>
  recommendedItems: CookPlanItem[]
  scales: Record<string, number>
  onBoardChange: (board: CookBoard | ((prev: CookBoard) => CookBoard)) => void
  onDishPrepared: (dish: QueueDish, nextPrepared: boolean, dishIds: string[]) => void
  onOpenRecipe: (item: MenuDishRef) => void
}) {
  const mains = useMemo(
    () => sortMains(queueMains(queue), board, stats),
    [queue, board, stats],
  )
  const plannedIds = board.plannedDishIds ?? []
  const plannedSet = new Set(plannedIds)
  const isPlannedRow = (dish: QueueDish) =>
    menuRefIds(dish.item).some((id) => plannedSet.has(id))
  const byId = new Map(mains.map((dish) => [dish.item.dishId, dish]))
  const upcoming = plannedIds
    .map((id) => mains.find((dish) => menuRefIds(dish.item).includes(id)) ?? byId.get(id))
    .filter((dish): dish is QueueDish => Boolean(dish))
    .filter((dish, i, arr) => arr.findIndex((d) => dish.item.dishId === d.item.dishId) === i)
  const recommended = recommendedItems.flatMap((plan) => {
    const dish = mainForRef(mains, plan.item)
    return dish ? [{ dish, sideId: plan.sideId }] : []
  })
  const recommendedKeys = new Set(recommended.map((row) => row.dish.item.dishId))
  const catalog = mains.filter(
    (dish) => !isPlannedRow(dish) && !recommendedKeys.has(dish.item.dishId),
  )

  const rowProps = {
    queue,
    board,
    stats,
    cookbook,
    nextIds,
    onBoardChange,
    onDishPrepared,
    onOpenRecipe,
  }

  return (
    <>
      {recommended.length > 0 ? (
        <section className="recommended-cook">
          <h3 className="cook-queue-heading">Рекомендуемый план готовки</h3>
          <ul className="menu-slot-dishes">
            {recommended.map((row) => (
              <MainDishItem
                key={row.dish.item.dishId}
                dish={row.dish}
                showNextTag
                preview
                suggestedSide={row.sideId}
                {...rowProps}
              />
            ))}
          </ul>
        </section>
      ) : null}

      {upcoming.length > 0 ? (
        <section className="upcoming-cook">
          <h3 className="cook-queue-heading">Ближайшая готовка</h3>
          <ul className="menu-slot-dishes">
            {upcoming.map((dish) => (
              <MainDishItem
                key={dish.item.dishId}
                dish={dish}
                showNextTag={false}
                {...rowProps}
              />
            ))}
          </ul>
        </section>
      ) : null}

      <NeedToBuyBlock
        board={board}
        cookbook={cookbook}
        scales={scales}
        onBoardChange={onBoardChange}
      />

      <section className="menu-dish-group menu-dish-group--main">
        <h4>Выбрать блюдо</h4>
        <ul className="menu-slot-dishes">
          {catalog.map((dish) => (
            <MainDishItem
              key={dish.item.dishId}
              dish={dish}
              showNextTag={false}
              {...rowProps}
            />
          ))}
        </ul>
      </section>
    </>
  )
}

function FridgeRow({
  dish,
  dishName,
  selectedSide,
  availableSides,
  onBoardChange,
  onDiscard,
  onPickSide,
}: {
  dish: FridgeDish
  dishName: string
  selectedSide?: string
  availableSides: SideOption[]
  onBoardChange: (board: CookBoard | ((prev: CookBoard) => CookBoard)) => void
  onDiscard: (key: string) => void
  onPickSide: (sideId: string | null) => void
}) {
  const [sideOpen, setSideOpen] = useState(false)
  const canHaveSide = availableSides.length > 0
  const sideLabelText = sideChipLabel(selectedSide, availableSides)
  const sidePicked = typeof selectedSide === 'string'
  const age = fridgeAgeCaption(dish.cookedOn)

  return (
    <li>
      <SwipeActions
        right={{
          label: 'Удалить',
          tone: 'danger',
          onClick: () => onDiscard(dish.key),
        }}
      >
        <div className="fridge-row">
          <div className="fridge-row-dish">
            <strong className="fridge-row-name">{dishName}</strong>
            {age ? <span className="fridge-row-age">{age}</span> : null}
            {canHaveSide ? (
              <button
                type="button"
                className={sidePicked ? 'outcome-chip is-side is-active' : 'outcome-chip is-side'}
                aria-expanded={sideOpen}
                aria-label={sidePicked ? `Гарнир: ${sideLabelText}` : 'Без гарнира'}
                onClick={() => setSideOpen((open) => !open)}
              >
                {sideLabelText}
              </button>
            ) : null}
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
              onClick={() => onBoardChange((current) => bumpFridgePortions(current, dish.key, 1))}
            >
              +
            </button>
          </div>
          {canHaveSide && sideOpen ? (
            <SidePickerList
              options={availableSides}
              selectedId={selectedSide}
              onPick={(sideId) => {
                onPickSide(sideId)
                setSideOpen(false)
              }}
            />
          ) : null}
        </div>
      </SwipeActions>
    </li>
  )
}

function FridgeBlock({
  board,
  cookbook,
  onBoardChange,
  onDiscard,
  onSetSide,
}: {
  board: CookBoard
  cookbook: CookbookStore
  onBoardChange: (board: CookBoard | ((prev: CookBoard) => CookBoard)) => void
  onDiscard: (key: string) => void
  onSetSide: (mainKey: string, sideId: string | null) => void
}) {
  const fridge = board.fridge
  const fridgeIds = new Set(fridge.filter((d) => d.remaining > 0).map((d) => d.dishId))

  return (
    <section className="fridge-block">
      <h3 className="cook-queue-heading">Холодильник</h3>
      {fridge.length === 0 ? (
        <p className="fridge-empty">Пусто</p>
      ) : (
        <ul className="fridge-list">
          {fridge.map((dish) => {
            const isSide = dishMeta[dish.dishId]?.kind === 'side'
            const matching = isSide ? [] : matchingSideIds(dish.dishId)
            const selectedSide =
              typeof dish.cookedWith === 'string' && matching.includes(dish.cookedWith)
                ? dish.cookedWith
                : matching.find((id) => fridgeIds.has(id))
            return (
              <FridgeRow
                key={dish.key}
                dish={dish}
                dishName={
                  getCookbookDish(dish.dishId, cookbook)?.name ??
                  getDish(dish.dishId)?.name ??
                  dish.dishId
                }
                selectedSide={selectedSide}
                availableSides={matching.map((id) => ({
                  id,
                  name: sideLabel(id, cookbook),
                  lastCooked: board.lastCookedOn?.[id],
                }))}
                onBoardChange={onBoardChange}
                onDiscard={onDiscard}
                onPickSide={(sideId) => onSetSide(dish.key, sideId)}
              />
            )
          })}
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
  const groups = plannedShopGroups(board, cookbook, scales)
  if (groups.length === 0) return null
  const nothing = groups.every((group) => group.lines.length === 0)

  return (
    <section className="buy-block">
      <h3 className="cook-queue-heading">Нужно купить</h3>
      {groups.map((group) => (
        <div key={group.key} className="buy-group">
          <p className="buy-dishes">{group.names.join(' · ')}</p>
          {group.lines.length === 0 ? null : (
            <ul className="buy-list">
              {group.lines.map((line) => (
                <li key={line.key}>
                  <label className={line.have ? 'buy-row is-have' : 'buy-row'}>
                    <input
                      type="checkbox"
                      checked={line.have}
                      onChange={() =>
                        onBoardChange((current) => toggleShopHave(current, line.key))
                      }
                    />
                    <span>{line.text}</span>
                  </label>
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
      {nothing ? <p className="buy-empty muted">Ничего покупать не нужно</p> : null}
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
  const recommendedItems = useMemo(
    () => recommendCookPlan(board, stats, freezer),
    [board, stats, freezer],
  )
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
        onDiscard={(key) => {
          patchState((prev) => {
            const dish = prev.cookBoard.fridge.find((row) => row.key === key)
            if (!dish) return prev
            const restored = applyPrepForDishCook(
              prev.freezerStock,
              prev.cookBoard.prepTaken ?? {},
              key,
              dish.dishId,
              false,
            )
            return {
              ...prev,
              cookBoard: discardFridgeDish(
                { ...prev.cookBoard, prepTaken: restored.taken },
                key,
              ),
              freezerStock: restored.freezer,
            }
          })
        }}
        onSetSide={(mainKey, sideId) => {
          setCookBoard((current) => setFridgeSide(current, mainKey, sideId))
        }}
      />

      <div className="cook-plan">
        <CookList
          queue={queue}
          board={board}
          stats={stats}
          cookbook={state.cookbook}
          nextIds={nextIds}
          recommendedItems={recommendedItems}
          scales={state.portionScales ?? {}}
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
