'use client';
import { useState } from 'react';
import { TabBar } from '@/components/TabBar';
import { Icon } from '@/components/Icon';
import { useRequireProfile } from '@/components/Guard';
import { GUIDES, LESSON_BLOCKS, LESSONS } from '@/lib/lessons';

export default function Learn() {
  const { ready } = useRequireProfile();
  const [open, setOpen] = useState<string | null>(null);
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
                <button key={l.id} className="lesson-row" style={{ border: 0, textAlign: 'left', cursor: 'pointer' }} onClick={() => setOpen(open === l.id ? null : l.id)} aria-expanded={open === l.id}>
                  <span className="lesson-row__num"><Icon name="play" size={16} filled /></span>
                  <span className="lesson-row__body">
                    <span className="ez-caption">{l.id === 'intro' ? 'Вступ' : l.id === 'bonus' ? 'Бонус' : `Урок ${l.id}`}</span>
                    <span className="ez-headline" style={{ fontSize: 15 }}>{l.title}</span>
                    {open === l.id && <span className="ez-caption" style={{ color: 'var(--secondary)' }}>{l.about} Відео з’явиться після підключення відеосховища.</span>}
                  </span>
                </button>
              ))}
            </div>
          </section>
        ))}
        <h2 className="ez-headline" style={{ padding: '12px 12px 0' }}>Гайди</h2>
        <div className="ez-stack">
          {GUIDES.map((g) => (
            <div key={g} className="lesson-row">
              <span className="lesson-row__num"><Icon name="file" size={18} /></span>
              <span className="lesson-row__body"><span className="ez-headline" style={{ fontSize: 15 }}>{g}</span><span className="ez-caption">PDF · незабаром</span></span>
            </div>
          ))}
        </div>
      </main>
      <TabBar />
    </>
  );
}
