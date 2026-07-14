// src/auth.js — Supabase auth + profile/usage layer
// Gracefully degrades to guest mode when env vars are missing.
//
// SETUP (5 minutes):
//  1. supabase.com → New Project → Settings → API
//  2. Copy "Project URL" → VITE_SUPABASE_URL
//  3. Copy "anon public" key → VITE_SUPABASE_ANON_KEY
//  4. Copy "service_role" key → SUPABASE_SERVICE_ROLE_KEY (server-only)
//  5. Run supabase-setup.sql in Supabase SQL Editor
//  6. Redeploy on Vercel — auth activates automatically

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// AUTH_AVAILABLE is evaluated at BUILD TIME by Vite.
// When env vars are set in Vercel and app is rebuilt → AUTH_AVAILABLE = true.
export const AUTH_AVAILABLE = !!(SUPABASE_URL && SUPABASE_KEY);

let _sb = null;

async function sb() {
  if (!AUTH_AVAILABLE) return null;
  if (_sb) return _sb;
  try {
    const { createClient } = await import('@supabase/supabase-js');
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
  // Ensure profile + usage rows exist (trigger handles this, but belt-and-suspenders)
  if (data?.user) {
    // Belt-and-suspenders: trigger handles this, but we ensure rows exist.
    // ignoreDuplicates=true = INSERT ... ON CONFLICT DO NOTHING (never overwrites is_pro).
    await c.from('profiles').insert({
      id: data.user.id, email: data.user.email,
      is_pro: false, created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    }, { ignoreDuplicates: true });
    await c.from('usage').insert({
      user_id: data.user.id, diagnosis_count: 0, free_limit: 1,
      updated_at: new Date().toISOString(),
    }, { ignoreDuplicates: true });
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

// ── Profile / usage ───────────────────────────────────────────────────────────

export async function getProfile(userId) {
  const c = await sb(); if (!c || !userId) return null;
  const { data } = await c.from('profiles').select('*').eq('id', userId).single();
  return data;
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

export async function incrementUsage(userId) {
  const c = await sb(); if (!c || !userId) return { allowed: false };
  // Use secure server-side RPC — prevents client from resetting or spoofing count.
  // consume_free_diagnosis() re-checks is_pro and increments atomically.
  const { data, error } = await c.rpc('consume_free_diagnosis', { p_user_id: userId });
  if (error) {
    console.error('[auth] consume_free_diagnosis error:', error.message);
    return { allowed: false };
  }
  return data; // { allowed, is_pro, diagnosis_count }
}
