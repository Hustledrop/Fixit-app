// src/auth.js — Supabase auth + profile/usage helpers
//
// AUTH_AVAILABLE is evaluated at Vite BUILD TIME.
// Adding VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY to Vercel and redeploying
// activates auth automatically — no code change needed.

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const AUTH_AVAILABLE = !!(SUPABASE_URL && SUPABASE_KEY);

// Log the baked-in Supabase project URL at startup so every deployment
// prints which project the frontend is connected to.
// Check the browser console → "[FixIt auth] Supabase project: ..."
// and confirm it matches VITE_SUPABASE_URL in your Vercel dashboard.
if (SUPABASE_URL) {
  // Show only the project ref (first subdomain) — not the full URL in case it
  // contains any sensitive information in non-standard deployments.
  const projectRef = SUPABASE_URL.replace('https://', '').split('.')[0];
  console.log(`[FixIt auth] Supabase project: ${projectRef} (${SUPABASE_URL})`);
} else {
  console.warn('[FixIt auth] VITE_SUPABASE_URL not set — running in guest mode');
}

// Promise-based singleton — guarantees createClient() is called exactly once
// even when multiple async callers (React StrictMode double-effect) race on startup.
let _sbPromise = null;
export async function sb() {
  if (!AUTH_AVAILABLE) return null;
  if (!_sbPromise) {
    _sbPromise = (async () => {
      try {
        const { createClient } = await import('@supabase/supabase-js');
        return createClient(SUPABASE_URL, SUPABASE_KEY, {
          auth: { persistSession: true, autoRefreshToken: true },
        });
      } catch (_) { return null; }
    })();
  }
  return _sbPromise;
}

// ── Auth actions ──────────────────────────────────────────────────────────────

export async function getSession() {
  const c = await sb(); if (!c) return null;
  const { data } = await c.auth.getSession();
  return data?.session ?? null;
}

// Returns the current access token (JWT) for the authenticated user.
// Used by checkout.js server-side verification — the server calls
// supabase.auth.getUser(token) to derive user.id from the signed JWT,
// rather than trusting user.id from the request body.
export async function getAccessToken() {
  const c = await sb(); if (!c) return null;
  // Call refreshSession() to ensure the token is always fresh.
  // getSession() only reads from localStorage — if the cached token is expired,
  // diagnose.js gets a stale JWT and Supabase rejects it with "Auth session missing!".
  // refreshSession() exchanges the refresh token for a new access token from the server.
  // Falls back to the cached session if refresh fails (e.g. network error).
  try {
    const { data, error } = await c.auth.refreshSession();
    if (!error && data?.session?.access_token) {
      return data.session.access_token;
    }
  } catch (_) { /* ignore refresh errors — fall back to cached session below */ }
  const session = await getSession();
  return session?.access_token ?? null;
}

export async function signUp(email, password) {
  const c = await sb(); if (!c) throw new Error('auth_unavailable');
  const { data, error } = await c.auth.signUp({ email, password });
  if (error) throw error;
  // Belt-and-suspenders: trigger handles this but belt-and-suspenders ensures rows exist.
  // ignoreDuplicates = INSERT ... ON CONFLICT DO NOTHING — never overwrites is_pro.
  if (data?.user) {
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
  const { data } = c.auth.onAuthStateChange((event, session) => {
    // Pass both the user object AND the event name so callers can detect
    // PASSWORD_RECOVERY, SIGNED_OUT, TOKEN_REFRESHED, etc.
    callback(session?.user ?? null, event);
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
  // Secure server-side RPC — cannot be spoofed or reset by the client.
  // Atomically re-checks is_pro and increments diagnosis_count by exactly 1.
  const { data, error } = await c.rpc('consume_free_diagnosis', { p_user_id: userId });
  if (error) {
    console.error('[auth] consume_free_diagnosis error:', error.message);
    return { allowed: false };
  }
  return data; // { allowed, is_pro, diagnosis_count }
}

// ── Password reset ────────────────────────────────────────────────────────────

// Sends a password reset email. Always resolves (never rejects on user-not-found)
// so callers can show a generic "if that email exists, we sent a link" message.
// redirectTo must match a URL in your Supabase Dashboard → Auth → URL Configuration.
export async function resetPasswordForEmail(email) {
  const c = await sb(); if (!c) throw new Error('auth_unavailable');
  const redirectTo = `${window.location.origin}/?type=recovery`;
  const { error } = await c.auth.resetPasswordForEmail(email.trim(), { redirectTo });
  // Surface config errors but suppress "user not found" to prevent enumeration
  if (error && !error.message?.toLowerCase().includes('not found')) throw error;
}

// Updates the authenticated user's password during a recovery session.
// Must be called while Supabase holds a PASSWORD_RECOVERY session.
export async function updatePassword(newPassword) {
  const c = await sb(); if (!c) throw new Error('auth_unavailable');
  const { error } = await c.auth.updateUser({ password: newPassword });
  if (error) throw error;
}

// ── Restore purchases ─────────────────────────────────────────────────────────
// Called after checkout redirect success and on app resume.
// Re-reads the profile so is_pro reflects the latest webhook state.
export async function restoreProStatus(userId) {
  const profile = await getProfile(userId);
  return {
    is_pro: profile?.is_pro  ?? false,
    plan:   profile?.plan    ?? null,
  };
}
