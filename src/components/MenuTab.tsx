import { useState } from 'react'
import { weekNumbers } from '../data/weeks'
import {
  getWeekMenu,
  menuRefIds,
  menuRefLabel,
  type MenuDishRef,
  type MenuSlot,
} from '../data/menu'
import { getDish } from '../data/dishes'
import { formatMacros } from '../lib/macros'
import { getCookbookDish, getEffectiveRecipe, type CookbookStore } from '../data/cookbook'
import {
  PORTION_OUTCOME_OPTIONS,
  slotStatKey,
  type MealStatsStore,
  type PortionOutcome,
  type SlotStat,
} from '../data/mealStats'
import { slotRangeLabel, weekRangeLabel } from '../data/calendar'
import { useMenuSync } from '../hooks/useMenuSync'
import { formatServingsDisplay } from '../lib/recipeServings'

function dishLabel(item: MenuDishRef): string {
  return menuRefLabel(item, (id) => getDish(id)?.name)
}

function RecipeVariantBlock({
  dishId,
  cookbook,
  sauceNote,
}: {
  dishId: string
  cookbook: CookbookStore
  sauceNote?: string
}) {
  const dish = getCookbookDish(dishId, cookbook) ?? getDish(dishId)
  const recipe = getEffectiveRecipe(dishId, cookbook)
  if (!dish) return null

  return (
    <div className="menu-recipe-variant">
      <h3>{dish.name}</h3>
      {dish.macros ? (
        <p className="modal-macros muted">КБЖУ {formatMacros(dish.macros)} на 100 г</p>
      ) : null}
      {recipe ? (
        <>
          {recipe.servings ? (
            <p className="muted">{formatServingsDisplay(dishId, recipe.servings)}</p>
          ) : null}
          {sauceNote ? <p className="muted">{sauceNote}</p> : null}
          {recipe.ingredients.length > 0 ? (
            <>
              <h4>Ингредиенты</h4>
              <ul className="ingredient-list">
                {recipe.ingredients.map((line) => (
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
  onClose,
}: {
  item: MenuDishRef
  cookbook: CookbookStore
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
  portions,
  outcome,
  onOutcome,
  onOpenRecipe,
}: {
  item: MenuDishRef
  kind: 'main' | 'side'
  portions: string
  outcome?: PortionOutcome
  onOutcome: (value: PortionOutcome) => void
  onOpenRecipe: () => void
}) {
  return (
    <li className={`menu-dish-row menu-dish-row--${kind}`}>
      <div className="menu-dish-card">
        <button
          type="button"
          className={`menu-recipe-link menu-recipe-link--${kind}`}
          onClick={onOpenRecipe}
        >
          <span className="menu-recipe-link-name">{dishLabel(item)}</span>
          <span className="menu-recipe-link-tail">
            <span className="menu-recipe-link-portions">{portions}</span>
            <span className="menu-recipe-link-arrow" aria-hidden>
              ›
            </span>
          </span>
        </button>
        <div className="outcome-chips" role="group" aria-label={`Итог: ${dishLabel(item)}`}>
          {PORTION_OUTCOME_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              className={outcome === opt.id ? 'outcome-chip is-active' : 'outcome-chip'}
              onClick={() => onOutcome(opt.id)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </li>
  )
}

function SlotCard({
  week,
  slot,
  store,
  onStatsChange,
  onOpenRecipe,
}: {
  week: number
  slot: MenuSlot
  store: MealStatsStore
  onStatsChange: (store: MealStatsStore) => void
  onOpenRecipe: (item: MenuDishRef) => void
}) {
  const key = slotStatKey(week, slot.id)
  const slotStat: SlotStat = store[key] ?? { dishes: {} }

  function setOutcome(dishId: string, outcome: PortionOutcome) {
    const prev = slotStat.dishes[dishId]?.outcome
    const nextOutcome = prev === outcome ? undefined : outcome
    onStatsChange({
      ...store,
      [key]: {
        dishes: {
          ...slotStat.dishes,
          [dishId]: nextOutcome ? { outcome: nextOutcome } : {},
        },
      },
    })
  }

  function renderDish(item: MenuDishRef, kind: 'main' | 'side', portions = '6 пор.') {
    return (
      <DishRow
        key={item.dishId + (item.label ?? '')}
        item={item}
        kind={kind}
        portions={portions}
        outcome={slotStat.dishes[item.dishId]?.outcome}
        onOutcome={(value) => setOutcome(item.dishId, value)}
        onOpenRecipe={() => onOpenRecipe(item)}
      />
    )
  }

  return (
    <details className="cook-task" open>
      <summary className="cook-task-summary">
        <span className="cook-task-text">
          <strong>{slotRangeLabel(week, slot.id)}</strong>
        </span>
      </summary>
      <div className="cook-task-body">
        <div className="batch-lists menu-batch-lists">
          <section className="menu-dish-group menu-dish-group--main">
            <h4>Горячее</h4>
            <ul className="menu-slot-dishes">
              {slot.complete ? renderDish(slot.complete, 'main') : null}
              {slot.mains.map((m) => renderDish(m, 'main'))}
            </ul>
          </section>
          {slot.sides.length > 0 ? (
            <section className="menu-dish-group menu-dish-group--side">
              <h4>Гарнир</h4>
              <ul className="menu-slot-dishes">
                {slot.sides.map((s) => renderDish(s, 'side'))}
              </ul>
            </section>
          ) : null}
        </div>
      </div>
    </details>
  )
}

export function MenuTab() {
  const { state, setMealStats } = useMenuSync()
  const [weekNumber, setWeekNumber] = useState(1)
  const [recipeItem, setRecipeItem] = useState<MenuDishRef | null>(null)
  const stats = state.mealStats
  const menu = getWeekMenu(weekNumber)

  return (
    <section className="view">
      <div className="week-tabs menu-week-tabs" role="tablist" aria-label="Недели">
        {weekNumbers.map((w) => (
          <button
            key={w}
            type="button"
            role="tab"
            aria-selected={w === weekNumber}
            className={w === weekNumber ? 'week-tab is-active' : 'week-tab'}
            onClick={() => setWeekNumber(w)}
          >
            {weekRangeLabel(w)}
          </button>
        ))}
      </div>

      <div className="cook-plan">
        {menu.slots.map((slot) => (
          <SlotCard
            key={slot.id}
            week={weekNumber}
            slot={slot}
            store={stats}
            onStatsChange={setMealStats}
            onOpenRecipe={setRecipeItem}
          />
        ))}
      </div>

      {recipeItem ? (
        <RecipePeekModal
          item={recipeItem}
          cookbook={state.cookbook}
          onClose={() => setRecipeItem(null)}
        />
      ) : null}
    </section>
  )
}
