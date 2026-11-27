'use client';
import Link from 'next/link';
import { useMemo } from 'react';
import { Icon } from './Icon';
import { Sheet } from './Sheet';
import { useAwardsSeen, useLearn, usePlates, useProfile, useTracker, todayISO } from '@/lib/store';
import { AWARDS, earnedAwards, visibleAwards, type Award } from '@/lib/awards';

/** Отримані нагороди з поточних даних. */
export function useAwards() {
  const { profile } = useProfile();
  const { plates, ready: pr } = usePlates();
  const { data: tracker, ready: tr } = useTracker();
  const { learn, ready: lr } = useLearn();
  const ready = pr && tr && lr && !!profile;
  const earned = useMemo(() => (profile ? earnedAwards(profile, plates, tracker, learn, todayISO()) : new Set<string>()), [profile, plates, tracker, learn]);
  const list = profile ? visibleAwards(profile) : AWARDS;
  return { earned, list, ready };
}

/** Медаль: об'ємне золоте коло з іконкою нагороди (сіре — ще не отримана). */
export function Medal({ award, earned, size = 56 }: { award: Award; earned: boolean; size?: number }) {
  return (
    <span className={`medal${earned ? '' : ' medal--off'}`} style={{ width: size, height: size }} aria-hidden="true">
      <Icon name={award.icon} size={Math.round(size * 0.46)} variant="fill" />
    </span>
  );
}

/**
 * Аркуш «Нова нагорода» — показується один раз на нагороду (на цьому пристрої).
 * Якщо нових кілька (напр. після оновлення) — показуємо першу й кажемо, скільки ще.
 */
export function AwardWatcher() {
  const { earned, list, ready } = useAwards();
  const { seen, ready: sr, markSeen } = useAwardsSeen();
  if (!ready || !sr) return null;
  const fresh = list.filter((a) => earned.has(a.id) && !seen.includes(a.id));
  if (!fresh.length) return null;
  const a = fresh[0];
  const close = () => markSeen(fresh.map((x) => x.id));
  return (
    <Sheet title="Нова нагорода!" onClose={close}>
      <div className="award-new">
        <img className="award-new__bot" src="/mascot/easy-bot-avatar.webp" alt="" width={96} height={96} />
        <Medal award={a} earned size={88} />
      </div>
      <p className="award-new__title">{a.title}</p>
      <p className="award-new__praise">{a.praise}</p>
      {fresh.length > 1 && <p className="ez-hint center m-0">І ще {fresh.length - 1} — у «Моїх досягненнях».</p>}
      <div className="ez-pair">
        <Link className="ez-btn ez-btn--soft" href="/achievements" onClick={close}>Усі нагороди</Link>
        <button className="ez-btn ez-btn--primary" onClick={close}>Дякую!</button>
      </div>
    </Sheet>
  );
}
