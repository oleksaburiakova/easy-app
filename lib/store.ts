'use client';
import { useSyncExternalStore } from 'react';
import type { Session } from '@supabase/supabase-js';
import type { Level, MealKey } from './tree';
import type { Activity, Sex } from './calories';
import { supabase, supabaseConfigured } from './supabase';

/**
 * Етап 2: дані користувача — у Supabase (таблиці profiles і plates, див. supabase/migrations).
 * Хуки мають той самий вигляд, що й на етапі 1: екрани нічого не знають про базу.
 * Зміни застосовуються одразу на екрані, а потім записуються в базу;
 * якщо запис не вдався — дані перечитуються з бази.
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
  status: 'planned' | 'eaten';
  favorite: boolean;
  createdAt: string;
}

// ---------- стан у пам'яті ----------

interface State {
  authReady: boolean; // відомо, чи увійшла людина
  session: Session | null;
  dataReady: boolean; // профіль і тарілки завантажені
  profile: Profile | null;
  plates: Plate[];
  error: string | null;
}
const initial: State = { authReady: false, session: null, dataReady: false, profile: null, plates: [], error: null };
let state: State = initial;
let loadedUser: string | null = null;
const listeners = new Set<() => void>();

function set(patch: Partial<State>) {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
}

let started = false;
function start() {
  if (started || typeof window === 'undefined') return;
  started = true;
  if (!supabaseConfigured) {
    set({ authReady: true, dataReady: true });
    return;
  }
  supabase().auth.onAuthStateChange((_event, session) => {
    const uid = session?.user.id ?? null;
    set({ session, authReady: true, ...(uid !== loadedUser ? { dataReady: !uid, profile: null, plates: [] } : {}) });
    if (uid !== loadedUser) {
      loadedUser = uid;
      // Не викликати Supabase всередині цього обробника — лише після нього.
      if (uid) setTimeout(() => void load(uid), 0);
    }
  });
}

function subscribe(l: () => void) {
  start();
  listeners.add(l);
  return () => listeners.delete(l);
}
const useStore = () => useSyncExternalStore(subscribe, () => state, () => initial);

// ---------- база ----------

type ProfileRow = {
  name: string | null; sex: Sex; age: number; height: number; activity: Activity;
  wake: string; sleep: string; level: Level; created_at: string;
};
type PlateRow = {
  id: string; date: string; meal: MealKey; level: Level; selections: Selection[];
  status: 'planned' | 'eaten'; favorite: boolean; created_at: string;
};

const fromProfile = (r: ProfileRow): Profile => ({
  name: r.name ?? undefined, sex: r.sex, age: r.age, height: r.height, activity: r.activity,
  wake: r.wake, sleep: r.sleep, level: r.level, createdAt: r.created_at,
});
const toProfile = (uid: string, p: Profile) => ({
  id: uid, name: p.name ?? null, sex: p.sex, age: p.age, height: p.height, activity: p.activity,
  wake: p.wake, sleep: p.sleep, level: p.level, created_at: p.createdAt, updated_at: new Date().toISOString(),
});
const fromPlate = (r: PlateRow): Plate => ({
  id: r.id, date: r.date, meal: r.meal, level: r.level, selections: r.selections ?? [],
  status: r.status, favorite: r.favorite, createdAt: r.created_at,
});
const toPlate = (uid: string, p: Plate) => ({
  id: p.id, user_id: uid, date: p.date, meal: p.meal, level: p.level, selections: p.selections,
  status: p.status, favorite: p.favorite, created_at: p.createdAt,
});

async function load(uid: string) {
  const db = supabase();
  const [pr, pl] = await Promise.all([
    db.from('profiles').select('*').eq('id', uid).maybeSingle(),
    db.from('plates').select('*').order('date', { ascending: true }).order('created_at', { ascending: true }),
  ]);
  if (loadedUser !== uid) return; // за цей час людина вийшла чи змінила акаунт
  if (pr.error || pl.error) {
    set({ dataReady: true, error: 'Не вдалося завантажити дані. Перевірте інтернет і оновіть сторінку.' });
    console.error(pr.error ?? pl.error);
    return;
  }
  let profile = pr.data ? fromProfile(pr.data as ProfileRow) : null;
  let plates = (pl.data as PlateRow[]).map(fromPlate);
  if (!profile) {
    const moved = await moveLocalData(uid);
    if (moved) ({ profile, plates } = moved);
  }
  set({ profile, plates, dataReady: true, error: null });
}

/** Тестувальники етапу 1: анкета й тарілки з цього браузера переїжджають у новий акаунт. */
const OLD_KEYS = { profile: 'easy.profile.v1', plates: 'easy.plates.v1' } as const;
async function moveLocalData(uid: string): Promise<{ profile: Profile; plates: Plate[] } | null> {
  try {
    const raw = window.localStorage.getItem(OLD_KEYS.profile);
    if (!raw) return null;
    const profile = JSON.parse(raw) as Profile;
    const oldPlates = JSON.parse(window.localStorage.getItem(OLD_KEYS.plates) ?? '[]') as Plate[];
    const plates = oldPlates.map((p) => ({ ...p, id: crypto.randomUUID() }));
    const db = supabase();
    const a = await db.from('profiles').upsert(toProfile(uid, profile));
    if (a.error) throw a.error;
    if (plates.length) {
      const b = await db.from('plates').insert(plates.map((p) => toPlate(uid, p)));
      if (b.error) throw b.error;
    }
    window.localStorage.removeItem(OLD_KEYS.profile);
    window.localStorage.removeItem(OLD_KEYS.plates);
    return { profile, plates };
  } catch (e) {
    console.error('Перенесення локальних даних не вдалося', e);
    return null;
  }
}

