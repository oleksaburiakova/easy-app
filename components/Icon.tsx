'use client';
import { useId, type ReactElement, type SVGProps } from 'react';

/**
 * Іконки в стилі SF Symbols (iOS 26): м'які, заокруглені, однаковий «вагомий» контур.
 * Варіант `fill` — об'ємна заливка: градієнт від світлішого верху до насиченого низу + легка тінь (клас ez-icon--fill),
 * у пару до «рідкого скла». Елементи з класом `s` (промені сонця, ручка ножа тощо) лишаються лінією й у заливці.
 */
const P: Record<string, ReactElement> = {
  chev: <path d="M9.5 5.5 16 12l-6.5 6.5" />,
  back: <path d="M14.5 5.5 8 12l6.5 6.5" />,
  check: <path d="M5 12.5 9.5 17 19 7.5" />,
  plus: <path d="M12 5v14M5 12h14" />,
  sun: (<><circle cx="12" cy="12" r="4.8" /><path className="s" d="M12 2.2v2M12 19.8v2M4.4 4.4l1.4 1.4M18.2 18.2l1.4 1.4M2.2 12h2M19.8 12h2M4.4 19.6l1.4-1.4M18.2 5.8l1.4-1.4" /></>),
  fork: (<><path className="s" d="M5 3v5.5a2.5 2.5 0 0 0 5 0V3M7.5 3v18" /><path d="M18.5 3c-2.2 1-3.8 3.8-3.8 7.6v3.4h3.8z" /><path className="s" d="M18.5 13.5V21" /></>),
  moon: <path d="M20.5 14.2A8.6 8.6 0 1 1 9.8 3.5a7 7 0 0 0 10.7 10.7z" />,
  clock: (<><circle cx="12" cy="12" r="9" /><path className="s" d="M12 7v5l3.2 2" /></>),
  heart: <path d="M12 20.3s-8.3-4.7-8.3-10.6A4.6 4.6 0 0 1 12 7.2a4.6 4.6 0 0 1 8.3 2.5c0 5.9-8.3 10.6-8.3 10.6z" />,
  book: (<><path d="M5 4.8C5 3.8 5.8 3 6.8 3H19v15.5H6.8A1.8 1.8 0 0 0 5 20.3z" /><path className="s" d="M5 20.3c0 .9.8 1.7 1.8 1.7H19" /></>),
  home: <path d="M3.5 10.6 12 3.4l8.5 7.2v8.6c0 .9-.7 1.6-1.6 1.6h-4.2v-5.4a1.3 1.3 0 0 0-1.3-1.3h-2.8a1.3 1.3 0 0 0-1.3 1.3v5.4H5.1c-.9 0-1.6-.7-1.6-1.6z" />,
  plate: (<><circle cx="12" cy="12" r="9" /><circle className="s" cx="12" cy="12" r="5" /></>),
  chart: (<><rect x="3.5" y="12" width="4.2" height="8.5" rx="1.6" /><rect x="9.9" y="3.5" width="4.2" height="17" rx="1.6" /><rect x="16.3" y="8.5" width="4.2" height="12" rx="1.6" /></>),
  cap: (<><path d="M12 4.2 2.6 8.9 12 13.6l9.4-4.7z" /><path d="M6.4 11.7 12 14.5l5.6-2.8v4c0 1.6-2.5 3.2-5.6 3.2s-5.6-1.6-5.6-3.2z" /><path className="s" d="M21.4 9v5.2" /></>),
  user: (<><circle cx="12" cy="7.8" r="4" /><path d="M4.4 20.2c0-3.6 3.4-6 7.6-6s7.6 2.4 7.6 6c0 .5-.4.8-.8.8H5.2c-.4 0-.8-.3-.8-.8z" /></>),
  leaf: (<><path d="M5 19.5C5 10.9 10.6 4.5 20 4.5c0 9.4-6.4 15-15 15z" /><path className="s" d="M5 19.5l7.5-7.5" /></>),
  play: <path d="M8 5.7v12.6c0 .8.9 1.3 1.6.9l9.8-6.3c.6-.4.6-1.4 0-1.8L9.6 4.8C8.9 4.4 8 4.9 8 5.7z" />,
  file: (<><path d="M7 3h6.6L19 8.4V19a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" /><path className="s" d="M13.5 3v5.5H19" /></>),
  expand: <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />,
  redo: (<><path d="M19.5 12a7.5 7.5 0 1 1-2.2-5.3" /><path d="M19.5 4.2v4.6h-4.6" /></>),
  download: <path d="M12 4v11M7.5 10.5 12 15l4.5-4.5M5 19.5h14" />,
  minus: <path d="M5 12h14" />,
  drop: <path d="M12 3.2c-.3 0-.5.1-.7.4C9.6 6 6 10.6 6 14.3a6 6 0 0 0 12 0c0-3.7-3.6-8.3-5.3-10.7-.2-.3-.4-.4-.7-.4z" />,
  steps: (<><path d="M8.2 3.3c-1.8 0-3 2.3-3 4.8 0 2 .6 3.4 1.2 4.4.3.5.9.8 1.5.8h1c.8 0 1.4-.6 1.4-1.4V8.1c0-2.6-.5-4.8-2.1-4.8z" /><path d="M6.6 15.4h3.5v1.4a1.75 1.75 0 0 1-3.5 0z" /><path d="M15.8 7.3c1.6 0 2.1 2.2 2.1 4.8v3.8c0 .8-.6 1.4-1.4 1.4h-1c-.6 0-1.2-.3-1.5-.8-.6-1-1.2-2.4-1.2-4.4 0-2.5 1.2-4.8 3-4.8z" /><path d="M13.9 19.4h3.5v.4a1.75 1.75 0 0 1-3.5 0z" /></>),
  dumbbell: (<><rect x="5.2" y="6.5" width="3.2" height="11" rx="1.2" /><rect x="15.6" y="6.5" width="3.2" height="11" rx="1.2" /><rect x="2.4" y="9.3" width="2.8" height="5.4" rx="1.1" /><rect x="18.8" y="9.3" width="2.8" height="5.4" rx="1.1" /><path className="s" d="M8.4 12h7.2" /></>),
  bolt: <path d="M13.2 2.6 5.4 13.3h5.8l-1.4 8.1 8.8-11.6h-6z" />,
  smile: (<><circle cx="12" cy="12" r="9" /><path className="s" d="M8.4 14.1c.9 1.3 2.1 1.9 3.6 1.9s2.7-.6 3.6-1.9M9 9.6v.6M15 9.6v.6" /></>),
  sliders: (<><path className="s" d="M4 7h9.5M18.5 7H20M4 17h3.5M12.5 17H20" /><circle cx="16" cy="7" r="2.4" /><circle cx="10" cy="17" r="2.4" /></>),
  bowl: (<><path d="M3.5 11.2h17c0 4.5-3.8 8.1-8.5 8.1s-8.5-3.6-8.5-8.1z" /><path className="s" d="M9 4.3c-.7.9-.7 1.8 0 2.7M12 3.3c-.7.9-.7 1.8 0 2.7M15 4.3c-.7.9-.7 1.8 0 2.7" /></>),
  pulse: <path className="s" d="M2.5 12.5h4l2.4-6 4.2 12 2.6-6.5h5.8" />,
};

