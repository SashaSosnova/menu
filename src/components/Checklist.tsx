import { useEffect, useState } from 'react'
import type { ShoppingItem } from '../data/types'

type Props = {
  storageKey: string
  items: ShoppingItem[]
}

export function Checklist({ storageKey, items }: Props) {
  const [checked, setChecked] = useState<Record<string, boolean>>({})

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey)
      setChecked(raw ? (JSON.parse(raw) as Record<string, boolean>) : {})
    } catch {
      setChecked({})
    }
  }, [storageKey])

  function toggle(key: string) {
    setChecked((prev) => {
      const next = { ...prev, [key]: !prev[key] }
      localStorage.setItem(storageKey, JSON.stringify(next))
      return next
    })
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
