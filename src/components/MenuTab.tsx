import { useEffect, useState } from 'react'
import { weekNumbers } from '../data/weeks'
import { getWeekMenu, type MenuDishRef, type MenuSlot } from '../data/menu'
import { getDish, formatMacros } from '../data/dishes'
import {
  LEFTOVER_OPTIONS,
  loadMealStats,
  saveMealStats,
  slotStatKey,
  type DishStat,
  type LeftoverLevel,
  type MealStatsStore,
  type SlotStat,
} from '../data/mealStats'
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

function SlotStats({
  week,
  slot,
  dishes,
  store,
  onChange,
}: {
  week: number
  slot: MenuSlot
  dishes: MenuDishRef[]
  store: MealStatsStore
  onChange: (store: MealStatsStore) => void
}) {
  const key = slotStatKey(week, slot.id)
  const slotStat: SlotStat = store[key] ?? { dishes: {} }

  function patchSlot(next: SlotStat) {
    const updated = { ...store, [key]: next }
    onChange(updated)
    saveMealStats(updated)
  }

  function setLeftover(dishId: string, leftover: LeftoverLevel) {
    const prev: DishStat = slotStat.dishes[dishId] ?? {}
    const same = prev.leftover === leftover
    patchSlot({
      ...slotStat,
      dishes: {
        ...slotStat.dishes,
        [dishId]: same
          ? { ...prev, leftover: undefined }
          : { ...prev, leftover },
      },
    })
  }

  function setDishNote(dishId: string, note: string) {
    const prev: DishStat = slotStat.dishes[dishId] ?? {}
    patchSlot({
      ...slotStat,
      dishes: {
        ...slotStat.dishes,
        [dishId]: { ...prev, note: note || undefined },
      },
    })
  }

  function setSlotNote(note: string) {
    patchSlot({ ...slotStat, note: note || undefined })
  }

  return (
    <div className="slot-stats">
      <h4>Итог</h4>
      <p className="muted slot-stats-hint">
        Сколько осталось после двух дней — потом подправим закладки.
      </p>
      <ul className="slot-stats-list">
        {dishes.map((item) => {
          const stat = slotStat.dishes[item.dishId] ?? {}
          return (
            <li key={item.dishId} className="slot-stat-row">
              <span className="slot-stat-name">{dishLabel(item)}</span>
              <div
                className="leftover-btns"
                role="group"
                aria-label={`Остаток: ${dishLabel(item)}`}
              >
                {LEFTOVER_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    className={
                      stat.leftover === opt.id
                        ? 'leftover-btn is-active'
                        : 'leftover-btn'
                    }
                    onClick={() => setLeftover(item.dishId, opt.id)}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              <input
                className="slot-stat-note"
                type="text"
                placeholder="заметка"
                value={stat.note ?? ''}
                onChange={(e) => setDishNote(item.dishId, e.target.value)}
              />
            </li>
          )
        })}
      </ul>
      <textarea
        className="slot-stats-textarea"
        rows={2}
        placeholder="Общая заметка по слоту…"
        value={slotStat.note ?? ''}
        onChange={(e) => setSlotNote(e.target.value)}
      />
    </div>
  )
}

function SlotCard({
  week,
  slot,
  store,
  onStatsChange,
}: {
  week: number
  slot: MenuSlot
  store: MealStatsStore
  onStatsChange: (store: MealStatsStore) => void
}) {
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

        <SlotStats
          week={week}
          slot={slot}
          dishes={recipeItems}
          store={store}
          onChange={onStatsChange}
        />
      </div>
    </details>
  )
}

export function MenuTab() {
  const [weekNumber, setWeekNumber] = useState(1)
  const [stats, setStats] = useState<MealStatsStore>({})
  const menu = getWeekMenu(weekNumber)

  useEffect(() => {
    setStats(loadMealStats())
  }, [])

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
          <SlotCard
            key={slot.id}
            week={weekNumber}
            slot={slot}
            store={stats}
            onStatsChange={setStats}
          />
        ))}
      </div>
    </section>
  )
}
