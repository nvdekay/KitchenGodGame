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

export type QuestionType = 'single' | 'multiple' | 'boolean';

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
      player_progress: {
        Row: {
          user_id: string;
          best_level: number;
          best_score: number;
          last_played_at: string | null;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          best_level?: number;
          best_score?: number;
          last_played_at?: string | null;
          updated_at?: string;
        };
        Update: {
          best_level?: number;
          best_score?: number;
          last_played_at?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      stages: {
        Row: { id: string; ord: number; title: string; description: string | null; created_at: string };
        Insert: { id?: string; ord: number; title: string; description?: string | null; created_at?: string };
        Update: { ord?: number; title?: string; description?: string | null };
        Relationships: [];
      };
      questions: {
        Row: {
          id: string;
          stage_id: string;
          ord: number;
          type: QuestionType;
          prompt: string;
          options: Json;
          correct_indices: number[];
          created_at: string;
        };
        Insert: {
          id?: string;
          stage_id: string;
          ord: number;
          type?: QuestionType;
          prompt: string;
          options?: Json;
          correct_indices?: number[];
          created_at?: string;
        };
        Update: {
          stage_id?: string;
          ord?: number;
          type?: QuestionType;
          prompt?: string;
          options?: Json;
          correct_indices?: number[];
        };
        Relationships: [];
      };
      quiz_runs: {
        Row: { user_id: string; started_at: string | null; finished_at: string | null; updated_at: string };
        Insert: { user_id: string; started_at?: string | null; finished_at?: string | null; updated_at?: string };
        Update: { started_at?: string | null; finished_at?: string | null; updated_at?: string };
        Relationships: [];
      };
      stage_completions: {
        Row: {
          user_id: string;
          stage_ord: number;
          completed_at: string;
          correct_count: number;
          total: number;
          play_seconds: number;
        };
        Insert: {
          user_id: string;
          stage_ord: number;
          completed_at?: string;
          correct_count?: number;
          total?: number;
          play_seconds?: number;
        };
        Update: {
          completed_at?: string;
          correct_count?: number;
          total?: number;
          play_seconds?: number;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      has_role: {
        Args: { _user_id: string; _role: AppRole };
        Returns: boolean;
      };
      get_email_for_username: {
        Args: { p_username: string };
        Returns: string;
      };
      record_level_progress: {
        Args: { p_level: number; p_score: number };
        Returns: undefined;
      };
      get_leaderboard: {
        Args: { p_limit?: number };
        Returns: { username: string; best_level: number; best_score: number }[];
      };
      get_stage: {
        Args: { p_ord: number };
        Returns: Json;
      };
      submit_stage: {
        Args: { p_ord: number; p_answers: Json; p_play_seconds?: number };
        Returns: Json;
      };
    };
    Enums: { app_role: AppRole; question_type: QuestionType };
    CompositeTypes: Record<string, never>;
  };
}
