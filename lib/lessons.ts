/**
 * 12 відеоуроків і гайди. Відео — Vimeo (приховані посилання «за посиланням»), `vimeo` = "id/hash".
 * Етап 3: доступ лише з активною підпискою (зараз бачить кожен, хто відкрив застосунок).
 */
/** `title` — назва уроку (нові назви — 25.11), `about` — рядок-гачок під нею в списку. */
export interface Lesson { id: string; block: string; title: string; about: string; vimeo?: string; sec?: number; thumb?: string }

export const vimeoEmbed = (v: string) => {
  const [id, h] = v.split('/');
  return `https://player.vimeo.com/video/${id}?h=${h}&title=0&byline=0&portrait=0&dnt=1`;
};
/** Обкладинка уроку з Vimeo. Змінили обкладинку у Vimeo — оновіть `thumb` (oEmbed: vimeo.com/api/oembed.json?url=…, поле thumbnail_url), сама вона не підтягнеться. */
export const lessonThumb = (l: Lesson) => (l.thumb ? `https://i.vimeocdn.com/video/${l.thumb}-d_640` : null);
export const durationLabel = (sec?: number) => (sec ? `${Math.round(sec / 60)} хв` : '');

export const LESSON_BLOCKS = ['Вступ', 'Харчування', 'Нутрієнти', 'Не лише їжа'] as const;

export const LESSONS: Lesson[] = [
  { id: 'intro', block: 'Вступ', title: 'Баланс на тарілці без підрахунків і заборон', about: '6 хвилин — і ви знаєте, як зібрати тарілку з того, що вже є вдома.', vimeo: '1248517322/b59b5c586e', thumb: '2230684150-462a58bcb60208764cc72424602f49135bd6010be13851f5c7b05934c97ae973', sec: 351 },
  { id: '1', block: 'Харчування', title: 'Корисні продукти — ще не збалансований раціон', about: 'Вдома лише корисні продукти, а вага стоїть? Справа не в продуктах.', vimeo: '1248517323/9424a51e01', thumb: '2230684527-1c3007013c9ad0635fe2d01ee0bc70b9e1dc5057878264abdebad5436d523d32', sec: 1063 },
  { id: '2', block: 'Нутрієнти', title: 'Білки, жири, вуглеводи: команда, а не суперники', about: 'Білки, жири й вуглеводи — частини одного рецепта: без жодної він не складеться.', vimeo: '1248517325/3cdfed0663', thumb: '2230684657-a7ff4d18bc0f0f0b002e899566a10f8fb7e3c2847efc659a1d4bd9f9709a82b7', sec: 240 },
  { id: '2.1', block: 'Нутрієнти', title: 'Вуглеводи — зло чи союзник у схудненні?', about: 'Енергія, клітковина і як обирати крупи, хліб і картоплю.', vimeo: '1248517404/6f03aeba9f', thumb: '2230684799-db17e742b6f632afb60cb8e30308c96413162c88fa48705c56304f7bc32b6eed', sec: 479 },
  { id: '2.2', block: 'Нутрієнти', title: 'Жири, без яких не обійтися', about: 'Гормони, ситість, вітаміни — і скільки жиру насправді потрібно.', vimeo: '1248517433/57ad22a2ee', thumb: '2230684987-7b66b1ccdbc62e55a937d5096a66187147467cb2ebd6bddc10035504d50cc8fe', sec: 529 },
  { id: '2.3', block: 'Нутрієнти', title: 'Герой нашого часу — білок! Чи все так однозначно?', about: 'Ситість, імунітет і м’язи — і скільки білка потрібно насправді.', vimeo: '1248517455/6835a5a045', thumb: '2230685090-ad7c8e9a9fdbe7d96e787202aeaf0c48ee5d3a25b0af12d8dde71948ef5665e4', sec: 501 },
  { id: '2.4', block: 'Нутрієнти', title: 'Формула ситої тарілки', about: 'Проста формула: скільки вуглеводів, жирів і білка має бути на тарілці.', vimeo: '1248517476/9454dc379e', thumb: '2230685201-c65b81a6a79bbc091e2b368138b7171649ffe0613e87af98cfb3732c0dd80c8e', sec: 544 },
  { id: 'bonus', block: 'Нутрієнти', title: 'Смак і текстура: секрет тарілки, яку хочеться їсти', about: 'Смак і текстура — теж частина балансу: їжу на тарілці ви маєте хотіти їсти.', vimeo: '1248517324/5952f9b454', thumb: '2230684273-82c7bbcd88e6f0d716dec1ad3e5254c1bbd32be38617cf9b8af845dd45ca3631', sec: 705 },
  { id: '3.1', block: 'Не лише їжа', title: 'Не їсти менше — рухатися більше', about: 'Помірний дефіцит замість голодування — і що ще впливає на вагу.', vimeo: '1248517528/0bf7b4f6a2', thumb: '2230685305-df1b1809dd489042dfda3fb2a36d8f8dfc6c33599cdc835decd41a2edce02875', sec: 443 },
  { id: '3.2', block: 'Не лише їжа', title: 'Рух без спортзалу: скільки достатньо', about: 'Скільки кроків і тренувань потрібно саме вам і з чого почати.', vimeo: '1248517539/14a8b8291c', thumb: '2230685406-481203a3781a7f8767b82e5d5b130ea0f71ea228b7e0ef4d61951d16a21bb86f', sec: 403 },
  { id: '3.3', block: 'Не лише їжа', title: 'Недосип — прихований ворог результату', about: 'Три прості звички: ранкове світло, вечірня темрява й менше гаджетів.', vimeo: '1248517583/e07cc728c2', thumb: '2230685513-553336cc2837d153c9be11eb01de98c1322d6a2a5062cf62f09166af93288257', sec: 348 },
  { id: '3.4', block: 'Не лише їжа', title: 'Як перестати переїдати ввечері? Режим допоможе', about: 'Вечірнє переїдання починається зранку: коли снідати, обідати й вечеряти.', vimeo: '1248517585/938720823f', thumb: '2230685691-c7632e377231c8fdbfd884a6119803de33bb6f707f98cc9b56b38bbd2bfb0ea1', sec: 403 },
];

