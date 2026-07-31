import { useState } from 'react'
import { weekNumbers } from '../data/weeks'
import { getWeekMenu, type MenuDishRef, type MenuSlot } from '../data/menu'
import { getDish, formatMacros } from '../data/dishes'
import { MacrosBadge } from './MacrosBadge'

function dishLabel(item: MenuDishRef): string {
  return item.label ?? getDish(item.dishId)?.name ?? item.dishId
}

function RecipeBlock({ item }: { item: MenuDishRef }) {
  const dish = getDish(item.dishId)
  const sauce = item.daySauceId ? getDish(item.daySauceId) : undefined
  if (!dish?.recipe) {
    return (
      <details className="recipe-details">
        <summary>
          <span>{dishLabel(item)}</span>
        </summary>
        <div className="recipe-details-body">
          <p className="muted">Рецепт скоро появится.</p>
        </div>
      </details>
    )
  }

  return (
    <details className="recipe-details">
      <summary>
        <span>
          {dishLabel(item)}
          {dish.kind === 'complete' ? (
            <span className="kind-tag">полноценное</span>
          ) : null}
        </span>
        {dish.macros && <MacrosBadge macros={dish.macros} />}
      </summary>
      <div className="recipe-details-body">
        <p className="muted">
          {dish.recipe.servings}
          {dish.macros ? ` · КБЖУ ${formatMacros(dish.macros)} на 100 г` : ''}
        </p>
        {dish.kind === 'complete' ? (
          <p className="pairings">Гарнир уже в блюде — вторым не дополнять.</p>
        ) : null}
        {sauce?.recipe ? (
          <p className="pairings">
            Соус день в день: {sauce.name}. {sauce.recipe.steps}
          </p>
        ) : null}
        <h4>Ингредиенты</h4>
        <ul className="ingredient-list">
          {dish.recipe.ingredients.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
        <h4>Как готовить</h4>
        <p className="steps">{dish.recipe.steps}</p>
        {dish.recipe.storage && (
          <>
            <h4>Хранение</h4>
            <p>{dish.recipe.storage}</p>
          </>
        )}
      </div>
    </details>
  )
}

function SlotCard({ slot }: { slot: MenuSlot }) {
  const recipeItems: MenuDishRef[] = [
    ...(slot.complete ? [slot.complete] : []),
    ...slot.mains,
    ...slot.sides,
  ]

  return (
    <details className="cook-task" open>
      <summary className="cook-task-summary">
        <span className="cook-task-text">
          <strong>{slot.title}</strong>
          <span className="batch-covers"> → {slot.covers}</span>
        </span>
      </summary>
      <div className="cook-task-body">
        {slot.note && <p className="cook-note">{slot.note}</p>}

        {slot.pairs && slot.pairs.length > 0 && (
          <p className="pairings">
            Пары:{' '}
            {slot.pairs
              .map(
                ([a, b]) =>
                  `${getDish(a)?.name ?? a} + ${getDish(b)?.name ?? b}`,
              )
              .join(' · ')}
          </p>
        )}

        <div className="batch-lists">
          <div>
            <h4>Горячее</h4>
            <ul className="batch-list">
              {slot.complete && (
                <li>
                  <span className="batch-item-name">
                    {dishLabel(slot.complete)}
                    <span className="kind-tag">полноценное</span>
                  </span>
                  <span className="batch-item-meta">6 порций</span>
                </li>
              )}
              {slot.mains.map((m) => {
                const d = getDish(m.dishId)
                return (
                  <li key={m.dishId + (m.label ?? '')}>
                    <span className="batch-item-name">
                      {dishLabel(m)}
                      {d?.macros ? ` (${formatMacros(d.macros)})` : ''}
                    </span>
                    <span className="batch-item-meta">6 порций</span>
                  </li>
                )
              })}
            </ul>
          </div>
          <div>
            <h4>Гарнир</h4>
            <ul className="batch-list">
              {slot.sides.map((s) => {
                const d = getDish(s.dishId)
                return (
                  <li key={s.dishId}>
                    <span className="batch-item-name">
                      {dishLabel(s)}
                      {d?.macros ? ` (${formatMacros(d.macros)})` : ''}
                    </span>
                    <span className="batch-item-meta">6 порций</span>
                  </li>
                )
              })}
            </ul>
          </div>
        </div>

        <div className="cook-recipes">
          <h4>Рецепты</h4>
          {recipeItems.map((item) => (
            <RecipeBlock
              key={item.dishId + (item.label ?? '')}
              item={item}
            />
          ))}
        </div>
      </div>
    </details>
  )
}

export function MenuTab() {
  const [weekNumber, setWeekNumber] = useState(1)
  const menu = getWeekMenu(weekNumber)

  return (
    <section className="view">
      <div className="view-heading">
        <h2>Неделя {weekNumber}</h2>
        <p className="muted">{menu.summary}</p>
      </div>

      <div className="week-tabs" role="tablist" aria-label="Недели">
        {weekNumbers.map((w) => (
          <button
            key={w}
            type="button"
            role="tab"
            aria-selected={w === weekNumber}
            className={w === weekNumber ? 'week-tab is-active' : 'week-tab'}
            onClick={() => setWeekNumber(w)}
          >
            Нед. {w}
          </button>
        ))}
      </div>

      <div className="cook-plan">
        {menu.slots.map((slot) => (
          <SlotCard key={slot.id} slot={slot} />
        ))}
      </div>
    </section>
  )
}