/** Записати в базу; якщо не вдалося — показати помилку й перечитати дані. */
async function persist(op: () => PromiseLike<{ error: unknown }>) {
  const { error } = await op();
  if (error) {
    console.error(error);
    set({ error: 'Зміни не збереглися. Перевірте інтернет і спробуйте ще раз.' });
    if (loadedUser) await load(loadedUser);
  }
}

function uid() {
  const id = state.session?.user.id;
  if (!id) throw new Error('Потрібно увійти');
  return id;
}

// ---------- хуки (той самий вигляд, що на етапі 1) ----------

export function useAuth() {
  const s = useStore();
  return {
    session: s.session,
    email: s.session?.user.email ?? null,
    ready: s.authReady,
    configured: supabaseConfigured,
    signOut: async () => {
      await supabase().auth.signOut();
    },
  };
}

export function useProfile() {
  const s = useStore();
  const saveProfile = (p: Profile) => {
    const id = uid();
    set({ profile: p });
    void persist(() => supabase().from('profiles').upsert(toProfile(id, p)));
  };
  return { profile: s.profile, saveProfile, ready: s.authReady && s.dataReady };
}

export function usePlates() {
  const s = useStore();
  const addPlate = (p: Omit<Plate, 'id' | 'createdAt'>) => {
    const id = uid();
    const plate: Plate = { ...p, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
    // Один план на прийом їжі на день: нова тарілка замінює попередню заплановану.
    const isOldPlan = (x: Plate) => x.date === p.date && x.meal === p.meal && x.status === 'planned';
    set({ plates: [...state.plates.filter((x) => !isOldPlan(x)), plate] });
    void persist(async () => {
      const del = await supabase().from('plates').delete().eq('date', p.date).eq('meal', p.meal).eq('status', 'planned');
      if (del.error) return del;
      return supabase().from('plates').insert(toPlate(id, plate));
    });
    return plate;
  };
  const updatePlate = (plateId: string, patch: Partial<Plate>) => {
    set({ plates: state.plates.map((x) => (x.id === plateId ? { ...x, ...patch } : x)) });
    const row: Record<string, unknown> = {};
    if (patch.status !== undefined) row.status = patch.status;
    if (patch.favorite !== undefined) row.favorite = patch.favorite;
    if (patch.selections !== undefined) row.selections = patch.selections;
    if (patch.date !== undefined) row.date = patch.date;
    void persist(() => supabase().from('plates').update(row).eq('id', plateId));
  };
  return { plates: s.plates, addPlate, updatePlate, ready: s.authReady && s.dataReady };
}

/** Повідомлення про помилку синхронізації (показується тостом у Guard). */
export function useSyncError() {
  const s = useStore();
  return { error: s.error, dismiss: () => set({ error: null }) };
}

export const todayISO = (d = new Date()) => {
  const z = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return z.toISOString().slice(0, 10);
};
