"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { usePathname } from "next/navigation";
import { AdFrame } from "./ad-slot";
import { AdControlIcon } from "./ad-control-icon";
import { ResponsiveImage } from "./responsive-image";
import { usePreferences } from "@/components/providers/preferences-provider";
import {
  claimOverlay,
  dismissAdvertisement,
  getAdServerSnapshot,
  getAdSnapshot,
  getOverlayCap,
  subscribeAds,
} from "@/lib/ads/browser";
import {
  canShowOverlay,
  isCampaignDismissed,
  isCreativeActive,
  isOverlayPage,
  isPlacementDismissed,
  selectOverlay,
} from "@/lib/ads/policy";
import type { AdCreative } from "@/lib/ads/types";
import "./ad-overlays.css";

type DisplayedOverlay = {
  creative: AdCreative;
  placement: "popup" | "floating";
  pathname: string;
  desktop: boolean;
};

type DataConnection = { saveData?: boolean };

function isLimited(dataSaver: boolean): boolean {
  const connection = (navigator as Navigator & { connection?: DataConnection })
    .connection;
  return (
    dataSaver ||
    connection?.saveData === true ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

function hasReadingInterruption(): boolean {
  const dialogs = document.querySelectorAll<HTMLElement>(
    'dialog[open], [aria-modal="true"], [role="dialog"][data-state="open"], [role="alertdialog"], iframe[title*="consent" i]'
  );
  return [...dialogs].some(
    (element) =>
      !element.closest("[data-ad-overlay]") &&
      element.getClientRects().length > 0 &&
      getComputedStyle(element).visibility !== "hidden"
  );
}

/** First-party campaigns only. No image, focus change or overlay is emitted on the server. */
export function AdOverlays({ creatives }: { creatives: AdCreative[] }) {
  const pathname = usePathname();
  const { dataSaver, locale } = usePreferences();
  const english = locale === "en";
  const subscribe = useCallback(
    (listener: () => void) => subscribeAds(pathname, listener),
    [pathname]
  );
  const snapshot = useSyncExternalStore(
    subscribe,
    getAdSnapshot,
    getAdServerSnapshot
  );
  const [displayed, setDisplayed] = useState<DisplayedOverlay | null>(null);

  useEffect(() => {
    if (
      !snapshot.ready ||
      !isOverlayPage(pathname) ||
      !creatives.length ||
      dataSaver
    )
      return;
    let visibleMs = 0;
    let previous = performance.now();
    let finished = false;
    const desktopQuery = window.matchMedia("(min-width: 1024px)");
    const check = () => {
      const current = performance.now();
      const interrupted = hasReadingInterruption();
      const visible = document.visibilityState === "visible" && !interrupted;
      // No catch-up after a background tab or a suspended computer.
      if (visible) visibleMs += Math.min(current - previous, 1_500);
      previous = current;
      if (finished || !visible) return;
      const now = Date.now();
      const desktop = desktopQuery.matches;
      const selected = selectOverlay(
        creatives,
        snapshot.dismissals,
        desktop ? "desktop" : "mobile",
        now
      );
      if (!selected) return;
      const readingRange =
        document.documentElement.scrollHeight - window.innerHeight;
      const progress = readingRange > 0 ? window.scrollY / readingRange : 0;
      if (
        !canShowOverlay({
          placement: selected.placement,
          visibleMs,
          scrollFraction: progress,
          blocked: interrupted,
          limited: isLimited(dataSaver),
          capUntil: getOverlayCap(now),
          now,
        }) ||
        !claimOverlay(now)
      )
        return;
      finished = true;
      setDisplayed({ ...selected, pathname, desktop });
    };
    const timer = window.setInterval(check, 1_000);
    const onResize = () =>
      setDisplayed((current) =>
        current && current.desktop !== desktopQuery.matches ? null : current
      );
    desktopQuery.addEventListener("change", onResize);
    window.addEventListener("scroll", check, { passive: true });
    document.addEventListener("visibilitychange", check);
    return () => {
      window.clearInterval(timer);
      desktopQuery.removeEventListener("change", onResize);
      window.removeEventListener("scroll", check);
      document.removeEventListener("visibilitychange", check);
    };
  }, [creatives, pathname, dataSaver, snapshot.ready, snapshot.dismissals]);

  const close = useCallback(() => {
    if (!displayed) return;
    const floatingHadFocus =
      displayed.placement === "floating" &&
      document.activeElement instanceof HTMLElement &&
      document.activeElement.closest('[data-ad-overlay="floating"]');
    dismissAdvertisement(displayed.placement, displayed.creative.id);
    setDisplayed(null);
    if (floatingHadFocus) {
      requestAnimationFrame(() =>
        document.getElementById("contenu")?.focus({ preventScroll: true })
      );
    }
  }, [displayed]);

  // A timer also removes a campaign whose closing date passes while it is open.
  useEffect(() => {
    if (!displayed?.creative.endsAt) return;
    const endsAt = displayed.creative.endsAt;
    let timeout: ReturnType<typeof setTimeout>;
    const expire = () => {
      const remaining = endsAt - Date.now();
      if (remaining <= 0) setDisplayed(null);
      else timeout = setTimeout(expire, Math.min(remaining, 2_147_483_647));
    };
    timeout = setTimeout(
      expire,
      Math.max(0, Math.min(endsAt - Date.now(), 2_147_483_647))
    );
    return () => window.clearTimeout(timeout);
  }, [displayed]);

  if (
    !displayed ||
    displayed.pathname !== pathname ||
    dataSaver ||
    !isCreativeActive(displayed.creative, snapshot.navigationAt) ||
    isCampaignDismissed(snapshot.dismissals, displayed.creative.id) ||
    isPlacementDismissed(snapshot.dismissals, displayed.placement)
  )
    return null;

  return displayed.placement === "popup" ? (
    <Popup creative={displayed.creative} close={close} english={english} />
  ) : (
    <FloatingCard
      creative={displayed.creative}
      close={close}
      english={english}
    />
  );
}

function CloseButton({
  close,
  english,
}: {
  close: () => void;
  english: boolean;
}) {
  return (
    <button
      type="button"
      className="lc-ad-control"
      onClick={close}
      aria-label={english ? "Close advertisement" : "Fermer la publicité"}
      title={
        english
          ? "Close advertisements for 24 hours"
          : "Fermer les publicités flottantes pendant 24 heures"
      }
    >
      <AdControlIcon kind="close" />
    </button>
  );
}

function Popup({
  creative,
  close,
  english,
}: {
  creative: AdCreative;
  close: () => void;
  english: boolean;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const element = dialog.current;
    const previous =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    element?.showModal();
    element
      ?.querySelector<HTMLButtonElement>("button")
      ?.focus({ preventScroll: true });
    return () => {
      element?.close();
      document.body.style.overflow = previousOverflow;
      if (previous?.isConnected) previous.focus({ preventScroll: true });
    };
  }, []);
  return (
    <dialog
      ref={dialog}
      className="lc-ad-popup"
      data-ad-overlay="popup"
      aria-label={english ? "Advertisement" : "Publicité"}
      onCancel={(event) => {
        event.preventDefault();
        close();
      }}
    >
      <AdFrame
        creative={creative}
        placement="popup"
        english={english}
        controls={<CloseButton close={close} english={english} />}
      />
      <p className="lc-ad-overlay-note">
        {english
          ? "An occasional message. Close to return to reading."
          : "Une parenthèse publicitaire. Fermez pour poursuivre votre lecture."}
      </p>
    </dialog>
  );
}

function FloatingCard({
  creative,
  close,
  english,
}: {
  creative: AdCreative;
  close: () => void;
  english: boolean;
}) {
  const [interrupted, setInterrupted] = useState(false);
  useEffect(() => {
    const checkInterruption = () => setInterrupted(hasReadingInterruption());
    const observer = new MutationObserver(checkInterruption);
    observer.observe(document.body, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: [
        "open",
        "aria-modal",
        "data-state",
        "hidden",
        "style",
        "class",
      ],
    });
    const onKey = (event: KeyboardEvent) => {
      if (
        event.key === "Escape" &&
        !event.defaultPrevented &&
        !hasReadingInterruption()
      ) {
        event.preventDefault();
        close();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      observer.disconnect();
      document.removeEventListener("keydown", onKey);
    };
  }, [close]);
  return (
    <aside
      className="lc-ad-floating lc-ad-slot"
      hidden={interrupted}
      data-ad-overlay="floating"
      data-ad-placement="floating"
      data-ad-campaign={creative.id}
      aria-label={english ? "Advertisement" : "Publicité"}
    >
      <div className="lc-ad-header">
        <span className="lc-ad-label">
          {english ? "Advertisement" : "Publicité"}
          {creative.demo && (
            <span> · {english ? "Fictional example" : "Exemple fictif"}</span>
          )}
        </span>
        <CloseButton close={close} english={english} />
      </div>
      <a
        href={creative.href}
        className="lc-ad-floating-link"
        rel={creative.kind === "paid" ? "sponsored" : undefined}
        aria-label={`${creative.title} — ${creative.advertiser}`}
      >
        <ResponsiveImage
          media={creative.media}
          mobileMedia={creative.mobileMedia}
          mobileSizes="calc(100vw - 3rem)"
          alt={creative.media.alt || creative.title}
          sizes="(min-width: 1024px) 272px, calc(100vw - 3rem)"
          maxWidth={640}
          wrapperClassName="lc-ad-floating-image"
          className="object-cover"
        />
        <div className="lc-ad-floating-copy">
          <span className="lc-ad-floating-brand">{creative.advertiser}</span>
          <strong>{creative.title}</strong>
          <span className="lc-ad-floating-cta">
            {english ? "Discover" : "Découvrir"}{" "}
            <span aria-hidden="true">→</span>
          </span>
        </div>
      </a>
    </aside>
  );
}
