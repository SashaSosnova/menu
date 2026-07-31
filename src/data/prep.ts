/**
 * Заготовки на месяц — группировка по удобству работы.
 * Подписать пакет → морозилка.
 */

export type PrepItem = {
  id: string
  label: string
  amount: string
  how?: string
}

export type PrepGroup = {
  id: string
  title: string
  intro?: string
  /** Рецепт маринада на всю группу */
  marinade?: string
  items: PrepItem[]
}

export const prepGroups: PrepGroup[] = [
  {
    id: 'beef',
    title: 'Говядина — разделываем всю разом',
    intro: '4,7 кг мякоти. Сначала вся соломка, потом все кубики, в конце фарш.',
    items: [
      {
        id: 'beef-strips',
        label: 'Соломка (3 пакета)',
        amount: '1,8 кг',
        how: 'Тонкая соломка поперёк волокон. Пакеты: «перец» 600 г · «бефстроганов» 600 г · «паприкаш» 600 г.',
      },
      {
        id: 'beef-cubes',
        label: 'Кубики ~2 см (4 пакета)',
        amount: '2,35 кг',
        how: 'Пакеты: «гуляш» 600 г · «тушёное с овощами» 600 г · «тушёная со сметаной» 600 г · «картофель тушёный» 550 г.',
      },
      {
        id: 'beef-mince',
        label: 'Фарш · болоньезе',
        amount: '500 г',
        how: 'Прокрутить или купить готовый.',
      },
    ],
  },
  {
    id: 'chicken-fillet',
    title: 'Куриное филе — нарезаем всё разом',
    intro: '4,2 кг. Кубики пачкой, потом соломка, фарш и крупные куски.',
    items: [
      {
        id: 'chick-cubes',
        label: 'Кубики ~2 см (4 пакета)',
        amount: '2,4 кг',
        how: 'Пакеты: «томат-сметана» 600 г · «грибы» 600 г · «с овощами» 650 г · «паста с кабачком» 550 г.',
      },
      {
        id: 'chick-strips',
        label: 'Соломка · строганов',
        amount: '600 г',
      },
      {
        id: 'chick-mince',
        label: 'Фарш · тефтели',
        amount: '450 г',
        how: 'Прокрутить из филе.',
      },
      {
        id: 'chick-large',
        label: 'Крупно · жаркое с картошкой',
        amount: '700 г',
        how: 'Куски ~3–4 см.',
      },
    ],
  },
  {
    id: 'marinate-paprika',
    title: 'Паприка + чеснок',
    marinade:
      'Сладкая паприка 1–2 ч.л., чеснок 2 зуб., соль, масло 1–2 ст.л. на каждый кг. В пакет с мясом → морозилка.',
    items: [
      { id: 'legs-paprika', label: 'Ножки', amount: '1 кг' },
      { id: 'wings-paprika', label: 'Крылья', amount: '1,5 кг' },
    ],
  },
  {
    id: 'marinate-soy-honey',
    title: 'Соевый + мёд',
    marinade:
      'Соевый 3 ст.л., мёд 1 ч.л., паприка, чеснок 1 зуб., чуть масла. В пакет → морозилка.',
    items: [{ id: 'wings-soy', label: 'Крылья', amount: '1,5 кг' }],
  },
  {
    id: 'marinate-honey-garlic',
    title: 'Мёд + чеснок',
    marinade:
      'Мёд 1 ч.л., чеснок 2 зуб., соль, масло 1–2 ст.л., чуть паприки. В пакет → морозилка.',
    items: [{ id: 'legs-honey', label: 'Ножки', amount: '1 кг' }],
  },
  {
    id: 'marinate-cream',
    title: 'Сметана + чеснок',
    marinade:
      'Сметана 3–4 ст.л., чеснок 2–3 зуб., соль, паприка, чуть масла. Бёдра без кожи и костей. В пакет → морозилка.',
    items: [{ id: 'thighs-cream', label: 'Бёдра', amount: '1,3 кг' }],
  },
  {
    id: 'fish',
    title: 'Рыба и креветки',
    intro: 'Разложить по пакетам и заморозить.',
    items: [
      {
        id: 'trout',
        label: 'Форель',
        amount: '1,4 кг',
        how: '2 пакета по 700 г, куски ~100–150 г.',
      },
      {
        id: 'pollock',
        label: 'Минтай',
        amount: '700 г',
        how: 'Куски ~100–150 г.',
      },
      { id: 'shrimp', label: 'Креветки', amount: '400 г' },
    ],
  },
]
