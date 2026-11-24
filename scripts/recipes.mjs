// Збирає docs/RECIPES.md з data/recipes.json: грамовки підставляються з дерева Олени (data/easy-tree.json).
// Шлях рецепта (base / eggs / pick) — регулярні вирази до label; кожен має знайти рівно один варіант на кожній калорійності.
import fs from 'node:fs';

const read = (p) => JSON.parse(fs.readFileSync(new URL(p, import.meta.url)));
const tree = read('../data/easy-tree.json');
const { recipes } = read('../data/recipes.json');

const MEALS = { breakfast: 'Сніданок', lunch: 'Обід', dinner: 'Вечеря' };
const STEP = {
  base: 'Основа', eggs: 'Яйця', side: 'Гарнір', protein: 'Білок', cheese: 'Сир / йогурт',
  addon: 'Доповнення', veg: 'Овочі', fruit: 'Фрукти / ягоди', protein_snack: 'Протеїновий перекус', chocolate: 'Шоколад',
};
// Коефіцієнти Олени, як у lib/tree.ts (cookedHint).
const COEFF = [
  [/гречан|соба/i, 0, ''], [/гречк/i, 2.5, 'готової'], [/пшоно/i, 3, 'готового'], [/булгур/i, 2.5, 'готового'],
  [/кіноа/i, 3, 'готової'], [/рис\s*бур/i, 2.7, 'готового'], [/^рис\b/i, 3, 'готового'],
  [/цільно\s*зернов/i, 2.5, 'готових'], [/макарон/i, 2.3, 'готових'], [/вівсян/i, 3, 'готової'],
];

// Як tidy() у lib/tree.ts: лише пробіли й розділові знаки, цифри не змінюються.
const tidy = (s) => s.replace(/\s+/g, ' ').replace(/([а-яіїє])(\d)/gi, '$1 $2').replace(/(\d)\s*г(?![а-яіїє])/g, '$1 г').replace(/(\d)\s*мл/g, '$1 мл')
  .replace(/\s*\\\s*/g, ' / ').replace(/\s+\/\s*|\s*\/\s+/g, ' / ').replace(/\s*\+\s*/g, ' + ').replace(/\s*,\s*/g, ', ').replace(/\(\s*/g, ' (').replace(/\s*\)/g, ')').replace(/\s+/g, ' ').trim();

function cooked(o) {
  if (o.composite || o.unit !== 'g' || !o.amount) return '';
  for (const [re, k, word] of COEFF) if (re.test(o.name ?? o.label)) return k ? ` (≈ ${Math.round((o.amount * k) / 5) * 5} г ${word})` : '';
  return '';
}

const errors = [];
const AFTER = ['fruit', 'protein_snack', 'chocolate'];
const LV = tree.levels.map((l) => l.replace('-', '–'));
/** pattern — регулярний вираз або масив у порядку переваги: береться перший, що знаходить варіант. */
function pickOne(options, pattern, where) {
  if (Array.isArray(pattern)) {
    const p = pattern.find((x) => options.some((o) => new RegExp(x, 'i').test(o.label.trim()))) ?? pattern[0];
    return pickOne(options, p, where);
  }
  const re = new RegExp(pattern, 'i');
  const found = options.filter((o) => re.test(o.label.trim()));
  if (found.length !== 1) {
    errors.push(`${where}: /${pattern}/ → ${found.length ? found.map((o) => `«${o.label}»`).join(', ') : 'нічого'}`);
    return null;
  }
  return found[0];
}

/** Рядки таблиці рецепта для однієї калорійності: [[крок, текст], ...]. */
function resolve(r, lvl) {
  const node = tree.meals[r.meal][lvl];
  const where = `${r.id} ${lvl}`;
  const rows = [];
  let branch = node.branches.default;
  if (r.meal === 'breakfast') {
    const base = pickOne(node.bases, r.base, `${where} основа`);
    rows.push(['base', base ? tidy(base.label) + cooked(base) : '—']);
    if (base?.kind === 'pancake_type') {
      // Млинці / панкейки / галета — своя гілка без кроку «яйця».
      branch = node.branches[`base:${base.label}`];
    } else {
      rows.push(['eggs', r.eggs === 'яйця 2 шт' ? '2 шт' : r.eggs === 'яйце 1' ? '1 шт' : 'без яєць']);
      branch = node.branches[r.eggs];
    }
  }
  if (!branch) { errors.push(`${where}: немає гілки ${r.eggs ?? 'default'}`); return rows; }
  for (const s of branch.steps) {
    if (r.pick?.[s.key]) {
      const o = pickOne(s.options, r.pick[s.key], `${where} ${s.key}`);
      rows.push([s.key, o ? tidy(o.label) + (s.key === 'side' ? cooked(o) : '') : '—']);
    } else if (s.key === 'veg') {
      const g = s.title.match(/(\d+)\s*-?\s*(\d+)?\s*г/);
      rows.push(['veg', g ? (g[2] ? `${g[1]}–${g[2]} г` : `${g[1]} г`) : s.title]);
    } else if (s.key === 'fruit' || s.key === 'protein_snack' || s.key === 'chocolate') {
      rows.push([s.key, s.options.map((o) => tidy(o.label)).join(' або ')]);
    } else {
      errors.push(`${where}: крок ${s.key} не обрано в рецепті`);
    }
  }
  return rows;
}

