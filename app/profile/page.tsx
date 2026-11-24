'use client';
import { useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { TabBar } from '@/components/TabBar';
import { Icon, type IconName } from '@/components/Icon';
import { Disclaimer } from '@/components/Tip';
import { Sheet } from '@/components/Sheet';
import { InstallSheet, useInstalled } from '@/components/Install';
import { useRequireProfile } from '@/components/Guard';
import { usePlates, useProfile, useTracker, todayISO } from '@/lib/store';
import { ACTIVITY_LABEL, LEVEL_LABEL } from '@/lib/calories';
import { addDays, fmt, goalsFor, recalcHint, stepRange } from '@/lib/tracker';

/**
 * Профіль — «мій кабінет» (план у docs/ACTIVITY.md): шапка з маскотом, мій план (активність + факт тижня з трекера,
 * режим дня, перерахунок калорійності), допомога (як встановити застосунок), особисті дані, про Easy.
 * Після акаунтів додаються: досягнення, нагадування, підписка, email, «Вийти».
 */
export default function Profile() {
  const { profile, ready } = useRequireProfile();
  const { saveProfile } = useProfile();
  const { plates, clearAll } = usePlates();
  const { data: tracker } = useTracker();
  const router = useRouter();
  const [sheet, setSheet] = useState<null | 'schedule' | 'install' | 'photo' | 'name'>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [photoErr, setPhotoErr] = useState('');
  const installed = useInstalled();
  if (!ready || !profile) return null;

  const today = todayISO();
  const days = daysWithEasy(profile.createdAt, plates.map((p) => p.date), today);
  const g = goalsFor(tracker, profile.sex, profile.activity);
  const week = Array.from({ length: 7 }, (_, i) => tracker.days[addDays(today, -i)]).filter((d) => (d?.steps ?? 0) > 0);
  const avgSteps = week.length ? Math.round(week.reduce((s, d) => s + (d!.steps ?? 0), 0) / week.length) : 0;
  const workouts = Array.from({ length: 7 }, (_, i) => tracker.days[addDays(today, -i)]).filter((d) => d?.workout).length;
  const [lo] = stepRange(profile.sex);
  const hint = recalcHint(tracker, profile.sex, profile.activity, today);

  return (
    <>
      <main className="app-main fade-in">
        <header className="ez-header" style={{ paddingTop: 20 }}>
          <h1 className="ez-large-title">Профіль</h1>
        </header>

        <div className="ez-stack" style={{ paddingTop: 0 }}>
          <section className="pf-hero" aria-label="Мій профіль">
            <button className={`pf-hero__avatar${profile.photo ? ' pf-hero__avatar--photo' : ''}`} onClick={() => setSheet('photo')} aria-label="Змінити фото профілю">
              <img src={profile.photo ?? '/mascot/easy-bot-avatar.webp'} alt="" width={76} height={76} />
              <span className="pf-hero__edit" aria-hidden="true"><Icon name="plus" size={14} strokeWidth={3} /></span>
            </button>
            <span className="pf-hero__body">
              {profile.name ? <span className="pf-hero__name">{profile.name}</span> : <span className="pf-hero__label">Мій план</span>}
              <span className={profile.name ? 'pf-hero__kcal pf-hero__kcal--sm' : 'pf-hero__kcal'}>{LEVEL_LABEL[profile.level]}</span>
              <span className="pf-hero__meta">{days > 0 ? `З Easy вже ${days} ${plural(days, 'день', 'дні', 'днів')}` : 'Вітаємо в Easy!'}</span>
            </span>
          </section>

          {hint && (
            <aside className="ez-notice" role="note">
              <p className="ez-notice__title">{hint.kind === 'down' ? 'Руху стало менше' : hint.kind === 'reached-base' ? 'Ви дійшли до базової активності' : 'Активність стабільно зросла'}</p>
              <p>Можна перерахувати калорійність — за правилом Олени, коли активність змінилась стабільно 3–4 тижні.</p>
            </aside>
          )}

          <section className="ez-list" aria-label="Мій план">
            <p className="ez-list__title">Мій план</p>
            <Row icon="pulse" title="Активність" value={ACTIVITY_LABEL[profile.activity] ?? 'Базова'} />
            <Row
              icon="steps" title="Цього тижня" href="/tracker"
              value={avgSteps ? `≈ ${fmt(avgSteps)} · ${workouts} трен.` : 'у трекері'}
              good={avgSteps >= lo}
            />
            <Row icon="clock" title="Режим дня" value={`${profile.wake} – ${profile.sleep}`} onClick={() => setSheet('schedule')} />
            <Row icon="sliders" title="Цілі трекера" value={`${fmt(g.steps)} · ${fmt(g.water)} мл`} href="/tracker" />
            <Link href="/onboarding" className="ez-btn ez-btn--primary ez-btn--block" style={{ margin: '12px 0 4px' }}>Перерахувати калорійність</Link>
            <p className="ez-list__note">Змінюйте калорійність, лише якщо активність стабільно змінилась 3–4 тижні.</p>
          </section>

          <section className="ez-list" aria-label="Допомога">
            <p className="ez-list__title">Допомога</p>
            <Row icon="home" title="Встановити Easy" value={installed ? 'Встановлено' : 'Як додати'} good={installed} onClick={() => setSheet('install')} />
            <Row icon="cap" title="Уроки й гайди Олени" href="/learn" />
          </section>

          <details className="ez-list pf-details">
            <summary className="ez-list__title">Особисті дані <span className="pf-details__chev"><Icon name="chev" size={18} /></span></summary>
            <Row title="Ім'я" value={profile.name || 'Додати'} onClick={() => setSheet('name')} />
            <Row title="Стать" value={profile.sex === 'female' ? 'Жінка' : 'Чоловік'} />
            <Row title="Вік" value={`${profile.age}`} />
            <Row title="Зріст" value={`${profile.height} см`} />
            <p className="ez-list__note">Вагу не питаємо — калорійність рахується від зросту й активності.</p>
          </details>

          <Disclaimer />
          <button className="ez-btn ez-btn--back ez-btn--block" onClick={() => { if (confirmReset()) { clearAll(); router.replace('/welcome'); } }}>Очистити дані на цьому пристрої</button>
          <p className="ez-caption center">Easy · версія для тестування · дані зберігаються лише в цьому браузері</p>
        </div>
      </main>
      <TabBar />

      {sheet === 'schedule' && (
        <ScheduleSheet wake={profile.wake} sleep={profile.sleep} onClose={() => setSheet(null)} onSave={(wake, sleep) => { saveProfile({ ...profile, wake, sleep }); setSheet(null); }} />
      )}
      <input ref={fileRef} type="file" accept="image/*" hidden onChange={async (e) => {
        const f = e.target.files?.[0];
        e.target.value = '';
        if (!f) return;
        try { saveProfile({ ...profile, photo: await squarePhoto(f) }); setPhotoErr(''); setSheet(null); }
        catch { setPhotoErr('Не вдалося відкрити це фото. Спробуйте інше.'); }
      }} />
      {sheet === 'photo' && (
        <Sheet title="Фото профілю" onClose={() => setSheet(null)}>
          <p className="ez-subhead" style={{ margin: 0 }}>Фото зберігається лише на цьому пристрої.</p>
          {photoErr && <p className="ez-hint" style={{ color: 'var(--error)', margin: 0 }}>{photoErr}</p>}
          <button className="ez-btn ez-btn--primary ez-btn--block" onClick={() => fileRef.current?.click()}>{profile.photo ? 'Обрати інше фото' : 'Обрати своє фото'}</button>
          {profile.photo && <button className="ez-btn ez-btn--back ez-btn--block" onClick={() => { saveProfile({ ...profile, photo: undefined }); setSheet(null); }}>Повернути маскота</button>}
        </Sheet>
      )}
      {sheet === 'name' && <NameSheet name={profile.name ?? ''} onClose={() => setSheet(null)} onSave={(n) => { saveProfile({ ...profile, name: n || undefined }); setSheet(null); }} />}
      {sheet === 'install' && <InstallSheet onClose={() => setSheet(null)} />}
    </>
  );
}

function Row({ icon, title, value, href, onClick, good }: { icon?: IconName; title: string; value?: string; href?: string; onClick?: () => void; good?: boolean }) {
  const inner = (
    <>
      {icon && <span className="pf-row__icon"><Icon name={icon} size={20} variant="fill" /></span>}
      <span className="ez-irow__name">{title}</span>
      {value && <span className={`pf-row__value${good ? ' pf-row__value--good' : ''}`}>{good && <Icon name="check" size={14} strokeWidth={3} />}{value}</span>}
      {(href || onClick) && <span className="ez-irow__chev"><Icon name="chev" size={18} /></span>}
    </>
  );
  if (href) return <Link href={href} className="ez-irow pf-row">{inner}</Link>;
  if (onClick) return <button className="ez-irow pf-row pf-row--btn" onClick={onClick}>{inner}</button>;
  return <div className="ez-irow pf-row">{inner}</div>;
}

function ScheduleSheet({ wake, sleep, onSave, onClose }: { wake: string; sleep: string; onSave: (w: string, s: string) => void; onClose: () => void }) {
  const [w, setW] = useState(wake);
  const [s, setS] = useState(sleep);
  return (
    <Sheet title="Режим дня" onClose={onClose}>
      <p className="ez-subhead" style={{ margin: 0 }}>Від нього залежать нагадування: сніданок — через 1–1,5 години після підйому, вечеря — за 2–3 години до сну.</p>
      <div className="seg">
        <label className="ez-field"><span className="ez-label">Прокидаюся о</span><input className="ez-input" type="time" value={w} onChange={(e) => setW(e.target.value)} /></label>
        <label className="ez-field"><span className="ez-label">Лягаю спати о</span><input className="ez-input" type="time" value={s} onChange={(e) => setS(e.target.value)} /></label>
      </div>
      <button className="ez-btn ez-btn--primary ez-btn--block" onClick={() => onSave(w || wake, s || sleep)}>Зберегти</button>
    </Sheet>
  );
}

function NameSheet({ name, onSave, onClose }: { name: string; onSave: (n: string) => void; onClose: () => void }) {
  const [v, setV] = useState(name);
  return (
    <Sheet title="Як до вас звертатися?" onClose={onClose}>
      <input className="ez-input" autoFocus autoComplete="given-name" autoCapitalize="words" maxLength={30} placeholder="Ваше ім'я" value={v} onChange={(e) => setV(e.target.value)} aria-label="Ім'я" />
      <button className="ez-btn ez-btn--primary ez-btn--block" onClick={() => onSave(v.trim())}>Зберегти</button>
    </Sheet>
  );
}

/** Своє фото: обрізаємо до квадрата по центру й стискаємо до 256×256 JPEG (≈ 15–30 КБ) — щоб влізло в пам'ять браузера. */
function squarePhoto(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const side = Math.min(img.naturalWidth, img.naturalHeight);
      const c = document.createElement('canvas');
      c.width = c.height = 256;
      const ctx = c.getContext('2d');
      if (!ctx || !side) { URL.revokeObjectURL(url); return reject(new Error('no image')); }
      ctx.drawImage(img, (img.naturalWidth - side) / 2, (img.naturalHeight - side) / 2, side, side, 0, 0, 256, 256);
      URL.revokeObjectURL(url);
      resolve(c.toDataURL('image/jpeg', 0.85));
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('bad image')); };
    img.src = url;
  });
}

/** Скільки днів людина з Easy: від анкети (або першої тарілки, якщо дати анкети немає). */
function daysWithEasy(createdAt: string, plateDates: string[], today: string) {
  const first = createdAt ? createdAt.slice(0, 10) : [...plateDates].sort()[0];
  if (!first) return 0;
  const ms = new Date(today).getTime() - new Date(first).getTime();
  return Math.max(1, Math.floor(ms / 864e5) + 1);
}

function plural(n: number, one: string, few: string, many: string) {
  const a = n % 10, b = n % 100;
  if (a === 1 && b !== 11) return one;
  if (a >= 2 && a <= 4 && (b < 12 || b > 14)) return few;
  return many;
}

function confirmReset() {
  return typeof window !== 'undefined' && window.confirm('Видалити анкету, історію й трекер з цього пристрою?');
}
