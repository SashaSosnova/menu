const OIL = 'Масло растительное 20 г'

/** Нужна обжарка/зажарка на сковороде */
export function needsFryOil(steps: string): boolean {
  const s = steps.toLowerCase()
  const core = s.replace(/\([^)]*\)/g, ' ')

  if (/сух(?:ой|ая)\s+сковород/.test(core)) return false
  if (
    /^(?:разогрет|прогрет|не\s+размораживать|нарезать|нашинковать|дольками|соломкой|подать|покупная|сварить\s+макарон)/.test(
      s.trim(),
    ) &&
    !/обжар|корочк|зажарк|кубик|лук\s+\d|до\s+корочки|лук,/.test(core)
  ) {
    return false
  }

  return (
    /обжар|жарен|поджар|до\s+корочки|на\s+сковород|зажарк|«вok»|«вок»|\bвok\b|\bвок\b/.test(core) ||
    /лук\s*(?:\+|\s+и\s+)морков?\s+\d|лук,\s*морков|лук\+морков|лук\s+\d\s*мин/.test(core) ||
    /лук,\s*(?:кабачок|морков|перец|капуст)/.test(core) ||
    /овощи\s+\d|кубик(?:и)?(?:\s+\d|\s+[а-яё])|соломк(?:у\s+обжар|a\s+\d)|мясо\s+\d\s*мин|фарш\s+\d|гриб/.test(
      core,
    ) ||
    /креветк|кур(?:иц|ицу)\s+\d|кубики\s+с\s+луком|мясо\s+с\s+луком|томат(?:ы)?\s+\d\s*мин|курица\s+\d/.test(
      core,
    )
  )
}

export function ensureFryOil(ingredients: string[], steps: string): string[] {
  if (!needsFryOil(steps)) return ingredients
  if (ingredients.some((line) => /масло\s+(раст|оливк)/i.test(line))) return ingredients

  const saltIdx = ingredients.findIndex((line) => /^соль\s/i.test(line))
  if (saltIdx >= 0) {
    const next = [...ingredients]
    next.splice(saltIdx, 0, OIL)
    return next
  }

  return [...ingredients, OIL]
}
