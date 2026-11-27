'use client';
import Link from 'next/link';
import { useRequireProfile } from '@/components/Guard';
import { LEVEL_LABEL } from '@/lib/calories';
import { Disclaimer, Tip } from '@/components/Tip';

export default function Result() {
  const { profile, ready } = useRequireProfile();
  if (!ready || !profile) return null;
  return (
    <main className="app-main fade-in pb-actions">
      <header className="ez-header page-head--tall">
        <span className="ez-footnote c-olive">Ваша норма</span>
        <span className="result-big">{LEVEL_LABEL[profile.level]}</span>
        <p className="ez-subhead">Калорійність для поступового схуднення — з урахуванням зросту й активності.</p>
      </header>
      <div className="ez-stack">
        <div className="ez-list">
          <p className="ez-list__title">Що варто знати</p>
          <div className="ez-irow"><span className="ez-irow__name">Вагу ми не враховуємо: розрахунок — від здорової ваги для вашого зросту.</span></div>
          <div className="ez-irow"><span className="ez-irow__name">Усі порції в конструкторі розраховані саме для поступового зниження ваги.</span></div>
          <div className="ez-irow"><span className="ez-irow__name">Змінюйте калорійність, лише якщо активність стабільно зросла 3–4 тижні.</span></div>
          <div className="ez-irow"><span className="ez-irow__name">Дефіцит регулюємо рухом, а не урізанням їжі.</span></div>
        </div>
        {profile.activity === 'min' && (
          <Tip hint={{ text: `Порції розраховані як для базової активності. Щоб вони працювали, поступово додавайте рух — до ${profile.sex === 'male' ? '8–9 тис. кроків на день і 2–3 тренувань' : '≈ 7 000 кроків на день і 1–2 тренувань'} на тиждень.`, lesson: 'Урок 3.2 · Активність' }} />
        )}
        <Disclaimer />
      </div>
      <div className="bottom-bar">
        <div className="bottom-bar__inner">
          <Link href="/" className="ez-btn ez-btn--primary ez-btn--block">Зібрати першу тарілку</Link>
        </div>
      </div>
    </main>
  );
}
