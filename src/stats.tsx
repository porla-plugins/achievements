import "./index.css";

import {
  StrictMode,
  Suspense,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createRoot } from "react-dom/client";
import { useChannel, useChannelMessage, type Theme } from "./channel";
import type { ShareContext, TorrentRef } from "./types";
import { useTorrent } from "./torrent";
import { StatsCard } from "./stats-card";
import { AchievementList } from "./components/achievement-list";
import { useCardImage } from "./image";
import clsx from "clsx";

const CARD_WIDTH = 560;
const SHOWN_WIDTH = 400;

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Suspense fallback={null}>
      <Stats />
    </Suspense>
  </StrictMode>,
);

function Stats() {
  const channel = useChannel<"modal", ShareContext>("modal");

  useLayoutEffect(() => applyTheme(channel.init.theme), [channel]);
  useChannelMessage(channel, "theme", applyTheme);

  new ResizeObserver(() =>
    channel.send("resize", {
      height: Math.ceil(document.body.getBoundingClientRect().height),
    }),
  ).observe(document.body);

  return <ModalContent torrentRef={channel.init.context.torrent} />;
}

function applyTheme(theme: Theme) {
  if (theme.name === "light" || theme.name === "dark") {
    document.documentElement.dataset.theme = theme.name;
  }
}

function ModalContent({ torrentRef }: { torrentRef: TorrentRef }) {
  const c = useChannel("modal");
  const state = useTorrent(torrentRef);
  const card = useRef<HTMLDivElement>(null);
  const [showName, setShowName] = useState(true);
  const image = useCardImage(card, state?.torrent, showName);

  const close = (
    <button type="button" className="btn" onClick={() => c.send("close", {})}>
      Close
    </button>
  );

  if (!state) {
    return <span className="loading loading-spinner"></span>;
  }

  if (!state.torrent) {
    return (
      <>
        <p className="py-2">{state.error ?? "Torrent not found"}</p>
        <Footer>
          <span className="mr-auto" />
          {close}
        </Footer>
      </>
    );
  }

  const t = state.torrent;
  const now = state.at;

  return (
    <>
      <div
        aria-hidden
        className="fixed top-0 left-[-10000px]"
        style={{ width: CARD_WIDTH }}
      >
        <StatsCard ref={card} torrent={t} now={now} showName={showName} />
      </div>
      <figure className="mx-auto w-full" style={{ maxWidth: SHOWN_WIDTH }}>
        <div className="relative">
          {image.url ? (
            <img
              src={image.url}
              alt="Torrent stats"
              className={clsx("block w-full", image.busy && "opacity-40")}
            />
          ) : (
            <div className="aspect-560/645 w-full rounded-[28px] bg-base-200" />
          )}
          {image.busy && (
            <span className="loading loading-spinner loading-lg absolute inset-0 m-auto" />
          )}
        </div>
        {image.error && !image.busy ? (
          <figcaption className="mt-3 text-center text-sm text-error">
            {image.error}
          </figcaption>
        ) : (
          image.url && (
            <figcaption className="mt-3 text-center text-sm opacity-70">
              Right-click or long-press the image to save or copy it.
            </figcaption>
          )
        )}
      </figure>
      <AchievementList torrent={t} now={now} />
      <Footer>
        <label className="label mr-auto text-sm">
          <input
            type="checkbox"
            className="toggle toggle-sm"
            checked={showName}
            onChange={(e) => setShowName(e.target.checked)}
          />
          Show name
        </label>
        {close}
      </Footer>
    </>
  );
}

function Footer({ children }: { children: ReactNode }) {
  return (
    <div className="sticky bottom-0 mt-4 flex flex-wrap items-center gap-3 border-t border-base-300 bg-base-100 pt-4">
      {children}
    </div>
  );
}
