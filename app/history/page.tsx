'use client';
import { Photo } from '@/components/Photo';
import { PlateThumb } from '@/components/PlateArt';
import { useState } from 'react';
import Link from 'next/link';
import { TabBar } from '@/components/TabBar';
import { Icon } from '@/components/Icon';
import { useRequireProfile } from '@/components/Guard';
import { usePlates, useTracker, useProfile, todayISO } from '@/lib/store';
import { SCALES, fmt, goalsFor, workoutLabel } from '@/lib/tracker';
import { MEALS } from '@/lib/tree';
import { plateTitle } from '@/lib/plate';

const WD = ['Нд', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];

export default function History() {
  const { ready } = useRequireProfile();
  const { plates, addPlate } = usePlates();
  const { data: tracker } = useTracker();
  const { profile } = useProfile();
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
                {p ? <PlateThumb className="ez-hrow__img" size={92} meal={p.meal} selections={p.selections} /> : <Photo className="ez-hrow__img" src={null} letter={<Icon name={m.icon} size={36} variant="fill" />} style={{ fontSize: 26 }} />}
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

          {profile && <DayTracker day={tracker.days[day]} goals={goalsFor(tracker, profile.sex, profile.activity)} isToday={day === todayISO()} />}

          {fav && favMealFree && (
            <section className="ez-repeat">
              <div className="ez-repeat__body">
                <h2 className="ez-headline" style={{ fontSize: 18, lineHeight: '24px' }}>Улюблена страва ще раз?</h2>
                <span className="ez-caption" style={{ color: 'var(--secondary)' }}>{plateTitle(fav.meal, fav.selections)}</span>
                <button className="ez-btn ez-btn--primary ez-btn--sm" style={{ marginTop: 12 }} onClick={() => addPlate({ date: todayISO(), meal: fav.meal, level: fav.level, selections: fav.selections, status: 'eaten', favorite: false })}>
                  Так, повторити
                </button>
              </div>
              <PlateThumb className="ez-repeat__img" size={96} meal={fav.meal} selections={fav.selections} />
            </section>
          )}
        </div>
      </main>
      <TabBar />
    </>
  );
}

/** Трекер обраного дня: вода, кроки, тренування, самопочуття — щоб бачити зв'язок «тарілки → енергія». */
function DayTracker({ day, goals, isToday }: { day?: import('@/lib/tracker').TrackerDay; goals: import('@/lib/tracker').TrackerGoals; isToday: boolean }) {
  const has = !!day && (day.water || day.steps || day.workout || SCALES.some((s) => day[s.key]));
  const tiles: { icon: 'drop' | 'steps' | 'dumbbell'; label: string; value: string; ok: boolean }[] = day ? [
    { icon: 'drop', label: 'Вода', value: `${fmt(day.water ?? 0)} мл`, ok: (day.water ?? 0) >= goals.water },
    { icon: 'steps', label: 'Кроки', value: fmt(day.steps ?? 0), ok: (day.steps ?? 0) >= goals.steps },
    { icon: 'dumbbell', label: 'Тренування', value: day.workout ? workoutLabel(day) || 'було' : '—', ok: !!day.workout },
  ] : [];
  return (
    <section className="ez-list hs-trk" aria-label="Трекер дня">
      <div className="hs-trk__head">
        <p className="ez-list__title">Трекер</p>
        {isToday && <Link className="link" href="/tracker" style={{ fontSize: 14 }}>Відмітити ›</Link>}
      </div>
      {!has ? (
        <p className="ez-list__note" style={{ paddingTop: 0 }}>{isToday ? 'Сьогодні ще нічого не відмічено.' : 'Цього дня нічого не відмічено.'}</p>
      ) : (
        <>
          <div className="hs-trk__tiles">
            {tiles.map((t) => (
              <div key={t.label} className={`hs-tile${t.ok ? ' hs-tile--ok' : ''}`}>
                <span className="hs-tile__icon"><Icon name={t.icon} size={18} variant="fill" /></span>
                <span className="hs-tile__value">{t.value}</span>
                <span className="hs-tile__label">{t.label}</span>
              </div>
            ))}
          </div>
          {SCALES.some((s) => day?.[s.key]) && (
            <div className="hs-trk__feel">
              {SCALES.map((s) => (
                <span key={s.key} className="hs-feel"><Icon name={s.icon} size={16} variant="fill" /> {s.title} <b>{day?.[s.key] ? `${day[s.key]}/5` : '—'}</b></span>
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
}
