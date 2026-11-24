'use client';
import { AwardWatcher } from '@/components/Awards';
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
import { useState } from 'react';
import { InstallSheet, useDismissed, useInstallPrompt, useInstalled } from '@/components/Install';
import { GUIDES } from '@/lib/lessons';
import { vocative } from '@/lib/names';

function greeting(h: number, name?: string) {
  const g = h < 5 ? 'Доброї ночі' : h < 12 ? 'Доброго ранку' : h < 18 ? 'Доброго дня' : 'Доброго вечора';
  return name?.trim() ? `${g}, ${vocative(name)}!` : `${g}!`;
}

export default function Home() {
  const { profile, ready } = useRequireProfile();
  const { plates } = usePlates();
  const installed = useInstalled();
  const [firstSeen, dismissFirst] = useDismissed('easy.hint.first-steps');
  const [installSeen, dismissInstall] = useDismissed('easy.hint.install');
  const [installOpen, setInstallOpen] = useState(false);
  const { canPrompt, prompt, justInstalled } = useInstallPrompt();
  if (!ready || !profile) return null;
  const productsGuide = GUIDES.find((g) => g.file.includes('zdorovi'));
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
          <h1 className="ez-large-title">{greeting(now.getHours(), profile.name)}</h1>
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

        {(!firstSeen && plates.length === 0) || (!installSeen && !installed && !justInstalled) ? (
          <div className="ez-stack" style={{ paddingTop: 0 }}>
            {!firstSeen && plates.length === 0 && (
              <section className="home-card" aria-label="З чого почати">
                <span className="home-card__icon"><Icon name="leaf" size={22} variant="fill" /></span>
                <div className="home-card__body">
                  <p className="home-card__title">З чого почати</p>
                  <p className="home-card__text">Перегляньте список здорових продуктів — і перевірте, що є вдома. Так буде з чого збирати тарілки. А перший урок пояснить, як працює конструктор.</p>
                  <div className="home-card__actions">
                    {productsGuide && <a className="ez-btn ez-btn--primary ez-btn--sm" href={productsGuide.file} target="_blank" rel="noopener">Список продуктів</a>}
                    <Link className="ez-btn ez-btn--soft ez-btn--sm" href="/learn#l-intro">Перший урок</Link>
                  </div>
                </div>
                <button className="home-card__close" onClick={dismissFirst} aria-label="Сховати"><Icon name="plus" size={16} style={{ transform: 'rotate(45deg)' }} /></button>
              </section>
            )}
            {!installSeen && !installed && !justInstalled && (
              <section className="home-card" aria-label="Встановити Easy">
                <span className="home-card__icon"><Icon name="home" size={22} variant="fill" /></span>
                <div className="home-card__body">
                  <p className="home-card__title">Встановіть Easy на телефон</p>
                  <p className="home-card__text">Відкривається як застосунок — з іконкою, на весь екран.</p>
                  <div className="home-card__actions">
                    {canPrompt
                      ? <button className="ez-btn ez-btn--primary ez-btn--sm" onClick={() => prompt()}>Встановити</button>
                      : <button className="ez-btn ez-btn--soft ez-btn--sm" onClick={() => setInstallOpen(true)}>Як додати</button>}
                  </div>
                </div>
                <button className="home-card__close" onClick={dismissInstall} aria-label="Сховати"><Icon name="plus" size={16} style={{ transform: 'rotate(45deg)' }} /></button>
              </section>
            )}
          </div>
        ) : null}

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
      <AwardWatcher />
      <TabBar />
      {installOpen && <InstallSheet onClose={() => setInstallOpen(false)} />}
    </>
  );
}
