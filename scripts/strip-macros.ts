import { readFileSync, writeFileSync } from 'node:fs'

const files = ['src/data/dishes.ts', 'src/data/extraDishes.ts']

for (const file of files) {
  const before = readFileSync(file, 'utf8')
  const after = before.replace(/^\s*macros:\s*\{[^}]+\},\s*\n/gm, '')
  if (after === before) {
    console.log(`${file}: no macros lines`)
  } else {
    writeFileSync(file, after, 'utf8')
    const n = (before.match(/^\s*macros:/gm) ?? []).length
    console.log(`${file}: removed ${n} macros lines`)
  }
}
