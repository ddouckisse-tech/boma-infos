import assert from "node:assert/strict";
import { test } from "node:test";
import { ensureAccount, setProvisionalPassword } from "../convex/accounts";
import { createAuth } from "../convex/auth";
import {
  ACCESS_CODE_DIGITS,
  ACCESS_CODE_LENGTH,
  isAcceptablePassword,
  isAccessCode,
  isPinCode,
  PASSWORD_RULE_MESSAGE,
  PIN_LENGTH,
} from "../convex/model/password";
import { handlerOf } from "./support/fake-convex";

test("new access codes have six ASCII digits followed by one ASCII letter", () => {
  assert.equal(ACCESS_CODE_DIGITS, 6);
  assert.equal(ACCESS_CODE_LENGTH, 7);
  for (const code of ["123456A", "123456a", "000001Z", "000000z"]) {
    assert.equal(isAccessCode(code), true, code);
    assert.equal(isAcceptablePassword(code), true, code);
  }
});

test("the letter position, alphabet and exact access-code length are enforced", () => {
  for (const value of [
    "",
    "12345A",
    "123456",
    "1234567",
    "A123456",
    "12345A6",
    "123456AB",
    "123456é",
    "123456-",
    "１２３４５６A",
    "١٢٣٤٥٦A",
    " 123456A",
    "123456A ",
    "123456A\n",
    "123456A\r\n",
  ]) {
    assert.equal(isAccessCode(value), false, JSON.stringify(value));
    assert.equal(isAcceptablePassword(value), false, JSON.stringify(value));
  }
});

test("legacy six-digit codes remain recognizable but cannot be chosen anew", () => {
  assert.equal(PIN_LENGTH, 6);
  assert.equal(isPinCode("123456"), true);
  assert.equal(isPinCode("000001"), true);
  assert.equal(isPinCode("123456A"), false);
  assert.equal(isAcceptablePassword("123456"), false);
  assert.equal(isAcceptablePassword("000001"), false);
});

test("long passwords retain the twelve-character boundary", () => {
  assert.equal(isAcceptablePassword("abcdefghijk"), false);
  for (const password of ["abcdefghijkl", "Phrase longue !", "123456789012"]) {
    assert.equal(isAcceptablePassword(password), true, password);
    assert.equal(isAccessCode(password), false, password);
  }
});

test("auth validates the right body field for sign-up, change and reset", async () => {
  const auth = createAuth({} as Parameters<typeof createAuth>[0]);
  await auth.$context;
  const before = auth.options.hooks?.before;
  assert.ok(before);

  for (const [path, field] of [
    ["/sign-up/email", "password"],
    ["/change-password", "newPassword"],
    ["/reset-password", "newPassword"],
  ] as const) {
    const check = (value: unknown) =>
      before({
        path,
        body:
          field === "password"
            ? { password: value, newPassword: "wrong-field" }
            : { newPassword: value, password: "wrong-field" },
        context: {},
      } as unknown as Parameters<typeof before>[0]);
    for (const password of ["123456A", "123456a", "abcdefghijkl"]) {
      await assert.doesNotReject(check(password));
    }
    for (const password of ["123456", "A123456", "123456AB", null, undefined]) {
      await assert.rejects(check(password), { message: PASSWORD_RULE_MESSAGE });
    }
  }
});

test("sign-in does not filter legacy six-digit passwords", async () => {
  const auth = createAuth({} as Parameters<typeof createAuth>[0]);
  await auth.$context;
  assert.equal(auth.options.emailAndPassword?.minPasswordLength, 6);
  const before = auth.options.hooks?.before;
  assert.ok(before);
  for (const password of ["123456", "123456A", "abcdefghijkl"]) {
    await assert.doesNotReject(
      before({
        path: "/sign-in/email",
        body: { password },
        context: {},
      } as unknown as Parameters<typeof before>[0])
    );
  }
});

for (const [name, action] of [
  ["ensureAccount", ensureAccount],
  ["setProvisionalPassword", setProvisionalPassword],
] as const) {
  test(`${name} rejects obsolete or malformed new passwords before accessing auth`, async () => {
    const handler = handlerOf<
      { email: string; name: string; password: string },
      string
    >(action);
    for (const password of ["123456", "A123456", "123456AB", "abcdefghijk"]) {
      await assert.rejects(
        handler(
          {},
          { email: "example@example.invalid", name: "Prénom NOM", password }
        ),
        { message: PASSWORD_RULE_MESSAGE }
      );
    }
  });
}
