'use client';
import { useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Icon } from '@/components/Icon';
import { buildHero, nonePhoto, platePhoto, productPhoto } from '@/lib/photos';
import { Photo } from '@/components/Photo';
import { Tip } from '@/components/Tip';
import { Sheet } from '@/components/Sheet';
import { useRequireProfile } from '@/components/Guard';
import { usePlates, todayISO, type Plate, type Selection } from '@/lib/store';
import { EGG_BRANCHES, EXTRA_HINTS, EXTRA_OPTIONS, OTHER_SWEET, sweetGrams, GROUP_TITLES, MULTI_STEPS, SKIP_OPTIONS, SKIP_WARNINGS, proteinSnackNote, cheeseOptions, expandOptions, proteinSnackOptions, multiOptions, multiPortion, STEP_TITLES, cookedHint, dishBase, dishRank, DISH_GROUP, display, isNoneOption, levelNode, mealTitle, optionGroup, optionNote, type MealKey, type TreeOption, type TreeStep } from '@/lib/tree';
import { LEVEL_LABEL } from '@/lib/calories';
import { stepHint } from '@/lib/hints';
import { plateTitle, sweetPaused, withoutSweet, SWEET_STEP, SWEET_PAUSE_NOTE } from '@/lib/plate';
import { recipeFor } from '@/lib/recipes';

type Picks = Record<string, TreeOption>;

