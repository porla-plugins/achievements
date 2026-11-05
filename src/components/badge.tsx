import type { Earned } from "../achievements";
import { Medal } from "./medal";

export function Badge({ badge }: { badge: Earned }) {
  return (
    <div className="flex min-w-0 flex-col items-center gap-2 rounded-2xl bg-white/5 px-2 py-3 text-center ring-1 ring-white/10">
      <Medal icon={badge.icon} tier={badge.tier} />
      <div className="w-full min-w-0">
        <div className="truncate text-sm font-semibold">{badge.title}</div>
        <div className="truncate text-[11px] text-slate-400">
          {badge.detail}
        </div>
      </div>
    </div>
  );
}
