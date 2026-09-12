export const GOOGLE_ADVERTISING_VENDOR_ID = 755;
export type AdSenseConsentState = "waiting" | "denied" | "granted";

type ConsentFlags = Record<string, boolean | undefined>;
export type TcfData = {
  cmpId?: number;
  cmpStatus?: string;
  eventStatus?: string;
  listenerId?: number;
  tcString?: string;
  tcfPolicyVersion?: number;
  isServiceSpecific?: boolean;
  gdprApplies?: boolean;
  purposeOneTreatment?: boolean;
  purpose?: { consents?: ConsentFlags; legitimateInterests?: ConsentFlags };
  vendor?: {
    consents?: ConsentFlags;
    legitimateInterests?: ConsentFlags;
    disclosedVendors?: ConsentFlags;
  };
  publisher?: {
    restrictions?: Record<
      string,
      Record<string, number | undefined> | undefined
    >;
  };
};

/**
 * Conservative global gate: even gdprApplies=false is not permission.
 * Require TCF 2.3 disclosure, Google consent for purposes 1/3/4 and valid
 * legal bases for 2/7/9/10, including publisher restrictions. Google still
 * consumes and validates the full CMP string when its tag is finally loaded.
 */
export function evaluateAdSenseConsent(
  data: TcfData | undefined,
  success: boolean,
  expectedCmpId: number
): AdSenseConsentState {
  if (!success || data?.cmpStatus === "error") return "denied";
  if (
    !data ||
    data.cmpStatus !== "loaded" ||
    !["tcloaded", "useractioncomplete"].includes(data.eventStatus ?? "")
  )
    return "waiting";
  const vendor = String(GOOGLE_ADVERTISING_VENDOR_ID);
  if (
    data.cmpId !== expectedCmpId ||
    typeof data.gdprApplies !== "boolean" ||
    (data.tcfPolicyVersion ?? 0) < 5 ||
    data.purposeOneTreatment === true ||
    !/^[A-Za-z0-9_-]{20,}(\.[A-Za-z0-9_-]+)*$/.test(data.tcString ?? "") ||
    data.vendor?.disclosedVendors?.[vendor] !== true ||
    data.vendor?.consents?.[vendor] !== true
  )
    return "denied";
  for (const purpose of [1, 3, 4]) {
    const restriction = data.publisher?.restrictions?.[purpose]?.[vendor];
    if (
      data.purpose?.consents?.[purpose] !== true ||
      restriction === 0 ||
      restriction === 2
    )
      return "denied";
  }
  for (const purpose of [2, 7, 9, 10]) {
    const restriction = data.publisher?.restrictions?.[purpose]?.[vendor];
    const consent =
      data.purpose?.consents?.[purpose] === true &&
      data.vendor?.consents?.[vendor] === true;
    const legitimate =
      data.purpose?.legitimateInterests?.[purpose] === true &&
      data.vendor?.legitimateInterests?.[vendor] === true;
    if (
      restriction === 0 ||
      (restriction === 1
        ? !consent
        : restriction === 2
          ? !legitimate
          : !consent && !legitimate)
    )
      return "denied";
  }
  return "granted";
}

export type TcfApi = {
  (
    command: "addEventListener",
    version: 2,
    callback: (data: TcfData, success: boolean) => void
  ): void;
  (
    command: "removeEventListener",
    version: 2,
    callback: (success: boolean) => void,
    listenerId: number
  ): void;
};

/** Testable event lifecycle; pending/denied/error never means consent. */
export function listenToAdSenseConsent(
  api: TcfApi,
  cmpId: number,
  update: (state: AdSenseConsentState) => void
) {
  let active = true;
  let listenerId: number | undefined;
  const remove = () => {
    if (listenerId === undefined) return;
    try {
      api("removeEventListener", 2, () => undefined, listenerId);
    } catch {
      /* Already removed or unavailable. */
    }
  };
  try {
    api("addEventListener", 2, (data, success) => {
      if (Number.isSafeInteger(data?.listenerId)) listenerId = data.listenerId;
      if (!active) {
        remove();
        return;
      }
      update(evaluateAdSenseConsent(data, success, cmpId));
    });
  } catch {
    update("denied");
  }
  return () => {
    active = false;
    remove();
  };
}

let consent: AdSenseConsentState = "waiting";
let revision = 0;
const listeners = new Set<() => void>();
const publish = (next: AdSenseConsentState) => {
  if (consent === next) return;
  consent = next;
  revision += 1;
  for (const listener of listeners) listener();
};

export const getAdSenseConsent = () => consent;
export const getAdSenseConsentRevision = () => revision;
export const getAdSenseServerConsent = (): AdSenseConsentState => "waiting";
export function subscribeAdSenseConsent(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** No polling. CMP stubs queue addEventListener; late CMPs can emit lc:cmp-ready. */
export function connectAdSenseCmp(cmpId: number) {
  let disconnect: (() => void) | undefined;
  const attach = () => {
    const api = (window as Window & { __tcfapi?: TcfApi }).__tcfapi;
    if (disconnect || typeof api !== "function") return;
    disconnect = listenToAdSenseConsent(api, cmpId, publish);
  };
  publish("waiting");
  attach();
  document.addEventListener("load", attach, true);
  window.addEventListener("lc:cmp-ready", attach);
  return () => {
    document.removeEventListener("load", attach, true);
    window.removeEventListener("lc:cmp-ready", attach);
    disconnect?.();
    publish("waiting");
  };
}
