"use client";

// Today's date ("YYYY-MM-DD") from the browser's local clock. Returns null
// during server rendering, so the server's time zone never decides "today".
// Rechecks every minute so the date changes at local midnight.

import { useSyncExternalStore } from "react";
import { todayString } from "@/lib/utils";

function subscribe(onChange: () => void): () => void {
  const id = setInterval(onChange, 60_000);
  return () => clearInterval(id);
}

export function useToday(): string | null {
  return useSyncExternalStore(subscribe, todayString, () => null);
}
