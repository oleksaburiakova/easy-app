import { Icon } from './Icon';
import type { Hint } from '@/lib/hints';
import { lessonHref } from '@/lib/lessons';

export function Tip({ hint, className }: { hint: Hint; className?: string }) {
  const href = hint.lesson ? lessonHref(hint.lesson) : '';
  const pdf = href.endsWith('.pdf');
  return (
    <div className={`ez-tip${className ? ` ${className}` : ''}`}>
      <span className="ez-tip__icon"><Icon name="leaf" size={16} /></span>
      <span className="ez-tip__body">
        <span className="ez-tip__from">Порада Олени</span>
        {hint.text}
        {hint.lesson && <a href={href} {...(pdf ? { target: '_blank', rel: 'noopener' } : {})}>{hint.lesson} ›</a>}
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
