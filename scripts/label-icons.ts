/** Монохромные иконки продуктов для этикеток 50×30 (viewBox 0 0 64 64). */

import type { PrepLabelIconKey } from '../src/data/prepLabels.ts'

function icons(c: string): Record<PrepLabelIconKey, string> {
  return {
    beef: `
    <ellipse cx="32" cy="34" rx="22" ry="16" fill="none" stroke="${c}" stroke-width="3.5"/>
    <ellipse cx="32" cy="34" rx="10" ry="7" fill="${c}"/>
    <circle cx="22" cy="28" r="2.2" fill="${c}"/>
    <circle cx="42" cy="28" r="2.2" fill="${c}"/>
    <circle cx="24" cy="40" r="2" fill="${c}"/>
    <circle cx="40" cy="40" r="2" fill="${c}"/>
  `,
    chicken: `
    <path d="M18 40c0-12 8-22 18-22 6 0 10 3 12 7 4-1 10 2 10 8 0 4-3 7-7 7H28c-6 0-10 4-10 9"
      fill="none" stroke="${c}" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="44" cy="28" r="2.5" fill="${c}"/>
    <path d="M20 48h22" fill="none" stroke="${c}" stroke-width="3.5" stroke-linecap="round"/>
  `,
    fish: `
    <path d="M10 32c8-12 22-16 34-10 4 2 8 6 10 10-2 4-6 8-10 10-12 6-26 2-34-10z"
      fill="none" stroke="${c}" stroke-width="3.5" stroke-linejoin="round"/>
    <path d="M10 32l-6-8v16z" fill="${c}"/>
    <circle cx="40" cy="30" r="2.5" fill="${c}"/>
    <path d="M28 24v6M28 34v6" fill="none" stroke="${c}" stroke-width="2.5" stroke-linecap="round"/>
  `,
    shrimp: `
    <path d="M14 38c2-10 10-16 20-16 8 0 14 4 18 10 2 3 4 8 2 12-3 6-10 8-16 6-4-1-6-4-8-7"
      fill="none" stroke="${c}" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M48 28c4-2 8-2 10 2M50 34c4 0 8 2 8 6" fill="none" stroke="${c}" stroke-width="2.8" stroke-linecap="round"/>
    <circle cx="22" cy="28" r="2.2" fill="${c}"/>
    <path d="M18 44c4 4 10 6 16 4" fill="none" stroke="${c}" stroke-width="3" stroke-linecap="round"/>
  `,
  }
}

export function iconSvgMarkup(
  key: PrepLabelIconKey,
  x: number,
  y: number,
  size: number,
  color = '#000',
): string {
  const scale = size / 64
  return `<g transform="translate(${x},${y}) scale(${scale})">${icons(color)[key]}</g>`
}
