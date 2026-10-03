"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { AdControlIcon } from "./ad-control-icon";
import { ResponsiveImage } from "@/components/custom/responsive-image";
import { usePreferences } from "@/components/providers/preferences-provider";
import {
  dismissAdvertisement,
  getAdServerSnapshot,
  getAdSnapshot,
  subscribeAds,
} from "@/lib/ads/browser";
import {
  advanceRotation,
  candidatesForSlot,
  isCampaignDismissed,
  isCreativeActive,
  isPlacementDismissed,
  type AdDismissals,
} from "@/lib/ads/policy";
import {
  AD_MAX_ROTATIONS,
  AD_ROTATION_MS,
  type AdCreative,
  type AdPlacement,
} from "@/lib/ads/types";
import "./ad-slot.css";

type AdSlotProps = {
  placement: AdPlacement;
  creatives: AdCreative[];
  pageKey: string;
  className?: string;
};

const desktopQuery = "(min-width: 1024px)";
const motionQuery = "(prefers-reduced-motion: reduce)";
const serverFalse = () => false;
const serverTrue = () => true;
const isDesktop = () => window.matchMedia(desktopQuery).matches;
const reducedMotion = () => window.matchMedia(motionQuery).matches;
const isDocumentVisible = () => document.visibilityState === "visible";

function subscribeMedia(query: string, listener: () => void) {
  const media = window.matchMedia(query);
  media.addEventListener("change", listener);
  return () => media.removeEventListener("change", listener);
}

const subscribeDesktop = (listener: () => void) =>
  subscribeMedia(desktopQuery, listener);
const subscribeMotion = (listener: () => void) =>
  subscribeMedia(motionQuery, listener);
const subscribeVisibility = (listener: () => void) => {
  document.addEventListener("visibilitychange", listener);
  return () => document.removeEventListener("visibilitychange", listener);
};

type DataConnection = EventTarget & { saveData?: boolean };
const connection = () =>
  (navigator as Navigator & { connection?: DataConnection }).connection;
const savesConnectionData = () => connection()?.saveData === true;
const subscribeConnection = (listener: () => void) => {
  const network = connection();
  network?.addEventListener("change", listener);
  return () => network?.removeEventListener("change", listener);
};

type AdFrameProps = {
  creative: AdCreative;
  placement: AdPlacement;
  className?: string;
  loadCreative?: boolean;
  controls?: React.ReactNode;
  expired?: boolean;
  english?: boolean;
};

function AdArtwork({
  creative,
  english,
}: {
  creative: AdCreative;
  english: boolean;
}) {
  const isHouse = creative.kind === "house";
  const isEditorial = isHouse && creative.presentation === "editorial";
  return (
    <a
      className={`lc-ad-artwork${isEditorial ? "lc-ad-house" : ""}`}
      href={creative.href}
      rel={isHouse ? undefined : "sponsored"}
      aria-label={`${creative.title} — ${creative.advertiser}`}
    >
      {isEditorial ? (
        <>
          <span className="lc-ad-house-brand">BOMA Infos</span>
          <span className="lc-ad-house-title">{creative.title}</span>
          <span className="lc-ad-house-cta">
            {english ? "Discover" : "Découvrir"}{" "}
            <span aria-hidden="true">→</span>
          </span>
        </>
      ) : (
        <ResponsiveImage
          media={creative.media}
          alt={creative.media.alt || creative.title}
          sizes={
            creative.format === "square"
              ? "320px"
              : "(min-width: 704px) 640px, 92vw"
          }
          maxWidth={creative.format === "square" ? 320 : 640}
          wrapperClassName="lc-ad-image"
          className="object-contain"
        />
      )}
    </a>
  );
}

function AdFrame({
  creative,
  placement,
  className,
  loadCreative = true,
  controls,
  expired = false,
  english = false,
}: AdFrameProps) {
  return (
    <aside
      className={`lc-ad-slot ${className ?? ""}`}
      data-ad-placement={placement}
      data-ad-campaign={creative.id}
      data-ad-format={creative.format}
      aria-label={
        creative.kind === "house"
          ? english
            ? "Advertisement — BOMA Infos promotion"
            : "Publicité — autopromotion BOMA Infos"
          : english
            ? "Advertisement"
            : "Publicité"
      }
    >
      <div className="lc-ad-header">
        <span className="lc-ad-label">
          {english ? "Advertisement" : "Publicité"}
          {creative.kind === "house" && (
            <span> · {english ? "Promotion" : "Autopromotion"}</span>
          )}
        </span>
        <div className="lc-ad-controls">{controls}</div>
      </div>
      {expired ? (
        <div className="lc-ad-artwork lc-ad-expired">
          {english
            ? "This advertisement has ended."
            : "Cette publicité est terminée."}
        </div>
      ) : loadCreative ? (
        <AdArtwork creative={creative} english={english} />
      ) : (
        <div className="lc-ad-artwork" />
      )}
      <p
        className="lc-ad-caption"
        aria-hidden={expired || creative.kind === "house" || undefined}
      >
        {!expired && creative.kind === "paid" ? creative.advertiser : "\u00a0"}
      </p>
    </aside>
  );
}

