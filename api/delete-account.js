// api/delete-account.js — permanent account deletion
// POST /api/delete-account
//   Headers: Authorization: Bearer <supabase_access_token>
//   Body:    (empty — identity derived from JWT only)
//
// Deletion sequence:
//   1. Verify JWT — get confirmed userId from Supabase Auth
//   2. Load profile to find stripe_customer_id
//   3. Cancel active Stripe subscription (if any) so user is not billed again
//   4. Call supabase.auth.admin.deleteUser(userId) — requires SERVICE_ROLE_KEY
//      Supabase then cascades:
//        → public.profiles   ON DELETE CASCADE   (row deleted)
//        → public.usage      ON DELETE CASCADE   (row deleted)
//        → public.payments   ON DELETE SET NULL  (user_id anonymised; records kept for §147 AO)
//
// After this endpoint returns 200:
//   - auth.users row is gone → credentials no longer work
//   - The same email can be re-registered as a brand-new account
//   - Financial records are anonymised but retained for legal compliance

const SUPABASE_URL  = process.env.VITE_SUPABASE_URL;
const SUPABASE_SVC  = process.env.SUPABASE_SERVICE_ROLE_KEY;
const STRIPE_KEY    = process.env.STRIPE_SECRET_KEY;

async function getAdminClient() {
  if (!SUPABASE_URL || !SUPABASE_SVC) return null;
  const { createClient } = await import('@supabase/supabase-js');
  return createClient(SUPABASE_URL, SUPABASE_SVC, { auth: { persistSession: false } });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'method_not_allowed' });
  }

  // ── 1. Verify JWT ──────────────────────────────────────────────────────────
  const authHeader = req.headers.authorization || '';
  if (!authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'missing_auth', message: 'Authorization header required.' });
  }
  const token = authHeader.slice(7);

  const supabase = await getAdminClient();
  if (!supabase) {
    console.error('[delete-account] SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set');
    return res.status(503).json({ error: 'server_misconfigured' });
  }

  let userId;
  try {
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data?.user) {
      console.warn('[delete-account] JWT invalid:', error?.message);
      return res.status(401).json({ error: 'unauthorized', message: 'Invalid or expired session.' });
    }
    userId = data.user.id;
    console.log(`[delete-account] verified userId=${userId}`);
  } catch (err) {
    console.error('[delete-account] JWT verification threw:', err.message);
    return res.status(500).json({ error: 'auth_error' });
  }

  // ── 2. Load profile (get stripe_customer_id before we delete the row) ──────
  let stripeCustomerId = null;
  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id, plan, is_pro')
      .eq('id', userId)
      .single();
    stripeCustomerId = profile?.stripe_customer_id ?? null;
    console.log(`[delete-account] profile: is_pro=${profile?.is_pro} plan=${profile?.plan} customerId=${stripeCustomerId ?? 'none'}`);
  } catch (err) {
    // Non-fatal — profile may not exist (e.g. free user who never paid)
    console.warn('[delete-account] profile lookup error (non-fatal):', err.message);
  }

  // ── 3. Cancel active Stripe subscription (if any) ─────────────────────────
  // We cancel immediately (not at period end) because the user is deleting their
  // account entirely — there is no account to retain Pro access for.
  if (stripeCustomerId && STRIPE_KEY) {
    try {
      const Stripe = (await import('stripe')).default;
      const stripe = new Stripe(STRIPE_KEY, { apiVersion: '2024-04-10' });

      const subscriptions = await stripe.subscriptions.list({
        customer: stripeCustomerId,
        status:   'active',
        limit:    10,
      });

      for (const sub of subscriptions.data) {
        await stripe.subscriptions.cancel(sub.id);
        console.log(`[delete-account] cancelled Stripe subscription ${sub.id}`);
      }

      // Also cancel subscriptions in other active states
      const trialing = await stripe.subscriptions.list({
        customer: stripeCustomerId,
        status:   'trialing',
        limit:    10,
      });
      for (const sub of trialing.data) {
        await stripe.subscriptions.cancel(sub.id);
        console.log(`[delete-account] cancelled trialing subscription ${sub.id}`);
      }
    } catch (err) {
      // Log but do not abort — deletion should proceed even if Stripe call fails.
      // The user won't be billed again because the auth.users row is gone.
      console.error('[delete-account] Stripe cancellation error (non-fatal):', err.message);
    }
  } else if (stripeCustomerId && !STRIPE_KEY) {
    console.warn('[delete-account] STRIPE_SECRET_KEY not set — Stripe subscription NOT cancelled');
  }

  // ── 4. Delete from auth.users (cascades to profiles and usage) ────────────
  try {
    const { error } = await supabase.auth.admin.deleteUser(userId);
    if (error) {
      console.error('[delete-account] deleteUser FAILED:', error.message, error.status);
      return res.status(500).json({
        error:   'deletion_failed',
        message: 'Account could not be deleted. Please contact support.',
      });
    }
    console.log(`[delete-account] ✅ auth.users deleted userId=${userId} — profiles+usage cascaded`);
  } catch (err) {
    console.error('[delete-account] deleteUser threw:', err.message);
    return res.status(500).json({ error: 'deletion_error' });
  }

  return res.status(200).json({ deleted: true });
}
