import { ArrowUp } from "lucide-react";
import { rate } from "../format";

// Upload speed has a colour of its own, apart from the ratio's.
const SPEED = "#38bdf8";

// The upload speed right now, under the ratio; glowing from 10 MB/s.
export function Speed({ rate: r }: { rate: number }) {
  return (
    <div
      className="mt-6 inline-flex items-center gap-2 rounded-full px-5 py-2"
      style={{
        color: SPEED,
        background: `${SPEED}14`,
        boxShadow: `inset 0 0 0 1px ${SPEED}4d`,
      }}
    >
      <ArrowUp className="size-6" strokeWidth={2.5} />
      <span
        className="text-3xl font-bold tabular-nums"
        style={{ textShadow: r >= 10e6 ? `0 0 20px ${SPEED}80` : "none" }}
      >
        {rate(r)}
      </span>
    </div>
  );
}
