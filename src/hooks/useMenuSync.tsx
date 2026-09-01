import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import type { User } from 'firebase/auth'
import { isFirebaseConfigured } from '../firebase'
import { isAnonymousSuppressed, watchAuth } from '../lib/accountAuth'
import type { CookbookStore } from '../data/cookbook'
import type { CookBoard } from '../data/cookBoard'
import { resolveCookBoard } from '../data/cookBoard'
import { parsePrepFreezer } from '../data/prep'
import {
  importAppState,
  isPlaceholderState,
  loadLocalAppState,
  normalizeAppState,
  saveLocalAppState,
  shouldApplyCloud,
  type MenuAppState,
} from '../storage/appStore'
import { ensureAuth, subscribeAppState, upsertAppState } from '../storage/cloudSync'

type MenuSyncContextValue = {
  ready: boolean
  user: User | null
  cloudError: string | null
  useCloud: boolean
  state: MenuAppState
  setCookbook: (cookbook: CookbookStore) => void
  setCookBoard: (cookBoard: CookBoard | ((prev: CookBoard) => CookBoard)) => void
  patchState: (updater: (prev: MenuAppState) => MenuAppState) => void
  pushLocalToCloud: () => Promise<void>
  importLocalBackup: (raw: unknown) => Promise<void>
  restoreFoundBackup: () => Promise<boolean>
}

const MenuSyncContext = createContext<MenuSyncContextValue | null>(null)

const CLOUD_DEBOUNCE_MS = 600
const RECOVERED_BACKUP_URL = `${import.meta.env.BASE_URL}recovered-menu-state.json`

function withBoard(state: MenuAppState): MenuAppState {
  return {
    ...state,
    cookBoard: resolveCookBoard(state.cookBoard),
    freezerStock: parsePrepFreezer(state.freezerStock),
  }
}

