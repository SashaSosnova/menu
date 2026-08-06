import { dishes } from '../src/data/dishes.ts'
import { dishMeta } from '../src/data/dishMeta.ts'
import { weekMenus } from '../src/data/menu.ts'

/** Горячее на 2 приёма — весь вес блюда (мясо + овощи + соусы), не только белок */
const TARGET = 900
/** Цельное на 2 приёма ≈ горячее + гарнир */
const COMPLETE_TARGET = 1600

function grams(line: string): number {
  const m = line.match(/(\d+(?:[.,]\d+)?)\s*(?:г|мл)/i)
  return m ? Number(m[1].replace(',', '.')) : 0
}

function solidTotal(ings: string[]): number {
  return ings
    .filter((l) => !/^—/.test(l) && !/^А\)/.test(l) && !/^Б\)/.test(l))
    .reduce((s, l) => s + grams(l), 0)
}

const hotIds = new Set<string>()
for (const w of weekMenus) {
  for (const slot of w.slots) {
    for (const m of slot.mains) hotIds.add(m.dishId)
    if (slot.complete) hotIds.add(slot.complete.dishId)
  }
}

const rows = [...hotIds]
  .map((id) => {
    const d = dishes[id]
    const ings = d?.recipe?.ingredients ?? []
    const solid = solidTotal(ings)
    const complete = dishMeta[id]?.kind === 'complete'
    const target = complete ? COMPLETE_TARGET : TARGET
    return {
      id,
      name: d?.name ?? id,
      solid,
      complete,
      target,
      delta: solid - target,
    }
  })
  .sort((a, b) => a.delta - b.delta)

for (const r of rows) {
  const mark = Math.abs(r.delta) <= 150 ? 'OK' : r.delta < 0 ? 'LOW' : 'HIGH'
  const kind = r.complete ? 'цельное' : 'горячее'
  console.log(
    `${mark.padEnd(4)} ${String(r.solid).padStart(4)} г (цель ${r.target}, Δ${r.delta >= 0 ? '+' : ''}${r.delta})  ${r.name} [${kind}]`,
  )
}
