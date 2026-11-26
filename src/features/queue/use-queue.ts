"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { subscribeToQueue } from "./browser-store";
import type { OrderSource, QueueTicket } from "./model";
import { getOrders } from "./order-store";

type QueueState =
  | { kind: "loading" }
  | { kind: "error"; source: OrderSource | null }
  | { kind: "loaded"; tickets: QueueTicket[]; source: OrderSource };

export function useQueue(ticketId?: string) {
  const [state, setState] = useState<QueueState>({ kind: "loading" });
  const requestCount = useRef(0);
  const isRefreshing = useRef(false);

  const refresh = useCallback(async () => {
    const request = ++requestCount.current;
    isRefreshing.current = true;
    try {
      const queue = await getOrders(ticketId);
      if (request === requestCount.current) setState({ kind: "loaded", ...queue });
    } catch {
      if (request === requestCount.current) {
        setState((previous) => ({ kind: "error", source: previous.kind === "loading" ? null : previous.source }));
      }
    } finally {
      if (request === requestCount.current) isRefreshing.current = false;
    }
  }, [ticketId]);

  useEffect(() => {
    const unsubscribe = subscribeToQueue(refresh);
    void refresh();
    return () => {
      requestCount.current += 1;
      unsubscribe();
    };
  }, [refresh]);

  const source = state.kind === "loading" ? null : state.source;
  useEffect(() => {
    if (source !== "shared") return;

    const poll = () => {
      if (!isRefreshing.current) void refresh();
    };
    const interval = window.setInterval(poll, 1500);
    window.addEventListener("focus", poll);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener("focus", poll);
    };
  }, [refresh, source]);

  return { state, refresh };
}
