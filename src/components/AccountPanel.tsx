import { useRef, useState } from 'react'
import type { User } from 'firebase/auth'
import {
  authAccountLabel,
  isLinkedAccount,
  loginWithEmail,
  logoutToGuest,
  mapAuthError,
  registerWithEmail,
} from '../lib/accountAuth'
import { isFirebaseConfigured } from '../firebase'
import { isPlaceholderState } from '../storage/appStore'
import { useEscapeKey } from '../hooks/useEscapeKey'
import { useMenuSync } from '../hooks/useMenuSync'

type Props = {
  user: User | null
  onClose: () => void
}

export function AccountPanel({ user, onClose }: Props) {
  const { state, pushLocalToCloud, importLocalBackup } = useMenuSync()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState<'register' | 'login'>(
    isLinkedAccount(user) ? 'register' : 'login',
  )
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [ok, setOk] = useState<string | null>(null)
  const emailRef = useRef<HTMLInputElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  useEscapeKey(onClose)

  if (!isFirebaseConfigured()) {
    return (
      <div className="modal-backdrop" onClick={onClose} role="presentation">
        <div className="modal account-modal" onClick={(e) => e.stopPropagation()} role="dialog">
          <div className="modal-header">
            <h2>Аккаунт</h2>
            <button type="button" className="modal-close" onClick={onClose} aria-label="Закрыть">
              ×
            </button>
          </div>
          <p className="muted">
            Firebase не настроен — данные только на этом устройстве. Добавьте ключи в{' '}
            <code>.env</code> (см. <code>.env.example</code>).
          </p>
        </div>
      </div>
    )
  }

  const linked = isLinkedAccount(user)

  async function submit() {
    setBusy(true)
    setError(null)
    setOk(null)
    try {
      if (mode === 'register') {
        await registerWithEmail(email, password)
        setOk('Аккаунт создан — данные в облаке под этим email')
      } else {
        await loginWithEmail(email, password)
        setOk('Вход выполнен')
      }
      setPassword('')
    } catch (err) {
      setError(mapAuthError(err))
    } finally {
      setBusy(false)
    }
  }

  async function pushFromDevice() {
    if (isPlaceholderState(state)) {
      setError('На этом устройстве нечего выгружать. Откройте телефон, где ещё видны холодильник и заготовки.')
      return
    }
    setBusy(true)
    setError(null)
    setOk(null)
    try {
      await pushLocalToCloud()
      setOk('Данные с этого устройства записаны в облако')
    } catch (err) {
      setError(mapAuthError(err))
    } finally {
      setBusy(false)
    }
  }

  async function logout() {
    setBusy(true)
    setError(null)
    setOk(null)
    try {
      await logoutToGuest()
      setOk('Вышли. На устройстве снова гостевой режим')
    } catch (err) {
      setError(mapAuthError(err))
    } finally {
      setBusy(false)
    }
  }

  async function importFile(file: File) {
    setBusy(true)
    setError(null)
    setOk(null)
    try {
      const raw = JSON.parse(await file.text()) as unknown
      await importLocalBackup(raw)
      setOk('Копия загружена и записана в облако')
    } catch (err) {
      setError(mapAuthError(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose} role="presentation">
      <div
        className="modal account-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="account-title"
      >
        <div className="modal-header">
          <div>
            <h2 id="account-title">Аккаунт</h2>
            <p className="modal-macros muted">
              Сейчас: <strong>{authAccountLabel(user)}</strong>
            </p>
          </div>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Закрыть">
            ×
          </button>
        </div>

        <div className="modal-body">
          <p className="muted">
            {linked
              ? 'Данные синхронизируются. Если на другом экране пусто — запишите облако с устройства, где ещё видны холодильник и заготовки.'
              : 'Это устройство пока гость — данные другого телефона в облаке. Войдите с тем же email.'}
          </p>

          {linked ? (
            <div className="modal-actions">
              <button
                type="button"
                className="primary-btn"
                disabled={busy || isPlaceholderState(state)}
                onClick={() => void pushFromDevice()}
              >
                Записать это устройство в облако
              </button>
              <button
                type="button"
                className="ghost-btn"
                disabled={busy}
                onClick={() => fileRef.current?.click()}
              >
                Загрузить копию JSON
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="application/json"
                hidden
                onChange={(event) => {
                  const file = event.target.files?.[0]
                  event.target.value = ''
                  if (file) void importFile(file)
                }}
              />
              <button type="button" className="ghost-btn" disabled={busy} onClick={() => void logout()}>
                Выйти
              </button>
            </div>
          ) : (
            <>
              <div className="account-mode">
                <button
                  type="button"
                  className={mode === 'register' ? 'sub-nav-item is-active' : 'sub-nav-item'}
                  onClick={() => setMode('register')}
                >
                  Новый аккаунт
                </button>
                <button
                  type="button"
                  className={mode === 'login' ? 'sub-nav-item is-active' : 'sub-nav-item'}
                  onClick={() => setMode('login')}
                >
                  Войти
                </button>
              </div>

              <label className="field">
                <span className="field-label">Email</span>
                <input
                  ref={emailRef}
                  className="field-input"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </label>
              <label className="field">
                <span className="field-label">Пароль</span>
                <input
                  className="field-input"
                  type="password"
                  autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </label>

              <div className="modal-actions">
                <button
                  type="button"
                  className="primary-btn"
                  disabled={busy}
                  onClick={() => void submit()}
                >
                  {mode === 'register' ? 'Создать' : 'Войти'}
                </button>
              </div>
            </>
          )}

          {error ? <p className="form-error">{error}</p> : null}
          {ok ? <p className="form-ok">{ok}</p> : null}
        </div>
      </div>
    </div>
  )
}
