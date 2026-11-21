'use client';
import { useEffect, useRef, useState } from 'react';

/**
 * Анімований маскот Easy (стрічка-«е» з тарілкою) для першого екрана.
 * Відео — MP4 960×960 на білому тлі (1,3 МБ, працює всюди, зокрема на iPhone); біле розчиняється у фоні через mix-blend-mode: multiply.
 * Зроблено з bot_anim_pullback.mp4 (синій фон): хромакей з м'якими краями + прибирання синього відсвіту, масштаб 640→960 (lanczos), x264 crf 20.
 *
 * Старт без білого тла й без «двох маскотів»:
 * 1) спершу видно картинку — ПЕРШИЙ КАДР САМОГО ВІДЕО (easy-bot-first.webp, теж на білому й теж multiply) — кольори збігаються до пікселя;
 * 2) відео завантажується на паузі на першому кадрі під картинкою (майже прозоре — щоб браузер уже його відмалював, але без подвійного затемнення);
 *    далі миттєва підміна на паузі й лише потім play().
 * Якщо відео не запускається (режим енергозбереження iPhone) — лишається перший кадр.
 * «Зменшити рух» — статичний останній кадр (easy-bot-still.webp, з відео, multiply). Грає один раз, зупиняється на останньому кадрі.
 * Файли — public/mascot/. Прозорий WebM не використовуємо: Safari на iPhone не підтримує прозорість у WebM.
 */
export function Mascot({ size = 290 }: { size?: number }) {
  const video = useRef<HTMLVideoElement>(null);
  const [live, setLive] = useState(false);

  useEffect(() => {
    const v = video.current;
    if (!v || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let cancelled = false;
    const start = () => {
      if (cancelled) return;
      // Дати браузеру відмалювати перший кадр відео під картинкою, потім миттєво підмінити й запустити.
      setTimeout(() => {
        if (cancelled) return;
        v.currentTime = 0;
        setLive(true); // підміна на паузі: відео стоїть на тому самому першому кадрі, що й картинка
        requestAnimationFrame(() => requestAnimationFrame(() => {
          if (cancelled) return;
          v.play().catch(() => setLive(false)); // енергозбереження: повертаємо перший кадр-картинку
        }));
      }, 150);
    };
    if (v.readyState >= 2) start();
    else v.addEventListener('loadeddata', start, { once: true });
    return () => { cancelled = true; v.removeEventListener('loadeddata', start); };
  }, []);

  return (
    <div className={`mascot${live ? ' mascot--live' : ''}`} style={{ width: size, height: size }}>
      <video ref={video} className="mascot__video" src="/mascot/easy-bot.mp4" width={size} height={size} muted playsInline preload="auto" aria-hidden="true" />
      <img className="mascot__first" src="/mascot/easy-bot-first.webp" alt="" width={size} height={size} />
      <img className="mascot__still" src="/mascot/easy-bot-still.webp" alt="" width={size} height={size} />
    </div>
  );
}
