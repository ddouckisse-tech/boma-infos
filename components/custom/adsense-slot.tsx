"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { AdControlIcon } from "./ad-control-icon";
import {
  dismissAdvertisement,
  getAdServerSnapshot,
  getAdSnapshot,
  subscribeAds,
} from "@/lib/ads/browser";
import { isCampaignDismissed, isPlacementDismissed } from "@/lib/ads/policy";
import {
  adSenseSize,
  isAdSenseNonce,
  isValidAdSenseConfig,
  safeAdSenseUrl,
  type AdSenseCmpConfig,
  type AdSenseConfig,
} from "@/lib/ads/adsense-config";
import {
  connectAdSenseCmp,
  getAdSenseConsent,
  getAdSenseConsentRevision,
  getAdSenseServerConsent,
  subscribeAdSenseConsent,
} from "@/lib/ads/adsense-consent";
import type { AdPlacement } from "@/lib/ads/types";
import { usePreferences } from "@/components/providers/preferences-provider";
import "./adsense-slot.css";

/** Critical sizing is inline: Google does not officially support an external sizing sheet. */
const SIZING_CSS = `
.lc-adsense-slot{container:lc_adsense/inline-size;width:100%;max-width:728px;margin-inline:auto}
.lc-adsense-slot[data-ad-placement="article"]{max-width:300px}
.lc_adsense_unit{display:block;width:250px;height:100px;margin-inline:auto}
.lc-adsense-slot[data-ad-placement="article"] .lc_adsense_unit{height:250px}
@container lc_adsense (min-width:300px){.lc-adsense-slot[data-ad-placement="article"] .lc_adsense_unit{width:300px}}
@container lc_adsense (min-width:320px){.lc-adsense-slot:not([data-ad-placement="article"]) .lc_adsense_unit{width:320px}}
@media(min-width:1024px){@container lc_adsense (min-width:728px){.lc-adsense-slot:not([data-ad-placement="article"]) .lc_adsense_unit{width:728px;height:90px}}}
@container lc_adsense (max-width:249px){.lc-adsense-inner{display:none}}
@media(max-width:1023px){.lc-adsense-slot[data-ad-placement="home-secondary"]{display:none}}
`;

/** The selected certified CMP owns its UI; this component is only its script bridge. */
export function AdsConsent({
  config,
  nonce,
}: {
  config: AdSenseCmpConfig;
  nonce: string | undefined;
}) {
  const url = safeAdSenseUrl(config.scriptUrl);
  const valid =
    !!url &&
    config.allowedOrigins.includes(url.origin) &&
    Number.isInteger(config.cmpId) &&
    config.cmpId > 0 &&
    isAdSenseNonce(nonce);
  const scriptSrc = url?.href;
  useEffect(() => {
    if (!valid) return;
    return connectAdSenseCmp(config.cmpId);
  }, [valid, config.cmpId]);
  useEffect(() => {
    if (!valid || !scriptSrc || !nonce) return;
    const existing = document.getElementById("lc-adsense-cmp");
    if (
      existing &&
      (!(existing instanceof HTMLScriptElement) || existing.src !== scriptSrc)
    )
      return;
    const script = existing ?? document.createElement("script");
    const ready = () => {
      window.dispatchEvent(new Event("lc:cmp-ready"));
    };
    script.addEventListener("load", ready, { once: true });
    if (!existing) {
      script.id = "lc-adsense-cmp";
      script.async = true;
      script.nonce = nonce;
      script.src = scriptSrc;
      document.head.appendChild(script);
    }
    // Keep the script in the document: StrictMode/remounts must not download
    // it again. The separate TCF effect reconnects immediately if already ready.
    return () => {
      script.removeEventListener("load", ready);
    };
  }, [valid, scriptSrc, nonce]);
  return null;
}

type AdSenseWindow = Window & {
  adsbygoogle?: { push: (request: Record<string, never>) => unknown };
};
let scriptLoad: Promise<void> | undefined;
let scriptClient: string | undefined;

