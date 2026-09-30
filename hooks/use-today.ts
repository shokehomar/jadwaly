"use client";

// Today's date ("YYYY-MM-DD") from the browser's local clock. Returns null
// during server rendering (and hydration), so the server's time zone never decides
// "today". One shared timer checks every minute, so the date changes at local midnight.

import { useSyncExternalStore } from "react";
import { todayString } from "@/lib/utils";

const listeners = new Set<() => void>();
let timer: ReturnType<typeof setInterval> | null = null;

function subscribe(onChange: () => void): () => void {
  listeners.add(onChange);
  timer ??= setInterval(() => listeners.forEach((listener) => listener()), 60_000);
  return () => {
    listeners.delete(onChange);
    if (listeners.size === 0 && timer) {
      clearInterval(timer);
      timer = null;
    }
  };
}

export function useToday(): string | null {
  return useSyncExternalStore(subscribe, todayString, () => null);
}
