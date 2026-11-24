import { dishBase, display } from './tree';

/**
 * Фото продуктів для карток конструктора: public/products/<slug>.webp (600×600, фото від Олександри, 20.11).
 * Правило — регулярний вираз за назвою варіанта; перше збігле перемагає, тому складені варіанти йдуть вище.
 */
const RULES: [RegExp, string][] = [
  // складені варіанти гарніру
  [/^рис.*нут/i, 'rys-nut'],
  [/картопл.*квасол/i, 'kartoplia-kvasolia'],
  [/картопл.*нут/i, 'kartoplia-nut'],
  [/картопл.*лаваш/i, 'kartoplia-lavash'],
  [/картопл.*хліб/i, 'kartoplia-khlib'],
  [/сочевиц/i, 'sochevytsia-khlib'],
  [/картопл/i, 'kartoplia'],
  // крупи й макарони
  [/гречан|соба/i, 'soba'],
  [/гречк/i, 'grechka'],
  [/цільно\s*зернов/i, 'makarony-tsilnozernovi'],
  [/макарон/i, 'makarony'],
  [/булгур/i, 'bulgur'],
  [/кіноа/i, 'kinoa'],
  [/пшоно/i, 'pshono'],
  [/рис\s*бур/i, 'rys-buryi'],
  [/вівсян/i, 'vivsianka'],
  // основи сніданку
  [/^хліб/i, 'khlib'],
  [/^лаваш/i, 'lavash'],
  [/галет/i, 'galeta'],
  [/млинц/i, 'mlyntsi'],
  [/панкейк/i, 'pankeiky'],
  [/^яйц|^яйце|яйце$/i, 'yaitsia'],
  // риба й морепродукти
  [/^лосось.*ікр|^ікра.*лосось/i, 'losos-ikra'],
  [/ікра/i, 'ikra'],
  [/лосось/i, 'losos'],
  [/тунець\s*в\/с/i, 'tunets-konserva'],
  [/тунець/i, 'tunets'],
  [/сардин/i, 'sardyny'],
  [/оселед|скумбр|тюльк/i, 'oseledets'],
  [/дорадо/i, 'dorado'],
  [/сібас/i, 'sibas'],
  [/кревет/i, 'krevetky'],
  [/мідії/i, 'midii'],
  // м'ясо
  [/шинка/i, 'shynka'],
  [/хамон/i, 'khamon'],
  [/стегно/i, 'kuriache-stehno'],
  [/філе/i, 'kuriache-file'],
  [/телятин/i, 'teliatyna'],
  [/вирізка/i, 'vyrizka'],
  [/кролик/i, 'krolyk'],
  [/печінк/i, 'pechinka'],
  [/серця/i, 'sertsia'],
  // сир, йогурт, десерт
  [/кисломолочн/i, 'syr-kyslomolochnyi'],
  [/пармезан/i, 'parmezan'],
  [/гауда/i, 'hauda'],
  [/фета/i, 'feta'],
  [/філадельф/i, 'filadelfiia'],
  [/протеїнов/i, 'protein-yogurt'],
  [/йогурт/i, 'yogurt'],
  [/шоколад/i, 'shokolad'],
  // овочі
  [/набір для борщу/i, 'ovochi-buriak'],
  [/набір для супу/i, 'ovochi-nabir-sup'], // фото ще немає — буде літера
  [/мікс салат/i, 'ovochi-salat'],
  [/мікс|суміш/i, 'ovochi-sumishi'],
  [/спарж|стручков/i, 'ovochi-sparzha'],
  [/^огір/i, 'ovochi-ohirok'],
  [/буряк/i, 'ovochi-buriak'],
  [/спаржев/i, 'ovochi-sparzha'],
  [/суміші/i, 'ovochi-sumishi'],
  [/^салат/i, 'ovochi-salat'],
  [/^капуст/i, 'ovochi-kapusta'],
  [/^огірок/i, 'ovochi-ohirok'],
  [/помідор.*перець|^редис|^помідор|^перець/i, 'ovochi-pomidor-perets'],
  // фрукти
  [/лохин|грейпфрут/i, 'frukty-lokhyna'],
  [/ківі|манго/i, 'frukty-kivi'],
];

