'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Wordmark } from '@/components/Wordmark';
import { Mascot } from '@/components/Mascot';
import { InstallFirstSheet } from '@/components/StartFlow';
import { useInstalled, useDismissed } from '@/components/Install';

/**
 * Перший екран. «Почати» → спершу «Додайте Easy на головний екран» (рішення 24.11), потім анкета.
 * Чому до анкети: на iPhone встановлений застосунок має окреме сховище від Safari — анкета, заповнена в Safari,
 * у застосунку з іконки не з'явиться. До акаунтів (етап 2) ставимо застосунок першим.
 */
export default function Welcome() {
  const router = useRouter();
  const installed = useInstalled();
  const [asked, markAsked] = useDismissed('easy.flow.install');
  const [open, setOpen] = useState(false);
  const start = () => (installed || asked ? router.push('/onboarding') : setOpen(true));
  const toOnboarding = () => { markAsked(); router.push('/onboarding'); };
  return (
    <main className="app-main fade-in pb-welcome">
      <div className="welcome-hero">
        <Wordmark />
        <span className="ez-footnote eyebrow">Конструктор здорового харчування</span>
        <h1 className="ez-large-title">Збалансована тарілка з того, що є вдома</h1>
        <p className="ez-subhead">Без меню й заборон: обирайте продукти — порції вже пораховані під вашу калорійність.</p>
        <Mascot />
      </div>
      <div className="bottom-bar">
        <div className="bottom-bar__inner gap-3">
          <button className="ez-btn ez-btn--primary ez-btn--block" onClick={start}>Почати</button>
          <p className="ez-caption center m-0">Нутриціолог Олена Гаврилова · 5+ років у нутриціології</p>
        </div>
      </div>
      {open && <InstallFirstSheet onContinue={toOnboarding} onClose={() => setOpen(false)} />}
    </main>
  );
}
