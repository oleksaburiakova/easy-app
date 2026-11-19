'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useProfile } from '@/lib/store';

/** Без анкети — на привітання. */
export function useRequireProfile() {
  const { profile, ready } = useProfile();
  const router = useRouter();
  useEffect(() => {
    if (ready && !profile) router.replace('/welcome');
  }, [ready, profile, router]);
  return { profile, ready: ready && !!profile };
}
