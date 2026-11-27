'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useProfile } from '@/lib/store';
import { calcLevel, MAX_AGE, MIN_AGE, type Activity, type Sex } from '@/lib/calories';
import { Icon } from '@/components/Icon';

export default function Onboarding() {
  const router = useRouter();
  const { profile, saveProfile } = useProfile();
  const [name, setName] = useState(profile?.name ?? '');
  const [sex, setSex] = useState<Sex>(profile?.sex ?? 'female');
  const [age, setAge] = useState(profile ? String(profile.age) : '');
  const [height, setHeight] = useState(profile ? String(profile.height) : '');
  const [activity, setActivity] = useState<Activity>(profile?.activity ?? 'base');
  const [wake, setWake] = useState(profile?.wake ?? '07:00');
  const [sleep, setSleep] = useState(profile?.sleep ?? '23:00');
  const [tried, setTried] = useState(false);
  const [minInfo, setMinInfo] = useState(false);

  const ageN = Number(age);
  const hN = Number(height);
  const ageErr = !age ? 'Вкажіть вік' : ageN < MIN_AGE ? 'young' : ageN > 120 ? 'Перевірте вік' : '';
  const hErr = !height ? 'Вкажіть зріст' : hN < 120 || hN > 230 ? 'Зріст — у сантиметрах, наприклад 165' : '';

  const submit = () => {
    setTried(true);
    if (ageErr || hErr) return;
    saveProfile({ ...(profile ?? {}), name: name.trim() || undefined, sex, age: ageN, height: hN, activity, wake, sleep, level: calcLevel(sex, hN, activity), createdAt: profile?.createdAt ?? new Date().toISOString() });
    router.push('/result');
  };

  return (
    <main className="app-main fade-in pb-actions">
      <nav className="ez-nav" aria-label="Навігація">
        <a className="ez-nav__back" href={profile ? '/profile' : '/welcome'}><Icon name="back" size={18} /> Назад</a>
      </nav>
      <header className="ez-header">
        <h1 className="ez-large-title">Ваша калорійність</h1>
        <p className="ez-subhead">Кілька питань — і конструктор підбере порції саме під вас.</p>
      </header>

      <div className="ez-stack">
        <div className="ez-field">
          <label className="ez-label" htmlFor="name">Як до вас звертатися?</label>
          <input className="ez-input" id="name" autoComplete="given-name" autoCapitalize="words" maxLength={30} placeholder="Ваше ім'я" value={name} onChange={(e) => setName(e.target.value)} />
        </div>

        <fieldset className="ez-field fieldset-plain">
          <legend className="ez-label legend-gap">Стать</legend>
          <div className="seg">
            <button type="button" className="pill-choice" aria-pressed={sex === 'female'} onClick={() => setSex('female')}>Жінка</button>
            <button type="button" className="pill-choice" aria-pressed={sex === 'male'} onClick={() => setSex('male')}>Чоловік</button>
          </div>
        </fieldset>

        <div className={`ez-field ${tried && ageErr ? 'ez-field--error' : ''}`}>
          <label className="ez-label" htmlFor="age">Вік</label>
          <input className="ez-input" id="age" inputMode="numeric" value={age} onChange={(e) => setAge(e.target.value.replace(/\D/g, ''))} />
          {tried && ageErr === 'young' ? (
            <p className="ez-hint">Конструктор розрахований на 18–50 років. Для підлітків харчування варто підбирати разом зі спеціалістом.</p>
          ) : (
            <p className="ez-hint">{tried && ageErr ? ageErr : `Конструктор розрахований на ${MIN_AGE}–${MAX_AGE} років.`}</p>
          )}
        </div>

        <div className={`ez-field ${tried && hErr ? 'ez-field--error' : ''}`}>
          <label className="ez-label" htmlFor="h">Зріст, см</label>
          <input className="ez-input" id="h" inputMode="numeric" value={height} onChange={(e) => setHeight(e.target.value.replace(/\D/g, ''))} />
          <p className="ez-hint">{tried && hErr ? hErr : 'Вагу не питаємо — калорійність рахується від зросту й активності.'}</p>
        </div>

        <fieldset className="ez-field fieldset-plain">
          <legend className="ez-label legend-gap">Активність</legend>
          <div className="ez-choices">
            <label className="ez-choice">
              <input type="radio" name="act" checked={activity === 'min'} onChange={() => { setActivity('min'); setMinInfo(true); }} />
              <span><span className="ez-choice__title">Мінімальна</span><span className="ez-choice__text">Менше, ніж базова: мало кроків і без тренувань</span></span>
            </label>
            <label className="ez-choice">
              <input type="radio" name="act" checked={activity === 'base'} onChange={() => setActivity('base')} />
              <span><span className="ez-choice__title">Базова</span><span className="ez-choice__text">{sex === 'male' ? '8–9 тис. кроків на день і 2–3 тренування на тиждень' : '≈ 7 000 кроків на день і 1–2 тренування на тиждень'}</span></span>
            </label>
            <label className="ez-choice">
              <input type="radio" name="act" checked={activity === 'mid'} onChange={() => setActivity('mid')} />
              <span><span className="ez-choice__title">Середня</span><span className="ez-choice__text">{sex === 'male' ? 'Більше 9 тис. кроків і тренувань' : '10–12 тис. кроків щодня і 3 тренування з вагою на тиждень'}</span></span>
            </label>
          </div>
        </fieldset>

        <div className="seg">
          <div className="ez-field">
            <label className="ez-label" htmlFor="wake">Прокидаюся о</label>
            <input className="ez-input" id="wake" type="time" value={wake} onChange={(e) => setWake(e.target.value)} />
          </div>
          <div className="ez-field">
            <label className="ez-label" htmlFor="sleep">Лягаю спати о</label>
            <input className="ez-input" id="sleep" type="time" value={sleep} onChange={(e) => setSleep(e.target.value)} />
          </div>
        </div>
        <p className="ez-hint">Час потрібен для нагадувань: сніданок, обід і вечеря у вашому ритмі.</p>
      </div>

      {minInfo && (
        <div className="sheet-backdrop" role="presentation" onClick={() => setMinInfo(false)}>
          <div className="sheet pop-in" role="dialog" aria-modal="true" aria-labelledby="min-title" onClick={(e) => e.stopPropagation()}>
            <h2 id="min-title" className="ez-title m-0">Порції розрахуємо як для базової активності</h2>
            <p className="ez-subhead m-0">Без руху харчування саме по собі працює гірше. Обов’язково перегляньте урок 3.2 «Рух без спортзалу: скільки достатньо» в розділі «Навчання»: у ньому — як поступово дійти до базового рівня.</p>
            <button className="ez-btn ez-btn--primary ez-btn--block" onClick={() => setMinInfo(false)}>Зрозуміло</button>
          </div>
        </div>
      )}

      <div className="bottom-bar">
        <div className="bottom-bar__inner">
          <button className="ez-btn ez-btn--primary ez-btn--block" onClick={submit}>Розрахувати</button>
        </div>
      </div>
    </main>
  );
}
