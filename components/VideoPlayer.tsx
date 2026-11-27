'use client';
import { useEffect, useRef } from 'react';
import { Icon } from '@/components/Icon';

type OrientationLock = ScreenOrientation & { lock?: (o: 'landscape') => Promise<void> };

/**
 * Плеєр Vimeo з кнопкою «На весь екран».
 * Android / комп'ютер: повноекранний режим для блоку з відео + горизонтальна орієнтація.
 * iPhone (немає Fullscreen API для блоків): просимо плеєр Vimeo відкрити власний повноекранний
 * режим — це системний плеєр iOS, він повертається разом із телефоном.
 */
export function VideoPlayer({ src, title }: { src: string; title: string }) {
  const box = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLIFrameElement>(null);

  // Повноекранний режим (і з нашої кнопки, і з кнопки плеєра) — повертаємо екран горизонтально.
  useEffect(() => {
    const onChange = () => {
      const o = screen.orientation as OrientationLock | undefined;
      if (document.fullscreenElement) o?.lock?.('landscape').catch(() => {});
      else o?.unlock?.();
    };
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  const fullscreen = () => {
    const el = box.current;
    if (el && document.fullscreenEnabled && el.requestFullscreen) {
      el.requestFullscreen().catch(() => vimeoFullscreen());
    } else {
      vimeoFullscreen();
    }
  };
  const vimeoFullscreen = () => {
    const w = frame.current?.contentWindow;
    w?.postMessage(JSON.stringify({ method: 'play' }), 'https://player.vimeo.com');
    w?.postMessage(JSON.stringify({ method: 'requestFullscreen' }), 'https://player.vimeo.com');
  };

  return (
    <div className="gap-3">
      <div className="video-frame" ref={box}>
        <iframe ref={frame} src={src} title={title} allow="autoplay; fullscreen; picture-in-picture" allowFullScreen loading="lazy" />
      </div>
      <button type="button" className="ez-btn ez-btn--soft ez-btn--sm self-start" onClick={fullscreen}>
        <Icon name="expand" size={16} /> На весь екран
      </button>
    </div>
  );
}
