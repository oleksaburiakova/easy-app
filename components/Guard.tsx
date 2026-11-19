'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useProfile, useSyncError } from '@/lib/store';

/** Без входу — на привітання. */
export function useRequireAuth() {
  const { session, ready } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (ready && !session) router.replace('/welcome');
  }, [ready, session, router]);
  return { ready: ready && !!session };
}

/** Без входу — на привітання; без анкети — на анкету. */
export function useRequireProfile() {
  const { session, ready: authReady } = useAuth();
  const { profile, ready } = useProfile();
  const router = useRouter();
  useEffect(() => {
    if (authReady && !session) router.replace('/welcome');
    else if (ready && session && !profile) router.replace('/onboarding');
  }, [authReady, ready, session, profile, router]);
  return { profile, ready: ready && !!session && !!profile };
}

/** Тост, якщо зміни не записалися в базу. */
export function SyncToast() {
  const { error, dismiss } = useSyncError();
  useEffect(() => {
    if (!error) return;
    const t = setTimeout(dismiss, 5000);
    return () => clearTimeout(t);
  }, [error, dismiss]);
  return error ? <div className="toast" role="alert" onClick={dismiss}>{error}</div> : null;
}
