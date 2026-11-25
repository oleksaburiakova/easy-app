import { dishBase, display } from './tree';

/**
 * Фото продуктів для карток конструктора: public/products/<slug>.webp (600×600; нова серія від Олександри — 25.11, ТЗ у docs/PHOTO-TZ.md).
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
  [/ікра\s*минта/i, 'ikra-myntaia'],
  [/ікра/i, 'ikra-triski'],
  [/лосось\s*с\/с|слабосол/i, 'losos-ss'],
  [/лосось/i, 'losos'],
  [/тунець\s*в\/с/i, 'tunets-konserva'],
  [/тунець/i, 'tunets'],
  [/сардин/i, 'sardyny'],
  [/скумбр/i, 'skumbriia'],
  [/тюльк/i, 'tiulka'],
  [/оселед/i, 'oseledets'],
  [/дорадо/i, 'dorado'],
  [/сібас/i, 'sibas'],
  [/кревет/i, 'krevetky'],
  [/мідії/i, 'midii'],
  // м'ясо
  [/шинка/i, 'shynka'],
  [/хамон/i, 'khamon'],
  [/стегно/i, 'kuriache-stehno'],
  [/філе\s*запеч|запечен\S*\s*кур/i, 'file-zapechene'],
  [/філе/i, 'kuriache-file'],
  [/телятин/i, 'teliatyna'],
  [/вирізка/i, 'vyrizka'],
  [/кролик/i, 'krolyk'],
  [/печінк/i, 'pechinka'],
  [/серця/i, 'sertsia'],
  // сир, альтернативи сиру, йогурт, добір білка, десерт
  [/кисломолочн/i, 'syr-kyslomolochnyi'],
  [/пармезан/i, 'parmezan'],
  [/гауда/i, 'hauda'],
  [/моцарел/i, 'motsarela'],
  [/едам/i, 'edam'],
  [/радамер/i, 'radamer'],
  [/фета/i, 'feta'],
  [/філадельф/i, 'filadelfiia'],
  [/тофу/i, 'tofu'],
  [/хумус/i, 'khumus'],
  [/пудинг/i, 'protein-pudynh'],
  [/батончик/i, 'protein-batonchyk'],
  [/протеїнов/i, 'protein-yogurt'],
  [/йогурт/i, 'yogurt'],
  [/шоколад/i, 'shokolad'],
  [/інша солодощ/i, 'insha-solodoshch'],
  // овочі
  [/набір для борщу/i, 'nabir-borshch'],
  [/набір для супу/i, 'nabir-sup'],
  // ферментовані — вище за звичайні капусту й огірки (фото 25.11)
  [/квашен[аі]\s*капуст/i, 'kvashena-kapusta'],
  [/кімчі/i, 'kimchi'],
  [/квашен[іи]\s*огір/i, 'kvasheni-ohirky'],
  [/мікс салат/i, 'ovochi-salat'],
  [/мікс|суміш/i, 'ovochi-sumishi'],
  [/стручков|спаржев/i, 'ovochi-sparzha'],
  [/^спарж/i, 'sparzha'],
  [/^квасол/i, 'kvasolia'],
  [/^огір/i, 'ovochi-ohirok'],
  [/буряк/i, 'ovochi-buriak'],
  [/цвітна/i, 'tsvitna-kapusta'],
  [/^капуст/i, 'ovochi-kapusta'],
  [/^помідор/i, 'pomidory'],
  [/перець\s*гриль/i, 'perets-hryl'],
  [/^перець/i, 'perets'],
  [/^редис/i, 'redyska'],
  [/кукурудз/i, 'kukurudza'],
  [/рукол/i, 'rukola'],
  [/морква/i, 'morkva'],
  [/селер/i, 'selera'],
  [/броколі/i, 'brokoli'],
  [/гарбуз/i, 'harbuz'],
  [/кабачок/i, 'kabachok-hryl'],
  [/цибуля\s*гриль/i, 'tsybulia-hryl'],
  [/^зелень/i, 'zelen'],
  [/^салат/i, 'ovochi-salat'],
  // фрукти
  [/лохин/i, 'lokhyna'],
  [/грейпфрут/i, 'hreipfrut'],
  [/ківі/i, 'kivi'],
  [/манго/i, 'manho'],
  [/апельсин/i, 'apelsyn'],
  [/персик/i, 'persyk'],
  [/яблук/i, 'yabluko'],
  [/малин/i, 'malyna'],
  [/мандарин/i, 'mandaryn'],
];

/** Які фото вже лежать у public/products (оновлювати разом із файлами). */
const AVAILABLE = new Set<string>([
  'kimchi',
  'kvashena-kapusta',
  'kvasheni-ohirky',
  'apelsyn',
  'brokoli',
  'bulgur',
  'dorado',
  'edam',
  'feta',
  'filadelfiia',
  'file-zapechene',
  'galeta',
  'grechka',
  'harbuz',
  'hauda',
  'hreipfrut',
  'ikra-myntaia',
  'ikra-triski',
  'insha-solodoshch',
  'kabachok-hryl',
  'kartoplia',
  'kartoplia-khlib',
  'kartoplia-kvasolia',
  'kartoplia-lavash',
  'kartoplia-nut',
  'khamon',
  'khlib',
  'khumus',
  'kinoa',
  'kivi',
  'krevetky',
  'krolyk',
  'kukurudza',
  'kuriache-file',
  'kuriache-stehno',
  'kvasolia',
  'lavash',
  'lokhyna',
  'losos',
  'losos-ikra',
  'losos-ss',
  'makarony',
  'makarony-tsilnozernovi',
  'malyna',
  'mandaryn',
  'manho',
  'midii',
  'mlyntsi',
  'morkva',
  'motsarela',
  'nabir-borshch',
  'nabir-sup',
  'oliia-avokado',
  'oseledets',
  'ovochi-buriak',
  'ovochi-kapusta',
  'ovochi-ohirok',
  'ovochi-salat',
  'ovochi-sparzha',
  'ovochi-sumishi',
  'pankeiky',
  'parmezan',
  'pechinka',
  'perets',
  'perets-hryl',
  'persyk',
  'pomidory',
  'protein-batonchyk',
  'protein-pudynh',
  'protein-yogurt',
  'pshono',
  'radamer',
  'redyska',
  'rukola',
  'rys-buryi',
  'rys-nut',
  'sardyny',
  'selera',
  'sertsia',
  'shokolad',
  'shynka',
  'sibas',
  'skumbriia',
  'soba',
  'sochevytsia-khlib',
  'sparzha',
  'syr-kyslomolochnyi',
  'teliatyna',
  'tiulka',
  'tofu',
  'tsvitna-kapusta',
  'tsybulia-hryl',
  'tunets',
  'tunets-konserva',
  'vivsianka',
  'vyrizka',
  'yabluko',
  'yaitsia',
  'yogurt',
  'zelen',
]);