/**
 * PDF-гайди Олени: public/guides/*.pdf — мобільні версії (вузька сторінка, 20.11).
 * Обкладинка — public/guides/covers/<name>.webp: верх першої сторінки гайду (ширина 400 px), у списку — сіткою 2 колонки.
 */
export interface Guide { title: string; file: string; pages: number; cover: string }
/** Коротка назва гайду для адреси перегляду: /guide/<slug> (= ім'я PDF без .pdf). */
export const guideSlug = (g: Guide) => g.file.split('/').pop()!.replace(/\.pdf$/, '');

export const GUIDES: Guide[] = [
  { title: 'Як обрати свою калорійність', file: '/guides/kaloriinist.pdf', pages: 8, cover: '/guides/covers/kaloriinist.webp' },
  { title: 'Список здорових продуктів', file: '/guides/zdorovi-produkty.pdf', pages: 11, cover: '/guides/covers/zdorovi-produkty.webp' },
  { title: 'Продукти, які варто виключити', file: '/guides/vykliuchyty.pdf', pages: 12, cover: '/guides/covers/vykliuchyty.webp' },
  { title: 'Налагодження сну', file: '/guides/son.pdf', pages: 6, cover: '/guides/covers/son.webp' },
  { title: 'Базові добавки', file: '/guides/dobavky.pdf', pages: 16, cover: '/guides/covers/dobavky.webp' },
];

/**
 * Посилання з поради на конкретний урок чи гайд.
 * «Урок 2.4 · Баланс» → /learn#l-2.4, «Вступ» → /learn#l-intro, «Бонус · …» → /learn#l-bonus, «Гайд · Список здорових продуктів» → PDF.
 */
function lessonByRef(ref: string): Lesson | undefined {
  const num = ref.match(/^Урок\s+([\d.]+)/);
  if (num) return LESSONS.find((l) => l.id === num[1]);
  if (/^Вступ/.test(ref)) return LESSONS.find((l) => l.id === 'intro');
  if (/^Бонус/.test(ref)) return LESSONS.find((l) => l.id === 'bonus');
  return undefined;
}

/** Підпис посилання в пораді: актуальна назва уроку без рядка-гачка — «Урок 2.3 · Герой нашого часу — білок! Чи все так однозначно?». Гайди — як є. */
export function lessonLabel(ref: string): string {
  const l = lessonByRef(ref);
  if (!l) return ref;
  const prefix = l.id === 'intro' ? 'Вступ' : l.id === 'bonus' ? 'Бонус' : `Урок ${l.id}`;
  return `${prefix} · ${l.title}`;
}

export function lessonHref(ref: string): string {
  const guide = ref.match(/^Гайд\s*·\s*(.+)$/);
  if (guide) { const g = GUIDES.find((x) => x.title === guide[1].trim()); return g ? `/guide/${guideSlug(g)}` : '/learn#guides'; }
  const num = ref.match(/^Урок\s+([\d.]+)/);
  if (num && LESSONS.some((l) => l.id === num[1])) return `/learn#l-${num[1]}`;
  if (/^Вступ/.test(ref)) return '/learn#l-intro';
  if (/^Бонус/.test(ref)) return '/learn#l-bonus';
  return '/learn';
}