export type IconName = keyof typeof P;

export function Icon({ name, size = 20, strokeWidth = 2, filled = false, variant, style, ...rest }: { name: IconName; size?: number; strokeWidth?: number; filled?: boolean; variant?: 'line' | 'fill' } & SVGProps<SVGSVGElement>) {
  const id = useId().replace(/:/g, '');
  const fill = (variant ?? (filled ? 'fill' : 'line')) === 'fill';
  return (
    <svg className={`ez-icon${fill ? ' ez-icon--fill' : ''}`} width={size} height={size} viewBox="0 0 24 24" fill={fill ? `url(#g${id})` : 'none'} stroke="currentColor" strokeWidth={fill ? Math.min(strokeWidth, 1.6) : strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ width: size, height: size, ...style }} {...rest}>
      {fill && (
        <defs>
          <linearGradient id={`g${id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="currentColor" stopOpacity=".62" />
            <stop offset="1" stopColor="currentColor" stopOpacity="1" />
          </linearGradient>
        </defs>
      )}
      {P[name]}
    </svg>
  );
}

/** Галочка в колі (як у макеті «З'їдено»). */
export function CheckCircle({ size = 20 }: { size?: number }) {
  return (
    <svg className="ez-icon" width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="10" fill="currentColor" />
      <path d="M7.5 12.5l3 3 6-6" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
