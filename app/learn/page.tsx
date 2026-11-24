'use client';
import { AwardWatcher } from '@/components/Awards';
import { useEffect, useState } from 'react';
import { TabBar } from '@/components/TabBar';
import { Icon } from '@/components/Icon';
import { VideoPlayer } from '@/components/VideoPlayer';
import { useRequireProfile } from '@/components/Guard';
import { useLearn } from '@/lib/store';
import { GUIDES, LESSON_BLOCKS, LESSONS, durationLabel, lessonThumb, vimeoEmbed } from '@/lib/lessons';

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
        <header className="ez-header" style={{ paddingTop: 20 }}>
          <h1 className="ez-large-title">Навчання</h1>
          <p className="ez-subhead">Конструктор допомагає скласти тарілку, а уроки — зрозуміти, чому вона збалансована.</p>
        </header>
        {LESSON_BLOCKS.map((b) => (
          <section key={b}>
            <h2 className="ez-headline" style={{ padding: '12px 12px 0' }}>{b}</h2>
            <div className="ez-stack">
              {LESSONS.filter((l) => l.block === b).map((l) => (
                <div key={l.id} id={`l-${l.id}`} className="lesson-card">
                  <button className="lesson-row" style={{ border: 0, textAlign: 'left', cursor: 'pointer', width: '100%' }} onClick={() => setOpen(open === l.id ? null : l.id)} aria-expanded={open === l.id}>
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
                      <span className="ez-headline" style={{ fontSize: 15 }}>{l.title}</span>
                      <span className="ez-caption" style={{ color: 'var(--secondary)' }}>{l.about}</span>
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
        <h2 id="guides" className="ez-headline" style={{ padding: '12px 12px 0' }}>Гайди</h2>
        {/* Гайди — компактним рядком обкладинок, що гортається вбік: головне в «Навчанні» — відео. */}
        <div className="guide-strip">
          {GUIDES.map((g) => (
            <a key={g.file} href={g.file} target="_blank" rel="noopener" onClick={() => markGuide(g.file)} className="guide-card" aria-label={`${g.title}, PDF, ${g.pages} стор.`}>
              <span className="guide-card__cover"><img src={g.cover} alt="" loading="lazy" /></span>
              <span className="guide-card__meta"><Icon name="file" size={13} variant="fill" /> {g.pages} стор.</span>
            </a>
          ))}
        </div>
      </main>
      <AwardWatcher />
      <TabBar />
    </>
  );
}
