import { weekRangeLabel } from '../data/calendar'
import { weekNumbers } from '../data/weeks'
import {
  countPrepChecks,
  prepCheckIds,
  prepGroups,
  prepUse,
} from '../data/prep'
import { useMenuSync } from '../hooks/useMenuSync'

const STORAGE_KEY = 'checklist-prep-freezer-v2'

function PackLine({
  label,
  amount,
  use,
  how,
  checked,
  onToggle,
}: {
  label: string
  amount: string
  use?: string
  how?: string
  checked: boolean
  onToggle: () => void
}) {
  return (
    <label className={checked ? 'prep-item is-checked' : 'prep-item'}>
      <input type="checkbox" checked={checked} onChange={onToggle} />
      <span className="prep-body">
        <span className="prep-head">
          <span className="prep-product">{label}</span>
          <span className="prep-amount">{amount}</span>
        </span>
        {use && <span className="prep-use">{use}</span>}
        {how && <span className="prep-how">{how}</span>}
      </span>
    </label>
  )
}

export function PrepTab() {
  const { state, setChecklist } = useMenuSync()
  const checked = state.checklists[STORAGE_KEY] ?? {}
  const { total } = countPrepChecks()

  function toggle(id: string) {
    const next = { ...checked, [id]: !checked[id] }
    setChecklist(STORAGE_KEY, next)
  }

  const done = prepGroups.reduce(
    (n, g) =>
      n +
      g.items.reduce(
        (m, item) =>
          m + prepCheckIds(item).filter((id) => checked[id]).length,
        0,
      ),
    0,
  )

  return (
    <section className="view">
      <div className="view-heading">
        <h2>Заготовки</h2>
        <p className="muted">
          Раз в месяц: разделать, замариновать, подписать пакет (название +
          даты), в морозилку. Галочка на каждый пакет.
        </p>
        <p className="muted">
          {weekNumbers.map((w) => weekRangeLabel(w)).join(' · ')}
        </p>
        <p className="prep-progress">
          В заморозку: {done} из {total}
        </p>
        <p className="prep-labels-export">
          <a className="link-btn" href={`${import.meta.env.BASE_URL}prep-labels.xlsx`} download>
            Excel для NIIMBOT
          </a>
          <span className="muted"> · </span>
          <a className="link-btn" href={`${import.meta.env.BASE_URL}prep-labels/index.html`} target="_blank" rel="noreferrer">
            PNG-этикетки 50×30
          </a>
          <span className="muted prep-labels-hint">
            {' '}
            — импорт Excel в шаблон или печать PNG как картинок
          </span>
        </p>
      </div>

      <div className="week-sections">
        {prepGroups.map((group, index) => {
          const checkIds = group.items.flatMap(prepCheckIds)
          const groupDone = checkIds.filter((id) => checked[id]).length
          const groupTotal = checkIds.length

          return (
            <details key={group.id} className="fold" open={index < 2}>
              <summary>
                <span>
                  {group.title}
                  <span className="prep-group-count">
                    {' '}
                    {groupDone}/{groupTotal}
                  </span>
                </span>
              </summary>
              <div className="fold-body">
                {group.intro && <p className="muted">{group.intro}</p>}
                {group.marinade && (
                  <p className="prep-marinade">
                    <strong>Маринад:</strong> {group.marinade}
                  </p>
                )}
                <ul className="prep-list">
                  {group.items.map((item) => {
                    if (item.packs) {
                      const packDone = item.packs.filter((p) =>
                        checked[p.id],
                      ).length
                      return (
                        <li key={item.id} className="prep-block">
                          <div className="prep-block-head">
                            <span className="prep-product">{item.label}</span>
                            <span className="prep-amount">
                              {item.amount}
                              <span className="prep-pack-count">
                                {' '}
                                · {packDone}/{item.packs.length}
                              </span>
                            </span>
                          </div>
                          {item.how && (
                            <p className="prep-how muted">{item.how}</p>
                          )}
                          <ul className="prep-packs">
                            {item.packs.map((pack) => (
                              <li key={pack.id}>
                                <PackLine
                                  label={pack.label}
                                  amount={pack.amount}
                                  use={prepUse(pack.week, pack.slot)}
                                  checked={Boolean(checked[pack.id])}
                                  onToggle={() => toggle(pack.id)}
                                />
                              </li>
                            ))}
                          </ul>
                        </li>
                      )
                    }

                    return (
                      <li key={item.id}>
                        <PackLine
                          label={item.label}
                          amount={item.amount}
                          use={
                            item.week && item.slot
                              ? prepUse(item.week, item.slot)
                              : undefined
                          }
                          how={item.how}
                          checked={Boolean(checked[item.id])}
                          onToggle={() => toggle(item.id)}
                        />
                      </li>
                    )
                  })}
                </ul>
              </div>
            </details>
          )
        })}
      </div>
    </section>
  )
}
