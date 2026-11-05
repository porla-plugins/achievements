import { useEffect, useState, type RefObject } from "react";
import type { Torrent } from "./types";

const CARD_WIDTH = 560;

export function useCardImage(
  card: RefObject<HTMLDivElement | null>,
  torrent: Torrent | undefined,
  showName: boolean,
) {
  const [made, setMade] = useState<{
    showName: boolean;
    url?: string;
    error?: string;
  } | null>(null);

  useEffect(() => {
    const node = card.current;
    if (!torrent || !node) return;

    let current = true;
    cardImage(node).then(
      (blob) => {
        const url = URL.createObjectURL(blob);
        if (current) setMade({ showName, url });
        else URL.revokeObjectURL(url);
      },
      (e) =>
        current &&
        setMade({
          showName,
          error: e instanceof Error ? e.message : String(e),
        }),
    );
    return () => {
      current = false;
    };
  }, [card, torrent, showName]);

  // An image's URL goes when the image does.
  useEffect(() => {
    const url = made?.url;
    return url ? () => URL.revokeObjectURL(url) : undefined;
  }, [made]);

  return { ...made, busy: made?.showName !== showName };
}

async function cardImage(node: HTMLDivElement) {
  const { createContext, destroyContext, domToBlob } =
    await import("modern-screenshot");
  // Made as the modal opens: the card's fonts and logo may still be loading.
  await document.fonts.ready;
  await Promise.all(
    Array.from(node.querySelectorAll("img"), (img) =>
      img.decode().catch(() => {}),
    ),
  );
  const context = await createContext(node, {
    width: CARD_WIDTH,
    height: node.offsetHeight,
    scale: 2,
    type: "image/png",
    font: false,
  });
  // The library reads the browser's default styles in a frame it makes, to
  // leave those out of the image. In porla's sandboxed frame that one gets an
  // origin of its own and can't be read; a frame without a window makes it
  // keep every style instead (same image, larger SVG).
  context.sandbox = document.createElement("iframe");
  try {
    return await domToBlob(context);
  } finally {
    destroyContext(context);
  }
}
