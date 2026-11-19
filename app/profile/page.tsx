'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { TabBar } from '@/components/TabBar';
import { Disclaimer } from '@/components/Tip';
import { useRequireProfile } from '@/components/Guard';
import { usePlates } from '@/lib/store';
import { LEVEL_LABEL } from '@/lib/calories';

export default function Profile() {
  const { profile, ready } = useRequireProfile();
  const { clearAll } = usePlates();
  const router = useRouter();
  if (!ready || !profile) return null;
  const rows: [string, string][] = [
    ['Калорійність', LEVEL_LABEL[profile.level]],
    ['Стать', profile.sex === 'female' ? 'Жінка' : 'Чоловік'],
    ['Вік', `${profile.age}`],
    ['Зріст', `${profile.height} см`],
    ['Активність', profile.activity === 'base' ? 'Базова' : 'Середня'],
    ['Режим дня', `${profile.wake} – ${profile.sleep}`],
  ];
  return (
    <>
      <main className="app-main fade-in">
        <header className="ez-header" style={{ paddingTop: 20 }}>
          <h1 className="ez-large-title">Профіль</h1>
        </header>
        <div className="ez-stack">
          <section className="ez-list">
            {rows.map(([k, v]) => (
              <div className="ez-irow" key={k}><span className="ez-irow__name">{k}</span><span className="ez-irow__grams" style={{ fontWeight: 700 }}>{v}</span></div>
            ))}
          </section>
          <Link href="/onboarding" className="ez-btn ez-btn--soft ez-btn--block">Пройти анкету знову</Link>
          <p className="ez-caption">Змінюйте калорійність, лише якщо активність стабільно зросла 3–4 тижні.</p>
          <Disclaimer />
          <button className="ez-btn ez-btn--back ez-btn--block" onClick={() => { if (confirmReset()) { clearAll(); router.replace('/welcome'); } }}>Очистити дані на цьому пристрої</button>
          <p className="ez-caption center">Easy · версія для тестування · дані зберігаються лише в цьому браузері</p>
        </div>
      </main>
      <TabBar />
    </>
  );
}

function confirmReset() {
  return typeof window !== 'undefined' && window.confirm('Видалити анкету й історію з цього пристрою?');
}
