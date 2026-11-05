import type { LucideIcon } from "lucide-react";
import type { Tier } from "../achievements";
import clsx from "clsx";

const metals: Record<Tier, [string, string]> = {
  bronze: ["#f5c08f", "#a0522d"],
  silver: ["#f8fafc", "#94a3b8"],
  gold: ["#fde68a", "#d97706"],
  platinum: ["#e0e7ff", "#818cf8"],
};

export function Medal({
  icon: Icon,
  tier,
  locked = false,
}: {
  icon: LucideIcon;
  tier: Tier;
  locked?: boolean;
}) {
  const [light, dark] = metals[tier];

  return (
    <div
      className={clsx(
        "grid size-10 shrink-0 place-items-center rounded-full p-0.5",
        locked && "opacity-35 grayscale",
      )}
      style={{ background: `linear-gradient(145deg, ${light}, ${dark})` }}
    >
      <div className="grid size-full place-items-center rounded-full bg-slate-950">
        <Icon className="size-5" style={{ color: light }} />
      </div>
    </div>
  );
}