/** Serializable campaign data comes from the server; no registry enters this bundle. */
export function AdSlot({
  placement,
  creatives,
  pageKey,
  className,
}: AdSlotProps) {
  const subscribe = useCallback(
    (listener: () => void) => subscribeAds(pageKey, listener),
    [pageKey]
  );
  const snapshot = useSyncExternalStore(
    subscribe,
    getAdSnapshot,
    getAdServerSnapshot
  );
  const desktop = useSyncExternalStore(
    subscribeDesktop,
    isDesktop,
    serverFalse
  );
  const candidates = useMemo(
    () =>
      candidatesForSlot(
        creatives,
        placement,
        snapshot.ready ? snapshot.navigationAt : undefined
      ),
    [creatives, placement, snapshot.ready, snapshot.navigationAt]
  );
  if (
    candidates.length === 0 ||
    isPlacementDismissed(snapshot.dismissals, placement)
  )
    return null;

  const available = candidates.filter(
    (creative) => !isCampaignDismissed(snapshot.dismissals, creative.id)
  );
  if (available.length === 0) return null;

  // A hidden lazy <img> can still download in Chrome. The desktop-only slot
  // emits no image until its media query matches; CSS reserves its desktop box.
  if (!snapshot.ready) {
    return (
      <AdFrame
        creative={available[0]}
        placement={placement}
        className={className}
        loadCreative={placement !== "home-secondary"}
      />
    );
  }

  return (
    <ActiveAdSlot
      key={`${pageKey}:${placement}`}
      placement={placement}
      creatives={available}
      dismissals={snapshot.dismissals}
      className={className}
      viewportEnabled={placement !== "home-secondary" || desktop}
    />
  );
}

