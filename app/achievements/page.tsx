'use client';
import Link from 'next/link';
import { TabBar } from '@/components/TabBar';
import { Icon } from '@/components/Icon';
import { useRequireProfile } from '@/components/Guard';
import { Medal, useAwards } from '@/components/Awards';

const GROUPS = ['Тарілки', 'Різноманіття', 'Навчання', 'Рух і самопочуття', 'Повернення'] as const;

/** «Мої досягнення»: отримані — кольорові, інші — сірі з підказкою, як отримати. */
export default function Achievements() {
  const { ready } = useRequireProfile();
  const { earned, list, ready: ar } = useAwards();
  if (!ready || !ar) return null;
  const got = list.filter((a) => earned.has(a.id)).length;
  return (
    <>
      <main className="app-main fade-in">
        <nav className="ez-nav" aria-label="Навігація">
          <Link className="ez-nav__back" href="/profile"><Icon name="back" size={18} /> Профіль</Link>
        </nav>
        <header className="ez-header">
          <h1 className="ez-large-title">Мої досягнення</h1>
          <p className="ez-subhead">{got} з {list.length} · хвалимо за звичку, а не за ідеальність.</p>
        </header>
        <div className="ez-stack flush-top">
          {GROUPS.map((g) => {
            const items = list.filter((a) => a.group === g);
            if (!items.length) return null;
            return (
              <section key={g} className="ez-list" aria-label={g}>
                <p className="ez-list__title">{g}</p>
                {items.map((a) => {
                  const on = earned.has(a.id);
                  return (
                    <div key={a.id} className={`ach-row${on ? '' : ' ach-row--off'}`}>
                      <Medal award={a} earned={on} size={48} />
                      <span className="ach-row__body">
                        <span className="ach-row__title">{a.title}</span>
                        <span className="ach-row__text">{on ? a.praise : a.how}</span>
                      </span>
                      {on && <span className="ach-row__ok"><Icon name="check" size={14} strokeWidth={3} /></span>}
                    </div>
                  );
                })}
              </section>
            );
          })}
        </div>
      </main>
      <TabBar />
    </>
  );
}
