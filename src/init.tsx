import { StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { useChannel, useChannelMessage } from "./channel";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Suspense fallback={null}>
      <Control />
    </Suspense>
  </StrictMode>,
);

function Control() {
  console.log("added");

  const channel = useChannel("control");

  useChannelMessage(channel, "menu.invoke", (msg) => {
    console.log(msg);

    const [torrent] = msg.context.torrents;

    if (!torrent) {
      return;
    }

    channel.send("modal.open", {
      entry: "stats.html",
      title: "Torrent stats",
      context: { torrent },
    });
  });

  channel.send("menu.add", {
    id: "share-stats",
    label: "Share stats",
  });

  return null;
}
