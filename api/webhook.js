// api/webhook.js — Stripe webhook handler
// Listens for checkout.session.completed → sets is_pro=true in Supabase profiles table.
//
// Required env vars:
//   STRIPE_SECRET_KEY
//   STRIPE_WEBHOOK_SECRET     whsec_... (from Stripe dashboard → Webhooks)
//   SUPABASE_SERVICE_ROLE_KEY  (NOT the anon key — service role bypasses RLS)
//   VITE_SUPABASE_URL
//
// Stripe dashboard setup:
//   Webhooks → Add endpoint → https://www.fixit-app.com/api/webhook
//   Events: checkout.session.completed, customer.subscription.deleted

import Stripe from 'stripe';

const STRIPE_KEY      = process.env.STRIPE_SECRET_KEY;
const WEBHOOK_SECRET  = process.env.STRIPE_WEBHOOK_SECRET;
const SUPABASE_URL    = process.env.VITE_SUPABASE_URL;
const SUPABASE_SVC    = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Use service-role key to bypass RLS for server-side writes
async function getAdminClient() {
  if (!SUPABASE_URL || !SUPABASE_SVC) return null;
  const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
  return createClient(SUPABASE_URL, SUPABASE_SVC);
}

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  if (req.method !== 'POST') { res.status(405).end(); return; }

  if (!STRIPE_KEY || !WEBHOOK_SECRET) {
    console.warn('[webhook] Stripe env vars not configured');
    res.status(503).json({ error: 'not_configured' });
    return;
  }

  // Read raw body for signature verification
  const rawBody = await new Promise((resolve, reject) => {
    let data = '';
    req.on('data', chunk => { data += chunk; });
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });

  const sig = req.headers['stripe-signature'];
  let event;
  try {
    const stripe = new Stripe(STRIPE_KEY, { apiVersion: '2024-04-10' });
    event = stripe.webhooks.constructEvent(rawBody, sig, WEBHOOK_SECRET);
  } catch (err) {
    console.error('[webhook] Signature verification failed:', err.message);
    res.status(400).json({ error: 'signature_invalid' });
    return;
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const userId  = session.metadata?.userId || session.client_reference_id;
    const plan    = session.metadata?.plan || 'monthly';

    console.log(`[webhook] checkout.session.completed userId=${userId} plan=${plan}`);

    if (userId) {
      const supabase = await getAdminClient();
      if (supabase) {
        await supabase.from('profiles').upsert({
          id: userId,
          is_pro: true,
          plan,
          stripe_customer_id: session.customer,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'id' });

        // Record payment
        await supabase.from('payments').insert({
          user_id: userId,
          stripe_customer_id: session.customer,
          stripe_session_id: session.id,
          plan,
          status: 'completed',
          created_at: new Date().toISOString(),
        });

        console.log(`[webhook] ✅ is_pro=true set for userId=${userId}`);
      }
    }
  }

  if (event.type === 'customer.subscription.deleted') {
    // Pro monthly cancelled — downgrade user
    const subscription = event.data.object;
    const customerId   = subscription.customer;
    console.log(`[webhook] subscription.deleted customerId=${customerId}`);

    const supabase = await getAdminClient();
    if (supabase) {
      await supabase.from('profiles')
        .update({ is_pro: false, plan: null, updated_at: new Date().toISOString() })
        .eq('stripe_customer_id', customerId);
    }
  }

  res.status(200).json({ received: true });
}
