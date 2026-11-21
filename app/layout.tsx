import type { Metadata, Viewport } from 'next';
import '@/styles/tokens.css';
import '@/styles/components.css';
import '@/styles/app.css';
import '@/styles/glass.css';

export const metadata: Metadata = {
  title: 'Easy — конструктор здорового харчування',
  description: 'Збалансована тарілка з того, що є вдома. Конструктор нутриціолога Олени Гаврилової.',
  manifest: '/manifest.webmanifest',
  appleWebApp: { capable: true, title: 'Easy', statusBarStyle: 'default' },
  icons: { icon: [{ url: '/icons/favicon-32.png', sizes: '32x32' }, { url: '/icons/favicon-48.png', sizes: '48x48' }, { url: '/icons/icon-192.png', sizes: '192x192' }], apple: '/icons/apple-touch-icon.png' },
};

export const viewport: Viewport = {
  themeColor: '#ffffff',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uk">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Cormorant+Garamond:wght@300;400&family=Great+Vibes&display=swap" />
      </head>
      <body>
        <div className="app">{children}</div>
      </body>
    </html>
  );
}
