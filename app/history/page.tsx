'use client';
import { Photo } from '@/components/Photo';
import { platePhoto } from '@/lib/photos';
import { useState } from 'react';
import Link from 'next/link';
import { TabBar } from '@/components/TabBar';
import { Icon } from '@/components/Icon';
import { useRequireProfile } from '@/components/Guard';
import { usePlates, todayISO } from '@/lib/store';
import { MEALS } from '@/lib/tree';
import { plateTitle } from '@/lib/plate';

const WD = ['Нд', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];

export default function History() {
  const { ready } = useRequireProfile();
  const { plates, addPlate } = usePlates();
  const today = new Date();
  const [day, setDay] = useState(todayISO(today));
  if (!ready) return null;
  const days = Array.from({ length: 5 }).map((_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - 3 + i);
    return d;
  });
  const ofDay = plates.filter((p) => p.date === day);
  const fav = plates.filter((p) => p.favorite).slice(-1)[0];
  const favMealFree = fav && !plates.some((p) => p.date === todayISO() && p.meal === fav.meal);

  return (
    <>
      <main className="app-main fade-in">
        <header className="ez-header" style={{ paddingTop: 20 }}>
          <h1 className="ez-large-title">Історія</h1>
          <p className="ez-subhead">Маленькі кроки — великі результати.</p>
        </header>
        <div className="ez-days" role="list">
          {days.map((d) => {
            const iso = todayISO(d);
            return (
              <button key={iso} className="ez-day" aria-current={iso === day ? 'date' : undefined} onClick={() => setDay(iso)}>
                <span className="ez-day__wd">{WD[d.getDay()]}</span>
                <span className="ez-day__num">{d.getDate()}</span>
              </button>
            );
          })}
        </div>
        <div className="ez-stack" style={{ paddingTop: 0 }}>
          {MEALS.map((m) => {
            const p = ofDay.filter((x) => x.meal === m.key).slice(-1)[0];
            const isToday = day === todayISO();
            const inner = (
              <>
                <Photo className="ez-hrow__img" src={p ? platePhoto(p.meal, p.selections) : null} letter={p ? plateTitle(p.meal, p.selections).charAt(0) : <Icon name={m.icon} size={26} />} style={{ fontSize: 26 }} />
                <span className="ez-hrow__body">
                  <span className="ez-headline" style={{ fontSize: 16 }}>{m.title}</span>
                  <span className="ez-caption" style={{ color: 'var(--secondary)' }}>{p ? plateTitle(p.meal, p.selections) : isToday ? 'Зібрати тарілку' : day < todayISO() ? 'Не за конструктором' : '—'}</span>
                </span>
                {!p && isToday && <span className="ez-chip ez-chip--add"><Icon name="plus" size={14} /> Зібрати</span>}
                {(p || isToday) && <span className="ez-meal__chev"><Icon name="chev" size={18} /></span>}
              </>
            );
            // Історія — лише перегляд: зібрати можна тільки сьогоднішній прийом їжі.
            return p || isToday
              ? <Link key={m.key} href={p ? `/plate/${p.id}` : `/build/${m.key}`} className="ez-hrow" style={{ paddingLeft: 0 }}>{inner}</Link>
              : <div key={m.key} className="ez-hrow ez-hrow--empty" style={{ paddingLeft: 0 }}>{inner}</div>;
          })}

          {fav && favMealFree && (
            <section className="ez-repeat">
              <div className="ez-repeat__body">
                <h2 className="ez-headline" style={{ fontSize: 18, lineHeight: '24px' }}>Улюблена страва ще раз?</h2>
                <span className="ez-caption" style={{ color: 'var(--secondary)' }}>{plateTitle(fav.meal, fav.selections)}</span>
                <button className="ez-btn ez-btn--primary ez-btn--sm" style={{ marginTop: 12 }} onClick={() => addPlate({ date: todayISO(), meal: fav.meal, level: fav.level, selections: fav.selections, status: 'eaten', favorite: false })}>
                  Так, повторити
                </button>
              </div>
              <Photo className="ez-repeat__img" src={platePhoto(fav.meal, fav.selections)} letter={plateTitle(fav.meal, fav.selections).charAt(0)} />
            </section>
          )}
        </div>
      </main>
      <TabBar />
    </>
  );
}
