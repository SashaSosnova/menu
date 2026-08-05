import { useState } from 'react'
import './App.css'
import { MenuTab } from './components/MenuTab'
import { ShoppingTab } from './components/ShoppingTab'
import { PrepTab } from './components/PrepTab'
import { CookbookTab } from './components/CookbookTab'
import { AccountPanel } from './components/AccountPanel'
import { MenuSyncProvider, useMenuSync } from './hooks/useMenuSync'
import { authAccountLabel, isLinkedAccount } from './lib/accountAuth'
import { isFirebaseConfigured } from './firebase'

type TabId = 'menu' | 'shopping' | 'prep' | 'cookbook'

const tabs: { id: TabId; label: string }[] = [
  { id: 'menu', label: 'Меню' },
  { id: 'cookbook', label: 'Книга' },
  { id: 'shopping', label: 'Закупки' },
  { id: 'prep', label: 'Заготовки' },
]

function AppShell() {
  const [tab, setTab] = useState<TabId>('menu')
  const [accountOpen, setAccountOpen] = useState(false)
  const { ready, user, cloudError, useCloud } = useMenuSync()

  const syncLabel = !isFirebaseConfigured()
    ? 'локально'
    : !ready
      ? 'загрузка…'
      : isLinkedAccount(user)
        ? 'облако'
        : useCloud
          ? 'гость'
          : 'локально'

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="brand">Меню</h1>
        <button
          type="button"
          className="sync-btn"
          onClick={() => setAccountOpen(true)}
          title={authAccountLabel(user)}
        >
          {syncLabel}
        </button>
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

      {cloudError ? <p className="cloud-error">{cloudError}</p> : null}

      <main className="main">
        {!ready ? <p className="muted app-loading">Загрузка данных…</p> : null}
        {ready && tab === 'menu' ? <MenuTab /> : null}
        {ready && tab === 'cookbook' ? <CookbookTab /> : null}
        {ready && tab === 'shopping' ? <ShoppingTab /> : null}
        {ready && tab === 'prep' ? <PrepTab /> : null}
      </main>

      {accountOpen ? (
        <AccountPanel user={user} onClose={() => setAccountOpen(false)} />
      ) : null}
    </div>
  )
}

function App() {
  return (
    <MenuSyncProvider>
      <AppShell />
    </MenuSyncProvider>
  )
}

export default App
