import type { Level } from './tree';

export type Sex = 'female' | 'male';
/** 'min' — менше базової: калорійність як для базової, а людині радимо поступово підняти активність (Олена, 20.11). */
export type Activity = 'min' | 'base' | 'mid';

/**
 * Калорійність — таблиця Олени (урок 3.1, гайд «Як обрати свою калорійність»).
 * Вага не враховується. Зріст нижче / вище діапазону — як у крайньому діапазоні.
 */
export function calcLevel(sex: Sex, height: number, activity: Activity): Level {
  if (activity === 'min') activity = 'base';
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

export const ACTIVITY_LABEL: Record<Activity, string> = { min: 'Мінімальна', base: 'Базова', mid: 'Середня' };