export default function Build() {
  const { meal } = useParams<{ meal: MealKey }>();
  const router = useRouter();
  const { profile, ready } = useRequireProfile();
  const { plates, addPlate, ready: plReady } = usePlates();
  const [picks, setPicks] = useState<Picks>({});
  /** Кроки з вибором кількох (овочі, фрукти): обрані продукти по ключу кроку. */
  const [multi, setMulti] = useState<Record<string, string[]>>({});
  const [idx, setIdx] = useState(0);
  const [noneOpen, setNoneOpen] = useState(false);
  const [skipWarn, setSkipWarn] = useState<string | null>(null);
  /** Сніданок-страва за рецептом (млинці, панкейки, галета): спершу — чи всі продукти є вдома (Олександра, 27.11). */
  const [recipeAsk, setRecipeAsk] = useState<TreeOption | null>(null);
  /** «Інша солодощ»: що обрали й калорійність на 100 г — порахуємо грами на 50–80 ккал. */
  const [sweet, setSweet] = useState({ name: '', kcal: '' });
  // Своя солодощ — спливаюче вікно: що обрали й калорійність → скільки грамів (Олена, 27.11).
  const [sweetOpen, setSweetOpen] = useState(false);
  const [sweetDraft, setSweetDraft] = useState({ name: '', kcal: '' });
  const [sweetPrev, setSweetPrev] = useState<TreeOption | undefined>();
  const draftPortion = sweetGrams(Number(sweetDraft.kcal));
  const sweetPortion = sweetGrams(Number(sweet.kcal));

  const node = profile && ['breakfast', 'lunch', 'dinner'].includes(meal) ? levelNode(meal, profile.level) : null;

  /** Кроки будуються з дерева Олени і залежать від вибору (основа, яйця). */
  /** Солодке не частіше, ніж через день: учора було (або сьогодні вже є в іншому прийомі) — кроку «Десерт» немає. */
  const paused = plReady && sweetPaused(plates, meal);
  const rawSteps: TreeStep[] = useMemo(() => arrange(meal as MealKey, picks.eggs?.label, (() => {
    if (!node) return [];
    if (meal !== 'breakfast') return node.branches['default']?.steps ?? [];
    const out: TreeStep[] = [{ key: 'base', title: 'основа', options: node.bases ?? [] }];
    const base = picks.base;
    if (!base) return out;
    if (base.kind === 'pancake_type') return [...out, ...(node.branches[`base:${base.label}`]?.steps ?? [])];
    out.push({ key: 'eggs', title: 'яйця', options: EGG_BRANCHES.map((label) => ({ label })) });
    const eggs = picks.eggs;
    return eggs ? [...out, ...(node.branches[eggs.label]?.steps ?? [])] : out;
  })()), [node, meal, picks.base, picks.eggs]);
  const sweetCut = paused && rawSteps.some((s) => s.key === SWEET_STEP);
  const steps = useMemo(() => (sweetCut ? rawSteps.filter((s) => s.key !== SWEET_STEP) : rawSteps), [rawSteps, sweetCut]);

  /** Улюблені страви цього прийому їжі під поточну калорійність (з іншою калорійністю грамовки не ті). */
  const favs: Plate[] = useMemo(() => {
    if (!profile) return [];
    const seen = new Set<string>();
    return plates
      .filter((p) => p.favorite && p.meal === meal && p.level === profile.level)
      .reverse()
      .filter((p) => {
        const sig = p.selections.map((x) => x.label).join('|');
        if (seen.has(sig)) return false;
        seen.add(sig);
        return true;
      })
      .slice(0, 6);
  }, [plates, meal, profile]);

  if (!ready || !profile || !plReady) return null;
  if (!node) return <main className="app-main empty">Такого прийому їжі немає. <Link className="link" href="/">На головну</Link></main>;

  const step = steps[idx];
  const total = meal === 'breakfast' && steps.length < 4 ? 6 : steps.length;
  const multiCfg = step ? MULTI_STEPS[step.key] : undefined;
  const multiSel = step && multiCfg ? multi[step.key] ?? [] : [];
  const rawPicked = step ? (multiCfg ? (multiSel.length ? { label: multiSel.join(', ') } : undefined) : picks[step.key]) : undefined;
  // «Інша солодощ» без вписаної назви — ще не вибір.
  const picked = rawPicked?.label === OTHER_SWEET && !sweet.name.trim() ? undefined : rawPicked;
  const isLast = idx === steps.length - 1 && steps.length >= 3;

  const choose = (opt: TreeOption) => {
    setNoneOpen(false);
    if (step.key === 'base' && recipeFor(opt.label) && picks.base?.label !== opt.label) { setRecipeAsk(opt); return; }
    pick(opt);
  };
  /** Підтвердили, що продукти для рецепта є: обираємо основу й переходимо до наступного кроку. */
  const confirmRecipe = () => {
    if (!recipeAsk) return;
    pick(recipeAsk);
    setRecipeAsk(null);
    setIdx(1);
    window.scrollTo({ top: 0 });
  };
  const pick = (opt: TreeOption) => {
    if (opt.label === OTHER_SWEET) { setSweetDraft(sweet); setSweetPrev(picks[step.key]?.label === OTHER_SWEET ? undefined : picks[step.key]); setSweetOpen(true); }
    // Пропуск кроку з попередженням (добір білка) — порада спливаючим вікном.
    if (SKIP_WARNINGS[step.key] && opt.label === SKIP_OPTIONS[step.key] && picks[step.key]?.label !== opt.label) setSkipWarn(step.key);
    setPicks((p) => {
      const next: Picks = { ...p, [step.key]: opt };
      // Зміна основи чи яєць змінює гілку — наступні вибори скидаємо.
      if (step.key === 'base' || step.key === 'eggs') {
        const keep = step.key === 'base' ? ['base'] : ['base', 'eggs'];
        for (const k of Object.keys(next)) if (!keep.includes(k)) delete next[k];
        setMulti({});
      }
      return next;
    });
  };
  const toggleMulti = (item: string) => {
    if (!step || !multiCfg) return;
    setNoneOpen(false);
    setMulti((m) => {
      const cur = m[step.key] ?? [];
      const nextList = cur.includes(item) ? cur.filter((x) => x !== item) : cur.length >= multiCfg.max ? cur : [...cur, item];
      return { ...m, [step.key]: nextList };
    });
  };

  const repeat = (fav: Plate) => {
    const plate = addPlate({ date: todayISO(), meal, level: fav.level, selections: withoutSweet(fav.selections, paused), status: 'eaten', favorite: false });
    router.push(`/plate/${plate.id}`);
  };

  const finish = () => {
    // «Без шоколаду» тощо в тарілку не потрапляє; «без яєць» лишається — від нього залежить гілка.
    const selections: Selection[] = steps.filter((s) => !(SKIP_OPTIONS[s.key] && picks[s.key]?.label === SKIP_OPTIONS[s.key])).map((s) => {
      if (MULTI_STEPS[s.key]) {
        // Овочі / фрукти: перелік обраного, грамовка на весь крок («від 150 г», «70–100 г»).
        return { stepKey: s.key, stepTitle: STEP_TITLES[s.key] ?? s.title, label: (multi[s.key] ?? []).join(', '), portion: multiPortion(s), group: null };
      }
      const o = picks[s.key];
      // Своя солодощ — з тим, що вписали, і грамами за калорійністю.
      if (o.label === OTHER_SWEET) return { stepKey: s.key, stepTitle: STEP_TITLES[s.key] ?? s.title, label: sweet.name.trim() || OTHER_SWEET, portion: sweetPortion ? `≈ ${sweetPortion}` : undefined, group: null };
      return { stepKey: s.key, stepTitle: STEP_TITLES[s.key] ?? s.title, label: o.label, group: o.group ?? null };
    });
    const plate = addPlate({ date: todayISO(), meal, level: profile.level, selections, status: 'eaten', favorite: false });
    router.push(`/plate/${plate.id}`);
  };

  const next = () => {
    if (!picked) return;
    if (isLast) return finish();
    setIdx((i) => i + 1);
    setNoneOpen(false);
    window.scrollTo({ top: 0 });
  };
  const back = () => {
    if (idx === 0) return router.push('/');
    setIdx((i) => i - 1);
    setNoneOpen(false);
  };

  // Групи (крупи / макарони / …) показуємо підзаголовками.
  const byGroup = new Map<string | null, TreeOption[]>();
  const skip = step && SKIP_OPTIONS[step.key];
  const stepOptions = step ? (multiCfg ? multiOptions(step, meal) : [...step.options, ...(EXTRA_OPTIONS[step.key] ?? [])]) : [];
  for (const o of [...stepOptions, ...(skip ? [{ label: skip }] : [])]) {
    const g = optionGroup(o);
    byGroup.set(g, [...(byGroup.get(g) ?? []), o]);
  }
  const dishes = byGroup.get(DISH_GROUP);
  if (dishes) dishes.sort((x, y) => dishRank(x.label) - dishRank(y.label));
  const groups = [...byGroup.entries()];
  const hint = step ? stepHint(step.key, meal, idx) : null;
  const stepTitle = STEP_TITLES[step?.key ?? ''] ?? step?.title;
  const hero = buildHero(meal);
  // Улюблені — рядком зверху першого кроку (рішення Олександри 22.11: без окремого екрана вибору), вигляд — як на головній (25.11).
  const showFavs = idx === 0 && favs.length > 0;

  return (
    <main className="app-main fade-in pb-actions">
      <header className={`build-hero${hero ? ' build-hero--photo' : ''}`}>
        {hero && <img className="build-hero__img" src={hero} alt="" />}
        <nav className="ez-nav" aria-label="Навігація">
          <Link className="ez-nav__back" href="/"><Icon name="back" size={18} /> Головна</Link>
          {!hero && <span className="ez-caption">{LEVEL_LABEL[profile.level]}</span>}
        </nav>
        <div className="build-hero__text">
          <h1 className="ez-large-title">{mealTitle(meal)}</h1>
          <p className="ez-subhead">Ідеальна тарілка<br />за {total} кроків</p>
          {hero && <span className="ez-caption">{LEVEL_LABEL[profile.level]}</span>}
        </div>
      </header>

      {showFavs && (
        // Так само, як «Улюблені страви» на головній: одне головне фото й назва; натиск — «Повторити».
        <section aria-label="Улюблені страви">
          <div className="ez-section-head"><h2 className="ez-headline">Улюблені страви</h2><span className="ez-caption">Натисніть — повторимо</span></div>
          <div className="ez-favs">
            {favs.map((f) => (
              <div className="ez-fav" key={f.id}>
                <button onClick={() => repeat(f)} aria-label={`Повторити: ${plateTitle(f.meal, f.selections)}`}>
                  <Photo className="ez-fav__img" src={platePhoto(f.meal, f.selections)} letter={plateTitle(f.meal, f.selections).charAt(0)} />
                  <span className="ez-fav__name">{plateTitle(f.meal, f.selections)}</span>
                </button>
              </div>
            ))}
          </div>
          <p className="bf-favs__or">або зберіть нову тарілку</p>
        </section>
      )}

      <div className="ez-stepcard">
        <span className="ez-caption c-secondary">Крок {idx + 1} з {total}</span>
        <span className="ez-headline">{stepTitle}{step && multiCfg ? ` · ${multiPortion(step)}` : ''}</span>
        {step && multiCfg && (
          <span className="ez-caption">
            {step.key === 'veg' ? 'Оберіть скільки завгодно — мінімум 150 г, можна більше' : `Оберіть до ${multiCfg.max} — разом ${multiPortion(step)}`}
            {multiSel.length > 0 && ` · обрано ${multiSel.length}${multiCfg.max < 99 ? ` з ${multiCfg.max}` : ''}`}
          </span>
        )}
        {step?.key === 'protein' && meal !== 'breakfast' && <span className="ez-caption">Вага м'яса й риби — в сирому вигляді</span>}
        <ol className="ez-steps" aria-label={`Кроки: ${mealTitle(meal)}`}>
          {Array.from({ length: total }).map((_, i) => (
            <li key={i} className="contents">
              {i > 0 && <span className="ez-steps__line" aria-hidden="true" />}
              {i < idx ? (
                // Пройдений крок — можна повернутися на нього одним натиском (рішення 24.11).
                <button className="ez-step ez-step--done ez-step--link" onClick={() => { setIdx(i); setNoneOpen(false); window.scrollTo({ top: 0 }); }} aria-label={`Повернутися на крок ${i + 1}: ${STEP_TITLES[steps[i]?.key ?? ''] ?? steps[i]?.title ?? ''}`}>
                  <Icon name="check" size={14} strokeWidth={3} />
                </button>
              ) : (
                <span className={`ez-step ${i === idx ? 'ez-step--current' : 'ez-step--todo'}`} aria-current={i === idx ? 'step' : undefined}>{i + 1}</span>
              )}
            </li>
          ))}
        </ol>
      </div>

      {step?.key === 'protein_snack' && <div className="step-tip"><Tip hint={proteinSnackNote(picks.eggs?.label)} className="pop-in" /></div>}
      {hint && <div className="step-tip"><Tip hint={hint} key={`${step.key}-${idx}`} className="pop-in" /></div>}
      {sweetCut && isLast && <div className="step-tip"><Tip hint={{ text: SWEET_PAUSE_NOTE }} className="pop-in" /></div>}

      {groups.map(([g, opts]) => (
        <section key={`${step.key}-${g ?? 'all'}`}>
          {g && GROUP_TITLES[g] && <h2 className="ez-headline group-title">{GROUP_TITLES[g]}</h2>}
          <div className="ez-grid">
            {opts.map((o) => {
              const none = isNoneOption(o.label);
              const d = step.key === 'eggs' || none ? { name: o.label.charAt(0).toUpperCase() + o.label.slice(1), portion: '' } : display(o);
              const portion = none || multiCfg ? '' : d.portion;
              const cooked = cookedHint(o);
              const note = o.label === OTHER_SWEET && sweet.name.trim() && picked?.label === OTHER_SWEET
                ? [sweet.name.trim(), sweetPortion && `≈ ${sweetPortion}`].filter(Boolean).join(' · ')
                : optionNote(o);
              const sel = multiCfg ? multiSel.includes(o.label) : picked?.label === o.label;
              const full = !!multiCfg && !sel && multiSel.length >= multiCfg.max;
              return (
                <button key={o.label} className={`ez-card${none ? ' ez-card--skip' : ''}${multiCfg ? ' ez-card--multi' : ''}`} aria-pressed={sel} disabled={full} onClick={() => (multiCfg ? toggleMulti(o.label) : choose(o))}>
                  {(() => {
                    const src = none ? nonePhoto(o.label) : productPhoto(dishBase(o.label) ? o.label : d.name);
                    return src
                      ? <img className="ez-card__img" src={src} alt="" loading="lazy" />
                      : <span className="ez-card__img ph" aria-hidden="true">{d.name.charAt(0)}</span>;
                  })()}
                  <span className="ez-card__row">
                    <span className="ez-card__text">
                      <span className="ez-card__name">{d.name}</span>
                      {(portion || cooked) && <span className="ez-card__portion">{[portion, cooked].filter(Boolean).join(' · ')}</span>}
                      {note && <span className="ez-card__portion ez-card__note">{note}</span>}
                    </span>
                    <span className="ez-card__check"><Icon name="check" size={14} strokeWidth={3} /></span>
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      ))}

      <div className="ez-stack flush-top">
        {step && step.key !== 'eggs' && (
          <button className="ez-card ez-card--none" onClick={() => setNoneOpen(true)} aria-haspopup="dialog">
            <span className="ez-card__name">Нічого з цього немає вдома</span>
            <span className="ez-card__portion">Підкажемо, що робити</span>
          </button>
        )}
        {picked && picked.label !== OTHER_SWEET && EXTRA_HINTS[picked.label] && <Tip hint={{ text: EXTRA_HINTS[picked.label] }} className="pop-in" />}
      </div>

      {noneOpen && (
        <Sheet title="Нічого з цього немає вдома" onClose={() => setNoneOpen(false)}>
          <Tip hint={{ text: `${idx > 0 ? 'Спробуйте повернутися на крок назад і обрати іншу основу чи гарнір — разом з ними зміниться й список. ' : ''}Перевірте, що є вдома, складіть список покупок і почніть завтра — так буде з чого збирати тарілки. Зверніть увагу на білково-жирові продукти, що швидко псуються, і на овочі: їх зазвичай немає в запасі.`, lesson: 'Гайд · Список здорових продуктів' }} />
          <button className="ez-btn ez-btn--primary ez-btn--block" onClick={() => setNoneOpen(false)}>Зрозуміло</button>
        </Sheet>
      )}

      {recipeAsk && (() => {
        const r = recipeFor(recipeAsk.label);
        if (!r) return null;
        return (
          <Sheet title={r.title} onClose={() => setRecipeAsk(null)}>
            <p className="ez-subhead m-0">Перевірте, чи все є вдома:</p>
            <ul className="recipe-list">{r.ingredients.map((x) => <li key={x}>{x}</li>)}</ul>
            {r.note && <p className="ez-footnote m-0">{r.note}</p>}
            <p className="ez-footnote m-0">Рецепт приготування буде на тарілці.</p>
            <button className="ez-btn ez-btn--primary ez-btn--block" onClick={confirmRecipe}>Усе є — продовжити</button>
            <button className="ez-btn ez-btn--back ez-btn--block" onClick={() => setRecipeAsk(null)}>Чогось немає — оберу інше</button>
          </Sheet>
        );
      })()}

      {skipWarn && SKIP_WARNINGS[skipWarn] && (() => {
        const w = SKIP_WARNINGS[skipWarn];
        return (
          <Sheet title={w.title} onClose={() => setSkipWarn(null)}>
            <Tip hint={w} />
            <button className="ez-btn ez-btn--primary ez-btn--block" onClick={() => setSkipWarn(null)}>Зрозуміло</button>
            <button className="ez-btn ez-btn--back ez-btn--block" onClick={() => { setPicks((p) => { const n = { ...p }; delete n[skipWarn]; return n; }); setSkipWarn(null); }}>Все ж додати білок</button>
          </Sheet>
        );
      })()}

      {sweetOpen && (() => {
        const close = () => { setSweetOpen(false); if (!sweet.name.trim()) setPicks((p) => { const n = { ...p }; if (sweetPrev) n[SWEET_STEP] = sweetPrev; else delete n[SWEET_STEP]; return n; }); };
        return (
          <Sheet title="Інша солодощ" onClose={close}>
            <Tip hint={{ text: EXTRA_HINTS[OTHER_SWEET] }} />
            <label className="ez-field"><span className="ez-label">Що обрали</span>
              <input className="ez-input" maxLength={40} placeholder="Напр. халва, мармелад, вафлі" value={sweetDraft.name} onChange={(e) => setSweetDraft((v) => ({ ...v, name: e.target.value }))} />
            </label>
            <label className="ez-field"><span className="ez-label">Ккал на 100 г (з упаковки)</span>
              <input className="ez-input" inputMode="numeric" placeholder="Напр. 320" value={sweetDraft.kcal} onChange={(e) => setSweetDraft((v) => ({ ...v, kcal: e.target.value.replace(/\D/g, '').slice(0, 3) }))} />
            </label>
            {draftPortion
              ? <p className="ez-headline m-0">З'їжте ≈ {draftPortion}</p>
              : sweetDraft.kcal && <p className="ez-footnote m-0">Перевірте число: калорійність на 100 г — зазвичай від 50 до 900 ккал.</p>}
            <button className="ez-btn ez-btn--primary ez-btn--block" disabled={!sweetDraft.name.trim() || !draftPortion} onClick={() => { setSweet(sweetDraft); setSweetOpen(false); }}>Зберегти</button>
          </Sheet>
        );
      })()}

      <div className="bottom-bar">
        <div className="bottom-bar__inner ez-pair">
          <button className="ez-btn ez-btn--back" onClick={back}><Icon name="back" size={18} /> Назад</button>
          <button className="ez-btn ez-btn--primary" onClick={next} disabled={!picked}>{isLast ? 'Готово' : 'Продовжити'} <Icon name="chev" size={18} /></button>
        </div>
      </div>
    </main>
  );
}

/** На обіді крок «Сир»: пармезан і гауда — окремо, йогурт — заправка для салату (`cheeseOptions`). Порядок кроків: «Сир» — після «Овочі», щоб до салату можна було підказати фету (рішення 24.11). Варіанти «a \\ b \\ c» — окремими картками. */
function arrange(meal: MealKey, eggs: string | undefined, steps: TreeStep[]): TreeStep[] {
  const out = steps.map((s) => ({ ...s, options: proteinSnackOptions({ ...s, options: cheeseOptions({ ...s, options: expandOptions(s.options) }, meal) }, eggs) }));
  const c = out.findIndex((s) => s.key === 'cheese');
  const v = out.findIndex((s) => s.key === 'veg');
  if (c >= 0 && v > c) out.splice(v, 0, out.splice(c, 1)[0]);
  return out;
}
