'use client';

import { motion } from 'motion/react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/cn';
import type { StageStatus } from '../types';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

/** Presentational stage map: completed ✓, unlocked (playable), or locked 🔒.
 *  Cards stagger in and lift slightly on hover. */
export function StageSelect({
  stages,
  loading,
  onPlay,
}: {
  stages: StageStatus[];
  loading: boolean;
  onPlay: (ord: number) => void;
}) {
  if (loading) return <p className="text-neutral-500">Đang tải…</p>;

  const doneCount = stages.filter((s) => s.completed).length;
  const allDone = stages.length > 0 && doneCount === stages.length;

  return (
    <div className="mx-auto max-w-xl space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Các chặng</h2>
        <span className="text-sm text-neutral-600">
          {doneCount}/{stages.length} hoàn thành
        </span>
      </div>

      <motion.div variants={container} initial="hidden" animate="show" className="space-y-3">
        {stages.map((s) => (
          <motion.div
            key={s.ord}
            variants={item}
            whileHover={s.unlocked ? { scale: 1.01 } : undefined}
            className={cn(
              'flex items-center justify-between rounded border bg-white p-4 shadow-sm transition-shadow',
              s.unlocked ? 'hover:shadow-md' : 'opacity-60',
            )}
          >
            <div>
              <p className="font-medium">
                {s.title} {s.completed && <span className="text-green-600">✓</span>}
              </p>
              {s.description && <p className="text-sm text-neutral-500">{s.description}</p>}
            </div>
            {s.unlocked ? (
              <Button variant={s.completed ? 'secondary' : 'primary'} onClick={() => onPlay(s.ord)}>
                {s.completed ? 'Làm lại' : 'Chơi'}
              </Button>
            ) : (
              <span className="text-sm text-neutral-400">🔒 Khoá</span>
            )}
          </motion.div>
        ))}
      </motion.div>

      {allDone && (
        <motion.p
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded bg-green-50 p-3 text-center font-medium text-green-700"
        >
          🎉 Bạn đã hoàn thành tất cả các chặng!
        </motion.p>
      )}
    </div>
  );
}
