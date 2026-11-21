'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { TabBar } from '@/components/TabBar';
import { Icon, type IconName } from '@/components/Icon';
import { Tip } from '@/components/Tip';
import { Sheet } from '@/components/Sheet';
import { useRequireProfile } from '@/components/Guard';
import { useTracker, todayISO } from '@/lib/store';
import {
  CHALLENGE_DAYS, CHALLENGE_STEPS, GLASS_ML, SCALES, WEEKDAYS,
  challengeProgress, dayComplete, dayProgress, fmt, fromIso, goalsFor, recalcHint, recommendedGoals, stepRange, weekCount, weekOf,
  type TrackerGoals,
} from '@/lib/tracker';

type Sheet = null | 'water' | 'steps' | 'goals';

export default function Tracker() {
  const { profile, ready } = useRequireProfile();
  const { data, ready: tReady, updateDay, setGoals, startChallenge } = useTracker();
  const today = todayISO();
  const [day, setDay] = useState(today);
  const [sheet, setSheet] = useState<Sheet>(null);

  // «Мінімальна» активність: 30-денна ціль стартує з першого відкриття трекера.
  useEffect(() => {
    if (tReady && profile?.activity === 'min') startChallenge(today);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tReady, profile?.activity]);

  if (!ready || !profile || !tReady) return null;

  const g = goalsFor(data, profile.sex, profile.activity);
  const week = weekOf(today);
  const d = data.days[day] ?? {};
  const isToday = day === today;
  const workoutsWeek = weekCount(data, weekOf(day), today, (x) => !!x.workout);
  const waterDays = weekCount(data, week, today, (x) => (x.water ?? 0) >= g.water);
  const stepDays = weekCount(data, week, today, (x) => (x.steps ?? 0) >= g.steps);
  const hint = recalcHint(data, profile.sex, profile.activity, today);
  const ch = profile.activity === 'min' ? challengeProgress(data, today) : null;
  const dateLabel = fromIso(day).toLocaleDateString('uk-UA', { day: 'numeric', month: 'long' });

  return (
    <>
      <main className="app-main fade-in">
        <header className="ez-header trk-head" style={{ paddingTop: 20 }}>
          <div>
            <h1 className="ez-large-title">Трекер</h1>
            <p className="ez-subhead">{isToday ? `Сьогодні, ${dateLabel}` : dateLabel}</p>
          </div>
          <button className="trk-round" onClick={() => setSheet('goals')} aria-label="Мої цілі"><Icon name="sliders" size={20} /></button>
        </header>

        {ch && (
          <section className="trk-goal" aria-label="Головна ціль">
            <span className="trk-goal__label">Головна ціль</span>
            <p className="trk-goal__title">Більше руху: {CHALLENGE_DAYS} днів щонайменше {fmt(CHALLENGE_STEPS)} кроків</p>
            <div className="trk-goal__bar" aria-hidden="true"><span style={{ width: `${(ch.done / CHALLENGE_DAYS) * 100}%` }} /></div>
            <p className="trk-goal__meta">{ch.finished ? `Готово: ${ch.done} з ${CHALLENGE_DAYS} днів` : `День ${ch.dayN} з ${CHALLENGE_DAYS} · виконано ${ch.done}`}</p>
            <p className="trk-goal__text">Порції розраховані як для базової активності. Щоб вони працювали, поступово додавайте рух.</p>
          </section>
        )}

        {hint && (
          <div className="ez-pad" style={{ paddingTop: 0 }}>
            <aside className="ez-notice" role="note">
              <p className="ez-notice__title">{hint.kind === 'down' ? 'Руху стало менше' : hint.kind === 'reached-base' ? 'Ви дійшли до базової активності' : 'Активність стабільно зросла'}</p>
              <p>
                {hint.kind === 'up' && `Уже 3 тижні в середньому ${fmt(hint.avg)} кроків і 3+ тренування на тиждень. Можна перерахувати калорійність.`}
                {hint.kind === 'reached-base' && `Уже 3 тижні в середньому ${fmt(hint.avg)} кроків — це базовий рівень. Оновіть активність в анкеті.`}
                {hint.kind === 'down' && `Останні 3 тижні в середньому ${fmt(hint.avg)} кроків. Спробуйте повернути рух — або перерахуйте калорійність.`}
              </p>
              <Link className="ez-btn ez-btn--primary ez-btn--sm" href="/onboarding" style={{ marginTop: 8, alignSelf: 'flex-start' }}>Перерахувати калорійність</Link>
            </aside>
          </div>
        )}

        <ol className="trk-week" aria-label="Тиждень">
          {week.map((w, i) => {
            const p = dayProgress(data.days[w], g);
            const done = dayComplete(data.days[w], g);
            const future = w > today;
            const R = 17, C = 2 * Math.PI * R;
            return (
              <li key={w}>
                <button className={`trk-day${w === day ? ' trk-day--on' : ''}`} disabled={future} onClick={() => setDay(w)} aria-current={w === today ? 'date' : undefined} aria-label={`${WEEKDAYS[i]} ${fromIso(w).getDate()}${done ? ', цілі виконано' : ''}`}>
                  <span className="trk-day__wd">{WEEKDAYS[i]}</span>
                  <span className="trk-day__ring">
                    <svg width="42" height="42" viewBox="0 0 42 42" aria-hidden="true">
                      <circle className="trk-ring__track" cx="21" cy="21" r={R} />
                      {p > 0 && <circle className="trk-ring__value" cx="21" cy="21" r={R} strokeDasharray={`${C * p} ${C}`} transform="rotate(-90 21 21)" />}
                    </svg>
                    <span className="trk-day__num">{fromIso(w).getDate()}</span>
                    {done && <span className="trk-day__star" aria-hidden="true" />}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>

        <div className="ez-stack" style={{ paddingTop: 4 }}>
          <Habit
            icon="drop" title="Вода" value={`${fmt(d.water ?? 0)} / ${fmt(g.water)} мл`} progress={(d.water ?? 0) / g.water}
            note={`${waterDays} з 7 днів цього тижня`} onOpen={() => setSheet('water')}
            action={{ label: `Додати склянку ${GLASS_ML} мл`, icon: 'plus', onClick: () => updateDay(day, { water: (d.water ?? 0) + GLASS_ML }) }}
          />
          <Habit
            icon="steps" title="Кроки" value={`${fmt(d.steps ?? 0)} / ${fmt(g.steps)}`} progress={(d.steps ?? 0) / g.steps}
            note={`${stepDays} з 7 днів цього тижня`} onOpen={() => setSheet('steps')}
            action={{ label: 'Вписати кроки', icon: 'plus', onClick: () => setSheet('steps') }}
          />
          <Habit
            icon="dumbbell" title="Тренування" value={`${workoutsWeek} з ${g.workouts} цього тижня`} progress={workoutsWeek / g.workouts}
            note={d.workout ? (isToday ? 'Сьогодні було' : 'Цього дня було') : isToday ? 'Сьогодні ще ні' : 'Цього дня не було'}
            onOpen={() => updateDay(day, { workout: !d.workout })}
            action={{ label: d.workout ? 'Тренування було — скасувати' : 'Відмітити тренування', icon: 'check', pressed: !!d.workout, onClick: () => updateDay(day, { workout: !d.workout }) }}
          />

          <section className="ez-list trk-feel" aria-label="Самопочуття">
            <p className="ez-list__title">{isToday ? 'Як ви сьогодні?' : 'Як ви були цього дня?'}</p>
            {SCALES.map((s) => (
              <div className="trk-scale" key={s.key} role="radiogroup" aria-label={s.title}>
                <span className="trk-scale__head"><span className="trk-scale__icon"><Icon name={s.icon} size={27} variant="fill" /></span><span className="trk-scale__title">{s.title}</span></span>
                <div className="trk-scale__row">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button key={n} role="radio" aria-checked={d[s.key] === n} className="trk-pill" onClick={() => updateDay(day, { [s.key]: d[s.key] === n ? undefined : n })}>{n}</button>
                  ))}
                </div>
                <div className="trk-scale__ends"><span>{s.low}</span><span>{s.high}</span></div>
              </div>
            ))}
          </section>

          <Tip hint={{ text: 'Не урізайте їжу — додайте рух. Кроки й 1–2 тренування на тиждень уже працюють.', lesson: 'Урок 3.2 · Активність' }} />
        </div>
      </main>
      <TabBar />

      {sheet === 'water' && (
        <Sheet title="Вода" onClose={() => setSheet(null)}>
          <p className="trk-sheet__big">{fmt(d.water ?? 0)} <small>/ {fmt(g.water)} мл</small></p>
          <div className="trk-quick">
            {[GLASS_ML, 500].map((ml) => <button key={ml} className="ez-btn ez-btn--soft" onClick={() => updateDay(day, { water: (d.water ?? 0) + ml })}>+{ml} мл</button>)}
            <button className="ez-btn ez-btn--back" onClick={() => updateDay(day, { water: Math.max(0, (d.water ?? 0) - GLASS_ML) })} aria-label={`Мінус ${GLASS_ML} мл`}><Icon name="minus" size={18} /> {GLASS_ML}</button>
          </div>
          <button className="ez-btn ez-btn--primary ez-btn--block" onClick={() => setSheet(null)}>Готово</button>
        </Sheet>
      )}

      {sheet === 'steps' && <StepsSheet range={stepRange(profile.sex)} value={d.steps ?? 0} goal={g.steps} onSave={(v) => { updateDay(day, { steps: v }); setSheet(null); }} onClose={() => setSheet(null)} />}

      {sheet === 'goals' && (
        <GoalsSheet
          goals={g} rec={recommendedGoals(profile.sex, profile.activity)} range={stepRange(profile.sex)}
          onSave={(x) => { setGoals(x); setSheet(null); }} onReset={() => { setGoals(undefined); setSheet(null); }} onClose={() => setSheet(null)}
        />
      )}
    </>
  );
}

function Habit({ icon, title, value, progress, note, onOpen, action }: {
  icon: IconName; title: string; value: string; progress: number; note: string; onOpen: () => void;
  action: { label: string; icon: IconName; onClick: () => void; pressed?: boolean };
}) {
  const p = Math.min(1, Math.max(0, progress));
  const done = p >= 1;
  return (
    <div className={`trk-card${done ? ' trk-card--done' : ''}`}>
      <span className="trk-card__fill" style={{ width: `${p * 100}%` }} aria-hidden="true" />
      <button className="trk-card__main" onClick={onOpen}>
        <span className="trk-card__icon"><Icon name={icon} size={24} variant="fill" /></span>
        <span className="trk-card__text">
          <span className="trk-card__title">{title}</span>
          <span className="trk-card__value">{value}</span>
          <span className="trk-card__note">{note}</span>
        </span>
      </button>
      <button className="trk-card__action" onClick={action.onClick} aria-label={action.label} aria-pressed={action.pressed}>
        <Icon name={done && action.icon !== 'check' ? 'check' : action.icon} size={18} strokeWidth={2.4} />
      </button>
    </div>
  );
}

function StepsSheet({ range, value, goal, onSave, onClose }: { range: readonly [number, number]; value: number; goal: number; onSave: (v: number) => void; onClose: () => void }) {
  const [v, setV] = useState(value ? String(value) : '');
  const n = Number(v) || 0;
  return (
    <Sheet title="Кроки" onClose={onClose}>
      <p className="ez-subhead" style={{ margin: 0 }}>Подивіться кількість у застосунку «Здоров'я» на iPhone або Google Fit — і впишіть сюди.</p>
      <p className="trk-sheet__rec">Ваша мета — <b>{fmt(goal)}</b> · рекомендовано {fmt(range[0])}–{fmt(range[1])} кроків на день</p>
      <input className="ez-input" inputMode="numeric" autoFocus placeholder="Напр. 7500" value={v} onChange={(e) => setV(e.target.value.replace(/\D/g, '').slice(0, 6))} aria-label="Кількість кроків" />
      <div className="trk-quick">
        {[500, 1000, 2000].map((x) => <button key={x} className="ez-btn ez-btn--soft" onClick={() => setV(String(n + x))}>+{fmt(x)}</button>)}
      </div>
      <button className="ez-btn ez-btn--primary ez-btn--block" onClick={() => onSave(n)}>Зберегти</button>
    </Sheet>
  );
}

function GoalsSheet({ goals, rec, range, onSave, onReset, onClose }: { goals: TrackerGoals; rec: TrackerGoals; range: readonly [number, number]; onSave: (g: TrackerGoals) => void; onReset: () => void; onClose: () => void }) {
  const [w, setW] = useState(String(goals.water));
  const [s, setS] = useState(String(goals.steps));
  const [t, setT] = useState(String(goals.workouts));
  const num = (x: string, min: number, fb: number) => Math.max(min, Number(x) || fb);
  return (
    <Sheet title="Мої цілі" onClose={onClose}>
      <p className="ez-subhead" style={{ margin: 0 }}>За замовчуванням — з вашої анкети. Можна змінити.</p>
      <label className="ez-field"><span className="ez-label">Вода на день, мл</span><input className="ez-input" inputMode="numeric" value={w} onChange={(e) => setW(e.target.value.replace(/\D/g, '').slice(0, 4))} /></label>
      <label className="ez-field"><span className="ez-label">Кроки на день</span><input className="ez-input" inputMode="numeric" value={s} onChange={(e) => setS(e.target.value.replace(/\D/g, '').slice(0, 5))} /></label>
      <label className="ez-field"><span className="ez-label">Тренування на тиждень</span><input className="ez-input" inputMode="numeric" value={t} onChange={(e) => setT(e.target.value.replace(/\D/g, '').slice(0, 1))} /></label>
      <p className="ez-hint">Рекомендовано: {fmt(rec.water)} мл води · {fmt(range[0])}–{fmt(range[1])} кроків на день · {rec.workouts} тренування на тиждень.</p>
      <div className="ez-pair">
        <button className="ez-btn ez-btn--back" onClick={onReset}>Як в анкеті</button>
        <button className="ez-btn ez-btn--primary" onClick={() => onSave({ water: num(w, 250, rec.water), steps: num(s, 1000, rec.steps), workouts: num(t, 1, rec.workouts) })}>Зберегти</button>
      </div>
    </Sheet>
  );
}
