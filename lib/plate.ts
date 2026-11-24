import { dishBase, display, splitOil, type MealKey } from './tree';
import { todayISO, type Plate, type Selection } from './store';

/** Назва страви з вибраних продуктів, напр. «Вівсянка · яйця · лосось». Назву-страву («Плов») дасть ІІ-рецепт. */
export function plateTitle(meal: MealKey, s: Selection[]): string {
  const name = (k: string) => {
    const x = s.find((y) => y.stepKey === k);
    return x ? display({ label: splitOil(x.label).rest }).name : '';
  };
  const side = s.find((y) => y.stepKey === 'side');
  const first = name('base') || (side && dishBase(side.label)?.dish) || name('side');
  const eggs = s.find((y) => y.stepKey === 'eggs');
  const protein = name('protein');
  const parts: string[] = [];
  if (first) parts.push(first);
  const extraEgg = s.some((y) => y.stepKey === 'protein_snack' && /яйце/.test(y.label));
  if (eggs && eggs.label !== 'без яєць') parts.push(eggs.label === 'яйце 1' && !extraEgg ? 'яйце' : 'яйця');
  if (protein) parts.push(protein.toLowerCase());
  if (!parts.length) return meal === 'breakfast' ? 'Сніданок' : meal === 'lunch' ? 'Обід' : 'Вечеря';
  // Відмінювання назв автоматично не робимо — назва-перелік через «·».
  return parts.join(' · ').replace(/^(.)/, (c) => c.toUpperCase());
}

/* ---------- Солодке — не частіше, ніж через день (Олександра, 24.11) ---------- */

export const SWEET_STEP = 'chocolate';
export const SWEET_PAUSE_NOTE = 'Солодке — не частіше, ніж через день, тож сьогодні десерт пропускаємо.';
const hasSweet = (p: Plate) => p.selections.some((s) => s.stepKey === SWEET_STEP);

/** Десерт не пропонуємо, якщо солодке було вчора або вже є сьогодні в іншому прийомі їжі. */
export function sweetPaused(plates: Plate[], meal: MealKey, today = todayISO()): boolean {
  const d = new Date(`${today}T12:00:00`);
  d.setDate(d.getDate() - 1);
  const yesterday = todayISO(d);
  return plates.some((p) => hasSweet(p) && (p.date === yesterday || (p.date === today && p.meal !== meal)));
}

/** Без десерту, якщо його зараз не можна (для «Повторити»). */
export const withoutSweet = (s: Selection[], paused: boolean) => (paused ? s.filter((x) => x.stepKey !== SWEET_STEP) : s);
