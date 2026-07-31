import { useState } from 'react'
import './App.css'
import { MenuTab } from './components/MenuTab'
import { ShoppingTab } from './components/ShoppingTab'
import { PrepTab } from './components/PrepTab'

type TabId = 'menu' | 'shopping' | 'prep'

const tabs: { id: TabId; label: string }[] = [
  { id: 'menu', label: 'Меню' },
  { id: 'shopping', label: 'Закупки' },
  { id: 'prep', label: 'Заготовки' },
]

function App() {
  const [tab, setTab] = useState<TabId>('menu')

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="brand">Меню</h1>
        <nav className="nav" aria-label="Разделы">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              className={tab === t.id ? 'nav-item is-active' : 'nav-item'}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </header>

      <main className="main">
        {tab === 'menu' && <MenuTab />}
        {tab === 'shopping' && <ShoppingTab />}
        {tab === 'prep' && <PrepTab />}
      </main>
    </div>
  )
}

export default App
