export const PORTION_SCALE_STEP = 0.1
export const PORTION_SCALE_MIN = 0.7
export const PORTION_SCALE_MAX = 1.4

export type PortionScales = Record<string, number>

export function normalizePortionScale(n: number | undefined): number {
  if (n == null || !Number.isFinite(n) || Math.abs(n - 1) < 0.001) return 1
  const rounded = Math.round(n * 10) / 10
  return Math.min(PORTION_SCALE_MAX, Math.max(PORTION_SCALE_MIN, rounded))
}

export function bumpPortionScale(current: number | undefined, dir: 1 | -1): number {
  return normalizePortionScale((current ?? 1) + dir * PORTION_SCALE_STEP)
}

export function formatPortionScale(scale: number | undefined): string {
  return `${Math.round(normalizePortionScale(scale) * 100)}%`
}

function formatScaledNumber(n: number): string {
  if (n >= 50) return String(Math.round(n / 5) * 5)
  if (n >= 10) return String(Math.round(n))
  const r = Math.round(n * 10) / 10
  return Number.isInteger(r) ? String(r) : String(r).replace('.', ',')
}

const QTY_AT_END =
  /^(.*?)(\d+(?:[,.]\d+)?)(\s*)(г|кг|мл|л|шт|пучок|пучка|головк[аи]|банк[аи]|ст\.?\s*л\.?|ч\.?\s*л\.?)\s*$/i

/** Масштаб количества в строке ингредиента (число у единицы в конце). */
export function scaleIngredientLine(line: string, factor: number): string {
  const scale = normalizePortionScale(factor)
  if (scale === 1) return line
  const m = line.match(QTY_AT_END)
  if (!m) return line
  const value = Number(m[2].replace(',', '.')) * scale
  return `${m[1]}${formatScaledNumber(value)}${m[3]}${m[4]}`
}

export function scaleIngredientLines(lines: string[], factor: number): string[] {
  const scale = normalizePortionScale(factor)
  if (scale === 1) return lines
  return lines.map((line) => scaleIngredientLine(line, scale))
}
