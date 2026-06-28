import type { TypedSupabaseClient } from '@/lib/supabase/types';
import { AppError } from '@/lib/errors';
import type { QuestionType } from '@/types/database.types';

/**
 * Admin content management for the quiz. Writes go through the regular
 * (cookie-bound) client — RLS only lets admins write `stages`/`questions`, and
 * admins may read questions WITH their correct answers (players cannot). No
 * service-role key needed; authorization is enforced in Postgres.
 */

export interface AdminQuestion {
  id: string;
  stageId: string;
  ord: number;
  type: QuestionType;
  prompt: string;
  options: string[];
  correctIndices: number[];
}

export interface AdminStage {
  id: string;
  ord: number;
  title: string;
  description: string | null;
  questions: AdminQuestion[];
}

export interface StageInput {
  ord: number;
  title: string;
  description: string | null;
}

export interface QuestionInput {
  stage_id: string;
  ord: number;
  type: QuestionType;
  prompt: string;
  options: string[];
  correct_indices: number[];
}

export async function listStagesWithQuestions(db: TypedSupabaseClient): Promise<AdminStage[]> {
  const { data: stages } = await db.from('stages').select('id,ord,title,description').order('ord');
  const { data: questions } = await db
    .from('questions')
    .select('id,stage_id,ord,type,prompt,options,correct_indices')
    .order('ord');

  const byStage = new Map<string, AdminQuestion[]>();
  for (const q of questions ?? []) {
    const list = byStage.get(q.stage_id) ?? [];
    list.push({
      id: q.id,
      stageId: q.stage_id,
      ord: q.ord,
      type: q.type,
      prompt: q.prompt,
      options: (q.options as string[] | null) ?? [],
      correctIndices: q.correct_indices ?? [],
    });
    byStage.set(q.stage_id, list);
  }

  return (stages ?? []).map((s) => ({
    id: s.id,
    ord: s.ord,
    title: s.title,
    description: s.description,
    questions: byStage.get(s.id) ?? [],
  }));
}

function fail(error: { message: string } | null, msg: string) {
  if (error) throw new AppError('VALIDATION', `${msg}${error.message ? `: ${error.message}` : ''}`);
}

export async function createStage(db: TypedSupabaseClient, input: StageInput) {
  const { error } = await db.from('stages').insert(input);
  fail(error, 'Không tạo được chặng');
}
export async function updateStage(db: TypedSupabaseClient, id: string, input: StageInput) {
  const { error } = await db.from('stages').update(input).eq('id', id);
  fail(error, 'Không cập nhật được chặng');
}
export async function deleteStage(db: TypedSupabaseClient, id: string) {
  const { error } = await db.from('stages').delete().eq('id', id);
  fail(error, 'Không xoá được chặng');
}

export async function createQuestion(db: TypedSupabaseClient, input: QuestionInput) {
  const { error } = await db.from('questions').insert(input);
  fail(error, 'Không tạo được câu hỏi');
}
export async function updateQuestion(
  db: TypedSupabaseClient,
  id: string,
  input: Omit<QuestionInput, 'stage_id'>,
) {
  const { error } = await db.from('questions').update(input).eq('id', id);
  fail(error, 'Không cập nhật được câu hỏi');
}
export async function deleteQuestion(db: TypedSupabaseClient, id: string) {
  const { error } = await db.from('questions').delete().eq('id', id);
  fail(error, 'Không xoá được câu hỏi');
}
