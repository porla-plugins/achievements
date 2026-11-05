import { useState, type RefObject } from "react";
import type { Torrent } from "./types";
import { earned, isOriginalSeed } from "./achievements";
import { DateTime } from "luxon";
import { bytes, days, duration, ratio } from "./format";
import logo from "./assets/porla.svg";
import { Speed } from "./components/speed";
import { Badge } from "./components/badge";
import clsx from "clsx";

const CARD_WIDTH = 560;

export function StatsCard({
  ref,
  torrent: t,
  now,
  showName,
}: {
  ref: RefObject<HTMLDivElement | null>;
  torrent: Torrent;
  now: number;
  showName: boolean;
}) {
  const [today] = useState(() => DateTime.now().toFormat("LLL d, yyyy"));

  const original = isOriginalSeed(t);
  const accent = accentOf(t.ratio);
  const badges = earned(t, now).slice(0, 3);

  return (
    <div
      ref={ref}
      className="relative overflow-hidden rounded-[28px] p-8 text-slate-100"
      style={{
        width: CARD_WIDTH,
        background: [
          `radial-gradient(60% 45% at 50% 40%, ${accent}30, transparent 70%)`,
          "radial-gradient(circle at 1px 1px, rgb(255 255 255 / 0.05) 1px, transparent 0) 0 0 / 18px 18px",
          "linear-gradient(160deg, #111827, #030712)",
        ].join(", "),
        boxShadow: "inset 0 0 0 1px rgb(255 255 255 / 0.08)",
      }}
    >
      <div className="flex items-center justify-between">
        <img src={logo} alt="porla" className="size-9" />
        <span className="text-sm tabular-nums text-slate-400">{today}</span>
      </div>

      {showName && (
        <div className="mt-6 line-clamp-2 wrap-break-word text-2xl font-semibold leading-tight">
          {t.name}
        </div>
      )}

      <div className="mt-7 text-center">
        <div
          className="text-[104px] font-bold leading-none tracking-tight tabular-nums"
          style={{ color: accent, textShadow: glowOf(t.ratio, accent) }}
        >
          {ratio(t.ratio)}
          {original && <span className="text-6xl">×</span>}
        </div>
        <div className="mt-3 text-xs uppercase tracking-[0.3em] text-slate-400">
          {original ? "Copies shared" : "Ratio"}
        </div>
        {t.upload_payload_rate > 0 && <Speed rate={t.upload_payload_rate} />}
      </div>

      {badges.length > 0 && (
        <div className="mt-8 grid grid-cols-3 gap-3">
          {badges.map((b) => (
            <Badge key={b.id} badge={b} />
          ))}
        </div>
      )}

      <dl
        className={clsx(
          "grid grid-cols-3 gap-x-6 gap-y-5 border-t border-white/10 pt-6",
          badges.length > 0 ? "mt-6" : "mt-8",
        )}
      >
        {stats(t, now, original).map(([label, value, sub]) => (
          <div key={label} className="min-w-0">
            <dt className="text-[11px] uppercase tracking-widest text-slate-400">
              {label}
            </dt>
            <dd className="truncate text-lg font-semibold tabular-nums">
              {value}
            </dd>
            {sub && <dd className="truncate text-xs text-slate-400">{sub}</dd>}
          </div>
        ))}
      </dl>
    </div>
  );
}

// [label, value, line under it]
function stats(
  t: Torrent,
  now: number,
  original: boolean,
): [string, string, string?][] {
  const seeding: [string, string, string?] =
    t.is_finished && t.completed_time > 0
      ? [
          "Seeding since",
          DateTime.fromSeconds(t.completed_time).toFormat("LLL d, yyyy"),
          // Under a day it's hours and minutes; then whole days.
          `for ${now - t.completed_time < 86400 ? duration(now - t.completed_time) : days(now - t.completed_time)}`,
        ]
      : ["Progress", `${(t.progress * 100).toFixed(1)}%`];

  // The tracker's counts of the whole swarm; -1 when it hasn't said.
  const swarm: [string, string, string?] =
    t.num_complete >= 0
      ? [
          "Swarm",
          `${t.num_complete} ${t.num_complete === 1 ? "seed" : "seeds"}`,
          t.num_incomplete >= 0
            ? `${t.num_incomplete} ${t.num_incomplete === 1 ? "peer" : "peers"}`
            : undefined,
        ]
      : ["Swarm", "-", "no tracker data"];

  // Uploading, the speed is up top and this says to how many; idle, it says
  // when it last uploaded (never "0 B/s").
  const activity: [string, string, string?] =
    t.upload_payload_rate > 0
      ? [
          "Sharing with",
          `${t.num_uploads} ${t.num_uploads === 1 ? "peer" : "peers"}`,
          "right now",
        ]
      : t.last_upload >= 0
        ? ["Last upload", duration(t.last_upload), "ago"]
        : ["Last upload", "Not yet"];

  return [
    ["Uploaded", bytes(t.all_time_upload)],
    [
      "Downloaded",
      bytes(t.all_time_download),
      original ? "original seed" : undefined,
    ],
    ["Size", t.has_metadata ? bytes(t.total) : "-"],
    seeding,
    swarm,
    activity,
  ];
}

// The list's ratio steps (components/ratio.tsx) in their dark-mode shades:
// the card is always dark, whatever the theme.
const accents: [number, string][] = [
  [0.2, "#f87171"],
  [0.5, "#fb923c"],
  [0.8, "#fbbf24"],
  [1, "#a3e635"],
  [1.25, "#4ade80"],
  [1.5, "#34d399"],
  [2, "#2dd4bf"],
  [Infinity, "#fde047"],
];

const accentOf = (r: number) => accents.find(([max]) => r < max)![1];

// Gold glows from 3, brighter from 5, like the list.
const glowOf = (r: number, accent: string) =>
  r >= 5
    ? `0 0 28px ${accent}99, 0 0 64px ${accent}55`
    : r >= 3
      ? `0 0 24px ${accent}66, 0 0 48px ${accent}33`
      : "none";
