import { describe, expect, it } from 'vitest';
import { calcLevel, MAX_AGE, MIN_AGE } from '@/lib/calories';

// Таблиця Олени (docs/TZ.md 4.1, docs/METHODOLOGY.md): калорійність — за статтю, зростом і активністю, вагу не питаємо.
describe('калорійність за таблицею Олени', () => {
  it.each([
    ['female', 160, 'base', '1600-1650'],
    ['female', 165, 'mid', '1700-1750'],
    ['female', 170, 'base', '1700-1750'],
    ['female', 178, 'mid', '1800-1850'],
    ['male', 175, 'base', '1800-1850'],
    ['male', 180, 'mid', '2000'],
  ] as const)('%s, %i см, активність %s → %s', (sex, h, act, level) => {
    expect(calcLevel(sex, h, act)).toBe(level);
  });

  it('зріст поза діапазоном — як у крайньому діапазоні', () => {
    expect(calcLevel('female', 150, 'base')).toBe('1600-1650');
    expect(calcLevel('female', 190, 'mid')).toBe('1800-1850');
    expect(calcLevel('male', 165, 'base')).toBe('1800-1850');
  });

  it('«Мінімальна» активність рахується як базова', () => {
    expect(calcLevel('female', 165, 'min')).toBe(calcLevel('female', 165, 'base'));
    expect(calcLevel('male', 180, 'min')).toBe(calcLevel('male', 180, 'base'));
  });

  it('вік 18–50', () => {
    expect([MIN_AGE, MAX_AGE]).toEqual([18, 50]);
  });
});
