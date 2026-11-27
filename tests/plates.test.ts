import { describe, expect, it } from 'vitest';
import {
  EGG_BRANCHES, EXTRA_OPTIONS, MULTI_STEPS, SKIP_OPTIONS, cheeseOptions, expandOptions, levelNode, multiOptions, proteinSnackOptions,
  type MealKey, type TreeOption, type TreeStep,
} from '@/lib/tree';
import { plateParts, selectionPhoto } from '@/lib/photos';
import { plateTitle } from '@/lib/plate';

/**
 * Усі комбінації конструктора (≈ 3 000 тарілок): 4 калорійності × сніданок / обід / вечеря;
 * на сніданку — кожна основа й кожна гілка яєць; у кожному кроці — кожен варіант (решта кроків — перший варіант).
 * Перевіряємо, що в ланч-боксі є що показати, у кожного інгредієнта є фото, назва тарілки нормальна.
 */
const LEVELS = ['1600-1650', '1700-1750', '1800-1850', '2000'] as const;
type Sel = { stepKey: string; stepTitle: string; label: string };

// Як у конструкторі (app/build/[meal]/page.tsx → arrange).
function arrange(meal: MealKey, eggs: string | undefined, steps: TreeStep[]): TreeStep[] {
  const out = steps.map((s) => ({ ...s, options: proteinSnackOptions({ ...s, options: cheeseOptions({ ...s, options: expandOptions(s.options) }, meal) }, eggs) }));
  const c = out.findIndex((s) => s.key === 'cheese');
  const v = out.findIndex((s) => s.key === 'veg');
  if (c >= 0 && v > c) out.splice(v, 0, out.splice(c, 1)[0]);
  return out;
}
const optionsOf = (s: TreeStep, meal: MealKey): TreeOption[] =>
  MULTI_STEPS[s.key] ? multiOptions(s, meal) : [...s.options, ...(EXTRA_OPTIONS[s.key] ?? [])].filter((o) => o.label !== 'інша солодощ');

function plates(): { name: string; meal: MealKey; sels: Sel[] }[] {
  const out: { name: string; meal: MealKey; sels: Sel[] }[] = [];
  const walk = (meal: MealKey, name: string, steps: TreeStep[], prefix: Sel[]) => {
    const pick = (s: TreeStep, o: TreeOption): Sel => {
      if (!MULTI_STEPS[s.key]) return { stepKey: s.key, stepTitle: s.title, label: o.label };
      const two = [o.label, ...multiOptions(s, meal).map((x) => x.label).filter((l) => l !== o.label)].slice(0, 2);
      return { stepKey: s.key, stepTitle: s.title, label: two.join(', ') };
    };
    const first = steps.map((s) => optionsOf(s, meal)[0]);
    steps.forEach((s, i) => {
      for (const o of [...optionsOf(s, meal), ...(SKIP_OPTIONS[s.key] ? [{ label: SKIP_OPTIONS[s.key] }] : [])]) {
        const sels = steps
          .map((t, j) => (j === i ? (SKIP_OPTIONS[t.key] === o.label ? null : pick(t, o)) : first[j] ? pick(t, first[j]) : null))
          .filter((x): x is Sel => !!x);
        out.push({ name: `${name} · ${s.key} = ${o.label}`, meal, sels: [...prefix, ...sels] });
      }
    });
  };
  for (const lv of LEVELS) for (const meal of ['breakfast', 'lunch', 'dinner'] as MealKey[]) {
    const node = levelNode(meal, lv);
    if (meal !== 'breakfast') { walk(meal, `${lv} ${meal}`, arrange(meal, undefined, node.branches['default']?.steps ?? []), []); continue; }
    for (const base of node.bases ?? []) {
      const b: Sel = { stepKey: 'base', stepTitle: 'основа', label: base.label };
      if (base.kind === 'pancake_type') { walk(meal, `${lv} сніданок ${base.label}`, arrange(meal, undefined, node.branches[`base:${base.label}`]?.steps ?? []), [b]); continue; }
      for (const eggs of EGG_BRANCHES) walk(meal, `${lv} сніданок ${base.label} ${eggs}`, arrange(meal, eggs, node.branches[eggs]?.steps ?? []), [b, { stepKey: 'eggs', stepTitle: 'яйця', label: eggs }]);
    }
  }
  return out;
}

const ALL = plates();

describe('усі комбінації тарілок', () => {
  it('комбінацій достатньо (дерево не загубилося)', () => {
    expect(ALL.length).toBeGreaterThan(2500);
  });

  it('у кожного кроку є варіанти', () => {
    for (const lv of LEVELS) for (const meal of ['breakfast', 'lunch', 'dinner'] as MealKey[]) {
      const node = levelNode(meal, lv);
      for (const [k, br] of Object.entries(node.branches)) for (const s of br.steps) expect(s.options.length, `${meal} ${lv} ${k} ${s.key}`).toBeGreaterThan(0);
    }
  });

  it('ланч-бокс: завжди є основа або білок, обід і вечеря — з овочами, білком і гарніром', () => {
    for (const p of ALL) {
      const parts = plateParts(p.meal, p.sels);
      expect(!!parts.carb || !!parts.protein, p.name).toBe(true);
      if (p.meal !== 'breakfast') expect([parts.veg.length > 0, !!parts.protein, !!parts.carb], p.name).toEqual([true, true, true]);
    }
  });

  it('кожен обраний продукт має фото (овочі й фрукти — перші два, як у ланч-боксі)', () => {
    const missing = new Set<string>();
    for (const p of ALL) for (const s of p.sels) {
      if (s.stepKey === 'eggs' && s.label === 'без яєць') continue;
      if (MULTI_STEPS[s.stepKey]) { if (plateParts(p.meal, [s]).veg.length === 0 && s.stepKey === 'veg') missing.add(`${s.stepKey}: ${s.label}`); continue; }
      if (!selectionPhoto(s)) missing.add(`${p.meal}/${s.stepKey}: ${s.label}`);
    }
    expect([...missing]).toEqual([]);
  });

  it('назва тарілки без «undefined» і не порожня', () => {
    for (const p of ALL) expect(plateTitle(p.meal, p.sels as never), p.name).toMatch(/^[^\s].*[^\s]$/);
    for (const p of ALL) expect(plateTitle(p.meal, p.sels as never), p.name).not.toMatch(/undefined|null/);
  });
});
