"use client";

import { useEffect, useRef, useState } from "react";

export function usePersistentState<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(initialValue);
  const hydrated = useRef(false);
  const [readyToPersist, setReadyToPersist] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(key);
      // Reading an external browser store after hydration is intentional here.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (stored !== null) setValue(JSON.parse(stored) as T);
    } catch {
      // Invalid or unavailable storage should never prevent the timer from working.
    } finally {
      hydrated.current = true;
      // Persistence must wait for the stored value to reach React state, or the
      // default would overwrite it during the first effect pass.
      setReadyToPersist(true);
    }
  }, [key]);

  useEffect(() => {
    if (!hydrated.current || !readyToPersist) return;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Persistence is a convenience, not a runtime requirement.
    }
  }, [key, readyToPersist, value]);

  return [value, setValue] as const;
}
