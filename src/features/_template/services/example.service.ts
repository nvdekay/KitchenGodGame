import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';

/**
 * TEMPLATE service. Copy the feature folder, rename, and replace this with real
 * data access. Note: client injected by the caller; returns domain types; would
 * throw AppError on failure. No React, no Zustand here.
 */
export interface ExampleItem {
  id: string;
  title: string;
}

export async function listExampleItems(
  _db: SupabaseClient<Database>,
): Promise<ExampleItem[]> {
  // Placeholder — wire to a real table once this feature has a migration.
  return [];
}
