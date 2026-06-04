// auth.js — Supabase Auth wrapper with graceful degradation
// 
// SETUP REQUIRED (takes ~5 minutes):
// 1. Go to https://supabase.com → New Project
// 2. Settings → API → copy "Project URL" and "anon public" key
// 3. In Vercel: Settings → Environment Variables → add:
//    VITE_SUPABASE_URL    = https://xxxx.supabase.co
//    VITE_SUPABASE_ANON_KEY = eyJhbGci...
// 4. Redeploy. Auth will activate automatically.
//
// WITHOUT those env vars: app works in full guest mode, auth UI shows "unavailable".

const SUPABASE_URL  = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY  = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const AUTH_AVAILABLE = !!(SUPABASE_URL && SUPABASE_KEY);

let _supabase = null;

async function getClient() {
  if (!AUTH_AVAILABLE) return null;
  if (_supabase) return _supabase;
  try {
    const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
    _supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
    return _supabase;
  } catch (_) {
    return null;
  }
}

export async function getSession() {
  const sb = await getClient();
  if (!sb) return null;
  const { data } = await sb.auth.getSession();
  return data?.session ?? null;
}

export async function signUp(email, password) {
  const sb = await getClient();
  if (!sb) throw new Error('auth_unavailable');
  const { data, error } = await sb.auth.signUp({ email, password });
  if (error) throw error;
  return data;
}

export async function signIn(email, password) {
  const sb = await getClient();
  if (!sb) throw new Error('auth_unavailable');
  const { data, error } = await sb.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const sb = await getClient();
  if (!sb) return;
  await sb.auth.signOut();
}

export async function onAuthStateChange(callback) {
  const sb = await getClient();
  if (!sb) return () => {};
  const { data } = sb.auth.onAuthStateChange((_event, session) => {
    callback(session?.user ?? null);
  });
  return data.subscription.unsubscribe;
}
