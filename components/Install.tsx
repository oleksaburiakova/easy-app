'use client';
import { useEffect, useState } from 'react';
import { Sheet } from './Sheet';
import { Icon } from './Icon';

/**
 * Встановлення в один дотик (Android / Chrome): браузер надсилає подію beforeinstallprompt — зберігаємо її
 * й показуємо свою кнопку «Встановити», яка відкриває системне вікно підтвердження.
 * iPhone (Safari) такої можливості сайтам не дає — там лише «Поділитися → На початковий екран» (покрокова підказка).
 */
type BIPEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }> };
let deferred: BIPEvent | null = null;
let justInstalled = false;
const subs = new Set<() => void>();
const notify = () => subs.forEach((f) => f());

/** Підключається один раз у layout: ловить подію встановлення й реєструє service worker. */
export function InstallCapture() {
  useEffect(() => {
    const onPrompt = (e: Event) => { e.preventDefault(); deferred = e as BIPEvent; notify(); };
    const onInstalled = () => { deferred = null; justInstalled = true; notify(); };
    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', onInstalled);
    if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(() => { /* без SW просто не буде кнопки */ });
    return () => { window.removeEventListener('beforeinstallprompt', onPrompt); window.removeEventListener('appinstalled', onInstalled); };
  }, []);
  return null;
}

/** Чи можна встановити одним дотиком (Android / Chrome) і функція, що відкриває системне вікно. */
export function useInstallPrompt() {
  const [, force] = useState(0);
  useEffect(() => { const f = () => force((n) => n + 1); subs.add(f); return () => { subs.delete(f); }; }, []);
  const prompt = async () => {
    if (!deferred) return false;
    const e = deferred;
    await e.prompt();
    const { outcome } = await e.userChoice;
    deferred = null;
    if (outcome === 'accepted') justInstalled = true;
    notify();
    return outcome === 'accepted';
  };
  return { canPrompt: !!deferred, prompt, justInstalled };
}

/** iPhone / iPad (у т. ч. iPad з «десктопним» Safari). */
export const isIOS = () => typeof navigator !== 'undefined' && (/iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1));

/** Easy вже відкрито як застосунок (з головного екрана)? */
export function useInstalled() {
  const [installed, setInstalled] = useState(false);
  useEffect(() => {
    setInstalled(window.matchMedia('(display-mode: standalone)').matches || (navigator as Navigator & { standalone?: boolean }).standalone === true);
  }, []);
  return installed;
}

/** «Встановити Easy»: Android — кнопка в один дотик; iPhone — покрокова підказка «Поділитися → На початковий екран». */
export function InstallSheet({ onClose }: { onClose: () => void }) {
  const { canPrompt, prompt, justInstalled } = useInstallPrompt();
  const [ios, setIos] = useState(false);
  useEffect(() => setIos(isIOS()), []);
  return (
    <Sheet title="Встановити Easy" onClose={onClose}>
      <p className="ez-subhead" style={{ margin: 0 }}>Так Easy відкривається як звичайний застосунок — на весь екран, з іконкою. І так зможуть приходити нагадування.</p>
      {justInstalled ? (
        <p className="trk-sheet__rec">Готово! Easy з'явиться на головному екрані.</p>
      ) : canPrompt ? (
        <button className="ez-btn ez-btn--primary ez-btn--block" onClick={async () => { if (await prompt()) onClose(); }}>Встановити</button>
      ) : ios ? (
        <ol className="inst-steps">
          <li><span className="inst-steps__ic"><ShareIcon /></span><span>Натисніть <b>«Поділитися»</b> внизу екрана Safari</span></li>
          <li><span className="inst-steps__ic"><Icon name="plus" size={20} strokeWidth={2.2} /></span><span>Прогорніть і оберіть <b>«На початковий екран»</b></span></li>
          <li><span className="inst-steps__ic"><Icon name="check" size={20} strokeWidth={2.4} /></span><span>Натисніть <b>«Додати»</b> угорі праворуч</span></li>
        </ol>
      ) : (
        <ol className="inst-steps">
          <li><span className="inst-steps__ic">⋮</span><span>Відкрийте меню браузера <b>⋮</b> угорі праворуч</span></li>
          <li><span className="inst-steps__ic"><Icon name="plus" size={20} strokeWidth={2.2} /></span><span>Оберіть <b>«Установити застосунок»</b> або <b>«Додати на головний екран»</b></span></li>
        </ol>
      )}
      {!canPrompt && <button className="ez-btn ez-btn--back ez-btn--block" onClick={onClose}>Зрозуміло</button>}
    </Sheet>
  );
}

/** Іконка «Поділитися» як у Safari: квадрат зі стрілкою вгору. */
function ShareIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3v12M8 7l4-4 4 4" /><path d="M7 10H6a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2h-1" />
    </svg>
  );
}

/** Прапорець «більше не показувати» для підказок на головній (лише на цьому пристрої). */
export function useDismissed(key: string) {
  const [dismissed, setDismissed] = useState(true);
  useEffect(() => {
    try { setDismissed(localStorage.getItem(key) === '1'); } catch { setDismissed(false); }
  }, [key]);
  const dismiss = () => { setDismissed(true); try { localStorage.setItem(key, '1'); } catch { /* приватний режим */ } };
  return [dismissed, dismiss] as const;
}
