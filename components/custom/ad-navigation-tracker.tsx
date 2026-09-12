"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { beginAdNavigation } from "@/lib/ads/browser";

/** Routes without ads must also end a navigation's frozen dismissal window. */
export function AdNavigationTracker() {
  const pathname = usePathname();
  useEffect(() => beginAdNavigation(pathname), [pathname]);
  return null;
}
