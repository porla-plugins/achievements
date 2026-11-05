import { use, useEffect, useEffectEvent } from "react";
import type { TorrentRef } from "./types";

export type Theme = { name: string; colors: Record<string, string> };

export type Protocol = {
  control: {
    send: {
      "menu.add": { id: string; label: string };
      "menu.remove": { id: string };
      "modal.open": { entry: string; title: string; context?: unknown };
    };
    receive: {
      "menu.invoke": { id: string; context: { torrents: TorrentRef[] } };
      theme: Theme;
    };
  };
  modal: {
    send: {
      resize: { height: number };
      close: Record<string, never>;
      "window.open": { filename: string };
      "window.show": { blob: Blob } | { error: string };
    };
    receive: {
      theme: Theme;
    };
  };
};

export type Role = keyof Protocol;

type Sends<R extends Role> = Protocol[R]["send"];
type Receives<R extends Role> = Protocol[R]["receive"];

// The `init` a modal frame gets carries the `context` its `modal.open` sent;
// the control frame's has none.
export type DefaultContext<R extends Role> = R extends "modal"
  ? unknown
  : undefined;

export type Init<R extends Role, Context = DefaultContext<R>> = {
  protocol: number;
  porla_version: string | null;
  theme: Theme;
  // Not sent by the web UI yet (WEB-50 follow-up); checked when it is.
  role?: Role;
  context: Context;
};

export type Channel<R extends Role, Context = DefaultContext<R>> = {
  init: Init<R, Context>;
  // Fields can be left out for messages that have none (`close`).
  send: <K extends keyof Sends<R>>(
    type: K,
    ...fields: Record<string, never> extends Sends<R>[K]
      ? [fields?: Sends<R>[K]]
      : [fields: Sends<R>[K]]
  ) => void;
  // Returns a function that removes the handler.
  on: <K extends keyof Receives<R>>(
    type: K,
    handler: (msg: Receives<R>[K] & { type: K }) => void,
  ) => () => void;
  // porla's JSON-RPC, as far as the web UI lets this plugin: its own
  // x.<slug>.* methods and the ones plugin.json lists in ui.rpc.
  jsonrpc: <T>(method: string, params: unknown) => Promise<T>;
};

export class RpcError extends Error {
  code: number;

  constructor({ code, message }: { code: number; message: string }) {
    super(message);
    this.name = "RpcError";
    this.code = code;
  }
}

type Message = { type: string } & Record<string, unknown>;

type Untyped = {
  init: Init<Role, unknown>;
  send: (type: string, fields?: object) => void;
  on: (type: string, handler: (msg: Message) => void) => () => void;
  jsonrpc: <T>(method: string, params: unknown) => Promise<T>;
};

const channel = new Promise<Untyped>((resolve) => {
  const onInit = (e: MessageEvent) => {
    if (e.source !== window.parent || e.data?.type !== "plugin:init") return;
    const port = e.ports[0];
    if (!port) return;
    removeEventListener("message", onInit);

    const handlers = new Map<string, Set<(msg: Message) => void>>();
    const pending = new Map<
      number,
      { resolve: (v: unknown) => void; reject: (e: Error) => void }
    >();
    let next = 0;

    port.onmessage = ({ data }) => {
      if (!data || typeof data.type !== "string") return;
      if (data.type === "jsonrpc.result") {
        const call = pending.get(data.id);
        pending.delete(data.id);
        if (data.error) call?.reject(new RpcError(data.error));
        else call?.resolve(data.result);
        return;
      }
      handlers.get(data.type)?.forEach((handler) => handler(data));
    };

    const post = (msg: Message) => port.postMessage(msg);
    resolve({
      init: e.data as Init<Role, unknown>,
      send: (type, fields) => post({ ...fields, type }),
      on: (type, handler) => {
        let set = handlers.get(type);
        if (!set) handlers.set(type, (set = new Set()));
        set.add(handler);
        return () => set.delete(handler);
      },
      jsonrpc: <T>(method: string, params: unknown) =>
        new Promise<T>((resolve, reject) => {
          const id = ++next;
          pending.set(id, { resolve: resolve as (v: unknown) => void, reject });
          post({ type: "jsonrpc.call", id, method, params });
        }),
    });
  };

  addEventListener("message", onInit);
});

// The one channel as `role`'s. Throws when the web UI loaded the page as the
// other role (once it says which).
function as<R extends Role, Context>(c: Untyped, role: R) {
  if (c.init.role !== undefined && c.init.role !== role) {
    throw new Error(
      `This page was loaded as a ${c.init.role} frame, not a ${role} frame`,
    );
  }
  return c as unknown as Channel<R, Context>;
}

// The same promise for every call, so React's `use` can wait on it.
const connections = new Map<Role, Promise<unknown>>();

export function connect<R extends Role, Context = DefaultContext<R>>(
  role: R,
): Promise<Channel<R, Context>> {
  let p = connections.get(role);
  if (!p) connections.set(role, (p = channel.then((c) => as(c, role))));
  return p as Promise<Channel<R, Context>>;
}

// daisyUI's light or dark, as the web UI has it.
export function applyTheme(theme: Theme) {
  if (theme.name === "light" || theme.name === "dark") {
    document.documentElement.dataset.theme = theme.name;
  }
}

export function useChannel<R extends Role, Context = DefaultContext<R>>(
  role: R,
): Channel<R, Context> {
  return use(connect<R, Context>(role));
}

export function useChannelMessage<
  R extends Role,
  K extends keyof Protocol[R]["receive"],
>(
  channel: Channel<R, unknown>,
  type: K,
  handler: (msg: Protocol[R]["receive"][K] & { type: K }) => void,
) {
  const onMessage = useEffectEvent(handler);
  useEffect(() => channel.on(type, (msg) => onMessage(msg)), [channel, type]);
}
