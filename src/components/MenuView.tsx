import { useState } from 'react'
import { weeks } from '../data/weeks'
import { getDish, formatMacros } from '../data/dishes'
import { monthlyFreezer } from '../data/shopping'
import { getWeekPlan } from '../data/weekPlans'
import { plateGuide, people, familyMeal, dryPerFamilyMeal } from '../data/portions'
import { vegetableSalads, saladPortionNote } from '../data/salads'
import type { MealPart } from '../data/types'
import { MacrosBadge } from './MacrosBadge'
import { Checklist } from './Checklist'

function formatMealLine(parts: MealPart[]): string {
  return parts
    .map((part) => (part.macros ? `${part.name} (${formatMacros(part.macros)})` : part.name))
    .join(' + ')
}

function RecipeDetails({ dishId }: { dishId: string }) {
  const dish = getDish(dishId)
  if (!dish?.recipe) return null

  return (
    <details className="recipe-details">
      <summary>
        <span>{dish.name}</span>
        {dish.macros && <MacrosBadge macros={dish.macros} />}
      </summary>
      <div className="recipe-details-body">
        <p className="muted">{dish.recipe.servings}</p>
        <h4>Ингредиенты</h4>
        <ul className="ingredient-list">
          {dish.recipe.ingredients.map((item) => (
            <li key={item}>{item}</li>
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

export function MenuView() {
  const [weekNumber, setWeekNumber] = useState(1)
  const week = weeks.find((w) => w.week === weekNumber)!
  const plan = getWeekPlan(weekNumber)

  return (
    <section className="view">
      <div className="view-heading no-print">
        <div className="view-heading-row">
          <div>
            <h2>Неделя {weekNumber}</h2>
            <p className="muted">
              На неделе: говядина + курица + рыба. Вс — доедание остатков. Порции гарнира 80/200/130 г.
            </p>
          </div>
          <button type="button" className="print-btn" onClick={() => window.print()}>
            Печать
          </button>
        </div>
      </div>

      <div className="week-tabs no-print" role="tablist" aria-label="Недели">
        {weeks.map((w) => (
          <button
            key={w.week}
            type="button"
            role="tab"
            aria-selected={w.week === weekNumber}
            className={w.week === weekNumber ? 'week-tab is-active' : 'week-tab'}
            onClick={() => setWeekNumber(w.week)}
          >
            Нед. {w.week}
          </button>
        ))}
      </div>

      <div className="week-sections no-print">
        <details className="fold" open>
          <summary>Меню</summary>
          <div className="fold-body">
            <div className="menu-compact">
              {week.days.map((d) => (
                <div key={d.day} className="menu-compact-row">
                  <div className="menu-compact-day">{d.day}</div>
                  <div className="menu-compact-meals">
                    {d.note ? (
                      <p className="menu-day-note">{d.note}</p>
                    ) : (
                      <>
                        <p>
                          <span className="menu-compact-label">Обед</span>
                          {formatMealLine(d.lunch ?? [])}
                        </p>
                        <p>
                          <span className="menu-compact-label">Ужин</span>
                          {formatMealLine(d.dinner ?? [])}
                        </p>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="salad-list">
              <h4>Овощные салаты — любой к приёму</h4>
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
          </div>
        </details>

        {weekNumber === 1 && (
          <details className="fold" open>
            <summary>Закупка на месяц</summary>
            <div className="fold-body">
              <p className="muted">
                В морозилку: мясо, рыба, брокколи, горошек, кукуруза. Остальные овощи — только
                свежие. В заметке — как разложить по пакетам.
              </p>
              <Checklist storageKey="checklist-monthly-freezer" items={monthlyFreezer} />
            </div>
          </details>
        )}

        <details className="fold">
          <summary>Порции на тарелку</summary>
          <div className="fold-body">
            <p className="muted">
              Цели ккал на обед/ужин: {people.map((p) => `${p.label} ~${p.mealKcal}`).join(' · ')}.
              Семья за приём: белок ~{familyMeal.proteinG} г · гарнир ~{familyMeal.sideCookedG} г
              готового (рис {dryPerFamilyMeal.rice} г / гречка {dryPerFamilyMeal.buckwheat} г сухих).
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

        <details className="fold" open>
          <summary>Что готовим</summary>
          <div className="fold-body">
            <div className="cook-plan">
              {plan.cooking.map((task) => (
                <details key={`${task.when}-${task.title}`} className="cook-task">
                  <summary className="cook-task-summary">
                    <span className="cook-task-text">
                      <strong>{task.when}</strong>
                      <span>{task.title}</span>
                    </span>
                    <span className="time-badge">{task.time}</span>
                  </summary>
                  <div className="cook-task-body">
                    {task.note && <p className="cook-note">{task.note}</p>}
                    <div className="cook-recipes">
                      {task.dishIds.map((id) => (
                        <RecipeDetails key={id} dishId={id} />
                      ))}
                    </div>
                  </div>
                </details>
              ))}
            </div>
          </div>
        </details>
      </div>

      <div className="print-sheet print-only" aria-hidden="true">
        <h1>Меню · Неделя {weekNumber}</h1>
        <table className="print-table">
          <thead>
            <tr>
              <th>День</th>
              <th>Обед</th>
              <th>Ужин</th>
            </tr>
          </thead>
          <tbody>
            {week.days.map((d) => (
              <tr key={d.day}>
                <th scope="row">{d.day}</th>
                {d.note ? (
                  <td colSpan={2}>{d.note}</td>
                ) : (
                  <>
                    <td>{formatMealLine(d.lunch ?? [])}</td>
                    <td>{formatMealLine(d.dinner ?? [])}</td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        <p className="print-salads">
          Овощной салат: {vegetableSalads.map((s) => s.name).join('; ')}.
        </p>
      </div>
    </section>
  )
}
