/**
 * Load test — simulates N concurrent players running the whole quiz against your
 * real Supabase, measures latency, and CLEANS UP after itself.
 *
 * Run:  node --env-file=.env.local scripts/loadtest.mjs --users 50
 * Flags: --users <N> (default 10) · --concurrency <C> (default 25) · --keep (skip cleanup)
 *
 * What it does per virtual user: admin-creates a confirmed account (fires the
 * profile/role trigger) → signs in → plays stages 1..N (get_stage + submit_stage
 * with the CORRECT answers, read once via service role). One observer subscribes
 * to stage_completions realtime to confirm live delivery under load. At the end
 * it prints p50/p95/max latency per RPC and deletes every test user (cascades).
 *
 * Needs SUPABASE_SERVICE_ROLE_KEY in the env (admin create/delete + answer key).
 */
import { createClient } from '@supabase/supabase-js';

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!URL || !ANON || !SERVICE) {
  console.error('Missing env. Run with: node --env-file=.env.local scripts/loadtest.mjs');
  process.exit(1);
}

const arg = (name, def) => {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : def;
};
const USERS = Number(arg('users', 10));
const CONCURRENCY = Number(arg('concurrency', 25));
const KEEP = process.argv.includes('--keep');
const RUN_ID = `${Date.now()}`;
const PASSWORD = 'LoadTest123!';

const admin = createClient(URL, SERVICE, { auth: { persistSession: false, autoRefreshToken: false } });

const samples = []; // { op, ms, ok }
async function timed(op, fn) {
  const t0 = performance.now();
  let ok = true;
  try {
    const res = await fn();
    if (res?.error) ok = false;
    return res;
  } catch {
    ok = false;
  } finally {
    samples.push({ op, ms: performance.now() - t0, ok });
  }
}

async function pool(items, size, fn) {
  const out = [];
  let idx = 0;
  await Promise.all(
    Array.from({ length: Math.min(size, items.length) }, async () => {
      while (idx < items.length) {
        const i = idx++;
        out[i] = await fn(items[i], i).catch((e) => ({ error: e }));
      }
    }),
  );
  return out;
}

const pct = (arr, p) => {
  if (!arr.length) return 0;
  const s = [...arr].sort((a, b) => a - b);
  return s[Math.min(s.length - 1, Math.floor((p / 100) * s.length))];
};

async function main() {
  console.log(`\n▶ Load test: ${USERS} users, concurrency ${CONCURRENCY}\n`);

  // 1. Answer key (service role can read the secret correct_indices).
  const { data: stages } = await admin.from('stages').select('id,ord').order('ord');
  const { data: questions } = await admin.from('questions').select('stage_id,id,correct_indices');
  if (!stages?.length) {
    console.error('No stages found — run migration 0005 / seed first.');
    process.exit(1);
  }
  const ords = stages.map((s) => s.ord);
  const idToOrd = new Map(stages.map((s) => [s.id, s.ord]));
  const keyByOrd = {};
  for (const q of questions ?? []) {
    const ord = idToOrd.get(q.stage_id);
    (keyByOrd[ord] ??= {})[q.id] = q.correct_indices;
  }
  console.log(`  stages: ${ords.length} · questions: ${questions?.length ?? 0}`);

  // 2. Realtime observer (simulates the admin dashboard).
  let rtCount = 0;
  const observer = createClient(URL, SERVICE, { auth: { persistSession: false } });
  const channel = observer
    .channel('loadtest-observer')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'stage_completions' }, () => {
      rtCount++;
    });
  await new Promise((resolve) => channel.subscribe((s) => s === 'SUBSCRIBED' && resolve()));

  // 3. Run virtual users concurrently.
  const createdIds = [];
  const wall0 = performance.now();
  await pool([...Array(USERS).keys()], CONCURRENCY, async (i) => {
    const email = `loadtest_${RUN_ID}_${i}@example.com`;
    const username = `lt_${RUN_ID}_${i}`.slice(0, 24);
    const { data: created, error } = await admin.auth.admin.createUser({
      email,
      password: PASSWORD,
      email_confirm: true,
      user_metadata: { username },
    });
    if (error || !created?.user) {
      samples.push({ op: 'createUser', ms: 0, ok: false });
      return;
    }
    createdIds.push(created.user.id);

    const client = createClient(URL, ANON, { auth: { persistSession: false } });
    await timed('signIn', () => client.auth.signInWithPassword({ email, password: PASSWORD }));

    for (const ord of ords) {
      await timed('get_stage', () => client.rpc('get_stage', { p_ord: ord }));
      await timed('submit_stage', () =>
        client.rpc('submit_stage', { p_ord: ord, p_answers: keyByOrd[ord] ?? {} }),
      );
    }
    await client.auth.signOut();
  });
  const wallMs = performance.now() - wall0;

  // give realtime a moment to flush
  await new Promise((r) => setTimeout(r, 1500));
  await observer.removeChannel(channel);

  // 4. Report.
  const ops = [...new Set(samples.map((s) => s.op))];
  console.log(`\n  ── Latency (ms) ──`);
  console.log('  op'.padEnd(16), 'count'.padStart(6), 'ok'.padStart(6), 'p50'.padStart(7), 'p95'.padStart(7), 'max'.padStart(7));
  for (const op of ops) {
    const rows = samples.filter((s) => s.op === op);
    const ms = rows.map((r) => r.ms);
    const okN = rows.filter((r) => r.ok).length;
    console.log(
      `  ${op}`.padEnd(18),
      String(rows.length).padStart(6),
      String(okN).padStart(6),
      pct(ms, 50).toFixed(0).padStart(7),
      pct(ms, 95).toFixed(0).padStart(7),
      Math.max(...ms, 0).toFixed(0).padStart(7),
    );
  }
  const total = samples.length;
  const errors = samples.filter((s) => !s.ok).length;
  const expectedCompletions = USERS * ords.length;
  console.log(`\n  total RPC/auth calls: ${total} · errors: ${errors}`);
  console.log(`  realtime completions received: ${rtCount} / ~${expectedCompletions} expected`);
  console.log(`  wall-clock for all users: ${(wallMs / 1000).toFixed(1)}s`);
  console.log(`  throughput: ${(total / (wallMs / 1000)).toFixed(0)} ops/s`);

  // 5. Cleanup.
  if (KEEP) {
    console.log(`\n  --keep set: leaving ${createdIds.length} test users.`);
  } else {
    process.stdout.write(`\n  cleaning up ${createdIds.length} test users… `);
    await pool(createdIds, CONCURRENCY, (id) => admin.auth.admin.deleteUser(id));
    console.log('done.');
  }
  console.log('');
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
