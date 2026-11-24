import raw from '@/data/easy-tree.json';

/** Дерево конструктора Олени Гаврилової (data/easy-tree.json). `label` — точний текст з дошки. */
export type Level = '1600-1650' | '1700-1750' | '1800-1850' | '2000';
export type MealKey = 'breakfast' | 'lunch' | 'dinner';

export interface TreeOption {
  label: string;
  name?: string;
  amount?: number | null;
  unit?: string | null;
  oil_ml?: number | null;
  group?: string | null;
  composite?: boolean;
  needs_review?: string;
  kind?: 'bread_porridge' | 'pancake_type';
  note?: string | null;
}
export interface TreeStep {
  key: string;
  title: string;
  amount_g?: string;
  options: TreeOption[];
}
interface LevelNode {
  bases?: TreeOption[];
  branches: Record<string, { steps: TreeStep[] }>;
}
interface Tree {
  levels: Level[];
  meals: Record<MealKey, Record<Level, LevelNode>>;
}

export const tree = raw as unknown as Tree;
export const LEVELS: Level[] = tree.levels;

export const MEALS: { key: MealKey; title: string; icon: 'sun' | 'fork' | 'moon' }[] = [
  { key: 'breakfast', title: 'Сніданок', icon: 'sun' },
  { key: 'lunch', title: 'Обід', icon: 'fork' },
  { key: 'dinner', title: 'Вечеря', icon: 'moon' },
];
export const mealTitle = (m: MealKey) => MEALS.find((x) => x.key === m)!.title;

export const EGG_BRANCHES = ['яйця 2 шт', 'яйце 1', 'без яєць'] as const;

export function levelNode(meal: MealKey, level: Level): LevelNode {
  return tree.meals[meal][level];
}

/** Назви кроків для інтерфейсу. */
export const STEP_TITLES: Record<string, string> = {
  base: 'Основа',
  eggs: 'Яйця',
  side: 'Гарнір',
  protein: 'Білок',
  cheese: 'Сир',
  veg: 'Овочі',
  fruit: 'Фрукти',
  protein_snack: 'Добір білка',
  chocolate: 'Десерт',
  addon: 'Доповнення',
};

export const GROUP_TITLES: Record<string, string> = {
  'крупи': 'Крупи',
  'макарони': 'Макарони',
  'картопля/бобові': 'Картопля і бобові',
  'мясо': "М'ясо",
  'риба': 'Риба',
  'морепродукти': 'Морепродукти',
  'основи страв': 'Основи для страв',
  'альтернативи сиру': 'Альтернативи сиру',
  'свіжі овочі': 'Свіжі овочі',
  'овочі для приготування': 'Овочі для приготування',
  'овочі для страв': 'Для страв, рагу та супів',
  'овочі для гриля': 'Овочі для гриля',
  'набори': 'Набори',
};

/* ---------- Відображення варіантів ---------- */

const cap = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

