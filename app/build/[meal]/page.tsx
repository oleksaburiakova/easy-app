'use client';
import { useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Icon } from '@/components/Icon';
import { Tip } from '@/components/Tip';
import { useRequireProfile } from '@/components/Guard';
import { usePlates, todayISO, type Selection } from '@/lib/store';
import { EGG_BRANCHES, GROUP_TITLES, STEP_TITLES, cookedHint, display, levelNode, mealTitle, type MealKey, type TreeOption, type TreeStep } from '@/lib/tree';
import { LEVEL_LABEL } from '@/lib/calories';
import { STEP_HINTS } from '@/lib/hints';

type Picks = Record<string, TreeOption>;

export default function Build() {
  const { meal } = useParams<{ meal: MealKey }>();
  const router = useRouter();
  const { profile, ready } = useRequireProfile();
  const { addPlate } = usePlates();
  const [picks, setPicks] = useState<Picks>({});
  const [idx, setIdx] = useState(0);
  const [noneOpen, setNoneOpen] = useState(false);

  const node = profile && ['breakfast', 'lunch', 'dinner'].includes(meal) ? levelNode(meal, profile.level) : null;

  /** Кроки будуються з дерева Олени і залежать від вибору (основа, яйця). */
  const steps: TreeStep[] = useMemo(() => {
    if (!node) return [];
    if (meal !== 'breakfast') return node.branches['default']?.steps ?? [];
    const out: TreeStep[] = [{ key: 'base', title: 'основа', options: node.bases ?? [] }];
    const base = picks.base;
    if (!base) return out;
    if (base.kind === 'pancake_type') return [...out, ...(node.branches[`base:${base.label}`]?.steps ?? [])];
    out.push({ key: 'eggs', title: 'яйця', options: EGG_BRANCHES.map((label) => ({ label })) });
    const eggs = picks.eggs;
    return eggs ? [...out, ...(node.branches[eggs.label]?.steps ?? [])] : out;
  }, [node, meal, picks.base, picks.eggs]);

  if (!ready || !profile) return null;
  if (!node) return <main className="app-main empty">Такого прийому їжі немає. <Link className="link" href="/">На головну</Link></main>;

  const step = steps[idx];
  const total = meal === 'breakfast' && steps.length < 4 ? 6 : steps.length;
  const picked = step ? picks[step.key] : undefined;
  const isLast = idx === steps.length - 1 && steps.length >= 3;

  const choose = (opt: TreeOption) => {
    setNoneOpen(false);
    setPicks((p) => {
      const next: Picks = { ...p, [step.key]: opt };
      // Зміна основи чи яєць змінює гілку — наступні вибори скидаємо.
      if (step.key === 'base' || step.key === 'eggs') {
        const keep = step.key === 'base' ? ['base'] : ['base', 'eggs'];
        for (const k of Object.keys(next)) if (!keep.includes(k)) delete next[k];
      }
      return next;
    });
  };

  const finish = () => {
    const selections: Selection[] = steps.map((s) => {
      const o = picks[s.key];
      const sel: Selection = { stepKey: s.key, stepTitle: STEP_TITLES[s.key] ?? s.title, label: o.label, group: o.group ?? null };
      if (s.key === 'veg') sel.portion = `${s.amount_g} г`;
      return sel;
    });
    const plate = addPlate({ date: todayISO(), meal, level: profile.level, selections, status: 'planned', favorite: false });
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
  for (const o of step?.options ?? []) {
    const g = o.group ?? null;
    byGroup.set(g, [...(byGroup.get(g) ?? []), o]);
  }
  const groups = [...byGroup.entries()];
  const hints = STEP_HINTS[step?.key ?? ''] ?? [];
  const hint = hints.length ? hints[(idx + (meal === 'dinner' ? 2 : 0)) % hints.length] : null;
  const stepTitle = STEP_TITLES[step?.key ?? ''] ?? step?.title;

  return (
    <main className="app-main fade-in" style={{ paddingBottom: 120 }}>
      <nav className="ez-nav" aria-label="Навігація">
        <Link className="ez-nav__back" href="/"><Icon name="back" size={18} /> Головна</Link>
        <span className="ez-caption">{LEVEL_LABEL[profile.level]}</span>
      </nav>
      <header className="ez-header" style={{ paddingTop: 4 }}>
        <h1 className="ez-large-title">{mealTitle(meal)}</h1>
        <p className="ez-subhead">Ідеальна тарілка за {total} кроків</p>
      </header>

      <div className="ez-stepcard">
        <span className="ez-caption" style={{ color: 'var(--secondary)' }}>Крок {idx + 1} з {total}</span>
        <span className="ez-headline">{stepTitle}{step?.key === 'veg' ? ` · ${step.amount_g} г` : ''}</span>
        <ol className="ez-steps" aria-label={`Кроки: ${mealTitle(meal)}`}>
          {Array.from({ length: total }).map((_, i) => (
            <li key={i} style={{ display: 'contents' }}>
              {i > 0 && <span className="ez-steps__line" aria-hidden="true" />}
              <span className={`ez-step ${i < idx ? 'ez-step--done' : i === idx ? 'ez-step--current' : 'ez-step--todo'}`} aria-current={i === idx ? 'step' : undefined}>
                {i < idx ? <Icon name="check" size={14} strokeWidth={3} /> : i + 1}
              </span>
            </li>
          ))}
        </ol>
      </div>

      {groups.map(([g, opts]) => (
        <section key={`${step.key}-${g ?? 'all'}`}>
          {g && GROUP_TITLES[g] && <h2 className="ez-headline" style={{ padding: '16px 12px 0', fontSize: 15 }}>{GROUP_TITLES[g]}</h2>}
          <div className="ez-grid">
            {opts.map((o) => {
              const d = step.key === 'eggs' ? { name: o.label.charAt(0).toUpperCase() + o.label.slice(1), portion: '' } : display(o);
              const portion = step.key === 'veg' ? `${step.amount_g} г` : d.portion;
              const cooked = cookedHint(o);
              const sel = picked?.label === o.label;
              return (
                <button key={o.label} className="ez-card" aria-pressed={sel} onClick={() => choose(o)}>
                  <span className="ez-card__img ph" aria-hidden="true">{d.name.charAt(0)}</span>
                  <span className="ez-card__row">
                    <span className="ez-card__text">
                      <span className="ez-card__name">{d.name}</span>
                      {(portion || cooked) && <span className="ez-card__portion">{[portion, cooked].filter(Boolean).join(' · ')}</span>}
                      {o.note && <span className="ez-card__portion">{o.note}</span>}
                    </span>
                    <span className="ez-card__check"><Icon name="check" size={14} strokeWidth={3} /></span>
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      ))}

      <div className="ez-stack" style={{ paddingTop: 0 }}>
        {step && step.key !== 'eggs' && (
          <button className="ez-card ez-card--none" onClick={() => setNoneOpen((v) => !v)} aria-expanded={noneOpen}>
            <span className="ez-card__name">Нічого з цього немає вдома</span>
            <span className="ez-card__portion">Підкажемо, що робити</span>
          </button>
        )}
        {noneOpen && (
          <Tip hint={{ text: idx > 0 ? 'Поверніться на крок назад і оберіть іншу основу чи гарнір — разом з ними зміниться й список. А на майбутнє загляньте в «Список здорових продуктів»: що варто мати вдома.' : 'Загляньте в «Список здорових продуктів»: там те, що варто мати вдома для збалансованих тарілок.', lesson: 'Гайд · Список здорових продуктів' }} />
        )}
        {hint && <Tip hint={hint} />}
      </div>

      <div className="bottom-bar">
        <div className="bottom-bar__inner ez-pair">
          <button className="ez-btn ez-btn--back" onClick={back}><Icon name="back" size={18} /> Назад</button>
          <button className="ez-btn ez-btn--primary" onClick={next} disabled={!picked}>{isLast ? 'Готово' : 'Продовжити'} <Icon name="chev" size={18} /></button>
        </div>
      </div>
    </main>
  );
}
