import { plateParts } from '@/lib/photos';

/**
 * Тарілка-схема: кругла тарілка зверху за методом Олени — ліва половина овочі, праворуч угорі білок,
 * праворуч унизу гарнір / основа; сир, фрукти, десерт — маленькі кружечки поруч. Збирається з фото продуктів.
 */
export function PlateArt({ meal, selections, size = 120 }: { meal: string; selections: { stepKey: string; label: string }[]; size?: number }) {
  const p = plateParts(meal, selections);
  const sector = (src: string | null, cls: string) => (
    <span className={`plate-art__sector ${cls}`}>{src ? <img src={src} alt="" loading="lazy" /> : null}</span>
  );
  return (
    <span className="plate-art" style={{ ['--pa' as string]: `${size}px` }} aria-hidden="true">
      <span className="plate-art__plate">
        <span className="plate-art__food">
          {p.veg.length > 1
            ? <>{sector(p.veg[0], 'plate-art__sector--tl')}{sector(p.veg[1], 'plate-art__sector--bl')}</>
            : sector(p.veg[0] ?? null, 'plate-art__sector--left')}
          {sector(p.protein, 'plate-art__sector--tr')}
          {sector(p.carb, 'plate-art__sector--br')}
          <span className="plate-art__line plate-art__line--v" />
          <span className="plate-art__line plate-art__line--h" />
          {p.veg.length > 1 && <span className="plate-art__line plate-art__line--hl" />}
        </span>
      </span>
      {p.extras.map((src, i) => (
        <span key={src} className={`plate-art__side plate-art__side--${i}`}><img src={src} alt="" loading="lazy" /></span>
      ))}
    </span>
  );
}
