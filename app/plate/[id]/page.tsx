'use client';
import { Photo } from '@/components/Photo';
import { plateCollage, selectionPhoto } from '@/lib/photos';
import { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Icon } from '@/components/Icon';
import { Tip } from '@/components/Tip';
import { useRequireProfile } from '@/components/Guard';
import { usePlates, todayISO } from '@/lib/store';
import { cookedHint, dishBase, display, mealTitle, oilChoices, splitOil, tidy } from '@/lib/tree';
import { LEVEL_LABEL } from '@/lib/calories';
import { plateTitle } from '@/lib/plate';

export default function PlatePage() {
  const { id } = useParams<{ id: string }>();
  const { ready } = useRequireProfile();
  const { plates, addPlate, updatePlate, ready: plReady } = usePlates();
  const router = useRouter();
  const [toast, setToast] = useState('');
  if (!ready || !plReady) return null;
  const plate = plates.find((p) => p.id === id);
  if (!plate) return <main className="app-main empty">Тарілку не знайдено. <Link className="link" href="/">На головну</Link></main>;

  const title = plateTitle(plate.meal, plate.selections);
  const notes: string[] = [];
  const isToday = plate.date === todayISO();
  const collage = plateCollage(plate.meal, plate.selections);
  for (const s of plate.selections) {
    const c = cookedHint({ label: s.label, ...parseAmount(s.label) });
    if (c) notes.push(`${display({ label: s.label }).name} — суха вага, після варіння ${c.replace(/ (готов\S+)$/, '')}.`);
  }
  notes.push('Зелень — щонайменше 10 г до кожного прийому їжі.');

  const flash = (t: string) => { setToast(t); setTimeout(() => setToast(''), 1800); };

  return (
    <main className="app-main fade-in" style={{ paddingBottom: 170 }}>
      <nav className="ez-nav" aria-label="Навігація">
        <Link className="ez-nav__back" href="/"><Icon name="back" size={18} /> Головна</Link>
        <span className="ez-caption">{mealTitle(plate.meal)} · {LEVEL_LABEL[plate.level]}</span>
      </nav>
      <div className="ez-hero">
        {collage.length ? (
          <div className={`collage collage--${collage.length}`} aria-hidden="true">
            {collage.map((src) => <img key={src} src={src} alt="" />)}
          </div>
        ) : (
          <Photo className="ph--hero" src={null} letter={title.charAt(0)} style={{ width: '100%', height: '100%', display: 'flex' }} />
        )}
        <div className="ez-hero__shade" aria-hidden="true" />
        <h1 className="ez-hero__title">{title}</h1>
      </div>

      <div className="ez-stack">
        <section className="ez-list plate-list" aria-label="Інгредієнти">
          <p className="ez-list__title">Інгредієнти</p>
          {plate.selections.map((s) => {
            if (s.stepKey === 'eggs' && s.label === 'без яєць') return null;
            const { rest, oilMl } = splitOil(s.label);
            const dish = dishBase(rest);
            // «в/с», «с/с» — не склад із кількох продуктів, а позначка консерви / слабкого соління.
            const composite = !dish && /\/|\+\s*[а-яіїєґ]/i.test(rest.replace(/(^|\s)[вс]\/с(?=[\s\d]|$)/g, ' '));
            const d = s.stepKey === 'eggs'
              ? { name: 'Яйця', portion: s.label.replace(/^яйц[яе]\s*/, '') + (s.label === 'яйце 1' ? ' шт' : '') }
              : dish ? { name: `${dish.title}: ${tidy(rest.replace(/\(.*\)/, ''))}`, portion: '' } : display({ label: rest, composite });
            return (
              <div key={s.stepKey} style={{ display: 'contents' }}>
                <div className="ez-irow">
                  <Photo className="ez-irow__thumb" src={selectionPhoto(s)} letter={d.name.charAt(0)} style={{ fontSize: 18 }} />
                  <span className="ez-irow__name" style={{ display: 'flex', flexDirection: 'column' }}>
                    <span className="ez-footnote" style={{ fontWeight: 600 }}>{s.stepTitle}</span>
                    {s.stepKey === 'veg' ? tidy(s.label.replace(/^картинка:\s*\(?/, '').replace(/\)$/, '')) : d.name}
                  </span>
                  <span className="ez-irow__grams">{s.portion ?? d.portion}</span>
                </div>
                {oilMl && (
                  <div className="ez-irow">
                    <span className="ez-irow__thumb ph" aria-hidden="true" style={{ fontSize: 18 }}>Ж</span>
                    <span className="ez-irow__name" style={{ display: 'flex', flexDirection: 'column' }}>
                      <span className="ez-footnote" style={{ fontWeight: 600 }}>Жир · на вибір одне</span>
                      {oilChoices(oilMl).join(' або ')}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
          {notes.map((n) => <p className="ez-list__note" key={n}>{n}</p>)}
        </section>
        {isToday && <Link className="link" href={`/build/${plate.meal}`} style={{ padding: '0 4px' }}>Зібрати інакше ›</Link>}

        <button className="ez-btn ez-btn--soft ez-btn--block" disabled aria-describedby="recipe-soon">
          Підказати, що приготувати
        </button>
        <p id="recipe-soon" className="ez-caption center" style={{ marginTop: -4 }}>Рецепт за правилами Олени — незабаром, лише на ваш запит.</p>

        <Tip hint={{ text: 'Створюйте страви, а не просто набір продуктів: рис + нут + м’ясо — плов, спагеті + фарш + томати — болоньєзе, картопля + квасоля + м’ясо — борщ.', lesson: 'Вступ' }} />
      </div>

      <div className="bottom-bar">
        <div className="bottom-bar__inner gap-3">
          <div className="ez-pair">
            {isToday ? (
              <Link href={`/build/${plate.meal}`} className="ez-btn ez-btn--soft">
                <span style={{ color: 'var(--burgundy)', display: 'flex' }}><Icon name="redo" size={18} /></span>
                Перезібрати
              </Link>
            ) : (
              // Тарілка з минулого дня: історію не редагуємо, але страву можна повторити сьогодні.
              <button className="ez-btn ez-btn--soft" onClick={() => { const p = addPlate({ date: todayISO(), meal: plate.meal, level: plate.level, selections: plate.selections, status: 'eaten', favorite: false }); router.push(`/plate/${p.id}`); }}>
                <span style={{ color: 'var(--burgundy)', display: 'flex' }}><Icon name="redo" size={18} /></span>
                Повторити сьогодні
              </button>
            )}
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
