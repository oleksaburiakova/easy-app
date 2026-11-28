'use client';
import { AwardWatcher } from '@/components/Awards';
import { Photo } from '@/components/Photo';
import { GREENS_PHOTO, OIL_PHOTO, selectionPhoto } from '@/lib/photos';
import { recipeFor, recipePortion } from '@/lib/recipes';
import { PlateBento } from '@/components/PlateArt';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Icon } from '@/components/Icon';
import { useRequireProfile } from '@/components/Guard';
import { usePlates, todayISO } from '@/lib/store';
import { cookedHint, dishBase, display, mealTitle, oilChoices, splitOil, tidy } from '@/lib/tree';
import { LEVEL_LABEL } from '@/lib/calories';
import { plateTitle, sweetPaused, withoutSweet } from '@/lib/plate';

export default function PlatePage() {
  const { id } = useParams<{ id: string }>();
  const { ready } = useRequireProfile();
  const { plates, addPlate, updatePlate, ready: plReady } = usePlates();
  const router = useRouter();
  const [toast, setToast] = useState('');
  // Відкрили з історії (?from=history) — повертаємось в історію, а не на головну. Читаємо після монтування, як і дані з localStorage.
  const [fromHistory, setFromHistory] = useState(false);
  useEffect(() => { setFromHistory(new URLSearchParams(window.location.search).get('from') === 'history'); }, []);
  const back = fromHistory ? { href: '/history', nav: 'Історія', btn: 'До історії' } : { href: '/', nav: 'Головна', btn: 'На головну' };
  if (!ready || !plReady) return null;
  const plate = plates.find((p) => p.id === id);
  if (!plate) return <main className="app-main empty">Тарілку не знайдено. <Link className="link" href="/">На головну</Link></main>;

  const title = plateTitle(plate.meal, plate.selections);
  const notes: string[] = [];
  const isToday = plate.date === todayISO();
  for (const s of plate.selections) {
    const c = cookedHint({ label: s.label, ...parseAmount(s.label) });
    if (c) notes.push(`${display({ label: s.label }).name} — суха вага, після варіння ${c.replace(/ (готов\S+)$/, '')}.`);
  }
  if (plate.meal !== 'breakfast' && plate.selections.some((x) => x.stepKey === 'protein')) notes.push("М'ясо й рибу важимо в сирому вигляді.");
  // Зелень — окремим рядком інгредієнтів (10 г до кожного прийому їжі): після овочів, а без них — у кінці.
  // Сніданок-галета й панкейки — готові страви за рецептом, зелень окремим рядком не додаємо (Олександра, 27.11 і 28.11).
  // Лише основа сніданку: «панкейк 1 шт» на десерті зелень не прибирає.
  const hasVeg = plate.selections.some((x) => x.stepKey === 'veg');
  const noGreens = plate.selections.some((x) => x.stepKey === 'base' && /^\s*(галета|панкейки)/i.test(x.label));
  const greens = noGreens ? null : (
    <div className="ez-irow" key="greens">
      <Photo className="ez-irow__thumb plate-thumb" src={GREENS_PHOTO} letter="З" />
      <span className="ez-irow__name">Зелень</span>
      <span className="ez-irow__grams">10 г</span>
    </div>
  );

  // Сніданок-страва (млинці, панкейки, галета) — рецепт Олени після інгредієнтів (27.11).
  const baseSel = plate.selections.find((x) => x.stepKey === 'base');
  const recipe = baseSel ? recipeFor(baseSel.label) : null;
  const portion = baseSel ? recipePortion(baseSel.label) : null;

  const flash = (t: string) => { setToast(t); setTimeout(() => setToast(''), 1800); };

  return (
    <main className="app-main fade-in pb-plate">
      <nav className="ez-nav" aria-label="Навігація">
        <Link className="ez-nav__back" href={back.href}><Icon name="back" size={18} /> {back.nav}</Link>
        <span className="ez-caption">{mealTitle(plate.meal)} · {LEVEL_LABEL[plate.level]}</span>
      </nav>
      {/* Банер-ланч-бокс: овочі, білок і гарнір, добавки колонкою праворуч (рішення 25.11). */}
      <div className="plate-hero plate-hero--bento">
        <PlateBento meal={plate.meal} selections={plate.selections} size={230} wide />
        <h1 className="plate-hero__title">{title}</h1>
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
              <div key={s.stepKey} className="contents">
                <div className="ez-irow">
                  <Photo className="ez-irow__thumb plate-thumb" src={selectionPhoto(s)} letter={d.name.charAt(0)} />
                  <span className="ez-irow__name stack-col">
                    <span className="ez-footnote fw-600">{s.stepTitle}</span>
                    {s.stepKey === 'veg' ? tidy(s.label.replace(/^картинка:\s*\(?/, '').replace(/\)$/, '')) : d.name}
                  </span>
                  <span className="ez-irow__grams">{s.portion ?? d.portion}</span>
                </div>
                {oilMl && (
                  <div className="ez-irow">
                    <Photo className="ez-irow__thumb plate-thumb" src={OIL_PHOTO} letter="Ж" />
                    <span className="ez-irow__name stack-col">
                      <span className="ez-footnote fw-600">Жир · на вибір одне</span>
                      {oilChoices(oilMl).join(' або ')}
                    </span>
                  </div>
                )}
                {s.stepKey === 'veg' && greens}
              </div>
            );
          })}
          {!hasVeg && greens}
          {notes.map((n) => <p className="ez-list__note" key={n}>{n}</p>)}
        </section>
        {recipe && (
          <section className="ez-list recipe" aria-label={`Рецепт: ${recipe.title}`}>
            <p className="ez-list__title">Рецепт · {recipe.title}</p>
            {portion && <p className="recipe__portion">{portion.note}</p>}
            <p className="recipe__head">Інгредієнти</p>
            <ul className="recipe-list">{recipe.ingredients.map((x) => <li key={x}>{x}</li>)}</ul>
            <p className="recipe__head">Спосіб приготування</p>
            <ol className="recipe-steps">{recipe.steps.map((x) => <li key={x}>{x}</li>)}</ol>
            {recipe.note && <p className="ez-list__note">{recipe.note}</p>}
          </section>
        )}
      </div>

      <div className="bottom-bar">
        <div className="bottom-bar__inner gap-3">
          {/* Сьогоднішню тарілку можна перезібрати й тоді, коли вона в улюблених (рішення Олександри 25.11). */}
          <div className="ez-pair">
            {isToday ? (
              <Link href={`/build/${plate.meal}`} className="ez-btn ez-btn--soft">
                <span className="btn-icon"><Icon name="redo" size={18} /></span>
                Перезібрати
              </Link>
            ) : (
              // Тарілка з минулого дня: історію не редагуємо, але страву можна повторити сьогодні.
              <button className="ez-btn ez-btn--soft" onClick={() => { const p = addPlate({ date: todayISO(), meal: plate.meal, level: plate.level, selections: withoutSweet(plate.selections, sweetPaused(plates, plate.meal)), status: 'eaten', favorite: false }); router.push(`/plate/${p.id}`); }}>
                <span className="btn-icon"><Icon name="redo" size={18} /></span>
                Повторити сьогодні
              </button>
            )}
            <button className="ez-btn ez-btn--soft" aria-pressed={plate.favorite} onClick={() => { updatePlate(plate.id, { favorite: !plate.favorite }); flash(plate.favorite ? 'Прибрано з улюблених' : 'Додано в улюблені'); }}>
              <span className="btn-icon"><Icon name="heart" size={18} filled={plate.favorite} /></span>
              {plate.favorite ? 'В улюблених' : 'В улюблені'}
            </button>
          </div>
          <Link href={back.href} className="ez-btn ez-btn--primary ez-btn--block">{back.btn}</Link>
        </div>
      </div>
      {toast && <div className="toast" role="status">{toast}</div>}
      <AwardWatcher />
    </main>
  );
}

function parseAmount(label: string) {
  const m = label.match(/(\d+(?:[.,]\d+)?)\s*г/);
  return m ? { amount: Number(m[1].replace(',', '.')), unit: 'g' } : {};
}