/** Called only from a consented, measurable slot. One script attempt per document. */
function loadAdSense(config: AdSenseConfig): Promise<void> {
  if (!isValidAdSenseConfig(config) || getAdSenseConsent() !== "granted")
    return Promise.reject(new Error("Consentement absent."));
  if (scriptLoad)
    return scriptClient === config.clientId
      ? scriptLoad
      : Promise.reject(new Error("Compte AdSense incohérent."));
  scriptClient = config.clientId;
  scriptLoad = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.id = "lc-adsense-script";
    script.async = true;
    script.crossOrigin = "anonymous";
    script.nonce = config.nonce!;
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(config.clientId)}`;
    script.addEventListener("load", () => resolve(), { once: true });
    script.addEventListener(
      "error",
      () => reject(new Error("AdSense indisponible.")),
      { once: true }
    );
    document.head.appendChild(script);
  });
  return scriptLoad;
}

// A revoked consent or a remount never requests the same navigation's ad again.
const requests = new Map<string, symbol>();
const pushed = new WeakSet<HTMLElement>();

export function AdSenseSlot({
  config,
  placement,
  pageKey,
  className,
}: {
  config: AdSenseConfig;
  placement: AdPlacement;
  pageKey: string;
  className?: string;
}) {
  const { locale } = usePreferences();
  const english = locale === "en";
  const subscribe = useCallback(
    (listener: () => void) => subscribeAds(pageKey, listener),
    [pageKey]
  );
  const snapshot = useSyncExternalStore(
    subscribe,
    getAdSnapshot,
    getAdServerSnapshot
  );
  const consent = useSyncExternalStore(
    subscribeAdSenseConsent,
    getAdSenseConsent,
    getAdSenseServerConsent
  );
  const campaignId = `adsense:${config.clientId}:${config.slotId}`;
  if (
    !isValidAdSenseConfig(config) ||
    !snapshot.ready ||
    consent !== "granted" ||
    isPlacementDismissed(snapshot.dismissals, placement) ||
    isCampaignDismissed(snapshot.dismissals, campaignId)
  )
    return null;
  const requestKey = `${pageKey}:${snapshot.navigationAt}:${placement}:${campaignId}`;
  return (
    <AuthorizedAdSenseSlot
      key={requestKey}
      config={config}
      placement={placement}
      campaignId={campaignId}
      requestKey={requestKey}
      className={className}
      english={english}
    />
  );
}

function AuthorizedAdSenseSlot({
  config,
  placement,
  campaignId,
  requestKey,
  className,
  english,
}: {
  config: AdSenseConfig;
  placement: AdPlacement;
  campaignId: string;
  requestKey: string;
  className?: string;
  english: boolean;
}) {
  const root = useRef<HTMLElement>(null);
  const unit = useRef<HTMLModElement>(null);
  const [owner] = useState(() => Symbol(requestKey));
  const [fresh] = useState(() => !requests.has(requestKey));
  const [collapsed, setCollapsed] = useState(false);
  const collapseAnchor = useRef<{ element: Element; top: number } | null>(null);

  useLayoutEffect(() => {
    if (!collapsed) return;
    const anchor = collapseAnchor.current;
    if (anchor?.element.isConnected) {
      const shift = anchor.element.getBoundingClientRect().top - anchor.top;
      // Browser scroll anchoring may already have corrected the position.
      if (shift) window.scrollBy({ top: shift, behavior: "instant" });
    }
  }, [collapsed]);

  useEffect(() => {
    const element = root.current;
    const ins = unit.current;
    if (!fresh || collapsed || !element || !ins) return;
    const existing = requests.get(requestKey);
    if (existing && existing !== owner) return;
    let disposed = false;
    let attempted = false;
    let unfilled = false;
    const collapseIfOutside = () => {
      if (!unfilled) return;
      const bounds = element.getBoundingClientRect();
      if (bounds.top < window.innerHeight && bounds.bottom > 0) return;
      if (bounds.bottom <= 0) {
        const anchor = document.elementFromPoint(
          window.innerWidth / 2,
          window.innerHeight / 2
        );
        if (
          anchor &&
          anchor !== document.body &&
          anchor !== document.documentElement
        ) {
          collapseAnchor.current = {
            element: anchor,
            top: anchor.getBoundingClientRect().top,
          };
        }
      }
      setCollapsed(true);
    };
    const status = new MutationObserver(() => {
      if (ins.dataset.adStatus === "unfilled") {
        unfilled = true;
        collapseIfOutside();
      }
    });
    status.observe(ins, {
      attributes: true,
      attributeFilter: ["data-ad-status"],
    });
    const request = () => {
      if (
        attempted ||
        disposed ||
        getAdSenseConsent() !== "granted" ||
        !adSenseSize(
          placement,
          element.clientWidth,
          window.innerWidth >= 1024
        ) ||
        ins.getBoundingClientRect().width < 250 ||
        ins.getBoundingClientRect().height < 50 ||
        !ins.getClientRects().length
      )
        return;
      attempted = true;
      requests.set(requestKey, owner);
      const consentRevision = getAdSenseConsentRevision();
      void loadAdSense(config)
        .then(() => {
          const current = getAdSnapshot();
          if (
            disposed ||
            !ins.isConnected ||
            getAdSenseConsent() !== "granted" ||
            getAdSenseConsentRevision() !== consentRevision ||
            !ins.getClientRects().length ||
            ins.getBoundingClientRect().width < 250 ||
            isPlacementDismissed(current.dismissals, placement) ||
            isCampaignDismissed(current.dismissals, campaignId) ||
            pushed.has(ins)
          )
            return;
          pushed.add(ins);
          const target = window as AdSenseWindow;
          const queue = target.adsbygoogle ?? ([] as Record<string, never>[]);
          target.adsbygoogle = queue;
          queue.push({});
        })
        .catch(() => {
          if (disposed) return;
          unfilled = true;
          collapseIfOutside();
        });
    };
    const resize =
      typeof ResizeObserver === "undefined"
        ? undefined
        : new ResizeObserver(request);
    resize?.observe(ins);
    const initialFrame = requestAnimationFrame(request);
    window.addEventListener("scroll", collapseIfOutside, { passive: true });
    window.addEventListener("resize", collapseIfOutside);
    return () => {
      disposed = true;
      cancelAnimationFrame(initialFrame);
      resize?.disconnect();
      status.disconnect();
      window.removeEventListener("scroll", collapseIfOutside);
      window.removeEventListener("resize", collapseIfOutside);
    };
  }, [fresh, collapsed, config, placement, campaignId, requestKey, owner]);

  if (!fresh || collapsed) return null;
  return (
    <aside
      ref={root}
      className={`lc-ad-slot lc-adsense-slot ${className ?? ""}`}
      data-ad-placement={placement}
      data-ad-campaign={campaignId}
      aria-label={english ? "Advertisement" : "Publicité"}
    >
      <style nonce={config.nonce}>{SIZING_CSS}</style>
      <div className="lc-adsense-inner">
        <div className="lc-adsense-header">
          <span>{english ? "Advertisement" : "Publicité"}</span>
          <button
            type="button"
            className="lc-adsense-close"
            aria-label={english ? "Close advertisement" : "Fermer la publicité"}
            title={
              english
                ? "Close advertisement for 24 hours"
                : "Fermer la publicité pendant 24 heures"
            }
            onClick={() => {
              const element = root.current;
              const next =
                element &&
                Array.from(
                  document.querySelectorAll<HTMLElement>(
                    "a[href], button:not([disabled]), input:not([disabled]), [tabindex='0']"
                  )
                ).find(
                  (candidate) =>
                    !element.contains(candidate) &&
                    !!(
                      element.compareDocumentPosition(candidate) &
                      Node.DOCUMENT_POSITION_FOLLOWING
                    ) &&
                    candidate.getClientRects().length > 0
                );
              next?.focus({ preventScroll: true });
              dismissAdvertisement(placement, campaignId);
            }}
          >
            <AdControlIcon kind="close" />
          </button>
        </div>
        <ins
          ref={unit}
          className="adsbygoogle lc_adsense_unit"
          data-ad-client={config.clientId}
          data-ad-slot={config.slotId}
        />
      </div>
    </aside>
  );
}
