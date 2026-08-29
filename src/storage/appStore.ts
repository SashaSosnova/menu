import { COOKBOOK_KEY, type CookbookStore } from '../data/cookbook'
import { seedStats, migrateMealStats, MEAL_STATS_KEY, type MealStatsStore } from '../data/mealStats'
import type { MenuOverrides } from '../data/menuOverrides'
import type { PortionScales } from '../lib/portionScale'
import { emptyCookBoard, resolveCookBoard, type CookBoard } from '../data/cookBoard'
import { parsePrepFreezer, type PrepFreezer } from '../data/prep'

export const APP_STATE_KEY = 'menu-app-state-v1'

/** Старый ключ галочек морозилки — только для миграции. */
const LEGACY_FREEZER_KEY = 'checklist-prep-freezer-v2'

export type MenuAppState = {
  cookbook: CookbookStore
  mealStats: MealStatsStore
  /** Пакеты в морозилке с датой заготовки (YYYY-MM-DD). */
  freezerStock: PrepFreezer
  menuOverrides: MenuOverrides
  portionScales: PortionScales
  cookBoard: CookBoard
  updatedAt: number
}

type PersistedAppState = Partial<MenuAppState> & {
  checklists?: Record<string, unknown>
}

function emptyCookbook(): CookbookStore {
  return { recipes: {}, ratings: {}, customDishes: [] }
}

export function emptyAppState(): MenuAppState {
  return {
    cookbook: emptyCookbook(),
    mealStats: structuredClone(seedStats),
    freezerStock: {},
    menuOverrides: {},
    portionScales: {},
    cookBoard: resolveCookBoard(emptyCookBoard()),
    updatedAt: Date.now(),
  }
}

function mergeSeedStats(stats: MealStatsStore): MealStatsStore {
  const migrated = migrateMealStats(stats)
  const next = { ...migrated }
  for (const [key, value] of Object.entries(seedStats)) {
    if (!next[key]) next[key] = structuredClone(value)
  }
  return next
}

function resolveFreezerStock(raw: PersistedAppState | null | undefined): {
  freezerStock: PrepFreezer
  migrated: boolean
} {
  if (raw && 'freezerStock' in raw && raw.freezerStock !== undefined) {
    return { freezerStock: parsePrepFreezer(raw.freezerStock), migrated: false }
  }
  return {
    freezerStock: parsePrepFreezer(raw?.checklists?.[LEGACY_FREEZER_KEY]),
    migrated: true,
  }
}

function readStandaloneFreezer(): unknown {
  try {
    const raw = localStorage.getItem(LEGACY_FREEZER_KEY)
    if (raw) return JSON.parse(raw)
  } catch {
    // ignore
  }
  return undefined
}

function hydrateState(raw: PersistedAppState): { state: MenuAppState; dirty: boolean } {
  const prev = raw.cookBoard
  const cookBoard = resolveCookBoard(prev)
  const seeded =
    Object.keys(prev?.cooked ?? {}).length === 0 && Object.keys(cookBoard.cooked).length > 0
  const prevPatches = new Set(prev?.patches ?? [])
  const patched = (cookBoard.patches ?? []).some((p) => !prevPatches.has(p))
  const { freezerStock, migrated } = resolveFreezerStock(raw)
  const dirty = seeded || patched || migrated
  return {
    state: {
      cookbook: {
        recipes: raw.cookbook?.recipes ?? {},
        ratings: raw.cookbook?.ratings ?? {},
        customDishes: raw.cookbook?.customDishes ?? [],
      },
      mealStats: mergeSeedStats(raw.mealStats ?? {}),
      freezerStock,
      menuOverrides: raw.menuOverrides ?? {},
      portionScales: raw.portionScales ?? {},
      cookBoard,
      updatedAt: dirty ? Date.now() : (raw.updatedAt ?? Date.now()),
    },
    dirty,
  }
}

function migrateLegacyState(): MenuAppState {
  const state = emptyAppState()

  try {
    const cookbookRaw = localStorage.getItem(COOKBOOK_KEY)
    if (cookbookRaw) {
      const parsed = JSON.parse(cookbookRaw) as CookbookStore
      state.cookbook = {
        recipes: parsed.recipes ?? {},
        ratings: parsed.ratings ?? {},
        customDishes: parsed.customDishes ?? [],
      }
    }
  } catch {
    // ignore
  }

  try {
    const statsRaw = localStorage.getItem(MEAL_STATS_KEY)
    if (statsRaw) {
      state.mealStats = mergeSeedStats(JSON.parse(statsRaw) as MealStatsStore)
    }
  } catch {
    // ignore
  }

  state.freezerStock = parsePrepFreezer(readStandaloneFreezer())
  state.updatedAt = Date.now()
  return state
}

export function loadLocalAppState(): MenuAppState {
  try {
    const raw = localStorage.getItem(APP_STATE_KEY)
    if (!raw) {
      const migrated = migrateLegacyState()
      saveLocalAppState(migrated)
      return migrated
    }
    const parsed = JSON.parse(raw) as PersistedAppState
    const { state, dirty } = hydrateState(parsed)
    if (dirty) saveLocalAppState(state)
    return state
  } catch {
    return migrateLegacyState()
  }
}

export function saveLocalAppState(state: MenuAppState): void {
  localStorage.setItem(APP_STATE_KEY, JSON.stringify(state))
}

export function normalizeAppState(raw: PersistedAppState | null): MenuAppState {
  if (!raw) return emptyAppState()
  return hydrateState(raw).state
}
