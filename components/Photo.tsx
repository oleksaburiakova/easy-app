/** Фото продукту або тарілки; якщо фото немає — літера на рожевому тлі, як раніше. */
export function Photo({ src, letter, className, style }: { src: string | null; letter: React.ReactNode; className: string; style?: React.CSSProperties }) {
  return src
    ? <img className={className} src={src} alt="" loading="lazy" style={style} />
    : <span className={`${className} ph`} aria-hidden="true" style={style}>{letter}</span>;
}
