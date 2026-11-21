import type { Activity, Sex } from './calories';

/**
 * Трекер: вода, кроки, тренування + настрій, енергія, ситість.
 * Кроки людина вписує сама: сайт (PWA) не має доступу до «Здоров'я» / Google Fit.
 * Цілі за замовчуванням — з анкети (рівні активності Олени, урок 3.2); людина може змінити.
 * Вагу не трекаємо (ризик РХП). Хвалимо за звичку («5 з 7 днів»), без «серій» і сорому за пропуск.
 */

export interface TrackerDay {
  water?: number; // мл
  steps?: number;
  workout?: boolean;
  mood?: number; // 1–5
  energy?: number; // 1–5
  satiety?: number; // 1–5, ситість протягом дня
}
export interface TrackerGoals {
  water: number; // мл на день
  steps: number; // на день
  workouts: number; // на тиждень
}
export interface TrackerData {
  goals?: Partial<TrackerGoals>;
  days: Record<string, TrackerDay>;
  /** Початок 30-денного челенджу для «Мінімальної» активності. */
  challengeStart?: string;
}

/** Склянка води. */
export const GLASS_ML = 250;
/** Норма води за замовчуванням — у методиці Олени норми немає; уточнити в Олени (чек-лист). Людина може змінити. */
export const DEFAULT_WATER = 2000;
/** 30 днів щонайменше 7 000 кроків — головна ціль для «Мінімальної» активності. */
export const CHALLENGE_DAYS = 30;
export const CHALLENGE_STEPS = 7000;

/** Рівні активності за уроком 3.2 / гайдом «Як обрати свою калорійність». */
const STEP_LEVELS: Record<Sex, { base: number; mid: number }> = {
  female: { base: 7000, mid: 10000 },
  male: { base: 8000, mid: 9500 },
};

/** Рекомендований діапазон кроків на день (Олександра, 21.11: «7 000–10 000»; для чоловіків базова від 8 000 — урок 3.2). */
export const stepRange = (sex: Sex): readonly [number, number] => (sex === 'male' ? [8000, 10000] : [7000, 10000]);

/** Цілі з анкети. «Мінімальна» — ціль базової: туди й рухаємось. */
export function recommendedGoals(sex: Sex, activity: Activity): TrackerGoals {
  const lv = STEP_LEVELS[sex];
  const mid = activity === 'mid';
  return {
    water: DEFAULT_WATER,
    steps: mid ? lv.mid : lv.base,
    workouts: sex === 'male' ? (mid ? 4 : 3) : mid ? 3 : 2,
  };
}

export function goalsFor(data: TrackerData, sex: Sex, activity: Activity): TrackerGoals {
  return { ...recommendedGoals(sex, activity), ...(data.goals ?? {}) };
}

/* ---------- Дати ---------- */

export const iso = (d: Date) => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
export const fromIso = (s: string) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
export const addDays = (s: string, n: number) => { const d = fromIso(s); d.setDate(d.getDate() + n); return iso(d); };

/** Тиждень з понеділка, у якому лежить дата. */
export function weekOf(dateIso: string): string[] {
  const d = fromIso(dateIso);
  const shift = (d.getDay() + 6) % 7; // пн = 0
  const mon = iso(new Date(d.getFullYear(), d.getMonth(), d.getDate() - shift));
  return Array.from({ length: 7 }, (_, i) => addDays(mon, i));
}
export const WEEKDAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд'];

/* ---------- Прогрес ---------- */

const part = (v: number | undefined, goal: number) => Math.min(1, (v ?? 0) / Math.max(1, goal));

/** Кільце дня: середнє води й кроків (тренування — тижнева ціль, у кільце дня не входить). */
export function dayProgress(day: TrackerDay | undefined, g: TrackerGoals) {
  if (!day) return 0;
  return (part(day.water, g.water) + part(day.steps, g.steps)) / 2;
}
export const dayComplete = (day: TrackerDay | undefined, g: TrackerGoals) =>
  !!day && (day.water ?? 0) >= g.water && (day.steps ?? 0) >= g.steps;

/** «5 з 7 днів» — скільки днів тижня досягнуто цілі (лише до сьогодні). */
export function weekCount(data: TrackerData, week: string[], today: string, test: (d: TrackerDay) => boolean) {
  return week.filter((d) => d <= today && data.days[d] && test(data.days[d])).length;
}

/* ---------- 30 днів для «Мінімальної» ---------- */

export function challengeProgress(data: TrackerData, today: string) {
  const start = data.challengeStart ?? today;
  const end = addDays(start, CHALLENGE_DAYS - 1);
  let done = 0;
  for (let d = start; d <= end && d <= today; d = addDays(d, 1)) if ((data.days[d]?.steps ?? 0) >= CHALLENGE_STEPS) done++;
  const dayN = Math.min(CHALLENGE_DAYS, Math.round((fromIso(today).getTime() - fromIso(start).getTime()) / 864e5) + 1);
  return { start, done, dayN, finished: today > end };
}

/* ---------- Підказка перерахувати калорійність (правило Олени: стабільно 3–4 тижні) ---------- */

export type RecalcHint = { kind: 'up' | 'down' | 'reached-base'; avg: number } | null;

/**
 * Дивимось останні 21 день: мінімум 15 днів з кроками. Середнє вище рівня «середня» (і тренувань ≥ 3 на тиждень) —
 * «активність зросла»; нижче базової при базовій / середній — «руху стало менше»; «Мінімальна» дійшла до базової — вітаємо.
 */
export function recalcHint(data: TrackerData, sex: Sex, activity: Activity, today: string): RecalcHint {
  const days = Array.from({ length: 21 }, (_, i) => addDays(today, -i)).map((d) => data.days[d]).filter(Boolean) as TrackerDay[];
  const withSteps = days.filter((d) => (d.steps ?? 0) > 0);
  if (withSteps.length < 15) return null;
  const avg = Math.round(withSteps.reduce((s, d) => s + (d.steps ?? 0), 0) / withSteps.length);
  const workoutsPerWeek = (days.filter((d) => d.workout).length / 21) * 7;
  const lv = STEP_LEVELS[sex];
  if (activity === 'min' && avg >= lv.base) return { kind: 'reached-base', avg };
  if (activity === 'base' && avg >= lv.mid && workoutsPerWeek >= 3) return { kind: 'up', avg };
  if (activity !== 'min' && avg < lv.base * 0.85) return { kind: 'down', avg };
  return null;
}

/* ---------- Шкали самопочуття ---------- */

export const SCALES: { key: 'mood' | 'energy' | 'satiety'; icon: 'smile' | 'bolt' | 'bowl'; title: string; low: string; high: string }[] = [
  { key: 'mood', icon: 'smile', title: 'Настрій', low: 'поганий', high: 'чудовий' },
  { key: 'energy', icon: 'bolt', title: 'Енергія', low: 'без сил', high: 'багато сил' },
  { key: 'satiety', icon: 'bowl', title: 'Ситість', low: 'постійно голодно', high: 'ситно весь день' },
];

export const fmt = (n: number) => n.toLocaleString('uk-UA');
