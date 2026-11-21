/**
 * Анімований маскот Easy (стрічка-«е» з тарілкою) для першого екрана.
 * Відео — MP4 960×960 на білому тлі (1,3 МБ, працює всюди, зокрема на iPhone); біле розчиняється у фоні через mix-blend-mode: multiply.
 * Зроблено з bot_anim_pullback.mp4 (синій фон): хромакей з м'якими краями + прибирання синього відсвіту, масштаб 640→960 (lanczos), x264 crf 20.
 * Грає один раз і зупиняється на останньому кадрі (маскот підморгує й подає тарілку).
 * «Зменшити рух» на телефоні — статичний останній кадр (PNG/WebP з прозорістю).
 * Файли — public/mascot/. Прозорий WebM не використовуємо: Safari на iPhone не підтримує прозорість у WebM.
 */
export function Mascot({ size = 290 }: { size?: number }) {
  return (
    <div className="mascot" style={{ width: size, height: size }}>
      <video
        className="mascot__video"
        src="/mascot/easy-bot.mp4"
        poster="/mascot/easy-bot-poster.webp"
        width={size}
        height={size}
        autoPlay
        muted
        playsInline
        preload="auto"
        aria-hidden="true"
      />
      <img className="mascot__still" src="/mascot/easy-bot-still.webp" alt="" width={size} height={size} />
    </div>
  );
}
