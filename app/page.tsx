'use client';
import { Photo } from '@/components/Photo';
import { platePhoto } from '@/lib/photos';
import Link from 'next/link';
import { TabBar } from '@/components/TabBar';
import { Icon } from '@/components/Icon';
import { Tip } from '@/components/Tip';
import { useRequireProfile } from '@/components/Guard';
import { usePlates, todayISO } from '@/lib/store';
import { MEALS } from '@/lib/tree';
import { LEVEL_LABEL } from '@/lib/calories';
import { DAILY_TIPS, pick } from '@/lib/hints';
import { plateTitle } from '@/lib/plate';

function greeting(h: number) {
  if (h < 5) return 'Доброї ночі!';
  if (h < 12) return 'Доброго ранку!';
  if (h < 18) return 'Доброго дня!';
  return 'Доброго вечора!';
}

export default function Home() {
  const { profile, ready } = useRequireProfile();
  const { plates } = usePlates();
  if (!ready || !profile) return null;
  const now = new Date();
  const today = todayISO(now);
  const todays = plates.filter((p) => p.date === today);
  // Прогрес: скільки прийомів їжі сьогодні зібрано (зібрала — значить готово).
  const eaten = new Set(todays.map((p) => p.meal)).size;
  const favs = plates.filter((p) => p.favorite).slice(-6).reverse();
  const C = 2 * Math.PI * 48;

  return (
    <>
      <main className="app-main fade-in">
        <header className="ez-header" style={{ paddingTop: 20 }}>
          <h1 className="ez-large-title">{greeting(now.getHours())}</h1>
          <p className="ez-subhead">Новий день — нова збалансована тарілка.</p>
          <span className="ez-caption">{now.toLocaleDateString('uk-UA', { day: 'numeric', month: 'long' })}</span>
        </header>

        <div className="ez-pad" style={{ paddingTop: 0 }}>
          <Link href="/profile" className="ez-plan" aria-label="План на день" style={{ textDecoration: 'none' }}>
            <div className="ez-ring">
              <svg width="112" height="112" viewBox="0 0 112 112" aria-hidden="true">
                <circle className="ez-ring__track" cx="56" cy="56" r="48" />
                <circle className="ez-ring__value" cx="56" cy="56" r="48" strokeDasharray={`${(C * eaten) / 3} ${C}`} transform="rotate(-90 56 56)" style={{ opacity: eaten ? 1 : 0 }} />
              </svg>
              <div className="ez-ring__label">
                <span className="ez-ring__num">{eaten} з 3</span>
                <span className="ez-ring__sub">прийомів</span>
              </div>
            </div>
            <div className="ez-plan__body">
              <span className="ez-caption" style={{ color: 'var(--secondary)' }}>План</span>
              <span className="ez-title" style={{ fontSize: 22, lineHeight: '28px' }}>{LEVEL_LABEL[profile.level]}</span>
              <span className="ez-caption">{eaten} з 3 прийомів</span>
            </div>
          </Link>
        </div>

        <div className="ez-stack" style={{ paddingTop: 0 }}>
          {MEALS.map((m) => {
            const p = todays.filter((x) => x.meal === m.key).slice(-1)[0];
            if (p) {
              return (
                <Link key={m.key} href={`/plate/${p.id}`} className="ez-meal ez-meal--photo" style={{ textDecoration: 'none' }}>
                  <Photo className="ez-meal__photo" src={platePhoto(p.meal, p.selections)} letter={plateTitle(p.meal, p.selections).charAt(0)} />
                  <span className="ez-meal__body">
                    <span className="ez-meal__tag"><span className="ez-meal__tagicon"><Icon name={m.icon} size={16} variant="fill" /></span>{m.title}</span>
                    <span className="ez-headline" style={{ marginTop: 6 }}>{plateTitle(p.meal, p.selections)}</span>
                  </span>
                  <span className="ez-meal__chev"><Icon name="chev" size={18} /></span>
                </Link>
              );
            }
            return (
              <Link key={m.key} href={`/build/${m.key}`} className="ez-meal" style={{ textDecoration: 'none' }}>
                <span className="ez-meal__icon"><Icon name={m.icon} size={25} variant="fill" /></span>
                <span className="ez-meal__body">
                  <span className="ez-headline" style={{ fontSize: 16 }}>{m.title}</span>
                  <span className="ez-subhead">Зібрати тарілку</span>
                </span>
                <span className="ez-meal__chev"><Icon name="chev" size={18} /></span>
              </Link>
            );
          })}
        </div>

        {favs.length > 0 && (
          <>
            <div className="ez-section-head"><h2 className="ez-headline">Улюблені страви</h2><Link href="/history">Дивитися всі ›</Link></div>
            <div className="ez-favs">
              {favs.map((p) => (
                <div className="ez-fav" key={p.id}>
                  <Link href={`/plate/${p.id}`}>
                    <Photo className="ez-fav__img" src={platePhoto(p.meal, p.selections)} letter={plateTitle(p.meal, p.selections).charAt(0)} />
                    <span className="ez-fav__name">{plateTitle(p.meal, p.selections)}</span>
                  </Link>
                </div>
              ))}
            </div>
          </>
        )}

        <div className="ez-pad"><Tip hint={pick(DAILY_TIPS)} /></div>
      </main>
      <TabBar />
    </>
  );
}
