import { progress } from "../achievements";
import type { Torrent } from "../types";
import { Medal } from "./medal";

// Everything there is to earn, and how close the torrent is to the next step.
export function AchievementList({
  torrent,
  now,
}: {
  torrent: Torrent;
  now: number;
}) {
  const all = progress(torrent, now);
  const count = all.filter((p) => p.earned).length;

  return (
    <details className="collapse collapse-arrow mt-3 rounded-box border border-base-300">
      <summary className="collapse-title text-sm font-medium">
        Achievements · {count} of {all.length}
      </summary>
      <ul className="collapse-content space-y-3 text-sm">
        {all.map((p) => (
          <li key={p.id} className="flex items-center gap-3">
            <Medal
              icon={p.icon}
              tier={p.earned?.tier ?? p.next!.tier}
              locked={!p.earned}
            />
            <div className="min-w-0 flex-1">
              <div className="font-medium">
                {p.earned?.title ?? p.next!.title}
                {p.earned && p.next && (
                  <span className="font-normal opacity-60">
                    {" "}
                    · next: {p.next.title}
                  </span>
                )}
              </div>
              <div className="text-xs opacity-60">
                {p.next ? p.next.need : p.earned!.detail}
              </div>
              {p.next && p.next.progress > 0 && (
                <progress
                  className="progress progress-primary mt-1 h-1.5 w-full"
                  value={p.next.progress}
                  max={1}
                />
              )}
            </div>
          </li>
        ))}
      </ul>
    </details>
  );
}
