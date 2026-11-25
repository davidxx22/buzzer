"use client";

import { useCallback, useEffect, useState } from "react";
import { readQueue, subscribeToQueue } from "./browser-store";
import type { QueueTicket } from "./model";

type QueueState =
  | { kind: "loading" }
  | { kind: "error" }
  | { kind: "loaded"; tickets: QueueTicket[] };

export function useQueue() {
  const [state, setState] = useState<QueueState>({ kind: "loading" });

  const refresh = useCallback(() => {
    try {
      setState({ kind: "loaded", tickets: readQueue() });
    } catch {
      setState({ kind: "error" });
    }
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeToQueue(refresh);
    refresh();
    return unsubscribe;
  }, [refresh]);

  return { state, refresh };
}
