import type { CookbookStore } from '../data/cookbook'
import { seedStats, migrateMealStats, type MealStatsStore } from '../data/mealStats'

export const APP_STATE_KEY = 'menu-app-state-v1'

export type MenuAppState = {
  cookbook: CookbookStore
  mealStats: MealStatsStore
  checklists: Record<string, Record<string, boolean>>
  updatedAt: number
}

const LEGACY_CHECKLIST_KEYS = [
  'checklist-prep-freezer-v2',
  'checklist-monthly-meat-v2',
  'checklist-monthly-veg-v2',
  'checklist-week-fresh-1',
  'checklist-week-fresh-2',
  'checklist-week-fresh-3',
  'checklist-week-fresh-4',
] as const

export function emptyCookbook(): CookbookStore {
  return { recipes: {}, ratings: {}, customDishes: [] }
}

export function emptyAppState(): MenuAppState {
  return {
    cookbook: emptyCookbook(),
    mealStats: structuredClone(seedStats),
    checklists: {},
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

function migrateLegacyChecklists(): Record<string, Record<string, boolean>> {
  const out: Record<string, Record<string, boolean>> = {}
  for (const key of LEGACY_CHECKLIST_KEYS) {
    try {
      const raw = localStorage.getItem(key)
      if (raw) out[key] = JSON.parse(raw) as Record<string, boolean>
    } catch {
      // ignore
    }
  }
  return out
}

function migrateLegacyState(): MenuAppState {
  const state = emptyAppState()

  try {
    const cookbookRaw = localStorage.getItem('cookbook-v1')
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
    const statsRaw = localStorage.getItem('meal-stats-v1')
    if (statsRaw) {
      state.mealStats = mergeSeedStats(JSON.parse(statsRaw) as MealStatsStore)
    }
  } catch {
    // ignore
  }

  state.checklists = migrateLegacyChecklists()
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
    const parsed = JSON.parse(raw) as MenuAppState
    return {
      cookbook: {
        recipes: parsed.cookbook?.recipes ?? {},
        ratings: parsed.cookbook?.ratings ?? {},
        customDishes: parsed.cookbook?.customDishes ?? [],
      },
      mealStats: mergeSeedStats(parsed.mealStats ?? {}),
      checklists: parsed.checklists ?? {},
      updatedAt: parsed.updatedAt ?? Date.now(),
    }
  } catch {
    return migrateLegacyState()
  }
}

export function saveLocalAppState(state: MenuAppState): void {
  localStorage.setItem(APP_STATE_KEY, JSON.stringify(state))
}

export function normalizeAppState(raw: Partial<MenuAppState> | null): MenuAppState {
  if (!raw) return emptyAppState()
  return {
    cookbook: {
      recipes: raw.cookbook?.recipes ?? {},
      ratings: raw.cookbook?.ratings ?? {},
      customDishes: raw.cookbook?.customDishes ?? [],
    },
    mealStats: mergeSeedStats(raw.mealStats ?? {}),
    checklists: raw.checklists ?? {},
    updatedAt: raw.updatedAt ?? Date.now(),
  }
}
