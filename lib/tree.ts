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
