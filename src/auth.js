// auth.js — Supabase Auth + profile wrapper with full graceful degradation
//
// SETUP (5 minutes):
// 1. https://supabase.com → New Project
// 2. Settings → API → copy "Project URL" and "anon public" key
// 3. Vercel → Environment Variables:
//    VITE_SUPABASE_URL      = https://xxxx.supabase.co
//    VITE_SUPABASE_ANON_KEY = eyJhbGci...
// 4. Run the SQL in /supabase-setup.sql in Supabase → SQL Editor
// 5. Redeploy → auth activates automatically
//
// WITHOUT env vars: app runs in full guest mode, auth calls are no-ops.

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const AUTH_AVAILABLE = !!(SUPABASE_URL && SUPABASE_KEY);

let _sb = null;

async function sb() {
  if (!AUTH_AVAILABLE) return null;
  if (_sb) return _sb;
  try {
    const { createClient } = await import(
      'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'
    );
    _sb = createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: { persistSession: true, autoRefreshToken: true },
    });
    return _sb;
  } catch (_) { return null; }
}

// ── Auth actions ──────────────────────────────────────────────────────────────

export async function getSession() {
  const c = await sb(); if (!c) return null;
  const { data } = await c.auth.getSession();
  return data?.session ?? null;
}

export async function signUp(email, password) {
  const c = await sb(); if (!c) throw new Error('auth_unavailable');
  const { data, error } = await c.auth.signUp({ email, password });
  if (error) throw error;
  // Create profile row immediately
  if (data?.user) {
    await c.from('profiles').upsert({
      id: data.user.id,
      email: data.user.email,
      is_pro: false,
      plan: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }, { onConflict: 'id' });
    await c.from('usage').upsert({
      user_id: data.user.id,
      diagnosis_count: 0,
      free_limit: 1,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' });
  }
  return data;
}

export async function signIn(email, password) {
  const c = await sb(); if (!c) throw new Error('auth_unavailable');
  const { data, error } = await c.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const c = await sb(); if (!c) return;
  await c.auth.signOut();
}

export async function onAuthStateChange(callback) {
  const c = await sb(); if (!c) return () => {};
  const { data } = c.auth.onAuthStateChange((_event, session) => {
    callback(session?.user ?? null);
  });
  return () => data.subscription.unsubscribe();
}

// ── Profile / usage queries ───────────────────────────────────────────────────

export async function getProfile(userId) {
  const c = await sb(); if (!c || !userId) return null;
  const { data } = await c.from('profiles').select('*').eq('id', userId).single();
  return data;
}

export async function incrementUsage(userId) {
  // Returns { allowed: bool, diagnosis_count: int, is_pro: bool }
  const c = await sb(); if (!c || !userId) return { allowed: false };
  const profile = await getProfile(userId);
  if (profile?.is_pro) return { allowed: true, is_pro: true };

  const { data: usage } = await c
    .from('usage')
    .select('*')
    .eq('user_id', userId)
    .single();

  const count = usage?.diagnosis_count ?? 0;
  const limit = usage?.free_limit ?? 1;

  if (count >= limit) return { allowed: false, diagnosis_count: count };

  // Increment
  await c.from('usage').upsert({
    user_id: userId,
    diagnosis_count: count + 1,
    free_limit: limit,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'user_id' });

  return { allowed: true, diagnosis_count: count + 1 };
}

export async function checkUsage(userId) {
  const c = await sb(); if (!c || !userId) return null;
  const profile = await getProfile(userId);
  if (profile?.is_pro) return { allowed: true, is_pro: true };
  const { data: usage } = await c.from('usage').select('*').eq('user_id', userId).single();
  const count = usage?.diagnosis_count ?? 0;
  const limit = usage?.free_limit ?? 1;
  return { allowed: count < limit, diagnosis_count: count, is_pro: false };
}
