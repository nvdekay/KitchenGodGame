'use client';

import { useOnlinePlayers } from '../hooks/useOnlinePlayers';

/** Admin widget: live count of online players and which level each is on. */
export function OnlinePlayers() {
  const players = useOnlinePlayers();

  return (
    <div className="rounded border p-4">
      <div className="flex items-center gap-2">
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-500" />
        </span>
        <h2 className="font-semibold">Đang online: {players.length}</h2>
      </div>

      {players.length === 0 ? (
        <p className="mt-2 text-sm text-neutral-500">Không có ai đang chơi.</p>
      ) : (
        <ul className="mt-3 divide-y text-sm">
          {players.map((p) => (
            <li key={p.userId} className="flex items-center justify-between py-1.5">
              <span className="font-medium">{p.username}</span>
              <span className="text-neutral-600">
                {p.stage !== null ? `Đang làm · Chặng ${p.stage}` : 'Đang chọn chặng'}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
