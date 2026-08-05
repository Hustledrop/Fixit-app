// api/save-diagnosis.js
// POST /api/save-diagnosis
// Saves a single diagnosis entry to public.diagnoses on behalf of the authenticated user.
// Uses the service_role key (server-side only) so it bypasses client-side RLS entirely.
// This guarantees the write even if the anon key client's session has issues.
//
// Body:  { entry: { id, problem, diagnosis, category, lang, cc, savedAmt, fixed, ... } }
// Auth:  Supabase JWT in Authorization header (same as /api/diagnose)
// Returns: { ok: true } or { error: string }

const SUPABASE_URL  = process.env.VITE_SUPABASE_URL;
const SUPABASE_SVC  = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function verifyJWT(token) {
  if (!SUPABASE_URL || !SUPABASE_SVC) return null;
  const { createClient } = await import('@supabase/supabase-js');
  const admin = createClient(SUPABASE_URL, SUPABASE_SVC, { auth: { persistSession: false } });
  const { data } = await admin.auth.getUser(token);
  return data?.user ?? null;
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', chunk => { data += chunk; if (data.length > 512000) reject(new Error('body too large')); });
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'method_not_allowed' });

  // Require valid JWT
  const token = (req.headers.authorization || '').replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'unauthorized' });

  const user = await verifyJWT(token).catch(() => null);
  if (!user) return res.status(401).json({ error: 'unauthorized' });

  let body;
  try { body = JSON.parse(await readBody(req)); }
  catch { return res.status(400).json({ error: 'invalid_json' }); }

  const { entry } = body || {};
  if (!entry || typeof entry !== 'object' || !entry.id || !entry.diagnosis) {
    return res.status(400).json({ error: 'invalid_entry' });
  }

  if (!SUPABASE_URL || !SUPABASE_SVC) {
    // No database configured — not an error in guest mode
    return res.status(200).json({ ok: true, skipped: true });
  }

  try {
    const { createClient } = await import('@supabase/supabase-js');
    const admin = createClient(SUPABASE_URL, SUPABASE_SVC, { auth: { persistSession: false } });

    const { error } = await admin.from('diagnoses').upsert({
      id:        Number(entry.id),          // BIGINT — ensure it's a number
      user_id:   user.id,                   // from verified JWT, not from client body
      problem:   entry.problem   || '',
      diagnosis: entry.diagnosis || '',
      entry:     entry,                     // full JSONB blob
      category:  entry.category  || null,
      lang:      entry.lang      || null,
      cc:        entry.cc        || null,
      saved_amt: Number(entry.savedAmt) || 0,
      fixed:     entry.fixed     ?? null,
    }, { onConflict: 'id,user_id', ignoreDuplicates: false });

    if (error) {
      console.error('[save-diagnosis] upsert error:', error.code, error.message);
      return res.status(500).json({ error: error.message });
    }

    console.log('[save-diagnosis] saved id=%s user=%s', entry.id, user.id.slice(0, 8));
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('[save-diagnosis] threw:', err.message);
    return res.status(500).json({ error: err.message });
  }
}
