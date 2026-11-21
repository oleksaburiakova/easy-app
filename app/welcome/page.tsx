import Link from 'next/link';
import { Wordmark } from '@/components/Wordmark';
import { Mascot } from '@/components/Mascot';

export default function Welcome() {
  return (
    <main className="app-main fade-in" style={{ paddingBottom: 150 }}>
      <div className="welcome-hero">
        <Wordmark />
        <span className="ez-footnote" style={{ letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--olive-ink)' }}>Конструктор здорового харчування</span>
        <h1 className="ez-large-title">Збалансована тарілка з того, що є вдома</h1>
        <p className="ez-subhead">Без меню й заборон: обирайте продукти — порції вже пораховані під вашу калорійність.</p>
        <Mascot />
      </div>
      <div className="bottom-bar">
        <div className="bottom-bar__inner gap-3">
          <Link href="/onboarding" className="ez-btn ez-btn--primary ez-btn--block">Почати</Link>
          <p className="ez-caption center" style={{ margin: 0 }}>Нутриціолог Олена Гаврилова · 5+ років у нутриціології</p>
        </div>
      </div>
    </main>
  );
}
