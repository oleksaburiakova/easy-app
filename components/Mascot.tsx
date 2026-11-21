'use client';
import { useEffect, useRef, useState } from 'react';

/**
 * Анімований маскот Easy (стрічка-«е» з тарілкою) для першого екрана.
 * Відео — MP4 960×960 на білому тлі (1,3 МБ, працює всюди, зокрема на iPhone); біле розчиняється у фоні через mix-blend-mode: multiply.
 * Зроблено з bot_anim_pullback.mp4 (синій фон): хромакей з м'якими краями + прибирання синього відсвіту, масштаб 640→960 (lanczos), x264 crf 20,
 * колірний профіль BT.709 прописано явно.
 *
 * Без стартової картинки (рішення Олександри): відео невидиме, поки не відмалює перший кадр (тоді біле вже розчиняється),
 * і лише тоді плавно проявляється — без білого квадрата на старті. Грає один раз, зупиняється на останньому кадрі.
 * Запасний випадок — відео не запустилось (енергозбереження iPhone): показуємо останній кадр (easy-bot-still.webp).
 * «Зменшити рух» — теж статичний останній кадр. Файли — public/mascot/. Прозорий WebM не використовуємо: Safari на iPhone не підтримує прозорість у WebM.
 */
export function Mascot({ size = 290 }: { size?: number }) {
  const video = useRef<HTMLVideoElement>(null);
  const [state, setState] = useState<'wait' | 'live' | 'still'>('wait');

  useEffect(() => {
    const v = video.current;
    if (!v || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let cancelled = false;
    const show = () => { if (!cancelled) requestAnimationFrame(() => setState('live')); };
    // Перший кадр уже на екрані — можна проявляти.
    const rvfc = (v as HTMLVideoElement & { requestVideoFrameCallback?: (cb: () => void) => number }).requestVideoFrameCallback;
    if (rvfc) rvfc.call(v, show);
    else v.addEventListener('playing', () => setTimeout(show, 80), { once: true });
    v.play().catch(() => { if (!cancelled) setState('still'); });
    return () => { cancelled = true; };
  }, []);

  return (
    <div className={`mascot mascot--${state}`} style={{ width: size, height: size }}>
      <video ref={video} className="mascot__video" src="/mascot/easy-bot.mp4" width={size} height={size} muted playsInline autoPlay preload="auto" aria-hidden="true" />
      <img className="mascot__still" src="/mascot/easy-bot-still.webp" alt="" width={size} height={size} loading="lazy" />
    </div>
  );
}
