import { useEffect, useState } from 'react'
import './App.css'
import { MenuTab } from './components/MenuTab'
import { PrepTab } from './components/PrepTab'
import { CookbookTab } from './components/CookbookTab'
import { AccountPanel } from './components/AccountPanel'
import { MenuSyncProvider, useMenuSync } from './hooks/useMenuSync'
import { authAccountLabel, isLinkedAccount } from './lib/accountAuth'
import { isFirebaseConfigured } from './firebase'
import { isPlaceholderState } from './storage/appStore'

type TabId = 'menu' | 'cookbook' | 'prep'

const tabs: { id: TabId; label: string }[] = [
  { id: 'menu', label: 'Меню' },
  { id: 'prep', label: 'Заготовки' },
  { id: 'cookbook', label: 'Книга' },
]

function RestoreBackupBar() {
  const { ready, user, state, restoreFoundBackup } = useMenuSync()
  const [available, setAvailable] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!ready || !isPlaceholderState(state)) {
      setAvailable(false)
      return
    }
    void fetch(`${import.meta.env.BASE_URL}recovered-menu-state.json`).then((res) => {
      setAvailable(res.ok)
    })
  }, [ready, state])

  if (!available) return null

  const linked = isLinkedAccount(user)

  return (
    <div className="restore-banner">
      <p>
        На этом компьютере найдена копия: 9 пакетов в морозилке, в плане крылья и ножки.
        {linked ? '' : ' Сначала войдите в аккаунт, потом восстановите.'}
      </p>
      <button
        type="button"
        className="primary-btn"
        disabled={busy || !linked}
        onClick={() => {
          setBusy(true)
          setError(null)
          void restoreFoundBackup()
            .then((ok) => {
              if (!ok) setError('Копию не удалось прочитать')
            })
            .catch((err: unknown) => {
              setError(err instanceof Error ? err.message : 'Ошибка восстановления')
            })
            .finally(() => setBusy(false))
        }}
      >
        Восстановить копию
      </button>
      {error ? <p className="form-error">{error}</p> : null}
    </div>
  )
}

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
        <h1 className="brand">{tabs.find((t) => t.id === tab)?.label ?? 'Меню'}</h1>
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
      <RestoreBackupBar />

      <main className="main">
        {!ready ? <p className="muted app-loading">Загрузка данных…</p> : null}
        {ready && tab === 'menu' ? <MenuTab /> : null}
        {ready && tab === 'cookbook' ? <CookbookTab /> : null}
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
