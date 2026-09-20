import assert from "node:assert/strict";
import { test } from "node:test";
import {
  evaluateAdSenseConsent,
  listenToAdSenseConsent,
  type AdSenseConsentState,
  type TcfApi,
  type TcfData,
} from "../lib/ads/adsense-consent";

// A synthetic CMP callback, not a real TC string and never sent to Google.
const granted: TcfData = {
  cmpId: 42,
  cmpStatus: "loaded",
  eventStatus: "useractioncomplete",
  listenerId: 7,
  tcString: "SyntheticTCStringForLocalUnitTestsOnly",
  tcfPolicyVersion: 5,
  gdprApplies: true,
  purpose: {
    consents: { 1: true, 3: true, 4: true },
    legitimateInterests: { 2: true, 7: true, 9: true, 10: true },
  },
  vendor: {
    consents: { 755: true },
    legitimateInterests: { 755: true },
    disclosedVendors: { 755: true },
  },
};

test("waiting, refusal, errors and unknown geography never authorize Google", () => {
  assert.equal(evaluateAdSenseConsent(undefined, true, 42), "waiting");
  assert.equal(
    evaluateAdSenseConsent({ ...granted, cmpStatus: "loading" }, true, 42),
    "waiting"
  );
  assert.equal(
    evaluateAdSenseConsent({ ...granted, eventStatus: "cmpuishown" }, true, 42),
    "waiting"
  );
  for (const patch of [
    { cmpStatus: "error" },
    { cmpId: 1 },
    { gdprApplies: undefined },
    { tcString: "" },
    { tcfPolicyVersion: 4 },
    { purposeOneTreatment: true },
    { vendor: { consents: { 755: false } } },
    { vendor: { ...granted.vendor, disclosedVendors: { 755: false } } },
    {
      purpose: { ...granted.purpose, consents: { 1: false, 3: true, 4: true } },
    },
  ])
    assert.equal(
      evaluateAdSenseConsent({ ...granted, ...patch }, true, 42),
      "denied"
    );
  assert.equal(evaluateAdSenseConsent(granted, false, 42), "denied");
});

test("valid consent is explicit worldwide and respects Google publisher restrictions", () => {
  assert.equal(evaluateAdSenseConsent(granted, true, 42), "granted");
  assert.equal(
    evaluateAdSenseConsent({ ...granted, eventStatus: "tcloaded" }, true, 42),
    "granted"
  );
  assert.equal(
    evaluateAdSenseConsent({ ...granted, gdprApplies: false }, true, 42),
    "granted"
  );
  assert.equal(
    evaluateAdSenseConsent(
      { ...granted, gdprApplies: false, purpose: undefined },
      true,
      42
    ),
    "denied"
  );
  for (const [purpose, restriction] of [
    [1, 0],
    [3, 2],
    [7, 1],
    [10, 0],
  ]) {
    assert.equal(
      evaluateAdSenseConsent(
        {
          ...granted,
          publisher: { restrictions: { [purpose]: { 755: restriction } } },
        },
        true,
        42
      ),
      "denied"
    );
  }
  assert.equal(
    evaluateAdSenseConsent(
      { ...granted, publisher: { restrictions: { 7: { 755: 2 } } } },
      true,
      42
    ),
    "granted"
  );
});

test("TCF events expose grant then revocation and remove the listener on cleanup", () => {
  let callback: ((data: TcfData, success: boolean) => void) | undefined;
  const removed: number[] = [];
  const api = ((
    command: string,
    _version: number,
    handler: (data: TcfData, success: boolean) => void,
    listenerId?: number
  ) => {
    if (command === "addEventListener") callback = handler;
    if (command === "removeEventListener") removed.push(listenerId!);
  }) as TcfApi;
  const states: AdSenseConsentState[] = [];
  const stop = listenToAdSenseConsent(api, 42, (state) => states.push(state));
  callback!({ ...granted, cmpStatus: "loading" }, true);
  callback!(granted, true);
  callback!({ ...granted, purpose: { consents: { 1: false } } }, true);
  assert.deepEqual(states, ["waiting", "granted", "denied"]);
  stop();
  assert.deepEqual(removed, [7]);
  callback!(granted, true);
  assert.deepEqual(states, ["waiting", "granted", "denied"]);
});

test("CMP exceptions are denied rather than implicitly consented", () => {
  const states: AdSenseConsentState[] = [];
  listenToAdSenseConsent(
    (() => {
      throw new Error("CMP unavailable");
    }) as TcfApi,
    42,
    (state) => states.push(state)
  );
  assert.deepEqual(states, ["denied"]);
});
