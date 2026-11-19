import type { ReactElement, SVGProps } from 'react';

const P: Record<string, ReactElement> = {
  chev: <path d="M9 6l6 6-6 6" />,
  back: <path d="M15 18l-6-6 6-6" />,
  check: <path d="M5 12l5 5L20 7" />,
  sun: (<><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></>),
  fork: <path d="M7 3v8a2 2 0 0 0 2 2v8M11 3v8M3 3v8a2 2 0 0 0 2 2M17 3c-1.7 0-3 2-3 5s1.3 4 3 4v9" />,
  moon: <path d="M21 13A9 9 0 1 1 11 3a7 7 0 0 0 10 10z" />,
  plus: <path d="M12 5v14M5 12h14" />,
  clock: (<><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>),
  heart: <path d="M12 21s-7-4.4-9.3-9A5.2 5.2 0 0 1 12 6a5.2 5.2 0 0 1 9.3 6c-2.3 4.6-9.3 9-9.3 9z" />,
  book: <path d="M6 3h12v18l-6-4-6 4z" />,
  home: <path d="M3 11l9-8 9 8v10H3z" />,
  plate: (<><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /></>),
  chart: <path d="M5 20V10M12 20V4M19 20v-7" />,
  cap: (<><path d="M2 9l10-5 10 5-10 5z" /><path d="M6 11v5c3 2 9 2 12 0v-5" /></>),
  user: (<><circle cx="12" cy="8" r="4" /><path d="M4 21c1-4 4-6 8-6s7 2 8 6" /></>),
  leaf: (<><path d="M5 19c0-8 6-14 14-14 0 8-6 14-14 14z" /><path d="M5 19l7-7" /></>),
  play: <path d="M8 5l11 7-11 7z" />,
  file: (<><path d="M6 3h8l4 4v14H6z" /><path d="M14 3v4h4" /></>),
  expand: <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />,
  redo: (<><path d="M20 12a8 8 0 1 1-2.3-5.7" /><path d="M20 4v5h-5" /></>),
};

export type IconName = keyof typeof P;

export function Icon({ name, size = 20, strokeWidth = 2, filled = false, ...rest }: { name: IconName; size?: number; strokeWidth?: number; filled?: boolean } & SVGProps<SVGSVGElement>) {
  return (
    <svg className="ez-icon" width={size} height={size} viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...rest}>
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
