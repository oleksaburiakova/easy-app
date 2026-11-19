import Link from 'next/link';

export default function Welcome() {
  return (
    <main className="app-main fade-in" style={{ paddingBottom: 150 }}>
      <div className="welcome-hero">
        <img src="/icons/mark.svg" alt="Олена Гаврилова" width={40} height={40} style={{ width: 40 }} />
        <span className="ez-footnote" style={{ letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--olive-ink)' }}>Конструктор здорового харчування</span>
        <h1 className="ez-large-title">Збалансована тарілка з того, що є вдома</h1>
        <p className="ez-subhead">Без меню й заборон: обирайте продукти — порції вже пораховані під вашу калорійність.</p>
        <img src="/mascot.webp" alt="" width={220} height={213} />
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
