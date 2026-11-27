import { describe, expect, it } from 'vitest';
import {
  cheeseOptions, cookedHint, dishBase, dishRank, display, expandOptions, levelNode, proteinSnackOptions, sweetGrams,
  type MealKey, type TreeOption, type TreeStep,
} from '@/lib/tree';
import { recipeFor } from '@/lib/recipes';
import { plateTitle, sweetPaused, withoutSweet } from '@/lib/plate';
import type { Plate, Selection } from '@/lib/store';

const LEVELS = ['1600-1650', '1700-1750', '1800-1850', '2000'] as const;

/** Усі варіанти дерева для прийому їжі й калорійності. */
function allOptions(meal: MealKey, level: (typeof LEVELS)[number]): TreeOption[] {
  const n = levelNode(meal, level);
  return [...(n.bases ?? []), ...Object.values(n.branches).flatMap((b) => b.steps.flatMap((s) => s.options))];
}
const find = (meal: MealKey, level: (typeof LEVELS)[number], re: RegExp) => {
  const o = allOptions(meal, level).find((x) => re.test(x.label));
  if (!o) throw new Error(`немає варіанта ${re} у ${meal} ${level}`);
  return o;
};

describe('грамовки й «≈ готової»', () => {
  it('крупи — суха вага й вага готової', () => {
    expect(cookedHint(find('breakfast', '1700-1750', /^гречка 40/))).toBe('≈ 100 г готової');
    expect(cookedHint(find('breakfast', '1700-1750', /^вівсянка 40/))).toBe('≈ 120 г готової');
  });
  it('соба — за коефіцієнтом 2,35', () => {
    expect(cookedHint(find('lunch', '1600-1650', /соба\)\s*70/))).toBe('≈ 165 г готових');
  });
  it('грамовки з дошки не змінюються, лише прибираємо «сирої» / «( соло)»', () => {
    const d = display(find('lunch', '1700-1750', /картопля \( соло\) 250/));
    expect(d.name).toBe('Картопля');
    expect(d.portion).toMatch(/^250\s*г$/);
  });
  it('у всіх калорійностях кожен варіант має назву', () => {
    for (const lv of LEVELS) for (const meal of ['breakfast', 'lunch', 'dinner'] as MealKey[]) {
      for (const o of allOptions(meal, lv)) expect(display(o).name.trim(), `${meal} ${lv} ${o.label}`).not.toBe('');
    }
  });
});

describe('основи для страв', () => {
  it.each([
    ['рис 40г + нут варений 40(плов)', 'Основа для плову'],
    ['рис 60г + нут варений 70', 'Основа для плову'],
    ['картопля сира 150г+ квасоля варена 100 г', 'Основа для борщу з квасолею або рагу'],
    ['картопля сира 150г +нут варений 60 г', 'Основа для рагу'],
  ])('%s → %s', (label, title) => {
    expect(dishBase(label)?.title).toBe(title);
  });
  it('порядок: плов, шаурма, суп, борщ/рагу, рагу', () => {
    const order = ['картопля + нут', 'картопля + квасоля', 'картопля + хліб', '(шаурма)', 'рис + нут'];
    expect([...order].sort((a, b) => dishRank(a) - dishRank(b))).toEqual(['рис + нут', '(шаурма)', 'картопля + хліб', 'картопля + квасоля', 'картопля + нут']);
  });
});

describe('варіанти з кількох продуктів — окремими картками', () => {
  it('«оселедець \\ скумбрія \\ тюлька» → три картки зі своїми грамовками', () => {
    const out = expandOptions([{ label: 'оселедець 130г \\скумбрія 130г\\тюлька 150 г' }]);
    expect(out.map((o) => o.label.trim())).toEqual(['оселедець 130г', 'скумбрія 130г', 'тюлька 150 г']);
  });
});

