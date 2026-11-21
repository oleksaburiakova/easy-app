'use client';
import { useEffect, useRef, useState } from 'react';

/**
 * Анімований маскот Easy (стрічка-«е» з тарілкою) для першого екрана.
 * Відео — MP4 960×960 на білому тлі (1,3 МБ, працює всюди, зокрема на iPhone); біле розчиняється у фоні через mix-blend-mode: multiply.
 * Зроблено з bot_anim_pullback.mp4 (синій фон): хромакей з м'якими краями + прибирання синього відсвіту, масштаб 640→960 (lanczos), x264 crf 20,
 * колірний профіль BT.709 прописано явно — інакше відео й картинки-кадри розходяться за відтінком.
 *
 * Старт без білого тла й без «двох маскотів»:
 * 1) спершу видно картинку — ПЕРШИЙ КАДР САМОГО ВІДЕО (easy-bot-first.webp, теж на білому й теж multiply) — кольори збігаються до пікселя;
 * 2) відео запускається непомітно під картинкою (майже прозоре); на першому показаному кадрі — пауза й перемотка на 0,
 *    далі миттєва підміна на паузі й знову play(). Без play() Safari на iPhone відео навіть не завантажує.
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
    let swapped = false;

    // Миттєва підміна картинки на відео, коли відео стоїть на першому кадрі, — і лише тоді запуск.
    const swapAndPlay = () => {
      if (cancelled || swapped) return;
      swapped = true;
      setLive(true);
      requestAnimationFrame(() => requestAnimationFrame(() => {
        if (!cancelled) v.play().catch(() => setLive(false));
      }));
    };

    // Safari на iPhone не вантажить відео без play(), тому: запускаємо (непомітно, під картинкою),
    // на першому показаному кадрі ставимо на паузу й повертаємо на 0, після перемотки — підміна й запуск.
    const onFirstFrame = () => {
      if (cancelled || swapped) return;
      v.pause();
      v.addEventListener('seeked', swapAndPlay, { once: true });
      v.currentTime = 0;
      setTimeout(swapAndPlay, 600); // запасний шлях, якщо подія перемотки не прийде
    };
    const rvfc = (v as HTMLVideoElement & { requestVideoFrameCallback?: (cb: () => void) => number }).requestVideoFrameCallback;
    if (rvfc) rvfc.call(v, onFirstFrame);
    else v.addEventListener('playing', onFirstFrame, { once: true });

    v.play().catch(() => { /* енергозбереження iPhone: відео не запуститься — лишається перший кадр-картинка */ });
    return () => { cancelled = true; };
  }, []);

  return (
    <div className={`mascot${live ? ' mascot--live' : ''}`} style={{ width: size, height: size }}>
      <video ref={video} className="mascot__video" src="/mascot/easy-bot.mp4" width={size} height={size} muted playsInline preload="auto" aria-hidden="true" />
      <img className="mascot__first" src="/mascot/easy-bot-first.webp" alt="" width={size} height={size} />
      <img className="mascot__still" src="/mascot/easy-bot-still.webp" alt="" width={size} height={size} />
    </div>
  );
}
