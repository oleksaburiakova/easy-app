'use client';
import { useEffect, useState } from 'react';
import { TabBar } from '@/components/TabBar';
import { Icon } from '@/components/Icon';
import { VideoPlayer } from '@/components/VideoPlayer';
import { useRequireProfile } from '@/components/Guard';
import { GUIDES, LESSON_BLOCKS, LESSONS, durationLabel, lessonThumb, vimeoEmbed } from '@/lib/lessons';

export default function Learn() {
  const { ready } = useRequireProfile();
  const [open, setOpen] = useState<string | null>(null);
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
                    {lessonThumb(l) && open !== l.id ? (
                      <span className="lesson-thumb">
                        <img src={lessonThumb(l)!} alt="" loading="lazy" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                        <span className="lesson-thumb__play"><Icon name="play" size={11} filled /></span>
                      </span>
                    ) : (
                      <span className="lesson-row__num"><Icon name="play" size={16} filled /></span>
                    )}
                    <span className="lesson-row__body">
                      <span className="ez-caption">{[l.id === 'intro' ? 'Вступ' : l.id === 'bonus' ? 'Бонус' : `Урок ${l.id}`, durationLabel(l.sec)].filter(Boolean).join(' · ')}</span>
                      <span className="ez-headline" style={{ fontSize: 15 }}>{l.title}</span>
                    </span>
                  </button>
                  {open === l.id && (
                    <div className="lesson-player">
                      {l.vimeo ? (
                        <VideoPlayer src={vimeoEmbed(l.vimeo)} title={l.title} />
                      ) : null}
                      <p className="ez-caption" style={{ color: 'var(--secondary)', margin: 0 }}>{l.about}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        ))}
        <h2 id="guides" className="ez-headline" style={{ padding: '12px 12px 0' }}>Гайди</h2>
        <div className="ez-stack">
          {GUIDES.map((g) => (
            <a key={g.file} href={g.file} target="_blank" rel="noopener" className="lesson-row">
              <span className="lesson-row__num"><Icon name="file" size={18} /></span>
              <span className="lesson-row__body"><span className="ez-headline" style={{ fontSize: 15 }}>{g.title}</span><span className="ez-caption">PDF · {g.pages} стор.</span></span>
            </a>
          ))}
        </div>
      </main>
      <TabBar />
    </>
  );
}
