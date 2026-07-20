/**
 * Deletes every account EXCEPT current admins (role = 'admin' in
 * public.user_roles) — for wiping test/demo player accounts before a real
 * run. Deleting an auth.users row cascades to profiles, user_roles,
 * quiz_runs and stage_completions automatically (FKs are ON DELETE CASCADE).
 *
 * Dry-run by default — prints exactly who would be kept/deleted. Pass --yes
 * to actually delete. Irreversible: there is no undo.
 *
 * Run:  node --env-file=.env.local scripts/reset-users.mjs         (dry run)
 *       node --env-file=.env.local scripts/reset-users.mjs --yes   (deletes)
 *
 * Needs SUPABASE_SERVICE_ROLE_KEY in the env.
 */
import { createClient } from '@supabase/supabase-js';

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!URL || !SERVICE) {
  console.error('Missing env. Run with: node --env-file=.env.local scripts/reset-users.mjs');
  process.exit(1);
}

const CONFIRMED = process.argv.includes('--yes');

const admin = createClient(URL, SERVICE, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const [{ data: roles, error: rolesError }, { data: profiles, error: profilesError }] =
  await Promise.all([
    admin.from('user_roles').select('user_id, role'),
    admin.from('profiles').select('id, username'),
  ]);
if (rolesError) throw rolesError;
if (profilesError) throw profilesError;

const nameOf = new Map(profiles.map((p) => [p.id, p.username]));
const keepIds = new Set(roles.filter((r) => r.role === 'admin').map((r) => r.user_id));
const toDelete = profiles.filter((p) => !keepIds.has(p.id));

console.log(`Keeping ${keepIds.size} admin account(s):`);
for (const id of keepIds) console.log(`  - ${nameOf.get(id) ?? id}`);

console.log(`\nDeleting ${toDelete.length} account(s):`);
for (const p of toDelete) console.log(`  - ${p.username}`);

if (!CONFIRMED) {
  console.log('\nDry run only — nothing was deleted. Re-run with --yes to actually delete.');
  process.exit(0);
}

console.log('');
for (const p of toDelete) {
  const { error } = await admin.auth.admin.deleteUser(p.id);
  if (error) console.error(`✗ Failed to delete "${p.username}" (${p.id}): ${error.message}`);
  else console.log(`✓ Deleted "${p.username}"`);
}
console.log('\nDone.');
