import { useMemo, useState } from 'react'
import { getDish } from '../data/dishes'
import { formatMacros } from '../lib/macros'
import {
  createCustomDishId,
  getCookbookDishes,
  getCookbookDish,
  getEffectiveRecipe,
  hasRecipeOverride,
  isCustomDish,
  removeCustomDish,
  type CookbookStore,
  type CustomDish,
  type RecipeOverride,
} from '../data/cookbook'
import type { Dish } from '../data/types'
import { useMenuSync } from '../hooks/useMenuSync'
import { formatPortionYieldLine } from '../lib/recipeServings'
import { joinRecipeSteps, splitRecipeSteps, stripAutoPrepPackStep } from '../lib/recipeSteps'
import { ChildEatsMark } from './ChildEatsMark'
import { RecipeStepsList } from './RecipeStepsList'
import { useEscapeKey } from '../hooks/useEscapeKey'
import { cycleMains, menuRefIds } from '../data/menu'

type EditDraft = {
  name: string
  servings: string
  ingredientsText: string
  steps: string
  storage: string
  note: string
}

type CookbookSection = 'mains' | 'sides' | 'extras'

function sectionToKind(section: CookbookSection): CustomDish['kind'] {
  if (section === 'mains') return 'component'
  if (section === 'extras') return 'extra'
  return 'side'
}

function draftFromDish(dish: Dish, store: CookbookStore): EditDraft {
  const recipe = getEffectiveRecipe(dish.id, store)
  const override = store.recipes[dish.id]
  const servings = recipe?.servings
    ? formatPortionYieldLine(dish.id, recipe.servings)
    : ''
  return {
    name: dish.name,
    servings,
    ingredientsText: (recipe?.ingredients ?? []).join('\n'),
    steps: splitRecipeSteps(recipe?.steps ?? '').join('\n'),
    storage: recipe?.storage ?? '',
    note: override?.note ?? '',
  }
}

function parseIngredients(text: string): string[] {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
}

function emptyDraft(): EditDraft {
  return {
    name: '',
    servings: '',
    ingredientsText: '',
    steps: '',
    storage: '',
    note: '',
  }
}

function RecipeFormFields({
  draft,
  onChange,
  showName,
  showKind,
  kind,
  onKindChange,
}: {
  draft: EditDraft
  onChange: (draft: EditDraft) => void
  showName?: boolean
  showKind?: boolean
  kind?: CookbookSection
  onKindChange?: (section: CookbookSection) => void
}) {
  return (
    <>
      {showKind && kind && onKindChange ? (
        <div className="field">
          <span className="field-label">Тип</span>
          <div className="kind-picker">
            <button
              type="button"
              className={kind === 'mains' ? 'kind-picker-btn is-active' : 'kind-picker-btn'}
              onClick={() => onKindChange('mains')}
            >
              Горячее
            </button>
            <button
              type="button"
              className={kind === 'sides' ? 'kind-picker-btn is-active' : 'kind-picker-btn'}
              onClick={() => onKindChange('sides')}
            >
              Гарнир
            </button>
            <button
              type="button"
              className={kind === 'extras' ? 'kind-picker-btn is-active' : 'kind-picker-btn'}
              onClick={() => onKindChange('extras')}
            >
              Дополнительно
            </button>
          </div>
        </div>
      ) : null}
      {showName ? (
        <label className="field">
          <span className="field-label">Название</span>
          <input
            className="field-input"
            value={draft.name}
            onChange={(e) => onChange({ ...draft, name: e.target.value })}
            placeholder="Бефстроганов"
            autoFocus
          />
        </label>
      ) : null}
      <label className="field">
        <span className="field-label">Порции</span>
        <input
          className="field-input"
          value={draft.servings}
          onChange={(e) => onChange({ ...draft, servings: e.target.value })}
          placeholder="6 порций — 1200 г"
        />
      </label>
      <label className="field">
        <span className="field-label">Ингредиенты — по одному на строку</span>
        <textarea
          className="field-textarea"
          rows={8}
          value={draft.ingredientsText}
          onChange={(e) => onChange({ ...draft, ingredientsText: e.target.value })}
        />
      </label>
      <label className="field">
        <span className="field-label">Как готовить — по одному шагу на строку</span>
        <textarea
          className="field-textarea"
          rows={10}
          value={draft.steps}
          onChange={(e) => onChange({ ...draft, steps: e.target.value })}
          placeholder={'Лук, морковь, сельдерей мелко\nОбжарить на масле 12–15 мин\nДобавить фарш'}
        />
      </label>
      <label className="field">
        <span className="field-label">Хранение</span>
        <input
          className="field-input"
          value={draft.storage}
          onChange={(e) => onChange({ ...draft, storage: e.target.value })}
          placeholder="3–4 дня"
        />
      </label>
      <label className="field">
        <span className="field-label">Личная заметка</span>
        <textarea
          className="field-textarea"
          rows={2}
          value={draft.note}
          onChange={(e) => onChange({ ...draft, note: e.target.value })}
          placeholder="Меньше соли, больше чеснока…"
        />
      </label>
    </>
  )
}

