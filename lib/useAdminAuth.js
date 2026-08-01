import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from './supabaseClient';

export function useAdminAuth() {
  const router = useRouter();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        router.replace('/admin/login');
      } else {
        setSession(data.session);
      }
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (!newSession) {
        router.replace('/admin/login');
      } else {
        setSession(newSession);
      }
    });

    return () => listener.subscription.unsubscribe();
  }, [router]);

  return { session, loading };
}
