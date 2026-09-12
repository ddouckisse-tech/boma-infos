"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { AuthTab } from "@/components/custom/auth-card";
import { AdminTrigger } from "@/components/custom/admin-trigger";

/**
 * The page-footer entry to the administrator sign-in.
 *
 * Same mechanics as `AccessMenu` in the masthead: the card is a chunk fetched
 * on demand (shared with the masthead's, so it is downloaded once), and the
 * focus goes back to the trigger only after the card has unmounted — the
 * browser drops `<dialog>` from the top layer after the commit and would
 * otherwise overwrite the restored focus with `<body>`.
 */
const AuthCard = dynamic(
  () => import("@/components/custom/auth-card").then((m) => m.AuthCard),
  { ssr: false }
);

export function AdminEntry() {
  const [tab, setTab] = useState<AuthTab | null>(null);
  const invoker = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (tab !== null) return;
    const trigger = invoker.current;
    invoker.current = null;
    if (trigger && document.contains(trigger)) trigger.focus();
  }, [tab]);

  return (
    <>
      <AdminTrigger
        onOpen={(trigger) => {
          invoker.current = trigger;
          setTab("admin");
        }}
      />
      {tab && (
        <AuthCard tab={tab} onTabChange={setTab} onClose={() => setTab(null)} />
      )}
    </>
  );
}
