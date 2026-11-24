import type { IconName } from '@/components/Icon';
import type { Plate, Profile, LearnProgress } from './store';
import { addDays, challengeProgress, goalsFor, type TrackerData } from './tracker';
import { LESSONS, GUIDES } from './lessons';
import { display } from './tree';

/**
 * Нагороди (план — docs/ACTIVITY.md). Хвалимо за звичку, а не за ідеальність: «5 з 7 днів», пропуск нічого не обнуляє.
 * Жодних нагород за «менше їсти» чи вагу. Рахуються з даних застосунку щоразу (нічого окремо не зберігаємо,
 * крім того, які нагороди людині вже показали). Тексти — на «ви»; Олена погоджує назви й пороги (чек-лист).
 */
export interface Award {
  id: string;
  group: 'Тарілки' | 'Різноманіття' | 'Навчання' | 'Рух і самопочуття' | 'Повернення';
  title: string;
  how: string; // як отримати (для сірих)
  praise: string; // фраза Олени при отриманні
  icon: IconName;
  /** Показувати лише деяким (напр. «Від мінімальної до базової» — тим, хто обрав «Мінімальну»). */
  only?: (p: Profile) => boolean;
}

export const AWARDS: Award[] = [
  { id: 'first-plate', group: 'Тарілки', icon: 'plate', title: 'Перша тарілка', how: 'Зберіть першу тарілку в конструкторі.', praise: 'Перший крок зроблено — далі буде легше.' },
  { id: 'full-day', group: 'Тарілки', icon: 'sun', title: 'Повний день', how: 'Зберіть сніданок, обід і вечерю за один день.', praise: 'Цілий день за планом — так і будується звичка.' },
  { id: 'week-plan', group: 'Тарілки', icon: 'chart', title: 'Тиждень планування', how: 'Збирайте тарілки 5 днів із 7.', praise: 'П\'ять днів з тарілками за тиждень — це вже система.' },
  { id: 'month-habit', group: 'Тарілки', icon: 'redo', title: 'Місяць звички', how: 'Збирайте тарілки 20 днів за місяць.', praise: 'Двадцять днів — харчування стало вашим режимом.' },
  { id: 'own-favorite', group: 'Тарілки', icon: 'heart', title: 'Своя улюблена', how: 'Додайте страву в улюблені.', praise: 'Улюблені страви — і план стає ще простішим.' },

  { id: 'fish-week', group: 'Різноманіття', icon: 'drop', title: 'Риба тижня', how: 'Рибу 3 рази за тиждень.', praise: 'Риба 3 рази на тиждень — саме те, що потрібно.' },
  { id: 'rainbow', group: 'Різноманіття', icon: 'leaf', title: 'Веселка на тарілці', how: '5 різних овочів за тиждень.', praise: 'Різні овочі — різні вітаміни й клітковина. Чудово!' },
  { id: 'berry-week', group: 'Різноманіття', icon: 'smile', title: 'Ягідний тиждень', how: 'Ягоди 3 рази за тиждень.', praise: 'Ягоди — найкращий вибір серед фруктів.' },
  { id: 'grains', group: 'Різноманіття', icon: 'fork', title: 'Крупи без нудьги', how: '4 різні гарніри за тиждень.', praise: 'Різні крупи — різноманітні вуглеводи. Так тримати!' },
  { id: 'offal', group: 'Різноманіття', icon: 'bolt', title: 'Сміливий вибір', how: 'Оберіть печінку чи серця.', praise: 'Субпродукти раз на тиждень — багато заліза й вітамінів.' },

  { id: 'first-lesson', group: 'Навчання', icon: 'play', title: 'Перший урок', how: 'Відкрийте перший урок.', praise: 'Знання — половина результату.' },
  { id: 'half-course', group: 'Навчання', icon: 'cap', title: 'Половина курсу', how: `Відкрийте ${Math.ceil(LESSONS.length / 2)} уроків.`, praise: 'Половина курсу позаду — ви вже розумієте, чому тарілка саме така.' },
  { id: 'full-course', group: 'Навчання', icon: 'cap', title: 'Весь курс', how: `Відкрийте всі ${LESSONS.length} уроків.`, praise: 'Увесь курс пройдено — тепер ви знаєте методику зсередини.' },
  { id: 'guides', group: 'Навчання', icon: 'file', title: 'Читачка гайдів', how: `Відкрийте всі ${GUIDES.length} гайдів.`, praise: 'Усі гайди — у вашій скарбничці.' },

  { id: 'steps-week', group: 'Рух і самопочуття', icon: 'steps', title: 'Тиждень кроків', how: 'Кроки на рівні цілі 5 днів із 7.', praise: 'Рух — ваш союзник. П\'ять днів кроків за тиждень!' },
  { id: 'workouts-plan', group: 'Рух і самопочуття', icon: 'dumbbell', title: 'Тренування за планом', how: 'Виконайте ціль тренувань за тиждень.', praise: 'Тренування за планом — сила й енергія.' },
  { id: 'feel-week', group: 'Рух і самопочуття', icon: 'pulse', title: 'Тиждень у трекері', how: 'Відмічайте трекер 7 днів.', praise: 'Сім днів у трекері — ви чуєте своє тіло.' },
  { id: 'min-to-base', group: 'Рух і самопочуття', icon: 'chart', title: 'Від мінімальної до базової', how: '25 днів із 30 щонайменше 7 000 кроків.', praise: 'Ви підняли активність до базової — це велика перемога!', only: (p) => p.activity === 'min' },

  { id: 'comeback', group: 'Повернення', icon: 'home', title: 'З поверненням', how: 'Поверніться до тарілок після перерви.', praise: 'Добре, що ви тут. Почнемо з наступної тарілки.' },
];

