import { useEffect, useState } from "react";

/**
 * The value once it has stopped changing for `delay` milliseconds — a
 * search reaches the server once per pause in the typing, not once per key.
 */
export function useDebouncedValue<T>(value: T, delay = 300): T {
  const [settled, setSettled] = useState(value);
  useEffect(() => {
    const timer = window.setTimeout(() => setSettled(value), delay);
    return () => window.clearTimeout(timer);
  }, [value, delay]);
  return settled;
}
