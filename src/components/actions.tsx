import { useState, type ReactNode, type RefObject } from "react";
import { useChannel } from "../channel";
import { ExternalLink } from "lucide-react";

const CARD_WIDTH = 560;

export function Actions({
  card,
  children,
}: {
  card: RefObject<HTMLDivElement | null>;
  children: ReactNode;
}) {
  const c = useChannel("modal");
  const [busy, setBusy] = useState(false);

  // The image opens in a tab of its own, to save, copy or share from there.
  // This frame can't open tabs: the web UI opens one on `open-image`, sent on
  // the click (a tab opened later is blocked as a pop-up), and shows the
  // image once `image` brings it, or closes the tab on an error and says why.
  const open = async () => {
    c.send("window.open", { filename: "Porla torrent stats" });
    setBusy(true);

    try {
      // Twice the size, so it stays sharp on high-DPI screens and when scaled.
      // The library loads on first use.
      const { createContext, destroyContext, domToBlob } =
        await import("modern-screenshot");
      // At the card's own size: on narrow screens it's shown zoomed out,
      // which its on-screen box would carry into the image.
      const node = card.current!;
      const context = await createContext(node, {
        width: CARD_WIDTH,
        height: node.offsetHeight,
        scale: 2,
        type: "image/png",
        font: false,
      });
      // The library reads the browser's default styles in a frame it makes,
      // to leave those out of the image. In porla's sandboxed frame that one
      // gets an origin of its own and can't be read; a frame without a
      // window makes it keep every style instead (same image, larger SVG).
      context.sandbox = document.createElement("iframe");
      let blob: Blob;
      try {
        blob = await domToBlob(context);
      } finally {
        destroyContext(context);
      }
      c.send("window.show", { blob });
    } catch (e) {
      c.send("window.show", {
        error: e instanceof Error ? e.message : String(e),
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="sticky bottom-0 mt-4 flex flex-wrap items-center gap-3 border-t border-base-300 bg-base-100 pt-4">
      <div className="mr-auto">{children}</div>
      {/* together, so they wrap as one */}
      <div className="flex gap-2">
        <button type="button" className="btn" onClick={() => c.send("close")}>
          Close
        </button>
        <button
          type="button"
          className="btn btn-primary"
          disabled={busy}
          onClick={() => open()}
        >
          <ExternalLink className="size-4" />
          Open image
        </button>
      </div>
    </div>
  );
}
