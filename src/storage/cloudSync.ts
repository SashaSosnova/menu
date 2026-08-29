import { doc, onSnapshot, setDoc, type Unsubscribe } from 'firebase/firestore'
import { onAuthStateChanged, signInAnonymously, signOut, type User } from 'firebase/auth'
import { getFirebaseAuth, getFirebaseDb, isFirebaseConfigured } from '../firebase'
import { isAnonymousSuppressed } from '../lib/authGate'
import type { MenuAppState } from './appStore'

const STATE_DOC = 'state'

/** Top-level collection in kid-sheduler (рядом с planer). */
export const MENU_COLLECTION = 'menu'

function stateDocRef(uid: string) {
  return doc(getFirebaseDb(), MENU_COLLECTION, uid, 'meta', STATE_DOC)
}

export async function ensureAuth(): Promise<User | null> {
  if (!isFirebaseConfigured()) return null
  const auth = getFirebaseAuth()
  if (auth.currentUser) return auth.currentUser
  if (isAnonymousSuppressed()) return null
  return new Promise((resolve, reject) => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      unsub()
      if (user) {
        resolve(user)
        return
      }
      if (auth.currentUser) {
        resolve(auth.currentUser)
        return
      }
      if (isAnonymousSuppressed()) {
        resolve(null)
        return
      }
      try {
        const cred = await signInAnonymously(auth)
        const current = (auth.currentUser ?? cred.user) as User
        if (!current.isAnonymous) {
          resolve(current)
          return
        }
        if (isAnonymousSuppressed()) {
          try {
            await signOut(auth)
          } catch {
            // ignore
          }
          const again = auth.currentUser as User | null
          resolve(again && !again.isAnonymous ? again : null)
          return
        }
        resolve(current)
      } catch (err) {
        const fallback = auth.currentUser as User | null
        if (fallback) {
          resolve(fallback)
          return
        }
        reject(err)
      }
    })
  })
}

function stripUndefined(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(stripUndefined)
  }
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      if (v === undefined) continue
      out[k] = stripUndefined(v)
    }
    return out
  }
  return value
}

export async function upsertAppState(uid: string, state: MenuAppState): Promise<void> {
  const payload = stripUndefined({
    ...state,
    updatedAt: state.updatedAt || Date.now(),
  }) as Record<string, unknown>
  await setDoc(stateDocRef(uid), payload, { merge: true })
}

export function subscribeAppState(
  uid: string,
  handlers: {
    onState: (state: MenuAppState | null, meta: { fromCloud: boolean }) => void
    onError?: (err: unknown) => void
  },
): Unsubscribe {
  return onSnapshot(
    stateDocRef(uid),
    (snap) => {
      if (!snap.exists()) {
        handlers.onState(null, { fromCloud: true })
        return
      }
      handlers.onState(snap.data() as MenuAppState, { fromCloud: true })
    },
    (err) => handlers.onError?.(err),
  )
}
