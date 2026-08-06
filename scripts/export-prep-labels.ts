/**
 * Этикетки заготовок для NIIMBOT B1 (50×30 мм → 384×240 px @ 203 dpi).
 * → public/prep-labels.xlsx + public/prep-labels/*.png
 */

import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import ExcelJS from 'exceljs'
import sharp from 'sharp'
import { listPrepLabelRows, type PrepLabelRow } from '../src/data/prepLabels.ts'
import { iconSvgMarkup } from './label-icons.ts'

const W = 384
const H = 240
const OUT_DIR = 'public/prep-labels'
const XLSX_PATH = 'public/prep-labels.xlsx'

function escapeXml(s: string): string {
  return s
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

/** Грубая разбивка по символам (для кириллицы на узкой этикетке). */
function wrapLines(text: string, maxChars: number, maxLines: number): string[] {
  const words = text.trim().split(/\s+/).filter(Boolean)
  if (!words.length) return ['']
  const lines: string[] = []
  let cur = ''
  for (let i = 0; i < words.length; i++) {
    const word = words[i]!
    const next = cur ? `${cur} ${word}` : word
    if (next.length <= maxChars) {
      cur = next
      continue
    }
    if (cur) lines.push(cur)
    if (lines.length >= maxLines - 1) {
      const rest = words.slice(i).join(' ')
      lines.push(rest.length > maxChars ? `${rest.slice(0, maxChars - 1)}…` : rest)
      return lines
    }
    cur = word.length > maxChars ? `${word.slice(0, maxChars - 1)}…` : word
  }
  if (cur) lines.push(cur)
  return lines.slice(0, maxLines)
}

function labelSvg(row: PrepLabelRow): string {
  const product = escapeXml(row.product.toUpperCase())
  const form = escapeXml(row.form)
  const amount = escapeXml(row.amount)
  const useBy = escapeXml(row.useBy)
  const dishLines = wrapLines(row.dish || row.product, 22, 2).map(escapeXml)

  const dishBlock =
    dishLines.length === 1
      ? `<text x="192" y="130" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="26" font-weight="700" fill="#000">${dishLines[0]}</text>`
      : `<text x="192" y="118" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="22" font-weight="700" fill="#000">${dishLines[0]}</text>
         <text x="192" y="148" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="22" font-weight="700" fill="#000">${dishLines[1]}</text>`

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect x="0" y="0" width="${W}" height="${H}" fill="#fff"/>
  <rect x="6" y="6" width="${W - 12}" height="${H - 12}" fill="none" stroke="#000" stroke-width="3"/>
  <rect x="12" y="12" width="${W - 24}" height="${H - 24}" fill="none" stroke="#000" stroke-width="1.5"/>

  <!-- шапка -->
  <rect x="18" y="18" width="${W - 36}" height="52" fill="#000"/>
  ${iconSvgMarkup(row.iconKey, 28, 24, 40, '#fff')}
  <text x="78" y="52" font-family="Arial, Helvetica, sans-serif" font-size="22" font-weight="700" fill="#fff">${product}</text>
  <text x="${W - 28}" y="52" text-anchor="end" font-family="Arial, Helvetica, sans-serif" font-size="16" font-weight="600" fill="#fff">${form}</text>

  ${dishBlock}

  <!-- низ -->
  <line x1="28" y1="178" x2="${W - 28}" y2="178" stroke="#000" stroke-width="2"/>
  <text x="28" y="210" font-family="Arial, Helvetica, sans-serif" font-size="20" font-weight="700" fill="#000">${amount}</text>
  <text x="${W - 28}" y="210" text-anchor="end" font-family="Arial, Helvetica, sans-serif" font-size="18" font-weight="700" fill="#000">${useBy}</text>
</svg>`
}

async function writePngs(rows: PrepLabelRow[]): Promise<void> {
  mkdirSync(OUT_DIR, { recursive: true })
  for (const row of rows) {
    const svg = Buffer.from(labelSvg(row), 'utf8')
    const pngPath = join(OUT_DIR, `${row.id}.png`)
    await sharp(svg).png().toFile(pngPath)
  }

  const cards = rows
    .map(
      (r) => `<figure>
  <img src="./${r.id}.png" width="384" height="240" alt="${escapeXml(r.dish || r.product)}"/>
  <figcaption>${escapeXml(r.product)} · ${escapeXml(r.form)} · ${escapeXml(r.amount)}</figcaption>
</figure>`,
    )
    .join('\n')

  writeFileSync(
    join(OUT_DIR, 'index.html'),
    `<!doctype html>
<html lang="ru">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <title>Этикетки заготовок 50×30</title>
  <style>
    body { font-family: system-ui, sans-serif; margin: 1.5rem; background: #f4f2ee; color: #222; }
    h1 { font-size: 1.25rem; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(384px, 1fr)); gap: 1rem; }
    figure { margin: 0; background: #fff; padding: 0.75rem; border: 1px solid #ddd; }
    img { display: block; image-rendering: pixelated; width: 100%; height: auto; }
    figcaption { margin-top: 0.4rem; font-size: 0.85rem; color: #555; }
  </style>
</head>
<body>
  <h1>Этикетки заготовок · ${rows.length} шт · 50×30 мм (384×240)</h1>
  <p>Скачайте PNG и печатайте в NIIMBOT как изображения, либо используйте <a href="../prep-labels.xlsx">prep-labels.xlsx</a>.</p>
  <div class="grid">
${cards}
  </div>
</body>
</html>
`,
    'utf8',
  )
}

async function writeXlsx(rows: PrepLabelRow[]): Promise<void> {
  const wb = new ExcelJS.Workbook()
  wb.creator = 'menu'
  const sheet = wb.addWorksheet('Этикетки')

  sheet.columns = [
    { header: 'id', key: 'id', width: 28 },
    { header: 'Продукт', key: 'product', width: 14 },
    { header: 'Вид', key: 'form', width: 16 },
    { header: 'Вес', key: 'amount', width: 10 },
    { header: 'Блюдо', key: 'dish', width: 42 },
    { header: 'Годен до', key: 'useBy', width: 16 },
  ]

  for (const row of rows) {
    sheet.addRow({
      id: row.id,
      product: row.product,
      form: row.form,
      amount: row.amount,
      dish: row.dish,
      useBy: row.useBy,
    })
  }

  sheet.getRow(1).font = { bold: true }
  const buf = await wb.xlsx.writeBuffer()
  writeFileSync(XLSX_PATH, Buffer.from(buf))
}

async function main() {
  const rows = listPrepLabelRows()
  await writeXlsx(rows)
  await writePngs(rows)
  console.log(
    `Exported ${rows.length} labels → ${XLSX_PATH} + ${OUT_DIR}/*.png`,
  )
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
