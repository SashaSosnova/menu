import { splitRecipeSteps } from '../lib/recipeSteps'

export function RecipeStepsList({ steps }: { steps: string }) {
  const items = splitRecipeSteps(steps)
  if (items.length === 0) return null

  return (
    <ol className="step-list">
      {items.map((step, index) => (
        <li key={index}>{step}</li>
      ))}
    </ol>
  )
}
