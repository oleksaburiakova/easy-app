'use client';
import { useEffect, useState } from 'react';
import { Sheet } from './Sheet';
import { Icon } from './Icon';
import { InstallSteps, useInstallPrompt, useInstalled, useDismissed } from './Install';


/**
 * Перший вхід після анкети (рішення 24.11): два вікна підряд —
 * 1) «Додайте Easy на головний екран» (Android — «Встановити» в один дотик; iPhone — покрокова підказка);
 * 2) «Дозвольте сповіщення» — лише там, де браузер це вміє (Android; на iPhone — у встановленому застосунку).
 * Кожне вікно показується один раз; «Пізніше» теж закриває. Самі нагадування надсилатимемо після акаунтів (етап 2).
 */
/** Повертає поточне вікно першого входу або null (тоді можна показувати інші вікна, напр. нагороди). */
export function useStartFlow() {
  const installed = useInstalled();
  const { canPrompt, prompt, justInstalled } = useInstallPrompt();
  const [installDone, doneInstall] = useDismissed('easy.flow.install');
  const [notifyDone, doneNotify] = useDismissed('easy.flow.notify');
  const [canNotify, setCanNotify] = useState(false);
  useEffect(() => { setCanNotify(typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default'); }, []);

  if (!installDone && !installed && !justInstalled) {
    return (
      <Sheet title="Додайте Easy на головний екран" onClose={doneInstall}>
        <div className="flow-hero" aria-hidden="true"><img src="/icons/icon-192.png" alt="" width={84} height={84} /></div>
        <p className="ez-subhead" style={{ margin: 0, textAlign: 'center' }}>Easy відкриватиметься як звичайний застосунок — з іконкою, на весь екран. І зможуть приходити нагадування.</p>
        {canPrompt ? (
          <button className="ez-btn ez-btn--primary ez-btn--block" onClick={async () => { await prompt(); doneInstall(); }}>Встановити</button>
        ) : (
          <>
            <InstallSteps />
            <button className="ez-btn ez-btn--primary ez-btn--block" onClick={doneInstall}>Готово</button>
          </>
        )}
        <button className="ez-btn ez-btn--back ez-btn--block" onClick={doneInstall}>Пізніше</button>
      </Sheet>
    );
  }

  if (!notifyDone && canNotify) {
    const allow = async () => {
      try {
        const res = await Notification.requestPermission();
        if (res === 'granted') {
          const reg = await navigator.serviceWorker?.getRegistration();
          const body = 'Нагадування увімкнено. Пишемо не частіше 1–2 разів на день — вимкнути можна будь-коли.';
          if (reg) await reg.showNotification('Easy', { body, icon: '/icons/icon-192.png' });
          else new Notification('Easy', { body, icon: '/icons/icon-192.png' });
        }
      } catch { /* браузер відмовив — нічого страшного */ }
      doneNotify();
    };
    return (
      <Sheet title="Дозвольте сповіщення" onClose={doneNotify}>
        <div className="flow-hero" aria-hidden="true"><span className="flow-bell"><Icon name="clock" size={40} variant="fill" /></span></div>
        <p className="ez-subhead" style={{ margin: 0, textAlign: 'center' }}>Нагадаємо, коли час снідати, обідати й вечеряти — у вашому режимі дня. Не частіше 1–2 разів на день, вимкнути можна будь-коли.</p>
        <button className="ez-btn ez-btn--primary ez-btn--block" onClick={allow}>Дозволити</button>
        <button className="ez-btn ez-btn--back ez-btn--block" onClick={doneNotify}>Не зараз</button>
      </Sheet>
    );
  }
  return null;
}
