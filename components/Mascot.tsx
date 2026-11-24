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
 * Запасний випадок — відео не запустилось (енергозбереження iPhone): показуємо останній кадр (easy-bot-still.webp) і запускаємо при першому дотику.
 * Атрибут muted і src задаються в useEffect до завантаження — інакше Safari не запускає відео сам (React рендерить muted лише як властивість).
 * «Зменшити рух» — теж статичний останній кадр. Файли — public/mascot/. Прозорий WebM не використовуємо: Safari на iPhone не підтримує прозорість у WebM.
 */
export function Mascot({ size = 290 }: { size?: number }) {
  const video = useRef<HTMLVideoElement>(null);
  const [state, setState] = useState<'wait' | 'live' | 'still'>('wait');

  useEffect(() => {
    const v = video.current;
    if (!v || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let cancelled = false;
    let watching = false;
    const show = () => { if (!cancelled) requestAnimationFrame(() => setState('live')); };
    const watchFirstFrame = () => {
      if (watching) return;
      watching = true;
      // Перший кадр уже на екрані — можна проявляти.
      const rvfc = (v as HTMLVideoElement & { requestVideoFrameCallback?: (cb: () => void) => number }).requestVideoFrameCallback;
      if (rvfc) rvfc.call(v, show);
      else v.addEventListener('playing', () => setTimeout(show, 80), { once: true });
    };
    // Safari на iPhone запускає відео сам, лише якщо атрибут muted є в розмітці ДО завантаження.
    // React ставить muted лише як властивість, тож задаємо атрибути вручну й лише потім підключаємо src.
    v.muted = true;
    v.defaultMuted = true;
    v.setAttribute('muted', '');
    v.setAttribute('playsinline', '');
    v.setAttribute('webkit-playsinline', '');
    if (!v.getAttribute('src')) { v.src = '/mascot/easy-bot.mp4'; v.load(); }

    // Якщо браузер не дав запустити (енергозбереження, суворі налаштування) — показуємо кадр і запускаємо
    // при першому дотику до екрана.
    const onTouch = () => { v.currentTime = 0; watching = false; setState('wait'); v.play().then(watchFirstFrame).catch(() => setState('still')); };
    const tryPlay = () => v.play().then(watchFirstFrame).catch(() => {
      if (cancelled) return;
      setState('still');
      window.addEventListener('pointerdown', onTouch, { once: true });
      window.addEventListener('touchstart', onTouch, { once: true, passive: true });
    });
    watchFirstFrame();
    tryPlay();
    return () => {
      cancelled = true;
      window.removeEventListener('pointerdown', onTouch);
      window.removeEventListener('touchstart', onTouch);
    };
  }, []);

  return (
    <div className={`mascot mascot--${state}`} style={{ width: size, height: size }}>
      {/* src підключається в useEffect — після того, як виставлено muted (вимога Safari для автозапуску). */}
      <video ref={video} className="mascot__video" width={size} height={size} muted playsInline autoPlay preload="auto" aria-hidden="true" />
      <img className="mascot__still" src="/mascot/easy-bot-still.webp" alt="" width={size} height={size} loading="lazy" />
    </div>
  );
}
