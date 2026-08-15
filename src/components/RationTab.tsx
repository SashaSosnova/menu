import { useMemo, useState } from 'react'
import { weekNumbers } from '../data/weeks'
import { type MenuSlot } from '../data/menu'
import { people, prepMeals, type PersonId } from '../data/portions'
import { getDish } from '../data/dishes'
import {
  cycleId,
  cycleRangeLabel,
  getCurrentWeekNumber,
  getMonthStart,
  previousCycleStart,
  slotRangeLabel,
  weekRangeLabel,
} from '../data/calendar'
import { getEffectiveWeekMenu, type MenuOverrides } from '../data/menuOverrides'
import {
  PORTION_OUTCOME_OPTIONS,
  slotStatKey,
  type MealStatsStore,
  type PortionOutcome,
} from '../data/mealStats'
import { useMenuSync } from '../hooks/useMenuSync'
import {
  bumpPortionScale,
  formatPortionScale,
  normalizePortionScale,
  type PortionScales,
} from '../lib/portionScale'
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

function outcomeLabel(id: PortionOutcome): string {
  return PORTION_OUTCOME_OPTIONS.find((o) => o.id === id)?.label ?? id
}

type ReviewMark = {
  week: number
  slotLabel: string
  outcome: PortionOutcome
}

type ReviewGroup = {
  dishId: string
  name: string
  marks: ReviewMark[]
}

function collectCycleGroups(
  stats: MealStatsStore,
  cycle: string,
  overrides: MenuOverrides,
): ReviewGroup[] {
  const byId = new Map<string, ReviewGroup>()
  for (const week of weekNumbers) {
    const menu = getEffectiveWeekMenu(week, overrides)
    for (const slot of menu.slots) {
      const slotStat = stats[slotStatKey(week, slot.id, cycle)]
      if (!slotStat) continue
      const items = [
        ...(slot.complete ? [slot.complete] : []),
        ...slot.mains,
        ...slot.sides,
      ]
      for (const item of items) {
        const outcome = slotStat.dishes[item.dishId]?.outcome
        if (!outcome) continue
        const existing = byId.get(item.dishId)
        const mark: ReviewMark = {
          week,
          slotLabel: slot.title,
          outcome,
        }
        if (existing) existing.marks.push(mark)
        else {
          byId.set(item.dishId, {
            dishId: item.dishId,
            name: getDish(item.dishId)?.name ?? item.dishId,
            marks: [mark],
          })
        }
      }
    }
  }
  return [...byId.values()].sort((a, b) => a.name.localeCompare(b.name, 'ru'))
}

function CycleReview({
  stats,
  overrides,
  scales,
  onScalesChange,
}: {
  stats: MealStatsStore
  overrides: MenuOverrides
  scales: PortionScales
  onScalesChange: (next: PortionScales) => void
}) {
  const currentStart = getMonthStart()
  const current = cycleId(currentStart)
  const prevStart = previousCycleStart(currentStart)
  const prev = cycleId(prevStart)
  const currentGroups = collectCycleGroups(stats, current, overrides)
  const prevGroups = collectCycleGroups(stats, prev, overrides)
  const usingPrev = currentGroups.length === 0 && prevGroups.length > 0
  const groups = usingPrev ? prevGroups : currentGroups
  const range = cycleRangeLabel(usingPrev ? prevStart : currentStart)

  function setScale(dishId: string, dir: 1 | -1) {
    const next = bumpPortionScale(scales[dishId], dir)
    const copy = { ...scales }
    if (next === 1) delete copy[dishId]
    else copy[dishId] = next
    onScalesChange(copy)
  }

  return (
    <details className="fold cycle-review" open={groups.length > 0}>
      <summary>Итоги цикла · {range}</summary>
      <div className="fold-body">
        {usingPrev ? (
          <p className="muted">
            Новый цикл ещё без отметок — ниже прошлый месяц. Закладка останется на
            следующий раз.
          </p>
        ) : (
          <p className="muted">
            По отметкам «не хватило / осталось» можно сразу поправить закладку — она
            пойдёт в рецепт и закупки.
          </p>
        )}
        {groups.length === 0 ? (
          <p className="muted">Пока нет отметок по порциям — их ставят во вкладке «Меню».</p>
        ) : (
          <ul className="cycle-review-list">
            {groups.map((group) => {
              const scale = normalizePortionScale(scales[group.dishId])
              return (
                <li key={group.dishId} className="cycle-review-row">
                  <div className="cycle-review-text">
                    <strong>{group.name}</strong>
                    <span className="muted">
                      {group.marks
                        .map(
                          (m) =>
                            `нед.${m.week} ${m.slotLabel} · ${outcomeLabel(m.outcome)}`,
                        )
                        .join(' · ')}
                    </span>
                  </div>
                  <div className="portion-scale" role="group" aria-label={`Закладка: ${group.name}`}>
                    <button
                      type="button"
                      className="portion-scale-btn"
                      onClick={() => setScale(group.dishId, -1)}
                      aria-label="Меньше"
                    >
                      −
                    </button>
                    <span className={scale === 1 ? 'portion-scale-value' : 'portion-scale-value is-changed'}>
                      {formatPortionScale(scale)}
                    </span>
                    <button
                      type="button"
                      className="portion-scale-btn"
                      onClick={() => setScale(group.dishId, 1)}
                      aria-label="Больше"
                    >
                      +
                    </button>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </details>
  )
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
  const { state, setPortionScales } = useMenuSync()
  const [weekNumber, setWeekNumber] = useState(getCurrentWeekNumber)
  const [personId, setPersonId] = useState<PersonId>('woman')
  const menu = useMemo(
    () => getEffectiveWeekMenu(weekNumber, state.menuOverrides),
    [weekNumber, state.menuOverrides],
  )
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
          Цикл {cycleRangeLabel()}. Порция: горячее {person.proteinG}&nbsp;г · гарнир{' '}
          {person.sideG}&nbsp;г · цельное {person.proteinG + person.sideG}&nbsp;г. Итого
          слота — сумма порций всех блюд (без двойного счёта по комбинациям).
        </p>
      </div>

      <CycleReview
        stats={state.mealStats}
        overrides={state.menuOverrides}
        scales={state.portionScales ?? {}}
        onScalesChange={setPortionScales}
      />

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
