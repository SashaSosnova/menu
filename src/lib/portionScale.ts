export const PORTION_SCALE_MIN = 0.7
export const PORTION_SCALE_MAX = 1.4

export type PortionScales = Record<string, number>

export function normalizePortionScale(n: number | undefined): number {
  if (n == null || !Number.isFinite(n) || Math.abs(n - 1) < 0.001) return 1
  const rounded = Math.round(n * 10) / 10
  return Math.min(PORTION_SCALE_MAX, Math.max(PORTION_SCALE_MIN, rounded))
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
  const parsed = parseIngredientAmount(line)
  if (parsed.qty == null) return line
  return `${parsed.name} ${formatScaledNumber(parsed.qty * scale)} ${parsed.unit}`
}

export function parseIngredientAmount(line: string): {
  name: string
  qty: number | null
  unit: string
} {
  const trimmed = line.trim()
  const m = trimmed.match(QTY_AT_END)
  if (!m) return { name: trimmed, qty: null, unit: '' }
  return {
    name: m[1].trim(),
    qty: Number(m[2].replace(',', '.')),
    unit: m[4].replace(/\s+/g, ' '),
  }
}
