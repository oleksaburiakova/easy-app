'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Icon, CheckCircle } from '@/components/Icon';
import { Tip } from '@/components/Tip';
import { useRequireProfile } from '@/components/Guard';
import { usePlates } from '@/lib/store';
import { cookedHint, display, mealTitle, tidy } from '@/lib/tree';
import { LEVEL_LABEL } from '@/lib/calories';
import { plateTitle } from '@/lib/plate';

export default function PlatePage() {
  const { id } = useParams<{ id: string }>();
  const { ready } = useRequireProfile();
  const { plates, updatePlate, ready: plReady } = usePlates();
  const [toast, setToast] = useState('');
  if (!ready || !plReady) return null;
  const plate = plates.find((p) => p.id === id);
  if (!plate) return <main className="app-main empty">Тарілку не знайдено. <Link className="link" href="/">На головну</Link></main>;

  const title = plateTitle(plate.meal, plate.selections);
  const hasOil = plate.selections.some((s) => /олі/.test(s.label));
  const notes: string[] = [];
  for (const s of plate.selections) {
    const c = cookedHint({ label: s.label, ...parseAmount(s.label) });
    if (c) notes.push(`${display({ label: s.label }).name} — суха вага, після варіння ${c.replace(/ (готов\S+)$/, '')}.`);
  }
  if (hasOil) notes.push('«+ мл олії» — жир можна взяти олією, вершковим маслом, авокадо чи горішками.');
  notes.push('Зелень — щонайменше 10 г до кожного прийому їжі.');

  const flash = (t: string) => { setToast(t); setTimeout(() => setToast(''), 1800); };

  return (
    <main className="app-main fade-in" style={{ paddingBottom: 170 }}>
      <nav className="ez-nav" aria-label="Навігація">
        <Link className="ez-nav__back" href="/"><Icon name="back" size={18} /> Головна</Link>
        <span className="ez-caption">{mealTitle(plate.meal)} · {LEVEL_LABEL[plate.level]}</span>
      </nav>
      <div className="ez-hero">
        <div className="ph ph--hero" aria-hidden="true">{title.charAt(0)}</div>
        <div className="ez-hero__shade" aria-hidden="true" />
        <h1 className="ez-hero__title">{title}</h1>
      </div>

      <div className="ez-stack">
        <section className="ez-list" aria-label="Інгредієнти">
          <p className="ez-list__title">Інгредієнти</p>
          {plate.selections.map((s) => {
            const d = s.stepKey === 'eggs' ? { name: 'Яйця', portion: s.label === 'без яєць' ? '—' : s.label.replace(/^яйц[яе]\s*/, '') + (s.label === 'яйце 1' ? ' шт' : '') } : display({ label: s.label, composite: /\/|\+\s*[а-яіїєґ]/i.test(s.label) });
            if (s.stepKey === 'eggs' && s.label === 'без яєць') return null;
            return (
              <div className="ez-irow" key={s.stepKey}>
                <span className="ez-irow__thumb ph" style={{ fontSize: 14 }} aria-hidden="true">{d.name.charAt(0)}</span>
                <span className="ez-irow__name" style={{ display: 'flex', flexDirection: 'column' }}>
                  <span className="ez-footnote" style={{ fontWeight: 600 }}>{s.stepTitle}</span>
                  {s.stepKey === 'veg' ? tidy(s.label.replace(/^картинка:\s*\(?/, '').replace(/\)$/, '')) : d.name}
                </span>
                <span className="ez-irow__grams">{s.portion ?? d.portion}</span>
              </div>
            );
          })}
          {notes.map((n) => <p className="ez-list__note" key={n}>{n}</p>)}
        </section>
        <Link className="link" href={`/build/${plate.meal}`} style={{ padding: '0 4px' }}>Зібрати інакше ›</Link>

        <section className="ez-list" aria-label="Як приготувати">
          <p className="ez-list__title">Як приготувати</p>
          <p className="ez-list__note" style={{ color: 'var(--secondary)' }}>Рецепт під цю тарілку згенерується тут автоматично — з’явиться на наступному етапі разом з ІІ-рецептами за правилами Олени.</p>
        </section>

        <Tip hint={{ text: 'Створюйте страви, а не просто набір продуктів: рис + нут + м’ясо — плов, спагеті + фарш + томати — болоньєзе, картопля + квасоля + м’ясо — борщ.', lesson: 'Вступ' }} />
      </div>

      <div className="bottom-bar">
        <div className="bottom-bar__inner gap-3">
          <div className="ez-pair">
            <button className="ez-btn ez-btn--soft" onClick={() => { updatePlate(plate.id, { status: plate.status === 'eaten' ? 'planned' : 'eaten' }); flash(plate.status === 'eaten' ? 'Позначку знято' : "Збережено: з'їдено"); }}>
              <span style={{ color: plate.status === 'eaten' ? 'var(--olive)' : 'var(--burgundy)', display: 'flex' }}><CheckCircle /></span>
              {plate.status === 'eaten' ? "З'їдено" : "З'їдено?"}
            </button>
            <button className="ez-btn ez-btn--soft" aria-pressed={plate.favorite} onClick={() => { updatePlate(plate.id, { favorite: !plate.favorite }); flash(plate.favorite ? 'Прибрано з улюблених' : 'Додано в улюблені'); }}>
              <span style={{ color: 'var(--burgundy)', display: 'flex' }}><Icon name="heart" size={18} filled={plate.favorite} /></span>
              {plate.favorite ? 'В улюблених' : 'В улюблені'}
            </button>
          </div>
          <Link href="/" className="ez-btn ez-btn--primary ez-btn--block">На головну</Link>
        </div>
      </div>
      {toast && <div className="toast" role="status">{toast}</div>}
    </main>
  );
}

function parseAmount(label: string) {
  const m = label.match(/(\d+(?:[.,]\d+)?)\s*г/);
  return m ? { amount: Number(m[1].replace(',', '.')), unit: 'g' } : {};
}
