'use client';

import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import * as svc from '../services/quiz-admin.service';
import type { QuestionInput, StageInput } from '../services/quiz-admin.service';

const KEY = ['quiz-admin'] as const;

/** All quiz-admin data + mutations in one hook. Every mutation invalidates the
 *  list so the UI reflects writes immediately. */
export function useQuizAdmin() {
  const db = useMemo(() => createClient(), []);
  const qc = useQueryClient();
  const onDone = { onSuccess: () => qc.invalidateQueries({ queryKey: KEY }) };

  const query = useQuery({ queryKey: KEY, queryFn: () => svc.listStagesWithQuestions(db) });

  return {
    query,
    createStage: useMutation({ mutationFn: (i: StageInput) => svc.createStage(db, i), ...onDone }),
    updateStage: useMutation({
      mutationFn: (a: { id: string; input: StageInput }) => svc.updateStage(db, a.id, a.input),
      ...onDone,
    }),
    deleteStage: useMutation({ mutationFn: (id: string) => svc.deleteStage(db, id), ...onDone }),
    createQuestion: useMutation({
      mutationFn: (i: QuestionInput) => svc.createQuestion(db, i),
      ...onDone,
    }),
    updateQuestion: useMutation({
      mutationFn: (a: { id: string; input: Omit<QuestionInput, 'stage_id'> }) =>
        svc.updateQuestion(db, a.id, a.input),
      ...onDone,
    }),
    deleteQuestion: useMutation({
      mutationFn: (id: string) => svc.deleteQuestion(db, id),
      ...onDone,
    }),
  };
}

export type QuizAdmin = ReturnType<typeof useQuizAdmin>;
