// Перевірка дерева: у кожної калорійності є всі прийоми їжі, гілки й кроки з варіантами.
import fs from 'node:fs';
const t = JSON.parse(fs.readFileSync(new URL('../data/easy-tree.json', import.meta.url)));
let problems = 0, options = 0, review = 0;
for (const meal of ['breakfast', 'lunch', 'dinner']) {
  for (const lvl of t.levels) {
    const n = t.meals[meal]?.[lvl];
    if (!n) { console.log(`✗ ${meal} ${lvl}: немає`); problems++; continue; }
    if (meal === 'breakfast') {
      for (const b of ['яйця 2 шт', 'яйце 1', 'без яєць']) if (!n.branches[b]) { console.log(`✗ ${meal} ${lvl}: немає гілки ${b}`); problems++; }
      for (const base of n.bases.filter((x) => x.kind === 'pancake_type')) if (!n.branches[`base:${base.label}`]) { console.log(`✗ ${meal} ${lvl}: немає гілки для ${base.label}`); problems++; }
    }
    for (const [name, br] of Object.entries(n.branches)) {
      for (const s of br.steps) {
        if (!s.options.length) { console.log(`✗ ${meal} ${lvl} ${name} ${s.key}: порожній крок`); problems++; }
        options += s.options.length;
        review += s.options.filter((o) => o.needs_review).length;
      }
    }
  }
}
console.log(`${problems ? '✗' : '✓'} перевірено: ${options} варіантів, ${review} позначено для перевірки Оленою, проблем: ${problems}`);
process.exit(problems ? 1 : 0);
