'use client';
import { useCallback, useEffect, useState } from 'react';
import type { Level, MealKey } from './tree';
import type { Activity, Sex } from './calories';
import type { TrackerData, TrackerDay, TrackerGoals } from './tracker';

/**
 * Етап 1: дані зберігаються лише в браузері (localStorage).
 * На етапі 2 їх замінить Supabase — інтерфейс хуків лишиться тим самим.
 */
export interface Profile {
  name?: string;
  sex: Sex;
  age: number;
  height: number;
  activity: Activity;
  wake: string; // "07:00"
  sleep: string; // "23:00"
  level: Level;
  createdAt: string;
}
export interface Selection {
  stepKey: string;
  stepTitle: string;
  label: string;
  portion?: string;
  group?: string | null;
}
export interface Plate {
  id: string;
  date: string; // YYYY-MM-DD
  meal: MealKey;
  level: Level;
  selections: Selection[];
  /** Застаріле: з 20.11 зібрана тарілка = виконаний прийом їжі, нові тарілки завжди 'eaten'. */
  status: 'planned' | 'eaten';
  favorite: boolean;
  createdAt: string;
}

const KEYS = { profile: 'easy.profile.v1', plates: 'easy.plates.v1', tracker: 'easy.tracker.v1' } as const;

function read<T>(key: string, fallback: T): T {
  try {
    const v = window.localStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
}
function write(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new Event('easy-store'));
  } catch {
    /* приватний режим браузера — дані не збережуться */
  }
}

function useStored<T>(key: string, fallback: T) {
  const [value, setValue] = useState<T>(fallback);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const sync = () => setValue(read(key, fallback));
    sync();
    setReady(true);
    window.addEventListener('easy-store', sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener('easy-store', sync);
      window.removeEventListener('storage', sync);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  const save = useCallback((v: T) => write(key, v), [key]);
  return [value, save, ready] as const;
}

export function useProfile() {
  const [profile, save, ready] = useStored<Profile | null>(KEYS.profile, null);
  return { profile, saveProfile: save, ready };
}

export function usePlates() {
  const [plates, save, ready] = useStored<Plate[]>(KEYS.plates, []);
  const addPlate = (p: Omit<Plate, 'id' | 'createdAt'>) => {
    const plate: Plate = { ...p, id: Math.random().toString(36).slice(2, 10), createdAt: new Date().toISOString() };
    // Одна тарілка на прийом їжі на день: нова замінює попередню (улюблені лишаються).
    const rest = read<Plate[]>(KEYS.plates, []).filter((x) => !(x.date === p.date && x.meal === p.meal && !x.favorite));
    save([...rest, plate]);
    return plate;
  };
  const updatePlate = (id: string, patch: Partial<Plate>) =>
    save(read<Plate[]>(KEYS.plates, []).map((x) => (x.id === id ? { ...x, ...patch } : x)));
  const clearAll = () => {
    write(KEYS.plates, []);
    write(KEYS.tracker, { days: {} });
    write(KEYS.profile, null);
  };
  return { plates, addPlate, updatePlate, clearAll, ready };
}

const EMPTY_TRACKER: TrackerData = { days: {} };

/** Трекер (вода, кроки, тренування, самопочуття). Етап 1 — localStorage, етап 2 — Supabase. */
export function useTracker() {
  const [data, save, ready] = useStored<TrackerData>(KEYS.tracker, EMPTY_TRACKER);
  const current = () => read<TrackerData>(KEYS.tracker, EMPTY_TRACKER);
  const updateDay = (date: string, patch: Partial<TrackerDay>) => {
    const d = current();
    save({ ...d, days: { ...d.days, [date]: { ...d.days[date], ...patch } } });
  };
  const setGoals = (goals: Partial<TrackerGoals> | undefined) => save({ ...current(), goals });
  const startChallenge = (date: string) => { const d = current(); if (!d.challengeStart) save({ ...d, challengeStart: date }); };
  return { data, ready, updateDay, setGoals, startChallenge };
}

export const todayISO = (d = new Date()) => {
  const z = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return z.toISOString().slice(0, 10);
};
