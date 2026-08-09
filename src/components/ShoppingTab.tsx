import { useState } from 'react'
import { getCurrentWeekNumber, weekRangeLabel } from '../data/calendar'
import { weekNumbers } from '../data/weeks'
import {
  monthlyFrozenVeg,
  monthlyMeatFish,
  weeklyShopping,
} from '../data/shopping'
import { Checklist } from './Checklist'

export function ShoppingTab() {
  const [weekNumber, setWeekNumber] = useState(getCurrentWeekNumber)
  const weekItems = weeklyShopping[weekNumber] ?? []

  return (
    <section className="view">
      <div className="view-heading">
        <h2>Закупки</h2>
        <p className="muted">
          Сначала месяц, потом скоропорт по неделям — веса суммируются из рецептов
          меню (например сметана на два блюда → одна строка с общим весом).
        </p>
      </div>

      <div className="week-sections">
        <details className="fold">
          <summary>На месяц · мясо, рыба, овощи в морозилку</summary>
          <div className="fold-body">
            <p className="muted">
              Что купить на месяц. Как нарезать и замариновать — во вкладке
              «Заготовки».
            </p>

            <h4 className="shop-subhead">Мясо, птица, рыба</h4>
            <Checklist
              storageKey="checklist-monthly-meat-v2"
              items={monthlyMeatFish}
            />

            <h4 className="shop-subhead">Овощи в морозилку</h4>
            <Checklist
              storageKey="checklist-monthly-veg-v2"
              items={monthlyFrozenVeg}
            />
          </div>
        </details>

        <details className="fold" open>
          <summary>На неделю · скоропорт и овощи</summary>
          <div className="fold-body">
            <div
              className="week-tabs compact"
              role="tablist"
              aria-label="Недели закупок"
            >
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
            <Checklist
              storageKey={`checklist-week-fresh-${weekNumber}`}
              items={weekItems}
            />
          </div>
        </details>
      </div>
    </section>
  )
}
