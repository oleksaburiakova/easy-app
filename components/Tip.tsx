import { Icon } from './Icon';
import type { Hint } from '@/lib/hints';

export function Tip({ hint }: { hint: Hint }) {
  return (
    <div className="ez-tip">
      <span className="ez-tip__icon"><Icon name="leaf" size={16} /></span>
      <span className="ez-tip__body">
        <span className="ez-tip__from">Порада Олени</span>
        {hint.text}
        {hint.lesson && <a href="/learn">{hint.lesson} ›</a>}
      </span>
    </div>
  );
}

export const DISCLAIMER =
  'Easy — це збалансоване харчування для здорових людей, а не лікування. Якщо у вас є захворювання, спершу порадьтеся з лікарем.';

export function Disclaimer() {
  return (
    <aside className="ez-notice" role="note">
      <p className="ez-notice__title">Важливо</p>
      <p>{DISCLAIMER}</p>
    </aside>
  );
}
