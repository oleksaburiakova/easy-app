'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Icon } from '@/components/Icon';
import { useRequireProfile } from '@/components/Guard';
import { useLearn } from '@/lib/store';
import { GUIDES, guideSlug } from '@/lib/lessons';

/**
 * Перегляд гайду всередині Easy (рішення 24.11): у відкритому PDF не було кнопок — ні завантажити, ні повернутися
 * (особливо у встановленому застосунку на iPhone). Сторінки — зображення з PDF (public/guides/pages/<name>/<n>.webp),
 * зверху скляна панель «Назад» і «Завантажити».
 * «Завантажити»: де можна — системне «Поділитися» з самим PDF-файлом (на iPhone там «Зберегти у Файли»), інакше — звичайне завантаження.
 */
export default function GuideView() {
  const { name } = useParams<{ name: string }>();
  const router = useRouter();
  const { ready } = useRequireProfile();
  const { markGuide } = useLearn();
  const [busy, setBusy] = useState(false);
  const g = GUIDES.find((x) => guideSlug(x) === name);
  if (!ready) return null;
  if (!g) return <main className="app-main empty">Гайд не знайдено. <Link className="link" href="/learn">До навчання</Link></main>;

  const fileName = `Easy-${guideSlug(g)}.pdf`;
  const download = async () => {
    markGuide(g.file);
    setBusy(true);
    try {
      const blob = await (await fetch(g.file)).blob();
      const file = new File([blob], fileName, { type: 'application/pdf' });
      const nav = navigator as Navigator & { canShare?: (d: { files: File[] }) => boolean };
      if (nav.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: g.title });
      } else {
        const url = URL.createObjectURL(blob);
        const a = Object.assign(document.createElement('a'), { href: url, download: fileName });
        document.body.appendChild(a); a.click(); a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 4000);
      }
    } catch { /* людина закрила «Поділитися» — нічого страшного */ }
    setBusy(false);
  };

  return (
    <main className="app-main guide-view" style={{ paddingBottom: 40 }}>
      <nav className="guide-view__bar" aria-label="Навігація">
        <button className="ez-nav__back" onClick={() => (history.length > 1 ? router.back() : router.push('/learn'))}><Icon name="back" size={18} /> Назад</button>
        <span className="guide-view__title">{g.title}</span>
        <button className="guide-view__dl" onClick={download} disabled={busy} aria-label={`Завантажити: ${g.title}`}>
          <Icon name="download" size={18} strokeWidth={2.4} /> {busy ? '…' : 'Завантажити'}
        </button>
      </nav>
      <div className="guide-view__pages">
        {Array.from({ length: g.pages }, (_, i) => (
          <img key={i} src={`/guides/pages/${guideSlug(g)}/${i + 1}.webp`} alt={i === 0 ? g.title : ''} loading={i < 2 ? 'eager' : 'lazy'} width={780} height={1690} />
        ))}
      </div>
    </main>
  );
}
