/**
 * Логотип-напис Easy у стилі гайдів Олени: «EASY» — Cormorant Garamond (як заголовки гайдів),
 * «від Олени Гаврилової» — Great Vibes (як рукописні рядки в гайдах). Шрифти підключено в app/layout.tsx.
 */
export function Wordmark({ size = 'lg' }: { size?: 'lg' | 'sm' }) {
  return (
    <div className={`wordmark wordmark--${size}`} role="img" aria-label="Easy від Олени Гаврилової">
      <span className="wordmark__name" aria-hidden="true">Easy</span>
      <span className="wordmark__by" aria-hidden="true">від Олени Гаврилової</span>
    </div>
  );
}
