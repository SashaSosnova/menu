import { useState } from 'react'
import { weekNumbers } from '../data/weeks'
import { getDish } from '../data/dishes'
import { formatMacros } from '../lib/macros'
import { monthlyFreezer } from '../data/shopping'
import { getWeekPlan } from '../data/weekPlans'
import { monthAlgorithm } from '../data/cooking'
import { plateGuide, people, familyMeal } from '../data/portions'
import { vegetableSalads, saladPortionNote } from '../data/salads'
import {
  completeBaseLabel,
  weekCompleteBase,
  type BatchItem,
  type CookBatch,
} from '../data/types'
import { formatServingsDisplay } from '../lib/recipeServings'
import { withPrepPackStep } from '../lib/recipeSteps'
import { MacrosBadge } from './MacrosBadge'
import { Checklist } from './Checklist'

function RecipeDetails({ dishId }: { dishId: string }) {
  const dish = getDish(dishId)
  if (!dish?.recipe) return null

  return (
    <details className="recipe-details">
      <summary>
        <span>
          {dish.name}
          {dish.kind === 'complete' ? (
            <span className="kind-tag">цельное</span>
          ) : null}
        </span>
        {dish.macros && <MacrosBadge macros={dish.macros} />}
      </summary>
      <div className="recipe-details-body">
        <p className="muted">{formatServingsDisplay(dishId, dish.recipe.servings)}</p>
        {dish.kind === 'complete' ? (
          <p className="pairings">Гарнир уже в блюде — второй крупой не дополнять.</p>
        ) : null}
        <h4>Ингредиенты</h4>
        <ul className="ingredient-list">
          {dish.recipe.ingredients.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <h4>Как готовить</h4>
        <p className="steps">{withPrepPackStep(dishId, dish.recipe.steps)}</p>
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

function batchItemIds(item: BatchItem): string[] {
  return [item.dishId, ...(item.orDishIds ?? [])]
}

function batchItemLabel(item: BatchItem): string {
  return batchItemIds(item)
    .map((id) => getDish(id)?.name ?? id)
    .join(' / ')
}

function BatchItemLine({ item }: { item: BatchItem }) {
  const dish = getDish(item.dishId)
  if (!dish) return null
  const name = batchItemLabel(item)
  const macros = dish.macros ? ` (${formatMacros(dish.macros)})` : ''

  return (
    <li>
      <span className="batch-item-name">
        {name}
        {dish.kind === 'complete' ? <span className="kind-tag">цельное</span> : null}
        {macros}
      </span>
      <span className="batch-item-meta">{item.portions}</span>
    </li>
  )
}

function CookBatchCard({ batch }: { batch: CookBatch }) {
  const dishIds = [...batch.mains, ...batch.sides].flatMap(batchItemIds)

  return (
    <details className="cook-task" open>
      <summary className="cook-task-summary">
        <span className="cook-task-text">
          <strong>{batch.when}</strong>
          <span>
            {batch.title}
            <span className="batch-covers"> → {batch.covers}</span>
          </span>
        </span>
        <span className="time-badge">{batch.time}</span>
      </summary>
      <div className="cook-task-body">
        {batch.note && <p className="cook-note">{batch.note}</p>}
        <div className="batch-lists">
          <div>
            <h4>Основное</h4>
            <ul className="batch-list">
              {batch.mains.map((item) => (
                <BatchItemLine key={item.dishId} item={item} />
              ))}
            </ul>
          </div>
          {batch.sides.length > 0 && (
            <div>
              <h4>Гарниры</h4>
              <ul className="batch-list">
                {batch.sides.map((item) => (
                  <BatchItemLine key={item.dishId} item={item} />
                ))}
              </ul>
            </div>
          )}
        </div>
        <div className="cook-recipes">
          {dishIds.map((id) => (
            <RecipeDetails key={id} dishId={id} />
          ))}
        </div>
      </div>
    </details>
  )
}

export function MenuView() {
  const [weekNumber, setWeekNumber] = useState(1)
  const plan = getWeekPlan(weekNumber)
  const completeName = plan.completeDishId
    ? getDish(plan.completeDishId)?.name
    : null
  const completeBase = weekCompleteBase[weekNumber]
  const completeBaseText = completeBase ? completeBaseLabel[completeBase] : null

  return (
    <section className="view">
      <div className="view-heading no-print">
        <div className="view-heading-row">
          <div>
            <h2>Неделя {weekNumber}</h2>
            <p className="muted">
              Готовка вс/пн · ср · пт → запас на ~2 дня. Гарниры вкусные (не голая крупа).
              {completeName && completeBaseText
                ? ` Цельное недели (${completeBaseText}): ${completeName}.`
                : ''}
            </p>
          </div>
          <button type="button" className="print-btn" onClick={() => window.print()}>
            Печать
          </button>
        </div>
      </div>

      <div className="week-tabs no-print" role="tablist" aria-label="Недели">
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

      <div className="week-sections no-print">
        <details className="fold" open>
          <summary>Готовки на неделю</summary>
          <div className="fold-body">
            <ul className="muted rules-list">
              {monthAlgorithm.map((rule) => (
                <li key={rule}>{rule}</li>
              ))}
            </ul>
            <div className="cook-plan">
              {plan.batches.map((b) => (
                <CookBatchCard key={`${b.when}-${b.title}`} batch={b} />
              ))}
            </div>
            <p className="free-day-note">{plan.freeDayNote}</p>
          </div>
        </details>

        <details className="fold" open>
          <summary>К тарелке</summary>
          <div className="fold-body">
            <p className="muted">{saladPortionNote}</p>
            <ul className="ingredient-list">
              {vegetableSalads.map((s) => (
                <li key={s.name}>
                  {s.name}
                  {s.note ? <span className="muted"> · {s.note}</span> : null}
                </li>
              ))}
            </ul>
          </div>
        </details>

        {weekNumber === 1 && (
          <details className="fold" open>
            <summary>Закупка на месяц</summary>
            <div className="fold-body">
              <p className="muted">
                Каждый пункт — один пакет. Мясо сразу нарезать или замариновать и заморозить.
                Рыбу — порциями, без маринада.
              </p>
              <Checklist storageKey="checklist-monthly-freezer" items={monthlyFreezer} />
            </div>
          </details>
        )}

        <details className="fold">
          <summary>Порции</summary>
          <div className="fold-body">
            <p className="muted">
              Семья из 3 (женщина · мужчина · ребёнок). Цели ккал на приём:{' '}
              {people.map((p) => `${p.label} ~${p.mealKcal}`).join(' · ')}.
              За приём: горячее ~{familyMeal.proteinG} г · гарнир ~{familyMeal.sideCookedG} г.
              Заготовка на 2 приёма: горячее ~{familyMeal.proteinG * 2} г · гарнир ~
              {familyMeal.sideCookedG * 2} г.
            </p>
            {plateGuide.map((block) => (
              <div key={block.title} className="portion-block">
                <h4>{block.title}</h4>
                <ul className="ingredient-list">
                  {block.lines.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </details>

        <details className="fold" open>
          <summary>Что купить на неделю</summary>
          <div className="fold-body">
            <Checklist storageKey={`checklist-week-${weekNumber}`} items={plan.shopping} />
          </div>
        </details>
      </div>

      <div className="print-sheet print-only" aria-hidden="true">
        <h1>Меню · Неделя {weekNumber}</h1>
        {plan.batches.map((b) => (
          <div key={b.when} className="print-batch">
            <h2>
              {b.when} → {b.covers}
            </h2>
            <p>{b.title}</p>
            <p>
              Основное:{' '}
              {b.mains
                .map((m) => `${batchItemLabel(m)} (${m.portions})`)
                .join('; ')}
            </p>
            {b.sides.length > 0 && (
              <p>
                Гарниры:{' '}
                {b.sides
                  .map((m) => `${batchItemLabel(m)} (${m.portions})`)
                  .join('; ')}
              </p>
            )}
            {b.note && <p className="print-batch-note">{b.note}</p>}
          </div>
        ))}
        <p className="print-salads">{plan.freeDayNote}</p>
        <p className="print-salads">
          К тарелке: {vegetableSalads.map((s) => s.name).join('; ')}.
        </p>
      </div>
    </section>
  )
}
