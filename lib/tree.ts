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
  protein_snack: 'Десерт',
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
    .trim();
}

/** Назва і порція для картки. Складені варіанти («картопля + нут») показуємо цілим текстом. */
export function display(opt: TreeOption): { name: string; portion: string } {
  const dish = dishBase(opt.label);
  if (dish) return { name: dish.title, portion: dishBasePortion(opt.label) };
  const label = tidy(opt.label.replace(/^картинка:\s*/, ''));
  if (opt.composite) return { name: cap(label), portion: '' };
  const lead = label.match(/^(\d+(?:[.,]\d+)?\s*(?:г|шт|мл))\s+(.*)$/);
  if (lead) return { name: cap(lead[2]), portion: lead[1] };
  // Порція починається з першого числа з одиницею (г, шт, мл, порції), а не з будь-якої цифри («до 3% 80 г»).
  const m = label.match(/\d+(?:[.,]\d+)?\s*(?:г|шт|мл|порц)/);
  const i = m?.index ?? -1;
  if (i <= 0) return { name: cap(label.replace(/[()]/g, '').trim()), portion: '' };
  return { name: cap(label.slice(0, i).trim()), portion: label.slice(i).trim() };
}

/* ---------- Суха / готова вага (коефіцієнти Олени) ---------- */

const COEFF: [RegExp, number, string][] = [
  [/гречан|соба/i, 0, ''],
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
const DISH_BASES: [RegExp, DishBase][] = [
  [/\(\s*плов\s*\)/i, { dish: 'Плов', title: 'Основа для плову', note: 'Без нуту теж можна: оберіть просто рис' }],
  [/\(\s*шаурма\s*\)/i, { dish: 'Шаурма', title: 'Основа для шаурми', note: 'Додайте білок і овочі — і загорніть у лаваш' }],
  [/\(\s*суп/i, { dish: 'Суп', title: 'Основа для супу', note: 'Додайте овочі — вийде борщ чи суп-пюре, хліб — до супу' }],
];
export const DISH_GROUP = 'основи страв';

export const dishBase = (label: string): DishBase | null => DISH_BASES.find(([re]) => re.test(label))?.[1] ?? null;

/** Група для підзаголовка в конструкторі: основи страв — окремою групою. */
/** Комбінації «картопля + квасоля / нут» — теж основи страв (без перейменування), рішення 24.11. */
const DISH_COMBO = /картопл.*\+.*(квасол|нут)/i;
export const optionGroup = (opt: TreeOption): string | null => (dishBase(opt.label) || DISH_COMBO.test(opt.label) ? DISH_GROUP : opt.group ?? null);

/**
 * Варіанти «оселедець 130г \скумбрія 130г\тюлька 150 г» — окремими картками (рішення 24.11).
 * Текст дошки не змінюємо: кожна картка — частина того самого label з тією ж грамовкою.
 */
export function expandOptions(opts: TreeOption[]): TreeOption[] {
  return opts.flatMap((o) => (o.label.includes('\\') ? o.label.split('\\').map((part) => ({ ...o, label: part.trim() })) : [o]));
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
export const SKIP_OPTIONS: Record<string, string> = { chocolate: 'без шоколаду', protein_snack: 'без перекусу' };
/** Попередження, коли пропускають білковий перекус (рішення 24.11): можна, але білок треба добрати. */
export const SKIP_WARNINGS: Record<string, { text: string; lesson: string }> = {
  protein_snack: { text: 'Можна з\'їсти пізніше або добрати білок в інший прийом їжі. Один день — нічого страшного, а постійний недобір білка — ризик для здоров\'я.', lesson: 'Урок 2.3 · Білок' },
};
export const isNoneOption = (label: string) => /^без\s/i.test(label);
