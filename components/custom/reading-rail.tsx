"use client";

import { useEffect, useRef } from "react";
import "./reading-rail.css";

/** Keep the whole rail reachable: sticky only if it fits below the masthead. */
export function ReadingRail({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const rail = ref.current;
    if (!rail) return;
    const header = document.querySelector("body header");
    const update = () => {
      const top = (header?.getBoundingClientRect().height ?? 112) + 24;
      const fits =
        window.innerWidth >= 1024 &&
        rail.offsetHeight + top + 24 <= window.innerHeight;
      rail.style.position = fits ? "sticky" : "static";
      rail.style.top = fits ? `${top}px` : "";
    };
    const observer = new ResizeObserver(update);
    observer.observe(rail);
    if (header) observer.observe(header);
    window.addEventListener("resize", update);
    update();
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", update);
    };
  }, []);
  return (
    <aside
      ref={ref}
      aria-label="Suggestions"
      className="min-w-0 self-start"
      data-reading-rail
    >
      {children}
    </aside>
  );
}