/** Охайний текст: пробіли довкола «+», «г», ком. Текст дошки не змінюємо по суті. */
export function tidy(s: string): string {
  return s
    .replace(/\s+/g, ' ')
    .replace(/(\d)\s*г(?![а-яіїє])/g, '$1 г')
    .replace(/(\d)\s*мл/g, '$1 мл')
    .replace(/\s*\+\s*/g, ' + ')
    .replace(/\s*,\s*/g, ', ')
    .replace(/\(\s*/g, '(')
    .replace(/\s*\)/g, ')')
    .replace(/(\d)\(/g, '$1 (')
    .replace(/\s*\\\s*/g, ' / ')
    .replace(/\s+\/\s*|\s*\/\s+/g, ' / ')
    .replace(/([а-яіїєґa-z])(\d)/gi, '$1 $2')
    .replace(/\bоліі\b/g, 'олії')
    // Усі грамовки — у сирому вигляді, тож «картопля ( соло) 200г сирої», «картопля сира» → просто «картопля» (Олександра, 24.11).
    .replace(/\(\s*соло\s*\)\s*/gi, '')
    .replace(/свиняча\s*\/\s*теляча/gi, 'свиняча')
    .replace(/\s*сирої(?![а-яіїєґ])/gi, '')
    .replace(/картопля\s+сира(?![а-яіїєґ])/gi, 'картопля')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Назва і порція для картки. Складені варіанти («картопля + нут») показуємо цілим текстом. */
export function display(opt: TreeOption): { name: string; portion: string } {
  const dish = dishBase(opt.label);
  if (dish) return { name: dish.title, portion: dishBasePortion(opt.label) };
  const label = tidy(opt.label.replace(/^картинка:\s*/, ''));
  // Складений варіант показуємо одним рядком, крім «кілька назв — одна грамовка»: «куряче/індиче філе 150 г (+ 5 мл олії)» → назва й грамовка окремо.
  if (opt.composite && !singleWeight(label)) return { name: cap(label), portion: '' };
  const lead = label.match(/^(\d+(?:[.,]\d+)?\s*(?:г|шт|мл))\s+(.*)$/);
  if (lead) return { name: cap(lead[2]), portion: lead[1] };
  // Порція починається з першого числа з одиницею (г, шт, мл, порції), а не з будь-якої цифри («до 3% 80 г»).
  const m = label.match(/\d+(?:[.,]\d+)?\s*(?:г|шт|мл|порц)/);
  const i = m?.index ?? -1;
  if (i <= 0) return { name: cap(label.replace(/[()]/g, '').trim()), portion: '' };
  return { name: cap(label.slice(0, i).trim()), portion: label.slice(i).trim() };
}

/** Одна грамовка на весь варіант (без «+ інший продукт»; жир окремо не рахується). */
function singleWeight(label: string): boolean {
  const rest = splitOil(label).rest;
  return !/\+/.test(rest) && (rest.match(/\d+/g) ?? []).length === 1 && /\d+\s*г\s*$/.test(rest);
}

/* ---------- Суха / готова вага (коефіцієнти Олени) ---------- */

const COEFF: [RegExp, number, string][] = [
  // Соба: на упаковках різне — орієнтовно ×2,35 (70 г сухої ≈ 165 г готової; Олександра, 24.11).
  [/гречан|соба/i, 2.35, 'готових'],
  [/гречк/i, 2.5, 'готової'],
  [/пшоно/i, 3, 'готового'],
  [/булгур/i, 2.5, 'готового'],
  [/кіноа/i, 3, 'готової'],
  [/рис\s*бур/i, 2.7, 'готового'],
  [/^рис\b/i, 3, 'готового'],
  [/цільно\s*зернов/i, 2.5, 'готових'],
  [/макарон/i, 2.3, 'готових'],
  [/вівсян/i, 3, 'готової'],
  [/перлов/i, 3, 'готової'],
  [/ячн/i, 3, 'готової'],
];

/** «≈ 160 г готової» для круп і макаронів, якщо це не складений варіант. */
export function cookedHint(opt: TreeOption): string | null {
  if (opt.composite || opt.unit !== 'g' || !opt.amount) return null;
  const name = display(opt).name.toLowerCase();
  for (const [re, k, word] of COEFF) {
    if (re.test(name)) return k ? `≈ ${Math.round((opt.amount * k) / 5) * 5} г ${word}` : null;
  }
  return null;
}

/* ---------- Основи для страв (комбінації з дошки, що вже задумані як страва) ---------- */

export interface DishBase { dish: string; title: string; note: string }
const SOUP: DishBase = { dish: 'Суп', title: 'Основа для супу', note: 'Додайте овочі — вийде борщ чи суп-пюре, хліб — до супу' };
const DISH_BASES: [RegExp, DishBase][] = [
  [/\(\s*плов\s*\)/i, { dish: 'Плов', title: 'Основа для плову', note: 'Без нуту теж можна: оберіть просто рис' }],
  [/\(\s*шаурма\s*\)/i, { dish: 'Шаурма', title: 'Основа для шаурми', note: 'Додайте білок і овочі — і загорніть у лаваш' }],
  [/\(\s*суп/i, SOUP],
  // «Картопля + нут / квасоля» — теж основа для супу (рішення 24.11), але без підказки: хліба там немає.
  [/картопл.*\+.*(квасол|нут)/i, { ...SOUP, note: '' }],
];
export const DISH_GROUP = 'основи страв';

export const dishBase = (label: string): DishBase | null => DISH_BASES.find(([re]) => re.test(label))?.[1] ?? null;

/** Група для підзаголовка в конструкторі: основи страв — окремою групою. */
export const optionGroup = (opt: TreeOption): string | null => (dishBase(opt.label) ? DISH_GROUP : opt.group ?? null);

/** Порядок в «Основах для страв»: плов, шаурма, далі суп — картопля + хліб, + нут, + квасоля (рішення 24.11). */
const DISH_ORDER = [/плов/i, /шаурм/i, /хліб/i, /нут/i, /квасол/i];
export const dishRank = (label: string) => { const i = DISH_ORDER.findIndex((re) => re.test(label)); return i < 0 ? DISH_ORDER.length : i; };

/**
 * Варіанти «оселедець 130г \скумбрія 130г\тюлька 150 г» — окремими картками (рішення 24.11).
 * Текст дошки не змінюємо: кожна картка — частина того самого label з тією ж грамовкою.
 */
export function expandOptions(opts: TreeOption[]): TreeOption[] {
  return opts.flatMap((o) => (o.label.includes('\\') ? o.label.split('\\').map((part) => splitPart(o, part)) : splitRoe(o))).map(renameOption);
}

/** Частина «скумбрія 130г» — окремий продукт: назва й грамовка окремо, як в інших картках (не «складений» варіант). */
function splitPart(o: TreeOption, part: string): TreeOption {
  const label = part.trim();
  const m = label.match(/^(.*?)\s*(\d+)\s*г/);
  return m ? { ...o, label, name: m[1].trim(), amount: Number(m[2]), unit: 'g', composite: false } : { ...o, label };
}

/** Перейменування для показу (дошку не змінюємо): «свиняча/теляча вирізка» → «свиняча вирізка» (Олександра, 24.11). */
const RENAMES: [RegExp, string][] = [[/^свиняча\s*\/\s*теляча вирізка/i, 'свиняча вирізка']];
function renameOption(o: TreeOption): TreeOption {
  const r = RENAMES.find(([re]) => re.test(o.label));
  if (!r) return o;
  const label = o.label.replace(r[0], r[1]);
  const g = Number(label.match(/(\d+)\s*г/)?.[1]);
  return { ...o, label, name: r[1], composite: false, ...(g ? { amount: g, unit: 'g' } : {}) };
}

/**
 * «ікра тріски 70/ минтая 60 г+ 5 мл олії» → дві картки зі своєю грамовкою:
 * «ікра тріски 70 г + 5 мл олії» і «ікра минтая 60 г + 5 мл олії» (так само з «+ лосось 40г»).
 * Варіанти зі спільною грамовкою («ікра тріски/минтая 25+ лосось 25г») не чіпаємо.
 */
const ROE_RE = /^\s*ікра\s+тріски\s*(\d+)\s*\/\s*минтая\s*(\d+)\s*г\s*\+\s*(.+)$/i;
function splitRoe(o: TreeOption): TreeOption[] {
  const m = o.label.match(ROE_RE);
  if (!m) return [o];
  const rest = tidy(m[3]);
  const withSalmon = !o.oil_ml;
  return ([['тріски', m[1]], ['минтая', m[2]]] as const).map(([fish, g]) => ({
    ...o,
    label: `ікра ${fish} ${g} г + ${rest}`,
    name: `ікра ${fish}`,
    amount: Number(g),
    unit: 'g',
    composite: withSalmon,
  }));
}

/** Склад основи страви без позначки «(плов)»: «рис 40 г + нут варений 40». */
export const dishBasePortion = (label: string) => tidy(label.replace(/\(\s*(плов|шаурма|суп[^)]*)\)/i, ''));

/** Підказки до окремих варіантів (тексти перевіряє Олена). */
const OPTION_NOTES: [RegExp, string][] = [
  [/^лосось.*ікр/i, 'Ідея: перебийте ікру з фетою — вийде ікорка'],
];
export function optionNote(opt: TreeOption): string | null {
  const extra = dishBase(opt.label)?.note ?? OPTION_NOTES.find(([re]) => re.test(opt.label))?.[1];
  return [opt.note, extra].filter(Boolean).join(' · ') || null;
}

/* ---------- Жир окремим пунктом: «тунець 60 г + 5 мл олії» ---------- */

const OIL_RE = /\s*\+\s*(?:олія\s*)?(\d+)\s*мл(?:\s*олі[їяі]|\s*олія)?\s*$/i;

/** Відділяє «+ N мл олії» від білка. Текст дошки не змінюється — лише показ. */
export function splitOil(label: string): { rest: string; oilMl: number | null } {
  const m = label.match(OIL_RE);
  return m ? { rest: label.slice(0, m.index).trim(), oilMl: Number(m[1]) } : { rest: label, oilMl: null };
}

/** Рівноцінні заміни олії (Олена, созвон 20.11): 5 мл олії = 5 г вершкового масла = 30 г авокадо. Горіхи — грамовку дасть Олена. */
export const oilChoices = (ml: number) => [`олія ${ml} мл`, `вершкове масло ${ml} г`, `авокадо ${ml * 6} г`];

/* ---------- Кроки, які можна пропустити ---------- */

/** Крок → варіант «без»: додається останнім у сітку, у тарілку не потрапляє. */
export const SKIP_OPTIONS: Record<string, string> = { chocolate: 'без шоколаду', protein_snack: 'не додавати' };
/** Попередження, коли пропускають білковий перекус (рішення 24.11): можна, але білок треба добрати. */
/** Попередження, якщо крок пропускають: спливаюче вікно (рішення 24.11). */
export const SKIP_WARNINGS: Record<string, { title: string; text: string; lesson: string }> = {
  protein_snack: { title: 'Білок можна добрати пізніше', text: 'Можна з\'їсти пізніше або добрати білок в інший прийом їжі. Один день — нічого страшного, а постійний недобір білка — ризик для здоров\'я.', lesson: 'Урок 2.3 · Білок' },
};
export const isNoneOption = (label: string) => /^(без\s|не додавати$)/i.test(label);

/* ---------- Кроки з вибором кількох (рішення 24.11) ---------- */

/** Овочі — скільки завгодно (мінімум 150 г, можна більше); фрукти — до 3 зі списку Олени, разом у межах грамовки. */
export const MULTI_STEPS: Record<string, { max: number }> = { veg: { max: 99 }, fruit: { max: 3 } };

const VEG_ALIASES: Record<string, string> = { 'помідори': 'помідор' };
const cleanItem = (s: string) => s.replace(/^\d+\s*г\s*/i, '').trim().toLowerCase();

/**
 * Окремі продукти з комбінацій дошки: «капуста, морква, помідор» → капуста · морква · помідор.
 * Грамовка — на весь крок (овочі: amount_g; фрукти: діапазон з варіантів), окремі продукти без пересчёту.
 */
/**
 * Списки овочів від Олени (24.11) — окремо для сніданку й для обіду / вечері, блоками.
 * Морква в блоці «для страв» має приписку, щоб вибір не плутався. Спаржа — просто «спаржа» в обох блоках (Олександра, 24.11):
 * це той самий продукт, тож позначка в одному блоці підсвічує картку й у другому, а на тарілці спаржа один раз.
 */
const VEG_FRESH_BREAKFAST = ['помідори', 'огірки', 'перець свіжий', 'капуста', 'кукурудза', 'мікс салатів', 'рукола', 'спаржа', 'редиска', 'селера'];
const VEG_FRESH_MAIN = ['помідори', 'огірки', 'перець свіжий', 'капуста', 'кукурудза', 'мікс салатів', 'рукола', 'морква', 'спаржа', 'редиска', 'селера'];
export const VEG_LISTS: Record<MealKey, [string, string[]][]> = {
  breakfast: [
    ['свіжі овочі', VEG_FRESH_BREAKFAST],
    ['овочі для приготування', ['заморожені овочеві мікси', 'броколі (свіжа або заморожена)', 'цвітна капуста (свіжа або заморожена)', 'спаржа', 'стручкова квасоля']],
  ],
  lunch: [
    ['свіжі овочі', VEG_FRESH_MAIN],
    ['овочі для страв', ['броколі', 'цвітна капуста', 'гарбуз', 'морква для страв', 'заморожені овочеві мікси', 'буряк', 'спаржа', 'стручкова квасоля']],
    ['овочі для гриля', ['перець гриль', 'кабачок гриль', 'цибуля гриль']],
    // Набір для супу — склад запропоновано (Олександра, 24.11), погоджує Олена.
    ['набори', ['набір для борщу: буряк, капуста, морква, цибуля, томати, часник, зелень', 'набір для супу: морква, цибуля, селера, зелень']],
  ],
  dinner: [],
};
VEG_LISTS.dinner = VEG_LISTS.lunch;

export function multiOptions(step: TreeStep, meal?: MealKey): TreeOption[] {
  if (step.key === 'veg' && meal) return VEG_LISTS[meal].flatMap(([group, items]) => items.map((label) => ({ label, group })));
  const seen = new Set<string>();
  const out: TreeOption[] = [];
  for (const o of step.options) {
    for (const raw of o.label.split(',')) {
      let item = cleanItem(raw);
      if (!item) continue;
      item = VEG_ALIASES[item] ?? item;
      if (seen.has(item)) continue;
      seen.add(item);
      out.push({ label: item, group: null });
    }
  }
  return out;
}

/** Грамовка кроку з вибором кількох: «від 150 г» для овочів, «70–100 г» для фруктів (за калорійністю). */
export function multiPortion(step: TreeStep): string {
  if (step.key === 'veg') return `від ${String(step.amount_g ?? '150').split(/[-–]/)[0].trim()} г`;
  const nums = step.options.map((o) => Number((o.label.match(/^(\d+)\s*г/) ?? [])[1])).filter(Boolean);
  if (!nums.length) return '';
  const lo = Math.min(...nums), hi = Math.max(...nums);
  return lo === hi ? `${lo} г` : `${lo}–${hi} г`;
}

/** Додаткові варіанти до кроків (не з дошки): своя солодощ замість шоколаду. */
export const EXTRA_OPTIONS: Record<string, TreeOption[]> = { chocolate: [{ label: 'інша солодощ' }] };
export const OTHER_SWEET = 'інша солодощ';

/** Скільки грамів своєї солодощі — на 50–80 ккал за калорійністю на 100 г з упаковки. */
export function sweetGrams(kcal100: number): string | null {
  if (!(kcal100 >= 50 && kcal100 <= 900)) return null;
  const lo = Math.round((50 / kcal100) * 100);
  const hi = Math.round((80 / kcal100) * 100);
  return lo === hi ? `${lo} г` : `${lo}–${hi} г`;
}
export const EXTRA_HINTS: Record<string, string> = {
  'інша солодощ': 'Своя солодощ — на 50–80 ккал, як 10 г чорного шоколаду (≈ 53 ккал). Як порахувати: знайдіть на упаковці калорійність на 100 г і впишіть нижче — покажемо, скільки грамів узяти. Не частіше, ніж через день.',
};

/* ---------- Інші сири й альтернативи сиру (Олена, 24.11) ---------- */

/**
 * На кроці «Сир» поруч із гаудою: моцарела, едам, радамер — у тій самій кількості, що гауда;
 * і альтернативи (без молочного) за таблицею Олени для гауди 15 / 20 / 30 г.
 * Для гауди 25 і 40 г таблиці немає — грамовки пропорційно колонці 30 г, округлено до 5 г (needs_review: погоджує Олена).
 */
export const ALT_GROUP = 'альтернативи сиру';
const ALT_TABLE: Record<number, [string, number][]> = {
  15: [['тофу', 35], ['хумус', 30], ['квасоля варена', 40], ['протеїновий пудинг', 65]],
  20: [['тофу', 50], ['хумус', 45], ['квасоля варена', 55], ['протеїновий пудинг', 90]],
  30: [['тофу', 75], ['хумус', 65], ['квасоля варена', 85], ['протеїновий пудинг', 135]],
};
const altFor = (g: number): [string, number][] =>
  ALT_TABLE[g] ?? ALT_TABLE[30].map(([n, v]) => [n, Math.round((v / 30) * g / 5) * 5]);

/** Підказка до йогурту на обіді: там він — заправка для салату (созвон 24.11). */
export const YOGURT_DRESSING_NOTE = 'Як заправка для салату';

/**
 * Обід: «пармезан/ Гауда 15г» з дошки → дві картки «пармезан 15 г» і «гауда 15 г» (лише показ, JSON не змінюємо);
 * йогурт — з підказкою, що це заправка для салату.
 */
function lunchCheese(opts: TreeOption[]): TreeOption[] {
  return opts.flatMap((o) => {
    const m = o.label.match(/^\s*пармезан\s*\/\s*гауда\s*(\d+)\s*г/i);
    if (m) return ['пармезан', 'гауда'].map((n) => ({ ...o, label: `${n} ${m[1]} г`, name: n, composite: false }));
    if (/йогурт/i.test(o.label)) return [{ ...o, note: o.note ?? YOGURT_DRESSING_NOTE }];
    return [o];
  });
}

export function cheeseOptions(step: TreeStep, meal?: MealKey): TreeOption[] {
  if (step.key !== 'cheese') return step.options;
  const options = meal === 'lunch' ? lunchCheese(step.options) : step.options;
  const gauda = options.find((o) => /гауда/i.test(o.label));
  const g = Number(gauda?.label.match(/гауда\s*(\d+)/i)?.[1]);
  if (!g) return options;
  const review = ALT_TABLE[g] ? undefined : `Грамовку пораховано пропорційно до гауди ${g} г — погоджує Олена.`;
  const cheeses: TreeOption[] = ['моцарела', 'едам', 'радамер'].map((n) => ({ label: `${n} ${g} г`, group: null }));
  const alts: TreeOption[] = altFor(g).map(([n, v]) => ({ label: `${n} ${v} г`, group: ALT_GROUP, ...(review ? { needs_review: review } : {}) }));
  return [...options.map((o) => ({ ...o, group: o.group ?? null })), ...cheeses, ...alts];
}

/* ---------- Добір білка на сніданок без яєць / з 1 яйцем (рішення 24.11) ---------- */

/** Порада зверху кроку: білка мало — доберіть; можна пропустити, але це ризик. */
export const proteinSnackNote = (eggs?: string) => ({
  text: `На цій тарілці мало білка — доберіть його: протеїновий йогурт, протеїновий батончик або ${eggs === 'яйце 1' ? 'ще одне яйце' : 'яйце'}. Можна й не додавати, але постійний недобір білка — ризик для здоров'я.`,
  lesson: 'Урок 2.3 · Білок',
});

/**
 * «протеїновий йогурт з ягодами 100 г / протеїновий батончик 30 г» → дві окремі картки з тими самими грамовками;
 * для гілки «1 яйце» — ще картка «ще 1 яйце» (разом 2 яйця); для «без яєць» — «яйце 1 шт» (рішення Олександри 24.11, грамовку погоджує Олена).
 */
export function proteinSnackOptions(step: TreeStep, eggs?: string): TreeOption[] {
  if (step.key !== 'protein_snack') return step.options;
  const src = step.options.map((o) => o.label).join(' ');
  const y = src.match(/йогурт[^\d]*(\d+)\s*г/i)?.[1];
  const b = src.match(/батончик[^\d]*(\d+)\s*г/i)?.[1];
  if (!y && !b) return step.options;
  return [
    ...(y ? [{ label: `протеїновий йогурт з ягодами ${y} г` }] : []),
    ...(b ? [{ label: `протеїновий батончик ${b} г` }] : []),
    ...(eggs === 'яйце 1' ? [{ label: 'ще 1 яйце' }] : []),
    ...(eggs === 'без яєць' ? [{ label: 'яйце 1 шт', needs_review: 'Добір білка без яєць: скільки яєць — погоджує Олена.' }] : []),
  ];
}