const FISH = /лосось|оселед|скумбр|тюльк|тунець|дорадо|сібас|сардин/i;
const BERRY = /лохин|малин/i;

/** Чи є вікно з 7 днів (ковзне), де умова набирає щонайменше `need`. */
function anyWindow(dates: string[], score: (from: string, to: string) => number, need: number, len = 7) {
  for (const end of new Set(dates)) {
    if (score(addDays(end, -(len - 1)), end) >= need) return true;
  }
  return false;
}

export function earnedAwards(profile: Profile, plates: Plate[], tracker: TrackerData, learn: LearnProgress, today: string): Set<string> {
  const got = new Set<string>();
  const dates = [...new Set(plates.map((p) => p.date))].sort();
  const inRange = (d: string, from: string, to: string) => d >= from && d <= to;
  const platesIn = (from: string, to: string) => plates.filter((p) => inRange(p.date, from, to));
  const sel = (from: string, to: string, key: string) => platesIn(from, to).flatMap((p) => p.selections.filter((s) => s.stepKey === key));

  if (plates.length) got.add('first-plate');
  if (dates.some((d) => new Set(plates.filter((p) => p.date === d).map((p) => p.meal)).size >= 3)) got.add('full-day');
  if (anyWindow(dates, (f, t) => new Set(platesIn(f, t).map((p) => p.date)).size, 5)) got.add('week-plan');
  if (anyWindow(dates, (f, t) => new Set(platesIn(f, t).map((p) => p.date)).size, 20, 30)) got.add('month-habit');
  if (plates.some((p) => p.favorite)) got.add('own-favorite');

  if (anyWindow(dates, (f, t) => sel(f, t, 'protein').filter((s) => FISH.test(s.label)).length, 3)) got.add('fish-week');
  if (anyWindow(dates, (f, t) => new Set(sel(f, t, 'veg').flatMap((s) => s.label.split(',').map((x) => x.trim().toLowerCase()).filter(Boolean))).size, 5)) got.add('rainbow');
  if (anyWindow(dates, (f, t) => sel(f, t, 'fruit').filter((s) => BERRY.test(s.label)).length, 3)) got.add('berry-week');
  if (anyWindow(dates, (f, t) => new Set(sel(f, t, 'side').map((s) => display({ label: s.label }).name.toLowerCase())).size, 4)) got.add('grains');
  if (plates.some((p) => p.selections.some((s) => /печінк|серця/i.test(s.label)))) got.add('offal');

  const lessons = learn.lessons.filter((id) => LESSONS.some((l) => l.id === id)).length;
  if (lessons >= 1) got.add('first-lesson');
  if (lessons >= Math.ceil(LESSONS.length / 2)) got.add('half-course');
  if (lessons >= LESSONS.length) got.add('full-course');
  if (GUIDES.every((g) => learn.guides.includes(g.file))) got.add('guides');

  const g = goalsFor(tracker, profile.sex, profile.activity);
  const tDates = Object.keys(tracker.days).sort();
  const tIn = (from: string, to: string) => tDates.filter((d) => inRange(d, from, to)).map((d) => tracker.days[d]);
  if (anyWindow(tDates, (f, t) => tIn(f, t).filter((d) => (d.steps ?? 0) >= g.steps).length, 5)) got.add('steps-week');
  if (anyWindow(tDates, (f, t) => tIn(f, t).filter((d) => d.workout).length, g.workouts)) got.add('workouts-plan');
  if (anyWindow(tDates, (f, t) => tIn(f, t).filter((d) => d.water || d.steps || d.workout || d.mood || d.energy || d.satiety).length, 7)) got.add('feel-week');
  if (profile.activity === 'min' && challengeProgress(tracker, today).done >= 25) got.add('min-to-base');

  for (let i = 1; i < dates.length; i++) {
    if (dates[i] > addDays(dates[i - 1], 3)) { got.add('comeback'); break; }
  }
  return got;
}

export const visibleAwards = (p: Profile) => AWARDS.filter((a) => !a.only || a.only(p));