/** Які фото вже лежать у public/products (оновлювати разом із файлами). */
const AVAILABLE = new Set<string>([
  'bulgur',
  'dorado',
  'feta',
  'filadelfiia',
  'frukty-kivi',
  'frukty-lokhyna',
  'galeta',
  'grechka',
  'hauda',
  'ikra',
  'kartoplia',
  'kartoplia-khlib',
  'kartoplia-kvasolia',
  'kartoplia-lavash',
  'kartoplia-nut',
  'khamon',
  'khlib',
  'kinoa',
  'krevetky',
  'krolyk',
  'kuriache-file',
  'kuriache-stehno',
  'lavash',
  'losos',
  'losos-ikra',
  'makarony',
  'makarony-tsilnozernovi',
  'midii',
  'mlyntsi',
  'oseledets',
  'ovochi-buriak',
  'ovochi-kapusta',
  'ovochi-ohirok',
  'ovochi-pomidor-perets',
  'ovochi-salat',
  'ovochi-sparzha',
  'ovochi-sumishi',
  'pankeiky',
  'parmezan',
  'pechinka',
  'protein-yogurt',
  'pshono',
  'rys-buryi',
  'rys-nut',
  'sardyny',
  'sertsia',
  'shokolad',
  'shynka',
  'sibas',
  'soba',
  'sochevytsia-khlib',
  'syr-kyslomolochnyi',
  'teliatyna',
  'tunets',
  'tunets-konserva',
  'vivsianka',
  'vyrizka',
  'yaitsia',
  'yogurt',
]);

export const photoSlug = (name: string) => RULES.find(([re]) => re.test(name))?.[1] ?? null;

export function productPhoto(name: string): string | null {
  const slug = photoSlug(name);
  return slug && AVAILABLE.has(slug) ? `/products/${slug}.webp` : null;
}

export const PHOTO_SLUGS = [...new Set(RULES.map(([, s]) => s))];

/** Фото обраного варіанта (для тарілки, історії, улюблених). Для основ страв — за складом («картопля + лаваш»). */
export function selectionPhoto(s: { stepKey: string; label: string }): string | null {
  if (dishBase(s.label)) return productPhoto(s.label);
  const name = s.stepKey === 'eggs' ? s.label.charAt(0).toUpperCase() + s.label.slice(1) : display({ label: s.label }).name;
  return productPhoto(name);
}

/** Варіант «без …» (без яєць, без шоколаду): фото продукту, яке картка показує приглушеним і перекресленим. */
const NONE_PHOTO: Record<string, string> = { 'без яєць': 'yaitsia', 'без шоколаду': 'shokolad', 'не додавати': 'protein-yogurt' };
export const nonePhoto = (label: string): string | null => {
  const slug = NONE_PHOTO[label.toLowerCase()];
  return slug && AVAILABLE.has(slug) ? `/products/${slug}.webp` : null;
};

/** Фото для колажу тарілки: усі обрані продукти з фото, без повторів, до 4. */
export function plateCollage(meal: string, selections: { stepKey: string; label: string }[]): string[] {
  const main = platePhoto(meal, selections);
  const all = selections.map(selectionPhoto).filter((x): x is string => !!x);
  return [...new Set([main, ...all].filter((x): x is string => !!x))].slice(0, 4);
}

/** Фото тарілки в шапці конструктора: public/images/hero-<meal>.webp (тарілка праворуч, ліворуч місце під заголовок). */
export const buildHero = (meal: string): string | null =>
  ['breakfast', 'lunch', 'dinner'].includes(meal) ? `/images/hero-${meal}.webp` : null;

/** Головне фото тарілки: сніданок — основа, обід і вечеря — білок, потім гарнір. */
export function platePhoto(meal: string, selections: { stepKey: string; label: string }[]): string | null {
  const order = meal === 'breakfast' ? ['base', 'protein', 'cheese'] : ['protein', 'side', 'veg'];
  for (const key of order) {
    const s = selections.find((x) => x.stepKey === key);
    const src = s && selectionPhoto(s);
    if (src) return src;
  }
  for (const s of selections) { const src = selectionPhoto(s); if (src) return src; }
  return null;
}
