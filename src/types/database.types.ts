/**
 * Supabase-generated database types.
 *
 * DO NOT edit by hand for table shapes. Regenerate after every migration:
 *   npm run db:types          (local)
 *   supabase gen types typescript --project-id <ref> > src/types/database.types.ts
 *
 * The hand-written placeholder below mirrors the foundation migration
 * (0001_init_foundation.sql) so the app type-checks before you wire Supabase.
 * Once you generate real types, this file is fully replaced.
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type AppRole = 'player' | 'admin';

export interface Database {
  // Marker the Supabase client uses to resolve schema types. The CLI emits this
  // in generated types; we include it so the hand-written placeholder behaves
  // identically until you run `npm run db:types`.
  __InternalSupabase: {
    PostgrestVersion: '12';
  };
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          display_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username: string;
          display_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          username?: string;
          display_name?: string | null;
          avatar_url?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      user_roles: {
        Row: { user_id: string; role: AppRole; created_at: string };
        Insert: { user_id: string; role?: AppRole; created_at?: string };
        Update: { role?: AppRole };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      has_role: {
        Args: { _user_id: string; _role: AppRole };
        Returns: boolean;
      };
    };
    Enums: { app_role: AppRole };
    CompositeTypes: Record<string, never>;
  };
}
