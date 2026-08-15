import { useMemo, useState } from 'react'
import { weekNumbers } from '../data/weeks'
import {
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
import { getCurrentWeekNumber, cycleRangeLabel, slotRangeLabel, weekRangeLabel } from '../data/calendar'
import {
  getEffectiveWeekMenu,
  isPositionOverridden,
  resetWeekOverrides,
  weekHasOverrides,
  type MenuOverrides,
  type MenuRole,
} from '../data/menuOverrides'
import { useMenuSync } from '../hooks/useMenuSync'
import { scaleIngredientLine } from '../lib/portionScale'
import { formatServingsDisplay } from '../lib/recipeServings'
import { ReplaceDishModal, type ReplaceTarget } from './ReplaceDishModal'

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
  portions,
  outcome,
  replaced,
  onOutcome,
  onOpenRecipe,
  onReplace,
}: {
  item: MenuDishRef
  kind: 'main' | 'side'
  portions: string
  outcome?: PortionOutcome
  replaced?: boolean
  onOutcome: (value: PortionOutcome) => void
  onOpenRecipe: () => void
  onReplace: () => void
}) {
  return (
    <li className={`menu-dish-row menu-dish-row--${kind}`}>
      <div className="menu-dish-card">
        <div className="menu-dish-card-head">
          <button
            type="button"
            className={`menu-recipe-link menu-recipe-link--${kind}`}
            onClick={onOpenRecipe}
          >
            <span className="menu-recipe-link-name">
              {dishLabel(item)}
              {replaced ? <span className="menu-replaced-tag">заменено</span> : null}
            </span>
            <span className="menu-recipe-link-tail">
              <span className="menu-recipe-link-portions">{portions}</span>
              <span className="menu-recipe-link-arrow" aria-hidden>
                ›
              </span>
            </span>
          </button>
          <button
            type="button"
            className="menu-swap-btn no-print"
            onClick={onReplace}
            aria-label={`Заменить: ${dishLabel(item)}`}
            title="Заменить или поменять местами"
          >
            ⇄
          </button>
        </div>
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
  overrides,
  onStatsChange,
  onOpenRecipe,
  onReplace,
}: {
  week: number
  slot: MenuSlot
  store: MealStatsStore
  overrides: MenuOverrides
  onStatsChange: (store: MealStatsStore) => void
  onOpenRecipe: (item: MenuDishRef) => void
  onReplace: (target: ReplaceTarget) => void
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

  function renderDish(
    item: MenuDishRef,
    kind: 'main' | 'side',
    role: MenuRole,
    index: number,
    portions = '6 пор.',
  ) {
    return (
      <DishRow
        key={item.dishId + (item.label ?? '') + role + index}
        item={item}
        kind={kind}
        portions={portions}
        replaced={isPositionOverridden(overrides, {
          week,
          slotId: slot.id,
          role,
          index,
        })}
        outcome={slotStat.dishes[item.dishId]?.outcome}
        onOutcome={(value) => setOutcome(item.dishId, value)}
        onOpenRecipe={() => onOpenRecipe(item)}
        onReplace={() => onReplace({ slotId: slot.id, role, index })}
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
              {slot.complete ? renderDish(slot.complete, 'main', 'complete', 0) : null}
              {slot.mains.map((m, i) => renderDish(m, 'main', 'mains', i))}
            </ul>
          </section>
          {slot.sides.length > 0 ? (
            <section className="menu-dish-group menu-dish-group--side">
              <h4>Гарнир</h4>
              <ul className="menu-slot-dishes">
                {slot.sides.map((s, i) => renderDish(s, 'side', 'sides', i))}
              </ul>
            </section>
          ) : null}
        </div>
      </div>
    </details>
  )
}

export function MenuTab() {
  const { state, setMealStats, setMenuOverrides } = useMenuSync()
  const [weekNumber, setWeekNumber] = useState(getCurrentWeekNumber)
  const [recipeItem, setRecipeItem] = useState<MenuDishRef | null>(null)
  const [replaceTarget, setReplaceTarget] = useState<ReplaceTarget | null>(null)
  const stats = state.mealStats
  const overrides = state.menuOverrides
  const menu = useMemo(
    () => getEffectiveWeekMenu(weekNumber, overrides),
    [weekNumber, overrides],
  )
  const weekEdited = weekHasOverrides(overrides, weekNumber)

  return (
    <section className="view">
      <p className="muted cycle-range">Цикл {cycleRangeLabel()}</p>
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

      {weekEdited ? (
        <div className="menu-week-edit no-print">
          <p className="muted">Меню этой недели изменено.</p>
          <button
            type="button"
            className="link-btn"
            onClick={() => setMenuOverrides(resetWeekOverrides(overrides, weekNumber))}
          >
            Вернуть план
          </button>
        </div>
      ) : null}

      <div className="cook-plan">
        {menu.slots.map((slot) => (
          <SlotCard
            key={slot.id}
            week={weekNumber}
            slot={slot}
            store={stats}
            overrides={overrides}
            onStatsChange={setMealStats}
            onOpenRecipe={setRecipeItem}
            onReplace={setReplaceTarget}
          />
        ))}
      </div>

      {recipeItem ? (
        <RecipePeekModal
          item={recipeItem}
          cookbook={state.cookbook}
          scales={state.portionScales ?? {}}
          onClose={() => setRecipeItem(null)}
        />
      ) : null}

      {replaceTarget ? (
        <ReplaceDishModal
          week={weekNumber}
          target={replaceTarget}
          overrides={overrides}
          cookbook={state.cookbook}
          onOverridesChange={setMenuOverrides}
          onClose={() => setReplaceTarget(null)}
        />
      ) : null}
    </section>
  )
}
