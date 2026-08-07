import { useState } from 'react'
import { weekNumbers } from '../data/weeks'
import { getWeekMenu, type MenuSlot } from '../data/menu'
import { people, prepMeals, type PersonId } from '../data/portions'
import { slotRangeLabel, weekRangeLabel } from '../data/calendar'
import {
  getPersonPortion,
  slotDishesTotalKcal,
  slotPlateCombos,
  type PlateCombo,
} from '../lib/plateMacros'

/** Закладка на завтрак вне меню */
const BREAKFAST_KCAL = 400
/** Дней в календарной неделе (вс — без обеда/ужина из меню) */
const WEEK_DAYS = 7

function formatKcal(n: number): string {
  return `${n}\u00a0ккал`
}

function ComboKcal({ combo }: { combo: PlateCombo }) {
  if (combo.kcalRange) {
    return (
      <span className="ration-kcal">
        {formatKcal(combo.kcalRange.min)}–{combo.kcalRange.max}
      </span>
    )
  }
  if (combo.macros) {
    return <span className="ration-kcal">{formatKcal(combo.macros.kcal)}</span>
  }
  return <span className="ration-kcal muted">нет КБЖУ</span>
}

function SlotRation({
  week,
  slot,
  personId,
}: {
  week: number
  slot: MenuSlot
  personId: PersonId
}) {
  const combos = slotPlateCombos(slot, personId)
  const dishesTotal = slotDishesTotalKcal(slot, personId)

  return (
    <details className="cook-task" open>
      <summary className="cook-task-summary">
        <span className="cook-task-text">
          <strong>{slotRangeLabel(week, slot.id)}</strong>
          <span className="muted">Итого {formatKcal(dishesTotal)}</span>
        </span>
      </summary>
      <div className="cook-task-body">
        {slot.pairs?.length ? (
          <p className="muted ration-hint">Только фиксированные пары из меню.</p>
        ) : null}
        <ul className="ration-combos">
          {combos.map((combo) => (
            <li key={combo.key} className="ration-combo">
              <div className="ration-combo-text">
                <strong>
                  {combo.complete
                    ? combo.hotName
                    : `${combo.hotName} + ${combo.sideName ?? '—'}`}
                </strong>
              </div>
              <ComboKcal combo={combo} />
            </li>
          ))}
        </ul>
      </div>
    </details>
  )
}

export function RationTab() {
  const [weekNumber, setWeekNumber] = useState(1)
  const [personId, setPersonId] = useState<PersonId>('woman')
  const menu = getWeekMenu(weekNumber)
  const person = getPersonPortion(personId)

  /** Сумма порций всех блюд (каждое один раз) */
  const dishesOnce = menu.slots.reduce(
    (sum, slot) => sum + slotDishesTotalKcal(slot, personId),
    0,
  )
  /** Заготовка на 2 приёма → обед+ужин за неделю */
  const lunchDinnerWeek = dishesOnce * prepMeals
  const breakfastWeek = BREAKFAST_KCAL * WEEK_DAYS
  const avgDay = Math.round((lunchDinnerWeek + breakfastWeek) / WEEK_DAYS)

  return (
    <section className="view">
      <div className="view-heading">
        <h2>Рацион на неделю</h2>
        <p className="muted">
          Порция: горячее {person.proteinG}&nbsp;г · гарнир {person.sideG}&nbsp;г · цельное{' '}
          {person.proteinG + person.sideG}&nbsp;г. Итого слота — сумма порций всех блюд (без
          двойного счёта по комбинациям).
        </p>
      </div>

      <div className="ration-person" role="group" aria-label="Порция">
        {people.map((p) => (
          <button
            key={p.id}
            type="button"
            className={personId === p.id ? 'ration-person-btn is-active' : 'ration-person-btn'}
            onClick={() => setPersonId(p.id)}
          >
            {p.label}
          </button>
        ))}
      </div>

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

      <div className="ration-week-summary">
        <p>
          Ориентир <strong>{formatKcal(person.dayKcal)}</strong> в день
        </p>
        <p className="muted">Завтрак ~{formatKcal(BREAKFAST_KCAL)}</p>
        <p>
          Средний день: <strong>{formatKcal(avgDay)}</strong>
        </p>
      </div>

      <div className="cook-plan">
        {menu.slots.map((slot) => (
          <SlotRation key={slot.id} week={weekNumber} slot={slot} personId={personId} />
        ))}
      </div>
    </section>
  )
}
