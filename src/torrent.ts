import { useEffect, useState } from "react";
import { useChannel } from "./channel";
import type { Torrent, TorrentRef } from "./types";

type TorrentState = {
  torrent?: Torrent;
  at: number;
  error?: string;
};

export function useTorrent(ref: TorrentRef) {
  const c = useChannel("modal");
  const [state, setState] = useState<TorrentState | null>(null);

  useEffect(() => {
    let current = true;
    c.jsonrpc<{ torrent: Torrent }>("torrents.get", ref).then(
      ({ torrent }) => current && setState({ torrent, at: Date.now() / 1000 }),
      (e) =>
        current &&
        setState({ at: 0, error: e instanceof Error ? e.message : String(e) }),
    );
    return () => {
      current = false;
    };
  }, [c, ref]);

  return state;
}
