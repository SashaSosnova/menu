import { prepGroups } from '../data/prep'

export function PrepTab() {
  return (
    <section className="view">
      <div className="view-heading">
        <h2>Заготовки</h2>
        <p className="muted">
          Раз в месяц: разделать, замариновать, подписать пакет, в морозилку.
        </p>
      </div>

      <div className="week-sections">
        {prepGroups.map((group, index) => (
          <details key={group.id} className="fold" open={index < 2}>
            <summary>{group.title}</summary>
            <div className="fold-body">
              {group.intro && <p className="muted">{group.intro}</p>}
              {group.marinade && (
                <p className="prep-marinade">
                  <strong>Маринад:</strong> {group.marinade}
                </p>
              )}
              <ul className="prep-list">
                {group.items.map((item) => (
                  <li key={item.id} className="prep-item">
                    <div className="prep-head">
                      <span className="prep-product">{item.label}</span>
                      <span className="prep-amount">{item.amount}</span>
                    </div>
                    {item.how && <p className="prep-how">{item.how}</p>}
                  </li>
                ))}
              </ul>
            </div>
          </details>
        ))}
      </div>
    </section>
  )
}