const out = [];
out.push('# Рецепти Easy');
out.push('');
out.push('> Згенеровано `npm run recipes` з `data/recipes.json`. **Грамовки не вписані вручну** — скрипт бере їх із дерева Олени (`data/easy-tree.json`) за шляхом рецепта в конструкторі, тож вони завжди збігаються з таблицею. Правити тексти — у `data/recipes.json`, потім перезапустити скрипт. Усе — на перевірку Олені.');
out.push('');
out.push('**Як читати**');
out.push('- Таблиця — порція на 1 людину для кожної калорійності; підписи — як на дошці Олени.');
out.push('- Крупи й макарони — суха вага, поруч «≈ готової» за коефіцієнтами Олени.');
out.push('- «+ N мл олії» — уся олія страви: на ній смажимо, нею заправляємо салат або замінюємо на 5 г вершкового масла / 30 г авокадо. Де олії немає — готуємо без неї.');
out.push('- Овочі не рахуємо: склад — приклад, головне — не менше вказаної ваги. Зелень — від 10 г.');
out.push('- Без обмежень: спеції, зелень, часник, лимонний сік, вода. Без майонезу, фритюру й цукру.');
out.push('- Риба — до 160 °C, м\'ясо — до 170 °C; крупи промити й замочити на 30+ хвилин; картоплю після варіння можна остудити.');
out.push('- Червоне м\'ясо — до 3–4 разів на тиждень, риба — 3–4, тунець — до 2, субпродукти — 1 раз.');
out.push('- Млинці, панкейки й галета: порція з дерева, а склад тіста — **чернетка**, поки Олена не дасть свої рецепти.');
out.push('');

for (const meal of Object.keys(MEALS)) {
  const list = recipes.filter((r) => r.meal === meal);
  out.push(`## ${MEALS[meal]}`);
  out.push('');
  list.forEach((r, i) => out.push(`${i + 1}. [${r.title}](#${r.id})`));
  out.push('');
  list.forEach((r, i) => {
    const byLvl = tree.levels.map((l) => resolve(r, l));
    out.push(`### <a id="${r.id}"></a>${MEALS[meal]} ${i + 1}. ${r.title}`);
    out.push('');
    out.push(`| | ${LV.join(' | ')} |`);
    out.push(`|---|${tree.levels.map(() => '---').join('|')}|`);
    const keys = [...new Set(byLvl.flatMap((rows) => rows.map(([k]) => k)))];
    const cellsOf = (k) => byLvl.map((rows) => rows.find(([kk]) => kk === k)?.[1] ?? null);
    for (const k of keys.filter((k) => !AFTER.includes(k))) {
      out.push(`| **${STEP[k] ?? k}** | ${cellsOf(k).map((c) => (c ?? '—').replace(/\|/g, '/')).join(' | ')} |`);
    }
    out.push('');
    // Довгі однакові рядки (фрукти, перекус, шоколад) — під таблицею, згруповані за калорійністю.
    for (const k of keys.filter((k) => AFTER.includes(k))) {
      const groups = new Map();
      cellsOf(k).forEach((c, n) => { if (c) groups.set(c, [...(groups.get(c) ?? []), LV[n]]); });
      const all = [...groups.values()].flat().length === LV.length;
      const text = [...groups].map(([c, lv]) => (groups.size === 1 && all ? c : `${lv.join(', ')}: ${c}`)).join('; ');
      out.push(`**${STEP[k]}:** ${text}.`);
      out.push('');
    }
    if (r.dough) {
      out.push(`**${r.dough.title}** *(чернетка — грамовки підтверджує Олена)*: ${r.dough.items}.`);
      if (r.dough.note) out.push(`${r.dough.note}`);
      out.push('');
    }
    if (r.veg) { out.push(`**Овочі:** ${r.veg}.`); out.push(''); }
    out.push('**Приготування**');
    r.steps.forEach((s, n) => out.push(`${n + 1}. ${s}`));
    if (r.tip) { out.push(''); out.push(`> ${r.tip}`); }
    out.push('');
  });
}

const { questions = [] } = read('../data/recipes.json');
if (questions.length) {
  out.push('## Питання до Олени');
  out.push('');
  questions.forEach((q, n) => out.push(`${n + 1}. ${q}`));
  out.push('');
}

if (errors.length) {
  console.log(`✗ рецепти не зібрано, проблем: ${errors.length}`);
  errors.forEach((e) => console.log('  ' + e));
  process.exit(1);
}
fs.writeFileSync(new URL('../docs/RECIPES.md', import.meta.url), out.join('\n'));
console.log(`✓ docs/RECIPES.md: ${recipes.length} рецептів`);