export function MenuSyncProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<MenuAppState>(() => loadLocalAppState())
  const [uid, setUid] = useState<string | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [ready, setReady] = useState(!isFirebaseConfigured())
  const [cloudError, setCloudError] = useState<string | null>(null)

  const cloudHydrated = useRef(false)
  const prevUidRef = useRef<string | null>(null)
  const pushTimer = useRef<number | null>(null)
  const latestState = useRef(state)
  latestState.current = state

  const persist = useCallback(
    (updater: (prev: MenuAppState) => MenuAppState) => {
      setState((prev) => {
        const next = withBoard({
          ...updater(withBoard(prev)),
          updatedAt: Date.now(),
        })
        saveLocalAppState(next)
        latestState.current = next

        if (uid && cloudHydrated.current) {
          if (pushTimer.current) window.clearTimeout(pushTimer.current)
          pushTimer.current = window.setTimeout(() => {
            void upsertAppState(uid, latestState.current).catch((err) => {
              setCloudError(err instanceof Error ? err.message : 'Ошибка сохранения')
            })
          }, CLOUD_DEBOUNCE_MS)
        }

        return next
      })
    },
    [uid],
  )

  useEffect(() => {
    if (!isFirebaseConfigured()) {
      setReady(true)
      return
    }

    let unsubState: (() => void) | undefined
    let cancelled = false

    const applyCloud = (cloud: MenuAppState) => {
      setState(cloud)
      latestState.current = cloud
      saveLocalAppState(cloud)
    }

    const attachUser = (authUser: User) => {
      const switched =
        prevUidRef.current != null && prevUidRef.current !== authUser.uid
      prevUidRef.current = authUser.uid
      setUser(authUser)
      setUid(authUser.uid)
      setCloudError(null)
      cloudHydrated.current = false
      setReady(false)

      if (pushTimer.current) {
        window.clearTimeout(pushTimer.current)
        pushTimer.current = null
      }

      unsubState?.()
      unsubState = subscribeAppState(authUser.uid, {
        onState: (cloudRaw, { fromCloud }) => {
          if (!fromCloud) return

          const local = latestState.current
          const cloud = cloudRaw ? normalizeAppState(cloudRaw) : null

          if (!cloudHydrated.current) {
            cloudHydrated.current = true
            if (shouldApplyCloud(local, cloud, switched)) {
              applyCloud(cloud!)
            } else {
              void upsertAppState(authUser.uid, local).catch((err) => {
                setCloudError(err instanceof Error ? err.message : 'Ошибка сохранения')
              })
            }
            setReady(true)
            return
          }

          if (shouldApplyCloud(latestState.current, cloud, false)) {
            applyCloud(cloud!)
          }
        },
        onError: (err) => {
          setCloudError(err instanceof Error ? err.message : 'Ошибка синхронизации')
          if (!cloudHydrated.current) {
            cloudHydrated.current = true
            setReady(true)
          }
        },
      })
    }

    const unsubAuth = watchAuth((authUser) => {
      void (async () => {
        try {
          let u = authUser
          if (!u) {
            if (isAnonymousSuppressed()) return
            u = await ensureAuth()
          }
          if (cancelled || !u) {
            setReady(true)
            return
          }
          attachUser(u)
        } catch (err) {
          if (!cancelled) {
            setCloudError(err instanceof Error ? err.message : 'Не удалось войти')
            setReady(true)
          }
        }
      })()
    })

    return () => {
      cancelled = true
      unsubAuth()
      unsubState?.()
      if (pushTimer.current) window.clearTimeout(pushTimer.current)
    }
  }, [])

  const setCookbook = useCallback(
    (cookbook: CookbookStore) => {
      persist((prev) => ({ ...prev, cookbook }))
    },
    [persist],
  )

  const setCookBoard = useCallback(
    (cookBoard: CookBoard | ((prev: CookBoard) => CookBoard)) => {
      persist((prev) => ({
        ...prev,
        cookBoard: typeof cookBoard === 'function' ? cookBoard(prev.cookBoard) : cookBoard,
      }))
    },
    [persist],
  )

  const applyImported = useCallback(
    async (raw: unknown) => {
      if (!uid) throw new Error('Сначала войдите в аккаунт')
      const next = withBoard(importAppState(raw))
      if (isPlaceholderState(next)) {
        throw new Error('В файле нет заготовок и плана')
      }
      saveLocalAppState(next)
      latestState.current = next
      setState(next)
      cloudHydrated.current = true
      await upsertAppState(uid, next)
    },
    [uid],
  )

  const restoreFoundBackup = useCallback(async () => {
    const res = await fetch(RECOVERED_BACKUP_URL)
    if (!res.ok) return false
    await applyImported(await res.json())
    return true
  }, [applyImported])

  const restoreTried = useRef(false)
  useEffect(() => {
    if (!import.meta.env.DEV || restoreTried.current) return
    if (!ready || !uid || !user || user.isAnonymous) return
    if (!isPlaceholderState(state)) return
    restoreTried.current = true
    void restoreFoundBackup().then((ok) => {
      if (!ok) restoreTried.current = false
    }).catch(() => {
      restoreTried.current = false
    })
  }, [ready, uid, user, state, restoreFoundBackup])

  const pushLocalToCloud = useCallback(async () => {
    if (!uid) throw new Error('Сначала войдите в аккаунт')
    const next = withBoard({
      ...latestState.current,
      updatedAt: Date.now(),
    })
    saveLocalAppState(next)
    latestState.current = next
    setState(next)
    cloudHydrated.current = true
    await upsertAppState(uid, next)
  }, [uid])

  const value = useMemo<MenuSyncContextValue>(
    () => ({
      ready,
      user,
      cloudError,
      useCloud: Boolean(uid),
      state: withBoard(state),
      setCookbook,
      setCookBoard,
      patchState: persist,
      pushLocalToCloud,
      importLocalBackup: applyImported,
      restoreFoundBackup,
    }),
    [ready, user, cloudError, uid, state, setCookbook, setCookBoard, persist, pushLocalToCloud, applyImported, restoreFoundBackup],
  )

  return <MenuSyncContext.Provider value={value}>{children}</MenuSyncContext.Provider>
}

export function useMenuSync(): MenuSyncContextValue {
  const ctx = useContext(MenuSyncContext)
  if (!ctx) throw new Error('useMenuSync must be used within MenuSyncProvider')
  return ctx
}
