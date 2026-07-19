'use client';

import { useOnlinePlayers } from '../hooks/useOnlinePlayers';

/** Admin widget: live count of online players and which level each is on. */
export function OnlinePlayers() {
  const players = useOnlinePlayers();

  return (
    <div className="overflow-hidden rounded-2xl border border-sky-100 bg-white shadow-sm">
      <div className="flex items-center gap-2 border-b border-sky-100 bg-gradient-to-r from-sky-50 to-white px-5 py-4">
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
        </span>
        <h2 className="font-semibold text-neutral-800">
          Đang online: <span className="text-sky-700">{players.length}</span>
        </h2>
      </div>

      {players.length === 0 ? (
        <p className="px-5 py-6 text-sm text-neutral-500">Không có ai đang chơi.</p>
      ) : (
        <ul className="divide-y divide-sky-50">
          {players.map((p) => (
            <li key={p.userId} className="flex items-center justify-between gap-3 px-5 py-3">
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sky-100 text-xs font-bold text-sky-700">
                  {p.username.charAt(0).toUpperCase()}
                </span>
                <span className="truncate font-medium text-neutral-800">{p.username}</span>
              </div>
              {p.stage !== null ? (
                <span className="shrink-0 rounded-full bg-violet-100 px-2.5 py-1 text-xs font-medium text-violet-700">
                  Đang làm · Chặng {p.stage}
                </span>
              ) : (
                <span className="shrink-0 rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-500">
                  Đang chọn chặng
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