function AddRecipeModal({
  defaultSection,
  store,
  onClose,
  onSave,
}: {
  defaultSection: CookbookSection
  store: CookbookStore
  onClose: () => void
  onSave: (store: CookbookStore, newId: string, section: CookbookSection) => void
}) {
  const [section, setSection] = useState<CookbookSection>(defaultSection)
  const [draft, setDraft] = useState(emptyDraft)
  useEscapeKey(onClose)

  function save() {
    const name = draft.name.trim()
    if (!name) return

    const id = createCustomDishId()
    const custom: CustomDish = { id, name, kind: sectionToKind(section) }
    const override: RecipeOverride = {
      servings: draft.servings.trim(),
      ingredients: parseIngredients(draft.ingredientsText),
      steps: joinRecipeSteps(splitRecipeSteps(draft.steps)),
      storage: draft.storage.trim() || undefined,
      note: draft.note.trim() || undefined,
    }
    const next: CookbookStore = {
      ...store,
      customDishes: [...(store.customDishes ?? []), custom],
      recipes: { ...store.recipes, [id]: override },
    }
    onSave(next, id, section)
  }

  return (
    <div className="modal-backdrop" onClick={onClose} role="presentation">
      <div
        className="modal cookbook-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="add-recipe-title"
      >
        <div className="modal-header">
          <div>
            <h2 id="add-recipe-title">Новый рецепт</h2>
            <p className="modal-macros muted">Сохранится в книге на этом устройстве</p>
          </div>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Закрыть">
            ×
          </button>
        </div>

        <div className="modal-body">
          <RecipeFormFields
            draft={draft}
            onChange={setDraft}
            showName
            showKind
            kind={section}
            onKindChange={setSection}
          />
          <div className="modal-actions">
            <button
              type="button"
              className="primary-btn"
              onClick={save}
              disabled={!draft.name.trim()}
            >
              Добавить
            </button>
            <button type="button" className="ghost-btn" onClick={onClose}>
              Отмена
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function RecipeModal({
  dish,
  store,
  onClose,
  onSave,
  onOpenMate,
}: {
  dish: Dish
  store: CookbookStore
  onClose: () => void
  onSave: (store: CookbookStore) => void
  onOpenMate?: (id: string) => void
}) {
  const custom = isCustomDish(dish.id, store)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(() => draftFromDish(dish, store))
  const recipe = getEffectiveRecipe(dish.id, store)
  const isEdited = hasRecipeOverride(dish.id, store)
  const mateIds = menuRefIds(
    cycleMains.find((item) => menuRefIds(item).includes(dish.id)) ?? { dishId: dish.id },
  ).filter((id) => id !== dish.id)
  useEscapeKey(onClose)

  function patchStore(next: CookbookStore) {
    onSave(next)
  }

  function saveEdits() {
    const name = draft.name.trim()
    if (!name) return

    const catalogName = getDish(dish.id)?.name
    const override: RecipeOverride = {
      ...(custom || name === catalogName ? {} : { name }),
      servings: draft.servings.trim(),
      ingredients: parseIngredients(draft.ingredientsText),
      steps: joinRecipeSteps(
        splitRecipeSteps(stripAutoPrepPackStep(dish.id, draft.steps)),
      ),
      storage: draft.storage.trim() || undefined,
      note: draft.note.trim() || undefined,
    }

    let next: CookbookStore = {
      ...store,
      recipes: { ...store.recipes, [dish.id]: override },
    }

    if (custom) {
      next = {
        ...next,
        customDishes: (store.customDishes ?? []).map((d) =>
          d.id === dish.id ? { ...d, name } : d,
        ),
      }
    }

    patchStore(next)
    setEditing(false)
  }

  function deleteRecipe() {
    patchStore(removeCustomDish(store, dish.id))
    onClose()
  }

  function cancelEdit() {
    setDraft(draftFromDish(dish, store))
    setEditing(false)
  }

  const displayDish = getCookbookDish(dish.id, store) ?? dish
  const cycleRef = cycleMains.find((item) => menuRefIds(item).includes(dish.id))
  const combinedName = cycleRef?.orDishIds?.length
    ? menuRefIds(cycleRef)
        .map((id) => getCookbookDish(id, store)?.name ?? getDish(id)?.name ?? id)
        .join(' / ')
    : displayDish.name
  const title = editing ? draft.name || displayDish.name : combinedName
  const yieldLine = recipe?.servings
    ? formatPortionYieldLine(dish.id, recipe.servings)
    : ''

  return (
    <div className="modal-backdrop" onClick={onClose} role="presentation">
      <div
        className="modal cookbook-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby={`recipe-${dish.id}`}
      >
        <div className="modal-header">
          <div>
            <h2 id={`recipe-${dish.id}`} className="menu-recipe-title">
              {title}
              <ChildEatsMark dishId={dish.id} />
            </h2>
            <p className="modal-macros muted">
              {custom ? 'свой рецепт · ' : null}
              {displayDish.kind === 'complete' ? 'полноценное · ' : null}
              {displayDish.kind === 'side' ? 'гарнир · ' : null}
              {displayDish.kind === 'component' ? 'горячее · ' : null}
              {displayDish.kind === 'extra' ? 'дополнение · ' : null}
              {'macros' in displayDish && displayDish.macros
                ? `КБЖУ ${formatMacros(displayDish.macros)} на 100 г`
                : 'без КБЖУ'}
            </p>
          </div>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Закрыть">
            ×
          </button>
        </div>

        <div className="modal-body">
          {!editing ? (
            <>
              {recipe ? (
                <>
                  {yieldLine ? <p className="muted">{yieldLine}</p> : null}
                  {isEdited && !custom ? <p className="edited-tag">редактировано</p> : null}
                  {store.recipes[dish.id]?.note ? (
                    <>
                      <h3>Заметка</h3>
                      <p className="steps">{store.recipes[dish.id].note}</p>
                    </>
                  ) : null}
                  {recipe.ingredients.length > 0 ? (
                    <>
                      <h3>Ингредиенты</h3>
                      <ul className="ingredient-list">
                        {recipe.ingredients.map((line) => (
                          <li key={line}>{line}</li>
                        ))}
                      </ul>
                    </>
                  ) : null}
                  {recipe.steps ? (
                    <>
                      <h3>Как готовить</h3>
                      <RecipeStepsList steps={recipe.steps} />
                    </>
                  ) : null}
                  {recipe.storage ? (
                    <>
                      <h3>Хранение</h3>
                      <p>{recipe.storage}</p>
                    </>
                  ) : null}
                  {mateIds.map((id) => {
                    const mate = getCookbookDish(id, store) ?? getDish(id)
                    const mateRecipe = getEffectiveRecipe(id, store)
                    if (!mate || !mateRecipe) return null
                    return (
                      <div key={id} className="menu-recipe-variant">
                        <h3>{mate.name}</h3>
                        {mateRecipe.servings ? (
                          <p className="muted">{formatPortionYieldLine(id, mateRecipe.servings)}</p>
                        ) : null}
                        {onOpenMate ? (
                          <button
                            type="button"
                            className="link-btn"
                            onClick={() => onOpenMate(id)}
                          >
                            Открыть этот вариант
                          </button>
                        ) : null}
                      </div>
                    )
                  })}
                </>
              ) : (
                <p className="muted">Рецепт пока пуст — нажми «Редактировать», чтобы добавить.</p>
              )}
              <div className="modal-actions">
                <button type="button" className="primary-btn" onClick={() => setEditing(true)}>
                  Редактировать
                </button>
                {custom ? (
                  <button type="button" className="ghost-btn danger" onClick={deleteRecipe}>
                    Удалить
                  </button>
                ) : null}
              </div>
            </>
          ) : (
            <>
              <RecipeFormFields
                draft={draft}
                onChange={setDraft}
                showName
              />
              <div className="modal-actions">
                <button
                  type="button"
                  className="primary-btn"
                  onClick={saveEdits}
                  disabled={!draft.name.trim()}
                >
                  Сохранить
                </button>
                <button type="button" className="ghost-btn" onClick={cancelEdit}>
                  Отмена
                </button>
                {custom ? (
                  <button type="button" className="ghost-btn danger" onClick={deleteRecipe}>
                    Удалить
                  </button>
                ) : null}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function RecipeRow({
  dish,
  store,
  onOpen,
}: {
  dish: Dish
  store: CookbookStore
  onOpen: () => void
}) {
  const custom = isCustomDish(dish.id, store)
  const recipe = getEffectiveRecipe(dish.id, store)
  const yieldLine = recipe?.servings
    ? formatPortionYieldLine(dish.id, recipe.servings)
    : ''
  const cycleRef = cycleMains.find((item) => item.dishId === dish.id)
  const name = cycleRef?.orDishIds?.length
    ? menuRefIds(cycleRef)
        .map((id) => getCookbookDish(id, store)?.name ?? getDish(id)?.name ?? id)
        .join(' / ')
    : dish.name

  return (
    <button type="button" className="recipe-row" onClick={onOpen}>
      <span className="recipe-row-main">
        <span className="recipe-card-title">
          {name}
          {custom ? <span className="custom-tag">своё</span> : null}
          <ChildEatsMark dishId={dish.id} />
        </span>
      </span>
      {yieldLine ? <span className="recipe-row-yield">{yieldLine}</span> : null}
    </button>
  )
}

export function CookbookTab() {
  const { state, setCookbook } = useMenuSync()
  const store = state.cookbook
  const [section, setSection] = useState<CookbookSection>('mains')
  const [query, setQuery] = useState('')
  const [openId, setOpenId] = useState<string | null>(null)
  const [adding, setAdding] = useState(false)

  const { mains, sides, extras } = useMemo(() => getCookbookDishes(store), [store])

  function matches(dish: Dish): boolean {
    const q = query.trim().toLowerCase()
    if (!q) return true
    if (dish.name.toLowerCase().includes(q)) return true
    const ref = cycleMains.find((item) => item.dishId === dish.id)
    if (!ref?.orDishIds?.length) return false
    return menuRefIds(ref).some((id) =>
      (getCookbookDish(id, store)?.name ?? getDish(id)?.name ?? '').toLowerCase().includes(q),
    )
  }

  const filteredMains = mains.filter(matches)
  const filteredSides = sides.filter(matches)
  const filteredExtras = extras.filter(matches)
  const visible =
    section === 'mains'
      ? filteredMains
      : section === 'extras'
        ? filteredExtras
        : filteredSides
  const openDish = openId ? getCookbookDish(openId, store) : undefined

  function handleAdded(next: CookbookStore, newId: string, newSection: CookbookSection) {
    setCookbook(next)
    setAdding(false)
    setSection(newSection)
    setOpenId(newId)
  }

  return (
    <section className="view cookbook-view">
      <div className="view-heading">
        <h2>Кулинарная книга</h2>
        <p className="muted">
          {section === 'extras'
            ? 'Добавки к тарелке — рядом с основным гарниром и горячим, не вместо них.'
            : 'Рецепты синхронизируются с облаком после входа.'}
        </p>
      </div>

      <nav className="sub-nav" aria-label="Раздел книги">
        <button
          type="button"
          className={section === 'mains' ? 'sub-nav-item is-active' : 'sub-nav-item'}
          onClick={() => setSection('mains')}
        >
          Горячее · {filteredMains.length}
        </button>
        <button
          type="button"
          className={section === 'sides' ? 'sub-nav-item is-active' : 'sub-nav-item'}
          onClick={() => setSection('sides')}
        >
          Гарниры · {filteredSides.length}
        </button>
        {extras.length > 0 ? (
          <button
            type="button"
            className={section === 'extras' ? 'sub-nav-item is-active' : 'sub-nav-item'}
            onClick={() => setSection('extras')}
          >
            Дополнительно · {filteredExtras.length}
          </button>
        ) : null}
      </nav>

      <div className="cookbook-toolbar block">
        <label className="field field-inline">
          <span className="field-label">Поиск</span>
          <input
            className="field-input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Название блюда…"
          />
        </label>
      </div>

      <section className="block cookbook-list">
        <ul className="recipe-list">
          {visible.map((dish) => (
            <li key={dish.id}>
              <RecipeRow dish={dish} store={store} onOpen={() => setOpenId(dish.id)} />
            </li>
          ))}
        </ul>
        {visible.length === 0 ? <p className="muted">Ничего не нашлось.</p> : null}
      </section>

      <button
        type="button"
        className="fab"
        onClick={() => setAdding(true)}
        aria-label="Добавить рецепт"
        title="Добавить рецепт"
      >
        +
      </button>

      {adding ? (
        <AddRecipeModal
          defaultSection={section}
          store={store}
          onClose={() => setAdding(false)}
          onSave={handleAdded}
        />
      ) : null}

      {openDish ? (
        <RecipeModal
          key={openDish.id}
          dish={openDish}
          store={store}
          onClose={() => setOpenId(null)}
          onSave={setCookbook}
          onOpenMate={setOpenId}
        />
      ) : null}
    </section>
  )
}