function ActiveAdSlot({
  placement,
  creatives,
  dismissals,
  className,
  viewportEnabled,
}: {
  placement: AdPlacement;
  creatives: AdCreative[];
  dismissals: AdDismissals;
  className?: string;
  viewportEnabled: boolean;
}) {
  // Freeze the page's queue. A closure from another tab hides the current
  // campaign instead of replacing it immediately with an unrelated advert.
  const [queue] = useState(creatives);
  const [rotation, setRotation] = useState({
    id: creatives[0].id,
    rotations: 0,
  });
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [inView, setInView] = useState(false);
  const [intersecting, setIntersecting] = useState(false);
  const [expired, setExpired] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const elapsed = useRef(0);
  const { dataSaver, locale } = usePreferences();
  const english = locale === "en";
  const prefersReducedMotion = useSyncExternalStore(
    subscribeMotion,
    reducedMotion,
    serverTrue
  );
  const connectionSaver = useSyncExternalStore(
    subscribeConnection,
    savesConnectionData,
    serverTrue
  );
  const documentVisible = useSyncExternalStore(
    subscribeVisibility,
    isDocumentVisible,
    serverFalse
  );
  const creative = queue.find((item) => item.id === rotation.id)!;
  const closed =
    isPlacementDismissed(dismissals, placement) ||
    isCampaignDismissed(dismissals, creative.id);
  const liveQueue = useMemo(
    () => queue.filter((item) => !isCampaignDismissed(dismissals, item.id)),
    [queue, dismissals]
  );
  const limited = prefersReducedMotion || dataSaver || connectionSaver;
  const exhausted = rotation.rotations >= AD_MAX_ROTATIONS;
  const running =
    viewportEnabled &&
    !expired &&
    !closed &&
    !limited &&
    !exhausted &&
    !paused &&
    !hovered &&
    !focused &&
    inView &&
    documentVisible &&
    liveQueue.length > 1;

  useEffect(() => {
    const element = root.current;
    if (!element || closed || typeof IntersectionObserver === "undefined")
      return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting && entry.intersectionRatio >= 0.5);
        setIntersecting(entry.isIntersecting);
      },
      { threshold: [0, 0.5] }
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [closed]);

  useEffect(() => {
    if (creative.endsAt === undefined) return;
    const endsAt = creative.endsAt;
    let timeout: ReturnType<typeof setTimeout>;
    const checkExpiry = () => {
      const remaining = endsAt - Date.now();
      if (remaining <= 0) setExpired(true);
      else
        timeout = setTimeout(checkExpiry, Math.min(remaining, 2_147_483_647));
    };
    timeout = setTimeout(
      checkExpiry,
      Math.max(0, Math.min(endsAt - Date.now(), 2_147_483_647))
    );
    return () => clearTimeout(timeout);
  }, [creative.endsAt]);

  useEffect(() => {
    if (!running) return;
    const started = performance.now();
    const remaining = Math.max(0, AD_ROTATION_MS - elapsed.current);
    let fired = false;
    const timeout = window.setTimeout(() => {
      fired = true;
      const now = Date.now();
      if (!isCreativeActive(creative, now)) {
        setExpired(true);
        return;
      }
      const eligibleNow = liveQueue.filter((item) =>
        isCreativeActive(item, now)
      );
      if (eligibleNow.length < 2) {
        setRotation((previous) => ({
          ...previous,
          rotations: AD_MAX_ROTATIONS,
        }));
        return;
      }
      const next = advanceRotation(
        {
          index: eligibleNow.findIndex((item) => item.id === rotation.id),
          rotations: rotation.rotations,
          elapsedMs: elapsed.current,
        },
        remaining,
        eligibleNow.length
      );
      elapsed.current = next.elapsedMs;
      setRotation({
        id: eligibleNow[next.index].id,
        rotations: next.rotations,
      });
    }, remaining);
    return () => {
      window.clearTimeout(timeout);
      if (!fired)
        elapsed.current = Math.min(
          AD_ROTATION_MS,
          elapsed.current + performance.now() - started
        );
    };
  }, [running, liveQueue, rotation, creative]);

  if (closed || (expired && !intersecting)) return null;
  const close = () => {
    const element = root.current;
    const focusable = Array.from(
      document.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex="0"]'
      )
    ).filter(
      (item) =>
        !element?.contains(item) &&
        item.tabIndex >= 0 &&
        item.getClientRects().length > 0 &&
        !item.closest("[inert], [hidden]") &&
        getComputedStyle(item).visibility !== "hidden"
    );
    const next = focusable.find(
      (item) =>
        element &&
        element.compareDocumentPosition(item) & Node.DOCUMENT_POSITION_FOLLOWING
    );
    const previous = focusable.findLast(
      (item) =>
        element &&
        element.compareDocumentPosition(item) & Node.DOCUMENT_POSITION_PRECEDING
    );
    dismissAdvertisement(placement, creative.id);
    (next ?? previous)?.focus({ preventScroll: true });
  };
  const pauseLabel = limited
    ? english
      ? "Rotation paused according to your preferences"
      : "Rotation suspendue selon vos préférences"
    : exhausted
      ? english
        ? "Rotation finished for this page"
        : "Rotation terminée pour cette page"
      : paused
        ? english
          ? "Resume advertisement rotation"
          : "Reprendre la rotation des publicités"
        : english
          ? "Pause advertisement rotation"
          : "Mettre la rotation des publicités en pause";

  return (
    <div
      ref={root}
      className="lc-ad-observer"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={(event) =>
        setFocused(event.currentTarget.contains(event.relatedTarget))
      }
    >
      <AdFrame
        creative={creative}
        placement={placement}
        className={className}
        loadCreative={viewportEnabled}
        expired={expired}
        english={english}
        controls={
          <>
            {queue.length > 1 && !expired && (
              <button
                type="button"
                className="lc-ad-control"
                aria-label={pauseLabel}
                title={pauseLabel}
                aria-pressed={paused}
                disabled={limited || exhausted}
                onClick={() => setPaused((value) => !value)}
              >
                {paused ? (
                  <AdControlIcon kind="play" />
                ) : (
                  <AdControlIcon kind="pause" />
                )}
              </button>
            )}
            <button
              type="button"
              className="lc-ad-control"
              aria-label={
                english ? "Close advertisement" : "Fermer la publicité"
              }
              title={
                english
                  ? "Close advertisement for 24 hours"
                  : "Fermer la publicité pendant 24 heures"
              }
              onClick={close}
            >
              <AdControlIcon kind="close" />
            </button>
          </>
        }
      />
    </div>
  );
}
