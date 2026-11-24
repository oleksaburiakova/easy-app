'use client';
import { useEffect, useState } from 'react';
import { Sheet } from './Sheet';
import { Icon } from './Icon';
import { InstallSteps, isIOS, useInstallPrompt, useDismissed } from './Install';


/**
 * Перший запуск (рішення 24.11):
 * 1) «Додайте Easy на головний екран» — на першому екрані, ДО анкети (`InstallFirstSheet`):
 *    на iPhone встановлений застосунок має окреме сховище від Safari, тож анкету краще заповнювати вже в ньому;
 * 2) «Дозвольте сповіщення» — при першому вході на головну після анкети (`useStartFlow`), лише де браузер це вміє
 *    (Android; на iPhone — у встановленому застосунку). Кожне вікно — один раз. Нагадування надсилатимемо після акаунтів.
 */
/** Повертає поточне вікно першого входу або null (тоді можна показувати інші вікна, напр. нагороди). */
export function useStartFlow() {
  const [notifyDone, doneNotify] = useDismissed('easy.flow.notify');
  const [canNotify, setCanNotify] = useState(false);
  useEffect(() => { setCanNotify(typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default'); }, []);

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

/** «Додайте Easy на головний екран» перед анкетою. */
export function InstallFirstSheet({ onContinue, onClose }: { onContinue: () => void; onClose: () => void }) {
  const { canPrompt, prompt } = useInstallPrompt();
  const [ios, setIos] = useState(false);
  useEffect(() => setIos(isIOS()), []);
  return (
    <Sheet title="Додайте Easy на головний екран" onClose={onClose}>
      <div className="flow-hero" aria-hidden="true"><img src="/icons/icon-192.png" alt="" width={84} height={84} /></div>
      <p className="ez-subhead" style={{ margin: 0, textAlign: 'center' }}>Easy відкриватиметься як звичайний застосунок — з іконкою, на весь екран. І зможуть приходити нагадування.</p>
      {canPrompt ? (
        <button className="ez-btn ez-btn--primary ez-btn--block" onClick={async () => { await prompt(); onContinue(); }}>Встановити й почати</button>
      ) : (
        <>
          <InstallSteps />
          {ios && <p className="trk-sheet__rec">Потім відкрийте Easy з іконки на екрані — і заповніть анкету вже там.</p>}
        </>
      )}
      <button className="ez-btn ez-btn--back ez-btn--block" onClick={onContinue}>{canPrompt ? 'Пізніше — почати в браузері' : 'Продовжити в браузері'}</button>
    </Sheet>
  );
}
