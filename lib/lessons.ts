/**
 * 12 відеоуроків і гайди. Відео — Vimeo (приховані посилання «за посиланням»), `vimeo` = "id/hash".
 * Етап 3: доступ лише з активною підпискою (зараз бачить кожен, хто відкрив застосунок).
 */
/** `title` — «продаюча» назва (затверджено 20.11), `about` — рядок-гачок під нею в списку. */
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
  { id: 'intro', block: 'Вступ', title: 'Збалансована тарілка без підрахунків і заборон', about: '6 хвилин — і ви знаєте, як зібрати тарілку з того, що вже є вдома.', vimeo: '1248517322/b59b5c586e', thumb: '2229010831-4ea9277ba4babeafa3c9d23a657c6982014e5e8e2f29c29834231f654ed362f7', sec: 351 },
  { id: '1', block: 'Харчування', title: 'Чому «правильна» їжа не дає результату', about: 'Вдома лише корисні продукти, а вага стоїть? Справа не в продуктах.', vimeo: '1248517323/9424a51e01', thumb: '2229011444-8b77258c39ac19ed4d0c66073062bdaa4209b3632f0e100763ea5b64e0d1fa56', sec: 1063 },
  { id: '2', block: 'Нутрієнти', title: 'Чому монодієти псують здоров’я', about: 'Білки, жири й вуглеводи — частини одного рецепта: без жодної він не складеться.', vimeo: '1248517325/3cdfed0663', thumb: '2229011629-be8c5151fb67345df46e0b8d6dbcab41e7e4e6de0b39f5fc3177a6e2937040a9', sec: 240 },
  { id: '2.1', block: 'Нутрієнти', title: 'Вуглеводи — ворог чи ні?', about: 'Енергія, клітковина і як обирати крупи, хліб і картоплю.', vimeo: '1248517404/6f03aeba9f', thumb: '2229011802-df7c1e21241e00073ac0656ea18b441dd77a92bbf52b6b8ae4815798e03c2557', sec: 479 },
  { id: '2.2', block: 'Нутрієнти', title: 'Чому «знежирене» — не завжди краще', about: 'Гормони, ситість, вітаміни — і скільки жиру насправді потрібно.', vimeo: '1248517433/57ad22a2ee', thumb: '2229011956-ab9d205e5d572ad66b6e9d61c8c6a66790c64d2248b98f30ccc6b8710ad29626', sec: 529 },
  { id: '2.3', block: 'Нутрієнти', title: 'Чому «більше білка» — не завжди краще', about: 'Ситість, імунітет і м’язи — і скільки білка потрібно насправді.', vimeo: '1248517455/6835a5a045', thumb: '2229012078-8f7a6dbaa58fbc3ee4926dcada5245163fb8851fc8d1de3370b3a3da5b670d60', sec: 501 },
  { id: '2.4', block: 'Нутрієнти', title: 'Чому одна тарілка ситить, а інша — ні', about: 'Проста формула: скільки вуглеводів, жирів і білка має бути на тарілці.', vimeo: '1248517476/9454dc379e', thumb: '2229012317-cc1f8bd519cc65f7598938ee3b87ce9dec780bff1391193c1d84972830b36496', sec: 544 },
  { id: 'bonus', block: 'Нутрієнти', title: 'Чому здорова їжа здається прісною', about: 'Смак і текстура — теж частина балансу: їжу на тарілці ви маєте хотіти їсти.', vimeo: '1248517324/5952f9b454', thumb: '2229011079-1e5343e66beadb7fdfbbe364b0943065ff0cf49b6a86bd73de9db6934bfaf8d6', sec: 705 },
  { id: '3.1', block: 'Не лише їжа', title: 'Чому що менше їсте, то гірший результат', about: 'Помірний дефіцит замість голодування — і що ще впливає на вагу.', vimeo: '1248517528/0bf7b4f6a2', thumb: '2229012526-492f2f6c5eb25696ddc28f1d3a77e462132b7e31a12b22cb825b1647b3b4e5ee', sec: 443 },
  { id: '3.2', block: 'Не лише їжа', title: 'Чому не обов’язково жити в спортзалі', about: 'Скільки кроків і тренувань потрібно саме вам і з чого почати.', vimeo: '1248517539/14a8b8291c', thumb: '2229012716-50aa4d12e7459d7ac2f2e8f46426ae3dd9f3f10b72bafaebf4e14d9c19f32fe1', sec: 403 },
  { id: '3.3', block: 'Не лише їжа', title: 'Чому недосип заважає схудненню', about: 'Три прості звички: ранкове світло, вечірня темрява й менше гаджетів.', vimeo: '1248517583/e07cc728c2', thumb: '2229012835-1f79b2ba32f84c8f0e7b4c144329638d9733740c6871640d84a7c3e154020925', sec: 348 },
  { id: '3.4', block: 'Не лише їжа', title: 'Чому ввечері тягне до холодильника', about: 'Вечірнє переїдання починається зранку: коли снідати, обідати й вечеряти.', vimeo: '1248517585/938720823f', thumb: '2229012940-209f5198c0322c68f76234a644a39fb70ae0ea71a2b139dedec3d9606561145a', sec: 403 },
];

/**
 * PDF-гайди Олени: public/guides/*.pdf — мобільні версії (вузька сторінка, 20.11).
 * Обкладинка — public/guides/covers/<name>.webp: верх першої сторінки гайду (ширина 400 px), у списку — сіткою 2 колонки.
 */
export interface Guide { title: string; file: string; pages: number; cover: string }
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

/** Підпис посилання в пораді: актуальна назва уроку без рядка-гачка — «Урок 2.3 · Чому «більше білка» — не завжди краще». Гайди — як є. */
export function lessonLabel(ref: string): string {
  const l = lessonByRef(ref);
  if (!l) return ref;
  const prefix = l.id === 'intro' ? 'Вступ' : l.id === 'bonus' ? 'Бонус' : `Урок ${l.id}`;
  return `${prefix} · ${l.title}`;
}

export function lessonHref(ref: string): string {
  const guide = ref.match(/^Гайд\s*·\s*(.+)$/);
  if (guide) return GUIDES.find((g) => g.title === guide[1].trim())?.file ?? '/learn#guides';
  const num = ref.match(/^Урок\s+([\d.]+)/);
  if (num && LESSONS.some((l) => l.id === num[1])) return `/learn#l-${num[1]}`;
  if (/^Вступ/.test(ref)) return '/learn#l-intro';
  if (/^Бонус/.test(ref)) return '/learn#l-bonus';
  return '/learn';
}
