'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { usePresenceTracker } from '@/features/presence';
import { useStageStatuses } from '../hooks/useQuiz';
import { StageSelect } from './StageSelect';
import { StagePlay } from './StagePlay';

/**
 * Quiz shell mounted on /play. Owns the "which stage is active" navigation and
 * the stage-status query (shared with the select screen and invalidated on a
 * pass). AnimatePresence cross-fades between the select screen and a stage, and
 * keys each stage so answer/submit state resets between stages.
 */
export function QuizGame({ userId, username }: { userId: string; username: string }) {
  const [active, setActive] = useState<number | null>(null);
  const { data: stages, isLoading } = useStageStatuses(userId);
  const total = stages?.length ?? 0;

  // Publish live presence (online + current stage) for the admin dashboard.
  usePresenceTracker({ userId, username, stage: active });

  return (
    <div className="h-full overflow-auto bg-neutral-50 p-6">
      <AnimatePresence mode="wait">
        {active === null ? (
          <motion.div
            key="select"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22 }}
          >
            <StageSelect stages={stages ?? []} loading={isLoading} onPlay={setActive} />
          </motion.div>
        ) : (
          <motion.div
            key={`play-${active}`}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.22 }}
          >
            <StagePlay
              ord={active}
              userId={userId}
              total={total}
              onBack={() => setActive(null)}
              onNext={setActive}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
