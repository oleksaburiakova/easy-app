import { Icon } from '@/components/Icon';
import { recipePortion } from '@/lib/recipes';

/** «Ваша порція» сніданку-страви (млинці, панкейки, галета) — помітною плашкою, щоб не пропустити (28.11). */
export function PortionBox({ label }: { label: string }) {
  const p = recipePortion(label);
  if (!p) return null;
  return (
    <div className="portion-box" role="note">
      <span className="portion-box__icon" aria-hidden="true"><Icon name="bowl" size={22} variant="fill" /></span>
      <span className="portion-box__text">
        <span className="portion-box__label">Ваша порція</span>
        <span className="portion-box__value">{p.value}</span>
        {p.hint && <span className="portion-box__hint">{p.hint}</span>}
      </span>
    </div>
  );
}
