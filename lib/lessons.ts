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
/** Обкладинка уроку з Vimeo (оновиться, якщо в Vimeo змінити обкладинку — тоді оновити й `thumb`). */
export const lessonThumb = (l: Lesson) => (l.thumb ? `https://i.vimeocdn.com/video/${l.thumb}-d_640` : null);
export const durationLabel = (sec?: number) => (sec ? `${Math.round(sec / 60)} хв` : '');

export const LESSON_BLOCKS = ['Вступ', 'Харчування', 'Нутрієнти', 'Не лише їжа'] as const;

export const LESSONS: Lesson[] = [
  { id: 'intro', block: 'Вступ', title: 'Збалансована тарілка без підрахунків і заборон', about: '6 хвилин — і ви знаєте, як зібрати тарілку з того, що вже є вдома.', vimeo: '1248517322/b59b5c586e', thumb: '2228637030-36dec2190353c850d1efa7a62c8204af0b785b929ac6265d3fb37c1d67c385cc', sec: 351 },
  { id: '1', block: 'Харчування', title: 'Чому «правильна» їжа не дає результату', about: 'Вдома лише корисні продукти, а вага стоїть? Справа не в продуктах.', vimeo: '1248517323/9424a51e01', thumb: '2228636975-4a4634133baf6b32e53392ad137f3279cfb752b03fba2228ce28bea0eb58ef4b', sec: 1063 },
  { id: '2', block: 'Нутрієнти', title: 'Чому монодієти псують здоров’я', about: 'Білки, жири й вуглеводи — частини одного рецепта: без жодної він не складеться.', vimeo: '1248517325/3cdfed0663', thumb: '2228637012-28c481aa7172664dea4dbc62ec64722d143e153896162f2da8944566c4da3ae2', sec: 240 },
  { id: '2.1', block: 'Нутрієнти', title: 'Вуглеводи — ворог чи ні?', about: 'Енергія, клітковина і як обирати крупи, хліб і картоплю.', vimeo: '1248517404/6f03aeba9f', thumb: '2228637124-2debb6ff4c722694729ec198b2b9071f410d55b5cbf45bcf8639c0b8a1f122f3', sec: 479 },
  { id: '2.2', block: 'Нутрієнти', title: 'Чому «знежирене» — не завжди краще', about: 'Гормони, ситість, вітаміни — і скільки жиру насправді потрібно.', vimeo: '1248517433/57ad22a2ee', thumb: '2228637142-5ecb2bbe616a167d32bcdd8fc28622379a82583bad45f3384aada451babfc1ad', sec: 529 },
  { id: '2.3', block: 'Нутрієнти', title: 'Чому «більше білка» — не завжди краще', about: 'Ситість, імунітет і м’язи — і скільки білка потрібно насправді.', vimeo: '1248517455/6835a5a045', thumb: '2228637191-4a59b020c9cace8db2410dc20a7976aba434137d0894db48e3b39d33cd1e765f', sec: 501 },
  { id: '2.4', block: 'Нутрієнти', title: 'Чому одна тарілка ситить, а інша — ні', about: 'Проста формула: скільки вуглеводів, жирів і білка має бути на тарілці.', vimeo: '1248517476/9454dc379e', thumb: '2228637196-76fc46805dbd76a6f7838b27d904265384b00afb15f7606f4a40231b63f1216f', sec: 544 },
  { id: 'bonus', block: 'Нутрієнти', title: 'Чому здорова їжа здається прісною', about: 'Смак і текстура — теж частина балансу: їжу на тарілці ви маєте хотіти їсти.', vimeo: '1248517324/5952f9b454', thumb: '2228637056-446f738f437e4eeb3740f10b86acefffc8f42c9d4e5b8562006d9b7f2a071d6d', sec: 705 },
  { id: '3.1', block: 'Не лише їжа', title: 'Чому що менше їсте, то гірший результат', about: 'Помірний дефіцит замість голодування — і що ще впливає на вагу.', vimeo: '1248517528/0bf7b4f6a2', sec: 443 },
  { id: '3.2', block: 'Не лише їжа', title: 'Чому не обов’язково жити в спортзалі', about: 'Скільки кроків і тренувань потрібно саме вам і з чого почати.', vimeo: '1248517539/14a8b8291c', thumb: '2228637259-7fd8f751532616a0ad59ededd7edfb141354ec2c1c1d9df03545861f4f5ab380', sec: 403 },
  { id: '3.3', block: 'Не лише їжа', title: 'Чому недосип заважає схудненню', about: 'Три прості звички: ранкове світло, вечірня темрява й менше гаджетів.', vimeo: '1248517583/e07cc728c2', thumb: '2228637297-0672cb66f57e2e7553dc6fb9171a00450ebe0e2823694663af2002e670fd4466', sec: 348 },
  { id: '3.4', block: 'Не лише їжа', title: 'Чому ввечері тягне до холодильника', about: 'Вечірнє переїдання починається зранку: коли снідати, обідати й вечеряти.', vimeo: '1248517585/938720823f', thumb: '2228637280-930126cc211d8fa3624f5cc940a98c9ec2c8038e0bc11a25cb9e3617b8cce067', sec: 403 },
];

/**
 * PDF-гайди Олени: public/guides/*.pdf — мобільні версії (вузька сторінка, 20.11).
 * Обкладинка — public/guides/covers/<name>.webp, 384×216: два фото з першої сторінки гайду.
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
export function lessonHref(ref: string): string {
  const guide = ref.match(/^Гайд\s*·\s*(.+)$/);
  if (guide) return GUIDES.find((g) => g.title === guide[1].trim())?.file ?? '/learn#guides';
  const num = ref.match(/^Урок\s+([\d.]+)/);
  if (num && LESSONS.some((l) => l.id === num[1])) return `/learn#l-${num[1]}`;
  if (/^Вступ/.test(ref)) return '/learn#l-intro';
  if (/^Бонус/.test(ref)) return '/learn#l-bonus';
  return '/learn';
}
