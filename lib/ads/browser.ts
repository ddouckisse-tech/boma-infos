import {
  activeDismissals,
  dismissAd,
  emptyDismissals,
  mergeDismissals,
  parseDismissals,
  serializeDismissals,
  type AdDismissals,
} from "@/lib/ads/policy";
import {
  AD_PLACEMENTS,
  AD_STORAGE_KEY,
  type AdPlacement,
} from "@/lib/ads/types";

const RULES_ID = "lc-ad-dismissal-rules";
type AdSnapshot = {
  ready: boolean;
  dismissals: AdDismissals;
  navigationAt: number;
};
const SERVER_SNAPSHOT: AdSnapshot = {
  ready: false,
  dismissals: emptyDismissals(),
  navigationAt: 0,
};
let snapshot = SERVER_SNAPSHOT;
let memory = emptyDismissals();
let pageKey: string | undefined;
const listeners = new Set<() => void>();

/**
 * Append to PREFERENCES_SCRIPT in the head. Placement rules live in the slot
 * CSS; campaign rules also hide a dismissed campaign's first SSR rendition
 * in a different placement. CSS.escape and textContent keep storage inert.
 * No expiry timer: a page opened before the deadline stays dismissed.
 */
export const AD_PREFERENCES_SCRIPT = `(function(){try{
var n=Date.now(),v=JSON.parse(localStorage.getItem(${JSON.stringify(AD_STORAGE_KEY)})||"null"),p={},c={},slots=${JSON.stringify(AD_PLACEMENTS)};
if(v&&v.version===1){["placements","campaigns"].forEach(function(k){var o=v[k];if(!o||typeof o!=="object"||Array.isArray(o))return;Object.keys(o).forEach(function(id){var t=o[id];if(id.length>0&&id.length<=200&&typeof t==="number"&&Number.isFinite(t)&&t>n&&(k!=="placements"||slots.indexOf(id)!==-1)){Object.defineProperty(k==="placements"?p:c,id,{value:t,enumerable:true,configurable:true});}});});}
document.documentElement.dataset.adDismissed=Object.keys(p).join(" ");
var s=document.createElement("style");s.id=${JSON.stringify(RULES_ID)};
s.textContent=Object.keys(c).map(function(id){return '.lc-ad-slot[data-ad-campaign="'+CSS.escape(id)+'"]{display:none!important}';}).join("\\n");
document.head.appendChild(s);
window.__lcAdInitial={dismissals:{placements:p,campaigns:c}};
}catch(e){}})();`;

function persisted(): AdDismissals {
  try {
    return parseDismissals(window.localStorage.getItem(AD_STORAGE_KEY));
  } catch {
    // A refused storage write/read still respects the closure for this tab.
    return emptyDismissals();
  }
}

function paintDismissals(value: AdDismissals) {
  document.documentElement.dataset.adDismissed = Object.keys(
    value.placements
  ).join(" ");
  let rules = document.getElementById(RULES_ID);
  if (!rules) {
    rules = document.createElement("style");
    rules.id = RULES_ID;
    document.head.appendChild(rules);
  }
  rules.textContent = Object.keys(value.campaigns)
    .map(
      (id) =>
        `.lc-ad-slot[data-ad-campaign="${CSS.escape(id)}"]{display:none!important}`
    )
    .join("\n");
}

function publish(
  dismissals: AdDismissals,
  navigationAt = snapshot.navigationAt
) {
  snapshot = { ready: true, dismissals, navigationAt };
  paintDismissals(dismissals);
  for (const listener of listeners) listener();
}

export function beginAdNavigation(nextPageKey: string) {
  if (pageKey === nextPageKey) {
    // Catch closures made while this route had no mounted advertising slots.
    // Preserve the page lock: a StrictMode resubscription is not a navigation.
    const incoming = activeDismissals(persisted(), Date.now());
    memory = mergeDismissals(memory, incoming);
    publish(mergeDismissals(snapshot.dismissals, incoming));
    return;
  }
  const initial = (
    window as Window & {
      __lcAdInitial?: { dismissals: AdDismissals };
    }
  ).__lcAdInitial;
  const firstPage = pageKey === undefined;
  pageKey = nextPageKey;
  memory = activeDismissals(mergeDismissals(memory, persisted()), Date.now());
  // The head snapshot must stay locked even when hydration took a long time.
  publish(
    firstPage && initial ? mergeDismissals(memory, initial.dismissals) : memory,
    Date.now()
  );
}

function onStorage(event: StorageEvent) {
  if (event.key !== AD_STORAGE_KEY && event.key !== null) return;
  const incoming = activeDismissals(
    parseDismissals(event.newValue),
    Date.now()
  );
  memory = mergeDismissals(memory, incoming);
  // Clearing storage or an expiry in another tab cannot reopen this page.
  publish(mergeDismissals(snapshot.dismissals, incoming));
}

export const getAdServerSnapshot = (): AdSnapshot => SERVER_SNAPSHOT;
export const getAdSnapshot = (): AdSnapshot => snapshot;

export function subscribeAds(nextPageKey: string, listener: () => void) {
  listeners.add(listener);
  if (listeners.size === 1) window.addEventListener("storage", onStorage);
  beginAdNavigation(nextPageKey);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) window.removeEventListener("storage", onStorage);
  };
}

export function dismissAdvertisement(
  placement: AdPlacement,
  campaignId: string
) {
  memory = dismissAd(
    activeDismissals(mergeDismissals(memory, persisted()), Date.now()),
    placement,
    campaignId,
    Date.now()
  );
  try {
    window.localStorage.setItem(AD_STORAGE_KEY, serializeDismissals(memory));
  } catch {
    // The module memory and DOM snapshot remain the source of truth in this tab.
  }
  publish(mergeDismissals(snapshot.dismissals, memory));
}
