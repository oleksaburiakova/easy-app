'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icon, type IconName } from './Icon';

const TABS: { href: string; label: string; icon: IconName }[] = [
  { href: '/', label: 'Головна', icon: 'home' },
  { href: '/history', label: 'Історія', icon: 'chart' },
  { href: '/learn', label: 'Навчання', icon: 'cap' },
  { href: '/profile', label: 'Профіль', icon: 'user' },
];

export function TabBar() {
  const path = usePathname();
  const active = (h: string) => (h === '/' ? path === '/' : path.startsWith(h));
  return (
    <div className="tabbar-wrap">
      <nav className="ez-tabs" aria-label="Головне меню">
        {TABS.map((t) => (
          <Link key={t.href} href={t.href} className="ez-tab" aria-current={active(t.href) ? 'page' : undefined}>
            <Icon name={t.icon} size={22} />
            {t.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