describe('заміни сиру за таблицею Олени', () => {
  const step = (label: string, key = 'cheese'): TreeStep => ({ key, title: 'сир', options: [{ label }] });
  it('гауда 30 г → моцарела, едам, радамер 30 г і альтернативи', () => {
    const labels = cheeseOptions(step('гауда 30 г')).map((o) => o.label);
    expect(labels).toEqual(expect.arrayContaining(['моцарела 30 г', 'едам 30 г', 'радамер 30 г', 'тофу 75 г', 'хумус 65 г', 'квасоля варена 85 г', 'протеїновий пудинг 135 г']));
  });
  it('гауда 15 г → тофу 35, хумус 30, квасоля 40, пудинг 65', () => {
    const labels = cheeseOptions(step('гауда 15 г')).map((o) => o.label);
    expect(labels).toEqual(expect.arrayContaining(['тофу 35 г', 'хумус 30 г', 'квасоля варена 40 г', 'протеїновий пудинг 65 г']));
  });
  it('гауда 40 г — пропорційно й з позначкою «погоджує Олена»', () => {
    const alt = cheeseOptions(step('гауда 40 г')).find((o) => /тофу/.test(o.label));
    expect(alt?.label).toBe('тофу 100 г');
    expect(alt?.needs_review).toBeTruthy();
  });
  it('панкейки: ті самі заміни на кроці «Доповнення»', () => {
    expect(cheeseOptions(step('сир гауда 30г', 'addon')).map((o) => o.label)).toContain('тофу 75 г');
  });
  it('інші кроки не чіпаємо', () => {
    expect(cheeseOptions(step('гауда 30 г', 'protein'))).toHaveLength(1);
  });
});

describe('добір білка на сніданку', () => {
  const s: TreeStep = { key: 'protein_snack', title: 'добір білка', options: [{ label: 'протеїновий йогурт з ягодами 100 г / протеїновий батончик 30 г' }] };
  it('з 1 яйцем — «ще 1 яйце»', () => {
    expect(proteinSnackOptions(s, 'яйце 1').map((o) => o.label)).toEqual(['протеїновий йогурт з ягодами 100 г', 'протеїновий батончик 30 г', 'ще 1 яйце']);
  });
  it('без яєць — «яйце 1 шт»', () => {
    expect(proteinSnackOptions(s, 'без яєць').map((o) => o.label)).toContain('яйце 1 шт');
  });
});

describe('солодке', () => {
  it('«Інша солодощ»: скільки грамів на 55–60 ккал', () => {
    expect(sweetGrams(500)).toBe('11–12 г');
    expect(sweetGrams(20)).toBeNull();
  });
  const plate = (date: string, meal: MealKey, sweet: boolean): Plate => ({
    id: date + meal, date, meal, level: '1700-1750', status: 'eaten', favorite: false, createdAt: date,
    selections: sweet ? [{ stepKey: 'chocolate', stepTitle: 'Десерт', label: 'шоколад 10 г' }] : [],
  });
  it('не частіше, ніж через день: учора був десерт — сьогодні пауза', () => {
    expect(sweetPaused([plate('2026-11-26', 'dinner', true)], 'lunch', '2026-11-27')).toBe(true);
    expect(sweetPaused([plate('2026-11-25', 'dinner', true)], 'lunch', '2026-11-27')).toBe(false);
  });
  it('сьогодні десерт уже був в іншому прийомі — пауза; у тому ж прийомі — ні', () => {
    expect(sweetPaused([plate('2026-11-27', 'breakfast', true)], 'lunch', '2026-11-27')).toBe(true);
    expect(sweetPaused([plate('2026-11-27', 'lunch', true)], 'lunch', '2026-11-27')).toBe(false);
  });
  it('«Повторити» під час паузи прибирає десерт', () => {
    const sels: Selection[] = [{ stepKey: 'base', stepTitle: 'Основа', label: 'гречка 40г' }, { stepKey: 'chocolate', stepTitle: 'Десерт', label: 'шоколад 10 г' }];
    expect(withoutSweet(sels, true).map((x) => x.stepKey)).toEqual(['base']);
    expect(withoutSweet(sels, false)).toHaveLength(2);
  });
});

describe('сніданки-страви за рецептом Олени', () => {
  it('у кожній калорійності млинці, панкейки й галета мають рецепт', () => {
    for (const lv of LEVELS) {
      const recipeBases = (levelNode('breakfast', lv).bases ?? []).filter((b) => b.kind === 'pancake_type');
      expect(recipeBases.length, lv).toBeGreaterThan(0);
      for (const b of recipeBases) expect(recipeFor(b.label)?.ingredients.length, `${lv} ${b.label}`).toBeGreaterThan(0);
    }
  });
  it('звичайні основи — без рецепта', () => {
    expect(recipeFor('гречка 40г')).toBeNull();
  });
});

describe('назва тарілки', () => {
  it('сніданок: основа · яйця · білок', () => {
    const t = plateTitle('breakfast', [
      { stepKey: 'base', stepTitle: 'Основа', label: 'гречка 40г' },
      { stepKey: 'eggs', stepTitle: 'Яйця', label: 'яйця 2 шт' },
      { stepKey: 'protein', stepTitle: 'Білок', label: 'лосось 60 г' },
    ]);
    expect(t).toBe('Гречка · яйця · лосось');
  });
});
