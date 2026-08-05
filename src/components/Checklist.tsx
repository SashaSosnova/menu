import type { ShoppingItem } from '../data/types'
import { useMenuSync } from '../hooks/useMenuSync'

type Props = {
  storageKey: string
  items: ShoppingItem[]
}

export function Checklist({ storageKey, items }: Props) {
  const { state, setChecklist } = useMenuSync()
  const checked = state.checklists[storageKey] ?? {}

  function toggle(key: string) {
    const next = { ...checked, [key]: !checked[key] }
    setChecklist(storageKey, next)
  }

  return (
    <ul className="checklist">
      {items.map((item, index) => {
        const key = `${index}|${item.product}|${item.amount}|${item.note ?? ''}`
        const isOn = Boolean(checked[key])
        return (
          <li key={key}>
            <label className={isOn ? 'check-row is-checked' : 'check-row'}>
              <input
                type="checkbox"
                checked={isOn}
                onChange={() => toggle(key)}
              />
              <span className="check-body">
                <span className="check-main">
                  <span className="shop-product">{item.product}</span>
                  <span className="shop-amount">{item.amount}</span>
                </span>
                {item.note && <span className="shop-note">{item.note}</span>}
              </span>
            </label>
          </li>
        )
      })}
    </ul>
  )
}
