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

/** Тарілка-схема в рамці превʼю (головна, історія, улюблені): рамка тримає розмір, тарілка — по центру. */
export function PlateThumb({ className, size, meal, selections }: { className: string; size: number; meal: string; selections: { stepKey: string; label: string }[] }) {
  return <span className={`${className} plate-thumb`}><PlateArt meal={meal} selections={selections} size={size} /></span>;
}

/** Варіант Б: порції-гірки на тарілці без розділювачів. */
export function PlateMounds({ meal, selections, size = 120 }: { meal: string; selections: { stepKey: string; label: string }[]; size?: number }) {
  const p = plateParts(meal, selections);
  const blob = (src: string | null, cls: string) => src ? <span className={`plate-mound ${cls}`}><img src={src} alt="" loading="lazy" /></span> : null;
  return (
    <span className="plate-art plate-art--mounds" style={{ ['--pa' as string]: `${size}px` }} aria-hidden="true">
      <span className="plate-mounds__plate" />
      {blob(p.veg[0] ?? null, 'plate-mound--veg')}
      {blob(p.veg[1] ?? null, 'plate-mound--veg2')}
      {blob(p.carb, 'plate-mound--carb')}
      {blob(p.protein, 'plate-mound--protein')}
      {p.extras.map((src, i) => <span key={src} className={`plate-mound plate-mound--x${i}`}><img src={src} alt="" loading="lazy" /></span>)}
    </span>
  );
}

/** Варіант В: ланч-бокс — велике відділення овочів ліворуч, білок і гарнір праворуч, добавки смужкою знизу. */
export function PlateBento({ meal, selections, size = 120 }: { meal: string; selections: { stepKey: string; label: string }[]; size?: number }) {
  const p = plateParts(meal, selections);
  const cell = (src: string | null, cls: string) => <span className={`bento__cell ${cls}`}>{src ? <img src={src} alt="" loading="lazy" /> : null}</span>;
  return (
    <span className="bento" style={{ ['--pa' as string]: `${size}px` }} aria-hidden="true">
      {p.veg.length > 1 ? <span className="bento__veg">{cell(p.veg[0], '')}{cell(p.veg[1], '')}</span> : cell(p.veg[0] ?? null, 'bento__veg')}
      {cell(p.protein, 'bento__protein')}
      {cell(p.carb, 'bento__carb')}
      {p.extras.length > 0 && <span className="bento__extras">{p.extras.map((src) => cell(src, ''))}</span>}
    </span>
  );
}
