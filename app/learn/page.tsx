'use client';
import Link from 'next/link';
import { AwardWatcher } from '@/components/Awards';
import { useEffect, useState } from 'react';
import { TabBar } from '@/components/TabBar';
import { Icon } from '@/components/Icon';
import { VideoPlayer } from '@/components/VideoPlayer';
import { useRequireProfile } from '@/components/Guard';
import { useLearn } from '@/lib/store';
import { GUIDES, LESSON_BLOCKS, LESSONS, guideSlug, durationLabel, lessonThumb, vimeoEmbed } from '@/lib/lessons';

export default function Learn() {
  const { ready } = useRequireProfile();
  const [open, setOpen] = useState<string | null>(null);
  const { markLesson, markGuide } = useLearn();
  useEffect(() => { if (open) markLesson(open); }, [open]); // eslint-disable-line react-hooks/exhaustive-deps
  // Посилання з порад: /learn#l-2.4 — відкриваємо й прокручуємо до потрібного уроку.
  useEffect(() => {
    if (!ready) return;
    const id = decodeURIComponent(window.location.hash.replace(/^#l-/, ''));
    if (!id || !LESSONS.some((l) => l.id === id)) return;
    setOpen(id);
    requestAnimationFrame(() => document.getElementById(`l-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  }, [ready]);
  if (!ready) return null;
  return (
    <>
      <main className="app-main fade-in">
        <header className="ez-header page-head">
          <h1 className="ez-large-title">Навчання</h1>
          <p className="ez-subhead">Конструктор допомагає скласти тарілку, а уроки — зрозуміти, чому вона збалансована.</p>
        </header>
        {LESSON_BLOCKS.map((b) => (
          <section key={b}>
            <h2 className="ez-headline section-title">{b}</h2>
            <div className="ez-stack">
              {LESSONS.filter((l) => l.block === b).map((l) => (
                <div key={l.id} id={`l-${l.id}`} className="lesson-card">
                  <button className="lesson-row lesson-row--btn" onClick={() => setOpen(open === l.id ? null : l.id)} aria-expanded={open === l.id}>
                    {open !== l.id ? (
                      // Без обкладинки у Vimeo — маскот на рожевому тлі, щоб ряд виглядав так само.
                      <span className={`lesson-thumb${lessonThumb(l) ? '' : ' lesson-thumb--empty'}`}>
                        <img src={lessonThumb(l) ?? '/mascot/easy-bot-still.webp'} alt="" loading="lazy" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                        <span className="lesson-thumb__play"><Icon name="play" size={14} filled /></span>
                      </span>
                    ) : (
                      <span className="lesson-row__num"><Icon name="play" size={16} filled /></span>
                    )}
                    <span className="lesson-row__body">
                      <span className="ez-caption">{[l.id === 'intro' ? 'Вступ' : l.id === 'bonus' ? 'Бонус' : `Урок ${l.id}`, durationLabel(l.sec)].filter(Boolean).join(' · ')}</span>
                      <span className="ez-headline ez-headline--xs">{l.title}</span>
                      <span className="ez-caption c-secondary">{l.about}</span>
                    </span>
                  </button>
                  {open === l.id && (
                    <div className="lesson-player">
                      {l.vimeo ? (
                        <VideoPlayer src={vimeoEmbed(l.vimeo)} title={l.title} />
                      ) : null}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        ))}
        <h2 id="guides" className="ez-headline section-title">Гайди</h2>
        {/* Гайди — компактним рядком обкладинок, що гортається вбік: головне в «Навчанні» — відео. */}
        <div className="guide-strip">
          {GUIDES.map((g) => (
            <div key={g.file} className="guide-card">
              <Link href={`/guide/${guideSlug(g)}`} onClick={() => markGuide(g.file)} className="guide-card__open" aria-label={`Відкрити: ${g.title}, ${g.pages} стор.`}>
                <span className="guide-card__cover"><img src={g.cover} alt="" loading="lazy" /></span>
              </Link>
              <span className="guide-card__row">
                <span className="guide-card__meta"><Icon name="file" size={13} variant="fill" /> {g.pages} стор.</span>
                {/* Завантажити PDF собі (на iPhone — у «Файли»). */}
                <a href={g.file} download={`Easy-${g.file.split('/').pop()}`} onClick={() => markGuide(g.file)} className="guide-card__dl" aria-label={`Завантажити: ${g.title}`}>
                  <Icon name="download" size={15} strokeWidth={2.4} />
                </a>
              </span>
            </div>
          ))}
        </div>
      </main>
      <AwardWatcher />
      <TabBar />
    </>
  );
}
