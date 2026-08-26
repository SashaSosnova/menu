import { listCookQueue, slotDishIds } from '../data/cookBoard'
import {
  countPrepChecks,
  prepCheckIds,
  prepCookHint,
  prepGroups,
  prepMatchesNext,
} from '../data/prep'
import { useMenuSync } from '../hooks/useMenuSync'

const STORAGE_KEY = 'checklist-prep-freezer-v2'

function PackLine({
  label,
  amount,
  use,
  how,
  checked,
  isNext,
  onToggle,
}: {
  label: string
  amount: string
  use?: string
  how?: string
  checked: boolean
  isNext?: boolean
  onToggle: () => void
}) {
  return (
    <label
      className={[
        'prep-item',
        checked ? 'is-checked' : '',
        isNext ? 'is-next' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <input type="checkbox" checked={checked} onChange={onToggle} />
      <span className="prep-body">
        <span className="prep-head">
          <span className="prep-product">{label}</span>
          <span className="prep-amount">{amount}</span>
        </span>
        {use && (
          <span className={isNext ? 'prep-use is-next' : 'prep-use'}>{use}</span>
        )}
        {how && <span className="prep-how">{how}</span>}
      </span>
    </label>
  )
}

export function PrepTab() {
  const { state, setChecklist } = useMenuSync()
  const checked = state.checklists[STORAGE_KEY] ?? {}
  const { total } = countPrepChecks()
  const nextBatch = listCookQueue(
    state.cookBoard,
    state.menuOverrides,
    state.mealStats,
  ).find((b) => b.status === 'next')
  const nextCook = nextBatch
    ? {
        week: nextBatch.week,
        slotId: nextBatch.slotId,
        dishIds: new Set(slotDishIds(nextBatch.slot)),
      }
    : null

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
          Раз в месяц: разделать, замариновать, подписать пакет (название блюда),
          в морозилку. Достаёте пакет, когда готовите этот набор — не по календарным
          пн/ср/пт. Галочка на каждый пакет.
        </p>
        {nextBatch ? (
          <p className="muted">Подсвечен пакет для следующей готовки</p>
        ) : null}
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
                            {item.packs.map((pack) => {
                              const isNext = prepMatchesNext(pack, nextCook)
                              return (
                                <li key={pack.id}>
                                  <PackLine
                                    label={pack.label}
                                    amount={pack.amount}
                                    use={prepCookHint(isNext)}
                                    isNext={isNext}
                                    checked={Boolean(checked[pack.id])}
                                    onToggle={() => toggle(pack.id)}
                                  />
                                </li>
                              )
                            })}
                          </ul>
                        </li>
                      )
                    }

                    const isNext = prepMatchesNext(item, nextCook)
                    return (
                      <li key={item.id}>
                        <PackLine
                          label={item.label}
                          amount={item.amount}
                          use={
                            item.dishIds?.length || (item.week && item.slot)
                              ? prepCookHint(isNext)
                              : undefined
                          }
                          how={item.how}
                          isNext={isNext}
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
