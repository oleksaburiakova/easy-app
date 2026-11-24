'use client';
import { useEffect, useState } from 'react';
import { Sheet } from './Sheet';

/** Easy вже відкрито як застосунок (з головного екрана)? */
export function useInstalled() {
  const [installed, setInstalled] = useState(false);
  useEffect(() => {
    setInstalled(window.matchMedia('(display-mode: standalone)').matches || (navigator as Navigator & { standalone?: boolean }).standalone === true);
  }, []);
  return installed;
}

/** Інструкція «Як додати Easy на головний екран» (iPhone / Android). */
export function InstallSheet({ onClose }: { onClose: () => void }) {
  return (
    <Sheet title="Встановити Easy" onClose={onClose}>
      <p className="ez-subhead" style={{ margin: 0 }}>Так Easy відкривається як звичайний застосунок — на весь екран, з іконкою. І так зможуть приходити нагадування.</p>
      <ol className="pf-steps">
        <li><b>iPhone (Safari):</b> натисніть «Поділитися» <span aria-hidden="true">⬆︎</span> внизу екрана → «На початковий екран» → «Додати».</li>
        <li><b>Android (Chrome):</b> меню ⋮ угорі праворуч → «Додати на головний екран» або «Установити застосунок».</li>
      </ol>
      <button className="ez-btn ez-btn--primary ez-btn--block" onClick={onClose}>Зрозуміло</button>
    </Sheet>
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
