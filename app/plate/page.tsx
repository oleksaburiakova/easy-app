'use client';
import Link from 'next/link';
import { TabBar } from '@/components/TabBar';
import { Icon } from '@/components/Icon';
import { useRequireProfile } from '@/components/Guard';
import { usePlates, todayISO } from '@/lib/store';
import { MEALS } from '@/lib/tree';
import { plateTitle } from '@/lib/plate';

export default function MyPlate() {
  const { ready } = useRequireProfile();
  const { plates } = usePlates();
  if (!ready) return null;
  const today = plates.filter((p) => p.date === todayISO());
  return (
    <>
      <main className="app-main fade-in">
        <header className="ez-header" style={{ paddingTop: 20 }}>
          <h1 className="ez-large-title">Моя тарілка</h1>
          <p className="ez-subhead">Оберіть прийом їжі — і зберемо баланс з того, що є вдома.</p>
        </header>
        <div className="ez-stack">
          {MEALS.map((m) => {
            const p = today.filter((x) => x.meal === m.key).slice(-1)[0];
            return (
              <Link key={m.key} href={p ? `/plate/${p.id}` : `/build/${m.key}`} className="ez-meal" style={{ textDecoration: 'none' }}>
                <span className="ez-meal__icon"><Icon name={m.icon} size={22} /></span>
                <span className="ez-meal__body">
                  <span className="ez-headline" style={{ fontSize: 16 }}>{m.title}</span>
                  <span className="ez-subhead">{p ? plateTitle(p.meal, p.selections) : 'Зібрати тарілку'}</span>
                </span>
                <span className="ez-meal__chev"><Icon name="chev" size={18} /></span>
              </Link>
            );
          })}
          {today.length > 0 && (
            <p className="ez-caption">Щоб зібрати інакше — відкрийте прийом їжі і натисніть «Зібрати інакше».</p>
          )}
        </div>
      </main>
      <TabBar />
    </>
  );
}
