'use client';

import { useMemo, useRef } from 'react';
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
  // Holds the current mutation objects so a success can clear stale errors left
  // on sibling mutations — otherwise a failed delete keeps its red banner up
  // even after an unrelated create succeeds. React Query keeps a mutation's
  // error until it re-runs or is reset(), so we reset the errored siblings here.
  const siblingsRef = useRef<Array<{ isError: boolean; reset: () => void }>>([]);
  const onDone = {
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY });
      siblingsRef.current.forEach((m) => {
        if (m.isError) m.reset();
      });
    },
  };

  const query = useQuery({ queryKey: KEY, queryFn: () => svc.listStagesWithQuestions(db) });

  const createStage = useMutation({ mutationFn: (i: StageInput) => svc.createStage(db, i), ...onDone });
  const updateStage = useMutation({
    mutationFn: (a: { id: string; input: StageInput }) => svc.updateStage(db, a.id, a.input),
    ...onDone,
  });
  const deleteStage = useMutation({ mutationFn: (id: string) => svc.deleteStage(db, id), ...onDone });
  const createQuestion = useMutation({
    mutationFn: (i: QuestionInput) => svc.createQuestion(db, i),
    ...onDone,
  });
  const updateQuestion = useMutation({
    mutationFn: (a: { id: string; input: Omit<QuestionInput, 'stage_id'> }) =>
      svc.updateQuestion(db, a.id, a.input),
    ...onDone,
  });
  const deleteQuestion = useMutation({
    mutationFn: (id: string) => svc.deleteQuestion(db, id),
    ...onDone,
  });

  siblingsRef.current = [
    createStage,
    updateStage,
    deleteStage,
    createQuestion,
    updateQuestion,
    deleteQuestion,
  ];

  return {
    query,
    createStage,
    updateStage,
    deleteStage,
    createQuestion,
    updateQuestion,
    deleteQuestion,
  };
}

export type QuizAdmin = ReturnType<typeof useQuizAdmin>;
