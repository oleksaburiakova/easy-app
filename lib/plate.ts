import { dishBase, display, splitOil, type MealKey } from './tree';
import type { Selection } from './store';

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
  if (eggs && eggs.label !== 'без яєць') parts.push(eggs.label === 'яйце 1' ? 'яйце' : 'яйця');
  if (protein) parts.push(protein.toLowerCase());
  if (!parts.length) return meal === 'breakfast' ? 'Сніданок' : meal === 'lunch' ? 'Обід' : 'Вечеря';
  // Відмінювання назв автоматично не робимо — назва-перелік через «·».
  return parts.join(' · ').replace(/^(.)/, (c) => c.toUpperCase());
}