export const photoSlug = (name: string) => RULES.find(([re]) => re.test(name))?.[1] ?? null;

export function productPhoto(name: string): string | null {
  const slug = photoSlug(name);
  return slug && AVAILABLE.has(slug) ? `/products/${slug}.webp` : null;
}

/** Рядки тарілки поза кроками: жир на вибір і зелень. */
export const OIL_PHOTO = '/products/oliia-avokado.webp';
export const GREENS_PHOTO = '/products/zelen.webp';

export const PHOTO_SLUGS = [...new Set(RULES.map(([, s]) => s))];

/** Фото обраного варіанта (для тарілки, історії, улюблених). Для основ страв — за складом («картопля + лаваш»). */
export function selectionPhoto(s: { stepKey: string; label: string }): string | null {
  if (dishBase(s.label)) return productPhoto(s.label);
  const name = s.stepKey === 'eggs' ? s.label.charAt(0).toUpperCase() + s.label.slice(1) : display({ label: s.label }).name;
  // Своя солодощ («зефір», «пастила»…) — загальне фото солодощів.
  return productPhoto(name) ?? (s.stepKey === 'chocolate' ? productPhoto('інша солодощ') : null);
}

/** Варіант «без …» (без яєць, без шоколаду): фото продукту, яке картка показує приглушеним і перекресленим. */
const NONE_PHOTO: Record<string, string> = { 'без яєць': 'yaitsia', 'без шоколаду': 'shokolad', 'не додавати': 'protein-yogurt' };
export const nonePhoto = (label: string): string | null => {
  const slug = NONE_PHOTO[label.toLowerCase()];
  return slug && AVAILABLE.has(slug) ? `/products/${slug}.webp` : null;
};


/** Фото тарілки в шапці конструктора: public/images/hero-<meal>.webp (тарілка праворуч, ліворуч місце під заголовок). */
export const buildHero = (meal: string): string | null =>
  ['breakfast', 'lunch', 'dinner'].includes(meal) ? `/images/hero-${meal}.webp` : null;


/** Головне фото тарілки (головна): сніданок — основа, обід і вечеря — білок, потім гарнір. */
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

/* ---------- Тарілка-схема (метод тарілки Олени): ½ овочі, ¼ білок, ¼ гарнір / основа ---------- */

export interface PlateParts { veg: string[]; protein: string | null; carb: string | null; extras: string[] }

/** Фото для секторів тарілки й маленьких кружечків поруч (сир, фрукти, десерт…). */
export function plateParts(meal: string, selections: { stepKey: string; label: string }[]): PlateParts {
  const by = (k: string) => selections.find((s) => s.stepKey === k);
  const items = (k: string) => (by(k)?.label ?? '').split(/,\s*/).filter(Boolean).map((x) => productPhoto(x)).filter((x): x is string => !!x);
  const one = (k: string) => { const s = by(k); return s ? selectionPhoto(s) : null; };
  const eggs = by('eggs') && by('eggs')!.label !== 'без яєць' ? one('eggs') : null;
  const protein = one('protein') ?? eggs;
  const carb = meal === 'breakfast' ? one('base') : one('side');
  const extras = [
    ...(one('protein') && eggs ? [eggs] : []),
    one('cheese'), one('protein_snack'), ...items('fruit').slice(0, 1), one('chocolate'), one('addon'),
  ].filter((x): x is string => !!x);
  return { veg: items('veg').slice(0, 2), protein, carb, extras: [...new Set(extras)].slice(0, 3) };
}
