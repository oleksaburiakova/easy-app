/**
 * Анімований маскот Easy (стрічка-«е» з тарілкою) для першого екрана.
 * Відео — MP4 на білому тлі (367 КБ, працює всюди, зокрема на iPhone); біле розчиняється у фоні через mix-blend-mode: multiply.
 * Грає один раз і зупиняється на останньому кадрі (маскот підморгує й подає тарілку).
 * «Зменшити рух» на телефоні — статичний останній кадр (PNG/WebP з прозорістю).
 * Джерело: bot_v2_webm_alpha.webm від Олександри (21.11), файли — public/mascot/.
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
