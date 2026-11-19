import type { Level } from './tree';

export type Sex = 'female' | 'male';
export type Activity = 'base' | 'mid';

/**
 * Калорійність — таблиця Олени (урок 3.1, гайд «Як обрати свою калорійність»).
 * Вага не враховується. Зріст нижче / вище діапазону — як у крайньому діапазоні.
 */
export function calcLevel(sex: Sex, height: number, activity: Activity): Level {
  if (sex === 'male') return activity === 'base' ? '1800-1850' : '2000';
  const tall = height >= 170;
  if (!tall) return activity === 'base' ? '1600-1650' : '1700-1750';
  return activity === 'base' ? '1700-1750' : '1800-1850';
}

export const LEVEL_LABEL: Record<Level, string> = {
  '1600-1650': '1600–1650 ккал',
  '1700-1750': '1700–1750 ккал',
  '1800-1850': '1800–1850 ккал',
  '2000': '2000 ккал',
};

export const MIN_AGE = 18;
export const MAX_AGE = 50;
