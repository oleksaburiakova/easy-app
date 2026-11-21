'use client';
import { useEffect, useState } from 'react';

/** Нижній скляний аркуш (діалог). */

/**
 * Висота екранної клавіатури. На iPhone клавіатура відкривається поверх сторінки й ховає нижні аркуші,
 * тож піднімаємо аркуш на її висоту (visualViewport — видима частина екрана без клавіатури).
 */
export function useKeyboardInset() {
  const [kb, setKb] = useState(0);
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const update = () => setKb(Math.max(0, Math.round(window.innerHeight - vv.height - vv.offsetTop)));
    update();
    vv.addEventListener('resize', update);
    vv.addEventListener('scroll', update);
    return () => { vv.removeEventListener('resize', update); vv.removeEventListener('scroll', update); };
  }, []);
  return kb;
}

export function Sheet({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  const kb = useKeyboardInset();
  return (
    <div className="sheet-backdrop" role="presentation" onClick={onClose} style={kb ? { paddingBottom: kb, ['--kb' as string]: `${kb}px` } : undefined}>
      <div className="sheet pop-in" role="dialog" aria-modal="true" aria-label={title} onClick={(e) => e.stopPropagation()}>
        <h2 className="ez-title" style={{ margin: 0 }}>{title}</h2>
        {children}
      </div>
    </div>
  );
}

